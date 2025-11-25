import express from 'express';
import pool from '../database/pool.js';
import { parseUserToken, requireUser } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { upsertReviewSchema } from '../validation/reviewsSchemas.js';

const router = express.Router();

router.use(parseUserToken);

// List reviews for a university
router.get('/university/:id', async (req, res) => {
  try {
    const universityId = req.params.id;
    const result = await pool.query(
      `SELECT id, user_id, university_id, rating, comment, created_at 
       FROM reviews 
       WHERE university_id = $1 
       ORDER BY created_at DESC`,
      [universityId]
    );
    res.json(result.rows || []);
  } catch (err) {
    console.error('List reviews error:', err);
    res.status(500).json({ error: err.message || 'Failed to list reviews' });
  }
});

// Create or update a user's review for a university
router.post('/university/:id', requireUser, validate(upsertReviewSchema), async (req, res) => {
  try {
    const userId = req.user?.id;
    const universityId = req.params.id;
    const { rating, comment } = req.validated;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'rating must be 1-5' });

    // Upsert by (user_id, university_id)
    const result = await pool.query(
      `INSERT INTO reviews (user_id, university_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, university_id)
       DO UPDATE SET rating = $3, comment = $4, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, universityId, rating, comment]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Upsert review error:', err);
    res.status(500).json({ error: err.message || 'Failed to save review' });
  }
});

// Delete current user's review
router.delete('/university/:id', requireUser, async (req, res) => {
  try {
    const userId = req.user?.id;
    const universityId = req.params.id;
    await pool.query(
      'DELETE FROM reviews WHERE user_id = $1 AND university_id = $2',
      [userId, universityId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ error: err.message || 'Failed to delete review' });
  }
});

export default router;


