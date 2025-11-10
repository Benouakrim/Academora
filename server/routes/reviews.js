import express from 'express';
import supabase from '../database/supabase.js';
import { parseUserToken, requireUser } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { upsertReviewSchema } from '../validation/reviewsSchemas.js';

const router = express.Router();

router.use(parseUserToken);

// List reviews for a university
router.get('/university/:id', async (req, res) => {
  try {
    const universityId = req.params.id;
    const { data, error } = await supabase
      .from('reviews')
      .select('id, user_id, university_id, rating, comment, created_at')
      .eq('university_id', universityId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
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
    const { data, error } = await supabase
      .from('reviews')
      .upsert({ user_id: userId, university_id: universityId, rating, comment }, { onConflict: 'user_id,university_id' })
      .select('*')
      .single();
    if (error) throw error;
    res.json(data);
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
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('user_id', userId)
      .eq('university_id', universityId);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ error: err.message || 'Failed to delete review' });
  }
});

export default router;


