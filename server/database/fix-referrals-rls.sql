-- Fix for "Admin access required" error on Referral Dashboard
-- This script adds proper Row Level Security (RLS) policies for the referral system
-- Run this in your Supabase SQL Editor

-- Drop existing policies if they exist (for re-running)
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

-- Enable Row Level Security (RLS) on all referral tables
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies for referral_codes
-- =====================================================

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

-- =====================================================
-- RLS Policies for referrals
-- =====================================================

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

-- =====================================================
-- RLS Policies for referral_rewards
-- =====================================================

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

-- =====================================================
-- RLS Policies for referral_settings
-- =====================================================

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

-- Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('referral_codes', 'referrals', 'referral_rewards', 'referral_settings')
ORDER BY tablename, policyname;
