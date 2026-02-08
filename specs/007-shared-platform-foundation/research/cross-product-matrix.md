# Cross-Product Feature Comparison Matrix

**Document**: Comprehensive comparison of 5 SaaS products across all foundation dimensions
**Created**: 2026-02-07
**Source**: Codebase audit of Dream Team, Dream Payroll, Dream Books, Dream Learn, HireWise
**Purpose**: Identify alignment, divergence, gaps, and migration complexity for the Shared Platform Foundation

---

## Reading Guide

**RAG Status**:
- `GREEN` -- Production-ready, matches or exceeds foundation target
- `AMBER` -- Partial implementation, needs adjustment or enhancement
- `RED` -- Missing, broken, or critically non-compliant

**Heatmap Symbols** (Section 8):
- `[PASS]` Production-ready
- `[WARN]` Partial implementation
- `[FAIL]` Missing entirely
- `[CRIT]` Broken or critical security issue

**Foundation Target** column shows what the `@dream/*` packages will standardize across all products.

---

## 1. Technology Stack Matrix

| Dimension | Dream Team | Dream Payroll | Dream Books | Dream Learn | HireWise | Foundation Target | Notes |
|---|---|---|---|---|---|---|---|
| **Next.js Version** | 14.2 `GREEN` | 14 `GREEN` | 14 `GREEN` | 15.5 `AMBER` | 16.0 `AMBER` | 14+ compatible | Foundation targets 14+ compatibility. Products on 15/16 may use newer APIs; foundation must not break them. |
| **React Version** | 18.2 `GREEN` | 18 `GREEN` | 18 `GREEN` | 18.3 `GREEN` | 19.2 `AMBER` | 18+ compatible | HireWise on React 19 (RC2). Foundation must avoid deprecated APIs removed in React 19 (e.g., `defaultProps` for function components). |
| **ORM** | Prisma 5.22 `GREEN` | Drizzle `GREEN` | Drizzle `GREEN` | Drizzle `GREEN` | Prisma 6.19 `GREEN` | Both (dual snippets) | ADR-003: No forced ORM migration. `@dream/types` exports from both `/drizzle` and `/prisma` sub-paths. |
| **Database** | PostgreSQL `GREEN` | PostgreSQL `GREEN` | PostgreSQL `GREEN` | PostgreSQL `GREEN` | PostgreSQL `GREEN` | PostgreSQL | 100% alignment. No divergence. |
| **Auth Library** | NextAuth v5-beta.30 `GREEN` | NextAuth v5-beta `GREEN` | NextAuth v5-beta `GREEN` | NextAuth v5-beta.30 `GREEN` | NextAuth v5-beta.30 `GREEN` | NextAuth v5 | 100% alignment. Strongest unification point. `@dream/auth` wraps shared config. |
| **Testing Framework** | Vitest + Playwright `GREEN` | Vitest + Playwright `GREEN` | Vitest + Playwright `GREEN` | Vitest + Playwright `GREEN` | Playwright only `AMBER` | Vitest + Playwright | HireWise missing Vitest for unit tests. Only has E2E via Playwright. |
| **UI Framework** | Tailwind + shadcn/ui `GREEN` | Tailwind `GREEN` | Tailwind `GREEN` | Tailwind `GREEN` | Tailwind `GREEN` | Tailwind + Radix UI | All products use Tailwind. shadcn/ui (Radix primitives) is the target component library. |
| **State Management** | TanStack Query v5 `GREEN` | TanStack Query `GREEN` | React state `AMBER` | React context `AMBER` | React state `AMBER` | TanStack Query v5 | Dream Team and Payroll already use TanStack Query. Others rely on local state or context. |
| **Email Service** | Nodemailer `GREEN` | Nodemailer `GREEN` | Not configured `RED` | Resend `AMBER` | Nodemailer `GREEN` | Nodemailer + Resend (configurable) | Dream Learn uses Resend (modern API). Others use Nodemailer. Foundation supports both via provider abstraction. |
| **TypeScript Version** | 5+ `GREEN` | 5+ `GREEN` | 5+ `GREEN` | 5+ `GREEN` | 5+ `GREEN` | TypeScript 5+ | 100% alignment. |
| **Package Manager** | npm `GREEN` | npm `GREEN` | npm `GREEN` | npm `GREEN` | npm `GREEN` | npm | 100% alignment. |

### Stack Alignment Summary

| Category | Fully Aligned (5/5) | Mostly Aligned (4/5) | Divergent (3 or fewer) |
|---|---|---|---|
| **Count** | 6 dimensions | 3 dimensions | 2 dimensions |
| **Items** | Database, Auth library, TypeScript, Package manager, UI framework, Next.js (all v14+) | Testing framework, State management, Email | ORM (Prisma vs Drizzle split) |

---

## 2. Authentication Matrix

| Dimension | Dream Team | Dream Payroll | Dream Books | Dream Learn | HireWise | Foundation Target | Notes |
|---|---|---|---|---|---|---|---|
| **Credentials Provider** | Yes `GREEN` | Yes `GREEN` | Yes (configured) `AMBER` | Yes `GREEN` | Yes `GREEN` | Yes (default) | Dream Books has it configured but auth is never checked on routes. |
| **Google OAuth** | No `AMBER` | Yes `GREEN` | Yes (configured) `AMBER` | No `AMBER` | No `RED` | Configurable per product | Only Payroll and Books have Google. Foundation makes it a config toggle. |
| **Azure Entra ID** | Yes `GREEN` | Yes `GREEN` | Yes (configured) `AMBER` | Yes `GREEN` | No `RED` | Configurable per product | HireWise is the only product without any SSO. Foundation adds it as opt-in. |
| **Session Strategy** | JWT `GREEN` | JWT `GREEN` | JWT `GREEN` | JWT `GREEN` | JWT `GREEN` | JWT | 100% alignment. All use JWT strategy via NextAuth. |
| **Session Duration** | 8 hours `GREEN` | 8 hours `GREEN` | Default (~30d) `RED` | 8 hours `GREEN` | ~30 days `RED` | 8 hours (INV-006) | Books and HireWise use NextAuth defaults. This is a security invariant violation. |
| **JWT Claims** | userId, email, name, tenantId, roleId, roleName, employeeId (7 fields) `GREEN` | userId, email, tenantId, role, tenantStatus, authProvider (6 fields) `GREEN` | Minimal (userId, email) `RED` | userId, email, orgId, roleSlugs[], activeRoleSlug, name, image flag (8 fields) `AMBER` | id, email, name, role (4 fields) `AMBER` | Standardized: userId, email, name, tenantId, roles[], activeRole, permissions[] | Dream Learn stores role slugs array (smart). HireWise stores single role string. Foundation standardizes claim set. |
| **Account Lockout** | 5 attempts / 15 min `GREEN` | No `RED` | No `RED` | No `RED` | No `RED` | 5 attempts / 15 min (INV-007) | Only Dream Team implements lockout. Foundation makes it mandatory. |
| **2FA / MFA** | Setup endpoints exist `AMBER` | No `RED` | No `RED` | No `RED` | No `RED` | TOTP + backup codes (Phase 1) | Dream Team has 2FA scaffolding but incomplete. No product has full 2FA. |
| **Token Refresh** | Implicit (NextAuth) `AMBER` | Implicit (NextAuth) `AMBER` | None `RED` | Implicit (NextAuth) `AMBER` | Implicit (NextAuth) `AMBER` | Silent refresh with re-validation | All rely on NextAuth's implicit refresh. Foundation adds explicit silent refresh with server re-validation. |
| **SSO Auto-Provisioning** | JIT with MS Graph avatar `GREEN` | JIT with authProvider tracking `GREEN` | No `RED` | JIT with MS Graph + Calendar scope `GREEN` | No `RED` | JIT provisioning with configurable attribute mapping | Dream Team, Payroll, and Learn all do JIT. Books and HireWise have no SSO. |
| **Password Requirements** | bcrypt hashing `AMBER` | bcrypt (optional -- SSO users skip) `AMBER` | bcrypt `AMBER` | bcrypt `AMBER` | bcrypt `AMBER` | bcrypt (cost >= 10) + complexity rules (INV-007) | All use bcrypt but none enforce complexity rules (uppercase, lowercase, number, special char). Foundation adds validation. |
| **Password-Optional (SSO)** | No (password always required) `AMBER` | Yes `GREEN` | N/A (auth unused) `RED` | No `AMBER` | N/A (no SSO) `RED` | Yes (SSO users skip password) | Only Payroll correctly handles passwordless SSO users. Foundation adopts this pattern. |
| **Edge Middleware Auth** | Yes (middleware.ts) `GREEN` | Yes (protected routes list) `GREEN` | No `RED` | Partial `AMBER` | Yes (role-based routing) `GREEN` | Configurable route protection | Dream Payroll hardcodes protected routes in middleware (maintenance burden). Foundation uses pattern matching. |
| **Dev Fallback User** | Yes (DEFAULT_TENANT_ID) `RED` | No `GREEN` | N/A `RED` | Hardcoded demo org `RED` | No `GREEN` | Explicit env flag only, disabled in production | Dream Team and Dream Learn have unsafe dev fallbacks. Must be gated behind `NODE_ENV === 'development'` AND explicit env flag. |
| **Separate Admin Auth** | No `GREEN` | Yes (admin-session cookie) `AMBER` | No `GREEN` | No `GREEN` | No `GREEN` | Single auth system with admin role | Payroll's separate admin JWT creates complexity. Foundation uses role-based admin access within one auth system. |

### Authentication Readiness Score

| Product | GREEN | AMBER | RED | Readiness |
|---|---|---|---|---|
| Dream Team | 7 | 4 | 3 | 50% ready |
| Dream Payroll | 7 | 3 | 4 | 50% ready |
| Dream Books | 1 | 2 | 11 | 7% ready |
| Dream Learn | 4 | 4 | 6 | 29% ready |
| HireWise | 3 | 3 | 8 | 21% ready |

---

## 3. Authorization / RBAC Matrix

| Dimension | Dream Team | Dream Payroll | Dream Books | Dream Learn | HireWise | Foundation Target | Notes |
|---|---|---|---|---|---|---|---|
| **Number of Roles** | 4 `GREEN` | 5 static + custom `GREEN` | 0 `RED` | 4 built-in + custom `GREEN` | 6 `AMBER` | 5 default + extensible via `defineCustomRoles()` | Foundation provides super_admin, admin, manager, user, guest. Products extend. |
| **Role Names** | Employee, Manager, HR Admin, Super Admin `GREEN` | hr_admin, payroll_admin, finance, compliance_officer, employee `GREEN` | None `RED` | admin, manager, curator, learner `GREEN` | ADMIN, CANDIDATE, TECHNICAL_EXPERT, RECRUITER, INTERVIEWER, PROCTOR_REVIEWER `AMBER` | super_admin, admin, manager, user, guest + product-specific | HireWise uses SCREAMING_CASE strings. Foundation uses snake_case slugs. |
| **Permission Format** | `resource:action` `GREEN` | `resource:action` with scoping (e.g., `employee:read:self`) `GREEN` | None `RED` | Hierarchy-based (hasMinimumRole) `AMBER` | Raw role string comparison `RED` | `resource:action` with wildcards (ADR-004) | Dream Learn uses hierarchy checks, not explicit permissions. Foundation supports both via `requirePermission()` + `requireMinimumRole()`. |
| **Wildcard Support** | Yes (`users:*`, `*`) `GREEN` | Yes (`employee:read` matches `employee:read:self`) `GREEN` | N/A `RED` | No (hierarchy only) `RED` | No `RED` | Full: exact, action wildcard (`users:*`), global wildcard (`*`), scope extension | Only Dream Team and Payroll support wildcards. Foundation provides `matchesPermission()` with full wildcard matching. |
| **Role Hierarchy** | Implicit (Super Admin > HR Admin > Manager > Employee) `AMBER` | No formal hierarchy `RED` | None `RED` | Explicit numeric: admin(100) > manager(75) > curator(50) > learner(10) `GREEN` | No `RED` | Numeric levels: super_admin(0), admin(10), manager(20), user(30), guest(40) | Only Dream Learn has explicit hierarchy. Foundation adopts lower-number = higher-privilege convention (ADR-005). |
| **Middleware Pattern** | `withPermission()`, `withPermissions()` (AND), `withAnyPermission()` (OR) `GREEN` | `requirePermission()`, `requireRole()`, `requireOrganizationAccess()`, `requireEmployeeAccess()` `GREEN` | None `RED` | `withCuratorAuth()`, `authorizeRequest()` `GREEN` | Inline `if (role !== "ADMIN")` checks `RED` | `requirePermission()`, `requireAnyPermission()`, `requireAllPermissions()`, `requireMinimumRole()` | HireWise has zero abstraction -- raw string checks in every route handler. |
| **React Hooks/Gates** | None found `RED` | None found `RED` | None `RED` | `hasRole()`, `hasMinimumRole()`, `canAccessFeature()` (server-side utils) `AMBER` | None `RED` | `usePermission()`, `useRole()`, `PermissionGate`, `RoleGate`, `AdminGate` | No product has React-level permission gates. Dream Learn has server-side utils that could be adapted. Foundation adds full React integration. |
| **Custom Roles** | No (4 fixed roles) `AMBER` | Yes (`customRoles` DB table) `GREEN` | N/A `RED` | Partial (dual schema migration) `AMBER` | No (6 fixed Prisma enum) `RED` | Yes, via `defineCustomRoles()` + DB-backed `roles` table | Only Payroll has true custom role support. Dream Learn is migrating to DB roles. Foundation provides DB schema for both ORMs. |
| **DB-Backed Roles** | JSON permission array in Role model `GREEN` | Static map + `customRoles` table `GREEN` | N/A `RED` | `roles` table (being migrated to) `AMBER` | Prisma enum (hardcoded) `RED` | `roles` + `permissions` + `role_assignments` tables | HireWise's Prisma enum requires schema migration to adopt DB-backed roles. |
| **Audit Logging (RBAC)** | Not on role changes `RED` | Not on role changes `RED` | N/A `RED` | `roleAuditLog` table defined `GREEN` | None `RED` | Mandatory audit events on role/permission changes (INV-005) | Only Dream Learn has audit log infrastructure for role changes. Foundation makes it mandatory. |
| **Permission Constants** | Inline strings `AMBER` | Inline strings `AMBER` | N/A `RED` | Error codes as constants `GREEN` | Inline strings `RED` | Typed `PERMISSIONS` object with autocomplete | No product has a typed permission constants object. Dream Learn has error code constants (closest pattern). |
| **Super Admin Concept** | Super Admin role `GREEN` | No explicit super admin `AMBER` | N/A `RED` | Admin is highest `AMBER` | ADMIN is highest `AMBER` | `super_admin` (level 0) -- cross-tenant access with audit | Only Dream Team has an explicit Super Admin. Foundation adds it as the cross-tenant administrative role. |

### RBAC Readiness Score

| Product | GREEN | AMBER | RED | Readiness |
|---|---|---|---|---|
| Dream Team | 5 | 4 | 3 | 42% ready |
| Dream Payroll | 5 | 3 | 4 | 42% ready |
| Dream Books | 0 | 0 | 12 | 0% ready |
| Dream Learn | 4 | 3 | 5 | 33% ready |
| HireWise | 0 | 2 | 10 | 0% ready |

---

## 4. Multi-Tenancy Matrix

| Dimension | Dream Team | Dream Payroll | Dream Books | Dream Learn | HireWise | Foundation Target | Notes |
|---|---|---|---|---|---|---|---|
| **Tenancy Mode** | Full multi-tenant `GREEN` | Multi-tenant (session-based) `GREEN` | BROKEN multi-tenant `RED` | Hardcoded single-tenant `RED` | Single-tenant (by design) `AMBER` | Configurable: `multi` or `single` mode | Books has multi-tenant schema but hardcoded org ID. Learn has org concept but hardcoded demo ID. HireWise is legitimately single-tenant. |
| **Tenant ID Field Name** | `tenantId` `GREEN` | `organizationId` `AMBER` | `organizationId` `AMBER` | `organizationId` `AMBER` | N/A `RED` | `tenantId` (standardized) | Naming inconsistency: Dream Team uses `tenantId`, others use `organizationId`. Foundation standardizes to `tenantId` with alias support for migration. |
| **Extraction: Session/JWT** | Yes `GREEN` | Yes `GREEN` | Present in session but NEVER used `RED` | Present in JWT but overridden by hardcoded ID `RED` | N/A `RED` | Primary source | Books has tenantId in session but all queries use hardcoded `DEFAULT_ORG_ID`. |
| **Extraction: Subdomain** | Yes (`acme.dreamteam.app`) `GREEN` | No `AMBER` | No `RED` | No `RED` | N/A `RED` | Configurable per product | Only Dream Team uses subdomain routing. Foundation makes it opt-in with reserved subdomain list. |
| **Extraction: Header** | Yes (`X-Tenant-ID`) `GREEN` | No `AMBER` | No `RED` | No `RED` | N/A `RED` | `X-Tenant-ID` header for API clients | Only Dream Team supports header-based extraction. Foundation adds it for programmatic API access. |
| **Extraction: Query Param** | No `AMBER` | No `AMBER` | No `RED` | No `RED` | N/A `RED` | `?tenantId=xxx` for debug/test only | No product supports query param extraction. Foundation adds it gated to development mode only. |
| **Tenant Status Lifecycle** | Active only `AMBER` | Active/Suspended/Archived `GREEN` | None `RED` | None `RED` | N/A `RED` | Active/Suspended/Archived with enforcement | Only Payroll has tenant status management. Redirects to suspension page when org is suspended. Foundation adopts this pattern. |
| **Data Isolation (Queries)** | All Prisma queries include `tenantId` WHERE `GREEN` | All Drizzle queries filter by `organizationId` `GREEN` | Hardcoded `DEFAULT_ORG_ID` on ALL queries `RED` | No tenant filtering in API routes `RED` | N/A (single-tenant) `AMBER` | `withTenant()` HOF injects tenant scope automatically | Dream Books and Dream Learn both have the schema for multi-tenancy but bypass it at the application layer. |
| **Hardcoded Tenant IDs** | `DEFAULT_TENANT_ID = "tenant_1"` (dev fallback) `AMBER` | None `GREEN` | `DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001'` `RED` | `'00000000-0000-0000-0000-000000000001'` in auth.ts `RED` | None `GREEN` | Zero hardcoded IDs. Environment variables only. | Three products have hardcoded tenant IDs. This is a Phase 0 critical fix. |
| **Custom Domains** | Reserved subdomain list (www, api, admin, auth, mail, cdn, static) `GREEN` | N/A `AMBER` | N/A `RED` | N/A `RED` | N/A `RED` | Reserved subdomains + custom domain mapping (Phase 3) | Only Dream Team has subdomain infrastructure. Foundation extends it with custom domain support in later phases. |
| **Cross-Tenant Access** | Dev fallback only `RED` | No `RED` | N/A (all data is one tenant) `RED` | No `RED` | N/A `RED` | Super admin with explicit audit logging | No product has proper cross-tenant access for administrative purposes. Foundation adds it with mandatory audit trail. |
| **Tenant Onboarding** | Manual / seed data `AMBER` | API-driven `GREEN` | N/A `RED` | N/A `RED` | N/A `RED` | Self-service + API-driven tenant provisioning | Only Payroll has structured tenant provisioning. Foundation adds self-service signup flow. |

### Multi-Tenancy Readiness Score

| Product | GREEN | AMBER | RED | Readiness |
|---|---|---|---|---|
| Dream Team | 7 | 3 | 2 | 58% ready |
| Dream Payroll | 5 | 4 | 3 | 42% ready |
| Dream Books | 0 | 1 | 11 | 0% ready |
| Dream Learn | 0 | 1 | 11 | 0% ready |
| HireWise | 2 | 3 | 7 | 17% ready |

---

## 5. API Patterns Matrix

| Dimension | Dream Team | Dream Payroll | Dream Books | Dream Learn | HireWise | Foundation Target | Notes |
|---|---|---|---|---|---|---|---|
| **Handler Pattern** | Custom middleware HOFs (`withPermission`, `withTenant`) `GREEN` | `createApiHandler()` with built-in auth, validation, error mapping `GREEN` | Raw `try { } catch { }` in every route `RED` | Mixed: some HOFs (`withCuratorAuth`), some raw `AMBER` | Inline auth checks, no abstraction `RED` | `createApiHandler()` (from Payroll, ADR-006) | Payroll's pattern is the gold standard. Eliminates 15-25 lines of boilerplate per route. |
| **Error Response Format** | `{ error, details }` (inconsistent) `AMBER` | `{ success, error, code }` `GREEN` | `{ error: "..." }` (raw string) `RED` | `{ success, error, code }` (some routes) `AMBER` | `{ error: "..." }` (raw string) `RED` | `{ success, error: { code, message, userMessage, requestId } }` | Only Payroll has consistent structured errors. Foundation standardizes via `PlatformError` hierarchy. |
| **Error Codes** | Some routes have codes, others do not `AMBER` | Consistent namespaced codes `GREEN` | None `RED` | Role error codes as constants `GREEN` | None `RED` | Namespaced: `auth/token-expired`, `rbac/permission-denied`, `tenant/not-found` | Dream Learn's constant-based error codes are a good pattern. Foundation extends it to all modules. |
| **Validation** | Zod schemas (some routes) `GREEN` | Zod schemas via handler options `GREEN` | Manual/ad-hoc `RED` | Zod (some routes) `AMBER` | Manual checks `RED` | Zod schemas in `createApiHandler()` options | Dream Team and Payroll use Zod. Books and HireWise do manual validation. Foundation standardizes on Zod. |
| **Pagination Style** | `offset/limit` `GREEN` | `limit/offset` `GREEN` | `page/limit` (partial) `AMBER` | Not found `RED` | Not found `RED` | Page-based (standard) + cursor-based (events/logs) | Inconsistent pagination across products. Foundation provides both `PaginatedResponse<T>` and `CursorPaginatedResponse<T>`. |
| **Pagination Defaults** | Yes (default limit) `GREEN` | Yes (default limit) `GREEN` | No defaults `RED` | N/A `RED` | N/A `RED` | Default: page=1, pageSize=20, maxPageSize=100 | Books has no pagination defaults -- risk of loading entire datasets. Foundation enforces max page size. |
| **Response Shape (Success)** | `{ data, pagination? }` (some routes) `AMBER` | `{ success: true, data, pagination? }` `GREEN` | Varies per route `RED` | `{ success: true, data }` (some routes) `AMBER` | Varies per route `RED` | `{ success: true, data: T, pagination?: Pagination }` | Only Payroll has a consistent success response shape. Foundation standardizes it via `createApiHandler()`. |
| **Correlation / Request IDs** | No `RED` | Yes (structured logging) `GREEN` | No `RED` | No `RED` | No `RED` | Mandatory `X-Request-ID` header on all responses | Only Payroll has correlation IDs. Foundation generates them in `createApiHandler()` and propagates through the request lifecycle. |
| **Structured Logging** | Partial `AMBER` | Yes (with correlation IDs) `GREEN` | `console.error` only `RED` | Partial `AMBER` | None `RED` | Structured JSON logging with correlation IDs | Only Payroll has production-grade structured logging. Foundation provides a logging utility integrated with the handler. |
| **Rate Limiting** | Middleware exists `GREEN` | No `RED` | No `RED` | No `RED` | No `RED` | Token bucket per tenant, configurable per endpoint | Only Dream Team has rate limiting middleware. Foundation provides configurable rate limiting. |
| **API Versioning** | No `RED` | No `RED` | No `RED` | No `RED` | No `RED` | URL path versioning (`/api/v1/...`) in Phase 3 | No product has API versioning. Foundation adds it in later phases. |
| **Idempotency Keys** | No `RED` | No `RED` | No `RED` | No `RED` | No `RED` | `Idempotency-Key` header for POST/PUT (Stripe pattern) | No product supports idempotency. Foundation adds it for mutation endpoints. |

### API Patterns Readiness Score

| Product | GREEN | AMBER | RED | Readiness |
|---|---|---|---|---|
| Dream Team | 4 | 4 | 4 | 33% ready |
| Dream Payroll | 8 | 0 | 4 | 67% ready |
| Dream Books | 0 | 2 | 10 | 0% ready |
| Dream Learn | 1 | 4 | 7 | 8% ready |
| HireWise | 0 | 0 | 12 | 0% ready |

---

## 6. Security Matrix

| Dimension | Dream Team | Dream Payroll | Dream Books | Dream Learn | HireWise | Foundation Target | Notes |
|---|---|---|---|---|---|---|---|
| **JWT Signature Verification** | NextAuth handles `GREEN` | NextAuth handles `GREEN` | NextAuth handles (but auth unused) `RED` | NextAuth handles `GREEN` | NextAuth handles `GREEN` | `jose` library for all verification (INV-001) | Note: The Node.js SDK uses `jwt-decode` without signature verification -- this is a separate critical issue. Products themselves use NextAuth which verifies internally. |
| **Auth on ALL Routes** | Yes (middleware + HOFs) `GREEN` | Yes (createApiHandler) `GREEN` | NO -- zero auth on 27+ routes `RED` | Yes (most routes) `AMBER` | Yes (most routes) `AMBER` | Auth by default, opt-out for public routes (INV-002) | Dream Books is the critical violator. Any request reaches any handler without authentication. |
| **Password Hashing** | bcryptjs `GREEN` | bcryptjs `GREEN` | bcryptjs `GREEN` | bcrypt `GREEN` | bcrypt `GREEN` | bcrypt with cost factor >= 10 (INV-007) | 100% alignment on hashing algorithm. Cost factor enforcement needs verification across all products. |
| **Password Complexity** | No enforcement `RED` | No enforcement `RED` | No enforcement `RED` | No enforcement `RED` | No enforcement `RED` | Min 8 chars, upper + lower + number + special (INV-007) | No product enforces password complexity rules. Foundation adds Zod-based password validation schema. |
| **Account Lockout** | 5 attempts / 15 min `GREEN` | None `RED` | None `RED` | None `RED` | None `RED` | 5 attempts / 15 min lockout (INV-007) | Only Dream Team. Foundation makes it mandatory via `@dream/auth` lockout module. |
| **Rate Limiting** | Middleware exists `GREEN` | None `RED` | None `RED` | None `RED` | None `RED` | Per-tenant token bucket, configurable | Only Dream Team has any rate limiting infrastructure. |
| **CORS Configuration** | Next.js defaults `AMBER` | Next.js defaults `AMBER` | Next.js defaults `AMBER` | Next.js defaults `AMBER` | Next.js defaults `AMBER` | Explicit allowlist per product, no wildcard `*` in production | All products rely on Next.js defaults. Foundation provides explicit CORS configuration. |
| **CSP Headers** | Not configured `RED` | Not configured `RED` | Not configured `RED` | Not configured `RED` | Not configured `RED` | Strict CSP with nonce-based script loading | No product has Content Security Policy headers. Foundation adds them via Next.js middleware. |
| **Secrets Management** | Environment variables `AMBER` | Environment variables + fallback chain `AMBER` | Environment variables `AMBER` | Environment variables `AMBER` | Environment variables `AMBER` | Environment variables with validation on startup | All use env vars. Payroll has a JWT secret fallback chain (ADMIN_JWT_SECRET -> NEXTAUTH_SECRET) which is a minor concern. Foundation validates all required secrets on application startup. |
| **Audit Trail** | Partial (some mutations logged) `AMBER` | Partial (some mutations logged) `AMBER` | None `RED` | Tables + types defined `AMBER` | None `RED` | Mandatory audit events on all state changes (INV-005) | No product has complete audit logging. Dream Learn has the infrastructure (tables, types) but not the enforcement. Foundation makes it automatic via `createApiHandler()`. |
| **Input Sanitization** | Zod parsing `GREEN` | Zod parsing `GREEN` | None `RED` | Zod (partial) `AMBER` | None `RED` | Zod schemas mandatory on all mutation endpoints | Zod parsing provides input sanitization. Products without Zod have no input sanitization. |
| **SQL Injection Prevention** | ORM parameterized (Prisma) `GREEN` | ORM parameterized (Drizzle) `GREEN` | ORM parameterized (Drizzle) `GREEN` | Mixed: ORM + raw SQL with fallbacks `AMBER` | ORM parameterized (Prisma) `GREEN` | ORM parameterized queries only. No raw SQL. | Dream Learn has raw SQL queries (lines 120-143, 330-371 in auth.ts) for schema migration fallbacks. These must be eliminated. |
| **Session Fixation Prevention** | NextAuth handles `GREEN` | NextAuth handles `GREEN` | NextAuth handles `GREEN` | NextAuth handles `GREEN` | NextAuth handles `GREEN` | NextAuth's built-in session rotation | 100% alignment via NextAuth. |
| **Webhook Signature Verification** | Not applicable `AMBER` | Not applicable `AMBER` | Not applicable `AMBER` | Not applicable `AMBER` | Not applicable `AMBER` | HMAC-SHA256 with timestamp validation (INV-004) | No product currently receives webhooks. Foundation provides verification for when webhook consumption is added. |
| **Breached Password Detection** | None `RED` | None `RED` | None `RED` | None `RED` | None `RED` | HaveIBeenPwned k-anonymity API (Phase 5) | No product checks for breached passwords. Planned for Phase 5. |

### Security Readiness Score

| Product | GREEN | AMBER | RED | Readiness |
|---|---|---|---|---|
| Dream Team | 8 | 4 | 3 | 53% ready |
| Dream Payroll | 6 | 5 | 4 | 40% ready |
| Dream Books | 3 | 3 | 9 | 20% ready |
| Dream Learn | 4 | 6 | 5 | 27% ready |
| HireWise | 4 | 4 | 7 | 27% ready |

---

## 7. Code Quality Matrix

| Dimension | Dream Team | Dream Payroll | Dream Books | Dream Learn | HireWise | Foundation Target | Notes |
|---|---|---|---|---|---|---|---|
| **Unit Test Framework** | Vitest `GREEN` | Vitest `GREEN` | Vitest `GREEN` | Vitest `GREEN` | None `RED` | Vitest | HireWise has no unit testing framework. Only E2E via Playwright. |
| **E2E Test Framework** | Playwright `GREEN` | Playwright `GREEN` | Playwright `GREEN` | Playwright `GREEN` | Playwright `GREEN` | Playwright | 100% alignment. |
| **Test Coverage** | Good (52 services tested) `GREEN` | Good (handler tests) `GREEN` | Minimal `RED` | Moderate `AMBER` | Minimal (E2E only) `RED` | 90%+ coverage for foundation packages | Dream Team has the most comprehensive test suite. Books and HireWise need significant test additions. |
| **Mock Strategy** | MSW + custom matchers `GREEN` | Vitest mocks `GREEN` | Minimal `RED` | Vitest mocks `GREEN` | None `RED` | MSW for API mocking, Vitest mocks for unit tests | Dream Team uses MSW (Mock Service Worker) which is the industry standard for API mocking. |
| **TypeScript Strictness** | Strict mode `GREEN` | Strict mode `GREEN` | Strict mode `GREEN` | Strict mode `GREEN` | Strict mode `GREEN` | Strict mode with `noUncheckedIndexedAccess` | All products use TypeScript strict mode. Foundation adds stricter compiler options. |
| **Linting** | ESLint configured `GREEN` | ESLint configured `GREEN` | ESLint configured `GREEN` | ESLint configured `GREEN` | ESLint configured `GREEN` | ESLint + Prettier with shared config | 100% alignment on linting tooling. Foundation provides shared ESLint config. |
| **Code Organization** | 52 domain services in `lib/services/` `GREEN` | Clean separation: `lib/api/`, `lib/auth/` `GREEN` | Feature-based but flat `AMBER` | Mixed: some modules clean, auth.ts is 740 lines `AMBER` | Feature-based, relatively clean `GREEN` | Domain services + shared foundation layer | Dream Team's 52-service architecture is the model. Dream Learn's 740-line auth.ts is the anti-pattern. |
| **Source File Count** | 846 files, 66 API route dirs `GREEN` | ~200 files `GREEN` | ~100 files `GREEN` | ~300 files `GREEN` | ~150 files `GREEN` | N/A (product-specific) | Dream Team is the largest codebase. File count correlates with feature completeness. |
| **Documentation (Code)** | Moderate (JSDoc on services) `AMBER` | Good (handler docs) `GREEN` | Minimal `RED` | Moderate (role utils documented) `AMBER` | Minimal `RED` | JSDoc on all public APIs, README per package | Payroll has the best inline documentation. Books and HireWise need documentation effort. |
| **Error Handling Consistency** | Mixed (some routes return codes, others do not) `AMBER` | Consistent (createApiHandler) `GREEN` | None (raw try-catch with console.error) `RED` | Mixed (custom error classes in some places) `AMBER` | None (inline NextResponse.json) `RED` | PlatformError hierarchy with consistent JSON format | Only Payroll has consistent error handling. Foundation provides `PlatformError` for all products. |
| **Dead Code / Tech Debt** | Dev fallback user, some unused imports `AMBER` | Admin JWT fallback chain `AMBER` | Hardcoded org ID (architectural debt) `RED` | Dual schema migration hacks (740-line auth.ts) `RED` | Hardcoded email branding `AMBER` | Zero tech debt in foundation packages | Dream Learn's dual-schema try-catch is the worst tech debt across all products. |
| **Dependency Management** | Up to date `GREEN` | Up to date `GREEN` | Up to date `GREEN` | Up to date `GREEN` | Most current (Next 16, React 19) `GREEN` | Renovate/Dependabot for automated updates | HireWise is on the bleeding edge (Next 16, React 19). Others are on stable versions. |

### Code Quality Readiness Score

| Product | GREEN | AMBER | RED | Readiness |
|---|---|---|---|---|
| Dream Team | 8 | 4 | 0 | 67% ready |
| Dream Payroll | 10 | 2 | 0 | 83% ready |
| Dream Books | 4 | 2 | 6 | 33% ready |
| Dream Learn | 5 | 5 | 2 | 42% ready |
| HireWise | 5 | 2 | 5 | 42% ready |

---

## 8. Feature Completeness Heatmap

This heatmap shows which foundation capabilities each product currently has versus what it needs to adopt the `@dream/*` packages.

### Legend

```
[PASS]  Production-ready -- can adopt foundation with minimal changes
[WARN]  Partial -- exists but needs modification or enhancement
[FAIL]  Missing entirely -- must be built from scratch
[CRIT]  Broken or critical security issue -- must be fixed BEFORE adoption
```

### 8.1 Authentication Capabilities

| Capability | Dream Team | Dream Payroll | Dream Books | Dream Learn | HireWise | Foundation Provides |
|---|:---:|:---:|:---:|:---:|:---:|---|
| Credentials login | `[PASS]` | `[PASS]` | `[CRIT]` | `[PASS]` | `[PASS]` | `createAuthConfig()` with credentials provider |
| Azure Entra ID SSO | `[PASS]` | `[PASS]` | `[WARN]` | `[PASS]` | `[FAIL]` | Configurable SSO providers |
| Google OAuth | `[FAIL]` | `[PASS]` | `[WARN]` | `[FAIL]` | `[FAIL]` | Configurable OAuth providers |
| JWT with standard claims | `[PASS]` | `[PASS]` | `[CRIT]` | `[WARN]` | `[WARN]` | Standardized JWT payload type |
| 8-hour session duration | `[PASS]` | `[PASS]` | `[CRIT]` | `[PASS]` | `[CRIT]` | INV-006 enforcement |
| Account lockout | `[PASS]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | 5 attempts / 15 min lockout |
| 2FA / TOTP | `[WARN]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | TOTP + backup codes |
| SSO auto-provisioning (JIT) | `[PASS]` | `[PASS]` | `[FAIL]` | `[PASS]` | `[FAIL]` | Configurable JIT callbacks |
| Token refresh | `[WARN]` | `[WARN]` | `[FAIL]` | `[WARN]` | `[WARN]` | Silent refresh with re-validation |
| Edge middleware auth | `[PASS]` | `[PASS]` | `[FAIL]` | `[WARN]` | `[PASS]` | `createAuthMiddleware()` |
| Auth by default (opt-out public) | `[PASS]` | `[PASS]` | `[CRIT]` | `[WARN]` | `[WARN]` | Default-secure with public route list |

### 8.2 Authorization / RBAC Capabilities

| Capability | Dream Team | Dream Payroll | Dream Books | Dream Learn | HireWise | Foundation Provides |
|---|:---:|:---:|:---:|:---:|:---:|---|
| Role-based access control | `[PASS]` | `[PASS]` | `[CRIT]` | `[PASS]` | `[WARN]` | `@dream/rbac` with hierarchy |
| `resource:action` permissions | `[PASS]` | `[PASS]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `matchesPermission()` with wildcards |
| Permission middleware HOFs | `[PASS]` | `[PASS]` | `[FAIL]` | `[PASS]` | `[FAIL]` | `requirePermission()`, `requireAnyPermission()`, etc. |
| Role hierarchy | `[WARN]` | `[FAIL]` | `[FAIL]` | `[PASS]` | `[FAIL]` | Numeric levels with `requireMinimumRole()` |
| DB-backed roles | `[PASS]` | `[PASS]` | `[FAIL]` | `[WARN]` | `[FAIL]` | Drizzle + Prisma schema snippets |
| Custom role creation | `[FAIL]` | `[PASS]` | `[FAIL]` | `[WARN]` | `[FAIL]` | `defineCustomRoles()` + tenant-scoped |
| React permission gates | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `PermissionGate`, `RoleGate`, `AdminGate` |
| Permission constants (typed) | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[WARN]` | `[FAIL]` | `PERMISSIONS.USERS.READ` typed object |
| Role change audit logging | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[PASS]` | `[FAIL]` | Automatic via `createApiHandler()` |
| Super admin cross-tenant | `[WARN]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `super_admin` role with audit |

### 8.3 Multi-Tenancy Capabilities

| Capability | Dream Team | Dream Payroll | Dream Books | Dream Learn | HireWise | Foundation Provides |
|---|:---:|:---:|:---:|:---:|:---:|---|
| Tenant context in JWT | `[PASS]` | `[PASS]` | `[CRIT]` | `[CRIT]` | `[FAIL]` | Standardized `tenantId` claim |
| Session-based extraction | `[PASS]` | `[PASS]` | `[CRIT]` | `[CRIT]` | `[FAIL]` | `extractionSources: ['session']` |
| Subdomain extraction | `[PASS]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `extractionSources: ['subdomain']` |
| Header extraction | `[PASS]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `X-Tenant-ID` header support |
| Data isolation in queries | `[PASS]` | `[PASS]` | `[CRIT]` | `[CRIT]` | `[FAIL]` | `withTenant()` auto-scoping |
| Tenant status enforcement | `[FAIL]` | `[PASS]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | Active/Suspended/Archived lifecycle |
| Single-tenant mode | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[WARN]` | `mode: 'single'` with env-based tenant ID |
| No hardcoded tenant IDs | `[WARN]` | `[PASS]` | `[CRIT]` | `[CRIT]` | `[PASS]` | Environment variables only |
| Cross-tenant admin access | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | Super admin with audit trail |
| Custom domain support | `[WARN]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | Reserved subdomains + custom domain mapping |

### 8.4 API & Error Handling Capabilities

| Capability | Dream Team | Dream Payroll | Dream Books | Dream Learn | HireWise | Foundation Provides |
|---|:---:|:---:|:---:|:---:|:---:|---|
| Unified API handler | `[WARN]` | `[PASS]` | `[FAIL]` | `[WARN]` | `[FAIL]` | `createApiHandler()` |
| Structured error responses | `[WARN]` | `[PASS]` | `[FAIL]` | `[WARN]` | `[FAIL]` | `PlatformError` hierarchy |
| Namespaced error codes | `[WARN]` | `[PASS]` | `[FAIL]` | `[PASS]` | `[FAIL]` | `auth/token-expired` format |
| Zod validation integration | `[PASS]` | `[PASS]` | `[FAIL]` | `[WARN]` | `[FAIL]` | Handler-level Zod schema option |
| Pagination (standard) | `[PASS]` | `[PASS]` | `[WARN]` | `[FAIL]` | `[FAIL]` | `PaginatedResponse<T>` |
| Pagination (cursor) | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `CursorPaginatedResponse<T>` for events |
| Request/correlation IDs | `[FAIL]` | `[PASS]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | Auto-generated in handler |
| Structured logging | `[WARN]` | `[PASS]` | `[FAIL]` | `[WARN]` | `[FAIL]` | JSON logging with correlation IDs |
| Rate limiting | `[PASS]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | Token bucket per tenant |
| Idempotency keys | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `Idempotency-Key` header |

### 8.5 Security Capabilities

| Capability | Dream Team | Dream Payroll | Dream Books | Dream Learn | HireWise | Foundation Provides |
|---|:---:|:---:|:---:|:---:|:---:|---|
| Auth on every route | `[PASS]` | `[PASS]` | `[CRIT]` | `[WARN]` | `[WARN]` | Default-secure middleware |
| Password hashing (bcrypt) | `[PASS]` | `[PASS]` | `[PASS]` | `[PASS]` | `[PASS]` | bcrypt with cost >= 10 |
| Password complexity rules | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | Zod-based password schema |
| Account lockout | `[PASS]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | Automatic after 5 failures |
| Session duration enforcement | `[PASS]` | `[PASS]` | `[CRIT]` | `[PASS]` | `[CRIT]` | 8 hours max (INV-006) |
| CSRF protection | `[PASS]` | `[PASS]` | `[PASS]` | `[PASS]` | `[PASS]` | NextAuth's built-in CSRF |
| CSP headers | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | Strict CSP via middleware |
| Input sanitization (Zod) | `[PASS]` | `[PASS]` | `[FAIL]` | `[WARN]` | `[FAIL]` | Mandatory Zod on mutations |
| Audit logging | `[WARN]` | `[WARN]` | `[FAIL]` | `[WARN]` | `[FAIL]` | Automatic via handler (INV-005) |
| SQL injection prevention | `[PASS]` | `[PASS]` | `[PASS]` | `[WARN]` | `[PASS]` | ORM-only queries, no raw SQL |

### 8.6 Infrastructure Capabilities

| Capability | Dream Team | Dream Payroll | Dream Books | Dream Learn | HireWise | Foundation Provides |
|---|:---:|:---:|:---:|:---:|:---:|---|
| Shared TypeScript types | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `@dream/types` package |
| Drizzle schema snippets | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `@dream/types/drizzle` |
| Prisma schema snippets | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `@dream/types/prisma` |
| Email template system | `[WARN]` | `[WARN]` | `[FAIL]` | `[WARN]` | `[WARN]` | Configurable email provider abstraction |
| Feature flags | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | Phase 5: `@dream/feature-flags` |
| Webhook delivery | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | HMAC-SHA256 signed payloads |
| API key management | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | Scoped API keys with rotation |
| Notification system | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | Multi-channel (email, in-app, push) |
| Billing integration | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | Stripe + Razorpay (Phase 5) |
| Settings management | `[WARN]` | `[WARN]` | `[FAIL]` | `[FAIL]` | `[FAIL]` | Tenant + user settings API |

---

## 9. Composite Readiness Summary

### Overall Foundation Readiness by Product

| Product | Auth | RBAC | Multi-Tenancy | API Patterns | Security | Code Quality | **Overall** | **Migration Effort** |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| Dream Team | 50% | 42% | 58% | 33% | 53% | 67% | **50%** | LOW (2-3 sprints) |
| Dream Payroll | 50% | 42% | 42% | 67% | 40% | 83% | **54%** | MEDIUM (3-4 sprints) |
| Dream Books | 7% | 0% | 0% | 0% | 20% | 33% | **10%** | HIGH (4-5 sprints) |
| Dream Learn | 29% | 33% | 0% | 8% | 27% | 42% | **23%** | MEDIUM-HIGH (4-5 sprints) |
| HireWise | 21% | 0% | 17% | 0% | 27% | 42% | **18%** | HIGH (4-5 sprints) |

### Critical Issues Count by Product

| Severity | Dream Team | Dream Payroll | Dream Books | Dream Learn | HireWise |
|---|:---:|:---:|:---:|:---:|:---:|
| `[CRIT]` Security/Broken | 0 | 0 | **8** | **4** | **2** |
| `[FAIL]` Missing | 12 | 14 | **32** | 22 | 28 |
| `[WARN]` Partial | 15 | 8 | 4 | 16 | 10 |
| `[PASS]` Ready | 23 | 28 | 6 | 8 | 10 |

### Migration Priority Order

Based on readiness scores, critical issue count, and strategic value:

| Priority | Product | Rationale |
|---|---|---|
| **1. Dream Team** (Canary) | Highest readiness (50%), zero critical issues, closest to target architecture. Validates foundation before wider rollout. |
| **2. Dream Payroll** | Highest code quality (83%), best API patterns (67%). Source of `createApiHandler` pattern. |
| **3. HireWise** | Low readiness but simple architecture. Adding foundation is additive (no broken systems to fix). Clean slate for RBAC and tenancy. |
| **4. Dream Learn** | Medium readiness but 4 critical issues. 740-line auth.ts consolidation is complex. Dual schema debt adds risk. |
| **5. Dream Books** | Lowest readiness (10%), most critical issues (8). Must fix security first (Phase 0) before any foundation adoption. Financial data at risk. |

---

## 10. Gap Analysis: What the Foundation Must Solve

### Gaps Present in ALL 5 Products (Zero Coverage)

These capabilities exist in no product today. The foundation creates them from scratch:

| Gap | Impact | Foundation Package |
|---|---|---|
| React permission gates (`PermissionGate`, `RoleGate`) | No client-side authorization UI | `@dream/rbac` |
| Typed permission constants (`PERMISSIONS.USERS.READ`) | Developers use raw strings, no autocomplete | `@dream/rbac` |
| Cursor-based pagination (events/logs) | No efficient streaming of large datasets | `@dream/types` + `@dream/errors` |
| Idempotency keys | No protection against duplicate mutations | `@dream/errors` |
| CSP headers | No XSS mitigation via Content Security Policy | `@dream/auth` middleware |
| API versioning | No backward compatibility guarantee | `@dream/errors` handler |
| Cross-tenant admin access (with audit) | No way to administer multiple tenants securely | `@dream/multi-tenant` |
| Password complexity enforcement | No password strength validation | `@dream/auth` |
| Shared TypeScript types | Each product defines its own incompatible interfaces | `@dream/types` |
| Feature flags | No feature gating or progressive rollout | `@dream/feature-flags` (Phase 5) |
| Webhook delivery | No event push to external systems | Platform SDK webhooks module |
| API key management | No programmatic API access mechanism | Platform SDK apikeys module |
| Billing/subscription management | No monetization infrastructure | `@dream/billing` (Phase 5) |

### Gaps Present in 4 of 5 Products (Single Product Has It)

| Gap | Product That Has It | Others Missing |
|---|---|---|
| Account lockout | Dream Team | Payroll, Books, Learn, HireWise |
| Correlation/request IDs | Dream Payroll | Team, Books, Learn, HireWise |
| Rate limiting | Dream Team | Payroll, Books, Learn, HireWise |
| Tenant status lifecycle | Dream Payroll | Team, Books, Learn, HireWise |
| Custom DB-backed roles | Dream Payroll | Team, Books, Learn, HireWise |
| Role change audit logging | Dream Learn | Team, Payroll, Books, HireWise |
| Subdomain tenant routing | Dream Team | Payroll, Books, Learn, HireWise |

### Dimension Where Foundation Gains Most Leverage

| Dimension | Current Implementations | Foundation Replaces With | Lines of Code Saved (Est.) |
|---|---|---|---|
| Auth configuration | 5 separate auth.ts files (740 lines in Learn alone) | `createAuthConfig()` (~50 lines per product) | ~2,000 lines |
| API handler boilerplate | 600+ routes x 15-25 lines each | `createApiHandler()` wrapper | ~12,000 lines |
| RBAC implementation | 5 different approaches (0 to 740 lines) | `@dream/rbac` with shared middleware | ~1,500 lines |
| Error handling | 5 different formats, most ad-hoc | `PlatformError` hierarchy | ~3,000 lines |
| Type definitions | 5 separate User/Tenant/Role interfaces | `@dream/types` single source | ~1,000 lines |
| **Total estimated** | | | **~19,500 lines** |

---

## Appendix A: Naming Inconsistencies Across Products

| Concept | Dream Team | Dream Payroll | Dream Books | Dream Learn | HireWise | Foundation Standard |
|---|---|---|---|---|---|---|
| Tenant ID field | `tenantId` | `organizationId` | `organizationId` | `organizationId` | N/A | `tenantId` |
| User role field | `roleName` | `role` | N/A | `activeRoleSlug` | `role` | `activeRole` |
| Permission check fn | `hasPermission()` | `hasPermission()` + `hasPermissionDynamic()` | N/A | `hasRole()`, `hasMinimumRole()` | `role === "ADMIN"` | `matchesPermission()` |
| Auth middleware | `withPermission()` | `requirePermission()` | N/A | `withCuratorAuth()` | Inline check | `requirePermission()` |
| Tenant middleware | `withTenant()` | N/A (session-based) | N/A | N/A | N/A | `withTenant()` |
| API handler | Custom middleware chain | `createApiHandler()` | Raw try-catch | Mixed HOFs | Raw checks | `createApiHandler()` |
| Error class | None (plain objects) | None (plain objects) | None (strings) | Custom error classes | None (strings) | `PlatformError` |
| Success response | `{ data }` | `{ success, data }` | varies | `{ success, data }` | varies | `{ success, data }` |
| Role case convention | PascalCase (`Super Admin`) | snake_case (`hr_admin`) | N/A | snake_case (`admin`) | SCREAMING_CASE (`ADMIN`) | snake_case |

## Appendix B: ORM Split Details

| Aspect | Prisma Products (Dream Team, HireWise) | Drizzle Products (Payroll, Books, Learn) |
|---|---|---|
| **Count** | 2 products | 3 products |
| **Schema definition** | `schema.prisma` declarative file | TypeScript table definitions |
| **Migration strategy** | `prisma migrate dev` | `drizzle-kit push` / `generate` |
| **Type generation** | `prisma generate` creates client types | Types inferred from schema definitions |
| **Query style** | `prisma.user.findMany({ where: { tenantId } })` | `db.select().from(users).where(eq(users.tenantId, id))` |
| **Foundation support** | `@dream/types/prisma` exports model snippets | `@dream/types/drizzle` exports table definitions |
| **RBAC tables** | `@dream/rbac/prisma` Role, Permission models | `@dream/rbac/drizzle` roles, permissions tables |
| **Migration path** | No ORM change required (ADR-003) | No ORM change required (ADR-003) |

## Appendix C: Session/JWT Claim Comparison

| Claim | Dream Team | Dream Payroll | Dream Books | Dream Learn | HireWise | Foundation Standard |
|---|---|---|---|---|---|---|
| `userId` / `id` | `userId` | `userId` | `userId` | `userId` | `id` | `userId` |
| `email` | Yes | Yes | Yes | Yes | Yes | Yes |
| `name` | Yes | No | No | Yes | `name` (username) | Yes |
| `tenantId` / `orgId` | `tenantId` | `organizationId` | Minimal | `organizationId` | N/A | `tenantId` |
| `role(s)` | `roleId`, `roleName` | `role` (single) | N/A | `roleSlugs[]`, `activeRoleSlug` | `role` (single) | `roles[]`, `activeRole` |
| `permissions` | Not in JWT | Not in JWT | N/A | Not in JWT | N/A | `permissions[]` (optional, for small sets) |
| `employeeId` | Yes | N/A | N/A | N/A | N/A | Product-specific (extensible) |
| `tenantStatus` | N/A | Yes | N/A | N/A | N/A | Yes (from foundation) |
| `authProvider` | N/A | Yes (credentials/google/microsoft) | N/A | N/A | N/A | Yes (provider tracking) |
| `entraObjectId` | Yes | N/A | N/A | N/A | N/A | Product-specific (extensible) |
| `image` / `avatar` | In JWT | N/A | N/A | Excluded (HTTP 431 prevention) | N/A | Excluded from JWT (fetched separately) |
| **Total claims** | 7 | 6 | 2 | 8 | 4 | 8-10 (standardized) |
| **Size concern** | No | No | N/A | Yes (avatar excluded) | No | Avatar excluded, permissions optional |
