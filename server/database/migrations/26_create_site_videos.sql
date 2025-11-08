BEGIN;

CREATE TABLE IF NOT EXISTS public.site_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  embed_code TEXT,
  thumbnail_url TEXT,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_site_videos_position ON public.site_videos(position);
CREATE INDEX IF NOT EXISTS idx_site_videos_active ON public.site_videos(is_active);

DROP TRIGGER IF EXISTS update_site_videos_updated_at ON public.site_videos;
CREATE TRIGGER update_site_videos_updated_at
  BEFORE UPDATE ON public.site_videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;


