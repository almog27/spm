---
name: spm-context
description: Load SPM project context when working on any SPM feature. Use when implementing features, fixing bugs, or adding new functionality to the SPM monorepo.
---

Before implementing anything, check the relevant spec docs in `plan/`:

- For API routes: read `plan/spm-registry-api.md`
- For DB changes: read `plan/spm-architecture.md` (section 4.5)
- For CLI commands: read `plan/spm-cli-output-design.md`
- For security: read `plan/spm-content-security.md`
- For categories/enums: read `plan/spm-authoring-flow.md`

Always import types from `@spm/shared`. Never duplicate type definitions.
Run `pnpm typecheck` after making changes to shared schemas.
