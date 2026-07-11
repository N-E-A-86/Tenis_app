import { Pool } from "pg";
import dns from "dns";

// Force IPv6-first DNS resolution so Vercel Lambda can resolve Supabase's
// IPv6-only database hostname (db.*.supabase.co has only AAAA records).
dns.setDefaultResultOrder("verbatim");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: {
    rejectUnauthorized: false,
  },
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
