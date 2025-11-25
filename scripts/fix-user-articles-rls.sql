-- Fix RLS policies for user articles functionality
-- This script ensures that the backend can access articles table
-- Since the backend uses direct PostgreSQL connection (not Supabase client with auth context),
-- we need to either disable RLS or allow service role access

-- Option 1: Disable RLS on articles table (recommended for backend-handled auth)
-- The backend handles authorization through middleware, so RLS is redundant
ALTER TABLE public.articles DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled, create policies for service role
-- Uncomment the following if you prefer to keep RLS enabled:

/*
-- Drop existing policies that use auth.uid() (they won't work with direct connection)
DROP POLICY IF EXISTS "Allow users to select their own articles" ON public.articles;
DROP POLICY IF EXISTS "Allow users to insert their own articles" ON public.articles;
DROP POLICY IF EXISTS "Allow users to update their own articles" ON public.articles;

-- Allow service role (postgres user) to access all articles
-- This allows the backend to perform queries on behalf of authenticated users
CREATE POLICY "Service role can access all articles"
ON public.articles
FOR ALL
USING ( true )
WITH CHECK ( true );
*/

-- Ensure categories and taxonomy_terms are accessible (for article editor)
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxonomy_terms DISABLE ROW LEVEL SECURITY;

-- If RLS is enabled on these tables, create public read policies:
/*
CREATE POLICY IF NOT EXISTS "Public can read categories"
ON public.categories
FOR SELECT
USING ( true );

CREATE POLICY IF NOT EXISTS "Public can read taxonomy terms"
ON public.taxonomy_terms
FOR SELECT
USING ( true );
*/

