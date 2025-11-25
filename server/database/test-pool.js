import pool from './pool.js';

async function testConnection() {
  try {
    console.log('🔄 Testing PostgreSQL pool connection...\n');
    
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    
    console.log('✅ Connection successful!');
    console.log('📅 Server time:', result.rows[0].current_time);
    console.log('🗄️  PostgreSQL version:', result.rows[0].pg_version.split('\n')[0]);
    
    // Test articles table
    const articlesTest = await pool.query('SELECT COUNT(*) as count FROM articles');
    console.log(`📝 Articles in database: ${articlesTest.rows[0].count}`);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Get your database password from Supabase dashboard');
    console.error('   2. Go to: https://supabase.com/dashboard -> Your Project -> Settings -> Database');
    console.error('   3. Add to .env file:');
    console.error('      DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.snflmjoiarpvtvqoawvz.supabase.co:5432/postgres');
    console.error('   OR');
    console.error('      DB_PASSWORD=[YOUR-PASSWORD]');
    await pool.end();
    process.exit(1);
  }
}

testConnection();
