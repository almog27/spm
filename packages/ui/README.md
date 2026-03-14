# @spm/ui

Shared React component library for SPM web and admin apps.

## Components

| Category        | Components                                                                |
| --------------- | ------------------------------------------------------------------------- |
| **Layout**      | `Sidebar`, `SidebarLayout`, `TopBar`, `Breadcrumb`, `SidebarUserFooter`   |
| **Typography**  | `Text` (variants: display, h1–h4, body, caption, label, tiny)             |
| **Badges**      | `Badge`, `StatusBadge`, `TrustBadge`, `SecurityBadge`, `PriorityDot`      |
| **Data**        | `Card`, `StatBox`, `BarSegment`, `MiniChart`, `Sparkline`, `ActivityItem` |
| **Form**        | `SearchInput`, `FilterDropdown`, `FilterTag`, `CopyButton`                |
| **Interactive** | `Button`, `Tabs`                                                          |

Also exports a `@spm/ui/shadcn` subpath with Radix-based primitives.

## Usage

```tsx
import { Text, TrustBadge, Sidebar } from '@spm/ui';

<Text variant="h2" font="mono" color="primary">Hello</Text>
<TrustBadge tier="verified" />
```

## Development

```bash
pnpm build    # Build with tsup
pnpm test     # Run tests
```

## Stack

React 19, Radix UI, Tailwind v4, tsup
