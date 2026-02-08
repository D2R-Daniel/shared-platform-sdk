# Feature Specification: Platform Component Expansion — Billing, Notifications, Feature Flags, Audit, Analytics & File Storage

**Feature Branch**: `006-platform-component-expansion`
**Created**: 2026-02-06
**Status**: Draft
**Input**: Strategic overview for 6 reusable platform components based on competitor research across Auth0, Clerk, WorkOS, Stripe, Firebase, Supabase, Knock, Novu, PostHog, Segment, LaunchDarkly, Nango, PropelAuth, Flagsmith, and Cloudinary. Identifies high-value components the SDK should add to achieve full SaaS platform parity.

## Executive Summary

The Shared Platform SDK currently provides 12 modules focused on authentication, user management, authorization, and multi-tenancy. A prior competitive analysis (spec 001) identified auth-specific gaps (MFA, Passkeys, Passwordless, Sessions, SCIM) but did not address the broader SaaS platform landscape.

This specification expands the analysis across 14+ competitor platforms to identify 6 high-value component categories that modern SaaS platforms require beyond identity and access management. Two of these components (Feature Flags, Audit Logging) already have partial client implementations in the SDK but lack formal models, API specifications, and cross-language parity.

### Current SDK Capabilities (Existing)

| Module | Status | Category |
| ------ | ------ | -------- |
| Authentication (OAuth2/OIDC, JWT) | Implemented | Identity |
| Users (CRUD, profiles, bulk ops) | Implemented | Identity |
| Roles & Permissions (Hierarchical RBAC) | Implemented | Authorization |
| Multi-Tenancy (isolation, custom domains) | Implemented | Organization |
| SSO (Azure AD, Okta, Google, SAML, OIDC) | Implemented | Identity |
| Teams (hierarchy, member management) | Implemented | Organization |
| Invitations (token-based, bulk) | Implemented | Organization |
| Webhooks (events, signature verification) | Implemented | Integration |
| API Keys (rate limiting, IP restrictions) | Implemented | Integration |
| Email (templates, SMTP configuration) | Implemented | Communication |
| Settings (tenant configuration) | Implemented | Configuration |
| Notifications (email/SMS/push/in-app) | Implemented | Communication |
| Feature Flags (evaluate, isEnabled) | Code only (Python/Node) | Product |
| Audit Logging (log, list, get) | Code only (Python/Node) | Compliance |

### New Component Gap Analysis

| Component | Stripe | Knock/Novu | LaunchDarkly | PostHog | WorkOS | Supabase | Our SDK |
| --------- | ------ | ---------- | ------------ | ------- | ------ | -------- | ------- |
| Billing & Subscriptions | Core product | — | — | — | — | — | Missing |
| Notification Workflows | — | Core product | — | — | — | — | Partial |
| Feature Flags & Entitlements | — | — | Core product | Yes | — | — | Code only |
| Audit Logging (Compliance) | — | — | — | — | Core product | — | Code only |
| Analytics & Usage Tracking | Usage metering | — | — | Core product | — | — | Missing |
| File Storage & Management | — | — | — | — | — | Core product | Missing |

---

## RICE Prioritization Scoring

### Scoring Methodology

- **Reach**: Users impacted per quarter (enterprise customers = ~5000 users avg)
- **Impact**: 3=Massive (deal breaker), 2=High, 1=Medium, 0.5=Low, 0.25=Minimal
- **Confidence**: 100%=High (validated), 80%=Medium, 50%=Low (assumption)
- **Effort**: Person-months to implement across all 3 SDKs

### Component Scores

| Component | Reach | Impact | Confidence | Effort (PM) | RICE Score | Rank |
| --------- | ----- | ------ | ---------- | ----------- | ---------- | ---- |
| Feature Flags & Entitlements | 5000 | 2.0 | 90% | 3.0 | **3000** | 1 |
| Audit Logging (Full) | 3000 | 3.0 | 95% | 3.0 | **2850** | 2 |
| Billing & Subscriptions | 5000 | 3.0 | 80% | 8.0 | **1500** | 3 |
| Multi-channel Notifications | 4000 | 2.0 | 80% | 5.0 | **1280** | 4 |
| Analytics & Usage Tracking | 3000 | 2.0 | 70% | 6.0 | **700** | 5 |
| File Storage & Management | 2000 | 1.5 | 60% | 5.0 | **360** | 6 |

### Scoring Rationale

- **Feature Flags & Entitlements** scores highest RICE because partial code exists (reducing effort to 3 PM), 90% confidence from validated patterns, and entitlements directly enable plan-based monetization.
- **Audit Logging** scores high because partial code exists, compliance is a hard requirement (95% confidence), and the foundation is already built in Python/Node.
- **Billing** has the highest raw business value (Reach 5000, Impact 3) but the highest effort (8 PM for payment integrations), resulting in a moderate RICE score despite being strategically critical.
- **Notifications** has moderate RICE — the existing module already supports 4 channels. The upgrade effort is for workflow orchestration and real-time feed capabilities.
- **Analytics** is mid-tier — it feeds billing (critical dependency for usage metering) but is a large greenfield effort with lower confidence.
- **File Storage** is lowest — important for platform completeness but not a differentiator. Many customers already have dedicated storage solutions.

---

## MoSCoW Categorization

### Must Have (Non-negotiable for platform completeness)

| Component | RICE Score | Justification |
| --------- | ---------- | ------------- |
| Feature Flags & Entitlements | 3000 | Existing code needs formalization; directly enables plan-based monetization; blocks billing entitlement integration |
| Audit Logging (Full) | 2850 | Existing code needs formalization; required for SOC2/GDPR compliance; already committed in spec 001 as P1 |

### Should Have (High value, strong business case)

| Component | RICE Score | Justification |
| --------- | ---------- | ------------- |
| Billing & Subscriptions | 1500 | Highest strategic value for revenue generation; every SaaS product needs billing; complex but essential |
| Multi-channel Notifications | 1280 | Substantial foundation exists; workflow orchestration is what Knock/Novu offer as their core differentiator |

### Could Have (Desirable, improves competitiveness)

| Component | RICE Score | Justification |
| --------- | ---------- | ------------- |
| Analytics & Usage Tracking | 700 | Feeds billing usage metering; valuable for product intelligence; large greenfield effort |
| File Storage & Management | 360 | Common platform need; pairs with user profiles and content; lower priority as standalone solutions exist |

---

## Priority Summary (Combined RICE + MoSCoW)

| Priority | Component | MoSCoW | RICE | Category | Effort | Target |
| -------- | --------- | ------ | ---- | -------- | ------ | ------ |
| P1 | Feature Flags & Entitlements | Must | 3000 | Product | M (3 PM) | Phase 1 |
| P1 | Audit Logging (Full) | Must | 2850 | Compliance | M (3 PM) | Phase 1 |
| P2 | Billing & Subscriptions | Should | 1500 | Revenue | L (8 PM) | Phase 2 |
| P3 | Multi-channel Notifications | Should | 1280 | Communication | M (5 PM) | Phase 4 |
| P3 | Analytics & Usage Tracking | Could | 700 | Intelligence | M (6 PM) | Phase 3 |
| P4 | File Storage & Management | Could | 360 | Infrastructure | M (5 PM) | Phase 5 |

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Subscription Lifecycle Management (Priority: P1)

As a platform operator, I need to create, upgrade, downgrade, and cancel tenant subscriptions so that revenue is accurately tracked and tenants have the correct feature access based on their plan.

**Why this priority**: Every SaaS platform requires billing. Subscription management directly impacts revenue and determines what features tenants can access. Without it, plan-based access control is manual and error-prone.

**Independent Test**: Can be fully tested by creating a tenant subscription, upgrading its plan, verifying feature access changes, and confirming correct billing records are generated.

**Acceptance Scenarios**:

1. **Given** a new tenant signs up, **When** they select a plan (free/basic/pro/enterprise), **Then** a subscription is created with the correct billing cycle, pricing, and feature entitlements.
2. **Given** a tenant on the "basic" plan, **When** they upgrade to "pro" mid-cycle, **Then** the billing system prorates the charge and the tenant's feature entitlements update immediately.
3. **Given** a tenant cancels their subscription, **When** the current billing period ends, **Then** access degrades to "free" tier limits and the tenant receives a cancellation confirmation.
4. **Given** a payment fails, **When** the retry schedule is exhausted after configured attempts, **Then** the tenant is suspended with a grace period notification and an option to update payment details.

---

### User Story 2 — Usage Metering & Invoicing (Priority: P1)

As a finance administrator, I need usage tracked against plan limits and invoices generated automatically so that customers are billed accurately for what they consume.

**Why this priority**: Usage-based pricing is the fastest-growing SaaS billing model. Without metering, the platform can only support flat-rate subscriptions, limiting pricing flexibility and revenue optimization.

**Independent Test**: Can be fully tested by recording usage events for a metered resource, generating an invoice at period end, and verifying line items match actual consumption.

**Acceptance Scenarios**:

1. **Given** a tenant has a metered plan with 10,000 included API calls, **When** they make 12,000 API calls in a month, **Then** the 2,000 overage is calculated and added to the next invoice.
2. **Given** an invoice is generated at billing cycle end, **When** the tenant views it, **Then** it contains line items for the base subscription amount plus any metered usage charges.
3. **Given** a tenant approaches 80% of a usage limit, **When** the threshold is crossed, **Then** an automated notification warns the tenant of approaching limits.

---

### User Story 3 — Feature Flag Evaluation with Plan-Based Entitlements (Priority: P1)

As a product manager, I need to gate features by subscription plan so that free-tier tenants cannot access premium features and plan upgrades unlock new capabilities instantly.

**Why this priority**: Feature entitlements connect billing plans to actual product access. Without this, there is no automated way to control which features a tenant can use based on what they pay for.

**Independent Test**: Can be fully tested by evaluating a feature flag for tenants on different plans and verifying that access matches plan entitlements.

**Acceptance Scenarios**:

1. **Given** a tenant is on the "basic" plan, **When** the application evaluates the "advanced-analytics" flag, **Then** the flag returns disabled with reason "plan_restriction".
2. **Given** a tenant upgrades from "basic" to "pro", **When** the entitlement-gated flag is re-evaluated, **Then** the flag immediately returns enabled.
3. **Given** a flag has percentage rollout set to 10%, **When** 1,000 users evaluate the flag, **Then** approximately 100 see it enabled with consistent assignment (same user always gets same result).

---

### User Story 4 — Percentage-Based Rollouts & A/B Testing (Priority: P2)

As a developer, I need to gradually roll out features to a percentage of users with targeting rules so that I can control risk and gather feedback before full release.

**Why this priority**: Controlled rollouts reduce deployment risk. Every modern development team expects feature flag capabilities for safe releases.

**Independent Test**: Can be fully tested by configuring a flag for 25% rollout, evaluating it across a sample population, and verifying approximately 25% see the feature enabled with sticky assignment.

**Acceptance Scenarios**:

1. **Given** a flag is configured for 25% rollout to users with the "beta_tester" attribute, **When** 100 beta testers evaluate the flag, **Then** approximately 25 see it enabled.
2. **Given** a flag has multiple variants (A/B/C at 33% each), **When** a user evaluates the flag, **Then** they are consistently assigned to the same variant across sessions.
3. **Given** a flag is in "development" environment, **When** evaluated in "production", **Then** the production environment configuration is used, not development.

---

### User Story 5 — Compliance-Ready Audit Log Export (Priority: P1)

As a compliance officer, I need to export audit logs in formats compatible with SIEM tools so that I can meet SOC2, GDPR, and HIPAA audit requirements.

**Why this priority**: Audit logging is required for all major compliance certifications. Enterprise customers cannot adopt platforms without comprehensive, exportable audit capabilities.

**Independent Test**: Can be fully tested by performing actions that generate audit events, exporting logs in SIEM format, and verifying all required compliance fields are present.

**Acceptance Scenarios**:

1. **Given** audit logs exist for the past 90 days, **When** I configure an export, **Then** logs are provided in standard formats (JSON, CSV, CEF) with all required compliance fields.
2. **Given** a retention policy of 1 year is configured, **When** logs older than 1 year exist, **Then** they are automatically archived per the retention policy.
3. **Given** a user's role is changed from "viewer" to "admin", **When** the change is recorded, **Then** the audit entry contains both the old and new role values, the actor, timestamp, and IP address.

---

### User Story 6 — Real-Time Audit Streaming & Alerting (Priority: P2)

As a security operations analyst, I need real-time streaming of security-critical events with configurable alerts so that threats are detected and responded to within minutes.

**Why this priority**: Reactive audit logging (querying after the fact) is insufficient for security. Real-time streaming enables proactive threat detection.

**Independent Test**: Can be fully tested by configuring an alert rule, triggering the matching condition, and verifying the alert fires within the configured timeframe.

**Acceptance Scenarios**:

1. **Given** an alert rule is configured for "5 failed logins in 10 minutes", **When** the 5th failed login is recorded, **Then** a real-time alert is sent to the configured webhook endpoint.
2. **Given** audit event streaming is configured, **When** any security event occurs, **Then** the event is delivered to the streaming endpoint within 30 seconds.

---

### User Story 7 — Notification Workflow Orchestration (Priority: P2)

As a platform developer, I need to define notification workflows that route messages across channels with fallback logic so that users are reliably reached through their preferred channel.

**Why this priority**: Multi-channel notification orchestration is what differentiates platforms like Knock and Novu. The current email-focused approach misses users who prefer push or in-app notifications.

**Independent Test**: Can be fully tested by defining a workflow with channel fallback, triggering a notification, and verifying delivery follows the defined fallback sequence.

**Acceptance Scenarios**:

1. **Given** a workflow is configured with "push first, email fallback after 5 minutes", **When** a notification is triggered, **Then** push is sent first, and email is sent only if push is not read within 5 minutes.
2. **Given** a workflow targets a user who has disabled push notifications, **When** the notification is triggered, **Then** the system skips push and immediately delivers via the next configured channel.
3. **Given** a batch window of 15 minutes is configured, **When** 10 notifications arrive within that window, **Then** they are combined into a single digest notification.

---

### User Story 8 — Real-Time Notification Feed (Priority: P2)

As an end user, I need a real-time in-app notification feed so that I can see, filter, and act on notifications without leaving the application.

**Why this priority**: In-app notification feeds are a standard feature in modern SaaS applications. They drive engagement and reduce email dependency.

**Independent Test**: Can be fully tested by triggering notifications and verifying they appear in real-time in the notification feed with correct content, filtering, and batch actions.

**Acceptance Scenarios**:

1. **Given** a user has 50 unread notifications, **When** they open the notification feed, **Then** notifications are displayed chronologically with real-time updates for new arrivals.
2. **Given** a user is viewing the notification feed, **When** a new notification arrives, **Then** it appears immediately without requiring a page refresh.
3. **Given** a user selects multiple notifications, **When** they perform a batch action (mark all read, archive), **Then** all selected notifications are updated.

---

### User Story 9 — Custom Event Tracking & Usage Aggregation (Priority: P2)

As a platform developer, I need to track custom events and aggregate usage metrics so that accurate data is available for billing metering and product analytics.

**Why this priority**: Event tracking is the foundation for both billing (usage metering) and product intelligence. Without it, metered billing cannot function and product decisions lack data.

**Independent Test**: Can be fully tested by tracking custom events, querying usage aggregations, and verifying counts match expected values within the configured delay tolerance.

**Acceptance Scenarios**:

1. **Given** a tenant has metered billing on API calls, **When** usage events are tracked throughout the month, **Then** accurate counts are available to the billing system within 5 minutes of the event.
2. **Given** events have been tracked for 30 days, **When** I query daily active users (DAU), **Then** the system returns correct counts per day.
3. **Given** an event schema requires a "resource_type" property, **When** an event is tracked without this property, **Then** the event is rejected with a validation error.

---

### User Story 10 — Product Analytics Queries (Priority: P3)

As a product manager, I need to query user engagement data so that I can make data-driven product decisions about feature adoption, retention, and user behavior.

**Why this priority**: Product analytics transform raw event data into actionable insights. Without them, product decisions rely on intuition rather than evidence.

**Independent Test**: Can be fully tested by querying pre-defined metrics (DAU, MAU, feature adoption, retention) and verifying results match manually calculated values.

**Acceptance Scenarios**:

1. **Given** events have been tracked for 30 days, **When** I query "feature adoption" for the "export" feature, **Then** I see the adoption rate, usage frequency, and trend over time.
2. **Given** a 3-step onboarding funnel is defined (signup, profile complete, first action), **When** I view the funnel, **Then** I see conversion rates between each step with breakdown by plan tier.
3. **Given** a cohort is defined as "users who signed up in January", **When** I view retention for this cohort, **Then** I see week-over-week retention percentages.

---

### User Story 11 — Secure File Upload with Access Control (Priority: P3)

As a platform developer, I need to upload files on behalf of tenants with automatic access control so that files are isolated per tenant and only authorized users can access them.

**Why this priority**: File storage is a common need across SaaS applications (profile photos, documents, exports). Tenant-scoped storage with access control prevents data leaks between tenants.

**Independent Test**: Can be fully tested by uploading a file for one tenant, verifying another tenant cannot access it, and confirming authorized users can download via signed URLs.

**Acceptance Scenarios**:

1. **Given** a user uploads a file to their tenant's storage, **When** another tenant's user requests the same file, **Then** access is denied.
2. **Given** a file is uploaded, **When** the upload completes, **Then** the file is available for download via a signed URL with configurable expiration.
3. **Given** a tenant has a 10 GB storage limit, **When** they attempt to upload a file that would exceed the limit, **Then** the upload is rejected with a clear error message.

---

### User Story 12 — Signed URLs & Media Processing (Priority: P3)

As a developer building a content-rich application, I need to generate time-limited signed URLs and transform images on-the-fly so that files are delivered securely and efficiently without managing multiple asset versions.

**Why this priority**: Signed URLs prevent unauthorized access while enabling CDN delivery. Image transformations eliminate the need for developers to pre-process media assets.

**Independent Test**: Can be fully tested by generating a signed URL, verifying it works before expiry and fails after, and requesting image transformations to verify output dimensions and format.

**Acceptance Scenarios**:

1. **Given** a signed URL is generated with a 1-hour TTL, **When** accessed within 1 hour, **Then** the file is delivered successfully.
2. **Given** a signed URL has expired, **When** accessed, **Then** the request is rejected with a 403 status.
3. **Given** an image is uploaded, **When** requested with transformation parameters (width=200, format=webp), **Then** the transformed image is returned and cached.

---

### User Story 13 — Payment Recovery & Dunning (Priority: P2)

As a revenue operations manager, I need failed payments to be automatically retried with escalating notifications so that involuntary churn is minimized.

**Why this priority**: Payment failures are the leading cause of involuntary churn. Automated dunning recovers significant revenue (industry benchmarks show 30-50% recovery rates).

**Independent Test**: Can be fully tested by simulating a payment failure, verifying the retry schedule executes, and confirming dunning notifications are sent at each escalation step.

**Acceptance Scenarios**:

1. **Given** a payment fails, **When** the first retry occurs after 3 days, **Then** the payment is retried and a gentle reminder is sent to the tenant contact.
2. **Given** the first retry also fails, **When** the second retry occurs after 7 days, **Then** a warning notification is sent indicating the account will be suspended.
3. **Given** all retries are exhausted, **When** the dunning period ends, **Then** the tenant is suspended with a final notification and a self-service link to update payment details.

---

### Edge Cases

- What happens when a tenant downgrades to a plan with lower usage limits but has already exceeded those limits?
- How does the system handle concurrent subscription changes (e.g., upgrade and cancel submitted simultaneously)?
- What happens when the billing system is unavailable during a usage metering flush?
- How does notification workflow fallback behave when all channels fail?
- What happens when an audit log export is requested for a time range with millions of entries?
- How does file upload handle interrupted uploads (partial uploads, network drops)?
- What happens when a feature flag evaluation occurs during a flag configuration update?
- How does the analytics system handle events arriving out of chronological order?
- What happens when a signed URL is generated for a file that is subsequently deleted?
- How does the billing system handle currency conversions for international tenants?
- What happens when a notification workflow step references a channel the user has opted out of?
- How does audit log integrity verification handle entries recorded across clock-skewed servers?

---

## Requirements *(mandatory)*

### Functional Requirements

#### Billing & Subscriptions

- **FR-B001**: System MUST manage subscription plans with configurable tiers (free/basic/pro/enterprise), pricing, and billing cycles (monthly/annual)
- **FR-B002**: System MUST support subscription lifecycle events: create, upgrade, downgrade, cancel, pause, and resume
- **FR-B003**: System MUST calculate prorated charges for mid-cycle plan changes
- **FR-B004**: System MUST support usage metering with configurable meters (API calls, storage, users, custom resources)
- **FR-B005**: System MUST generate invoices with line items for base subscription and metered usage
- **FR-B006**: System MUST implement payment retry logic with configurable dunning schedules
- **FR-B007**: System MUST track payment methods and support payment method lifecycle (add, update, remove, set default)
- **FR-B008**: System MUST support coupon and discount codes with configurable rules (percentage, fixed amount, duration)
- **FR-B009**: System MUST emit webhook events for billing lifecycle (payment.succeeded, payment.failed, subscription.changed, invoice.generated)
- **FR-B010**: System MUST provide tenant-facing billing portal endpoints for self-service account management
- **FR-B011**: System MUST enforce usage limits based on current subscription plan
- **FR-B012**: System MUST send automated notifications when tenants approach usage limits (configurable thresholds)

#### Feature Flags & Entitlements

- **FR-F001**: System MUST support boolean and multi-variate feature flags with CRUD operations
- **FR-F002**: System MUST support plan-based entitlement gating linked to subscription tiers
- **FR-F003**: System MUST support percentage-based gradual rollouts with consistent hashing (same user always gets same result)
- **FR-F004**: System MUST support user and tenant targeting rules with attribute-based conditions
- **FR-F005**: System MUST support flag lifecycle management (create, update, archive) with an audit trail
- **FR-F006**: System MUST support flag environments (development, staging, production) with independent configurations
- **FR-F007**: System MUST provide local evaluation with periodic sync for low-latency checks
- **FR-F008**: System MUST support A/B test variant assignment with statistical tracking
- **FR-F009**: System MUST emit flag change events via the existing webhook system
- **FR-F010**: System MUST provide YAML model definitions and OpenAPI specification for all feature flag operations

#### Audit Logging (Full)

- **FR-A001**: System MUST record all authentication, authorization, and data mutation events with immutable entries
- **FR-A002**: System MUST capture before/after values for all state changes
- **FR-A003**: System MUST support export to SIEM formats (CEF, JSON, Syslog)
- **FR-A004**: System MUST support configurable retention policies per tenant (minimum 90 days, maximum configurable)
- **FR-A005**: System MUST provide real-time event streaming via webhooks or server-sent events
- **FR-A006**: System MUST support configurable alerting rules based on event patterns (e.g., "N failed logins in M minutes")
- **FR-A007**: System MUST maintain cryptographic integrity verification for audit entries (hash chains or digital signatures)
- **FR-A008**: System MUST support bulk export with filtering by date range, actor, event type, and resource
- **FR-A009**: System MUST support IP geolocation enrichment on audit entries
- **FR-A010**: System MUST provide YAML model definitions and OpenAPI specification for all audit operations

#### Multi-channel Notifications (Upgrade)

- **FR-N001**: System MUST support workflow definitions with multi-step, multi-channel routing (email, SMS, push, in-app)
- **FR-N002**: System MUST support channel fallback logic with configurable delays between attempts
- **FR-N003**: System MUST provide a real-time in-app notification feed with push-based updates
- **FR-N004**: System MUST support notification batching and digest aggregation with configurable windows
- **FR-N005**: System MUST track delivery, read, and engagement metrics per notification and per channel
- **FR-N006**: System MUST support notification workflow templates with variable substitution
- **FR-N007**: System MUST support topic-based subscriptions for notification routing
- **FR-N008**: System MUST integrate with the existing email module for email channel delivery
- **FR-N009**: System MUST support quiet hours and delivery timing preferences per user

#### Analytics & Usage Tracking

- **FR-AN001**: System MUST accept custom event tracking with arbitrary properties and a configurable schema
- **FR-AN002**: System MUST provide usage aggregation endpoints optimized for billing integration
- **FR-AN003**: System MUST support time-series queries for user engagement metrics (DAU, MAU, feature adoption)
- **FR-AN004**: System MUST support funnel definition and conversion rate analysis
- **FR-AN005**: System MUST support cohort definition and segmentation for retention analysis
- **FR-AN006**: System MUST batch and compress event ingestion for high throughput
- **FR-AN007**: System MUST support event schema validation with configurable rules
- **FR-AN008**: System MUST provide pre-built queries for standard SaaS metrics (DAU, MAU, retention, churn rate)

#### File Storage & Management

- **FR-FS001**: System MUST support file upload with tenant-scoped storage buckets and configurable size limits
- **FR-FS002**: System MUST enforce access control on files based on tenant membership and user permissions
- **FR-FS003**: System MUST generate signed URLs with configurable expiration for secure file access
- **FR-FS004**: System MUST support image transformation on request (resize, crop, format conversion)
- **FR-FS005**: System MUST support file metadata management (MIME type, size, custom properties, tags)
- **FR-FS006**: System MUST support multipart and resumable uploads for large files
- **FR-FS007**: System MUST track storage usage per tenant for billing integration
- **FR-FS008**: System MUST support virus/malware scanning on upload before making files available

### Key Entities

#### Billing & Subscriptions
- **Subscription**: A tenant's active plan binding with status, billing cycle, current period start/end, and payment method reference
- **Plan**: Defines a subscription tier with name, pricing, included limits, and available feature entitlements
- **Invoice**: A billing document with line items, amounts, tax, status (draft/open/paid/void), and payment reference
- **InvoiceLine**: Individual charge on an invoice — base subscription, metered usage, discount, or tax
- **Payment**: A payment transaction with amount, status (succeeded/failed/pending), method, and retry count
- **PaymentMethod**: A stored payment instrument with type, last-four identifier, expiry, and default status
- **UsageMeter**: A configurable usage counter definition (API calls, storage, seats) with aggregation rules
- **UsageRecord**: A single usage event with tenant, meter, quantity, and timestamp
- **Coupon**: A discount configuration with type (percentage/fixed), duration, redemption limits, and validity period
- **DunningSchedule**: Defines retry intervals and escalation steps for failed payment recovery

#### Feature Flags & Entitlements
- **FeatureFlag**: A toggle with key, type (boolean/multivariate), description, tags, environments, targeting rules, and rollout percentage
- **Entitlement**: Maps a feature flag to a subscription plan tier defining what features each plan unlocks
- **FlagEnvironment**: Environment-specific flag configuration (enabled state, targeting rules, rollout percentage)
- **FlagVariant**: A named variant for multivariate flags with value, weight, and description
- **RolloutRule**: A targeting rule with conditions (user attributes, tenant properties) and rollout percentage
- **EvaluationContext**: The context for flag evaluation containing user, tenant, roles, and custom attributes

#### Audit Logging
- **AuditLogEntry**: An immutable event record with event type, actor, target resource, timestamp, IP address, changes, metadata, and integrity hash
- **AuditExportConfig**: Configuration for SIEM export including format, destination, and filter criteria
- **RetentionPolicy**: Per-tenant log retention rules with duration and archive behavior
- **AlertRule**: A pattern-matching rule that triggers notifications when audit events match specified conditions
- **AuditStream**: A real-time event delivery channel configuration (webhook URL, SSE endpoint, filter criteria)

#### Multi-channel Notifications
- **NotificationWorkflow**: A multi-step delivery pipeline defining channel sequence, delays, fallback logic, and batch windows
- **WorkflowStep**: A single step in a workflow with channel, template, delay-before-next, and condition
- **NotificationFeed**: A user's real-time notification inbox with unread count, pagination, and filter capabilities
- **DeliveryAttempt**: A record of a notification delivery attempt with channel, status, timestamp, and error details
- **NotificationBatch**: A collection of notifications grouped for digest delivery with batch window and summary template

#### Analytics & Usage Tracking
- **TrackEvent**: A custom event with name, properties, user/tenant context, and timestamp
- **EventSchema**: A validation schema defining required and optional properties for an event type
- **UsageAggregate**: A pre-computed usage summary for a meter, tenant, and time period
- **Funnel**: A defined sequence of events representing a conversion path with step names and filter criteria
- **Cohort**: A user segment defined by attributes or behavioral criteria for retention analysis
- **MetricDefinition**: A named metric with query definition, aggregation type, and dimensions

#### File Storage
- **StorageBucket**: A tenant-scoped container for files with access policies, size limits, and allowed MIME types
- **StorageObject**: A stored file with key, bucket, MIME type, size, custom metadata, and upload timestamp
- **UploadSession**: A resumable upload session with upload ID, chunk tracking, and expiration
- **SignedURL**: A time-limited, cryptographically signed URL for secure file access with configurable TTL
- **ImageTransformation**: A requested transformation specification with dimensions, format, quality, and crop parameters
- **FileMetadata**: Extended metadata for a file including tags, custom properties, and content hash

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Platform operators can create a new tenant subscription and have the correct feature entitlements active within 10 seconds
- **SC-002**: Usage metering accurately reflects actual consumption with no more than 5 minutes of delay between event and aggregated count
- **SC-003**: Invoices are generated automatically within 1 hour of billing cycle completion with 100% accuracy on line items
- **SC-004**: Feature flag evaluations return results in under 50 milliseconds when using local evaluation with periodic sync
- **SC-005**: Plan-based entitlement changes take effect within 5 seconds of subscription modification
- **SC-006**: 100% of security-relevant events are captured in audit logs with no data loss
- **SC-007**: Audit log search returns results within 2 seconds for queries spanning up to 90 days of data
- **SC-008**: SIEM export delivers logs within 60 seconds of event occurrence for real-time streaming
- **SC-009**: Notification workflow fallback triggers within the configured delay window (tolerance of +/- 10 seconds)
- **SC-010**: Real-time notification feed updates appear within 2 seconds of event trigger for connected users
- **SC-011**: Analytics event ingestion handles at least 1,000 events per second per tenant without data loss
- **SC-012**: File uploads complete successfully for files up to 5 GB using multipart upload
- **SC-013**: Signed URL generation completes in under 100 milliseconds
- **SC-014**: Payment recovery through automated dunning achieves at least 30% recovery rate on failed payments
- **SC-015**: All 6 components achieve SDK implementation parity across Python, Node.js, and Java

---

## Assumptions

- An external payment processor (e.g., Stripe, Braintree) will handle actual payment transactions; the SDK manages subscription state and billing logic
- Event storage for analytics can scale to handle high-volume tenants (100K+ events/day per tenant)
- File storage will leverage a cloud object storage backend; the SDK provides the access control and signed URL layer
- SIEM integration formats follow industry standards (CEF v25, RFC 5424 Syslog, JSON Lines)
- WebSocket or Server-Sent Events infrastructure is available for real-time notification feed delivery
- The existing notification module's 4-channel support (email, SMS, push, in-app) provides the delivery layer for workflow orchestration
- Usage metering aggregation uses eventual consistency with a maximum 5-minute delay window
- Image transformation processing uses a CDN edge function or dedicated media processing service
- Virus/malware scanning uses an external scanning service with webhook-based result delivery
- Feature flag local evaluation uses a polling mechanism with configurable sync interval (default: 60 seconds)

---

## Existing Code Assessment

### Feature Flags (Python & Node — No Java, No YAML Model, No OpenAPI)

**What exists**:
- `FeatureFlagClient` in Python and Node with: `list()`, `get()`, `evaluate()`, `isEnabled()`, `getValue()`, `evaluateAll()`, `createContext()`
- Models: `FeatureFlag`, `FeatureFlagListResponse`, `FeatureFlagEvaluation`, `EvaluationContext`, `TargetingRule`, `RuleOperator`
- Client-side caching structure with configurable `cache_ttl`

**What is missing**:
- YAML model definitions in `models/features/`
- OpenAPI specification in `openapi/features/`
- Java SDK implementation
- Plan-based entitlement gating
- Multi-environment support (dev/staging/prod)
- Flag CRUD operations (create, update, delete/archive)
- A/B test variant assignment
- Webhook event emission on flag changes

### Audit Logging (Python & Node — No Java, No YAML Model, No OpenAPI)

**What exists**:
- `AuditClient` in Python and Node with: `log()`, `list()`, `get()`, `getByResource()`, `getByActor()`
- Models: `AuditEvent`, `AuditLogEntry`, `AuditLogListResponse`, `CreateAuditEventRequest`, `AuditEventType` enum
- Filtering by event type, actor, resource, date range

**What is missing**:
- YAML model definitions in `models/audit/`
- OpenAPI specification in `openapi/audit/`
- Java SDK implementation
- Before/after change tracking
- SIEM export formats (CEF, Syslog)
- Configurable retention policies
- Real-time event streaming
- Alert rules and pattern matching
- Cryptographic integrity verification (hash chains)
- IP geolocation enrichment

### Notifications (Substantial Foundation — Upgrade Needed)

**What exists**:
- `NotificationClient` in Python with full channel support: email, SMS, push, in-app
- Preferences management, category subscriptions, device registration
- Event models for email, SMS, and push notifications with delivery tracking
- Template YAML with localization support
- OpenAPI specification

**What is missing**:
- Workflow orchestration (multi-step, multi-channel routing)
- Channel fallback logic with configurable delays
- Real-time notification feed (WebSocket/SSE)
- Notification batching and digest aggregation
- Delivery and engagement analytics
- Quiet hours enforcement

### Billing (Minimal Foundation)

**What exists**:
- Tenant model has `plan` (free/basic/pro/enterprise), `billing_cycle` (monthly/annual), `contract_end_date`
- Tenant features include `max_users`, `max_storage_gb`, `analytics_enabled`
- Java has `SubscriptionPlan` enum

**What is missing**:
- Subscription management client and models
- Usage metering infrastructure
- Invoice generation
- Payment method management
- Dunning and payment recovery
- Coupon/discount management
- Billing webhook events

---

## Implementation Roadmap

```
2026 Q1              2026 Q2              2026 Q3              2026 Q4
|------------------|------------------|------------------|
| Phase 1          | Phase 2          | Phase 3 + 4      | Phase 5          |
| Feature Flags    | Billing &        | Analytics &      | File Storage     |
| Audit Logging    | Subscriptions    | Notifications    |                  |
| (formalize)      |                  | (parallel)       |                  |
```

### Phase 1: Formalization Sprint (Q1 — ~6 PM)
**Theme**: Solidify existing code into spec-driven modules

| Component | Effort | Rationale |
| --------- | ------ | --------- |
| Feature Flags & Entitlements | 3 PM | Existing Python/Node code. Create YAML model, OpenAPI spec, Java implementation, add entitlement layer |
| Audit Logging (Full) | 3 PM | Existing Python/Node code. Create YAML model, OpenAPI spec, Java implementation, add SIEM export and retention |

**Exit Criteria**: Both modules have YAML models, OpenAPI specs, implementations in all 3 SDKs, and tests passing.

### Phase 2: Revenue Foundation (Q2 — ~8 PM)
**Theme**: Enable monetization

| Component | Effort | Dependencies |
| --------- | ------ | ------------ |
| Billing & Subscriptions | 8 PM | Feature Flags (for entitlement gating), Webhooks (for payment events) |

**Exit Criteria**: Subscription lifecycle, usage metering, invoicing, and dunning are operational across all 3 SDKs.

### Phase 3+4: Intelligence & Engagement (Q3 — ~11 PM, parallel)
**Theme**: Track usage and enhance engagement

| Component | Effort | Dependencies |
| --------- | ------ | ------------ |
| Analytics & Usage Tracking | 6 PM | Billing (usage metering integration) |
| Multi-channel Notifications | 5 PM | Email module (existing), Webhooks (existing) |

**Exit Criteria**: Event tracking, usage aggregation, product analytics, workflow orchestration, and real-time feed across all 3 SDKs.

### Phase 5: Platform Completion (Q4 — ~5 PM)
**Theme**: Complete the platform

| Component | Effort | Dependencies |
| --------- | ------ | ------------ |
| File Storage & Management | 5 PM | Billing (storage metering), Tenants (access control) |

**Exit Criteria**: Upload, access control, signed URLs, image transformation, and storage tracking across all 3 SDKs.

---

## Combined Output Formats

### Output 1: Full Component Matrix

| # | Component | Status | Priority | RICE | MoSCoW | Category | Effort | Target |
|---|-----------|--------|----------|------|--------|----------|--------|--------|
| 1 | Authentication | ✅ Existing | — | — | — | Identity | — | — |
| 2 | Users | ✅ Existing | — | — | — | Identity | — | — |
| 3 | Roles & Permissions | ✅ Existing | — | — | — | Authorization | — | — |
| 4 | Multi-Tenancy | ✅ Existing | — | — | — | Organization | — | — |
| 5 | SSO | ✅ Existing | — | — | — | Identity | — | — |
| 6 | Teams | ✅ Existing | — | — | — | Organization | — | — |
| 7 | Invitations | ✅ Existing | — | — | — | Organization | — | — |
| 8 | Webhooks | ✅ Existing | — | — | — | Integration | — | — |
| 9 | API Keys | ✅ Existing | — | — | — | Integration | — | — |
| 10 | Email | ✅ Existing | — | — | — | Communication | — | — |
| 11 | Settings | ✅ Existing | — | — | — | Configuration | — | — |
| 12 | Notifications | ✅ Existing | — | — | — | Communication | — | — |
| 13 | Feature Flags & Entitlements | 🟡 Code only | P1 | 3000 | Must | Product | 3 PM | Phase 1 |
| 14 | Audit Logging (Full) | 🟡 Code only | P1 | 2850 | Must | Compliance | 3 PM | Phase 1 |
| 15 | Billing & Subscriptions | 🔮 Planned | P2 | 1500 | Should | Revenue | 8 PM | Phase 2 |
| 16 | Multi-channel Notifications | 🔄 Upgrade | P3 | 1280 | Should | Communication | 5 PM | Phase 4 |
| 17 | Analytics & Usage Tracking | 🔮 Planned | P3 | 700 | Could | Intelligence | 6 PM | Phase 3 |
| 18 | File Storage & Management | 🔮 Planned | P4 | 360 | Could | Infrastructure | 5 PM | Phase 5 |

**Summary**: 12 Existing | 2 Code only (formalize) | 1 Upgrade | 3 Planned

### Output 2: Investment Summary

| Phase | Components | Effort (PM) | Target | Dependencies |
|-------|-----------|-------------|--------|-------------|
| Phase 1 | Feature Flags + Audit | 6 | Q1 2026 | None |
| Phase 2 | Billing | 8 | Q2 2026 | Feature Flags |
| Phase 3+4 | Analytics + Notifications | 11 | Q3 2026 | Billing (analytics), None (notifications) |
| Phase 5 | File Storage | 5 | Q4 2026 | Billing, Tenants |
| **Total** | **6 components** | **30 PM** | **~12 months** | — |

### Output 3: Combined Roadmap (Spec 001 + Spec 006)

| Quarter | Spec 001 (Auth Gaps) | Spec 006 (Platform Components) | Combined Effort |
|---------|---------------------|-------------------------------|-----------------|
| Q1 2026 | MFA/2FA, Audit Logs* | Feature Flags, Audit Logs* | ~10 PM |
| Q2 2026 | Passwordless, Sessions, Passkeys | Billing & Subscriptions | ~15.5 PM |
| Q3 2026 | Impersonation, Org Switcher | Analytics, Notifications | ~13.5 PM |
| Q4 2026 | SCIM, Breached Password | File Storage | ~9 PM |

*Audit Logging appears in both specs — Phase 1 of spec 006 fulfills the audit commitment from spec 001.

**Combined Investment**: ~48 person-months over 4 quarters

### Output 4: Executive Summary

**Strategic Recommendation**: Start by formalizing Feature Flags and Audit Logging (Phase 1), which have the highest RICE scores and lowest risk because code already exists. Then build Billing to unlock revenue, followed by Analytics and Notifications to complete the engagement and intelligence layers.

**Top 3 Priorities**:
1. **Feature Flags & Entitlements** — Existing code in 2 languages; enables plan-based monetization
2. **Audit Logging (Full)** — Existing code in 2 languages; required for enterprise compliance
3. **Billing & Subscriptions** — Highest strategic value; every SaaS product needs billing

**Investment Required**:
- Total Effort: ~30 person-months (this spec) + ~21 person-months (spec 001) = ~48 PM combined
- Timeline: 4 quarters (1 year)
- Phases: 5

**Expected Outcomes**:
- Platform Completeness: From 12 modules to 18 modules covering all major SaaS platform needs
- Revenue Enablement: Billing, usage metering, and plan-based entitlements
- Compliance Readiness: Formalized audit logging with SIEM export
- Developer Experience: Feature flags, analytics, file storage, and notification workflows
- Competitive Position: Parity with full-stack platforms like Firebase/Supabase for SaaS builders

---

## Competitive Research Sources

- [Stripe Billing](https://stripe.com/billing) — Subscription management, usage-based billing, invoicing, dunning
- [Chargebee](https://www.chargebee.com/) — Subscription lifecycle, revenue recovery
- [Knock](https://knock.app/) — Multi-channel notification orchestration, feeds, workflows
- [Novu](https://novu.co/) — Open-source notification infrastructure, workflow builder
- [LaunchDarkly](https://launchdarkly.com/) — Feature flags, entitlements, experimentation
- [PostHog](https://posthog.com/) — Product analytics, feature flags, session replay
- [Segment](https://segment.com/) — Customer data platform, event tracking
- [WorkOS Audit Logs](https://workos.com/docs/audit-logs) — Enterprise audit logging, SIEM export
- [Firebase Storage](https://firebase.google.com/docs/storage) — Cloud storage with security rules
- [Supabase Storage](https://supabase.com/docs/guides/storage) — Object storage with row-level security
- [Cloudinary](https://cloudinary.com/) — Media management, image transformations
- [Flagsmith](https://flagsmith.com/) — Open-source feature flags and remote config
- [Auth0](https://auth0.com/) — Identity platform baseline comparison
- [Clerk](https://clerk.com/) — Developer-first user management
