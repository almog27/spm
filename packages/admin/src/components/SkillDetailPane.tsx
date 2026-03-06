import { useState, useEffect } from 'react';
import { useAuth } from '@spm/web-auth';
import { Button, Card, TRUST_CONFIG, type TrustTier } from '@spm/ui';
import {
  getSkillDetail,
  getSkillVersion,
  yankSkill,
  type SkillDetailResponse,
  type SkillVersionResponse,
} from '../lib/api';
import { useSearchParamsState } from '../lib/useSearchParamsState';

const WEB_URL = import.meta.env.VITE_WEB_URL || 'https://skillpkg.dev';
const README_COLLAPSED_LINES = 15;

export const SkillDetailPane = ({ skillName }: { skillName: string }) => {
  const { token } = useAuth();
  const { set } = useSearchParamsState();
  const [detail, setDetail] = useState<SkillDetailResponse | null>(null);
  const [versionData, setVersionData] = useState<SkillVersionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readmeExpanded, setReadmeExpanded] = useState(false);
  const [yankTarget, setYankTarget] = useState<string | null>(null);
  const [yankReason, setYankReason] = useState('');

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const d = await getSkillDetail(token, skillName);
        if (cancelled) return;
        setDetail(d);

        if (d.latest_version) {
          const v = await getSkillVersion(token, skillName, d.latest_version);
          if (cancelled) return;
          setVersionData(v);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load skill');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [token, skillName]);

  const handleYank = async () => {
    if (!token || !yankTarget || !yankReason.trim()) return;
    await yankSkill(token, skillName, yankTarget, yankReason.trim());
    setYankTarget(null);
    setYankReason('');
    // Reload detail
    const d = await getSkillDetail(token, skillName);
    setDetail(d);
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <span
          style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--color-text-muted)' }}
        >
          Loading {skillName}...
        </span>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div style={{ padding: 24 }}>
        <Button
          label="← Back to list"
          color="text-dim"
          small
          onClick={() => set({ skill: null })}
        />
        <div
          style={{
            marginTop: 16,
            padding: 16,
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 8,
            background: 'rgba(239,68,68,0.05)',
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            color: 'var(--color-text-primary)',
          }}
        >
          {error ?? 'Skill not found'}
        </div>
      </div>
    );
  }

  const trustTier = (detail.author.trust_tier || 'registered') as TrustTier;
  const cfg = TRUST_CONFIG[trustTier];

  const readmeLines = versionData?.readme_md?.split('\n') ?? [];
  const readmeCollapsed = readmeLines.length > README_COLLAPSED_LINES && !readmeExpanded;
  const displayedReadme = readmeCollapsed
    ? readmeLines.slice(0, README_COLLAPSED_LINES).join('\n')
    : (versionData?.readme_md ?? '');

  const manifest = versionData?.manifest;

  return (
    <div>
      {/* Back button */}
      <div style={{ marginBottom: 16 }}>
        <Button
          label="← Back to list"
          color="text-dim"
          small
          onClick={() => set({ skill: null })}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20 }}>
        {/* Main content */}
        <div>
          {/* Header */}
          <Card>
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'var(--color-cyan)',
                  }}
                >
                  {detail.name}
                </span>
                {detail.latest_version && (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    v{detail.latest_version}
                  </span>
                )}
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: cfg?.color ?? 'var(--color-text-dim)',
                    padding: '2px 8px',
                    border: `1px solid ${cfg?.color ?? 'var(--color-border-default)'}`,
                    borderRadius: 4,
                  }}
                >
                  {cfg?.checks ?? ''} {cfg?.label ?? trustTier}
                </span>
                {detail.deprecated && (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: '#ef4444',
                      padding: '2px 8px',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: 4,
                    }}
                  >
                    DEPRECATED
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 13,
                    color: 'var(--color-text-muted)',
                  }}
                >
                  by{' '}
                  <strong style={{ color: 'var(--color-text-primary)' }}>
                    @{detail.author.username}
                  </strong>
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--color-text-faint)',
                  }}
                >
                  {detail.downloads.toLocaleString()} downloads
                </span>
              </div>
              {detail.description && (
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 13,
                    color: 'var(--color-text-dim)',
                    marginTop: 10,
                    marginBottom: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {detail.description}
                </p>
              )}
            </div>
          </Card>

          {/* README */}
          <div style={{ marginTop: 16 }}>
            <h3
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 8,
              }}
            >
              README
            </h3>
            <Card>
              <div style={{ padding: '14px 18px' }}>
                {versionData?.readme_md ? (
                  <>
                    <pre
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        color: 'var(--color-text-dim)',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        margin: 0,
                      }}
                    >
                      {displayedReadme}
                    </pre>
                    {readmeCollapsed && (
                      <button
                        onClick={() => setReadmeExpanded(true)}
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: 12,
                          color: 'var(--color-blue)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '8px 0 0',
                          display: 'block',
                        }}
                      >
                        Show more ({readmeLines.length - README_COLLAPSED_LINES} more lines)
                      </button>
                    )}
                    {readmeExpanded && readmeLines.length > README_COLLAPSED_LINES && (
                      <button
                        onClick={() => setReadmeExpanded(false)}
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: 12,
                          color: 'var(--color-blue)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '8px 0 0',
                          display: 'block',
                        }}
                      >
                        Show less
                      </button>
                    )}
                  </>
                ) : (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      color: 'var(--color-text-faint)',
                    }}
                  >
                    No README available
                  </span>
                )}
              </div>
            </Card>
          </div>

          {/* Manifest */}
          {manifest && (
            <div style={{ marginTop: 16 }}>
              <h3
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: 8,
                }}
              >
                Manifest
              </h3>
              <Card>
                <div style={{ padding: '14px 18px' }}>
                  {(
                    ['description', 'categories', 'platforms', 'dependencies', 'engine'] as const
                  ).map((field) => {
                    const val = manifest[field];
                    if (val === undefined || val === null) return null;
                    return (
                      <div key={field} style={{ marginBottom: 8 }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11,
                            color: 'var(--color-text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {field}
                        </span>
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 12,
                            color: 'var(--color-text-dim)',
                            marginTop: 2,
                          }}
                        >
                          {Array.isArray(val)
                            ? val.join(', ') || '—'
                            : typeof val === 'object'
                              ? JSON.stringify(val)
                              : String(val)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Versions */}
          <h3
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: 8,
            }}
          >
            Versions ({detail.versions.length})
          </h3>
          <Card>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {detail.versions.map((v) => (
                <div
                  key={v.version}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 14px',
                    borderBottom: '1px solid rgba(26,29,39,0.25)',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        color: v.yanked ? 'var(--color-text-faint)' : 'var(--color-text-primary)',
                        textDecoration: v.yanked ? 'line-through' : 'none',
                      }}
                    >
                      {v.version}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: 'var(--color-text-faint)',
                        marginLeft: 8,
                      }}
                    >
                      {v.published_at.slice(0, 10)}
                    </span>
                  </div>
                  {!v.yanked && (
                    <Button
                      label="Yank"
                      color="red"
                      small
                      onClick={() => setYankTarget(v.version)}
                    />
                  )}
                  {v.yanked && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: '#ef4444',
                      }}
                    >
                      yanked
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Yank confirmation */}
          {yankTarget && (
            <div
              style={{
                marginTop: 12,
                padding: '12px 14px',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 8,
                background: 'rgba(239,68,68,0.05)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  color: 'var(--color-text-primary)',
                  marginBottom: 8,
                }}
              >
                Yank{' '}
                <strong style={{ color: 'var(--color-cyan)' }}>
                  {skillName}@{yankTarget}
                </strong>
                ?
              </div>
              <input
                value={yankReason}
                onChange={(e) => setYankReason(e.target.value)}
                placeholder="Reason (required)..."
                style={{
                  width: '100%',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  padding: '6px 10px',
                  background: 'var(--color-bg)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: 6,
                  outline: 'none',
                  marginBottom: 8,
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <Button label="Yank" color="red" small onClick={handleYank} />
                <Button
                  label="Cancel"
                  color="text-dim"
                  small
                  onClick={() => {
                    setYankTarget(null);
                    setYankReason('');
                  }}
                />
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div style={{ marginTop: 16 }}>
            <h3
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: 8,
              }}
            >
              Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a
                href={`${WEB_URL}/skills/${detail.name}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  color: 'var(--color-blue)',
                  textDecoration: 'none',
                }}
              >
                Open on web →
              </a>
            </div>
          </div>

          {/* Categories */}
          {detail.categories.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h3
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: 8,
                }}
              >
                Categories
              </h3>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {detail.categories.map((cat) => (
                  <span
                    key={cat}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--color-text-muted)',
                      padding: '3px 8px',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 4,
                    }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
