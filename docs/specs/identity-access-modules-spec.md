# Identity & Access Management Modules -- Requirement Specification

**Version**: 1.0.0
**Date**: 2026-02-06
**Status**: Draft
**Authors**: Platform SDK Team
**Drivers**: Competitive parity, customer requests, platform maturity for GA

---

## Table of Contents

1. [Users Module (Enhanced)](#1-users-module-enhanced)
2. [Roles & Permissions Module (Enhanced)](#2-roles--permissions-module-enhanced)
3. [User Impersonation Module (New)](#3-user-impersonation-module-new)
4. [Appendix A: Competitor Feature Matrix](#appendix-a-competitor-feature-matrix)

---

## 1. Users Module (Enhanced)

### Overview

The Users module provides comprehensive user lifecycle management including CRUD operations, profile management, identity linking, security controls, and metadata management. It serves as the foundational identity layer for the platform, enabling tenant-scoped user management with support for external identity providers, directory sync, and advanced user state management.

**Value Proposition**: A single SDK surface for the complete user lifecycle -- from invitation and provisioning through to suspension, banning, and deletion -- with competitive feature parity against Auth0, Clerk, WorkOS, Firebase Auth, and Supabase Auth.

### Current Capabilities (Already Implemented)

- User CRUD (create, get, update, delete with soft-delete)
- List Users with pagination and filters (search, status, role, team_id, sort)
- User Search (by email, name, status)
- Profile Management (getProfile, updateProfile, getPreferences, updatePreferences)
- Status Management (activate, suspend, deactivate via `updateStatus`)
- Password Management (changePassword, resetPassword)
- Role assignment via `updateRoles`
- Invitation via `invite`
- User statistics via `getStats`
- User fields: id, email, email_verified, name, given_name, family_name, picture, phone, phone_verified, status, roles, tenant_id, department_id, team_id, manager_id, external_id, identity_provider, entra_object_id, entra_upn, sso_last_sync_at, metadata, last_login_at, created_at, updated_at
- Statuses: active, inactive, pending, suspended, deleted

### Competitive Analysis

#### Auth0
- **User metadata**: Dual metadata system (`user_metadata` for user-editable data, `app_metadata` for server-side-only data). Our single `metadata` field does not distinguish between client-safe and server-only data.
- **Account linking**: Link multiple identity provider accounts (Google, GitHub, SAML, etc.) into a single user profile. Users can authenticate with any linked provider. Linked identities stored as an array on the user object.
- **User blocking**: Explicit `blocked` boolean field on user objects. Separate from suspension -- a blocked user cannot authenticate at all.
- **MFA enrollment management**: Admin APIs to list, enroll, and delete MFA factors (TOTP, SMS, push notification, WebAuthn) per user.
- **Password policies**: Configurable password strength requirements, breach detection (checks passwords against known compromised databases), password history enforcement.
- **Normalized profile schema**: Standardized user profile fields based on OIDC standard claims across all identity providers.
- **Bulk user import/export**: Import users from CSV/JSON with password hash migration support. Export all users.
- **Connection-specific user counts**: Track which authentication connection each user was provisioned through.
- **Login count tracking**: `logins_count` field on user objects.

#### Clerk
- **User banning**: `banUser()` / `unbanUser()` methods. Banned users have all sessions revoked and cannot sign in again until unbanned. Distinct from locking.
- **User locking**: `lockUser()` / `unlockUser()` methods. Locked users cannot sign in until the lock expires. Automatic locking after configurable failed attempt threshold (default 100 attempts, 1-hour cooldown).
- **Dual metadata**: `publicMetadata` (readable from frontend, writable from backend), `privateMetadata` (backend-only), and `unsafeMetadata` (readable/writable from frontend -- for non-sensitive data).
- **TOTP management**: `has_totp` and `two_factor_enabled` properties. Admin can disable 2FA for a user.
- **Password verification**: `verifyPassword()` method for custom auth flows.
- **Profile image management**: Built-in `setProfileImage()` and `deleteProfileImage()` with image hosting.
- **External account management**: Array of external accounts (OAuth providers) with provider-specific IDs and tokens.
- **User count methods**: `getCount()` with filter support.
- **Organization membership**: Users belong to Organizations with org-scoped roles.
- **Last sign-in tracking**: Tracks last sign-in timestamp and last active timestamp.

#### WorkOS
- **Directory Sync (SCIM)**: Automatic user provisioning/deprovisioning from corporate directories (Okta, Entra ID, Google Workspace). Single API integration syncs users and groups.
- **JIT provisioning**: Just-In-Time user creation on first SSO login.
- **User Management API**: CRUD with organization scoping, email verification, password management.
- **Multi-factor authentication**: Built-in MFA with TOTP support.
- **Password policies**: Leaked password protection, configurable password strength validation.
- **Spam/bot detection**: Automatic detection during user creation.

#### Firebase Auth
- **Custom claims**: Arbitrary JSON payload (max 1000 bytes) on user tokens for RBAC/authorization. Set only from Admin SDK. Propagated via ID tokens (up to 1-hour cache).
- **Multiple providers**: Users can link multiple auth providers (email, phone, Google, Facebook, Apple, etc.) to a single account.
- **Admin user management**: Create, update, delete users without client-side rate limiting.
- **Email link authentication**: Passwordless login via email links.
- **Phone auth**: SMS-based authentication with built-in OTP.
- **Anonymous auth**: Create anonymous users that can later be converted to permanent accounts.
- **User import**: Bulk import with password hash migration (bcrypt, scrypt, HMAC-SHA256, etc.).
- **User disable/enable**: Boolean `disabled` field.
- **Token revocation**: Revoke all refresh tokens for a user.

#### Supabase Auth
- **Admin API**: `admin.createUser()`, `admin.updateUserById()`, `admin.deleteUser()`, `admin.listUsers()` with pagination.
- **Dual metadata**: `raw_user_meta_data` (user-editable) and `raw_app_meta_data` (server-side only, for roles and access control).
- **Soft delete**: Reversible user deletion.
- **Invite by email**: `inviteUserByEmail()` for admin-initiated invitations.
- **User identity management**: Array of identities from different OAuth providers.
- **Email/phone confirmation**: Admin can create pre-confirmed users.
- **Row-Level Security integration**: User auth tokens directly usable in Postgres RLS policies.

### Requirements

#### Core Features (Must Have) -- P0

##### 1.1 Structured Metadata (Dual Metadata System)

Replace the single `metadata` field with a dual metadata system to align with Auth0, Clerk, and Supabase patterns.

- **`public_metadata`**: Key-value data that is readable from client-side SDKs and writable only from server-side/admin APIs. Suitable for user preferences visible to the frontend, display settings, and non-sensitive profile extensions.
- **`private_metadata`**: Key-value data that is readable and writable only from server-side/admin APIs. Suitable for internal flags, billing identifiers, support notes, and access control data.

Both fields are JSON objects with string keys and arbitrary JSON values. The existing `metadata` field should be deprecated in favor of `public_metadata` and treated as an alias for backward compatibility.

API methods:
- `getMetadata(userId)` -- Returns `{ public_metadata, private_metadata }`
- `updatePublicMetadata(userId, metadata)` -- Merge-patches public metadata
- `updatePrivateMetadata(userId, metadata)` -- Merge-patches private metadata (admin only)

Models/types:
- `UserMetadata`: `{ public_metadata: Record<string, any>, private_metadata: Record<string, any> }`

##### 1.2 User Banning

Add explicit ban capability, distinct from suspension. A banned user has all active sessions immediately revoked and cannot authenticate until unbanned. Banning is a permanent administrative action (unlike suspension which may be temporary or automatically reversed).

- New status value: `banned` added to `UserStatus` enum
- `banUser(userId, reason?)` -- Ban a user, revoke all sessions
- `unbanUser(userId)` -- Remove the ban
- New fields on User: `banned: boolean`, `banned_at: datetime`, `banned_reason: string`
- When a user is banned, all active sessions and refresh tokens must be invalidated

##### 1.3 User Locking (Brute Force Protection)

Add automatic and manual user locking to protect against brute-force attacks.

- `lockUser(userId, reason?, duration?)` -- Manually lock a user account
- `unlockUser(userId)` -- Manually unlock a user account
- New fields on User: `locked: boolean`, `locked_at: datetime`, `lock_expires_at: datetime`, `failed_login_attempts: integer`
- Automatic locking after configurable failed attempt threshold (default: 10 attempts)
- Configurable lock duration (default: 30 minutes)
- Lock auto-expires after the configured duration
- Locked users receive a specific error on login attempt: `UserLockedError` / `UserLockedException`

##### 1.4 Email Verification Management

Enhance email verification with admin controls and resend capability.

- `sendVerificationEmail(userId)` -- Resend verification email
- `verifyEmail(userId)` -- Admin-initiated email verification (bypass email flow)
- `unverifyEmail(userId)` -- Reset email verification status (e.g., after email change)

##### 1.5 Phone Verification Management

Add phone verification management.

- `sendPhoneVerification(userId)` -- Send phone verification SMS/code
- `verifyPhone(userId)` -- Admin-initiated phone verification
- `unverifyPhone(userId)` -- Reset phone verification status

##### 1.6 Bulk User Operations

Add bulk operations for administrative efficiency.

- `bulkCreate(users: CreateUserRequest[])` -- Create multiple users in one call. Returns `BulkCreateResult` with `created`, `failed`, and `errors` arrays.
- `bulkDelete(userIds: string[])` -- Soft-delete multiple users. Returns `BulkDeleteResult`.
- `bulkUpdateStatus(userIds: string[], status, reason?)` -- Update status of multiple users.
- `exportUsers(format, filters?)` -- Export users to CSV or JSON with optional filters. Returns a download URL or async job ID.
- `importUsers(source, options?)` -- Import users from CSV/JSON with options for password hash format, conflict resolution (skip, overwrite, merge), and dry-run mode. Returns `ImportResult`.

##### 1.7 Login Tracking Enhancements

Add comprehensive login activity tracking.

- New fields on User: `login_count: integer`, `last_login_ip: string`, `last_login_user_agent: string`, `last_login_method: string` (password, sso, magic_link, etc.)
- `getLoginHistory(userId, pagination?)` -- Returns paginated login history with timestamp, IP, user agent, method, success/failure, location (derived from IP).
- `LoginHistoryEntry`: `{ id, timestamp, ip_address, user_agent, method, success, failure_reason?, location? }`

#### Enhanced Features (Should Have) -- P1

##### 1.8 Identity / Account Linking

Allow users to link multiple authentication identities (e.g., Google + email/password + SAML) to a single user profile. This is a competitive requirement from Auth0 and Firebase Auth.

- `linkIdentity(userId, provider, providerUserId, providerData?)` -- Link an external identity to a user
- `unlinkIdentity(userId, provider)` -- Remove a linked identity
- `getLinkedIdentities(userId)` -- List all linked identities for a user
- New model: `LinkedIdentity`: `{ id, user_id, provider, provider_user_id, provider_email, provider_data, linked_at }`
- On login via a linked identity, resolve to the primary user profile
- Support merge strategies for metadata when linking accounts with existing profiles

##### 1.9 MFA Enrollment Management

Provide admin-level management of user MFA factors.

- `listMfaFactors(userId)` -- List enrolled MFA factors
- `deleteMfaFactor(userId, factorId)` -- Remove a specific MFA factor (admin reset)
- `resetMfa(userId)` -- Remove all MFA factors for a user
- `getMfaStatus(userId)` -- Returns `{ enabled: boolean, factors: MfaFactor[] }`
- `MfaFactor`: `{ id, type: 'totp' | 'sms' | 'email' | 'webauthn', enrolled_at, last_used_at, verified }`

##### 1.10 Password Policies and Breach Detection

Configurable password requirements with breach detection.

- `getPasswordPolicy(tenantId?)` -- Get current password policy
- `updatePasswordPolicy(tenantId, policy)` -- Update password policy
- `PasswordPolicy`: `{ min_length, require_uppercase, require_lowercase, require_numbers, require_symbols, max_age_days, history_count, breach_detection_enabled }`
- Password validation against known breached password databases (via Have I Been Pwned API or equivalent)
- Password history enforcement (prevent reuse of last N passwords)

##### 1.11 User Count and Aggregation

Add dedicated count/aggregation endpoints.

- `count(filters?)` -- Return total count of users matching filters (without returning user data)
- `countByStatus()` -- Return counts grouped by status
- `countByRole()` -- Return counts grouped by role
- `countByProvider()` -- Return counts grouped by identity provider

#### Future Features (Nice to Have) -- P2

##### 1.12 Anonymous Users

Support creation of anonymous/guest users that can later be converted to full accounts (matches Firebase Auth capability).

- `createAnonymousUser(metadata?)` -- Create an anonymous user with a generated ID
- `convertAnonymousUser(userId, email, password?)` -- Convert anonymous user to a permanent account
- New identity_provider value: `anonymous`

##### 1.13 User Session Management (Admin)

Admin-level session management for security operations.

- `listSessions(userId)` -- List all active sessions for a user
- `revokeSession(userId, sessionId)` -- Revoke a specific session
- `revokeAllSessions(userId)` -- Revoke all sessions for a user
- `Session`: `{ id, user_id, ip_address, user_agent, created_at, last_active_at, expires_at }`

##### 1.14 Profile Image Management

Provide built-in profile image upload and management (matches Clerk).

- `uploadProfileImage(userId, file)` -- Upload and set profile image. Returns the new `picture` URL.
- `deleteProfileImage(userId)` -- Remove the profile image and reset to default.
- Server-side image resizing and CDN-backed delivery.

##### 1.15 User Merge

Merge two user accounts into one, consolidating identities, metadata, roles, and team memberships.

- `mergeUsers(primaryUserId, secondaryUserId, options?)` -- Merge secondary into primary. Options control conflict resolution for metadata, roles, etc.
- `MergeResult`: `{ primary_user, merged_fields, conflicts }`

### API Surface

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `list(params)` | List users with filters | `ListUsersParams` | `UserListResponse` |
| `get(userId)` | Get user by ID | `userId: string` | `User` |
| `create(request)` | Create a new user | `CreateUserRequest` | `User` |
| `update(userId, request)` | Update a user | `userId: string, UpdateUserRequest` | `User` |
| `delete(userId)` | Soft-delete a user | `userId: string` | `void` |
| `updateStatus(userId, status, reason?)` | Update user status | `userId: string, status: string, reason?: string` | `User` |
| `banUser(userId, reason?)` | Ban a user | `userId: string, reason?: string` | `User` |
| `unbanUser(userId)` | Unban a user | `userId: string` | `User` |
| `lockUser(userId, reason?, duration?)` | Lock a user account | `userId: string, reason?: string, duration?: number` | `User` |
| `unlockUser(userId)` | Unlock a user account | `userId: string` | `User` |
| `sendVerificationEmail(userId)` | Resend email verification | `userId: string` | `void` |
| `verifyEmail(userId)` | Admin-verify email | `userId: string` | `User` |
| `sendPhoneVerification(userId)` | Send phone verification | `userId: string` | `void` |
| `verifyPhone(userId)` | Admin-verify phone | `userId: string` | `User` |
| `getMetadata(userId)` | Get user metadata | `userId: string` | `UserMetadata` |
| `updatePublicMetadata(userId, data)` | Update public metadata | `userId: string, data: object` | `UserMetadata` |
| `updatePrivateMetadata(userId, data)` | Update private metadata | `userId: string, data: object` | `UserMetadata` |
| `bulkCreate(users)` | Create multiple users | `CreateUserRequest[]` | `BulkCreateResult` |
| `bulkDelete(userIds)` | Delete multiple users | `string[]` | `BulkDeleteResult` |
| `bulkUpdateStatus(userIds, status, reason?)` | Bulk status update | `string[], status, reason?` | `BulkStatusResult` |
| `exportUsers(format, filters?)` | Export users | `format: 'csv'\|'json', filters?` | `ExportResult` |
| `importUsers(source, options?)` | Import users | `ImportSource, ImportOptions` | `ImportResult` |
| `getLoginHistory(userId, params?)` | Get login history | `userId: string, PaginationParams?` | `LoginHistoryResponse` |
| `count(filters?)` | Count users | `CountFilters?` | `{ count: number }` |
| `linkIdentity(userId, provider, providerUserId, data?)` | Link identity | `userId, provider, providerUserId, data?` | `LinkedIdentity` |
| `unlinkIdentity(userId, provider)` | Unlink identity | `userId: string, provider: string` | `void` |
| `getLinkedIdentities(userId)` | Get linked identities | `userId: string` | `LinkedIdentity[]` |
| `listMfaFactors(userId)` | List MFA factors | `userId: string` | `MfaFactor[]` |
| `deleteMfaFactor(userId, factorId)` | Delete MFA factor | `userId, factorId: string` | `void` |
| `resetMfa(userId)` | Reset all MFA | `userId: string` | `void` |
| `listSessions(userId)` | List active sessions | `userId: string` | `Session[]` |
| `revokeSession(userId, sessionId)` | Revoke a session | `userId, sessionId: string` | `void` |
| `revokeAllSessions(userId)` | Revoke all sessions | `userId: string` | `void` |
| `getPasswordPolicy(tenantId?)` | Get password policy | `tenantId?: string` | `PasswordPolicy` |
| `updatePasswordPolicy(tenantId, policy)` | Update password policy | `tenantId: string, PasswordPolicy` | `PasswordPolicy` |

### Models

#### Updated User Model (additions in bold context)

```
User:
  # Existing fields (unchanged)
  id: string (UUID)
  email: string (email)
  email_verified: boolean
  email_verified_at: datetime
  name: string
  given_name: string
  family_name: string
  middle_name: string
  nickname: string
  picture: string (URI)
  phone: string (E.164)
  phone_verified: boolean
  status: UserStatus
  status_reason: string
  roles: string[]
  tenant_id: string (UUID)
  department_id: string (UUID)
  team_id: string (UUID)
  manager_id: string (UUID)
  external_id: string
  identity_provider: IdentityProvider
  entra_object_id: string
  entra_upn: string
  sso_last_sync_at: datetime
  last_login_at: datetime
  last_active_at: datetime
  password_changed_at: datetime
  created_at: datetime
  updated_at: datetime
  deleted_at: datetime

  # NEW fields
  public_metadata: Record<string, any>   # Client-readable metadata
  private_metadata: Record<string, any>  # Server-only metadata
  metadata: Record<string, any>          # DEPRECATED -- alias for public_metadata
  banned: boolean                        # Whether user is banned
  banned_at: datetime                    # When user was banned
  banned_reason: string                  # Reason for banning
  locked: boolean                        # Whether user is locked
  locked_at: datetime                    # When user was locked
  lock_expires_at: datetime              # When lock auto-expires
  failed_login_attempts: integer         # Count of consecutive failed logins
  login_count: integer                   # Total successful login count
  last_login_ip: string                  # IP address of last login
  last_login_method: string              # Method of last login (password, sso, magic_link)
  mfa_enabled: boolean                   # Whether MFA is enabled
  linked_identities_count: integer       # Number of linked identities
```

#### UserStatus (Updated Enum)

```
UserStatus:
  - active       # User can log in and use the platform
  - inactive     # User account is deactivated
  - pending      # Awaiting verification or invitation acceptance
  - suspended    # Temporarily blocked (may auto-revert)
  - banned       # Permanently blocked until admin unbans (NEW)
  - deleted      # Soft-deleted, in retention period
```

#### New Models

```
UserMetadata:
  public_metadata: Record<string, any>
  private_metadata: Record<string, any>

LinkedIdentity:
  id: string (UUID)
  user_id: string (UUID)
  provider: IdentityProvider
  provider_user_id: string
  provider_email: string
  provider_display_name: string
  provider_data: Record<string, any>    # Raw provider profile data
  linked_at: datetime
  last_used_at: datetime

MfaFactor:
  id: string (UUID)
  user_id: string (UUID)
  type: 'totp' | 'sms' | 'email' | 'webauthn'
  name: string                          # User-assigned friendly name
  enrolled_at: datetime
  last_used_at: datetime
  verified: boolean

LoginHistoryEntry:
  id: string (UUID)
  user_id: string (UUID)
  timestamp: datetime
  ip_address: string
  user_agent: string
  method: string                        # password, sso, magic_link, api_key, etc.
  provider: string                      # Identity provider used (if SSO)
  success: boolean
  failure_reason: string                # If success=false: invalid_password, user_locked, user_banned, mfa_failed, etc.
  location: LocationInfo                # Derived from IP (optional)

LocationInfo:
  country: string
  region: string
  city: string

LoginHistoryResponse:
  data: LoginHistoryEntry[]
  pagination: Pagination

BulkCreateResult:
  created: User[]
  failed: BulkError[]
  total_requested: integer
  total_created: integer
  total_failed: integer

BulkDeleteResult:
  deleted_ids: string[]
  failed: BulkError[]
  total_requested: integer
  total_deleted: integer
  total_failed: integer

BulkStatusResult:
  updated_ids: string[]
  failed: BulkError[]
  total_requested: integer
  total_updated: integer
  total_failed: integer

BulkError:
  identifier: string                   # Email or user ID that failed
  error_code: string
  error_message: string

ExportResult:
  job_id: string                        # Async job ID
  status: 'pending' | 'processing' | 'completed' | 'failed'
  download_url: string                  # Available when status=completed
  total_users: integer
  format: 'csv' | 'json'
  created_at: datetime
  completed_at: datetime

ImportOptions:
  format: 'csv' | 'json'
  password_hash_algorithm: 'bcrypt' | 'argon2' | 'scrypt' | 'sha256' | 'plaintext'
  conflict_resolution: 'skip' | 'overwrite' | 'merge'
  dry_run: boolean                      # Validate without importing
  send_welcome_email: boolean
  default_role: string

ImportResult:
  job_id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  total_rows: integer
  imported: integer
  skipped: integer
  failed: integer
  errors: BulkError[]

PasswordPolicy:
  min_length: integer                   # Default: 8
  max_length: integer                   # Default: 128
  require_uppercase: boolean            # Default: true
  require_lowercase: boolean            # Default: true
  require_numbers: boolean              # Default: true
  require_symbols: boolean              # Default: false
  max_age_days: integer                 # 0 = no expiry. Default: 0
  history_count: integer                # Prevent reuse of last N passwords. Default: 0
  breach_detection_enabled: boolean     # Check against breached password databases. Default: false
  lockout_threshold: integer            # Failed attempts before locking. Default: 10
  lockout_duration_minutes: integer     # Lock duration. Default: 30

Session:
  id: string (UUID)
  user_id: string (UUID)
  ip_address: string
  user_agent: string
  device_info: string
  created_at: datetime
  last_active_at: datetime
  expires_at: datetime
  is_impersonation: boolean
  impersonator_id: string               # Set if session is an impersonation session
```

### Events (for Webhooks)

| Event | When Triggered |
|-------|----------------|
| `user.created` | A new user is created |
| `user.updated` | User profile is updated |
| `user.deleted` | User is soft-deleted |
| `user.status_changed` | User status changes (active, inactive, suspended, etc.) |
| `user.banned` | User is banned |
| `user.unbanned` | User ban is removed |
| `user.locked` | User account is locked (manual or automatic) |
| `user.unlocked` | User account is unlocked |
| `user.email_verified` | User email is verified |
| `user.phone_verified` | User phone is verified |
| `user.password_changed` | User password is changed |
| `user.password_reset` | Password reset is initiated |
| `user.mfa_enrolled` | User enrolls a new MFA factor |
| `user.mfa_removed` | MFA factor is removed |
| `user.identity_linked` | External identity is linked to user |
| `user.identity_unlinked` | External identity is unlinked from user |
| `user.login_succeeded` | User successfully logs in |
| `user.login_failed` | Login attempt fails |
| `user.sessions_revoked` | All user sessions are revoked |
| `user.metadata_updated` | User metadata is updated (public or private) |
| `users.bulk_created` | Bulk user creation completes |
| `users.bulk_deleted` | Bulk user deletion completes |
| `users.exported` | User export job completes |
| `users.imported` | User import job completes |

### Error Scenarios

| Error | HTTP Status | SDK Exception (Python / TS / Java) | Trigger |
|-------|-------------|-------------------------------------|---------|
| User not found | 404 | `NotFoundError` / `NotFoundError` / `NotFoundException` | Get/update/delete non-existent user |
| Email already exists | 409 | `ValidationError` / `ValidationError` / `ValidationException` | Create user with existing email in tenant |
| User is banned | 403 | `UserBannedError` / `UserBannedError` / `UserBannedException` | Banned user attempts to authenticate |
| User is locked | 403 | `UserLockedError` / `UserLockedError` / `UserLockedException` | Locked user attempts to authenticate |
| Invalid password | 400 | `ValidationError` / `ValidationError` / `ValidationException` | Password does not meet policy |
| Breached password | 400 | `BreachedPasswordError` / `BreachedPasswordError` / `BreachedPasswordException` | Password found in breach database |
| Identity already linked | 409 | `IdentityAlreadyLinkedError` / `IdentityAlreadyLinkedError` / `IdentityAlreadyLinkedException` | Linking a provider already linked to another user |
| MFA factor not found | 404 | `NotFoundError` / `NotFoundError` / `NotFoundException` | Deleting non-existent MFA factor |
| Bulk operation partial failure | 207 | `BulkOperationPartialError` / `BulkOperationPartialError` / `BulkOperationPartialException` | Some items in bulk operation fail |
| Import format error | 400 | `ValidationError` / `ValidationError` / `ValidationException` | Malformed import file |
| Export job not ready | 202 | (Not an error -- return `ExportResult` with status) | Export still processing |

### Cross-Language Notes

- **Python**: Use `UserStatus` enum with added `BANNED` member. `public_metadata` and `private_metadata` as `dict[str, Any]`. Bulk methods return dataclass results. Import/export use file-like objects or paths.
- **TypeScript**: Use union type `UserStatus = '...' | 'banned'`. Metadata typed as `Record<string, unknown>`. Bulk operations return typed result objects. Import accepts `ReadableStream | Buffer | string` (file path).
- **Java**: Add `BANNED` to `UserStatus` enum. Metadata as `Map<String, Object>`. Bulk results use Builder pattern. Import accepts `InputStream` or `Path`. Consider `CompletableFuture` for async import/export operations.
- **Backward compatibility**: The existing `metadata` field must remain functional as an alias for `public_metadata` for at least two major versions. Emit a deprecation warning in all SDKs when `metadata` is used directly.

---

## 2. Roles & Permissions Module (Enhanced)

### Overview

The Roles & Permissions module provides Role-Based Access Control (RBAC) with role hierarchy, wildcard permissions, and tenant scoping. Enhancements add resource-scoped permissions, conditional/contextual authorization, permission groups, role templates, and batch permission operations to achieve competitive parity with Auth0 FGA, WorkOS FGA, and Clerk Organizations.

**Value Proposition**: A comprehensive authorization layer that starts with simple RBAC and scales to fine-grained, resource-scoped authorization -- without requiring customers to adopt a separate FGA service.

### Current Capabilities (Already Implemented)

- Role CRUD (create, get, update, delete)
- Permission assignment/revocation to roles (via role update)
- Role assignment/revocation to users (assignRole, removeRole)
- Permission checking (checkPermission, hasPermission, getEffectivePermissions)
- Role hierarchy with levels (0=super_admin through 40=guest)
- Wildcard permissions (`*:*`, `users:*`)
- Tenant-scoped roles (optional `tenant_id`)
- System roles (immutable built-in roles)
- Time-limited role assignments (`expires_at` on RoleAssignment)
- Client-side permission matching utilities (matchesPermission, hasAnyPermission, hasAllPermissions)
- Permission format: `resource:action` (e.g., `users:read`, `teams:*`)

### Competitive Analysis

#### Auth0
- **Core RBAC**: Roles with permissions, role assignment to users, permission claim injection into access tokens.
- **Permission scopes**: Permissions defined at the API level. Access tokens include a `permissions` claim with scoped permissions.
- **Fine-Grained Authorization (FGA)**: Separate product (Auth0 FGA / OpenFGA) based on Google Zanzibar. Supports relationship-based access control (ReBAC), attribute-based access control (ABAC), and traditional RBAC. Uses a tuple-based model: `(user, relation, object)`.
- **Organization-scoped roles**: Roles can be scoped to Auth0 Organizations for B2B multi-tenant apps.
- **Permission namespacing**: Permissions are namespaced to specific APIs/resource servers.

#### Clerk
- **Organization roles**: Roles scoped to organizations with per-org permissions.
- **System roles**: `org:admin` and `org:member` as default roles per organization.
- **Custom permissions**: Define custom permissions and assign them to organization roles.
- **Token claims**: Organization roles and permissions embedded in session tokens.
- **Simple RBAC model**: Focused on organization-level RBAC rather than fine-grained resource-level authorization.

#### WorkOS
- **Coarse-grained RBAC**: Organization-level roles and permissions embedded in access tokens via AuthKit.
- **Fine-Grained Authorization (FGA)**: Separate service based on Google Zanzibar (via acquired Warrant technology). Supports schema-defined authorization models, warrants (tuples), and permission checks via API.
- **Resource-scoped permissions**: Roles can include child-type permissions that propagate to child resources.
- **Feature entitlements**: FGA used for feature gating and entitlement checks.
- **Schema language**: Intuitive schema language for defining authorization models (resource types, relations, rules).

#### Firebase Auth
- **Custom claims**: JSON payload on user tokens (max 1000 bytes) for embedding roles and permissions.
- **Security Rules integration**: Custom claims usable in Firestore/Storage security rules for authorization.
- **No built-in RBAC**: Relies on custom claims + security rules for RBAC. Developers must implement role management logic themselves.

#### Supabase Auth
- **Row-Level Security (RLS)**: Postgres-native authorization at the database level.
- **Custom claims + RBAC**: Community extension for custom claims and RBAC via RLS policies.
- **Helper functions**: `auth.uid()` and `auth.jwt()` for use in RLS policies.
- **No built-in role management**: Roles managed via custom claims or application-level tables. Authorization enforced via RLS policies.

### Requirements

#### Core Features (Must Have) -- P0

##### 2.1 Resource-Scoped Permissions

Extend the permission model to support resource-instance-level authorization. Currently, permissions are in `resource:action` format (e.g., `users:read`). Extend to support `resource:action:instance` for checking access to specific resource instances.

- `checkPermission(userId, permission, resourceId?)` -- Check if user has permission on a specific resource instance
- `grantResourcePermission(userId, permission, resourceId)` -- Grant permission on a specific resource instance
- `revokeResourcePermission(userId, permission, resourceId)` -- Revoke permission on a specific resource instance
- `listResourcePermissions(userId, resource, resourceId)` -- List all permissions a user has on a specific resource

Extended permission format: `resource:action` (global) or `resource:action:instance_id` (resource-scoped)

Model:
```
ResourcePermission:
  id: string (UUID)
  user_id: string (UUID)
  permission: string             # e.g., "documents:edit"
  resource_id: string            # e.g., "doc-123"
  resource_type: string          # e.g., "documents"
  granted_at: datetime
  granted_by: string (UUID)
  expires_at: datetime           # Optional expiry
```

##### 2.2 Permission Groups

Allow grouping of related permissions for easier management. Instead of assigning individual permissions, assign permission groups to roles.

- `createPermissionGroup(request)` -- Create a permission group
- `updatePermissionGroup(groupId, request)` -- Update a permission group
- `deletePermissionGroup(groupId)` -- Delete a permission group
- `listPermissionGroups(params?)` -- List permission groups
- `getPermissionGroup(groupId)` -- Get a permission group by ID

Model:
```
PermissionGroup:
  id: string (UUID)
  tenant_id: string (UUID)       # Optional, for tenant-specific groups
  name: string                   # e.g., "User Management"
  slug: string                   # e.g., "user-management"
  description: string
  permissions: string[]          # e.g., ["users:read", "users:write", "users:delete"]
  is_system: boolean
  created_at: datetime
  updated_at: datetime
```

##### 2.3 Batch Permission Checks

Add the ability to check multiple permissions in a single API call for performance.

- `checkPermissions(userId, permissions: string[])` -- Check multiple permissions at once
- `checkPermissionsBatch(checks: PermissionCheckRequest[])` -- Check permissions for multiple users/permissions in one call

Returns:
```
BatchPermissionCheckResult:
  results: PermissionCheckResponse[]    # One per input check
  all_allowed: boolean                  # True if all checks passed
  any_allowed: boolean                  # True if any check passed
```

##### 2.4 Role Templates

Provide predefined role templates for common use cases that customers can clone and customize.

- `listRoleTemplates()` -- List available templates
- `getRoleTemplate(templateId)` -- Get a specific template
- `createRoleFromTemplate(templateId, overrides?)` -- Create a role based on a template with optional overrides

Model:
```
RoleTemplate:
  id: string
  name: string                   # e.g., "Content Editor", "Billing Admin", "Support Agent"
  slug: string
  description: string
  permissions: string[]
  hierarchy_level: integer
  category: string               # e.g., "content", "billing", "support", "engineering"
```

Built-in templates:
- `content-editor`: `["content:read", "content:write", "content:publish"]`
- `content-viewer`: `["content:read"]`
- `billing-admin`: `["billing:read", "billing:write", "subscriptions:manage"]`
- `support-agent`: `["users:read", "tickets:read", "tickets:write", "tickets:manage"]`
- `api-developer`: `["apikeys:read", "apikeys:write", "webhooks:read", "webhooks:write"]`

##### 2.5 Effective Permission Resolution with Explanation

Enhance the permission check response to include a full explanation of how a permission was resolved, for debugging and audit purposes.

- `explainPermission(userId, permission, resourceId?)` -- Returns a detailed explanation of the permission decision

Model:
```
PermissionExplanation:
  allowed: boolean
  user_id: string
  permission: string
  resource_id: string
  resolution_chain: ResolutionStep[]    # Ordered steps showing how the decision was made
  evaluated_at: datetime

ResolutionStep:
  source: 'role' | 'direct_grant' | 'resource_permission' | 'hierarchy' | 'wildcard' | 'denial'
  role_id: string                       # If source is 'role'
  role_name: string
  permission_matched: string            # The specific permission that matched (may be wildcard)
  result: 'allowed' | 'denied' | 'not_applicable'
  reason: string                        # Human-readable explanation
```

##### 2.6 Conditional / Contextual Permissions

Extend the existing `context` field on PermissionCheckRequest to support attribute-based conditions on permissions.

- Permissions can have conditions: `{ permission: "orders:approve", condition: { "amount_lt": 10000 } }`
- Context is passed at check time: `checkPermission(userId, "orders:approve", null, { amount: 5000 })`
- Conditions are evaluated server-side

Supported condition operators:
- `eq`, `neq`: Equality / inequality
- `gt`, `gte`, `lt`, `lte`: Numeric comparisons
- `in`, `not_in`: Set membership
- `contains`, `starts_with`, `ends_with`: String operations
- `between`: Range check

Model:
```
ConditionalPermission:
  permission: string
  conditions: PermissionCondition[]

PermissionCondition:
  field: string                  # Context field to evaluate
  operator: string               # eq, neq, gt, gte, lt, lte, in, not_in, contains, between
  value: any                     # Expected value or values
```

#### Enhanced Features (Should Have) -- P1

##### 2.7 Permission Denials (Negative Permissions)

Add the ability to explicitly deny specific permissions, overriding any grants. Denials take precedence over allows.

- `denyPermission(userId, permission, resourceId?)` -- Explicitly deny a permission
- `removeDenial(userId, permission, resourceId?)` -- Remove an explicit denial
- `listDenials(userId)` -- List all explicit denials for a user

Model:
```
PermissionDenial:
  id: string (UUID)
  user_id: string (UUID)
  permission: string
  resource_id: string            # Optional
  reason: string
  denied_by: string (UUID)
  denied_at: datetime
  expires_at: datetime           # Optional, for temporary denials
```

Evaluation order: Explicit denials > Resource-scoped grants > Role grants > Wildcard grants.

##### 2.8 Role Cloning

Add the ability to clone an existing role as a starting point for a new role.

- `cloneRole(roleId, newSlug, overrides?)` -- Clone a role with a new slug and optional property overrides

##### 2.9 Permission Audit Log

Provide a queryable log of all permission-related changes.

- `getPermissionAuditLog(params?)` -- Query permission change history
- Tracks: role created/updated/deleted, permission granted/revoked, role assigned/removed, resource permission changes

Model:
```
PermissionAuditEntry:
  id: string (UUID)
  action: string                 # role_created, role_updated, permission_granted, etc.
  actor_id: string (UUID)        # Who performed the action
  target_type: string            # user, role, permission_group
  target_id: string (UUID)
  changes: Record<string, any>   # Before/after values
  timestamp: datetime
  ip_address: string
```

##### 2.10 Organization-Scoped Roles

Allow roles to be scoped to specific organizations/tenants, with the ability to have different role definitions per organization.

- The existing `tenant_id` field on Role already supports this, but add explicit support for:
- `listRoles(tenantId?)` -- Filter roles by tenant, including system roles
- Role inheritance across tenants: system roles (tenant_id=null) are available to all tenants
- Tenant-specific role overrides: tenants can create custom roles that extend or replace system roles

#### Future Features (Nice to Have) -- P2

##### 2.11 Relationship-Based Access Control (ReBAC)

Add a lightweight ReBAC model inspired by Google Zanzibar / OpenFGA for complex authorization scenarios.

- `createRelation(subject, relation, object)` -- Create a relationship tuple
- `deleteRelation(subject, relation, object)` -- Delete a relationship tuple
- `checkRelation(subject, relation, object)` -- Check if a relationship exists (with transitive resolution)
- `listRelations(subject?, relation?, object?)` -- List relationships

This would be a separate sub-module (`permissions.relations`) and is primarily for customers who need document-level, folder-level, or team-level access control beyond simple RBAC.

Model:
```
Relation:
  id: string (UUID)
  subject_type: string           # e.g., "user", "team", "role"
  subject_id: string
  relation: string               # e.g., "owner", "editor", "viewer", "member"
  object_type: string            # e.g., "document", "folder", "project"
  object_id: string
  created_at: datetime
  created_by: string (UUID)
```

##### 2.12 Feature Entitlements

Use the permission system for feature gating and entitlement checks.

- `checkEntitlement(tenantId, feature)` -- Check if a tenant has access to a feature
- `grantEntitlement(tenantId, feature, options?)` -- Grant feature access
- `revokeEntitlement(tenantId, feature)` -- Revoke feature access
- `listEntitlements(tenantId)` -- List all entitlements for a tenant

Model:
```
Entitlement:
  id: string (UUID)
  tenant_id: string (UUID)
  feature: string                # e.g., "advanced-analytics", "sso", "audit-log"
  plan: string                   # Associated plan (free, pro, enterprise)
  granted_at: datetime
  expires_at: datetime
  usage_limit: integer           # Optional usage cap
  usage_count: integer           # Current usage
```

### API Surface

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `list(params?)` | List roles | `ListRolesParams` | `RoleListResponse` |
| `get(roleId)` | Get role by ID | `roleId: string` | `Role` |
| `getBySlug(slug)` | Get role by slug | `slug: string` | `Role` |
| `create(request)` | Create a role | `CreateRoleRequest` | `Role` |
| `update(roleId, request)` | Update a role | `roleId, UpdateRoleRequest` | `Role` |
| `delete(roleId)` | Delete a role | `roleId: string` | `void` |
| `cloneRole(roleId, newSlug, overrides?)` | Clone a role | `roleId, newSlug, overrides?` | `Role` |
| `getUserRoles(userId)` | Get user roles | `userId: string` | `RoleAssignment[]` |
| `assignRole(userId, request)` | Assign role to user | `userId, AssignRoleRequest` | `RoleAssignment` |
| `removeRole(userId, roleId)` | Remove role from user | `userId, roleId: string` | `void` |
| `checkPermission(userId, permission, resourceId?, context?)` | Check single permission | `userId, permission, resourceId?, context?` | `PermissionCheckResponse` |
| `checkPermissions(userId, permissions)` | Check multiple permissions | `userId, string[]` | `BatchPermissionCheckResult` |
| `checkPermissionsBatch(checks)` | Batch permission check | `PermissionCheckRequest[]` | `BatchPermissionCheckResult` |
| `explainPermission(userId, permission, resourceId?)` | Explain permission decision | `userId, permission, resourceId?` | `PermissionExplanation` |
| `getEffectivePermissions(userId)` | Get all user permissions | `userId: string` | `UserPermissions` |
| `grantResourcePermission(userId, permission, resourceId)` | Grant resource permission | `userId, permission, resourceId` | `ResourcePermission` |
| `revokeResourcePermission(userId, permission, resourceId)` | Revoke resource permission | `userId, permission, resourceId` | `void` |
| `listResourcePermissions(userId, resource, resourceId)` | List resource permissions | `userId, resource, resourceId` | `ResourcePermission[]` |
| `denyPermission(userId, permission, resourceId?)` | Deny a permission | `userId, permission, resourceId?` | `PermissionDenial` |
| `removeDenial(userId, permission, resourceId?)` | Remove denial | `userId, permission, resourceId?` | `void` |
| `listDenials(userId)` | List denials | `userId: string` | `PermissionDenial[]` |
| `createPermissionGroup(request)` | Create permission group | `CreatePermissionGroupRequest` | `PermissionGroup` |
| `updatePermissionGroup(groupId, request)` | Update permission group | `groupId, UpdatePermissionGroupRequest` | `PermissionGroup` |
| `deletePermissionGroup(groupId)` | Delete permission group | `groupId: string` | `void` |
| `listPermissionGroups(params?)` | List permission groups | `ListPermissionGroupsParams` | `PermissionGroupListResponse` |
| `listRoleTemplates()` | List role templates | None | `RoleTemplate[]` |
| `createRoleFromTemplate(templateId, overrides?)` | Create role from template | `templateId, overrides?` | `Role` |
| `getPermissionAuditLog(params?)` | Query permission audit log | `AuditLogParams` | `PermissionAuditResponse` |

### Models

All new models are defined in the Requirements section above. Summary of additions to the existing permission model:

- `ResourcePermission` -- Instance-level permission grant
- `PermissionGroup` -- Grouping of related permissions
- `PermissionDenial` -- Explicit permission denial
- `BatchPermissionCheckResult` -- Result of batch permission check
- `PermissionExplanation` / `ResolutionStep` -- Permission decision explanation
- `ConditionalPermission` / `PermissionCondition` -- Conditional permission rules
- `RoleTemplate` -- Predefined role template
- `PermissionAuditEntry` -- Permission change audit log entry
- `Relation` -- ReBAC relationship tuple (P2)
- `Entitlement` -- Feature entitlement (P2)

### Events (for Webhooks)

| Event | When Triggered |
|-------|----------------|
| `role.created` | A new role is created |
| `role.updated` | Role properties or permissions are modified |
| `role.deleted` | A role is deleted |
| `role.cloned` | A role is cloned |
| `role.assigned` | A role is assigned to a user |
| `role.removed` | A role is removed from a user |
| `role.expired` | A time-limited role assignment expires |
| `permission.granted` | A resource-scoped permission is granted |
| `permission.revoked` | A resource-scoped permission is revoked |
| `permission.denied` | An explicit permission denial is created |
| `permission.denial_removed` | An explicit denial is removed |
| `permission_group.created` | A permission group is created |
| `permission_group.updated` | A permission group is updated |
| `permission_group.deleted` | A permission group is deleted |
| `entitlement.granted` | A feature entitlement is granted (P2) |
| `entitlement.revoked` | A feature entitlement is revoked (P2) |
| `entitlement.expired` | A feature entitlement expires (P2) |

### Error Scenarios

| Error | HTTP Status | SDK Exception (Python / TS / Java) | Trigger |
|-------|-------------|-------------------------------------|---------|
| Role not found | 404 | `RoleNotFoundError` / `RoleNotFoundError` / `RoleNotFoundException` | Get/update/delete non-existent role |
| Role slug exists | 409 | `RoleSlugExistsError` / `RoleSlugExistsError` / `RoleSlugExistsException` | Create role with existing slug in tenant |
| System role modification | 403 | `SystemRoleError` / `SystemRoleError` / `SystemRoleException` | Attempt to modify/delete a system role |
| Role in use | 409 | `RoleInUseError` / `RoleInUseError` / `RoleInUseException` | Delete role still assigned to users |
| Role already assigned | 409 | `RoleAlreadyAssignedError` / `RoleAlreadyAssignedError` / `RoleAlreadyAssignedException` | Assign role already held by user |
| Permission group not found | 404 | `NotFoundError` / `NotFoundError` / `NotFoundException` | Get/update/delete non-existent group |
| Invalid permission format | 400 | `ValidationError` / `ValidationError` / `ValidationException` | Permission string not in `resource:action` format |
| Invalid condition | 400 | `ValidationError` / `ValidationError` / `ValidationException` | Condition operator or value is invalid |
| Circular hierarchy | 400 | `ValidationError` / `ValidationError` / `ValidationException` | Role hierarchy creates a circular dependency |
| Template not found | 404 | `NotFoundError` / `NotFoundError` / `NotFoundException` | Create role from non-existent template |

### Cross-Language Notes

- **Python**: Permission matching utilities (`matches_permission`, `has_any_permission`, `has_all_permissions`) remain as standalone functions. New conditional evaluation should use a `ConditionEvaluator` class. `PermissionExplanation` as a frozen dataclass.
- **TypeScript**: Maintain exported utility functions for client-side permission checking. Add `PermissionChecker` class for complex evaluations. Use discriminated union types for `ResolutionStep.source`. `BatchPermissionCheckResult` should include `.isAllowed()` and `.isAnyAllowed()` helper methods.
- **Java**: Add `PermissionChecker` utility class with builder pattern for constructing complex checks. `ResourcePermission` and `PermissionDenial` as immutable records (Java 17+). Use `Optional<String>` for nullable fields in check results. Consider a fluent API: `permissions.check(userId).hasPermission("users:read").onResource("doc-123").withContext(ctx).execute()`.
- **Client-side utilities**: All three SDKs should include client-side permission matching functions that work without API calls, for UI-level permission checks using the permission list from the user's session/token.

---

## 3. User Impersonation Module (New)

### Overview

The User Impersonation module enables administrators and support staff to assume the identity of any user within the platform for debugging, support, and administrative purposes. Impersonation creates a separate, auditable session that is clearly distinguishable from regular user sessions.

**Value Proposition**: An essential support and debugging tool that most companies build in-house. Providing it out-of-the-box eliminates weeks of custom development, ensures security best practices (full audit trail, time-limited sessions, mandatory justification), and delivers competitive parity with Clerk and WorkOS, both of which feature impersonation prominently.

**Priority**: P3

### Competitive Analysis

#### Auth0
- **Status**: Auth0 deprecated its built-in impersonation feature. The community has been vocal about this gap, and developers resort to workarounds using Actions and custom claims.
- **Workaround pattern**: Admin's JWT is modified via an Action to include an `act` (actor) claim containing the impersonated user's ID. The application then treats the admin as the target user based on the claim.
- **Recent development**: Auth0 announced user authentication for AI agents with support for linking, impersonation, and delegation (April 2025), suggesting a return of impersonation as a feature.

#### Clerk
- **Status**: Fully supported, first-class feature. Clerk positions impersonation as one of its most-loved features post-launch.
- **Implementation**: Uses an "actor token" system. An admin requests an actor token for a target user. The token is used to create a session as the target user. The session JWT includes an `act` claim with the impersonator's user ID and session ID.
- **Security**: Impersonation sessions are automatically logged. `getAuth()` returns an `actor` field when the session is impersonated. Sessions are distinguishable from regular sessions via API and UI helpers.
- **Audit**: All impersonation sessions are visible in the Session List API. Full audit trail of who impersonated whom and when.
- **Dashboard support**: Admins can impersonate directly from the Clerk dashboard.

#### WorkOS
- **Status**: Fully supported, launched as a headline feature in Spring 2024 Launch Week.
- **Implementation**: No additional code required once integrated with WorkOS sessions. Admins initiate impersonation from the WorkOS dashboard. The authentication response includes an `impersonator` field with the impersonator's email and mandatory justification reason.
- **Session token**: Access tokens include an `act` claim with the impersonator's email as the `sub` claim.
- **Time limit**: Impersonation sessions automatically expire after 60 minutes.
- **Justification**: Mandatory -- support staff must provide a reason when requesting impersonation.
- **Events**: `session.created` events include `impersonator` object with email and reason.
- **UI component**: Pre-built `Impersonation` component for React/Next.js that displays a warning banner when a user is being impersonated.

#### Firebase Auth
- **Status**: No built-in impersonation feature. Developers implement custom solutions using custom tokens or custom claims.

#### Supabase Auth
- **Status**: No built-in impersonation feature. Developers implement custom solutions using service role keys to generate tokens for target users.

### Requirements

#### Core Features (Must Have) -- P0

##### 3.1 Impersonation Session Creation

Allow authorized administrators to create an impersonation session for a target user.

- `startImpersonation(request)` -- Start impersonating a target user. Returns an impersonation session with tokens.

```
StartImpersonationRequest:
  target_user_id: string (UUID)          # Required: the user to impersonate
  reason: string                         # Required: justification for impersonation
  duration_minutes: integer              # Optional: session duration (default: 60, max: 480)
  scopes: string[]                       # Optional: restrict impersonation to specific scopes
  notify_user: boolean                   # Optional: send notification to target user (default: false)
```

The caller must have the `users:impersonate` permission. Only users with a hierarchy level lower than (more privileged than) the target user can impersonate them. Super admins cannot be impersonated.

Returns:
```
ImpersonationSession:
  id: string (UUID)                      # Unique impersonation session ID
  impersonator_id: string (UUID)         # The admin performing impersonation
  impersonator_email: string             # Admin's email (for logging/display)
  target_user_id: string (UUID)          # The user being impersonated
  target_user_email: string              # Target user's email
  access_token: string                   # JWT with act claim
  refresh_token: string                  # Refresh token (optional, may be disabled for impersonation)
  reason: string                         # Justification provided
  scopes: string[]                       # Restricted scopes (if any)
  started_at: datetime                   # When impersonation started
  expires_at: datetime                   # When session auto-expires
  status: ImpersonationStatus            # active, ended, expired
```

##### 3.2 Impersonation Session Termination

Allow the impersonator to end the session early, returning to their own identity.

- `endImpersonation(sessionId)` -- End an active impersonation session. Revokes the impersonation tokens.

##### 3.3 Active Impersonation Detection

Allow the application to detect whether the current session is an impersonation session and retrieve the impersonator's identity.

- `getImpersonationContext()` -- Returns impersonation context for the current session (or null if not impersonating).
- The JWT access token must include an `act` (actor) claim per RFC 8693 (Token Exchange) containing the impersonator's identity.

JWT `act` claim structure:
```json
{
  "sub": "target-user-id",
  "act": {
    "sub": "impersonator-user-id",
    "email": "admin@example.com",
    "session_id": "imp-session-id"
  }
}
```

Returns:
```
ImpersonationContext:
  is_impersonation: boolean
  impersonator_id: string (UUID)
  impersonator_email: string
  session_id: string (UUID)
  reason: string
  started_at: datetime
  expires_at: datetime
  scopes: string[]
```

##### 3.4 Impersonation Audit Trail

All impersonation activity must be fully auditable.

- `listImpersonationSessions(params?)` -- List all impersonation sessions (for audit purposes)
- `getImpersonationSession(sessionId)` -- Get details of a specific impersonation session

```
ListImpersonationSessionsParams:
  impersonator_id: string               # Filter by admin
  target_user_id: string                # Filter by target user
  status: ImpersonationStatus           # Filter by status
  started_after: datetime               # Date range filter
  started_before: datetime
  page: integer
  page_size: integer
  sort: string                          # Default: "-started_at"
```

Returns:
```
ImpersonationSessionListResponse:
  data: ImpersonationSession[]
  pagination: Pagination
```

##### 3.5 Impersonation Restrictions

Built-in safeguards to prevent misuse.

- Super admins (`hierarchy_level: 0`) cannot be impersonated
- Users can only impersonate users with a higher hierarchy level (less privileged) than their own
- Maximum session duration is configurable (default: 60 minutes, max: 480 minutes / 8 hours)
- Mandatory justification reason (minimum 10 characters)
- Rate limiting: maximum 10 impersonation sessions per admin per hour
- Concurrent impersonation limit: an admin can have at most 1 active impersonation session
- Impersonation sessions do not grant the ability to impersonate other users (no transitive impersonation)
- Impersonation sessions cannot modify the target user's authentication credentials (password, MFA)

Configuration:
```
ImpersonationConfig:
  enabled: boolean                       # Default: true
  max_duration_minutes: integer          # Default: 60
  require_reason: boolean                # Default: true
  min_reason_length: integer             # Default: 10
  notify_target_user: boolean            # Default: false
  rate_limit_per_hour: integer           # Default: 10
  allowed_roles: string[]               # Roles that can impersonate (default: ["super_admin", "admin"])
  restricted_actions: string[]          # Actions not allowed during impersonation
  log_all_actions: boolean              # Log every action taken during impersonation (default: true)
```

#### Enhanced Features (Should Have) -- P1

##### 3.6 Scope Restriction

Allow impersonation sessions to be restricted to specific functional scopes, limiting what the impersonator can do as the target user.

- `startImpersonation({ ..., scopes: ["read_only"] })` -- Restrict to read-only operations
- Predefined scopes:
  - `read_only` -- Can only perform read operations
  - `support` -- Can read and perform support-related write operations
  - `full_access` -- Full access (default, but excludes credential changes)
- Custom scopes can be defined as permission sets

##### 3.7 Target User Notification

Optionally notify the target user when they are being impersonated.

- When `notify_user: true`, send a notification (email and/or in-app) to the target user
- Notification includes: who is impersonating them, the reason, and when the session started
- Configurable at the tenant level whether notification is mandatory

##### 3.8 Impersonation Action Log

Log every action the impersonator takes during the impersonation session, linked to the impersonation session ID.

- `getImpersonationActionLog(sessionId, params?)` -- Get all actions taken during an impersonation session

```
ImpersonationActionEntry:
  id: string (UUID)
  session_id: string (UUID)             # Impersonation session ID
  action: string                        # API method invoked
  resource_type: string                 # Resource type accessed
  resource_id: string                   # Resource ID accessed
  method: string                        # HTTP method
  path: string                          # API path
  timestamp: datetime
  ip_address: string
  response_status: integer              # HTTP response status
```

##### 3.9 Dashboard / Admin UI Support

Provide helper utilities for building impersonation UI in the admin dashboard.

- Pre-built UI indicators: SDK should provide helper methods or components to detect and display impersonation state
- `isImpersonating()` -- Quick boolean check
- `getImpersonationBanner()` -- Returns display data for an impersonation warning banner: impersonator name, target user name, time remaining, end button action

#### Future Features (Nice to Have) -- P2

##### 3.10 Impersonation Approval Workflow

Require approval from a second admin before impersonation is granted.

- `requestImpersonation(request)` -- Submit an impersonation request for approval
- `approveImpersonationRequest(requestId)` -- Approve the request
- `denyImpersonationRequest(requestId, reason)` -- Deny the request
- `listPendingRequests(params?)` -- List pending impersonation requests

```
ImpersonationRequest:
  id: string (UUID)
  requester_id: string (UUID)
  target_user_id: string (UUID)
  reason: string
  requested_duration_minutes: integer
  status: 'pending' | 'approved' | 'denied' | 'expired'
  reviewed_by: string (UUID)
  reviewed_at: datetime
  review_comment: string
  created_at: datetime
  expires_at: datetime                  # Request expires if not reviewed in time
```

##### 3.11 Impersonation Replay / Read-Only Mode

Allow admins to "shadow" a user's session in read-only mode without creating a full impersonation session. This would show the admin exactly what the user sees without the ability to take any actions.

- `startShadowSession(targetUserId, reason)` -- Start a read-only shadow session
- Shadow sessions generate read-only tokens that are rejected for any write operation

### API Surface

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `startImpersonation(request)` | Start impersonating a user | `StartImpersonationRequest` | `ImpersonationSession` |
| `endImpersonation(sessionId)` | End impersonation session | `sessionId: string` | `void` |
| `getImpersonationContext()` | Get current impersonation context | None | `ImpersonationContext \| null` |
| `isImpersonating()` | Check if currently impersonating | None | `boolean` |
| `getImpersonationSession(sessionId)` | Get session details | `sessionId: string` | `ImpersonationSession` |
| `listImpersonationSessions(params?)` | List impersonation sessions | `ListImpersonationSessionsParams` | `ImpersonationSessionListResponse` |
| `getImpersonationActionLog(sessionId, params?)` | Get actions during session | `sessionId, PaginationParams?` | `ImpersonationActionLogResponse` |
| `getImpersonationConfig(tenantId?)` | Get impersonation config | `tenantId?: string` | `ImpersonationConfig` |
| `updateImpersonationConfig(tenantId, config)` | Update impersonation config | `tenantId, ImpersonationConfig` | `ImpersonationConfig` |

### Models

All models are defined in the Requirements section above. Summary:

- `StartImpersonationRequest` -- Input for starting impersonation
- `ImpersonationSession` -- Full impersonation session details
- `ImpersonationContext` -- Current-session impersonation info
- `ImpersonationStatus` -- `'active' | 'ended' | 'expired'`
- `ImpersonationConfig` -- Tenant-level impersonation configuration
- `ImpersonationActionEntry` -- Action log entry during impersonation
- `ListImpersonationSessionsParams` -- Query parameters for session listing
- `ImpersonationSessionListResponse` -- Paginated session list
- `ImpersonationRequest` -- Approval workflow request (P2)

### Events (for Webhooks)

| Event | When Triggered |
|-------|----------------|
| `impersonation.started` | An impersonation session is created |
| `impersonation.ended` | An impersonation session is manually ended |
| `impersonation.expired` | An impersonation session expires due to time limit |
| `impersonation.action` | An action is taken during impersonation (if `log_all_actions` is enabled) |
| `impersonation.requested` | An impersonation approval request is created (P2) |
| `impersonation.approved` | An impersonation request is approved (P2) |
| `impersonation.denied` | An impersonation request is denied (P2) |

Event payload for `impersonation.started`:
```json
{
  "event": "impersonation.started",
  "data": {
    "session_id": "uuid",
    "impersonator_id": "uuid",
    "impersonator_email": "admin@example.com",
    "target_user_id": "uuid",
    "target_user_email": "user@example.com",
    "reason": "Investigating support ticket #12345",
    "started_at": "2026-02-06T10:00:00Z",
    "expires_at": "2026-02-06T11:00:00Z"
  }
}
```

### Error Scenarios

| Error | HTTP Status | SDK Exception (Python / TS / Java) | Trigger |
|-------|-------------|-------------------------------------|---------|
| Impersonation not enabled | 403 | `ImpersonationDisabledError` / `ImpersonationDisabledError` / `ImpersonationDisabledException` | Impersonation is disabled for the tenant |
| Insufficient privilege | 403 | `AuthorizationError` / `AuthorizationError` / `AuthorizationException` | Caller lacks `users:impersonate` permission |
| Cannot impersonate super admin | 403 | `ImpersonationForbiddenError` / `ImpersonationForbiddenError` / `ImpersonationForbiddenException` | Attempting to impersonate a super admin |
| Cannot impersonate higher privilege | 403 | `ImpersonationForbiddenError` / `ImpersonationForbiddenError` / `ImpersonationForbiddenException` | Attempting to impersonate a user with equal or lower hierarchy level |
| Reason too short | 400 | `ValidationError` / `ValidationError` / `ValidationException` | Reason is shorter than `min_reason_length` |
| Rate limit exceeded | 429 | `RateLimitError` / `RateLimitError` / `RateLimitException` | Admin exceeded hourly impersonation limit |
| Concurrent session limit | 409 | `ImpersonationConflictError` / `ImpersonationConflictError` / `ImpersonationConflictException` | Admin already has an active impersonation session |
| Session not found | 404 | `NotFoundError` / `NotFoundError` / `NotFoundException` | Get/end non-existent session |
| Session already ended | 409 | `ImpersonationConflictError` / `ImpersonationConflictError` / `ImpersonationConflictException` | Attempting to end an already-ended session |
| Target user not found | 404 | `NotFoundError` / `NotFoundError` / `NotFoundException` | Impersonating non-existent user |
| Target user banned/deleted | 400 | `ValidationError` / `ValidationError` / `ValidationException` | Impersonating a banned or deleted user |
| Transitive impersonation | 403 | `ImpersonationForbiddenError` / `ImpersonationForbiddenError` / `ImpersonationForbiddenException` | Attempting to impersonate while already impersonating |
| Restricted action | 403 | `ImpersonationRestrictedActionError` / `ImpersonationRestrictedActionError` / `ImpersonationRestrictedActionException` | Performing a restricted action during impersonation |
| Duration exceeds max | 400 | `ValidationError` / `ValidationError` / `ValidationException` | Requested duration exceeds `max_duration_minutes` |

### Cross-Language Notes

- **Python**: `ImpersonationClient` as a separate client class (like `UserClient`, `RoleClient`). `ImpersonationContext` as a frozen dataclass. `is_impersonating()` as a classmethod that inspects the current token. JWT `act` claim parsing should use the existing `auth` module's token parsing utilities.
- **TypeScript**: `ImpersonationClient` class with async methods. `ImpersonationContext` as a readonly interface. Provide a middleware helper `withImpersonationCheck(handler)` for Express/Next.js that injects impersonation context into the request. Export `isImpersonating(session)` and `getActor(session)` utility functions.
- **Java**: `ImpersonationClient` class with Builder pattern for `StartImpersonationRequest`. `ImpersonationContext` as an immutable record. Provide a `ImpersonationFilter` (Servlet filter) or Spring `HandlerInterceptor` that extracts impersonation context from the JWT. `ImpersonationSession` as an immutable class with `isActive()`, `isExpired()`, `getTimeRemaining()` convenience methods.
- **Token handling**: All three SDKs must include JWT `act` claim parsing in their auth token utilities. The `act` claim follows the RFC 8693 delegation/impersonation pattern.
- **Security**: The impersonation module should NOT expose the target user's password hash, MFA secrets, or other authentication credentials to the impersonator. Impersonation tokens must be clearly distinguishable from regular tokens for audit purposes.

---

## Appendix A: Competitor Feature Matrix

### Users Module Feature Comparison

| Feature | Our SDK (Current) | Our SDK (Proposed) | Auth0 | Clerk | WorkOS | Firebase | Supabase |
|---------|-------------------|-------------------|-------|-------|--------|----------|----------|
| User CRUD | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Pagination & filtering | Yes | Yes | Yes | Yes | Yes | Limited | Yes |
| User search | Yes | Yes | Yes | Yes | Yes | By email/UID | Limited |
| Profile management | Yes | Yes | Yes | Yes | Yes | Limited | Via metadata |
| Status management | Yes | Yes | Yes | Yes | Yes | enable/disable | Via metadata |
| User banning | No | **P0** | blocked field | Yes | No | No | No |
| User locking | No | **P0** | No | Yes | No | No | No |
| Dual metadata | No (single) | **P0** | Yes | Yes (3 types) | Limited | Custom claims | Yes |
| Email verification mgmt | Partial | **P0** | Yes | Yes | Yes | Yes | Yes |
| Phone verification mgmt | No | **P0** | Yes | Yes | No | Yes | Yes |
| Bulk operations | No | **P0** | Yes | Limited | Yes (SCIM) | Yes (import) | No |
| Login tracking | last_login_at only | **P0** | Yes (count+details) | Yes | Yes | Yes | Limited |
| Identity linking | No | **P1** | Yes | Yes | No | Yes | Yes |
| MFA management | No | **P1** | Yes | Yes | Yes | Limited | No |
| Password policies | No | **P1** | Yes | Yes | Yes | No | No |
| User count/aggregation | Via stats | **P1** | Yes | Yes | Yes | Yes | Yes |
| Anonymous users | No | **P2** | No | No | No | Yes | No |
| Session management | No | **P2** | Yes | Yes | Yes | Yes | No |
| Profile image mgmt | No | **P2** | No | Yes | No | No | No |
| User merge | No | **P2** | Manual | No | No | No | No |

### Roles & Permissions Feature Comparison

| Feature | Our SDK (Current) | Our SDK (Proposed) | Auth0 | Clerk | WorkOS | Firebase | Supabase |
|---------|-------------------|-------------------|-------|-------|--------|----------|----------|
| Role CRUD | Yes | Yes | Yes | Yes | Yes | N/A | N/A |
| Permission assignment | Yes | Yes | Yes | Yes | Yes | Custom claims | RLS |
| Role assignment | Yes | Yes | Yes | Yes | Yes | Custom claims | N/A |
| Permission checking | Yes | Yes | Yes | Implicit | FGA | Security rules | RLS |
| Role hierarchy | Yes | Yes | No | No | No | N/A | N/A |
| Wildcard permissions | Yes | Yes | No | No | No | N/A | N/A |
| Time-limited roles | Yes | Yes | No | No | No | N/A | N/A |
| Resource-scoped perms | No | **P0** | FGA | No | FGA | No | RLS (row-level) |
| Permission groups | No | **P0** | Limited | No | No | N/A | N/A |
| Batch permission checks | No | **P0** | FGA | No | FGA | No | No |
| Role templates | No | **P0** | No | System roles | No | N/A | N/A |
| Permission explanation | No | **P0** | No | No | No | N/A | N/A |
| Conditional permissions | Context field exists | **P0** | FGA (ABAC) | No | FGA | No | RLS |
| Permission denials | No | **P1** | No | No | No | N/A | N/A |
| Role cloning | No | **P1** | No | No | No | N/A | N/A |
| Permission audit log | No | **P1** | Yes | Limited | Yes | N/A | N/A |
| Org-scoped roles | tenant_id exists | **P1** | Organizations | Organizations | Organizations | N/A | N/A |
| ReBAC (Zanzibar-style) | No | **P2** | FGA/OpenFGA | No | FGA | N/A | N/A |
| Feature entitlements | No | **P2** | No | No | FGA | N/A | N/A |

### User Impersonation Feature Comparison

| Feature | Our SDK (Proposed) | Auth0 | Clerk | WorkOS | Firebase | Supabase |
|---------|-------------------|-------|-------|--------|----------|----------|
| Impersonation support | **P0** | Deprecated (returning) | Yes | Yes | No | No |
| Actor token / act claim | **P0** | Workaround via Actions | Yes | Yes | N/A | N/A |
| Mandatory justification | **P0** | N/A | No | Yes | N/A | N/A |
| Time-limited sessions | **P0** | N/A | No | Yes (60 min) | N/A | N/A |
| Audit trail | **P0** | N/A | Yes | Yes (events) | N/A | N/A |
| Scope restriction | **P1** | N/A | No | No | N/A | N/A |
| Target user notification | **P1** | N/A | No | No | N/A | N/A |
| Action logging | **P1** | N/A | No | No | N/A | N/A |
| Hierarchy enforcement | **P0** | N/A | No | No | N/A | N/A |
| Approval workflow | **P2** | N/A | No | No | N/A | N/A |
| Shadow / read-only mode | **P2** | N/A | No | No | N/A | N/A |
| UI helper components | **P1** | N/A | No | Yes (React) | N/A | N/A |
| Rate limiting | **P0** | N/A | No | No | N/A | N/A |

---

## Appendix B: Implementation Priority Summary

### Phase 1 -- P0 (Must Have for GA)

**Users Module Enhancements:**
1. Structured Metadata (dual metadata system)
2. User Banning (ban/unban with session revocation)
3. User Locking (manual + automatic brute force protection)
4. Email Verification Management (resend, admin-verify)
5. Phone Verification Management
6. Bulk User Operations (create, delete, status update, export, import)
7. Login Tracking Enhancements (count, IP, user agent, history)

**Roles & Permissions Module Enhancements:**
1. Resource-Scoped Permissions
2. Permission Groups
3. Batch Permission Checks
4. Role Templates
5. Permission Explanation (debug/audit)
6. Conditional / Contextual Permissions

**User Impersonation Module (New):**
1. Impersonation Session Creation
2. Session Termination
3. Active Impersonation Detection (act claim)
4. Impersonation Audit Trail
5. Impersonation Restrictions (hierarchy, rate limiting, etc.)

### Phase 2 -- P1 (Should Have)

**Users:** Identity Linking, MFA Management, Password Policies, User Count/Aggregation
**Roles:** Permission Denials, Role Cloning, Permission Audit Log, Org-Scoped Roles
**Impersonation:** Scope Restriction, Target User Notification, Action Logging, UI Helpers

### Phase 3 -- P2 (Nice to Have)

**Users:** Anonymous Users, Session Management, Profile Image Management, User Merge
**Roles:** ReBAC (Zanzibar-style), Feature Entitlements
**Impersonation:** Approval Workflow, Shadow/Read-Only Mode

---

## Appendix C: Research Sources

- [Auth0 User Metadata Management](https://auth0.com/docs/manage-users/user-accounts/metadata/manage-metadata-api)
- [Auth0 Normalized User Profile Schema](https://auth0.com/docs/manage-users/user-accounts/user-profiles/normalized-user-profile-schema)
- [Auth0 RBAC Documentation](https://auth0.com/docs/manage-users/access-control/rbac)
- [Auth0 Fine-Grained Authorization](https://auth0.com/fine-grained-authorization)
- [Auth0 Account Linking](https://auth0.com/docs/manage-users/user-accounts/user-account-linking)
- [Auth0 Impersonation Community Discussion](https://community.auth0.com/t/impersonation-in-2025/189989)
- [Clerk User Management](https://clerk.com/docs/guides/users/managing)
- [Clerk Backend User Object](https://clerk.com/docs/reference/backend/types/backend-user)
- [Clerk User Banning](https://clerk.com/docs/reference/backend/user/ban-user)
- [Clerk User Locking](https://clerk.com/docs/reference/backend/user/lock-user)
- [Clerk User Impersonation](https://clerk.com/docs/guides/users/impersonation)
- [Clerk User Metadata](https://clerk.com/docs/guides/users/extending)
- [Clerk Organizations](https://clerk.com/docs/guides/organizations/overview)
- [WorkOS Directory Sync](https://workos.com/docs/directory-sync)
- [WorkOS User Management](https://workos.com/user-management)
- [WorkOS Fine-Grained Authorization](https://workos.com/docs/fga)
- [WorkOS Impersonation](https://workos.com/docs/user-management/impersonation)
- [WorkOS Impersonation Launch](https://workos.com/blog/launch-week-spring-2024-day-5-impersonation)
- [Firebase Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Firebase Admin Auth API](https://firebase.google.com/docs/auth/admin)
- [Supabase User Management](https://supabase.com/docs/guides/auth/managing-user-data)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Custom Claims RBAC](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)
- [OpenFGA (Auth0 FGA open source)](https://openfga.dev/)
