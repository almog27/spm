import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminRoute } from '../components/AdminRoute';

const mockSignOut = vi.fn();

vi.mock('@spm/web-auth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@spm/web-auth';

const mockedUseAuth = vi.mocked(useAuth);

beforeEach(() => {
  vi.clearAllMocks();
});

const renderAdminRoute = (initialPath = '/') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/"
          element={
            <AdminRoute>
              <div>Admin Content</div>
            </AdminRoute>
          }
        />
        <Route path="/signin" element={<div>Sign In Page</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('AdminRoute', () => {
  it('shows loading state while auth is loading', () => {
    mockedUseAuth.mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      token: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    renderAdminRoute();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('redirects to /signin when not authenticated', () => {
    mockedUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      isAdmin: false,
      user: null,
      token: null,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    renderAdminRoute();

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(screen.getByText('Sign In Page')).toBeInTheDocument();
  });

  it('shows Access Denied when authenticated but not admin', () => {
    mockedUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isAdmin: false,
      user: {
        id: 'u1',
        username: 'testuser',
        github_id: 12345,
        trust_tier: 'verified',
        is_admin: false,
        created_at: '2026-01-01T00:00:00Z',
      },
      token: 'jwt_abc',
      signIn: vi.fn(),
      signOut: mockSignOut,
    });

    renderAdminRoute();

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText(/You do not have admin privileges/)).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('calls signOut when clicking sign out on Access Denied screen', () => {
    mockedUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isAdmin: false,
      user: {
        id: 'u1',
        username: 'testuser',
        github_id: 12345,
        trust_tier: 'verified',
        is_admin: false,
        created_at: '2026-01-01T00:00:00Z',
      },
      token: 'jwt_abc',
      signIn: vi.fn(),
      signOut: mockSignOut,
    });

    renderAdminRoute();

    fireEvent.click(screen.getByText('Sign out'));
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('renders children when authenticated and admin', () => {
    mockedUseAuth.mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      isAdmin: true,
      user: {
        id: 'u2',
        username: 'admin',
        github_id: 99999,
        trust_tier: 'official',
        is_admin: true,
        created_at: '2026-01-01T00:00:00Z',
      },
      token: 'admin_jwt',
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    renderAdminRoute();

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
    expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
  });
});
