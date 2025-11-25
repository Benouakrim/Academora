import express from 'express';
import pool from '../database/pool.js';
import { parseUserToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(parseUserToken);
router.use(requireAdmin);

router.get('/overview', async (req, res) => {
  try {
    const [usersCountRes, unisCountRes, reviewsCountRes, savedCountRes] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM universities'),
      pool.query('SELECT COUNT(*) as count FROM reviews'),
      pool.query('SELECT COUNT(*) as count FROM saved_matches'),
    ]);

    res.json({
      users: parseInt(usersCountRes.rows[0].count) || 0,
      universities: parseInt(unisCountRes.rows[0].count) || 0,
      reviews: parseInt(reviewsCountRes.rows[0].count) || 0,
      saved_matches: parseInt(savedCountRes.rows[0].count) || 0,
    });
  } catch (err) {
    console.error('Analytics overview error:', err);
    res.status(500).json({ error: err.message || 'Failed to get overview' });
  }
});

router.get('/registrations/last7', async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const result = await pool.query(
      'SELECT created_at FROM users WHERE created_at >= $1',
      [since.toISOString()]
    );

    const buckets = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return { date: key, count: 0 };
    });

    result.rows.forEach((row) => {
      const dateKey = new Date(row.created_at).toISOString().slice(0, 10);
      const bucket = buckets.find((b) => b.date === dateKey);
      if (bucket) bucket.count++;
    });

    res.json(buckets);
  } catch (err) {
    console.error('Registrations error:', err);
    res.status(500).json({ error: err.message || 'Failed to get registrations' });
  }
});

export default router;
