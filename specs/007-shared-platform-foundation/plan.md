# Implementation Plan: Shared Platform Foundation

**Branch**: `007-shared-platform-foundation` | **Date**: 2026-02-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/007-shared-platform-foundation/spec.md`

## Summary

Build 5 shared TypeScript packages (`@dream/types`, `@dream/auth`, `@dream/rbac`, `@dream/multi-tenant`, `@dream/errors`) that provide unified authentication, authorization, multi-tenancy, error handling, and type definitions for 5 SaaS products. Consolidates ~6,600 lines of duplicated infrastructure code into shared packages, fixes critical security gaps (Dream Books zero auth, broken multi-tenancy in 2 products), and establishes mandatory audit logging. Architecture follows instance-based client pattern (Stripe), `resource:action` permissions (Permit.io), JWT-embedded auth context (WorkOS), and `createApiHandler()` (Dream Payroll).

> **Plan Generation**: After design artifacts are complete, `/speckit.plan` delegates implementation plan writing to `superpowers:writing-plans`, which generates bite-sized tasks (2-5 min each) with exact file paths, code, commands, and expected output.

## Technical Context

**Language/Version**: TypeScript 5+, Node.js 18+
**Primary Dependencies**: NextAuth v5-beta (all 5 products already use this), Zod (runtime validation), jose (JWT verification)
**Storage**: PostgreSQL (100% alignment across all 5 products), dual ORM support (Prisma 5/6 for Dream Team + HireWise, Drizzle for Payroll + Books + Learn)
**Testing**: Vitest (unit/integration), Playwright (E2E), MSW (API mocking)
**Target Platform**: Next.js 14-16 server + client (React 18-19)
**Project Type**: Monorepo — 5 independent TypeScript packages consumed by 5 Next.js applications
**Performance Goals**: Auth overhead <50ms/request, permission check <5ms, tenant extraction <10ms, audit emit <1s
**Constraints**: Zero runtime dependencies for type-only imports; optional peer deps for validation/ORM; must work with both Prisma and Drizzle without forcing migration; React 18 and 19 compatible
**Scale/Scope**: 5 products, ~600 API routes total, ~295 combined route directories, 5 foundation packages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Specification-Driven Development | PASS | spec.md completed with 30+ FRs, 8 user stories, 12 success criteria, 5 clarifications resolved |
| II. Test-First Development | PASS | Plan requires TDD: failing tests before implementation for each package |
| III. Evidence-Based Verification | PASS | Plan includes verification commands and measurable performance targets |
| IV. Systematic Debugging | N/A | No bugs to fix at planning stage |
| V. Discovery-First Design | PASS | Brainstorming completed: 5-product analysis, 19-competitor research, 14 patterns evaluated (10 adopted, 4 rejected with rationale) |
| VI. Plan-Driven Development | PASS | This plan document + delegation to writing-plans for bite-sized tasks |
| VII. Security-First Design | PASS | 5 security invariants defined: JWT verification, auth on every route, tenant isolation, webhook signatures, mandatory audit |
| VIII. Simplicity & Maintainability | PASS | 5 focused packages with single responsibility; no god modules; YAGNI applied (Phase 5 deferred: feature flags, billing, notifications) |
| IX. Semantic Versioning | PASS | All packages start at 0.1.0; breaking changes documented |

**Gate result**: ALL PASS. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/007-shared-platform-foundation/
├── plan.md              # This file
├── spec.md              # Feature specification (completed)
├── research.md          # Phase 0: Technology decisions
├── data-model.md        # Phase 1: Entity schemas
├── quickstart.md        # Phase 1: Integration guide
├── contracts/           # Phase 1: Package API contracts
│   ├── dream-types.ts   # @dream/types public API
│   ├── dream-auth.ts    # @dream/auth public API
│   ├── dream-rbac.ts    # @dream/rbac public API
│   ├── dream-multi-tenant.ts  # @dream/multi-tenant public API
│   └── dream-errors.ts  # @dream/errors public API
├── ux-design.md         # Phase 1: React component APIs
├── checklists/          # Quality checklists
│   └── requirements.md  # Spec quality validation (completed)
└── research/            # Brainstorming research (completed)
    ├── product-analysis.md
    ├── cross-product-matrix.md
    └── pattern-adoption.md
```

### Source Code (repository root)

```text
packages/dream/
├── types/
│   ├── src/
│   │   ├── index.ts          # Barrel export
│   │   ├── auth.ts           # Auth-related types
│   │   ├── users.ts          # User, Session types
│   │   ├── organizations.ts  # Organization/Tenant types
│   │   ├── roles.ts          # Role, Permission types
│   │   ├── teams.ts          # Team types
│   │   ├── departments.ts    # Department types
│   │   ├── invitations.ts    # Invitation types
│   │   ├── audit.ts          # AuditEvent types
│   │   ├── errors.ts         # Error response types
│   │   ├── pagination.ts     # Pagination types
│   │   ├── schemas/          # Zod validation schemas
│   │   ├── drizzle/          # Drizzle table definitions
│   │   └── prisma/           # Prisma model snippets
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
├── auth/
│   ├── src/
│   │   ├── index.ts          # Barrel export
│   │   ├── config.ts         # createAuthConfig()
│   │   ├── middleware.ts      # createAuthMiddleware()
│   │   ├── lockout.ts        # Account lockout logic
│   │   ├── jwt.ts            # JWT enrichment callbacks
│   │   ├── providers/        # SSO provider configurations
│   │   └── react/            # AuthProvider, useAuth hook
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
├── rbac/
│   ├── src/
│   │   ├── index.ts          # Barrel export
│   │   ├── permissions.ts    # matchesPermission(), PERMISSIONS constant
│   │   ├── hierarchy.ts      # Role hierarchy, requireMinimumRole()
│   │   ├── middleware.ts      # requirePermission() HOF
│   │   ├── custom-roles.ts   # defineCustomRoles()
│   │   └── react/            # PermissionGate, RoleGate, usePermission
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
├── multi-tenant/
│   ├── src/
│   │   ├── index.ts          # Barrel export
│   │   ├── config.ts         # createTenantConfig()
│   │   ├── extraction.ts     # Tenant extraction chain
│   │   ├── middleware.ts      # withTenant() HOF
│   │   ├── status.ts         # Tenant status enforcement
│   │   └── react/            # TenantProvider, useTenant hook
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
└── errors/
    ├── src/
    │   ├── index.ts          # Barrel export
    │   ├── platform-error.ts # PlatformError base + subclasses
    │   ├── handler.ts        # createApiHandler()
    │   ├── response.ts       # Standardized response formatters
    │   └── audit.ts          # Audit event emission
    ├── tests/
    ├── package.json
    └── tsconfig.json
```

**Structure Decision**: Monorepo with 5 independent packages under `packages/dream/`. Each package has its own `package.json`, `tsconfig.json`, and test suite. Packages are published as `@dream/types`, `@dream/auth`, `@dream/rbac`, `@dream/multi-tenant`, `@dream/errors`. This structure is separate from the existing SDK packages (`packages/python`, `packages/node`, `packages/java`) per ADR-001 (SDK and Dream packages are independent systems sharing only YAML models).

## Complexity Tracking

> No constitution violations to justify. All 5 packages have single responsibility and the structure follows the simplest viable architecture.

## Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

The implementation plan contains 35 bite-sized TDD tasks across 5 packages, with ~286 tests total. Each task follows the pattern: write failing test → verify fail → implement → verify pass → commit.

**Full implementation tasks:** [implementation-tasks.md](implementation-tasks.md)

### Task Overview

| Phase | Tasks | Package | Tests | Est. Time |
|-------|-------|---------|-------|-----------|
| Monorepo + Types | 1-8 | @dream/types | 32 | ~27 min |
| Errors | 9-14 | @dream/errors | 58 | ~25 min |
| RBAC | 15-20 | @dream/rbac | 92 | ~30 min |
| Auth | 21-25 | @dream/auth | 42 | ~20 min |
| Multi-Tenant | 26-30 | @dream/multi-tenant | 39 | ~20 min |
| Integration | 31-35 | Cross-package | 23 | ~15 min |
| **Total** | **35** | **5 packages** | **~286** | **~2.5 hrs** |

### Task List

**Phase 1: Monorepo + @dream/types (Tasks 1-8)**
1. Initialize monorepo workspace (npm workspaces, 5 package.json, tsconfig, vitest config)
2. User and Organization types + tests
3. Role, Permission, Membership types + tests
4. Session, Audit, Invitation, SSO, Team, Department types + tests
5. Response types and pagination + tests
6. Barrel export (index.ts) + tests
7. Zod validation schemas (User, Organization, Role) + tests
8. Full @dream/types build verification

**Phase 2: @dream/errors (Tasks 9-14)**
9. PlatformError base class + 7 subclasses (19 tests)
10. Response formatters: successResponse, errorResponse, paginatedResponse (12 tests)
11. Audit event emitter: AuditEmitter interface, InMemoryAuditEmitter, createAuditEmitter (9 tests)
12. createApiHandler: request ID, error catching, ZodError mapping (11 tests)
13. Barrel export for @dream/errors (7 tests)
14. Full @dream/errors verification (58 tests total)

**Phase 3: @dream/rbac (Tasks 15-20)**
15. Permission matching: matchesPermission, hasAnyPermission, hasAllPermissions (20 tests)
16. PERMISSIONS constant + role hierarchy: BUILT_IN_ROLES, requireMinimumRole (18 tests)
17. defineCustomRoles and role registry (10 tests)
18. Middleware HOFs: requirePermission, requireAnyPermission, requireAllPermissions, requireRole, requireMinimumRoleMiddleware (11 tests)
19. React components: PermissionGate, RoleGate, AdminGate + hooks: usePermission, useRole, useHasMinimumRole (18 tests)
20. Barrel export and full @dream/rbac verification (15 tests, 92 total)

**Phase 4: @dream/auth (Tasks 21-25)**
21. Account lockout: checkLockout, recordFailedAttempt, clearLockout (9 tests)
22. createAuthConfig factory with defaults and validation (10 tests)
23. JWT enrichment: enrichJWT callback with roles, permissions, tenantId (10 tests)
24. React AuthProvider + useAuth hook + MockAuthProvider (7 tests)
25. Barrel export for @dream/auth (6 tests, 42 total)

**Phase 5: @dream/multi-tenant (Tasks 26-30)**
26. Tenant extraction: subdomain, header, query param (12 tests)
27. createTenantConfig factory with extraction sources and subdomain defaults (11 tests)
28. Tenant status enforcement: active/suspended/archived (3 tests)
29. React TenantProvider + useTenant hook + MockTenantProvider (7 tests)
30. Barrel export for @dream/multi-tenant (6 tests, 39 total)

**Phase 6: Integration + Final (Tasks 31-35)**
31. Cross-package createApiHandler integration test (12 scenarios)
32. React provider composition integration test (11 scenarios)
33. Full monorepo verification (all 5 packages)
34. Root-level test, build, and typecheck scripts
35. Final commit and summary

### Package Dependency Graph

```
@dream/types (no deps)
├── @dream/errors (depends on @dream/types)
├── @dream/rbac (depends on @dream/types)
├── @dream/auth (depends on @dream/types)
└── @dream/multi-tenant (depends on @dream/types)

Integration: @dream/errors + @dream/rbac (handler integration)
             @dream/auth + @dream/multi-tenant + @dream/rbac (React providers)
```
