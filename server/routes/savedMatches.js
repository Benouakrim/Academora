import express from 'express';
import pool from '../database/pool.js';
import { parseUserToken, requireUser } from '../middleware/auth.js';

const router = express.Router();

router.use(parseUserToken);
router.use(requireUser);

// List saved matches for current user
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    const result = await pool.query(
      'SELECT id, university_id, note, created_at FROM saved_matches WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows || []);
  } catch (err) {
    console.error('List saved matches error:', err);
    res.status(500).json({ error: err.message || 'Failed to list saved matches' });
  }
});

// Check if a university is saved
router.get('/check/:universityId', async (req, res) => {
  try {
    const userId = req.user?.id;
    const universityId = req.params.universityId;
    const result = await pool.query(
      'SELECT id FROM saved_matches WHERE user_id = $1 AND university_id = $2',
      [userId, universityId]
    );
    const data = result.rows[0] || null;
    res.json({ saved: !!data, id: data?.id || null });
  } catch (err) {
    console.error('Check saved match error:', err);
    res.status(500).json({ error: err.message || 'Failed to check saved match' });
  }
});

// Save a university
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { university_id, note } = req.body || {};
    if (!university_id) return res.status(400).json({ error: 'university_id is required' });

    const result = await pool.query(
      `INSERT INTO saved_matches (user_id, university_id, note)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, university_id)
       DO UPDATE SET note = $3, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, university_id, note || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Save match error:', err);
    res.status(500).json({ error: err.message || 'Failed to save match' });
  }
});

// Unsave a university
router.delete('/:universityId', async (req, res) => {
  try {
    const userId = req.user?.id;
    const universityId = req.params.universityId;
    await pool.query(
      'DELETE FROM saved_matches WHERE user_id = $1 AND university_id = $2',
      [userId, universityId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Unsave match error:', err);
    res.status(500).json({ error: err.message || 'Failed to unsave match' });
  }
});

export default router;


