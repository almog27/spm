-- Migration: Add multi-category support
-- Adds categories array column, migrates data, drops old column

ALTER TABLE skills ADD COLUMN categories skill_category[] NOT NULL DEFAULT '{other}';

-- Migrate existing data
UPDATE skills SET categories = ARRAY[category];

-- Drop old column and index
DROP INDEX IF EXISTS idx_skills_category;
ALTER TABLE skills DROP COLUMN category;

-- Create GIN index for array queries
CREATE INDEX idx_skills_categories ON skills USING GIN(categories);
