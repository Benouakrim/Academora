-- Migration: Add Clerk integration support
-- This migration adds Clerk ID and related fields to users table

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS clerk_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended'));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON public.users(clerk_id);

-- Make password nullable (Clerk users don't have passwords)
ALTER TABLE public.users
  ALTER COLUMN password DROP NOT NULL;

