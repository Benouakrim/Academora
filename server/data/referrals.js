import pool from '../database/supabase.js';

export const referrals = {
  // Get or create referral code for user
  async getOrCreateCode(userId) {
    try {
      // Check if user already has a code
      let result = await pool.query(
        'SELECT * FROM referral_codes WHERE user_id = $1',
        [userId]
      );

      if (result.rows.length > 0) {
        return result.rows[0];
      }

      // Generate new code
      const codeResult = await pool.query(
        'SELECT generate_referral_code($1) as code',
        [userId]
      );
      const code = codeResult.rows[0].code;

      // Get expiry days setting
      const expiryResult = await pool.query(
        "SELECT setting_value FROM referral_settings WHERE setting_key = 'referral_expiry_days'"
      );
      const expiryDays = parseInt(expiryResult.rows[0]?.setting_value || '365');
      
      const expiresAt = expiryDays > 0 
        ? `CURRENT_TIMESTAMP + INTERVAL '${expiryDays} days'`
        : 'NULL';

      // Create code
      result = await pool.query(
        `INSERT INTO referral_codes (user_id, code, expires_at)
         VALUES ($1, $2, ${expiresAt})
         RETURNING *`,
        [userId, code]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating referral code:', error);
      throw error;
    }
  },

  // Validate referral code
  async validateCode(code) {
    try {
      const result = await pool.query(
        `SELECT rc.*, u.email, u.name 
         FROM referral_codes rc
         JOIN users u ON rc.user_id = u.id
         WHERE rc.code = $1 
           AND rc.active = true
           AND (rc.expires_at IS NULL OR rc.expires_at > CURRENT_TIMESTAMP)`,
        [code]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error validating referral code:', error);
      throw error;
    }
  },

  // Create referral relationship
  async createReferral(referrerUserId, referredUserId, code) {
    try {
      const result = await pool.query(
        `INSERT INTO referrals (referrer_id, referred_id, referral_code, status)
         VALUES ($1, $2, $3, 'pending')
         RETURNING *`,
        [referrerUserId, referredUserId, code]
      );

      // Update user's referred_by_code
      await pool.query(
        'UPDATE users SET referred_by_code = $1 WHERE id = $2',
        [code, referredUserId]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating referral:', error);
      throw error;
    }
  },

  // Mark referral as completed (e.g., user verified email or completed profile)
  async completeReferral(referredUserId) {
    try {
      const result = await pool.query(
        `UPDATE referrals 
         SET status = 'completed', completed_at = CURRENT_TIMESTAMP
         WHERE referred_id = $1 AND status = 'pending'
         RETURNING *`,
        [referredUserId]
      );

      if (result.rows.length > 0) {
        // Apply rewards
        await pool.query(
          'SELECT apply_referral_reward($1)',
          [result.rows[0].id]
        );
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error completing referral:', error);
      throw error;
    }
  },

  // Get user's referral stats
  async getUserStats(userId) {
    try {
      const result = await pool.query(
        `SELECT 
          rc.code,
          rc.total_uses,
          rc.created_at as code_created_at,
          rc.expires_at,
          COUNT(DISTINCT r.id) as total_referrals,
          COUNT(DISTINCT CASE WHEN r.status = 'pending' THEN r.id END) as pending_referrals,
          COUNT(DISTINCT CASE WHEN r.status = 'completed' THEN r.id END) as completed_referrals,
          COUNT(DISTINCT CASE WHEN r.status = 'rewarded' THEN r.id END) as rewarded_referrals,
          COUNT(DISTINCT rw.id) as total_rewards
        FROM referral_codes rc
        LEFT JOIN referrals r ON r.referrer_id = rc.user_id
        LEFT JOIN referral_rewards rw ON rw.referrer_id = rc.user_id
        WHERE rc.user_id = $1
        GROUP BY rc.id`,
        [userId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching user referral stats:', error);
      throw error;
    }
  },

  // Get user's referred users
  async getUserReferrals(userId, limit = 50, offset = 0) {
    try {
      const result = await pool.query(
        `SELECT 
          r.*,
          u.name as referred_name,
          u.email as referred_email,
          u.created_at as referred_joined_at,
          rw.reward_type,
          rw.reward_value,
          rw.applied as reward_applied
        FROM referrals r
        JOIN users u ON r.referred_id = u.id
        LEFT JOIN referral_rewards rw ON rw.referral_id = r.id AND rw.referrer_id = $1
        WHERE r.referrer_id = $1
        ORDER BY r.created_at DESC
        LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      return result.rows;
    } catch (error) {
      console.error('Error fetching user referrals:', error);
      throw error;
    }
  },

  // Get user's rewards
  async getUserRewards(userId) {
    try {
      const result = await pool.query(
        `SELECT 
          rw.*,
          r.referral_code,
          u_referred.name as referred_user_name,
          u_referred.email as referred_user_email
        FROM referral_rewards rw
        JOIN referrals r ON rw.referral_id = r.id
        JOIN users u_referred ON rw.referred_id = u_referred.id
        WHERE rw.referrer_id = $1 OR rw.referred_id = $1
        ORDER BY rw.created_at DESC`,
        [userId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error fetching user rewards:', error);
      throw error;
    }
  }
};
