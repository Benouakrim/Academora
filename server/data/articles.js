import supabase from '../database/supabase.js';
import { listArticleTerms, setArticleTerms } from './taxonomies.js';
import { getHotArticlesByVelocity } from './articleViews.js';

// Get all published articles
export async function getArticles(categoryName = null) {
  try {
    let query = supabase
      .from('articles')
      .select('*')
      .eq('published', true);

    if (categoryName) {
      query = query.eq('category', categoryName);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

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

// Get similar articles (same category, excluding current article)
export async function getSimilarArticles(currentArticleSlug, limit = 6) {
  try {
    // First get the current article to find its category
    const currentArticle = await getArticleBySlug(currentArticleSlug);
    if (!currentArticle) {
      return [];
    }

    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('published', true)
      .eq('category', currentArticle.category)
      .neq('slug', currentArticleSlug)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching similar articles:', error);
    return [];
  }
}

// Get recommended articles (algorithm-based recommendations)
export async function getRecommendedArticles(currentArticleSlug, limit = 6) {
  try {
    // Get current article for context
    const currentArticle = await getArticleBySlug(currentArticleSlug);
    if (!currentArticle) {
      return [];
    }

    // Algorithm: Mix of recent articles and articles from related categories
    const { data: recentArticles, error: recentError } = await supabase
      .from('articles')
      .select('*')
      .eq('published', true)
      .neq('slug', currentArticleSlug)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (recentError) throw recentError;

    // If we have enough recent articles, return them
    if (recentArticles && recentArticles.length >= limit) {
      return recentArticles.slice(0, limit);
    }

    // Otherwise, get more articles to fill the limit
    const { data: additionalArticles, error: additionalError } = await supabase
      .from('articles')
      .select('*')
      .eq('published', true)
      .neq('slug', currentArticleSlug)
      .not('slug', 'in', `(${recentArticles?.map(a => a.slug).join(',')})`)
      .order('created_at', { ascending: false })
      .limit(limit - (recentArticles?.length || 0));

    if (additionalError) throw additionalError;

    return [...(recentArticles || []), ...(additionalArticles || [])].slice(0, limit);
  } catch (error) {
    console.error('Error fetching recommended articles:', error);
    return [];
  }
}

// Get hot articles (updated to use view velocity)
export async function getHotArticles(currentArticleSlug = null, limit = 6) {
  try {
    return await getHotArticlesByVelocity(currentArticleSlug, limit, '7d');
  } catch (error) {
    console.error('Error fetching hot articles:', error);
    return [];
  }
}

// Get latest articles
export async function getLatestArticles(currentArticleSlug = null, limit = 6) {
  try {
    let query = supabase
      .from('articles')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (currentArticleSlug) {
      query = query.neq('slug', currentArticleSlug);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching latest articles:', error);
    return [];
  }
}

// Get all article sections data in one call
export async function getArticleSections(currentArticleSlug, limit = 6) {
  try {
    const [similar, recommended, hot, latest] = await Promise.all([
      getSimilarArticles(currentArticleSlug, limit),
      getRecommendedArticles(currentArticleSlug, limit),
      getHotArticles(currentArticleSlug, limit),
      getLatestArticles(currentArticleSlug, limit)
    ]);

    return {
      similar,
      recommended,
      hot,
      latest
    };
  } catch (error) {
    console.error('Error fetching article sections:', error);
    return {
      similar: [],
      recommended: [],
      hot: [],
      latest: []
    };
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

    if (!data) return null;
    const terms = await listArticleTerms(data.id).catch(() => []);
    return { ...data, terms };
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

    if (!data) return null;
    const terms = await listArticleTerms(data.id).catch(() => []);
    return { ...data, terms };
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

    // attach terms if provided
    if (articleData.term_ids && articleData.term_ids.length && data?.id) {
      await setArticleTerms(data.id, articleData.term_ids);
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

    if (!data) return null;
    if (articleData.term_ids) {
      await setArticleTerms(id, articleData.term_ids || []);
    }
    const terms = await listArticleTerms(id).catch(() => []);
    return { ...data, terms };
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
