import express from 'express';
import { authenticateToken, requireAdmin } from './auth.js';
import { listUsers } from '../data/users.js';
import {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../data/articles.js';

const router = express.Router();

// All admin routes require authentication AND admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get all articles (including unpublished)
router.get('/articles', async (req, res) => {
  try {
    const articles = await getAllArticles();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (admin view)
router.get('/users', async (req, res) => {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get article by ID
router.get('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const article = await getArticleById(id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new article
router.post('/articles', async (req, res) => {
  try {
    const {
      title,
      slug,
      content,
      excerpt,
      category,
      published = false,
      featured_image,
    } = req.body;

    if (!title || !slug || !content || !excerpt || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const article = await createArticle({
      title,
      slug,
      content,
      excerpt,
      category,
      published,
      featured_image,
      author_id: req.user.userId,
    });

    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update article
router.put('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      content,
      excerpt,
      category,
      published,
      featured_image,
    } = req.body;

    const article = await updateArticle(id, {
      title,
      slug,
      content,
      excerpt,
      category,
      published,
      featured_image,
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete article
router.delete('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteArticle(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

