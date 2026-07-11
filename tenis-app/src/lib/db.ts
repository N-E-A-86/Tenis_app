import { Pool } from "pg";

// PostgREST schema cache está roto en este proyecto de Supabase.
// El hostname db.*.supabase.co solo tiene registros AAAA (IPv6).
// Vercel Lambda no resuelve AAAA via DNS, así que usamos la IP
// fija directamente para bypassiar DNS por completo.
//
// NOTA: pg no maneja bien los brackets IPv6 en connectionString
// (pasa "[::1]" literal a getaddrinfo). Por eso usamos host + port
// individuales en vez de connectionString.

const DB_IPV6 = "2600:1f1e:dbb:f600:641f:d14d:b05c:ea25";

const pool = new Pool({
  host: DB_IPV6,
  port: 5432,
  database: "postgres",
  user: "postgres.ysrzehkopktmdpmtrbfh",
  password: extractPassword(),
  ssl: { rejectUnauthorized: false },
});

/** Extraer password de DATABASE_URL */
function extractPassword(): string {
  const url = new URL(process.env.DATABASE_URL!);
  return decodeURIComponent(url.password);
}

export const db = {
  async query(text: string, params?: any[]): Promise<any[]> {
    const result = await pool.query(text, params);
    return result.rows;
  },

  async queryOne(text: string, params?: any[]): Promise<any | null> {
    const result = await pool.query(text, params);
    return result.rows[0] ?? null;
  },

  async queryWithCount(
    text: string,
    params?: any[]
  ): Promise<{ rows: any[]; count: number }> {
    const result = await pool.query(text, params);
    return { rows: result.rows, count: result.rowCount ?? 0 };
  },
};
