# Migración: `pg` + Prisma + Pooler → `@supabase/supabase-js`

## Diagnóstico

### Stack actual

```
Prisma schema     → 100% decorativo (nadie lo importa en runtime)
pg Pool           → wrapper en src/lib/db.ts
db.query()        → 27 llamadas en 12 rutas API + auth.ts + seed.ts
Session Pooler    → necesario por IPv6, causa problemas de visibilidad de catálogo
DATABASE_URL      → variable de entorno con credenciales del pooler
```

### Problemas identificados

| Problema | Impacto |
|---|---|
| Prisma no se usa en runtime | Falsa sensación de type-safety, build step innecesario |
| `pg` directo requiere TCP al Postgres | IPv6 obligatorio → Vercel Lambda no lo soporta |
| Session Pooler (Supavisor) | `postgres` no es superusuario → catálogo invisible para tablas existentes |
| SQL crudo con `$1`, `$2` | Errores en runtime, `row_to_json()` manual para joins |
| DATABASE_URL expuesta | Credenciales en texto plano en Vercel |

### Stack target

```
Request → API Route → supabase.from('Court').select('*') → PostgREST (HTTPS IPv4) → Supabase DB
```

## Arquitectura

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  Next.js App  │     │  API Routes       │     │  Supabase JS Client  │
│  Router       │────▶│  (server-side)    │────▶│  (service_role key)  │
│  (Vercel)     │     │                   │     │                      │
└──────────────┘     └──────────────────┘     └──────────┬──────────┘
                                                         │ HTTPS (IPv4)
                                                         ▼
                                                  ┌──────────────────┐
                                                  │  PostgREST        │
                                                  │  + Supabase Auth  │
                                                  └──────────────────┘
                                                         │
                                                         ▼
                                                  ┌──────────────────┐
                                                  │  PostgreSQL       │
                                                  │  + RLS policies   │
                                                  └──────────────────┘
```

### Decisiones arquitectónicas

| Decisión | Opción elegida | Alternativa descartada |
|---|---|---|
| Auth | Mantener NextAuth, cambiar queries | Migrar a Supabase Auth (más trabajo, menos control sobre password) |
| Cliente Supabase | `supabaseAdmin` con `service_role key` en server | Anon key en server (requiere RLS, no necesario para server-to-server) |
| Lógica compleja (reservas) | RPC `reservar_cancha` con transacción atómica | Lógica en JS con race condition potencial |
| Seed | `createClient` con service_role | `pg.Pool` (eliminado) |

## Plan de implementación

### Fase 0: Setup ✅ (completada)
- [x] Instalar `@supabase/supabase-js`
- [x] Crear `src/lib/supabase.ts` con `supabaseAdmin` + `supabaseClient`
- [x] Agregar variables de entorno (`.env`)
- [ ] Agregar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` a Vercel
- [ ] Crear spec document (este archivo)

### Fase 1: RLS Policies
- [ ] `court_rls_policies` — SELECT para todos, INSERT/UPDATE/DELETE solo admin
- [ ] `user_rls_policies` — SELECT/UPDATE propio registro, admin todo
- [ ] `reservation_rls_policies` — SELECT/INSERT propio usuario, UPDATE propio + admin, DELETE solo admin
- [ ] `payment_rls_policies` — SELECT propio, INSERT/UPDATE server-side (service_role)

### Fase 2: RPC `reservar_cancha`
- [ ] Función SQL atómica que verifica disponibilidad + crea reserva en transacción
- [ ] Registro via migration Supabase

### Fase 3: Migrar auth
- [ ] `src/lib/auth.ts` — reemplazar `db.query()` → `supabaseAdmin.from()`
- [ ] `src/app/api/register/route.ts` — reemplazar queries

### Fase 4: Rutas de lectura
- [ ] `src/app/api/courts/route.ts`
- [ ] `src/app/api/courts/available/route.ts`
- [ ] `src/app/api/courts/[id]/route.ts` (si existe)

### Fase 5: Rutas de escritura
- [ ] `src/app/api/reservations/route.ts` (GET + POST)
- [ ] `src/app/api/reservations/[id]/route.ts` (PATCH)
- [ ] `src/app/api/payments/create/route.ts`
- [ ] `src/app/api/payments/webhook/route.ts`

### Fase 6: Rutas admin
- [ ] `src/app/api/admin/stats/route.ts`
- [ ] `src/app/api/admin/users/route.ts`
- [ ] `src/app/api/admin/reservations/route.ts`
- [ ] `src/app/api/admin/courts/route.ts`
- [ ] `src/app/api/admin/courts/[id]/route.ts`

### Fase 7: Limpieza
- [ ] Migrar `prisma/seed.ts` a usar `supabaseAdmin`
- [ ] Eliminar `pg`, `@types/pg` de `package.json`
- [ ] Eliminar `DATABASE_URL` de Vercel
- [ ] Build y deploy

## Mapping de queries

### SELECT simple
```ts
// ANTES
db.query('SELECT * FROM "Court" WHERE "isActive" = $1 ORDER BY "name" ASC', [true])

// DESPUÉS
await supabaseAdmin
  .from('Court')
  .select('*')
  .eq('isActive', true)
  .order('name', { ascending: true })
```

### SELECT con joins (row_to_json)
```ts
// ANTES
db.query(
  `SELECT r.*, row_to_json(c.*) as court, row_to_json(p.*) as payment
   FROM "Reservation" r
   LEFT JOIN "Court" c ON c.id = r."courtId"
   LEFT JOIN "Payment" p ON p."reservationId" = r.id
   WHERE r."userId" = $1
   ORDER BY r."startTime" DESC`,
  [session.user.id]
)

// DESPUÉS
await supabaseAdmin
  .from('Reservation')
  .select('*, court:courtId(*), payment:reservationId(*)')
  .eq('userId', session.user.id)
  .order('startTime', { ascending: false })
```

### INSERT with RETURNING
```ts
// ANTES
db.query(
  `INSERT INTO "Reservation" (...) VALUES ($1, $2, ...) RETURNING *`,
  [values...]
)

// DESPUÉS
await supabaseAdmin
  .from('Reservation')
  .insert({ ... })
  .select()
  .single()
```

### UPDATE with RETURNING
```ts
// ANTES
db.query(
  `UPDATE "Reservation" SET "status" = $1, "updatedAt" = NOW() WHERE "id" = $2 RETURNING *`,
  [status, id]
)

// DESPUÉS
await supabaseAdmin
  .from('Reservation')
  .update({ status })
  .eq('id', id)
  .select()
  .single()
```

### SELECT single row or null
```ts
// ANTES
db.queryOne('SELECT id FROM "User" WHERE email = $1', [email])

// DESPUÉS
await supabaseAdmin
  .from('User')
  .select('id')
  .eq('email', email)
  .maybeSingle()
```

### Filtros dinámicos
```ts
// ANTES
const conditions: string[] = [];
if (status) conditions.push(`r."status" = $${paramIndex++}`);
const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

// DESPUÉS
let query = supabaseAdmin.from('Reservation').select('*, user:userId(*), court:courtId(*), payment:reservationId(*)')
if (status) query = query.eq('status', status)
if (date) query = query.gte('startTime', date).lt('endTime', nextDay)
```

### Subqueries múltiples (stats)
```ts
// DESPUÉS
const [userCount, courtCount, ...] = await Promise.all([
  supabaseAdmin.from('User').select('*', { count: 'exact', head: true }),
  supabaseAdmin.from('Court').select('*', { count: 'exact', head: true }).eq('isActive', true),
  ...
])
const revenue = payments.data?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0
```

## Variables de entorno

| Variable | Valor | Dónde |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ysrzehkopktmdpmtrbfh.supabase.co` | `.env` + Vercel |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJh...` (anon key) | `.env` + Vercel |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJh...` (service_role) | `.env` + Vercel (solo server) |
| ~~`DATABASE_URL`~~ | Eliminar | Vercel |

## Fechas
- Creado: 2026-07-12
- Estado: En ejecución
