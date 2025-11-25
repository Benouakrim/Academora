import supabase from './supabase.js';

async function checkSchema() {
  try {
    console.log('🔍 Checking articles table schema...\n');
    
    // Try to fetch one article with all columns
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('📋 Articles table columns:');
      Object.keys(data[0]).forEach(column => {
        console.log(`   - ${column}: ${typeof data[0][column]}`);
      });
      
      // Check for required columns
      const requiredColumns = ['status', 'submitted_at', 'reviewed_at', 'reviewed_by', 'rejection_reason'];
      console.log('\n🔧 User article review system columns:');
      requiredColumns.forEach(col => {
        const exists = col in data[0];
        console.log(`   ${exists ? '✅' : '❌'} ${col}`);
      });
    } else {
      console.log('ℹ️  No articles in database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSchema();
