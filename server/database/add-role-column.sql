-- Add role column to users table for role-based authentication
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor)

-- Add role column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create index for role lookups (improves performance)
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Set existing users to 'user' role (if any exist)
UPDATE users SET role = 'user' WHERE role IS NULL;

-- Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

