-- Add caption_position column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS caption_position TEXT DEFAULT 'bottom';

-- Add constraint to validate caption position values
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_caption_position'
  ) THEN
    ALTER TABLE projects ADD CONSTRAINT valid_caption_position
      CHECK (caption_position IN ('center', 'bottom'));
  END IF;
END $$;