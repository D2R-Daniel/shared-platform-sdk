# Feature Specification: @dream/types — Shared TypeScript Type Definitions

**Feature Branch**: `002-dream-types`
**Created**: 2026-02-06
**Status**: Draft
**Input**: User description: "Create a comprehensive shared types package that serves as the foundation for all @dream/* packages across 5 SaaS products"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Imports Shared Types Into Product (Priority: P1)

A developer working on Dream Books (or any product) installs `@dream/types` and immediately gets access to all shared type definitions (User, Tenant, Role, Team, etc.) with full IntelliSense and compile-time type safety, eliminating the need to define these types locally in each product.

**Why this priority**: This is the core value proposition — a single source of truth for types shared across all products. Without this, every product maintains its own incompatible type definitions, causing drift and integration bugs.

**Independent Test**: Install `@dream/types` in a fresh Next.js project, import `User`, `Tenant`, `Role`, and verify TypeScript compilation succeeds with full IntelliSense.

**Acceptance Scenarios**:

1. **Given** a developer installs `@dream/types`, **When** they import `User` from `@dream/types`, **Then** they get a fully typed `User` interface with all fields (id, email, name, status, roles, tenantId, etc.) and IntelliSense autocomplete works.
2. **Given** a developer imports `UserStatus`, **When** they assign an invalid value like `"unknown"`, **Then** TypeScript compiler raises a type error.
3. **Given** a developer imports types from multiple domains, **When** they use `import { User, Tenant, Role, Team } from '@dream/types'`, **Then** all types are available from a single entry point without conflicts.

---

### User Story 2 - Developer Uses Domain-Specific Sub-Imports (Priority: P1)

A developer who only needs authentication types can import from `@dream/types/auth` to get a smaller, focused subset (UserContext, JWTPayload, TokenResponse, Session) without pulling in the entire type library.

**Why this priority**: Tree-shaking and modular imports are essential for large codebases. Products that only use auth should not be forced to import tenant or webhook types.

**Independent Test**: Import `UserContext` from `@dream/types/auth` in a Next.js project. Verify only auth-related types are resolved and the bundle doesn't include unrelated types.

**Acceptance Scenarios**:

1. **Given** a developer needs only auth types, **When** they `import { UserContext, JWTPayload } from '@dream/types/auth'`, **Then** only auth-related types are imported.
2. **Given** a developer needs only tenant types, **When** they `import { Tenant, SSOConfig } from '@dream/types/tenants'`, **Then** only tenant-related types are imported.
3. **Given** sub-path imports are used, **When** the project is built, **Then** unused domain types are tree-shaken from the final bundle.

---

### User Story 3 - Developer Validates Data at Runtime with Zod Schemas (Priority: P2)

A developer receiving user data from an API response validates it at runtime using the Zod schemas provided by `@dream/types` to ensure data conforms to the expected shape before using it in the application.

**Why this priority**: TypeScript types are erased at runtime. At system boundaries (API responses, form inputs, webhook payloads), runtime validation is critical to catch malformed data before it causes errors deeper in the application.

**Independent Test**: Parse an API response through `UserSchema.parse(data)` and verify it returns a typed `User` object on valid data and throws a `ZodError` on invalid data.

**Acceptance Scenarios**:

1. **Given** a valid user JSON object from an API, **When** `UserSchema.parse(data)` is called, **Then** it returns a validated `User` object with correct TypeScript type inference.
2. **Given** a user JSON with missing required field `email`, **When** `UserSchema.parse(data)` is called, **Then** it throws a `ZodError` with a clear message identifying the missing field.
3. **Given** a user JSON with `status: "bogus"`, **When** `UserSchema.parse(data)` is called, **Then** it throws a `ZodError` indicating the invalid enum value.

---

### User Story 4 - Developer Uses Drizzle Schema Snippets (Priority: P2)

A developer on Dream Books (which uses Drizzle ORM) imports the shared Drizzle schema snippets for core entities (users, tenants, roles, teams) and uses them to define their database tables, ensuring consistent column names and types across products.

**Why this priority**: Products using Drizzle need database schemas that match the shared types. Providing ORM-specific schema snippets reduces boilerplate and ensures consistency.

**Independent Test**: Import `usersTable` from `@dream/types/drizzle`, use it in a Drizzle migration, and verify the generated SQL matches expected column definitions.

**Acceptance Scenarios**:

1. **Given** a Drizzle-based project, **When** the developer imports `usersTable` from `@dream/types/drizzle`, **Then** it provides a valid Drizzle table definition with all user columns properly typed.
2. **Given** the `usersTable` schema, **When** a migration is generated, **Then** the SQL columns match the `User` TypeScript interface (id as UUID, email as varchar(255), status as enum, etc.).
3. **Given** both `usersTable` and `tenantsTable` are imported, **When** they are used together, **Then** foreign key relationships between user.tenantId and tenant.id are correctly typed.

---

### User Story 5 - Developer Uses Prisma Schema Snippets (Priority: P2)

A developer on Dream Team (which uses Prisma ORM) imports the shared Prisma schema snippet files for core entities and uses them alongside their existing Prisma schema, ensuring consistent model definitions across products.

**Why this priority**: Products using Prisma need schema definitions that match the shared types. Providing Prisma snippets for both ORMs avoids forcing an ORM migration.

**Independent Test**: Copy the provided Prisma model definition for `User` into a `schema.prisma` file, run `prisma generate`, and verify the generated client types match `@dream/types` User interface.

**Acceptance Scenarios**:

1. **Given** a Prisma-based project, **When** the developer copies the provided `User` model into their schema.prisma, **Then** `prisma generate` succeeds and produces a Prisma client with fields matching the `User` type.
2. **Given** the Prisma schema snippets, **When** `prisma migrate dev` is run, **Then** the migration SQL creates tables with columns matching the shared type definitions.

---

### User Story 6 - Shared Pagination and Response Types Across Products (Priority: P3)

A developer uses the shared `Pagination` interface and list response wrapper types (e.g., `UserListResponse`, `TeamListResponse`) so all products return consistent paginated API responses.

**Why this priority**: Consistent pagination interfaces eliminate the need for product-specific pagination logic and enable shared UI components to work across products.

**Independent Test**: Import `Pagination` and `UserListResponse` types, use them to type an API handler return value, verify compile-time correctness.

**Acceptance Scenarios**:

1. **Given** a developer builds a paginated API, **When** they use `UserListResponse` as the return type, **Then** it enforces `{ data: User[], pagination: Pagination }` structure.
2. **Given** a shared list component expects `Pagination` type, **When** it receives a response from any product's API, **Then** the pagination fields (page, pageSize, totalItems, totalPages) are consistently available.

---

### Edge Cases

- What happens when `@dream/types` is used with TypeScript versions below 5.0? The package requires TypeScript >= 5.0 as a peer dependency and will produce a clear error at install time.
- How does the package handle conflicting type names across domains (e.g., `Pagination` is defined in multiple domain files)? A single canonical `Pagination` interface is defined in a `common.ts` file and re-exported by all domain modules.
- What happens when a Zod schema is used to parse `undefined` or `null`? Zod schemas use `.optional()` and `.nullable()` modifiers matching the TypeScript interface optionality, and throw clear validation errors for unexpected nulls.
- What happens when Drizzle schema snippets are used without PostgreSQL? The Drizzle schemas target PostgreSQL (pgTable, pgEnum). Using them with other databases requires manual adaptation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Package MUST export TypeScript interfaces for all 13 platform domains: auth, users, permissions/roles, tenants, teams, invitations, email, settings, webhooks, apikeys, audit, notifications, and feature flags.
- **FR-002**: Package MUST support both barrel imports (`@dream/types`) and sub-path imports (`@dream/types/auth`, `@dream/types/users`, etc.) for tree-shaking.
- **FR-003**: Package MUST provide Zod validation schemas for all core entity types (User, Tenant, Role, Team, Invitation, AuditEvent) enabling runtime type checking.
- **FR-004**: Package MUST provide Drizzle ORM table definitions for core entities importable from `@dream/types/drizzle`.
- **FR-005**: Package MUST provide Prisma schema snippet files (copyable model definitions) for core entities accessible from `@dream/types/prisma`.
- **FR-006**: Package MUST define a single canonical `Pagination` interface used consistently across all list response types, avoiding duplicate definitions.
- **FR-007**: Package MUST export all request/response types for CRUD operations (CreateUserRequest, UpdateUserRequest, UserListResponse, etc.) for each domain.
- **FR-008**: Package MUST export all enum-like union types (UserStatus, TenantStatus, InvitationStatus, TeamMemberRole, etc.) as TypeScript union types.
- **FR-009**: Package MUST use camelCase property naming for all TypeScript interfaces (consistent with JavaScript conventions), regardless of how the API or database names the fields.
- **FR-010**: Package MUST be compatible with Next.js 14+ and TypeScript 5.0+ environments.
- **FR-011**: Package MUST have zero runtime dependencies when used only for type imports (types are erased at compile time). Zod is a peer dependency required only when using validation schemas.

### Key Entities

- **User**: Core user identity with profile, status, roles, organization affiliation (tenantId, departmentId, teamId), SSO fields (externalId, identityProvider, entraObjectId), and metadata.
- **Tenant**: Organization/company with subscription plan, branding, features, SSO configuration, and status lifecycle.
- **Role**: Named permission bundle with hierarchy level, active status, and assignment lifecycle (grantedAt, expiresAt).
- **Permission**: Resource-action pair (e.g., `users:read`, `teams:*`) supporting wildcard matching.
- **Team**: Hierarchical group with members, owner, parent-child relationships, and slug-based identification.
- **Department**: Organizational unit within a tenant, with hierarchy support (parent, path, level) and head user.
- **Invitation**: Token-based invite with type (user, team, organization), status lifecycle, and expiration.
- **AuditEvent**: Structured log entry with event type taxonomy (auth.*, user.*, resource.*, system.*), actor information, and resource references.
- **Notification**: Multi-channel message (email, SMS, push, in-app) with category, read status, and action URL.
- **Webhook**: Event subscription with URL, secret, events, delivery tracking, and retry configuration.
- **APIKey**: Environment-scoped key (live/test) with permissions, rate limiting, IP restrictions, and usage tracking.
- **FeatureFlag**: Toggleable feature with targeting rules, evaluation context, and metadata.
- **Settings**: Tenant-scoped configuration organized by category (general, branding, features, security, notifications).
- **Pagination**: Consistent response wrapper with page, pageSize, totalItems, totalPages, hasNext, hasPrevious.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 5 products can import and use `@dream/types` without any TypeScript compilation errors.
- **SC-002**: Developers experience zero type conflicts when importing types from multiple domains simultaneously.
- **SC-003**: Runtime validation using Zod schemas catches 100% of malformed API payloads that violate the type contract.
- **SC-004**: A new developer joining any product team can understand the shared data model within 30 minutes by browsing the package's type definitions.
- **SC-005**: Adding a new field to a shared entity requires a change in exactly one place (`@dream/types`) rather than in 5 separate product codebases.
- **SC-006**: Products using Drizzle ORM can adopt shared schema definitions without changing their existing ORM setup.
- **SC-007**: Products using Prisma ORM can adopt shared schema definitions without changing their existing ORM setup.

### Assumptions

- All products use TypeScript 5.0+ and Node.js 18+.
- The package is distributed via pnpm workspace links during development and npm registry for production.
- Zod is an optional peer dependency — products that don't need runtime validation can use the package purely for type imports.
- Drizzle schema snippets target PostgreSQL (since all products use PostgreSQL).
- Prisma schema snippets are provided as copyable `.prisma` model definitions, not as generated code.
- camelCase is used for TypeScript interfaces; snake_case fields from APIs are handled by the consuming SDK/client layer.
