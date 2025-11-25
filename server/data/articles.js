import prisma from '../database/prisma.js';
import { listArticleTerms, setArticleTerms } from './taxonomies.js';
import { getHotArticlesByVelocity } from './articleViews.js';

// Get all published articles
export async function getArticles(categoryName = null) {
  try {
    const where = {
      published: true,
      ...(categoryName ? { category: categoryName } : {}),
    };

    const articles = await prisma.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return articles || [];
  } catch (error) {
    console.error('❌ getArticles error:', error);
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

    const articles = await prisma.article.findMany({
      where: {
        published: true,
        category: currentArticle.category,
        slug: { not: currentArticleSlug },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return articles || [];
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
    const recentArticles = await prisma.article.findMany({
      where: {
        published: true,
        slug: { not: currentArticleSlug },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // If we have enough recent articles, return them
    if (recentArticles && recentArticles.length >= limit) {
      return recentArticles.slice(0, limit);
    }

    // Otherwise, get more articles to fill the limit
    const excludeSlugs = recentArticles.map(a => a.slug);
    const additionalArticles = await prisma.article.findMany({
      where: {
        published: true,
        slug: { 
          not: currentArticleSlug,
          notIn: excludeSlugs,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit - (recentArticles?.length || 0),
    });

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
    const where = {
      published: true,
      ...(currentArticleSlug ? { slug: { not: currentArticleSlug } } : {}),
    };

    const articles = await prisma.article.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return articles || [];
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
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return articles || [];
  } catch (error) {
    throw error;
  }
}

// Get article by slug
export async function getArticleBySlug(slug) {
  try {
    const article = await prisma.article.findFirst({
      where: {
        slug,
        published: true,
      },
    });

    if (!article) return null;
    const terms = await listArticleTerms(article.id).catch(() => []);
    return { ...article, terms };
  } catch (error) {
    throw error;
  }
}

// Get article by ID
export async function getArticleById(id) {
  try {
    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) return null;
    const terms = await listArticleTerms(article.id).catch(() => []);
    return { ...article, terms };
  } catch (error) {
    throw error;
  }
}

// Create new article
export async function createArticle(articleData) {
  try {
    const article = await prisma.article.create({
      data: {
        title: articleData.title,
        slug: articleData.slug,
        content: articleData.content,
        excerpt: articleData.excerpt || null,
        category: articleData.category,
        authorId: articleData.author_id || null,
        published: articleData.published || false,
        featuredImage: articleData.featured_image || null,
        metaTitle: articleData.meta_title || articleData.title || null,
        metaDescription: articleData.meta_description || articleData.excerpt || null,
        metaKeywords: articleData.meta_keywords || null,
        // Note: og_image, canonical_url, focus_keyword may need to be added to schema if they exist in DB
      },
    });

    // attach terms if provided
    if (articleData.term_ids && articleData.term_ids.length && article?.id) {
      await setArticleTerms(article.id, articleData.term_ids);
    }
    return article;
  } catch (error) {
    // Handle unique constraint violation (duplicate slug)
    if (error.code === 'P2002') {
      throw new Error('Article with this slug already exists');
    }
    throw error;
  }
}

// Update article
export async function updateArticle(id, articleData) {
  try {
    const updateData = {};
    
    // Map snake_case to camelCase for Prisma
    if (articleData.title !== undefined) updateData.title = articleData.title;
    if (articleData.slug !== undefined) updateData.slug = articleData.slug;
    if (articleData.content !== undefined) updateData.content = articleData.content;
    if (articleData.excerpt !== undefined) updateData.excerpt = articleData.excerpt;
    if (articleData.category !== undefined) updateData.category = articleData.category;
    if (articleData.published !== undefined) updateData.published = articleData.published;
    if (articleData.featured_image !== undefined) updateData.featuredImage = articleData.featured_image;
    if (articleData.meta_title !== undefined) updateData.metaTitle = articleData.meta_title;
    if (articleData.meta_description !== undefined) updateData.metaDescription = articleData.meta_description;
    if (articleData.meta_keywords !== undefined) updateData.metaKeywords = articleData.meta_keywords;
    if (articleData.author_id !== undefined) updateData.authorId = articleData.author_id || null;
    // Note: og_image, canonical_url, focus_keyword may need to be added to schema

    const article = await prisma.article.update({
      where: { id },
      data: updateData,
    });

    if (articleData.term_ids) {
      await setArticleTerms(id, articleData.term_ids || []);
    }
    const terms = await listArticleTerms(id).catch(() => []);
    return { ...article, terms };
  } catch (error) {
    if (error.code === 'P2025') {
      // Record not found
      return null;
    }
    if (error.code === 'P2002') {
      throw new Error('Article with this slug already exists');
    }
    throw error;
  }
}

// Delete article
export async function deleteArticle(id) {
  try {
    await prisma.article.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    if (error.code === 'P2025') {
      // Record not found
      return false;
    }
    throw error;
  }
}
