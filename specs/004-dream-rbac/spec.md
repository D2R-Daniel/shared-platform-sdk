# Feature Specification: @dream/rbac -- Shared Role-Based Access Control

**Feature Branch**: `004-dream-rbac`
**Created**: 2026-02-06
**Status**: Draft
**Input**: User description: "Create a shared RBAC package for 5 SaaS products (Dream Books, Dream Payroll, Dream Team, HireWise, Dream Learn) providing permission matching, API middleware, React hooks, role hierarchy, and standard permission constants"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Checks Permissions in Application Logic (Priority: P1)

A developer working on any product (Dream Books, Dream Payroll, Dream Team, HireWise, or Dream Learn) imports `@dream/rbac` and uses `matchesPermission()`, `hasAnyPermission()`, and `hasAllPermissions()` to determine whether a user is authorized to perform a specific action. The functions support wildcard patterns so that a permission like `users:*` automatically matches `users:read`, `users:write`, or any other action under the `users` resource.

**Why this priority**: Permission checking is the foundational capability of the entire package. Without it, no other feature (middleware, hooks, constants) has value. Every product needs this immediately, including Dream Books which currently has no RBAC at all.

**Independent Test**: Import `matchesPermission` from `@dream/rbac`, call it with various permission/pattern combinations, and verify correct boolean results. No database, no HTTP server, no React runtime required.

**Acceptance Scenarios**:

1. **Given** a user has permission `users:read`, **When** `matchesPermission("users:read", "users:read")` is called, **Then** it returns `true`.
2. **Given** a user has permission `users:*`, **When** `matchesPermission("users:*", "users:read")` is called, **Then** it returns `true` because the wildcard matches any action under the `users` resource.
3. **Given** a user has permission `*` (full wildcard), **When** `matchesPermission("*", "reports:export")` is called, **Then** it returns `true` because a global wildcard matches every permission.
4. **Given** a user has permission `users:read`, **When** `matchesPermission("users:read", "users:write")` is called, **Then** it returns `false` because the action does not match.
5. **Given** a user has permissions `["users:read", "reports:export"]`, **When** `hasAnyPermission(["users:read", "reports:export"], "users:read")` is called, **Then** it returns `true`.
6. **Given** a user has permissions `["users:read"]`, **When** `hasAllPermissions(["users:read"], ["users:read", "users:write"])` is called, **Then** it returns `false` because not all required permissions are satisfied.

---

### User Story 2 - Developer Protects Next.js API Routes with Middleware (Priority: P1)

A developer on Dream Payroll or Dream Books wraps a Next.js API route handler with `requirePermission("payroll:read")` middleware. When a request arrives, the middleware extracts the user's permissions from the request context (session/token), checks them against the required permission, and either allows the request to proceed or returns a 403 Forbidden response.

**Why this priority**: API route protection is the primary enforcement point for RBAC. Without middleware, developers must write ad-hoc permission checks in every route handler, leading to inconsistency and security gaps. This is tied with P1 because it depends directly on the permission matching functions.

**Independent Test**: Create a Next.js API route wrapped with `requirePermission("users:write")`, send a request with a user context that lacks `users:write`, and verify a 403 response is returned. Then send a request with a user context that has `users:write` and verify the handler executes.

**Acceptance Scenarios**:

1. **Given** an API route protected by `requirePermission("users:write")`, **When** a request arrives from a user with permissions `["users:read"]`, **Then** the middleware returns a 403 Forbidden response with a descriptive error message.
2. **Given** an API route protected by `requirePermission("users:write")`, **When** a request arrives from a user with permissions `["users:*"]`, **Then** the middleware allows the request through because the wildcard matches.
3. **Given** an API route protected by `requirePermission("reports:export")`, **When** a request arrives with no user context (unauthenticated), **Then** the middleware returns a 401 Unauthorized response.
4. **Given** multiple permissions are required, **When** the middleware is configured with `requirePermission(["users:write", "audit:read"])`, **Then** the user must have all listed permissions to proceed.

---

### User Story 3 - Developer Uses React Hooks to Conditionally Render UI (Priority: P2)

A frontend developer on Dream Team uses `usePermission("team:manage")` inside a React component to conditionally show or hide a "Manage Team" button. The hook reads the current user's permissions from React context and returns a boolean indicating whether the user has the specified permission. Similarly, `useRole()` returns the current user's role information for role-based UI decisions.

**Why this priority**: While server-side enforcement (middleware) is the security boundary, client-side hooks are essential for delivering a good user experience by hiding UI elements that the user cannot interact with. This is P2 because it augments (rather than replaces) server-side checks.

**Independent Test**: Render a component that uses `usePermission("team:manage")` inside a test provider with a mocked user context. Verify the hook returns `true` when the context includes `team:manage` and `false` when it does not.

**Acceptance Scenarios**:

1. **Given** a React component calls `usePermission("team:manage")`, **When** the current user has permission `team:*`, **Then** the hook returns `true`.
2. **Given** a React component calls `usePermission("team:manage")`, **When** the current user lacks that permission, **Then** the hook returns `false`.
3. **Given** a React component calls `useRole()`, **When** the current user has role `admin`, **Then** the hook returns role information including the role name and hierarchy level.
4. **Given** the RBAC context provider has not been mounted, **When** a component calls `usePermission()`, **Then** the hook throws a descriptive error indicating the provider is missing.

---

### User Story 4 - Developer Uses Standard Permission Constants (Priority: P2)

A developer imports pre-defined permission constants from `@dream/rbac` (e.g., `PERMISSIONS.USERS.READ`, `PERMISSIONS.TEAMS.MANAGE`, `PERMISSIONS.SETTINGS.UPDATE`) instead of using raw strings throughout the codebase. This eliminates typos, enables autocomplete, and makes it easy to discover all available permissions.

**Why this priority**: String-based permissions are error-prone. A single typo (`usres:read` instead of `users:read`) silently fails permission checks with no compile-time or IDE feedback. Constants provide discoverability and safety.

**Independent Test**: Import `PERMISSIONS` from `@dream/rbac`, verify `PERMISSIONS.USERS.READ` equals `"users:read"`, verify TypeScript autocompletion works in an IDE, and verify a reference to a non-existent constant causes a compile error.

**Acceptance Scenarios**:

1. **Given** a developer imports `PERMISSIONS`, **When** they reference `PERMISSIONS.USERS.READ`, **Then** it resolves to the string `"users:read"`.
2. **Given** a developer imports `PERMISSIONS`, **When** they reference `PERMISSIONS.USERS.WILDCARD`, **Then** it resolves to `"users:*"`.
3. **Given** the standard constants cover modules users, roles, teams, settings, reports, audit, notifications, profile, and public, **When** a developer browses the `PERMISSIONS` object, **Then** all module permissions are available with full IntelliSense.
4. **Given** a developer references `PERMISSIONS.USERS.NONEXISTENT`, **When** TypeScript compiles, **Then** a compile-time error is raised.

---

### User Story 5 - Developer Works with Hierarchical Roles (Priority: P2)

A developer uses the built-in role hierarchy (super_admin=0, admin=10, manager=20, user=30, guest=40) to make authorization decisions based on role level. For example, checking whether a user's role level is high enough to perform an administrative action, or determining which roles a manager is allowed to assign to other users.

**Why this priority**: Role hierarchy is what distinguishes RBAC from a flat permission list. It enables features like "managers can only assign roles below their own level" and "admins inherit all manager permissions." HireWise currently hardcodes 6 roles without hierarchy; this replaces that with a structured system.

**Independent Test**: Import the default role definitions, verify super_admin has hierarchy level 0 (highest privilege), verify `getRoleLevel("admin")` returns 10, and verify a comparison function correctly determines that admin outranks manager.

**Acceptance Scenarios**:

1. **Given** the default role hierarchy, **When** comparing `admin` (level 10) to `manager` (level 20), **Then** admin is determined to be higher privilege because a lower level number means higher authority.
2. **Given** a user with role `manager` (level 20), **When** they attempt to assign `admin` (level 10) to another user, **Then** the system determines the assignment is not allowed because they cannot assign roles above their own level.
3. **Given** a user with role `super_admin` (level 0), **When** they attempt to assign any role, **Then** the system allows it because super_admin is the highest privilege level.
4. **Given** the default roles, **When** a developer lists all roles sorted by hierarchy, **Then** the order is super_admin, admin, manager, user, guest.

---

### User Story 6 - Developer Integrates RBAC Database Schema (Priority: P3)

A developer on Dream Books (which has no RBAC) uses the Drizzle schema snippets provided by `@dream/rbac` to create the `roles`, `permissions`, and `role_assignments` tables in their PostgreSQL database. Alternatively, a developer on Dream Team (which uses Prisma) copies the Prisma model snippets. Both approaches produce database schemas consistent with the shared type definitions.

**Why this priority**: Database schema is needed for persistence but is only useful after the permission logic (P1) and constants (P2) are established. Some products may start with in-memory or JWT-embedded permissions before adopting database-backed roles.

**Independent Test**: Import the Drizzle table definitions, use them in a migration script, run the migration against a test PostgreSQL database, and verify the tables are created with expected columns and constraints.

**Acceptance Scenarios**:

1. **Given** a Drizzle-based project imports the `rolesTable` definition, **When** a migration is generated, **Then** it creates a `roles` table with columns for id, name, slug, permissions (JSON array), hierarchy_level, is_system, is_active, and timestamps.
2. **Given** a Drizzle-based project imports the `roleAssignmentsTable` definition, **When** a migration is generated, **Then** it creates a `role_assignments` table with columns for id, user_id, role_id, granted_at, granted_by, and expires_at, with foreign key constraints to the users and roles tables.
3. **Given** a Prisma-based project copies the provided Role model, **When** `prisma generate` is run, **Then** the generated client includes Role and RoleAssignment types matching the `@dream/rbac` type definitions.

---

### User Story 7 - HireWise Migrates from Hardcoded Roles to Shared RBAC (Priority: P3)

A developer on HireWise replaces their 6 hardcoded role constants (ADMIN, RECRUITER, CANDIDATE, HIRING_MANAGER, INTERVIEWER, VIEWER) with the shared `@dream/rbac` role system. They map existing roles to the hierarchy, define HireWise-specific permissions as extensions of the standard constants, and use the shared middleware to protect their API routes.

**Why this priority**: Migration of existing products is important but not urgent for the initial package release. The package must be usable by products with no RBAC (Dream Books) before optimizing for products that already have partial implementations.

**Independent Test**: Define a HireWise-specific permission set extending the standard constants (e.g., `PERMISSIONS.CANDIDATES.READ`), map existing hardcoded roles to hierarchy levels, and verify that existing authorization behavior is preserved under the new system.

**Acceptance Scenarios**:

1. **Given** HireWise defines a custom role `recruiter` with level 25, **When** the role is registered alongside the standard roles, **Then** it fits between `manager` (level 20) and `user` (level 30) in the hierarchy.
2. **Given** HireWise extends the permission constants with `PERMISSIONS.CANDIDATES.READ` and `PERMISSIONS.CANDIDATES.WRITE`, **When** these are used with `matchesPermission()`, **Then** wildcard matching works identically to built-in permissions (e.g., `candidates:*` matches `candidates:read`).
3. **Given** a HireWise API route was previously protected by a hardcoded `if (user.role === 'ADMIN')` check, **When** it is replaced with `requirePermission("candidates:write")`, **Then** the same users who previously had access continue to have access, and the same users who were denied continue to be denied.

---

### Edge Cases

- What happens when a permission string has no colon separator (e.g., `"admin"`)? The matching functions treat it as a resource with no action and it does not match any `resource:action` permission. Only the full wildcard `"*"` matches all permission formats.
- What happens when a user has an empty permissions array? All permission checks return `false` and all middleware returns 403 Forbidden.
- What happens when the hierarchy level for two roles is identical? The system treats them as equal rank. Assignment rules based on hierarchy level use strict less-than comparison, so neither role can assign the other.
- What happens when `requirePermission` middleware is used outside of a Next.js API route context? The middleware returns a clear runtime error indicating it must be used within a Next.js request handler.
- How does the system handle expired role assignments? The permission checking functions ignore role assignments where `expiresAt` is in the past. Expired assignments are treated as if they do not exist.
- What happens when a React hook is called outside the RBAC provider? `usePermission()` and `useRole()` throw a descriptive error: "usePermission must be used within an RBACProvider."

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Package MUST provide a `matchesPermission(userPermission, requiredPermission)` function that compares two permission strings using the `resource:action` format and supports wildcard matching where `*` in the action position matches any action, and a standalone `*` or `*:*` matches any permission.
- **FR-002**: Package MUST provide a `hasAnyPermission(userPermissions, requiredPermission)` function that returns `true` if any permission in the user's list matches the required permission via wildcard-aware comparison.
- **FR-003**: Package MUST provide a `hasAllPermissions(userPermissions, requiredPermissions)` function that returns `true` only if every required permission is matched by at least one of the user's permissions via wildcard-aware comparison.
- **FR-004**: Package MUST provide a `requirePermission()` middleware function for Next.js API routes that extracts user permissions from the request context, checks them against the specified permission(s), and returns 403 Forbidden if the check fails or 401 Unauthorized if no user context exists.
- **FR-005**: Package MUST provide a `usePermission(permission)` React hook that reads the current user's permissions from React context and returns a boolean indicating whether the user holds the specified permission (with wildcard support).
- **FR-006**: Package MUST provide a `useRole()` React hook that reads the current user's role from React context and returns role information including name, slug, and hierarchy level.
- **FR-007**: Package MUST provide an `RBACProvider` React context provider that accepts user permission and role data and makes it available to `usePermission()` and `useRole()` hooks in the component tree.
- **FR-008**: Package MUST export a `PERMISSIONS` constant object organizing all standard platform permissions by module (users, roles, teams, settings, reports, audit, notifications, profile, public), where each module contains named constants that resolve to `resource:action` strings.
- **FR-009**: Package MUST define a default role hierarchy with at least 5 levels: super_admin (level 0), admin (level 10), manager (level 20), user (level 30), and guest (level 40), where lower numbers represent higher privilege.
- **FR-010**: Package MUST provide functions to compare role hierarchy levels, determining whether one role outranks another and whether a given role is authorized to assign a target role.
- **FR-011**: Package MUST provide Drizzle ORM table definitions for `roles`, `permissions`, and `role_assignments` tables importable from a dedicated sub-path (e.g., `@dream/rbac/drizzle`).
- **FR-012**: Package MUST provide Prisma schema snippet files for Role, Permission, and RoleAssignment models importable or copyable from a dedicated sub-path (e.g., `@dream/rbac/prisma`).
- **FR-013**: Package MUST allow products to extend the standard permission constants with product-specific permissions (e.g., HireWise adding `candidates:read`) without modifying the shared package.
- **FR-014**: Package MUST allow products to register custom roles with custom hierarchy levels that integrate with the default role hierarchy without modifying the shared package.
- **FR-015**: Package MUST be compatible with Next.js 14+ and TypeScript 5.0+ environments, and React 18+ for hook functionality.
- **FR-016**: Package MUST have zero runtime dependencies for the pure permission-matching functions (`matchesPermission`, `hasAnyPermission`, `hasAllPermissions`). React is a peer dependency for hooks, and Drizzle/Prisma are peer dependencies for schema snippets.

### Key Entities

- **Role**: A named authorization level with a unique slug, display name, description, permission list, hierarchy level (lower = more privileged), system flag (system roles cannot be deleted), and active status. Roles are tenant-scoped and can be either system-defined or custom-created.
- **Permission**: A resource-action pair expressed as a string in `resource:action` format (e.g., `users:read`, `teams:*`). Permissions support wildcard matching where `*` in the action position matches any action under that resource, and a standalone `*` matches any permission.
- **RoleAssignment**: A link between a user and a role, with metadata including who granted it, when it was granted, and an optional expiration timestamp. A user can have multiple role assignments.
- **RoleHierarchy**: The ordering of roles by privilege level, used to enforce rules such as "a user can only assign roles at or below their own level." The default hierarchy is super_admin (0) > admin (10) > manager (20) > user (30) > guest (40).
- **PermissionCheckResult**: The outcome of a permission check, containing whether access is allowed, which specific permission matched, which role provided the match, and a reason string for debugging or audit logging.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 5 products (Dream Books, Dream Payroll, Dream Team, HireWise, Dream Learn) can install `@dream/rbac` and import permission-checking functions without TypeScript compilation errors.
- **SC-002**: Permission matching functions correctly evaluate 100% of wildcard patterns, including `resource:*`, `*:action`, `*:*`, and `*`, as verified by a comprehensive test suite with at least 30 test cases covering all wildcard combinations.
- **SC-003**: Dream Books (which currently has no RBAC) can integrate `requirePermission()` middleware and `usePermission()` hooks into its API routes and UI within one sprint (2 weeks), achieving full route-level access control.
- **SC-004**: HireWise can migrate its 6 hardcoded roles to the shared role hierarchy and permission system without breaking existing authorization behavior, as verified by all existing authorization tests continuing to pass.
- **SC-005**: Dream Learn can replace its implicit role logic with explicit permission checks using shared constants and middleware, resulting in authorization logic that is auditable and consistent with other products.
- **SC-006**: A new developer can understand the permission model, role hierarchy, and integration points within 20 minutes by reading the package documentation and browsing the exported constants.
- **SC-007**: The `requirePermission()` middleware adds less than 5ms of latency to API route handling in a standard Next.js deployment, as measured by benchmark tests.
- **SC-008**: Adding a new product-specific permission (e.g., HireWise adding `candidates:read`) requires zero changes to the `@dream/rbac` package itself, only extension in the consuming product's codebase.

### Assumptions

- All 5 products use Next.js 14+, TypeScript 5.0+, React 18+, and PostgreSQL.
- User permissions are available in the request context (via JWT claims, session data, or a context provider) at the time middleware or hooks execute. The mechanism for populating the context is handled by `@dream/auth`, not by this package.
- The package is distributed via pnpm workspace links during development and npm registry for production.
- React is an optional peer dependency. Products that only need server-side permission checking (e.g., a backend microservice) can use the pure functions without installing React.
- Drizzle and Prisma are optional peer dependencies. Products choose one ORM; they are not required to install both.
- The `resource:action` permission format is already established across the platform (as implemented in the shared-platform-sdk Node.js permissions module) and will not change.
- Role hierarchy levels use a numeric scale where lower values represent higher privilege, consistent with the existing model definitions.
