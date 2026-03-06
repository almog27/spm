# Skill Detail Page Improvements

Unified plan for improving skill detail pages across web and admin, plus supporting API/DB changes.

## Decisions Made

- **Size field**: Drop from UI (DB still stores `size_bytes` per version)
- **Suspend/Block**: Use existing `blocked` status with an unblock button in admin — no new status
- **Multi-author**: Support multiple authors per skill (new DB table)
- **Downloads graph**: 30-day sparkline in sidebar (web + admin), daily buckets

---

## Migration: 004_skill_collaborators.sql

New join table for multi-author support.

```sql
CREATE TABLE skill_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'collaborator', -- 'owner' | 'collaborator'
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (skill_id, user_id)
);

CREATE INDEX idx_skill_collaborators_skill ON skill_collaborators(skill_id);
CREATE INDEX idx_skill_collaborators_user ON skill_collaborators(user_id);

-- Backfill: insert current owners as collaborators with role 'owner'
INSERT INTO skill_collaborators (skill_id, user_id, role)
SELECT id, owner_id, 'owner' FROM skills;
```

Drizzle schema addition in `packages/api/src/db/schema.ts`:

```typescript
export const skillCollaborators = pgTable(
  'skill_collaborators',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    skillId: uuid('skill_id')
      .notNull()
      .references(() => skills.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role').notNull().default('collaborator'), // 'owner' | 'collaborator'
    addedAt: timestamp('added_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_skill_collaborators_unique').on(table.skillId, table.userId),
    index('idx_skill_collaborators_skill').on(table.skillId),
    index('idx_skill_collaborators_user').on(table.userId),
  ],
);
```

---

## API Changes

### 1. GET /skills/:name — update response

**Add fields:**

- `authors` — array of `{username, github_login, trust_tier, role}` (replaces single `author`)
- Keep `author` as the primary owner for backward compat (first item where role = 'owner')

**Remove from response:**

- Nothing removed — `author` stays as shorthand for primary owner

**Query change:** Join `skill_collaborators` + `users` to get all authors.

```typescript
const authorRows = await db
  .select({
    username: users.username,
    githubLogin: users.githubLogin,
    trustTier: users.trustTier,
    role: skillCollaborators.role,
  })
  .from(skillCollaborators)
  .innerJoin(users, eq(users.id, skillCollaborators.userId))
  .where(eq(skillCollaborators.skillId, skill.id))
  .orderBy(skillCollaborators.role); // 'owner' sorts before 'collaborator' (but better to sort explicitly)
```

Response shape:

```json
{
  "author": { "username": "alice", "github_login": "alice", "trust_tier": "verified" },
  "authors": [
    { "username": "alice", "github_login": "alice", "trust_tier": "verified", "role": "owner" },
    { "username": "bob", "github_login": "bob", "trust_tier": "registered", "role": "collaborator" }
  ]
}
```

### 2. GET /skills/:name/downloads — new endpoint

Returns daily download counts for the last 30 days (for sparkline graph).

```typescript
skillsRoutes.get('/skills/:name/downloads', async (c) => {
  const db = c.get('db');
  const name = c.req.param('name');

  const [skill] = await db
    .select({ id: skills.id })
    .from(skills)
    .where(eq(skills.name, name))
    .limit(1);
  if (!skill) return c.json(createApiError('SKILL_NOT_FOUND'), 404);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      date: sql<string>`DATE(${downloads.downloadedAt})`.as('date'),
      count: count(),
    })
    .from(downloads)
    .innerJoin(versions, eq(versions.id, downloads.versionId))
    .where(
      and(
        eq(versions.skillId, skill.id),
        sql`${downloads.downloadedAt} >= ${thirtyDaysAgo.toISOString()}`,
      ),
    )
    .groupBy(sql`DATE(${downloads.downloadedAt})`)
    .orderBy(sql`DATE(${downloads.downloadedAt})`);

  return c.json({ name, days: rows });
});
```

Response:

```json
{
  "name": "pdf",
  "days": [
    { "date": "2026-02-05", "count": 42 },
    { "date": "2026-02-06", "count": 58 },
    ...
  ]
}
```

Frontend fills in zero-count days client-side for the sparkline.

### 3. GET /admin/skills/:name/versions/:version — new endpoint

Returns version-specific readme_md + manifest for admin version selector.

```typescript
adminRoutes.get('/admin/skills/:name/versions/:version', async (c) => {
  // ... lookup skill + version
  return c.json({
    name: skill.name,
    version: ver.version,
    readme_md: ver.readmeMd,
    manifest: ver.manifest,
    published_at: ver.publishedAt.toISOString(),
    yanked: ver.yanked,
    signed: ver.sigstoreBundleKey != null,
    size_bytes: ver.sizeBytes,
  });
});
```

### 4. POST /admin/skills/:name/block and POST /admin/skills/:name/unblock

Already partially exists. Ensure both endpoints exist and toggle `skills.status` between `published` and `blocked`. Admin detail pane uses these.

---

## Web — packages/web/

### Task W1: Drop size from sidebar

**File:** `packages/web/src/pages/skill-detail/SkillSidebar.tsx`

Remove the "Size" stat row entirely.

**File:** `packages/web/src/pages/skill-detail/types.ts`

Remove `size: string` from `SkillFull` and `size: '--'` from `apiToSkillFull`.

### Task W2: Wire up links in sidebar

**File:** `packages/web/src/pages/skill-detail/SkillSidebar.tsx`

- **Repository**: wrap in `<a href={skill.repo} target="_blank" rel="noopener noreferrer">`. Hide if `skill.repo` is empty.
- **Report issue**: link to `/report?skill={skill.name}` or, if repo exists, to `{skill.repo}/issues`.

### Task W3: Show categories in skill detail

**File:** `packages/web/src/pages/skill-detail/SkillSidebar.tsx` or `SkillHero.tsx`

Add categories as clickable badges/tags below the description. Each links to `/search?category={cat}`.

### Task W4: Author as clickable link

**File:** `packages/web/src/pages/skill-detail/SkillHero.tsx`

Wrap `@{author}` in `<Link to={/authors/${author}}>`. Support multiple authors: show comma-separated links.

**File:** `packages/web/src/pages/skill-detail/SkillSidebar.tsx`

Update author card to list all authors. Each is a link to `/authors/{username}`.

### Task W5: Downloads sparkline

**File:** `packages/web/src/pages/skill-detail/SkillSidebar.tsx`

Replace the static "Downloads" number with:

- Total count (existing)
- Small SVG sparkline (30 days) below it

New API call: `GET /skills/:name/downloads` on page load.

Sparkline component: simple inline SVG `<polyline>` with filled area — no library needed.

### Task W6: Update types for multi-author

**File:** `packages/web/src/pages/skill-detail/types.ts`

```typescript
// Before
author: string;

// After
author: string; // primary owner (backward compat)
authors: Array<{ username: string; trust: TrustTier; role: string }>;
```

**File:** `packages/web/src/lib/api.ts`

Add `authors` array to `SkillDetailResponse`.

---

## Admin — packages/admin/

### Task A1: Add sub-tabs to detail pane

**File:** `packages/admin/src/components/SkillDetailPane.tsx`

Replace the current flat layout with tabs:

| Tab        | Content                                              |
| ---------- | ---------------------------------------------------- |
| README     | SKILL.md content (from `readme_md`), expand/collapse |
| Definition | Manifest JSON (existing, formatted)                  |
| Security   | Scan status, layers, signature info                  |

Use the same tab component pattern as the web skill detail page.

### Task A2: Version selector

**File:** `packages/admin/src/components/SkillDetailPane.tsx`

Add a `<select>` dropdown at the top of the tab area. Selecting a version calls `GET /admin/skills/:name/versions/:version` and swaps the README + Definition content for that version.

Default: latest version (pre-loaded from skill detail response).

### Task A3: Block/Unblock button

**File:** `packages/admin/src/components/SkillDetailPane.tsx`

Add to the actions section:

- If `status === 'published'`: show "Block" button (red) with confirmation modal + reason textarea
- If `status === 'blocked'`: show "Unblock" button (green)

Calls `POST /admin/skills/:name/block` or `/unblock`.

### Task A4: Author links in admin

Author names in admin detail pane should link to the author's GitHub profile (`https://github.com/{github_login}`) since admin doesn't have author profile pages. Show all collaborators with their roles.

### Task A5: Downloads sparkline in admin

Same sparkline component as web. Can be extracted to `packages/ui/` as a shared component.

### Task A6: Show categories in admin detail

Already shown as a list. Make them styled consistently with web (badge/tag style).

---

## Shared — packages/ui/

### Task U1: Sparkline component

```typescript
// packages/ui/src/components/Sparkline/Sparkline.tsx
export const Sparkline = ({
  data,
  width,
  height,
}: {
  data: number[]; // daily counts, length = 30
  width?: number; // default 120
  height?: number; // default 32
}) => {
  /* SVG polyline + filled area */
};
```

Reused in both web sidebar and admin detail pane.

### Task U2: CategoryBadge component (optional)

Small shared badge component for categories, reused across web and admin.

---

## Implementation Order

| #   | Task                                           | Package    | Depends on | Effort |
| --- | ---------------------------------------------- | ---------- | ---------- | ------ |
| 1   | Migration 004                                  | migrations | —          | S      |
| 2   | Drizzle schema: skillCollaborators             | api        | 1          | S      |
| 3   | API: multi-author in GET /skills/:name         | api        | 2          | S      |
| 4   | API: GET /skills/:name/downloads               | api        | —          | S      |
| 5   | API: GET /admin/skills/:name/versions/:version | api        | —          | S      |
| 6   | API: block/unblock endpoints                   | api        | —          | S      |
| 7   | W1: drop size                                  | web        | —          | XS     |
| 8   | W2: wire up links                              | web        | —          | XS     |
| 9   | W3: show categories                            | web        | —          | XS     |
| 10  | W4+W6: author links + multi-author             | web        | 3          | S      |
| 11  | U1: Sparkline component                        | ui         | —          | S      |
| 12  | W5: downloads sparkline                        | web        | 4, 11      | S      |
| 13  | A1: sub-tabs in admin                          | admin      | —          | M      |
| 14  | A2: version selector                           | admin      | 5          | M      |
| 15  | A3: block/unblock                              | admin      | 6          | S      |
| 16  | A4+A6: author links + categories               | admin      | 3          | S      |
| 17  | A5: sparkline in admin                         | admin      | 4, 11      | S      |

**Parallel tracks:**

- Track A (API): tasks 1-6 (sequential where noted)
- Track B (UI shared): task 11
- Track C (Web): tasks 7-10, then 12 after Track A + B
- Track D (Admin): tasks 13-14, then 15-17 after Track A + B

---

## Testing

- Migration: manual run + verify backfill
- API: add tests for multi-author response, downloads endpoint, version endpoint, block/unblock
- Web: update `skill-detail.test.tsx` for new fields (authors array, no size, categories rendered, links clickable)
- Admin: add tests for sub-tabs, version selector, block/unblock flow
- UI: unit test for Sparkline (renders SVG, handles empty data, handles single day)

---

## Files to Create

| File                                                         | Action            |
| ------------------------------------------------------------ | ----------------- |
| `migrations/004_skill_collaborators.sql`                     | Create            |
| `packages/ui/src/components/Sparkline/Sparkline.tsx`         | Create            |
| `packages/ui/src/components/Sparkline/Sparkline.test.tsx`    | Create            |
| `packages/ui/src/components/Sparkline/Sparkline.stories.tsx` | Create (optional) |

## Files to Modify

| File                                                   | Changes                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| `packages/api/src/db/schema.ts`                        | Add `skillCollaborators` table                                     |
| `packages/api/src/routes/skills.ts`                    | Multi-author query, downloads endpoint                             |
| `packages/api/src/routes/admin.ts`                     | Version endpoint, block/unblock                                    |
| `packages/web/src/lib/api.ts`                          | Add `authors`, remove size, add downloads API                      |
| `packages/web/src/pages/skill-detail/types.ts`         | Add `authors`, drop `size`                                         |
| `packages/web/src/pages/skill-detail/SkillSidebar.tsx` | Drop size, wire links, categories, sparkline, multi-author         |
| `packages/web/src/pages/skill-detail/SkillHero.tsx`    | Author as link, multi-author                                       |
| `packages/admin/src/components/SkillDetailPane.tsx`    | Sub-tabs, version selector, block/unblock, sparkline, author links |
| `packages/admin/src/lib/api.ts`                        | Add version endpoint, block/unblock, downloads API                 |
| `packages/ui/src/index.ts`                             | Export Sparkline                                                   |
