# Organization & Teams Modules - Comprehensive Requirements Specification

**Version:** 1.0.0
**Date:** 2026-02-06
**Status:** Draft
**Author:** SDK Architecture Team
**Branch:** 006-platform-component-expansion

---

## Table of Contents

1. [Multi-Tenancy Module (Enhancement)](#1-multi-tenancy-module-enhancement)
2. [SSO Module (Enhancement)](#2-sso-module-enhancement)
3. [Teams Module (Enhancement)](#3-teams-module-enhancement)
4. [Departments Module (Enhancement)](#4-departments-module-enhancement)
5. [SCIM Endpoints Module (New - P4)](#5-scim-endpoints-module-new)
6. [Organization Switcher Module (New - P3)](#6-organization-switcher-module-new)

---

## 1. Multi-Tenancy Module (Enhancement)

### Overview

The Multi-Tenancy module provides the foundational organizational unit for the platform. Each tenant represents an isolated organization (company, workspace, or account) with its own users, configurations, branding, and security policies. This module must evolve from basic CRUD and feature-flag management to a full-featured organization management system competitive with Auth0 Organizations, Clerk Organizations, and WorkOS Organizations.

**Value Proposition:** Enable B2B SaaS developers to implement multi-tenant architectures with tenant isolation, per-tenant branding, per-tenant authentication policies, and self-service administration -- all through a single SDK integration.

### Competitive Analysis

#### Auth0 Organizations
- **Strengths:** Organizations act as isolated containers within a single Auth0 tenant. Each organization supports per-org connections (SSO, social, database), per-org branding (logo, colors, login page), per-org member roles, and per-org invitations. Self-service SSO configuration allows organization admins to set up their own identity providers. The B2B SaaS Starter Kit provides a complete reference architecture.
- **Key Features We Lack:** Per-org connection management, per-org invitation flows, organization-level member roles (distinct from global roles), organization metadata for arbitrary key-value storage, self-service admin portal.
- **Reference:** [Auth0 Organizations Docs](https://auth0.com/docs/manage-users/organizations/configure-organizations/enable-connections), [Auth0 B2B SaaS Starter](https://github.com/auth0-developer-hub/auth0-b2b-saas-starter)

#### Clerk Organizations
- **Strengths:** Pre-built UI components (CreateOrganization, OrganizationProfile, OrganizationList, OrganizationSwitcher). Verified domains with auto-join/auto-invite. Custom roles (up to 10 per instance) and fine-grained permissions. Organization-level SAML/OIDC SSO. Membership request flows. Backend API for programmatic role/permission management (added November 2025).
- **Key Features We Lack:** Verified domain enrollment (auto-invite, auto-suggest), membership request/approval workflow, organization-level SSO configuration, pre-built UI component patterns, programmatic role/permission management API.
- **Reference:** [Clerk Organizations Overview](https://clerk.com/docs/guides/organizations/overview), [Clerk Roles and Permissions](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions), [Clerk Verified Domains](https://clerk.com/docs/guides/organizations/add-members/verified-domains)

#### WorkOS Organizations
- **Strengths:** Organizations serve as containers for SSO and SCIM connections. Organization memberships with statuses (pending, active, inactive). Role-based access within organizations with default and custom roles. Clean API design (create, get, list, update, delete for both organizations and memberships). Deep Directory Sync integration with events API.
- **Key Features We Lack:** Organization membership statuses, organization-level RBAC with custom roles, events API for real-time provisioning.
- **Reference:** [WorkOS Users and Organizations](https://workos.com/docs/authkit/users-organizations), [WorkOS Roles and Permissions](https://workos.com/docs/authkit/roles-and-permissions)

#### Firebase Auth (Identity Platform)
- **Strengths:** Multi-tenancy via Google Cloud Identity Platform. Tenant-specific sign-in providers and MFA configuration. Client-side tenant selection via `auth.tenantId`.
- **Weaknesses:** No built-in organization hierarchy, limited admin search/filtering across tenants, no RBAC or team management, requires custom implementation for most organizational features.
- **Reference:** [Firebase Multi-tenancy](https://cloud.google.com/identity-platform/docs/multi-tenancy-authentication)

#### Supabase Auth
- **Strengths:** Row-Level Security (RLS) provides strong data isolation at the database level. Flexible custom implementation via app_metadata.
- **Weaknesses:** No native multi-tenancy support. No organization or team primitives. Developers must build all organizational features from scratch or integrate third-party solutions like Clerk.
- **Reference:** [Supabase Multi-tenant Discussion](https://github.com/orgs/supabase/discussions/1615)

### Requirements

#### Core Features (Must Have)

1. **Organization Metadata**
   - Arbitrary key-value metadata storage on tenant objects (already exists as `metadata: Dict[str, Any]`)
   - Structured `private_metadata` field for server-side-only data (not exposed to client SDKs)
   - API methods: `updateMetadata(tenantId, metadata)`, `getMetadata(tenantId)`
   - Models: Add `private_metadata: Dict[str, Any]` to Tenant model

2. **Verified Domains**
   - Allow organizations to verify ownership of email domains
   - Support DNS TXT record verification and email-based verification
   - Verified domains enable auto-join and auto-invite enrollment modes
   - API methods:
     - `addDomain(tenantId, domain)` -> `TenantDomain`
     - `verifyDomain(tenantId, domainId, verificationCode)` -> `TenantDomain`
     - `listDomains(tenantId)` -> `TenantDomainListResponse`
     - `removeDomain(tenantId, domainId)` -> `void`
   - Models:
     - `TenantDomain`: id, tenant_id, domain, verification_method (dns | email), verification_status (pending | verified | failed), enrollment_mode (manual | automatic_invitation | automatic_suggestion), created_at, verified_at
   - Validation: Block disposable email domains and common providers (gmail.com, outlook.com, etc.)

3. **Per-Tenant Connection Management**
   - Enable/disable specific authentication connections per organization
   - Support enabling SSO, social, and database connections at the org level
   - API methods:
     - `addConnection(tenantId, connectionId, options)` -> `TenantConnection`
     - `listConnections(tenantId)` -> `TenantConnectionListResponse`
     - `getConnection(tenantId, connectionId)` -> `TenantConnection`
     - `removeConnection(tenantId, connectionId)` -> `void`
     - `updateConnection(tenantId, connectionId, options)` -> `TenantConnection`
   - Models:
     - `TenantConnection`: id, tenant_id, connection_id, connection_type (sso | social | database), is_enabled, assign_membership_on_login, show_as_button, created_at
   - This replaces the monolithic SSO config approach with a more flexible connection-per-org model

4. **Organization-Level Branding (Enhanced)**
   - Current: logo_url, primary_color via Tenant model
   - Add: secondary_color, background_color, font_family, favicon_url, login_page_html, email_header_html, email_footer_html
   - API methods:
     - `updateBranding(tenantId, branding)` -> `TenantBranding`
     - `getBranding(tenantId)` -> `TenantBranding`
     - `resetBranding(tenantId)` -> `void`
   - Models:
     - `TenantBranding`: logo_url, logo_dark_url, favicon_url, primary_color, secondary_color, background_color, font_family, border_radius, custom_css, login_page_background_url

5. **Tenant Lifecycle Events**
   - Emit webhook events for all tenant lifecycle changes
   - Events: `tenant.created`, `tenant.updated`, `tenant.deleted`, `tenant.activated`, `tenant.suspended`, `tenant.domain.verified`, `tenant.connection.added`, `tenant.connection.removed`

#### Enhanced Features (Should Have)

6. **Self-Service Admin Portal Support**
   - API endpoints that enable tenant admins to manage their own organization
   - Scoped admin tokens with tenant-level permissions
   - API methods:
     - `generateAdminLink(tenantId, options)` -> `AdminPortalLink`
     - `getAdminPortalConfig(tenantId)` -> `AdminPortalConfig`
     - `updateAdminPortalConfig(tenantId, config)` -> `AdminPortalConfig`
   - Config options: allow_sso_setup, allow_domain_verification, allow_member_management, allow_branding_customization

7. **Tenant Usage Tracking**
   - Track active users, storage used, API calls, SSO logins per tenant
   - API methods:
     - `getUsage(tenantId, period)` -> `TenantUsage`
     - `getUsageHistory(tenantId, startDate, endDate)` -> `TenantUsageHistory`
   - Models:
     - `TenantUsage`: active_users, total_users, storage_used_gb, api_calls_count, sso_login_count, period_start, period_end

8. **Tenant Onboarding Workflow**
   - Support multi-step tenant provisioning with progress tracking
   - API methods:
     - `getOnboardingStatus(tenantId)` -> `OnboardingStatus`
     - `updateOnboardingStep(tenantId, step, status)` -> `OnboardingStatus`
     - `completeOnboarding(tenantId)` -> `Tenant`
   - Models:
     - `OnboardingStatus`: steps (list of OnboardingStep), current_step, is_complete, started_at, completed_at
     - `OnboardingStep`: name, status (pending | in_progress | completed | skipped), completed_at

#### Future Features (Nice to Have)

9. **Tenant Templates**
   - Pre-configured tenant templates for rapid provisioning
   - API methods: `createTemplate(request)`, `listTemplates()`, `createFromTemplate(templateId, request)`

10. **Tenant Migration**
    - Merge/split tenants, transfer users between tenants
    - API methods: `migrateTenant(sourceTenantId, targetTenantId, options)`

11. **Tenant Analytics Dashboard Data**
    - Aggregated analytics for cross-tenant comparisons
    - Growth metrics, churn analysis, feature adoption per plan

### API Surface

| Method | Description | Parameters | Returns |
|--------|------------|------------|---------|
| `list(params)` | List tenants with pagination/filtering | page, pageSize, status, plan, search, sort | `TenantListResponse` |
| `get(tenantId)` | Get tenant by ID | tenantId: string | `Tenant` |
| `create(request)` | Create a new tenant | CreateTenantRequest | `Tenant` |
| `update(tenantId, request)` | Update tenant | tenantId, UpdateTenantRequest | `Tenant` |
| `delete(tenantId)` | Soft-delete tenant | tenantId: string | `void` |
| `updateStatus(tenantId, status, reason?)` | Update tenant status | tenantId, TenantStatus, reason? | `Tenant` |
| `updateMetadata(tenantId, metadata)` | Update tenant metadata | tenantId, metadata object | `Tenant` |
| `addDomain(tenantId, domain)` | Add a domain to verify | tenantId, domain string | `TenantDomain` |
| `verifyDomain(tenantId, domainId, code)` | Verify domain ownership | tenantId, domainId, verification code | `TenantDomain` |
| `listDomains(tenantId)` | List tenant domains | tenantId | `TenantDomainListResponse` |
| `removeDomain(tenantId, domainId)` | Remove a verified domain | tenantId, domainId | `void` |
| `addConnection(tenantId, connectionId, opts)` | Enable a connection for org | tenantId, connectionId, options | `TenantConnection` |
| `listConnections(tenantId)` | List org connections | tenantId | `TenantConnectionListResponse` |
| `removeConnection(tenantId, connectionId)` | Disable a connection for org | tenantId, connectionId | `void` |
| `updateBranding(tenantId, branding)` | Update org branding | tenantId, TenantBranding | `TenantBranding` |
| `getBranding(tenantId)` | Get org branding | tenantId | `TenantBranding` |
| `resetBranding(tenantId)` | Reset branding to defaults | tenantId | `void` |
| `getUsage(tenantId, period)` | Get usage metrics | tenantId, period | `TenantUsage` |

### Models

- **Tenant** (existing, enhanced): Add `private_metadata`, `verified_domains` (array), `allowed_connections` (array)
- **TenantDomain**: id, tenant_id, domain, verification_method, verification_status, enrollment_mode, created_at, verified_at
- **TenantConnection**: id, tenant_id, connection_id, connection_type, is_enabled, assign_membership_on_login, show_as_button, created_at
- **TenantBranding**: logo_url, logo_dark_url, favicon_url, primary_color, secondary_color, background_color, font_family, border_radius, custom_css, login_page_background_url
- **TenantUsage**: active_users, total_users, storage_used_gb, api_calls_count, sso_login_count, period_start, period_end
- **OnboardingStatus**: steps, current_step, is_complete, started_at, completed_at

### Events (for webhooks)

| Event | Trigger |
|-------|---------|
| `tenant.created` | New tenant created |
| `tenant.updated` | Tenant properties updated |
| `tenant.deleted` | Tenant soft-deleted |
| `tenant.activated` | Tenant status changed to active |
| `tenant.suspended` | Tenant status changed to suspended |
| `tenant.deactivated` | Tenant status changed to inactive |
| `tenant.domain.added` | Domain added to tenant |
| `tenant.domain.verified` | Domain verification completed |
| `tenant.domain.removed` | Domain removed from tenant |
| `tenant.connection.added` | Authentication connection enabled |
| `tenant.connection.removed` | Authentication connection disabled |
| `tenant.branding.updated` | Branding customization changed |
| `tenant.plan.changed` | Subscription plan changed |
| `tenant.usage.limit_approaching` | Usage approaching plan limits (80%) |
| `tenant.usage.limit_exceeded` | Usage exceeded plan limits |

### Error Scenarios

| Scenario | HTTP Status | Python | TypeScript | Java |
|----------|-------------|--------|------------|------|
| Tenant not found | 404 | `TenantNotFoundError` | `TenantNotFoundError` | `TenantNotFoundException` |
| Slug already exists | 409 | `TenantSlugExistsError` | `TenantSlugExistsError` | `TenantSlugExistsException` |
| Domain already verified by another org | 409 | `DomainAlreadyClaimedError` | `DomainAlreadyClaimedError` | `DomainAlreadyClaimedException` |
| Domain verification failed | 422 | `DomainVerificationFailedError` | `DomainVerificationFailedError` | `DomainVerificationFailedException` |
| Disposable/common email domain | 422 | `InvalidDomainError` | `InvalidDomainError` | `InvalidDomainException` |
| Plan limit exceeded (max users, storage) | 403 | `PlanLimitExceededError` | `PlanLimitExceededError` | `PlanLimitExceededException` |
| Tenant suspended (action not allowed) | 403 | `TenantSuspendedError` | `TenantSuspendedError` | `TenantSuspendedException` |
| Connection not found | 404 | `ConnectionNotFoundError` | `ConnectionNotFoundError` | `ConnectionNotFoundException` |

### Cross-Language Notes

- **Python:** The `TenantDomain` model should use Pydantic with `verification_status` as an Enum. The `addDomain()` method should accept a plain string domain and return the full `TenantDomain` object.
- **TypeScript:** Use TypeScript interfaces for `TenantDomain`, `TenantConnection`, `TenantBranding`. Export all types from `types.ts`. Use camelCase for API method parameters but serialize to snake_case for API calls.
- **Java:** Use Builder pattern for `TenantDomain.builder().domain("acme.com").build()`. Use `Optional<TenantBranding>` for the branding getter since branding may not be configured. The `TenantDomainVerificationStatus` enum should be a proper Java enum.

---

## 2. SSO Module (Enhancement)

### Overview

The SSO module enables enterprise customers to authenticate using their corporate identity providers. The current implementation supports Azure AD, Okta, Google Workspace, generic SAML 2.0, and generic OIDC with JIT provisioning and attribute mapping. Enhancements are needed to support multiple SSO connections per tenant, self-service SSO configuration, connection testing/debugging, and IdP-initiated SSO flows.

**Value Proposition:** Reduce enterprise sales friction by enabling customer IT admins to self-configure SSO without vendor support intervention, matching the self-service capabilities of WorkOS and Auth0.

### Competitive Analysis

#### Auth0
- **Strengths:** Self-Service SSO with connection configuration tickets. Organizations can enable multiple connections. SAML and OIDC support with auto-discovery. IdP-initiated SSO. Connection-level MFA policies. Extensive IdP integration library.
- **Key Features We Lack:** Self-service SSO setup tickets, multiple connections per organization, IdP-initiated SSO, connection-level MFA policies.
- **Reference:** [Auth0 Self-Service SSO](https://auth0.com/docs/authenticate/enterprise-connections/self-service-SSO/manage-self-service-sso), [Auth0 Enable Organization Connections](https://auth0.com/docs/manage-users/organizations/configure-organizations/enable-connections)

#### Clerk
- **Strengths:** Organization-level SAML and OIDC SSO. Pre-built SSO setup UI components. Domain-based SSO routing. Integration with organization verified domains.
- **Key Features We Lack:** Organization-scoped SSO (vs tenant-scoped), domain-based SSO routing, UI component patterns for SSO setup.
- **Reference:** [Clerk Organization SSO](https://clerk.com/docs/guides/organizations/add-members/sso)

#### WorkOS
- **Strengths:** Unified SSO API supporting SAML and OIDC through a single OAuth 2.0 wrapper. Admin Portal for self-service SSO setup. Support for 30+ IdP integrations. Automatic metadata parsing. Connection health monitoring. SP metadata auto-generation.
- **Key Features We Lack:** Admin Portal for self-service config, automatic metadata parsing, connection health monitoring, unified OAuth2 wrapper.
- **Reference:** [WorkOS SSO Docs](https://workos.com/docs/sso), [WorkOS Single Sign-On](https://workos.com/single-sign-on)

#### Firebase Auth
- **Strengths:** Per-tenant sign-in provider configuration. Support for SAML and OIDC via Identity Platform.
- **Weaknesses:** No self-service SSO configuration. Limited to Google Cloud Identity Platform for advanced features.

#### Supabase Auth
- **Weaknesses:** No native SSO support. Requires third-party integration for enterprise SSO.

### Requirements

#### Core Features (Must Have)

1. **Multiple SSO Connections Per Tenant**
   - Current limitation: One SSO config per tenant (unique index on tenant_id)
   - Enhancement: Support multiple SSO connections per tenant, each with its own provider configuration
   - API methods:
     - `createSSOConnection(tenantId, request)` -> `SSOConnection`
     - `listSSOConnections(tenantId)` -> `SSOConnectionListResponse`
     - `getSSOConnection(tenantId, connectionId)` -> `SSOConnection`
     - `updateSSOConnection(tenantId, connectionId, request)` -> `SSOConnection`
     - `deleteSSOConnection(tenantId, connectionId)` -> `void`
   - Models:
     - `SSOConnection`: id, tenant_id, name, provider, status (draft | active | inactive | error), is_default, config (provider-specific), jit_provisioning, attribute_mappings, created_at, updated_at
   - Note: Deprecate the existing single `get_sso_config()` / `update_sso_config()` methods in favor of the new connection-based API. Maintain backward compatibility for at least 2 major versions.

2. **Self-Service SSO Setup**
   - Generate setup links/tickets that organization admins can use to configure SSO
   - Support guided setup wizards with IdP-specific instructions
   - API methods:
     - `generateSetupLink(tenantId, options)` -> `SSOSetupLink`
     - `getSetupStatus(tenantId, setupId)` -> `SSOSetupStatus`
     - `completeSetup(tenantId, setupId, config)` -> `SSOConnection`
   - Models:
     - `SSOSetupLink`: id, tenant_id, url, expires_at, provider_hint, status (pending | in_progress | completed | expired)
     - `SSOSetupStatus`: setup_id, status, current_step, steps_completed, provider_detected, errors
   - Options: provider filter, expiration time, allowed providers list, custom redirect URL

3. **Connection Testing and Diagnostics**
   - Enhanced connection testing with detailed diagnostics
   - API methods:
     - `testSSOConnection(tenantId, connectionId)` -> `SSOTestResult` (existing, enhanced)
     - `getSSOConnectionHealth(tenantId, connectionId)` -> `SSOConnectionHealth`
     - `getSSOConnectionLogs(tenantId, connectionId, params)` -> `SSOLogListResponse`
   - Models:
     - `SSOConnectionHealth`: status (healthy | degraded | error), last_successful_login, last_error, error_count_24h, avg_response_time_ms, certificate_expiry
     - `SSOTestResult` (enhanced): success, message, details, saml_response (if SAML), oidc_tokens (if OIDC), mapped_attributes, warnings

4. **IdP Metadata Auto-Discovery**
   - Automatically parse and configure from IdP metadata URL or uploaded XML
   - API methods:
     - `importMetadata(tenantId, metadataUrl)` -> `SSOConnection`
     - `importMetadataXml(tenantId, xml)` -> `SSOConnection`
   - Auto-detect: entity_id, sso_url, slo_url, certificate, name_id_format, signature_algorithm

5. **SP Metadata Generation**
   - Generate Service Provider metadata for the tenant's SSO connections
   - API methods:
     - `getSPMetadata(tenantId, connectionId, format?)` -> `SPMetadata`
   - Formats: XML (for SAML), JSON (for OIDC)
   - Include: entity_id, acs_url, slo_url, certificate, supported_bindings

#### Enhanced Features (Should Have)

6. **IdP-Initiated SSO**
   - Support SSO flows initiated from the identity provider side
   - Configuration per connection: allow_idp_initiated (boolean), default_redirect_url
   - Security: Enforce CSRF protection, response validation, replay attack prevention

7. **Domain-Based SSO Routing**
   - Automatically route users to the correct SSO connection based on email domain
   - API methods:
     - `addSSODomain(tenantId, connectionId, domain)` -> `SSODomainMapping`
     - `listSSODomains(tenantId)` -> `SSODomainMappingListResponse`
     - `removeSSODomain(tenantId, connectionId, domain)` -> `void`
     - `discoverSSO(email)` -> `SSODiscoveryResult`
   - Models:
     - `SSODomainMapping`: connection_id, domain, is_verified
     - `SSODiscoveryResult`: tenant_id, connection_id, provider, login_url

8. **Certificate Management**
   - Track IdP certificate expiration and auto-notify
   - Support certificate rotation without downtime
   - API methods:
     - `rotateCertificate(tenantId, connectionId, newCert)` -> `SSOConnection`
     - `getCertificateStatus(tenantId, connectionId)` -> `CertificateStatus`
   - Events: `sso.certificate.expiring_soon` (30 days), `sso.certificate.expired`

9. **SSO Login Policies**
   - Per-connection login policies: require_mfa, session_lifetime, allowed_ip_ranges
   - Enforce SSO-only login (disable password authentication for SSO-enabled orgs)
   - API methods:
     - `updateLoginPolicy(tenantId, connectionId, policy)` -> `SSOLoginPolicy`
     - `getLoginPolicy(tenantId, connectionId)` -> `SSOLoginPolicy`

#### Future Features (Nice to Have)

10. **SSO Analytics**
    - Login counts, failure rates, provider breakdown per tenant
    - API methods: `getSSOAnalytics(tenantId, period)` -> `SSOAnalytics`

11. **SAML Assertion Encryption**
    - Support encrypted SAML assertions for additional security

12. **Step-Up Authentication**
    - Require additional authentication factors for sensitive operations

### API Surface

| Method | Description | Parameters | Returns |
|--------|------------|------------|---------|
| `createSSOConnection(tenantId, request)` | Create SSO connection | tenantId, CreateSSOConnectionRequest | `SSOConnection` |
| `listSSOConnections(tenantId)` | List all SSO connections | tenantId | `SSOConnectionListResponse` |
| `getSSOConnection(tenantId, connId)` | Get SSO connection | tenantId, connectionId | `SSOConnection` |
| `updateSSOConnection(tenantId, connId, req)` | Update SSO connection | tenantId, connectionId, request | `SSOConnection` |
| `deleteSSOConnection(tenantId, connId)` | Delete SSO connection | tenantId, connectionId | `void` |
| `testSSOConnection(tenantId, connId)` | Test SSO connection | tenantId, connectionId | `SSOTestResult` |
| `getSSOConnectionHealth(tenantId, connId)` | Get connection health | tenantId, connectionId | `SSOConnectionHealth` |
| `generateSetupLink(tenantId, options)` | Generate self-service setup link | tenantId, SSOSetupOptions | `SSOSetupLink` |
| `getSetupStatus(tenantId, setupId)` | Get setup progress | tenantId, setupId | `SSOSetupStatus` |
| `importMetadata(tenantId, url)` | Import IdP metadata from URL | tenantId, metadataUrl | `SSOConnection` |
| `importMetadataXml(tenantId, xml)` | Import IdP metadata from XML | tenantId, xmlString | `SSOConnection` |
| `getSPMetadata(tenantId, connId, format?)` | Get SP metadata | tenantId, connectionId, format | `SPMetadata` |
| `discoverSSO(email)` | Discover SSO for email domain | email | `SSODiscoveryResult` |
| `addSSODomain(tenantId, connId, domain)` | Map domain to SSO connection | tenantId, connectionId, domain | `SSODomainMapping` |
| `rotateCertificate(tenantId, connId, cert)` | Rotate IdP certificate | tenantId, connectionId, cert | `SSOConnection` |

### Models

- **SSOConnection**: id, tenant_id, name, provider (SSOProvider enum), status (draft | active | inactive | error), is_default, config (union of provider-specific configs), jit_provisioning (JITProvisioningConfig), attribute_mappings (AttributeMappings), scim (SCIMConfig), domain_mappings (string[]), created_at, updated_at
- **SSOSetupLink**: id, tenant_id, url, token, expires_at, provider_hint, status, created_at
- **SSOSetupStatus**: setup_id, status, current_step, steps_completed, provider_detected, connection_id, errors
- **SSOConnectionHealth**: connection_id, status (healthy | degraded | error), last_successful_login, last_error, error_count_24h, avg_response_time_ms, certificate_expiry, uptime_percentage
- **SSODomainMapping**: id, connection_id, domain, is_verified, created_at
- **SSODiscoveryResult**: found (boolean), tenant_id, tenant_name, connection_id, provider, authorization_url
- **SPMetadata**: entity_id, acs_url, slo_url, certificate, metadata_xml, metadata_json
- **SSOLoginPolicy**: require_mfa, session_lifetime_hours, allowed_ip_ranges, force_sso_only, idle_timeout_minutes

### Events (for webhooks)

| Event | Trigger |
|-------|---------|
| `sso.connection.created` | New SSO connection configured |
| `sso.connection.activated` | SSO connection activated |
| `sso.connection.deactivated` | SSO connection deactivated |
| `sso.connection.deleted` | SSO connection removed |
| `sso.connection.error` | SSO connection entered error state |
| `sso.login.succeeded` | Successful SSO login |
| `sso.login.failed` | Failed SSO login attempt |
| `sso.setup.started` | Self-service setup initiated |
| `sso.setup.completed` | Self-service setup completed |
| `sso.certificate.expiring_soon` | Certificate expiring within 30 days |
| `sso.certificate.expired` | Certificate has expired |
| `sso.certificate.rotated` | Certificate successfully rotated |
| `sso.metadata.imported` | IdP metadata imported |

### Error Scenarios

| Scenario | HTTP Status | Python | TypeScript | Java |
|----------|-------------|--------|------------|------|
| SSO connection not found | 404 | `SSOConnectionNotFoundError` | `SSOConnectionNotFoundError` | `SSOConnectionNotFoundException` |
| SSO config not found (legacy) | 404 | `SSOConfigNotFoundError` | `SSOConfigNotFoundError` | `SSOConfigNotFoundException` |
| Invalid SAML metadata | 422 | `InvalidMetadataError` | `InvalidMetadataError` | `InvalidMetadataException` |
| Certificate expired | 422 | `CertificateExpiredError` | `CertificateExpiredError` | `CertificateExpiredException` |
| SSO provider unreachable | 502 | `ProviderUnreachableError` | `ProviderUnreachableError` | `ProviderUnreachableException` |
| Setup link expired | 410 | `SetupLinkExpiredError` | `SetupLinkExpiredError` | `SetupLinkExpiredException` |
| Domain already mapped to SSO | 409 | `DomainAlreadyMappedError` | `DomainAlreadyMappedError` | `DomainAlreadyMappedException` |
| Max connections per tenant reached | 403 | `MaxConnectionsExceededError` | `MaxConnectionsExceededError` | `MaxConnectionsExceededException` |

### Cross-Language Notes

- **Python:** The `SSOConnection` model should use a discriminated union for provider-specific config (e.g., using Pydantic's `Discriminator`). The legacy `get_sso_config()` / `update_sso_config()` should emit deprecation warnings using `warnings.warn()`.
- **TypeScript:** Use TypeScript discriminated unions for provider config types (`type: 'azure_ad' | 'okta' | ...`). Mark legacy methods with `@deprecated` JSDoc tag. The `SSOConnection` type should use conditional types for provider-specific config access.
- **Java:** Use sealed interfaces (Java 17+) for provider-specific config types. The `SSOConnectionBuilder` should validate that the provider-specific config matches the provider enum. Mark legacy methods with `@Deprecated(since = "2.0", forRemoval = true)`.

---

## 3. Teams Module (Enhancement)

### Overview

The Teams module provides collaborative group management within tenants. Teams represent functional work groups (engineering, marketing, project teams) with hierarchical structure, role-based membership, and configurable privacy. The current implementation supports CRUD, hierarchy, member management, and search. Enhancements are needed for team-level permissions, cross-team collaboration, team invitations, and richer team profiles.

**Value Proposition:** Enable B2B SaaS applications to model complex organizational structures with teams that have their own roles, permissions, and resources -- going beyond simple group membership to provide workspace-like isolation within an organization.

### Competitive Analysis

#### Auth0
- **Approach:** Auth0 does not have a dedicated "Teams" feature. Team-like functionality is achieved through Organizations (each org acts like a workspace) combined with Organization Roles. For sub-organization grouping, developers typically use metadata or external systems.
- **Takeaway:** Our teams module already exceeds Auth0's built-in capabilities for sub-organization grouping.

#### Clerk
- **Approach:** Clerk Organizations serve double duty as both tenant isolation and team management. There is no sub-team concept. Organizations have roles (admin, member, plus custom roles) and permissions. OrganizationProfile component manages members.
- **Key Features:** Custom roles per organization (up to 10), fine-grained permissions (org:feature:action pattern), membership request/approval flows.
- **Takeaway:** We should adopt Clerk's permission pattern (org:feature:action) for team-level permissions.

#### WorkOS
- **Approach:** WorkOS does not provide a dedicated teams API. Organization memberships with roles provide basic grouping. More complex team structures are left to the application layer.
- **Takeaway:** Our teams module is a differentiator vs WorkOS.

#### Firebase Auth
- **No built-in team management.** Custom claims can be used for simple group membership.

#### Supabase Auth
- **No built-in team management.** RLS policies can enforce team-level data isolation.

### Requirements

#### Core Features (Must Have)

1. **Team-Level Custom Roles**
   - Go beyond the fixed owner/admin/member roles
   - Support custom roles defined per team or per tenant with assignable permissions
   - API methods:
     - `createTeamRole(teamId, request)` -> `TeamRole`
     - `listTeamRoles(teamId)` -> `TeamRoleListResponse`
     - `updateTeamRole(teamId, roleId, request)` -> `TeamRole`
     - `deleteTeamRole(teamId, roleId)` -> `void`
     - `assignRole(teamId, userId, roleId)` -> `TeamMember`
   - Models:
     - `TeamRole`: id, team_id, name, slug, description, permissions (string[]), is_default, is_system, created_at
     - Default system roles: owner, admin, member (cannot be deleted, can be customized)
   - Permission format: `team:<resource>:<action>` (e.g., `team:settings:write`, `team:members:invite`, `team:content:delete`)

2. **Team Invitations**
   - Invite users to teams via email or user ID
   - Support invitation acceptance/rejection flow
   - API methods:
     - `inviteMember(teamId, request)` -> `TeamInvitation`
     - `listInvitations(teamId, params)` -> `TeamInvitationListResponse`
     - `getInvitation(teamId, invitationId)` -> `TeamInvitation`
     - `cancelInvitation(teamId, invitationId)` -> `void`
     - `acceptInvitation(teamId, invitationId)` -> `TeamMember`
     - `declineInvitation(teamId, invitationId)` -> `void`
     - `resendInvitation(teamId, invitationId)` -> `TeamInvitation`
   - Models:
     - `TeamInvitation`: id, team_id, inviter_id, email, user_id (if existing user), role, status (pending | accepted | declined | expired | canceled), expires_at, created_at, accepted_at
   - Validation: Check team member limits, prevent duplicate invitations, validate email format

3. **Membership Request/Approval**
   - Allow users to request membership in non-private teams
   - Admins/owners can approve or reject requests
   - API methods:
     - `requestMembership(teamId)` -> `MembershipRequest`
     - `listMembershipRequests(teamId, params)` -> `MembershipRequestListResponse`
     - `approveMembershipRequest(teamId, requestId, role?)` -> `TeamMember`
     - `rejectMembershipRequest(teamId, requestId, reason?)` -> `void`
   - Models:
     - `MembershipRequest`: id, team_id, user_id, message, status (pending | approved | rejected), decided_by, decided_at, created_at

4. **Team Permissions Checking**
   - Utility methods to check if a user has a specific permission in a team
   - API methods:
     - `checkPermission(teamId, userId, permission)` -> `PermissionCheckResult`
     - `listUserPermissions(teamId, userId)` -> `UserTeamPermissions`
     - `hasPermission(teamId, userId, permission)` -> `boolean`
   - Models:
     - `PermissionCheckResult`: allowed (boolean), permission, role, inherited_from
     - `UserTeamPermissions`: user_id, team_id, role, permissions (string[]), inherited_permissions (string[])

5. **Bulk Member Operations**
   - Add or remove multiple members at once
   - API methods:
     - `addMembers(teamId, requests)` -> `BulkMemberResult`
     - `removeMembers(teamId, userIds)` -> `BulkMemberResult`
   - Models:
     - `BulkMemberResult`: succeeded (count), failed (count), errors (array of {userId, error})

#### Enhanced Features (Should Have)

6. **Team Resource Associations**
   - Associate resources (projects, repositories, channels) with teams
   - API methods:
     - `addResource(teamId, resourceType, resourceId)` -> `TeamResource`
     - `listResources(teamId, resourceType?)` -> `TeamResourceListResponse`
     - `removeResource(teamId, resourceType, resourceId)` -> `void`
   - Models:
     - `TeamResource`: id, team_id, resource_type, resource_id, added_by, added_at

7. **Cross-Team Membership Queries**
   - Find all teams a user belongs to
   - Find common teams between users
   - API methods:
     - `listUserTeams(userId, params)` -> `TeamListResponse`
     - `getCommonTeams(userId1, userId2)` -> `TeamListResponse`

8. **Team Activity Feed**
   - Track membership changes, role updates, resource additions
   - API methods:
     - `getTeamActivity(teamId, params)` -> `TeamActivityListResponse`
   - Models:
     - `TeamActivity`: id, team_id, actor_id, action, target_type, target_id, details, created_at

9. **Team Settings and Preferences**
   - Per-team notification preferences, default role for new members, auto-approve membership requests
   - API methods:
     - `updateTeamSettings(teamId, settings)` -> `TeamSettings`
     - `getTeamSettings(teamId)` -> `TeamSettings`
   - Models:
     - `TeamSettings`: default_member_role, auto_approve_requests, notification_preferences, visibility (public | private | hidden), max_members

#### Future Features (Nice to Have)

10. **Team Templates**
    - Create teams from templates with pre-defined roles, settings, and resource associations
    - API methods: `createTeamFromTemplate(templateId, request)` -> `Team`

11. **Team Analytics**
    - Member engagement, growth metrics, activity patterns
    - API methods: `getTeamAnalytics(teamId, period)` -> `TeamAnalytics`

12. **Team Channels / Sub-Groups**
    - Lightweight channels within teams for topic-based grouping

### API Surface

| Method | Description | Parameters | Returns |
|--------|------------|------------|---------|
| `list(params)` | List teams | ListTeamsParams | `TeamListResponse` |
| `get(teamId, options?)` | Get team by ID | teamId, include options | `TeamWithDetails` |
| `create(request)` | Create team | CreateTeamRequest | `Team` |
| `update(teamId, request)` | Update team | teamId, UpdateTeamRequest | `Team` |
| `delete(teamId, force?)` | Delete team | teamId, force flag | `void` |
| `move(teamId, newParentId?)` | Move in hierarchy | teamId, newParentId | `Team` |
| `getTree(params?)` | Get hierarchy tree | GetTeamTreeParams | `TeamTree[]` |
| `listMembers(teamId, params?)` | List members | teamId, ListTeamMembersParams | `TeamMembersResponse` |
| `addMember(teamId, request)` | Add member | teamId, AddTeamMemberRequest | `TeamMember` |
| `addMembers(teamId, requests)` | Bulk add members | teamId, AddTeamMemberRequest[] | `BulkMemberResult` |
| `updateMember(teamId, userId, req)` | Update member role | teamId, userId, request | `TeamMember` |
| `removeMember(teamId, userId)` | Remove member | teamId, userId | `void` |
| `removeMembers(teamId, userIds)` | Bulk remove members | teamId, userId[] | `BulkMemberResult` |
| `inviteMember(teamId, request)` | Invite to team | teamId, InviteTeamMemberRequest | `TeamInvitation` |
| `listInvitations(teamId, params?)` | List pending invitations | teamId, params | `TeamInvitationListResponse` |
| `cancelInvitation(teamId, invId)` | Cancel invitation | teamId, invitationId | `void` |
| `acceptInvitation(teamId, invId)` | Accept invitation | teamId, invitationId | `TeamMember` |
| `declineInvitation(teamId, invId)` | Decline invitation | teamId, invitationId | `void` |
| `requestMembership(teamId)` | Request to join | teamId | `MembershipRequest` |
| `approveMembershipRequest(teamId, reqId)` | Approve request | teamId, requestId | `TeamMember` |
| `rejectMembershipRequest(teamId, reqId)` | Reject request | teamId, requestId | `void` |
| `createTeamRole(teamId, request)` | Create custom role | teamId, CreateTeamRoleRequest | `TeamRole` |
| `listTeamRoles(teamId)` | List team roles | teamId | `TeamRoleListResponse` |
| `checkPermission(teamId, userId, perm)` | Check permission | teamId, userId, permission | `PermissionCheckResult` |
| `listUserTeams(userId, params?)` | Get user's teams | userId, params | `TeamListResponse` |

### Models

- **Team** (existing, unchanged)
- **TeamMember** (existing, enhanced): Add `role_id` alongside the existing `role` enum for custom role support
- **TeamRole** (new): id, team_id, name, slug, description, permissions (string[]), is_default, is_system, created_at, updated_at
- **TeamInvitation** (new): id, team_id, inviter_id, email, user_id, role, role_id, status, token, expires_at, created_at, accepted_at
- **MembershipRequest** (new): id, team_id, user_id, message, status, decided_by, decided_at, rejection_reason, created_at
- **TeamResource** (new): id, team_id, resource_type, resource_id, added_by, added_at, metadata
- **TeamActivity** (new): id, team_id, actor_id, action, target_type, target_id, details, created_at
- **TeamSettings** (new): team_id, default_member_role, auto_approve_requests, visibility, max_members, notification_preferences
- **BulkMemberResult** (new): succeeded, failed, errors

### Events (for webhooks)

| Event | Trigger |
|-------|---------|
| `team.created` | New team created |
| `team.updated` | Team properties updated |
| `team.deleted` | Team deleted |
| `team.moved` | Team moved in hierarchy |
| `team.member.added` | Member added to team |
| `team.member.removed` | Member removed from team |
| `team.member.role_changed` | Member's role changed |
| `team.invitation.sent` | Invitation sent |
| `team.invitation.accepted` | Invitation accepted |
| `team.invitation.declined` | Invitation declined |
| `team.invitation.expired` | Invitation expired |
| `team.membership_request.created` | Membership request submitted |
| `team.membership_request.approved` | Membership request approved |
| `team.membership_request.rejected` | Membership request rejected |
| `team.role.created` | Custom role created |
| `team.role.updated` | Custom role updated |
| `team.role.deleted` | Custom role deleted |

### Error Scenarios

| Scenario | HTTP Status | Python | TypeScript | Java |
|----------|-------------|--------|------------|------|
| Team not found | 404 | `TeamNotFoundError` | `TeamNotFoundError` | `TeamNotFoundException` |
| Team slug exists | 409 | `TeamSlugExistsError` | `TeamSlugExistsError` | `TeamSlugExistsException` |
| Member already exists | 409 | `TeamMemberExistsError` | `TeamMemberExistsError` | `TeamMemberExistsException` |
| Member not found | 404 | `TeamMemberNotFoundError` | `TeamMemberNotFoundError` | `TeamMemberNotFoundException` |
| Circular reference in hierarchy | 409 | `TeamCircularReferenceError` | `TeamCircularReferenceError` | `TeamCircularReferenceException` |
| Invitation not found | 404 | `InvitationNotFoundError` | `InvitationNotFoundError` | `InvitationNotFoundException` |
| Invitation expired | 410 | `InvitationExpiredError` | `InvitationExpiredError` | `InvitationExpiredException` |
| Invitation already accepted | 409 | `InvitationAlreadyAcceptedError` | `InvitationAlreadyAcceptedError` | `InvitationAlreadyAcceptedException` |
| Membership request not found | 404 | `MembershipRequestNotFoundError` | `MembershipRequestNotFoundError` | `MembershipRequestNotFoundException` |
| Membership request already exists | 409 | `MembershipRequestExistsError` | `MembershipRequestExistsError` | `MembershipRequestExistsException` |
| Team is private (cannot request) | 403 | `TeamPrivateError` | `TeamPrivateError` | `TeamPrivateException` |
| Max members reached | 403 | `TeamMaxMembersError` | `TeamMaxMembersError` | `TeamMaxMembersException` |
| Cannot remove last owner | 422 | `LastOwnerError` | `LastOwnerError` | `LastOwnerException` |
| Role not found | 404 | `TeamRoleNotFoundError` | `TeamRoleNotFoundError` | `TeamRoleNotFoundException` |
| Cannot delete system role | 403 | `SystemRoleDeletionError` | `SystemRoleDeletionError` | `SystemRoleDeletionException` |

### Cross-Language Notes

- **Python:** The `TeamMemberRole` enum should be extended to allow custom string values while maintaining the built-in enum values. Use `@overload` decorators for `checkPermission` to support both sync and async patterns. Team permission strings should use Python string constants.
- **TypeScript:** Define permission strings as TypeScript template literal types: `team:${Resource}:${Action}`. Use union types for invitation status. The `BulkMemberResult` should use TypeScript generics for the error type.
- **Java:** Use a `TeamPermission` interface with factory methods for creating permission strings. The `TeamInvitation` should use the Builder pattern. `BulkMemberResult` should use `List<BulkOperationError>` for the errors field. Consider using sealed classes for invitation status.

---

## 4. Departments Module (Enhancement)

### Overview

The Departments module represents the formal organizational chart structure within a tenant -- HR-defined organizational units with hierarchical reporting relationships. Unlike teams (which are collaborative and often cross-functional), departments represent the official organizational structure used for HR, budgeting, and reporting purposes.

**Value Proposition:** Provide enterprise-grade organizational structure management that integrates with directory sync (SCIM), supports complex hierarchies, and enables department-based access control and reporting.

### Competitive Analysis

#### Auth0, Clerk, WorkOS
- **None of these competitors have a dedicated "Departments" feature.** Auth0 and Clerk focus on Organizations (tenants) and Organization Roles. WorkOS provides organization-level grouping but not sub-organizational departments. Department structure in these platforms is typically managed through user metadata or external HR systems synced via SCIM.
- **Takeaway:** Our departments module is a significant differentiator. The key enhancement needed is deeper SCIM integration so departments auto-sync from corporate directories.

#### Firebase Auth / Supabase Auth
- **No department management.** Custom claims or database structures required.

### Requirements

#### Core Features (Must Have)

1. **SCIM Group Synchronization**
   - Map SCIM groups to departments during directory sync
   - Auto-create, update, and deactivate departments based on IdP group changes
   - API methods:
     - `syncFromSCIM(tenantId, options)` -> `DepartmentSyncResult`
     - `getSCIMMapping(tenantId, departmentId)` -> `SCIMGroupMapping`
     - `updateSCIMMapping(tenantId, departmentId, mapping)` -> `SCIMGroupMapping`
     - `listSCIMMAappings(tenantId)` -> `SCIMGroupMappingListResponse`
   - Models:
     - `SCIMGroupMapping`: department_id, scim_group_id, scim_group_display_name, sync_direction (inbound | outbound | bidirectional), last_synced_at
     - `DepartmentSyncResult`: departments_created, departments_updated, departments_deactivated, users_moved, errors, sync_id

2. **Department-Based Access Control**
   - Use department membership for authorization decisions
   - Support department-scoped permissions and policies
   - API methods:
     - `setDepartmentPolicy(departmentId, policy)` -> `DepartmentPolicy`
     - `getDepartmentPolicy(departmentId)` -> `DepartmentPolicy`
     - `checkDepartmentAccess(userId, departmentId, resource)` -> `AccessCheckResult`
   - Models:
     - `DepartmentPolicy`: department_id, allowed_resources (string[]), restricted_resources (string[]), inherit_from_parent (boolean), custom_rules (object)

3. **Department Member Management (Enhanced)**
   - Currently: users assigned via `user.department_id` (single department)
   - Enhancement: Support users belonging to multiple departments with primary/secondary designation
   - API methods:
     - `addMember(departmentId, userId, options)` -> `DepartmentMember`
     - `removeMember(departmentId, userId)` -> `void`
     - `updateMember(departmentId, userId, options)` -> `DepartmentMember`
     - `listMembers(departmentId, params)` -> `DepartmentMembersResponse` (existing, enhanced)
     - `listUserDepartments(userId)` -> `UserDepartmentListResponse`
   - Models:
     - `DepartmentMember`: department_id, user_id, is_primary, role (head | manager | member | contractor), joined_at, metadata
   - Migration: The existing `user.department_id` field becomes the user's primary department. The new many-to-many relationship supports secondary departments.

4. **Department Budget and Cost Tracking**
   - Associate budget/cost center information with departments
   - Support budget hierarchies that roll up to parent departments
   - API methods:
     - `updateBudget(departmentId, budget)` -> `DepartmentBudget`
     - `getBudget(departmentId, includeChildren?)` -> `DepartmentBudget`
   - Models:
     - `DepartmentBudget`: department_id, cost_center (existing field), budget_amount, budget_currency, spent_amount, fiscal_year, fiscal_quarter

5. **Department Transfer / Reorganization**
   - Move users between departments with audit trail
   - Bulk transfer operations for reorganizations
   - API methods:
     - `transferUser(fromDeptId, toDeptId, userId, options)` -> `DepartmentTransfer`
     - `bulkTransfer(transfers)` -> `BulkTransferResult`
   - Models:
     - `DepartmentTransfer`: id, user_id, from_department_id, to_department_id, reason, effective_date, approved_by, created_at
     - `BulkTransferResult`: succeeded, failed, transfers (DepartmentTransfer[])

#### Enhanced Features (Should Have)

6. **Department Reporting Structure**
   - Define reporting relationships beyond the hierarchy
   - Support matrix organizations (dotted-line reporting)
   - API methods:
     - `setManager(departmentId, managerId, reportingType)` -> `DepartmentManager`
     - `getReportingChain(userId)` -> `ReportingChain`
     - `getDirectReports(managerId)` -> `UserListResponse`
   - Models:
     - `DepartmentManager`: department_id, user_id, reporting_type (direct | dotted_line), title
     - `ReportingChain`: user_id, chain (array of {user_id, department_id, reporting_type, level})

7. **Department Locations**
   - Associate departments with physical locations/offices
   - API methods:
     - `setLocation(departmentId, locationId)` -> `Department`
     - `listDepartmentsByLocation(locationId)` -> `DepartmentListResponse`
   - Location model: id, name, address, timezone, country, is_remote

8. **Department Lifecycle Management**
   - Support department creation, merger, split, and closure workflows
   - API methods:
     - `mergeDepartments(sourceDeptIds, targetDeptId, options)` -> `Department`
     - `splitDepartment(departmentId, splitConfig)` -> `Department[]`
     - `closeDepartment(departmentId, reassignTo)` -> `void`

#### Future Features (Nice to Have)

9. **Department Calendar / Scheduling Integration**
   - Department-wide calendar support, shared schedules

10. **Department OKR / Goals**
    - Department-level objectives and key results tracking

11. **Org Chart Visualization Data**
    - API to provide optimized data structure for rendering org charts
    - API methods: `getOrgChart(tenantId, options)` -> `OrgChartData`

### API Surface

| Method | Description | Parameters | Returns |
|--------|------------|------------|---------|
| `list(params)` | List departments | ListDepartmentsParams | `DepartmentListResponse` |
| `get(departmentId, options?)` | Get department | departmentId, include options | `DepartmentWithDetails` |
| `create(request)` | Create department | CreateDepartmentRequest | `Department` |
| `update(departmentId, request)` | Update department | departmentId, UpdateDepartmentRequest | `Department` |
| `delete(departmentId, force?)` | Delete department | departmentId, force flag | `void` |
| `move(departmentId, newParentId?)` | Move in hierarchy | departmentId, newParentId | `Department` |
| `getTree(params?)` | Get hierarchy tree | root_id, max_depth, include_members | `DepartmentTree[]` |
| `addMember(deptId, userId, opts)` | Add user to department | departmentId, userId, options | `DepartmentMember` |
| `removeMember(deptId, userId)` | Remove user from department | departmentId, userId | `void` |
| `updateMember(deptId, userId, opts)` | Update membership | departmentId, userId, options | `DepartmentMember` |
| `listMembers(deptId, params)` | List department members | departmentId, params | `DepartmentMembersResponse` |
| `listUserDepartments(userId)` | Get user's departments | userId | `UserDepartmentListResponse` |
| `transferUser(from, to, userId, opts)` | Transfer user | fromDeptId, toDeptId, userId, opts | `DepartmentTransfer` |
| `bulkTransfer(transfers)` | Bulk transfer users | DepartmentTransfer[] | `BulkTransferResult` |
| `syncFromSCIM(tenantId, options)` | Sync from directory | tenantId, sync options | `DepartmentSyncResult` |
| `getSCIMMapping(tenantId, deptId)` | Get SCIM group mapping | tenantId, departmentId | `SCIMGroupMapping` |
| `setDepartmentPolicy(deptId, policy)` | Set access policy | departmentId, policy | `DepartmentPolicy` |
| `getDepartmentPolicy(deptId)` | Get access policy | departmentId | `DepartmentPolicy` |
| `updateBudget(deptId, budget)` | Update budget info | departmentId, budget | `DepartmentBudget` |
| `getBudget(deptId, includeChildren?)` | Get budget info | departmentId, include children flag | `DepartmentBudget` |
| `getReportingChain(userId)` | Get management chain | userId | `ReportingChain` |
| `getDirectReports(managerId)` | Get direct reports | managerId | `UserListResponse` |

### Models

- **Department** (existing, unchanged)
- **DepartmentMember** (new): department_id, user_id, is_primary, role (head | manager | member | contractor), joined_at, metadata
- **DepartmentTransfer** (new): id, user_id, from_department_id, to_department_id, reason, effective_date, approved_by, status, created_at
- **SCIMGroupMapping** (new): department_id, scim_group_id, scim_group_display_name, sync_direction, last_synced_at, auto_sync
- **DepartmentSyncResult** (new): sync_id, departments_created, departments_updated, departments_deactivated, users_moved, errors, started_at, completed_at
- **DepartmentPolicy** (new): department_id, allowed_resources, restricted_resources, inherit_from_parent, custom_rules
- **DepartmentBudget** (new): department_id, cost_center, budget_amount, budget_currency, spent_amount, fiscal_year, fiscal_quarter
- **DepartmentManager** (new): department_id, user_id, reporting_type, title
- **ReportingChain** (new): user_id, chain (array of reporting relationships)
- **BulkTransferResult** (new): succeeded, failed, transfers

### Events (for webhooks)

| Event | Trigger |
|-------|---------|
| `department.created` | New department created |
| `department.updated` | Department properties updated |
| `department.deleted` | Department deleted/closed |
| `department.moved` | Department moved in hierarchy |
| `department.merged` | Departments merged |
| `department.member.added` | User added to department |
| `department.member.removed` | User removed from department |
| `department.member.transferred` | User transferred between departments |
| `department.head.changed` | Department head changed |
| `department.sync.completed` | SCIM sync completed |
| `department.sync.failed` | SCIM sync failed |
| `department.budget.updated` | Budget information changed |

### Error Scenarios

| Scenario | HTTP Status | Python | TypeScript | Java |
|----------|-------------|--------|------------|------|
| Department not found | 404 | `DepartmentNotFoundError` | `DepartmentNotFoundError` | `DepartmentNotFoundException` |
| Department code exists | 409 | `DepartmentCodeExistsError` | `DepartmentCodeExistsError` | `DepartmentCodeExistsException` |
| Circular hierarchy | 409 | `DepartmentCircularReferenceError` | `DepartmentCircularReferenceError` | `DepartmentCircularReferenceException` |
| User already in department | 409 | `DepartmentMemberExistsError` | `DepartmentMemberExistsError` | `DepartmentMemberExistsException` |
| Cannot delete with members | 409 | `DepartmentHasMembersError` | `DepartmentHasMembersError` | `DepartmentHasMembersException` |
| SCIM sync conflict | 409 | `SCIMSyncConflictError` | `SCIMSyncConflictError` | `SCIMSyncConflictException` |
| SCIM mapping not found | 404 | `SCIMGroupMappingNotFoundError` | `SCIMGroupMappingNotFoundError` | `SCIMGroupMappingNotFoundException` |
| Budget exceeds parent allocation | 422 | `BudgetExceedsAllocationError` | `BudgetExceedsAllocationError` | `BudgetExceedsAllocationException` |
| Transfer requires approval | 403 | `TransferApprovalRequiredError` | `TransferApprovalRequiredError` | `TransferApprovalRequiredException` |

### Cross-Language Notes

- **Python:** The `DepartmentMember.role` should be a string enum allowing extensibility. The `syncFromSCIM` method should return an async generator for progress tracking in long-running syncs. Use `Literal` types for reporting_type.
- **TypeScript:** Export a `DepartmentMemberRole` type union. The `bulkTransfer` method should accept a typed array with compile-time validation. Use discriminated unions for sync result statuses.
- **Java:** Use `@JsonCreator` for DepartmentMember deserialization with role validation. The `BulkTransferResult` should implement `Iterable<DepartmentTransfer>`. Budget amounts should use `BigDecimal` for precision.

---

## 5. SCIM Endpoints Module (New)

### Overview

The SCIM (System for Cross-domain Identity Management) Endpoints module implements the server-side SCIM 2.0 protocol (RFC 7643/7644) that allows enterprise identity providers (Okta, Microsoft Entra ID, Google Workspace, OneLogin, JumpCloud) to automatically provision and deprovision users and groups in the platform. The SCIM configuration already exists in the SSO model; this module provides the actual SCIM server endpoints and the SDK methods to manage SCIM provisioning.

**Priority:** P4 (config exists, endpoints pending)

**Value Proposition:** SCIM provisioning is a hard requirement for enterprise sales. It eliminates manual user management by IT administrators, ensures consistent user lifecycle management (onboarding/offboarding), and reduces security risks from orphaned accounts. SCIM support is table-stakes for competing with Auth0, WorkOS, and Okta.

### Competitive Analysis

#### Auth0
- **Strengths:** Inbound SCIM provisioning for enterprise connections. Each enterprise connection gets dedicated `/users` and `/groups` endpoints with dedicated credentials. Group Provisioning with SCIM for real-time group-based access control (GA 2025). Self-service SCIM configuration alongside SSO. Directory Provisioning for Google Workspace.
- **Limitations:** SCIM bulk operations are not fully supported (community discussion indicates limitations).
- **Reference:** [Auth0 SCIM](https://auth0.com/docs/authenticate/protocols/scim), [Auth0 B2B SCIM Enhancements](https://auth0.com/blog/identity-that-helps-you-sell-introducing-auth0-for-b2b-enhancements/)

#### WorkOS (Directory Sync)
- **Strengths:** Abstracted Directory Sync API that handles SCIM complexity behind a clean interface. Events API for real-time, ordered provisioning updates. Webhook delivery with retry. Support for 12+ directory providers. Automatic conflict resolution. Group-to-organization mapping.
- **Key Differentiator:** WorkOS does not expose raw SCIM endpoints to SDK consumers -- instead, it provides a higher-level "Directory Sync" API. Directory updates are delivered via webhooks or the Events API.
- **Reference:** [WorkOS Directory Sync](https://workos.com/docs/directory-sync), [WorkOS SCIM Guide](https://workos.com/guide/the-developers-guide-to-scim)

#### Clerk
- **Approach:** Clerk does not expose SCIM endpoints directly. Enterprise SSO with automatic user provisioning handles the common use case. For full SCIM, Clerk integrates with external providers.

#### Firebase Auth / Supabase Auth
- **No SCIM support.** Manual provisioning or custom integrations required.

### Requirements

#### Core Features (Must Have)

1. **SCIM 2.0 Server Endpoints**
   - Implement the full SCIM 2.0 protocol per RFC 7644
   - Endpoints scoped per tenant: `/scim/v2/{tenant_id}/...`
   - **User Endpoints:**
     - `GET /scim/v2/{tenant_id}/Users` - List/search users with filtering
     - `GET /scim/v2/{tenant_id}/Users/{id}` - Get user by SCIM ID
     - `POST /scim/v2/{tenant_id}/Users` - Create user (provision)
     - `PUT /scim/v2/{tenant_id}/Users/{id}` - Replace user
     - `PATCH /scim/v2/{tenant_id}/Users/{id}` - Update user attributes
     - `DELETE /scim/v2/{tenant_id}/Users/{id}` - Deactivate/delete user (deprovision)
   - **Group Endpoints:**
     - `GET /scim/v2/{tenant_id}/Groups` - List/search groups
     - `GET /scim/v2/{tenant_id}/Groups/{id}` - Get group by SCIM ID
     - `POST /scim/v2/{tenant_id}/Groups` - Create group
     - `PUT /scim/v2/{tenant_id}/Groups/{id}` - Replace group
     - `PATCH /scim/v2/{tenant_id}/Groups/{id}` - Update group (add/remove members)
     - `DELETE /scim/v2/{tenant_id}/Groups/{id}` - Delete group
   - **Discovery Endpoints:**
     - `GET /scim/v2/{tenant_id}/ServiceProviderConfig` - Service provider capabilities
     - `GET /scim/v2/{tenant_id}/Schemas` - Supported schemas
     - `GET /scim/v2/{tenant_id}/ResourceTypes` - Supported resource types

2. **SCIM Token Management (SDK Methods)**
   - Manage SCIM bearer tokens for authenticating IdP requests
   - API methods:
     - `createSCIMToken(tenantId, request)` -> `SCIMToken`
     - `listSCIMTokens(tenantId)` -> `SCIMTokenListResponse`
     - `revokeSCIMToken(tenantId, tokenId)` -> `void`
     - `rotateSCIMToken(tenantId, tokenId)` -> `SCIMToken`
   - Models:
     - `SCIMToken`: id, tenant_id, token (only returned on creation), name, last_used_at, expires_at, created_at, created_by
   - Security: Tokens must be hashed at rest. Only display the full token on creation.

3. **SCIM User Attribute Mapping**
   - Map SCIM Core User schema and Enterprise User extension to platform user fields
   - API methods:
     - `getSCIMAttributeMapping(tenantId)` -> `SCIMAttributeMapping`
     - `updateSCIMAttributeMapping(tenantId, mapping)` -> `SCIMAttributeMapping`
     - `resetSCIMAttributeMapping(tenantId)` -> `SCIMAttributeMapping`
   - Models:
     - `SCIMAttributeMapping`: user_mappings (dict of scim_attr -> platform_field), group_mappings (dict), custom_mappings (dict)
   - Default mappings:
     - `userName` -> `email`
     - `name.givenName` -> `first_name`
     - `name.familyName` -> `last_name`
     - `displayName` -> `display_name`
     - `active` -> `is_active`
     - `emails[primary].value` -> `email`
     - `phoneNumbers[primary].value` -> `phone`
     - `photos[primary].value` -> `avatar_url`
     - `urn:ietf:params:scim:schemas:extension:enterprise:2.0:User:department` -> `department_name`
     - `urn:ietf:params:scim:schemas:extension:enterprise:2.0:User:manager` -> `manager_id`

4. **SCIM Group to Entity Mapping**
   - Map SCIM Groups to platform Teams and/or Departments
   - API methods:
     - `getSCIMGroupMapping(tenantId)` -> `SCIMGroupMappingConfig`
     - `updateSCIMGroupMapping(tenantId, config)` -> `SCIMGroupMappingConfig`
   - Models:
     - `SCIMGroupMappingConfig`: map_to (teams | departments | both), auto_create (boolean), default_team_role (member | admin), naming_prefix, sync_membership (boolean)

5. **SCIM Event/Webhook Delivery**
   - Emit events when SCIM operations occur for application-level processing
   - Events: `scim.user.created`, `scim.user.updated`, `scim.user.deactivated`, `scim.user.reactivated`, `scim.user.deleted`, `scim.group.created`, `scim.group.updated`, `scim.group.deleted`, `scim.group.member.added`, `scim.group.member.removed`

6. **SCIM Provisioning Status**
   - Track provisioning state for each tenant
   - API methods:
     - `getSCIMStatus(tenantId)` -> `SCIMProvisioningStatus`
     - `getSCIMSyncLog(tenantId, params)` -> `SCIMSyncLogListResponse`
   - Models:
     - `SCIMProvisioningStatus`: tenant_id, is_enabled, is_connected, last_sync_at, total_users_provisioned, total_groups_provisioned, error_count, health_status (healthy | degraded | disconnected)
     - `SCIMSyncLog`: id, tenant_id, operation (create | update | delete | patch), resource_type (user | group), resource_id, scim_id, status (success | failure), error_message, request_body, response_code, timestamp

#### Enhanced Features (Should Have)

7. **SCIM Filtering Support**
   - Full RFC 7644 filter syntax: `eq`, `ne`, `co`, `sw`, `ew`, `pr`, `gt`, `ge`, `lt`, `le`, `and`, `or`, `not`
   - Support complex filters: `filter=userName eq "john@acme.com" and active eq true`
   - Pagination via `startIndex` and `count` parameters

8. **SCIM Bulk Operations**
   - `POST /scim/v2/{tenant_id}/Bulk` - Process multiple operations in a single request
   - Support `failOnErrors` parameter to control error handling
   - Support `maxOperations` and `maxPayloadSize` configuration per tenant
   - Models:
     - `BulkRequest`: schemas, Operations (array of {method, bulkId, path, data})
     - `BulkResponse`: schemas, Operations (array of {method, bulkId, status, location, response})

9. **SCIM Schema Extensions**
   - Support custom schema extensions beyond Core User and Enterprise User
   - API methods:
     - `createSCIMSchemaExtension(tenantId, schema)` -> `SCIMSchemaExtension`
     - `listSCIMSchemaExtensions(tenantId)` -> `SCIMSchemaExtensionListResponse`
   - Models:
     - `SCIMSchemaExtension`: id, name, schema_uri, attributes (array of attribute definitions)

10. **Dry-Run / Preview Mode**
    - Preview what SCIM operations would do without actually applying changes
    - API methods:
      - `previewSCIMSync(tenantId)` -> `SCIMSyncPreview`
    - Models:
      - `SCIMSyncPreview`: users_to_create, users_to_update, users_to_deactivate, groups_to_create, groups_to_update, groups_to_delete, warnings

#### Future Features (Nice to Have)

11. **Outbound SCIM Provisioning**
    - Push user changes from the platform to external SCIM servers
    - Use case: Provisioning users into connected SaaS applications

12. **SCIM Compliance Testing**
    - Built-in test suite that validates SCIM endpoint compliance
    - API methods: `runComplianceTest(tenantId)` -> `ComplianceTestResult`

13. **SCIM Rate Limiting**
    - Per-tenant rate limiting for SCIM endpoints to prevent abuse
    - Configurable limits: max_requests_per_minute, max_bulk_operations

### API Surface (SDK Management Methods)

| Method | Description | Parameters | Returns |
|--------|------------|------------|---------|
| `enableSCIM(tenantId, config)` | Enable SCIM for tenant | tenantId, SCIMConfig | `SCIMProvisioningStatus` |
| `disableSCIM(tenantId)` | Disable SCIM for tenant | tenantId | `void` |
| `getSCIMStatus(tenantId)` | Get provisioning status | tenantId | `SCIMProvisioningStatus` |
| `createSCIMToken(tenantId, request)` | Create bearer token | tenantId, name, expiresIn | `SCIMToken` |
| `listSCIMTokens(tenantId)` | List tokens | tenantId | `SCIMTokenListResponse` |
| `revokeSCIMToken(tenantId, tokenId)` | Revoke token | tenantId, tokenId | `void` |
| `rotateSCIMToken(tenantId, tokenId)` | Rotate token | tenantId, tokenId | `SCIMToken` |
| `getSCIMAttributeMapping(tenantId)` | Get attribute mapping | tenantId | `SCIMAttributeMapping` |
| `updateSCIMAttributeMapping(tenantId, m)` | Update attribute mapping | tenantId, mapping | `SCIMAttributeMapping` |
| `getSCIMGroupMapping(tenantId)` | Get group mapping config | tenantId | `SCIMGroupMappingConfig` |
| `updateSCIMGroupMapping(tenantId, c)` | Update group mapping config | tenantId, config | `SCIMGroupMappingConfig` |
| `getSCIMSyncLog(tenantId, params)` | Get sync event log | tenantId, pagination params | `SCIMSyncLogListResponse` |
| `getSCIMEndpointInfo(tenantId)` | Get SCIM endpoint URL/info | tenantId | `SCIMEndpointInfo` |
| `previewSCIMSync(tenantId)` | Preview sync changes | tenantId | `SCIMSyncPreview` |

### SCIM Server Endpoints (Protocol-Level)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/scim/v2/{tenant_id}/Users` | GET | List/search users (supports filter, startIndex, count) |
| `/scim/v2/{tenant_id}/Users` | POST | Create (provision) a user |
| `/scim/v2/{tenant_id}/Users/{id}` | GET | Get user by SCIM ID |
| `/scim/v2/{tenant_id}/Users/{id}` | PUT | Replace user (full update) |
| `/scim/v2/{tenant_id}/Users/{id}` | PATCH | Partial update user attributes |
| `/scim/v2/{tenant_id}/Users/{id}` | DELETE | Deactivate or delete user |
| `/scim/v2/{tenant_id}/Groups` | GET | List/search groups |
| `/scim/v2/{tenant_id}/Groups` | POST | Create a group |
| `/scim/v2/{tenant_id}/Groups/{id}` | GET | Get group by SCIM ID |
| `/scim/v2/{tenant_id}/Groups/{id}` | PUT | Replace group |
| `/scim/v2/{tenant_id}/Groups/{id}` | PATCH | Update group (add/remove members) |
| `/scim/v2/{tenant_id}/Groups/{id}` | DELETE | Delete group |
| `/scim/v2/{tenant_id}/Bulk` | POST | Bulk operations |
| `/scim/v2/{tenant_id}/ServiceProviderConfig` | GET | Service provider configuration |
| `/scim/v2/{tenant_id}/Schemas` | GET | Supported schemas |
| `/scim/v2/{tenant_id}/ResourceTypes` | GET | Supported resource types |

### Models

- **SCIMToken**: id, tenant_id, name, token (returned once), token_hash, last_used_at, expires_at, created_at, created_by, is_active
- **SCIMProvisioningStatus**: tenant_id, is_enabled, is_connected, last_sync_at, total_users_provisioned, total_groups_provisioned, pending_operations, error_count, health_status, endpoint_url
- **SCIMAttributeMapping**: tenant_id, user_mappings, group_mappings, custom_schema_mappings, created_at, updated_at
- **SCIMGroupMappingConfig**: tenant_id, map_to, auto_create, default_team_role, naming_prefix, sync_membership, exclusion_patterns
- **SCIMSyncLog**: id, tenant_id, operation, resource_type, resource_id, scim_id, status, error_message, request_ip, timestamp
- **SCIMEndpointInfo**: tenant_id, base_url, users_endpoint, groups_endpoint, schemas_endpoint, supported_features
- **SCIMUser** (SCIM protocol schema): schemas, id, externalId, userName, name (givenName, familyName), displayName, emails, phoneNumbers, photos, active, groups, urn:ietf:params:scim:schemas:extension:enterprise:2.0:User (department, manager, etc.), meta (resourceType, created, lastModified, location)
- **SCIMGroup** (SCIM protocol schema): schemas, id, externalId, displayName, members (array of {value, display, $ref}), meta
- **SCIMListResponse** (SCIM protocol): schemas, totalResults, startIndex, itemsPerPage, Resources
- **SCIMError** (SCIM protocol): schemas, status, scimType, detail

### Events (for webhooks)

| Event | Trigger |
|-------|---------|
| `scim.enabled` | SCIM provisioning enabled for tenant |
| `scim.disabled` | SCIM provisioning disabled for tenant |
| `scim.token.created` | New SCIM token created |
| `scim.token.revoked` | SCIM token revoked |
| `scim.user.provisioned` | New user provisioned via SCIM |
| `scim.user.updated` | User attributes updated via SCIM |
| `scim.user.deprovisioned` | User deactivated via SCIM |
| `scim.user.reactivated` | Previously deactivated user reactivated |
| `scim.user.deleted` | User permanently deleted via SCIM |
| `scim.group.created` | Group created via SCIM |
| `scim.group.updated` | Group updated via SCIM |
| `scim.group.deleted` | Group deleted via SCIM |
| `scim.group.member.added` | User added to group via SCIM |
| `scim.group.member.removed` | User removed from group via SCIM |
| `scim.sync.completed` | Full sync cycle completed |
| `scim.sync.failed` | Sync cycle failed |
| `scim.error` | SCIM processing error |

### Error Scenarios

| Scenario | HTTP Status | Python | TypeScript | Java |
|----------|-------------|--------|------------|------|
| SCIM not enabled for tenant | 404 | `SCIMNotEnabledError` | `SCIMNotEnabledError` | `SCIMNotEnabledException` |
| Invalid SCIM token | 401 | `SCIMAuthenticationError` | `SCIMAuthenticationError` | `SCIMAuthenticationException` |
| SCIM token expired | 401 | `SCIMTokenExpiredError` | `SCIMTokenExpiredError` | `SCIMTokenExpiredException` |
| SCIM user not found | 404 | `SCIMUserNotFoundError` | `SCIMUserNotFoundError` | `SCIMUserNotFoundException` |
| SCIM group not found | 404 | `SCIMGroupNotFoundError` | `SCIMGroupNotFoundError` | `SCIMGroupNotFoundException` |
| SCIM user already exists | 409 | `SCIMUserExistsError` | `SCIMUserExistsError` | `SCIMUserExistsException` |
| Invalid SCIM filter syntax | 400 | `SCIMFilterError` | `SCIMFilterError` | `SCIMFilterException` |
| Bulk operation limit exceeded | 413 | `SCIMBulkLimitError` | `SCIMBulkLimitError` | `SCIMBulkLimitException` |
| Attribute mapping conflict | 422 | `SCIMAttributeMappingError` | `SCIMAttributeMappingError` | `SCIMAttributeMappingException` |
| SCIM rate limit exceeded | 429 | `SCIMRateLimitError` | `SCIMRateLimitError` | `SCIMRateLimitException` |

### Cross-Language Notes

- **Python:** The SCIM server endpoints are not part of the SDK (they are server-side API endpoints). The SDK provides management methods for configuring SCIM. Use `httpx` for the client methods. The `SCIMAttributeMapping` should support dot-notation paths (e.g., `name.givenName`). Use `SecretStr` from Pydantic for token values.
- **TypeScript:** Create a `SCIMClient` class separate from `TenantClient` for clean separation of concerns. The `SCIMToken.token` field should be typed as `string | undefined` since it is only present on creation. Use branded types for SCIM IDs vs platform IDs.
- **Java:** Use `@JsonProperty` annotations for SCIM schema URN mapping (e.g., `urn:ietf:params:scim:schemas:extension:enterprise:2.0:User`). The `SCIMToken` should use `char[]` for the token value (cleared after use). Implement `SCIMFilterParser` as a separate utility class.

---

## 6. Organization Switcher Module (New)

### Overview

The Organization Switcher module enables users to belong to and switch between multiple organizations (tenants). In many B2B SaaS applications, a single user may be an employee at Company A, a contractor at Company B, and a community member at Organization C. This module provides the API surface for managing multi-organization memberships, switching the active organization context, and maintaining per-organization session state.

**Priority:** P3

**Value Proposition:** Multi-org membership is a core requirement for B2B SaaS platforms. Without it, users need separate accounts per organization, leading to poor UX and credential fatigue. Clerk's OrganizationSwitcher component is one of their most popular features, and Auth0 Organizations natively support multi-org users. This is a competitive necessity.

### Competitive Analysis

#### Auth0 Organizations
- **Strengths:** Users can be members of multiple organizations. Each organization membership carries its own set of roles. The authentication flow includes organization context (organization ID in token). The login prompt can display organization-specific branding. Organization context is included in ID tokens and access tokens via custom claims.
- **Reference:** [Auth0 Organizations](https://auth0.com/docs/manage-users/organizations/configure-organizations/retrieve-organizations)

#### Clerk Organizations
- **Strengths:** Pre-built `<OrganizationSwitcher />` component that handles the entire switching UX. `useOrganizationList()` hook returns all memberships for the current user. `setActive()` method switches the active organization context. Support for personal accounts alongside organization accounts. Paginated organization lists for users with many memberships. Organization context (active org, role, permissions) available in every session. Notification badges for pending invitations.
- **Reference:** [Clerk Organization Switcher](https://clerk.com/docs/reference/components/organization/organization-switcher), [Clerk Custom Organization Switcher](https://clerk.com/docs/organizations/custom-organization-switcher)

#### WorkOS
- **Strengths:** Organization memberships with statuses (pending, active, inactive). Each membership has a role. Users can belong to multiple organizations. Authentication returns organization membership context. Organization membership lifecycle management.
- **Reference:** [WorkOS Users and Organizations](https://workos.com/docs/authkit/users-organizations)

#### Firebase Auth
- **Approach:** Multi-tenancy via `auth.tenantId` on the client. Switching tenants requires re-authentication or token management at the application layer. No built-in org switching UI or membership management.

#### Supabase Auth
- **No built-in organization switching.** App metadata can store organization context, but switching logic must be custom-built.

### Requirements

#### Core Features (Must Have)

1. **Organization Membership Management**
   - Track which organizations a user belongs to with per-org roles
   - API methods:
     - `createMembership(request)` -> `OrganizationMembership`
     - `getMembership(membershipId)` -> `OrganizationMembership`
     - `listUserMemberships(userId, params?)` -> `OrganizationMembershipListResponse`
     - `listOrganizationMembers(tenantId, params?)` -> `OrganizationMembershipListResponse`
     - `updateMembership(membershipId, request)` -> `OrganizationMembership`
     - `deactivateMembership(membershipId)` -> `OrganizationMembership`
     - `reactivateMembership(membershipId)` -> `OrganizationMembership`
     - `deleteMembership(membershipId)` -> `void`
   - Models:
     - `OrganizationMembership`: id, user_id, tenant_id, role, role_id, status (pending | active | inactive), permissions (string[]), is_default, joined_at, invited_by, deactivated_at, metadata
   - Constraints: A user can have exactly one active membership per organization. A membership can have exactly one role.

2. **Active Organization Context**
   - Set and retrieve the user's currently active organization
   - API methods:
     - `setActiveOrganization(userId, tenantId)` -> `ActiveOrganizationContext`
     - `getActiveOrganization(userId)` -> `ActiveOrganizationContext`
     - `clearActiveOrganization(userId)` -> `void`
   - Models:
     - `ActiveOrganizationContext`: user_id, tenant_id, tenant_name, tenant_slug, tenant_logo_url, membership_id, role, permissions, personal_account (boolean)
   - Behavior: Switching the active org should update the session/token context. The active org persists across page reloads (session-level).
   - Token integration: Active organization ID and role should be includable in JWT claims.

3. **Personal Account Support**
   - Users can operate in a "personal account" context (no organization)
   - API methods:
     - `switchToPersonalAccount(userId)` -> `ActiveOrganizationContext`
   - Behavior: When in personal account mode, `tenant_id` is null and `personal_account` is true.
   - Not all applications need personal accounts -- this should be configurable per platform instance.

4. **Organization Discovery**
   - Help users find organizations they can join
   - API methods:
     - `listJoinableOrganizations(userId, params?)` -> `JoinableOrganizationListResponse`
     - `searchOrganizations(query, params?)` -> `OrganizationSearchResult`
   - Models:
     - `JoinableOrganization`: tenant_id, name, slug, logo_url, member_count, join_method (invitation | request | auto_join | domain_match), domain_match (boolean)
   - Discovery logic: Match user email domain against verified tenant domains. Show organizations with pending invitations. Show organizations that allow membership requests.

5. **Invitation-Based Joining**
   - Users receive invitations to join organizations
   - API methods:
     - `listPendingInvitations(userId)` -> `OrganizationInvitationListResponse`
     - `acceptInvitation(invitationId)` -> `OrganizationMembership`
     - `declineInvitation(invitationId)` -> `void`
     - `inviteToOrganization(tenantId, request)` -> `OrganizationInvitation`
     - `listOrganizationInvitations(tenantId, params?)` -> `OrganizationInvitationListResponse`
     - `cancelInvitation(tenantId, invitationId)` -> `void`
     - `resendInvitation(tenantId, invitationId)` -> `OrganizationInvitation`
   - Models:
     - `OrganizationInvitation`: id, tenant_id, tenant_name, inviter_id, inviter_name, email, user_id, role, status (pending | accepted | declined | expired | canceled), token, expires_at, created_at

6. **Domain-Based Auto-Join**
   - Automatically add users to organizations when their email domain matches a verified domain
   - API methods:
     - `configureDomainAutoJoin(tenantId, config)` -> `DomainAutoJoinConfig`
     - `getDomainAutoJoinConfig(tenantId)` -> `DomainAutoJoinConfig`
   - Models:
     - `DomainAutoJoinConfig`: tenant_id, enabled, enrollment_mode (automatic_invitation | automatic_suggestion | auto_join), default_role, verified_domains (string[])
   - Enrollment modes:
     - `auto_join`: User is automatically added as a member on signup/login
     - `automatic_invitation`: User receives an invitation they can accept
     - `automatic_suggestion`: User sees a suggestion to request membership

#### Enhanced Features (Should Have)

7. **Organization Switching Audit Trail**
   - Log every organization switch for security and compliance
   - Events: `organization.switched`, `organization.personal_account.activated`
   - Audit fields: user_id, from_tenant_id, to_tenant_id, timestamp, ip_address, user_agent

8. **Per-Organization User Profiles**
   - Users can have different profile information per organization (display name, title, avatar)
   - API methods:
     - `getOrganizationProfile(tenantId, userId)` -> `OrganizationUserProfile`
     - `updateOrganizationProfile(tenantId, userId, profile)` -> `OrganizationUserProfile`
   - Models:
     - `OrganizationUserProfile`: user_id, tenant_id, display_name, title, avatar_url, bio, metadata

9. **Session Management Per Organization**
   - Maintain separate session data per organization context
   - API methods:
     - `getOrganizationSession(userId, tenantId)` -> `OrganizationSession`
     - `listActiveSessions(userId)` -> `OrganizationSessionListResponse`
     - `revokeOrganizationSession(userId, tenantId)` -> `void`
   - Models:
     - `OrganizationSession`: user_id, tenant_id, session_id, started_at, last_active_at, ip_address, user_agent, is_current

10. **Organization Limits and Quotas**
    - Limit how many organizations a user can belong to (per plan)
    - API methods:
      - `getMembershipLimits(userId)` -> `MembershipLimits`
    - Models:
      - `MembershipLimits`: max_organizations, current_count, can_join_more (boolean)

11. **Organization Onboarding**
    - First-time experience when a user joins an organization
    - API methods:
      - `getOnboardingStatus(tenantId, userId)` -> `MemberOnboardingStatus`
      - `completeOnboardingStep(tenantId, userId, step)` -> `MemberOnboardingStatus`
    - Models:
      - `MemberOnboardingStatus`: user_id, tenant_id, is_complete, steps, current_step

#### Future Features (Nice to Have)

12. **Organization Favorites / Pinning**
    - Pin frequently used organizations for quick access
    - API methods: `pinOrganization(userId, tenantId)`, `unpinOrganization(userId, tenantId)`, `listPinnedOrganizations(userId)`

13. **Recent Organizations**
    - Track recently accessed organizations for quick switching
    - API methods: `getRecentOrganizations(userId, limit?)` -> `RecentOrganization[]`

14. **Organization Merge**
    - Merge user accounts across organizations when the same email exists in multiple orgs
    - Handle identity linking and account consolidation

15. **Cross-Organization Permissions**
    - Grant users permissions that span multiple organizations (platform admin, support agent)

### API Surface

| Method | Description | Parameters | Returns |
|--------|------------|------------|---------|
| `createMembership(request)` | Create org membership | CreateMembershipRequest | `OrganizationMembership` |
| `getMembership(membershipId)` | Get membership | membershipId | `OrganizationMembership` |
| `listUserMemberships(userId, params?)` | List user's org memberships | userId, pagination/filter | `OrganizationMembershipListResponse` |
| `listOrganizationMembers(tenantId, p?)` | List org members | tenantId, pagination/filter | `OrganizationMembershipListResponse` |
| `updateMembership(membershipId, req)` | Update membership role | membershipId, request | `OrganizationMembership` |
| `deactivateMembership(membershipId)` | Deactivate membership | membershipId | `OrganizationMembership` |
| `reactivateMembership(membershipId)` | Reactivate membership | membershipId | `OrganizationMembership` |
| `deleteMembership(membershipId)` | Delete membership | membershipId | `void` |
| `setActiveOrganization(userId, tenantId)` | Switch active org | userId, tenantId | `ActiveOrganizationContext` |
| `getActiveOrganization(userId)` | Get current active org | userId | `ActiveOrganizationContext` |
| `clearActiveOrganization(userId)` | Clear active org | userId | `void` |
| `switchToPersonalAccount(userId)` | Switch to personal mode | userId | `ActiveOrganizationContext` |
| `listJoinableOrganizations(userId, p?)` | Find joinable orgs | userId, params | `JoinableOrganizationListResponse` |
| `searchOrganizations(query, params?)` | Search orgs | query string, params | `OrganizationSearchResult` |
| `listPendingInvitations(userId)` | List user's invitations | userId | `OrganizationInvitationListResponse` |
| `acceptInvitation(invitationId)` | Accept invitation | invitationId | `OrganizationMembership` |
| `declineInvitation(invitationId)` | Decline invitation | invitationId | `void` |
| `inviteToOrganization(tenantId, req)` | Invite user to org | tenantId, request | `OrganizationInvitation` |
| `listOrganizationInvitations(tenantId, p?)` | List org invitations | tenantId, params | `OrganizationInvitationListResponse` |
| `cancelInvitation(tenantId, invId)` | Cancel invitation | tenantId, invitationId | `void` |
| `resendInvitation(tenantId, invId)` | Resend invitation | tenantId, invitationId | `OrganizationInvitation` |
| `configureDomainAutoJoin(tenantId, cfg)` | Configure auto-join | tenantId, config | `DomainAutoJoinConfig` |
| `getOrganizationProfile(tenantId, userId)` | Get org-specific profile | tenantId, userId | `OrganizationUserProfile` |
| `updateOrganizationProfile(tId, uId, p)` | Update org-specific profile | tenantId, userId, profile | `OrganizationUserProfile` |

### Models

- **OrganizationMembership**: id, user_id, tenant_id, role (string), role_id (uuid), status (pending | active | inactive), permissions (string[]), is_default (boolean), joined_at, invited_by, deactivated_at, deactivated_reason, metadata (dict)
- **ActiveOrganizationContext**: user_id, tenant_id, tenant_name, tenant_slug, tenant_logo_url, membership_id, role, permissions (string[]), personal_account (boolean), switched_at
- **JoinableOrganization**: tenant_id, name, slug, logo_url, description, member_count, join_method, domain_match, has_pending_invitation
- **OrganizationInvitation**: id, tenant_id, tenant_name, tenant_logo_url, inviter_id, inviter_name, inviter_email, email, user_id, role, status, token, redirect_url, expires_at, created_at, accepted_at
- **DomainAutoJoinConfig**: tenant_id, enabled, enrollment_mode (auto_join | automatic_invitation | automatic_suggestion), default_role, default_role_id, verified_domains (string[]), require_email_verification (boolean)
- **OrganizationUserProfile**: user_id, tenant_id, display_name, title, avatar_url, bio, phone, timezone, metadata
- **OrganizationSession**: user_id, tenant_id, session_id, started_at, last_active_at, ip_address, user_agent, is_current
- **MembershipLimits**: max_organizations, current_count, can_join_more, plan_name
- **OrganizationSearchResult**: data (JoinableOrganization[]), pagination (Pagination), total_results

### Events (for webhooks)

| Event | Trigger |
|-------|---------|
| `organization.membership.created` | User added to organization |
| `organization.membership.activated` | Membership activated |
| `organization.membership.deactivated` | Membership deactivated |
| `organization.membership.deleted` | Membership permanently removed |
| `organization.membership.role_changed` | Member's role updated |
| `organization.switched` | User switched active organization |
| `organization.personal_account.activated` | User switched to personal account |
| `organization.invitation.created` | Invitation sent |
| `organization.invitation.accepted` | Invitation accepted |
| `organization.invitation.declined` | Invitation declined |
| `organization.invitation.expired` | Invitation expired |
| `organization.invitation.canceled` | Invitation canceled |
| `organization.invitation.resent` | Invitation resent |
| `organization.auto_join.triggered` | Domain auto-join matched a user |
| `organization.profile.updated` | Org-specific profile updated |

### Error Scenarios

| Scenario | HTTP Status | Python | TypeScript | Java |
|----------|-------------|--------|------------|------|
| Membership not found | 404 | `MembershipNotFoundError` | `MembershipNotFoundError` | `MembershipNotFoundException` |
| User already a member | 409 | `AlreadyMemberError` | `AlreadyMemberError` | `AlreadyMemberException` |
| Membership inactive | 403 | `MembershipInactiveError` | `MembershipInactiveError` | `MembershipInactiveException` |
| Invitation not found | 404 | `InvitationNotFoundError` | `InvitationNotFoundError` | `InvitationNotFoundException` |
| Invitation expired | 410 | `InvitationExpiredError` | `InvitationExpiredError` | `InvitationExpiredException` |
| Invitation already accepted | 409 | `InvitationAlreadyAcceptedError` | `InvitationAlreadyAcceptedError` | `InvitationAlreadyAcceptedException` |
| Max organizations reached | 403 | `MaxOrganizationsError` | `MaxOrganizationsError` | `MaxOrganizationsException` |
| Organization not joinable | 403 | `OrganizationNotJoinableError` | `OrganizationNotJoinableError` | `OrganizationNotJoinableException` |
| Cannot leave last organization | 422 | `LastOrganizationError` | `LastOrganizationError` | `LastOrganizationException` |
| Personal accounts disabled | 403 | `PersonalAccountsDisabledError` | `PersonalAccountsDisabledError` | `PersonalAccountsDisabledException` |
| Domain auto-join not configured | 404 | `AutoJoinNotConfiguredError` | `AutoJoinNotConfiguredError` | `AutoJoinNotConfiguredException` |
| Cannot deactivate own membership | 422 | `CannotDeactivateSelfError` | `CannotDeactivateSelfError` | `CannotDeactivateSelfException` |

### Cross-Language Notes

- **Python:** The `OrganizationSwitcherClient` should be a separate client class from `TenantClient` since it operates from the user's perspective rather than the admin's perspective. Use `@contextmanager` for organization context switching in synchronous code. The `ActiveOrganizationContext` should be usable as a context manager: `with client.switch_organization(user_id, tenant_id) as ctx:`.
- **TypeScript:** Create an `OrganizationSwitcher` class with reactive patterns. The `setActiveOrganization()` should return a typed context object that can be used with TypeScript narrowing. Consider providing React hook patterns in documentation: `useOrganization()`, `useOrganizationList()`. Export all invitation and membership types.
- **Java:** Use `OrganizationMembership.Builder` with required fields validation. The `ActiveOrganizationContext` should be immutable (use records in Java 17+). Consider providing a `ThreadLocal`-based `OrganizationContextHolder` for server-side org context propagation. Implement `Comparable<OrganizationMembership>` for sorting by joined_at.

---

## Cross-Cutting Concerns

### Pagination Consistency

All list methods across all modules must use consistent pagination:

```
{
  "data": [...],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 150,
    "total_pages": 8
  }
}
```

Parameters: `page` (1-indexed), `page_size` (default 20, max 100), `sort` (field:direction).

### Rate Limiting

All modules should respect and surface rate limit information:
- Return `RateLimitError` (429) with `retry_after` seconds
- Include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers

### Idempotency

Create operations should support idempotency keys:
- Header: `Idempotency-Key: <uuid>`
- Duplicate requests with the same key return the original response

### Audit Trail

All mutating operations across all modules should generate audit log entries:
- actor_id, action, resource_type, resource_id, changes (diff), timestamp, ip_address

### Backward Compatibility

All enhancements to existing modules must maintain backward compatibility:
- New fields should be optional with sensible defaults
- Deprecated methods should emit warnings for at least 2 major versions
- Breaking changes require a major version bump

### Testing Requirements

Each new feature must include:
- Unit tests for all SDK client methods (Python pytest, TS Jest, Java JUnit)
- Integration tests against mock API server
- Error scenario tests (all error codes)
- Pagination tests (empty list, single page, multi-page)
- Type validation tests (invalid inputs)

---

## Implementation Priority

| Priority | Module | Effort Estimate | Dependencies |
|----------|--------|----------------|--------------|
| P1 | Multi-Tenancy Enhancements | 3 sprints | None |
| P2 | SSO Module Enhancements | 3 sprints | Multi-Tenancy (connections) |
| P3 | Organization Switcher | 4 sprints | Multi-Tenancy (domains, memberships) |
| P3 | Teams Module Enhancements | 3 sprints | None |
| P4 | SCIM Endpoints | 4 sprints | SSO Module (SCIM config) |
| P4 | Departments Enhancements | 2 sprints | SCIM Endpoints (group sync) |

### Recommended Implementation Order

1. **Multi-Tenancy Enhancements** -- Foundation for everything else (verified domains, connections, branding)
2. **SSO Module Enhancements** -- Depends on multi-tenancy connection model
3. **Organization Switcher** -- Depends on multi-tenancy domain verification for auto-join
4. **Teams Module Enhancements** -- Independent, can be parallelized with #3
5. **SCIM Endpoints** -- Depends on SSO module for SCIM configuration
6. **Departments Enhancements** -- Depends on SCIM for group synchronization

---

## References

- [Auth0 Organizations Documentation](https://auth0.com/docs/manage-users/organizations/configure-organizations/enable-connections)
- [Auth0 Self-Service SSO](https://auth0.com/docs/authenticate/enterprise-connections/self-service-SSO/manage-self-service-sso)
- [Auth0 SCIM Documentation](https://auth0.com/docs/authenticate/protocols/scim)
- [Auth0 B2B SaaS Starter Kit](https://github.com/auth0-developer-hub/auth0-b2b-saas-starter)
- [Clerk Organizations Overview](https://clerk.com/docs/guides/organizations/overview)
- [Clerk Roles and Permissions](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions)
- [Clerk Organization Switcher Component](https://clerk.com/docs/reference/components/organization/organization-switcher)
- [Clerk Verified Domains](https://clerk.com/docs/guides/organizations/add-members/verified-domains)
- [Clerk Custom Organization Switcher Flow](https://clerk.com/docs/organizations/custom-organization-switcher)
- [Clerk Backend API Role Management](https://clerk.com/changelog/2025-11-24-organization-roles-and-permission-bapi-management)
- [WorkOS SSO Documentation](https://workos.com/docs/sso)
- [WorkOS Directory Sync](https://workos.com/docs/directory-sync)
- [WorkOS Organizations and Users](https://workos.com/docs/authkit/users-organizations)
- [WorkOS Roles and Permissions](https://workos.com/docs/authkit/roles-and-permissions)
- [WorkOS SCIM Guide](https://workos.com/guide/the-developers-guide-to-scim)
- [Firebase Multi-tenancy Authentication](https://cloud.google.com/identity-platform/docs/multi-tenancy-authentication)
- [Supabase Multi-tenant Discussion](https://github.com/orgs/supabase/discussions/1615)
- [SCIM RFC 7643 - Schema](https://datatracker.ietf.org/doc/html/rfc7643)
- [SCIM RFC 7644 - Protocol](https://datatracker.ietf.org/doc/html/rfc7644)
- [SCIM Reference](https://scim.cloud/)
