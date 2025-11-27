import express from 'express';
import { parseUserToken, requireUser, ensureSyncedUser } from '../middleware/auth.js';

const router = express.Router();

// POST /api/users/sync - Ensure DB user exists for current Clerk session
router.post('/', parseUserToken, requireUser, ensureSyncedUser, async (req, res) => {
  try {
    // ensureSyncedUser attaches req.user
    return res.json({ success: true, user: req.user });
  } catch (error) {
    console.error('[UsersSync] error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to synchronize user.' });
  }
});

export default router;
