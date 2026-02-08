# Feature Specification: SDK Feature Parity with Enterprise Competitors

**Feature Branch**: `001-competitor-feature-analysis`
**Created**: 2025-12-29
**Updated**: 2026-02-07
**Status**: Draft
**Input**: Competitive analysis of 18 SaaS platform providers (international + Indian market) to document existing functionality, identify feature gaps, and prioritize features for the Shared Platform SDK.

## Executive Summary

This specification documents the current state of the Shared Platform SDK and identifies feature gaps compared to 18 leading SaaS platform providers across 4 categories: Full Platform Infrastructure (Frontegg, WorkOS, Clerk, PropelAuth/Stytch), Specialized Infrastructure (Stripe, Permit.io, Novu, LaunchDarkly), Open-Source Platforms (Supabase, Firebase, PostHog, Flagsmith), and Indian SaaS Ecosystem (Zoho, Razorpay, Chargebee, Freshworks, Postman, CleverTap).

> **Deep Research**: See `research/research-summary.md` for the full cross-competitor analysis, and `research/ui-patterns.md` for SDK design pattern recommendations. Individual competitor files are in `research/competitor-*.md`.

### Current SDK Capabilities (Existing)

| Module | Status | Description |
| ------ | ------ | ----------- |
| Authentication | Implemented | OAuth2/OIDC login, JWT validation, token management |
| Users | Implemented | Full CRUD, profiles, status management |
| Roles & Permissions | Implemented | Hierarchical RBAC with permission inheritance |
| Multi-Tenancy | Implemented | Tenant isolation, custom domains, branding |
| SSO | Implemented | Azure AD, Okta, Google, SAML, OIDC providers |
| Teams | Implemented | Hierarchical teams, member management |
| Invitations | Implemented | Token-based invites, bulk invitations |
| Webhooks | Implemented | Event subscriptions, signature verification |
| API Keys | Implemented | Rate limiting, IP restrictions, environments |
| Email | Implemented | Templates, SMTP configuration |
| Settings | Implemented | Tenant configuration by category |
| SCIM | Partial | Configuration exists, provisioning endpoints needed |

### Feature Gap Analysis (Missing vs Competitors)

| Feature | Auth0 | Clerk | WorkOS | Frontegg | Our SDK |
| ------- | ----- | ----- | ------ | -------- | ------- |
| Passkey/WebAuthn | Yes | Yes | Yes | Yes | Missing |
| MFA/2FA | Yes | Yes | Yes | Yes | Missing |
| Passwordless Auth | Yes | Yes | Yes | Yes | Missing |
| Session Management | Yes | Yes | Partial | Yes | Missing |
| Audit Logs | Yes | Yes | Yes | Yes | Missing |
| Self-Service Admin Portal | No | Yes | Yes | Yes | Missing |
| Pre-built UI Components | Yes | Yes | No | Yes | Missing |
| Device Fingerprinting | Yes | Yes | No | Yes | Missing |
| Breached Password Detection | Yes | No | No | Yes | Missing |
| Organization Switcher | No | Yes | Yes | Yes | Missing |
| Impersonation | Yes | No | No | Yes | Missing |

---

## RICE Prioritization Scoring

> **Skill**: Product Owner (`.claude/skills/product-owner/SKILL.md`)

### Scoring Methodology

- **Reach**: Users impacted per quarter (enterprise customers = ~5000 users avg)
- **Impact**: 3=Massive (deal breaker), 2=High, 1=Medium, 0.5=Low, 0.25=Minimal
- **Confidence**: 100%=High (validated), 80%=Medium, 50%=Low (assumption)
- **Effort**: Person-months to implement across all 3 SDKs

### Feature Scores

| Feature | Reach | Impact | Confidence | Effort (PM) | RICE Score | Rank |
| ------- | ----- | ------ | ---------- | ----------- | ---------- | ---- |
| MFA/2FA | 5000 | 3.0 | 90% | 3.0 | **4500** | 1 |
| Audit Logs | 3000 | 3.0 | 95% | 4.0 | **2138** | 2 |
| Passwordless Auth | 4000 | 2.0 | 80% | 2.0 | **3200** | 3 |
| Session Management | 5000 | 2.0 | 85% | 2.5 | **3400** | 4 |
| Passkeys/WebAuthn | 3000 | 2.0 | 70% | 3.0 | **1400** | 5 |
| Admin Portal Components | 2000 | 1.5 | 60% | 5.0 | **360** | 6 |
| Organization Switcher | 2000 | 1.0 | 80% | 1.5 | **1067** | 7 |
| User Impersonation | 1000 | 1.5 | 85% | 1.0 | **1275** | 8 |
| Breached Password Detection | 5000 | 1.0 | 90% | 1.0 | **4500** | 9 |
| SCIM Provisioning | 1000 | 2.0 | 80% | 3.0 | **533** | 10 |

---

## MoSCoW Categorization

### Must Have (Non-negotiable for enterprise adoption)

| Feature | RICE Score | Justification |
| ------- | ---------- | ------------- |
| MFA/2FA | 4500 | 83% of enterprises mandate MFA - deal breaker without it |
| Audit Logs | 2138 | Required for SOC2, GDPR, HIPAA compliance |

### Should Have (High value, strong business case)

| Feature | RICE Score | Justification |
| ------- | ---------- | ------------- |
| Session Management | 3400 | Core security capability, customer expectation |
| Passwordless Auth | 3200 | $21B→$56B market growth, modern UX expectation |
| Passkeys/WebAuthn | 1400 | Future of auth, Apple/Google/MS pushing adoption |

### Could Have (Desirable, improves competitiveness)

| Feature | RICE Score | Justification |
| ------- | ---------- | ------------- |
| User Impersonation | 1275 | Accelerates support, standard in Auth0/Frontegg |
| Organization Switcher | 1067 | Required for multi-org B2B users |
| SCIM Provisioning | 533 | Enterprise IdP integration, completes SSO story |
| Admin Portal Components | 360 | Differentiator, reduces customer support burden |

### Won't Have (This Release)

| Feature | Justification |
| ------- | ------------- |
| Device Fingerprinting | Requires ML infrastructure, lower priority |
| Behavioral Biometrics | Advanced feature, future consideration |
| Pre-built UI Components (full) | Large investment, start with Admin Portal only |

---

## Priority Summary (Combined RICE + MoSCoW)

| Priority | Feature | MoSCoW | RICE | Category | Effort | Target |
| -------- | ------- | ------ | ---- | -------- | ------ | ------ |
| P1 | MFA/2FA | Must | 4500 | Auth & Security | L | Phase 1 |
| P1 | Audit Logs | Must | 2138 | Compliance | L | Phase 1 |
| P2 | Session Management | Should | 3400 | Auth & Security | M | Phase 2 |
| P2 | Passwordless Auth | Should | 3200 | Auth & Security | M | Phase 2 |
| P2 | Passkeys/WebAuthn | Should | 1400 | Auth & Security | M | Phase 2 |
| P3 | User Impersonation | Could | 1275 | Administration | S | Phase 3 |
| P3 | Organization Switcher | Could | 1067 | Organization | S | Phase 3 |
| P4 | SCIM Provisioning | Could | 533 | Enterprise | M | Phase 4 |
| P4 | Breached Password Detection | Could | 4500 | Security | S | Phase 4 |
| P5 | Admin Portal Components | Could | 360 | Developer Experience | L | Future |

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - MFA/Two-Factor Authentication (Priority: P1)

As a platform administrator, I need to enforce multi-factor authentication for users in my organization so that accounts are protected against credential theft and unauthorized access.

**Why this priority**: MFA is now mandated by 83% of organizations and is a non-negotiable requirement for enterprise customers. Without MFA, the SDK cannot compete for enterprise deals.

**Independent Test**: Can be fully tested by enabling MFA for a user, completing authentication with a second factor, and verifying access is granted only after successful MFA verification.

**Acceptance Scenarios**:

1. **Given** a user has MFA enabled, **When** they authenticate with username/password, **Then** they are prompted for a second factor before session is created.
2. **Given** a user enters an incorrect MFA code, **When** they submit the code, **Then** authentication fails and they can retry with remaining attempts.
3. **Given** a user loses access to their MFA device, **When** they request recovery, **Then** they can use backup codes to regain access.
4. **Given** an administrator enables MFA requirement for a tenant, **When** users without MFA configured attempt to log in, **Then** they are forced to set up MFA before proceeding.

---

### User Story 2 - Comprehensive Audit Logging (Priority: P1)

As a compliance officer, I need to access a complete audit trail of all user actions, permission changes, and security events so that I can demonstrate regulatory compliance and investigate security incidents.

**Why this priority**: Audit logs are required for SOX, GDPR, HIPAA, and SOC2 compliance. Enterprise customers cannot adopt platforms without comprehensive audit capabilities.

**Independent Test**: Can be fully tested by performing various actions (login, permission change, data access) and verifying each action is recorded with timestamp, actor, and details.

**Acceptance Scenarios**:

1. **Given** any authentication event occurs (login, logout, failed attempt), **When** the event completes, **Then** an audit log entry is created with user ID, timestamp, IP address, and outcome.
2. **Given** a permission or role change occurs, **When** the change is applied, **Then** an audit log captures who made the change, what changed, and the before/after values.
3. **Given** an administrator searches audit logs, **When** they apply filters (date range, user, event type), **Then** matching entries are returned with pagination.
4. **Given** audit logs are requested for export, **When** the export is generated, **Then** logs are provided in a standard format suitable for SIEM integration.

---

### User Story 3 - Passwordless Authentication (Priority: P2)

As an end user, I want to authenticate without remembering passwords using magic links or one-time codes so that I have a more secure and convenient login experience.

**Why this priority**: The passwordless market is growing from $21B to $56B by 2030. Users expect modern authentication options, and passwordless reduces security risks from weak passwords.

**Independent Test**: Can be fully tested by initiating passwordless login, receiving a magic link/OTP, and completing authentication without entering a password.

**Acceptance Scenarios**:

1. **Given** a user requests passwordless login, **When** they enter their email, **Then** a magic link is sent to their email address.
2. **Given** a user clicks a valid magic link, **When** the link is within its validity period, **Then** the user is authenticated and a session is created.
3. **Given** a user requests an OTP, **When** they enter the correct code within the time limit, **Then** they are authenticated.
4. **Given** a magic link or OTP has expired, **When** the user attempts to use it, **Then** authentication fails with a clear error message and option to request a new code.

---

### User Story 4 - Session Management (Priority: P2)

As a security administrator, I need to view and manage all active user sessions so that I can detect suspicious activity and terminate sessions when needed.

**Why this priority**: Session management is fundamental to security. Administrators must be able to see active sessions, detect anomalies, and terminate compromised sessions.

**Independent Test**: Can be fully tested by logging in from multiple devices, viewing all sessions, and terminating a specific session.

**Acceptance Scenarios**:

1. **Given** a user has multiple active sessions, **When** they view their sessions, **Then** all sessions are listed with device info, location, and last activity time.
2. **Given** an administrator views a user's sessions, **When** they identify a suspicious session, **Then** they can terminate that specific session immediately.
3. **Given** a session is terminated, **When** the user with that session makes a request, **Then** the request is rejected and they must re-authenticate.
4. **Given** session timeout settings are configured, **When** a session exceeds the idle timeout, **Then** the session is automatically invalidated.

---

### User Story 5 - Passkey/WebAuthn Support (Priority: P2)

As an end user, I want to authenticate using biometrics (fingerprint, face) or security keys so that I have the most secure and convenient authentication experience.

**Why this priority**: Passkeys are the future of authentication, with major platforms (Apple, Google, Microsoft) pushing adoption. Supporting passkeys positions the SDK as forward-thinking.

**Independent Test**: Can be fully tested by registering a passkey, then authenticating using the passkey without entering a password.

**Acceptance Scenarios**:

1. **Given** a user wants to register a passkey, **When** they initiate registration, **Then** the system prompts for biometric/security key authentication and stores the credential.
2. **Given** a user has a registered passkey, **When** they authenticate, **Then** they can use biometric/security key instead of password.
3. **Given** a user has multiple passkeys registered, **When** they manage their passkeys, **Then** they can view, name, and revoke individual passkeys.
4. **Given** passkey authentication fails, **When** the failure occurs, **Then** the user can fall back to password or other authentication methods.

---

### User Story 6 - Self-Service Admin Portal Components (Priority: P3)

As a product owner, I want to embed pre-built admin portal components in my application so that my customers can manage their own users, teams, and settings without custom development.

**Why this priority**: Self-service reduces support burden and is a key differentiator for Frontegg and Clerk. Embedded components accelerate customer time-to-value.

**Independent Test**: Can be fully tested by embedding the admin portal component and verifying end users can manage their organization's users and settings.

**Acceptance Scenarios**:

1. **Given** an admin portal component is embedded, **When** a tenant admin accesses it, **Then** they can manage users within their tenant without accessing the main platform.
2. **Given** a tenant admin invites a new user, **When** the invitation is sent, **Then** the invited user receives an invitation and can join the tenant.
3. **Given** a tenant admin updates settings, **When** they save changes, **Then** settings are applied only to their tenant without affecting others.
4. **Given** role restrictions are configured, **When** a user without admin role accesses the portal, **Then** they see only features appropriate to their role.

---

### User Story 7 - Organization Switcher (Priority: P3)

As a user belonging to multiple organizations, I want to easily switch between organizations without logging out so that I can work efficiently across all my accounts.

**Why this priority**: Multi-organization users are common in B2B SaaS. A seamless organization switcher improves user experience and reduces friction.

**Independent Test**: Can be fully tested by a user with multiple organization memberships switching between organizations and verifying context changes appropriately.

**Acceptance Scenarios**:

1. **Given** a user belongs to multiple tenants, **When** they access the organization switcher, **Then** they see all tenants they belong to.
2. **Given** a user switches organizations, **When** the switch completes, **Then** all subsequent API calls use the new organization context.
3. **Given** a user switches to an organization, **When** they have different roles in each org, **Then** their permissions reflect the role in the selected organization.
4. **Given** a user is removed from an organization, **When** they try to switch to it, **Then** it no longer appears in their available organizations.

---

### User Story 8 - User Impersonation (Priority: P3)

As a support agent, I need to temporarily view the application as a specific user experiences it so that I can diagnose issues and provide accurate support.

**Why this priority**: Impersonation accelerates support resolution and reduces back-and-forth. This is a standard feature in enterprise platforms like Auth0 and Frontegg.

**Independent Test**: Can be fully tested by an admin impersonating a user, verifying they see the user's view, and ending impersonation to return to their own session.

**Acceptance Scenarios**:

1. **Given** an admin has impersonation permission, **When** they initiate impersonation of a user, **Then** they view the application with that user's roles and permissions.
2. **Given** impersonation is active, **When** any action is performed, **Then** audit logs record both the impersonated user and the impersonating admin.
3. **Given** impersonation is active, **When** the admin ends impersonation, **Then** they return to their own session with their original permissions.
4. **Given** a user does not have impersonation permission, **When** they attempt to impersonate, **Then** the request is denied.

---

### User Story 9 - Breached Password Detection (Priority: P4)

As a security administrator, I want the system to check passwords against known breach databases so that users cannot use compromised passwords.

**Why this priority**: Credential stuffing attacks use leaked passwords. Preventing known-breached passwords significantly improves security posture.

**Independent Test**: Can be fully tested by attempting to set a password known to be in breach databases and verifying it is rejected.

**Acceptance Scenarios**:

1. **Given** a user sets or changes their password, **When** the password is found in breach databases, **Then** the password is rejected with explanation.
2. **Given** a password check is performed, **When** the password is not found in breach databases, **Then** the password is accepted (assuming other criteria are met).
3. **Given** breached password detection is enabled for a tenant, **When** periodic checks run, **Then** users with now-breached passwords are notified to change them.

---

### User Story 10 - SCIM Provisioning Endpoints (Priority: P4)

As an IT administrator using an identity provider, I want to automatically provision and deprovision users in the platform so that user lifecycle management is synchronized across all systems.

**Why this priority**: SCIM is essential for enterprise customers with centralized identity management. Auto-provisioning reduces manual work and improves security by ensuring timely deprovisioning.

**Independent Test**: Can be fully tested by connecting an IdP's SCIM client and verifying users are automatically created, updated, and deactivated.

**Acceptance Scenarios**:

1. **Given** SCIM is configured for a tenant, **When** a user is created in the IdP, **Then** the user is automatically provisioned in the platform.
2. **Given** a user's attributes change in the IdP, **When** SCIM sync occurs, **Then** the user's profile is updated in the platform.
3. **Given** a user is deactivated in the IdP, **When** SCIM sync occurs, **Then** the user's platform account is deactivated and sessions are terminated.
4. **Given** group membership changes in the IdP, **When** SCIM sync occurs, **Then** team memberships are updated accordingly.

---

### Edge Cases

- What happens when a user's MFA device is lost and they have no backup codes?
- How does the system handle concurrent session limits when a new login occurs?
- What happens if breached password check service is unavailable during password change?
- How does organization switching handle in-progress operations?
- What happens when SCIM sync conflicts with manual user changes?
- How does impersonation work when the target user has MFA enabled?
- What happens when a magic link is clicked from a different device than requested?
- How does passkey registration work when browser doesn't support WebAuthn?

---

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication & MFA
- **FR-001**: System MUST support TOTP-based two-factor authentication (Google Authenticator, Authy compatible)
- **FR-002**: System MUST support SMS-based one-time passwords for MFA
- **FR-003**: System MUST generate and accept backup codes for MFA recovery
- **FR-004**: System MUST allow tenant administrators to enforce MFA for all users
- **FR-005**: System MUST support magic link passwordless authentication with configurable expiry
- **FR-006**: System MUST support email and SMS one-time password authentication

#### Passkeys & WebAuthn
- **FR-007**: System MUST support WebAuthn credential registration (passkeys)
- **FR-008**: System MUST support WebAuthn authentication as primary or MFA method
- **FR-009**: System MUST allow users to register up to 10 passkeys per account
- **FR-010**: System MUST allow users to name, view, and revoke their registered passkeys

#### Session Management
- **FR-011**: System MUST track all active sessions with device information
- **FR-012**: System MUST allow users to view their active sessions
- **FR-013**: System MUST allow users and administrators to terminate specific sessions
- **FR-014**: System MUST support configurable session timeouts per tenant
- **FR-015**: System MUST automatically invalidate sessions after password change

#### Audit Logging
- **FR-016**: System MUST log all authentication events (success, failure, MFA)
- **FR-017**: System MUST log all permission and role changes with before/after values
- **FR-018**: System MUST log all administrative actions with actor identification
- **FR-019**: System MUST support filtering and searching audit logs by date, user, event type
- **FR-020**: System MUST support audit log export in JSON and CSV formats
- **FR-021**: System MUST retain audit logs according to configurable retention policies

#### Organization & Multi-Tenancy
- **FR-022**: System MUST support users belonging to multiple tenants
- **FR-023**: System MUST provide organization switching without re-authentication
- **FR-024**: System MUST maintain separate permissions per organization for each user
- **FR-025**: System MUST support user impersonation by authorized administrators
- **FR-026**: System MUST record impersonation sessions in audit logs

#### SCIM Provisioning
- **FR-027**: System MUST provide SCIM 2.0 compliant user provisioning endpoints
- **FR-028**: System MUST support SCIM group/team synchronization
- **FR-029**: System MUST support SCIM user lifecycle (create, update, deactivate)
- **FR-030**: System MUST validate SCIM bearer tokens for authentication

#### Security
- **FR-031**: System MUST check passwords against known breach databases (HaveIBeenPwned or similar)
- **FR-032**: System MUST reject passwords found in breach databases
- **FR-033**: System MUST notify users when their existing password appears in new breaches

### Key Entities

- **MFAEnrollment**: User's MFA configuration including method type, verified status, backup codes, and recovery options
- **Session**: Active user session with device fingerprint, IP address, user agent, location, creation time, last activity, and expiry
- **AuditLogEntry**: Immutable record of system events with event type, actor, target, timestamp, IP address, changes, and metadata
- **Passkey**: WebAuthn credential with public key, credential ID, device name, creation date, and last used timestamp
- **SCIMToken**: Bearer token for SCIM provisioning with tenant association, permissions, and expiry

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of users can complete MFA setup in under 3 minutes
- **SC-002**: Passwordless authentication (magic link) completes in under 30 seconds from request to session creation
- **SC-003**: Audit log search returns results within 2 seconds for queries spanning up to 90 days
- **SC-004**: Passkey authentication completes in under 5 seconds including biometric verification
- **SC-005**: Organization switching completes in under 1 second without requiring re-authentication
- **SC-006**: SCIM provisioning syncs user changes within 5 minutes of IdP update
- **SC-007**: 100% of security-relevant events are captured in audit logs with no data loss
- **SC-008**: Self-service admin portal components can be integrated by developers in under 4 hours
- **SC-009**: Breached password detection adds no more than 500ms to password validation
- **SC-010**: SDK achieves feature parity with at least 80% of Auth0/Clerk core authentication features

---

## Assumptions

- HaveIBeenPwned or equivalent breached password API is available for integration
- WebAuthn is supported by target browsers (Chrome, Firefox, Safari, Edge - last 2 major versions)
- Email and SMS delivery infrastructure exists for OTP/magic link delivery
- Audit log storage can scale to handle high-volume tenants (10K+ events/day)

---

## Competitive Research Sources

### Original Sources (Dec 2025)
- [Clerk vs Auth0 vs Firebase Comparison](https://clerk.com/articles/user-management-platform-comparison-react-clerk-auth0-firebase)
- [WorkOS vs Auth0 vs Clerk](https://workos.com/blog/workos-vs-auth0-vs-clerk)
- [Best Authentication Services 2025 - Stytch](https://stytch.com/blog/best-authentication-services/)
- [Auth0 Alternatives Comparison - Scalekit](https://www.scalekit.com/compare/auth0-alternatives)
- [Frontegg vs Descope Comparison](https://frontegg.com/frontegg-vs-descope)
- [RBAC Best Practices 2025 - Oso](https://www.osohq.com/learn/rbac-best-practices)
- [Audit Log Best Practices - Permit.io](https://www.permit.io/blog/audit-logs)

### Deep Research (Feb 2026) — 18 Competitor Analysis

#### Per-Competitor Research Files
| Competitor | Category | File |
|---|---|---|
| Frontegg | Platform Infrastructure | `research/competitor-frontegg.md` |
| WorkOS | Platform Infrastructure | `research/competitor-workos.md` |
| Clerk | Platform Infrastructure | `research/competitor-clerk.md` |
| PropelAuth/Stytch | Platform Infrastructure | `research/competitor-propelauth-stytch.md` |
| Stripe | Specialized Infrastructure | `research/competitor-stripe.md` |
| Permit.io | Specialized Infrastructure | `research/competitor-permit-io.md` |
| Novu | Specialized Infrastructure | `research/competitor-novu.md` |
| LaunchDarkly | Specialized Infrastructure | `research/competitor-launchdarkly.md` |
| Supabase | Open-Source Platform | `research/competitor-supabase.md` |
| Firebase | Open-Source Platform | `research/competitor-firebase.md` |
| PostHog | Open-Source Platform | `research/competitor-posthog.md` |
| Flagsmith | Open-Source Platform | `research/competitor-flagsmith.md` |
| Zoho | Indian SaaS | `research/competitor-zoho.md` |
| Razorpay | Indian SaaS | `research/competitor-razorpay.md` |
| Chargebee | Indian SaaS | `research/competitor-chargebee.md` |
| Freshworks | Indian SaaS | `research/competitor-freshworks.md` |
| Postman | Indian SaaS | `research/competitor-postman.md` |
| CleverTap | Indian SaaS | `research/competitor-clevertap.md` |

#### Cross-Cutting Analysis
| Document | Contents |
|---|---|
| `research/research-summary.md` | Feature heatmap, gap analysis, RICE scores, MoSCoW, roadmap, Indian market insights |
| `research/ui-patterns.md` | SDK design patterns, DX comparison, recommended patterns with code examples |

---

## Expanded Platform Analysis (Feb 2026 Update)

### Current SDK Capabilities (Updated)

| Module | Status | Category | SDK Coverage |
|---|---|---|---|
| Authentication (OAuth2/OIDC, JWT) | Implemented | Identity | Python, Node, Java |
| Users (CRUD, profiles, bulk ops) | Implemented | Identity | Python, Node, Java |
| Roles & Permissions (Hierarchical RBAC) | Implemented | Authorization | Python, Node, Java |
| Multi-Tenancy (isolation, custom domains) | Implemented | Organization | Python, Node, Java |
| SSO (Azure AD, Okta, Google, SAML, OIDC) | Implemented | Identity | Python, Node, Java |
| Teams (hierarchy, member management) | Implemented | Organization | Python, Node, Java |
| Invitations (token-based, bulk) | Implemented | Organization | Python, Node, Java |
| Webhooks (events, signature verification) | Implemented | Integration | Python, Node, Java |
| API Keys (rate limiting, IP restrictions) | Implemented | Integration | Python, Node, Java |
| Email (templates, SMTP configuration) | Implemented | Communication | Python, Node, Java |
| Settings (tenant configuration) | Implemented | Configuration | Python, Node, Java |
| Notifications (email/SMS/push/in-app) | Implemented | Communication | Python, Node |
| Feature Flags (evaluate, isEnabled) | Code only | Product | Python, Node |
| Audit Logging (log, list, get) | Code only | Compliance | Python, Node |
| Sessions (concurrent, geo-tracking) | Implemented | Security | Node only |

### Broader Feature Gap Matrix (18 Competitors)

> Full 18x18 heatmap in `research/research-summary.md`

| Gap Area | Competitors Offering | Our Status | Severity |
|---|---|---|---|
| MFA/2FA | 16/18 | Missing | **Table Stakes** |
| Audit Logging (compliance-grade) | 14/18 | Code only | **Table Stakes** |
| Feature Flags + Entitlements | 12/18 | Code only | **Table Stakes** |
| Session Management | 13/18 | Node only | **Table Stakes** |
| Passwordless Auth | 14/18 | Missing | **Competitive Parity** |
| Billing & Subscriptions | 8/18 | Missing | **Competitive Parity** |
| ABAC/ReBAC Authorization | 7/18 | Missing | **Differentiator** |
| Notification Workflows | 8/18 | Basic | **Competitive Parity** |
| Analytics & Usage Tracking | 7/18 | Missing | **Differentiator** |
| File Storage & Management | 6/18 | Missing | **Low Priority** |

### Indian Market Insights

Key findings from analyzing Zoho, Razorpay, Chargebee, Freshworks, Postman, and CleverTap:

1. **INR pricing expected** — Zoho offers India-specific pricing at INR 1,500/employee/month
2. **Razorpay integration essential** — UPI/Netbanking are non-negotiable for Indian market billing
3. **Data residency matters** — DPDPA compliance requires India-based infrastructure options
4. **WhatsApp notifications** — India's mobile-first patterns require WhatsApp Business API support
5. **SDK generation tools** — Postman's acquisition of liblab + Fern signals SDK auto-generation is maturing

### SDK Design Pattern Recommendations

> Full analysis with code examples in `research/ui-patterns.md`

| Pattern | Recommended Approach | Inspired By |
|---|---|---|
| Client Init | Instance-based + env var fallback | Stripe v8 |
| Error Handling | Typed hierarchy with namespaced codes | Stripe + Firebase |
| Pagination | Cursor-based + auto-pagination | Stripe |
| Webhooks | HMAC-SHA256 + Events API | Stripe + WorkOS |
| Auth Context | 3-layer (client, per-request, JWT) | Stripe + PropelAuth |
| Feature Flags | Local evaluation, never-throw | LaunchDarkly + Flagsmith |
| Testing | Mock client with TestData fixtures | LaunchDarkly |
| Authorization | check() primitive with RBAC/ABAC/ReBAC | Permit.io |

### Updated Roadmap (4 Phases, ~54 PM)

| Phase | Quarter | Theme | Key Features | Effort |
|---|---|---|---|---|
| 1 | Q1 2026 | Foundation Hardening | MFA, Sessions, Passwordless, Breached Password | 9.5 PM |
| 2 | Q2 2026 | Platform Expansion | Feature Flags (full), Audit Logging (full), SCIM | 12 PM |
| 3 | Q3 2026 | Revenue & Engagement | Billing, Notification Workflows, Passkeys | 16 PM |
| 4 | Q4 2026 | Differentiation | ABAC/ReBAC, Analytics, File Storage, Org Switcher | 16.5 PM |

---

## Combined Output Formats

> **Template**: `.specify/templates/output-formats-template.md`

### Output 1: Feature Matrix

| # | Feature | Status | Priority | RICE | MoSCoW | Category | Effort | Target |
|---|---------|--------|----------|------|--------|----------|--------|--------|
| 1 | OAuth2/OIDC Login | ✅ Implemented | - | - | - | Authentication | - | - |
| 2 | User Management | ✅ Implemented | - | - | - | User Management | - | - |
| 3 | RBAC Permissions | ✅ Implemented | - | - | - | Authorization | - | - |
| 4 | Multi-Tenancy | ✅ Implemented | - | - | - | Organization | - | - |
| 5 | SSO (Azure/Okta/Google) | ✅ Implemented | - | - | - | Authentication | - | - |
| 6 | Teams & Hierarchy | ✅ Implemented | - | - | - | Organization | - | - |
| 7 | Invitations | ✅ Implemented | - | - | - | User Management | - | - |
| 8 | Webhooks | ✅ Implemented | - | - | - | Integration | - | - |
| 9 | API Keys | ✅ Implemented | - | - | - | Integration | - | - |
| 10 | Email Templates | ✅ Implemented | - | - | - | Communication | - | - |
| 11 | MFA/2FA | 🔮 Planned | P1 | 4500 | Must | Auth & Security | L | Phase 1 |
| 12 | Audit Logs | 🔮 Planned | P1 | 2138 | Must | Compliance | L | Phase 1 |
| 13 | Session Management | 🔮 Planned | P2 | 3400 | Should | Auth & Security | M | Phase 2 |
| 14 | Passwordless Auth | 🔮 Planned | P2 | 3200 | Should | Auth & Security | M | Phase 2 |
| 15 | Passkeys/WebAuthn | 🔮 Planned | P2 | 1400 | Should | Auth & Security | M | Phase 2 |
| 16 | User Impersonation | 🔮 Planned | P3 | 1275 | Could | Administration | S | Phase 3 |
| 17 | Organization Switcher | 🔮 Planned | P3 | 1067 | Could | Organization | S | Phase 3 |
| 18 | SCIM Provisioning | 🟡 Partial | P4 | 533 | Could | Enterprise | M | Phase 4 |
| 19 | Breached Password Check | 🔮 Planned | P4 | 4500 | Could | Security | S | Phase 4 |
| 20 | Admin Portal Components | 🔮 Planned | P5 | 360 | Could | Developer Experience | L | Future |

**Summary**: 10 Implemented | 1 Partial | 9 Planned

---

### Output 2: Capability Categories

#### Authentication & Security
| Capability | Status | Priority |
|------------|--------|----------|
| Password Authentication | ✅ Implemented | - |
| OAuth2/OIDC | ✅ Implemented | - |
| SSO (SAML/OIDC) | ✅ Implemented | - |
| MFA/2FA | 🔮 Planned | P1 |
| Passwordless Auth | 🔮 Planned | P2 |
| Passkeys/WebAuthn | 🔮 Planned | P2 |
| Session Management | 🔮 Planned | P2 |
| Breached Password Check | 🔮 Planned | P4 |

#### Authorization & Access Control
| Capability | Status | Priority |
|------------|--------|----------|
| Role Management | ✅ Implemented | - |
| Permission Assignment | ✅ Implemented | - |
| Role Hierarchy | ✅ Implemented | - |
| User Impersonation | 🔮 Planned | P3 |

#### User Management
| Capability | Status | Priority |
|------------|--------|----------|
| User CRUD | ✅ Implemented | - |
| Profile Management | ✅ Implemented | - |
| Invitations | ✅ Implemented | - |
| Bulk Operations | ✅ Implemented | - |

#### Organization & Multi-Tenancy
| Capability | Status | Priority |
|------------|--------|----------|
| Tenant Management | ✅ Implemented | - |
| Teams & Hierarchy | ✅ Implemented | - |
| Custom Branding | ✅ Implemented | - |
| Organization Switcher | 🔮 Planned | P3 |

#### Enterprise & Compliance
| Capability | Status | Priority |
|------------|--------|----------|
| SSO Configuration | ✅ Implemented | - |
| SCIM Provisioning | 🟡 Partial | P4 |
| Audit Logging | 🔮 Planned | P1 |

#### Developer Experience
| Capability | Status | Priority |
|------------|--------|----------|
| Webhooks | ✅ Implemented | - |
| API Keys | ✅ Implemented | - |
| Admin Portal Components | 🔮 Planned | P5 |

---

### Output 3: Implementation Roadmap

```
2025 Q1          2025 Q2          2025 Q3          2025 Q4
|----------------|----------------|----------------|
| Phase 1        | Phase 2        | Phase 3        | Phase 4        |
| MFA/2FA        | Passwordless   | Impersonation  | SCIM           |
| Audit Logs     | Sessions       | Org Switcher   | Breach Check   |
|                | Passkeys       |                |                |
```

#### Phase 1: Enterprise Security Foundation (Q1)
**Theme**: Compliance & Security Baseline
**Investment**: ~7 person-months

| Feature | Priority | Effort | Dependencies |
| ------- | -------- | ------ | ------------ |
| MFA/2FA | P1-Must | L (3 PM) | None |
| Audit Logs | P1-Must | L (4 PM) | None |

**Exit Criteria**: SOC2/GDPR compliance requirements met

#### Phase 2: Modern Authentication (Q2)
**Theme**: Authentication Innovation
**Investment**: ~7.5 person-months

| Feature | Priority | Effort | Dependencies |
| ------- | -------- | ------ | ------------ |
| Session Management | P2-Should | M (2.5 PM) | None |
| Passwordless Auth | P2-Should | M (2 PM) | Email module |
| Passkeys/WebAuthn | P2-Should | M (3 PM) | None |

**Exit Criteria**: 3+ passwordless auth methods available

#### Phase 3: Self-Service & Administration (Q3)
**Theme**: Customer Enablement
**Investment**: ~2.5 person-months

| Feature | Priority | Effort | Dependencies |
| ------- | -------- | ------ | ------------ |
| User Impersonation | P3-Could | S (1 PM) | Audit Logs |
| Organization Switcher | P3-Could | S (1.5 PM) | None |

**Exit Criteria**: Support team can impersonate users for debugging

#### Phase 4: Enterprise Completion (Q4)
**Theme**: Enterprise Feature Completion
**Investment**: ~4 person-months

| Feature | Priority | Effort | Dependencies |
| ------- | -------- | ------ | ------------ |
| SCIM Provisioning | P4-Could | M (3 PM) | SSO |
| Breached Password Check | P4-Could | S (1 PM) | None |

**Exit Criteria**: Full SCIM 2.0 compliance

---

### Output 4: Executive Summary

**Strategic Recommendation**: Invest in MFA and Audit Logs immediately (Phase 1) to close critical enterprise gaps, followed by modern authentication methods to match competitor offerings.

**Top 3 Priorities**:
1. **MFA/2FA** - 83% of enterprises mandate MFA; blocking for enterprise deals
2. **Audit Logs** - Required for SOC2/GDPR/HIPAA compliance certification
3. **Session Management** - Core security capability expected by all customers

**Investment Required**:
- Total Effort: ~21 person-months
- Timeline: 4 quarters (1 year)
- Phases: 4

**Expected Outcomes**:
- Feature Parity: 50% → 85% vs Auth0/Clerk core features
- Enterprise Readiness: SOC2/GDPR compliance enabled
- Competitive Position: Parity with WorkOS, approaching Frontegg
