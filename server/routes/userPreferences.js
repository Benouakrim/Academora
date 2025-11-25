import express from 'express';
import pool from '../database/pool.js';
import { parseUserToken, requireUser } from '../middleware/auth.js';

const router = express.Router();

router.use(parseUserToken);
router.use(requireUser);

// Get current user's preferences
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    const result = await pool.query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [userId]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error('Get preferences error:', err);
    res.status(500).json({ error: err.message || 'Failed to get preferences' });
  }
});

// Upsert user preferences
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    const prefs = {
      user_id: userId,
      weight_tuition: req.body?.weight_tuition ?? 0.5,
      weight_location: req.body?.weight_location ?? 0.5,
      weight_ranking: req.body?.weight_ranking ?? 0.5,
      weight_program: req.body?.weight_program ?? 0.5,
      weight_language: req.body?.weight_language ?? 0.5,
    };

    const result = await pool.query(
      `INSERT INTO user_preferences (user_id, weight_tuition, weight_location, weight_ranking, weight_program, weight_language)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id)
       DO UPDATE SET weight_tuition = $2, weight_location = $3, weight_ranking = $4, weight_program = $5, weight_language = $6, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, prefs.weight_tuition, prefs.weight_location, prefs.weight_ranking, prefs.weight_program, prefs.weight_language]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Upsert preferences error:', err);
    res.status(500).json({ error: err.message || 'Failed to save preferences' });
  }
});

export default router;


