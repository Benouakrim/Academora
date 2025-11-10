import express from 'express';
import { parseUserToken, requireUser } from '../middleware/auth.js';
import { referrals } from '../data/referrals.js';

const router = express.Router();

// Get user's referral code and stats
router.get('/my-code', parseUserToken, requireUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get or create referral code
    const code = await referrals.getOrCreateCode(userId);
    
    // Get stats
    const stats = await referrals.getUserStats(userId);

    res.json({ 
      code: code.code,
      stats: stats || {
        total_referrals: 0,
        pending_referrals: 0,
        completed_referrals: 0,
        rewarded_referrals: 0,
        total_rewards: 0
      }
    });
  } catch (error) {
    console.error('Error fetching referral code:', error);
    res.status(500).json({ error: 'Failed to fetch referral code' });
  }
});

// Get user's referred users
router.get('/my-referrals', parseUserToken, requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const referredUsers = await referrals.getUserReferrals(userId, limit, offset);

    res.json({ referrals: referredUsers });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

// Get user's rewards
router.get('/my-rewards', parseUserToken, requireUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const rewards = await referrals.getUserRewards(userId);

    res.json({ rewards });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
});

// Validate a referral code (public endpoint for signup)
router.get('/validate/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const validCode = await referrals.validateCode(code.toUpperCase());

    if (!validCode) {
      return res.status(404).json({ 
        valid: false, 
        error: 'Invalid or expired referral code' 
      });
    }

    res.json({ 
      valid: true,
      referrer: {
        name: validCode.name,
        email: validCode.email
      }
    });
  } catch (error) {
    console.error('Error validating code:', error);
    res.status(500).json({ error: 'Failed to validate code' });
  }
});

export default router;
