import { Pool } from "pg";

// Conexión via Session Pooler de Supabase (IPv4 proxied gratis).
// El host aws-1-sa-east-1.pooler.supabase.com resuelve por IPv4,
// así que Vercel Lambda puede conectar sin problemas.
//
// DATABASE_URL debe apuntar al session pooler:
//   postgresql://postgres.ysrzehkopktmdpmtrbfh:PASS@aws-1-sa-east-1.pooler.supabase.com:5432/postgres

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});

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
