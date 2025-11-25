import pool from './pool.js';
import dotenv from 'dotenv';

dotenv.config();

async function verifySetup() {
  console.log('🔍 Verifying Database Setup...\n');
  
  // Check environment variables
  const databaseUrl = process.env.DATABASE_URL;
  const dbHost = process.env.DB_HOST;
  const dbPassword = process.env.DB_PASSWORD;
  
  console.log('📋 Configuration Check:');
  console.log(`   DATABASE_URL: ${databaseUrl ? '✅ Set' : '❌ Missing'}`);
  if (!databaseUrl) {
    console.log(`   DB_HOST: ${dbHost ? '✅ Set' : '❌ Missing'}`);
    console.log(`   DB_PASSWORD: ${dbPassword ? '✅ Set' : '❌ Missing'}`);
  }
  
  if (!databaseUrl && (!dbHost || !dbPassword)) {
    console.log('\n⚠️  WARNING: Database credentials are not configured properly.');
    console.log('   Please set DATABASE_URL or DB_* variables in your .env file.\n');
    process.exit(1);
  }
  
  console.log('\n🔌 Testing Database Connection...');
  
  try {
    // Test 1: Check if we can connect
    console.log('   Testing connection...');
    const testResult = await pool.query('SELECT 1 as test');
    
    if (!testResult || testResult.rows.length === 0) {
      throw new Error('Connection test failed');
    }
    
    console.log('   ✅ Connection successful!\n');
    
    // Test 2: Check if tables exist
    console.log('📊 Checking Database Tables...\n');
    
    const tables = ['users', 'articles', 'orientation_resources'];
    const tableStatus = {};
    
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = parseInt(result.rows[0].count);
        tableStatus[table] = { exists: true, count };
      } catch (error) {
        if (error.message.includes('does not exist') || error.message.includes('relation')) {
          tableStatus[table] = { exists: false, error: 'Table does not exist' };
        } else {
          tableStatus[table] = { exists: false, error: error.message };
        }
      }
    }
    
    // Display table status
    let allTablesExist = true;
    for (const [table, status] of Object.entries(tableStatus)) {
      if (status.exists) {
        console.log(`   ✅ ${table} - exists (${status.count || 0} rows)`);
      } else {
        console.log(`   ❌ ${table} - ${status.error}`);
        allTablesExist = false;
      }
    }
    
    if (!allTablesExist) {
      console.log('\n⚠️  Some tables are missing!');
      console.log('   Run the schema SQL file to create missing tables.');
      console.log('   File location: server/database/schema.sql\n');
    }
    
    // Test 3: Check for articles
    console.log('📝 Checking Articles...\n');
    const articlesResult = await pool.query(
      'SELECT id, title, published FROM articles LIMIT 10'
    );
    
    if (articlesResult.rows.length > 0) {
      const publishedCount = articlesResult.rows.filter(a => a.published).length;
      console.log(`   ✅ Found ${articlesResult.rows.length} articles (${publishedCount} published)`);
      if (publishedCount === 0) {
        console.log('   💡 Tip: Run "npm run db:seed-mock" to add sample articles\n');
      }
    } else {
      console.log('   ℹ️  No articles found in database');
      console.log('   💡 Tip: Run "npm run db:seed-mock" to add sample articles\n');
    }
    
    console.log('✅ Setup verification complete!\n');
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check that your DATABASE_URL is correct in .env file');
    console.error('2. Verify your database is accessible');
    console.error('3. Verify your database project is active');
    console.error('4. Check that the database schema has been run\n');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verifySetup();
