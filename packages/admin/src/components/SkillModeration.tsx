import { useState, useCallback } from 'react';
import { useAuth } from '@spm/web-auth';
import { Button, Card, SearchInput, StatusBadge, TRUST_CONFIG, type TrustTier } from '@spm/ui';
import { getAdminSkills, yankSkill } from '../lib/api';
import { useAdminData } from '../lib/useAdminData';
import { useSearchParamsState } from '../lib/useSearchParamsState';
import { LoadingState, ErrorState } from './DataState';
import { SkillDetailPane } from './SkillDetailPane';

const WEB_URL = import.meta.env.VITE_WEB_URL || 'https://skillpkg.dev';

export const SkillModeration = () => {
  const { token } = useAuth();
  const { get, getNumber, set } = useSearchParamsState();

  const search = get('search');
  const page = getNumber('page', 1);
  const selectedSkill = get('skill');

  const [yankTarget, setYankTarget] = useState<{ name: string; version: string } | null>(null);
  const [yankReason, setYankReason] = useState('');

  const fetchSkills = useCallback((t: string) => getAdminSkills(t, page, 50), [page]);
  const { data, isLoading, error, refetch } = useAdminData(fetchSkills, [page]);

  const handleYankConfirm = async () => {
    if (!token || !yankTarget || !yankReason.trim()) return;
    await yankSkill(token, yankTarget.name, yankTarget.version, yankReason.trim());
    setYankTarget(null);
    setYankReason('');
    refetch();
  };

  // Show inline detail if a skill is selected
  if (selectedSkill) {
    return <SkillDetailPane skillName={selectedSkill} />;
  }

  if (isLoading) return <LoadingState message="Loading skills..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const skills = data?.results ?? [];

  const filtered = skills.filter(
    (s) =>
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.author.toLowerCase().includes(search.toLowerCase()),
  );

  // Map scan_status to a status the StatusBadge can display
  const getDisplayStatus = (skill: (typeof skills)[0]) => {
    if (skill.deprecated) return 'deprecated';
    if (skill.scan_status === 'flagged') return 'held';
    if (skill.scan_status === 'blocked') return 'blocked';
    return 'published';
  };

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <SearchInput
          value={search}
          onChange={(v) => set({ search: v || null, page: null })}
          placeholder="Search skills or authors..."
        />
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--color-text-muted)',
          }}
        >
          {data?.total ?? 0} total skills
        </span>
      </div>

      {/* Yank confirmation */}
      {yankTarget && (
        <div
          style={{
            padding: '14px 18px',
            marginBottom: 14,
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 10,
            background: 'rgba(239,68,68,0.05)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 14,
              color: 'var(--color-text-primary)',
              marginBottom: 10,
            }}
          >
            Yank{' '}
            <strong style={{ color: 'var(--color-cyan)' }}>
              {yankTarget.name}@{yankTarget.version}
            </strong>
            ?
          </div>
          <input
            value={yankReason}
            onChange={(e) => setYankReason(e.target.value)}
            placeholder="Reason for yanking (required)..."
            style={{
              width: '100%',
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              padding: '8px 12px',
              background: 'var(--color-bg)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 6,
              outline: 'none',
              marginBottom: 10,
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <Button label="Yank" color="red" onClick={handleYankConfirm} />
            <Button
              label="Cancel"
              color="text-dim"
              onClick={() => {
                setYankTarget(null);
                setYankReason('');
              }}
            />
          </div>
        </div>
      )}

      <Card>
        {/* Header row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 80px 80px 80px 90px',
            gap: 10,
            padding: '8px 16px',
            borderBottom: '1px solid var(--color-border-default)',
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          <span>Skill</span>
          <span>Status</span>
          <span>Trust</span>
          <span>Published</span>
          <span style={{ textAlign: 'right' }}>Actions</span>
        </div>

        {/* Rows */}
        {filtered.map((skill) => {
          const trustTier = (skill.trust_tier || 'registered') as TrustTier;
          const cfg = TRUST_CONFIG[trustTier];

          return (
            <div
              key={skill.name}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 80px 80px 80px 90px',
                gap: 10,
                padding: '10px 16px',
                borderBottom: '1px solid rgba(26,29,39,0.25)',
                alignItems: 'center',
              }}
            >
              <div>
                <span
                  onClick={() => set({ skill: skill.name })}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    color: 'var(--color-cyan)',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') set({ skill: skill.name });
                  }}
                >
                  {skill.name}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--color-text-faint)',
                    marginLeft: 6,
                  }}
                >
                  {skill.latest_version ?? '--'}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 11,
                    color: 'var(--color-text-muted)',
                    marginLeft: 8,
                  }}
                >
                  @{skill.author}
                </span>
              </div>
              <StatusBadge status={getDisplayStatus(skill)} />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: cfg?.color ?? 'var(--color-text-dim)',
                }}
              >
                {cfg?.checks ?? '--'}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--color-text-muted)',
                  textAlign: 'right',
                }}
              >
                {skill.updated_at.slice(0, 10).slice(5)}
              </span>
              <div
                style={{
                  display: 'flex',
                  gap: 4,
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}
              >
                <a
                  href={`${WEB_URL}/skills/${skill.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open on web"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    color: 'var(--color-text-faint)',
                    textDecoration: 'none',
                    padding: '2px 4px',
                  }}
                >
                  ↗
                </a>
                <Button
                  label="Yank"
                  color="red"
                  small
                  onClick={() =>
                    skill.latest_version
                      ? setYankTarget({ name: skill.name, version: skill.latest_version })
                      : undefined
                  }
                />
              </div>
            </div>
          );
        })}
      </Card>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <Button
            label="Previous"
            color="text-dim"
            small
            onClick={() => set({ page: Math.max(1, page - 1) })}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--color-text-muted)',
              padding: '4px 8px',
            }}
          >
            Page {data.page} of {data.pages}
          </span>
          <Button
            label="Next"
            color="text-dim"
            small
            onClick={() => set({ page: Math.min(data.pages, page + 1) })}
          />
        </div>
      )}
    </div>
  );
};
