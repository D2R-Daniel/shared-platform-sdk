# Phase 1 UX Design: React Component & Hook APIs

**Feature**: Shared Platform Foundation -- React Component & Hook APIs
**Date**: 2026-02-07
**Packages**: `@dream/auth/react`, `@dream/rbac/react`, `@dream/multi-tenant/react`
**Source**: [spec.md](spec.md), [contracts/](contracts/), [data-model.md](data-model.md)
**React Compatibility**: React 18 and React 19

---

## Table of Contents

1. [Component Architecture Overview](#1-component-architecture-overview)
2. [@dream/auth React Components](#2-dreamauth-react-components)
3. [@dream/rbac React Components](#3-dreamrbac-react-components)
4. [@dream/multi-tenant React Components](#4-dreammulti-tenant-react-components)
5. [Component Interaction Patterns](#5-component-interaction-patterns)
6. [Error Boundaries and Safe Defaults](#6-error-boundaries-and-safe-defaults)
7. [Testing Utilities](#7-testing-utilities)
8. [Type Reference](#8-type-reference)

---

## 1. Component Architecture Overview

### Provider Hierarchy

All React components follow a required nesting order. `AuthProvider` must wrap `TenantProvider`, because tenant resolution depends on the authenticated user's organization memberships.

```tsx
// app/layout.tsx (Next.js App Router)
import { AuthProvider } from '@dream/auth/react';
import { TenantProvider } from '@dream/multi-tenant/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthProvider>
          <TenantProvider>
            {children}
          </TenantProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Design Constraints

- **React Context only.** All providers use `React.createContext`. No external state management libraries are required.
- **React 18 and React 19 compatible.** No use of `defaultProps` on function components (removed in React 19). All defaults are handled via destructuring or nullish coalescing in the function body.
- **Sub-path exports.** React components and hooks are exported from sub-paths (`@dream/auth/react`, `@dream/rbac/react`, `@dream/multi-tenant/react`), not from the package root. This keeps server-only code out of client bundles.
- **No server requests from UI components.** Permission and role gates read from the auth context populated at session time. They never make network requests. This ensures permission checks complete in under 5ms (SC-007).
- **Tree-shakeable.** Importing `usePermission` from `@dream/rbac/react` does not pull in server middleware, permission matching utilities, or role hierarchy logic.

---

## 2. @dream/auth React Components

### AuthProvider

Wraps NextAuth's `SessionProvider` and enriches the session with platform-specific fields (roles, permissions, tenant context). Must be placed at the root of the component tree, above `TenantProvider`.

**Import:**

```tsx
import { AuthProvider } from '@dream/auth/react';
```

**Props:**

```typescript
interface AuthProviderProps {
  children: React.ReactNode;
  config?: AuthProviderConfig;
}

interface AuthProviderConfig {
  /**
   * Base URL for auth API routes. Defaults to '/api/auth'.
   */
  basePath?: string;

  /**
   * Session refetch interval in seconds. Defaults to 0 (no polling).
   * Set to a positive number to enable periodic session refresh.
   */
  refetchInterval?: number;

  /**
   * Whether to refetch the session when the window regains focus.
   * Defaults to true.
   */
  refetchOnWindowFocus?: boolean;
}
```

**Behavior:**

- Wraps the application in NextAuth's `SessionProvider`, forwarding `basePath`, `refetchInterval`, and `refetchOnWindowFocus` to it.
- Exposes the enriched session (user identity, roles, permissions, active organization) through the `useAuth` hook.
- Handles session loading state. While the session is being fetched, `useAuth().isLoading` returns `true` and `useAuth().user` returns `null`.

**Usage:**

```tsx
// Minimal setup -- all defaults
<AuthProvider>
  <App />
</AuthProvider>

// With configuration
<AuthProvider config={{ basePath: '/api/auth', refetchInterval: 300 }}>
  <App />
</AuthProvider>
```

### useAuth Hook

Returns the current authentication state and actions. Must be called inside an `AuthProvider`.

**Import:**

```tsx
import { useAuth } from '@dream/auth/react';
```

**Signature:**

```typescript
function useAuth(): AuthContext;

interface AuthContext {
  /** Current authenticated user, or null if not authenticated or still loading. */
  user: SessionUser | null;

  /** Whether the user is authenticated. False while loading. */
  isAuthenticated: boolean;

  /** Whether the session is being fetched. True on initial load. */
  isLoading: boolean;

  /**
   * Initiates sign-in with the given provider.
   * @param provider - 'credentials' | 'azure-entra' | 'google' | 'generic-oidc'
   * @param options - Optional: callbackUrl, redirect behavior
   */
  signIn: (provider: string, options?: SignInOptions) => Promise<void>;

  /** Signs the user out and clears the session. */
  signOut: () => Promise<void>;

  /**
   * Switches the user's active organization. Updates the JWT with new
   * tenant context, roles, and permissions for the target organization.
   * @param organizationId - UUID of the target organization
   */
  switchOrganization: (organizationId: string) => Promise<void>;
}

interface SignInOptions {
  callbackUrl?: string;
  redirect?: boolean;
}
```

**`SessionUser` shape** (from `@dream/types`):

```typescript
interface SessionUser {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  roleSlugs: string[];
  activeRole: string;
  permissions: string[];
  tenantStatus: 'active' | 'suspended' | 'archived';
}
```

**Example -- Navbar with user info and logout:**

```tsx
import { useAuth } from '@dream/auth/react';

function Navbar() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();

  if (isLoading) return <NavSkeleton />;
  if (!isAuthenticated) return <SignInButton />;

  return (
    <nav>
      <span>Welcome, {user.name}</span>
      <span>{user.email}</span>
      <button onClick={() => signOut()}>Log out</button>
    </nav>
  );
}
```

---

## 3. @dream/rbac React Components

All RBAC components and hooks read from the auth context. They perform no network requests and no database queries. Permission evaluation happens entirely on the client using the permissions array embedded in the session JWT.

### PermissionGate

Conditionally renders children based on whether the current user holds a specific permission.

**Import:**

```tsx
import { PermissionGate } from '@dream/rbac/react';
```

**Props:**

```typescript
interface PermissionGateProps {
  /** Permission string in resource:action format (e.g., 'invoices:write'). */
  permission: string;

  /** Content to render when the user has the permission. */
  children: React.ReactNode;

  /** Content to render when the user lacks the permission. Defaults to null (render nothing). */
  fallback?: React.ReactNode;
}
```

**Behavior:**

- Reads the user's permissions from the auth context via `useAuth()`.
- Evaluates using the same `matchesPermission()` logic as the server: exact match, action wildcard (`users:*`), and global wildcard (`*`).
- If the user is not authenticated (no session), renders the fallback. This is the safe default -- deny access when identity is unknown.
- Does NOT throw if there is no auth context. Returns fallback instead.

**Example -- Conditionally showing an edit button:**

```tsx
import { PermissionGate } from '@dream/rbac/react';

function InvoiceToolbar() {
  return (
    <div>
      <PermissionGate permission="invoices:read">
        <ExportButton />
      </PermissionGate>

      <PermissionGate
        permission="invoices:write"
        fallback={<Tooltip content="You do not have edit access">
          <EditButton disabled />
        </Tooltip>}
      >
        <EditButton />
      </PermissionGate>
    </div>
  );
}
```

### RoleGate

Conditionally renders children based on whether the user's active role matches the specified role slug.

**Import:**

```tsx
import { RoleGate } from '@dream/rbac/react';
```

**Props:**

```typescript
interface RoleGateProps {
  /** Role slug to check against the user's active role (e.g., 'admin', 'manager'). */
  role: string;

  /** Content to render when the user's active role matches. */
  children: React.ReactNode;

  /** Content to render when the role does not match. Defaults to null. */
  fallback?: React.ReactNode;
}
```

**Behavior:**

- Checks whether the user's `activeRole` (from the session) matches the specified `role` slug.
- This is an exact match on the active role, not a hierarchy check. For hierarchy-based gating, use `useHasMinimumRole` or `AdminGate`.
- If the user holds multiple roles (e.g., `admin` and `hr_admin`), only the `activeRole` is checked.

**Example -- Showing a settings panel for managers:**

```tsx
import { RoleGate } from '@dream/rbac/react';

function SettingsPage() {
  return (
    <div>
      <GeneralSettings />
      <RoleGate role="manager" fallback={<p>Contact your manager for team settings.</p>}>
        <TeamSettings />
      </RoleGate>
    </div>
  );
}
```

### AdminGate

Shorthand for rendering content only when the user's role is `admin` or higher in the hierarchy (i.e., `admin` at level 10 or `super_admin` at level 0).

**Import:**

```tsx
import { AdminGate } from '@dream/rbac/react';
```

**Props:**

```typescript
interface AdminGateProps {
  /** Content to render when the user is an admin or super_admin. */
  children: React.ReactNode;

  /** Content to render when the user is not an admin. Defaults to null. */
  fallback?: React.ReactNode;
}
```

**Behavior:**

- Checks whether the user's active role has a hierarchy level of 10 or lower (`super_admin` = 0, `admin` = 10).
- Equivalent to `useHasMinimumRole('admin')` but as a declarative component.
- Custom roles at level 10 (e.g., `hr_admin` at level 10 in Dream Payroll) also pass this gate.

**Example -- Admin-only dashboard link:**

```tsx
import { AdminGate } from '@dream/rbac/react';

function AppHeader() {
  return (
    <header>
      <Logo />
      <AdminGate>
        <Link to="/admin">Admin Dashboard</Link>
      </AdminGate>
    </header>
  );
}
```

### usePermission Hook

Returns whether the current user holds a specific permission.

**Import:**

```tsx
import { usePermission } from '@dream/rbac/react';
```

**Signature:**

```typescript
function usePermission(permission: string): boolean;
```

**Behavior:**

- Reads the user's permissions from the auth context.
- Evaluates using `matchesPermission()` (exact, action wildcard, global wildcard).
- Returns `false` if the user is not authenticated. This is the safe default.
- No server call. Evaluation is synchronous and runs in under 1ms.

**Example:**

```tsx
import { usePermission } from '@dream/rbac/react';

function InvoiceActions({ invoiceId }: { invoiceId: string }) {
  const canDelete = usePermission('invoices:delete');

  return (
    <div>
      <ViewInvoiceButton id={invoiceId} />
      {canDelete && <DeleteInvoiceButton id={invoiceId} />}
    </div>
  );
}
```

### useRole Hook

Returns the current user's active role, all assigned role slugs, and hierarchy level.

**Import:**

```tsx
import { useRole } from '@dream/rbac/react';
```

**Signature:**

```typescript
function useRole(): {
  /** The user's active role slug (e.g., 'admin'). Empty string if not authenticated. */
  role: string;

  /** All role slugs assigned to the user in the current organization. */
  roles: string[];

  /** Hierarchy level of the active role. Lower = more privileged. -1 if not authenticated. */
  hierarchyLevel: number;
};
```

**Behavior:**

- Reads from the auth context. No server call.
- `role` corresponds to `SessionUser.activeRole`.
- `roles` corresponds to `SessionUser.roleSlugs`.
- `hierarchyLevel` is derived from the built-in role definitions or custom role registry.

**Example:**

```tsx
import { useRole } from '@dream/rbac/react';

function RoleBadge() {
  const { role } = useRole();
  return <Badge>{role}</Badge>;
}
```

### useHasMinimumRole Hook

Returns whether the user's active role meets or exceeds a minimum privilege level.

**Import:**

```tsx
import { useHasMinimumRole } from '@dream/rbac/react';
```

**Signature:**

```typescript
type BuiltInRole = 'super_admin' | 'admin' | 'manager' | 'user' | 'guest';

function useHasMinimumRole(minimumRole: BuiltInRole): boolean;
```

**Behavior:**

- Maps the `minimumRole` slug to its hierarchy level (`super_admin` = 0, `admin` = 10, `manager` = 20, `user` = 30, `guest` = 40).
- Returns `true` if the user's active role hierarchy level is less than or equal to the minimum role's level. Lower number = higher privilege.
- Returns `false` if the user is not authenticated.

**Example:**

```tsx
import { useHasMinimumRole } from '@dream/rbac/react';

function TeamManagement() {
  const isManager = useHasMinimumRole('manager');

  return (
    <div>
      <TeamList />
      {isManager && <AddTeamMemberButton />}
    </div>
  );
}
```

---

## 4. @dream/multi-tenant React Components

### TenantProvider

Provides the current organization context to all child components. Must be nested inside `AuthProvider` because tenant resolution depends on the authenticated user's session.

**Import:**

```tsx
import { TenantProvider } from '@dream/multi-tenant/react';
```

**Props:**

```typescript
interface TenantProviderProps {
  children: React.ReactNode;
  config?: TenantProviderConfig;
}

interface TenantProviderConfig {
  /**
   * Tenancy mode. 'multi' resolves org dynamically from the session.
   * 'single' uses a fixed org ID.
   * Defaults to 'multi'.
   */
  mode?: 'multi' | 'single';

  /**
   * Fixed organization ID for single-tenant mode.
   * Required when mode is 'single'. Ignored in 'multi' mode.
   */
  singleTenantId?: string;
}
```

**Behavior:**

- In `multi` mode (default): reads the active organization from `useAuth().user.tenantId` and fetches the full `Organization` object (name, branding, plan tier).
- In `single` mode: uses the provided `singleTenantId` as the fixed tenant, regardless of the user's session.
- Exposes organization context through the `useTenant` hook.
- When the user switches organizations via `useAuth().switchOrganization()`, `TenantProvider` detects the `tenantId` change in the auth context and updates the organization object.

**Usage:**

```tsx
// Multi-tenant (default) -- org resolved from user session
<AuthProvider>
  <TenantProvider>
    <App />
  </TenantProvider>
</AuthProvider>

// Single-tenant -- fixed org for products that do not need org switching
<AuthProvider>
  <TenantProvider config={{ mode: 'single', singleTenantId: process.env.NEXT_PUBLIC_ORG_ID }}>
    <App />
  </TenantProvider>
</AuthProvider>
```

### useTenant Hook

Returns the current organization context. Must be called inside a `TenantProvider`.

**Import:**

```tsx
import { useTenant } from '@dream/multi-tenant/react';
```

**Signature:**

```typescript
function useTenant(): TenantContext;

interface TenantContext {
  /** Current active tenant ID, or null if not resolved yet. */
  tenantId: string | null;

  /** Full organization object with branding and plan details, or null while loading. */
  organization: Organization | null;

  /** Whether the organization data is being fetched. */
  isLoading: boolean;

  /**
   * Switches the active organization. Updates the auth context (JWT refresh)
   * and the tenant context (new org object).
   * @param organizationId - UUID of the target organization
   */
  switchOrganization: (organizationId: string) => Promise<void>;

  /** All organizations the current user belongs to. */
  organizations: Organization[];
}
```

**`Organization` shape** (from `@dream/types`):

```typescript
interface Organization {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'archived';
  planTier: string;
  logoUrl?: string;
  primaryColor?: string;
  domain?: string;
  currency: 'USD' | 'INR' | 'EUR' | 'GBP';
  region: 'us-east' | 'eu-west' | 'in-mumbai' | 'ap-singapore';
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
```

**Behavior:**

- `tenantId` is available immediately from the auth session. `organization` may be `null` briefly while the full object is fetched.
- `organizations` is populated with all organizations the user belongs to (derived from their `OrganizationMembership` records).
- `switchOrganization` delegates to `useAuth().switchOrganization()` internally, which refreshes the JWT. The `TenantProvider` then detects the new `tenantId` and refetches the organization object.
- When `organization.status` is `'suspended'`, consuming components should display a suspension notice. The server-side middleware (FR-015) blocks API requests independently.

**Example -- Organization branding in the header:**

```tsx
import { useTenant } from '@dream/multi-tenant/react';

function BrandedHeader() {
  const { organization, isLoading } = useTenant();

  if (isLoading) return <HeaderSkeleton />;

  return (
    <header style={{ borderColor: organization?.primaryColor }}>
      {organization?.logoUrl && <img src={organization.logoUrl} alt={organization.name} />}
      <h1>{organization?.name}</h1>
    </header>
  );
}
```

---

## 5. Component Interaction Patterns

These patterns demonstrate how the three packages work together in common application scenarios.

### Pattern A: Protected Page with Permission Checks

A page that requires authentication and conditionally renders actions based on permissions.

```tsx
import { useAuth } from '@dream/auth/react';
import { usePermission, PermissionGate } from '@dream/rbac/react';

function InvoicePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const canExport = usePermission('reports:export');

  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <Redirect to="/login" />;

  return (
    <div>
      <h1>Invoices</h1>
      {canExport && <ExportAllButton />}

      <InvoiceList />

      <PermissionGate permission="invoices:write">
        <CreateInvoiceButton />
      </PermissionGate>
    </div>
  );
}
```

### Pattern B: Organization Switcher

A dropdown that lets users switch between their organizations. Common in multi-tenant products where a user belongs to more than one organization.

```tsx
import { useTenant } from '@dream/multi-tenant/react';

function OrgSwitcher() {
  const { organization, organizations, switchOrganization, isLoading } = useTenant();

  if (isLoading) return <SelectSkeleton />;
  if (organizations.length <= 1) return null; // No switching needed

  return (
    <Select
      value={organization?.id}
      onChange={(orgId) => switchOrganization(orgId)}
      aria-label="Switch organization"
    >
      {organizations.map((org) => (
        <Option key={org.id} value={org.id}>
          {org.name}
        </Option>
      ))}
    </Select>
  );
}
```

### Pattern C: Role-Based Navigation Sidebar

A sidebar that shows different links based on permissions and role level, using a combination of `PermissionGate`, `AdminGate`, and `useHasMinimumRole`.

```tsx
import { PermissionGate, AdminGate, useHasMinimumRole } from '@dream/rbac/react';

function Sidebar() {
  const isManager = useHasMinimumRole('manager');

  return (
    <nav aria-label="Main navigation">
      <Link to="/dashboard">Dashboard</Link>

      <PermissionGate permission="invoices:read">
        <Link to="/invoices">Invoices</Link>
      </PermissionGate>

      <PermissionGate permission="users:read">
        <Link to="/users">Users</Link>
      </PermissionGate>

      {isManager && <Link to="/team">My Team</Link>}

      <AdminGate>
        <Link to="/settings">Settings</Link>
        <Link to="/audit-log">Audit Log</Link>
      </AdminGate>
    </nav>
  );
}
```

### Pattern D: Full Application Layout

Putting it all together: providers at the root, auth-aware header, permission-gated content, and tenant branding.

```tsx
// app/layout.tsx
import { AuthProvider } from '@dream/auth/react';
import { TenantProvider } from '@dream/multi-tenant/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthProvider config={{ refetchOnWindowFocus: true }}>
          <TenantProvider>
            <AppShell>{children}</AppShell>
          </TenantProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

// components/AppShell.tsx
import { useAuth } from '@dream/auth/react';
import { useTenant } from '@dream/multi-tenant/react';
import { AdminGate } from '@dream/rbac/react';

function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const { organization } = useTenant();

  if (isLoading) return <FullPageSpinner />;
  if (!isAuthenticated) return <LoginPage />;

  return (
    <div>
      <header>
        {organization?.logoUrl && <img src={organization.logoUrl} alt="" />}
        <span>{organization?.name}</span>
        <OrgSwitcher />
        <span>{user.name}</span>
        <button onClick={() => signOut()}>Log out</button>
      </header>

      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main>{children}</main>
      </div>
    </div>
  );
}
```

### Pattern E: Suspended Organization Handling

When a user's organization is suspended, the server blocks API requests (FR-015). On the client, the `TenantProvider` still provides the organization object with `status: 'suspended'`, allowing the UI to display a notice.

```tsx
import { useTenant } from '@dream/multi-tenant/react';

function SuspensionGuard({ children }: { children: React.ReactNode }) {
  const { organization, organizations, switchOrganization, isLoading } = useTenant();

  if (isLoading) return <Spinner />;

  if (organization?.status === 'suspended') {
    const activeOrgs = organizations.filter((o) => o.status === 'active');
    return (
      <div>
        <h2>Organization Suspended</h2>
        <p>{organization.name} has been suspended. Contact your administrator.</p>
        {activeOrgs.length > 0 && (
          <div>
            <p>Switch to an active organization:</p>
            {activeOrgs.map((org) => (
              <button key={org.id} onClick={() => switchOrganization(org.id)}>
                {org.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
```

---

## 6. Error Boundaries and Safe Defaults

### Hook Called Outside Provider

| Hook | Behavior |
|------|----------|
| `useAuth()` | Throws: `"useAuth must be used within an <AuthProvider>. Wrap your component tree with <AuthProvider> in your root layout."` |
| `useTenant()` | Throws: `"useTenant must be used within a <TenantProvider>. Ensure <TenantProvider> is nested inside <AuthProvider> in your root layout."` |
| `usePermission()` | Returns `false`. Does not throw. Safe default: deny access when context is unavailable. |
| `useRole()` | Returns `{ role: '', roles: [], hierarchyLevel: -1 }`. Does not throw. |
| `useHasMinimumRole()` | Returns `false`. Does not throw. Safe default: deny access. |

### Design Rationale

Providers (`useAuth`, `useTenant`) throw errors because they indicate a structural mistake in the component tree that the developer must fix. Skipping silently would mask bugs.

Permission and role hooks return safe defaults (deny access) because they may be called in components that are conditionally rendered outside the provider tree during transitions. Throwing from these hooks would crash the application instead of gracefully hiding a button.

### Permission Check with No User

When a user is not authenticated (`user === null`):

- `PermissionGate` renders the fallback (default: `null`).
- `RoleGate` renders the fallback (default: `null`).
- `AdminGate` renders the fallback (default: `null`).
- `usePermission(any)` returns `false`.
- `useHasMinimumRole(any)` returns `false`.
- `useRole()` returns `{ role: '', roles: [], hierarchyLevel: -1 }`.

All gates and hooks default to "deny" when there is no authenticated user. This aligns with the allow-only permission model (FR-011a): anything not explicitly granted is implicitly denied.

---

## 7. Testing Utilities

Each package exports mock providers for testing. These providers accept pre-configured state, allowing tests to render components with specific users, roles, and organizations without setting up a real auth backend.

### MockAuthProvider

**Import:**

```tsx
import { MockAuthProvider } from '@dream/auth/react/testing';
```

**Props:**

```typescript
interface MockAuthProviderProps {
  children: React.ReactNode;

  /** Pre-configured user. Set to null to simulate unauthenticated state. */
  user?: SessionUser | null;

  /** Override isLoading. Defaults to false. */
  isLoading?: boolean;

  /** Mock signIn handler. Defaults to no-op. */
  onSignIn?: (provider: string, options?: SignInOptions) => Promise<void>;

  /** Mock signOut handler. Defaults to no-op. */
  onSignOut?: () => Promise<void>;

  /** Mock switchOrganization handler. Defaults to no-op. */
  onSwitchOrganization?: (organizationId: string) => Promise<void>;
}
```

**Example -- Testing a navbar:**

```tsx
import { render, screen } from '@testing-library/react';
import { MockAuthProvider } from '@dream/auth/react/testing';
import { Navbar } from './Navbar';

describe('Navbar', () => {
  it('shows user name when authenticated', () => {
    render(
      <MockAuthProvider
        user={{
          id: 'usr-1',
          email: 'alice@acme.com',
          name: 'Alice',
          tenantId: 'org-1',
          roleSlugs: ['admin'],
          activeRole: 'admin',
          permissions: ['users:*', 'settings:*'],
          tenantStatus: 'active',
        }}
      >
        <Navbar />
      </MockAuthProvider>
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('shows sign-in button when not authenticated', () => {
    render(
      <MockAuthProvider user={null}>
        <Navbar />
      </MockAuthProvider>
    );

    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});
```

### MockTenantProvider

**Import:**

```tsx
import { MockTenantProvider } from '@dream/multi-tenant/react/testing';
```

**Props:**

```typescript
interface MockTenantProviderProps {
  children: React.ReactNode;

  /** Current tenant ID. Defaults to null. */
  tenantId?: string | null;

  /** Full organization object. Defaults to null. */
  organization?: Organization | null;

  /** All organizations the user belongs to. Defaults to empty array. */
  organizations?: Organization[];

  /** Override isLoading. Defaults to false. */
  isLoading?: boolean;

  /** Mock switchOrganization handler. Defaults to no-op. */
  onSwitchOrganization?: (organizationId: string) => Promise<void>;
}
```

**Example -- Testing an org switcher:**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MockAuthProvider } from '@dream/auth/react/testing';
import { MockTenantProvider } from '@dream/multi-tenant/react/testing';
import { OrgSwitcher } from './OrgSwitcher';

const orgs = [
  { id: 'org-1', name: 'Acme Corp', slug: 'acme', status: 'active' as const, /* ... */ },
  { id: 'org-2', name: 'Globex Inc', slug: 'globex', status: 'active' as const, /* ... */ },
];

describe('OrgSwitcher', () => {
  it('renders all organizations', () => {
    render(
      <MockAuthProvider user={{ /* ... */ }}>
        <MockTenantProvider
          tenantId="org-1"
          organization={orgs[0]}
          organizations={orgs}
        >
          <OrgSwitcher />
        </MockTenantProvider>
      </MockAuthProvider>
    );

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Globex Inc')).toBeInTheDocument();
  });
});
```

### Testing PermissionGate

Permission gates read from the auth context, so testing them requires `MockAuthProvider` with the appropriate permissions set.

```tsx
import { render, screen } from '@testing-library/react';
import { MockAuthProvider } from '@dream/auth/react/testing';
import { PermissionGate } from '@dream/rbac/react';

describe('PermissionGate', () => {
  const adminUser = {
    id: 'usr-1',
    email: 'admin@acme.com',
    name: 'Admin',
    tenantId: 'org-1',
    roleSlugs: ['admin'],
    activeRole: 'admin',
    permissions: ['invoices:*'],
    tenantStatus: 'active' as const,
  };

  const viewerUser = {
    ...adminUser,
    roleSlugs: ['guest'],
    activeRole: 'guest',
    permissions: ['invoices:read'],
  };

  it('renders children when user has the required permission', () => {
    render(
      <MockAuthProvider user={adminUser}>
        <PermissionGate permission="invoices:write">
          <button>Create Invoice</button>
        </PermissionGate>
      </MockAuthProvider>
    );

    expect(screen.getByText('Create Invoice')).toBeInTheDocument();
  });

  it('renders fallback when user lacks the required permission', () => {
    render(
      <MockAuthProvider user={viewerUser}>
        <PermissionGate permission="invoices:write" fallback={<span>No access</span>}>
          <button>Create Invoice</button>
        </PermissionGate>
      </MockAuthProvider>
    );

    expect(screen.getByText('No access')).toBeInTheDocument();
    expect(screen.queryByText('Create Invoice')).not.toBeInTheDocument();
  });

  it('renders nothing when user lacks permission and no fallback is provided', () => {
    const { container } = render(
      <MockAuthProvider user={viewerUser}>
        <PermissionGate permission="invoices:write">
          <button>Create Invoice</button>
        </PermissionGate>
      </MockAuthProvider>
    );

    expect(container.innerHTML).toBe('');
  });

  it('renders fallback when user is not authenticated', () => {
    render(
      <MockAuthProvider user={null}>
        <PermissionGate permission="invoices:read" fallback={<span>Please sign in</span>}>
          <button>View Invoices</button>
        </PermissionGate>
      </MockAuthProvider>
    );

    expect(screen.getByText('Please sign in')).toBeInTheDocument();
  });
});
```

---

## 8. Type Reference

All types referenced in this document are defined in `@dream/types`. The key types used by the React layer:

| Type | Package | Description |
|------|---------|-------------|
| `SessionUser` | `@dream/types` | User identity embedded in the JWT session. Contains `id`, `email`, `name`, `tenantId`, `roleSlugs`, `activeRole`, `permissions`, `tenantStatus`. |
| `Organization` | `@dream/types` | Full organization object with `id`, `name`, `slug`, `status`, `planTier`, `logoUrl`, `primaryColor`, `domain`, `currency`, `region`, `metadata`. |
| `BuiltInRole` | `@dream/types` | Union type: `'super_admin' \| 'admin' \| 'manager' \| 'user' \| 'guest'` |
| `OrganizationStatus` | `@dream/types` | Union type: `'active' \| 'suspended' \| 'archived'` |
| `UserStatus` | `@dream/types` | Union type: `'active' \| 'suspended' \| 'deleted'` |

### Sub-path Export Map

| Import Path | Exports |
|-------------|---------|
| `@dream/auth/react` | `AuthProvider`, `useAuth` |
| `@dream/auth/react/testing` | `MockAuthProvider` |
| `@dream/rbac/react` | `PermissionGate`, `RoleGate`, `AdminGate`, `usePermission`, `useRole`, `useHasMinimumRole` |
| `@dream/multi-tenant/react` | `TenantProvider`, `useTenant` |
| `@dream/multi-tenant/react/testing` | `MockTenantProvider` |
