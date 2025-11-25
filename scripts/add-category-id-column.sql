-- Add category_id column to articles table if it doesn't exist
-- This migrates from the old category (string) column to category_id (UUID) column

-- First, check if category_id column exists, if not, add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'articles' 
    AND column_name = 'category_id'
    AND table_schema = 'public'
  ) THEN
    -- Add category_id column (nullable initially)
    ALTER TABLE articles 
    ADD COLUMN category_id UUID REFERENCES categories(id);
    
    -- Try to populate category_id from existing category names
    -- This will only work if there are matching category names in the categories table
    UPDATE articles a
    SET category_id = c.id
    FROM categories c
    WHERE a.category = c.name
    AND a.category_id IS NULL;
    
    RAISE NOTICE 'Added category_id column and populated from existing category names';
  ELSE
    RAISE NOTICE 'category_id column already exists';
  END IF;
END $$;

-- Also ensure the status column exists (from article review system)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'articles' 
    AND column_name = 'status'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE articles 
    ADD COLUMN status VARCHAR(20) DEFAULT 'draft' 
    CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'published'));
    
    -- Set existing articles with published=true to status='published'
    UPDATE articles SET status = 'published' WHERE published = true AND status IS NULL;
    
    RAISE NOTICE 'Added status column';
  ELSE
    RAISE NOTICE 'status column already exists';
  END IF;
END $$;

-- Also ensure submitted_at column exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'articles' 
    AND column_name = 'submitted_at'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE articles 
    ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE;
    
    RAISE NOTICE 'Added submitted_at column';
  ELSE
    RAISE NOTICE 'submitted_at column already exists';
  END IF;
END $$;

