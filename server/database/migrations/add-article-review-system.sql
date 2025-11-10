-- Add columns for article review system
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'published')),
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_author_status ON articles(author_id, status);

-- Create settings table for admin configurations
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default setting for max pending articles
INSERT INTO site_settings (setting_key, setting_value, description)
VALUES ('max_pending_articles_per_user', '3', 'Maximum number of articles a user can have in pending/review status')
ON CONFLICT (setting_key) DO NOTHING;

-- Create article analytics table for tracking performance
CREATE TABLE IF NOT EXISTS article_performance_stats (
  id SERIAL PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(article_id, date)
);

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_article_performance_stats_article_date ON article_performance_stats(article_id, date);
CREATE INDEX IF NOT EXISTS idx_article_performance_stats_date ON article_performance_stats(date);

-- Create function to update analytics
CREATE OR REPLACE FUNCTION increment_article_performance_stats(
  p_article_id UUID,
  p_metric VARCHAR(20)
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO article_performance_stats (article_id, date, views, likes, comments, shares)
  VALUES (
    p_article_id, 
    CURRENT_DATE,
    CASE WHEN p_metric = 'views' THEN 1 ELSE 0 END,
    CASE WHEN p_metric = 'likes' THEN 1 ELSE 0 END,
    CASE WHEN p_metric = 'comments' THEN 1 ELSE 0 END,
    CASE WHEN p_metric = 'shares' THEN 1 ELSE 0 END
  )
  ON CONFLICT (article_id, date) 
  DO UPDATE SET
    views = article_performance_stats.views + CASE WHEN p_metric = 'views' THEN 1 ELSE 0 END,
    likes = article_performance_stats.likes + CASE WHEN p_metric = 'likes' THEN 1 ELSE 0 END,
    comments = article_performance_stats.comments + CASE WHEN p_metric = 'comments' THEN 1 ELSE 0 END,
    shares = article_performance_stats.shares + CASE WHEN p_metric = 'shares' THEN 1 ELSE 0 END,
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Update existing articles to have 'published' status if they don't have one
UPDATE articles SET status = 'published' WHERE status IS NULL;

COMMENT ON COLUMN articles.status IS 'Article review status: draft, pending, approved, rejected, published';
COMMENT ON COLUMN articles.submitted_at IS 'When the article was submitted for review';
COMMENT ON COLUMN articles.reviewed_at IS 'When the article was reviewed by admin';
COMMENT ON COLUMN articles.reviewed_by IS 'Admin user who reviewed the article';
