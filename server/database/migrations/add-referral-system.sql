-- Create referral system tables

-- Referral codes table
CREATE TABLE IF NOT EXISTS referral_codes (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(20) UNIQUE NOT NULL,
  total_uses INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id)
);

-- Referrals table (tracks who referred whom)
CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  completed_at TIMESTAMP WITH TIME ZONE,
  reward_given BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(referred_id)
);

-- Referral rewards table
CREATE TABLE IF NOT EXISTS referral_rewards (
  id SERIAL PRIMARY KEY,
  referral_id INTEGER NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_type VARCHAR(50) NOT NULL, -- 'plan_upgrade', 'credits', 'feature_unlock', 'discount'
  reward_value TEXT NOT NULL, -- JSON or value description
  applied BOOLEAN DEFAULT FALSE,
  applied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Referral settings table (admin configurable)
CREATE TABLE IF NOT EXISTS referral_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default referral settings
INSERT INTO referral_settings (setting_key, setting_value, description)
VALUES 
  ('referral_enabled', 'true', 'Enable/disable the referral system'),
  ('reward_referrer', 'true', 'Give rewards to referrer'),
  ('reward_referred', 'true', 'Give rewards to referred user'),
  ('referrer_reward_type', 'plan_upgrade', 'Type of reward for referrer: plan_upgrade, credits, feature_unlock, discount'),
  ('referrer_reward_value', '30', 'Value for referrer reward (days for plan_upgrade, amount for credits/discount)'),
  ('referred_reward_type', 'plan_upgrade', 'Type of reward for referred user'),
  ('referred_reward_value', '7', 'Value for referred user reward'),
  ('minimum_referrals_for_reward', '1', 'Minimum successful referrals before giving rewards'),
  ('referral_expiry_days', '365', 'Days before referral code expires (0 = never)')
ON CONFLICT (setting_key) DO NOTHING;

-- Add referral code to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by_code VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer_id ON referral_rewards(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referred_id ON referral_rewards(referred_id);

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code(p_user_id UUID)
RETURNS VARCHAR(20) AS $$
DECLARE
  v_code VARCHAR(20);
  v_exists BOOLEAN;
  v_username TEXT;
BEGIN
  -- Try to get username from user
  SELECT COALESCE(name, email) INTO v_username FROM users WHERE id = p_user_id;
  
  -- Generate code based on username + random string
  v_username := REGEXP_REPLACE(UPPER(SUBSTRING(v_username, 1, 6)), '[^A-Z0-9]', '', 'g');
  
  LOOP
    v_code := v_username || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    -- Check if code exists
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = v_code) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Function to apply referral rewards
CREATE OR REPLACE FUNCTION apply_referral_reward(p_referral_id INTEGER)
RETURNS VOID AS $$
DECLARE
  v_referrer_id UUID;
  v_referred_id UUID;
  v_referrer_reward_type VARCHAR(50);
  v_referrer_reward_value TEXT;
  v_referred_reward_type VARCHAR(50);
  v_referred_reward_value TEXT;
  v_reward_referrer BOOLEAN;
  v_reward_referred BOOLEAN;
BEGIN
  -- Get referral info
  SELECT referrer_id, referred_id INTO v_referrer_id, v_referred_id
  FROM referrals WHERE id = p_referral_id;
  
  -- Get reward settings
  SELECT setting_value INTO v_reward_referrer FROM referral_settings WHERE setting_key = 'reward_referrer';
  SELECT setting_value INTO v_reward_referred FROM referral_settings WHERE setting_key = 'reward_referred';
  SELECT setting_value INTO v_referrer_reward_type FROM referral_settings WHERE setting_key = 'referrer_reward_type';
  SELECT setting_value INTO v_referrer_reward_value FROM referral_settings WHERE setting_key = 'referrer_reward_value';
  SELECT setting_value INTO v_referred_reward_type FROM referral_settings WHERE setting_key = 'referred_reward_type';
  SELECT setting_value INTO v_referred_reward_value FROM referral_settings WHERE setting_key = 'referred_reward_value';
  
  -- Create reward for referrer
  IF v_reward_referrer = 'true' THEN
    INSERT INTO referral_rewards (referral_id, referrer_id, referred_id, reward_type, reward_value)
    VALUES (p_referral_id, v_referrer_id, v_referred_id, v_referrer_reward_type, v_referrer_reward_value);
  END IF;
  
  -- Create reward for referred user
  IF v_reward_referred = 'true' THEN
    INSERT INTO referral_rewards (referral_id, referrer_id, referred_id, reward_type, reward_value)
    VALUES (p_referral_id, v_referrer_id, v_referred_id, v_referred_reward_type, v_referred_reward_value);
  END IF;
  
  -- Mark referral as rewarded
  UPDATE referrals SET reward_given = TRUE, status = 'rewarded' WHERE id = p_referral_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment referral count
CREATE OR REPLACE FUNCTION increment_referral_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users SET referral_count = referral_count + 1 WHERE id = NEW.referrer_id;
  UPDATE referral_codes SET total_uses = total_uses + 1 WHERE user_id = NEW.referrer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_referral_count ON referrals;
CREATE TRIGGER trigger_increment_referral_count
  AFTER INSERT ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION increment_referral_count();

COMMENT ON TABLE referral_codes IS 'Unique referral codes for each user';
COMMENT ON TABLE referrals IS 'Tracks who referred whom and referral status';
COMMENT ON TABLE referral_rewards IS 'Rewards given to users through referrals';
COMMENT ON TABLE referral_settings IS 'Admin-configurable referral system settings';
