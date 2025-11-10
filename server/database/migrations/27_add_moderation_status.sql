-- Add moderation status to reviews and micro_content tables

-- Add status column to reviews table
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add status column to micro_content table
ALTER TABLE micro_content
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add moderated_by and moderated_at columns for audit trail
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP;

ALTER TABLE micro_content
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP;

-- Create index on status for fast filtering
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_micro_content_status ON micro_content(status);

-- By default, show only approved content in public queries
COMMENT ON COLUMN reviews.status IS 'Moderation status: pending, approved, or rejected';
COMMENT ON COLUMN micro_content.status IS 'Moderation status: pending, approved, or rejected';
