# Precios por Horario — Especificación Técnica

## Objetivo

Permitir que el dueño del club defina **precios distintos según el horario del día** para cada cancha. Ej: Cancha Central $30/h de 18:00 a 23:00 (horario pico), $20/h de 08:00 a 17:59 (horario normal).

## Modelo de Datos

### Opción A — Tabla `PriceRule` (recomendada)

```sql
CREATE TABLE "PriceRule" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "courtId" UUID NOT NULL REFERENCES "Court"(id) ON DELETE CASCADE,
  "dayOfWeek" INTEGER NOT NULL CHECK ("dayOfWeek" BETWEEN 0 AND 6),  -- 0=domingo
  "startHour" INTEGER NOT NULL CHECK ("startHour" BETWEEN 0 AND 23),
  "endHour" INTEGER NOT NULL CHECK ("endHour" BETWEEN 0 AND 23),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_price_rule_court_day ON "PriceRule"("courtId", "dayOfWeek");
```

- Una regla por cancha + día de semana + rango horario.
- Si no hay regla para un horario, se usa `pricePerHour` de la Court como fallback.
- `dayOfWeek` permite precios de fin de semana / entre semana.
- Los rangos no deben solaparse (validación backend + frontend).

### Opción B — Columna JSON en Court (alternativa simple)

```sql
ALTER TABLE "Court" ADD COLUMN "priceRules" JSONB DEFAULT '[]';
```

Formato:
```json
[
  { "dayOfWeek": 0, "startHour": 8, "endHour": 23, "price": 30 },
  { "dayOfWeek": 1, "startHour": 18, "endHour": 23, "price": 28 },
  { "dayOfWeek": 6, "startHour": 8, "endHour": 23, "price": 30 }
]
```

Ventaja: no requiere tabla nueva. Desventaja: más difícil de consultar/indexar y validar solapamientos.

## Cálculo del Precio

```typescript
function calcularPrecio(
  court: { id: string; pricePerHour: number },
  startTime: Date,
  endTime: Date,
  rules: PriceRule[]
): number {
  const dayOfWeek = startTime.getDay();
  const hour = startTime.getHours();

  // Buscar regla aplicable
  const rule = rules.find(
    r => r.courtId === court.id
      && r.dayOfWeek === dayOfWeek
      && hour >= r.startHour
      && hour < r.endHour
  );

  // Usar regla o fallback al pricePerHour base
  return rule?.price ?? court.pricePerHour;
}
```

## API

### `GET /api/admin/price-rules?courtId=xxx`
Lista reglas de precio para una cancha.

### `POST /api/admin/price-rules`
Crea/actualiza regla.
```json
{ "courtId": "...", "dayOfWeek": 1, "startHour": 18, "endHour": 23, "price": 30 }
```

### `DELETE /api/admin/price-rules/[id]`
Elimina una regla.

### Impacto en APIs existentes
- `GET /api/courts/available` — devolver el precio calculado por slot en vez del `pricePerHour` fijo:
  ```json
  { "hour": 18, "time": "18:00", "available": true, "price": 30 }
  ```
- `POST /api/reservations` — calcular `totalAmount` aplicando reglas de precio por hora.
- `GET /api/courts` — opcional: incluir `priceRules`.

## UI / Admin

### Página `/admin/precios` (nueva)

Por cada cancha:
- Tabla de reglas existentes (día, rango, precio, eliminar).
- Agregar regla: día (lun-dom), desde/hasta (select de horas), precio (input).
- Validar solapamientos antes de guardar.

### Impacto en Booking
Al seleccionar una cancha y fecha en la web pública:
- Cada slot horario muestra `$XX` calculado según la regla aplicable.
- El total del carrito suma los precios de cada hora reservada.

## Próximos Pasos (cuando se implemente)

1. Elegir Opción A o B (recomiendo A).
2. Crear migración y seed de reglas de ejemplo.
3. Implementar API CRUD `/api/admin/price-rules`.
4. Modificar `/api/courts/available` para devolver precio por slot.
5. Crear página `/admin/precios`.
6. Modificar cálculo de `totalAmount` en creación de reserva.
7. Agregar reglas al sidebar.
8. Build + deploy.
