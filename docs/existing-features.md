# Shared Platform SDK - Existing Features Documentation

**Last Updated**: 2025-12-29
**SDK Version**: 0.1.0
**Languages**: Python, Node.js (TypeScript), Java

This document provides a comprehensive inventory of all implemented features in the Shared Platform SDK. It serves as the baseline for competitive analysis and feature gap identification.

---

## Feature Inventory

### 1. Authentication Module

**Status**: Implemented
**Location**: `packages/*/src/auth/`

| Capability | Description | API Methods |
| ---------- | ----------- | ----------- |
| OAuth2/OIDC Login | Standard OAuth2 authorization code flow with PKCE | `login()`, `authorize()` |
| Token Management | Access/refresh token handling with automatic refresh | `refreshToken()`, `revokeToken()` |
| JWT Validation | Token signature and claims verification | `validateToken()`, `introspect()` |
| User Context | Extract user info, roles, permissions from token | `getUserContext()` |
| Logout | Session termination and token revocation | `logout()` |

**Supported Flows**:
- Authorization Code + PKCE
- Client Credentials
- Refresh Token

---

### 2. Users Module

**Status**: Implemented
**Location**: `packages/*/src/users/`

| Capability | Description | API Methods |
| ---------- | ----------- | ----------- |
| User CRUD | Create, read, update, delete users | `create()`, `get()`, `update()`, `delete()` |
| List Users | Paginated user listing with filters | `list()` |
| User Search | Search by email, name, status | `search()` |
| Profile Management | View and update user profiles | `getProfile()`, `updateProfile()` |
| Status Management | Activate, suspend, deactivate users | `activate()`, `suspend()`, `deactivate()` |
| Password Management | Password change and reset initiation | `changePassword()`, `resetPassword()` |

**User Statuses**: `active`, `inactive`, `pending`, `suspended`, `deleted`

**User Fields**:
- Identity: id, email, email_verified
- Profile: name, given_name, family_name, picture, phone
- Organization: tenant_id, department_id, team_id, manager_id
- SSO: external_id, identity_provider, entra_object_id

---

### 3. Roles & Permissions Module

**Status**: Implemented
**Location**: `packages/*/src/permissions/`

| Capability | Description | API Methods |
| ---------- | ----------- | ----------- |
| Role Management | CRUD operations on roles | `createRole()`, `getRole()`, `updateRole()`, `deleteRole()` |
| Permission Assignment | Assign/revoke permissions to roles | `assignPermission()`, `revokePermission()` |
| Role Assignment | Assign/revoke roles to users | `assignRole()`, `revokeRole()` |
| Permission Check | Verify user has specific permission | `hasPermission()`, `checkPermission()` |
| Role Hierarchy | Hierarchical roles with inheritance | `getRoleHierarchy()` |

**Built-in Roles**:
| Role | Level | Key Permissions |
| ---- | ----- | --------------- |
| super_admin | 100 | `*` (all) |
| admin | 80 | `users:*`, `settings:*`, `reports:*` |
| manager | 60 | `users:read`, `team:*`, `reports:read` |
| user | 40 | `profile:*`, `notifications:read` |
| guest | 10 | `public:read` |

**Permission Format**: `resource:action` (e.g., `users:read`, `teams:*`)

---

### 4. Multi-Tenancy Module

**Status**: Implemented
**Location**: `packages/*/src/tenants/`

| Capability | Description | API Methods |
| ---------- | ----------- | ----------- |
| Tenant CRUD | Create and manage tenants | `create()`, `get()`, `update()`, `delete()` |
| Tenant Isolation | Complete data segregation per tenant | Automatic via tenant_id |
| Custom Domains | Per-tenant custom domain support | `setDomain()`, `verifyDomain()` |
| Branding | Logo, colors, custom CSS per tenant | Via Settings module |
| Plan Management | Subscription tier management | `getPlan()`, `updatePlan()` |
| Feature Flags | Per-tenant feature enablement | `getFeatures()`, `setFeature()` |

**Tenant Statuses**: `active`, `inactive`, `suspended`, `pending`

**Plans**: `free`, `basic`, `pro`, `enterprise`

**Feature Flags**:
- `sso_enabled`
- `scim_enabled`
- `custom_branding_enabled`
- `analytics_enabled`
- `max_users`
- `max_storage_gb`

---

### 5. SSO Module

**Status**: Implemented
**Location**: `packages/*/src/tenants/` (SSOConfig)

| Capability | Description | API Methods |
| ---------- | ----------- | ----------- |
| Azure AD/Entra | Microsoft identity platform integration | `configureAzureAD()` |
| Okta | Okta workforce identity | `configureOkta()` |
| Google Workspace | Google identity integration | `configureGoogle()` |
| Generic SAML 2.0 | Any SAML-compliant IdP | `configureSAML()` |
| Generic OIDC | Any OIDC-compliant IdP | `configureOIDC()` |
| JIT Provisioning | Auto-create users on first SSO login | Configurable per tenant |
| Attribute Mapping | Map IdP attributes to user fields | Configurable mappings |

**SCIM Configuration**: Partial (config exists, endpoints pending)

---

### 6. Teams Module

**Status**: Implemented
**Location**: `packages/*/src/teams/`

| Capability | Description | API Methods |
| ---------- | ----------- | ----------- |
| Team CRUD | Create and manage teams | `create()`, `get()`, `update()`, `delete()` |
| Team Hierarchy | Parent-child team relationships | `getTree()`, `setParent()` |
| Member Management | Add/remove team members | `addMember()`, `removeMember()`, `updateMemberRole()` |
| Team Roles | Owner, admin, member roles | Via `TeamMemberRole` |
| Team Search | Search and filter teams | `list()`, `search()` |

**Team Member Roles**: `owner`, `admin`, `member`

**Hierarchy Support**: Materialized path for efficient tree queries

---

### 7. Invitations Module

**Status**: Implemented
**Location**: `packages/*/src/invitations/`

| Capability | Description | API Methods |
| ---------- | ----------- | ----------- |
| Create Invitation | Generate secure invitation tokens | `create()` |
| Bulk Invitations | Send multiple invitations at once | `bulkCreate()` |
| Validate Token | Check invitation validity | `validate()` |
| Accept Invitation | Process invitation acceptance | `accept()` |
| Resend | Resend invitation email | `resend()` |
| Revoke | Cancel pending invitation | `revoke()` |

**Invitation Types**: `user`, `team`, `organization`, `test`, `course`, `custom`

**Invitation Statuses**: `pending`, `sent`, `viewed`, `accepted`, `expired`, `revoked`, `completed`

**Token Format**: 64-character hex (crypto-secure)

---

### 8. Webhooks Module

**Status**: Implemented
**Location**: `packages/*/src/webhooks/`

| Capability | Description | API Methods |
| ---------- | ----------- | ----------- |
| Webhook CRUD | Create and manage webhooks | `create()`, `get()`, `update()`, `delete()` |
| Event Subscription | Subscribe to specific events | Via `events` array |
| Signature Verification | HMAC-SHA256 payload signing | `verifySignature()` |
| Delivery Tracking | Track delivery attempts and status | `getDeliveries()` |
| Retry Logic | Configurable retry on failure | `retry_count` config |
| Test Webhook | Send test payload | `test()` |

**Supported Events**:
- User: `user.created`, `user.updated`, `user.deleted`, `user.activated`, `user.deactivated`
- Team: `team.created`, `team.updated`, `team.deleted`, `team.member_added`, `team.member_removed`
- Invitation: `invitation.created`, `invitation.sent`, `invitation.accepted`, `invitation.expired`
- Role: `role.created`, `role.updated`, `role.deleted`, `role.assigned`, `role.removed`
- Session: `session.created`, `session.expired`
- Settings: `settings.updated`

**Signature Format**: `X-Webhook-Signature: sha256={hex_digest}`

---

### 9. API Keys Module

**Status**: Implemented
**Location**: `packages/*/src/apikeys/`

| Capability | Description | API Methods |
| ---------- | ----------- | ----------- |
| Key Generation | Create secure API keys | `create()` |
| Key Management | List, view, revoke keys | `list()`, `get()`, `revoke()` |
| Validation | Validate key and check permissions | `validate()` |
| Rate Limiting | Per-key request limits | `rate_limit` config |
| IP Restrictions | Whitelist allowed IPs | `allowed_ips` config |
| Usage Tracking | Track key usage statistics | `getUsage()` |

**Key Format**: `sk_{environment}_{32-char-hex}` (e.g., `sk_live_abc123...`)

**Environments**: `live`, `test`

---

### 10. Email Module

**Status**: Implemented
**Location**: `packages/*/src/email/`

| Capability | Description | API Methods |
| ---------- | ----------- | ----------- |
| Template Management | CRUD for email templates | `createTemplate()`, `getTemplate()`, `updateTemplate()` |
| Variable Substitution | Dynamic content in templates | Template variables |
| Send Email | Send direct emails | `send()` |
| Send Templated | Send using templates | `sendTemplate()` |
| SMTP Configuration | Per-tenant SMTP settings | `configureSmtp()`, `verifySmtp()` |

**Template Categories**: `invitation`, `verification`, `notification`, `reminder`, `welcome`, `password_reset`, `alert`

---

### 11. Settings Module

**Status**: Implemented
**Location**: `packages/*/src/settings/`

| Capability | Description | API Methods |
| ---------- | ----------- | ----------- |
| Get Settings | Retrieve tenant settings | `get()`, `getByCategory()` |
| Update Settings | Modify tenant settings | `update()` |
| Setting Definitions | Define available settings | System-defined |

**Setting Categories**:
- `general`: timezone, locale, date/time format
- `branding`: logo, colors, custom CSS
- `features`: SSO, MFA, analytics toggles
- `security`: password policies, session timeouts
- `notifications`: email preferences, digest frequency

---

### 12. Departments Module

**Status**: Implemented
**Location**: `packages/*/src/tenants/` (Departments)

| Capability | Description | API Methods |
| ---------- | ----------- | ----------- |
| Department CRUD | Create and manage departments | `create()`, `get()`, `update()`, `delete()` |
| Department Hierarchy | Organizational structure | `getTree()` |
| User Assignment | Assign users to departments | Via User `department_id` |

---

## Cross-Cutting Capabilities

### Error Handling

| HTTP Status | Python | TypeScript | Java |
| ----------- | ------ | ---------- | ---- |
| 400 | `ValidationError` | `ValidationError` | `ValidationException` |
| 401 | `AuthenticationError` | `AuthenticationError` | `AuthenticationException` |
| 403 | `AuthorizationError` | `AuthorizationError` | `AuthorizationException` |
| 404 | `NotFoundError` | `NotFoundError` | `NotFoundException` |
| 429 | `RateLimitError` | `RateLimitError` | `RateLimitException` |
| 5xx | `ServerError` | `ServerError` | `ServerException` |

### Pagination

All list endpoints support consistent pagination:
- `page`: Page number (1-indexed)
- `page_size`: Items per page (default: 20)
- Response includes: `total_items`, `total_pages`, `has_next`, `has_previous`

### Common Patterns

- Builder pattern for client construction (especially Java)
- Async/await for all network operations
- Automatic token refresh
- Request/response logging (sanitized)
- Configurable timeouts and retries

---

## Feature Gaps (Not Yet Implemented)

| Feature | Status | Priority | Notes |
| ------- | ------ | -------- | ----- |
| MFA/2FA | Not Implemented | P1 | TOTP, SMS, backup codes |
| Passwordless Auth | Not Implemented | P2 | Magic links, OTP |
| Passkeys/WebAuthn | Not Implemented | P2 | Biometric/security keys |
| Session Management | Not Implemented | P2 | View/terminate sessions |
| Audit Logs | Not Implemented | P1 | Compliance requirement |
| Admin Portal Components | Not Implemented | P3 | Embeddable UI |
| Organization Switcher | Not Implemented | P3 | Multi-org users |
| User Impersonation | Not Implemented | P3 | Support use case |
| Breached Password Check | Not Implemented | P4 | HaveIBeenPwned integration |
| SCIM Endpoints | Partial | P4 | Config exists, endpoints pending |

---

## SDK Structure Reference

```
packages/
├── python/src/shared_platform/
│   ├── auth/           # Authentication
│   ├── users/          # User management
│   ├── permissions/    # Roles & permissions
│   ├── tenants/        # Multi-tenancy, SSO, departments
│   ├── teams/          # Team management
│   ├── invitations/    # Invitation system
│   ├── webhooks/       # Webhook subscriptions
│   ├── apikeys/        # API key management
│   ├── email/          # Email templates & sending
│   └── settings/       # Tenant configuration
├── node/src/
│   └── [same structure]
└── java/src/main/java/com/platform/sdk/
    └── [same structure]
```

---

## Version History

| Version | Date | Changes |
| ------- | ---- | ------- |
| 0.1.0 | 2025-12-29 | Initial feature inventory |
