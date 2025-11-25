import express from 'express';
import pool from '../database/pool.js';
import { requireUser } from '../middleware/auth.js';
import { siteSettings } from '../data/siteSettings.js';

const router = express.Router();

// Test endpoint to verify route is reachable
router.get('/test', (req, res) => {
  res.json({ message: 'User articles route is working', path: req.path });
});

// Get user's own articles with analytics
// Note: parseUserToken is already applied globally, but we keep it here for clarity
router.get('/my-articles', requireUser, async (req, res) => {
  try {
    console.log('[userArticles] /my-articles: req.user', req.user ? { id: req.user.id, email: req.user.email, role: req.user.role } : 'NULL');
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
router.get('/my-articles/:id/analytics', requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const articleId = req.params.id; // UUID, not integer

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
router.get('/can-submit', requireUser, async (req, res) => {
  try {
    if (!req.user) {
      console.error('[userArticles] /can-submit: req.user is null');
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const userId = req.user.id;
    console.log('[userArticles] /can-submit: userId', userId);
    const maxPending = await siteSettings.getMaxPendingArticles();

    let result;
    try {
      result = await pool.query(
        `SELECT COUNT(*)::integer as pending_count
         FROM articles
         WHERE author_id = $1 AND status = 'pending'`,
        [userId]
      );
    } catch (dbError) {
      console.error('[userArticles] Database error in /can-submit:', dbError);
      // Check if it's an RLS error
      if (dbError.message && dbError.message.includes('row-level security')) {
        return res.status(500).json({ 
          error: 'Database access denied. Please ensure RLS is disabled on articles table or proper policies are set.',
          details: 'Run the SQL script in scripts/fix-user-articles-rls.sql'
        });
      }
      throw dbError;
    }

    const pendingCount = result.rows[0].pending_count;
    const canSubmit = pendingCount < maxPending;

    res.json({
      canSubmit,
      pendingCount,
      maxPending,
      remaining: maxPending - pendingCount
    });
  } catch (error) {
    console.error('[userArticles] Error checking submission limit:', error);
    console.error('[userArticles] Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
    if (error.message && error.message.includes('row-level security')) {
      return res.status(500).json({ 
        error: 'Database access denied. Please ensure RLS is disabled on articles table.',
        details: 'Run: ALTER TABLE public.articles DISABLE ROW LEVEL SECURITY;'
      });
    }
    res.status(500).json({ 
      error: 'Failed to check submission status',
      details: error.message || 'Unknown error'
    });
  }
});

// Create/update user article
router.post('/submit', requireUser, async (req, res) => {
  try {
    if (!req.user) {
      console.error('[userArticles] /submit: req.user is null');
      return res.status(401).json({ error: 'Authentication required.' });
    }
    const userId = req.user.id;
    console.log('[userArticles] /submit: userId', userId, 'status', req.body.status);
    console.log('[userArticles] /submit: request body', {
      id: req.body.id,
      title: req.body.title,
      content: req.body.content ? `${req.body.content.substring(0, 50)}...` : null,
      category_id: req.body.category_id,
      status: req.body.status
    });
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
      if (!title || !content) {
        return res.status(400).json({ 
          error: 'Title and content are required for submission',
          received: { title: !!title, content: !!content, category_id: category_id }
        });
      }
      // Category is optional for now - we'll handle it gracefully
      if (!category_id) {
        console.warn('[userArticles] /submit: category_id is missing for pending submission');
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

      try {
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
          [title, slug, excerpt, content, featured_image, category_id || null, tags || [], status, 
           meta_title, meta_description, id, userId]
        );
      } catch (dbError) {
        console.error('[userArticles] Database error in /submit (UPDATE):', dbError);
        if (dbError.message && dbError.message.includes('row-level security')) {
          return res.status(500).json({ 
            error: 'Database access denied. Please ensure RLS is disabled on articles table.',
            details: 'Run: ALTER TABLE public.articles DISABLE ROW LEVEL SECURITY;'
          });
        }
        // Check if it's a column error (category_id might not exist)
        if (dbError.message && dbError.message.includes('column') && dbError.message.includes('category_id')) {
          console.error('[userArticles] category_id column does not exist, trying with category string instead');
          // Try with category string if category_id column doesn't exist
          // This is a fallback - you should add category_id column to your schema
          return res.status(500).json({ 
            error: 'Database schema mismatch: category_id column not found',
            details: 'Please add category_id column to articles table or update the schema'
          });
        }
        throw dbError;
      }
    } else {
      // Create new article
      try {
        result = await pool.query(
          `INSERT INTO articles (
            title, slug, excerpt, content, featured_image, category_id, tags,
            author_id, status, submitted_at, meta_title, meta_description, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 
                    CASE WHEN $9 = 'pending' THEN CURRENT_TIMESTAMP ELSE NULL END,
                    $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING *`,
          [title, slug || (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : null), 
           excerpt, content, featured_image, category_id || null, tags || [],
           userId, status, meta_title, meta_description]
        );
      } catch (dbError) {
        console.error('[userArticles] Database error in /submit (INSERT):', dbError);
        console.error('[userArticles] Error details:', {
          message: dbError.message,
          code: dbError.code,
          detail: dbError.detail
        });
        if (dbError.message && dbError.message.includes('row-level security')) {
          return res.status(500).json({ 
            error: 'Database access denied. Please ensure RLS is disabled on articles table.',
            details: 'Run: ALTER TABLE public.articles DISABLE ROW LEVEL SECURITY;'
          });
        }
        // Check if it's a column error (category_id might not exist)
        if (dbError.message && dbError.message.includes('column') && dbError.message.includes('category_id')) {
          console.error('[userArticles] category_id column does not exist, trying with category string instead');
          // Fallback: try using category string instead of category_id
          try {
            // Get category name - try from req.body.category or look up from category_id
            let categoryName = 'General';
            if (req.body.category) {
              categoryName = req.body.category;
            } else if (category_id) {
              const catResult = await pool.query('SELECT name FROM categories WHERE id = $1', [category_id]);
              if (catResult.rows.length > 0) {
                categoryName = catResult.rows[0].name;
              }
            }
            result = await pool.query(
              `INSERT INTO articles (
                title, slug, excerpt, content, featured_image, category, tags,
                author_id, status, submitted_at, meta_title, meta_description, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 
                        CASE WHEN $9 = 'pending' THEN CURRENT_TIMESTAMP ELSE NULL END,
                        $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
              RETURNING *`,
              [title, slug || (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : null), 
               excerpt, content, featured_image, categoryName, tags || [],
               userId, status, meta_title, meta_description]
            );
            console.log('[userArticles] Successfully saved using category string fallback');
          } catch (fallbackError) {
            console.error('[userArticles] Fallback also failed:', fallbackError);
            return res.status(500).json({ 
              error: 'Database schema mismatch: category_id column not found',
              details: 'Please run: scripts/add-category-id-column.sql in Supabase SQL Editor',
              fallbackError: fallbackError.message
            });
          }
          // If fallback succeeded, continue to return success response
          return res.json({ 
            article: result.rows[0],
            message: status === 'pending' 
              ? 'Article submitted for review successfully'
              : 'Draft saved successfully',
            warning: 'Using category string instead of category_id'
          });
        }
        // Check for NOT NULL constraint violations
        if (dbError.message && dbError.message.includes('null value') && dbError.message.includes('violates not-null constraint')) {
          return res.status(400).json({ 
            error: 'Missing required field',
            details: dbError.message,
            hint: 'Make sure all required fields are provided'
          });
        }
        // Log the full error for debugging
        console.error('[userArticles] Full database error object:', JSON.stringify(dbError, Object.getOwnPropertyNames(dbError)));
        return res.status(500).json({ 
          error: 'Failed to save article',
          details: dbError.message || dbError.toString() || 'Unknown database error',
          code: dbError.code || 'UNKNOWN',
          hint: dbError.hint || dbError.detail || 'Check backend console for detailed error',
          errorType: dbError.constructor.name
        });
      }
    }

    res.json({ 
      article: result.rows[0],
      message: status === 'pending' 
        ? 'Article submitted for review successfully'
        : 'Draft saved successfully'
    });
  } catch (error) {
    console.error('[userArticles] Error submitting article:', error);
    console.error('[userArticles] Error stack:', error.stack);
    console.error('[userArticles] Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    console.error('[userArticles] Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      name: error.name,
      constructor: error.constructor?.name
    });
    
    // Check if response was already sent
    if (res.headersSent) {
      console.error('[userArticles] Response already sent, cannot send error response');
      return;
    }
    
    res.status(500).json({ 
      error: 'Failed to submit article',
      details: error.message || error.toString() || 'Unknown error',
      code: error.code || 'UNKNOWN_ERROR',
      errorType: error.constructor?.name || 'Error',
      hint: error.hint || error.detail || 'Check backend console for full error details'
    });
  }
});

// Delete user's own draft or rejected article
router.delete('/:id', requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const articleId = req.params.id; // UUID, not integer

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
