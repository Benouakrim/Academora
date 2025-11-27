-- Migration: Fix name column inconsistencies and ensure Clerk-Neon sync compatibility
-- This migration:
-- 1. Ensures first_name/last_name exist (standard)
-- 2. Migrates data from given_name/family_name if they exist
-- 3. Drops given_name/family_name columns (redundant)
-- 4. Ensures all required columns for Clerk sync exist

-- Step 1: Ensure first_name and last_name columns exist
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- Step 2: Migrate data from given_name/family_name to first_name/last_name if needed
-- (Only if given_name/family_name exist and first_name/last_name are null)
DO $$
BEGIN
  -- Check if given_name column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'given_name'
  ) THEN
    UPDATE public.users
    SET first_name = COALESCE(first_name, given_name)
    WHERE given_name IS NOT NULL AND first_name IS NULL;
    
    UPDATE public.users
    SET last_name = COALESCE(last_name, family_name)
    WHERE family_name IS NOT NULL AND last_name IS NULL;
  END IF;
END $$;

-- Step 3: Ensure all required columns for Clerk sync exist
ALTER TABLE public.users
  -- Core identity
  ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
  
  -- Profile fields
  ADD COLUMN IF NOT EXISTS full_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS title VARCHAR(100),
  ADD COLUMN IF NOT EXISTS headline VARCHAR(255),
  ADD COLUMN IF NOT EXISTS location VARCHAR(200),
  ADD COLUMN IF NOT EXISTS website_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS github_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS portfolio_url VARCHAR(500),
  
  -- Onboarding & preferences
  ADD COLUMN IF NOT EXISTS persona_role VARCHAR(100),
  ADD COLUMN IF NOT EXISTS focus_area TEXT,
  ADD COLUMN IF NOT EXISTS primary_goal TEXT,
  ADD COLUMN IF NOT EXISTS timeline VARCHAR(100),
  ADD COLUMN IF NOT EXISTS organization_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS organization_type VARCHAR(100),
  ADD COLUMN IF NOT EXISTS is_profile_public BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS show_saved BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS show_reviews BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_socials BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_activity BOOLEAN DEFAULT TRUE,
  
  -- Account & status
  ADD COLUMN IF NOT EXISTS account_type TEXT,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));

-- Step 4: Make email nullable (for phone-only accounts)
ALTER TABLE public.users
  ALTER COLUMN email DROP NOT NULL;

-- Step 5: Drop redundant given_name and family_name columns if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'given_name'
  ) THEN
    ALTER TABLE public.users DROP COLUMN IF EXISTS given_name;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'family_name'
  ) THEN
    ALTER TABLE public.users DROP COLUMN IF EXISTS family_name;
  END IF;
END $$;

-- Step 6: Ensure indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON public.users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_organization_name ON public.users(organization_name) WHERE organization_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_persona_role ON public.users(persona_role) WHERE persona_role IS NOT NULL;

-- Step 7: Add comments for documentation
COMMENT ON COLUMN public.users.first_name IS 'First name (standardized from given_name)';
COMMENT ON COLUMN public.users.last_name IS 'Last name (standardized from family_name)';
COMMENT ON COLUMN public.users.clerk_id IS 'Clerk user ID for authentication sync';
COMMENT ON COLUMN public.users.email IS 'Primary email (nullable for phone-only accounts)';

