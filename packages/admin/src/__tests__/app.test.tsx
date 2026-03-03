import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminPanel } from '../pages/AdminPanel';
import { FLAGGED_QUEUE, REPORTS } from '../data/mock';

vi.mock('@spm/web-auth', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { username: 'admin', is_admin: true },
    token: 'fake-jwt',
    isLoading: false,
    isAuthenticated: true,
    isAdmin: true,
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignIn: () => <div>Sign In</div>,
}));

const renderPanel = () =>
  render(
    <MemoryRouter>
      <AdminPanel />
    </MemoryRouter>,
  );

describe('AdminPanel', () => {
  it('renders Admin Panel heading', () => {
    renderPanel();
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('renders all 6 tab labels', () => {
    renderPanel();
    expect(screen.getByText('Review Queue')).toBeInTheDocument();
    expect(screen.getByText('Skills')).toBeInTheDocument();
    expect(screen.getByText('Scan Analytics')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Errors')).toBeInTheDocument();
  });

  it('renders ADMIN badge in nav', () => {
    renderPanel();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  it('shows FlaggedQueue content by default', () => {
    renderPanel();
    expect(screen.getByText('In queue')).toBeInTheDocument();
    expect(screen.getByText('Avg review time')).toBeInTheDocument();
  });

  it('shows username in nav', () => {
    renderPanel();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('shows Back to registry link', () => {
    renderPanel();
    const link = screen.getByText((content) => content.includes('Back to registry'));
    expect(link).toBeInTheDocument();
  });

  it('renders Review Queue tab with count badge', () => {
    renderPanel();
    const expectedCount = FLAGGED_QUEUE.length;
    const tabButton = screen.getByText('Review Queue').closest('button');
    expect(tabButton).toBeInTheDocument();
    expect(tabButton!.textContent).toContain(String(expectedCount));
  });

  it('renders Reports tab with count badge', () => {
    renderPanel();
    const expectedCount = REPORTS.filter((r) => r.status === 'open').length;
    const tabButton = screen.getByText('Reports').closest('button');
    expect(tabButton).toBeInTheDocument();
    expect(tabButton!.textContent).toContain(String(expectedCount));
  });
});
