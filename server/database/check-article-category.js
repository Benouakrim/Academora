import supabase from './supabase.js';

async function checkArticleCategory() {
  const { data: article } = await supabase
    .from('articles')
    .select('id, title, category, category_id')
    .limit(1)
    .single();
  
  console.log('📝 Article sample:', article);
  
  // Check if category_id column exists
  if ('category_id' in (article || {})) {
    console.log('✅ articles table has category_id column');
  } else {
    console.log('❌ articles table does NOT have category_id column');
    console.log('ℹ️  Using category (string) column instead');
  }
}

checkArticleCategory();
