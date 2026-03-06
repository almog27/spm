import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

interface RenderWithProvidersOptions extends RenderOptions {
  routerProps?: MemoryRouterProps;
}

export const renderWithProviders = (
  ui: ReactNode,
  options?: RenderWithProvidersOptions,
): RenderResult => {
  const { routerProps, ...renderOptions } = options ?? {};
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter {...routerProps}>
        <AuthProvider>{ui}</AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
    renderOptions,
  );
};

export const mockUser = {
  id: 'u1',
  username: 'testuser',
  github_id: 12345,
  trust_tier: 'verified',
  is_admin: false,
  created_at: '2026-01-01T00:00:00Z',
};

export const mockAdminUser = {
  ...mockUser,
  username: 'adminuser',
  is_admin: true,
};
