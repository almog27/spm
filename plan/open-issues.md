# SPM — Open Issues

Tracked issues and planned work that isn't yet implemented.

---

## ~~1. Logo~~ DONE

Logo added to web nav, admin nav, hero section, favicons, CLI banner, and repo assets.

### Remaining: GitHub Social Preview (manual)

1. Go to **github.com/almog27/spm** > **Settings** (top nav)
2. Scroll to **Social preview** section
3. Click **Edit** > **Upload an image**
4. Upload `assets/logo-dark.png` (dark background version — works best on social cards)
5. Click **Save**

**Optional:** Create a 1280x640px banner with logo + "SPM — Skills Package Manager for AI Agents" + skillpkg.dev

---

## 2. Imported / Community Skills — Author Handling

**Priority:** High
**Status:** Decision documented, **NOT yet implemented in code**

### Schema changes needed:

- `users` table: add `is_placeholder boolean NOT NULL DEFAULT false`
- `skills` table: add `imported_from text` (nullable) — source URL for imported skills

### Migration:

```sql
ALTER TABLE users ADD COLUMN is_placeholder boolean NOT NULL DEFAULT false;
ALTER TABLE skills ADD COLUMN imported_from text;
```

### Trust & Attribution (Decision: Option A+B)

Two-layer approach — trust tiers + transparent provenance:

- **Trust tier**: imported skills from known orgs (anthropic, vercel) get `verified` — the code is genuinely theirs
- **Provenance**: `imported_from` URL is always shown in UI ("Imported from github.com/anthropics/...")
- **Distinction**: "Verified" + "Imported" tag makes it clear: trustworthy code, but we imported it — the org didn't publish it themselves
- **Claim flow**: if the real org joins SPM, they claim the placeholder account → "Imported" tag disappears, becomes a normal `verified` publisher

### Logic to implement:

- Import script: create placeholder user per org (idempotent), publish under that user
- Trust tier: `verified` for known orgs (anthropic, vercel), `scanned` for unknown community sources
- UI: show "Imported from [source]" badge alongside trust tier badge when `imported_from` is set
- Read-only constraints: placeholder-owned skills cannot be yanked/updated via API
- Claim flow (future): real user proves org ownership → placeholder merged into their account

---

## 3. Publish CLI to npm

**Priority:** High

Publish the `spm` CLI package to npm so users can install it globally.

### TODO:

- Finalize package name — check if `spm` is available on npm, fallback to `@spm/cli` or `skillpkg`
- Set up `package.json` for publishing (name, version, bin, files, repository, license)
- Ensure `tsup` build output is correct for CLI execution (shebang, permissions)
- Add prepublish script (`pnpm build`)
- Publish workflow: manual or CI-triggered npm publish
- Test install flow: `npm install -g spm && spm --help`

---

## 4. MCP Server — Verify & Document

**Priority:** Medium
**Package:** `packages/mcp/`

### Verify:

- Confirm `spm_search`, `spm_info`, `spm_categories` tools work via stdio transport
- Test with a real MCP client (Claude Desktop, claude CLI)
- Ensure it connects to the live API (not mock data)

### Documentation needed:

- README in `packages/mcp/` with config snippets for Claude Desktop and claude CLI
- Publish to npm as `@spm/mcp`

---

## 5. Import Skills from External Sources

**Priority:** High
**Depends on:** Issue #2 (Author handling — DONE)
**Status:** Phase 1 DONE — script built, 22 skills ready to import

### Phase 1 (DONE): First-party imports

Script: `scripts/import-skills.ts`

```bash
# Dry run (no API needed):
pnpm exec tsx scripts/import-skills.ts --dry-run

# Real import (requires admin JWT + running API):
pnpm exec tsx scripts/import-skills.ts --api-url https://registry.skillpkg.dev --token <admin-jwt>
```

**Sources:**

- `anthropics/skills` — 17 skills (documents, frontend, productivity, testing, backend)
- `vercel-labs/agent-skills` — 5 skills (frontend, infra)

**Format:** SKILL.md with YAML frontmatter → parsed → manifest.json → .skl → published via API

**API support:** Admin users can set `X-Imported-From` header on publish to mark skills as imported.

### Phase 2 (TODO): Generic GitHub importer

- Import any `owner/repo` that follows the SKILL.md format
- Pull from skills.sh (200+ ranked) and skillsmp.com (400K+) directories
- `spm admin import --source github --repo org/repo`

### Considerations:

- License compliance (MIT, Apache-2.0 only)
- Attribution — preserve original author, link to source repo
- Deduplication — avoid importing same skill from different forks

---

## ~~6. robots.txt and AI Agent Discoverability~~ DONE

- Web: `robots.txt` (blocks AI crawlers, points to MCP), `llms.txt` (MCP-first), favicon
- Admin: `robots.txt` (blocks all)
- API: `/robots.txt` route (blocks AI crawlers), `/sitemap.xml` dynamic route from DB

---

## 7. Re-run Security Scan via Admin Panel

**Priority:** Medium

### TODO:

- `POST /admin/skills/:name/rescan` endpoint
- "Re-scan" button in admin UI skill detail + list actions
- Fetch `.skl` from R2, run through Layer 1/2/3, update `scan_status`
- Audit log: who triggered re-scan and result
- Bulk re-scan option (all skills matching a filter)
- "Scanning..." status indicator in UI

---

## ~~8. Admin Block/Unblock Skills~~ DONE

Endpoints (`POST /admin/skills/:name/block` and `/unblock`) and admin UI with confirmation all implemented.

---

## ~~9. Admin User Role Management~~ DONE

`PATCH /admin/users/:username/role` endpoint and UsersTab UI with promote/revoke flow implemented.

---

## ~~10. Multi-Author Display~~ DONE

DB schema, API response (`authors[]` on `GET /skills/:name`), web sidebar, and admin detail pane all implemented.

### Remaining (future): Collaborator Management

- `POST/DELETE /skills/:name/collaborators` API endpoints
- Dashboard UI for managing collaborators
- CLI: `spm collaborators add/remove/list`
- `/authors/:username` should include collaborated skills, not just owned

---

## ~~11. Downloads Sparkline API & UI~~ DONE

API endpoint, `Sparkline` component in `@spm/ui`, web sidebar and admin detail pane all implemented.

---

## ~~12. Security Enhancements~~ DONE

`SecurityBadge` component in `@spm/ui`, `GET /admin/skills/:name/versions/:version` endpoint implemented.

All published skills are fully scanned (Layer 1/2/3). No opt-out — simpler and safer.
Dropped `--no-security` flag and security filter (no partial scans = nothing to filter).

---

## 13. Post-Launch / Low Priority

### Email Notifications

- Resend integration for: publish success/held/blocked, review queue, trust tier promotions

### Distribution

- Homebrew formula (`spm.rb` with auto-bootstrap)
- Shell completions (bash, zsh, fish)

### GitHub Proxy Installs

- `spm install github:owner/repo/skill-name` syntax
- Install skills directly from GitHub without registry entry

### Documentation

- Improve root `README.md` (getting started, feature highlights)
- Add package-level READMEs (`packages/admin/`, `packages/ui/`, `packages/web-auth/`)
