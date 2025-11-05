-- Add SEO columns to articles table
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor)

-- Add SEO columns to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS meta_keywords VARCHAR(500);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS og_image VARCHAR(500);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS canonical_url VARCHAR(500);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS focus_keyword VARCHAR(255);

-- Create indexes for SEO fields
CREATE INDEX IF NOT EXISTS idx_articles_meta_title ON articles(meta_title);
CREATE INDEX IF NOT EXISTS idx_articles_focus_keyword ON articles(focus_keyword);

-- Set default meta_title from title if meta_title is NULL
UPDATE articles 
SET meta_title = title 
WHERE meta_title IS NULL;

-- Set default meta_description from excerpt if meta_description is NULL
UPDATE articles 
SET meta_description = excerpt 
WHERE meta_description IS NULL;

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'articles' 
  AND column_name IN ('meta_title', 'meta_description', 'meta_keywords', 'og_image', 'canonical_url', 'focus_keyword');

