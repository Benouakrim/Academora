-- Create article_views table for tracking article analytics
CREATE TABLE IF NOT EXISTS article_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT,
  duration_seconds INTEGER, -- Optional: how long user stayed on article
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_article_views_article_id ON article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_article_views_user_id ON article_views(user_id);
CREATE INDEX IF NOT EXISTS idx_article_views_viewed_at ON article_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_article_views_article_viewed_at ON article_views(article_id, viewed_at);

-- Add view_count column to articles table for caching
ALTER TABLE articles ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create function to update article view count
CREATE OR REPLACE FUNCTION update_article_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE articles 
  SET view_count = view_count + 1 
  WHERE id = NEW.article_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update view count
CREATE TRIGGER trigger_update_article_view_count
  AFTER INSERT ON article_views
  FOR EACH ROW
  EXECUTE FUNCTION update_article_view_count();

-- Add hot_score column for calculating hotness
ALTER TABLE articles ADD COLUMN IF NOT EXISTS hot_score DECIMAL DEFAULT 0;

-- Create view for article analytics
CREATE OR REPLACE VIEW article_analytics AS
SELECT 
  a.id,
  a.title,
  a.slug,
  a.category,
  a.published,
  a.created_at,
  a.view_count,
  COUNT(av.id) as total_views,
  COUNT(DISTINCT av.user_id) as unique_views,
  COUNT(DISTINCT av.ip_address) as unique_ips,
  AVG(av.duration_seconds) as avg_duration,
  MAX(av.viewed_at) as last_viewed,
  -- Hot score calculation: views in last 7 days weighted by recency
  (
    SELECT COALESCE(SUM(
      CASE 
        WHEN viewed_at >= NOW() - INTERVAL '1 day' THEN 3.0
        WHEN viewed_at >= NOW() - INTERVAL '3 days' THEN 2.0
        WHEN viewed_at >= NOW() - INTERVAL '7 days' THEN 1.0
        ELSE 0.5
      END
    ), 0)
    FROM article_views 
    WHERE article_id = a.id 
    AND viewed_at >= NOW() - INTERVAL '7 days'
  ) as hot_score
FROM articles a
LEFT JOIN article_views av ON a.id = av.article_id
WHERE a.published = true
GROUP BY a.id, a.title, a.slug, a.category, a.published, a.created_at, a.view_count;

-- Create index on hot_score for performance
CREATE INDEX IF NOT EXISTS idx_articles_hot_score ON articles(hot_score DESC);
