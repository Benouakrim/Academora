import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('First 50 chars:', process.env.DATABASE_URL?.substring(0, 50));

if (process.env.DATABASE_URL) {
  const { Pool } = pg;
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const result = await pool.query('SELECT NOW() as now, version() as version');
    console.log('\n✅ DATABASE CONNECTION SUCCESSFUL!');
    console.log('Current time:', result.rows[0].now);
    console.log('PostgreSQL version:', result.rows[0].version.substring(0, 50) + '...');
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ DATABASE CONNECTION FAILED!');
    console.error('Error:', err.message);
    process.exit(1);
  }
} else {
  console.error('\n❌ No DATABASE_URL found in environment');
  process.exit(1);
}
