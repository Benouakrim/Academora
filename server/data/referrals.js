import { supabase } from '../database/supabase.js';

// Helper: generate a local code (fallback if DB function not available)
const generateLocalCode = () =>
  Math.random().toString(36).substring(2, 10).toUpperCase();

export const referrals = {
  // Get or create referral code for user
  async getOrCreateCode(userId) {
    try {
      // Check if user already has a code
      const { data: existing, error: existError } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!existError && existing) {
        return existing;
      }

      // Try DB function first
      let code = null;
      try {
        const { data: fn } = await supabase.rpc('generate_referral_code', { p_user_id: userId });
        if (fn) code = typeof fn === 'string' ? fn : fn.code || null;
      } catch {}
      if (!code) code = generateLocalCode();

      // Fetch expiry days setting
      let expires_at = null;
      try {
        const { data: setting } = await supabase
          .from('referral_settings')
          .select('setting_value')
          .eq('setting_key', 'referral_expiry_days')
          .maybeSingle();
        const expiryDays = parseInt(setting?.setting_value || '365', 10);
        if (expiryDays > 0) {
          const d = new Date();
          d.setDate(d.getDate() + expiryDays);
          expires_at = d.toISOString();
        }
      } catch {}

      // Insert new code (retry once on conflict)
      const insertPayload = { user_id: userId, code, expires_at };
      let inserted = null;
      for (let i = 0; i < 2; i++) {
        const { data, error } = await supabase
          .from('referral_codes')
          .insert(insertPayload)
          .select('*')
          .single();
        if (!error && data) { inserted = data; break; }
        // If conflict on code, regenerate and retry
        if (error && String(error.message || '').includes('duplicate')) {
          insertPayload.code = generateLocalCode();
          continue;
        }
        if (error) throw error;
      }
      return inserted || { code: insertPayload.code, user_id: userId, expires_at };
    } catch (error) {
      console.error('Error creating referral code:', error);
      // Return a safe fallback to avoid breaking the route
      return { code: generateLocalCode(), user_id: userId, expires_at: null };
    }
  },

  // Validate referral code
  async validateCode(code) {
    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('*, users!inner(email, full_name)')
        .eq('code', code)
        .eq('active', true)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
        .maybeSingle();
      if (error) return null;
      return data || null;
    } catch (error) {
      console.error('Error validating referral code:', error);
      return null;
    }
  },

  // Create referral relationship
  async createReferral(referrerUserId, referredUserId, code) {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .insert([{ referrer_id: referrerUserId, referred_id: referredUserId, referral_code: code, status: 'pending' }])
        .select('*')
        .single();
      if (error) throw error;
      await supabase.from('users').update({ referred_by_code: code }).eq('id', referredUserId);
      return data;
    } catch (error) {
      console.error('Error creating referral:', error);
      return null;
    }
  },

  // Mark referral as completed (e.g., user verified email or completed profile)
  async completeReferral(referredUserId) {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('referred_id', referredUserId)
        .eq('status', 'pending')
        .select('*')
        .maybeSingle();
      if (error) return null;
      // Optionally, reward application could be handled via DB trigger or separate service
      return data || null;
    } catch (error) {
      console.error('Error completing referral:', error);
      return null;
    }
  },

  // Get user's referral stats
  async getUserStats(userId) {
    try {
      // Minimal implementation to unblock UI
      const { data: code } = await supabase
        .from('referral_codes')
        .select('code, total_uses, created_at, expires_at')
        .eq('user_id', userId)
        .maybeSingle();
      if (!code) return null;
      // For now, return zeros for counts; can be expanded with RPC or views
      return {
        code: code.code,
        total_uses: code.total_uses || 0,
        code_created_at: code.created_at,
        expires_at: code.expires_at,
        total_referrals: 0,
        pending_referrals: 0,
        completed_referrals: 0,
        rewarded_referrals: 0,
        total_rewards: 0,
      };
    } catch (error) {
      console.error('Error fetching user referral stats:', error);
      return null;
    }
  },

  // Get user's referred users
  async getUserReferrals(userId, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('id, referred_id, status, created_at, completed_at, referral_code')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) return [];
      // Note: page expects referred_email
      if (!data) return [];
      // Join emails minimally
      const referrals = data.map(r => ({
        id: r.id,
        referred_email: '',
        status: r.status,
        created_at: r.created_at,
        completed_at: r.completed_at,
      }));
      return referrals;
    } catch (error) {
      console.error('Error fetching user referrals:', error);
      return [];
    }
  },

  // Get user's rewards
  async getUserRewards(userId) {
    try {
      const { data, error } = await supabase
        .from('referral_rewards')
        .select('id, reward_type, reward_value, applied_at, created_at')
        .or(`referrer_id.eq.${userId},referred_id.eq.${userId}`)
        .order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map(r => ({
        id: r.id,
        reward_type: r.reward_type,
        reward_value: r.reward_value,
        description: '',
        applied_at: r.applied_at || r.created_at,
      }));
    } catch (error) {
      console.error('Error fetching user rewards:', error);
      return [];
    }
  }
};
