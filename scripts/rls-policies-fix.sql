-- Supabase RLS policy fixes for common 403s
-- Run in Supabase SQL Editor (Project > SQL)

-- Ensure RLS is enabled on involved tables (no-op if already enabled)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taxonomy_terms ENABLE ROW LEVEL SECURITY;

-- Articles: allow users to read, insert, and update their own rows
-- Note: These policy names must be unique per table

-- Allow users to SELECT their own articles
CREATE POLICY "Allow users to select their own articles"
ON public.articles
FOR SELECT
USING ( auth.uid() = author_id );

-- Allow users to INSERT new articles as themselves
CREATE POLICY "Allow users to insert their own articles"
ON public.articles
FOR INSERT
WITH CHECK ( auth.uid() = author_id );

-- Allow users to UPDATE their own articles
CREATE POLICY "Allow users to update their own articles"
ON public.articles
FOR UPDATE
USING ( auth.uid() = author_id )
WITH CHECK ( auth.uid() = author_id );

-- Public read: categories and taxonomy terms

-- Allow all users (logged in or not) to read categories
CREATE POLICY "Allow public read access to categories"
ON public.categories
FOR SELECT
USING ( true );

-- Allow all users (logged in or not) to read taxonomy terms
CREATE POLICY "Allow public read access to taxonomy terms"
ON public.taxonomy_terms
FOR SELECT
USING ( true );

-- Optional: if you need public read of published articles for the blog,
-- add a policy like this (uncomment to use):
-- CREATE POLICY "Public can read published articles"
-- ON public.articles
-- FOR SELECT
-- USING ( published = true );
