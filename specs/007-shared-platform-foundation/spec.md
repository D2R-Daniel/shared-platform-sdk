# Feature Specification: Shared Platform Foundation — Unified Infrastructure for 5 SaaS Products

**Feature Branch**: `007-shared-platform-foundation`
**Created**: 2026-02-07
**Status**: Draft
**Input**: User description: "Create a unified shared platform foundation providing authentication, authorization, multi-tenancy, and error handling as shared packages for 5 SaaS products (Dream Team, Dream Payroll, Dream Books, Dream Learn, HireWise). Consolidates brainstorming output from competitive research across 19 competitors and codebase analysis of all 5 products."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Developer Adds Shared Authentication to a Product (Priority: P1)

A developer working on any of the 5 products replaces their product's custom authentication setup with the shared authentication package. After a single configuration (which identity providers to enable, which routes are public), every route in the application is automatically protected. Users can log in with email/password or enterprise single sign-on, and the system handles session management, token refresh, and account lockout without any product-specific code.

**Why this priority**: Authentication is the foundational capability everything else depends on. Today, one product (Dream Books) has zero authentication on any route — a critical security gap. Two others hardcode tenant identifiers. A shared, secure-by-default auth package eliminates these vulnerabilities immediately and provides the identity context that authorization and multi-tenancy depend on.

**Independent Test**: Configure the shared auth package in a product, attempt to access a protected route without logging in, and verify the system blocks access. Log in and verify the session includes the user's identity, roles, and organization.

**Acceptance Scenarios**:

1. **Given** a product has the shared auth package configured, **When** an unauthenticated request hits any non-public route, **Then** the system rejects it with a clear "authentication required" response.
2. **Given** a user enters valid email and password credentials, **When** they submit the login form, **Then** they receive a session containing their identity, roles, permissions, and organization membership.
3. **Given** a product enables enterprise single sign-on, **When** a user authenticates via their organization's identity provider, **Then** they are provisioned in the system automatically on first login and receive the same session structure as password-based users.
4. **Given** a user fails authentication 5 times consecutively, **When** they attempt a 6th login, **Then** the system locks the account for 15 minutes and returns a descriptive error.
5. **Given** a user's session is about to expire, **When** the system detects an active session nearing expiration, **Then** it silently refreshes the session without interrupting the user's workflow.
6. **Given** a product marks certain routes as public (e.g., login page, health check), **When** an unauthenticated request hits those routes, **Then** the system allows access without requiring authentication.

---

### User Story 2 — Developer Enforces Role-Based Access Control Across Routes (Priority: P1)

A developer protects API routes and UI components using the shared authorization package. They assign users roles (e.g., admin, manager, user, guest) and define permissions in a `resource:action` format (e.g., `invoices:read`, `users:write`, `teams:*`). The system checks permissions at both the server (route protection) and the client (showing/hiding UI elements) without the developer writing custom role-checking logic.

**Why this priority**: Authorization is the second most critical capability. Today, one product has zero role-based access control (any user can access any data), one uses 6 hardcoded role strings scattered across every route, and another has a 740-line authorization file with migration workarounds. A shared, standardized authorization system eliminates all three problems and provides consistent access control across products.

**Independent Test**: Assign a user the "viewer" role, attempt to access a create/update/delete route, and verify the system blocks the request. Switch to an "admin" role and verify access is granted.

**Acceptance Scenarios**:

1. **Given** a user has the `invoices:read` permission, **When** they request to view invoices, **Then** the system allows access.
2. **Given** a user has the `invoices:read` permission but NOT `invoices:write`, **When** they attempt to create an invoice, **Then** the system rejects the request with a "permission denied" response.
3. **Given** a user has the wildcard permission `invoices:*`, **When** they request any invoice-related action (read, write, delete), **Then** the system allows access.
4. **Given** a role hierarchy where admin (level 10) outranks manager (level 20), **When** an admin attempts an action requiring manager-level access, **Then** the system allows it based on hierarchy.
5. **Given** a product needs custom roles beyond the 5 defaults (e.g., "recruiter", "curator", "accountant"), **When** the developer registers custom roles with hierarchy levels and permissions, **Then** those roles integrate seamlessly with the standard hierarchy and permission checking.
6. **Given** a UI component is wrapped with a permission-gated component, **When** the current user lacks the required permission, **Then** the component renders a fallback or nothing, without making unnecessary server requests.

---

### User Story 3 — Developer Enables Multi-Tenancy for a Product (Priority: P1)

A developer configures the shared multi-tenancy package to ensure every database query in the application is automatically scoped to the current organization. For fully multi-tenant products, the system resolves the organization from the user's session, subdomain, or request header. For single-tenant products, the system uses a fixed organization identifier. No cross-tenant data leakage occurs regardless of configuration mode.

**Why this priority**: Data isolation between organizations is a fundamental security requirement. Today, two products hardcode a single organization identifier in every route (meaning all data belongs to one fake organization regardless of the actual user), and one product has no organization concept at all. A shared multi-tenancy package provides automatic data isolation and eliminates the most common category of cross-tenant bugs.

**Independent Test**: Create data as Organization A, query as Organization B, and verify zero results from Organization A are returned. Switch back to Organization A and verify their data is intact.

**Acceptance Scenarios**:

1. **Given** a fully multi-tenant product, **When** a user's session contains their organization identifier, **Then** the system automatically scopes all database queries to that organization.
2. **Given** a product using subdomain-based routing (e.g., `acme.product.app`), **When** a request arrives, **Then** the system extracts the organization from the subdomain and validates it exists and is active.
3. **Given** a single-tenant product, **When** the package is configured in single-tenant mode with a fixed organization identifier, **Then** all requests use that identifier without requiring subdomain routing or header extraction.
4. **Given** a request with no identifiable organization, **When** the system attempts to resolve the organization, **Then** it returns a clear "organization not found" error before any business logic executes.
5. **Given** an organization's status changes to "suspended", **When** a user from that organization makes a request, **Then** the system blocks the request with a "organization suspended" message.
6. **Given** a user belongs to multiple organizations, **When** they switch from Organization A to Organization B, **Then** the system updates their active context and all subsequent queries target Organization B.

---

### User Story 4 — Developer Uses Shared Type Definitions Across Products (Priority: P1)

A developer working on any product imports shared type definitions (User, Organization, Role, Team, Permission, etc.) from a single shared package. All 5 products use the same entity shapes, ensuring consistency across the platform. The package also provides runtime data validation schemas for verifying data at system boundaries (e.g., incoming requests, outgoing responses).

**Why this priority**: Without shared types, each product independently defines what a "User" or "Organization" looks like, leading to incompatible shapes, integration bugs, and drift over time. A single source of truth for types ensures all products speak the same language and reduces the cost of cross-product integration from days to minutes.

**Independent Test**: Import the shared User type into a product, create a user object conforming to it, and verify the development environment provides autocomplete for all fields. Validate an invalid user object against the runtime schema and verify it returns clear validation errors.

**Acceptance Scenarios**:

1. **Given** a developer imports the shared User type, **When** they create a user object, **Then** the development environment provides autocomplete for all fields (id, email, name, status, roles, organization, etc.).
2. **Given** a developer needs only authentication-related types, **When** they import from the auth sub-module, **Then** only auth-related types are included, keeping the application lean.
3. **Given** incoming data from an external source, **When** the developer validates it against the runtime schema, **Then** valid data passes through typed correctly, and invalid data produces clear error messages identifying which fields are wrong.
4. **Given** two products using different database tools, **When** both import shared table definitions, **Then** each receives table schemas compatible with their database tool without being forced to change.
5. **Given** a new field is added to the shared User type, **When** products update the package, **Then** all 5 products gain the field definition in exactly one update, not five separate changes.

---

### User Story 5 — Developer Uses Standardized Error Handling and API Route Pattern (Priority: P2)

A developer wraps each API route in a shared handler function that automatically performs authentication, permission checking, input validation, and error formatting. If any step fails, the handler returns a standardized error response with a consistent structure (error code, human-readable message, request identifier for support). The developer only writes the business logic — all infrastructure concerns are handled by the wrapper.

**Why this priority**: Today, every API route across 5 products (600+ routes total) repeats the same 15-25 lines of boilerplate: check authentication, extract organization, validate input, try-catch, format error. A shared handler eliminates this repetition and guarantees consistent error responses. One product currently uses raw try-catch with no structure; another has 5 different error response formats.

**Independent Test**: Create an API route using the shared handler, send an invalid request, and verify the response includes a structured error with code, message, and request ID. Send a valid request and verify only the business logic executes.

**Acceptance Scenarios**:

1. **Given** a route wrapped in the shared handler with authentication required, **When** an unauthenticated request arrives, **Then** it returns a standardized 401 error with code `auth/unauthenticated` and a user-friendly message.
2. **Given** a route with permission requirements, **When** an authenticated user lacking the required permission makes a request, **Then** it returns a standardized 403 error with code `rbac/permission-denied`.
3. **Given** a route with input validation rules, **When** a request with invalid data arrives, **Then** it returns a standardized 400 error identifying which fields are invalid and why.
4. **Given** an unexpected server error occurs in business logic, **When** the error is caught by the handler, **Then** it returns a 500 error with a request ID (for support) but does NOT expose internal details to the caller.
5. **Given** any error response from any product, **When** a client parses the response, **Then** it follows the same structure: `{ success, error: { code, message, userMessage, requestId } }`.

---

### User Story 6 — All State-Changing Operations Emit Audit Events (Priority: P2)

Whenever a user creates, updates, or deletes any record across any product, the system automatically emits a structured audit event containing who performed the action, what action was taken, which resource was affected, the before and after states, and when and from where the action originated. These events are queryable for compliance, debugging, and security investigations.

**Why this priority**: Audit logging is required for SOC2, GDPR, and DPDPA compliance. Today, two products have zero audit logging (including one handling financial records), and two others have partial implementations. Mandatory audit events ensure compliance readiness across all products without relying on individual product teams to remember to add logging.

**Independent Test**: Create a new user, update their profile, delete them. Query the audit log and verify three events exist with the correct actor, action, resource, and timestamps.

**Acceptance Scenarios**:

1. **Given** a user creates a new record (e.g., a new team member), **When** the operation succeeds, **Then** an audit event is recorded with: actor ID, action "create", resource type and ID, the new state, timestamp, and originating IP address.
2. **Given** a user updates an existing record, **When** the operation succeeds, **Then** an audit event includes both the before and after states of the changed fields.
3. **Given** a user deletes a record, **When** the operation succeeds, **Then** an audit event records the deleted resource's state before deletion.
4. **Given** audit events accumulate over time, **When** a compliance officer queries the audit log by date range, actor, or resource type, **Then** they receive filtered, paginated results.
5. **Given** audit logging is mandatory, **When** a developer creates a new API route using the shared handler, **Then** audit events are emitted automatically for all create/update/delete operations without the developer adding explicit logging code.

---

### User Story 7 — Developer Integrates Foundation Into a Product Within Two Weeks (Priority: P2)

A developer on any of the 5 product teams adopts the shared foundation packages (types, auth, authorization, multi-tenancy, errors) and replaces their product's custom implementations. For products with mature existing implementations, the migration involves swapping custom code for shared packages with product-specific configuration. For products with missing capabilities (e.g., no authorization), the migration involves adding the capability for the first time.

**Why this priority**: The foundation only delivers value when products adopt it. A fast, well-documented adoption path ensures products can migrate incrementally without freezing feature development. The goal is that each product can integrate all 5 foundation packages within 2-5 sprints depending on their starting point.

**Independent Test**: Take the product with the least mature implementation (Dream Books — no auth, no authorization, broken multi-tenancy), integrate all 5 foundation packages, and verify that authentication, authorization, and organization isolation all work end-to-end.

**Acceptance Scenarios**:

1. **Given** a product with an existing authentication system, **When** the developer replaces it with the shared auth package, **Then** all existing login flows continue to work with the same user experience.
2. **Given** a product with no authorization system, **When** the developer adds the shared authorization package, **Then** they can define roles and protect routes within one sprint.
3. **Given** a product with broken multi-tenancy (hardcoded organization), **When** the developer replaces it with the shared multi-tenancy package, **Then** organization isolation works correctly without changing any business logic.
4. **Given** a product using a different database tool than other products, **When** they adopt shared type definitions, **Then** they receive schema snippets compatible with their database tool.
5. **Given** all 5 products have adopted the foundation, **When** a security fix is applied to the shared auth package, **Then** all 5 products receive the fix through a single package update.

---

### User Story 8 — Frontend Developer Uses Shared UI Context for Auth and Tenancy (Priority: P3)

A frontend developer wraps their application layout with shared context providers (auth and organization) and uses hooks in any component to access the current user's identity, permissions, and active organization. This eliminates prop-drilling, redundant data fetches, and inconsistent state management across the component tree.

**Why this priority**: All 5 products need the same client-side context (who is logged in, what can they do, which organization are they in). Without shared providers, each product builds its own state management for identical concerns, leading to 5 different implementations with 5 different bug surfaces.

**Independent Test**: Render a page with the auth provider, call the auth hook in a deeply nested component, and verify it returns the current user's identity, roles, and permissions without any props being passed down.

**Acceptance Scenarios**:

1. **Given** the auth provider wraps the application, **When** a child component calls the auth hook, **Then** it receives the current user's ID, email, name, roles, permissions, and authentication status.
2. **Given** the organization provider wraps the application, **When** a child component calls the organization hook, **Then** it receives the current organization's ID, name, branding (logo, colors), and subscription plan.
3. **Given** a component needs to show/hide based on permissions, **When** it wraps content in a permission-gated component, **Then** content renders only when the user has the required permission.
4. **Given** the auth hook is called outside an auth provider, **Then** it throws a descriptive error telling the developer to wrap the component tree with the provider.

---

### Edge Cases

- What happens when a user's organization is suspended while they are actively using the application? The system invalidates their session at the next request boundary and returns a "organization suspended" error. The frontend displays a suspension notice.
- What happens when an identity provider is temporarily unavailable during SSO login? The system returns a descriptive error and suggests the user try again or use an alternative login method if configured.
- What happens when a user's roles grant overlapping permissions (e.g., one role grants `invoices:read` and another grants `invoices:*`)? The system uses allow-only evaluation: permissions are unioned across all roles. The broadest matching permission applies. There are no explicit deny rules.
- What happens when a user belongs to multiple organizations with different roles? Role assignments are per-organization. When the user switches organizations, their active roles and permissions change to match the target organization's assignments. The session reflects the current organization's role set.
- What happens when a product transitions from single-tenant to multi-tenant mode? The same APIs and hooks work in both modes. The only change is configuration — from a fixed organization ID to an extraction chain. No application code changes required.
- What happens when two organizations claim overlapping custom domains? The system enforces domain uniqueness at the configuration level, preventing a second organization from claiming an already-registered domain.
- What happens when a session token is valid but the user has been deleted? The system validates user existence on session access and returns an "account not found" error, forcing re-authentication.

## Clarifications

### Session 2026-02-07

- Q: Is a user a single global account with multiple org memberships, or a separate record per organization? → A: Global identity — one user account, multiple org memberships.
- Q: Is the permission model allow-only or allow+deny? → A: Allow-only — roles grant permissions; anything not granted is denied implicitly.
- Q: What is the minimum audit log retention period? → A: 1 year minimum (SOC2), configurable maximum per organization for GDPR data minimization.
- Q: Should audit events be synchronous (blocking) or asynchronous? → A: Asynchronous with guaranteed delivery — events buffered durably, written after response returns.
- Q: Are role assignments global or per-organization? → A: Per-organization — a user has different role assignments in each organization they belong to.

## Requirements *(mandatory)*

### Functional Requirements

**Authentication**:

- **FR-001**: System MUST provide a shared authentication configuration that all 5 products use, supporting email/password credentials and enterprise single sign-on (Azure, Google, and generic identity providers).
- **FR-002**: System MUST enforce authentication on all API routes by default. Products explicitly opt specific routes OUT of authentication (e.g., login page, health check), not IN.
- **FR-003**: System MUST lock user accounts after 5 consecutive failed login attempts for a 15-minute duration.
- **FR-004**: System MUST set session duration to 8 hours across all products, with silent session refresh before expiration.
- **FR-005**: System MUST verify all authentication tokens using cryptographic signature verification. Decode-only token inspection without signature verification is prohibited.
- **FR-006**: System MUST automatically create user accounts on first successful enterprise SSO login (just-in-time provisioning).
- **FR-006a**: System MUST enforce global email uniqueness — each email address corresponds to exactly one user account. A user joins additional organizations through membership, not by creating a new account.

**Authorization**:

- **FR-007**: System MUST support a `resource:action` permission format with wildcard matching (e.g., `users:read`, `teams:*`, `*` for full access).
- **FR-008**: System MUST provide a default role hierarchy with 5 built-in roles: super_admin (level 0), admin (level 10), manager (level 20), user (level 30), guest (level 40). Lower number means higher privilege.
- **FR-009**: System MUST allow each product to register custom roles with custom hierarchy levels and permissions (e.g., "recruiter" at level 22, "accountant" at level 22).
- **FR-010**: System MUST provide both server-side route protection (middleware) and client-side conditional rendering (permission-gated UI components).
- **FR-011**: System MUST support permission matching with three modes: exact match, action wildcard, and global wildcard.
- **FR-011a**: The permission model MUST be allow-only. Permissions are unioned across all of a user's roles. Any permission not explicitly granted is implicitly denied. There are no explicit deny rules.
- **FR-011b**: Role assignments MUST be per-organization. A user may hold different roles in different organizations (e.g., "admin" in Org A, "viewer" in Org B). When a user switches organizations, the active permission set changes to reflect that organization's role assignments.

**Multi-Tenancy**:

- **FR-012**: System MUST resolve the current organization from a configurable priority chain: user session (highest), subdomain, request header, query parameter (lowest).
- **FR-013**: System MUST support two tenancy modes: full multi-tenant (dynamic organization resolution) and single-tenant (fixed organization identifier).
- **FR-014**: System MUST automatically scope all database queries within an organization context to the current organization's data, preventing cross-organization data access.
- **FR-015**: System MUST validate organization status (active, suspended, archived) before processing any request and reject requests for non-active organizations.
- **FR-016**: System MUST support organization switching for users who belong to multiple organizations, updating both the client-side context and server-side session.

**Shared Types**:

- **FR-017**: System MUST provide type definitions for all 13 platform domains: auth, users, permissions/roles, organizations, teams, departments, invitations, email, settings, webhooks, API keys, audit, and notifications.
- **FR-018**: System MUST provide runtime data validation schemas for all core entity types (User, Organization, Role, Team, Invitation, AuditEvent).
- **FR-019**: System MUST support both barrel imports (all types from one entry point) and sub-module imports (only auth types, only user types) for application size optimization.
- **FR-020**: System MUST provide database schema snippets compatible with both Prisma and Drizzle ORMs so products are not forced to change their database tooling.

**Error Handling**:

- **FR-021**: System MUST provide a standardized error hierarchy mapping to standard HTTP status codes: 400 (validation), 401 (authentication), 403 (authorization), 404 (not found), 409 (conflict), 429 (rate limit), 500 (server error).
- **FR-022**: Every error response MUST include: a namespaced error code (e.g., `auth/token-expired`), a developer-facing message, a user-safe message, and a request identifier for support investigations.
- **FR-023**: System MUST provide a shared API route handler that wraps authentication, permission checking, input validation, organization extraction, and error formatting — so developers write only business logic.
- **FR-024**: System MUST automatically emit audit events for all create, update, and delete operations processed through the shared route handler. Audit events MUST be emitted asynchronously (non-blocking to the API response) via a durable buffer that guarantees delivery. No audit event may be silently lost due to application crashes or restarts.

**Audit Logging**:

- **FR-025**: Every audit event MUST contain: actor (user ID), action (verb), resource (type and ID), before state, after state, timestamp, IP address, and request identifier.
- **FR-026**: Audit events MUST be queryable by date range, actor, action, and resource type with paginated results.
- **FR-027**: Audit logging MUST be mandatory and automatic for all state-changing operations. It is not configurable or optional per product.
- **FR-027a**: Audit events MUST be retained for a minimum of 1 year (to satisfy SOC2 requirements). Organizations MAY configure a shorter maximum retention period for GDPR/DPDPA data minimization compliance, but never below 1 year. Events beyond the retention period are automatically purged.

**Cross-Product Adoption**:

- **FR-028**: All 5 products MUST be able to adopt all foundation packages without changing their existing database ORM.
- **FR-029**: Products with existing authentication systems MUST be able to migrate to the shared auth package by providing product-specific configuration (identity providers, public routes) without rewriting their auth logic.
- **FR-030**: The shared packages MUST have zero impact on each product's domain-specific logic (e.g., payroll calculations, accounting ledger, course delivery remain unchanged).

### Key Entities

- **User**: A person who authenticates and interacts with any product. A user is a **single global identity** (unique by email address across the entire platform) that holds memberships in one or more organizations. Key attributes: identity (ID, email, name), profile (picture, phone), status (active, suspended, deleted), organization memberships (with per-org roles and permissions), SSO provider linkage, and metadata.
- **Organization (Tenant)**: A company or entity that subscribes to one or more products. Key attributes: name, slug (for subdomain routing), status (active, suspended, archived), subscription plan, branding (logo, colors), feature flags, and contact information. An organization has many users, teams, and departments.
- **Role**: A named collection of permissions with a hierarchy level, assigned per-organization (a user may hold different roles in different organizations). Key attributes: name, slug, hierarchy level (lower = more privileged), active status, and assignment timestamps. Products extend with custom roles.
- **Permission**: A `resource:action` pair granting access to a specific capability (allow-only; no explicit deny). Supports wildcard matching for broad access (e.g., `users:*` grants all user actions, `*` grants full access). Permissions are unioned across all of a user's assigned roles.
- **Team**: A group of users within an organization, with parent-child hierarchy. Key attributes: name, slug, owner, parent team, and member list with team-specific roles.
- **Department**: An organizational unit within an organization, with hierarchy support (parent, path, level). Key attributes: name, head user, and member count.
- **Session**: A user's active connection to the system. Key attributes: user identity, organization context, roles, permissions, creation time, expiration time, last activity, and device information.
- **AuditEvent**: A structured record of any state-changing action. Key attributes: actor, action, resource (type and ID), before/after states, timestamp, IP address, and request identifier. Uses event type taxonomy: `auth.*`, `user.*`, `resource.*`, `system.*`. Retained for minimum 1 year; configurable maximum per organization.
- **Invitation**: A token-based invite to join an organization, team, or product. Key attributes: inviter, invitee email, type, status (pending, accepted, expired, revoked), expiration, and associated role.
- **PlatformError**: A structured error with HTTP status code, namespaced code, developer message, user-safe message, request ID, and the parameter that caused the error (for validation errors).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 5 products can import and use shared type definitions without any compilation errors or type conflicts.
- **SC-002**: 60% or greater reduction in authentication, authorization, organization isolation, and error handling code across all 5 products after adoption (measured by lines of infrastructure code removed vs. foundation package configuration added).
- **SC-003**: Every API route across all 5 products returns errors in the same standardized format, verified by automated integration tests.
- **SC-004**: Zero cross-organization data leakage, verified by automated isolation tests that create data in one organization and confirm zero visibility from another.
- **SC-005**: A developer can integrate all 5 foundation packages into a new product within 2 weeks, verified by timing the adoption of the least-mature product (Dream Books).
- **SC-006**: Authentication overhead adds less than 50 milliseconds per request compared to an unprotected route.
- **SC-007**: Permission checking completes in less than 5 milliseconds per evaluation.
- **SC-008**: Organization context extraction completes in less than 10 milliseconds per request.
- **SC-009**: All state-changing operations produce queryable audit events within 1 second of the operation completing.
- **SC-010**: A security fix applied to the shared auth package propagates to all 5 products through a single package update, with no product-specific code changes required.
- **SC-011**: Products with existing authentication systems experience zero regression in login success rates after migrating to the shared auth package.
- **SC-012**: All 5 products pass the same security invariant checklist: cryptographic token verification, auth on every route, organization isolation, mandatory audit logging, account lockout, and 8-hour session duration.

### Assumptions

- All 5 products use the same authentication library version, making a shared configuration viable without library migration.
- All 5 products use the same primary database, enabling shared schema definitions.
- Two products use one database ORM tool and three use another — the foundation provides schema snippets for both to avoid forcing ORM migration.
- Session management, token handling, and provider abstraction are handled by the shared auth package; products configure which providers to enable.
- Competitive benchmarking against 19 platforms (documented in research files) informs the permission model, error hierarchy, and feature flag evaluation patterns.
- The 5 default roles (super_admin, admin, manager, user, guest) cover the common cases; products extend with custom roles for domain-specific needs.
- Indian market requirements (data residency, INR pricing, local payment processors) will be addressed in Phase 5 platform extensions, not in the initial foundation.
- The foundation packages have no runtime dependencies when used only for type definitions. Runtime validation and ORM integrations are optional peer dependencies.
