-- SPM Database Schema
-- Migration 001: Initial schema

-- ── Enums ──

CREATE TYPE skill_category AS ENUM (
  'documents',
  'data-viz',
  'frontend',
  'backend',
  'infra',
  'testing',
  'code-quality',
  'security',
  'productivity',
  'other'
);

CREATE TYPE trust_tier AS ENUM (
  'registered',
  'scanned',
  'verified',
  'official'
);

CREATE TYPE scan_status AS ENUM (
  'pending',
  'passed',
  'flagged',
  'blocked',
  'manual_approved'
);

-- ── Users ──

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      TEXT UNIQUE NOT NULL,
  github_id     TEXT UNIQUE,
  github_login  TEXT,
  email         TEXT,
  trust_tier    trust_tier NOT NULL DEFAULT 'registered',
  role          TEXT NOT NULL DEFAULT 'user',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_github ON users(github_id);

-- ── Skills ──

CREATE TABLE skills (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT UNIQUE NOT NULL,
  owner_id      UUID NOT NULL REFERENCES users(id),
  category      skill_category NOT NULL,
  description   TEXT NOT NULL,
  repository    TEXT,
  license       TEXT DEFAULT 'MIT',
  deprecated    BOOLEAN NOT NULL DEFAULT false,
  deprecated_msg TEXT,
  rating_avg    REAL DEFAULT 0,
  rating_count  INT DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_skills_name ON skills(name);
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_owner ON skills(owner_id);

ALTER TABLE skills ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', name), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED;
CREATE INDEX idx_skills_search ON skills USING GIN(search_vector);

-- ── Versions ──

CREATE TABLE versions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id      UUID NOT NULL REFERENCES skills(id),
  version       TEXT NOT NULL,
  version_major INT NOT NULL,
  version_minor INT NOT NULL,
  version_patch INT NOT NULL,
  manifest      JSONB NOT NULL,
  readme_md     TEXT,
  size_bytes    INT,
  checksum_sha256 TEXT NOT NULL,
  skl_storage_key TEXT NOT NULL,
  sigstore_bundle_key TEXT,
  signer_identity TEXT,
  yanked        BOOLEAN NOT NULL DEFAULT false,
  yank_reason   TEXT,
  published_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(skill_id, version)
);

CREATE INDEX idx_versions_skill ON versions(skill_id);
CREATE INDEX idx_versions_published ON versions(published_at DESC);

-- ── Tags ──

CREATE TABLE skill_tags (
  skill_id      UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  tag           TEXT NOT NULL,
  PRIMARY KEY (skill_id, tag)
);

CREATE INDEX idx_tags_tag ON skill_tags(tag);

-- ── Platform support ──

CREATE TABLE skill_platforms (
  skill_id      UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  platform      TEXT NOT NULL,
  PRIMARY KEY (skill_id, platform)
);

-- ── Security scans ──

CREATE TABLE scans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id    UUID NOT NULL REFERENCES versions(id),
  layer         INT NOT NULL,
  status        scan_status NOT NULL,
  confidence    REAL,
  details       JSONB,
  scanned_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(version_id, layer)
);

-- ── Download tracking ──

CREATE TABLE downloads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id    UUID NOT NULL REFERENCES versions(id),
  user_id       UUID REFERENCES users(id),
  ip_hash       TEXT,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_downloads_version ON downloads(version_id);
CREATE INDEX idx_downloads_time ON downloads(downloaded_at DESC);

CREATE MATERIALIZED VIEW download_counts AS
  SELECT
    v.skill_id,
    v.id AS version_id,
    COUNT(*) AS total_downloads,
    COUNT(*) FILTER (WHERE d.downloaded_at > now() - interval '7 days') AS weekly_downloads
  FROM downloads d
  JOIN versions v ON v.id = d.version_id
  GROUP BY v.skill_id, v.id;

-- ── Reviews ──

CREATE TABLE reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id      UUID NOT NULL REFERENCES skills(id),
  user_id       UUID NOT NULL REFERENCES users(id),
  rating        SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(skill_id, user_id)
);

-- ── Audit log ──

CREATE TABLE audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id      UUID REFERENCES users(id),
  action        TEXT NOT NULL,
  skill_id      UUID REFERENCES skills(id),
  version_id    UUID REFERENCES versions(id),
  details       JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_skill ON audit_log(skill_id);
CREATE INDEX idx_audit_time ON audit_log(created_at DESC);

-- ── Publish attempts ──

CREATE TABLE publish_attempts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id),
  skill_name    TEXT NOT NULL,
  version       TEXT NOT NULL,
  status        TEXT NOT NULL,
  block_reasons JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_publish_user ON publish_attempts(user_id);

-- ── Reports ──

CREATE TABLE reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id      UUID NOT NULL REFERENCES skills(id),
  reporter_id   UUID REFERENCES users(id),
  reason        TEXT NOT NULL,
  priority      TEXT NOT NULL DEFAULT 'medium',
  status        TEXT NOT NULL DEFAULT 'open',
  resolution    TEXT,
  action_taken  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Bridge skills ──

CREATE TABLE bridge_skills (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id      UUID NOT NULL REFERENCES skills(id),
  source        TEXT NOT NULL,
  source_repo   TEXT NOT NULL,
  source_path   TEXT,
  source_commit TEXT,
  source_branch TEXT DEFAULT 'main',
  last_synced   TIMESTAMPTZ NOT NULL DEFAULT now(),
  sync_status   TEXT DEFAULT 'active',
  claimed       BOOLEAN NOT NULL DEFAULT false,
  claimed_by    UUID REFERENCES users(id),
  claimed_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bridge_source ON bridge_skills(source_repo);
CREATE INDEX idx_bridge_skill ON bridge_skills(skill_id);
