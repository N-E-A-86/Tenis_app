import pkg from 'pg';
const { Pool } = pkg;

const directConfig = {
  host: 'db.ysrzehkopktmdpmtrbfh.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '5YSqFYDBnGrUBd5L',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
};

const pool = new Pool(directConfig);

async function test() {
  try {
    const res = await pool.query('SELECT current_user, version()');
    console.log('DIRECTO (IPv6) CONECTADO ✅');
    console.log('User:', res.rows[0].current_user);
    console.log('Version:', res.rows[0].version);

    const res2 = await pool.query(
      `SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename IN ('Court','User','Account','Session','VerificationToken','Reservation','Payment') ORDER BY tablename`
    );
    console.log('Tablas encontradas:', res2.rows.map(r => r.tablename).join(', '));

    const res3 = await pool.query('SELECT count(*) FROM "Court"');
    console.log('Registros en Court:', res3.rows[0].count);

    await pool.end();
  } catch (err) {
    console.log('DIRECTO FALLÓ ❌');
    console.log('Error:', err.message);
    console.log('Código:', err.code);
    await pool.end();
  }
}

test();
