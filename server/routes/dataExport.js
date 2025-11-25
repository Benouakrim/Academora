import express from 'express';
import { parseUserToken, requireUser } from '../middleware/auth.js';
import pool from '../database/pool.js';

const router = express.Router();

router.use(parseUserToken);
router.use(requireUser);

// Export user data (GDPR compliance)
router.get('/export', async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user profile
    const profileResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const profile = profileResult.rows[0];

    // Fetch related data
    const [
      savedItemsResult,
      savedMatchesResult,
      reviewsResult,
      notificationsResult,
      financialProfileResult,
      onboardingResult,
    ] = await Promise.all([
      pool.query('SELECT * FROM saved_items WHERE user_id = $1', [userId]),
      pool.query('SELECT * FROM saved_matches WHERE user_id = $1', [userId]),
      pool.query('SELECT * FROM reviews WHERE user_id = $1', [userId]),
      pool.query('SELECT * FROM notifications WHERE user_id = $1', [userId]),
      pool.query('SELECT * FROM user_financial_profiles WHERE user_id = $1', [userId]),
      pool.query('SELECT * FROM user_onboarding_data WHERE user_id = $1', [userId]),
    ]);

    const savedItems = savedItemsResult.rows;
    const savedMatches = savedMatchesResult.rows;
    const reviews = reviewsResult.rows;
    const notifications = notificationsResult.rows;
    const financialProfile = financialProfileResult.rows[0] || null;
    const onboarding = onboardingResult.rows[0] || null;

    // Compile export
    const exportData = {
      profile: { ...profile, password: '[REDACTED]' },
      savedItems: savedItems || [],
      savedMatches: savedMatches || [],
      reviews: reviews || [],
      notifications: notifications || [],
      financialProfile: financialProfile || null,
      onboarding: onboarding || null,
      exportedAt: new Date().toISOString(),
    };

    res.setHeader('Content-Disposition', `attachment; filename="academora-data-${userId}.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.json(exportData);
  } catch (error) {
    console.error('Data export error:', error);
    res.status(500).json({ error: 'Failed to export user data' });
  }
});

export default router;
