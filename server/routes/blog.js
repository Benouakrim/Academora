import express from 'express';
import { getArticles, getArticleBySlug } from '../data/articles.js';
import { parseUserToken, requireUser } from '../middleware/auth.js';
import { checkFeatureAccess, logUsage } from '../middleware/accessControl.js';
import {
  listArticleComments,
  createArticleComment,
  findArticleCommentById,
  softDeleteArticleComment,
} from '../data/articleComments.js';

const router = express.Router();

const ensurePremiumAccess = checkFeatureAccess('view-premium-content');
const logPremiumUsage = logUsage('view-premium-content');

// Simple in-memory cache for list endpoint
let listCache = { data: null, at: 0 };
const LIST_TTL_MS = 60 * 1000;

// Get all published articles (optionally filtered by category)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const now = Date.now();
    const cacheKey = category || 'all';
    
    // Use cache only if no category filter
    if (!category && listCache.data && now - listCache.at < LIST_TTL_MS) {
      return res.json(listCache.data);
    }
    
    const articles = await getArticles(category || null);
    
    // Cache only if no category filter
    if (!category) {
      listCache = { data: articles, at: now };
    }
    
    res.json(articles);
  } catch (error) {
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

// Get article by slug
router.get(
  '/:slug',
  parseUserToken,
  async (req, res, next) => {
    try {
      const { slug } = req.params;
      const article = await getArticleBySlug(slug);

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      const isPremium = Boolean(article.is_premium ?? article.premium);
      req.article = { ...article, is_premium: isPremium };

      if (!isPremium) {
        return next();
      }

      ensurePremiumAccess(req, res, (err) => {
        if (err) {
          return next(err);
        }
        logPremiumUsage(req, res, next);
      });
    } catch (error) {
      console.error('Error fetching article:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to fetch article.' });
      }
    }
  },
  (req, res) => {
    if (!req.article) {
      return res.status(500).json({ error: 'Article payload missing.' });
    }
    res.json(req.article);
  }
);

export default router;

