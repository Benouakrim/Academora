import supabase from './supabase.js';
import dotenv from 'dotenv';

dotenv.config();

async function verifySetup() {
  console.log('🔍 Verifying Supabase Setup...\n');
  
  // Check environment variables
  const supabaseUrl = process.env.SUPABASE_URL || 'https://snflmjoiarpvtvqoawvz.supabase.co';
  const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('📋 Configuration Check:');
  console.log(`   SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`   SUPABASE_KEY: ${supabaseKey && supabaseKey !== 'YOUR_SERVICE_ROLE_KEY_HERE' ? '✅ Set' : '❌ Missing or placeholder'}`);
  
  if (!supabaseKey || supabaseKey === 'YOUR_SERVICE_ROLE_KEY_HERE') {
    console.log('\n⚠️  WARNING: SUPABASE_KEY is not configured properly.');
    console.log('   Please update your .env file with your actual Supabase service_role key.\n');
    process.exit(1);
  }
  
  console.log('\n🔌 Testing Database Connection...');
  
  try {
    // Test 1: Check if we can connect
    console.log('   Testing connection...');
    const { error: connectionError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (connectionError) {
      if (connectionError.message && connectionError.message.includes('JWT')) {
        console.log('   ❌ Connection failed: Invalid API key');
        console.log('   Make sure you\'re using the service_role key (not anon key)');
        process.exit(1);
      }
      throw connectionError;
    }
    
    console.log('   ✅ Connection successful!\n');
    
    // Test 2: Check if tables exist
    console.log('📊 Checking Database Tables...\n');
    
    const tables = ['users', 'articles', 'orientation_resources'];
    const tableStatus = {};
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count', { count: 'exact', head: true });
        
        if (error && (error.message.includes('relation') || error.code === '42P01')) {
          tableStatus[table] = { exists: false, error: 'Table does not exist' };
        } else if (error) {
          tableStatus[table] = { exists: false, error: error.message };
        } else {
          tableStatus[table] = { exists: true };
        }
      } catch (err) {
        tableStatus[table] = { exists: false, error: err.message };
      }
    }
    
    // Display table status
    let allTablesExist = true;
    for (const [table, status] of Object.entries(tableStatus)) {
      if (status.exists) {
        // Get row count
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        console.log(`   ✅ ${table} - exists (${count || 0} rows)`);
      } else {
        console.log(`   ❌ ${table} - ${status.error}`);
        allTablesExist = false;
      }
    }
    
    if (!allTablesExist) {
      console.log('\n⚠️  Some tables are missing. Run the schema.sql in Supabase SQL Editor.');
      console.log('   File location: server/database/schema.sql\n');
    }
    
    // Test 3: Check for articles
    console.log('📝 Checking Articles...\n');
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, published')
      .limit(10);
    
    if (articlesError && !articlesError.message.includes('relation')) {
      console.log(`   ⚠️  Error fetching articles: ${articlesError.message}`);
    } else if (articles && articles.length > 0) {
      const publishedCount = articles.filter(a => a.published).length;
      console.log(`   ✅ Found ${articles.length} articles (${publishedCount} published)`);
      if (publishedCount === 0) {
        console.log('   💡 Tip: Run "npm run db:seed" to add sample articles\n');
      }
    } else {
      console.log('   ℹ️  No articles found in database');
      console.log('   💡 Tip: Run "npm run db:seed" to add sample articles\n');
    }
    
    console.log('✅ Setup verification complete!\n');
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check that your SUPABASE_KEY is correct in .env file');
    console.error('2. Make sure you\'re using the service_role key (not anon key)');
    console.error('3. Verify your Supabase project is active');
    console.error('4. Check that the database schema has been run\n');
    process.exit(1);
  }
}

verifySetup();

