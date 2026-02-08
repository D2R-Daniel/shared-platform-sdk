# Shared Platform Foundation — Technology Decisions

**Feature**: 007 — Shared Platform Foundation (Phase 0)
**Date**: 2026-02-07
**Status**: Decisions finalized

## Overview

This document consolidates all technology decisions made during the Phase 0 brainstorming and specification process. Each decision was evaluated against the five Dream products (Dream Team, Dream Payroll, Dream Books, Dream Learn, HireWise) for alignment, migration cost, and long-term maintainability. Detailed supporting data can be found in the `research/` subdirectory (cross-product matrix, pattern adoption analysis, and per-product analysis).

---

## Infrastructure & Tooling

### D1: Package Manager and Monorepo Tool
- **Decision**: npm workspaces
- **Rationale**: All 5 products use npm (100% alignment). No need for pnpm, yarn, or turborepo for 5 simple packages. npm workspaces provides sufficient dependency hoisting and cross-package linking without introducing new tooling.
- **Alternatives considered**: pnpm workspaces (faster installs but requires migration across all products), turborepo (overkill for 5 packages — adds build orchestration complexity that isn't needed at this scale).

---

## Authentication & Sessions

### D2: Auth Library
- **Decision**: NextAuth v5-beta (wrap, don't replace)
- **Rationale**: 100% alignment — all 5 products already use NextAuth v5-beta. Zero migration cost. `@dream/auth` wraps NextAuth configuration with shared defaults (session duration, callbacks, provider setup), it doesn't replace it. Products retain full control over their NextAuth config while getting standardized behavior.
- **Alternatives considered**: Custom JWT solution (significantly more implementation work, loses NextAuth's ecosystem of providers and adapters), Clerk/Auth0 (introduces vendor lock-in and requires migrating all 5 products off NextAuth).

### D3: JWT Verification Library
- **Decision**: jose (for any verification outside NextAuth's built-in)
- **Rationale**: jose is the standard library for JWT operations in Node.js. The existing Node.js SDK uses jwt-decode without verification — a critical security bug that allows accepting any well-formed JWT without validating its signature. jose provides signing, verification, and encryption with full JWK/JWS/JWE support.
- **Alternatives considered**: jsonwebtoken (older, less actively maintained, callback-based API), jwt-decode (decode-only with no verification — rejected for security; decoding without verifying is equivalent to trusting unsigned data).

### D11: Session Duration
- **Decision**: 8 hours, enforced as a security invariant
- **Rationale**: Dream Team and Dream Payroll already use 8 hours. Dream Books and HireWise default to ~30 days, which is a critical security issue for applications handling HR, payroll, and financial data. 8 hours balances usability with security for business applications — a full workday without re-authentication.
- **Alternatives considered**: 24 hours (too long for sensitive HR/payroll/financial data — an unattended session stays valid overnight), 1 hour (too short, causes session fatigue and repeated logins that degrade user experience).

---

## Validation & Types

### D4: Validation Library
- **Decision**: Zod
- **Rationale**: All 5 products already use Zod for input validation. Zod provides both TypeScript type inference (`z.infer<typeof schema>`) and runtime validation in a single definition. Used in `@dream/types` schema definitions so that types and validators are always in sync.
- **Alternatives considered**: io-ts (functional-programming-heavy API with steep learning curve), yup (less TypeScript integration, weaker type inference), ajv (JSON Schema paradigm — different mental model, doesn't generate TypeScript types natively).

---

## Database & ORM

### D5: ORM Strategy
- **Decision**: Dual ORM support — provide both Drizzle table definitions and Prisma model snippets
- **Rationale**: Dream Team and HireWise use Prisma. Dream Payroll, Dream Books, and Dream Learn use Drizzle. Forcing ORM migration on any product adds risk and friction to adoption. Foundation provides schema definitions for both via sub-path imports (`@dream/types/drizzle` for Drizzle table definitions, `@dream/types/prisma` for Prisma model snippets). Products import whichever matches their stack.
- **Alternatives considered**: Force all to Drizzle (requires migration for 2 products already running Prisma in production), force all to Prisma (requires migration for 3 products already running Drizzle in production).

---

## Authorization & Permissions

### D6: Permission Model
- **Decision**: `resource:action` string format with wildcard matching, allow-only evaluation
- **Rationale**: Dream Team and Dream Payroll already use this format. Maps directly to Permit.io's `check(user, action, resource)` primitive for future policy-as-code adoption. Wildcards (`users:*`, `*`) enable hierarchical delegation — an admin with `users:*` automatically gains `users:read`, `users:write`, `users:delete`. Allow-only evaluation (union permissions across all assigned roles) is simpler and less error-prone than allow+deny — there is no way for one role to unexpectedly revoke a permission granted by another.
- **Alternatives considered**: ABAC/attribute-based access control (too complex for current needs, deferred to Phase 4 when conditional policies are required), ReBAC/relationship-based access control (too complex for current org structures, deferred), allow+deny evaluation (user explicitly chose allow-only during specification clarification — deny rules create surprising permission interactions).

### D7: Role Hierarchy Convention
- **Decision**: Lower number = higher privilege (super_admin=0, admin=10, manager=20, user=30, guest=40)
- **Rationale**: Enables clean comparison logic (`if (user.level <= required.level)` grants access). Spacing of 10 allows products to insert custom roles without renumbering (e.g., recruiter=22, curator=25). Dream Learn currently uses higher=more-privileged (admin=100) but the spec standardizes on lower=higher, which is the more common convention in systems programming (Unix uid 0 = root).
- **Alternatives considered**: Higher number = higher privilege (Dream Learn's current convention, counterintuitive for access checks — requires `>=` comparisons), string-only roles without numeric hierarchy (loses the ability to do simple level comparisons, requires explicit role graphs).

### D14: Role Assignment Scope
- **Decision**: Per-organization role assignments
- **Rationale**: A user can be admin in Org A and viewer in Org B. When switching organizations, the active roles and permissions change accordingly. This is the standard SaaS pattern — WorkOS, Frontegg, and PropelAuth all implement per-org role assignment. User explicitly chose this during specification clarification.
- **Alternatives considered**: Global roles (same role everywhere, too rigid — an accountant shouldn't be admin in every org they belong to), per-product roles (adds an unnecessary dimension of complexity without clear user benefit).

---

## Identity & Multi-Tenancy

### D10: Tenant ID Field Name
- **Decision**: `tenantId` (standardized across all packages)
- **Rationale**: Dream Team already uses `tenantId`. The other products use `organizationId`. `tenantId` is the industry-standard term for multi-tenancy in platform engineering. Foundation provides alias support (`organizationId` maps to `tenantId`) during the migration period so products can adopt incrementally.
- **Alternatives considered**: `organizationId` (used by 3/5 products but less standard in multi-tenancy literature), `orgId` (abbreviation, less clear, inconsistent with full-word naming conventions).

### D13: User Identity Model
- **Decision**: Global identity — one user account per email, multiple organization memberships
- **Rationale**: Prevents duplicate accounts across organizations. A user switches orgs via their membership list, not by creating new accounts. Email uniqueness is enforced at the platform level. This matches the standard SaaS identity model (Slack, Notion, Linear all work this way). User explicitly chose this during specification clarification.
- **Alternatives considered**: Per-org accounts (creates duplicate accounts for the same person, confuses users who expect a single login), hybrid model (complex, hard to reason about, creates edge cases around email ownership).

---

## API Patterns

### D8: API Handler Pattern
- **Decision**: Adopt Dream Payroll's `createApiHandler()` pattern
- **Rationale**: Best pattern found across all 5 products. Used across 47 route files (117 usages) in Dream Payroll. Wraps authentication checks, input validation, error mapping, correlation ID propagation, and structured logging into a single composable handler factory. Eliminates 15-25 lines of boilerplate per route. Products adopt by importing `createApiHandler` from `@dream/api-handlers` and passing their route-specific config.
- **Alternatives considered**: Dream Team's middleware chain (requires more manual composition and ordering — easier to misconfigure), raw try-catch blocks (no abstraction, the current approach in Dream Books and HireWise — leads to inconsistent error handling and missing correlation IDs).

### D9: Error Response Format
- **Decision**: `{ success: boolean, error?: { code, message, userMessage, requestId } }` with PlatformError class hierarchy
- **Rationale**: Follows Stripe's typed error hierarchy pattern. `userMessage` separates developer-facing details (stack traces, internal context) from user-safe text that can be shown directly in the UI. Namespaced codes (`auth/token-expired`, `validation/invalid-email`) enable programmatic error handling without parsing message strings. Class hierarchy (PlatformError > AuthenticationError, ValidationError, etc.) enables `instanceof` checks in catch blocks.
- **Alternatives considered**: Supabase `{ data, error }` tuples (rejected — fights exception conventions in the Python and Java SDKs, forces every call site to check for errors manually), Firebase single-class with code strings (no type narrowing, can't catch specific error types).

---

## Audit & Observability

### D12: Audit Event Delivery
- **Decision**: Asynchronous with guaranteed delivery via durable buffer
- **Rationale**: Synchronous audit logging blocks API responses and adds latency to every request. Async without guarantees risks losing audit events on process crash — unacceptable for compliance. A durable buffer (write audit event to a persistent queue before acknowledging the API response) ensures no event loss while keeping API response times fast. The buffer can be backed by the database initially and migrated to a dedicated queue (SQS, Redis Streams) as volume grows. User explicitly chose this during specification clarification.
- **Alternatives considered**: Synchronous audit logging (blocks every API response, adds 5-15ms latency per request), fire-and-forget async (loses events on crash — a compliance violation for HR and financial data).

---

## Frontend Architecture

### D15: React Context Strategy
- **Decision**: Separate providers for auth and tenant, composable via wrapping
- **Rationale**: Auth and tenant are orthogonal concerns (Constitution Principle VIII — single responsibility). A product could use `@dream/auth` without `@dream/multi-tenant` if it operates in single-tenant mode. Separate providers avoid the god-context anti-pattern where a single provider re-renders everything on any state change. Products compose by nesting: `<AuthProvider><TenantProvider>...</TenantProvider></AuthProvider>`.
- **Alternatives considered**: Single unified provider (violates single responsibility, creates unnecessary coupling between auth and tenancy, causes excessive re-renders), prop-drilling (eliminated by React hooks — `useAuth()` and `useTenant()` provide clean access without passing props through intermediate components).
