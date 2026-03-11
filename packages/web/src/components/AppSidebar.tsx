import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar, type SidebarSection } from '@spm/ui';
import { useAuth } from '../context/AuthContext';

const SpmLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <img src="/logo-64.png" alt="SPM" style={{ width: 28, height: 28 }} />
    <span
      style={{
        fontFamily: "'Alfa Slab One', serif",
        fontSize: 18,
        fontWeight: 400,
        backgroundImage: 'linear-gradient(135deg, #3dfce4 0%, #2564ff 100%)',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        display: 'inline-block',
      }}
    >
      spm
    </span>
  </div>
);

const SidebarFooter = () => {
  const { isAuthenticated, user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return (
      <button
        type="button"
        onClick={() => navigate('/signin')}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--color-bg)',
          background: 'var(--color-accent)',
          border: 'none',
          borderRadius: 6,
          padding: '6px 14px',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        Sign in
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img
        src={`https://github.com/${user.username}.png?size=28`}
        alt={user.username}
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '1px solid var(--color-border-default)',
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {user.username}
        </div>
      </div>
      <button
        type="button"
        onClick={signOut}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 12,
          color: 'var(--color-text-muted)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px 6px',
          flexShrink: 0,
        }}
      >
        Sign out
      </button>
    </div>
  );
};

const pathToActiveId = (pathname: string): string => {
  if (pathname === '/') return 'home';
  if (pathname === '/search') return 'search';
  if (pathname === '/docs') return 'docs';
  if (pathname === '/cli') return 'cli';
  if (pathname === '/publish') return 'publish';
  if (pathname === '/dashboard') return 'dashboard';
  return '';
};

export const AppSidebar = ({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) => {
  const { isAuthenticated, isAdmin, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const sections: SidebarSection[] = [
    {
      title: 'Discover',
      items: [
        { id: 'home', label: 'Home', onClick: () => navigate('/') },
        { id: 'search', label: 'Search', onClick: () => navigate('/search') },
      ],
    },
    {
      title: 'Docs',
      items: [
        { id: 'docs', label: 'Getting Started', onClick: () => navigate('/docs') },
        { id: 'cli', label: 'CLI Reference', onClick: () => navigate('/cli') },
        { id: 'publish', label: 'Publishing', onClick: () => navigate('/publish') },
      ],
    },
  ];

  if (isAuthenticated) {
    sections.push({
      title: 'My Account',
      items: [{ id: 'dashboard', label: 'Dashboard', onClick: () => navigate('/dashboard') }],
    });
  }

  if (isAdmin) {
    sections.push({
      items: [
        {
          id: 'admin',
          label: 'Admin Panel',
          href: `https://admin.skillpkg.dev${token ? `#token=${token}` : ''}`,
          external: true,
        },
      ],
    });
  }

  return (
    <Sidebar
      header={<SpmLogo />}
      sections={sections}
      activeId={pathToActiveId(location.pathname)}
      footer={<SidebarFooter />}
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
    />
  );
};
