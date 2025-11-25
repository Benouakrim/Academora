import express from 'express';
import { getAllCategories } from '../data/categories.js';
import { listTerms } from '../data/taxonomies.js';

const router = express.Router();

// Public route: Get categories (optionally filtered by type)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const categories = await getAllCategories(type || null);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public route: Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const { getCategoryById } = await import('../data/categories.js');
    const { id } = req.params;
    const category = await getCategoryById(id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
