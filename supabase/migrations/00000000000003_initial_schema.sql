-- Add caption_style column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS caption_style TEXT DEFAULT 'classic';

-- Add constraint to validate caption style values
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_caption_style'
  ) THEN
    ALTER TABLE projects ADD CONSTRAINT valid_caption_style
      CHECK (caption_style IN ('classic', 'bold', 'minimal', 'neon'));
  END IF;
END $$;