# Competitor Research: Flagsmith
**Category**: Open-Source & Developer Platform
**Research Date**: 2026-02-07
**Researcher**: Claude (automated)

---

## 1. Company Profile

| Attribute | Detail |
|-----------|--------|
| **Website** | https://www.flagsmith.com |
| **Founded** | 2018 (Wilmslow, United Kingdom) |
| **Founders** | Ben Rometsch (CEO) |
| **Total Funding** | ~$229K (bootstrapped / minimal external funding) |
| **Latest Round** | Seed: ~$229K (Sep 2020) |
| **Revenue** | Not publicly disclosed; 250%+ growth since 2023 |
| **Target Market** | Engineering teams needing open-source feature flag management; enterprises requiring self-hosted deployment |
| **Market Position** | Leading open-source alternative to LaunchDarkly; positioned between enterprise feature flag tools and DIY solutions |
| **Key Customers** | Growing enterprise adoption, particularly in regulated industries requiring self-hosted/on-prem |
| **Open-Source Status** | Open-core (core feature flags open-source; enterprise features like SAML, audit logs, change requests require license) |
| **GitHub Stars** | ~5K (main repo -- flagsmith/flagsmith) |
| **Community Size** | Growing but smaller than competitors; active Discord and GitHub community |

### Strategic Positioning
Flagsmith has carved a unique niche as the bootstrapped, open-source alternative in the feature flag space. While LaunchDarkly dominates with $400M+ in funding and aggressive enterprise sales, Flagsmith competes on transparency, self-hosted deployment, and cost-effectiveness. Their strategy of growing efficiently without massive VC funding is notable and proves that feature flag tooling can be built sustainably.

### Market Context
The feature flag market is increasingly competitive with PostHog bundling free flags, Statsig offering generous free tiers, and GrowthBook providing open-source experimentation. Flagsmith differentiates through:
1. Dedicated focus on feature flags (not a secondary product)
2. Genuine self-hosted option (including private cloud)
3. Open-source core that is functionally complete
4. Multi-environment data model designed for enterprise workflows

---

## 2. Module Coverage Matrix

| # | Module Area | Flagsmith Support | Notes |
|---|------------|------------------|-------|
| 1 | **Auth (OAuth2/OIDC, JWT)** | ❌ Not Available | No authentication service. Flagsmith integrates with existing auth systems. |
| 2 | **Users (CRUD, profiles)** | ❌ Not Available | No user management. Flagsmith has "Identities" for flag targeting but not user CRUD. |
| 3 | **Roles & Permissions (RBAC)** | 🟡 Partial | RBAC for Flagsmith dashboard (Organization/Project/Environment levels). Not tenant-facing RBAC. Enterprise feature. |
| 4 | **Multi-Tenancy** | 🟡 Partial | Organization > Project > Environment data model. Designed for multi-team use, not multi-tenant SaaS infrastructure. |
| 5 | **SSO (SAML, OIDC)** | 🟡 Partial | SAML SSO for Flagsmith dashboard (Enterprise only). Not a tenant-facing SSO service. |
| 6 | **Teams** | 🟡 Partial | Team/group management within Flagsmith organizations. Not a tenant-facing teams module. |
| 7 | **Invitations** | 🟡 Partial | Invite users to Flagsmith organizations. Not a general-purpose invitation system. |
| 8 | **Webhooks** | ✅ Full | Webhook integration for flag change events. Configurable per environment with payload customization. |
| 9 | **API Keys** | 🟡 Partial | Server-side and client-side environment keys. Not per-user API key management. |
| 10 | **Email** | ❌ Not Available | No email sending capabilities. |
| 11 | **Settings** | ✅ Full | **Remote Config**: Core feature alongside feature flags. Key-value remote configuration with per-identity and per-segment overrides. |
| 12 | **Notifications** | ❌ Not Available | No push notification or in-app notification system. |
| 13 | **Feature Flags** | ✅ Full | **Core product**: Boolean flags, multivariate flags, segments, identity overrides, percentage rollouts, flag dependencies, scheduling, change requests. |
| 14 | **Audit Logging** | 🟡 Partial | Audit log for flag changes (Enterprise). Records who changed what flag in which environment. Not a general-purpose compliance audit system. |
| 15 | **Sessions** | ❌ Not Available | No session management capabilities. |
| 16 | **Billing** | ❌ Not Available | No billing/subscription infrastructure. |
| 17 | **Analytics** | 🟡 Partial | Flag analytics (usage tracking per flag). Integrations with analytics tools (Segment, Mixpanel, Heap, Amplitude, Rudderstack). Not a standalone analytics platform. |
| 18 | **File Storage** | ❌ Not Available | No file storage capabilities. |

**Coverage Summary**: 3 Full / 8 Partial / 7 Not Available

**Important Note**: Flagsmith is a dedicated feature flag and remote config platform. Its relevance to our SDK is primarily in the Feature Flags and Settings modules, where Flagsmith's architecture, data model, and SDK patterns are directly applicable.

---

## 3. SDK/API Design Patterns

### Client Initialization
```typescript
// JavaScript/TypeScript
import flagsmith from 'flagsmith';

flagsmith.init({
  environmentID: 'your-environment-id',
  api: 'https://edge.api.flagsmith.com/api/v1/',  // or self-hosted URL
  cacheFlags: true,
  enableAnalytics: true,
  onChange: (oldFlags, params) => {
    // Called when flags are updated
    console.log('Flags changed:', params.flagsChanged);
  }
});

// Get a flag value
const isEnabled = flagsmith.hasFeature('new_checkout');
const value = flagsmith.getValue('button_color');
```

```python
# Python (Server-side with local evaluation)
from flagsmith import Flagsmith

flagsmith = Flagsmith(
    environment_key='ser.your-server-key',
    enable_local_evaluation=True,  # Evaluate locally, no network per request
    environment_refresh_interval_seconds=60,
    enable_analytics=True
)

# Get flags for an identity
flags = flagsmith.get_identity_flags(
    identifier='user-123',
    traits={
        'plan': 'enterprise',
        'region': 'us',
        'employee_count': 250
    }
)

is_enabled = flags.is_feature_enabled('new_checkout')
value = flags.get_feature_value('max_upload_size')
```

```java
// Java
FlagsmithClient flagsmithClient = FlagsmithClient.newBuilder()
    .setApiKey("ser.your-server-key")
    .withLocalEvaluation(true)
    .withEnvironmentRefreshIntervalSeconds(60)
    .withAnalytics(true)
    .build();

// Get flags for identity
Flags flags = flagsmithClient.getIdentityFlags(
    "user-123",
    Map.of("plan", "enterprise", "region", "us")
);

boolean enabled = flags.isFeatureEnabled("new_checkout");
String value = flags.getFeatureValue("max_upload_size");
```

**Pattern**: Environment-key-based initialization. Separate server-side and client-side SDKs. Three evaluation modes: Remote (API per request), Local (poll + evaluate locally), Edge (low-latency CDN).

### Error Handling Model
- **Defensive by default**: SDKs designed for failure resilience
- Default values returned when flags cannot be evaluated
- Network failures handled with configurable retry and caching
- Stale flags served when API is unreachable (local evaluation mode)
- Comprehensive error callbacks for monitoring

**Flagsmith's defensive coding philosophy:**
```typescript
// Default values prevent crashes
const uploadLimit = flagsmith.getValue('max_upload_mb') ?? 10;  // Default to 10MB

// Error handler for monitoring
flagsmith.init({
  environmentID: 'env-key',
  onError: (error) => {
    // Log to monitoring, but app continues working
    Sentry.captureException(error);
  }
});
```

**Insight for Our SDK**: Flagsmith's defensive coding patterns are excellent for our Feature Flags module. Always require default values, never crash on flag evaluation failure, and serve stale flags when the service is unreachable.

### Real-Time Capabilities
- **No native real-time**: Flags updated via polling or on-demand fetch
- **Configurable poll interval**: Server-side SDKs poll at configurable intervals (default 60s)
- **Edge API**: Globally distributed API for low-latency flag evaluation
- **onChange callback**: Client-side SDK notifies when flags change after poll
- **Webhook notifications**: Push flag changes to external services

### Offline Support
- **Local evaluation mode**: After initial load, all evaluations happen locally without network
- **Caching**: Client-side SDKs cache flags in local storage
- **Stale-while-revalidate**: Serve cached flags while fetching updates
- **Bootstrap values**: Pre-load flags for instant availability

### Type Safety
- TypeScript SDK has full type definitions
- Flag values are typed as `string | null` (not strongly typed per flag)
- No auto-generated types from flag definitions
- Python SDK has type hints

### SDK Generation
- **Hand-crafted SDKs** for each platform
- Consistent API patterns across languages
- Not auto-generated from API spec

### Languages Supported
| Language | SDK Type | Status |
|----------|----------|--------|
| JavaScript/TypeScript | Client + Server | Official |
| Python | Server | Official |
| Java | Server | Official |
| .NET/C# | Server | Official |
| Go | Server | Official |
| Ruby | Server | Official |
| PHP | Server | Official |
| Rust | Server | Official |
| Elixir | Server | Official |
| Swift (iOS) | Client | Official |
| Kotlin (Android) | Client | Official |
| React Native | Client | Official |
| Flutter/Dart | Client | Official |
| Next.js | Client + Server | Official |

### Documentation Quality: 3.5/5
- Clear, practical documentation
- Good SDK quickstart guides
- Concept explanations are solid
- Architecture documentation is available
- Could improve: more real-world examples, advanced patterns, migration guides from competitors

---

## 4. Multi-Tenancy Approach

### Organization > Project > Environment Model
Flagsmith's data model is directly relevant to multi-tenant feature flag management:

```
Organization (Acme Corp)
├── Project A (Main App)
│   ├── Environment: Development
│   ├── Environment: Staging
│   ├── Environment: Production
│   │   ├── Feature: new_checkout (enabled: true, 50% rollout)
│   │   ├── Feature: max_upload_mb (value: "100")
│   │   ├── Segment: enterprise_users
│   │   │   └── Override: max_upload_mb = "500"
│   │   └── Identity: user-123
│   │       └── Override: new_checkout = true (100%)
│   └── Environment: Production (EU)
├── Project B (Admin Dashboard)
│   ├── Environment: Development
│   └── Environment: Production
```

### Key Data Model Concepts

1. **Organizations**: Top-level container for team members and projects
2. **Projects**: Contain environments that share the same feature set
3. **Environments**: Isolated configuration spaces (dev/staging/prod)
4. **Features**: Boolean flags or string/number remote config values
5. **Segments**: User groups defined by trait-based rules
6. **Identities**: Individual users with traits and per-identity overrides
7. **Traits**: Key-value metadata on identities (used for segment evaluation)

### RBAC at Multiple Levels
```
Organization Level:
  - Admin: Full control over org, projects, environments
  - User: Access to assigned projects

Project Level:
  - Admin: Manage environments, features, segments
  - Editor: Create/edit features and segments
  - Viewer: Read-only access

Environment Level:
  - Admin: Full control over environment features
  - Editor: Modify feature states and values
  - Viewer: Read-only access
```

### Actionable Insight for Our SDK
Flagsmith's hierarchical data model (Org > Project > Environment) maps well to multi-tenant SaaS:

| Flagsmith Concept | Our SDK Mapping |
|-------------------|----------------|
| Organization | Tenant / Account |
| Project | Application / Module |
| Environment | Environment (dev/staging/prod) |
| Feature | Feature Flag / Setting |
| Segment | User Segment / Cohort |
| Identity | End User |
| Trait | User Property / Attribute |

Our Feature Flags module should adopt this hierarchy and add:
1. Tenant-scoped flags (flags that exist per-tenant, not globally)
2. Tenant-level segments (segments scoped to a tenant)
3. Cross-tenant flag templates (define a flag once, deploy to all tenants)
4. Tenant admin self-service (tenants can manage their own flags)

---

## 5. Developer Experience

### Time to Hello World
- **5-10 minutes**: Create account, create project, create first flag, install SDK, evaluate flag
- Dashboard is straightforward with clear navigation
- SDK initialization requires minimal configuration

### Self-Hosted vs Cloud

| Aspect | Cloud | Self-Hosted (Open Source) | Self-Hosted (Enterprise) |
|--------|-------|--------------------------|--------------------------|
| Setup time | Minutes | 30 min - 2 hours | Hours (with support) |
| Features | Full | Core flags, segments, identities | Full (SAML, audit, change requests) |
| Cost | Usage-based | Free (infrastructure only) | License fee + infrastructure |
| Support | Included | Community only | Dedicated support |
| Deployment | N/A | Docker, Kubernetes, Helm | Docker, K8s, Helm, managed |
| Scale | Unlimited | Unlimited (self-manage) | Unlimited (with support) |
| RBAC | Full | Basic | Full |
| Audit Logs | Full | Not included | Full |
| SSO/SAML | Full | Not included | Full |

**Key Differentiator**: Unlike PostHog (which sunsetted K8s for self-hosted), Flagsmith maintains full Docker and Kubernetes support for self-hosted deployments. This is a significant advantage for enterprises.

### CLI Tools
- Flagsmith does not have a dedicated CLI tool
- Management via dashboard UI or REST API
- Terraform provider available for infrastructure-as-code
- GitHub integration for flag management in PRs

### Migration Tools
- REST API enables import/export of flag configurations
- No dedicated migration tool from LaunchDarkly, Split, etc.
- OpenFeature SDK support for provider-agnostic integration

### Framework Integrations
- React (with `flagsmith-react` package)
- Next.js (SSR support)
- Angular, Vue
- iOS, Android, React Native, Flutter
- Server-side: Express, Django, Rails, Spring Boot, etc.

### OpenFeature Support
Flagsmith is a provider for the OpenFeature standard:
```typescript
import { OpenFeature } from '@openfeature/web-sdk';
import { FlagsmithProvider } from '@openfeature/flagsmith-web-provider';

OpenFeature.setProvider(new FlagsmithProvider({
  environmentKey: 'your-env-key'
}));

const client = OpenFeature.getClient();
const value = await client.getBooleanValue('new-feature', false);
```

**Insight for Our SDK**: OpenFeature support allows our Feature Flags module to work with any provider. We should implement an OpenFeature provider for our SDK.

---

## 6. Enterprise Features

| Feature | Status | Details |
|---------|--------|---------|
| **Self-hosted / On-prem** | ✅ | Full Docker/K8s support; private cloud deployment |
| **SOC 2** | ✅ | SOC 2 Type II compliant (Cloud) |
| **HIPAA** | 🟡 | Available via self-hosted deployment; no explicit BAA for cloud |
| **Audit Logging** | ✅ | Enterprise: Who changed what flag, when, in which environment |
| **SSO/SAML** | ✅ | Enterprise plan |
| **RBAC** | ✅ | Enterprise: Organization/Project/Environment-level permissions |
| **Change Requests** | ✅ | Enterprise: Approval workflows for flag changes |
| **Scheduled Flags** | ✅ | Enterprise: Schedule flag changes for future dates |
| **SLA** | ✅ | Enterprise plan |
| **Flag Versioning** | ✅ | History of all flag changes with rollback |
| **Terraform Provider** | ✅ | Infrastructure-as-code support |
| **Stale Flag Detection** | ✅ | Identify flags that should be cleaned up |

### Change Request Workflow (Enterprise)
Flagsmith's change request feature is notable for enterprise governance:
1. Developer proposes a flag change
2. Change request created with description and context
3. Designated approvers review the change
4. Approved changes are applied atomically
5. Full audit trail of the approval process

**Insight for Our SDK**: Our Feature Flags module should support similar approval workflows for enterprise customers, especially in regulated industries.

---

## 7. Pricing Model

### Tier Breakdown

| Plan | Monthly Cost | API Requests | Team Members | Key Features |
|------|-------------|-------------|--------------|--------------|
| **Free** | $0 | 50,000/month | 1 | Core flags, segments, identities |
| **Start-Up** | $45 | 1,000,000/month | 3 | All Free features + additional scale |
| **Scale-Up** | $200 | Custom | Custom | Priority support, higher limits |
| **Enterprise** | Custom | Unlimited | Unlimited | SAML, audit logs, change requests, RBAC, self-hosted, dedicated support |

### Overage Pricing
- Start-Up: $7 per 100K additional requests
- Scale-Up/Enterprise: Custom rate per contract

### Self-Hosted Pricing
- **Open Source**: Free (core flags, segments, identities)
- **Enterprise License**: Custom pricing for SAML, audit, RBAC, change requests, scheduling

### Cost at Scale (estimated)

| MAU | Est. Flag Requests/Month | Plan | Est. Monthly Cost |
|-----|-------------------------|------|-------------------|
| 10K | ~500K | Free | $0 |
| 50K | ~2.5M | Start-Up | $45 + $105 overage = ~$150 |
| 100K | ~5M | Scale-Up | ~$200-400 |
| 500K | ~25M | Enterprise | Custom ($1,000-3,000) |
| 1M | ~50M | Enterprise | Custom ($2,000-5,000) |

*Assumes ~50 flag evaluations per MAU/month.*

### Cost Comparison vs LaunchDarkly
| Scale | Flagsmith | LaunchDarkly |
|-------|-----------|--------------|
| 10K MAU | $0-45 | $120+ |
| 100K MAU | $200-400 | $1,000+ |
| 1M MAU | $2,000-5,000 | $10,000+ |

Flagsmith is consistently 3-5x cheaper than LaunchDarkly at every scale, and the open-source option makes it free for self-hosted deployments.

---

## 8. Unique Differentiators

### Open-Source Core Completeness
Unlike many "open-core" products where the free version is crippled, Flagsmith's open-source core includes:
- Full feature flag management (boolean + multivariate)
- Segments with trait-based targeting
- Identity management and per-identity overrides
- Remote config (key-value settings)
- Multiple environment support
- All server-side and client-side SDKs
- REST API with full CRUD operations

The enterprise features (SAML, audit, change requests, RBAC) are genuinely enterprise-specific, not artificially gated core features.

### Three Evaluation Modes
Flagsmith's SDK architecture supports three distinct evaluation strategies:

1. **Remote Evaluation** (Client-side default):
   - Every flag check makes an API call
   - Always returns latest values
   - Higher latency, API dependency

2. **Local Evaluation** (Server-side recommended):
   - SDK downloads full environment on init
   - Polls for updates at configurable interval
   - Evaluates flags locally with zero latency
   - No API dependency per request
   - Requires server-side environment key

3. **Edge Evaluation** (CDN):
   - Flags served from globally distributed Edge API
   - Low-latency for client-side use
   - Cached at edge with fast propagation

**Insight for Our SDK**: This three-tier evaluation architecture is excellent for our Feature Flags module. Local evaluation is critical for performance-sensitive server-side applications. Edge evaluation is critical for global client-side apps.

### Self-Hosted Viability
Unlike PostHog (which sunsetted K8s) and Supabase (where self-hosted lacks enterprise features), Flagsmith's self-hosted story is strong:
- Docker Compose for simple deployments
- Kubernetes with Helm charts for production
- Terraform provider for IaC
- PostgreSQL backend (standard, portable)
- Redis for caching (optional)
- Full API compatibility between cloud and self-hosted

### Trait-Based Targeting
Flagsmith's segment system uses traits (user properties) for targeting:
```python
# Traits are key-value pairs on identities
flags = flagsmith.get_identity_flags(
    'user-123',
    traits={
        'plan': 'enterprise',      # String trait
        'employee_count': 500,      # Numeric trait
        'is_beta_tester': True,     # Boolean trait
        'signup_date': '2024-01-15' # Date trait
    }
)
```

Segment rules support operators:
- `EQUAL`, `NOT_EQUAL`
- `GREATER_THAN`, `LESS_THAN`, `GREATER_THAN_INCLUSIVE`, `LESS_THAN_INCLUSIVE`
- `CONTAINS`, `NOT_CONTAINS`
- `REGEX`
- `IN` (list matching)
- `PERCENTAGE_SPLIT` (consistent hashing for A/B tests)
- `IS_SET`, `IS_NOT_SET`
- `MODULO` (for numeric distribution)

---

## 9. SWOT Analysis vs Our SDK

### Strengths (Flagsmith has, we should note)
- **Genuine open-source core**: Feature-complete flag management without license fees
- **Self-hosted excellence**: Docker + K8s + Terraform; production-ready on-prem
- **Local evaluation**: Zero-latency flag evaluation for server-side apps
- **Clean data model**: Organization > Project > Environment hierarchy is well-designed
- **Enterprise workflows**: Change requests, scheduled flags, stale flag detection
- **Cost-effective**: 3-5x cheaper than LaunchDarkly; free for self-hosted
- **OpenFeature support**: Standards-compliant provider
- **Bootstrapped efficiency**: Proves sustainable business without massive VC burn

### Weaknesses (gaps we can exploit)
- **Feature flags only**: No auth, no data layer, no storage, no analytics, no notifications
- **Small community**: ~5K GitHub stars vs PostHog's 29K or Supabase's 81K
- **Limited funding**: $229K total vs competitors with $100M+ rounds
- **No built-in analytics**: Must integrate with external analytics tools
- **Documentation gap**: Good but not as comprehensive as Firebase or Supabase
- **No CLI tool**: Management only via dashboard or API
- **Remote config is basic**: Key-value only; no conditional evaluation like Firebase Remote Config

### Opportunities
- **Integration target**: Our Feature Flags module could offer a Flagsmith-compatible provider/adapter
- **Feature parity + more**: Match Flagsmith's flag capabilities and add tenant-scoped flags, billing-gated features, and deeper RBAC integration
- **Bundled value**: Our SDK provides flags + auth + RBAC + tenancy + settings in one package -- Flagsmith provides flags only
- **Enterprise positioning**: Our SDK with built-in audit logging, compliance features, and billing integration addresses enterprise needs that Flagsmith cannot alone

### Threats
- **OpenFeature standardization**: If feature flags become commoditized through OpenFeature, Flagsmith's open-source core could be "good enough" for everyone
- **PostHog bundling**: PostHog's free feature flags reduce demand for standalone tools
- **LaunchDarkly dominance**: LaunchDarkly's enterprise sales machine and brand recognition
- **DIY flags**: Simple flag implementations in application code reduce need for dedicated tools

---

## 10. Key Insights for Our SDK

### Open-Source Feature Flag Patterns
Flagsmith's open-source implementation provides the blueprint for our Feature Flags module:

**1. Flag Data Model:**
```typescript
// Flagsmith's flag model (study and adopt)
interface Feature {
  id: number;
  name: string;                    // e.g., 'new_checkout'
  type: 'STANDARD' | 'MULTIVARIATE';
  default_enabled: boolean;
  initial_value: string | null;    // For remote config values
}

interface FeatureState {
  feature: Feature;
  enabled: boolean;
  value: string | null;            // Current value in this environment
  environment: Environment;
}

interface Segment {
  id: number;
  name: string;
  rules: SegmentRule[];
  feature_overrides: FeatureStateOverride[];
}

interface SegmentRule {
  type: 'ALL' | 'ANY' | 'NONE';
  conditions: Condition[];
  rules: SegmentRule[];            // Nested rules for complex logic
}

interface Condition {
  property: string;                // Trait key
  operator: SegmentOperator;       // EQUAL, GREATER_THAN, etc.
  value: string | number | boolean;
}
```

**2. Evaluation Algorithm:**
The flag evaluation follows a priority order:
1. Identity override (highest priority -- explicit per-user)
2. Segment override (matched segment rules)
3. Environment default (base flag state)
4. Project default (lowest priority)

Our Feature Flags module should implement this same priority cascade:
```typescript
// Our SDK's evaluation priority
// 1. User-specific override
// 2. Tenant-specific override (OUR ADDITION)
// 3. Segment match override
// 4. Environment default
// 5. Global default

const result = await sdk.featureFlags.evaluate('new_checkout', {
  userId: 'user-123',
  tenantId: 'tenant-456',
  traits: { plan: 'enterprise', region: 'us' },
  environment: 'production'
});
```

**3. Local Evaluation Architecture:**
```
┌─────────────────────────────────────────────┐
│                  Application                 │
│                                              │
│   sdk.featureFlags.isEnabled('flag')         │
│         │                                    │
│         ▼                                    │
│   ┌─────────────┐                            │
│   │ Local Cache  │◄── Background Poll ──┐    │
│   │ (in-memory)  │    (every 60s)       │    │
│   └──────┬──────┘                       │    │
│          │                              │    │
│          ▼                              │    │
│   ┌─────────────┐              ┌────────┴──┐ │
│   │  Evaluator   │              │ Flag API   │ │
│   │ (segments,   │              │ Server     │ │
│   │  traits,     │              └────────────┘ │
│   │  overrides)  │                             │
│   └─────────────┘                              │
└─────────────────────────────────────────────────┘
```

Our Feature Flags module should implement this exact architecture with:
- In-memory flag cache
- Background polling thread (configurable interval)
- Local segment evaluation engine
- Consistent hashing for percentage rollouts
- Default value fallback on failure

### Self-Hosted Deployment Model
Flagsmith's self-hosted architecture is a reference for our SDK's deployment model:

**Components:**
```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Flagsmith   │   │   Flagsmith   │   │   Flagsmith   │
│   Dashboard   │   │   API Server  │   │   Edge API    │
│   (React)     │   │   (Django)    │   │   (CDN)       │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                   │
       ▼                  ▼                   ▼
┌──────────────────────────────────────────────────────┐
│                PostgreSQL (primary store)              │
│                                                       │
│   Organizations │ Projects │ Environments │ Flags     │
│   Identities │ Traits │ Segments │ Audit Logs        │
└───────────────────────────┬──────────────────────────┘
                            │
                            ▼
                   ┌──────────────┐
                   │    Redis     │
                   │  (caching)   │
                   └──────────────┘
```

**Lessons for our SDK's self-hosted deployment:**
1. **PostgreSQL as primary store**: Standard, portable, well-understood
2. **Redis for caching**: Optional but recommended for performance
3. **Separate API and Dashboard**: API can scale independently
4. **Edge/CDN layer**: Optional for global low-latency access
5. **Docker Compose for simple deployments**: One-command setup
6. **Helm charts for Kubernetes**: Production-grade deployment
7. **Terraform provider**: Infrastructure-as-code for enterprise DevOps

### Remote Config Patterns (for Our Settings Module)
Flagsmith's remote config is simpler than Firebase's but has useful patterns:

1. **Config as feature values**: Remote config and feature flags share the same data model -- a feature has both an `enabled` boolean and a `value` string
2. **Per-identity overrides**: Override config values for specific users
3. **Per-segment overrides**: Different config values for different user segments
4. **Environment-scoped**: Different values in dev/staging/prod
5. **Type flexibility**: Values stored as strings, parsed by SDK client

**For our Settings module:**
```typescript
// Combine Flagsmith's simplicity with Firebase's power
const settings = sdk.settings;

// Simple key-value (Flagsmith pattern)
const maxUpload = await settings.getValue('max_upload_mb', {
  default: 10,
  tenantId: 'tenant-123',
  userId: 'user-456'
});

// Conditional (Firebase pattern)
const config = await settings.evaluate({
  tenantId: 'tenant-123',
  conditions: { plan: 'enterprise', region: 'eu' }
});
```

### SDK Design Patterns to Adopt

**1. Three evaluation modes**: Remote, Local, Edge -- implement all three
**2. Defensive defaults**: Always require a default value for flag evaluations
**3. onChange callbacks**: Notify application when flags/settings change
**4. Stale-while-revalidate**: Serve cached values while fetching updates
**5. Analytics integration**: Track flag evaluations as events automatically
**6. OpenFeature provider**: Implement OpenFeature standard for interoperability

---

## 11. Research Sources

| Source | URL | Confidence |
|--------|-----|------------|
| Flagsmith Official Website | https://www.flagsmith.com | High |
| Flagsmith GitHub Repository | https://github.com/Flagsmith/flagsmith | High |
| Flagsmith Pricing | https://www.flagsmith.com/pricing | High |
| Flagsmith Documentation | https://docs.flagsmith.com | High |
| Flagsmith SDK Overview | https://docs.flagsmith.com/clients/ | High |
| Flagsmith Server SDKs | https://docs.flagsmith.com/clients/server-side | High |
| Flagsmith Platform Architecture | https://docs.flagsmith.com/flagsmith-concepts/platform-architecture | High |
| Flagsmith Data Model | https://docs.flagsmith.com/flagsmith-concepts/data-model | High |
| Flagsmith Segments | https://docs.flagsmith.com/flagsmith-concepts/segments | High |
| Flagsmith Identities | https://docs.flagsmith.com/flagsmith-concepts/identities | High |
| Flagsmith RBAC | https://docs.flagsmith.com/system-administration/rbac | High |
| Flagsmith Efficient API Usage | https://docs.flagsmith.com/best-practices/efficient-api-usage | High |
| Flagsmith Defensive Coding | https://docs.flagsmith.com/best-practices/defensive-coding | High |
| Flagsmith Segment Rule Operators | https://docs.flagsmith.com/flagsmith-concepts/segments/segment-rule-operators | High |
| Flagsmith vs LaunchDarkly | https://www.flagsmith.com/compare/flagsmith-vs-launchdarkly | Medium-High |
| Flagsmith Open Source Page | https://www.flagsmith.com/open-source | High |
| Flagsmith Self-Hosted | https://www.flagsmith.com/on-premises-and-private-cloud-hosting | High |
| Flagsmith About Us | https://www.flagsmith.com/about-us | High |
| Crunchbase: Flagsmith Funding | https://www.crunchbase.com/organization/bullet-train | Medium |
| Tracxn: Flagsmith Profile | https://tracxn.com/d/companies/flagsmith/__JC3qqcr6Kip5IWdUnbacLzKKGP5HIXD2mg-si_5g8gw | Medium |
| Statsig: LaunchDarkly vs Flagsmith | https://www.statsig.com/perspectives/feature-flags-comparison-launchdarkly-flagsmith | Medium |
| DeepWiki: Flagsmith Segments | https://deepwiki.com/Flagsmith/flagsmith/2.4-segments-and-targeting | Medium |
| G2: Flagsmith Pricing | https://www.g2.com/products/flagsmith/pricing | Medium |
| Flagsmith 2024 Feature Roundup | https://www.flagsmith.com/blog/2024-feature-roundup | Medium-High |
