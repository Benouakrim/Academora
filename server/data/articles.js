import supabase from '../database/supabase.js';

// Get all published articles
export async function getArticles() {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      // Provide more helpful error messages
      if (error.message && error.message.includes('JWT')) {
        throw new Error('Supabase authentication failed. Please check your SUPABASE_KEY in the .env file.');
      }
      if ((error.message && error.message.includes('relation')) || error.code === '42P01') {
        throw new Error('Articles table does not exist. Please run the database schema from server/database/schema.sql');
      }
      throw error;
    }
    return data || [];
  } catch (error) {
    // If error is already an Error object with message, throw it as is
    if (error instanceof Error) {
      throw error;
    }
    // Otherwise wrap it
    throw new Error(error.message || 'Failed to fetch articles from database');
  }
}

// Get all articles (including unpublished) - for admin
export async function getAllArticles() {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
}

// Get article by slug
export async function getArticleBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data || null;
  } catch (error) {
    throw error;
  }
}

// Get article by ID
export async function getArticleById(id) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data || null;
  } catch (error) {
    throw error;
  }
}

// Create new article
export async function createArticle(articleData) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .insert([
        {
          title: articleData.title,
          slug: articleData.slug,
          content: articleData.content,
          excerpt: articleData.excerpt,
          category: articleData.category,
          author_id: articleData.author_id,
          published: articleData.published || false,
          featured_image: articleData.featured_image || null,
          meta_title: articleData.meta_title || articleData.title,
          meta_description: articleData.meta_description || articleData.excerpt,
          meta_keywords: articleData.meta_keywords || null,
          og_image: articleData.og_image || articleData.featured_image || null,
          canonical_url: articleData.canonical_url || null,
          focus_keyword: articleData.focus_keyword || null,
        },
      ])
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation (duplicate slug)
      if (error.code === '23505') {
        throw new Error('Article with this slug already exists');
      }
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Update article
export async function updateArticle(id, articleData) {
  try {
    const updateData = {};
    
    if (articleData.title !== undefined) updateData.title = articleData.title;
    if (articleData.slug !== undefined) updateData.slug = articleData.slug;
    if (articleData.content !== undefined) updateData.content = articleData.content;
    if (articleData.excerpt !== undefined) updateData.excerpt = articleData.excerpt;
    if (articleData.category !== undefined) updateData.category = articleData.category;
    if (articleData.published !== undefined) updateData.published = articleData.published;
    if (articleData.featured_image !== undefined) updateData.featured_image = articleData.featured_image;
    if (articleData.meta_title !== undefined) updateData.meta_title = articleData.meta_title;
    if (articleData.meta_description !== undefined) updateData.meta_description = articleData.meta_description;
    if (articleData.meta_keywords !== undefined) updateData.meta_keywords = articleData.meta_keywords;
    if (articleData.og_image !== undefined) updateData.og_image = articleData.og_image;
    if (articleData.canonical_url !== undefined) updateData.canonical_url = articleData.canonical_url;
    if (articleData.focus_keyword !== undefined) updateData.focus_keyword = articleData.focus_keyword;

    const { data, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      if (error.code === '23505') {
        throw new Error('Article with this slug already exists');
      }
      throw error;
    }

    return data || null;
  } catch (error) {
    throw error;
  }
}

// Delete article
export async function deleteArticle(id) {
  try {
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    throw error;
  }
}
