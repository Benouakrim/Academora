-- Verification Script for Referral System RLS Policies
-- Run this in Supabase SQL Editor to verify the fix was applied correctly

-- 1. Check if RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ Enabled'
    ELSE '❌ Disabled'
  END as rls_status
FROM pg_tables
WHERE tablename IN ('referral_codes', 'referrals', 'referral_rewards', 'referral_settings')
  AND schemaname = 'public'
ORDER BY tablename;

-- 2. Count policies per table (should be 4, 5, 4, 2 respectively)
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('referral_codes', 'referrals', 'referral_rewards', 'referral_settings')
GROUP BY tablename
ORDER BY tablename;

-- 3. List all policies with details
SELECT 
  tablename,
  policyname,
  cmd as operation,
  CASE 
    WHEN permissive = 'PERMISSIVE' THEN '✅ Permissive'
    ELSE '⚠️ Restrictive'
  END as type
FROM pg_policies 
WHERE tablename IN ('referral_codes', 'referrals', 'referral_rewards', 'referral_settings')
ORDER BY tablename, policyname;

-- 4. Check if referral_settings has default values
SELECT 
  setting_key,
  setting_value,
  updated_at
FROM referral_settings
ORDER BY setting_key;

-- Expected Results:
-- =================
-- RLS Status: All 4 tables should show "✅ Enabled"
-- Policy Count: 
--   - referral_codes: 4 policies
--   - referrals: 5 policies
--   - referral_rewards: 4 policies
--   - referral_settings: 2 policies
-- Settings: Should have at least 'referral_expiry_days' = '365'

-- If any table shows "❌ Disabled" or has 0 policies, re-run:
--   server/database/fix-referrals-rls.sql
