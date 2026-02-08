# Competitor Pattern Adoption Analysis

**Feature Branch**: `007-shared-platform-foundation`
**Created**: 2026-02-07
**Source**: Competitive research across 19 platforms in `specs/001-competitor-feature-analysis/research/`
**Purpose**: Map specific competitor patterns to architectural decisions in the Shared Platform Foundation. Every adopted pattern is traced to its source competitor, justified with rationale, and mapped to a concrete `@dream/*` package and API surface.

---

## 1. Patterns Adopted (with Rationale)

### Pattern 1: Instance-Based Client Initialization

**Source Competitor(s)**: Stripe (primary), Supabase, LaunchDarkly

**What it is**: The SDK client is instantiated as an object with explicit configuration passed at construction time. No global mutable state exists. Multiple client instances with different configurations (different tenants, environments, API keys) can coexist in the same process. Stripe migrated from a global singleton (`stripe.api_key = "..."`) to instance-based (`StripeClient("sk_...")`) in v8, calling the old pattern a mistake.

**Why we adopted it**: Global mutable state is a source of concurrency bugs, test pollution, and multi-tenant leaks. Instance-based initialization makes it structurally impossible for one client's configuration to affect another. This is especially critical in our multi-product architecture where 5 products with different tenant contexts may coexist in shared infrastructure. Stripe's public acknowledgment that their original singleton was a design error validates this decision.

**How it maps to our foundation**: `@dream/auth` exports `createAuthConfig()` which produces an isolated NextAuth v5 configuration. Each product calls `createAuthConfig()` with its own providers, lockout rules, and callback hooks. No shared global auth state exists between products.

**Code example**:
```typescript
// @dream/auth — createAuthConfig produces an isolated configuration per product
import { createAuthConfig } from '@dream/auth';

// Dream Team configuration
const dreamTeamAuth = createAuthConfig({
  providers: ['credentials', 'azure-entra'],
  azure: {
    tenantId: process.env.AZURE_AD_TENANT_ID!,
    clientId: process.env.AZURE_AD_CLIENT_ID!,
    clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
  },
  sessionMaxAge: 8 * 60 * 60, // 8 hours
  lockout: { maxAttempts: 5, durationMinutes: 15 },
  publicRoutes: ['/auth/signin', '/auth/signup', '/api/health'],
});

// HireWise configuration — different providers, same pattern
const hireWiseAuth = createAuthConfig({
  providers: ['credentials'],
  lockout: { maxAttempts: 5, durationMinutes: 15 },
  publicRoutes: ['/login', '/api/health'],
});

// No global state shared between configurations
```

**Stripe reference**: `StripeClient("sk_test_...")` in Python v8+, `new Stripe('sk_test_...', { apiVersion: '...' })` in Node.js, `StripeClient.builder().setApiKey("...").build()` in Java.

---

### Pattern 2: Typed Error Hierarchy with userMessage

**Source Competitor(s)**: Stripe (primary), Razorpay (source/step/reason triple), Firebase (namespaced codes)

**What it is**: Errors form a typed class hierarchy mapping to HTTP status codes. Each error carries a machine-readable `code` (namespaced like `auth/token-expired`), a developer-facing `message`, and critically a `userMessage` field containing text safe to display to end users. Stripe pioneered this with their `CardError`, `InvalidRequestError`, `AuthenticationError` tree. Razorpay extended it with `source`, `step`, and `reason` fields that provide debugging context. Firebase contributed the `module/error-name` namespacing convention.

**Why we adopted it**: Five products currently implement error handling in five different ways -- from Dream Payroll's structured `{success, error, code}` to Dream Books' raw `console.error` with no format. A typed hierarchy enables `catch (e) { if (e instanceof AuthorizationError) ... }` in all three SDK languages. The `userMessage` field eliminates the pervasive anti-pattern of exposing internal error details to end users. The namespaced `code` field enables programmatic error handling across products without string parsing.

**How it maps to our foundation**: `@dream/errors` exports `PlatformError` and its subclasses. `createApiHandler()` catches these and maps them to standardized JSON responses. All 5 products return identical error shapes.

**Code example**:
```typescript
// @dream/errors — PlatformError hierarchy
import { PlatformError, ValidationError, AuthorizationError } from '@dream/errors';

class PlatformError extends Error {
  status: number;          // HTTP status code
  code: string;            // Namespaced: "auth/token-expired", "rbac/permission-denied"
  message: string;         // Developer-facing: "JWT token has expired after 8 hours"
  userMessage: string;     // Safe for end-user: "Your session has expired. Please log in again."
  requestId?: string;      // For support debugging
  param?: string;          // Which parameter caused the error (validation errors)
}

// Subclasses
class ValidationError extends PlatformError { status = 400; }
class AuthenticationError extends PlatformError { status = 401; }
class AuthorizationError extends PlatformError { status = 403; }
class NotFoundError extends PlatformError { status = 404; }
class ConflictError extends PlatformError { status = 409; }
class RateLimitError extends PlatformError { status = 429; retryAfter?: number; }
class ServerError extends PlatformError { status = 500; }

// Usage in API routes via createApiHandler
export const PUT = createApiHandler(async (req, ctx) => {
  const user = await getUser(ctx.tenantId, req.params.id);
  if (!user) {
    throw new NotFoundError({
      code: 'users/not-found',
      message: `User ${req.params.id} not found in tenant ${ctx.tenantId}`,
      userMessage: 'The requested user could not be found.',
      param: 'id',
    });
  }
  // ...
});

// Standardized JSON response (all 5 products, identical format)
// {
//   "success": false,
//   "error": {
//     "code": "users/not-found",
//     "message": "User usr_xyz not found in tenant acme_corp",
//     "userMessage": "The requested user could not be found.",
//     "requestId": "req_abc123"
//   }
// }
```

**Stripe reference**: `e.user_message` (safe for end users), `e.code` (machine-readable), `e.param` (which parameter). Razorpay reference: `error.source` + `error.step` + `error.reason` triple. Firebase reference: `auth/user-not-found` namespacing.

---

### Pattern 3: `resource:action` Permission Format

**Source Competitor(s)**: Permit.io (primary), existing SDK (Dream Team, Dream Payroll)

**What it is**: Permissions are expressed as colon-delimited strings in the format `resource:action` with wildcard support. `users:read` grants read access to users. `users:*` grants all actions on users. `*` grants all permissions (super admin). Permit.io centers all authorization on the `permit.check(user, action, resource)` primitive where action and resource together form this pattern. Dream Team and Dream Payroll already use this format independently.

**Why we adopted it**: Two of our five products (Dream Team, Dream Payroll) already use this exact format. It maps naturally to Permit.io's universal `check(user, action, resource)` authorization primitive. The wildcard support (`users:*`, `*`) enables hierarchical permission delegation without complex policy engines. Strings are serializable, storable in JWT claims, and comparable across all three SDK languages. The format also extends cleanly to scoped permissions like `employee:read:self`.

**How it maps to our foundation**: `@dream/rbac` exports `matchesPermission()`, `hasAnyPermission()`, `hasAllPermissions()`, and the `PERMISSIONS` typed constant object. Middleware HOFs like `requirePermission('users:read')` wrap API routes. The `resource:action` strings are stored in the roles table and embedded in JWT claims.

**Code example**:
```typescript
// @dream/rbac — permission matching with wildcard support
import { matchesPermission, PERMISSIONS } from '@dream/rbac';

// Exact match
matchesPermission('users:read', 'users:read');           // true

// Action wildcard
matchesPermission('users:*', 'users:read');              // true
matchesPermission('users:*', 'users:write');             // true

// Global wildcard (super admin)
matchesPermission('*', 'users:read');                    // true
matchesPermission('*', 'invoices:delete');               // true

// Scoped extension
matchesPermission('employee:read', 'employee:read:self'); // true

// Typed constants with autocomplete
PERMISSIONS.USERS.READ       // "users:read"
PERMISSIONS.USERS.WRITE      // "users:write"
PERMISSIONS.USERS.WILDCARD   // "users:*"
PERMISSIONS.TEAMS.MANAGE     // "teams:manage"

// Middleware usage in API routes
import { requirePermission } from '@dream/rbac';

export const GET = createApiHandler(
  async (req, ctx) => {
    return await getEmployees(ctx.tenantId);
  },
  { requiredPermissions: ['employee:read'] }
);
```

**Permit.io reference**: `permit.check("user_123", "edit", { type: "document", tenant: "acme_corp" })`. Dream Team reference: `hasPermission(userPermissions, 'users:read')` in `lib/rbac.ts`. Dream Payroll reference: `resource:action` format with `employee:read:self` scoping.

---

### Pattern 4: Never-Throw Feature Flag Evaluation

**Source Competitor(s)**: LaunchDarkly (primary), Flagsmith

**What it is**: Feature flag evaluation functions guarantee they will never throw an exception under any circumstance -- SDK not initialized, network down, invalid flag key, malformed context, or internal error. They always return the provided default value when anything goes wrong. LaunchDarkly enforces this across all 25+ SDKs. Flagsmith follows the same convention. A separate `variationDetail()` method provides evaluation metadata (reason, rule matched, variation index) for debugging without compromising the safety guarantee.

**Why we adopted it**: Feature flag checks sit on the critical path of every request in a SaaS application. A `flags.variation()` call inside a route handler that throws an exception would crash the entire request, turning a feature-management convenience into a production outage. This is fundamentally different from other SDK operations (user CRUD, billing) where errors must surface. The never-throw contract makes feature flags safe to add anywhere in application code without defensive try-catch blocks, which dramatically increases adoption.

**How it maps to our foundation**: `@dream/feature-flags` (Phase 5 extension package) exports `variation()` and `variationDetail()`. These functions catch all internal errors, log them, and return the default. The `createApiHandler()` in `@dream/errors` does NOT wrap feature flag calls in its error handler -- they are self-contained.

**Code example**:
```typescript
// @dream/feature-flags — never-throw evaluation
import { FlagContext } from '@dream/feature-flags';

// Basic evaluation -- NEVER throws, ALWAYS returns a value
const showNewDashboard = client.flags.variation(
  'new-dashboard',
  context,
  false  // default: returned if anything fails
);

// Even with invalid inputs, returns default
const value = client.flags.variation(
  'nonexistent-flag',  // flag does not exist
  null,                // null context
  'fallback'           // always returns 'fallback'
);
// value === 'fallback' (no exception thrown)

// Evaluation detail for debugging (also never throws)
const detail = client.flags.variationDetail('new-checkout', context, false);
// detail = {
//   value: true,
//   reason: { kind: 'RULE_MATCH', ruleIndex: 1 },
//   variationIndex: 0
// }

// In contrast, other SDK operations DO throw on error:
try {
  await client.users.get('user_123'); // throws NotFoundError if not found
} catch (e) {
  // Expected: user operations are not never-throw
}
```

**LaunchDarkly reference**: `client.variation("flag-key", context, False)` -- never throws in any of 25+ SDKs. `client.variation_detail()` returns evaluation reasons. Flagsmith reference: same never-throw convention with `get_value()` and `has_feature()`.

---

### Pattern 5: Dual Event Delivery -- Push Webhooks + Pull Events API

**Source Competitor(s)**: WorkOS (primary), Stripe (thin events inspiration)

**What it is**: Events are delivered via two complementary mechanisms. Push (webhooks): the platform sends HMAC-signed HTTP POST requests to subscriber URLs with retry logic (6 retries over 3 days, exponential backoff). Pull (Events API): consumers poll a cursor-paginated endpoint to retrieve events at their own pace with 90-day retention. WorkOS pioneered this dual model, recognizing that webhooks alone are fragile -- if the consumer's server is down during delivery and all retries exhaust, events are lost. The pull API serves as both a catch-up mechanism and a primary consumption mode for batch processors.

**Why we adopted it**: Webhooks-only delivery is the industry default but has a fundamental reliability gap: if the consumer is down for longer than the retry window, events are permanently lost. Our 5 products need event-driven integration for audit logging, billing state changes, and cross-product synchronization. The pull API provides at-least-once delivery guarantee regardless of consumer uptime. It also serves batch analytics processors that prefer polling over real-time hooks.

**How it maps to our foundation**: The webhooks module in the SDK (Layer 2) provides both `webhooks.constructEvent()` for push verification and `events.list()` for pull consumption. The `@dream/*` packages (Layer 3) emit events through `createApiHandler()` that feed both delivery paths.

**Code example**:
```typescript
// Push: Webhook signature verification (SDK Layer 2)
const event = client.webhooks.constructEvent(
  request.body,                               // raw body bytes
  request.headers['X-Platform-Signature'],    // HMAC signature
  webhookSecret,
  { tolerance: 300 }                          // 5-minute replay window
);

switch (event.type) {
  case 'user.created':
    await handleUserCreated(event.data);
    break;
  case 'billing.subscription.upgraded':
    await handleUpgrade(event.data);
    break;
}

// Pull: Events API with cursor pagination (SDK Layer 2)
const events = client.events.list({
  after: lastProcessedCursor,
  types: ['user.created', 'user.updated', 'billing.subscription.*'],
  limit: 100,
});

for await (const event of events) {
  await processEvent(event);
  await saveCheckpoint(event.id); // cursor for next poll
}
```

**WorkOS reference**: Push webhooks with 6 retries over 3 days + pull Events API with cursor pagination and 90-day retention. Stripe reference: thin events (v2) with object ID references, decoupling webhook handlers from API versions.

---

### Pattern 6: HMAC-SHA256 Webhook Signature with Timestamp

**Source Competitor(s)**: Stripe (primary), Razorpay

**What it is**: Webhook payloads are signed using HMAC-SHA256 with a shared secret. The signature header contains both a timestamp and the signature in the format `t=<unix_timestamp>,v1=<hmac_hex>`. The signed payload is constructed as `<timestamp>.<raw_body>`, ensuring that even if an attacker intercepts a valid payload, they cannot replay it outside the tolerance window (default: 300 seconds / 5 minutes). Stripe's `Webhook.construct_event()` utility function handles parsing, verification, and replay protection in one call.

**Why we adopted it**: Webhook security is non-negotiable for a platform handling financial data (Dream Books), payroll data (Dream Payroll), and HR records (Dream Team). The timestamp-in-signature approach prevents replay attacks without requiring per-event nonce storage. HMAC-SHA256 is computationally efficient, widely supported across all three SDK languages, and battle-tested by Stripe across trillions of dollars in payment volume. The single-function verification utility (`constructEvent()`) eliminates common implementation mistakes like using parsed JSON instead of raw bytes or forgetting replay protection.

**How it maps to our foundation**: The SDK (Layer 2) exports `webhooks.constructEvent()` in Python, Node.js, and Java. Security invariant INV-004 in the foundation spec mandates this verification on all incoming webhook payloads.

**Code example**:
```typescript
// Node.js SDK — webhook signature verification
import { PlatformClient } from '@shared-platform/sdk';

const client = new PlatformClient({ apiKey: 'sk_live_...' });

// Express route handler
app.post('/webhooks', express.raw({ type: 'application/json' }), (req, res) => {
  const event = client.webhooks.constructEvent(
    req.body,                                    // raw body (Buffer, NOT parsed JSON)
    req.headers['x-platform-signature'],         // "t=1707264000,v1=5257a869e..."
    process.env.WEBHOOK_SECRET!,
    { tolerance: 300 }                           // reject events older than 5 minutes
  );

  // event is verified -- safe to process
  console.log(event.type);      // "user.created"
  console.log(event.id);        // "evt_abc123" (for idempotency)
  console.log(event.tenantId);  // "acme_corp"

  res.status(200).json({ received: true });
});
```

```python
# Python SDK — same pattern
event = client.webhooks.construct_event(
    payload=request.body,
    sig_header=request.headers['X-Platform-Signature'],
    secret=webhook_secret,
    tolerance=300
)
```

**Stripe reference**: `Stripe-Signature: t=1707264000,v1=5257a869e...` format, `Webhook.construct_event()` utility. Razorpay reference: HMAC-SHA256 verification with `order_id|payment_id` message format.

---

### Pattern 7: JWT-Embedded Authorization Context

**Source Competitor(s)**: WorkOS (primary), Frontegg, PropelAuth

**What it is**: The JWT access token contains not just identity claims (`sub`, `email`) but also authorization context: tenant ID, role names, permission strings, and subscription plan. WorkOS embeds `org_id` and `permissions` directly in the JWT. Frontegg embeds tenant membership and entitlements. PropelAuth includes `orgIdToOrgMemberInfo` -- a map of all organizations the user belongs to with their role in each. This eliminates a database lookup on every API request to determine "does this user have access to this resource in this tenant?"

**Why we adopted it**: Our 5 products currently perform 2-3 database queries per API request: one for auth verification, one for role/permission lookup, one for tenant validation. Embedding these in the JWT reduces this to zero additional queries for the common case. Dream Learn already stores `roleSlugs[]` and `activeRoleSlug` in the JWT (a partial implementation of this pattern). The 8-hour session duration (INV-006) bounds the staleness window for embedded claims. The trade-off is JWT size -- Dream Learn discovered this when avatar URLs caused HTTP 431 errors, which is why we only embed compact data (IDs, role slugs, permission strings).

**How it maps to our foundation**: `@dream/auth` provides JWT enrichment callbacks in `createAuthConfig()`. The `jwt.ts` module adds `tenantId`, `roleSlugs`, `permissions`, and `planTier` to the token during sign-in and refresh. The `@dream/rbac` middleware reads these claims directly from the JWT without database queries.

**Code example**:
```typescript
// @dream/auth — JWT enrichment via createAuthConfig callbacks
const authConfig = createAuthConfig({
  providers: ['credentials', 'azure-entra'],
  callbacks: {
    // Enrich JWT with authorization context during sign-in
    enrichJwt: async (token, user, account) => {
      const membership = await db.getOrganizationMembership(user.id, token.tenantId);
      return {
        ...token,
        tenantId: membership.organizationId,
        roleSlugs: membership.roles.map(r => r.slug),        // ["admin", "hr_admin"]
        permissions: membership.roles.flatMap(r => r.permissions), // ["users:*", "teams:manage"]
        planTier: membership.organization.subscriptionPlan,   // "enterprise"
        // NOT included: avatar URL (causes HTTP 431), full role objects (too large)
      };
    },
  },
});

// JWT payload (compact, under 4KB)
// {
//   "sub": "user_abc123",
//   "email": "jane@acme.com",
//   "tenantId": "tenant_acme",
//   "roleSlugs": ["admin", "hr_admin"],
//   "permissions": ["users:*", "teams:manage", "reports:read"],
//   "planTier": "enterprise",
//   "iat": 1707264000,
//   "exp": 1707292800  // 8 hours
// }

// @dream/rbac — reads permissions directly from JWT (zero DB queries)
export const GET = createApiHandler(
  async (req, ctx) => {
    // ctx.permissions came from JWT — no database lookup
    // ctx.tenantId came from JWT — no extraction needed
    return await getEmployees(ctx.tenantId);
  },
  { requiredPermissions: ['employee:read'] }
);
```

**WorkOS reference**: JWT contains `org_id` and `permissions` array. Frontegg reference: JWT contains tenant membership and entitlements. PropelAuth reference: `orgIdToOrgMemberInfo` map in user object.

---

### Pattern 8: Three-Layer Context Propagation

**Source Competitor(s)**: WorkOS (primary), PropelAuth, Stripe Connect

**What it is**: Tenant and authorization context flows through three layers with clear precedence. Layer 1 (client default): the SDK client is initialized with a default tenant ID and environment, used when no override is provided. Layer 2 (per-request override): any individual API call can specify a different tenant context via a header or options parameter, similar to Stripe Connect's `Stripe-Account` header. Layer 3 (JWT-extracted): middleware automatically extracts and validates tenant context from the authenticated user's JWT token. WorkOS and PropelAuth embed org membership in the JWT. Stripe's `Stripe-Account` header enables per-request tenant scoping.

**Why we adopted it**: Our 5 products need different context propagation strategies. Dream Team uses subdomain + session + header extraction. Dream Payroll uses session-only. Dream Books needs to stop using a hardcoded org ID. HireWise needs single-tenant mode. A three-layer model accommodates all these cases through configuration. Server-to-server calls use Layer 1 (client default). Cross-tenant admin operations use Layer 2 (per-request override). Standard user requests use Layer 3 (JWT extraction). The precedence chain ensures that the most specific context wins.

**How it maps to our foundation**: `@dream/multi-tenant` exports `createTenantConfig()` with configurable extraction sources. `withTenant()` middleware resolves context using the configured chain. Products select which layers to enable via configuration.

**Code example**:
```typescript
// @dream/multi-tenant — three-layer context propagation
import { createTenantConfig, withTenant } from '@dream/multi-tenant';

// Dream Team: Full multi-tenant with all three layers
const tenantConfig = createTenantConfig({
  mode: 'multi',
  extractionSources: ['session', 'subdomain', 'header'],  // priority order
  subdomainConfig: {
    baseDomain: 'dreamteam.app',
    excludeSubdomains: ['www', 'api', 'admin', 'auth'],
  },
});

// Layer 1: Client/environment default (server-to-server)
// Set via TENANT_ID env var or createTenantConfig default

// Layer 2: Per-request override (admin operations)
// Via X-Tenant-ID header — admin acting on behalf of tenant
const response = await fetch('/api/users', {
  headers: { 'X-Tenant-ID': 'beta_corp' },
});

// Layer 3: JWT extraction (standard user requests)
// @dream/auth middleware populates ctx.tenantId from JWT claims
export const GET = createApiHandler(
  async (req, ctx) => {
    // ctx.tenantId resolved from JWT (Layer 3) or header (Layer 2)
    const employees = await db.select()
      .from(employeesTable)
      .where(eq(employeesTable.tenantId, ctx.tenantId));
    return { data: employees };
  },
  { requireAuth: true }
);

// HireWise: Single-tenant mode (only Layer 1)
const hireWiseTenantConfig = createTenantConfig({
  mode: 'single',
  singleTenantId: process.env.TENANT_ID!,
});
```

**WorkOS reference**: `org_id` embedded in JWT, organization context in AuthKit middleware. PropelAuth reference: `orgIdToOrgMemberInfo` map on every user. Stripe Connect reference: `Stripe-Account` header for per-request tenant scoping.

---

### Pattern 9: Multi-Context Flag Evaluation

**Source Competitor(s)**: LaunchDarkly (primary)

**What it is**: A single feature flag evaluation considers multiple entity types simultaneously -- user, organization/tenant, device, and custom contexts. LaunchDarkly's `Context.create_multi()` accepts any number of context kinds, each with their own attributes. A targeting rule can reference attributes from any context kind, enabling rules like "enable for premium users in enterprise tenants on iPad devices." This is fundamentally more powerful than single-context evaluation where only user attributes are available.

**Why we adopted it**: In a multi-tenant SaaS platform, feature access depends on multiple dimensions simultaneously. A feature might be gated by the user's role (`user.role == 'admin'`), the tenant's subscription plan (`tenant.plan == 'enterprise'`), and whether the tenant has opted into a beta program (`tenant.betaOptIn == true`). Without multi-context, developers must manually compose these checks, leading to scattered and inconsistent flag logic. Multi-context evaluation centralizes this in the flag service.

**How it maps to our foundation**: `@dream/feature-flags` (Phase 5) exports `FlagContext.multi()` which composes user, tenant, and device contexts. The `createApiHandler()` in `@dream/errors` automatically builds the multi-context from the request's JWT claims (user + tenant + plan).

**Code example**:
```typescript
// @dream/feature-flags — multi-context evaluation
import { FlagContext } from '@dream/feature-flags';

// Build multi-context from request (typically automatic via middleware)
const context = FlagContext.multi(
  FlagContext.user('user_123', {
    email: 'jane@acme.com',
    role: 'admin',
    createdAt: '2025-06-01',
  }),
  FlagContext.tenant('acme_corp', {
    plan: 'enterprise',
    seats: 500,
    region: 'us-east',
    betaOptIn: true,
  }),
  FlagContext.device('browser_abc', {
    os: 'macOS',
    browser: 'Chrome',
    version: '120',
  })
);

// Single evaluation considers all three contexts
const showAdvancedAnalytics = client.flags.variation(
  'advanced-analytics',
  context,
  false  // default
);

// Targeting rule (configured in flag service):
//   IF tenant.plan IN ["enterprise", "professional"]
//   AND user.role IN ["admin", "manager"]
//   AND tenant.betaOptIn == true
//   THEN -> true (100%)
//   ELSE -> false

// Automatic context building from JWT in createApiHandler
export const GET = createApiHandler(async (req, ctx) => {
  // ctx.flagContext is automatically built from JWT claims
  const showFeature = client.flags.variation('new-reports', ctx.flagContext, false);
  if (showFeature) {
    return await getNewReports(ctx.tenantId);
  }
  return await getLegacyReports(ctx.tenantId);
});
```

**LaunchDarkly reference**: `Context.create_multi()` with `kind` parameter for user/organization/device. Supports custom kinds for any entity type.

---

### Pattern 10: Workflow Notification Orchestration

**Source Competitor(s)**: Novu (primary), Knock

**What it is**: Notifications are not sent directly to channels; instead, they are triggered through multi-step workflows that define the delivery sequence, timing, and fallback logic. A workflow consists of channel steps (in-app, email, SMS, push, chat/Slack) and action steps (delay, digest, custom logic). Novu's `workflow()` function defines steps declaratively. Each step can have skip conditions. A digest step batches multiple notifications into a single message. A delay step introduces timed pauses. Subscribers have two-tier preferences: global channel preferences and per-workflow overrides.

**Why we adopted it**: Our existing Notifications module (spec 006) supports email, SMS, push, and in-app channels but has no orchestration layer. Each notification is a direct channel send, which means developers must manually implement: "send in-app immediately, wait 24 hours, if not read then send email, unless the user has disabled email for this workflow." This logic is complex, error-prone, and duplicated across products. Novu's workflow engine makes this declarative and reusable.

**How it maps to our foundation**: Phase 5 notification workflow upgrade. The `@dream/notifications` extension will export a `defineWorkflow()` function and a `trigger()` API. Subscriber preferences are stored per tenant and per workflow.

**Code example**:
```typescript
// @dream/notifications — workflow definition (Phase 5)
import { defineWorkflow, step } from '@dream/notifications';

const commentNotification = defineWorkflow('comment-notification', async ({ step, payload }) => {
  // Step 1: In-app notification (immediate)
  await step.inApp('in-app-alert', async () => ({
    body: `${payload.commenterName} commented on your post "${payload.postTitle}"`,
    avatar: payload.commenterAvatar,
    actionUrl: `/posts/${payload.postId}#comment-${payload.commentId}`,
  }));

  // Step 2: Wait 24 hours
  await step.delay('wait-for-read', async () => ({
    amount: 24,
    unit: 'hours',
  }));

  // Step 3: Email fallback (skipped if in-app was read)
  await step.email('email-fallback', async () => ({
    subject: `You have unread comments on "${payload.postTitle}"`,
    body: renderCommentEmail(payload),
  }), {
    skip: () => payload.inAppRead,  // skip if user already saw the in-app notification
  });
});

// Triggering the workflow
await client.notifications.trigger({
  workflowId: 'comment-notification',
  to: 'subscriber_user_123',
  payload: {
    commenterName: 'Alice',
    postTitle: 'Q1 Planning',
    postId: 'post_789',
    commentId: 'cmt_456',
  },
  tenantId: 'acme_corp',
});

// Subscriber preferences (two-tier: global + per-workflow)
await client.notifications.preferences.setGlobal('subscriber_user_123', {
  channels: { email: true, sms: false, inApp: true, push: true },
});

await client.notifications.preferences.set('subscriber_user_123', {
  workflowId: 'marketing-updates',
  channels: { email: false },  // override: no marketing emails
});
```

**Novu reference**: `workflow('name', async ({ step, payload }) => { ... })` with step types: `inApp`, `email`, `sms`, `push`, `chat`, `delay`, `digest`, `custom`. Two-tier subscriber preferences: global + per-workflow.

---

### Pattern 11: Compliance-Grade Audit Logging with Hash Chains

**Source Competitor(s)**: WorkOS (primary), Permit.io (decision logs)

**What it is**: Audit log entries are cryptographically chained: each entry's hash includes the hash of the previous entry, forming a tamper-evident chain similar to a blockchain. If any entry is modified or deleted, the chain breaks, providing cryptographic proof of tampering. WorkOS builds this for enterprise compliance (SOC 2, ISO 27001) and offers SIEM streaming at $125/connection for real-time export to Splunk, Datadog, and similar tools. Permit.io extends this concept to authorization decisions -- logging every `permit.check()` call for compliance reviews.

**Why we adopted it**: Dream Books handles financial records with zero audit logging. Dream Team and Dream Payroll have partial audit logging. SOC 2 Type II, GDPR Article 30, and India's DPDPA all require demonstrable audit trails. Hash chains provide tamper-evidence without requiring a trusted third party. Security invariant INV-005 mandates audit events on all state-changing operations. The SIEM streaming capability is essential for enterprise customers who consolidate security events in centralized monitoring platforms.

**How it maps to our foundation**: Phase 5 audit logging formalization. The `@dream/errors` `createApiHandler()` automatically emits audit events on POST/PUT/PATCH/DELETE. Events include actor, action, resource, before/after state, timestamp, IP, and request ID. Hash chain computation runs asynchronously to avoid blocking the request path.

**Code example**:
```typescript
// @dream/audit (Phase 5) — compliance-grade audit logging
import { auditLog } from '@dream/audit';

// Automatic capture via createApiHandler (on all mutations)
export const PUT = createApiHandler(
  async (req, ctx) => {
    const before = await getUser(ctx.tenantId, req.params.id);
    const after = await updateUser(ctx.tenantId, req.params.id, req.body);
    return after;
    // createApiHandler automatically emits:
    // {
    //   id: "aud_xyz789",
    //   actor: { id: "user_abc", email: "admin@acme.com", ip: "203.0.113.42" },
    //   action: "user.updated",
    //   resource: { type: "user", id: "user_def456" },
    //   before: { name: "Jane", role: "viewer" },
    //   after: { name: "Jane", role: "admin" },
    //   timestamp: "2026-02-07T10:30:00Z",
    //   requestId: "req_abc123",
    //   tenantId: "acme_corp",
    //   hash: "sha256:a1b2c3...",        // hash of this entry
    //   previousHash: "sha256:x9y8z7..."  // hash of previous entry (chain link)
    // }
  },
  { requiredPermissions: ['users:write'] }
);

// Manual audit logging for custom events
await auditLog.record({
  actor: ctx.user,
  action: 'document.exported',
  resource: { type: 'document', id: 'doc_123' },
  metadata: { format: 'pdf', pages: 42 },
  tenantId: ctx.tenantId,
});

// SIEM streaming configuration (per-tenant)
await client.audit.configureSiemExport({
  tenantId: 'acme_corp',
  destination: 'splunk',
  endpoint: 'https://hec.splunk.acme.com:8088',
  token: process.env.SPLUNK_HEC_TOKEN!,
  format: 'cef',  // Common Event Format
});
```

**WorkOS reference**: Tamper-evident audit logs, SIEM streaming at $125/connection, $99/million events retention. Permit.io reference: decision logs recording every `permit.check()` call with user, action, resource, and decision.

---

### Pattern 12: Plan-Based Entitlements Linking Billing to Flags

**Source Competitor(s)**: LaunchDarkly (primary), Frontegg, Chargebee

**What it is**: Feature flags are connected to subscription plans, creating "entitlements" -- the set of features a tenant has access to based on what they pay for. LaunchDarkly accomplishes this by using the tenant context's `plan` attribute in targeting rules (e.g., `IF tenant.plan == "enterprise" THEN enable`). Frontegg has a dedicated Entitlements engine that evaluates access based on ABAC policies tied to plans. Chargebee defines feature types (switch, quantity, range, custom) attached to subscription items. The key insight is that feature gating and billing should be connected -- not separate systems.

**Why we adopted it**: Our 5 products all need to gate features by subscription tier. Dream Team needs "enterprise-only" features like SSO management. Dream Learn needs "premium-only" features like advanced analytics. Without entitlements, developers implement ad-hoc `if (tenant.plan === 'enterprise')` checks scattered throughout the codebase. These checks become unmaintainable as plans evolve. Connecting flags to billing centralizes this logic: change a plan definition, and all feature gates update instantly.

**How it maps to our foundation**: Phase 5 integration between `@dream/feature-flags` and `@dream/billing`. The flag evaluation context automatically includes the tenant's plan tier (resolved from billing). Entitlement checks combine flag evaluation with plan lookup in a single API call.

**Code example**:
```typescript
// @dream/feature-flags + @dream/billing integration (Phase 5)

// Flag targeting rules (configured in admin panel):
// Flag: "advanced-reporting"
//   Rule 1: IF tenant.plan IN ["enterprise"]        -> true
//   Rule 2: IF tenant.plan IN ["professional"]      -> true
//   Rule 3: IF tenant.plan IN ["starter", "free"]   -> false
//   Default: false

// In application code — single call, flag resolves plan automatically
const hasReporting = client.flags.variation('advanced-reporting', ctx.flagContext, false);
// ctx.flagContext.tenant.plan was populated from billing module

// Dedicated entitlements API (Chargebee-inspired)
const access = await client.entitlements.evaluate({
  tenantId: 'acme_corp',
  features: ['advanced-reporting', 'custom-branding', 'api-access', 'sso-management'],
});
// Returns:
// {
//   "advanced-reporting": { entitled: true, type: "switch" },
//   "custom-branding": { entitled: true, type: "switch" },
//   "api-access": { entitled: true, type: "quantity", limit: 10000, used: 3421 },
//   "sso-management": { entitled: false, type: "switch", requiredPlan: "enterprise" }
// }

// Chargebee-style feature types
// switch: boolean on/off (e.g., "Advanced Analytics")
// quantity: numeric limit (e.g., "10 team members")
// range: tiered ranges (e.g., "100-500 API calls/day")
// custom: custom entitlement logic
```

**LaunchDarkly reference**: tenant context `plan` attribute in targeting rules. Entitlements guide for SaaS plan gating. Frontegg reference: Entitlements engine with ABAC policies tied to subscription plans. Chargebee reference: Features API with switch/quantity/range/custom types.

---

### Pattern 13: Auto-Pagination Iterators

**Source Competitor(s)**: Stripe (primary)

**What it is**: List endpoints return paginated results, but the SDK provides auto-pagination iterators that transparently fetch subsequent pages as the consumer iterates. In Python, `auto_paging_iter()` returns a generator. In Node.js, the list result is an async iterable (`for await...of`). In Java, `autoPagingIterable()` returns an `Iterable`. The consumer never sees pagination cursors, page sizes, or `has_more` flags -- they write a simple loop and the SDK handles everything.

**Why we adopted it**: Pagination boilerplate is one of the most tedious parts of API consumption. Without auto-pagination, every list operation requires a loop that checks `has_more`, extracts the cursor, makes another request, and concatenates results. This code is repeated for every resource type. Auto-pagination eliminates this entirely, reducing consumer code from 10-15 lines to 2 lines. Stripe achieves this across 8+ SDK languages.

**How it maps to our foundation**: The SDK (Layer 2) implements auto-pagination on all `list()` methods in Python, Node.js, and Java. The `@dream/*` packages (Layer 3) use the same pattern for any paginated data (user lists, audit logs, team members).

**Code example**:
```python
# Python SDK — auto-pagination
for user in client.users.list(limit=100).auto_paging_iter():
    process(user)
# That's it. No cursor management, no has_more checks, no loop logic.

# Async variant
async for user in client.users.list(limit=100).auto_paging_iter_async():
    await process(user)

# Manual pagination (still available when needed)
page = client.users.list(limit=100)
for user in page.data:
    process(user)
if page.has_more:
    next_page = client.users.list(limit=100, after=page.data[-1].id)
```

```typescript
// TypeScript SDK — async iterator
for await (const user of client.users.list({ limit: 100 })) {
  await process(user);
}
```

```java
// Java SDK — Iterable
client.users().list(ListParams.builder().limit(100).build())
    .autoPagingIterable()
    .forEach(user -> process(user));
```

**Stripe reference**: `auto_paging_iter()` in Python, `for await...of` in Node.js, `autoPagingIterable()` in Java. Available on every list endpoint across 8+ languages.

---

### Pattern 14: Cursor Pagination for Events

**Source Competitor(s)**: Stripe (primary), WorkOS

**What it is**: Event streams (audit logs, webhook events, analytics events) use cursor-based pagination with an `after` parameter pointing to the last consumed event ID. Unlike offset pagination, cursor pagination is stable under concurrent writes -- new events added while paginating do not cause duplicates or gaps. The response includes `data`, `has_more`, and `next_cursor`. Stripe uses this for all list endpoints. WorkOS uses it specifically for the Events API with 90-day retention.

**Why we adopted it**: Audit logs and webhook events are append-only streams where concurrent writes are the norm. Offset pagination (`page=2, limit=50`) breaks when events are inserted between page fetches -- consumers either miss events or process duplicates. Cursor pagination guarantees every event is seen exactly once. This is critical for compliance-grade audit logging (INV-005) where missing or duplicate events would violate SOC 2 requirements.

**How it maps to our foundation**: The SDK (Layer 2) uses cursor pagination for `events.list()` and `audit.list()`. The `@dream/audit` package (Phase 5) returns `CursorPaginatedResponse<T>` from all query endpoints. Standard CRUD endpoints (users, teams) use offset pagination with `totalItems` and `totalPages`.

**Code example**:
```typescript
// Cursor pagination for event streams
interface CursorPaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  nextCursor: string | null;
}

// Events API — cursor-based consumption
let cursor: string | undefined = lastSavedCursor;
do {
  const page = await client.events.list({
    after: cursor,
    types: ['user.*', 'billing.*'],
    limit: 100,
  });

  for (const event of page.data) {
    await processEvent(event);
  }

  cursor = page.nextCursor ?? undefined;
  await saveCheckpoint(cursor);  // persist for crash recovery
} while (page.hasMore);

// Audit log query — also cursor-based
const auditPage = await client.audit.list({
  tenantId: 'acme_corp',
  after: lastAuditCursor,
  actorId: 'user_abc',
  actions: ['user.updated', 'user.deleted'],
  startDate: '2026-01-01',
  endDate: '2026-02-07',
  limit: 50,
});

// Standard CRUD endpoints use offset pagination with totals
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
```

**Stripe reference**: `starting_after` / `ending_before` cursor parameters, `has_more` field, auto-pagination iterators. WorkOS reference: Events API with `after` parameter and 90-day retention window.

---

## 2. Patterns Explicitly Rejected (with Rationale)

### Rejected Pattern A: Global Singleton Client (Stripe v7 Legacy)

**Source**: Stripe Python SDK v7 and earlier

**What it is**: A single global client configured via module-level assignment (`stripe.api_key = "sk_test_..."`). All subsequent API calls use this global configuration.

**Why we rejected it**: Stripe themselves migrated away from this pattern in v8, publicly calling it a mistake. Global mutable state causes test pollution (one test's API key leaks into another), concurrency bugs in multi-threaded servers, and structural impossibility of multi-tenant operations (cannot have two clients with different tenant contexts). Our 5 products need isolated configurations, making this pattern fundamentally incompatible.

---

### Rejected Pattern B: Supabase-Style `{ data, error }` Result Tuples

**Source**: Supabase JavaScript SDK

**What it is**: Instead of throwing exceptions on errors, every API call returns a tuple with `{ data, error }` where exactly one is populated.

```typescript
// Supabase pattern
const { data, error } = await supabase.from('users').select('*');
if (error) { /* handle */ }
```

**Why we rejected it**: While popular in JavaScript, this pattern is inconsistent across languages. Supabase itself does NOT use this in Python (Python raises exceptions). Our SDK targets Python, Node.js, and Java, and each language has strong conventions for error handling: Python uses exceptions, Java uses exceptions, TypeScript can use either. Forcing result tuples in all three languages would fight language idioms. We adopt thrown exceptions (typed error hierarchy) for consistency, with the sole exception of feature flag evaluation (Pattern 4: never-throw).

---

### Rejected Pattern C: PDP Sidecar Requirement (Permit.io)

**Source**: Permit.io

**What it is**: Authorization checks are routed to a locally-deployed Policy Decision Point (PDP) Docker container, providing sub-millisecond latency but requiring Docker as a runtime dependency.

**Why we rejected it**: Requiring Docker for basic RBAC checks adds unacceptable operational complexity for our target audience. Dream Books currently has zero authorization -- asking them to deploy a Docker sidecar before they can add `requirePermission('invoices:read')` would block adoption. Our approach is to evaluate permissions locally from JWT-embedded claims (Pattern 7) for the common RBAC case, achieving similar sub-millisecond latency without infrastructure requirements. If we later add ABAC/ReBAC (Phase 4), we may reconsider a PDP option as an opt-in advanced mode, not a requirement.

---

### Rejected Pattern D: Clerk-Style Env Var Auto-Configuration as Primary

**Source**: Clerk

**What it is**: The SDK auto-configures from environment variables (`CLERK_SECRET_KEY`), requiring zero constructor arguments. `import { clerkClient } from '@clerk/clerk-sdk-node'` works immediately if the env var is set.

**Why we rejected it as the primary pattern**: While convenient for local development, this creates an implicit dependency that is invisible in code. In multi-tenant or multi-product deployments, environment variables cannot express the required configuration diversity (different tenant defaults, different provider configurations per product). We support env var fallback as a convenience (Pattern 1), but explicit `createAuthConfig({ ... })` is the primary and recommended initialization method.

---

### Rejected Pattern E: Firebase Namespaced Error Codes Without Class Hierarchy

**Source**: Firebase

**What it is**: Errors use namespaced string codes (`auth/user-not-found`) but are thrown as a single `FirebaseError` class. Consumers match on the string code, not on error subclass.

```typescript
catch (error) {
  if (error.code === 'auth/user-not-found') { /* handle */ }
}
```

**Why we rejected it**: String-based matching requires knowing exact codes and provides no IDE autocomplete or compiler assistance. Our typed hierarchy (Pattern 2) enables `catch (e) { if (e instanceof NotFoundError) ... }` which works with TypeScript type narrowing, Python `except NotFoundError`, and Java `catch (NotFoundException e)`. We DO adopt Firebase's namespacing convention for the `code` field, giving developers both approaches: type-based matching for categories (`NotFoundError`) and string matching for specifics (`e.code === 'users/not-found'`).

---

## 3. Indian Market Patterns

The Indian SaaS ecosystem (Razorpay, Chargebee, Freshworks, Zoho, Postman, CleverTap) demonstrates market-specific patterns that influence our foundation's international strategy.

### 3.1 INR Pricing Support

**Source**: Zoho, Razorpay, Freshworks

**Pattern**: Indian customers expect India-specific pricing tiers denominated in INR, not USD. Zoho offers Zoho One at INR 1,500/employee/month (approximately $18) versus $45/employee/month for international pricing -- a 60% discount. Freshworks and Chargebee both offer India-specific pricing. This is not merely currency conversion; it reflects purchasing power parity and competitive dynamics in the Indian market.

**Foundation impact**: The `@dream/billing` module (Phase 5) must support multi-currency pricing at the plan level. The `@dream/types` Tenant interface includes `currency` and `region` fields. Pricing configuration is per-tenant, not global.

```typescript
// @dream/types — tenant-level currency support
interface Tenant {
  id: string;
  currency: 'USD' | 'INR' | 'EUR' | 'GBP';  // tenant's billing currency
  region: 'us' | 'in' | 'eu' | 'global';      // data residency region
  // ...
}
```

### 3.2 UPI/Netbanking Payment Methods (Razorpay Integration)

**Source**: Razorpay

**Pattern**: Razorpay processes payments for 10M+ Indian businesses via UPI (Unified Payments Interface), Netbanking, wallets (Paytm, PhonePe), EMI, and cards. UPI alone accounts for over 80% of digital transactions in India. Any billing module targeting the Indian market without Razorpay integration is non-viable. Razorpay uses HTTP Basic Auth (key/secret pair), HMAC-SHA256 signature verification (shared with our Pattern 6), and a simple REST API with `v1` versioning.

**Foundation impact**: ADR-008 specifies that `@dream/billing` (Phase 5) supports both Stripe (international) and Razorpay (India) via a payment processor abstraction. The webhook verification (Pattern 6) is already compatible with Razorpay's HMAC-SHA256 approach.

```typescript
// @dream/billing — payment processor abstraction (Phase 5)
import { createBillingConfig } from '@dream/billing';

const billingConfig = createBillingConfig({
  processors: {
    default: {
      provider: 'stripe',
      secretKey: process.env.STRIPE_SECRET_KEY!,
    },
    india: {
      provider: 'razorpay',
      keyId: process.env.RAZORPAY_KEY_ID!,
      keySecret: process.env.RAZORPAY_KEY_SECRET!,
    },
  },
  // Route tenants to processors based on region
  routingStrategy: (tenant) => tenant.region === 'in' ? 'india' : 'default',
});
```

### 3.3 DPDPA Data Residency Compliance

**Source**: CleverTap, Zoho, Freshworks

**Pattern**: India's Digital Personal Data Protection Act (DPDPA, 2023) mandates that personal data of Indian citizens be processed and stored within India or in approved jurisdictions. CleverTap operates India-based data centers specifically for DPDPA compliance. Zoho offers India-hosted instances of all products. Enterprises increasingly require contractual guarantees of data residency. The pattern is tenant-level data residency configuration: each tenant declares its required region, and the platform routes data storage and processing accordingly.

**Foundation impact**: `@dream/multi-tenant` tenant configuration includes a `dataResidency` field. The foundation does not implement data routing (that is an infrastructure concern) but ensures the metadata propagates through the system so infrastructure can act on it.

```typescript
// @dream/multi-tenant — data residency metadata
const tenantConfig = createTenantConfig({
  mode: 'multi',
  tenantSchema: {
    dataResidency: {
      type: 'enum',
      values: ['us-east', 'eu-west', 'in-mumbai', 'ap-singapore'],
      default: 'us-east',
      immutableAfterCreation: true,  // cannot change after tenant creation
    },
  },
});

// Tenant creation enforces residency declaration
await client.tenants.create({
  name: 'Acme India Pvt Ltd',
  slug: 'acme-india',
  dataResidency: 'in-mumbai',   // data stored in Mumbai region
  currency: 'INR',
});
```

### 3.4 WhatsApp Business API for Notifications

**Source**: CleverTap, Freshworks

**Pattern**: India is WhatsApp's largest market with 500M+ users. CleverTap integrates WhatsApp Business API as a first-class notification channel alongside SMS, push, and email. Freshworks uses WhatsApp for customer engagement. In India, WhatsApp is often the primary communication channel, surpassing email in reach and engagement rates. Business-initiated messages require pre-approved templates and carry per-message costs (INR 0.5-1.0 per message).

**Foundation impact**: The notification workflow engine (Pattern 10) must support WhatsApp as a channel step alongside email, SMS, push, and in-app. This is a Phase 5 enhancement to `@dream/notifications`.

```typescript
// @dream/notifications — WhatsApp as workflow channel (Phase 5)
const orderConfirmation = defineWorkflow('order-confirmation', async ({ step, payload }) => {
  await step.inApp('in-app', async () => ({
    body: `Order ${payload.orderId} confirmed!`,
  }));

  // WhatsApp for Indian customers (template-based)
  await step.whatsapp('whatsapp-confirmation', async () => ({
    templateName: 'order_confirmation_v2',  // pre-approved template
    templateParams: [payload.customerName, payload.orderId, payload.totalAmount],
    language: 'en',
  }), {
    skip: (subscriber) => subscriber.region !== 'in',  // only for Indian users
  });

  await step.email('email-confirmation', async () => ({
    subject: `Order ${payload.orderId} Confirmed`,
    body: renderOrderEmail(payload),
  }));
});
```

### 3.5 Regional Compliance Requirements

**Source**: Zoho, Razorpay, Chargebee, Freshworks

**Pattern**: Indian enterprise customers require compliance with multiple overlapping regulations: DPDPA (data protection), RBI guidelines (payment processing), GST compliance (tax), SEBI regulations (financial services), and industry-specific rules (HIPAA-equivalent for healthcare, RBI circulars for banking). Zoho addresses this by building compliance into the platform rather than treating it as an add-on. Razorpay builds RBI compliance into every payment flow. Chargebee handles GST invoicing natively.

**Foundation impact**: The audit logging system (Pattern 11) and the `createApiHandler()` (from Dream Payroll) automatically capture compliance-relevant events. GST handling is a Dream Books domain concern, not a foundation concern. RBI payment compliance is handled by the Razorpay processor integration (Pattern 3.2). The foundation's role is to provide the infrastructure (audit trails, data residency metadata, tenant-level configuration) that enables product-level compliance.

```typescript
// @dream/audit — compliance-ready audit configuration per tenant
await client.audit.configureRetention({
  tenantId: 'acme_india',
  retentionDays: 365 * 7,  // 7 years (Indian financial record retention requirement)
  immutable: true,           // entries cannot be deleted before retention expires
  hashChainEnabled: true,    // tamper-evident (Pattern 11)
});
```

---

## 4. SDK Design Patterns Summary

This section consolidates the "gold standard" patterns from the five most architecturally influential competitors in our research.

### 4.1 Stripe: The SDK Design Benchmark

**Overall SDK Quality Score**: 5.0/5.0 (highest across all 19 competitors)

| Pattern | Description | Our Adoption |
|---------|-------------|--------------|
| **Instance-based client** | `StripeClient("sk_...")` -- no global state, multi-instance safe. Stripe migrated from singleton in v8. | Pattern 1: `createAuthConfig()` |
| **Typed error hierarchy** | `StripeError` -> `CardError`, `InvalidRequestError`, etc. with `user_message`, `code`, `param` | Pattern 2: `PlatformError` hierarchy |
| **Idempotency keys** | All POST/DELETE accept `idempotency_key`. `Idempotent-Replayed: true` header on replays. 30-day idempotency window in v2. | Adopted in SDK Layer 2 for all mutation endpoints |
| **Auto-pagination** | `auto_paging_iter()` (Python), `for await...of` (Node), `autoPagingIterable()` (Java) | Pattern 13: all `list()` methods |
| **HMAC-SHA256 webhooks** | `t=timestamp,v1=signature` format. `construct_event()` utility. Replay protection. | Pattern 6: identical implementation |
| **Cursor pagination** | `starting_after` / `ending_before` parameters, `has_more` field | Pattern 14: events and audit logs |
| **Server-guided retry** | `Stripe-Should-Retry: true/false` header, `Retry-After` header, auto-retry on 429/5xx | Adopted in SDK Layer 2 HTTP client |
| **Date-based API versioning** | `2026-01-28.clover` format. Per-request `Stripe-Version` header override. | Adopted for platform API versioning |
| **Test mode** | Separate `sk_test_` keys. Test clocks for time-sensitive testing. | Adopted: separate test/live environments |
| **Thin events (v2)** | Lightweight webhook payloads with object ID reference only. Decouples webhook handlers from API versions. | Planned for SDK Layer 2 events system |

**Key lesson**: Stripe's patterns are not innovative for innovation's sake -- they solve real problems that emerged over 15 years and trillions of dollars of API traffic. Every pattern has a story of what went wrong without it.

### 4.2 LaunchDarkly: The Feature Flag Benchmark

**Overall SDK Quality Score**: 4.3/5.0

| Pattern | Description | Our Adoption |
|---------|-------------|--------------|
| **Never-throw evaluation** | `variation()` catches all errors, returns default value. Application never crashes due to flag evaluation. | Pattern 4: `@dream/feature-flags` |
| **Multi-context** | `Context.create_multi()` evaluates against user + org + device simultaneously | Pattern 9: `FlagContext.multi()` |
| **Local evaluation** | SDK downloads all configs via SSE, evaluates locally at ~1ms. No network call per evaluation. | Adopted for `@dream/feature-flags` server-side |
| **Evaluation reasons** | `variation_detail()` returns why a variation was served (TARGET_MATCH, RULE_MATCH, FALLTHROUGH) | Adopted: `variationDetail()` method |
| **Test fixtures** | `TestData` pattern configures flag states in test code. Zero network calls in unit tests. | Adopted: `TestFlagData` in testing utilities |
| **Streaming updates** | SSE connection for real-time flag config updates. Fallback to polling. | Adopted for `@dream/feature-flags` |
| **Entitlements** | Feature gating by subscription plan via tenant context `plan` attribute | Pattern 12: billing + flags integration |
| **Composable Java builders** | Sub-builders for HTTP, data source, events, logging configuration | Adopted for Java SDK client builder |
| **Status tracking** | INITIALIZING -> VALID -> INTERRUPTED -> OFF with status listeners | Adopted for `@dream/feature-flags` client lifecycle |
| **Segments** | Reusable groups of contexts for targeting across multiple flags | Planned for feature flag targeting rules |

**Key lesson**: LaunchDarkly's never-throw guarantee is their most important design decision. Feature flags must be the most reliable component in the system because they are on the critical path of every request.

### 4.3 WorkOS: The Enterprise Readiness Benchmark

**Overall SDK Quality Score**: 3.9/5.0

| Pattern | Description | Our Adoption |
|---------|-------------|--------------|
| **Dual push/pull events** | Webhooks (push, 6 retries/3 days) + Events API (pull, cursor pagination, 90-day retention) | Pattern 5: dual delivery model |
| **Tamper-evident audit logs** | Cryptographically chained log entries for compliance reviews. SIEM streaming. | Pattern 11: hash chain audit logs |
| **JWT-embedded auth context** | `org_id` and `permissions` in JWT. Zero DB queries for common authorization. | Pattern 7: JWT enrichment |
| **TypeScript discriminated unions** | Compile-time enforcement of mutually exclusive options | Adopted in SDK Layer 2 TypeScript types |
| **Admin Portal** | Self-service SSO/SCIM configuration wizard for end-customers | Planned for enterprise self-service |
| **PKCE by default** | Automatic PKCE generation for OAuth authorization URLs | Adopted in `@dream/auth` OAuth flows |
| **9-language SDK coverage** | Node, Python, Ruby, Go, PHP, Kotlin, .NET, Java -- broadest in category | Target: Python, Node.js, Java now; Go, Ruby on roadmap |
| **Radar fraud detection** | 20+ device signals for bot detection and credential stuffing prevention | Deferred to Phase 4+ |
| **FGA (Fine-Grained Authorization)** | Relationship-based policies extending RBAC, up to 5 layers deep | Planned for ABAC/ReBAC extension (Phase 4) |

**Key lesson**: WorkOS demonstrates that enterprise readiness features (SSO, SCIM, audit logs, SIEM) are not afterthoughts -- they are the primary product. Building compliance-grade infrastructure from the start avoids expensive retrofits.

### 4.4 Novu: The Notification Infrastructure Benchmark

**Overall SDK Quality Score**: 3.1/5.0

| Pattern | Description | Our Adoption |
|---------|-------------|--------------|
| **Workflow engine** | Step-based workflows with channel steps (inApp, email, SMS, push, chat) and action steps (delay, digest, custom) | Pattern 10: `defineWorkflow()` |
| **Subscriber preferences** | Two-tier: global channel preferences + per-workflow overrides | Adopted in `@dream/notifications` |
| **Topics (pub/sub)** | Fan-out notifications to subscriber groups | Adopted for team/department notifications |
| **Digest/batch** | Aggregate multiple notifications into a single message | Adopted as `step.digest()` in workflows |
| **Provider abstraction** | Swap SendGrid/SES/Postmark without code changes | Adopted in `@dream/notifications` |
| **Per-tenant provider config** | Different tenants use different email/SMS providers | Adopted in multi-tenant config |
| **In-app feed** | `<Inbox />` React component with bell icon, unread count, WebSocket updates | Planned for `@dream/notifications` UI components |
| **Trigger-based API** | `trigger(workflowId, to, payload)` -- one call initiates the entire workflow | Adopted: `client.notifications.trigger()` |

**Key lesson**: Novu proves that notification infrastructure should be workflow-first, not channel-first. Developers do not want to manually orchestrate "send in-app, wait, then email" -- they want to declare the workflow and let the engine handle delivery.

### 4.5 Permit.io: The Authorization Model Benchmark

**Overall SDK Quality Score**: 3.3/5.0

| Pattern | Description | Our Adoption |
|---------|-------------|--------------|
| **`check()` primitive** | `permit.check(user, action, resource)` -- universal authorization check | Pattern 3: `requirePermission()` middleware |
| **RBAC -> ABAC -> ReBAC progression** | Start simple (RBAC), add complexity (ABAC, ReBAC) without code changes | Planned for Phase 4 authorization expansion |
| **Tenant-scoped roles** | Same user has different roles per tenant | Adopted in `@dream/rbac` role assignment model |
| **Resource type definitions** | Define resources with valid actions and attributes | Adopted in `@dream/types` resource schemas |
| **Relationship tuples** | `subject:user_123 -> relation:owner -> object:document_456` for ReBAC | Planned for Phase 4 ReBAC support |
| **Decision logs** | Every `check()` call logged for compliance | Adopted in audit logging (Pattern 11) |
| **Separation of auth and authz** | Authentication (who you are) and authorization (what you can do) are separate concerns | Enforced: `@dream/auth` vs `@dream/rbac` are independent packages |
| **Policy-as-code** | Permissions defined in version-controlled configuration | Adopted: role/permission definitions in `@dream/rbac` constants |

**Key lesson**: Permit.io's cleanest contribution is the separation principle: authentication and authorization are orthogonal concerns that should be independently configurable. Our `@dream/auth` and `@dream/rbac` packages have no circular dependency, and a product could use `@dream/rbac` without `@dream/auth` if it has a different identity provider.

---

## Appendix: Cross-Reference Matrix

| Pattern # | Pattern Name | Primary Source | Foundation Package | Phase |
|-----------|-------------|----------------|-------------------|-------|
| 1 | Instance-based client | Stripe | @dream/auth | Phase 1 |
| 2 | Typed error hierarchy | Stripe, Razorpay, Firebase | @dream/errors | Phase 1 |
| 3 | resource:action permissions | Permit.io, existing SDK | @dream/rbac | Phase 1 |
| 4 | Never-throw flag evaluation | LaunchDarkly, Flagsmith | @dream/feature-flags | Phase 5 |
| 5 | Dual push/pull events | WorkOS, Stripe | SDK Layer 2 (webhooks) | Phase 5 |
| 6 | HMAC-SHA256 webhook signatures | Stripe, Razorpay | SDK Layer 2 (webhooks) | Phase 1 |
| 7 | JWT-embedded auth context | WorkOS, Frontegg, PropelAuth | @dream/auth | Phase 1 |
| 8 | Three-layer context propagation | WorkOS, PropelAuth, Stripe | @dream/multi-tenant | Phase 1 |
| 9 | Multi-context flag evaluation | LaunchDarkly | @dream/feature-flags | Phase 5 |
| 10 | Workflow notification orchestration | Novu | @dream/notifications | Phase 5 |
| 11 | Hash chain audit logging | WorkOS, Permit.io | @dream/audit | Phase 5 |
| 12 | Plan-based entitlements | LaunchDarkly, Frontegg, Chargebee | @dream/feature-flags + @dream/billing | Phase 5 |
| 13 | Auto-pagination iterators | Stripe | SDK Layer 2 | Phase 1 |
| 14 | Cursor pagination for events | Stripe, WorkOS | SDK Layer 2 | Phase 1 |
