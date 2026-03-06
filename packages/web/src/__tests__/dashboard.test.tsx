import { screen } from '@testing-library/react';
import { Dashboard } from '../pages/dashboard';
import { useAuth } from '../context/AuthContext';
import { renderWithProviders } from './helpers';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../lib/api', () => ({
  getAuthorStats: vi.fn().mockResolvedValue({
    total_downloads: 0,
    weekly_downloads: 0,
    rating_avg: 0,
    total_reviews: 0,
    weekly_trend: [],
    agent_breakdown: [],
    recent_activity: [],
  }),
  searchSkills: vi.fn().mockResolvedValue({
    results: [],
    total: 0,
    page: 1,
    per_page: 50,
    pages: 0,
  }),
}));

const mockedUseAuth = vi.mocked(useAuth);

const authState = (overrides: Partial<ReturnType<typeof useAuth>> = {}) => ({
  user: {
    id: 'u1',
    username: 'testuser',
    github_id: 12345,
    trust_tier: 'verified',
    is_admin: false,
    created_at: '2026-01-01T00:00:00Z',
  },
  token: 'fake-token',
  isLoading: false,
  isAuthenticated: true,
  isAdmin: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
  ...overrides,
});

const renderDashboard = () => renderWithProviders(<Dashboard />);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Dashboard', () => {
  it('renders username from auth context', () => {
    mockedUseAuth.mockReturnValue(authState());
    renderDashboard();

    expect(screen.getByText('@testuser')).toBeInTheDocument();
  });

  it('renders "Total downloads" stat', () => {
    mockedUseAuth.mockReturnValue(authState());
    renderDashboard();

    expect(screen.getByText('Total downloads')).toBeInTheDocument();
  });

  it('renders "Skills published" stat', () => {
    mockedUseAuth.mockReturnValue(authState());
    renderDashboard();

    expect(screen.getByText('Skills published')).toBeInTheDocument();
  });

  it('renders "Avg rating" stat', () => {
    mockedUseAuth.mockReturnValue(authState());
    renderDashboard();

    expect(screen.getByText('Avg rating')).toBeInTheDocument();
  });

  it('renders 4 tab labels', () => {
    mockedUseAuth.mockReturnValue(authState());
    renderDashboard();

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Skills (0)')).toBeInTheDocument();
    expect(screen.getByText('Publish history')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('shows Overview tab by default', () => {
    mockedUseAuth.mockReturnValue(authState());
    renderDashboard();

    expect(screen.getByText('Your skills')).toBeInTheDocument();
  });

  it('shows "Your skills" in overview tab', () => {
    mockedUseAuth.mockReturnValue(authState());
    renderDashboard();

    expect(screen.getByText('Your skills')).toBeInTheDocument();
  });

  it('shows "Recent activity" in overview tab', () => {
    mockedUseAuth.mockReturnValue(authState());
    renderDashboard();

    expect(screen.getByText('Recent activity')).toBeInTheDocument();
  });
});
