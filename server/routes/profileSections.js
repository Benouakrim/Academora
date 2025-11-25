import express from 'express';
import pool from '../database/pool.js';
import { parseUserToken, requireUser } from '../middleware/auth.js';

const router = express.Router();
router.use(parseUserToken);
router.use(requireUser);

function tableFor(kind){
  if (kind === 'experiences') return 'experiences';
  if (kind === 'education') return 'education_entries';
  if (kind === 'projects') return 'projects';
  if (kind === 'certifications') return 'certifications';
  return null;
}

// List
router.get('/:kind', async (req, res) => {
  const table = tableFor(req.params.kind);
  if (!table) return res.status(400).json({ error: 'Invalid kind' });
  try {
    const userId = req.user?.id;

    const result = await pool.query(
      `SELECT * FROM ${table} WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    res.json(result.rows || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create
router.post('/:kind', async (req, res) => {
  const table = tableFor(req.params.kind);
  if (!table) return res.status(400).json({ error: 'Invalid kind' });
  try {
    const userId = req.user?.id;

    const payload = { ...req.body, user_id: userId };
    const columns = Object.keys(payload).join(', ');
    const values = Object.values(payload);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

    const result = await pool.query(
      `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
router.put('/:kind/:id', async (req, res) => {
  const table = tableFor(req.params.kind);
  if (!table) return res.status(400).json({ error: 'Invalid kind' });
  try {
    const userId = req.user?.id;

    const updates = req.body;
    const setClause = Object.keys(updates).map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = [req.params.id, ...Object.values(updates)];

    const result = await pool.query(
      `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $${values.length + 1} RETURNING *`,
      [...values, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete('/:kind/:id', async (req, res) => {
  const table = tableFor(req.params.kind);
  if (!table) return res.status(400).json({ error: 'Invalid kind' });
  try {
    const userId = req.user?.id;

    await pool.query(
      `DELETE FROM ${table} WHERE id = $1 AND user_id = $2`,
      [req.params.id, userId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
