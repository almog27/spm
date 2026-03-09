-- Add new skill categories: data-analysis and ai-ml
ALTER TYPE skill_category ADD VALUE IF NOT EXISTS 'data-analysis';
ALTER TYPE skill_category ADD VALUE IF NOT EXISTS 'ai-ml';
