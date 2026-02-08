# Tasks: Shared UI Component Library (@dream/ui)

**Input**: Design documents from `/specs/008-shared-ui-components/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), data-model.md, ux-design.md, contracts/component-props.ts

> **Execution**: Use `superpowers:subagent-driven-development` (recommended, fresh subagent per task with two-stage review) or `superpowers:executing-plans` (batch execution with human checkpoints) to implement these tasks.

**Tests**: Per Constitution Principle II (Test-First Development), tests are MANDATORY. Write failing tests FIRST, verify they fail, then implement. Red-Green-Refactor is non-negotiable.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Phase 1 focuses on US1 (Auth Pages), US6 (Theming), and US7 (API Adapter) — the P1 user stories that are prerequisites for all others.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US6, US7)
- Include exact file paths in descriptions

## Path Conventions

- **Package root**: `packages/dream/ui/`
- **Source**: `packages/dream/ui/src/`
- **Tests**: `packages/dream/ui/tests/`
- **Stories**: `packages/dream/ui/stories/`

---

## Phase 1: Setup (Package Scaffolding)

**Purpose**: Initialize `@dream/ui` package with build tooling, dependencies, and project structure

- [ ] T001 Create package.json with sub-path exports (primitives, auth, theme, tailwind, testing) and dependencies (radix-ui, react-hook-form, zod, @tanstack/react-table, sonner, class-variance-authority, clsx, tailwind-merge) in `packages/dream/ui/package.json`
- [ ] T002 [P] Create TypeScript config extending monorepo base in `packages/dream/ui/tsconfig.json`
- [ ] T003 [P] Create build config (tsup with 5 entry points: primitives, auth, theme, testing, lib) in `packages/dream/ui/tsup.config.ts`
- [ ] T004 [P] Create test config (vitest with jsdom, globals, setup file) in `packages/dream/ui/vitest.config.ts` and `packages/dream/ui/tests/setup.ts`
- [ ] T005 [P] Create .gitignore for dist/ and node_modules/ in `packages/dream/ui/.gitignore`
- [ ] T006 Install all dependencies by running `npm install` from repository root

**Checkpoint**: Package scaffolding complete — `npm run build` and `npx vitest run` should execute (even if no tests exist yet)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities, theming system, and provider infrastructure that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Create `cn()` utility (clsx + tailwind-merge) with test in `packages/dream/ui/src/lib/cn.ts` and `packages/dream/ui/tests/lib/cn.test.ts`
- [ ] T008 [P] Create CSS design tokens (50+ custom properties, light + dark mode) in `packages/dream/ui/src/styles.css`
- [ ] T009 [P] Create Tailwind v3.4 JS preset in `packages/dream/ui/tailwind.preset.ts`
- [ ] T010 [P] Create Tailwind v4.0 CSS preset in `packages/dream/ui/tailwind.preset.css`
- [ ] T011 Create theme types (BrandingConfig, DreamUIError, DreamUIContextValue, DreamUIProviderProps) in `packages/dream/ui/src/theme/types.ts`
- [ ] T012 Create ApiAdapter interface and createFetchAdapter() in `packages/dream/ui/src/lib/api-adapter.ts`
- [ ] T013 Write failing test for DreamUIProvider + useDreamUI hook in `packages/dream/ui/tests/theme/provider.test.tsx`
- [ ] T014 Implement DreamUIProvider in `packages/dream/ui/src/theme/provider.tsx` and useDreamUI in `packages/dream/ui/src/theme/use-dream-ui.ts`
- [ ] T015 Create theme barrel export in `packages/dream/ui/src/theme/index.ts`
- [ ] T016 Write failing test for MockApiProvider + renderWithProviders in `packages/dream/ui/tests/testing/render-with-providers.test.tsx`
- [ ] T017 Implement MockApiProvider (createNoopAdapter) in `packages/dream/ui/src/testing/mock-api-provider.tsx` and renderWithProviders in `packages/dream/ui/src/testing/render-with-providers.tsx`
- [ ] T018 Create testing barrel export in `packages/dream/ui/src/testing/index.ts`

**Checkpoint**: Foundation ready — DreamUIProvider, test utilities, theming tokens, and cn() all working. User story implementation can now begin.

---

## Phase 3: User Story 6 — Product Developer Customizes Component Theming (Priority: P1)

**Goal**: Products can brand all shared components by overriding CSS custom properties and using the Tailwind preset. DreamUIProvider accepts branding configuration.

**Independent Test**: Set `--dream-color-primary` to a distinctive color, render any component, verify the color appears. Toggle dark mode and verify colors switch.

> **NOTE**: US6 tasks are largely completed by Phase 2 foundational work (T008-T015). This phase validates the theming system end-to-end.

### Tests for User Story 6

- [ ] T019 [P] [US6] Write test verifying CSS custom properties apply to rendered components in `packages/dream/ui/tests/theme/theming.test.tsx`
- [ ] T020 [P] [US6] Write test verifying branding (logo, productName) propagates from DreamUIProvider to consuming components in `packages/dream/ui/tests/theme/branding.test.tsx`

### Implementation for User Story 6

- [ ] T021 [US6] Verify Tailwind preset maps all CSS custom properties to utility classes by running build with preset configured

**Checkpoint**: Theming system validated — CSS variables, dark mode, Tailwind presets, branding config all working independently.

---

## Phase 4: User Story 7 — Product Developer Connects Components to Backend via API Adapter (Priority: P1)

**Goal**: Products provide an ApiAdapter implementation to DreamUIProvider. A default fetch adapter is included. Components use the adapter for all data operations.

**Independent Test**: Render a component with a mock API adapter, verify it calls adapter methods. Replace with createFetchAdapter and verify same behavior.

> **NOTE**: US7 tasks are largely completed by Phase 2 foundational work (T012, T016-T018). This phase validates the adapter pattern.

### Tests for User Story 7

- [ ] T022 [P] [US7] Write test verifying createFetchAdapter constructs correct URLs and methods in `packages/dream/ui/tests/lib/api-adapter.test.ts`
- [ ] T023 [P] [US7] Write test verifying MockApiProvider provides noop adapter to components in `packages/dream/ui/tests/testing/mock-api-provider.test.tsx`

### Implementation for User Story 7

- [ ] T024 [US7] Verify adapter interface completeness: all 30 methods match data-model.md contract

**Checkpoint**: API adapter pattern validated — createFetchAdapter, MockApiProvider, and adapter interface all working.

---

## Phase 5: User Story 1 — Product Developer Adds Branded Authentication Pages (Priority: P1) MVP

**Goal**: Products replace hand-built login, signup, and password reset pages with shared components. All auth components render correctly with custom branding, handle validation, and support social login.

**Independent Test**: Import `<LoginForm>` into a Next.js product, set CSS variables, render the page, verify branding, form submission, validation errors, and redirect on success.

### 5a: Primitives (required by auth components)

> **NOTE: Write tests FIRST, ensure they FAIL before implementation**

- [ ] T025 [P] [US1] Write failing test for Button primitive (renders, click, disabled, variants, sizes, asChild) in `packages/dream/ui/tests/primitives/button.test.tsx`
- [ ] T026 [US1] Implement Button primitive with CVA variants in `packages/dream/ui/src/primitives/button.tsx`
- [ ] T027 [P] [US1] Write failing test for Input + Label primitives in `packages/dream/ui/tests/primitives/input.test.tsx`
- [ ] T028 [US1] Implement Input in `packages/dream/ui/src/primitives/input.tsx` and Label in `packages/dream/ui/src/primitives/label.tsx`
- [ ] T029 [P] [US1] Write failing test for Card, Separator, Badge, Skeleton, Avatar in `packages/dream/ui/tests/primitives/card.test.tsx`
- [ ] T030 [US1] Implement Card in `packages/dream/ui/src/primitives/card.tsx`, Separator in `separator.tsx`, Badge in `badge.tsx`, Skeleton in `skeleton.tsx`, Avatar in `avatar.tsx`
- [ ] T031 [P] [US1] Write failing test for Dialog primitive in `packages/dream/ui/tests/primitives/dialog.test.tsx`
- [ ] T032 [US1] Implement Dialog (Radix wrapper) in `packages/dream/ui/src/primitives/dialog.tsx`
- [ ] T033 [P] [US1] Write failing test for Popover, DropdownMenu, Tabs in `packages/dream/ui/tests/primitives/radix-compounds.test.tsx`
- [ ] T034 [US1] Implement Popover in `packages/dream/ui/src/primitives/popover.tsx`, DropdownMenu in `dropdown-menu.tsx`, Select in `select.tsx`, Tabs in `tabs.tsx`
- [ ] T035 [P] [US1] Write failing test for Toast (sonner wrapper) in `packages/dream/ui/tests/primitives/toast.test.tsx`
- [ ] T036 [US1] Implement Toaster + toast in `packages/dream/ui/src/primitives/toast.tsx`
- [ ] T037 [P] [US1] Write failing test for Form primitive (react-hook-form + Zod) in `packages/dream/ui/tests/primitives/form.test.tsx`
- [ ] T038 [US1] Implement Form, FormField, FormItem, FormLabel, FormControl, FormMessage in `packages/dream/ui/src/primitives/form.tsx`
- [ ] T039 [P] [US1] Write failing test for DataTable in `packages/dream/ui/tests/primitives/data-table.test.tsx`
- [ ] T040 [US1] Implement DataTable (@tanstack/react-table wrapper) in `packages/dream/ui/src/primitives/data-table.tsx`
- [ ] T041 [US1] Create primitives barrel export in `packages/dream/ui/src/primitives/index.ts`

### 5b: Auth Components

- [ ] T042 [P] [US1] Write failing test for AuthLayout (title, description, branding from provider) in `packages/dream/ui/tests/auth/auth-layout.test.tsx`
- [ ] T043 [US1] Implement AuthLayout in `packages/dream/ui/src/auth/auth-layout.tsx`
- [ ] T044 [P] [US1] Write failing test for SocialLoginButtons (renders providers, layout) in `packages/dream/ui/tests/auth/social-login-buttons.test.tsx`
- [ ] T045 [US1] Implement SocialLoginButtons in `packages/dream/ui/src/auth/social-login-buttons.tsx`
- [ ] T046 [P] [US1] Write failing test for LoginForm (fields, validation, social providers, slots, className) in `packages/dream/ui/tests/auth/login-form.test.tsx`
- [ ] T047 [US1] Implement LoginForm with Zod schema, slots, social providers in `packages/dream/ui/src/auth/login-form.tsx`
- [ ] T048 [P] [US1] Write failing test for SignupForm (name, email, password, confirmPassword, slots) in `packages/dream/ui/tests/auth/signup-form.test.tsx`
- [ ] T049 [US1] Implement SignupForm in `packages/dream/ui/src/auth/signup-form.tsx`
- [ ] T050 [P] [US1] Write failing test for ForgotPasswordForm + ResetPasswordForm in `packages/dream/ui/tests/auth/password-forms.test.tsx`
- [ ] T051 [US1] Implement ForgotPasswordForm in `packages/dream/ui/src/auth/forgot-password-form.tsx` and ResetPasswordForm in `packages/dream/ui/src/auth/reset-password-form.tsx`
- [ ] T052 [P] [US1] Write failing test for MfaSetup (QR code, verification, backup codes) in `packages/dream/ui/tests/auth/mfa-setup.test.tsx`
- [ ] T053 [US1] Implement MfaSetup in `packages/dream/ui/src/auth/mfa-setup.tsx`
- [ ] T054 [P] [US1] Write failing test for MfaChallenge (6-digit code, sealed — no slots) in `packages/dream/ui/tests/auth/mfa-challenge.test.tsx`
- [ ] T055 [US1] Implement MfaChallenge (sealed) in `packages/dream/ui/src/auth/mfa-challenge.tsx`
- [ ] T056 [US1] Create auth barrel export in `packages/dream/ui/src/auth/index.ts`

### 5c: Integration

- [ ] T057 [US1] Write integration test: AuthLayout + LoginForm + DreamUIProvider with branding in `packages/dream/ui/tests/auth/integration.test.tsx`

**Checkpoint**: US1 fully functional — all 16 primitives + 8 auth components + theming + test utilities working. Products can import `@dream/ui/auth` and have branded auth pages.

---

## Phase 6: User Story 8 — Developer Tests Components in Isolation (Priority: P2)

**Goal**: Products can write unit tests for pages using @dream/ui components via renderWithProviders() and MockApiProvider.

**Independent Test**: Write a test rendering LoginForm with renderWithProviders, fill fields, submit, assert on validation behavior — all without a real backend.

> **NOTE**: US8 test utilities (MockApiProvider, renderWithProviders) are already implemented in Phase 2 (T016-T018). This phase adds documentation-quality test examples and validates the testing API.

### Tests for User Story 8

- [ ] T058 [P] [US8] Write example test demonstrating renderWithProviders with custom adapter override in `packages/dream/ui/tests/testing/example-adapter-override.test.tsx`
- [ ] T059 [P] [US8] Write example test demonstrating permission gate behavior with different user roles in `packages/dream/ui/tests/testing/example-permission-test.test.tsx`

### Implementation for User Story 8

- [ ] T060 [US8] Ensure renderWithProviders supports all provider options (adapter, branding, onError) — verify in `packages/dream/ui/src/testing/render-with-providers.tsx`

**Checkpoint**: Testing utilities validated with example tests — products have clear patterns to follow for their own tests.

---

## Phase 7: Storybook & Documentation

**Purpose**: Visual development environment and living documentation for all Phase 1 components

- [ ] T061 [P] Create Storybook config in `packages/dream/ui/.storybook/main.ts`
- [ ] T062 [P] Create Storybook preview with MockApiProvider decorator and styles import in `packages/dream/ui/.storybook/preview.tsx`
- [ ] T063 [P] Create Button stories (all variants, sizes, disabled, asChild) in `packages/dream/ui/stories/primitives/button.stories.tsx`
- [ ] T064 [P] Create LoginForm stories (default, with Google, with slots, error state) in `packages/dream/ui/stories/auth/login-form.stories.tsx`
- [ ] T065 Verify Storybook builds successfully by running `npx storybook build --quiet` in `packages/dream/ui/`

**Checkpoint**: Storybook renders all Phase 1 components — visual contract for product teams.

---

## Phase 8: Polish & Verification

**Purpose**: Final build verification, sub-path export validation, and cleanup

- [ ] T066 Run full test suite: `cd packages/dream/ui && npx vitest run` — report exact pass count
- [ ] T067 Run TypeScript typecheck: `cd packages/dream/ui && npx tsc --noEmit` — expect zero errors
- [ ] T068 Run full build: `cd packages/dream/ui && npm run build` — verify dist/ contains primitives/, auth/, theme/, testing/ with .d.ts files
- [ ] T069 Verify sub-path exports resolve: test dynamic import of `dist/primitives/index.js`, `dist/auth/index.js`, `dist/theme/index.js`
- [ ] T070 Verify tree-shaking: importing `@dream/ui/auth` does NOT include primitives not used by auth components

**Checkpoint**: Phase 1 complete — all gates pass. Ready for product adoption.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US6 Theming (Phase 3)**: Depends on Foundational (T008-T015)
- **US7 API Adapter (Phase 4)**: Depends on Foundational (T012, T016-T018)
- **US1 Auth Pages (Phase 5)**: Depends on Foundational — core MVP phase
  - 5a Primitives: Can start after Foundational
  - 5b Auth Components: Depends on 5a Primitives completion
  - 5c Integration: Depends on 5b Auth Components
- **US8 Testing (Phase 6)**: Depends on Foundational (T016-T018) — can run in parallel with US1
- **Storybook (Phase 7)**: Depends on US1 Auth (needs components to story)
- **Polish (Phase 8)**: Depends on all previous phases

### User Story Dependencies

- **US6 (Theming)**: Foundation only — no dependencies on other stories
- **US7 (API Adapter)**: Foundation only — no dependencies on other stories
- **US1 (Auth Pages)**: Depends on US6 theming system (CSS tokens) and US7 adapter (for MFA components)
- **US8 (Testing)**: Depends on Foundation test utilities — can run parallel with US1

### Within Each User Story

- Tests MUST be written FIRST and FAIL before implementation
- Primitives before compound components
- Compound components before integration tests
- Barrel exports after all components in a surface area
- Commit after each task or logical group

### Parallel Opportunities

**After Phase 2 Foundation completes, the following can run in parallel:**
- US6 (Phase 3) + US7 (Phase 4) + US8 (Phase 6) — all depend only on Foundation
- Within US1 Phase 5a: All primitive test-writing tasks (T025, T027, T029, T031, T033, T035, T037, T039) can run in parallel
- Within US1 Phase 5b: All auth test-writing tasks (T042, T044, T046, T048, T050, T052, T054) can run in parallel
- Storybook config tasks (T061, T062) can run in parallel with story tasks (T063, T064)
- All Phase 8 verification tasks (T066-T070) must run sequentially

---

## Parallel Example: US1 Primitives (Phase 5a)

```bash
# Launch all primitive test tasks together (run FIRST, verify they FAIL):
Task: "T025 Write failing test for Button in tests/primitives/button.test.tsx"
Task: "T027 Write failing test for Input + Label in tests/primitives/input.test.tsx"
Task: "T029 Write failing test for Card/Separator/Badge/Skeleton/Avatar in tests/primitives/card.test.tsx"
Task: "T031 Write failing test for Dialog in tests/primitives/dialog.test.tsx"
Task: "T033 Write failing test for Popover/DropdownMenu/Tabs in tests/primitives/radix-compounds.test.tsx"
Task: "T035 Write failing test for Toast in tests/primitives/toast.test.tsx"
Task: "T037 Write failing test for Form in tests/primitives/form.test.tsx"
Task: "T039 Write failing test for DataTable in tests/primitives/data-table.test.tsx"

# Then implement sequentially or in parallel (different files):
Task: "T026 Implement Button in src/primitives/button.tsx"
Task: "T028 Implement Input + Label in src/primitives/"
Task: "T030 Implement Card/Separator/Badge/Skeleton/Avatar in src/primitives/"
# etc.
```

---

## Parallel Example: US1 Auth Components (Phase 5b)

```bash
# Launch all auth test tasks together (run FIRST, verify they FAIL):
Task: "T042 Write failing test for AuthLayout in tests/auth/auth-layout.test.tsx"
Task: "T044 Write failing test for SocialLoginButtons in tests/auth/social-login-buttons.test.tsx"
Task: "T046 Write failing test for LoginForm in tests/auth/login-form.test.tsx"
Task: "T048 Write failing test for SignupForm in tests/auth/signup-form.test.tsx"
Task: "T050 Write failing test for ForgotPasswordForm + ResetPasswordForm in tests/auth/password-forms.test.tsx"
Task: "T052 Write failing test for MfaSetup in tests/auth/mfa-setup.test.tsx"
Task: "T054 Write failing test for MfaChallenge in tests/auth/mfa-challenge.test.tsx"

# Then implement sequentially (some share patterns, best done in order):
Task: "T043 Implement AuthLayout"
Task: "T045 Implement SocialLoginButtons"
Task: "T047 Implement LoginForm"
# etc.
```

---

## Implementation Strategy

### MVP First (US1 + Foundation)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundation (T007-T018)
3. Complete Phase 5: US1 Auth Pages (T025-T057)
4. **STOP and VALIDATE**: Run full test suite, typecheck, build
5. Products can adopt `@dream/ui/auth` immediately

### Incremental Delivery

1. Setup + Foundation → Infrastructure ready
2. Add US6 Theming → Theming validated → Products can override CSS vars
3. Add US7 API Adapter → Adapter validated → createFetchAdapter works
4. Add US1 Auth Pages → Test independently → Deploy/Demo (MVP!)
5. Add US8 Testing → Test utilities validated → Products can write tests
6. Add Storybook → Visual documentation ready
7. Verify all gates → Phase 1 complete

### Phase 2-4 (Future)

After Phase 1 ships:
- **Phase 2**: US2 (UserButton + OrgSwitcher) + US4 (User Profile) — new tasks.md generated
- **Phase 3**: US3 (Org Management) — new tasks.md generated
- **Phase 4**: US5 (Admin Dashboard) — new tasks.md generated

---

## Notes

- [P] tasks = different files, no dependencies — safe to parallelize
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing (Red-Green-Refactor)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All primitives follow the Radix UI + cn() + CVA pattern (see plan.md Tasks 10-17 for exact code)
- All auth components follow the react-hook-form + Zod + slots pattern (see plan.md Tasks 19-25)
- Security-critical components (MfaChallenge) are sealed — className only, no slots
- Total: 70 tasks across 8 phases
