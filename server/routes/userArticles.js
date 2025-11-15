import express from 'express';
import pool from '../database/supabase.js';
import { parseUserToken, requireUser } from '../middleware/auth.js';
import { siteSettings } from '../data/siteSettings.js';

const router = express.Router();

// Get user's own articles with analytics
router.get('/my-articles', parseUserToken, requireUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
        a.*,
        u.name as author_name,
        u.avatar as author_avatar,
        c.name as category_name,
        c.slug as category_slug,
        reviewer.name as reviewer_name,
        COALESCE(SUM(aa.views), 0)::integer as total_views,
        COALESCE(SUM(aa.likes), 0)::integer as total_likes,
        COALESCE(SUM(aa.comments), 0)::integer as total_comments,
        COALESCE(SUM(aa.shares), 0)::integer as total_shares,
        (SELECT COUNT(*)::integer FROM article_comments WHERE article_id = a.id) as comment_count
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users reviewer ON a.reviewed_by = reviewer.id
      LEFT JOIN article_performance_stats aa ON a.id = aa.article_id
      WHERE a.author_id = $1
      GROUP BY a.id, u.name, u.avatar, c.name, c.slug, reviewer.name
      ORDER BY a.created_at DESC`,
      [userId]
    );

    res.json({ articles: result.rows });
  } catch (error) {
    console.error('Error fetching user articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Get article analytics for a specific article
router.get('/my-articles/:id/analytics', parseUserToken, requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const articleId = parseInt(req.params.id);

    // Verify ownership
    const ownership = await pool.query(
      'SELECT id FROM articles WHERE id = $1 AND author_id = $2',
      [articleId, userId]
    );

    if (ownership.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Get daily analytics for the last 30 days
    const analytics = await pool.query(
      `SELECT 
        date,
        views,
        likes,
        comments,
        shares
      FROM article_performance_stats
      WHERE article_id = $1 
        AND date >= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY date DESC`,
      [articleId]
    );

    // Get total stats
    const totals = await pool.query(
      `SELECT 
        COALESCE(SUM(views), 0)::integer as total_views,
        COALESCE(SUM(likes), 0)::integer as total_likes,
        COALESCE(SUM(comments), 0)::integer as total_comments,
        COALESCE(SUM(shares), 0)::integer as total_shares
      FROM article_performance_stats
      WHERE article_id = $1`,
      [articleId]
    );

    res.json({
      daily: analytics.rows,
      totals: totals.rows[0]
    });
  } catch (error) {
    console.error('Error fetching article analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Check if user can submit new article (based on pending limit)
router.get('/can-submit', parseUserToken, requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const maxPending = await siteSettings.getMaxPendingArticles();

    const result = await pool.query(
      `SELECT COUNT(*)::integer as pending_count
       FROM articles
       WHERE author_id = $1 AND status = 'pending'`,
      [userId]
    );

    const pendingCount = result.rows[0].pending_count;
    const canSubmit = pendingCount < maxPending;

    res.json({
      canSubmit,
      pendingCount,
      maxPending,
      remaining: maxPending - pendingCount
    });
  } catch (error) {
    console.error('Error checking submission limit:', error);
    res.status(500).json({ error: 'Failed to check submission status' });
  }
});

// Create/update user article
router.post('/submit', parseUserToken, requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      id,
      title,
      slug,
      excerpt,
      content,
      featured_image,
      category_id,
      tags,
      status, // 'draft' or 'pending'
      meta_title,
      meta_description
    } = req.body;

    // Validate required fields for pending submission
    if (status === 'pending') {
      if (!title || !content || !category_id) {
        return res.status(400).json({ 
          error: 'Title, content, and category are required for submission' 
        });
      }

      // Check pending limit
      const maxPending = await siteSettings.getMaxPendingArticles();
      const pendingCheck = await pool.query(
        `SELECT COUNT(*)::integer as pending_count
         FROM articles
         WHERE author_id = $1 AND status = 'pending' AND ($2::integer IS NULL OR id != $2)`,
        [userId, id || null]
      );

      if (pendingCheck.rows[0].pending_count >= maxPending) {
        return res.status(400).json({ 
          error: `You have reached the maximum limit of ${maxPending} pending articles. Please wait for your articles to be reviewed.` 
        });
      }
    }

    let result;

    if (id) {
      // Update existing article (only if it's user's own and not published)
      const ownership = await pool.query(
        'SELECT status FROM articles WHERE id = $1 AND author_id = $2',
        [id, userId]
      );

      if (ownership.rows.length === 0) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      if (ownership.rows[0].status === 'published') {
        return res.status(400).json({ error: 'Cannot edit published articles' });
      }

      result = await pool.query(
        `UPDATE articles SET
          title = $1,
          slug = $2,
          excerpt = $3,
          content = $4,
          featured_image = $5,
          category_id = $6,
          tags = $7,
          status = $8,
          meta_title = $9,
          meta_description = $10,
          submitted_at = CASE WHEN $8 = 'pending' THEN CURRENT_TIMESTAMP ELSE submitted_at END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $11 AND author_id = $12
        RETURNING *`,
        [title, slug, excerpt, content, featured_image, category_id, tags, status, 
         meta_title, meta_description, id, userId]
      );
    } else {
      // Create new article
      result = await pool.query(
        `INSERT INTO articles (
          title, slug, excerpt, content, featured_image, category_id, tags,
          author_id, status, submitted_at, meta_title, meta_description, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 
                  CASE WHEN $9 = 'pending' THEN CURRENT_TIMESTAMP ELSE NULL END,
                  $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [title, slug, excerpt, content, featured_image, category_id, tags,
         userId, status, meta_title, meta_description]
      );
    }

    res.json({ 
      article: result.rows[0],
      message: status === 'pending' 
        ? 'Article submitted for review successfully'
        : 'Draft saved successfully'
    });
  } catch (error) {
    console.error('Error submitting article:', error);
    res.status(500).json({ error: 'Failed to submit article' });
  }
});

// Delete user's own draft or rejected article
router.delete('/:id', parseUserToken, requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const articleId = parseInt(req.params.id);

    // Verify ownership and status
    const article = await pool.query(
      'SELECT status FROM articles WHERE id = $1 AND author_id = $2',
      [articleId, userId]
    );

    if (article.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Only allow deletion of drafts and rejected articles
    if (!['draft', 'rejected'].includes(article.rows[0].status)) {
      return res.status(400).json({ 
        error: 'Can only delete draft or rejected articles' 
      });
    }

    await pool.query('DELETE FROM articles WHERE id = $1', [articleId]);

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

export default router;
