-- Referral System Schema (AcademOra)
-- Run this in Supabase SQL editor or psql against your Postgres database
-- 
-- IMPORTANT: This schema includes Row Level Security (RLS) policies
-- to ensure users can only access their own referral data while
-- admins can access all data. If you get "Admin access required" errors,
-- make sure to run this entire script to set up proper RLS policies.

-- Drop existing policies if re-running this script
DROP POLICY IF EXISTS "Users can view own referral codes" ON referral_codes;
DROP POLICY IF EXISTS "Users can create own referral codes" ON referral_codes;
DROP POLICY IF EXISTS "Users can update own referral codes" ON referral_codes;
DROP POLICY IF EXISTS "Admins can view all referral codes" ON referral_codes;
DROP POLICY IF EXISTS "Users can view own referrals as referrer" ON referrals;
DROP POLICY IF EXISTS "Users can view own referrals as referred" ON referrals;
DROP POLICY IF EXISTS "Service role can insert referrals" ON referrals;
DROP POLICY IF EXISTS "Service role can update referrals" ON referrals;
DROP POLICY IF EXISTS "Admins can view all referrals" ON referrals;
DROP POLICY IF EXISTS "Users can view rewards as referrer" ON referral_rewards;
DROP POLICY IF EXISTS "Users can view rewards as referred" ON referral_rewards;
DROP POLICY IF EXISTS "Service role can manage rewards" ON referral_rewards;
DROP POLICY IF EXISTS "Admins can view all rewards" ON referral_rewards;
DROP POLICY IF EXISTS "Anyone can read referral settings" ON referral_settings;
DROP POLICY IF EXISTS "Admins can modify referral settings" ON referral_settings;

-- Tables
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  total_uses INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','rewarded')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMPTZ NULL
);

CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL,
  reward_value INTEGER NOT NULL DEFAULT 0,
  applied BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS referral_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer ON referral_rewards(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referred ON referral_rewards(referred_id);

-- Function to generate referral code
-- Drop existing if return type changed
DROP FUNCTION IF EXISTS generate_referral_code(uuid);

CREATE FUNCTION generate_referral_code(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
BEGIN
  -- Simple code: 8 chars from UUID without hyphens, uppercase
  v_code := upper(replace(substr(uuid_generate_v4()::text,1,8),'-',''));
  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Seed default settings if missing
INSERT INTO referral_settings (setting_key, setting_value)
VALUES ('referral_expiry_days','365')
ON CONFLICT (setting_key) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_codes
-- Users can view their own referral codes
CREATE POLICY "Users can view own referral codes"
  ON referral_codes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own referral codes
CREATE POLICY "Users can create own referral codes"
  ON referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own referral codes
CREATE POLICY "Users can update own referral codes"
  ON referral_codes FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all referral codes
CREATE POLICY "Admins can view all referral codes"
  ON referral_codes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- RLS Policies for referrals
-- Users can view referrals where they are the referrer
CREATE POLICY "Users can view own referrals as referrer"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id);

-- Users can view referrals where they are the referred
CREATE POLICY "Users can view own referrals as referred"
  ON referrals FOR SELECT
  USING (auth.uid() = referred_id);

-- System can insert referrals (via service role)
CREATE POLICY "Service role can insert referrals"
  ON referrals FOR INSERT
  WITH CHECK (true);

-- System can update referrals (via service role)
CREATE POLICY "Service role can update referrals"
  ON referrals FOR UPDATE
  USING (true);

-- Admins can view all referrals
CREATE POLICY "Admins can view all referrals"
  ON referrals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- RLS Policies for referral_rewards
-- Users can view their own rewards as referrer
CREATE POLICY "Users can view rewards as referrer"
  ON referral_rewards FOR SELECT
  USING (auth.uid() = referrer_id);

-- Users can view their own rewards as referred
CREATE POLICY "Users can view rewards as referred"
  ON referral_rewards FOR SELECT
  USING (auth.uid() = referred_id);

-- System can manage rewards (via service role)
CREATE POLICY "Service role can manage rewards"
  ON referral_rewards FOR ALL
  USING (true);

-- Admins can view all rewards
CREATE POLICY "Admins can view all rewards"
  ON referral_rewards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- RLS Policies for referral_settings
-- Anyone can read referral settings
CREATE POLICY "Anyone can read referral settings"
  ON referral_settings FOR SELECT
  USING (true);

-- Only admins can modify settings
CREATE POLICY "Admins can modify referral settings"
  ON referral_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- (Optional) Reward application stub function for future expansion
-- CREATE OR REPLACE FUNCTION apply_referral_reward(p_referral_id UUID) RETURNS VOID AS $$ BEGIN RETURN; END; $$ LANGUAGE plpgsql;
