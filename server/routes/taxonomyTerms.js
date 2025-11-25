import express from 'express';
import { listTerms } from '../data/taxonomies.js';

const router = express.Router();

// Public route: List taxonomy terms (optionally filtered by taxonomy key)
router.get('/', async (req, res) => {
  try {
    const { taxonomy } = req.query;
    const rows = await listTerms(taxonomy || null);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
