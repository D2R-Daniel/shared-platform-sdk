# Technology Decisions: @dream/ui

**Feature**: 008-shared-ui-components | **Date**: 2026-02-07 | **Spec**: [spec.md](spec.md)

## Decision Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Build toolchain | tsup (esbuild) + PostCSS | Fast multi-entry builds; sibling packages use tsc but @dream/ui needs CSS handling |
| CSS strategy | Pre-built `styles.css` + consumer-compiled Tailwind | Tokens via one import; utilities compiled by consumer's Tailwind to avoid duplication |
| Storybook | Storybook 8 + `@storybook/react-vite` + addon-a11y | Library-focused (not Next.js app); Vite for speed; addon-a11y for WCAG checks |
| Testing | Vitest + @testing-library/react + jsdom + vitest-axe | Consistent with all sibling `@dream/*` packages; vitest-axe requires jsdom |
| React version | `react: ">=18.0.0"` peer dep | Must work across products at different React versions |
| Tailwind version | Dual preset (JS for v3.4, CSS for v4.0); HSL colors | Products may be on either version; HSL is cross-version compatible |
| Radix UI | Unified `radix-ui` package (v1.4.x) | Eliminates version mismatch bugs; tree-shakeable; shadcn/ui standard |
| ApiAdapter | Plain interface via React context; useState/useEffect | Zero forced dependencies on consumers; works with any data-fetching library |

## Build Toolchain: tsup

**Why not tsc (sibling pattern)?** Sibling packages use `tsc` but `@dream/ui` needs CSS bundling and multiple entry points. tsup handles both via esbuild with PostCSS for CSS separately.

**Configuration**: 7 entry points mapping to sub-path exports. Format: ESM only. `dts: true`, `sourcemap: true`, external: all peer deps.

## CSS Strategy: Pre-built styles.css

The library's CSS has two layers:
1. **Design tokens** (CSS custom properties): Shipped pre-built in `@dream/ui/styles.css`. Products import once.
2. **Tailwind utilities**: Compiled by the consumer's Tailwind build. Products add `node_modules/@dream/ui/dist` to content paths.

Dark mode: `:root` and `.dark` selectors in `styles.css`. Consumer toggles `.dark` class.

## React 18/19 Compatibility

**Avoid** (React 19 only): `use()`, `useFormStatus()`, `useActionState()`, `useOptimistic()`, passing `ref` as prop without `forwardRef`.

**Avoid** (deprecated in 19): `defaultProps` on function components, `propTypes`, string refs.

**Safe** (both versions): `useId()`, `useContext()`, `startTransition()`, `useDeferredValue()`, `React.forwardRef()`.

## Tailwind v3.4/v4.0 Dual Support

- **v3.4**: JS preset at `@dream/ui/tailwind` — extends `tailwind.config.js` with token mappings
- **v4.0**: CSS preset at `@dream/ui/tailwind.preset.css` — uses `@theme inline {}` directive
- **Color format**: HSL (works in both versions). Migrate to OKLCH when v3 support dropped.

## Radix UI: Unified Package

Use `radix-ui` (unified) instead of individual `@radix-ui/react-*` packages. Required primitives: Dialog, AlertDialog, DropdownMenu, Popover, Select, Tabs, Separator, Label, Slot, Toggle, Tooltip.

## ApiAdapter: Plain Interface

No TanStack Query or SWR dependency. Components use `useState`/`useEffect` internally and call adapter methods directly. Products can wrap adapter methods with their own caching layer (TQ, SWR, etc.) at the product level.

Default adapter: `createFetchAdapter({ baseUrl })` using `fetch` against REST conventions.
