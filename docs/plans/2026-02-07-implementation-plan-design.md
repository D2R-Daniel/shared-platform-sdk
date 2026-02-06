# Shared Platform SDK -- Implementation Plan

**Date**: 2026-02-07
**Status**: Approved
**Branch**: `006-platform-component-expansion`
**Language**: TypeScript (Node.js only)
**Team Size**: 6-10 developers
**Approach**: Vertical slices (module-by-module, end-to-end)
**Timeline**: ~16 weeks across 6 phases

---

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Language | TypeScript only | All current products use TypeScript. Eliminates cross-language sync overhead. |
| Runtime | Node.js only | No browser or edge runtime requirements. Can use Node.js crypto, fs, http APIs directly. |
| Implementation approach | Vertical slices | Each module ships end-to-end (types, client, errors, tests) before moving to the next. Enables incremental delivery. |
| Primary constraints | Technical dependencies + Team capacity + Time-to-market | Dependencies set the build order, capacity determines parallelism, time-to-market drives prioritization. |

---

## Module Inventory (28 Total)

### Existing Modules Enhanced (12)

| Module | Spec Document | Key Enhancements |
|--------|--------------|------------------|
| Auth | auth-security-modules-spec.md | Token management improvements, PKCE enhancements |
| Users | identity-access-modules-spec.md | Ban/lock, bulk ops, dual metadata, profile enrichment |
| Roles & Permissions | identity-access-modules-spec.md | Resource-scoped, ReBAC, permission conditions |
| Multi-Tenancy | organization-modules-spec.md | Verified domains, connections, environment promotion |
| SSO | organization-modules-spec.md | Multiple connections/tenant, self-service config |
| Teams | organization-modules-spec.md | Custom roles, team invitations |
| Departments | organization-modules-spec.md | SCIM sync, hierarchy improvements |
| Invitations | platform-infrastructure-modules-spec.md | Analytics, reminders, expiry policies |
| Webhooks | platform-infrastructure-modules-spec.md | Exponential backoff, event registry, bulk recovery |
| API Keys | platform-infrastructure-modules-spec.md | Publishable keys, scoping, rotation policies |
| Email | platform-infrastructure-modules-spec.md | Template versioning, i18n, provider abstraction |
| Settings | platform-infrastructure-modules-spec.md | History/versioning, environments |

### New Modules (16)

| Module | Priority | Spec Document |
|--------|----------|--------------|
| Session Management | P1 | auth-security-modules-spec.md |
| MFA/2FA | P1 | auth-security-modules-spec.md |
| Audit Logs | P1 | platform-infrastructure-modules-spec.md |
| Compliance/Data Privacy | P1 | compliance-connections-oauth-modules-spec.md |
| Passwordless Auth | P2 | auth-security-modules-spec.md |
| Passkeys/WebAuthn | P2 | auth-security-modules-spec.md |
| User Impersonation | P3 | identity-access-modules-spec.md |
| SCIM Endpoints | P2 | organization-modules-spec.md |
| Organization Switcher | P3 | organization-modules-spec.md |
| Social Connections Manager | P2 | compliance-connections-oauth-modules-spec.md |
| OAuth2 Authorization Server | P2 | compliance-connections-oauth-modules-spec.md |
| Notifications/In-App Messaging | P2 | engagement-operations-modules-spec.md |
| Analytics & Reporting | P2 | engagement-operations-modules-spec.md |
| Rate Limiting | P2 | engagement-operations-modules-spec.md |
| Breached Password Check | P4 | auth-security-modules-spec.md |
| Admin Portal Components | P3 | platform-infrastructure-modules-spec.md |

---

## Dependency Graph

```
Layer 0 (Foundation)
├── Auth enhancements
├── Session Management
├── Audit Logs
├── Settings enhancements
└── Email enhancements

Layer 1 (Core Security) -- depends on Layer 0
├── MFA/2FA ← Auth, Sessions
├── Passwordless Auth ← Auth, Sessions, Email
├── Users enhancements ← Auth
├── Roles & Permissions enhancements ← Users
├── Webhooks enhancements ← Audit
└── API Keys enhancements ← Auth

Layer 2 (Organization & Advanced Auth) -- depends on Layers 0-1
├── Passkeys/WebAuthn ← Auth, Sessions
├── Breached Password Check ← Auth
├── User Impersonation ← Auth, Users, Sessions
├── Multi-Tenancy enhancements ← Auth, Users
├── SSO enhancements ← Auth, Tenants
├── Teams enhancements ← Users, Tenants
├── Departments enhancements ← Tenants
└── Invitations enhancements ← Email, Teams

Layer 3 (Platform Services) -- depends on Layers 0-2
├── SCIM Endpoints ← Users, SSO, Tenants
├── Social Connections Manager ← Auth, Users
├── Rate Limiting ← Tenants, API Keys
├── Organization Switcher ← Tenants, Users
└── Compliance/Data Privacy ← Users, Tenants, Audit

Layer 4 (Advanced Platform) -- depends on Layers 0-3
├── OAuth2 Authorization Server ← Auth, Users, Tenants
├── Notifications/In-App Messaging ← Users, Tenants, Email
└── Analytics & Reporting ← Audit, Users, Tenants

Layer 5 (Integration) -- depends on all
└── Admin Portal Components ← all modules
```

---

## Phase Plan

### Phase 0: Foundation (Weeks 1-2)

> Goal: Establish the modules everything else depends on.

| Stream | Modules | Developers | Key Deliverables |
|--------|---------|------------|------------------|
| A | Auth enhancements + Session Management | 2 | Enhanced token management, PKCE improvements, session CRUD (`create`, `list`, `get`, `revoke`, `revokeAll`), device tracking |
| B | Audit Logs (new) | 2 | Audit client (`log`, `query`, `export`), hash-chain integrity, SIEM streaming config, retention policies |
| C | Settings enhancements + Email enhancements | 1-2 | Settings history/versioning, email template versioning, i18n support, provider abstraction |

**Parallel streams**: 3
**Total developers**: 5-6
**Exit criteria**: Auth client with sessions, audit log client with query API, settings with versioning, email with i18n. Shared test utilities and mock server patterns established.

---

### Phase 1: Core Security (Weeks 3-5)

> Goal: Complete the auth stack for competitive parity. Shippable milestone.

| Stream | Modules | Developers | Key Deliverables |
|--------|---------|------------|------------------|
| A | MFA/2FA | 2 | TOTP enrollment, SMS/email OTP, backup codes, recovery, step-up auth, trusted devices |
| B | Passwordless Auth | 1-2 | Magic link generation/validation, OTP via email/SMS, auto-account creation |
| C | Users enhancements + Roles & Permissions enhancements | 2 | Ban/lock/unlock, bulk import/export, dual metadata. Resource-scoped permissions, conditional access, permission evaluation engine |
| D | Webhooks enhancements + API Keys enhancements | 1-2 | Exponential backoff retry, auto-disable on failure, event type registry with schemas. Publishable keys, scoped permissions, rotation policies |

**Parallel streams**: 4
**Total developers**: 6-8
**Milestone**: Fully competitive auth stack (password + MFA + passwordless) with enhanced user management.
**Exit criteria**: All auth methods functional, webhook infrastructure upgraded, API keys with scoping.

---

### Phase 2: Organization & Advanced Auth (Weeks 6-8)

> Goal: Enterprise-ready identity platform with full org management.

| Stream | Modules | Developers | Key Deliverables |
|--------|---------|------------|------------------|
| A | Passkeys/WebAuthn | 2 | FIDO2 credential registration/authentication, discoverable credentials, platform + cross-platform authenticator support |
| B | Breached Password Check + User Impersonation | 1-2 | HaveIBeenPwned k-anonymity API, configurable enforcement. JWT `act` claim (RFC 8693), impersonate/end sessions, audit trail |
| C | Multi-Tenancy enhancements + SSO enhancements | 2 | Verified domains, tenant connections, environment promotion. Multiple SSO connections/tenant, self-service setup, JIT provisioning enhancements |
| D | Teams + Departments + Invitations enhancements | 2 | Custom team roles, team invitations, department SCIM sync, invitation analytics/reminders |

**Parallel streams**: 4
**Total developers**: 7-8
**Milestone**: Enterprise-ready identity platform -- all auth methods, full org management, SSO.
**Exit criteria**: WebAuthn flows working, impersonation with audit trail, SSO self-service, team custom roles.

---

### Phase 3: Platform Services (Weeks 9-11)

> Goal: Build integration and governance capabilities.

| Stream | Modules | Developers | Key Deliverables |
|--------|---------|------------|------------------|
| A | SCIM Endpoints | 2 | Full RFC 7644: Users + Groups provisioning, filtering, bulk operations, schema discovery |
| B | Social Connections Manager | 2 | 15+ OAuth providers, connection CRUD, auth flow orchestration, account linking/unlinking |
| C | Rate Limiting | 2 | Policies, rules, algorithms (sliding window, token bucket, fixed window), plan-based limits, bypass rules, distributed store config |
| D | Organization Switcher + Compliance/Data Privacy | 2 | Multi-org membership, context switching, active-org management. GDPR export/deletion, consent management, retention policies, breach notification |

**Parallel streams**: 4
**Total developers**: 8
**Exit criteria**: SCIM provisioning working, 15+ social providers, rate limiting with plan mapping, compliance data export/deletion.

---

### Phase 4: Advanced Platform (Weeks 12-14)

> Goal: Complete the platform with advanced capabilities.

| Stream | Modules | Developers | Key Deliverables |
|--------|---------|------------|------------------|
| A | OAuth2 Authorization Server | 3 | Client management, authorization/token endpoints, OIDC discovery, JWKS rotation, device flow (RFC 8628), token introspection (RFC 7662), scopes/claims management, consent management, token policies |
| B | Notifications/In-App Messaging | 2-3 | Multi-channel delivery (in-app, push, SMS, email), notification templates, user preferences, digest/batching, workflows, real-time feed (WebSocket/SSE) |
| C | Analytics & Reporting | 2 | Built-in metrics (auth events, user growth, tenant usage, security), custom event tracking, funnel analysis, scheduled reports, threshold alerts, data export (CSV/JSON) |

**Parallel streams**: 3
**Total developers**: 7-8
**Exit criteria**: OAuth2 server with full RFC compliance, multi-channel notifications with preferences, analytics with scheduled reports.

---

### Phase 5: Integration & Polish (Weeks 15-16)

> Goal: Production-ready, fully tested, documented SDK.

| Stream | Modules | Developers | Key Deliverables |
|--------|---------|------------|------------------|
| A | Admin Portal Components | 2-3 | 6 React components: UserTable, RoleManager, TeamBrowser, AuditViewer, SettingsPanel, InvitationManager. Each embeddable with theming. |
| B | Cross-module integration testing | 2 | End-to-end flows: signup -> MFA -> session -> impersonation -> audit. Multi-tenant isolation. SCIM + SSO integration. OAuth2 full flows. |
| C | Documentation & DX polish | 1-2 | API reference (auto-generated from types), migration guide from existing SDK, example applications, getting-started guide, SDK initialization ergonomics review |

**Parallel streams**: 3
**Total developers**: 5-7
**Exit criteria**: All components render correctly, integration tests pass, documentation complete, example app working.

---

## Module Definition of Done

Every module must meet these criteria before marking complete:

| Criteria | Details |
|----------|---------|
| Types | All models/interfaces defined in `{module}/types.ts`, exported from package index |
| Client | Client class with full API surface in `{module}/client.ts` |
| Errors | Module-specific error classes in `{module}/errors.ts`, extending base hierarchy |
| Events | Webhook event constants in `{module}/events.ts` (if applicable) |
| Tests | 90%+ line coverage, all API methods tested, error scenarios covered |
| Exports | Module exported from `src/index.ts` |
| Audit integration | All state-changing operations emit audit events |
| Webhook integration | All relevant events registered in webhook event registry |

### Module Directory Structure (TypeScript)

```
packages/node/src/{module}/
├── index.ts         # Public exports
├── client.ts        # Main client class
├── types.ts         # TypeScript interfaces and types
├── errors.ts        # Module-specific error classes
└── events.ts        # Webhook event constants (if applicable)
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| OAuth2 Server complexity | Allocate 3 devs and 3 weeks. Start with core flows (auth code + PKCE, client credentials), add advanced flows (device, token exchange) iteratively. |
| WebAuthn browser dependency | Focus on server-side credential management and ceremony verification. Provide client-side helpers as utilities, not core SDK. |
| Cross-module integration issues | Establish integration test framework in Phase 0. Run integration suite on every PR from Phase 1 onward. |
| Scope creep from "nice-to-have" features | Each spec clearly separates Must Have / Should Have / Nice to Have. Phase plan only includes Must Have + Should Have. Nice to Have deferred post-GA. |
| Developer context switching | Vertical slices minimize switching. Each dev stays on a module until it's complete. |

---

## Timeline Summary

```
Week  1-2:   Phase 0 -- Foundation (Auth, Sessions, Audit, Settings, Email)
Week  3-5:   Phase 1 -- Core Security (MFA, Passwordless, Users, Roles, Webhooks, API Keys)
Week  6-8:   Phase 2 -- Organization (Passkeys, Impersonation, Tenancy, SSO, Teams)
Week  9-11:  Phase 3 -- Platform Services (SCIM, Social, Rate Limiting, Compliance, Org Switcher)
Week  12-14: Phase 4 -- Advanced (OAuth2 Server, Notifications, Analytics)
Week  15-16: Phase 5 -- Integration (Admin Portal, E2E Tests, Documentation)
```

**Total**: 16 weeks to GA with 28 modules across 6 spec documents (9,475 lines of requirements).

---

## Spec Document Reference

| Document | Location | Modules Covered |
|----------|----------|-----------------|
| Auth & Security | `docs/specs/auth-security-modules-spec.md` | Auth, MFA, Passwordless, Passkeys, Sessions, Breached Password |
| Identity & Access | `docs/specs/identity-access-modules-spec.md` | Users, Roles & Permissions, User Impersonation |
| Organization | `docs/specs/organization-modules-spec.md` | Multi-Tenancy, SSO, Teams, Departments, SCIM, Org Switcher |
| Platform Infrastructure | `docs/specs/platform-infrastructure-modules-spec.md` | Webhooks, API Keys, Email, Settings, Invitations, Audit Logs, Admin Portal |
| Engagement & Operations | `docs/specs/engagement-operations-modules-spec.md` | Notifications, Analytics, Rate Limiting |
| Compliance & Connections | `docs/specs/compliance-connections-oauth-modules-spec.md` | Compliance, Social Connections, OAuth2 Server |
