# Shared Platform Foundation: Product-by-Product Technical Analysis

**Date**: 2026-02-07
**Scope**: Deep technical audit of 5 products to inform shared platform SDK design
**Method**: Static analysis of each codebase covering authentication, RBAC, multi-tenancy, API patterns, and error handling

---

## 1. Overview: All Products at a Glance

| Dimension | Dream Team | Dream Payroll | Dream Books | Dream Learn | HireWise |
|-----------|-----------|--------------|-------------|-------------|----------|
| **Framework** | Next.js 14.2 | Next.js 14 | Next.js 14 | Next.js 15.5 | Next.js 16.0 |
| **React** | 18.2 | 18.x | 18.x | 18.3 | 19.2 |
| **ORM** | Prisma 5.22 | Drizzle | Drizzle | Drizzle | Prisma 6.19 |
| **Auth** | NextAuth v5-beta.30 | NextAuth v5 | NextAuth v5 | NextAuth v5-beta.30 | NextAuth v5-beta.30 |
| **Auth Providers** | Credentials + Azure Entra ID | Credentials + Google + Azure | Credentials (unused) | Credentials + Azure Entra ID | Credentials only |
| **SSO** | Azure Entra ID | Azure + Google + auto-provision | None | Azure + calendar sync | None |
| **RBAC Maturity** | High | High | None | Highest | Low |
| **Roles** | 4 static | 5 static + dynamic custom | 0 | 4 hierarchical + multi-role | 6 hardcoded strings |
| **Permission Model** | resource:action + wildcards | resource:action + DB-backed | None | hierarchy + slug-based | inline string comparison |
| **Multi-Tenancy** | Full (session > subdomain > header) | Session-based + status checks | Broken (hardcoded) | Broken (hardcoded) | None (single-tenant) |
| **API Handler Pattern** | Manual per-route | `createApiHandler()` (centralized) | Manual per-route | Manual per-route | Manual per-route |
| **Structured Logging** | Yes | Yes (with correlation IDs) | No | Partial | No |
| **Audit Logging** | Partial | Via RBAC | None | Schema exists | None |
| **Source Files** | ~846 | ~400 | ~300 | ~500 | ~600 |
| **API Route Dirs** | 66 | 47 | 42 | ~40 | ~100 |

### Maturity Radar

```
                  Auth    RBAC    Multi-Tenancy    API Patterns    Logging
Dream Team:       ████    ████    █████            ██              ███
Dream Payroll:    █████   █████   ████             █████           █████
Dream Books:      █       ░░░░    ░░░░░            ██              ░░░░░
Dream Learn:      ████    █████   ░░░░░            ███             ██
HireWise:         ██      █░░░    ░░░░░            █░░░            ░░░░░
```

---

## 2. Product Deep Dives

---

### 2.1 Dream Team

**Path**: `/Users/daniel/products/dream-team`
**Stack**: Next.js 14.2, React 18.2, Prisma 5.22, NextAuth v5-beta.30, TanStack Query v5, Tailwind + shadcn/ui

#### Authentication

- **Providers**: Credentials (email/password) + Azure Entra ID SSO
- **JWT TTL**: 8 hours
- **Account lockout**: 5 failed attempts / 15-minute window
- **2FA**: Endpoints exist for TOTP setup and verification
- Session stores `tenantId`, `roleId`, `employeeId` in JWT

#### RBAC

4 roles: Employee, Manager, HR Admin, Super Admin. Uses a `resource:action` permission model with wildcard matching and AND/OR combinators.

**Code Pattern** (from `src/middleware/require-permission.ts`):
```typescript
// AND logic: ALL permissions required
export function withPermission(
  permission: string,
  handler: PermissionHandler,
): PermissionHandler {
  const middleware = requirePermission(permission);
  return (request: NextRequest) => middleware(request, handler);
}

// OR logic: ANY permission sufficient
export function withAnyPermission(
  permissions: string[],
  handler: PermissionHandler,
): PermissionHandler {
  const middleware = requireAnyPermission(...permissions);
  return (request: NextRequest) => middleware(request, handler);
}
```

The `checkAccess(userContext, permission, { audit })` function provides centralized access decisions with optional audit logging.

#### Multi-Tenancy

**Most mature implementation.** Three-layer extraction with priority ordering:

**Code Pattern** (from `src/middleware/tenant-context.ts`):
```typescript
// Priority: session > subdomain > header
export async function extractTenantId(
  request: NextRequest,
  session?: TenantSession | null,
): Promise<string | null> {
  // Priority 1: Session (most authoritative)
  const sessionTenantId = getTenantFromSession(session || null);
  if (sessionTenantId) return sessionTenantId;

  // Priority 2: Subdomain (tenant.dreamteam.app)
  const subdomainTenantId = await getTenantFromSubdomain(request);
  if (subdomainTenantId) return subdomainTenantId;

  // Priority 3: Header (X-Tenant-ID for API clients)
  const headerTenantId = getTenantFromHeader(request);
  if (headerTenantId) return headerTenantId;

  return null;
}
```

Also validates tenant exists and is active, returns proper error codes (`TENANT_CONTEXT_REQUIRED`, `TENANT_NOT_FOUND`, `TENANT_INACTIVE`).

**Issue**: Despite this sophisticated middleware, a `DEFAULT_TENANT_ID="tenant_1"` constant exists and is used as a fallback in some routes, undermining the multi-tenant architecture.

#### API Patterns

No centralized handler; each of the 66 API route directories has manually written boilerplate for auth checks, error handling, and response formatting. Boilerplate is duplicated extensively. 52 domain services provide good separation of concerns.

#### Strengths
- Most complete multi-tenant extraction with subdomain routing
- Well-structured permission middleware with AND/OR/HOC combinators
- Extensive service layer (52 domain services)
- Comprehensive test setup with proper middleware unit tests

#### Issues
- Hardcoded `DEFAULT_TENANT_ID` undermines multi-tenancy
- Duplicated API boilerplate across 66 route directories
- Dev fallback user in auth config

---

### 2.2 Dream Payroll

**Path**: `/Users/daniel/products/dream-payroll`
**Stack**: Next.js 14, Drizzle ORM, NextAuth v5

#### Authentication

- **Providers**: Credentials + Google OAuth + Azure Entra ID
- **SSO**: Auto-provisioning on first SSO login (creates user + associates with org)
- **Admin JWT**: Separate JWT handling for super-admin vs. tenant users
- Session stores `role`, `organizationId`, `customRoleId`

#### RBAC

5 static roles + dynamic DB-backed custom roles. **Best hybrid RBAC implementation.**

**Code Pattern** (from `src/lib/auth/rbac.ts`):
```typescript
// Static permissions per role (legacy fallback)
export const rolePermissions: Record<UserRole, string[]> = {
  hr_admin: ['employee:read', 'employee:create', 'salary:read', ...],
  payroll_admin: ['employee:read', 'salary:read', 'payroll:initiate', ...],
  finance: ['payroll:approve', 'disbursement:generate', ...],
  compliance_officer: ['compliance:generate', 'compliance:upload', ...],
  employee: ['employee:read:self', 'salary:read:self', 'payslip:read:self', ...],
};

// Dynamic permissions with static fallback
export async function hasPermissionDynamic(
  userId: string,
  role: UserRole,
  permission: string
): Promise<boolean> {
  const cached = await getUserPermissions(userId);  // Redis/memory cache
  if (cached) {
    if (cached.permissions.includes(permission)) return true;
    // Cross-format matching (legacy <-> new)
    const [module, action] = permission.split(':');
    if (cached.permissions.includes(`${module}:${action}`)) return true;
    return false;
  }
  return hasPermission(role, permission);  // Static fallback
}
```

Notable: Uses `:self` suffix for resource-scoped permissions (e.g., `employee:read:self`), which restricts employees to their own data.

#### Multi-Tenancy

Session-based with **tenant status enforcement** -- the only product that properly handles suspended/archived tenants:

```typescript
// From middleware.ts
if (token.tenantStatus === 'suspended') {
  return NextResponse.redirect(
    new URL('/auth/suspended?reason=suspended', request.url)
  );
}
if (token.tenantStatus === 'archived') {
  return NextResponse.redirect(
    new URL('/auth/suspended?reason=archived', request.url)
  );
}
```

#### API Patterns

**Best-in-class `createApiHandler()` pattern.** Used across all 47 API route files (117 total usages). Centralizes:
- Authentication check
- Role authorization
- Correlation ID generation
- Structured logging with timing
- Zod validation error formatting
- Error classification (404, 409, 400, 401, 403, 500)

**Code Pattern** (from `src/lib/api/handler.ts`):
```typescript
export function createApiHandler<T>(
  handler: ApiHandler<T>,
  options: ApiHandlerOptions = { requireAuth: true }
) {
  return async (request, { params }) => {
    const correlationId = crypto.randomUUID();
    const startTime = Date.now();

    // Auth check
    const session = await auth();
    if (options.requireAuth && !session?.user) { /* 401 */ }

    // Role check
    if (options.requiredRoles && session?.user) {
      if (!options.requiredRoles.includes(session.user.role)) { /* 403 */ }
    }

    const context = { params, user: session?.user, correlationId };
    const response = await handler(request, context);

    logger.info('API request completed', {
      method, url, correlationId, userId, duration, status
    });
    return response;
  };
}
```

**Usage is clean and declarative** (from `src/app/api/payroll/runs/[id]/lock/route.ts`):
```typescript
export const POST = createApiHandler<PayrollRun>(
  async (request, context) => {
    const { id } = validateParams(context.params, paramsSchema);
    const run = await payrollService.lockPayroll(
      id, context.user!.organizationId, context.user!.id
    );
    return successResponse(run);
  },
  { requireAuth: true, requiredRoles: ['finance', 'payroll_admin', 'hr_admin'] }
);
```

#### Strengths
- **Best API handler pattern** -- should be adopted as the SDK standard
- Hybrid static + dynamic RBAC with permission caching
- Tenant status enforcement (suspended/archived)
- Structured logging with correlation IDs across all routes
- Organization-scoped data access (`requireOrganizationAccess`)
- Employee self-service scoping (`:self` permissions)

#### Issues
- Hardcoded protected routes list in middleware (brittle)
- Invitation email sending marked as TODO
- No subdomain-based tenancy (session-only)

---

### 2.3 Dream Books

**Path**: `/Users/daniel/products/dream-books`
**Stack**: Next.js 14, Drizzle ORM, NextAuth v5

#### Authentication

NextAuth is configured but **the session organization ID is never used in any API route**. Zero calls to `auth()` or `getServerSession()` found in the API directory.

#### RBAC

**Zero implementation.** No roles, no permissions, no authorization checks anywhere.

#### Multi-Tenancy

**Broken.** Every single API route hardcodes the same UUID:

```typescript
// Appears in 42 files with 190 total occurrences
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';
```

**Code Pattern** (from `src/app/api/invoices/route.ts`):
```typescript
// Default organization ID for now (should come from auth context)
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // ...filter parsing...
    const conditions = [eq(invoices.organizationId, DEFAULT_ORG_ID)];
    // No auth check. No session check. Completely open.
```

This means:
1. Any unauthenticated user can read/write financial data
2. All tenants see the same hardcoded org's data
3. There is no data isolation whatsoever

#### API Patterns

Raw `NextRequest`/`NextResponse` handlers with manual try-catch blocks per route. No centralized error handling. No structured logging.

#### Strengths
- Excellent domain modeling: GST calculations, multi-currency accounting, double-entry ledger, OFX import parsing, e-invoicing
- Good Zod validation schemas for business inputs
- Comprehensive financial reporting (P&L, balance sheet, trial balance, GST returns)

#### Issues
- **CRITICAL**: No authentication on any API route -- financial data is completely exposed
- **CRITICAL**: No RBAC -- any user can perform any operation
- **CRITICAL**: Broken multi-tenancy -- hardcoded org ID in 42 files (190 occurrences)
- **CRITICAL**: No audit logging on financial data mutations
- No structured logging
- No centralized error handling

**Security Assessment**: This product is **not production-ready** and poses significant compliance and data exposure risks. Every API route needs auth, RBAC, and proper tenant scoping before deployment.

---

### 2.4 Dream Learn

**Path**: `/Users/daniel/products/LMS/dream-learn`
**Stack**: Next.js 15.5, React 18.3, Drizzle ORM, NextAuth v5-beta.30

#### Authentication

- **Providers**: Credentials + Azure Entra ID with calendar integration
- **JWT TTL**: 8 hours
- **Session**: Stores array of role objects with `slug`, `hierarchyLevel`, and `activeRole`
- Role slugs embedded directly in JWT for fast access

#### RBAC

**Most sophisticated role system.** Multi-role with numeric hierarchy.

**Code Pattern** (from `lib/auth/role-utils.ts`):
```typescript
export type RoleSlug = "admin" | "manager" | "curator" | "learner";

// Hierarchy levels: admin=100, manager=75, curator=50, learner=10
export function hasMinimumRole(
  session: Session | null,
  minimumRoleSlug: RoleSlug
): boolean {
  if (!session?.user?.activeRole) return false;
  const minimumLevel = ROLE_HIERARCHY[minimumRoleSlug] || 0;
  return session.user.activeRole.hierarchyLevel >= minimumLevel;
}

// Comprehensive auth decision function
export function authorizeRequest(
  session: Session | null,
  options: {
    requireAuth?: boolean;
    requireRole?: RoleSlug;         // Minimum hierarchy
    requireAnyRole?: RoleSlug[];    // Any of these
    requireActiveRole?: RoleSlug;   // Exact active role
  }
): AuthorizationResult { ... }
```

Key features:
- **Multi-role**: Users can hold multiple roles simultaneously
- **Role switching**: Active role can be changed at runtime
- **Hierarchy-based**: `hasMinimumRole()` uses numeric levels (admin=100 > manager=75 > curator=50 > learner=10)
- **Convenience helpers**: `isAdmin()`, `isManager()`, `isCurator()`, `isLearner()`
- **Backward compatibility**: `getRoleSlug()` falls back to deprecated single-role string

Also has a dedicated **Curator Auth** module (`lib/auth/curator-auth.ts`) with:
- `withCuratorAuth()` HOC for curator-only API routes
- Fine-grained content permissions (`courses:create`, `learning_paths:publish`, etc.)
- Group-scoped access control (`verifyGroupAccess()`)

#### Multi-Tenancy

**Broken.** Same hardcoded UUID as Dream Books:
```typescript
const organizationId = '00000000-0000-0000-0000-000000000001';
```

Internal research documents flag this as a critical production blocker.

#### API Patterns

Mixed. Some routes use the `withCuratorAuth()` HOC pattern (good), most use manual session checks (inconsistent). The audit logging schema exists in the database but is not systematically populated.

#### Strengths
- **Best RBAC design** -- multi-role with hierarchy should be the model for the SDK
- Rich `authorizeRequest()` utility covering all common auth patterns
- Audit logging tables exist in schema (ready for implementation)
- Curator-specific auth module demonstrates domain-specific auth layering
- Smart DB initialization (local SQLite vs production PostgreSQL)

#### Issues
- Hardcoded demo org ID breaks multi-tenancy
- 740-line `auth.ts` file with try-catch schema migration hacks
- Dual schema support (legacy + new) creates confusion
- Audit tables exist but are not consistently populated

---

### 2.5 HireWise

**Path**: `/Users/daniel/products/HireWise`
**Stack**: Next.js 16.0, React 19.2, Prisma 6.19, NextAuth v5-beta.30

#### Authentication

- **Providers**: Credentials only (no SSO)
- **Session TTL**: 30 days (unusually long for a hiring platform)
- **Edge split**: Auth config split across `auth.ts` and `auth.config.ts` for Edge Runtime compatibility

#### RBAC

6 hardcoded role strings duplicated across 3 files:

```typescript
// Defined IDENTICALLY in 3 separate files:
// src/lib/auth.ts, src/lib/auth.config.ts, src/middleware.ts
type Role = "ADMIN" | "TECHNICAL_EXPERT" | "RECRUITER"
           | "INTERVIEWER" | "CANDIDATE" | "PROCTOR_REVIEWER";
```

Authorization is done via inline string comparisons scattered across 104 files (184 occurrences):

```typescript
// From src/app/api/invitations/[id]/route.ts
if (!session || session.user.role !== Role.ADMIN) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}

// From src/app/api/tests/[id]/pool/route.ts
if (
  session.user.role !== "ADMIN" &&
  session.user.role !== "TECHNICAL_EXPERT" &&
  session.user.role !== "RECRUITER"
) { /* 403 */ }
```

No hierarchy, no permission model, no centralized check function. Every route contains its own bespoke authorization logic.

#### Multi-Tenancy

**None.** Single-tenant architecture. No organization/tenant concept in the data model.

#### API Patterns

Raw `NextRequest`/`NextResponse` handlers. Each of the ~100 route files contains:
1. Manual `await auth()` call
2. Manual `session.user.role` string comparison
3. Manual try-catch with inconsistent error shapes
4. No correlation IDs, no structured logging

#### Strengths
- Lean, focused codebase
- Advanced ML/AI features (HuggingFace, TensorFlow.js, MediaPipe for proctoring)
- Latest framework versions (Next.js 16, React 19, Prisma 6)
- Edge Runtime compatibility via split auth config

#### Issues
- Role type duplicated in 3 files (will drift)
- 184 inline `session.user.role` checks across 104 files
- No centralized authorization utility
- 30-day session TTL (security concern for hiring data)
- No audit logging (concerning for hiring decisions)
- Hardcoded email branding (no tenant customization)
- No SSO support

---

## 3. Findings Summary

### 3.1 Critical Issues (Must Fix Before Production)

| # | Product | Issue | Impact | Effort |
|---|---------|-------|--------|--------|
| C1 | Dream Books | Zero auth on all API routes | Financial data fully exposed | High |
| C2 | Dream Books | Zero RBAC | Any user can perform any operation | High |
| C3 | Dream Books | Hardcoded org ID (190 occurrences, 42 files) | No data isolation between tenants | High |
| C4 | Dream Books | No audit logging on financial mutations | Compliance violation | Medium |
| C5 | Dream Learn | Hardcoded org ID | Multi-tenancy broken | Medium |
| C6 | HireWise | 30-day session TTL | Session hijack window for hiring data | Low |
| C7 | Dream Team | DEFAULT_TENANT_ID fallback | Tenant isolation bypass possible | Low |

### 3.2 High-Priority Improvements

| # | Scope | Issue | Products Affected |
|---|-------|-------|-------------------|
| H1 | All | No centralized API handler | Dream Team, Dream Books, Dream Learn, HireWise (4/5) |
| H2 | All | Duplicated auth boilerplate | All 5 products |
| H3 | All | Inconsistent error response shapes | All 5 products |
| H4 | All | No shared RBAC model | All 5 (each reinvents permissions differently) |
| H5 | HireWise | Role type duplicated in 3 files | HireWise |
| H6 | HireWise | 184 inline role checks across 104 files | HireWise |
| H7 | All | No shared structured logging | Dream Books, HireWise (missing entirely) |
| H8 | All | No shared audit logging | Dream Books, HireWise, Dream Team (partial) |

### 3.3 Best Practices to Adopt in the SDK

| Pattern | Source Product | Why It Should Be Standard |
|---------|---------------|--------------------------|
| `createApiHandler()` | Dream Payroll | Eliminates all API boilerplate; auth, roles, logging, errors in one wrapper |
| Correlation IDs | Dream Payroll | Enables distributed tracing; every request gets `crypto.randomUUID()` |
| Multi-layer tenant extraction | Dream Team | Session > subdomain > header priority gives maximum flexibility |
| Tenant status enforcement | Dream Payroll | Properly handles suspended/archived tenants with user-facing redirects |
| Hybrid RBAC (static + dynamic) | Dream Payroll | Static roles for simplicity; DB-backed custom roles for flexibility |
| Numeric role hierarchy | Dream Learn | `hasMinimumRole()` with levels (100, 75, 50, 10) is elegant and extensible |
| Multi-role with switching | Dream Learn | Users holding multiple roles with explicit active role selection |
| `:self` scoped permissions | Dream Payroll | `employee:read:self` vs `employee:read` for resource-level scoping |
| `withPermission()` HOC | Dream Team | Clean higher-order function wrapping for route handlers |
| `authorizeRequest()` | Dream Learn | Single function handling all auth patterns (auth, role, hierarchy, any-role) |
| Zod schema validation | All products | Consistent use of Zod for input validation across all products |
| Typed error classes | Dream Learn | `AuthenticationError`, `AuthorizationError` for catch-based routing |

---

## 4. Cross-Product Code Duplication Analysis

### 4.1 Duplicated Auth Boilerplate

Every product reimplements the same authentication check pattern. Here is the boilerplate duplicated per route:

```typescript
// This pattern (or close variant) appears in EVERY API route across ALL products:
const session = await auth();
if (!session?.user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

| Product | Routes with auth boilerplate | ~Lines per route | Total duplicated lines |
|---------|----------------------------|------------------|----------------------|
| Dream Team | 66 routes | ~8 lines | ~528 lines |
| Dream Payroll | 0 (uses `createApiHandler`) | 0 | 0 |
| Dream Books | 0 (no auth at all) | 0 | 0 |
| Dream Learn | ~40 routes | ~8 lines | ~320 lines |
| HireWise | ~100 routes | ~10 lines | ~1,000 lines |
| **Total** | | | **~1,848 lines** |

### 4.2 Duplicated RBAC Checks

| Product | Files with role checks | ~Lines per check | Total duplicated lines |
|---------|----------------------|------------------|----------------------|
| Dream Team | ~20 routes | ~6 lines | ~120 lines |
| Dream Payroll | 0 (declarative via `requiredRoles`) | 0 | 0 |
| Dream Books | 0 (no RBAC) | 0 | 0 |
| Dream Learn | ~15 routes | ~8 lines | ~120 lines |
| HireWise | 104 files (184 checks) | ~4 lines | ~736 lines |
| **Total** | | | **~976 lines** |

### 4.3 Duplicated Error Handling

| Product | Routes with try-catch | ~Lines per handler | Total duplicated lines |
|---------|----------------------|-------------------|----------------------|
| Dream Team | 66 routes | ~15 lines | ~990 lines |
| Dream Payroll | 0 (centralized in handler) | 0 | 0 |
| Dream Books | 42 routes | ~12 lines | ~504 lines |
| Dream Learn | ~40 routes | ~12 lines | ~480 lines |
| HireWise | ~100 routes | ~12 lines | ~1,200 lines |
| **Total** | | | **~3,174 lines** |

### 4.4 Duplicated Tenant Scoping

| Product | Files with org ID references | Pattern | Total duplicated lines |
|---------|----------------------------|---------|----------------------|
| Dream Team | ~20 routes | `context.tenantId` (good) | ~40 lines |
| Dream Payroll | ~47 routes | `context.user.organizationId` (good) | ~94 lines |
| Dream Books | 42 files (190 refs) | `DEFAULT_ORG_ID` hardcoded | ~380 lines |
| Dream Learn | ~20 routes | Hardcoded + session mix | ~100 lines |
| HireWise | 0 | No tenancy | 0 |
| **Total** | | | **~614 lines** |

### 4.5 Summary: Total Duplicated Infrastructure Code

| Category | Duplicated Lines | Products Affected |
|----------|-----------------|-------------------|
| Auth boilerplate | ~1,848 | 3/5 |
| RBAC checks | ~976 | 3/5 |
| Error handling | ~3,174 | 4/5 |
| Tenant scoping | ~614 | 4/5 |
| **Grand Total** | **~6,612 lines** | **5/5** |

**Conclusion**: Approximately **6,600 lines of infrastructure code** are duplicated or inconsistently implemented across the 5 products. Dream Payroll's `createApiHandler()` pattern eliminates most of this duplication -- adopting it as the shared platform SDK standard would reduce per-product infrastructure code by an estimated 80-90%.

### 4.6 Type/Interface Duplication

Beyond line-level duplication, each product defines its own versions of the same types:

| Type | Dream Team | Dream Payroll | Dream Books | Dream Learn | HireWise |
|------|-----------|--------------|-------------|-------------|----------|
| Role type | `roleId` (FK) | `UserRole` union | None | `RoleSlug` union | `Role` string (3x) |
| Session user | `CurrentUser` | `ApiContext.user` | None | `Session.user` + roles[] | `session.user` |
| API response | Ad hoc | `ApiResponse<T>` | Ad hoc | Ad hoc | Ad hoc |
| Error shape | `{ error, code }` | `{ success, error: { code, message, details } }` | `{ error }` | `{ success, error, code }` | `{ error }` |
| Permission | `string` | `string` (resource:action) | None | `RoleSlug` | Inline string |

A shared SDK providing canonical types for `User`, `Session`, `Role`, `Permission`, `ApiResponse`, and `ApiError` would eliminate this divergence entirely.

---

## 5. Recommendations for the Shared Platform SDK

Based on this analysis, the SDK should provide the following foundational modules:

1. **Auth Module**: Unified NextAuth v5 configuration with pluggable providers (Credentials, Azure, Google), configurable JWT TTL, account lockout, and session shape standardization.

2. **RBAC Module**: Combine Dream Learn's hierarchy model with Dream Payroll's hybrid static/dynamic permissions. Support multi-role, role switching, `:self` scoping, and `resource:action` format.

3. **Multi-Tenancy Module**: Adopt Dream Team's three-layer extraction (session > subdomain > header) with Dream Payroll's tenant status enforcement (active/suspended/archived).

4. **API Handler Module**: Adopt Dream Payroll's `createApiHandler()` as the standard, enhanced with correlation IDs, structured logging, Zod validation, and declarative auth/role configuration.

5. **Error Module**: Standardize on `{ success: boolean, data?: T, error?: { code, message, details? } }` response shape with typed error classes (`AuthenticationError`, `AuthorizationError`, `ValidationError`, `NotFoundError`).

6. **Audit Module**: Provide standard audit logging for all mutations with `userId`, `tenantId`, `action`, `resource`, `correlationId`, and `timestamp`.

7. **Logging Module**: Structured JSON logging with correlation IDs, request timing, user context, and configurable log levels.
