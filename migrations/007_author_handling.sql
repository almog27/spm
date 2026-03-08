-- 007: Author handling for imported/community skills
-- Adds placeholder user support and imported skill provenance

-- Mark users as placeholder (created by import script, not real accounts)
ALTER TABLE users ADD COLUMN is_placeholder boolean NOT NULL DEFAULT false;

-- Track where imported skills came from (e.g. github.com/anthropics/skill-repo)
ALTER TABLE skills ADD COLUMN imported_from text;

-- Index for filtering placeholder users (admin queries)
CREATE INDEX idx_users_placeholder ON users (is_placeholder) WHERE is_placeholder = true;
