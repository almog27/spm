# @spm/admin

Admin dashboard for the SPM registry. Internal tool for reviewing flagged skills, managing users, and monitoring platform health.

**Deployed to:** [admin.skillpkg.dev](https://admin.skillpkg.dev) (Cloudflare Pages)

## Features

| Tab                  | Description                                         |
| -------------------- | --------------------------------------------------- |
| **Overview**         | Platform stats, queue depth, recent activity        |
| **Review Queue**     | Approve/block flagged skill versions                |
| **Skills**           | Browse all skills, block/unblock, view scan details |
| **Scan Analytics**   | Security scan pass/fail rates by layer              |
| **Users**            | Manage user roles, promote/revoke admin             |
| **Reports & Errors** | User-submitted reports, platform error log          |

## Development

```bash
pnpm dev       # Start dev server
pnpm build     # Build for production
pnpm test      # Run tests
pnpm typecheck # Type check
```

## Stack

React 19, Vite, Tailwind v4, React Router v7, TanStack Query, `@spm/ui`, `@spm/web-auth`
