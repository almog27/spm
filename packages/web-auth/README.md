# @spm/web-auth

Shared authentication logic for SPM web and admin apps. Provides GitHub OAuth device flow, JWT session management, and React context/hooks.

## Exports

| Export              | Description                                                                 |
| ------------------- | --------------------------------------------------------------------------- |
| `AuthProvider`      | React context provider — wraps app with auth state                          |
| `useAuth`           | Hook — returns `{ user, token, isAuthenticated, isAdmin, signIn, signOut }` |
| `ProtectedRoute`    | Route wrapper that redirects unauthenticated users to sign-in               |
| `SignIn`            | Full sign-in page component with device code flow UI                        |
| `requestDeviceCode` | Start GitHub OAuth device flow                                              |
| `pollToken`         | Poll for token after user authorizes                                        |
| `whoami`            | Fetch current user profile from API                                         |
| `logout`            | Invalidate session                                                          |

## Usage

```tsx
import { AuthProvider, useAuth, ProtectedRoute } from '@spm/web-auth';

// Wrap your app
<AuthProvider apiBase="https://registry.skillpkg.dev/api/v1">
  <App />
</AuthProvider>;

// In components
const { user, isAuthenticated, signOut } = useAuth();

// Protect routes
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>;
```

## Stack

React 19, React Router v7
