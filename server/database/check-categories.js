import supabase from './supabase.js';

async function checkCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .limit(5);
  
  if (error) {
    console.error('❌ Error fetching categories:', error.message);
  } else {
    console.log('📂 Categories:', JSON.stringify(data, null, 2));
  }
}

checkCategories();
