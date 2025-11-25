import express from 'express';
import pool from '../database/pool.js';
import { parseUserToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all referrals with pagination and filtering
router.get('/all', parseUserToken, requireAdmin, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0, search } = req.query;

    let query = `
      SELECT 
        r.*,
        u_referrer.name as referrer_name,
        u_referrer.email as referrer_email,
        u_referred.name as referred_name,
        u_referred.email as referred_email,
        rw.reward_type,
        rw.reward_value,
        rw.applied as reward_applied
      FROM referrals r
      JOIN users u_referrer ON r.referrer_id = u_referrer.id
      JOIN users u_referred ON r.referred_id = u_referred.id
      LEFT JOIN referral_rewards rw ON rw.referral_id = r.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND r.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (search) {
      query += ` AND (u_referrer.name ILIKE $${paramCount} OR u_referrer.email ILIKE $${paramCount} OR u_referred.name ILIKE $${paramCount} OR u_referred.email ILIKE $${paramCount} OR r.referral_code ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY r.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM referrals r WHERE 1=1';
    const countParams = [];
    let countParamCount = 1;

    if (status) {
      countQuery += ` AND r.status = $${countParamCount}`;
      countParams.push(status);
      countParamCount++;
    }

    if (search) {
      countQuery += ` AND EXISTS (
        SELECT 1 FROM users u_referrer WHERE u_referrer.id = r.referrer_id AND (u_referrer.name ILIKE $${countParamCount} OR u_referrer.email ILIKE $${countParamCount})
        UNION
        SELECT 1 FROM users u_referred WHERE u_referred.id = r.referred_id AND (u_referred.name ILIKE $${countParamCount} OR u_referred.email ILIKE $${countParamCount})
      ) OR r.referral_code ILIKE $${countParamCount}`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      referrals: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

// Get referral statistics
router.get('/stats', parseUserToken, requireAdmin, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        COUNT(*)::integer as total_referrals,
        COUNT(*) FILTER (WHERE status = 'pending')::integer as pending_count,
        COUNT(*) FILTER (WHERE status = 'completed')::integer as completed_count,
        COUNT(*) FILTER (WHERE status = 'rewarded')::integer as rewarded_count,
        COUNT(DISTINCT referrer_id)::integer as active_referrers,
        COUNT(DISTINCT referred_id)::integer as total_referred_users,
        AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 86400)::numeric(10,2) as avg_days_to_complete
      FROM referrals
    `);

    const topReferrers = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.referral_count,
        COUNT(r.id)::integer as total_referrals,
        COUNT(r.id) FILTER (WHERE r.status = 'rewarded')::integer as rewarded_referrals
      FROM users u
      LEFT JOIN referrals r ON r.referrer_id = u.id
      WHERE u.referral_count > 0
      GROUP BY u.id, u.name, u.email, u.referral_count
      ORDER BY u.referral_count DESC
      LIMIT 10
    `);

    const rewardStats = await pool.query(`
      SELECT
        reward_type,
        COUNT(*)::integer as count,
        COUNT(*) FILTER (WHERE applied = true)::integer as applied_count
      FROM referral_rewards
      GROUP BY reward_type
    `);

    res.json({
      overview: stats.rows[0],
      topReferrers: topReferrers.rows,
      rewardStats: rewardStats.rows
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get all referral codes
router.get('/codes', parseUserToken, requireAdmin, async (req, res) => {
  try {
    const { active, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        rc.*,
        u.name as user_name,
        u.email as user_email,
        u.referral_count
      FROM referral_codes rc
      JOIN users u ON rc.user_id = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (active !== undefined) {
      query += ` AND rc.active = $${paramCount}`;
      params.push(active === 'true');
      paramCount++;
    }

    query += ` ORDER BY rc.total_uses DESC, rc.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    res.json({ codes: result.rows });
  } catch (error) {
    console.error('Error fetching referral codes:', error);
    res.status(500).json({ error: 'Failed to fetch referral codes' });
  }
});

// Update referral code status
router.put('/codes/:code/status', parseUserToken, requireAdmin, async (req, res) => {
  try {
    const { code } = req.params;
    const { active } = req.body;

    const result = await pool.query(
      'UPDATE referral_codes SET active = $1 WHERE code = $2 RETURNING *',
      [active, code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Referral code not found' });
    }

    res.json({ code: result.rows[0], message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating referral code:', error);
    res.status(500).json({ error: 'Failed to update referral code' });
  }
});

// Get referral settings
router.get('/settings', parseUserToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM referral_settings ORDER BY setting_key'
    );

    res.json({ settings: result.rows });
  } catch (error) {
    console.error('Error fetching referral settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update referral settings
router.put('/settings', parseUserToken, requireAdmin, async (req, res) => {
  try {
    const settings = req.body; // { setting_key: value, ... }

    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        `INSERT INTO referral_settings (setting_key, setting_value, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (setting_key) 
         DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP`,
        [key, value]
      );
    }

    const result = await pool.query(
      'SELECT * FROM referral_settings ORDER BY setting_key'
    );

    res.json({ 
      settings: result.rows,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating referral settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Manually apply reward
router.post('/rewards/:id/apply', parseUserToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE referral_rewards 
       SET applied = true, applied_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    res.json({ 
      reward: result.rows[0],
      message: 'Reward applied successfully'
    });
  } catch (error) {
    console.error('Error applying reward:', error);
    res.status(500).json({ error: 'Failed to apply reward' });
  }
});

// Get specific user's referral details
router.get('/user/:userId', parseUserToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const code = await pool.query(
      'SELECT * FROM referral_codes WHERE user_id = $1',
      [userId]
    );

    const referrals = await pool.query(
      `SELECT 
        r.*,
        u.name as referred_name,
        u.email as referred_email
      FROM referrals r
      JOIN users u ON r.referred_id = u.id
      WHERE r.referrer_id = $1
      ORDER BY r.created_at DESC`,
      [userId]
    );

    const rewards = await pool.query(
      `SELECT * FROM referral_rewards 
       WHERE referrer_id = $1 OR referred_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      code: code.rows[0] || null,
      referrals: referrals.rows,
      rewards: rewards.rows
    });
  } catch (error) {
    console.error('Error fetching user referral details:', error);
    res.status(500).json({ error: 'Failed to fetch user referral details' });
  }
});

export default router;
