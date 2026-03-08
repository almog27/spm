# SPM — Open Issues

Tracked issues and planned work that isn't yet implemented.

---

## ~~1. Logo~~ MOSTLY DONE

### Remaining: GitHub Social Preview

Set the repository's social preview image (shown when sharing links on Twitter, Slack, Discord, etc.):

1. Go to **github.com/almog27/spm** > **Settings** (top nav)
2. Scroll to **Social preview** section
3. Click **Edit** > **Upload an image**
4. Upload `assets/logo-dark.png` (dark background version — works best on social cards)
5. Click **Save**

**Recommended dimensions:** 1280x640px (2:1 ratio). The current `logo-dark.png` is 512x512 — consider creating a wider banner version with "SPM — Skills Package Manager" text alongside the logo for better social card appearance.

**Optional: Create a proper social banner**
- 1280x640px PNG with dark background (#080a0f)
- Logo on the left, "SPM" gradient text + tagline "Skills Package Manager for AI Agents" on the right
- Include URL: skillpkg.dev

## ~~2. Imported / Community Skills — Author Handling~~ DONE

Decision documented: Placeholder users approach. One user per org, idempotent creation, `is_placeholder` + `imported_from` columns. See git history for full design.

---

## 3. Publish SPM on npm

**Priority:** High

Publish the `spm` CLI package to npm so users can install it globally with `npm install -g spm`.

### TODO:

- Finalize package name — check if `spm` is available on npm, fallback to `@spm/cli` or `skillpkg`
- Set up `package.json` for publishing (name, version, bin, files, repository, license)
- Add `"bin": { "spm": "./dist/index.js" }` entry
- Ensure `tsup` build output is correct for CLI execution (shebang, permissions)
- Add prepublish script (`pnpm build`)
- Publish workflow: manual or CI-triggered npm publish
- Add `.npmignore` or `files` field to exclude test/source files
- Test install flow: `npm install -g spm && spm --help`

---

## 4. Skills MCP Server — Verify & Document

**Priority:** Medium
**Package:** `packages/mcp/`

Verify the MCP server works end-to-end, add documentation, and test with real queries.

### Verify:

- Confirm `spm_search`, `spm_info`, `spm_categories` tools work via stdio transport
- Test with a real MCP client (Claude Desktop, claude CLI)
- Ensure it connects to the live API (not mock data)

### Documentation needed:

- README in `packages/mcp/` with:
  - What it does (search SPM registry from any MCP-compatible AI agent)
  - Installation: `npm install -g @spm/mcp` or local path
  - Configuration for Claude Desktop (`claude_desktop_config.json` snippet)
  - Configuration for claude CLI (`.claude/mcp.json` snippet)
  - Available tools and example queries
- Add to main project README

### Test scenarios:

- "Find me a skill that does PDF manipulation"
- "What categories are available?"
- "Show me details about the pdf skill"
- "Find skills by anthropic"

---

## 5. Import Skills from External Sources

**Priority:** High
**Depends on:** Issue #2 (Author handling strategy)

Import existing skills/tools from Vercel, Anthropic, and other sources to bootstrap the SPM registry with valuable content.

### Sources to import from:

- **Anthropic** — official skill definitions (if available)
- **Vercel** — AI SDK tools, integrations
- **Community** — popular GitHub repos that define agent tools/skills

### Pipeline design:

- Script/CLI command to import: `spm admin import --source github --repo org/repo`
- Parse source format (SKILL.md, tool definitions, package.json) into SPM manifest
- Create `.skl` package from source
- Publish to registry under the source org's author name
- Tag with `imported: true` metadata
- Run through security scanner (Layer 1 at minimum)

### Considerations:

- License compliance — only import permissively licensed skills (MIT, Apache-2.0)
- Attribution — preserve original author, link back to source repo
- Versioning — how to track upstream updates? Pin to import-time version or sync?
- Quality — curate imports vs. bulk import everything
- Deduplication — avoid importing the same skill twice from different forks

---

## 6. robots.txt and AI Agent Discoverability

**Priority:** Medium

Add `robots.txt` and `llms.txt` to the web app so search engines and AI agents can discover and understand the registry.

### Files to add:

- **`robots.txt`** — Standard crawler directives (allow public pages, disallow admin/dashboard)
- **`llms.txt`** — Emerging standard for AI agent discoverability (see llmstxt.org). Describes what the site offers in a format optimized for LLMs.

### robots.txt content:

- Allow: `/`, `/skills/*`, `/search`, `/authors/*`, `/categories`
- Disallow: `/admin/*`, `/dashboard/*`
- Sitemap: link to `sitemap.xml` (generate dynamically or on build)

### llms.txt content:

- What SPM is (skills package manager for AI agents)
- How to search/browse skills
- Link to MCP server for programmatic access
- Available categories and how skills work
- API endpoint for agents that want to query directly

### Optional — sitemap.xml:

- Dynamic sitemap listing all published skills, categories, and author profiles
- Could be an API route (`/sitemap.xml`) or generated at build time

### Implementation:

- Add static files to `packages/web/public/`
- For dynamic sitemap, add an API route in `packages/api/`

---

## 7. Re-run Security Scan via Admin Panel

**Priority:** Medium

Allow admins to trigger a security re-scan of any published skill directly from the admin panel.

### Use cases:

- Scanner rules were updated — re-scan existing skills against new patterns
- A skill was manually approved but needs re-evaluation after policy change
- Bulk re-scan all skills after a Layer 2/3 scanner is deployed
- Spot-check a reported skill without waiting for a new publish

### TODO:

- **API endpoint:** `POST /admin/skills/:name/rescan` — triggers the security pipeline on the latest (or specified) version
- **Admin UI:** Add "Re-scan" button to skill detail pane and skill list actions
- **Pipeline:** Fetch `.skl` from R2, run through Layer 1 (regex) + Layer 2/3 if available, update `scan_status`
- **Audit log:** Record who triggered the re-scan and the result
- **Bulk action:** Option to re-scan all skills matching a filter (e.g., all `passed` skills, all skills by a specific author)
- **Status indicator:** Show "Scanning..." state in UI while scan is in progress
