# @spm/web

Public web UI for the SPM registry. Browse, search, and discover AI agent skills.

**Deployed to:** [skillpkg.dev](https://skillpkg.dev) (Cloudflare Pages)

## Pages

| Page               | Route                | Description                                                                 |
| ------------------ | -------------------- | --------------------------------------------------------------------------- |
| **Home**           | `/`                  | Hero search, trending tabs (featured/rising/most-installed/new), categories |
| **Search**         | `/search`            | Full-text search with sidebar filters, GitHub-style query syntax            |
| **Skill Detail**   | `/skills/:name`      | README, versions, security scan tabs                                        |
| **Author Profile** | `/authors/:username` | Author info and published skills                                            |
| **Dashboard**      | `/dashboard`         | User's skills, publish history, analytics (authenticated)                   |
| **Sign In**        | `/signin`            | GitHub device flow authentication                                           |

## Development

```bash
pnpm dev        # Start dev server
pnpm build      # Build for production
pnpm test       # Run unit tests (Vitest)
pnpm test:e2e   # Run e2e tests (Playwright)
pnpm typecheck  # Type check
```

## Stack

React 19, Vite, Tailwind v4, React Router v7, TanStack Query, Playwright, `@spm/ui`, `@spm/web-auth`
