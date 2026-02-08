# Feature Specification: Shared UI Component Library (@dream/ui)

**Feature Branch**: `008-shared-ui-components`
**Created**: 2026-02-07
**Status**: Draft
**Input**: User description: "Shared UI Component Library providing pre-built, themeable, production-ready React components for authentication flows, organization/tenant management, user profile & account settings, and admin dashboards. Builds on existing @dream/auth, @dream/rbac, @dream/multi-tenant headless layer. Eliminates duplicated UI work across 5 Next.js products."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Product Developer Adds Branded Authentication Pages (Priority: P1)

A developer working on any of the 5 products replaces their hand-built login, signup, and password reset pages with shared components from `@dream/ui`. They import `<LoginForm>`, `<SignupForm>`, and `<ForgotPasswordForm>`, wrap them in `<AuthLayout>`, and configure branding (logo, product name, colors) through CSS custom properties. Within an hour, the product has production-quality authentication pages that match its brand, support email/password and social login, and handle all edge cases (validation errors, account lockout, rate limiting) consistently.

**Why this priority**: Authentication pages are the first thing every user sees. Today all 5 products build their own login pages independently, duplicating form validation, error handling, social login button layouts, and loading states. A shared auth UI eliminates the highest-volume duplication and delivers immediate visual consistency across the platform.

**Independent Test**: Import `<LoginForm>` into a Next.js product, set CSS variables for the product's brand color, render the page, and verify the form displays with the correct branding, submits credentials, shows validation errors for invalid input, and redirects on successful login.

**Acceptance Scenarios**:

1. **Given** a product installs `@dream/ui` and overrides `--dream-color-primary` in its CSS, **When** the developer renders `<LoginForm>`, **Then** the form uses the product's brand color for buttons, focus rings, and links.
2. **Given** a developer configures `<LoginForm providers={['credentials', 'google']}>`, **When** the page loads, **Then** both an email/password form and a "Sign in with Google" button appear with a visual divider between them.
3. **Given** a user enters an invalid email format, **When** they attempt to submit the login form, **Then** a clear validation error appears below the email field before any network request is made.
4. **Given** a user submits correct credentials, **When** authentication succeeds, **Then** the form shows a brief loading state and redirects to the configured callback URL.
5. **Given** the authentication service returns an error (wrong password, locked account), **When** the error is received, **Then** the form displays a user-friendly error message without exposing technical details.
6. **Given** a product needs a "Terms of Service" checkbox on its signup form, **When** the developer adds custom content via the `slots.afterFields` prop, **Then** the checkbox renders between the form fields and submit button without modifying the component's source code.
7. **Given** the user's browser is set to dark mode, **When** the product applies the `.dark` class to the HTML root, **Then** all auth components render with dark-mode colors.

---

### User Story 2 — Product Developer Adds User Menu and Organization Switcher to Layout (Priority: P1)

A developer adds `<UserButton>` and `<OrgSwitcher>` to the product's shared layout header. The user button shows the current user's avatar and opens a dropdown with profile link, security settings, and sign-out. The organization switcher lists the user's organizations and allows switching between them. Both components consume the existing `useAuth()` and `useTenant()` hooks, requiring zero additional API configuration.

**Why this priority**: These two components appear on every authenticated page. They are the most frequently seen UI elements after the login form. Currently each product builds its own avatar dropdown and organization picker with inconsistent functionality and styling.

**Independent Test**: Render `<UserButton>` and `<OrgSwitcher>` in a layout, verify the user's name and avatar display correctly, click the user button to open the dropdown, click the org switcher to see the organization list, switch organizations and verify the tenant context updates.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** the layout renders `<UserButton>`, **Then** the user's avatar (or initials fallback) and name are displayed.
2. **Given** the user clicks `<UserButton>`, **When** the dropdown opens, **Then** it shows the user's email, links to profile and security settings, and a sign-out button.
3. **Given** a user belongs to 3 organizations, **When** they click `<OrgSwitcher>`, **Then** all 3 organizations appear with their logos and names, and the current organization is visually highlighted.
4. **Given** a user selects a different organization in the switcher, **When** the switch completes, **Then** the page context updates to the new organization and all data-fetching components reload with the new tenant scope.
5. **Given** a user belongs to more than 10 organizations, **When** the switcher opens, **Then** a search field appears allowing the user to filter organizations by name.
6. **Given** a product wants to add a custom menu item (e.g., "Billing") to `<UserButton>`, **When** the developer uses the `slots` prop, **Then** the custom item appears in the dropdown alongside the default items.

---

### User Story 3 — Product Developer Adds Organization Management Pages (Priority: P2)

A developer builds the "Settings" section of the product by composing shared components: `<OrgSettingsForm>` for organization details, `<MemberList>` for viewing and managing team members, `<InviteMemberDialog>` for sending invitations, and `<RoleEditor>` for managing roles and permissions. All components enforce permission checks automatically — a viewer sees the member list read-only, while an admin sees edit and invite buttons. The developer provides data through a configurable API adapter rather than being locked into a specific backend.

**Why this priority**: Organization management (member list, invite flow, role editing) is the most time-consuming admin section to build. Each product spends 2-3 weeks building these pages independently. Sharing them eliminates the single largest area of duplicated effort after authentication.

**Independent Test**: Render `<MemberList>` with a mock API adapter, verify it displays members with roles, verify invite button only appears for users with `invitations:create` permission, invite a new member and verify it appears in the list.

**Acceptance Scenarios**:

1. **Given** a user with `users:read` permission, **When** they view `<MemberList>`, **Then** they see a paginated table of organization members with names, emails, and role badges.
2. **Given** a user with `invitations:create` permission, **When** `<MemberList>` renders, **Then** an "Invite Member" button appears. **Given** a user WITHOUT this permission, **Then** the button is hidden.
3. **Given** an admin clicks "Invite Member", **When** the `<InviteMemberDialog>` opens, **Then** it shows email and role selection fields. **When** they submit, **Then** the invitation is sent and a success toast appears.
4. **Given** a user with `roles:write` permission, **When** they open `<RoleEditor>`, **Then** they see all roles with their permissions displayed as a checkbox matrix. They can create custom roles, edit permission assignments, and delete non-built-in roles.
5. **Given** a role hierarchy where admin outranks manager, **When** a manager opens `<RoleAssignmentDialog>`, **Then** they cannot assign a user to the admin role (only roles at or below their own level).
6. **Given** `<OrgSettingsForm>` is rendered, **When** an admin edits the organization name or uploads a new logo, **Then** changes are validated and saved through the API adapter, and a success confirmation appears.
7. **Given** a product uses a custom backend, **When** the developer provides a custom `ApiAdapter` implementation, **Then** all org management components use that adapter for data operations instead of the default fetch-based adapter.

---

### User Story 4 — Product Developer Adds User Profile and Security Pages (Priority: P2)

A developer adds user self-service pages: `<UserProfileForm>` for editing profile information, `<ChangePasswordForm>` for updating passwords, `<SecuritySettings>` for managing MFA and viewing active sessions, and `<ActiveSessions>` for reviewing and revoking login sessions. Users manage their own account without admin intervention.

**Why this priority**: User profile pages are required by all 5 products and follow an identical pattern. The security settings page (MFA management, session review) is particularly important because inconsistent security UIs across products confuse users and create support tickets.

**Independent Test**: Render `<UserProfileForm>`, edit the user's name, submit the form, and verify the name updates. Navigate to `<SecuritySettings>`, view active sessions, revoke a session, and verify it disappears from the list.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they view `<UserProfileForm>`, **Then** their current name, email (read-only), and avatar are displayed in editable fields.
2. **Given** a user updates their name and clicks save, **When** the form submits, **Then** the API adapter is called with the updated data, and a success toast confirms the change.
3. **Given** a user opens `<ChangePasswordForm>`, **When** they enter their current password, a new password, and confirmation, **Then** the form validates that passwords match and meet strength requirements before submitting.
4. **Given** a user has not yet set up MFA, **When** they view `<SecuritySettings>`, **Then** an "Enable Two-Factor Authentication" option is prominently displayed.
5. **Given** a user views `<ActiveSessions>`, **When** the page loads, **Then** they see a list of their active sessions showing device type, location, last activity, and a "Revoke" button for non-current sessions.
6. **Given** a user clicks "Revoke" on a session, **When** confirmed, **Then** the session is terminated through the API adapter and removed from the list.

---

### User Story 5 — Product Developer Adds Admin Dashboard Pages (Priority: P3)

A developer builds admin-only pages using `<AuditLogViewer>` for reviewing security events, `<ApiKeyManager>` for managing API access, `<WebhookManager>` for configuring webhook endpoints, and `<SessionManager>` for viewing all active sessions across the organization. All components are automatically gated behind admin-level permissions and display appropriate empty states for non-admin users.

**Why this priority**: Admin dashboard pages are complex to build (data tables with filters, expandable rows, real-time data) but are used by a small number of admin users. They represent important platform capabilities but lower immediate user impact than auth or org management.

**Independent Test**: Render `<AuditLogViewer>` as an admin, verify audit events appear in a filterable table, apply a date range filter, and verify results narrow correctly. Render as a non-admin and verify access is denied.

**Acceptance Scenarios**:

1. **Given** an admin user, **When** they view `<AuditLogViewer>`, **Then** they see a paginated table of audit events with columns for timestamp, actor, action, resource, and IP address.
2. **Given** the audit log table, **When** the admin applies a date range filter and an action type filter, **Then** results update to show only matching events.
3. **Given** an admin clicks on an audit log row, **When** the row expands, **Then** it shows the before/after state diff of the modified resource.
4. **Given** an admin views `<ApiKeyManager>`, **When** they click "Create API Key", **Then** a dialog collects key name and permission scopes. After creation, the full key value is displayed once (never shown again) with a copy button.
5. **Given** an admin views `<WebhookManager>`, **When** they create a webhook with a URL and selected event types, **Then** the webhook appears in the list. They can test it with a sample event and view the delivery response.
6. **Given** an admin views `<SessionManager>`, **When** the page loads, **Then** they see all active sessions across the organization (all users), not just their own. They can revoke any session.
7. **Given** a non-admin user attempts to access any admin component, **When** permission gates evaluate, **Then** the component renders a fallback (empty or "access denied") without making API calls for admin data.

---

### User Story 6 — Product Developer Customizes Component Theming (Priority: P1)

A developer brands all shared components to match their product's visual identity. They override CSS custom properties (`--dream-color-primary`, `--dream-radius-lg`, etc.) in their product's global stylesheet, include the `@dream/ui` Tailwind preset in their Tailwind config, and optionally configure branding (logo URL, product name, support link) via `<DreamUIProvider>`. All components automatically adopt the product's visual identity without any per-component configuration.

**Why this priority**: Theming is a prerequisite for adoption. No product team will adopt shared components that cannot be visually branded to match their product. This is a blocker for all other user stories.

**Independent Test**: Set `--dream-color-primary` to a distinctive color, render any component, and verify the color appears on buttons, focus rings, and links. Toggle dark mode and verify all colors switch to dark variants.

**Acceptance Scenarios**:

1. **Given** a product sets `--dream-color-primary: 221 83% 53%` in its CSS, **When** any `@dream/ui` component renders, **Then** primary buttons, links, and focus indicators use that blue color.
2. **Given** a product includes `dreamPreset` in its Tailwind config and adds `@dream/ui` dist to the content paths, **When** the product builds, **Then** all `@dream/ui` Tailwind classes are included in the output CSS.
3. **Given** a product sets `<DreamUIProvider branding={{ logo: '/logo.svg', productName: 'Dream Team' }}>`, **When** `<AuthLayout>` renders, **Then** the product logo and name appear on the authentication pages.
4. **Given** the product's HTML root has the `.dark` class, **When** any component renders, **Then** backgrounds, text, borders, and interactive elements use dark-mode color variants.
5. **Given** a developer passes `className="max-w-lg"` to any component, **When** it renders, **Then** the Tailwind class is applied alongside the component's default classes without conflicts.

---

### User Story 7 — Product Developer Connects Components to Backend via API Adapter (Priority: P1)

A developer provides an `ApiAdapter` implementation to `<DreamUIProvider>` that maps component data operations (list members, create invitation, query audit log, etc.) to the product's actual backend endpoints. A default adapter using standard `fetch` against conventional REST endpoints is provided out-of-the-box. Products with non-standard backends implement the adapter interface to match their API structure.

**Why this priority**: Components are useless if they can't fetch and mutate data. The API adapter decouples the UI from any specific backend, which is essential because the 5 products have different backend architectures (some use Prisma, others Drizzle, some have REST APIs, others use Next.js server actions).

**Independent Test**: Render `<MemberList>` with a mock API adapter, verify it calls `listMembers()`, displays the returned data, and correctly handles pagination. Replace with the default fetch adapter pointing to a real endpoint and verify the same behavior.

**Acceptance Scenarios**:

1. **Given** a product provides `createFetchAdapter({ baseUrl: '/api/platform' })` to `<DreamUIProvider>`, **When** `<MemberList>` loads, **Then** it makes a GET request to `/api/platform/members` and displays the response.
2. **Given** a product provides a custom adapter that calls server actions instead of REST, **When** any component performs a data operation, **Then** the custom adapter handles the call without the component needing to know the implementation.
3. **Given** a data operation fails, **When** the adapter throws an error, **Then** the component displays a user-friendly error message using the shared error classes from `@dream/errors`.
4. **Given** a list component receives paginated data, **When** the user navigates to the next page, **Then** the component calls the adapter's list method with the next cursor/offset and renders the new data.
5. **Given** a test environment, **When** the developer uses `<MockApiProvider>` from `@dream/ui/testing`, **Then** all components render with mock data without requiring a real backend.

---

### User Story 8 — Developer Tests Components in Isolation (Priority: P2)

A developer writes unit tests for pages that use `@dream/ui` components. They use `renderWithProviders()` from `@dream/ui/testing` to wrap components in all required providers (auth, tenant, API adapter) with sensible defaults. They use `MockAuthProvider` and `MockTenantProvider` to simulate different user states (admin, viewer, unauthenticated) and verify that permission gates show/hide content correctly.

**Why this priority**: Testability is critical for adoption. If shared components are difficult to test, product teams will build their own. Providing test utilities reduces friction and ensures consistent test patterns across all 5 products.

**Independent Test**: Write a unit test that renders `<MemberList>` using `renderWithProviders()` with a mock admin user, verify the invite button appears. Re-render with a mock viewer user, verify the invite button is hidden.

**Acceptance Scenarios**:

1. **Given** a developer imports `renderWithProviders` from `@dream/ui/testing`, **When** they render a `<PermissionGate>` with `permissions: ['users:write']`, **Then** gated content appears for an admin and is hidden for a viewer.
2. **Given** a developer provides a partial `apiAdapter` override to `renderWithProviders()`, **When** the component calls an adapter method, **Then** the mock returns configured test data.
3. **Given** a developer renders `<LoginForm>` in a test, **When** they fill in fields and submit, **Then** they can assert on form validation behavior and API adapter calls without a real authentication service.

---

### Edge Cases

- What happens when a component renders outside of its required provider (e.g., `<OrgSwitcher>` without `<TenantProvider>`)? The component fails gracefully with a descriptive development-time error message, never crashes the application.
- What happens when the API adapter returns an empty list? Components display a clear empty state (e.g., "No members found" with a call-to-action to invite the first member).
- What happens when a component's data fetch is slow? Components show skeleton loading states that match the final layout dimensions to prevent layout shift.
- What happens when the user's session expires while interacting with a component? Components that detect a 401 response redirect to the login page via `useAuth().signOut()`.
- What happens when a product uses React 18 vs React 19? Components work identically on both versions — no use of deprecated APIs (defaultProps on function components) or version-specific features.
- What happens when two products override the same CSS variable with different values? Each product's override is scoped to its own build — CSS variables are set per-product in their globals.css, not globally.
- What happens when a product only imports `@dream/ui/auth` but not `@dream/ui/admin`? Only auth components and their dependencies are bundled — tree-shaking eliminates unused surface areas.

## Requirements *(mandatory)*

### Functional Requirements

**Primitives Layer**:

- **FR-001**: System MUST provide a set of accessible primitive components (Button, Input, Label, Card, Form, Skeleton, Toast, Avatar, Badge, Separator, Dialog, Popover, DropdownMenu, Select, Tabs, DataTable) that all surface-area components build upon.
- **FR-002**: All primitive components MUST accept a `className` prop for Tailwind CSS overrides and merge it with default classes without conflicts.
- **FR-003**: All interactive primitives MUST be fully keyboard-navigable and provide appropriate ARIA attributes for screen readers.
- **FR-004**: The Form primitive MUST integrate with form validation schemas from `@dream/types` for consistent client-side validation across all forms.

**Auth Surface**:

- **FR-010**: System MUST provide `<LoginForm>` supporting email/password and configurable social identity providers.
- **FR-011**: System MUST provide `<SignupForm>` with name, email, password fields and configurable slot extension points.
- **FR-012**: System MUST provide `<ForgotPasswordForm>` and `<ResetPasswordForm>` for self-service password recovery.
- **FR-013**: System MUST provide `<MfaSetup>` for TOTP enrollment (QR code display, backup code generation) and `<MfaChallenge>` for 6-digit code entry with backup code fallback.
- **FR-014**: System MUST provide `<SocialLoginButtons>` rendering identity provider buttons based on a configurable list of providers.
- **FR-015**: System MUST provide `<AuthLayout>` wrapping any auth form in a centered card layout with product logo, title, and description.
- **FR-016**: MFA components (MfaSetup, MfaChallenge) MUST NOT expose slot-based customization to prevent security-sensitive UI modifications.

**Organization Management Surface**:

- **FR-020**: System MUST provide `<OrgSwitcher>` showing the user's organizations, the currently active organization, and allowing switching between them.
- **FR-021**: System MUST provide `<OrgSettingsForm>` for editing organization name, logo, and configuration.
- **FR-022**: System MUST provide `<MemberList>` displaying a paginated table of organization members with role badges and action buttons gated by user permissions.
- **FR-023**: System MUST provide `<InviteMemberDialog>` for inviting new users by email with role selection.
- **FR-024**: System MUST provide `<RoleEditor>` displaying roles with a permission checkbox matrix. Built-in roles MUST be read-only; custom roles MUST be editable.
- **FR-025**: System MUST provide `<RoleAssignmentDialog>` for changing a member's role, restricted by role hierarchy (users cannot assign roles above their own level).
- **FR-026**: System MUST provide `<OrgCreateDialog>` for creating new organizations with name and auto-generated slug.

**User Profile Surface**:

- **FR-030**: System MUST provide `<UserButton>` displaying the user's avatar and name, opening a dropdown with profile, security, and sign-out actions.
- **FR-031**: System MUST provide `<UserProfileForm>` for editing name, phone, and avatar. Email MUST be displayed read-only.
- **FR-032**: System MUST provide `<ChangePasswordForm>` requiring current password, new password, and confirmation with strength validation.
- **FR-033**: System MUST provide `<NotificationPreferences>` displaying a toggle matrix for email and in-app notification categories.
- **FR-034**: System MUST provide `<SecuritySettings>` showing MFA status, active sessions summary, and connected SSO accounts.
- **FR-035**: System MUST provide `<ActiveSessions>` listing all active sessions with device, location, and last activity. Users MUST be able to revoke non-current sessions.
- **FR-036**: System MUST provide `<ConnectedAccounts>` listing SSO provider connections with connect/disconnect actions.

**Admin Dashboard Surface**:

- **FR-040**: System MUST provide `<AuditLogViewer>` displaying a paginated, filterable table of audit events with expandable rows showing state diffs.
- **FR-041**: System MUST provide `<AuditLogFilters>` with date range, actor search, action type, and resource type filters.
- **FR-042**: System MUST provide `<ApiKeyManager>` listing API keys with create and revoke capabilities. Newly created keys MUST be shown in full exactly once.
- **FR-043**: System MUST provide `<WebhookManager>` listing webhook endpoints with create, edit, delete, and test capabilities.
- **FR-044**: System MUST provide `<SessionManager>` listing all active sessions across the organization (all users) with bulk revoke capability.
- **FR-045**: All admin surface components MUST be permission-gated and render fallback content for users without admin-level access.

**Theming & Branding**:

- **FR-050**: System MUST use CSS custom properties with a `--dream-` prefix for all design tokens (colors, radii, fonts, shadows, spacing).
- **FR-051**: System MUST provide a Tailwind CSS preset mapping CSS custom properties to Tailwind utility classes.
- **FR-052**: System MUST support dark mode via a `.dark` CSS class that overrides all color tokens.
- **FR-053**: System MUST provide `<DreamUIProvider>` accepting branding configuration (logo URL, product name, support URL, terms URL, privacy URL), an API adapter, and an optional `onError` callback.
- **FR-055**: The optional `onError` callback in `DreamUIProvider` MUST receive error context including the component name, error type, user action that triggered the error, and the original error object. Products use this to integrate with their error tracking tools.
- **FR-054**: Products MUST be able to override theming by setting CSS custom properties in their global stylesheet without modifying component source code.

**API Adapter & Data Fetching**:

- **FR-060**: System MUST define an `ApiAdapter` interface specifying all data operations (list, create, update, delete) for members, invitations, roles, audit events, API keys, webhooks, sessions, and user profile.
- **FR-061**: System MUST provide a default `createFetchAdapter()` implementation using `fetch` against standard REST endpoint conventions.
- **FR-062**: Products MUST be able to provide custom `ApiAdapter` implementations to connect components to non-standard backends.
- **FR-063**: All data-fetching components MUST show skeleton loading states during data retrieval and user-friendly error messages on failure.

**Packaging & Distribution**:

- **FR-070**: System MUST be published as a single `@dream/ui` npm package with sub-path exports for each surface area (auth, org, user, admin, theme, tailwind, testing).
- **FR-071**: Sub-path exports MUST be tree-shakeable — importing `@dream/ui/auth` MUST NOT bundle admin, org, or user components.
- **FR-072**: System MUST support React 18 and React 19 without conditional imports or version-specific code paths.
- **FR-073**: System MUST provide `@dream/ui/testing` exports including `MockApiProvider`, `renderWithProviders()`, and per-provider test utilities.

**Customization & Extensibility**:

- **FR-080**: Compound components (LoginForm, SignupForm, MemberList, UserButton) MUST support a `slots` prop for injecting custom content at predefined extension points.
- **FR-081**: Security-critical components (MfaChallenge, ApiKeyCreateDialog) MUST NOT support slot-based customization — `className` is the only allowed override.
- **FR-082**: Data table components (MemberList, AuditLogViewer, SessionManager) MUST support custom column definitions and row render functions for product-specific customization.

**Responsive Behavior**:

- **FR-090**: Auth surface components (LoginForm, SignupForm, ForgotPasswordForm, ResetPasswordForm, MfaSetup, MfaChallenge, AuthLayout) and user profile surface components (UserProfileForm, ChangePasswordForm, SecuritySettings) MUST be fully responsive, rendering correctly on viewports from 320px to desktop.
- **FR-091**: Admin surface components (AuditLogViewer, ApiKeyManager, WebhookManager, SessionManager) and org management data tables (MemberList, RoleEditor) MUST target desktop viewports with a minimum width of 768px. Below 768px, these components MAY display a "best viewed on desktop" message.
- **FR-092**: Layout components (UserButton, OrgSwitcher) MUST adapt to both mobile and desktop header layouts.

**Documentation & Development**:

- **FR-100**: System MUST include Storybook stories for all components, showcasing props, variants, states (loading, error, empty, populated), and dark mode. Storybook is a dev dependency only and MUST NOT be included in the published package.
- **FR-101**: Each component's Storybook story MUST demonstrate theming by showing the component with at least two different brand configurations.

### Key Entities

- **DreamUIProvider**: Root provider component that supplies API adapter, branding configuration, and toast context to all `@dream/ui` components. Must be nested inside `AuthProvider` and `TenantProvider`.
- **ApiAdapter**: Interface defining all data operations (CRUD for members, invitations, roles, audit events, API keys, webhooks, sessions, user profile). Products implement this interface or use the default fetch-based adapter.
- **Theme Tokens**: Set of CSS custom properties (50+ tokens) covering colors (primary, secondary, accent, destructive, muted, background, foreground), shape (border radii), typography (font families), spacing, and shadows. Light and dark mode variants.
- **Slots**: TypeScript interface for each customizable component defining named extension points with their position and expected render function signature. Slots are type-safe — invalid slot names produce compile-time errors.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer can add branded authentication pages (login, signup, password reset) to a new product in under 1 hour, measured from package installation to working auth flow.
- **SC-002**: All 5 products can share identical authentication, profile, and admin UIs while maintaining distinct visual branding — verified by rendering the same component with 5 different theme configurations.
- **SC-003**: Shared components reduce per-product UI development effort for auth, org management, profile, and admin pages by at least 70%, measured by comparing pre-shared and post-shared implementation time estimates.
- **SC-004**: Components pass all WCAG 2.1 AA accessibility requirements — keyboard navigation, screen reader compatibility, color contrast, and focus management — verified by automated accessibility testing.
- **SC-005**: Importing a single surface area (e.g., `@dream/ui/auth`) adds no more than 50KB gzipped to the product's bundle, verified by bundle analysis.
- **SC-006**: All permission-gated components correctly show/hide content based on user permissions, verified by rendering each component with admin and viewer roles and asserting on visibility.
- **SC-007**: Components show skeleton loading states within 100ms of mount and render data within 50ms of API adapter response, verified by component performance tests.
- **SC-008**: Dark mode toggle applies to all components without any visual artifacts — no hard-coded colors, no missing dark variants — verified by visual regression tests in both light and dark modes.
- **SC-009**: Test utilities (`renderWithProviders`, `MockApiProvider`) enable developers to write component tests without real backends, verified by example test files covering all surface areas.
- **SC-010**: Each phase of the component library can be adopted independently — a product can use Phase 1 (auth) without waiting for Phase 3 (org management) — verified by installing each sub-path export in isolation.

## Clarifications

### Session 2026-02-07

- Q: Should components be responsive for mobile browsers or desktop-only? → A: Auth and profile pages are fully responsive (mobile-first); admin pages (audit log, API keys, webhooks, sessions) are desktop-only with a minimum viewport of 768px.
- Q: Should the component library include Storybook for visual development and documentation? → A: Yes. Include Storybook with stories for all components as a dev dependency. Not shipped in the published package. Serves as living documentation and visual contract for all 5 product teams.
- Q: Should components emit error events for product-level monitoring and analytics? → A: Yes. DreamUIProvider accepts an optional `onError` callback that receives all component errors with context (component name, error type, user action). Products route this to their existing error tracking (Sentry, LogRocket, etc.).

## Assumptions

- All 5 products use Next.js App Router with React 18 or 19 and Tailwind CSS 3.4+ or 4.0+.
- Products have already integrated `@dream/auth`, `@dream/rbac`, and `@dream/multi-tenant` headless packages from the 007-shared-platform-foundation feature.
- Products use `'use client'` directives for client-side components (Next.js convention).
- Data validation schemas from `@dream/types` (Zod schemas) are available for form validation.
- Products manage their own routing — `@dream/ui` provides page-level components but does not dictate URL structure.
- The default `createFetchAdapter()` targets RESTful endpoints following standard conventions (`GET /api/platform/members`, `POST /api/platform/invitations`, etc.). Products with non-standard APIs provide custom adapters.
- Dark mode is toggled at the product level (via `.dark` class on HTML root). Components do not provide their own dark mode toggle.
- Internationalization (i18n) is deferred to a future phase. Components initially ship with English strings only, structured for future extraction.
