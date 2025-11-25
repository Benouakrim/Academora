import express from 'express';
import { 
  getArticles, 
  getArticleBySlug, 
  getSimilarArticles,
  getRecommendedArticles,
  getHotArticles,
  getLatestArticles,
  getArticleSections
} from '../data/articles.js';
import { 
  trackArticleView, 
  getArticleViewStats,
  getHotArticlesByVelocity,
  getOverallAnalytics,
  getArticlePerformanceComparison
} from '../data/articleViews.js';
import { parseUserToken, requireUser } from '../middleware/auth.js';
import {
  listArticleComments,
  createArticleComment,
  findArticleCommentById,
  softDeleteArticleComment,
} from '../data/articleComments.js';

const router = express.Router();

// Simple in-memory cache for list endpoint
let listCache = { data: null, at: 0 };
const LIST_TTL_MS = 60 * 1000;

// Get all published articles (optionally filtered by category)
router.get('/', async (req, res) => {
  console.log('📝 Blog route hit, query:', req.query);
  try {
    const { category } = req.query;
    const now = Date.now();
    const cacheKey = category || 'all';
    
    // Use cache only if no category filter
    if (!category && listCache.data && now - listCache.at < LIST_TTL_MS) {
      return res.json(listCache.data);
    }
    
    const articles = await getArticles(category || null);
    console.log('✅ Blog route success, articles:', articles.length);
    
    // Cache only if no category filter
    if (!category) {
      listCache = { data: articles, at: now };
    }
    
    res.json(articles);
  } catch (error) {
    console.error('❌ Blog route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get comments for an article
router.get('/:slug/comments', async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await getArticleBySlug(slug);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const comments = await listArticleComments(article.id);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching article comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
});

// Add a comment to an article
router.post('/:slug/comments', parseUserToken, requireUser, async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await getArticleBySlug(slug);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const content = (req.body?.content || '').toString().trim();
    if (!content) {
      return res.status(400).json({ error: 'Comment content is required.' });
    }
    if (content.length > 2000) {
      return res.status(400).json({ error: 'Comment is too long (maximum 2000 characters).' });
    }

    const comment = await createArticleComment({
      articleId: article.id,
      userId: req.user.id,
      content,
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating article comment:', error);
    res.status(500).json({ error: 'Failed to create comment.' });
  }
});

// Delete (soft-delete) a comment
router.delete('/:slug/comments/:commentId', parseUserToken, requireUser, async (req, res) => {
  try {
    const { slug, commentId } = req.params;
    const article = await getArticleBySlug(slug);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const comment = await findArticleCommentById(commentId);
    if (!comment || comment.article_id !== article.id || comment.is_deleted) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    const isOwner = comment.user_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'You do not have permission to delete this comment.' });
    }

    await softDeleteArticleComment({ commentId: comment.id });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting article comment:', error);
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
});

// Get article sections for a specific article
router.get('/sections/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { limit } = req.query;
    
    const articleLimit = limit ? parseInt(limit) : 6;
    
    const sections = await getArticleSections(slug, articleLimit);
    res.json(sections);
  } catch (error) {
    console.error('Error fetching article sections:', error);
    res.status(500).json({ error: 'Failed to fetch article sections.' });
  }
});

// Get similar articles for a specific article
router.get('/similar/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { limit } = req.query;
    
    const articleLimit = limit ? parseInt(limit) : 6;
    const articles = await getSimilarArticles(slug, articleLimit);
    res.json(articles);
  } catch (error) {
    console.error('Error fetching similar articles:', error);
    res.status(500).json({ error: 'Failed to fetch similar articles.' });
  }
});

// Get recommended articles for a specific article
router.get('/recommended/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { limit } = req.query;
    
    const articleLimit = limit ? parseInt(limit) : 6;
    const articles = await getRecommendedArticles(slug, articleLimit);
    res.json(articles);
  } catch (error) {
    console.error('Error fetching recommended articles:', error);
    res.status(500).json({ error: 'Failed to fetch recommended articles.' });
  }
});

// Track article view
router.post('/:slug/track-view', parseUserToken, async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await getArticleBySlug(slug);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const viewData = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referrer'),
      sessionId: req.sessionId || null,
      duration: req.body.duration || null,
    };

    const userId = req.user ? req.user.id : null;
    const trackedView = await trackArticleView(article.id, userId, viewData);

    res.status(201).json({ success: true, viewId: trackedView.id });
  } catch (error) {
    console.error('Error tracking article view:', error);
    res.status(500).json({ error: 'Failed to track view.' });
  }
});

// Get article view statistics
router.get('/:slug/analytics', async (req, res) => {
  try {
    const { slug } = req.params;
    const { timeRange } = req.query;
    
    const article = await getArticleBySlug(slug);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const stats = await getArticleViewStats(article.id, timeRange || '30d');
    res.json(stats);
  } catch (error) {
    console.error('Error fetching article analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
});

// Get overall analytics (for admin dashboard)
router.get('/analytics/overview', async (req, res) => {
  try {
    const { timeRange } = req.query;
    
    const analytics = await getOverallAnalytics(timeRange || '30d');
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching overall analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
});

// Compare article performance
router.post('/analytics/compare', async (req, res) => {
  try {
    const { articleIds } = req.body;
    const { timeRange } = req.query;
    
    if (!Array.isArray(articleIds) || articleIds.length === 0) {
      return res.status(400).json({ error: 'Article IDs array is required.' });
    }

    const comparison = await getArticlePerformanceComparison(articleIds, timeRange || '30d');
    res.json(comparison);
  } catch (error) {
    console.error('Error comparing article performance:', error);
    res.status(500).json({ error: 'Failed to compare articles.' });
  }
});

// Get hot articles (updated to use view velocity)
router.get('/hot', async (req, res) => {
  try {
    const { limit, exclude, timeRange } = req.query;
    
    const articleLimit = limit ? parseInt(limit) : 6;
    const articles = await getHotArticlesByVelocity(exclude, articleLimit, timeRange || '7d');
    res.json(articles);
  } catch (error) {
    console.error('Error fetching hot articles:', error);
    res.status(500).json({ error: 'Failed to fetch hot articles.' });
  }
});

// Get latest articles
router.get('/latest', async (req, res) => {
  try {
    const { limit, exclude } = req.query;
    
    const articleLimit = limit ? parseInt(limit) : 6;
    const articles = await getLatestArticles(exclude, articleLimit);
    res.json(articles);
  } catch (error) {
    console.error('Error fetching latest articles:', error);
    res.status(500).json({ error: 'Failed to fetch latest articles.' });
  }
});

// Get article by slug - PUBLIC (no auth required)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await getArticleBySlug(slug);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article.' });
  }
});

export default router;

