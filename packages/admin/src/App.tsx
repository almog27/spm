import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider, SignIn } from '@spm/web-auth';
import { AdminRoute } from './components/AdminRoute';
import { AdminPanel } from './pages/AdminPanel';

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider storageKey="spm_admin_token">
          <Routes>
            <Route
              path="/signin"
              element={
                <SignIn
                  title="Admin Sign In"
                  subtitle="Sign in with GitHub to access the admin panel."
                  accentColor="#ef4444"
                />
              }
            />
            <Route
              path="/*"
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
