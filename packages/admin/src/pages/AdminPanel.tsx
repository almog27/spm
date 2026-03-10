import { useCallback } from 'react';
import { Badge, Tabs } from '@spm/ui';
import { useAuth } from '@spm/web-auth';
import { useSearchParamsState } from '../lib/useSearchParamsState';
import { FlaggedQueue } from '../components/FlaggedQueue';
import { SkillModeration } from '../components/SkillModeration';
import { ScanAnalytics } from '../components/ScanAnalytics';
import { UsersTab } from '../components/UsersTab';
import { ReportsTab } from '../components/ReportsTab';
import { ErrorsTab } from '../components/ErrorsTab';

const TABS = [
  { id: 'flagged', label: 'Review Queue' },
  { id: 'skills', label: 'Skills' },
  { id: 'analytics', label: 'Scan Analytics' },
  { id: 'trust', label: 'Users' },
  { id: 'reports', label: 'Reports' },
  { id: 'errors', label: 'Errors' },
];

const TAB_PARAMS: Record<string, string[]> = {
  skills: ['search', 'page', 'skill'],
  trust: ['search', 'role', 'trust'],
};

export const AdminPanel = () => {
  const { get, set } = useSearchParamsState();
  const tab = get('tab', 'flagged');
  const { user, signOut } = useAuth();

  const handleTabChange = useCallback(
    (newTab: string) => {
      // Clear params belonging to the old tab
      const oldTabParams = TAB_PARAMS[tab] ?? [];
      const clears: Record<string, null> = {};
      for (const p of oldTabParams) {
        clears[p] = null;
      }
      set({ ...clears, tab: newTab === 'flagged' ? null : newTab });
    },
    [tab, set],
  );

  return (
    <div className="bg-bg text-text-primary min-h-screen">
      {/* Nav */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '11px 32px',
          borderBottom: '1px solid var(--color-border-default)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(8,10,15,0.92)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <a
            href="#"
            style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
          >
            <img
              src="/logo-64.png"
              alt="SPM"
              style={{
                width: 28,
                height: 28,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 16,
                fontWeight: 700,
                backgroundImage: 'linear-gradient(135deg, #3dfce4 0%, #2564ff 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                display: 'inline-block',
              }}
            >
              spm
            </span>
            <Badge label="ADMIN" color="red" />
          </a>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a
            href="https://skillpkg.dev"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--color-text-dim)',
              textDecoration: 'none',
            }}
          >
            skillpkg.dev &rarr;
          </a>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--color-text-muted)',
            }}
          >
            {user?.username || 'admin'}
          </span>
          <button
            onClick={signOut}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              color: 'var(--color-text-dim)',
              textDecoration: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '24px 32px 60px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: 20,
          }}
        >
          Admin Panel
        </h1>

        <Tabs tabs={TABS} active={tab} onChange={handleTabChange} />

        {tab === 'flagged' && <FlaggedQueue />}
        {tab === 'skills' && <SkillModeration />}
        {tab === 'analytics' && <ScanAnalytics />}
        {tab === 'trust' && <UsersTab />}
        {tab === 'reports' && <ReportsTab />}
        {tab === 'errors' && <ErrorsTab />}
      </div>
    </div>
  );
};
