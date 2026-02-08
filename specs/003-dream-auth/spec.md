# Feature Specification: @dream/auth — Shared Authentication & Authorization Package

**Feature Branch**: `003-dream-auth`
**Created**: 2026-02-06
**Status**: Draft
**Input**: User description: "Create a shared authentication and authorization package for 5 SaaS products (Dream Books, Dream Payroll, Dream Team, HireWise, Dream Learn) providing AuthProvider, permission gates, NextAuth.js v5 configuration, JWT enrichment, tenant-aware middleware, and database schema snippets"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Adds Shared Auth to a Product (Priority: P1)

A developer working on any of the 5 Dream products installs `@dream/auth` and wraps their application in the shared `AuthProvider`. Users of that product can then log in with email and password, and the developer can access the authenticated user's identity, roles, and permissions through the `useAuth` hook without writing any custom auth logic.

**Why this priority**: Authentication is the foundation of every product. Without a working login flow and user context, no other feature (SSO, permissions, middleware) can function. This delivers the core value proposition: one auth package replaces 5 separate, inconsistent auth implementations.

**Independent Test**: Install `@dream/auth` in a fresh Next.js project, wrap the app in `AuthProvider`, render a login form that calls `login(email, password)`, and verify that after successful login the `useAuth` hook returns `isAuthenticated: true` with the user's name, email, and roles.

**Acceptance Scenarios**:

1. **Given** a Next.js application with `@dream/auth` installed, **When** the developer wraps the root layout in `AuthProvider`, **Then** the `useAuth` hook becomes available in all child components with `user`, `isLoading`, `isAuthenticated`, `login`, `logout`, `hasPermission`, `hasRole`, and `isAdmin`.
2. **Given** an unauthenticated user visits the application, **When** they submit valid email and password credentials, **Then** they are authenticated, the session is established, and `useAuth` returns `isAuthenticated: true` with their user profile data.
3. **Given** an authenticated user, **When** they call `logout()` via the `useAuth` hook, **Then** their session is terminated, tokens are cleared, and `isAuthenticated` returns `false`.
4. **Given** a user with an existing valid session, **When** they refresh the page or navigate back to the application, **Then** their session is restored automatically without requiring re-authentication.

---

### User Story 2 - Developer Controls UI Visibility with Permission Gates (Priority: P1)

A developer uses the declarative `PermissionGate`, `RoleGate`, and `AdminGate` components to conditionally render UI elements based on the current user's authorization level. For example, the "Manage Users" link only appears for users with the `users:read` permission, and the "Admin Panel" link only appears for admin users.

**Why this priority**: Authorization controls are inseparable from authentication in a multi-tenant SaaS context. Every product needs to show or hide features based on user roles and permissions. Providing these as reusable components prevents each product from reimplementing authorization checks, which is a common source of security bugs.

**Independent Test**: Render a `PermissionGate` with `permission="users:read"` wrapping a "Manage Users" button. Log in as a user with the `users:read` permission and verify the button is visible. Log in as a user without that permission and verify the button is hidden and the optional fallback is shown instead.

**Acceptance Scenarios**:

1. **Given** a component wrapped in `<PermissionGate permission="users:read">`, **When** the current user has the `users:read` permission, **Then** the child content is rendered.
2. **Given** a component wrapped in `<PermissionGate permission="users:read" fallback={<p>Access denied</p>}>`, **When** the current user lacks the `users:read` permission, **Then** the fallback content is rendered instead.
3. **Given** a component wrapped in `<RoleGate role="manager">`, **When** the current user has the `manager` role, **Then** the child content is rendered.
4. **Given** a component wrapped in `<AdminGate>`, **When** the current user has the `admin` or `super_admin` role, **Then** the child content is rendered.
5. **Given** wildcard permissions (e.g., `users:*`), **When** checking `hasPermission("users:read")`, **Then** the wildcard matches and returns `true`.

---

### User Story 3 - Developer Configures SSO with Azure Entra ID (Priority: P2)

A developer on Dream Team or Dream Payroll configures enterprise single sign-on by providing their Azure Entra ID (formerly Azure AD) tenant ID and client credentials to the shared auth configuration. Employees of the tenant organization can then log in using their corporate Microsoft accounts without creating separate credentials.

**Why this priority**: SSO is a critical enterprise requirement. Dream Team already has a working Azure Entra ID integration. Extracting this into the shared package means Dream Payroll and other products can adopt SSO without building it from scratch. However, products like Dream Books and Dream Learn can operate without SSO initially, making this a P2.

**Independent Test**: Configure `@dream/auth` with Azure Entra ID provider credentials, initiate the SSO flow, complete authentication through Microsoft's login page, and verify that the user is authenticated with their corporate identity, tenant ID, and roles populated in the session.

**Acceptance Scenarios**:

1. **Given** a product configured with Azure Entra ID credentials, **When** a user clicks "Sign in with Microsoft", **Then** they are redirected to Microsoft's authentication page.
2. **Given** a user completes Azure Entra ID authentication, **When** they are redirected back to the application, **Then** their session contains their corporate email, name, tenant ID, and any mapped roles.
3. **Given** a product that has not configured SSO credentials, **When** the auth package loads, **Then** the SSO provider is not available and only credential-based login is offered, with no errors thrown.
4. **Given** an SSO-authenticated user whose corporate account is disabled in Azure Entra ID, **When** they attempt to refresh their session, **Then** authentication fails and they are redirected to the login page.

---

### User Story 4 - JWT Session Contains Tenant, Role, and Permission Data (Priority: P2)

When a user authenticates (via credentials or SSO), the shared auth configuration enriches the JWT session token with the user's tenant ID, assigned roles, and computed permissions. Any server-side or client-side code that reads the session gets this authorization context automatically, without making additional database queries on every request.

**Why this priority**: Embedding authorization data in the JWT is what makes the `hasPermission`, `hasRole`, and gate components work without extra API calls. It is essential for performance and enables the permission gates (P1) to function correctly. It is P2 because it is a behind-the-scenes mechanism rather than a directly user-facing capability.

**Independent Test**: Authenticate a user whose database record has `roles: ["admin"]` and `tenantId: "abc-123"`. Inspect the resulting JWT and verify it contains `roles`, `permissions` (computed from the role hierarchy), and `tenant_id` claims. Access the session from a server component and verify the enriched data is present.

**Acceptance Scenarios**:

1. **Given** a user with roles `["admin"]` authenticates, **When** the JWT is issued, **Then** it contains the `roles` claim with `["admin"]` and the `permissions` claim with all permissions inherited through the role hierarchy.
2. **Given** a user belongs to tenant `"abc-123"`, **When** the JWT is issued, **Then** it contains the `tenant_id` claim with `"abc-123"`.
3. **Given** a user's roles are updated in the database, **When** their session is refreshed (via token refresh or re-authentication), **Then** the new JWT reflects the updated roles and permissions.
4. **Given** the JWT contains `permissions: ["users:*"]`, **When** `hasPermission("users:read")` is called on the user context, **Then** it returns `true` due to wildcard matching.

---

### User Story 5 - Tenant-Aware Middleware Protects Routes (Priority: P2)

A developer configures the shared tenant-aware middleware in their Next.js application to protect specific routes. The middleware validates the user's session, extracts the tenant context, and ensures that unauthenticated users are redirected to the login page. Authenticated users can only access resources within their own tenant.

**Why this priority**: Middleware-level route protection is a defense-in-depth measure that prevents unauthorized access before requests reach page or API logic. It is especially important for multi-tenant applications where tenant isolation must be enforced at every layer. Dream Team already uses this pattern. However, individual products can function with client-side guards alone in early stages, making this P2.

**Independent Test**: Configure the middleware to protect `/dashboard/*` routes. Access `/dashboard/settings` as an unauthenticated user and verify redirection to `/login`. Authenticate and verify access is granted. Access a URL belonging to a different tenant and verify access is denied.

**Acceptance Scenarios**:

1. **Given** a middleware configuration that protects `/dashboard/*`, **When** an unauthenticated user requests `/dashboard/settings`, **Then** they are redirected to the login page with a `callbackUrl` parameter preserving their intended destination.
2. **Given** an authenticated user belonging to tenant A, **When** they request a protected page, **Then** the middleware attaches the tenant context to the request and allows access.
3. **Given** a request to a public route (e.g., `/login`, `/signup`), **When** the middleware evaluates the route, **Then** it allows the request through without requiring authentication.
4. **Given** a middleware configuration with custom route matchers, **When** a developer specifies which paths are public, protected, or admin-only, **Then** the middleware enforces the correct access level for each category.

---

### User Story 6 - Developer Uses Shared Database Schema for Auth Tables (Priority: P3)

A developer setting up a new product (or migrating an existing one) uses the shared database schema snippets provided by `@dream/auth` for the user, session, and account tables. These schemas ensure consistent table structures across all products, enabling the auth system to work with a predictable database layout regardless of which ORM the product uses.

**Why this priority**: Consistent database schemas are important for long-term maintainability and for the auth system to function correctly. However, existing products already have their own schemas that work. The shared snippets accelerate new product setup and guide migrations, but they are not blocking for products that already have a working auth database. This makes it P3.

**Independent Test**: Import the shared Drizzle schema snippet for the users table, run a migration, and verify the generated SQL creates a table with columns matching the expected user entity (id, email, name, status, roles, tenantId, etc.). Separately, copy the Prisma schema snippet into a `schema.prisma` file, run `prisma generate`, and verify the generated client types are compatible with `@dream/types` User interface.

**Acceptance Scenarios**:

1. **Given** a developer uses the shared Drizzle schema for the users table, **When** they generate a migration, **Then** the SQL creates a table with all required columns (id, email, name, passwordHash, status, tenantId, roles, emailVerified, etc.).
2. **Given** a developer uses the shared Drizzle schema for the sessions and accounts tables, **When** they generate migrations, **Then** the tables include the columns required by NextAuth.js v5 (sessionToken, expires, provider, providerAccountId, etc.).
3. **Given** a developer uses the shared Prisma schema snippets, **When** they run `prisma generate`, **Then** the generated Prisma client types are compatible with the `@dream/types` User and Session interfaces.
4. **Given** a product already has existing auth tables, **When** the developer compares their schema against the shared snippets, **Then** the snippets serve as a reference for identifying missing columns or inconsistencies that need migration.

---

### User Story 7 - Developer Manages User Sessions Across Devices (Priority: P3)

An authenticated user can view all their active sessions (across browsers and devices), see details such as last active time and approximate location, and terminate any session they no longer recognize. Administrators can view and terminate sessions for users within their tenant.

**Why this priority**: Session management is important for security-conscious users and compliance requirements, but it is not required for basic product functionality. Products can launch with single-session auth and add multi-session visibility later.

**Independent Test**: Log in from two different browsers. From the first browser, list active sessions and verify both appear. Terminate the second session and verify that the second browser's session is invalidated.

**Acceptance Scenarios**:

1. **Given** an authenticated user with multiple active sessions, **When** they request their session list, **Then** they receive all active sessions with details (user agent, last active time, whether it is the current session).
2. **Given** an authenticated user viewing their sessions, **When** they terminate a specific session by ID, **Then** that session is invalidated and the device/browser associated with it is logged out.
3. **Given** an administrator with the appropriate permissions, **When** they view sessions for a user within their tenant, **Then** they can see and terminate that user's sessions.

---

### Edge Cases

- What happens when a user's JWT expires while they are actively using the application? The auth system attempts a silent token refresh using the refresh token. If the refresh token is also expired or invalid, the user is logged out and redirected to the login page with their current URL preserved as a callback.
- What happens when a user belongs to multiple tenants? The JWT contains the currently active tenant ID. Switching tenants requires re-authentication or a tenant-switch flow that issues a new JWT scoped to the selected tenant.
- What happens when the Azure Entra ID provider is temporarily unavailable? The SSO login button displays an error message, and the user is offered the option to fall back to credential-based login if their account supports it.
- What happens when a user's roles are changed while they have an active session? The changes take effect on the next token refresh. The current JWT remains valid with the old roles until it expires or is refreshed.
- What happens when `PermissionGate` is rendered outside of an `AuthProvider`? The `useAuth` hook throws a clear error: "useAuth must be used within an AuthProvider".
- What happens when the database schema snippets are used with a database other than PostgreSQL? The Drizzle snippets target PostgreSQL specifically. Using them with other databases requires manual adaptation. The Prisma snippets are database-agnostic at the schema level but the generated migration SQL will vary by database.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Package MUST provide an `AuthProvider` React context component that makes authentication state available to all descendant components via a `useAuth` hook.
- **FR-002**: The `useAuth` hook MUST expose `user`, `isLoading`, `isAuthenticated`, `login`, `logout`, `hasPermission`, `hasRole`, and `isAdmin` to consuming components.
- **FR-003**: Package MUST provide `PermissionGate`, `RoleGate`, and `AdminGate` React components that conditionally render children based on the current user's permissions, roles, or admin status, with an optional `fallback` prop for unauthorized states.
- **FR-004**: Package MUST provide a shared NextAuth.js v5 configuration supporting both credentials-based authentication (email/password) and Azure Entra ID SSO as authentication providers.
- **FR-005**: The Azure Entra ID SSO provider MUST be optional -- products that do not supply SSO credentials MUST still function correctly with only credentials-based authentication.
- **FR-006**: Package MUST provide a JWT callback that enriches the session token with `tenantId`, `roles`, and `permissions` (resolved from the role hierarchy) so that authorization data is available without additional database queries on each request.
- **FR-007**: Permission checking MUST support wildcard matching in the `resource:action` format (e.g., `users:*` grants `users:read`, `users:write`, etc., and `*` grants all permissions).
- **FR-008**: Package MUST provide a configurable tenant-aware Next.js middleware that validates user sessions, extracts tenant context, redirects unauthenticated users to the login page, and supports developer-defined public, protected, and admin-only route categories.
- **FR-009**: The middleware MUST preserve the user's intended destination as a `callbackUrl` parameter when redirecting unauthenticated users to login.
- **FR-010**: Package MUST provide database schema snippets (for both Drizzle and Prisma ORMs) for the user, session, and account tables required by the auth system.
- **FR-011**: Package MUST support session management -- listing active sessions, viewing session details (user agent, last active time), and terminating individual sessions.
- **FR-012**: Package MUST support token refresh -- when an access token expires, the system MUST attempt a silent refresh using the refresh token before forcing the user to re-authenticate.
- **FR-013**: Package MUST handle authentication errors gracefully with clear, user-facing error messages for common failure modes (invalid credentials, expired session, SSO provider unavailable, network errors).
- **FR-014**: The `UserContext` object provided by `useAuth` MUST include identity fields (userId, email, name), authorization fields (roles, permissions, tenantId, teamId), and convenience methods (hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole, isAdmin, isSuperAdmin).
- **FR-015**: Package MUST work consistently across all 5 Dream products regardless of which product-specific features each product uses, requiring only the product's specific configuration (API URLs, SSO credentials if applicable, route definitions).

### Key Entities

- **UserContext**: The authenticated user's identity and authorization state. Contains identity (userId, email, name), authorization (roles, permissions, tenantId, teamId), session metadata (sessionId, scopes), and convenience methods for permission/role checking. This is the primary object accessed via `useAuth`.
- **Session**: Represents an active authenticated session on a specific device or browser. Contains session ID, user agent, IP address, last active time, creation time, and whether it is the current session. Users and admins can list and terminate sessions.
- **TokenResponse**: The result of a successful authentication. Contains access token (JWT), refresh token, token type, expiry duration, granted scopes, and optional OIDC ID token. Used internally by the auth system to manage the token lifecycle.
- **JWTPayload**: The decoded claims within a JWT access token. Contains standard OIDC claims (sub, email, name) plus platform-specific claims (roles, permissions, tenant_id, team_id, session_id). Drives the authorization system.
- **Role**: A named bundle of permissions with a hierarchy level. Predefined roles include super_admin, admin, manager, user, and guest. Roles inherit permissions from lower-level roles (e.g., admin inherits all manager permissions).
- **Permission**: A fine-grained access control entry in `resource:action` format (e.g., `users:read`, `settings:*`). Permissions are scoped (global, tenant, team, own) and are granted through roles. Supports wildcard matching.
- **AuthConfig**: The configuration object provided by each product to customize the auth package. Includes API base URL, SSO provider credentials (optional), route protection rules, session duration preferences, and callbacks for product-specific customization.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 5 Dream products can adopt `@dream/auth` and achieve a working login/logout flow with fewer than 20 lines of product-specific configuration.
- **SC-002**: Products with SSO requirements (Dream Team, Dream Payroll) can enable Azure Entra ID authentication by supplying only tenant ID, client ID, and client secret -- no additional auth code is required.
- **SC-003**: Products without SSO requirements (Dream Books, Dream Learn, HireWise) can use the package with zero SSO-related configuration and experience no SSO-related errors or warnings.
- **SC-004**: Permission gate components correctly show or hide UI elements for 100% of permission/role combinations, including wildcard permissions.
- **SC-005**: Token refresh operates silently -- users with valid refresh tokens experience zero re-authentication interruptions during a normal working session (up to 8 hours).
- **SC-006**: Unauthenticated users attempting to access protected routes are redirected to login and returned to their intended page after authentication in 100% of cases.
- **SC-007**: A new developer can integrate `@dream/auth` into an existing Next.js product within 2 hours, including route protection and permission gates.
- **SC-008**: Eliminating 5 separate auth implementations reduces total auth-related code across all products by at least 60%, measured by lines of code.
- **SC-009**: All shared database schema snippets generate valid migrations that produce tables compatible with NextAuth.js v5 session management.
- **SC-010**: The auth package introduces no measurable increase in page load time (less than 50ms overhead) compared to each product's existing auth implementation.

### Assumptions

- All 5 products use Next.js 14+ with the App Router and TypeScript 5.0+.
- All products use PostgreSQL as their primary database.
- NextAuth.js v5 (Auth.js) is the standard authentication framework across all products.
- Products may use either Drizzle or Prisma as their ORM, so schema snippets must be provided for both.
- The `@dream/types` package (002-dream-types) is available and provides the shared TypeScript interfaces that `@dream/auth` depends on.
- Azure Entra ID is the only enterprise SSO provider required at this time. Additional providers (Google Workspace, Okta, etc.) may be added in future iterations.
- The predefined role hierarchy (super_admin > admin > manager > user > guest) is sufficient for all 5 products. Products needing custom roles can extend this hierarchy.
- JWT tokens are short-lived (15 minutes) with longer-lived refresh tokens (7 days), following security best practices.
