# Competitor Research: PropelAuth + Stytch (Combined Analysis)
**Category**: Full Platform Infrastructure
**Research Date**: 2026-02-07
**Researcher**: Claude (automated)

---

## Overview

PropelAuth and Stytch are analyzed together as complementary B2B auth competitors. PropelAuth is a lean, B2B-focused startup with deep organization support. Stytch is a well-funded platform combining B2B auth with industry-leading fraud prevention. Together they represent the "B2B auth with organizations" segment.

---

# PART A: PropelAuth

## 1. Company Profile

| Attribute | Details |
|-----------|---------|
| **Website** | [propelauth.com](https://www.propelauth.com) |
| **Founded** | 2021 |
| **Headquarters** | Redwood City, CA |
| **Total Funding** | ~$3.09M across 2 rounds |
| **Revenue** | ~$1.1M ARR (2024 estimate) |
| **Employees** | ~7 |
| **Target Market** | B2B SaaS startups and early-stage companies needing team-based auth |
| **Market Position** | Niche -- B2B-focused auth with exceptional DX for small teams |
| **Accelerator** | Y Combinator |
| **Key Customers** | Tennr, Wiv.ai, and other YC-adjacent startups |

**Summary**: PropelAuth is the smallest competitor in this analysis but punches well above its weight in developer experience for B2B auth. With just 7 employees generating $1.1M ARR, they demonstrate exceptional efficiency. Their laser focus on B2B organizations (not consumer auth) means every feature is designed for multi-tenant scenarios. They're a YC company with a cult following among developers building B2B products who find Auth0/Okta too complex and consumer-focused.

---

## 2. Module Coverage Matrix (PropelAuth)

| # | Module Area | Status | Feature Depth | Notes |
|---|-------------|--------|---------------|-------|
| 1 | **Auth** (OAuth2/OIDC, JWT) | ✅ Full | Standard | Email+password, social login, magic links, 2FA/MFA enforcement. Passwordless options. |
| 2 | **Users** (CRUD, profiles) | ✅ Full | Standard | User management, properties, impersonation, metrics & insights. |
| 3 | **Roles & Permissions** (RBAC) | ✅ Full | Advanced | Organization-scoped RBAC, advanced RBAC with custom hierarchies. Organizations treated as first-class citizens in the permission model. |
| 4 | **Multi-Tenancy** | ✅ Full | Advanced | Core architectural principle. Unlimited organizations. Per-org auth settings, login restrictions, SSO configuration. |
| 5 | **SSO** (SAML, OIDC) | ✅ Full | Standard | Enterprise SSO via SAML. Unlimited SAML connections (no SSO tax). Self-service SSO setup. |
| 6 | **Teams** (hierarchy, members) | ✅ Full | Standard | Organization-based team management with invites and collaborators. |
| 7 | **Invitations** (token-based, bulk) | ✅ Full | Standard | Organization invitations, email-based onboarding. |
| 8 | **Webhooks** (subscriptions, signatures) | 🟡 Partial | Basic | Event notifications available but not as comprehensive as WorkOS/Clerk. |
| 9 | **API Keys** (rate limiting, IP) | ✅ Full | Standard | API key management with rate limiting. Explicitly supports API key generation for end-users. |
| 10 | **Email** (templates, SMTP) | 🟡 Partial | Basic | Auth-related transactional emails. Basic customization. |
| 11 | **Settings** (tenant config) | 🟡 Partial | Standard | Per-organization settings configurable via dashboard. |
| 12 | **Notifications** (multi-channel) | ❌ Not Available | N/A | No notification system. |
| 13 | **Feature Flags** (evaluate, entitlements) | ❌ Not Available | N/A | No feature flags. |
| 14 | **Audit Logging** (compliance, export) | ✅ Full | Standard | Audit logs available on Growth and Enterprise plans. |
| 15 | **Sessions** (concurrent, geo-tracking) | 🟡 Partial | Basic | Session management via JWT. Basic session handling. |
| 16 | **Billing** (subscriptions, metering) | ❌ Not Available | N/A | No billing product. |
| 17 | **Analytics** (usage tracking, events) | 🟡 Partial | Basic | User metrics and insights in dashboard. Not an end-user analytics module. |
| 18 | **File Storage** (uploads, management) | ❌ Not Available | N/A | No file storage. |

**Coverage Score (PropelAuth)**: 9/18 Full, 5/18 Partial, 4/18 Missing

---

## 3. SDK/API Design Patterns (PropelAuth)

### Client Initialization
```python
# Python (FastAPI)
from propelauth_fastapi import init_auth

auth = init_auth("https://YOUR_AUTH_URL.propelauthtest.com", "YOUR_API_KEY")

@app.get("/whoami")
async def whoami(user: User = Depends(auth.require_user)):
    return {"user_id": user.user_id}
```

```typescript
// Next.js (App Router)
import { getUser } from "@propelauth/nextjs/server/app-router";

export default async function Page() {
  const user = await getUser();
  // user.orgIdToOrgMemberInfo for multi-tenant context
}
```

| Pattern | Implementation |
|---------|---------------|
| **Client init** | URL + API key initialization. Framework-specific wrappers (FastAPI, Flask, Django, Express). |
| **Auth context propagation** | JWT with org membership info. `orgIdToOrgMemberInfo` map for multi-tenant context. Framework middleware. |
| **Error handling** | Standard HTTP error codes. Python exceptions. Straightforward error model. |
| **Pagination** | Standard offset-based pagination. |
| **Rate limiting** | API key rate limiting available as end-user feature. |
| **Type safety** | TypeScript types for frontend. Python type hints. |
| **Async support** | Async support in FastAPI integration. Standard async/await in Node.js. |
| **Languages supported** | Python (FastAPI, Flask, Django REST), Node.js/JavaScript, Go, Rust, React, Next.js |
| **Missing languages** | No Java, Ruby, C#, PHP SDKs |
| **Documentation quality** | 4/5 -- Praised as "remarkably clear, easy, and robust." Concise and well-organized. |

### Notable Design Decisions
- **Organizations as first-class in SDK**: Every SDK method is organization-aware. The `orgIdToOrgMemberInfo` pattern threads tenant context naturally.
- **Separate testing environment**: Free testing environment by default -- users aren't billed for test users. This is a thoughtful DX decision.
- **Custom domains on free plan**: Even the free plan includes custom domain support.
- **Rust SDK**: Unusual choice that signals targeting of infrastructure/systems companies.

---

## 4. Multi-Tenancy Approach (PropelAuth)

| Aspect | Implementation |
|--------|---------------|
| **Tenant model** | "Organizations" -- unlimited on all plans |
| **Isolation strategy** | Organization membership embedded in JWT, middleware-based org context |
| **Org switcher** | Frontend library provides organization switching |
| **Sub-tenants** | Not explicitly documented |
| **Per-tenant config** | Per-org auth settings, login restrictions, SSO configuration |
| **Custom domains** | Available on all plans including free |

**Key Insight**: PropelAuth treats organizations as the core primitive, not an add-on. Every API method, middleware function, and UI component is designed around the assumption of multi-tenancy. This is architecturally the most similar approach to what our SDK should do.

---

## 5. Developer Experience (PropelAuth)

| Metric | Assessment |
|--------|-----------|
| **Time to hello world** | ~10-15 minutes |
| **Quickstart quality** | Excellent -- concise and focused |
| **Code examples** | Good -- framework-specific examples, fewer than Clerk |
| **Framework integrations** | React, Next.js (App + Pages Router), FastAPI, Flask, Django REST, Express, Go (Gin, Chi), Rust (Axum, Actix) |
| **Pre-built UI** | Out-of-the-box hosted UIs for login, signup, org management. Not as customizable as Clerk components. |
| **Headless API** | Full REST API available |
| **Unique DX**: | "Free until funded" plan for startups. Separate test environment. Personal support from founders. |

---

## 6. Pricing Model (PropelAuth)

| Tier | Price | Includes |
|------|-------|----------|
| **Free** | $0 | Limited users/orgs, basic features, custom domains |
| **Startup** | ~$100-200/month | Expanded limits, MFA, audit logs |
| **Growth** | ~$300-500/month | Enterprise SSO, SCIM, advanced RBAC, MFA enforcement |
| **Enterprise** | Custom | All features, dedicated support |
| **Free Until Funded** | $0 | For pre-funding startups -- full features until they raise |

| Scale | Estimated Cost |
|-------|---------------|
| **10K MAU** | ~$100-200/month |
| **100K MAU** | ~$500-1,000/month (volume discounts) |
| **1M MAU** | Custom enterprise pricing |

**Pricing Analysis**: PropelAuth's pricing is relatively affordable and includes unlimited organizations and unlimited SAML connections even on paid plans. The "Free until funded" program is a brilliant startup acquisition strategy. No SSO tax is a shared competitive advantage with Clerk.

---

# PART B: Stytch

## 1. Company Profile

| Attribute | Details |
|-----------|---------|
| **Website** | [stytch.com](https://stytch.com) |
| **Founded** | 2020 |
| **Headquarters** | San Francisco, CA |
| **Co-Founders** | Reed McGinley-Stempel (CEO), Julianna Lamb (CTO) |
| **Total Funding** | ~$126-146M (Series B: $90M led by Coatue, Nov 2021) |
| **Valuation** | ~$1B (2024 estimate) |
| **Revenue** | ~$12M ARR (November 2024) |
| **Employees** | ~61-66 |
| **Target Market** | Developers building both consumer and B2B apps; companies needing fraud prevention |
| **Market Position** | Challenger -- strong in fraud prevention + auth; growing B2B capabilities |
| **Key Customers** | Cisco, Replit, HubSpot, Bitcoin.com |

**Summary**: Stytch is the most well-funded competitor in this group ($126-146M) but has relatively modest revenue ($12M ARR) compared to its funding level, suggesting heavy R&D investment. Their unique positioning combines authentication with fraud prevention (Device Fingerprinting), which no other competitor matches. The B2B product is newer than their consumer offering but has rapidly matured with first-class organization support, RBAC, SCIM, and SSO. The recent Terraform provider and user impersonation features signal growing enterprise maturity.

---

## 2. Module Coverage Matrix (Stytch)

| # | Module Area | Status | Feature Depth | Notes |
|---|-------------|--------|---------------|-------|
| 1 | **Auth** (OAuth2/OIDC, JWT) | ✅ Full | Advanced | Email magic links, OTP, OAuth, passwords, biometrics, passkeys, TOTP, crypto wallets. Both Consumer and B2B auth products. |
| 2 | **Users** (CRUD, profiles) | ✅ Full | Standard | Member management within organizations. User profiles, metadata, impersonation (Feb 2025). |
| 3 | **Roles & Permissions** (RBAC) | ✅ Full | Advanced | Organization-scoped RBAC. Multiple roles per member. Automatic role assignment via SCIM groups, email domains, or SSO connections. |
| 4 | **Multi-Tenancy** | ✅ Full | Advanced | Organizations and Members as core entities. Per-org auth settings, provisioning rules, login restrictions. |
| 5 | **SSO** (SAML, OIDC) | ✅ Full | Advanced | SAML + OIDC. Per-organization IdP connections. Self-service SSO management via embedded SDK. 5 free SSO connections, then $125/additional. |
| 6 | **Teams** (hierarchy, members) | ✅ Full | Standard | Organization memberships with roles. Member invitations, JIT provisioning, SCIM provisioning. |
| 7 | **Invitations** (token-based, bulk) | ✅ Full | Standard | Magic Link-powered email invitations, JIT provisioning, manual API-based provisioning. |
| 8 | **Webhooks** (subscriptions, signatures) | ✅ Full | Standard | Webhook events for provisioning/deprovisioning, SCIM updates, dashboard events. |
| 9 | **API Keys** (rate limiting, IP) | 🟡 Partial | Basic | M2M tokens (1,000 free). Not a full end-user API key management product. |
| 10 | **Email** (templates, SMTP) | 🟡 Partial | Basic | Auth-related emails (magic links, OTP). Basic customization. |
| 11 | **Settings** (tenant config) | ✅ Full | Standard | Per-organization settings: allowed auth methods, email domain restrictions, SSO/SCIM config, provisioning rules. Embeddable SDK for self-service management. |
| 12 | **Notifications** (multi-channel) | ❌ Not Available | N/A | No notification system. |
| 13 | **Feature Flags** (evaluate, entitlements) | ❌ Not Available | N/A | No feature flags. |
| 14 | **Audit Logging** (compliance, export) | ❌ Not Available | N/A | Notably absent. Cited as a key limitation in reviews. "Lacks product maturity, audit logs, and the ability to pull updates." |
| 15 | **Sessions** (concurrent, geo-tracking) | ✅ Full | Advanced | Session tokens + JWTs. Session management API for validation, authorization, metadata storage. |
| 16 | **Billing** (subscriptions, metering) | ❌ Not Available | N/A | No billing product. |
| 17 | **Analytics** (usage tracking, events) | ❌ Not Available | N/A | No analytics product. |
| 18 | **File Storage** (uploads, management) | ❌ Not Available | N/A | No file storage. |

**Coverage Score (Stytch)**: 10/18 Full, 2/18 Partial, 6/18 Missing

---

## 3. SDK/API Design Patterns (Stytch)

### Client Initialization
```python
# Python Backend SDK
import stytch

client = stytch.Client(
    project_id="project-live-...",
    secret="secret-live-...",
)

response = client.magic_links.email.login_or_create(
    email="user@example.com"
)
```

```typescript
// Node.js Backend SDK
import * as stytch from 'stytch';

const client = new stytch.Client({
  project_id: 'project-live-...',
  secret: 'secret-live-...',
});

const response = await client.magicLinks.email.loginOrCreate({
  email: 'user@example.com',
});
```

| Pattern | Implementation |
|---------|---------------|
| **Client init** | Project ID + Secret key initialization. Separate Consumer and B2B clients. |
| **Auth context propagation** | Session tokens + JWTs. Session validation for request authorization. |
| **Error handling** | `StytchError` exception with `.details` property containing `error_type` for programmatic handling. |
| **Pagination** | Standard offset-based pagination. |
| **Rate limiting** | Designed so legitimate traffic shouldn't hit limits. Device Fingerprinting enables dynamic rate limiting per device. |
| **Type safety** | TypeScript types in Node SDK. Python type hints. Auto-generated SDKs with "humanlike" code quality. |
| **Async support** | Async support in backend SDKs. |
| **Languages supported** | Node.js, Python, Go, Ruby, Java, PHP, .NET |
| **Framework integrations** | React, Next.js, Astro. Pre-built UI components. |
| **Documentation quality** | 4/5 -- Well-organized with separate Consumer and B2B docs. Good API reference. |

### Notable Design Decisions
- **Auto-generated SDKs**: Stytch generates SDKs from API specifications but invests in making them "humanlike" -- readable, idiomatic code rather than typical auto-gen output.
- **Separate Consumer vs B2B products**: Two distinct product lines with different APIs and SDKs, rather than one product trying to serve both.
- **Terraform provider**: Infrastructure-as-code support for auth configuration -- unique among competitors. Enables programmatic management without dashboard dependency.
- **Device Fingerprinting integration**: Auth-integrated fraud detection is a first-class feature, not a bolt-on.

---

## 4. Multi-Tenancy Approach (Stytch)

| Aspect | Implementation |
|--------|---------------|
| **Tenant model** | "Organizations" + "Members" as core B2B entities |
| **Isolation strategy** | Per-org settings, auth method restrictions, provisioning rules |
| **Org switcher** | SDK-embedded organization management |
| **Sub-tenants** | Not documented |
| **Per-tenant config** | Allowed auth methods, email domain restrictions, invite settings, SSO connection management, custom attributes |
| **Provisioning** | Three modes: Invites (magic link), JIT provisioning, Manual API. Plus SCIM for enterprise. |

**Key Insight**: Stytch's organization model is thoughtfully designed with configurable provisioning and per-org auth settings. The three-mode provisioning approach (invites, JIT, manual) is more flexible than most competitors.

---

## 5. Developer Experience (Stytch)

| Metric | Assessment |
|--------|-----------|
| **Time to hello world** | ~15-20 minutes |
| **Quickstart quality** | Good -- separate consumer and B2B quickstarts |
| **Code examples** | Good -- example apps on GitHub, B2B SaaS pre-built UI example |
| **Framework integrations** | React, Next.js, Astro, Node.js, Python, Go, Ruby, Java |
| **Pre-built UI** | SDK-embedded UI components for auth + org management. SSO/SCIM self-service. |
| **Headless API** | Full REST API for both Consumer and B2B products |
| **Unique DX** | Terraform provider for IaC management. Device fingerprinting API available standalone. |

---

## 6. Enterprise Features (Combined)

| Feature | PropelAuth | Stytch |
|---------|-----------|--------|
| **SOC 2** | ❓ Not confirmed | ✅ Likely (enterprise customers like Cisco) |
| **GDPR** | ❓ Not confirmed | ✅ Likely |
| **HIPAA** | ❌ Not confirmed | ❓ Not confirmed |
| **SCIM** | ✅ Yes (Growth plan) | ✅ Yes (5 free, $125/additional) |
| **Audit Logging** | ✅ Yes (Growth plan) | ❌ No (key gap) |
| **SLA** | Enterprise plan | Enterprise plan |
| **Fraud Prevention** | ❌ No | ✅ Yes (Device Fingerprinting -- industry-leading) |
| **User Impersonation** | ✅ Yes | ✅ Yes (Feb 2025) |
| **Terraform IaC** | ❌ No | ✅ Yes (GA Feb 2025) |

---

## 7. Pricing Model (Stytch)

| Tier | Price | Includes |
|------|-------|----------|
| **Free** | $0/month | <10K MAU. Unlimited orgs. 5 SSO/SCIM connections. 1,000 M2M tokens. Full auth + RBAC suite. |
| **Pay-as-you-go** | Scales with MAU | Above 10K MAU, usage-based pricing |
| **Add-ons** | Various | Custom branding: $99/month. Additional SSO/SCIM: $125/connection. Fraud prevention features. |

| Scale | Estimated Cost |
|-------|---------------|
| **10K MAU** | $0 (free tier) |
| **100K MAU** | Estimated $500-2,000/month (usage-based) |
| **1M MAU** | Custom enterprise pricing |

**Pricing Analysis**: Stytch's free tier is generous -- 10K MAU, unlimited organizations, 5 SSO/SCIM connections, and full RBAC. The SSO pricing ($125/connection after 5 free) follows WorkOS's model. The per-connection pricing for SSO is the primary cost driver. Device Fingerprinting and fraud tools are add-on revenue streams that differentiate Stytch's monetization model.

---

## 8. Unique Differentiators

### PropelAuth
1. **B2B-Only Focus**: Built exclusively for B2B -- every decision optimized for multi-tenant scenarios. No consumer auth distraction.
2. **"Free Until Funded" Program**: Startups get full features free until they raise -- brilliant acquisition strategy.
3. **7-Person Efficiency**: $1.1M ARR with 7 people demonstrates exceptional product-market fit and lean operations.
4. **Rust SDK**: Only competitor with Rust support -- targets infrastructure and systems companies.
5. **Separate Test Environment**: Free testing environment by default, no billing for test users.
6. **API Key Management for End-Users**: Unlike most competitors, PropelAuth includes end-user API key generation with rate limiting.

### Stytch
1. **Device Fingerprinting**: Industry-leading fraud prevention with 20+ proprietary signals, tamper detection, and stable identifiers across incognito/VPN. Can be used standalone outside auth.
2. **Dual Product Architecture**: Separate Consumer and B2B auth products, each purpose-built for their use case.
3. **Terraform Provider**: Infrastructure-as-code for auth configuration -- unique among identity vendors. Enables GitOps workflows for auth.
4. **Dynamic Rate Limiting**: Device Fingerprinting enables per-device rate limiting based on trust signals, not just IP.
5. **Three-Mode Provisioning**: Invites, JIT provisioning, and manual API -- most flexible member onboarding model.
6. **"Humanlike" Auto-Generated SDKs**: Investment in making generated code readable and idiomatic sets a quality bar for SDK generation.

---

## 9. SWOT vs Our SDK (Combined)

### Strengths (Their advantages)
- **PropelAuth**: Pure B2B focus means no architectural compromises for consumer auth. Exceptional documentation quality. API key management included. Affordable pricing with no SSO tax.
- **Stytch**: Device Fingerprinting is unique and valuable. $126-146M funding provides long runway. Major customer logos (Cisco, HubSpot). Broadest backend SDK coverage (Node, Python, Go, Ruby, Java, PHP, .NET). Terraform IaC support is forward-thinking.

### Weaknesses (Our advantages)
- **PropelAuth**: Tiny team (7 people) limits feature velocity and support capacity. $3M funding limits growth investment. No Java, Ruby, C#, PHP SDKs. No feature flags, billing, notifications, or analytics. Limited enterprise compliance certifications.
- **Stytch**: No audit logging is a critical enterprise gap. Revenue ($12M) disappointing relative to funding ($126-146M). B2B product newer and less battle-tested. No feature flags, billing, or analytics. Basic email capabilities.

### Opportunities (gaps we can exploit)
- Build comprehensive audit logging that Stytch lacks
- Provide feature flags and entitlements that neither offers
- Build billing/subscription management neither supports
- Offer notification and analytics modules
- Provide file storage capabilities
- Combine PropelAuth's B2B-first organization model with Stytch's fraud prevention concepts
- Build for all three primary languages (Python, Node, Java) with consistent quality

### Threats (risks from them)
- **PropelAuth**: If they raise significant funding, their B2B-first architecture could scale into a formidable platform competitor. Their developer loyalty is strong.
- **Stytch**: Their Device Fingerprinting technology could become essential for any auth platform. With $126-146M in funding, they have resources to expand rapidly. Adding audit logs and feature flags would close key gaps. Terraform IaC approach could become the standard for auth infrastructure management.

---

## 10. Key Insights for Our SDK

### Patterns to Adopt from PropelAuth
1. **Organizations as first-class SDK concept**: Every method should be organization-aware by default. The `orgIdToOrgMemberInfo` pattern is elegant.
2. **B2B-first architecture**: Design every module assuming multi-tenancy, not bolting it on later.
3. **API key management for end-users**: Include this as a module -- PropelAuth is one of the few that does this well.
4. **Separate test environments**: Make testing frictionless with isolated environments.
5. **Framework-specific wrappers**: PropelAuth's FastAPI, Flask, Django REST, Express wrappers show how to meet developers where they are.
6. **No SSO tax**: Include SSO connections in the plan, not as per-connection charges.

### Patterns to Adopt from Stytch
1. **Auto-generated SDKs from API spec**: Generate SDKs from OpenAPI spec but invest in making them idiomatic and readable. Stytch's "humanlike" generated code is the right approach.
2. **Separate Consumer vs B2B APIs**: Consider whether our SDK should have distinct B2B-optimized endpoints.
3. **Terraform/IaC support**: Plan for infrastructure-as-code configuration from the start.
4. **Structured error types**: `StytchError` with `.details.error_type` enables clean programmatic error handling.
5. **Three-mode provisioning**: Support invites, JIT, and manual provisioning for maximum flexibility.
6. **Device fingerprinting concepts**: Consider basic fraud detection signals in our auth module.

### Pitfalls to Avoid
1. **PropelAuth's scale limitations**: A 7-person team can't cover 18 modules. We need adequate investment in each module.
2. **Stytch's revenue/funding disconnect**: Heavy funding doesn't guarantee product-market fit. Focus on delivering value before raising aggressively.
3. **Stytch's missing audit logs**: This is a fundamental gap for enterprise customers. Our audit logging must be comprehensive from day one.
4. **Consumer/B2B split complexity**: Stytch's separate products add integration complexity. We should aim for one unified SDK with B2B features built in.

### Gaps to Close
1. Learn from PropelAuth's organization-first architecture
2. Consider fraud detection / device fingerprinting as an auth module enhancement
3. Terraform/IaC support should be planned early (not just dashboard-based config)
4. API key management for end-users is an underserved need
5. Member provisioning flexibility (invite, JIT, manual, SCIM) should all be supported

---

## 11. Research Sources

### PropelAuth Sources
| Source | URL | Confidence |
|--------|-----|------------|
| PropelAuth Official Website | https://www.propelauth.com | High |
| PropelAuth Documentation | https://docs.propelauth.com | High |
| PropelAuth Pricing | https://www.propelauth.com/pricing | High |
| PropelAuth Reference Docs | https://docs.propelauth.com/reference | High |
| PropelAuth GitHub | https://github.com/propelauth | High |
| PropelAuth Next.js SDK | https://www.npmjs.com/package/@propelauth/nextjs | High |
| PropelAuth React Reference | https://docs.propelauth.com/reference/frontend-apis/react | High |
| PropelAuth vs Auth0 | https://www.propelauth.com/post/propelauth-vs-auth0 | High (bias: self-comparison) |
| PropelAuth B2B Auth Roadmap | https://www.propelauth.com/post/auth-roadmap-b2b-customers-need | High |
| PropelAuth Y Combinator | https://www.ycombinator.com/companies/propelauth | High |
| Tennr Case Study | https://www.propelauth.com/post/case-study-tennr | High |
| Wiv.ai Case Study | https://www.propelauth.com/post/how-wiv-ai-uses-propelauth | High |
| Getlatka Revenue Data | https://getlatka.com/companies/propelauth.com | Medium |
| Auth0 Alternatives Review | https://www.auth0alternatives.com/propelauth | Medium |
| Crunchbase Profile | https://www.crunchbase.com/organization/propelauth | Medium |
| G2 Reviews | https://www.g2.com/products/propelauth/reviews | Medium |

### Stytch Sources
| Source | URL | Confidence |
|--------|-----|------------|
| Stytch Official Website | https://stytch.com | High |
| Stytch Documentation | https://stytch.com/docs | High |
| Stytch B2B Auth Guide | https://stytch.com/docs/b2b/guides/what-is-stytch-b2b-auth | High |
| Stytch Pricing | https://stytch.com/pricing | High |
| Stytch RBAC Overview | https://stytch.com/docs/b2b/guides/rbac/overview | High |
| Stytch Device Fingerprinting | https://stytch.com/docs/fraud/guides/device-fingerprinting/overview | High |
| Stytch B2B SDK Guide | https://stytch.com/docs/b2b/sdks/javascript-sdk/scim | High |
| Stytch Rate Limits | https://stytch.com/docs/resources/platform/rate-limits | High |
| Stytch Node.js SDK GitHub | https://github.com/stytchauth/stytch-node | High |
| Stytch Python SDK GitHub | https://github.com/stytchauth/stytch-python | High |
| Stytch B2B Example App | https://github.com/stytchauth/stytch-b2b-sdk-example | High |
| Stytch Customer Stories | https://stytch.com/customer-stories | High |
| Stytch Humanlike SDK Blog | https://stytch.com/blog/generating-humanlike-code-for-our-backend-sdks/ | High |
| Stytch API Rate Limiting Blog | https://stytch.com/blog/api-rate-limiting/ | High |
| Stytch Device Fingerprinting Blog | https://stytch.com/blog/what-is-device-fingerprinting/ | High |
| Stytch AI Threats Blog | https://stytch.com/blog/combating-ai-threats-stytchs-device-fingerprinting/ | High |
| Contrary Research Report | https://research.contrary.com/company/stytch | Medium |
| Sacra Revenue Analysis | https://sacra.com/c/stytch/ | Medium |
| Getlatka Revenue Data | https://getlatka.com/companies/stytch | Medium |
| Crunchbase Profile | https://www.crunchbase.com/organization/stytch-auth | Medium |
| Supertokens Stytch vs Auth0 | https://supertokens.com/blog/stytch-vs-auth0 | Medium (competitor bias) |
| Supertokens Stytch Pricing | https://supertokens.com/blog/stytch-pricing | Medium |
| G2 Reviews | https://www.g2.com/products/stytch/reviews | Medium |

---

## Appendix: Combined Competitive Position Map

```
Feature Breadth (modules covered)
  ^
  |  Frontegg (14/18)
  |
  |         Clerk (10/18)     Stytch (10/18)
  |
  |  PropelAuth (9/18)        WorkOS (9/18)
  |
  +---------------------------------------------> Enterprise Depth
       PropelAuth    Clerk    Stytch    WorkOS    Frontegg
       (Startup)    (Mid)    (Mid)    (Enterprise) (Enterprise)
```

**Key takeaway**: The market has a clear gap -- no competitor covers all 18 module areas. Frontegg comes closest at 14/18 but lacks notifications, file storage, and has weak analytics/billing. Our SDK has the opportunity to be the first platform that comprehensively addresses all 18 areas with consistent, multi-language SDK support.
