# SDK/API Design Patterns & Developer Experience
## Cross-Competitor Analysis of 18 Platforms

**Date**: 2026-02-07
**Source**: Synthesized from 18 competitor research files
**Purpose**: Identify best-in-class SDK patterns and recommend designs for our Shared Platform SDK

---

## 1. SDK Design Pattern Comparison

### 1.1 Client Initialization Patterns

Client initialization is the first thing a developer encounters. Patterns vary significantly across competitors.

#### Pattern A: Instance-Based Client (Recommended)

**Stripe (Gold Standard):**
```python
# Python - Modern pattern (v8+)
from stripe import StripeClient
client = StripeClient("sk_test_...")
customer = client.v1.customers.retrieve("cus_xyz")
```

```typescript
// Node.js
const stripe = new Stripe('sk_test_...', {
  apiVersion: '2026-01-28.clover',
  maxNetworkRetries: 2,
});
const customer = await stripe.customers.retrieve('cus_xyz');
```

```java
// Java - Builder pattern
StripeClient client = StripeClient.builder()
    .setApiKey("sk_test_...")
    .build();
Customer customer = client.v1().customers().retrieve("cus_xyz");
```

**Key Insight**: Stripe migrated from global singleton to instance-based client in v8, calling the old pattern a mistake. No global mutable state. Multiple clients with different configs can coexist.

#### Pattern B: Environment Variable Auto-Configuration

**Clerk:**
```typescript
// Auto-configured from CLERK_SECRET_KEY env var
import { clerkClient } from '@clerk/clerk-sdk-node';
const users = await clerkClient.users.getUserList({ limit: 10 });
```

**Key Insight**: Reduces boilerplate when a single standard env var is set. Good for local dev, bad for multi-tenant server scenarios.

#### Pattern C: Factory Function with Config Object

**Supabase:**
```typescript
import { createClient } from '@supabase/supabase-js'
const supabase = createClient('https://xyzproject.supabase.co', 'public-anon-key', {
  auth: { persistSession: true, autoRefreshToken: true },
  realtime: { params: { eventsPerSecond: 10 } }
});
```

**Key Insight**: Config object allows module-specific configuration at init time.

#### Pattern D: App + Service Accessors

**Firebase:**
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const app = initializeApp({ apiKey: "...", projectId: "myapp" });
const auth = getAuth(app);
const db = getFirestore(app);
```

**Key Insight**: Modular imports enable tree-shaking. Services are obtained from an app instance. Good for bundle size optimization.

#### Pattern E: Long-Lived Streaming Client

**LaunchDarkly:**
```java
LDConfig config = new LDConfig.Builder()
    .http(Components.httpConfiguration().connectTimeout(Duration.ofSeconds(3)))
    .dataSource(Components.streamingDataSource().initialReconnectDelay(Duration.ofMillis(500)))
    .events(Components.sendEvents().capacity(5000))
    .build();
LDClient client = new LDClient("sdk-key-123", config);
```

**Key Insight**: Composable sub-builders for different configuration areas (HTTP, data source, events). Necessary when the client maintains persistent connections.

#### Pattern F: PDP Sidecar Architecture

**Permit.io:**
```python
permit = Permit(
    token="<your-api-key>",
    pdp="http://localhost:7766",  # Local policy decision point
)
```

**Key Insight**: Separates control plane (cloud) from data plane (local sidecar). Sub-millisecond latency for authorization checks, but requires Docker.

#### Comparison Matrix

| Competitor | Pattern | Env Var Auto-Config | Builder Pattern (Java) | Multi-Instance | Streaming |
|---|---|---|---|---|---|
| **Stripe** | Instance-based | No (explicit key) | Yes | Yes | No |
| **Clerk** | Singleton + env var | Yes | N/A (no Java SDK) | Limited | No |
| **Supabase** | Factory function | No | N/A | Yes | Yes (realtime) |
| **Firebase** | App + service accessor | Yes (ADC) | Yes | Yes | Yes |
| **LaunchDarkly** | Long-lived + builder | No | Yes (composable) | Yes | Yes (SSE) |
| **WorkOS** | Simple constructor | No | N/A | Yes | No |
| **Permit.io** | Instance + PDP URL | No | Yes | Yes | No |
| **Novu** | Simple constructor | No | No | Yes | No |
| **Flagsmith** | Builder + env key | No | Yes | Yes | Optional |
| **PostHog** | Simple + host | No | Yes (Builder) | Yes | No |
| **Chargebee** | Site-scoped key | No | N/A | Yes | No |
| **Razorpay** | Basic auth key pair | No | N/A | Yes | No |

#### RECOMMENDATION: Hybrid Instance-Based with Env Var Fallback

```python
# Python - Our recommended pattern
from shared_platform import PlatformClient

# Explicit configuration (preferred for servers)
client = PlatformClient(
    api_key="sk_live_...",
    tenant_id="tenant_123",
    environment="production",
    options=ClientOptions(
        timeout=30,
        max_retries=3,
        base_url="https://api.platform.example.com"
    )
)

# Env var fallback (convenient for local dev)
# Reads PLATFORM_API_KEY, PLATFORM_TENANT_ID from environment
client = PlatformClient()

# Access modules via namespaces
user = client.users.get("user_123")
flags = client.flags.variation("feature-x", context, default=False)
```

```typescript
// TypeScript
import { PlatformClient } from '@shared-platform/sdk';

const client = new PlatformClient({
  apiKey: 'sk_live_...',
  tenantId: 'tenant_123',
  environment: 'production',
});

const user = await client.users.get('user_123');
```

```java
// Java - Builder pattern
PlatformClient client = PlatformClient.builder()
    .apiKey("sk_live_...")
    .tenantId("tenant_123")
    .environment("production")
    .http(HttpConfig.builder().timeout(Duration.ofSeconds(30)).build())
    .build();

User user = client.users().get("user_123");
```

**Inspired by**: Stripe (instance-based, no global state), Clerk (env var convenience), LaunchDarkly (composable Java builders), Supabase (module-specific config).

---

### 1.2 Authentication Context Propagation

How competitors thread tenant/user context through SDK calls.

#### Middleware Pattern (Clerk, WorkOS, PropelAuth)

```typescript
// Clerk - Next.js middleware
import { clerkMiddleware } from '@clerk/nextjs/server';
export default clerkMiddleware();

// Access auth in server components
import { auth } from '@clerk/nextjs/server';
const { userId, orgId } = await auth();
```

```python
# PropelAuth - FastAPI dependency injection
from propelauth_fastapi import init_auth
auth = init_auth("https://YOUR_AUTH_URL.propelauthtest.com", "YOUR_API_KEY")

@app.get("/whoami")
async def whoami(user: User = Depends(auth.require_user)):
    return {"user_id": user.user_id}
    # user.orgIdToOrgMemberInfo for multi-tenant context
```

**Key Insight**: PropelAuth's `orgIdToOrgMemberInfo` map is the cleanest pattern for threading organization context. Every user object carries their tenant memberships.

#### Header-Based (Stripe Connect)

```python
# Stripe - Act on behalf of connected account
customer = client.v1.customers.retrieve(
    "cus_xyz",
    options={"stripe_account": "acct_connected_123"}
)
```

**Key Insight**: Per-request overrides via a header (`Stripe-Account`) allow any API call to be scoped to a specific tenant without changing client config.

#### Multi-Context Objects (LaunchDarkly)

```python
# LaunchDarkly - Multi-context evaluation
multi_context = Context.create_multi(
    Context.builder("user_123").kind("user").set("plan", "premium").build(),
    Context.builder("acme_corp").kind("organization").set("plan", "enterprise").build(),
    Context.builder("ipad_456").kind("device").set("os", "iPadOS").build()
)
show_feature = client.variation("advanced-analytics", multi_context, False)
```

**Key Insight**: Multi-context allows evaluating against user + tenant + device simultaneously. Critical for feature flags in multi-tenant SaaS.

#### JWT Claims (WorkOS, Stytch, Frontegg)

```typescript
// WorkOS - Tenant embedded in JWT
// JWT payload: { sub: "user_123", org_id: "org_456", permissions: ["read", "write"] }
// AuthKit middleware automatically validates and extracts
```

**Key Insight**: Embedding tenant ID and permissions in the JWT eliminates a database lookup on every request. WorkOS, Stytch, Frontegg, and PropelAuth all use this pattern.

#### RECOMMENDATION: Three-Layer Context Propagation

1. **Client-level default**: Set at initialization (tenant_id, environment)
2. **Per-request override**: Any call can override tenant context
3. **JWT-embedded context**: Middleware extracts and validates automatically

```python
# Layer 1: Client default
client = PlatformClient(api_key="...", tenant_id="acme_corp")

# Layer 2: Per-request override
user = client.users.get("user_123", options={"tenant_id": "beta_corp"})

# Layer 3: Middleware extracts from JWT
@app.get("/dashboard")
async def dashboard(ctx: PlatformContext = Depends(platform.require_auth)):
    # ctx.user_id, ctx.tenant_id, ctx.permissions automatically populated
    users = client.users.list(tenant_id=ctx.tenant_id)
```

---

### 1.3 Error Handling Models

#### Stripe's Error Hierarchy (Gold Standard)

```
StripeError (base)
  |-- CardError           # Payment-specific errors
  |-- InvalidRequestError  # 400 - Invalid parameters
  |-- AuthenticationError  # 401 - Auth failures
  |-- RateLimitError       # 429 - Too Many Requests
  |-- APIConnectionError   # Network issues
  |-- APIError             # Generic server errors
```

Each error contains: `status`, `code`, `param`, `user_message`, plus domain-specific fields.

**Key Innovation**: The `user_message` field provides text safe to display to end users.

#### Firebase's Namespaced Error Codes

```typescript
try {
  await signInWithEmailAndPassword(auth, email, password);
} catch (error) {
  if (error.code === 'auth/user-not-found') { /* handle */ }
  if (error.code === 'auth/wrong-password') { /* handle */ }
}
```

**Key Innovation**: Namespaced codes (`auth/user-not-found`) are intuitive and searchable.

#### Razorpay's Rich Error Context

```json
{
  "error": {
    "code": "BAD_REQUEST_ERROR",
    "description": "The amount must be at least INR 1.00",
    "source": "business",
    "step": "payment_initiation",
    "reason": "input_validation_failed",
    "metadata": {}
  }
}
```

**Key Innovation**: The `source` + `step` + `reason` triple provides debugging context that other error models lack.

#### Stytch's Typed Error Details

```python
try:
    response = client.magic_links.email.login_or_create(email="user@example.com")
except StytchError as e:
    print(e.details.error_type)  # Programmatic error classification
```

#### Supabase's Result Tuple (JS only)

```typescript
const { data, error } = await supabase.from('users').select('*');
if (error) { /* handle */ }
```

**Note**: This pattern is popular in JS but Supabase is inconsistent across languages (Python raises exceptions). We should NOT adopt this pattern for consistency.

#### LaunchDarkly/Flagsmith's Never-Throw Pattern

```python
# Feature flag evaluation NEVER throws exceptions
value = client.flags.variation("flag-key", context, default=False)
# Always returns default on error
```

**Key Innovation**: For feature flags and analytics, evaluation must never crash the application. Default values are mandatory.

#### Cross-Competitor Error Pattern Comparison

| Competitor | Error Model | HTTP Mapping | Machine-Readable Code | User-Safe Message | Debug Context |
|---|---|---|---|---|---|
| **Stripe** | Typed hierarchy | Yes | Yes (`code`) | Yes (`user_message`) | Yes (`param`) |
| **Clerk** | ClerkAPIError | Yes | Yes (error codes) | No | Limited |
| **Stytch** | StytchError | Yes | Yes (`error_type`) | No | Yes (`details`) |
| **Razorpay** | JSON error object | Yes | Yes (`code`) | Yes (`description`) | Yes (`source`+`step`+`reason`) |
| **Chargebee** | JSON error object | Yes | Yes (`api_error_code`) | Yes (`message`) | Yes (`param`) |
| **Firebase** | Namespaced codes | Partial | Yes (`auth/code`) | No | Limited |
| **WorkOS** | HTTP + JSON | Yes | Limited | No | Limited |
| **LaunchDarkly** | Never-throw | N/A | N/A (returns default) | N/A | Via `variation_detail()` |

#### RECOMMENDATION: Our Error Handling Hierarchy

```
PlatformError (base)
  |-- ValidationError        # 400 - Invalid parameters
  |   Fields: param, message, user_message
  |
  |-- AuthenticationError    # 401 - Invalid/missing credentials
  |   Fields: message
  |
  |-- AuthorizationError     # 403 - Insufficient permissions
  |   Fields: required_permission, message
  |
  |-- NotFoundError          # 404 - Resource not found
  |   Fields: resource_type, resource_id, message
  |
  |-- ConflictError          # 409 - Resource conflict
  |   Fields: resource_type, existing_id, message
  |
  |-- RateLimitError         # 429 - Rate limit exceeded
  |   Fields: retry_after, limit, remaining, message
  |
  |-- ServerError            # 5xx - Server-side error
  |   Fields: request_id, message
  |
  |-- ConnectionError        # Network errors
  |   Fields: message

Common fields on all errors:
  - status: int (HTTP status code)
  - code: str (machine-readable, namespaced: "users/not-found", "auth/token-expired")
  - message: str (developer-facing description)
  - request_id: str (for support/debugging)
  - source: str (which module: "auth", "users", "roles")
  - user_message: Optional[str] (safe to display to end users)
```

**Python example:**
```python
from shared_platform.errors import ValidationError, NotFoundError

try:
    user = client.users.create(data={"email": "invalid"})
except ValidationError as e:
    print(e.status)        # 400
    print(e.code)          # "users/invalid-email"
    print(e.param)         # "email"
    print(e.user_message)  # "Please enter a valid email address"
    print(e.request_id)    # "req_abc123"
except NotFoundError as e:
    print(e.code)          # "users/not-found"
    print(e.resource_type) # "user"
    print(e.resource_id)   # "user_xyz"
```

**TypeScript example:**
```typescript
import { ValidationError, NotFoundError } from '@shared-platform/sdk';

try {
  const user = await client.users.create({ email: 'invalid' });
} catch (e) {
  if (e instanceof ValidationError) {
    console.log(e.code);        // "users/invalid-email"
    console.log(e.param);       // "email"
    console.log(e.userMessage); // "Please enter a valid email address"
  }
}
```

**Java example:**
```java
import com.platform.sdk.exceptions.*;

try {
    User user = client.users().create(createRequest);
} catch (ValidationException e) {
    System.out.println(e.getCode());        // "users/invalid-email"
    System.out.println(e.getParam());       // "email"
    System.out.println(e.getUserMessage()); // "Please enter a valid email address"
} catch (NotFoundException e) {
    System.out.println(e.getResourceType()); // "user"
}
```

**Special case -- Feature Flags**: Flag evaluation NEVER throws. Always returns default value on any error. Use `variation_detail()` for debugging.

**Inspired by**: Stripe (hierarchy + user_message), Firebase (namespaced codes), Razorpay (source/step/reason context), LaunchDarkly (never-throw for flags).

---

### 1.4 Pagination Approaches

#### Cursor-Based (Stripe, WorkOS, Razorpay)

**Stripe:**
```python
# Manual pagination
customers = client.v1.customers.list(limit=100)
# Returns: { data: [...], has_more: true }

# Auto-pagination iterator (best DX)
for customer in client.v1.customers.list(limit=100).auto_paging_iter():
    print(customer.id)
```

**Node.js auto-pagination:**
```typescript
for await (const customer of stripe.customers.list({ limit: 100 })) {
  console.log(customer.id);
}
```

**WorkOS:**
```python
# Cursor-based with 'after' parameter
events = workos_client.events.list(after="event_01234", limit=50)
```

#### Offset-Based (Clerk, Frontegg, PropelAuth)

**Clerk:**
```typescript
const users = await clerkClient.users.getUserList({ limit: 10, offset: 20 });
// Returns: ClerkPaginatedResponse<User> with total_count
```

#### Comparison

| Approach | Competitors | Pros | Cons |
|---|---|---|---|
| **Cursor-based** | Stripe, WorkOS, Chargebee, Razorpay, CleverTap | Stable with concurrent writes, performant at depth | No random access, no total count |
| **Offset-based** | Clerk, Frontegg, PropelAuth, Freshworks | Simple, supports total_count, random page access | Unstable with concurrent writes, slow at depth |
| **Auto-pagination** | Stripe, PostHog | Best DX -- abstracts pagination entirely | Memory usage if iterating large sets |

#### RECOMMENDATION: Cursor-Based with Auto-Pagination Iterators

```python
# Python - Manual pagination
page = client.users.list(limit=100)
for user in page.data:
    process(user)
if page.has_more:
    next_page = client.users.list(limit=100, after=page.data[-1].id)

# Python - Auto-pagination (recommended)
for user in client.users.list(limit=100).auto_paging_iter():
    process(user)

# Python - Async auto-pagination
async for user in client.users.list(limit=100).auto_paging_iter_async():
    await process(user)
```

```typescript
// TypeScript - Auto-pagination with async iterator
for await (const user of client.users.list({ limit: 100 })) {
  await process(user);
}
```

```java
// Java - Stream-based auto-pagination
client.users().list(ListParams.builder().limit(100).build())
    .autoPagingIterable()
    .forEach(user -> process(user));
```

**Response shape:**
```json
{
  "data": [...],
  "has_more": true,
  "next_cursor": "usr_abc123"
}
```

**Inspired by**: Stripe (auto-pagination iterators), WorkOS (cursor-based with `after` parameter).

---

### 1.5 Rate Limiting Handling

#### Stripe's Server-Guided Retry

```
Response Headers:
  Stripe-Rate-Limited-Reason: endpoint-rate
  Stripe-Should-Retry: true
  Retry-After: 2
```

- SDK auto-retries on 409, 429, 5xx with exponential backoff + jitter
- `Stripe-Should-Retry: true/false` provides explicit server guidance
- Reasons categorized: global-concurrency, global-rate, endpoint-concurrency, endpoint-rate, resource-specific

#### Clerk's Rate Limit Structure

- Frontend: 5 req/10s for sign-up, 3 req/10s for auth attempts
- Backend: 1,000 req/10s for production
- 429 response with exponential backoff guidance

#### WorkOS's Clear Documentation

- 500 writes/10s for AuthKit
- 6,000 general requests/min
- 429 with backoff recommendation

#### LaunchDarkly's Automatic Backoff

- SDK handles reconnection with configurable initial delay
- Status tracking: INITIALIZING -> VALID -> INTERRUPTED -> OFF
- Listeners for status changes

#### RECOMMENDATION: Server-Guided Automatic Retry

```
Response Headers (on 429):
  X-RateLimit-Limit: 1000
  X-RateLimit-Remaining: 0
  X-RateLimit-Reset: 1707264060
  X-Should-Retry: true
  Retry-After: 2

SDK behavior:
  - Auto-retry on 429 and 5xx (configurable)
  - Exponential backoff with jitter
  - Respect Retry-After header
  - Max retries configurable (default: 3)
  - X-Should-Retry header for explicit guidance
```

**Inspired by**: Stripe (`Should-Retry` header, auto-retry with backoff).

---

### 1.6 Webhook Patterns

#### Stripe (Gold Standard)

```python
# HMAC-SHA256 signature verification
event = stripe.Webhook.construct_event(
    payload=request.body,          # Raw body (not parsed JSON)
    sig_header=request.headers['Stripe-Signature'],
    secret=endpoint_secret
)
# Signature format: t=timestamp,v1=signature
# Prevents replay attacks via timestamp validation
```

**API v2 Thin Events**: Lightweight payloads with just object ID references. Client fetches full state as needed. Eliminates version coupling.

**Key features**: Idempotency keys, automatic retries, event destinations, `Idempotent-Replayed: true` header.

#### Clerk (Svix-Powered)

```typescript
// Uses Svix for webhook delivery infrastructure
import { Webhook } from 'svix';
const wh = new Webhook(webhookSecret);
const payload = wh.verify(body, headers);
```

**Key Insight**: Outsourcing webhook delivery to Svix provides enterprise-grade reliability without building it.

#### Razorpay (HMAC-SHA256)

```python
# Three-way verification: order_id + payment_id + signature
generated_signature = hmac.new(
    key=webhook_secret.encode(),
    msg=f"{order_id}|{payment_id}".encode(),
    digestmod=hashlib.sha256
).hexdigest()
```

**Key features**: At-least-once delivery, automatic retries with increasing delays, separate test/live webhook configs.

#### WorkOS (Dual Model)

- **Push**: Webhooks with 6 retries over 3 days, exponential backoff
- **Pull**: Events API with cursor pagination, 90-day retention

**Key Insight**: Offering both push (webhooks) AND pull (Events API) gives developers maximum flexibility and resilience.

#### Novu (Webhook as Channel)

Novu uses webhooks as a notification delivery channel rather than an event system. Different pattern, relevant for our Notifications module.

#### Comparison

| Competitor | Signature Method | Retry Policy | Thin Events | Pull Alternative | Idempotency |
|---|---|---|---|---|---|
| **Stripe** | HMAC-SHA256 + timestamp | Auto, configurable | Yes (v2) | No | Yes (idempotency key) |
| **Clerk/Svix** | Svix signature | Svix-managed | No | No | Yes |
| **Razorpay** | HMAC-SHA256 | Auto, exponential | No | No | Receipt-based |
| **WorkOS** | Documented | 6 retries / 3 days | No | Yes (Events API) | Via event ID |
| **Chargebee** | Basic auth only | Auto, 2 days | No | No | Via event ID |
| **Flagsmith** | Configurable | Per-environment | No | No | No |

#### RECOMMENDATION: Stripe-Inspired with Pull Alternative

```python
# Signature verification utility
event = client.webhooks.construct_event(
    payload=request.body,              # Raw body bytes
    sig_header=request.headers['X-Platform-Signature'],
    secret=webhook_secret,
    tolerance=300                      # Max age in seconds (replay protection)
)

# Signature format: t=1707264000,v1=5257a869e...
# HMAC-SHA256 with timestamp prefix for replay attack prevention

# Event structure
{
  "id": "evt_abc123",                 # Unique event ID for idempotency
  "type": "user.created",             # Namespaced event type
  "created_at": "2026-02-07T10:00:00Z",
  "data": {
    "object": { ... }                 # Full resource object
  },
  "tenant_id": "tenant_123",          # Tenant context
  "api_version": "2026-02-01"         # API version that generated event
}
```

**Pull-based alternative (Events API):**
```python
# Poll for events instead of receiving webhooks
events = client.events.list(
    after="evt_last_processed",
    types=["user.created", "user.updated"],
    limit=100
)
for event in events.auto_paging_iter():
    process(event)
```

**Inspired by**: Stripe (HMAC + timestamp, thin events), WorkOS (push + pull dual model), Razorpay (at-least-once delivery).

---

## 2. Multi-Language SDK Consistency

### 2.1 Language Coverage Matrix

| Competitor | Python | Node/TS | Java | Go | Ruby | .NET | PHP | Rust |
|---|---|---|---|---|---|---|---|---|
| **Stripe** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No |
| **Clerk** | Yes | Yes (primary) | No | Yes | Yes | Yes | No | No |
| **WorkOS** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes (Kotlin) |
| **Supabase** | Yes | Yes (primary) | No | Community | No | Yes | No | Community |
| **Firebase** | Yes (Admin) | Yes | Yes | Yes (Admin) | Yes (Admin) | Yes | Yes | No |
| **LaunchDarkly** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Novu** | Yes | Yes (primary) | Community | Community | Community | Community | Community | No |
| **Permit.io** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No |
| **Flagsmith** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **PostHog** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| **Razorpay** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No |
| **Chargebee** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No |
| **Zoho** | Yes | Yes | Yes | No | No | Yes | Yes | No |
| **Freshworks** | No | Yes (primary) | No | No | No | No | No | No |
| **CleverTap** | Yes (server) | Yes (web) | Yes (server) | No | No | No | No | No |
| **Frontegg** | Yes | Yes (primary) | No | No | No | No | No | No |
| **PropelAuth** | Yes | Yes | No | Yes | No | No | No | Yes |
| **Stytch** | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No |

**Our Minimum**: Python, Node.js/TypeScript, Java (as stated in CLAUDE.md). Go and Ruby should be on the roadmap.

### 2.2 SDK Generation Approaches

| Approach | Competitors | Quality | Maintenance Cost |
|---|---|---|---|
| **Hand-crafted** | Stripe, Clerk, LaunchDarkly, Flagsmith | Highest (idiomatic, ergonomic) | Highest |
| **Auto-generated "humanlike"** | Stytch | High (readable, idiomatic) | Medium |
| **OpenAPI-generated** | Frontegg | Medium (functional, less ergonomic) | Lowest |
| **Hybrid (auto-gen base + hand-craft API)** | Supabase | High | Medium |
| **SDK generation platforms** | Postman (via Fern/liblab) | Variable | Low (outsourced) |

**Stytch's "Humanlike" Approach**: Generate SDKs from API specs but invest in making them readable and idiomatic. This is the sweet spot between hand-crafted quality and auto-generated maintenance efficiency.

**Postman's Acquisitions**: Postman acquired both liblab (Nov 2025) and Fern (Jan 2026) -- the two leading SDK generation platforms. This signals that SDK generation is becoming a commodity. Our SDKs should use OpenAPI specs as the single source of truth, with hand-crafted high-level client APIs.

#### RECOMMENDATION: Hybrid Approach

1. Define all APIs in OpenAPI specs (`openapi/{module}/{module}-api.yaml`)
2. Auto-generate base client code, types, and models from specs
3. Hand-craft the high-level client API (namespace organization, auto-pagination, error mapping)
4. Validate SDK behavior against OpenAPI specs in CI

### 2.3 Type Safety Patterns

#### TypeScript

**WorkOS (Best-in-class):**
```typescript
// Discriminated unions enforce mutually exclusive options at compile time
type AuthorizationURLOptions =
  | { connection: string; organization?: never; provider?: never }
  | { organization: string; connection?: never; provider?: never }
  | { provider: string; connection?: never; organization?: never };
```

**Clerk:**
```typescript
// Generic paginated response
type ClerkPaginatedResponse<T> = {
  data: T[];
  total_count: number;
};
```

**Stripe:**
```typescript
// Comprehensive type definitions for all resources
const customer: Stripe.Customer = await stripe.customers.retrieve('cus_xyz');
```

#### Python

**Stripe (v8+):**
```python
# Full type hints, typed response objects (not raw dicts)
customer: stripe.Customer = client.v1.customers.retrieve("cus_xyz")
```

**Supabase:**
```python
# Type generation from schema via CLI
# supabase gen types > types.py
```

#### Java

**Stripe:**
```java
// Builder pattern for request construction
Customer customer = client.v1().customers().retrieve("cus_xyz");
```

**LaunchDarkly:**
```java
// Builder with sub-builders for configuration
LDConfig config = new LDConfig.Builder()
    .http(Components.httpConfiguration().connectTimeout(Duration.ofSeconds(3)))
    .build();
```

#### RECOMMENDATION: Type Safety Rules

| Language | Pattern | Rule |
|---|---|---|
| **TypeScript** | Discriminated unions, generics | No `any` types. `PaginatedResponse<T>`. Compile-time enforcement. |
| **Python** | Type hints, dataclasses/Pydantic | All public functions typed. Response objects are typed (not dicts). |
| **Java** | Builder pattern, Optional, generics | Builder for complex objects. `Optional<T>` for nullable returns. |

---

## 3. Developer Experience Patterns

### 3.1 Time to Hello World

| Rank | Competitor | Time to Hello World | Approach |
|---|---|---|---|
| 1 | **Firebase** | 3-5 minutes | Console setup, copy-paste init code |
| 2 | **PostHog** | Under 5 minutes | Install SDK, add API key, autocapture |
| 3 | **Stripe** | ~5 minutes | Minimal code, test keys |
| 4 | **Supabase** | 5-10 minutes | Dashboard, install SDK, first query |
| 5 | **Clerk** | 5-10 minutes | Provider wrapper, drop-in component |
| 6 | **Flagsmith** | 5-10 minutes | Create flag, install SDK, evaluate |
| 7 | **LaunchDarkly** | 5-10 minutes | Free tier, SDK key, first flag |
| 8 | **WorkOS** | 10-15 minutes | AuthKit hosted UI |
| 9 | **Novu** | ~10 minutes (cloud) | Install SDK, create workflow, trigger |
| 10 | **PropelAuth** | 10-15 minutes | Framework-specific setup |
| 11 | **Permit.io** | ~15 minutes | Requires Docker PDP setup |
| 12 | **Stytch** | 15-20 minutes | Separate consumer/B2B setup |
| 13 | **Frontegg** | ~30 minutes | Complex multi-context setup |

**Our Target**: Under 10 minutes for the first working API call.

### 3.2 Documentation Patterns

| Rating | Competitor | Key Documentation Pattern |
|---|---|---|
| **5/5** | Stripe | Three-column layout (nav, content, live code). Personalized keys. Interactive hover-to-highlight. |
| **5/5** | Firebase | Per-platform guides. Video tutorials + codelabs. Interactive samples. |
| **5/5** | Chargebee | Interactive API explorer. Code samples in all languages. Visual lifecycle diagrams. |
| **5/5** | Postman | API-first. Executable docs (collections). "Try it" buttons. |
| **4.5/5** | Clerk | Unified docs site. Component references. Framework-specific quickstarts. |
| **4.5/5** | WorkOS | Clear guides. Framework-specific. Widely praised DX. |
| **4.5/5** | LaunchDarkly | Per-SDK reference. Conceptual docs. Migration guides. |
| **4.5/5** | Razorpay | Interactive API reference. Step-by-step integration guides. |
| **4/5** | Supabase | AI-powered search. Auto-generated from types. Interactive examples. |
| **4/5** | PostHog | Public handbook. Practical. Code examples. |
| **4/5** | Zoho | Per-product API reference. Interactive explorer. Postman collections. |
| **4/5** | Stytch | Separate consumer/B2B docs. Good API reference. |
| **4/5** | PropelAuth | Praised as "remarkably clear." Concise. |
| **4/5** | CleverTap | Comprehensive developer docs. SDK integration guides. |
| **3.5/5** | Frontegg | Two doc sites (confusing). Good feature coverage. |
| **3.5/5** | Novu | Good quickstarts. Workflow docs. Room for improvement. |
| **3.5/5** | Permit.io | Clear quickstarts. Good RBAC/ABAC/ReBAC conceptual docs. |
| **3.5/5** | Flagsmith | Clean, practical. Good SDK quickstarts. |
| **3.5/5** | Freshworks | Inconsistent across products. FDK docs comprehensive. |

#### RECOMMENDATION: Documentation Standards

1. **Three-column layout** with navigation, content, and live code (Stripe model)
2. **Framework-specific quickstarts** for Next.js, FastAPI, Django, Spring Boot, Express
3. **All code examples in all three SDK languages** side-by-side
4. **Interactive API explorer** with "Try it" functionality
5. **CLI tool** for local development and webhook testing (like Stripe CLI)
6. **Per-module quickstart** with under-10-minute target
7. **Unified single documentation site** -- never split docs across portals (Frontegg anti-pattern)

### 3.3 Testing Support

#### LaunchDarkly's TestData Fixture (Best-in-Class)

```python
from ldclient.testing import TestData

td = TestData.data_source()
td.update(td.flag("my-flag").variation_for_all(True))

config = Config("fake-key", update_processor_class=td)
client = LDClient(config=config)

assert client.variation("my-flag", context, False) == True
```

**Key Innovation**: Test without connecting to a real service. Configure flag states in test code. Zero network calls.

#### Stripe's Test Mode

- Separate `sk_test_` keys for testing
- Test clocks for time-sensitive scenarios (subscriptions, trials)
- All test operations are completely isolated from production

#### Supabase's Local Development

- `supabase start` launches full local development stack via Docker
- `supabase gen types` generates TypeScript types from local schema
- Data import/export for seeding test environments

#### Firebase's Emulator Suite

- Local emulators for Auth, Firestore, Storage, Functions
- Web-based UI for data inspection
- Hot reload for Cloud Functions

#### RECOMMENDATION: Testing Support Pattern

```python
# Unit testing with mock data source (LaunchDarkly pattern)
from shared_platform.testing import MockPlatformClient, TestFlagData

test_flags = TestFlagData()
test_flags.set_flag("new-feature", variation_for_all=True)

client = MockPlatformClient(
    flags=test_flags,
    users=[{"id": "user_123", "email": "test@example.com"}],
    roles=[{"name": "admin", "permissions": ["read", "write"]}]
)

# All operations work without network calls
assert client.flags.variation("new-feature", context, False) == True
user = client.users.get("user_123")
assert user.email == "test@example.com"
```

```python
# Integration testing with local mock server
from shared_platform.testing import LocalServer

with LocalServer(port=8080) as server:
    client = PlatformClient(base_url="http://localhost:8080", api_key="test-key")
    user = client.users.create(data={"email": "test@example.com"})
    assert user.id is not None
```

**Inspired by**: LaunchDarkly (TestData fixtures), Stripe (test mode + test clocks), Supabase (local dev stack).

---

## 4. Feature-Specific SDK Patterns

### 4.1 Feature Flag Evaluation

**Best patterns from LaunchDarkly and Flagsmith:**

#### Local Evaluation with Streaming (LaunchDarkly)

```
SDK Init -> Download all flag configs -> Persistent SSE connection
                                              |
Each evaluation -> Local computation (~1ms)  <--- Real-time updates
                   No network call per eval
```

- Server-side SDKs evaluate locally after initial download
- Client-side SDKs receive pre-evaluated values only (security)
- ~10ms median evaluation latency (local)

#### Never-Throw Evaluation

```python
# Even if SDK is not initialized, returns default
value = client.flags.variation("flag-key", context, default=False)
# NEVER throws -- always returns a value
```

Both LaunchDarkly and Flagsmith enforce this pattern. Feature flags are on the critical path -- they must not crash the application.

#### Multi-Context Targeting (LaunchDarkly)

```python
context = Context.create_multi(
    Context.builder("user_123").kind("user").set("plan", "premium").build(),
    Context.builder("acme_corp").kind("organization").set("tier", "enterprise").build()
)
```

#### Three Evaluation Modes (Flagsmith)

1. **Remote**: API call per evaluation (client-side default)
2. **Local**: Download + evaluate locally (server-side recommended)
3. **Edge**: CDN-served for low-latency global access

#### Evaluation Detail for Debugging (LaunchDarkly)

```python
detail = client.flags.variation_detail("new-checkout", context, default=False)
print(detail.value)           # True
print(detail.reason.kind)     # "RULE_MATCH"
print(detail.reason.rule_id)  # "rule_123"
```

#### Test Fixtures (LaunchDarkly)

```python
from shared_platform.testing import TestFlagData

test_data = TestFlagData()
test_data.set_flag("my-flag", variation_for_all=True)

client = PlatformClient(api_key="fake-key", flags=FlagConfig(data_source=test_data))
assert client.flags.variation("my-flag", context, False) == True
```

#### Entitlements Pattern (LaunchDarkly + Chargebee)

```python
# Feature gating by subscription tier
# Flag: "advanced-reporting"
#   IF tenant.plan == "free" -> false
#   IF tenant.plan == "pro" -> true
#   IF tenant.plan == "enterprise" -> true

has_reporting = client.flags.variation("advanced-reporting", context, False)

# Or dedicated entitlements API (Chargebee model):
entitlements = client.entitlements.evaluate(
    tenant_id="acme_corp",
    features=["advanced-reporting", "custom-branding", "api-access"]
)
# Returns: {"advanced-reporting": True, "custom-branding": True, "api-access": True}
```

### 4.2 Notification Workflow

**Best patterns from Novu:**

#### Trigger-Based API

```python
await client.notifications.trigger(
    workflow_id="order-confirmation",
    to="subscriber_123",
    payload={"order_id": "ORD-789", "total": 99.99},
    tenant_id="acme_corp"
)
```

#### Workflow Definition with Steps

```javascript
const workflow = workflow('comment-notification', async ({ step, payload }) => {
    await step.inApp('in-app-step', async () => ({
        body: `${payload.commenterName} commented on your post`
    }));
    await step.delay('delay-step', async () => ({ amount: 24, unit: 'hours' }));
    await step.email('email-step', async () => ({
        subject: 'You have unread comments',
        body: `${payload.commenterName} commented on "${payload.postTitle}"`
    }), { skip: () => wasInAppRead });
});
```

**Step types**: channel steps (inApp, email, sms, push, chat) + action steps (delay, digest, custom).

#### Subscriber Preferences (Two-Tier)

```python
# Global: "I don't want SMS for anything"
await client.notifications.preferences.set_global(
    subscriber_id="user_123",
    channels={"email": True, "sms": False, "in_app": True}
)

# Per-workflow: "No email for marketing-updates"
await client.notifications.preferences.set(
    subscriber_id="user_123",
    workflow_id="marketing-updates",
    channels={"email": False}
)
```

#### Topics for Fan-Out

```python
await client.notifications.topics.create(key="engineering", name="Engineering Team")
await client.notifications.topics.add_subscribers("engineering", ["user_1", "user_2"])
await client.notifications.trigger(
    workflow_id="team-announcement",
    to={"type": "topic", "key": "engineering"},
    payload={"message": "Sprint review tomorrow"}
)
```

### 4.3 Billing Integration

**Best patterns from Stripe and Chargebee:**

#### Subscription State Machine (Chargebee)

```
future -> in_trial -> active -> non_renewing -> cancelled
                             -> paused -> active
```

Each transition fires webhook events. Proration handled automatically on plan changes.

#### Product Catalog Hierarchy (Chargebee)

```
Item Family -> Item -> Item Price -> Subscription Item
```

Supports flat, per-unit, tiered, volume, and stairstep pricing models.

#### Metered Usage Reporting (Stripe + Chargebee)

```python
# Report usage
client.billing.usage.report(
    subscription_id="sub_123",
    metric="api_calls",
    quantity=1500,
    timestamp="2026-02-07T10:00:00Z"
)
# Server aggregates per billing period -> invoiced at period end
```

#### Entitlements Bridge (Chargebee)

Chargebee's Features API defines feature types:
- **Switch**: Boolean on/off ("Advanced Analytics")
- **Quantity**: Numeric limits ("10 team members")
- **Range**: Tiered ranges ("100-500 API calls")
- **Custom**: Custom entitlement levels

Plans define which features are entitled. Runtime API checks entitlements.

### 4.4 Authorization Checking

**Best patterns from Permit.io:**

#### The `check()` Primitive

```python
permitted = await client.permissions.check(
    user="user_123",
    action="edit",
    resource={"type": "document", "id": "doc_456", "tenant": "acme_corp"}
)
```

#### RBAC + ABAC + ReBAC (Progressive)

```python
# RBAC: user -> role -> permissions
await client.roles.assign(user_id="user_123", role="admin", tenant_id="acme")

# ABAC: attribute-based policies
# Allow if user.department == "engineering" AND resource.classification != "confidential"

# ReBAC: relationship-based
await client.relationships.create(
    subject="user:user_123",
    relation="owner",
    object="document:doc_456"
)
# Permissions derived: owner -> can edit, delete, share
```

#### Tenant-Scoped Roles

```python
# Same user, different roles per tenant
await client.roles.assign(user_id="user_123", role="admin", tenant_id="acme")
await client.roles.assign(user_id="user_123", role="viewer", tenant_id="beta")
```

#### Bulk Permission Checks

```python
results = await client.permissions.check_bulk([
    {"user": "user_123", "action": "read", "resource": "document:doc_1"},
    {"user": "user_123", "action": "edit", "resource": "document:doc_2"},
    {"user": "user_123", "action": "delete", "resource": "document:doc_3"},
])
# Returns: [True, True, False]
```

---

## 5. Recommended Patterns for Our SDK

### 5.1 Client Initialization Pattern

**Pattern**: Instance-based with env var fallback, namespace-based module access, composable Java builders.

```python
# Python
from shared_platform import PlatformClient, ClientOptions

client = PlatformClient(
    api_key="sk_live_...",          # or PLATFORM_API_KEY env var
    tenant_id="tenant_123",         # or PLATFORM_TENANT_ID env var
    environment="production",
    options=ClientOptions(timeout=30, max_retries=3)
)

# Async variant
from shared_platform import AsyncPlatformClient
client = AsyncPlatformClient(api_key="sk_live_...")
user = await client.users.get("user_123")
```

```typescript
// TypeScript
import { PlatformClient } from '@shared-platform/sdk';

const client = new PlatformClient({
  apiKey: process.env.PLATFORM_API_KEY!,
  tenantId: 'tenant_123',
  environment: 'production',
  timeout: 30_000,
  maxRetries: 3,
});
```

```java
// Java
PlatformClient client = PlatformClient.builder()
    .apiKey("sk_live_...")
    .tenantId("tenant_123")
    .environment("production")
    .http(HttpConfig.builder()
        .timeout(Duration.ofSeconds(30))
        .maxRetries(3)
        .build())
    .build();
```

**Inspired by**: Stripe (instance-based), Clerk (env var), LaunchDarkly (composable Java builders), Supabase (namespace access).

### 5.2 Error Handling Hierarchy

```
PlatformError
  |-- ValidationError        (400)  # param, user_message
  |-- AuthenticationError    (401)  # credentials invalid
  |-- AuthorizationError     (403)  # required_permission
  |-- NotFoundError          (404)  # resource_type, resource_id
  |-- ConflictError          (409)  # existing resource conflict
  |-- RateLimitError         (429)  # retry_after, limit, remaining
  |-- ServerError            (5xx)  # request_id for support
  |-- ConnectionError              # network failures

All errors carry:
  - status (int)
  - code (str, namespaced: "users/not-found")
  - message (str, developer-facing)
  - request_id (str)
  - user_message (Optional[str], safe for end users)
```

**Special case**: Feature flag evaluation and analytics capture NEVER throw. Return default values silently.

**Inspired by**: Stripe (hierarchy + user_message), Firebase (namespaced codes), Razorpay (rich debug context).

### 5.3 Pagination Approach

**Pattern**: Cursor-based with auto-pagination iterators in all three languages.

```python
# Python
for user in client.users.list(limit=100).auto_paging_iter():
    process(user)

# Async
async for user in client.users.list(limit=100).auto_paging_iter_async():
    await process(user)
```

```typescript
// TypeScript
for await (const user of client.users.list({ limit: 100 })) {
  await process(user);
}
```

```java
// Java
client.users().list(ListParams.builder().limit(100).build())
    .autoPagingIterable()
    .forEach(user -> process(user));
```

**Response format**: `{ data: [...], has_more: boolean, next_cursor: string }`

**Inspired by**: Stripe (auto-pagination iterators), WorkOS (cursor-based `after` parameter).

### 5.4 Webhook Verification Pattern

**Pattern**: HMAC-SHA256 with timestamp for replay protection, plus a pull-based Events API alternative.

```python
# Python
event = client.webhooks.construct_event(
    payload=request.body,
    sig_header=request.headers['X-Platform-Signature'],
    secret=webhook_secret,
    tolerance=300  # seconds
)

match event.type:
    case "user.created":
        handle_user_created(event.data)
    case "role.assigned":
        handle_role_assigned(event.data)
```

```typescript
// TypeScript
const event = client.webhooks.constructEvent(
  request.body,
  request.headers['x-platform-signature'],
  webhookSecret
);

switch (event.type) {
  case 'user.created':
    handleUserCreated(event.data);
    break;
}
```

```java
// Java
Event event = client.webhooks().constructEvent(
    requestBody,
    request.getHeader("X-Platform-Signature"),
    webhookSecret
);

if ("user.created".equals(event.getType())) {
    handleUserCreated(event.getData());
}
```

**Inspired by**: Stripe (HMAC + timestamp), WorkOS (Events API pull alternative), Razorpay (at-least-once delivery).

### 5.5 Context Propagation Pattern

**Pattern**: Three-layer context -- client default, per-request override, middleware-extracted JWT.

```python
# Layer 1: Client default
client = PlatformClient(api_key="...", tenant_id="acme_corp")

# Layer 2: Per-request override (Stripe-Account header pattern)
user = client.users.get("user_123", options={"tenant_id": "beta_corp"})

# Layer 3: Framework middleware (PropelAuth/Clerk pattern)
from shared_platform.fastapi import platform_middleware, require_auth

app = FastAPI()
app.add_middleware(platform_middleware, client=client)

@app.get("/users")
async def list_users(ctx: PlatformContext = Depends(require_auth)):
    # ctx.user_id, ctx.tenant_id, ctx.permissions auto-populated from JWT
    return client.users.list(tenant_id=ctx.tenant_id)
```

```typescript
// TypeScript - Express middleware
import { platformMiddleware, requireAuth } from '@shared-platform/express';

app.use(platformMiddleware({ client }));

app.get('/users', requireAuth(), async (req, res) => {
  // req.platform.userId, req.platform.tenantId, req.platform.permissions
  const users = await client.users.list({ tenantId: req.platform.tenantId });
  res.json(users);
});
```

```java
// Java - Spring Boot
@RestController
public class UserController {
    @GetMapping("/users")
    public List<User> listUsers(@PlatformAuth PlatformContext ctx) {
        // ctx.getUserId(), ctx.getTenantId(), ctx.getPermissions()
        return client.users().list(ListParams.builder()
            .tenantId(ctx.getTenantId())
            .build());
    }
}
```

**Inspired by**: Stripe (per-request `Stripe-Account` header), PropelAuth (`orgIdToOrgMemberInfo`), Clerk (middleware + useAuth hooks).

### 5.6 Testing Support Pattern

**Pattern**: Mock client with configurable test data, no network calls required.

```python
# Python - Unit testing
from shared_platform.testing import MockPlatformClient, TestFlagData

test_flags = TestFlagData()
test_flags.set_flag("new-feature", variation_for_all=True)
test_flags.set_flag("rate-limit", value=500)

client = MockPlatformClient(
    flags=test_flags,
    users=[
        {"id": "user_1", "email": "alice@example.com", "role": "admin"},
        {"id": "user_2", "email": "bob@example.com", "role": "viewer"},
    ]
)

# Works identically to real client -- no network calls
assert client.flags.variation("new-feature", context, False) == True
assert client.users.get("user_1").email == "alice@example.com"
```

```typescript
// TypeScript - Unit testing
import { MockPlatformClient, TestFlagData } from '@shared-platform/testing';

const flags = new TestFlagData();
flags.setFlag('new-feature', { variationForAll: true });

const client = new MockPlatformClient({ flags });

expect(client.flags.isEnabled('new-feature', context)).toBe(true);
```

```java
// Java - Unit testing
TestFlagData flags = new TestFlagData();
flags.setFlag("new-feature", FlagVariation.forAll(true));

PlatformClient client = MockPlatformClient.builder()
    .flags(flags)
    .build();

assertTrue(client.flags().boolVariation("new-feature", context, false));
```

**Inspired by**: LaunchDarkly (TestData fixtures), Stripe (test mode with test clocks), Firebase (Emulator Suite).

### 5.7 Multi-Language Consistency Rules

Based on the analysis of how competitors maintain (or fail to maintain) consistency:

| Rule | Description | Rationale |
|---|---|---|
| **Same method names** | `list()`, `get()`, `create()`, `update()`, `delete()` across all languages | Stripe, Clerk, WorkOS all follow this |
| **Same error hierarchy** | `ValidationError`/`ValidationException` with same fields | Prevents language-specific debugging confusion |
| **Same module namespaces** | `client.users`, `client.roles`, `client.flags` | Consistent mental model |
| **Language-idiomatic naming** | `snake_case` (Python), `camelCase` (TS/Java) for local names | Respect language conventions |
| **Same response shapes** | Identical JSON structures, same field names | Cross-language interoperability |
| **Feature parity** | All features in all three SDKs simultaneously | Novu's Python/Java lag behind Node -- avoid this |
| **Consistent async patterns** | `method()` + `method_async()` (Python), native `await` (TS), sync (Java) | Stripe's pattern for Python |
| **Same pagination model** | Cursor-based with auto-pagination in all languages | Stripe achieves this across 8 languages |

**Anti-patterns to avoid**:
- Novu's Python SDK uses separate API classes (`EventApi`, `SubscriberApi`) while Node uses unified client
- Supabase returns `{ data, error }` in JS but raises exceptions in Python
- Freshworks only has an official Node.js SDK -- no Python, Java
- Frontegg's Python SDK has basic types while TypeScript is auto-generated from OpenAPI

### 5.8 Documentation Standards

Based on best-in-class examples from Stripe (5/5), Firebase (5/5), Chargebee (5/5), and Postman (5/5):

| Standard | Implementation | Reference |
|---|---|---|
| **Three-column layout** | Navigation, Content, Live Code | Stripe |
| **Personalized code samples** | Inject test API keys when logged in | Stripe |
| **Framework quickstarts** | Next.js, FastAPI, Django, Spring Boot, Express | Clerk, WorkOS |
| **Per-module quickstart** | Under 10 minutes per module | LaunchDarkly |
| **Interactive API explorer** | "Try it" with real API calls | Chargebee, Postman |
| **Code in all 3 languages** | Python, TypeScript, Java side-by-side | Chargebee |
| **Visual lifecycle diagrams** | State machines, flow diagrams | Chargebee |
| **CLI tool** | Local webhook testing, code generation | Stripe CLI, Supabase CLI |
| **Postman collections** | Published for every module | Postman, Razorpay |
| **Error code reference** | Searchable, per-module | Stripe, Firebase |
| **Migration guides** | From competitors and between versions | LaunchDarkly |
| **Single unified site** | Never split docs | Anti-pattern: Frontegg (two sites) |
| **Versioned documentation** | Docs versioned alongside API | Chargebee |

---

## Appendix A: Pattern Decision Summary

| Decision | Chosen Pattern | Inspired By | Rejected Alternative | Reason |
|---|---|---|---|---|
| Client Init | Instance-based + env fallback | Stripe v8 | Global singleton (Stripe v7) | No global state, multi-instance safe |
| Auth Context | 3-layer (client, per-request, JWT) | Stripe + PropelAuth | Single layer | Flexibility for different use cases |
| Error Handling | Typed hierarchy + namespaced codes | Stripe + Firebase | Result tuples (`{data, error}`) | Consistency across languages |
| Pagination | Cursor-based + auto-pagination | Stripe | Offset-based | Stable under concurrent writes |
| Rate Limiting | Server-guided auto-retry | Stripe | Client-only backoff | Server knows best when to retry |
| Webhooks | HMAC-SHA256 + Events API | Stripe + WorkOS | Basic auth only | Security + flexibility |
| SDK Generation | Hybrid (auto-gen + hand-craft) | Stytch | Pure auto-gen | Quality + maintainability balance |
| Testing | Mock client with TestData | LaunchDarkly | No testing support | Essential for DX |
| Feature Flags | Local evaluation, never-throw | LaunchDarkly + Flagsmith | Remote-only | Performance + reliability |
| Authorization | check() primitive with RBAC/ABAC/ReBAC | Permit.io | RBAC-only | Progressive complexity |
| Notifications | Trigger-based workflow engine | Novu | Direct channel send | Orchestration flexibility |

## Appendix B: SDK Quality Scoring

| Competitor | Init Pattern | Error Handling | Pagination | Type Safety | Testing Support | DX Score | Overall |
|---|---|---|---|---|---|---|---|
| **Stripe** | 5 | 5 | 5 | 5 | 5 | 5 | **5.0** |
| **LaunchDarkly** | 4 | 4 | N/A | 4 | 5 | 4.5 | **4.3** |
| **WorkOS** | 4 | 3 | 4 | 5 | 3 | 4.5 | **3.9** |
| **Clerk** | 4 | 3 | 3 | 5 | 3 | 4.5 | **3.8** |
| **Chargebee** | 3 | 4 | 4 | 3 | 3 | 5 | **3.7** |
| **Supabase** | 4 | 3 | 3 | 4 | 4 | 4 | **3.7** |
| **Flagsmith** | 4 | 4 | 3 | 3 | 3 | 3.5 | **3.4** |
| **PostHog** | 3 | 3 | 3 | 3 | 3 | 4 | **3.2** |
| **Firebase** | 4 | 3 | 2 | 3 | 4 | 5 | **3.5** |
| **Razorpay** | 3 | 4 | 3 | 2 | 3 | 4.5 | **3.3** |
| **Permit.io** | 4 | 3 | 3 | 3 | 3 | 3.5 | **3.3** |
| **Novu** | 3 | 3 | 3 | 3 | 3 | 3.5 | **3.1** |
| **Stytch** | 3 | 4 | 3 | 4 | 3 | 4 | **3.5** |
| **PropelAuth** | 3 | 3 | 3 | 3 | 4 | 4 | **3.3** |
| **Frontegg** | 3 | 2 | 3 | 3 | 2 | 3.5 | **2.8** |
| **Zoho** | 3 | 3 | 3 | 3 | 2 | 4 | **3.0** |
| **Freshworks** | 2 | 3 | 3 | 2 | 2 | 3.5 | **2.6** |
| **CleverTap** | 3 | 3 | 3 | 2 | 2 | 4 | **2.8** |

**Our target**: Match Stripe's 5.0 for our core modules. This means best-in-class initialization, error handling, pagination, type safety, testing support, and documentation.
