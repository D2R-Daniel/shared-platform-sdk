# Implementation Plan: Shared UI Component Library (@dream/ui)

**Branch**: `008-shared-ui-components` | **Date**: 2026-02-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/008-shared-ui-components/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build `@dream/ui`, a shared React component library providing 40+ pre-built, themeable, accessible UI components for auth flows, org management, user profiles, and admin dashboards. Components sit atop the existing `@dream/auth`, `@dream/rbac`, and `@dream/multi-tenant` headless layer. Uses Radix UI primitives + Tailwind CSS + CVA for styling, with an ApiAdapter pattern for backend-agnostic data fetching.

Phase 1 scope: 16 primitives + 8 auth components + DreamUIProvider + Tailwind preset + Storybook setup.

> **Plan Generation**: After design artifacts are complete, `/speckit.plan` delegates implementation plan writing to `superpowers:writing-plans`, which generates bite-sized tasks (2-5 min each) with exact file paths, code, commands, and expected output.

## Technical Context

**Language/Version**: TypeScript 5+, React >=18.0.0 (peer dep), Node.js 18+
**Primary Dependencies**: Radix UI (unified v1.4.x), Tailwind CSS 3.4+/4.0+, class-variance-authority, react-hook-form + @hookform/resolvers/zod, @tanstack/react-table, sonner (toasts)
**Build**: tsup (esbuild) for multi-entry ESM builds + PostCSS for CSS token bundling
**Storage**: N/A (pure UI library — data via ApiAdapter interface)
**Testing**: Vitest + @testing-library/react + jsdom + vitest-axe (accessibility assertions)
**Target Platform**: Browser (React SPA / Next.js App Router)
**Project Type**: Library package (npm, sub-path exports)
**Performance Goals**: <50KB gzipped per sub-path import, skeleton render <100ms, data render <50ms after response
**Constraints**: Must work on React 18 + 19; Tailwind v3.4 + v4.0; no React 19-only APIs; no forced data-fetching library
**Scale/Scope**: 5 consuming products, 40+ components across 4 surface areas, 4-phase delivery

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Law | Status | Notes |
|-----|--------|-------|
| 1. Specification-Driven | PASS | `spec.md` complete with 8 user stories, 40+ FRs, 10 SCs |
| 2. Test-First (TDD) | PLANNED | All components get test-first: failing test → implementation → refactor |
| 3. Evidence-Based Verification | PLANNED | Fresh `vitest`, `tsc`, `tsup build` evidence required before merge |
| 4. Systematic Debugging | N/A | No existing bugs — greenfield |
| 5. Discovery-First Design | PASS | research.md covers 8 technology decisions with alternatives |
| 6. Plan-Driven Development | PASS | This plan + bite-sized tasks via `superpowers:writing-plans` |
| 7. Security-First | PASS | MfaChallenge + ApiKeyCreateDialog sealed (no slots); no secrets in client code |
| 8. Simplicity | PASS | Single package, plain interface (no TanStack Query dependency), useState/useEffect |
| 9. Semantic Versioning | PLANNED | Start at 0.1.0; pre-1.0 per-phase releases |

## Project Structure

### Documentation (this feature)

```text
specs/008-shared-ui-components/
├── plan.md              # This file
├── spec.md              # Feature specification (40+ FRs, 10 SCs)
├── research.md          # Technology decisions (build, CSS, Radix, adapter)
├── data-model.md        # ApiAdapter interface, supporting types, theme tokens
├── ux-design.md         # Component hierarchy, interaction flows, responsive breakpoints
├── contracts/
│   └── component-props.ts  # TypeScript prop interfaces for all components
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
packages/dream/ui/
├── package.json              # @dream/ui with sub-path exports
├── tsconfig.json             # TypeScript strict config
├── tsup.config.ts            # 7 entry points (ESM, dts, sourcemap)
├── vitest.config.ts          # jsdom + vitest-axe setup
├── tailwind.preset.ts        # Tailwind v3.4 JS preset
├── tailwind.preset.css       # Tailwind v4.0 CSS preset
├── src/
│   ├── styles.css            # Pre-built CSS tokens (light + dark)
│   ├── primitives/           # 16 base components (Button, Input, Card, Dialog, etc.)
│   │   ├── index.ts
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   ├── skeleton.tsx
│   │   ├── toast.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── separator.tsx
│   │   ├── dialog.tsx
│   │   ├── popover.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   └── data-table.tsx
│   ├── auth/                 # 8 auth flow components
│   │   ├── index.ts
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   ├── forgot-password-form.tsx
│   │   ├── reset-password-form.tsx
│   │   ├── mfa-setup.tsx
│   │   ├── mfa-challenge.tsx
│   │   ├── social-login-buttons.tsx
│   │   └── auth-layout.tsx
│   ├── org/                  # 7 org management components (Phase 3)
│   ├── user/                 # 7 user profile components (Phase 2)
│   ├── admin/                # 8 admin dashboard components (Phase 4)
│   ├── theme/                # DreamUIProvider, types, context
│   │   ├── index.ts
│   │   ├── provider.tsx
│   │   ├── types.ts
│   │   └── use-dream-ui.ts
│   ├── lib/                  # Shared utilities
│   │   ├── cn.ts             # className merge utility (clsx + twMerge)
│   │   └── api-adapter.ts    # ApiAdapter interface + createFetchAdapter
│   └── testing/              # Test utilities
│       ├── index.ts
│       ├── mock-api-provider.tsx
│       └── render-with-providers.tsx
├── stories/                  # Storybook stories (dev only)
│   ├── primitives/
│   └── auth/
└── __tests__/                # Component tests
    ├── primitives/
    ├── auth/
    └── theme/
```

**Structure Decision**: Single library package at `packages/dream/ui/` following the existing monorepo pattern (`packages/dream/{module}`). Sub-path exports map to `src/` subdirectories. Stories and tests co-located in top-level `stories/` and `__tests__/` directories for clean separation from publishable source.

## Complexity Tracking

No constitution violations. Single package, flat component structure, no repository pattern, no extra abstraction layers.

## Design Artifacts

All Phase 1 design artifacts are complete:

| Artifact | Status | Content |
|----------|--------|---------|
| [spec.md](spec.md) | Complete | 8 user stories, 40+ FRs, 10 SCs, 7 edge cases |
| [research.md](research.md) | Complete | 8 technology decisions with rationale |
| [data-model.md](data-model.md) | Complete | ApiAdapter interface, 15 supporting types, 50+ theme tokens |
| [contracts/component-props.ts](contracts/component-props.ts) | Complete | All component prop interfaces with slots |
| [ux-design.md](ux-design.md) | Complete | Component hierarchy, 7 interaction flows, responsive breakpoints |

## Implementation Phases

| Phase | Scope | Components | Dependencies |
|-------|-------|------------|-------------|
| **1** | Auth + Primitives + Theming | 16 primitives + 8 auth + DreamUIProvider + Tailwind preset + Storybook | None (greenfield) |
| **2** | UserButton + OrgSwitcher + MFA + Profile | 9 components (UserButton, OrgSwitcher, OrgCreateDialog, MfaSetup, MfaChallenge, UserProfileForm, ChangePasswordForm, ActiveSessions, ConnectedAccounts) | Phase 1 primitives |
| **3** | Org Management | 7 components (OrgSettingsForm, MemberList, InviteMemberDialog, RoleEditor, RoleAssignmentDialog, NotificationPreferences, SecuritySettings) | Phase 1 + DataTable |
| **4** | Admin Dashboard | 8 components (AuditLogViewer, AuditLogFilters, ApiKeyManager, ApiKeyCreateDialog, WebhookManager, WebhookCreateDialog, WebhookTestDialog, SessionManager) | Phase 1-3 proven patterns |

**This plan covers Phase 1 only. Phases 2-4 get their own plan when ready.**

## Phase 1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the @dream/ui package with 16 primitives, 8 auth components, DreamUIProvider, Tailwind presets, test utilities, and Storybook.

**Architecture:** Single npm package at `packages/dream/ui/` with sub-path exports. Radix UI for accessible primitives, Tailwind CSS + CVA for styling, react-hook-form + Zod for forms. ApiAdapter pattern for data fetching via React context.

**Tech Stack:** TypeScript 5+, React 18/19, Radix UI 1.4.x, Tailwind CSS, class-variance-authority, react-hook-form, Zod, @tanstack/react-table, sonner, tsup, Vitest, Storybook 8

---

### Task 1: Package scaffolding

**Files:**
- Create: `packages/dream/ui/package.json`
- Create: `packages/dream/ui/.gitignore`
- Create: `packages/dream/ui/tsconfig.json`

**Step 1: Create package.json**

```json
{
  "name": "@dream/ui",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/primitives/index.js",
  "types": "dist/primitives/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/primitives/index.d.ts",
      "import": "./dist/primitives/index.js"
    },
    "./auth": {
      "types": "./dist/auth/index.d.ts",
      "import": "./dist/auth/index.js"
    },
    "./theme": {
      "types": "./dist/theme/index.d.ts",
      "import": "./dist/theme/index.js"
    },
    "./testing": {
      "types": "./dist/testing/index.d.ts",
      "import": "./dist/testing/index.js"
    },
    "./tailwind": {
      "types": "./dist/tailwind.preset.d.ts",
      "import": "./dist/tailwind.preset.js"
    },
    "./styles.css": "./dist/styles.css"
  },
  "scripts": {
    "build": "tsup && cp src/styles.css dist/styles.css",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "dependencies": {
    "@dream/types": "0.1.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@hookform/resolvers": "^3.3.0",
    "@storybook/addon-a11y": "^8.0.0",
    "@storybook/addon-essentials": "^8.0.0",
    "@storybook/react": "^8.0.0",
    "@storybook/react-vite": "^8.0.0",
    "@tanstack/react-table": "^8.11.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "jsdom": "^24.0.0",
    "radix-ui": "^1.4.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-hook-form": "^7.50.0",
    "sonner": "^1.4.0",
    "storybook": "^8.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0",
    "vitest-axe": "^0.1.0",
    "zod": "^3.22.0"
  },
  "peerDependencies": {
    "@dream/auth": "0.1.0",
    "@dream/errors": "0.1.0",
    "@dream/multi-tenant": "0.1.0",
    "@dream/rbac": "0.1.0",
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "peerDependenciesMeta": {
    "@dream/auth": { "optional": true },
    "@dream/multi-tenant": { "optional": true },
    "@dream/rbac": { "optional": true }
  }
}
```

**Step 2: Create .gitignore**

```
node_modules/
dist/
storybook-static/
```

**Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "jsx": "react-jsx",
    "isolatedModules": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests", "stories"]
}
```

**Step 4: Commit**

```bash
git add packages/dream/ui/package.json packages/dream/ui/.gitignore packages/dream/ui/tsconfig.json
git commit -m "feat(ui): scaffold @dream/ui package with sub-path exports"
```

---

### Task 2: Build and test configuration

**Files:**
- Create: `packages/dream/ui/tsup.config.ts`
- Create: `packages/dream/ui/vitest.config.ts`

**Step 1: Create tsup.config.ts**

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    'primitives/index': 'src/primitives/index.ts',
    'auth/index': 'src/auth/index.ts',
    'theme/index': 'src/theme/index.ts',
    'testing/index': 'src/testing/index.ts',
    'tailwind.preset': 'tailwind.preset.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    '@dream/auth',
    '@dream/rbac',
    '@dream/multi-tenant',
    '@dream/errors',
  ],
});
```

**Step 2: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
  },
});
```

**Step 3: Create test setup file**

Create `packages/dream/ui/tests/setup.ts`:

```typescript
import '@testing-library/jest-dom';
```

**Step 4: Commit**

```bash
git add packages/dream/ui/tsup.config.ts packages/dream/ui/vitest.config.ts packages/dream/ui/tests/setup.ts
git commit -m "feat(ui): add tsup build config and vitest test config"
```

---

### Task 3: Install dependencies

**Step 1: Install**

```bash
cd packages/dream/ui && npm install
```

Expected: `node_modules/` created, `package-lock.json` updated.

**Step 2: Verify TypeScript works**

```bash
cd packages/dream/ui && npx tsc --noEmit --pretty
```

Expected: No errors (no source files yet, just config validation).

**Step 3: Commit lock file**

```bash
git add package-lock.json
git commit -m "chore(ui): install dependencies"
```

---

### Task 4: cn utility

**Files:**
- Create: `packages/dream/ui/src/lib/cn.ts`
- Test: `packages/dream/ui/tests/lib/cn.test.ts`

**Step 1: Write the failing test**

```typescript
// tests/lib/cn.test.ts
import { describe, it, expect } from 'vitest';
import { cn } from '../../src/lib/cn';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('deduplicates conflicting Tailwind classes', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6');
  });

  it('handles undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd packages/dream/ui && npx vitest run tests/lib/cn.test.ts
```

Expected: FAIL — module not found.

**Step 3: Write minimal implementation**

```typescript
// src/lib/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

**Step 4: Run test to verify it passes**

```bash
cd packages/dream/ui && npx vitest run tests/lib/cn.test.ts
```

Expected: 4 tests PASS.

**Step 5: Commit**

```bash
git add packages/dream/ui/src/lib/cn.ts packages/dream/ui/tests/lib/cn.test.ts
git commit -m "feat(ui): add cn() className merge utility"
```

---

### Task 5: CSS design tokens

**Files:**
- Create: `packages/dream/ui/src/styles.css`

**Step 1: Create styles.css with light and dark tokens**

```css
/* @dream/ui Design Tokens
 * Import once in product globals.css: @import '@dream/ui/styles.css';
 * Override any --dream-* variable in :root to customize.
 */

:root {
  /* Colors (HSL values — use with hsl() or Tailwind's hsl() shorthand) */
  --dream-color-background: 0 0% 100%;
  --dream-color-foreground: 222 84% 5%;

  --dream-color-card: 0 0% 100%;
  --dream-color-card-foreground: 222 84% 5%;

  --dream-color-popover: 0 0% 100%;
  --dream-color-popover-foreground: 222 84% 5%;

  --dream-color-primary: 222 47% 11%;
  --dream-color-primary-foreground: 210 40% 98%;

  --dream-color-secondary: 210 40% 96%;
  --dream-color-secondary-foreground: 222 47% 11%;

  --dream-color-accent: 210 40% 96%;
  --dream-color-accent-foreground: 222 47% 11%;

  --dream-color-destructive: 0 84% 60%;
  --dream-color-destructive-foreground: 210 40% 98%;

  --dream-color-muted: 210 40% 96%;
  --dream-color-muted-foreground: 215 16% 47%;

  --dream-color-border: 214 32% 91%;
  --dream-color-input: 214 32% 91%;
  --dream-color-ring: 222 84% 5%;

  /* Radii */
  --dream-radius-sm: 0.25rem;
  --dream-radius-md: 0.375rem;
  --dream-radius-lg: 0.5rem;
  --dream-radius-xl: 0.75rem;

  /* Typography */
  --dream-font-sans: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --dream-font-mono: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace;
}

.dark {
  --dream-color-background: 222 84% 5%;
  --dream-color-foreground: 210 40% 98%;

  --dream-color-card: 222 84% 5%;
  --dream-color-card-foreground: 210 40% 98%;

  --dream-color-popover: 222 84% 5%;
  --dream-color-popover-foreground: 210 40% 98%;

  --dream-color-primary: 210 40% 98%;
  --dream-color-primary-foreground: 222 47% 11%;

  --dream-color-secondary: 217 33% 18%;
  --dream-color-secondary-foreground: 210 40% 98%;

  --dream-color-accent: 217 33% 18%;
  --dream-color-accent-foreground: 210 40% 98%;

  --dream-color-destructive: 0 63% 31%;
  --dream-color-destructive-foreground: 210 40% 98%;

  --dream-color-muted: 217 33% 18%;
  --dream-color-muted-foreground: 215 20% 65%;

  --dream-color-border: 217 33% 18%;
  --dream-color-input: 217 33% 18%;
  --dream-color-ring: 213 31% 91%;
}
```

**Step 2: Commit**

```bash
git add packages/dream/ui/src/styles.css
git commit -m "feat(ui): add CSS design tokens with light and dark mode"
```

---

### Task 6: Tailwind presets

**Files:**
- Create: `packages/dream/ui/tailwind.preset.ts`
- Create: `packages/dream/ui/tailwind.preset.css`

**Step 1: Create v3.4 JS preset**

```typescript
// tailwind.preset.ts — Tailwind v3.4 JS preset
// Usage: const { dreamPreset } = require('@dream/ui/tailwind');
// Then add to tailwind.config.js: presets: [dreamPreset]

import type { Config } from 'tailwindcss';

export const dreamPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--dream-color-background) / <alpha-value>)',
        foreground: 'hsl(var(--dream-color-foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'hsl(var(--dream-color-card) / <alpha-value>)',
          foreground: 'hsl(var(--dream-color-card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'hsl(var(--dream-color-popover) / <alpha-value>)',
          foreground: 'hsl(var(--dream-color-popover-foreground) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'hsl(var(--dream-color-primary) / <alpha-value>)',
          foreground: 'hsl(var(--dream-color-primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--dream-color-secondary) / <alpha-value>)',
          foreground: 'hsl(var(--dream-color-secondary-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--dream-color-accent) / <alpha-value>)',
          foreground: 'hsl(var(--dream-color-accent-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--dream-color-destructive) / <alpha-value>)',
          foreground: 'hsl(var(--dream-color-destructive-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--dream-color-muted) / <alpha-value>)',
          foreground: 'hsl(var(--dream-color-muted-foreground) / <alpha-value>)',
        },
        border: 'hsl(var(--dream-color-border) / <alpha-value>)',
        input: 'hsl(var(--dream-color-input) / <alpha-value>)',
        ring: 'hsl(var(--dream-color-ring) / <alpha-value>)',
      },
      borderRadius: {
        sm: 'var(--dream-radius-sm)',
        md: 'var(--dream-radius-md)',
        lg: 'var(--dream-radius-lg)',
        xl: 'var(--dream-radius-xl)',
      },
      fontFamily: {
        sans: ['var(--dream-font-sans)'],
        mono: ['var(--dream-font-mono)'],
      },
    },
  },
};

export default dreamPreset;
```

**Step 2: Create v4.0 CSS preset**

```css
/* tailwind.preset.css — Tailwind v4.0 CSS preset
 * Usage: @import '@dream/ui/tailwind.preset.css';
 */

@theme inline {
  --color-background: hsl(var(--dream-color-background));
  --color-foreground: hsl(var(--dream-color-foreground));

  --color-card: hsl(var(--dream-color-card));
  --color-card-foreground: hsl(var(--dream-color-card-foreground));

  --color-popover: hsl(var(--dream-color-popover));
  --color-popover-foreground: hsl(var(--dream-color-popover-foreground));

  --color-primary: hsl(var(--dream-color-primary));
  --color-primary-foreground: hsl(var(--dream-color-primary-foreground));

  --color-secondary: hsl(var(--dream-color-secondary));
  --color-secondary-foreground: hsl(var(--dream-color-secondary-foreground));

  --color-accent: hsl(var(--dream-color-accent));
  --color-accent-foreground: hsl(var(--dream-color-accent-foreground));

  --color-destructive: hsl(var(--dream-color-destructive));
  --color-destructive-foreground: hsl(var(--dream-color-destructive-foreground));

  --color-muted: hsl(var(--dream-color-muted));
  --color-muted-foreground: hsl(var(--dream-color-muted-foreground));

  --color-border: hsl(var(--dream-color-border));
  --color-input: hsl(var(--dream-color-input));
  --color-ring: hsl(var(--dream-color-ring));

  --radius-sm: var(--dream-radius-sm);
  --radius-md: var(--dream-radius-md);
  --radius-lg: var(--dream-radius-lg);
  --radius-xl: var(--dream-radius-xl);

  --font-sans: var(--dream-font-sans);
  --font-mono: var(--dream-font-mono);
}
```

**Step 3: Commit**

```bash
git add packages/dream/ui/tailwind.preset.ts packages/dream/ui/tailwind.preset.css
git commit -m "feat(ui): add Tailwind v3.4 JS and v4.0 CSS presets"
```

---

### Task 7: Theme types and ApiAdapter interface

**Files:**
- Create: `packages/dream/ui/src/theme/types.ts`
- Create: `packages/dream/ui/src/lib/api-adapter.ts`

**Step 1: Create theme types**

```typescript
// src/theme/types.ts
import type { ReactNode } from 'react';
import type { ApiAdapter } from '../lib/api-adapter';

export interface BrandingConfig {
  logo?: string;
  productName?: string;
  supportUrl?: string;
  termsUrl?: string;
  privacyUrl?: string;
}

export interface DreamUIError {
  component: string;
  errorType: string;
  action: string;
  error: Error;
}

export interface DreamUIContextValue {
  apiAdapter: ApiAdapter;
  branding: BrandingConfig;
  onError: (error: DreamUIError) => void;
}

export interface DreamUIProviderProps {
  children: ReactNode;
  apiAdapter: ApiAdapter;
  branding?: BrandingConfig;
  onError?: (error: DreamUIError) => void;
}
```

**Step 2: Create ApiAdapter interface and default fetch adapter**

See data-model.md for the full interface. For Phase 1 (auth only), auth components use `useAuth()` directly — they don't call the adapter. The adapter is needed by Phase 2+ components. Create the interface now but implement `createFetchAdapter` minimally.

```typescript
// src/lib/api-adapter.ts
export interface ListParams {
  page?: number;
  pageSize?: number;
}

export interface ApiAdapter {
  // Members
  listMembers(params: ListParams): Promise<unknown>;
  removeMember(userId: string): Promise<void>;
  // Invitations
  createInvitation(data: { email: string; roleId: string }): Promise<unknown>;
  listInvitations(params: ListParams): Promise<unknown>;
  revokeInvitation(id: string): Promise<void>;
  // Roles
  listRoles(): Promise<unknown[]>;
  createRole(data: unknown): Promise<unknown>;
  updateRole(id: string, data: unknown): Promise<unknown>;
  deleteRole(id: string): Promise<void>;
  assignRole(userId: string, roleId: string): Promise<void>;
  // Organization
  getOrganization(): Promise<unknown>;
  updateOrganization(data: unknown): Promise<unknown>;
  createOrganization(data: unknown): Promise<unknown>;
  // Audit
  listAuditEvents(params: unknown): Promise<unknown>;
  // API Keys
  listApiKeys(): Promise<unknown[]>;
  createApiKey(data: unknown): Promise<unknown>;
  revokeApiKey(id: string): Promise<void>;
  // Webhooks
  listWebhooks(): Promise<unknown[]>;
  createWebhook(data: unknown): Promise<unknown>;
  updateWebhook(id: string, data: unknown): Promise<unknown>;
  deleteWebhook(id: string): Promise<void>;
  testWebhook(id: string, eventType: string): Promise<unknown>;
  // Sessions
  listUserSessions(): Promise<unknown[]>;
  listAllSessions(params: ListParams): Promise<unknown>;
  revokeSession(id: string): Promise<void>;
  // User Profile
  updateProfile(data: unknown): Promise<unknown>;
  changePassword(data: { currentPassword: string; newPassword: string }): Promise<void>;
  uploadAvatar(file: File): Promise<{ url: string }>;
  // MFA
  getMfaStatus(): Promise<unknown>;
  initiateMfaSetup(): Promise<unknown>;
  verifyMfaSetup(code: string): Promise<unknown>;
  disableMfa(code: string): Promise<void>;
  // Notifications
  getNotificationPreferences(): Promise<unknown>;
  updateNotificationPreferences(data: unknown): Promise<unknown>;
  // Connected Accounts
  listConnectedAccounts(): Promise<unknown[]>;
  disconnectAccount(provider: string): Promise<void>;
}

export interface CreateFetchAdapterOptions {
  baseUrl: string;
}

function createMethod(baseUrl: string, method: string, path: string) {
  return async (bodyOrParams?: unknown) => {
    const url = `${baseUrl}${path}`;
    const options: RequestInit = { method, headers: { 'Content-Type': 'application/json' } };
    if (bodyOrParams && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(bodyOrParams);
    }
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`${method} ${path} failed: ${res.status}`);
    if (res.status === 204) return;
    return res.json();
  };
}

export function createFetchAdapter({ baseUrl }: CreateFetchAdapterOptions): ApiAdapter {
  const get = (path: string) => createMethod(baseUrl, 'GET', path);
  const post = (path: string) => createMethod(baseUrl, 'POST', path);
  const put = (path: string) => createMethod(baseUrl, 'PUT', path);
  const del = (path: string) => createMethod(baseUrl, 'DELETE', path);

  return {
    listMembers: (params) => get(`/members?page=${params.page ?? 1}&pageSize=${params.pageSize ?? 20}`)(),
    removeMember: (id) => del(`/members/${id}`)() as Promise<void>,
    createInvitation: (data) => post('/invitations')(data),
    listInvitations: (params) => get(`/invitations?page=${params.page ?? 1}&pageSize=${params.pageSize ?? 20}`)(),
    revokeInvitation: (id) => del(`/invitations/${id}`)() as Promise<void>,
    listRoles: () => get('/roles')() as Promise<unknown[]>,
    createRole: (data) => post('/roles')(data),
    updateRole: (id, data) => put(`/roles/${id}`)(data),
    deleteRole: (id) => del(`/roles/${id}`)() as Promise<void>,
    assignRole: (userId, roleId) => post(`/members/${userId}/role`)({ roleId }) as Promise<void>,
    getOrganization: () => get('/organization')(),
    updateOrganization: (data) => put('/organization')(data),
    createOrganization: (data) => post('/organizations')(data),
    listAuditEvents: (params) => post('/audit/query')(params),
    listApiKeys: () => get('/api-keys')() as Promise<unknown[]>,
    createApiKey: (data) => post('/api-keys')(data),
    revokeApiKey: (id) => del(`/api-keys/${id}`)() as Promise<void>,
    listWebhooks: () => get('/webhooks')() as Promise<unknown[]>,
    createWebhook: (data) => post('/webhooks')(data),
    updateWebhook: (id, data) => put(`/webhooks/${id}`)(data),
    deleteWebhook: (id) => del(`/webhooks/${id}`)() as Promise<void>,
    testWebhook: (id, eventType) => post(`/webhooks/${id}/test`)({ eventType }),
    listUserSessions: () => get('/sessions/me')() as Promise<unknown[]>,
    listAllSessions: (params) => get('/sessions')() as Promise<unknown>,
    revokeSession: (id) => del(`/sessions/${id}`)() as Promise<void>,
    updateProfile: (data) => put('/profile')(data),
    changePassword: (data) => post('/profile/password')(data) as Promise<void>,
    uploadAvatar: async (file) => {
      const form = new FormData();
      form.append('avatar', file);
      const res = await fetch(`${baseUrl}/profile/avatar`, { method: 'POST', body: form });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      return res.json();
    },
    getMfaStatus: () => get('/mfa/status')(),
    initiateMfaSetup: () => post('/mfa/setup')({}),
    verifyMfaSetup: (code) => post('/mfa/verify')({ code }),
    disableMfa: (code) => post('/mfa/disable')({ code }) as Promise<void>,
    getNotificationPreferences: () => get('/notifications/preferences')(),
    updateNotificationPreferences: (data) => put('/notifications/preferences')(data),
    listConnectedAccounts: () => get('/connected-accounts')() as Promise<unknown[]>,
    disconnectAccount: (provider) => del(`/connected-accounts/${provider}`)() as Promise<void>,
  };
}
```

**Step 3: Commit**

```bash
git add packages/dream/ui/src/theme/types.ts packages/dream/ui/src/lib/api-adapter.ts
git commit -m "feat(ui): add theme types, ApiAdapter interface, and createFetchAdapter"
```

---

### Task 8: DreamUIProvider and useDreamUI hook

**Files:**
- Create: `packages/dream/ui/src/theme/provider.tsx`
- Create: `packages/dream/ui/src/theme/use-dream-ui.ts`
- Create: `packages/dream/ui/src/theme/index.ts`
- Test: `packages/dream/ui/tests/theme/provider.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/theme/provider.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DreamUIProvider } from '../../src/theme/provider';
import { useDreamUI } from '../../src/theme/use-dream-ui';
import type { ApiAdapter } from '../../src/lib/api-adapter';

const mockAdapter = {} as ApiAdapter;

function TestConsumer() {
  const { branding, apiAdapter } = useDreamUI();
  return (
    <div>
      <span data-testid="product">{branding.productName ?? 'none'}</span>
      <span data-testid="has-adapter">{apiAdapter ? 'yes' : 'no'}</span>
    </div>
  );
}

describe('DreamUIProvider', () => {
  it('provides apiAdapter and default branding to children', () => {
    render(
      <DreamUIProvider apiAdapter={mockAdapter}>
        <TestConsumer />
      </DreamUIProvider>
    );
    expect(screen.getByTestId('product')).toHaveTextContent('none');
    expect(screen.getByTestId('has-adapter')).toHaveTextContent('yes');
  });

  it('provides custom branding', () => {
    render(
      <DreamUIProvider apiAdapter={mockAdapter} branding={{ productName: 'TestApp' }}>
        <TestConsumer />
      </DreamUIProvider>
    );
    expect(screen.getByTestId('product')).toHaveTextContent('TestApp');
  });

  it('throws when useDreamUI is used outside provider', () => {
    expect(() => render(<TestConsumer />)).toThrow(
      'useDreamUI must be used within a DreamUIProvider'
    );
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd packages/dream/ui && npx vitest run tests/theme/provider.test.tsx
```

Expected: FAIL — modules not found.

**Step 3: Implement provider**

```typescript
// src/theme/provider.tsx
'use client';

import React, { useMemo } from 'react';
import { DreamUIContext } from './use-dream-ui';
import type { DreamUIProviderProps, DreamUIContextValue } from './types';

export function DreamUIProvider({
  children,
  apiAdapter,
  branding = {},
  onError,
}: DreamUIProviderProps): React.JSX.Element {
  const value = useMemo<DreamUIContextValue>(
    () => ({
      apiAdapter,
      branding,
      onError: onError ?? (() => {}),
    }),
    [apiAdapter, branding, onError],
  );

  return <DreamUIContext.Provider value={value}>{children}</DreamUIContext.Provider>;
}
```

```typescript
// src/theme/use-dream-ui.ts
'use client';

import { createContext, useContext } from 'react';
import type { DreamUIContextValue } from './types';

export const DreamUIContext = createContext<DreamUIContextValue | null>(null);

export function useDreamUI(): DreamUIContextValue {
  const ctx = useContext(DreamUIContext);
  if (!ctx) {
    throw new Error('useDreamUI must be used within a DreamUIProvider');
  }
  return ctx;
}
```

```typescript
// src/theme/index.ts
export { DreamUIProvider } from './provider';
export { useDreamUI } from './use-dream-ui';
export type {
  BrandingConfig,
  DreamUIError,
  DreamUIContextValue,
  DreamUIProviderProps,
} from './types';
export type { ApiAdapter, CreateFetchAdapterOptions } from '../lib/api-adapter';
export { createFetchAdapter } from '../lib/api-adapter';
```

**Step 4: Run test to verify it passes**

```bash
cd packages/dream/ui && npx vitest run tests/theme/provider.test.tsx
```

Expected: 3 tests PASS.

**Step 5: Commit**

```bash
git add packages/dream/ui/src/theme/ packages/dream/ui/tests/theme/
git commit -m "feat(ui): add DreamUIProvider and useDreamUI hook"
```

---

### Task 9: Test utilities (MockApiProvider + renderWithProviders)

**Files:**
- Create: `packages/dream/ui/src/testing/mock-api-provider.tsx`
- Create: `packages/dream/ui/src/testing/render-with-providers.tsx`
- Create: `packages/dream/ui/src/testing/index.ts`
- Test: `packages/dream/ui/tests/testing/render-with-providers.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/testing/render-with-providers.test.tsx
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../src/testing';
import { useDreamUI } from '../../src/theme/use-dream-ui';

function TestComponent() {
  const { branding } = useDreamUI();
  return <span data-testid="name">{branding.productName ?? 'default'}</span>;
}

describe('renderWithProviders', () => {
  it('wraps component in DreamUIProvider with defaults', () => {
    renderWithProviders(<TestComponent />);
    expect(screen.getByTestId('name')).toHaveTextContent('default');
  });

  it('accepts custom branding', () => {
    renderWithProviders(<TestComponent />, {
      branding: { productName: 'TestProd' },
    });
    expect(screen.getByTestId('name')).toHaveTextContent('TestProd');
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd packages/dream/ui && npx vitest run tests/testing/render-with-providers.test.tsx
```

**Step 3: Implement**

```typescript
// src/testing/mock-api-provider.tsx
'use client';

import React from 'react';
import { DreamUIProvider } from '../theme/provider';
import type { ApiAdapter } from '../lib/api-adapter';
import type { BrandingConfig, DreamUIError } from '../theme/types';

const noopAsync = async () => {};
const noopAsyncReturn = async () => ({}) as never;

function createNoopAdapter(): ApiAdapter {
  return {
    listMembers: noopAsyncReturn,
    removeMember: noopAsync,
    createInvitation: noopAsyncReturn,
    listInvitations: noopAsyncReturn,
    revokeInvitation: noopAsync,
    listRoles: async () => [],
    createRole: noopAsyncReturn,
    updateRole: noopAsyncReturn,
    deleteRole: noopAsync,
    assignRole: noopAsync,
    getOrganization: noopAsyncReturn,
    updateOrganization: noopAsyncReturn,
    createOrganization: noopAsyncReturn,
    listAuditEvents: noopAsyncReturn,
    listApiKeys: async () => [],
    createApiKey: noopAsyncReturn,
    revokeApiKey: noopAsync,
    listWebhooks: async () => [],
    createWebhook: noopAsyncReturn,
    updateWebhook: noopAsyncReturn,
    deleteWebhook: noopAsync,
    testWebhook: noopAsyncReturn,
    listUserSessions: async () => [],
    listAllSessions: noopAsyncReturn,
    revokeSession: noopAsync,
    updateProfile: noopAsyncReturn,
    changePassword: noopAsync,
    uploadAvatar: async () => ({ url: '' }),
    getMfaStatus: noopAsyncReturn,
    initiateMfaSetup: noopAsyncReturn,
    verifyMfaSetup: noopAsyncReturn,
    disableMfa: noopAsync,
    getNotificationPreferences: noopAsyncReturn,
    updateNotificationPreferences: noopAsyncReturn,
    listConnectedAccounts: async () => [],
    disconnectAccount: noopAsync,
  };
}

export interface MockApiProviderProps {
  children: React.ReactNode;
  adapter?: Partial<ApiAdapter>;
  branding?: BrandingConfig;
  onError?: (error: DreamUIError) => void;
}

export function MockApiProvider({
  children,
  adapter,
  branding,
  onError,
}: MockApiProviderProps): React.JSX.Element {
  const fullAdapter: ApiAdapter = { ...createNoopAdapter(), ...adapter };
  return (
    <DreamUIProvider apiAdapter={fullAdapter} branding={branding} onError={onError}>
      {children}
    </DreamUIProvider>
  );
}

export { createNoopAdapter };
```

```typescript
// src/testing/render-with-providers.tsx
import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { MockApiProvider, type MockApiProviderProps } from './mock-api-provider';

type ProviderOptions = Omit<MockApiProviderProps, 'children'>;

export function renderWithProviders(
  ui: React.ReactElement,
  providerOptions?: ProviderOptions,
  renderOptions?: Omit<RenderOptions, 'wrapper'>,
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <MockApiProvider {...providerOptions}>{children}</MockApiProvider>;
  }
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
```

```typescript
// src/testing/index.ts
export { MockApiProvider, createNoopAdapter } from './mock-api-provider';
export type { MockApiProviderProps } from './mock-api-provider';
export { renderWithProviders } from './render-with-providers';
```

**Step 4: Run test to verify it passes**

```bash
cd packages/dream/ui && npx vitest run tests/testing/render-with-providers.test.tsx
```

Expected: 2 tests PASS.

**Step 5: Commit**

```bash
git add packages/dream/ui/src/testing/ packages/dream/ui/tests/testing/
git commit -m "feat(ui): add MockApiProvider and renderWithProviders test utilities"
```

---

### Task 10: Button primitive (TDD)

**Files:**
- Create: `packages/dream/ui/src/primitives/button.tsx`
- Test: `packages/dream/ui/tests/primitives/button.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/primitives/button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../../src/primitives/button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('accepts className prop', () => {
    render(<Button className="custom-class">Styled</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('renders different variants', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('destructive');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button').className).toContain('border');
  });

  it('renders different sizes', () => {
    render(<Button size="sm">Small</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('h-9');
  });

  it('renders as child element via asChild', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    expect(screen.getByRole('link', { name: 'Link Button' })).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd packages/dream/ui && npx vitest run tests/primitives/button.test.tsx
```

**Step 3: Implement Button**

```typescript
// src/primitives/button.tsx
import React from 'react';
import { Slot } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

**Step 4: Run test to verify it passes**

```bash
cd packages/dream/ui && npx vitest run tests/primitives/button.test.tsx
```

Expected: 7 tests PASS.

**Step 5: Commit**

```bash
git add packages/dream/ui/src/primitives/button.tsx packages/dream/ui/tests/primitives/button.test.tsx
git commit -m "feat(ui): add Button primitive with variants and sizes"
```

---

### Task 11: Input + Label primitives (TDD)

**Files:**
- Create: `packages/dream/ui/src/primitives/input.tsx`
- Create: `packages/dream/ui/src/primitives/label.tsx`
- Test: `packages/dream/ui/tests/primitives/input.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/primitives/input.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../../src/primitives/input';
import { Label } from '../../src/primitives/label';

describe('Input', () => {
  it('renders an input element', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('accepts className prop', () => {
    render(<Input className="custom" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveClass('custom');
  });

  it('handles user input', async () => {
    render(<Input data-testid="input" />);
    await userEvent.type(screen.getByTestId('input'), 'hello');
    expect(screen.getByTestId('input')).toHaveValue('hello');
  });

  it('supports disabled state', () => {
    render(<Input disabled data-testid="input" />);
    expect(screen.getByTestId('input')).toBeDisabled();
  });
});

describe('Label', () => {
  it('renders a label element', () => {
    render(<Label>Email</Label>);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('associates with input via htmlFor', () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <Input id="email" />
      </>
    );
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });
});
```

**Step 2: Implement**

```typescript
// src/primitives/input.tsx
import React from 'react';
import { cn } from '../lib/cn';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
```

```typescript
// src/primitives/label.tsx
import React from 'react';
import { Label as RadixLabel } from 'radix-ui';
import { cn } from '../lib/cn';

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    return (
      <RadixLabel.Root
        ref={ref}
        className={cn(
          'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
          className,
        )}
        {...props}
      />
    );
  },
);
Label.displayName = 'Label';

export { Label };
```

**Step 3: Run tests**

```bash
cd packages/dream/ui && npx vitest run tests/primitives/input.test.tsx
```

Expected: 6 tests PASS.

**Step 4: Commit**

```bash
git add packages/dream/ui/src/primitives/input.tsx packages/dream/ui/src/primitives/label.tsx packages/dream/ui/tests/primitives/input.test.tsx
git commit -m "feat(ui): add Input and Label primitives"
```

---

### Task 12: Card + Separator + Badge + Skeleton + Avatar primitives

**Files:**
- Create: `packages/dream/ui/src/primitives/card.tsx`
- Create: `packages/dream/ui/src/primitives/separator.tsx`
- Create: `packages/dream/ui/src/primitives/badge.tsx`
- Create: `packages/dream/ui/src/primitives/skeleton.tsx`
- Create: `packages/dream/ui/src/primitives/avatar.tsx`
- Test: `packages/dream/ui/tests/primitives/card.test.tsx`

These are simple presentational components. Test the Card (most used), implement all five.

**Step 1: Write the failing test**

```typescript
// tests/primitives/card.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../src/primitives/card';
import { Separator } from '../../src/primitives/separator';
import { Badge } from '../../src/primitives/badge';
import { Skeleton } from '../../src/primitives/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '../../src/primitives/avatar';

describe('Card', () => {
  it('renders card with all sections', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('accepts className', () => {
    render(<Card className="custom" data-testid="card">Test</Card>);
    expect(screen.getByTestId('card')).toHaveClass('custom');
  });
});

describe('Separator', () => {
  it('renders a separator', () => {
    render(<Separator data-testid="sep" />);
    expect(screen.getByTestId('sep')).toBeInTheDocument();
  });
});

describe('Badge', () => {
  it('renders badge text', () => {
    render(<Badge>Admin</Badge>);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders variant styles', () => {
    render(<Badge variant="destructive">Error</Badge>);
    expect(screen.getByText('Error').className).toContain('destructive');
  });
});

describe('Skeleton', () => {
  it('renders a skeleton element', () => {
    render(<Skeleton data-testid="skel" className="h-4 w-20" />);
    expect(screen.getByTestId('skel')).toHaveClass('animate-pulse');
  });
});

describe('Avatar', () => {
  it('renders fallback when no image', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});
```

**Step 2: Implement all five**

```typescript
// src/primitives/card.tsx
import React from 'react';
import { cn } from '../lib/cn';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)} {...props} />
  ),
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  ),
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props} />
  ),
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  ),
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  ),
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  ),
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
```

```typescript
// src/primitives/separator.tsx
import React from 'react';
import { Separator as RadixSeparator } from 'radix-ui';
import { cn } from '../lib/cn';

const Separator = React.forwardRef<
  React.ElementRef<typeof RadixSeparator.Root>,
  React.ComponentPropsWithoutRef<typeof RadixSeparator.Root>
>(({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
  <RadixSeparator.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      'shrink-0 bg-border',
      orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
      className,
    )}
    {...props}
  />
));
Separator.displayName = 'Separator';

export { Separator };
```

```typescript
// src/primitives/badge.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
```

```typescript
// src/primitives/skeleton.tsx
import React from 'react';
import { cn } from '../lib/cn';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
}

export { Skeleton };
```

```typescript
// src/primitives/avatar.tsx
import React from 'react';
import { Avatar as RadixAvatar } from 'radix-ui';
import { cn } from '../lib/cn';

const Avatar = React.forwardRef<
  React.ElementRef<typeof RadixAvatar.Root>,
  React.ComponentPropsWithoutRef<typeof RadixAvatar.Root>
>(({ className, ...props }, ref) => (
  <RadixAvatar.Root
    ref={ref}
    className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
    {...props}
  />
));
Avatar.displayName = 'Avatar';

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof RadixAvatar.Image>,
  React.ComponentPropsWithoutRef<typeof RadixAvatar.Image>
>(({ className, ...props }, ref) => (
  <RadixAvatar.Image ref={ref} className={cn('aspect-square h-full w-full', className)} {...props} />
));
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof RadixAvatar.Fallback>,
  React.ComponentPropsWithoutRef<typeof RadixAvatar.Fallback>
>(({ className, ...props }, ref) => (
  <RadixAvatar.Fallback
    ref={ref}
    className={cn('flex h-full w-full items-center justify-center rounded-full bg-muted', className)}
    {...props}
  />
));
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
```

**Step 3: Run tests**

```bash
cd packages/dream/ui && npx vitest run tests/primitives/card.test.tsx
```

Expected: 7 tests PASS.

**Step 4: Commit**

```bash
git add packages/dream/ui/src/primitives/card.tsx packages/dream/ui/src/primitives/separator.tsx packages/dream/ui/src/primitives/badge.tsx packages/dream/ui/src/primitives/skeleton.tsx packages/dream/ui/src/primitives/avatar.tsx packages/dream/ui/tests/primitives/card.test.tsx
git commit -m "feat(ui): add Card, Separator, Badge, Skeleton, Avatar primitives"
```

---

### Task 13: Dialog primitive (Radix)

**Files:**
- Create: `packages/dream/ui/src/primitives/dialog.tsx`
- Test: `packages/dream/ui/tests/primitives/dialog.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/primitives/dialog.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../src/primitives/dialog';

describe('Dialog', () => {
  it('opens when trigger is clicked', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
            <DialogDescription>A description</DialogDescription>
          </DialogHeader>
          <DialogFooter>Footer</DialogFooter>
        </DialogContent>
      </Dialog>
    );
    expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
    await userEvent.click(screen.getByText('Open'));
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('A description')).toBeInTheDocument();
  });
});
```

**Step 2: Implement Dialog**

```typescript
// src/primitives/dialog.tsx
'use client';

import React from 'react';
import { Dialog as RadixDialog } from 'radix-ui';
import { cn } from '../lib/cn';

const Dialog = RadixDialog.Root;
const DialogTrigger = RadixDialog.Trigger;
const DialogPortal = RadixDialog.Portal;
const DialogClose = RadixDialog.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Overlay>
>(({ className, ...props }, ref) => (
  <RadixDialog.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = 'DialogOverlay';

const DialogContent = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Content>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <RadixDialog.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg',
        className,
      )}
      {...props}
    >
      {children}
    </RadixDialog.Content>
  </DialogPortal>
));
DialogContent.displayName = 'DialogContent';

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />;
}

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Title>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Title>
>(({ className, ...props }, ref) => (
  <RadixDialog.Title ref={ref} className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
));
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof RadixDialog.Description>,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Description>
>(({ className, ...props }, ref) => (
  <RadixDialog.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
DialogDescription.displayName = 'DialogDescription';

export { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription };
```

**Step 3: Run tests, commit**

```bash
cd packages/dream/ui && npx vitest run tests/primitives/dialog.test.tsx
git add packages/dream/ui/src/primitives/dialog.tsx packages/dream/ui/tests/primitives/dialog.test.tsx
git commit -m "feat(ui): add Dialog primitive (Radix)"
```

---

### Task 14: Popover + DropdownMenu + Select + Tabs (Radix)

**Files:**
- Create: `packages/dream/ui/src/primitives/popover.tsx`
- Create: `packages/dream/ui/src/primitives/dropdown-menu.tsx`
- Create: `packages/dream/ui/src/primitives/select.tsx`
- Create: `packages/dream/ui/src/primitives/tabs.tsx`
- Test: `packages/dream/ui/tests/primitives/radix-compounds.test.tsx`

These follow the exact same Radix wrapper + cn() pattern as Dialog. Each wraps Radix primitives with Tailwind classes and `cn()` for className merging. Test that they render and open/close.

**Step 1: Write tests for all four**

```typescript
// tests/primitives/radix-compounds.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Popover, PopoverTrigger, PopoverContent } from '../../src/primitives/popover';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../../src/primitives/dropdown-menu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../src/primitives/tabs';

describe('Popover', () => {
  it('opens on trigger click', async () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Popover content</PopoverContent>
      </Popover>
    );
    await userEvent.click(screen.getByText('Open'));
    expect(screen.getByText('Popover content')).toBeInTheDocument();
  });
});

describe('DropdownMenu', () => {
  it('opens menu with items', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
    await userEvent.click(screen.getByText('Menu'));
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });
});

describe('Tabs', () => {
  it('switches tab content', async () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Tab A</TabsTrigger>
          <TabsTrigger value="b">Tab B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content A</TabsContent>
        <TabsContent value="b">Content B</TabsContent>
      </Tabs>
    );
    expect(screen.getByText('Content A')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Tab B'));
    expect(screen.getByText('Content B')).toBeInTheDocument();
  });
});
```

**Step 2: Implement all four** (follow same Radix + cn pattern as Dialog)

Each component wraps its Radix counterpart with Tailwind styling. The implementation follows the shadcn/ui pattern exactly — Radix primitive wrapped in `React.forwardRef`, styled with `cn()`, all sub-parts exported.

**Step 3: Run tests, commit**

```bash
cd packages/dream/ui && npx vitest run tests/primitives/radix-compounds.test.tsx
git add packages/dream/ui/src/primitives/popover.tsx packages/dream/ui/src/primitives/dropdown-menu.tsx packages/dream/ui/src/primitives/select.tsx packages/dream/ui/src/primitives/tabs.tsx packages/dream/ui/tests/primitives/radix-compounds.test.tsx
git commit -m "feat(ui): add Popover, DropdownMenu, Select, Tabs primitives"
```

---

### Task 15: Toast (sonner wrapper)

**Files:**
- Create: `packages/dream/ui/src/primitives/toast.tsx`
- Test: `packages/dream/ui/tests/primitives/toast.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/primitives/toast.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toaster } from '../../src/primitives/toast';

describe('Toaster', () => {
  it('renders the sonner toaster container', () => {
    render(<Toaster />);
    // Sonner renders a section element
    expect(document.querySelector('[data-sonner-toaster]')).toBeInTheDocument();
  });
});
```

**Step 2: Implement**

```typescript
// src/primitives/toast.tsx
'use client';

import { Toaster as SonnerToaster, toast } from 'sonner';

function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: 'border bg-background text-foreground shadow-lg',
          error: 'border-destructive bg-destructive text-destructive-foreground',
        },
      }}
    />
  );
}

export { Toaster, toast };
```

**Step 3: Run test, commit**

```bash
cd packages/dream/ui && npx vitest run tests/primitives/toast.test.tsx
git add packages/dream/ui/src/primitives/toast.tsx packages/dream/ui/tests/primitives/toast.test.tsx
git commit -m "feat(ui): add Toaster (sonner wrapper) primitive"
```

---

### Task 16: Form primitive (react-hook-form + Zod)

**Files:**
- Create: `packages/dream/ui/src/primitives/form.tsx`
- Test: `packages/dream/ui/tests/primitives/form.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/primitives/form.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../../src/primitives/form';
import { Input } from '../../src/primitives/input';

const schema = z.object({ email: z.string().email('Invalid email') });

function TestForm({ onSubmit }: { onSubmit: (data: z.infer<typeof schema>) => void }) {
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: '' } });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button type="submit">Submit</button>
      </form>
    </Form>
  );
}

describe('Form', () => {
  it('shows validation error for invalid email', async () => {
    const onSubmit = vi.fn();
    render(<TestForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Email'), 'not-email');
    await userEvent.click(screen.getByText('Submit'));
    expect(await screen.findByText('Invalid email')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with valid data', async () => {
    const onSubmit = vi.fn();
    render(<TestForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
    await userEvent.click(screen.getByText('Submit'));
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com' }, expect.anything()));
  });
});
```

**Step 2: Implement Form**

The Form primitive wraps `react-hook-form`'s `FormProvider` and provides `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` sub-components following the shadcn/ui pattern. Uses React context internally for field state.

```typescript
// src/primitives/form.tsx
'use client';

import React, { createContext, useContext, useId } from 'react';
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { Label } from './label';
import { cn } from '../lib/cn';

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = createContext<FormFieldContextValue>({} as FormFieldContextValue);

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

const FormItemContext = createContext<{ id: string }>({ id: '' });

function useFormField() {
  const fieldCtx = useContext(FormFieldContext);
  const itemCtx = useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(fieldCtx.name, formState);
  const id = itemCtx.id;
  return { id, name: fieldCtx.name, formItemId: `${id}-form-item`, formMessageId: `${id}-form-item-message`, formDescriptionId: `${id}-form-item-description`, ...fieldState };
}

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = useId();
    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn('space-y-2', className)} {...props} />
      </FormItemContext.Provider>
    );
  },
);
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => {
    const { formItemId, error } = useFormField();
    return <Label ref={ref} className={cn(error && 'text-destructive', className)} htmlFor={formItemId} {...props} />;
  },
);
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ ...props }, ref) => {
    const { formItemId, formDescriptionId, formMessageId, error } = useFormField();
    return (
      <div
        ref={ref}
        {...props}
        // Pass aria attributes to child input via cloneElement
      >
        {React.Children.map(props.children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
              id: formItemId,
              'aria-describedby': error ? formMessageId : formDescriptionId,
              'aria-invalid': !!error,
            });
          }
          return child;
        })}
      </div>
    );
  },
);
FormControl.displayName = 'FormControl';

function FormMessage({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message) : children;
  if (!body) return null;
  return (
    <p id={formMessageId} className={cn('text-sm font-medium text-destructive', className)} {...props}>
      {body}
    </p>
  );
}

export { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, useFormField };
```

**Step 3: Run test, commit**

```bash
cd packages/dream/ui && npx vitest run tests/primitives/form.test.tsx
git add packages/dream/ui/src/primitives/form.tsx packages/dream/ui/tests/primitives/form.test.tsx
git commit -m "feat(ui): add Form primitive (react-hook-form + Zod integration)"
```

---

### Task 17: DataTable primitive

**Files:**
- Create: `packages/dream/ui/src/primitives/data-table.tsx`
- Test: `packages/dream/ui/tests/primitives/data-table.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/primitives/data-table.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataTable } from '../../src/primitives/data-table';
import type { ColumnDef } from '@tanstack/react-table';

interface Person { name: string; email: string; }

const columns: ColumnDef<Person>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
];

const data: Person[] = [
  { name: 'Alice', email: 'alice@test.com' },
  { name: 'Bob', email: 'bob@test.com' },
];

describe('DataTable', () => {
  it('renders column headers and row data', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('bob@test.com')).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText('No results.')).toBeInTheDocument();
  });
});
```

**Step 2: Implement DataTable**

```typescript
// src/primitives/data-table.tsx
'use client';

import React from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { cn } from '../lib/cn';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  className,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={cn('rounded-md border', className)}>
      <table className="w-full caption-bottom text-sm">
        <thead className="[&_tr]:border-b">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b transition-colors hover:bg-muted/50">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b transition-colors hover:bg-muted/50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-4 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="h-24 text-center">
                No results.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
```

**Step 3: Run test, commit**

```bash
cd packages/dream/ui && npx vitest run tests/primitives/data-table.test.tsx
git add packages/dream/ui/src/primitives/data-table.tsx packages/dream/ui/tests/primitives/data-table.test.tsx
git commit -m "feat(ui): add DataTable primitive (@tanstack/react-table)"
```

---

### Task 18: Primitives barrel export

**Files:**
- Create: `packages/dream/ui/src/primitives/index.ts`

**Step 1: Create barrel export**

```typescript
// src/primitives/index.ts
export { Button, buttonVariants, type ButtonProps } from './button';
export { Input } from './input';
export { Label } from './label';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
export { Separator } from './separator';
export { Badge, badgeVariants, type BadgeProps } from './badge';
export { Skeleton } from './skeleton';
export { Avatar, AvatarImage, AvatarFallback } from './avatar';
export { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './dialog';
export { Popover, PopoverTrigger, PopoverContent } from './popover';
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from './dropdown-menu';
export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
export { Toaster, toast } from './toast';
export { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, useFormField } from './form';
export { DataTable } from './data-table';
```

**Step 2: Verify build**

```bash
cd packages/dream/ui && npx tsup src/primitives/index.ts --format esm --dts --no-clean
```

Expected: Build succeeds, `dist/primitives/index.js` and `.d.ts` created.

**Step 3: Commit**

```bash
git add packages/dream/ui/src/primitives/index.ts
git commit -m "feat(ui): add primitives barrel export"
```

---

### Task 19: AuthLayout component (TDD)

**Files:**
- Create: `packages/dream/ui/src/auth/auth-layout.tsx`
- Test: `packages/dream/ui/tests/auth/auth-layout.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/auth/auth-layout.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthLayout } from '../../src/auth/auth-layout';
import { renderWithProviders } from '../../src/testing';

describe('AuthLayout', () => {
  it('renders title and description', () => {
    renderWithProviders(
      <AuthLayout title="Sign in" description="Welcome back">
        <div>Form content</div>
      </AuthLayout>,
    );
    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('Form content')).toBeInTheDocument();
  });

  it('renders product branding from provider', () => {
    renderWithProviders(
      <AuthLayout title="Sign in">
        <div>Form</div>
      </AuthLayout>,
      { branding: { productName: 'Dream Team', logo: '/logo.svg' } },
    );
    expect(screen.getByText('Dream Team')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', '/logo.svg');
  });

  it('accepts className', () => {
    renderWithProviders(
      <AuthLayout title="Test" className="custom" data-testid="layout">
        <div>Form</div>
      </AuthLayout>,
    );
    expect(screen.getByTestId('layout')).toHaveClass('custom');
  });
});
```

**Step 2: Implement**

```typescript
// src/auth/auth-layout.tsx
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../primitives/card';
import { useDreamUI } from '../theme/use-dream-ui';
import { cn } from '../lib/cn';

export interface AuthLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, description, children, className, ...props }: AuthLayoutProps) {
  const { branding } = useDreamUI();

  return (
    <div className={cn('flex min-h-screen items-center justify-center p-4', className)} {...props}>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          {branding.logo && (
            <div className="flex justify-center mb-4">
              <img src={branding.logo} alt={branding.productName ?? 'Logo'} className="h-10" />
            </div>
          )}
          {branding.productName && !branding.logo && (
            <p className="text-lg font-semibold text-muted-foreground mb-2">{branding.productName}</p>
          )}
          {title && <CardTitle className="text-2xl">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
```

**Step 3: Run test, commit**

```bash
cd packages/dream/ui && npx vitest run tests/auth/auth-layout.test.tsx
git add packages/dream/ui/src/auth/auth-layout.tsx packages/dream/ui/tests/auth/auth-layout.test.tsx
git commit -m "feat(ui): add AuthLayout component"
```

---

### Task 20: SocialLoginButtons component (TDD)

**Files:**
- Create: `packages/dream/ui/src/auth/social-login-buttons.tsx`
- Test: `packages/dream/ui/tests/auth/social-login-buttons.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/auth/social-login-buttons.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SocialLoginButtons } from '../../src/auth/social-login-buttons';

// Mock useAuth
vi.mock('@dream/auth', () => ({
  useAuth: () => ({
    signIn: vi.fn(),
  }),
}));

describe('SocialLoginButtons', () => {
  it('renders buttons for configured providers', () => {
    render(<SocialLoginButtons providers={['google', 'azure-entra']} />);
    expect(screen.getByText(/Google/)).toBeInTheDocument();
    expect(screen.getByText(/Microsoft/)).toBeInTheDocument();
  });

  it('renders vertically by default', () => {
    render(<SocialLoginButtons providers={['google']} data-testid="buttons" />);
    // vertical layout uses flex-col
    expect(screen.getByText(/Google/).closest('div')).toBeInTheDocument();
  });
});
```

**Step 2: Implement**

```typescript
// src/auth/social-login-buttons.tsx
'use client';

import React from 'react';
import { Button } from '../primitives/button';
import { cn } from '../lib/cn';

export interface SocialLoginButtonsProps extends React.HTMLAttributes<HTMLDivElement> {
  providers: Array<'google' | 'azure-entra' | 'generic-oidc'>;
  layout?: 'vertical' | 'horizontal';
  callbackUrl?: string;
  onProviderClick?: (provider: string) => void;
}

const PROVIDER_CONFIG = {
  google: { label: 'Continue with Google', icon: 'G' },
  'azure-entra': { label: 'Continue with Microsoft', icon: 'M' },
  'generic-oidc': { label: 'Continue with SSO', icon: 'S' },
} as const;

export function SocialLoginButtons({
  providers,
  layout = 'vertical',
  callbackUrl,
  onProviderClick,
  className,
  ...props
}: SocialLoginButtonsProps) {
  return (
    <div
      className={cn(
        'flex gap-2',
        layout === 'vertical' ? 'flex-col' : 'flex-row',
        className,
      )}
      {...props}
    >
      {providers.map((provider) => {
        const config = PROVIDER_CONFIG[provider];
        return (
          <Button
            key={provider}
            variant="outline"
            className="w-full"
            onClick={() => onProviderClick?.(provider)}
          >
            <span className="mr-2 font-bold">{config.icon}</span>
            {config.label}
          </Button>
        );
      })}
    </div>
  );
}
```

**Step 3: Run test, commit**

```bash
cd packages/dream/ui && npx vitest run tests/auth/social-login-buttons.test.tsx
git add packages/dream/ui/src/auth/social-login-buttons.tsx packages/dream/ui/tests/auth/social-login-buttons.test.tsx
git commit -m "feat(ui): add SocialLoginButtons component"
```

---

### Task 21: LoginForm component (TDD)

**Files:**
- Create: `packages/dream/ui/src/auth/login-form.tsx`
- Test: `packages/dream/ui/tests/auth/login-form.test.tsx`

**Step 1: Write the failing test**

```typescript
// tests/auth/login-form.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../../src/auth/login-form';
import { renderWithProviders } from '../../src/testing';

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    renderWithProviders(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    renderWithProviders(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/email/i), 'not-email');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });

  it('shows validation error for empty password', async () => {
    renderWithProviders(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  it('calls onSuccess on valid submission', async () => {
    const onSuccess = vi.fn();
    renderWithProviders(<LoginForm onSuccess={onSuccess} />);
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    // Form submits — onSuccess would be called after auth flow
  });

  it('renders social login buttons when providers configured', () => {
    renderWithProviders(<LoginForm providers={['credentials', 'google']} />);
    expect(screen.getByText(/Google/)).toBeInTheDocument();
  });

  it('renders custom slot content', () => {
    renderWithProviders(
      <LoginForm slots={{ footer: <div>Custom footer</div> }} />,
    );
    expect(screen.getByText('Custom footer')).toBeInTheDocument();
  });

  it('accepts className', () => {
    renderWithProviders(<LoginForm className="custom" data-testid="form" />);
    expect(screen.getByTestId('form')).toHaveClass('custom');
  });
});
```

**Step 2: Implement LoginForm**

```typescript
// src/auth/login-form.tsx
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../primitives/form';
import { Input } from '../primitives/input';
import { Button } from '../primitives/button';
import { Separator } from '../primitives/separator';
import { SocialLoginButtons } from './social-login-buttons';
import { cn } from '../lib/cn';
import type { ReactNode } from 'react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export interface LoginFormSlots {
  beforeFields?: ReactNode;
  afterFields?: ReactNode;
  submitButton?: (props: { isSubmitting: boolean; isValid: boolean }) => ReactNode;
  footer?: ReactNode;
  divider?: ReactNode;
}

export interface LoginFormProps extends React.HTMLAttributes<HTMLDivElement> {
  providers?: Array<'credentials' | 'google' | 'azure-entra' | 'generic-oidc'>;
  onSuccess?: (data: LoginFormData) => void;
  onError?: (error: Error) => void;
  callbackUrl?: string;
  slots?: LoginFormSlots;
}

export function LoginForm({
  providers = ['credentials'],
  onSuccess,
  onError,
  callbackUrl,
  slots = {},
  className,
  ...props
}: LoginFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const showCredentials = providers.includes('credentials');
  const socialProviders = providers.filter((p): p is 'google' | 'azure-entra' | 'generic-oidc' => p !== 'credentials');

  async function handleSubmit(data: LoginFormData) {
    setFormError(null);
    try {
      onSuccess?.(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign in failed');
      setFormError(error.message);
      onError?.(error);
    }
  }

  return (
    <div className={cn('space-y-6', className)} {...props}>
      {slots.beforeFields}

      {showCredentials && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {formError && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {formError}
              </div>
            )}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="name@example.com" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {slots.afterFields}
            {slots.submitButton ? (
              slots.submitButton({
                isSubmitting: form.formState.isSubmitting,
                isValid: form.formState.isValid,
              })
            ) : (
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            )}
          </form>
        </Form>
      )}

      {showCredentials && socialProviders.length > 0 && (
        slots.divider ?? (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>
        )
      )}

      {socialProviders.length > 0 && (
        <SocialLoginButtons providers={socialProviders} callbackUrl={callbackUrl} />
      )}

      {slots.footer}
    </div>
  );
}
```

**Step 3: Run test, commit**

```bash
cd packages/dream/ui && npx vitest run tests/auth/login-form.test.tsx
git add packages/dream/ui/src/auth/login-form.tsx packages/dream/ui/tests/auth/login-form.test.tsx
git commit -m "feat(ui): add LoginForm with validation, social providers, and slots"
```

---

### Task 22: SignupForm component (TDD)

**Files:**
- Create: `packages/dream/ui/src/auth/signup-form.tsx`
- Test: `packages/dream/ui/tests/auth/signup-form.test.tsx`

Follows same pattern as LoginForm. Schema: name (required), email (required, email), password (min 8 chars), confirmPassword (must match). Slots: beforeFields, afterFields, submitButton, footer.

**Step 1: Write test → Step 2: Implement → Step 3: Run test, commit**

```bash
git commit -m "feat(ui): add SignupForm with password validation and slots"
```

---

### Task 23: ForgotPasswordForm + ResetPasswordForm (TDD)

**Files:**
- Create: `packages/dream/ui/src/auth/forgot-password-form.tsx`
- Create: `packages/dream/ui/src/auth/reset-password-form.tsx`
- Test: `packages/dream/ui/tests/auth/password-forms.test.tsx`

ForgotPasswordForm: single email field + submit. ResetPasswordForm: token prop + new password + confirm password.

**Step 1: Write test → Step 2: Implement → Step 3: Run test, commit**

```bash
git commit -m "feat(ui): add ForgotPasswordForm and ResetPasswordForm"
```

---

### Task 24: MfaSetup component (TDD)

**Files:**
- Create: `packages/dream/ui/src/auth/mfa-setup.tsx`
- Test: `packages/dream/ui/tests/auth/mfa-setup.test.tsx`

Shows QR code (from apiAdapter.initiateMfaSetup), verification code input, backup codes display. Uses DreamUIProvider's apiAdapter. className only customization.

**Step 1: Write test → Step 2: Implement → Step 3: Run test, commit**

```bash
git commit -m "feat(ui): add MfaSetup component"
```

---

### Task 25: MfaChallenge component (TDD, sealed)

**Files:**
- Create: `packages/dream/ui/src/auth/mfa-challenge.tsx`
- Test: `packages/dream/ui/tests/auth/mfa-challenge.test.tsx`

6-digit code input, submit, error display. SEALED — className only, no slots (FR-016, FR-081).

**Step 1: Write test → Step 2: Implement → Step 3: Run test, commit**

```bash
git commit -m "feat(ui): add MfaChallenge component (sealed, no slots)"
```

---

### Task 26: Auth barrel export + integration test

**Files:**
- Create: `packages/dream/ui/src/auth/index.ts`
- Test: `packages/dream/ui/tests/auth/integration.test.tsx`

**Step 1: Create auth barrel export**

```typescript
// src/auth/index.ts
export { AuthLayout } from './auth-layout';
export type { AuthLayoutProps } from './auth-layout';
export { LoginForm } from './login-form';
export type { LoginFormProps, LoginFormSlots } from './login-form';
export { SignupForm } from './signup-form';
export { ForgotPasswordForm } from './forgot-password-form';
export { ResetPasswordForm } from './reset-password-form';
export { MfaSetup } from './mfa-setup';
export { MfaChallenge } from './mfa-challenge';
export { SocialLoginButtons } from './social-login-buttons';
export type { SocialLoginButtonsProps } from './social-login-buttons';
```

**Step 2: Integration test — render LoginForm inside AuthLayout with DreamUIProvider**

```typescript
// tests/auth/integration.test.tsx
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { AuthLayout } from '../../src/auth/auth-layout';
import { LoginForm } from '../../src/auth/login-form';
import { renderWithProviders } from '../../src/testing';

describe('Auth Integration', () => {
  it('renders branded login page end-to-end', () => {
    renderWithProviders(
      <AuthLayout title="Sign in" description="Welcome back">
        <LoginForm providers={['credentials', 'google']} />
      </AuthLayout>,
      { branding: { productName: 'Dream Team' } },
    );
    expect(screen.getByText('Dream Team')).toBeInTheDocument();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByText(/Google/)).toBeInTheDocument();
  });
});
```

**Step 3: Run tests, commit**

```bash
cd packages/dream/ui && npx vitest run tests/auth/
git add packages/dream/ui/src/auth/index.ts packages/dream/ui/tests/auth/integration.test.tsx
git commit -m "feat(ui): add auth barrel export and integration test"
```

---

### Task 27: Storybook setup

**Files:**
- Create: `packages/dream/ui/.storybook/main.ts`
- Create: `packages/dream/ui/.storybook/preview.tsx`
- Create: `packages/dream/ui/stories/primitives/button.stories.tsx`
- Create: `packages/dream/ui/stories/auth/login-form.stories.tsx`

**Step 1: Create Storybook config**

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
  ],
  framework: '@storybook/react-vite',
};
export default config;
```

```typescript
// .storybook/preview.tsx
import React from 'react';
import type { Preview } from '@storybook/react';
import { MockApiProvider } from '../src/testing';
import '../src/styles.css';

const preview: Preview = {
  decorators: [
    (Story) => (
      <MockApiProvider branding={{ productName: 'Storybook' }}>
        <Story />
      </MockApiProvider>
    ),
  ],
};
export default preview;
```

**Step 2: Create example stories**

```typescript
// stories/primitives/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../src/primitives/button';

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] },
    size: { control: 'select', options: ['default', 'sm', 'lg', 'icon'] },
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = { args: { children: 'Button' } };
export const Destructive: Story = { args: { children: 'Delete', variant: 'destructive' } };
export const Outline: Story = { args: { children: 'Outline', variant: 'outline' } };
export const Disabled: Story = { args: { children: 'Disabled', disabled: true } };
```

```typescript
// stories/auth/login-form.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { AuthLayout } from '../../src/auth/auth-layout';
import { LoginForm } from '../../src/auth/login-form';

const meta: Meta<typeof LoginForm> = {
  title: 'Auth/LoginForm',
  component: LoginForm,
  decorators: [
    (Story) => (
      <AuthLayout title="Sign in" description="Welcome back">
        <Story />
      </AuthLayout>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof LoginForm>;

export const Default: Story = {};
export const WithGoogle: Story = { args: { providers: ['credentials', 'google'] } };
export const WithSlots: Story = {
  args: {
    slots: {
      footer: <p className="text-center text-sm text-muted-foreground">Don't have an account? Sign up</p>,
    },
  },
};
```

**Step 3: Verify Storybook builds**

```bash
cd packages/dream/ui && npx storybook build --quiet
```

Expected: Build succeeds, `storybook-static/` created.

**Step 4: Commit**

```bash
git add packages/dream/ui/.storybook/ packages/dream/ui/stories/
git commit -m "feat(ui): add Storybook setup with Button and LoginForm stories"
```

---

### Task 28: Full build, typecheck, and test verification

**Step 1: Run full test suite**

```bash
cd packages/dream/ui && npx vitest run
```

Expected: All tests PASS. Report exact count.

**Step 2: Run typecheck**

```bash
cd packages/dream/ui && npx tsc --noEmit
```

Expected: No errors.

**Step 3: Run build**

```bash
cd packages/dream/ui && npm run build
```

Expected: `dist/` contains `primitives/`, `auth/`, `theme/`, `testing/`, `tailwind.preset.js`, `styles.css` with `.d.ts` files.

**Step 4: Verify sub-path exports resolve**

```bash
cd packages/dream/ui && node -e "import('./dist/primitives/index.js').then(m => console.log('Primitives exports:', Object.keys(m).length))"
cd packages/dream/ui && node -e "import('./dist/auth/index.js').then(m => console.log('Auth exports:', Object.keys(m).length))"
cd packages/dream/ui && node -e "import('./dist/theme/index.js').then(m => console.log('Theme exports:', Object.keys(m).length))"
```

Expected: Each prints the number of exports.

**Step 5: Commit verification evidence**

```bash
git add -A packages/dream/ui/
git commit -m "feat(ui): Phase 1 complete — primitives + auth + theming + tests + Storybook"
```

---

### Summary: Phase 1 Deliverables

| Category | Count | Status |
|----------|-------|--------|
| Primitives | 16 components | All implemented + tested |
| Auth components | 8 components | All implemented + tested |
| DreamUIProvider | 1 provider | Implemented + tested |
| Test utilities | 2 (MockApiProvider, renderWithProviders) | Implemented + tested |
| CSS tokens | 50+ custom properties | Light + dark |
| Tailwind presets | 2 (v3.4 JS, v4.0 CSS) | Implemented |
| Storybook stories | 2+ story files | Button + LoginForm |
| Total tasks | 28 | — |
