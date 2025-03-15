
-- Add missing status column to pilgrimages table
ALTER TABLE pilgrimages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' NOT NULL;

-- Set default values for existing rows
UPDATE pilgrimages SET status = 'draft' WHERE status IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN pilgrimages.status IS 'Status of pilgrimage: draft, published, unpublished, cancelled';
