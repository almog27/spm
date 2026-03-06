-- Migration 004: Skill collaborators (multi-author support) + skill status column

CREATE TABLE skill_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'collaborator', -- 'owner' | 'collaborator'
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (skill_id, user_id)
);

CREATE INDEX idx_skill_collaborators_skill ON skill_collaborators(skill_id);
CREATE INDEX idx_skill_collaborators_user ON skill_collaborators(user_id);

-- Backfill: insert current owners as collaborators with role 'owner'
INSERT INTO skill_collaborators (skill_id, user_id, role)
SELECT id, owner_id, 'owner' FROM skills;

-- Add status column to skills for block/unblock support
ALTER TABLE skills ADD COLUMN status TEXT NOT NULL DEFAULT 'published';
CREATE INDEX idx_skills_status ON skills(status);
