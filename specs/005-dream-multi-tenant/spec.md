# Feature Specification: @dream/multi-tenant — Shared Multi-Tenancy Package

**Feature Branch**: `005-dream-multi-tenant`
**Created**: 2026-02-06
**Status**: Draft
**Input**: User description: "Create a shared multi-tenancy package providing tenant context extraction, subdomain routing, React context, API middleware, and data isolation primitives for 5 SaaS products (Dream Books, Dream Payroll, Dream Team, HireWise, Dream Learn)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - API Route Automatically Receives Tenant Context (Priority: P1)

A backend developer wraps a Next.js API route handler with `withTenant()` and the middleware automatically resolves the current tenant from the incoming request, injecting the `tenantId` into the handler context. The developer never writes tenant extraction logic manually and can trust that every database query scoped through this handler is automatically filtered to the correct tenant.

**Why this priority**: Tenant context extraction is the foundational capability of the entire package. Without reliable, automatic tenant resolution on the server side, no other feature (data isolation, subdomain routing, React context) can function. This is the minimum viable product.

**Independent Test**: Create a Next.js API route wrapped with `withTenant()`, send a request with a valid tenant identifier (via session, subdomain, header, or query param), and verify the handler receives the correct `tenantId` in its context.

**Acceptance Scenarios**:

1. **Given** an API route wrapped with `withTenant()`, **When** a request arrives with a valid tenant identifier in the user's session, **Then** the handler receives a `TenantContext` object containing the resolved `tenantId` and tenant metadata.
2. **Given** an API route wrapped with `withTenant()`, **When** a request arrives with no identifiable tenant (no session, no subdomain, no header, no query param), **Then** the middleware throws a `TenantContextError` with a descriptive message before the handler executes.
3. **Given** an API route wrapped with `withTenant()`, **When** the resolved `tenantId` does not match any active tenant, **Then** the middleware throws a `TenantContextError` indicating the tenant is invalid or suspended.
4. **Given** an API route wrapped with `withTenant()`, **When** a request contains tenant identifiers from multiple sources (e.g., session and header), **Then** the middleware uses the highest-priority source (session > subdomain > header > query param) and ignores lower-priority sources.

---

### User Story 2 - Tenant Resolved from Subdomain (Priority: P1)

A platform operator configures a product (e.g., Dream Team) so that each customer organization accesses the application through a unique subdomain (e.g., `acme.dreamteam.app`). The multi-tenant package extracts the tenant slug from the subdomain and resolves it to a tenant context, enabling transparent routing without requiring tenants to pass identifiers manually.

**Why this priority**: Subdomain-based routing is the primary tenant identification mechanism for multi-tenant products. It provides a seamless user experience where each organization has its own branded URL, and it is the dominant pattern used by Dream Team.

**Independent Test**: Configure a product with subdomain routing enabled, access `acme.app.com`, and verify the system resolves "acme" to the correct tenant record and populates the tenant context.

**Acceptance Scenarios**:

1. **Given** subdomain routing is enabled, **When** a user navigates to `acme.dreamteam.app`, **Then** the system extracts "acme" as the tenant slug and resolves it to the corresponding tenant record.
2. **Given** subdomain routing is enabled, **When** a user navigates to an unrecognized subdomain `unknown.dreamteam.app`, **Then** the system raises a `TenantContextError` and the application displays a "tenant not found" page.
3. **Given** subdomain routing is enabled, **When** the root domain `dreamteam.app` is accessed without a subdomain, **Then** the system treats it as a tenantless request (e.g., marketing page or login page) and does not throw an error.
4. **Given** a tenant has a custom domain configured (e.g., `hr.acme.com`), **When** a user accesses that custom domain, **Then** the system maps the domain to the correct tenant as if they had used the subdomain URL.

---

### User Story 3 - React Components Access Tenant Context (Priority: P1)

A frontend developer wraps their application layout with `TenantProvider` and uses the `useTenant()` hook inside any component to access the current tenant's identity, branding, and configuration without prop-drilling. The tenant context is populated during server-side rendering and hydrated on the client.

**Why this priority**: Frontend components frequently need tenant-specific data (logo, colors, feature flags, tenant name) for rendering. Without a React context provider, every component would need to fetch or receive tenant data independently, leading to inconsistency and redundant API calls.

**Independent Test**: Render a Next.js page with `TenantProvider` at the layout level, call `useTenant()` in a child component, and verify it returns the tenant's id, name, slug, and branding fields.

**Acceptance Scenarios**:

1. **Given** a Next.js application with `TenantProvider` wrapping the root layout, **When** a child component calls `useTenant()`, **Then** it receives the current tenant's `id`, `name`, `slug`, `logoUrl`, and `primaryColor`.
2. **Given** a page is server-side rendered, **When** `TenantProvider` is populated on the server, **Then** the tenant context is hydrated on the client without additional API calls.
3. **Given** `useTenant()` is called outside of a `TenantProvider`, **Then** it throws a descriptive error indicating the hook must be used within a `TenantProvider`.
4. **Given** the tenant context has not yet loaded (loading state), **When** `useTenant()` is called, **Then** it returns a loading indicator or null tenant, allowing the component to render a skeleton or fallback.

---

### User Story 4 - Data Isolation Across Tenants (Priority: P2)

A developer writing database queries within a `withTenant()` wrapped handler has confidence that all queries are automatically scoped to the current tenant. No data from other tenants is ever returned or modified, even if the developer forgets to add a `WHERE tenant_id = ?` clause manually.

**Why this priority**: Data isolation is a fundamental security requirement for multi-tenant systems. A single cross-tenant data leak is a critical security incident. Automatic query scoping eliminates the most common category of isolation bugs.

**Independent Test**: Within a `withTenant()` handler for tenant A, query the users table. Verify that only tenant A's users are returned, even though tenant B's users exist in the same table.

**Acceptance Scenarios**:

1. **Given** a handler executing in the context of tenant A, **When** a query is issued against a tenant-scoped table, **Then** only rows belonging to tenant A are returned.
2. **Given** a handler executing in the context of tenant A, **When** an insert is issued against a tenant-scoped table, **Then** the `tenant_id` column is automatically set to tenant A's id.
3. **Given** a handler executing in the context of tenant A, **When** an update or delete is issued, **Then** the operation is automatically restricted to rows belonging to tenant A.
4. **Given** a super-admin context that is explicitly marked as cross-tenant, **When** a query is issued, **Then** the automatic tenant scoping is bypassed and all rows across tenants are accessible.

---

### User Story 5 - Tenant Extraction Priority and Fallback Chain (Priority: P2)

A developer configures the extraction priority so the system tries to resolve the tenant from the session first, then the subdomain, then a custom HTTP header, and finally a query parameter. Each source is tried in order, and the first successful resolution is used. This allows different products to rely on different primary sources while sharing the same middleware.

**Why this priority**: Different products have different deployment models. Dream Team relies on subdomains, while Dream Payroll may embed the tenant in a session claim. A configurable extraction chain makes the package genuinely reusable across all 5 products.

**Independent Test**: Configure extraction with all four sources enabled, send a request with a tenant in the header but not in the session, and verify the header value is used as the fallback.

**Acceptance Scenarios**:

1. **Given** default extraction priority (session > subdomain > header > query param), **When** the session contains a `tenantId` claim, **Then** the session value is used and other sources are not consulted.
2. **Given** default extraction priority, **When** the session has no tenant claim but the request arrives on `acme.app.com`, **Then** the subdomain "acme" is used.
3. **Given** default extraction priority, **When** neither session nor subdomain provide a tenant, but the `X-Tenant-ID` header is present, **Then** the header value is used.
4. **Given** default extraction priority, **When** no other source provides a tenant but `?tenantId=xxx` is in the URL, **Then** the query param value is used.
5. **Given** a product configures extraction to only use session and header (disabling subdomain and query param), **When** a subdomain-based request arrives, **Then** the subdomain is ignored and only session and header are checked.

---

### User Story 6 - Tenant Switching for Multi-Tenant Users (Priority: P3)

A user who belongs to multiple tenants (e.g., a consultant working across two organizations) can switch between tenants within the application. The `TenantProvider` updates the current tenant context, the session is updated to reflect the new active tenant, and all subsequent API calls and queries operate against the newly selected tenant.

**Why this priority**: While most users belong to a single tenant, power users and consultants frequently need cross-tenant access. This is a secondary workflow that builds on top of the core context infrastructure.

**Independent Test**: Log in as a user with access to two tenants, switch from tenant A to tenant B using the tenant switcher, and verify the UI updates to show tenant B's data and branding.

**Acceptance Scenarios**:

1. **Given** a user belongs to tenants A and B, **When** the user switches from tenant A to tenant B, **Then** the `TenantProvider` context updates to tenant B's data.
2. **Given** a user switches tenants, **When** the switch completes, **Then** the session's active tenant claim is updated so subsequent API calls use tenant B.
3. **Given** a user belongs to only one tenant, **When** the tenant switcher is queried, **Then** it returns a single tenant and no switching UI is displayed.

---

### User Story 7 - Products Opt Into Multi-Tenancy Selectively (Priority: P3)

A developer building Dream Books (a single-tenant product) imports `@dream/multi-tenant` but configures it in single-tenant mode. The package provides a fixed tenant context without requiring subdomain routing or tenant extraction logic. The same `useTenant()` hook and `withTenant()` middleware work, but they always resolve to the single configured tenant.

**Why this priority**: Not all products need full multi-tenancy. Single-tenant products still benefit from consistent APIs and can upgrade to multi-tenancy later without code changes. This flexibility is necessary for the package to serve all 5 products.

**Independent Test**: Configure `@dream/multi-tenant` in single-tenant mode with a fixed tenant id, use `withTenant()` and `useTenant()`, and verify they always resolve to the configured tenant without requiring subdomain or header extraction.

**Acceptance Scenarios**:

1. **Given** single-tenant mode is configured with a fixed tenant id, **When** `withTenant()` processes any request, **Then** it always resolves to the configured tenant regardless of subdomain, header, or query param.
2. **Given** single-tenant mode is configured, **When** `useTenant()` is called in the frontend, **Then** it returns the fixed tenant data.
3. **Given** a product transitions from single-tenant to multi-tenant mode, **When** the configuration is changed to enable subdomain routing, **Then** the same `withTenant()` and `useTenant()` APIs work without code changes in the application.

---

### Edge Cases

- What happens when a tenant's status changes to `suspended` while users are actively using the application? Active sessions for that tenant are invalidated at the next request boundary, and `withTenant()` raises a `TenantContextError` with a "tenant suspended" message.
- What happens when two tenants have overlapping custom domains? The system enforces uniqueness of custom domains at the configuration level, preventing a second tenant from claiming a domain already in use.
- What happens when the subdomain extraction encounters a multi-level subdomain (e.g., `dept.acme.dreamteam.app`)? Only the first subdomain segment before the application domain is extracted as the tenant slug. Nested subdomains are not supported by default.
- What happens when the `X-Tenant-ID` header contains a malicious or malformed value? The value is validated as a valid UUID format before any lookup is attempted, and invalid values result in a `TenantContextError`.
- What happens when the tenant database table is temporarily unreachable? The middleware returns a 503 Service Unavailable response rather than proceeding with an unknown tenant context.
- How does the package handle server-side rendering when the tenant context depends on the request URL? During SSR, the tenant context is resolved from the incoming HTTP request (subdomain, headers) and passed to `TenantProvider` as a server prop, avoiding hydration mismatches.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Package MUST provide a `TenantContext` type containing the current tenant's `id`, `name`, `slug`, `status`, `plan`, and branding fields (`logoUrl`, `primaryColor`).
- **FR-002**: Package MUST provide a `withTenant()` higher-order function that wraps Next.js API route handlers and injects a resolved `TenantContext` into the handler's arguments.
- **FR-003**: Package MUST resolve tenant identity from four sources in configurable priority order: user session, request subdomain, HTTP header (`X-Tenant-ID`), and URL query parameter (`tenantId`).
- **FR-004**: Package MUST provide a `TenantProvider` React context component that makes tenant data available to all descendant components via the `useTenant()` hook.
- **FR-005**: Package MUST provide a `useTenant()` React hook that returns the current `TenantContext` and throws a descriptive error when used outside of a `TenantProvider`.
- **FR-006**: Package MUST support subdomain-based tenant routing where the tenant slug is extracted from the subdomain portion of the request URL (e.g., `acme` from `acme.app.com`).
- **FR-007**: Package MUST throw a `TenantContextError` (with a descriptive message and error code) when tenant resolution fails due to missing, invalid, or suspended tenant identifiers.
- **FR-008**: Package MUST support a single-tenant mode where the tenant context is statically configured and extraction middleware always resolves to the fixed tenant.
- **FR-009**: Package MUST ensure that database queries executed within a `withTenant()` context are automatically scoped to the current tenant's `tenant_id`, preventing cross-tenant data access.
- **FR-010**: Package MUST provide Drizzle ORM schema snippets for the `tenants` and `departments` tables that include all fields from the canonical Tenant and Department models.
- **FR-011**: Package MUST provide Prisma schema snippets for the `Tenant` and `Department` models that include all fields from the canonical models.
- **FR-012**: Package MUST support tenant switching for users who belong to multiple tenants, updating both the React context and the server-side session when the active tenant changes.
- **FR-013**: Package MUST allow products to configure which extraction sources are enabled, so products that do not use subdomains can disable subdomain extraction without code changes.
- **FR-014**: Package MUST validate tenant identifiers at the middleware boundary (format validation, existence check, status check) before any handler logic executes.

### Key Entities

- **TenantContext**: The runtime representation of the currently active tenant, containing the tenant's `id`, `name`, `slug`, `status`, `plan`, branding fields (`logoUrl`, `primaryColor`), and feature flags. This is the primary value passed through middleware and React context.
- **Tenant**: The persisted tenant/organization record with full profile, subscription, branding, contact information, features, and lifecycle status. Corresponds to a row in the `tenants` table. A tenant has many users, departments, teams, and configuration records.
- **Department**: An organizational unit within a tenant, supporting hierarchical structure (parent-child relationships via `parentId` and `path`), department head assignment, and member tracking.
- **TenantContextError**: A structured error type raised when tenant resolution fails. Contains an error code (e.g., `TENANT_NOT_FOUND`, `TENANT_SUSPENDED`, `TENANT_MISSING`) and a human-readable message.
- **ExtractionSource**: A configured source for tenant identity resolution (session, subdomain, header, query param), with an enabled/disabled flag and priority ranking.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Dream Team (full multi-tenancy product) can use `@dream/multi-tenant` to handle tenant context extraction, subdomain routing, and data isolation without any product-specific tenant resolution code.
- **SC-002**: Dream Books and HireWise (single-tenant products) can use `@dream/multi-tenant` in single-tenant mode with zero configuration for subdomain routing or extraction chains.
- **SC-003**: A developer integrating `@dream/multi-tenant` into a new product can have tenant context working (provider, hook, and middleware) within 30 minutes by following the package documentation.
- **SC-004**: All database queries executed within a `withTenant()` context return zero rows from other tenants, verified by automated integration tests with multi-tenant test data.
- **SC-005**: The `TenantProvider` and `useTenant()` hook work with both server-side rendering and client-side navigation without hydration mismatches.
- **SC-006**: Tenant extraction correctly follows the configured priority chain, with 100% of requests resolving to the expected tenant when multiple sources are present.
- **SC-007**: The package introduces less than 5KB (gzipped) to the client-side bundle when only the React provider and hook are used.
- **SC-008**: Switching between tenants for multi-tenant users completes within 500ms and immediately reflects in both the UI (via `useTenant()`) and subsequent API calls (via updated session).

### Assumptions

- All 5 products use Next.js 14+ with the App Router and TypeScript 5.0+.
- Products using subdomain routing have wildcard DNS and TLS certificates configured at the infrastructure level.
- Tenant data is stored in PostgreSQL and the `tenants` table schema follows the canonical model defined in `@dream/types`.
- The `@dream/multi-tenant` package depends on `@dream/types` for the `Tenant`, `Department`, `TenantStatus`, and `SubscriptionPlan` type definitions.
- Session management (creation, storage, validation) is handled by a separate `@dream/auth` package; `@dream/multi-tenant` reads tenant claims from the session but does not manage the session itself.
- Custom domain mapping (e.g., `hr.acme.com` to tenant "acme") is stored in the tenant record's `domain` field.
- Products that do not need multi-tenancy today may adopt it later without rewriting their application code, only changing configuration.
