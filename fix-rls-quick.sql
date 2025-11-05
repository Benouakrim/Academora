-- Quick fix: Disable RLS to allow anon key access
-- Run this in Supabase SQL Editor

ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE orientation_resources DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'articles', 'orientation_resources');

