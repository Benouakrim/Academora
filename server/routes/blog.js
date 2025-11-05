import express from 'express';
import { getArticles, getArticleBySlug } from '../data/articles.js';

const router = express.Router();

// Get all published articles
router.get('/', async (req, res) => {
  try {
    const articles = await getArticles();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get article by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await getArticleBySlug(slug);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

