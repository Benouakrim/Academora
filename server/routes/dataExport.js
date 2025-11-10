import express from 'express';
import { parseUserToken, requireUser } from '../middleware/auth.js';
import { supabase } from '../database/supabase.js';

const router = express.Router();

router.use(parseUserToken);
router.use(requireUser);

// Export user data (GDPR compliance)
router.get('/export', async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Fetch related data
    const [
      { data: savedItems },
      { data: savedMatches },
      { data: reviews },
      { data: notifications },
      { data: financialProfile },
      { data: onboarding },
    ] = await Promise.all([
      supabase.from('saved_items').select('*').eq('user_id', userId),
      supabase.from('saved_matches').select('*').eq('user_id', userId),
      supabase.from('reviews').select('*').eq('user_id', userId),
      supabase.from('notifications').select('*').eq('user_id', userId),
      supabase.from('user_financial_profiles').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('user_onboarding_data').select('*').eq('user_id', userId).maybeSingle(),
    ]);

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
