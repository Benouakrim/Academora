-- Check and fix RLS for articles table
-- Run this in Supabase SQL Editor if you get schema cache errors

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'articles', 'orientation_resources');

-- If RLS is enabled, you can either:
-- Option 1: Disable RLS (for development)
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE orientation_resources DISABLE ROW LEVEL SECURITY;

-- Option 2: Create policies to allow anon access (better for production)
-- Uncomment these if you want to use RLS with anon key:

/*
-- Allow anon users to read published articles
CREATE POLICY "Allow public read access to published articles"
ON articles FOR SELECT
USING (published = true);

-- Allow anon users to read all orientation resources
CREATE POLICY "Allow public read access to orientation resources"
ON orientation_resources FOR SELECT
USING (true);
*/

