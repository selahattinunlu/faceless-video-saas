-- Add wizard-related columns to the projects table
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS image_style TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS custom_image_style TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS voice_id TEXT DEFAULT 'Kore',
ADD COLUMN IF NOT EXISTS wizard_step TEXT DEFAULT 'input';