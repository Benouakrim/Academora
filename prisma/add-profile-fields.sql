-- Add missing profile fields to users table
-- Run this in Neon SQL Editor or via migration

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS full_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS title VARCHAR(100),
  ADD COLUMN IF NOT EXISTS headline VARCHAR(255),
  ADD COLUMN IF NOT EXISTS location VARCHAR(200),
  ADD COLUMN IF NOT EXISTS website_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS github_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS persona_role VARCHAR(100),
  ADD COLUMN IF NOT EXISTS focus_area TEXT,
  ADD COLUMN IF NOT EXISTS primary_goal TEXT,
  ADD COLUMN IF NOT EXISTS timeline VARCHAR(100),
  ADD COLUMN IF NOT EXISTS organization_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS organization_type VARCHAR(100),
  ADD COLUMN IF NOT EXISTS is_profile_public BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_saved BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_reviews BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_socials BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_activity BOOLEAN DEFAULT true;

-- Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_users_organization_name ON users(organization_name);
CREATE INDEX IF NOT EXISTS idx_users_persona_role ON users(persona_role);
