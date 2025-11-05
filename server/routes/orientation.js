import express from 'express';
import {
  getResources,
  getResourcesByCategory,
  getResourceBySlug,
} from '../data/orientation.js';

const router = express.Router();

// Get all resources
router.get('/', async (req, res) => {
  try {
    const resources = await getResources();
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get resources by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const resources = await getResourcesByCategory(category);
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get resource by slug and category
router.get('/:category/:slug', async (req, res) => {
  try {
    const { category, slug } = req.params;
    const resource = await getResourceBySlug(category, slug);

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

