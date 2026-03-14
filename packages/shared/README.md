# @spm/shared

Core Zod schemas, TypeScript types, and constants shared across all SPM packages.

## Exports

### Schemas

| Schema                 | Description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| `ManifestSchema`       | Skill manifest validation (name, version, description, etc.) |
| `PublishRequestSchema` | Publish endpoint request shape                               |
| `SearchParamsSchema`   | Search query parameters                                      |
| `ReviewRequestSchema`  | Skill review submission                                      |
| `ReportRequestSchema`  | Abuse/security report                                        |
| `ResolveRequestSchema` | Version resolution query                                     |
| `SkillsJsonSchema`     | Local `skills.json` file format                              |
| `SkillsLockSchema`     | Lock file format                                             |

### Constants

| Constant          | Description                                             |
| ----------------- | ------------------------------------------------------- |
| `CATEGORIES`      | All skill category slugs                                |
| `CATEGORY_INFO`   | Category metadata (label, description, icon)            |
| `TRUST_TIERS`     | Trust tier levels (`registered`, `scanned`, `verified`) |
| `TRUST_TIER_INFO` | Tier metadata (label, color)                            |
| `ERROR_CODES`     | Standardized API error codes                            |

### Types

`Manifest`, `ManifestInput`, `SkillCategory`, `TrustTier`, `ErrorCode`, `ApiError`

## Usage

```ts
import { ManifestSchema, CATEGORIES, type Manifest } from '@spm/shared';

const result = ManifestSchema.safeParse(data);
```

## Development

```bash
pnpm build    # Build with tsup
pnpm test     # Run tests (49 tests)
```

## Stack

Zod, TypeScript, tsup
