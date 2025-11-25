import express from 'express';
import pool from '../database/pool.js';
import { parseUserToken, requireAdmin } from '../middleware/auth.js';
import { siteSettings } from '../data/siteSettings.js';

const router = express.Router();

// Get all articles pending review
router.get('/pending', parseUserToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        a.*,
        u.name as author_name,
        u.email as author_email,
        u.avatar as author_avatar,
        c.name as category_name,
        c.slug as category_slug,
        (SELECT COUNT(*)::integer FROM articles WHERE author_id = a.author_id AND status = 'published') as author_published_count
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.status = 'pending'
      ORDER BY a.submitted_at ASC`
    );

    res.json({ articles: result.rows });
  } catch (error) {
    console.error('Error fetching pending articles:', error);
    res.status(500).json({ error: 'Failed to fetch pending articles' });
  }
});

// Get all reviewed articles (approved/rejected)
router.get('/reviewed', parseUserToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = `
      SELECT 
        a.*,
        u.name as author_name,
        u.email as author_email,
        u.avatar as author_avatar,
        c.name as category_name,
        reviewer.name as reviewer_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users reviewer ON a.reviewed_by = reviewer.id
      WHERE a.status IN ('approved', 'rejected')`;
    
    const params = [];
    if (status && ['approved', 'rejected'].includes(status)) {
      query += ' AND a.status = $1';
      params.push(status);
    }
    
    query += ' ORDER BY a.reviewed_at DESC LIMIT 100';

    const result = await pool.query(query, params);

    res.json({ articles: result.rows });
  } catch (error) {
    console.error('Error fetching reviewed articles:', error);
    res.status(500).json({ error: 'Failed to fetch reviewed articles' });
  }
});

// Get single article for review
router.get('/:id', parseUserToken, requireAdmin, async (req, res) => {
  try {
    const articleId = req.params.id; // UUID, not integer

    const result = await pool.query(
      `SELECT 
        a.*,
        u.name as author_name,
        u.email as author_email,
        u.avatar as author_avatar,
        u.bio as author_bio,
        c.name as category_name,
        c.slug as category_slug,
        reviewer.name as reviewer_name,
        (SELECT COUNT(*)::integer FROM articles WHERE author_id = a.author_id AND status = 'published') as author_published_count,
        (SELECT COUNT(*)::integer FROM articles WHERE author_id = a.author_id AND status = 'rejected') as author_rejected_count
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users reviewer ON a.reviewed_by = reviewer.id
      WHERE a.id = $1`,
      [articleId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({ article: result.rows[0] });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// Approve article
router.post('/:id/approve', parseUserToken, requireAdmin, async (req, res) => {
  try {
    const articleId = req.params.id; // UUID, not integer
    const adminId = req.user.id;
    const { publish_immediately } = req.body;

    const newStatus = publish_immediately ? 'published' : 'approved';

    const result = await pool.query(
      `UPDATE articles SET
        status = $1,
        reviewed_by = $2,
        reviewed_at = CURRENT_TIMESTAMP,
        published_at = CASE WHEN $1 = 'published' THEN CURRENT_TIMESTAMP ELSE published_at END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND status = 'pending'
      RETURNING *`,
      [newStatus, adminId, articleId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found or already reviewed' });
    }

    res.json({ 
      article: result.rows[0],
      message: publish_immediately 
        ? 'Article approved and published successfully'
        : 'Article approved successfully'
    });
  } catch (error) {
    console.error('Error approving article:', error);
    res.status(500).json({ error: 'Failed to approve article' });
  }
});

// Reject article
router.post('/:id/reject', parseUserToken, requireAdmin, async (req, res) => {
  try {
    const articleId = req.params.id; // UUID, not integer
    const adminId = req.user.id;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const result = await pool.query(
      `UPDATE articles SET
        status = 'rejected',
        reviewed_by = $1,
        reviewed_at = CURRENT_TIMESTAMP,
        rejection_reason = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND status = 'pending'
      RETURNING *`,
      [adminId, reason, articleId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found or already reviewed' });
    }

    res.json({ 
      article: result.rows[0],
      message: 'Article rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting article:', error);
    res.status(500).json({ error: 'Failed to reject article' });
  }
});

// Publish an approved article
router.post('/:id/publish', parseUserToken, requireAdmin, async (req, res) => {
  try {
    const articleId = req.params.id; // UUID, not integer

    const result = await pool.query(
      `UPDATE articles SET
        status = 'published',
        published_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status = 'approved'
      RETURNING *`,
      [articleId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found or not approved' });
    }

    res.json({ 
      article: result.rows[0],
      message: 'Article published successfully'
    });
  } catch (error) {
    console.error('Error publishing article:', error);
    res.status(500).json({ error: 'Failed to publish article' });
  }
});

// Get review statistics
router.get('/stats/overview', parseUserToken, requireAdmin, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending')::integer as pending_count,
        COUNT(*) FILTER (WHERE status = 'approved')::integer as approved_count,
        COUNT(*) FILTER (WHERE status = 'rejected')::integer as rejected_count,
        COUNT(*) FILTER (WHERE status = 'published')::integer as published_count,
        COUNT(*) FILTER (WHERE status = 'draft')::integer as draft_count,
        COUNT(DISTINCT author_id) FILTER (WHERE status = 'pending')::integer as active_contributors
      FROM articles
    `);

    // Get current settings
    const maxPending = await siteSettings.getMaxPendingArticles();

    res.json({ 
      ...stats.rows[0],
      max_pending_per_user: maxPending
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Update site settings (including max pending articles)
router.put('/settings', parseUserToken, requireAdmin, async (req, res) => {
  try {
    const { max_pending_articles_per_user } = req.body;

    if (max_pending_articles_per_user !== undefined) {
      const value = parseInt(max_pending_articles_per_user);
      if (isNaN(value) || value < 1 || value > 20) {
        return res.status(400).json({ 
          error: 'Max pending articles must be between 1 and 20' 
        });
      }

      await siteSettings.updateSetting('max_pending_articles_per_user', value.toString());
    }

    const allSettings = await siteSettings.getAllSettings();
    res.json({ 
      settings: allSettings,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Get current settings
router.get('/settings/current', parseUserToken, requireAdmin, async (req, res) => {
  try {
    const allSettings = await siteSettings.getAllSettings();
    res.json({ settings: allSettings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

export default router;
