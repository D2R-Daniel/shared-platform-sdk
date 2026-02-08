# Phase 1 Data Model: Shared Platform Foundation

**Feature Branch**: `007-shared-platform-foundation`
**Created**: 2026-02-07
**Status**: Draft
**Source**: [spec.md](spec.md), [cross-product-matrix.md](research/cross-product-matrix.md), [pattern-adoption.md](research/pattern-adoption.md), [product-analysis.md](research/product-analysis.md)
**ORM Targets**: Drizzle (Dream Payroll, Dream Books, Dream Learn) + Prisma (Dream Team, HireWise)

---

## Table of Contents

1. [Entity Relationship Overview](#1-entity-relationship-overview)
2. [User (Global Identity)](#2-user-global-identity)
3. [Organization (Tenant)](#3-organization-tenant)
4. [OrganizationMembership](#4-organizationmembership)
5. [Role](#5-role)
6. [RoleAssignment](#6-roleassignment)
7. [SSOAccount](#7-ssoaccount)
8. [Team](#8-team)
9. [Department](#9-department)
10. [Session](#10-session)
11. [AuditEvent](#11-auditevent)
12. [Invitation](#12-invitation)
13. [PlatformError (Code Construct)](#13-platformerror-code-construct)
14. [Seed Data](#14-seed-data)
15. [Migration Strategy](#15-migration-strategy)
16. [Indexing Strategy](#16-indexing-strategy)

---

## 1. Entity Relationship Overview

```
                                    +-----------+
                                    |   User    |
                                    |  (global) |
                                    +-----+-----+
                                          |
                    +---------------------+---------------------+
                    |                     |                     |
              has many            has many              has many
                    |                     |                     |
             +------+------+    +--------+--------+    +-------+-------+
             |  SSOAccount |    |  Org Membership  |    |    Session    |
             +-------------+    +--------+--------+    +---------------+
                                         |
                              +----------+----------+
                              |                     |
                       belongs to              has many
                              |                     |
                    +---------+---------+   +-------+--------+
                    |   Organization    |   | RoleAssignment  |
                    |     (Tenant)      |   +-------+--------+
                    +---------+---------+           |
                              |                belongs to
                    +---------+---------+           |
                    |         |         |   +-------+-------+
               has many  has many  has many |     Role      |
                    |         |         |   +---------------+
              +-----+   +----+----+  +--+--+
              | Team |   |  Dept  |  | Inv  |
              +------+   +--------+  +------+

        +-------------+
        | AuditEvent  |  (append-only, belongs to Organization)
        +-------------+

        +----------------+
        | PlatformError  |  (code construct, not a DB entity)
        +----------------+
```

### Relationship Summary

| From | To | Cardinality | Join Entity |
|------|----|-------------|-------------|
| User | Organization | many-to-many | OrganizationMembership |
| OrganizationMembership | Role | many-to-many | RoleAssignment |
| User | SSOAccount | one-to-many | -- |
| User | Session | one-to-many | -- |
| Organization | Team | one-to-many | -- |
| Organization | Department | one-to-many | -- |
| Organization | Role (custom) | one-to-many | -- |
| Organization | Invitation | one-to-many | -- |
| Organization | AuditEvent | one-to-many | -- |
| Team | Team (parent) | self-referential | -- |
| Department | Department (parent) | self-referential | -- |

---

## 2. User (Global Identity)

A person who authenticates and interacts with any product on the platform. Users have a **single global identity** -- one account identified by a unique email address -- and hold memberships in one or more organizations.

**Table name**: `users`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | `string (UUID v4)` | PRIMARY KEY | `gen_random_uuid()` | Unique user identifier |
| `email` | `string` | NOT NULL, UNIQUE, max 255 | -- | Primary email address, stored lowercase |
| `name` | `string` | NOT NULL, max 255 | -- | Display name |
| `phone` | `string` | NULLABLE, E.164 format (`^\+?[1-9]\d{1,14}$`) | `null` | Phone number |
| `avatar_url` | `string` | NULLABLE, valid URL | `null` | Profile picture URL |
| `status` | `enum` | NOT NULL, values: `active`, `suspended`, `deleted` | `'active'` | Account status |
| `password_hash` | `string` | NULLABLE | `null` | bcrypt hash (cost >= 10). Null for SSO-only users (FR-006) |
| `failed_login_attempts` | `integer` | NOT NULL, >= 0 | `0` | Consecutive failed login count. Reset to 0 on successful login |
| `locked_until` | `datetime` | NULLABLE | `null` | Account locked until this timestamp. Set to `now() + 15 min` after 5 failures (FR-003) |
| `email_verified` | `boolean` | NOT NULL | `false` | Whether the email address has been verified |
| `metadata` | `jsonb` | NULLABLE | `{}` | Extensible per-product data (e.g., `employee_id`, `entra_object_id`) |
| `created_at` | `datetime` | NOT NULL | `now()` | Account creation timestamp |
| `updated_at` | `datetime` | NOT NULL | `now()` | Last modification timestamp |
| `deleted_at` | `datetime` | NULLABLE | `null` | Soft delete timestamp |

### Relationships

| Relationship | Target | Type | FK |
|-------------|--------|------|-----|
| memberships | OrganizationMembership | has many | `organization_memberships.user_id` |
| sso_accounts | SSOAccount | has many | `sso_accounts.user_id` |
| sessions | Session | has many | `sessions.user_id` |

### Indexes

| Name | Columns | Type | Notes |
|------|---------|------|-------|
| `users_pkey` | `(id)` | PRIMARY KEY | |
| `users_email_unique` | `(email)` | UNIQUE | Global email uniqueness (FR-006a) |
| `users_status_idx` | `(status)` | INDEX | Filter active/suspended users |
| `users_created_at_idx` | `(created_at)` | INDEX | Sort by creation date |

### Validation Rules

- **email**: Required, valid email format, max 255 characters, stored as lowercase. Must be globally unique across the entire platform (FR-006a). A user joins additional organizations through OrganizationMembership, never by creating a second account.
- **name**: Required, minimum 1 character, max 255 characters.
- **phone**: If provided, must match E.164 format (`+` followed by 1-15 digits).
- **password_hash**: Optional. SSO-only users (provisioned via JIT -- FR-006) have no password. When set, the plaintext password must meet complexity rules: minimum 8 characters, at least one uppercase, one lowercase, one digit, one special character.
- **failed_login_attempts**: Incremented on each failed login. Reset to 0 on successful login. When it reaches 5, `locked_until` is set to `now() + 15 minutes` (FR-003).
- **metadata**: Valid JSON object. Products may store product-specific fields (e.g., Dream Team stores `employee_id`, `entra_object_id`; Dream Payroll stores `auth_provider`).

### State Transitions

```
                 suspend
    active  <─────────────>  suspended
      │          reactivate       │
      │                           │
      └──── soft delete ────>  deleted
              (set deleted_at)

    Note: "deleted" is a soft delete (deleted_at is set).
    Suspended users cannot log in.
    Deleted users are excluded from queries by default.
    Transition back from "deleted" is not supported.
```

| From | To | Trigger | Side Effects |
|------|----|---------|-------------|
| `active` | `suspended` | Admin action or security policy | All active sessions invalidated |
| `suspended` | `active` | Admin reactivation | `failed_login_attempts` reset to 0, `locked_until` cleared |
| `active` | `deleted` | User deletion (soft) | `deleted_at` set, all sessions invalidated, memberships deactivated |

---

## 3. Organization (Tenant)

A company or entity that subscribes to one or more products. Organizations provide the multi-tenancy boundary -- all data queries are scoped to the current organization (FR-014).

**Table name**: `organizations`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | `string (UUID v4)` | PRIMARY KEY | `gen_random_uuid()` | Unique organization identifier |
| `name` | `string` | NOT NULL, max 255 | -- | Display name |
| `slug` | `string` | NOT NULL, UNIQUE, lowercase, alphanumeric + hyphens, max 63 | -- | URL-safe identifier for subdomain routing (e.g., `acme` in `acme.dreamteam.app`) |
| `status` | `enum` | NOT NULL, values: `active`, `suspended`, `archived` | `'active'` | Organization lifecycle status |
| `plan_tier` | `string` | NOT NULL | `'free'` | Subscription plan: `free`, `starter`, `professional`, `enterprise` |
| `logo_url` | `string` | NULLABLE, valid URL | `null` | Organization logo for branding |
| `primary_color` | `string` | NULLABLE, hex color (`^#[0-9A-Fa-f]{6}$`) | `null` | Primary brand color |
| `domain` | `string` | NULLABLE, UNIQUE WHERE NOT NULL, valid hostname | `null` | Custom domain (e.g., `hr.acme.com`) |
| `currency` | `enum` | NOT NULL, values: `USD`, `INR`, `EUR`, `GBP` | `'USD'` | Billing currency (Indian market: INR support per research) |
| `region` | `enum` | NOT NULL, values: `us-east`, `eu-west`, `in-mumbai`, `ap-singapore` | `'us-east'` | Data residency region (DPDPA compliance) |
| `metadata` | `jsonb` | NULLABLE | `{}` | Extensible organization data |
| `created_at` | `datetime` | NOT NULL | `now()` | Creation timestamp |
| `updated_at` | `datetime` | NOT NULL | `now()` | Last modification timestamp |

### Relationships

| Relationship | Target | Type | FK |
|-------------|--------|------|-----|
| memberships | OrganizationMembership | has many | `organization_memberships.organization_id` |
| teams | Team | has many | `teams.organization_id` |
| departments | Department | has many | `departments.organization_id` |
| custom_roles | Role | has many | `roles.organization_id` (where not null) |
| invitations | Invitation | has many | `invitations.organization_id` |
| audit_events | AuditEvent | has many | `audit_events.tenant_id` |

### Indexes

| Name | Columns | Type | Notes |
|------|---------|------|-------|
| `organizations_pkey` | `(id)` | PRIMARY KEY | |
| `organizations_slug_unique` | `(slug)` | UNIQUE | Subdomain routing lookup |
| `organizations_domain_unique` | `(domain)` | UNIQUE (partial, WHERE domain IS NOT NULL) | Custom domain lookup. Partial index excludes nulls. |
| `organizations_status_idx` | `(status)` | INDEX | Filter by lifecycle status |

### Validation Rules

- **name**: Required, max 255 characters.
- **slug**: Required, lowercase, alphanumeric + hyphens, max 63 characters (subdomain-compatible per RFC 1035). Must not be a reserved slug. Must be globally unique.
- **domain**: If provided, must be a valid hostname. Must be globally unique. Two organizations cannot claim the same custom domain (spec edge case).
- **primary_color**: If provided, must be a valid hex color string (`#RRGGBB`).
- **region**: Immutable after creation (DPDPA compliance -- data residency cannot change).

### Reserved Slugs

The following slugs are reserved and cannot be used by any organization:

```
www, api, admin, auth, mail, cdn, static, app, help, support, docs, blog, status
```

### State Transitions

```
                  suspend
    active  <─────────────>  suspended
      │          reactivate       │
      │                           │
      ├──── archive ────────> archived
      │                           │
      └───────────────────────────┘
               (suspended can also archive)
```

| From | To | Trigger | Side Effects |
|------|----|---------|-------------|
| `active` | `suspended` | Admin action, payment failure | All requests from this org's members are blocked (FR-015). Members see "organization suspended" message. |
| `suspended` | `active` | Admin reactivation, payment resolved | Normal access restored |
| `active` | `archived` | Admin decision to archive | Read-only access. No mutations allowed. |
| `suspended` | `archived` | Admin decision to archive | Same as above |

---

## 4. OrganizationMembership

The join table enabling global identity with per-organization membership. A user's presence in an organization is represented by exactly one OrganizationMembership record per (user, organization) pair.

**Table name**: `organization_memberships`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | `string (UUID v4)` | PRIMARY KEY | `gen_random_uuid()` | Unique membership identifier |
| `user_id` | `string (UUID)` | NOT NULL, FK -> `users.id` | -- | The user |
| `organization_id` | `string (UUID)` | NOT NULL, FK -> `organizations.id` | -- | The organization |
| `joined_at` | `datetime` | NOT NULL | `now()` | When the user joined this organization |
| `invited_by` | `string (UUID)` | NULLABLE, FK -> `users.id` | `null` | The user who invited this member (null for founders / self-provisioned via SSO) |

### Relationships

| Relationship | Target | Type | FK |
|-------------|--------|------|-----|
| user | User | belongs to | `user_id` |
| organization | Organization | belongs to | `organization_id` |
| role_assignments | RoleAssignment | has many | `role_assignments.membership_id` |

### Indexes

| Name | Columns | Type | Notes |
|------|---------|------|-------|
| `org_memberships_pkey` | `(id)` | PRIMARY KEY | |
| `org_memberships_user_org_unique` | `(user_id, organization_id)` | UNIQUE | A user can belong to an organization only once |
| `org_memberships_org_idx` | `(organization_id)` | INDEX | List all members of an organization |

### Validation Rules

- **user_id**: Must reference an existing, non-deleted user.
- **organization_id**: Must reference an existing, non-archived organization.
- The combination `(user_id, organization_id)` must be unique. A user cannot have two memberships in the same organization.

### Design Notes

This entity is the lynchpin of the global identity model. Without it, each product would need to create separate user records per organization (the pattern that Dream Books and Dream Learn currently use with hardcoded org IDs). With OrganizationMembership:

- A user logs in once and can switch between organizations (FR-016).
- Role assignments are per-membership (per-organization), not per-user (FR-011b).
- When a user is invited to a new organization, a new OrganizationMembership is created -- not a new User.

---

## 5. Role

A named collection of permissions with a hierarchy level. Roles are either built-in (shared across all organizations) or custom (scoped to a specific organization). The permission model is allow-only: permissions are unioned across all of a user's assigned roles (FR-011a).

**Table name**: `roles`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | `string (UUID v4)` | PRIMARY KEY | `gen_random_uuid()` | Unique role identifier |
| `name` | `string` | NOT NULL, max 100 | -- | Human-readable role name (e.g., "Admin", "Recruiter") |
| `slug` | `string` | NOT NULL, lowercase alphanumeric + hyphens, max 100 | -- | URL-safe identifier. Unique per organization. |
| `description` | `string` | NULLABLE, max 500 | `null` | Role description |
| `hierarchy_level` | `integer` | NOT NULL, range 0-100 | -- | Lower number = more privileged. 0 is the highest privilege. |
| `is_built_in` | `boolean` | NOT NULL | `false` | `true` for the 5 default roles. Built-in roles cannot be deleted or have their hierarchy level changed. |
| `is_active` | `boolean` | NOT NULL | `true` | Inactive roles cannot be assigned to new memberships |
| `organization_id` | `string (UUID)` | NULLABLE, FK -> `organizations.id` | `null` | Null for built-in global roles. Set for custom organization-specific roles. |
| `permissions` | `text[]` | NOT NULL | `'{}'` | Array of `resource:action` permission strings (e.g., `['users:read', 'teams:*']`) |
| `created_at` | `datetime` | NOT NULL | `now()` | Creation timestamp |
| `updated_at` | `datetime` | NOT NULL | `now()` | Last modification timestamp |

### Built-In Roles

| Slug | Name | Hierarchy Level | Description |
|------|------|----------------|-------------|
| `super_admin` | Super Admin | 0 | Cross-tenant access with mandatory audit logging. Can administer all organizations. |
| `admin` | Admin | 10 | Full access within a single organization. Can manage roles, members, and settings. |
| `manager` | Manager | 20 | Can manage team members and approve operations within their scope. |
| `user` | User | 30 | Standard access. Can perform day-to-day operations. |
| `guest` | Guest | 40 | Read-only access to permitted resources. |

Products extend with custom roles at any hierarchy level (FR-009). Examples:
- Dream Payroll: `hr_admin` (10), `payroll_admin` (10), `finance` (15), `compliance_officer` (15), `employee` (30)
- Dream Learn: `curator` (25)
- HireWise: `recruiter` (22), `technical_expert` (22), `interviewer` (25), `proctor_reviewer` (25), `candidate` (35)

### Relationships

| Relationship | Target | Type | FK |
|-------------|--------|------|-----|
| organization | Organization | belongs to (optional) | `organization_id` |
| role_assignments | RoleAssignment | has many | `role_assignments.role_id` |

### Indexes

| Name | Columns | Type | Notes |
|------|---------|------|-------|
| `roles_pkey` | `(id)` | PRIMARY KEY | |
| `roles_slug_org_unique` | `(slug, organization_id)` | UNIQUE | Slug unique within an organization. For built-in roles (org_id = null), slug is globally unique. Uses `COALESCE(organization_id, '00000000-0000-0000-0000-000000000000')` for null-safe uniqueness. |
| `roles_org_idx` | `(organization_id)` | INDEX | List all roles for an organization |
| `roles_hierarchy_idx` | `(hierarchy_level)` | INDEX | Query by privilege level |

### Validation Rules

- **name**: Required, max 100 characters.
- **slug**: Required, lowercase alphanumeric + hyphens, max 100 characters. Must be unique within the organization (or globally for built-in roles).
- **hierarchy_level**: Required, integer between 0 and 100 inclusive. Lower values represent higher privilege. Custom roles cannot use level 0 (reserved for `super_admin`).
- **permissions**: Array of strings in `resource:action` format. Each string must match the pattern `^[a-z_*]+:[a-z_*]+$` or be the global wildcard `*`. Supports three matching modes:
  - Exact match: `users:read` grants exactly `users:read`
  - Action wildcard: `users:*` grants all actions on the `users` resource
  - Global wildcard: `*` grants all permissions (super admin only)
- **is_built_in**: Built-in roles cannot be deleted. Their `hierarchy_level` and `slug` cannot be modified. Their `permissions` and `name` can be customized per organization by creating an organization-scoped override.

### Permission Format Reference

```
Format:   resource:action
Examples: users:read, users:write, users:delete, users:*
          teams:manage, invoices:approve, payroll:initiate
          employee:read:self   (scoped extension -- Dream Payroll pattern)
          *                    (global wildcard -- super_admin only)

Matching rules (FR-007, FR-011):
  "users:read"  matches  "users:read"       (exact)
  "users:*"     matches  "users:read"       (action wildcard)
  "users:*"     matches  "users:write"      (action wildcard)
  "*"           matches  "users:read"       (global wildcard)
  "*"           matches  "invoices:delete"  (global wildcard)
  "employee:read" matches "employee:read:self" (scope extension)
```

---

## 6. RoleAssignment

The join table between OrganizationMembership and Role. Enables per-organization role assignments. A user can hold multiple roles within a single organization (Dream Learn multi-role pattern), with one marked as the active role for the current session.

**Table name**: `role_assignments`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | `string (UUID v4)` | PRIMARY KEY | `gen_random_uuid()` | Unique assignment identifier |
| `membership_id` | `string (UUID)` | NOT NULL, FK -> `organization_memberships.id` | -- | The organization membership this assignment belongs to |
| `role_id` | `string (UUID)` | NOT NULL, FK -> `roles.id` | -- | The role being assigned |
| `is_active` | `boolean` | NOT NULL | `true` | Marks the "active" role for role switching. When a user switches roles, one assignment's `is_active` is set to `true` and others to `false`. |
| `assigned_by` | `string (UUID)` | NOT NULL, FK -> `users.id` | -- | The user who made this assignment |
| `assigned_at` | `datetime` | NOT NULL | `now()` | When the role was assigned |

### Relationships

| Relationship | Target | Type | FK |
|-------------|--------|------|-----|
| membership | OrganizationMembership | belongs to | `membership_id` |
| role | Role | belongs to | `role_id` |
| assigner | User | belongs to | `assigned_by` |

### Indexes

| Name | Columns | Type | Notes |
|------|---------|------|-------|
| `role_assignments_pkey` | `(id)` | PRIMARY KEY | |
| `role_assignments_member_role_unique` | `(membership_id, role_id)` | UNIQUE | A role can only be assigned once per membership |
| `role_assignments_membership_idx` | `(membership_id)` | INDEX | List all roles for a membership |

### Validation Rules

- **membership_id**: Must reference an existing OrganizationMembership.
- **role_id**: Must reference an existing, active Role. The role must either be a built-in role or belong to the same organization as the membership.
- The combination `(membership_id, role_id)` must be unique. The same role cannot be assigned twice to the same membership.
- At least one RoleAssignment per membership should have `is_active = true`. Application logic enforces this constraint.
- When `is_active` is set to `true` on one assignment, the system should set `is_active = false` on all other assignments for the same membership (single active role invariant).

### Design Notes

The `is_active` flag enables the Dream Learn pattern of role switching without removing role assignments. A user who is both an `admin` and `curator` in one organization can switch between roles, and the system updates their JWT claims and permissions accordingly. The effective permission set for the active session is the union of all assigned roles' permissions (FR-011a), but the `is_active` flag determines which role slug is displayed in the UI and used for hierarchy-based checks (`requireMinimumRole()`).

---

## 7. SSOAccount

Links a User to an external identity provider account. Enables Just-In-Time (JIT) provisioning: on first SSO login, the system creates both a User and an SSOAccount record automatically (FR-006).

**Table name**: `sso_accounts`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | `string (UUID v4)` | PRIMARY KEY | `gen_random_uuid()` | Unique SSO account identifier |
| `user_id` | `string (UUID)` | NOT NULL, FK -> `users.id` | -- | The platform user |
| `provider` | `string` | NOT NULL, max 100 | -- | Identity provider identifier (e.g., `azure-entra`, `google`, `generic-oidc`) |
| `provider_account_id` | `string` | NOT NULL, max 255 | -- | The user's ID in the external provider (e.g., Azure Object ID, Google sub) |
| `provider_data` | `jsonb` | NULLABLE | `null` | Provider-specific metadata (e.g., MS Graph fields, calendar scopes, UPN) |
| `created_at` | `datetime` | NOT NULL | `now()` | When the SSO link was created (first SSO login) |

### Relationships

| Relationship | Target | Type | FK |
|-------------|--------|------|-----|
| user | User | belongs to | `user_id` |

### Indexes

| Name | Columns | Type | Notes |
|------|---------|------|-------|
| `sso_accounts_pkey` | `(id)` | PRIMARY KEY | |
| `sso_accounts_provider_account_unique` | `(provider, provider_account_id)` | UNIQUE | Each external account links to exactly one platform user |
| `sso_accounts_user_idx` | `(user_id)` | INDEX | List all SSO accounts for a user |

### Validation Rules

- **provider**: Required. Must be a recognized provider string. Current supported values: `azure-entra`, `google`, `generic-oidc`.
- **provider_account_id**: Required. Must be unique per provider (enforced by the composite unique index).
- A user can have multiple SSOAccount records (e.g., both Azure and Google linked).
- A single `(provider, provider_account_id)` pair can only be linked to one user. If a different user attempts to link the same external account, the system returns a ConflictError (409).

### JIT Provisioning Flow

```
1. User clicks "Sign in with Azure" on any product
2. Azure redirects back with auth code
3. NextAuth exchanges code for tokens, extracts provider_account_id
4. System checks: does SSOAccount(provider='azure-entra', provider_account_id=X) exist?
   a. YES: Retrieve linked User. Proceed to session creation.
   b. NO:  Check if User with matching email exists.
           i.  YES: Create SSOAccount linking existing User to this provider.
           ii. NO:  Create new User + SSOAccount + OrganizationMembership.
                    User has no password_hash (SSO-only).
5. Enrich JWT with user's organization memberships, roles, permissions (Pattern 7).
```

---

## 8. Team

A group of users within an organization. Teams support parent-child hierarchy for nested organizational structures (e.g., "Engineering" > "Backend" > "Platform").

**Table name**: `teams`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | `string (UUID v4)` | PRIMARY KEY | `gen_random_uuid()` | Unique team identifier |
| `name` | `string` | NOT NULL, max 255 | -- | Team display name |
| `slug` | `string` | NOT NULL, lowercase alphanumeric + hyphens, max 100 | -- | URL-safe identifier, unique per organization |
| `organization_id` | `string (UUID)` | NOT NULL, FK -> `organizations.id` | -- | The organization this team belongs to |
| `owner_id` | `string (UUID)` | NOT NULL, FK -> `users.id` | -- | Team owner/lead |
| `parent_team_id` | `string (UUID)` | NULLABLE, FK -> `teams.id` | `null` | Parent team for hierarchy (self-referential) |
| `metadata` | `jsonb` | NULLABLE | `{}` | Custom team data |
| `created_at` | `datetime` | NOT NULL | `now()` | Creation timestamp |
| `updated_at` | `datetime` | NOT NULL | `now()` | Last modification timestamp |

### Relationships

| Relationship | Target | Type | FK |
|-------------|--------|------|-----|
| organization | Organization | belongs to | `organization_id` |
| owner | User | belongs to | `owner_id` |
| parent_team | Team | belongs to (optional) | `parent_team_id` |
| child_teams | Team | has many | `teams.parent_team_id` |
| members | TeamMember | has many | `team_members.team_id` |

### TeamMember (Implicit Sub-Entity)

Team membership is tracked via a `team_members` join table:

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | `string (UUID v4)` | PRIMARY KEY | `gen_random_uuid()` | Unique membership identifier |
| `team_id` | `string (UUID)` | NOT NULL, FK -> `teams.id` | -- | The team |
| `user_id` | `string (UUID)` | NOT NULL, FK -> `users.id` | -- | The user |
| `role` | `enum` | NOT NULL, values: `owner`, `admin`, `member` | `'member'` | Role within the team |
| `joined_at` | `datetime` | NOT NULL | `now()` | When the user joined the team |
| `invited_by` | `string (UUID)` | NULLABLE, FK -> `users.id` | `null` | Who added this member |

### Indexes

| Name | Columns | Type | Notes |
|------|---------|------|-------|
| `teams_pkey` | `(id)` | PRIMARY KEY | |
| `teams_slug_org_unique` | `(slug, organization_id)` | UNIQUE | Slug unique within organization |
| `teams_org_idx` | `(organization_id)` | INDEX | List all teams in an organization |
| `teams_parent_idx` | `(parent_team_id)` | INDEX | Find child teams |
| `team_members_team_user_unique` | `(team_id, user_id)` | UNIQUE | A user can only be in a team once |
| `team_members_team_idx` | `(team_id)` | INDEX | List team members |
| `team_members_user_idx` | `(user_id)` | INDEX | List a user's teams |

### Validation Rules

- **name**: Required, max 255 characters.
- **slug**: Required, lowercase alphanumeric + hyphens, max 100 characters. Unique within the organization.
- **organization_id**: Must reference an existing, active organization.
- **owner_id**: Must reference an existing user who is a member of the organization.
- **parent_team_id**: If provided, must reference a team in the same organization. Circular references are prohibited (a team cannot be its own ancestor).

---

## 9. Department

An organizational unit within an organization with hierarchy support using materialized paths for efficient tree queries.

**Table name**: `departments`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | `string (UUID v4)` | PRIMARY KEY | `gen_random_uuid()` | Unique department identifier |
| `name` | `string` | NOT NULL, max 255 | -- | Department display name (e.g., "Engineering", "Human Resources") |
| `organization_id` | `string (UUID)` | NOT NULL, FK -> `organizations.id` | -- | The organization this department belongs to |
| `head_user_id` | `string (UUID)` | NULLABLE, FK -> `users.id` | `null` | Department head/manager |
| `parent_department_id` | `string (UUID)` | NULLABLE, FK -> `departments.id` | `null` | Parent department (self-referential) |
| `path` | `string` | NOT NULL | `'/'` | Materialized path for hierarchy queries (e.g., `/eng/backend/`) |
| `level` | `integer` | NOT NULL, >= 0 | `0` | Depth in hierarchy. 0 = root department. |
| `member_count` | `integer` | NOT NULL, >= 0 | `0` | Denormalized count of members. Updated on membership changes. |
| `created_at` | `datetime` | NOT NULL | `now()` | Creation timestamp |
| `updated_at` | `datetime` | NOT NULL | `now()` | Last modification timestamp |

### Relationships

| Relationship | Target | Type | FK |
|-------------|--------|------|-----|
| organization | Organization | belongs to | `organization_id` |
| head | User | belongs to (optional) | `head_user_id` |
| parent | Department | belongs to (optional) | `parent_department_id` |
| children | Department | has many | `departments.parent_department_id` |

### Indexes

| Name | Columns | Type | Notes |
|------|---------|------|-------|
| `departments_pkey` | `(id)` | PRIMARY KEY | |
| `departments_name_org_unique` | `(name, organization_id)` | UNIQUE | Department name unique within organization |
| `departments_org_idx` | `(organization_id)` | INDEX | List all departments in an organization |
| `departments_path_idx` | `(path)` | INDEX | Hierarchy queries using `LIKE '/eng/%'` |

### Validation Rules

- **name**: Required, max 255 characters. Unique within the organization.
- **organization_id**: Must reference an existing organization.
- **parent_department_id**: If provided, must reference a department in the same organization. Circular references are prohibited.
- **path**: Computed from the department hierarchy. Format: `/{slug_or_id}/.../{slug_or_id}/`. Updated when the department is moved in the hierarchy.
- **level**: Computed from the hierarchy depth. Root departments have level 0. Updated when the department is moved.
- **member_count**: Denormalized field. Application code must update this count when members are added to or removed from the department.

---

## 10. Session

A user's active connection to the system. Sessions track the current authentication state, organization context, and active roles. In the foundation architecture, sessions are primarily managed by NextAuth as JWT tokens; this entity defines the JWT claim structure and any persistent session tracking.

**Table name**: `sessions` (or JWT claims -- see design notes)

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | `string (UUID v4)` | PRIMARY KEY | `gen_random_uuid()` | Session identifier |
| `user_id` | `string (UUID)` | NOT NULL, FK -> `users.id` | -- | The authenticated user |
| `organization_id` | `string (UUID)` | NOT NULL, FK -> `organizations.id` | -- | The user's active organization for this session |
| `role_slugs` | `text[]` | NOT NULL | `'{}'` | Active role slugs for this session (e.g., `['admin', 'hr_admin']`) |
| `permissions` | `text[]` | NOT NULL | `'{}'` | Computed permission set -- union of all active roles' permissions |
| `device_info` | `jsonb` | NULLABLE | `null` | User agent, browser, OS, device type |
| `ip_address` | `string` | NOT NULL | -- | Client IP address at session creation |
| `created_at` | `datetime` | NOT NULL | `now()` | Session creation timestamp |
| `expires_at` | `datetime` | NOT NULL | `now() + 8 hours` | Session expiration (FR-004: 8-hour duration) |
| `last_activity_at` | `datetime` | NOT NULL | `now()` | Last request timestamp for this session |

### Relationships

| Relationship | Target | Type | FK |
|-------------|--------|------|-----|
| user | User | belongs to | `user_id` |
| organization | Organization | belongs to | `organization_id` |

### Indexes

| Name | Columns | Type | Notes |
|------|---------|------|-------|
| `sessions_pkey` | `(id)` | PRIMARY KEY | |
| `sessions_user_idx` | `(user_id)` | INDEX | List all sessions for a user |
| `sessions_org_idx` | `(organization_id)` | INDEX | List sessions per organization |
| `sessions_expires_idx` | `(expires_at)` | INDEX | Cleanup expired sessions |

### Validation Rules

- **expires_at**: Must be exactly 8 hours from `created_at` (FR-004). No configurable session duration -- this is a security invariant across all products.
- **role_slugs**: Must contain at least one role slug that matches an active role assignment for the user's membership in `organization_id`.
- **permissions**: Computed as the union of all permissions from the roles identified by `role_slugs`. Not manually set.

### JWT Claim Structure (Pattern 7)

The session entity maps to the following JWT payload embedded in the NextAuth token:

```typescript
interface JwtPayload {
  sub: string;           // user_id
  email: string;         // user email
  name: string;          // user display name
  tenantId: string;      // organization_id (active org)
  roles: string[];       // role_slugs
  activeRole: string;    // primary active role slug
  permissions: string[]; // computed permissions (optional -- for small permission sets)
  planTier: string;      // organization's plan_tier
  tenantStatus: string;  // organization's status
  authProvider: string;  // 'credentials' | 'azure-entra' | 'google'
  iat: number;           // issued at (unix timestamp)
  exp: number;           // expires at (iat + 28800 = 8 hours)
}
```

### Design Notes

- Sessions are primarily JWT-based (stateless). The `sessions` table is optional and used only for persistent session tracking (e.g., listing active sessions, forced logout across devices).
- When a user switches organizations (FR-016), the JWT is refreshed with the new `organization_id`, `role_slugs`, and `permissions`.
- Avatar URLs are excluded from the JWT to prevent HTTP 431 errors (discovered by Dream Learn).
- Permissions are included in the JWT only when the permission set is small enough (< 4KB total JWT size). For users with extensive permissions, the system falls back to `*` (wildcard) or database lookup.

---

## 11. AuditEvent

A structured, immutable record of any state-changing action across any product. AuditEvent is an append-only entity -- records are never updated or deleted (until retention expiration). All create, update, and delete operations emit audit events automatically through `createApiHandler()` (FR-024, FR-027).

**Table name**: `audit_events`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | `string (UUID v4)` | PRIMARY KEY | `gen_random_uuid()` | Unique event identifier |
| `tenant_id` | `string (UUID)` | NOT NULL, FK -> `organizations.id` | -- | The organization where this event occurred |
| `actor_id` | `string (UUID)` | NOT NULL, FK -> `users.id` | -- | The user who performed the action |
| `actor_email` | `string` | NOT NULL | -- | Denormalized actor email for query convenience (avoids joins) |
| `action` | `string` | NOT NULL, max 100 | -- | Event type using dot notation: `user.created`, `role.updated`, `invoice.deleted` |
| `resource_type` | `string` | NOT NULL, max 100 | -- | Type of affected resource: `user`, `role`, `invoice`, `team`, `department` |
| `resource_id` | `string` | NOT NULL, max 255 | -- | ID of the affected resource |
| `before_state` | `jsonb` | NULLABLE | `null` | Resource state before the action. Null for `create` events. |
| `after_state` | `jsonb` | NULLABLE | `null` | Resource state after the action. Null for `delete` events. |
| `ip_address` | `string` | NOT NULL | -- | IP address of the request origin |
| `request_id` | `string` | NOT NULL | -- | Correlation ID for tracing the full request lifecycle |
| `timestamp` | `datetime` | NOT NULL | `now()` | When the action occurred (event time, not insert time) |
| `metadata` | `jsonb` | NULLABLE | `null` | Additional context (e.g., user agent, API version, route path) |
| `retention_expires_at` | `datetime` | NOT NULL | `now() + 1 year` | When this event can be purged. Minimum 1 year (SOC2). Configurable max per organization (GDPR/DPDPA). |

### Relationships

| Relationship | Target | Type | FK |
|-------------|--------|------|-----|
| organization | Organization | belongs to | `tenant_id` |

Note: The FK to `users.id` for `actor_id` is a logical relationship. The audit_events table does not enforce a foreign key constraint on `actor_id` because audit events must survive user deletion (the actor email is denormalized for this reason).

### Indexes

| Name | Columns | Type | Notes |
|------|---------|------|-------|
| `audit_events_pkey` | `(id)` | PRIMARY KEY | |
| `audit_events_tenant_timestamp_idx` | `(tenant_id, timestamp)` | INDEX | Primary query pattern: "show me events for org X in time range Y-Z" (FR-026) |
| `audit_events_tenant_actor_idx` | `(tenant_id, actor_id)` | INDEX | "Show me everything user X did in org Y" |
| `audit_events_tenant_action_idx` | `(tenant_id, action)` | INDEX | "Show me all user.deleted events in org Y" |
| `audit_events_tenant_resource_idx` | `(tenant_id, resource_type, resource_id)` | INDEX | "Show me all changes to invoice INV-123" |
| `audit_events_retention_idx` | `(retention_expires_at)` | INDEX | Scheduled purge job: delete events past retention |

### Action Taxonomy

Actions follow a `resource.verb` naming convention:

```
auth.*           Authentication events
  auth.login           User logged in (credentials or SSO)
  auth.logout          User logged out
  auth.lockout         Account locked after failed attempts
  auth.unlock          Account unlocked (timeout or admin)
  auth.password_reset  Password was reset

user.*           User management events
  user.created         New user account created
  user.updated         User profile updated
  user.suspended       User account suspended
  user.reactivated     User account reactivated
  user.deleted         User account soft-deleted

role.*           Role management events
  role.created         New role created
  role.updated         Role permissions/name changed
  role.assigned        Role assigned to a membership
  role.unassigned      Role removed from a membership

organization.*   Organization management events
  organization.created      New organization created
  organization.updated      Organization settings changed
  organization.suspended    Organization suspended
  organization.archived     Organization archived

team.*           Team management events
  team.created         Team created
  team.updated         Team settings changed
  team.member_added    Member added to team
  team.member_removed  Member removed from team

invitation.*     Invitation events
  invitation.created   Invitation sent
  invitation.accepted  Invitation accepted
  invitation.revoked   Invitation revoked

resource.*       Generic resource events (product-specific)
  {resource_type}.created
  {resource_type}.updated
  {resource_type}.deleted
```

### Validation Rules

- **Immutability**: Audit events are append-only. No UPDATE or DELETE operations are permitted on this table. The only exception is the retention purge job that deletes events past `retention_expires_at`.
- **action**: Must follow `resource_type.verb` format.
- **before_state / after_state**: For `create` events, `before_state` is null. For `delete` events, `after_state` is null. For `update` events, both are populated with the relevant changed fields.
- **retention_expires_at**: Must be at least 1 year from `timestamp` (SOC2 minimum -- FR-027a). Organizations may configure a maximum retention period for GDPR/DPDPA data minimization, but never below 1 year.
- **Delivery**: Audit events are emitted asynchronously (non-blocking to the API response) via a durable buffer. No event may be silently lost due to application crashes or restarts (FR-024).

### Partitioning Strategy

For large-scale deployments, consider time-based partitioning on the `timestamp` column:

- **Monthly partitions**: `audit_events_2026_01`, `audit_events_2026_02`, etc.
- **Benefits**: Faster queries on time-bounded ranges, efficient retention purge (drop entire partitions), parallel vacuum operations.
- **Retention purge**: Instead of row-level deletes, drop partitions older than the retention window.

---

## 12. Invitation

A token-based invite to join an organization, team, or product. Invitations have a defined lifecycle with automatic expiration.

**Table name**: `invitations`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | `string (UUID v4)` | PRIMARY KEY | `gen_random_uuid()` | Unique invitation identifier |
| `organization_id` | `string (UUID)` | NOT NULL, FK -> `organizations.id` | -- | The organization the invitee will join |
| `inviter_id` | `string (UUID)` | NOT NULL, FK -> `users.id` | -- | The user who created the invitation |
| `invitee_email` | `string` | NOT NULL, valid email, max 255 | -- | Email address of the person being invited |
| `type` | `enum` | NOT NULL, values: `organization`, `team`, `product` | -- | What the person is being invited to |
| `team_id` | `string (UUID)` | NULLABLE, FK -> `teams.id` | `null` | For `team` type invitations: the target team |
| `role_id` | `string (UUID)` | NOT NULL, FK -> `roles.id` | -- | The role to assign upon acceptance |
| `status` | `enum` | NOT NULL, values: `pending`, `accepted`, `expired`, `revoked` | `'pending'` | Invitation lifecycle status |
| `token` | `string` | NOT NULL, UNIQUE, 64 hex characters | -- | Secure random token (`crypto.randomBytes(32).toString('hex')`) |
| `expires_at` | `datetime` | NOT NULL | `now() + 7 days` | When the invitation expires |
| `accepted_at` | `datetime` | NULLABLE | `null` | When the invitation was accepted |
| `created_at` | `datetime` | NOT NULL | `now()` | Creation timestamp |

### Relationships

| Relationship | Target | Type | FK |
|-------------|--------|------|-----|
| organization | Organization | belongs to | `organization_id` |
| inviter | User | belongs to | `inviter_id` |
| team | Team | belongs to (optional) | `team_id` |
| role | Role | belongs to | `role_id` |

### Indexes

| Name | Columns | Type | Notes |
|------|---------|------|-------|
| `invitations_pkey` | `(id)` | PRIMARY KEY | |
| `invitations_token_unique` | `(token)` | UNIQUE | Token-based lookup for acceptance |
| `invitations_invitee_email_idx` | `(invitee_email)` | INDEX | Find all invitations for an email |
| `invitations_org_status_idx` | `(organization_id, status)` | INDEX | List pending invitations for an org |

### Validation Rules

- **invitee_email**: Required, valid email format.
- **type**: Required. If `team`, then `team_id` must also be provided and must reference a team in the same organization.
- **role_id**: Must reference an active role that is either built-in or belongs to the same organization.
- **token**: 64-character hex string generated using cryptographically secure random bytes. Never exposed in URLs without HTTPS.
- **expires_at**: Default 7 days from creation. Configurable between 1 and 30 days.

### State Transitions

```
    pending ──── accept ────> accepted
       │
       ├──── time passes ──> expired  (automatic, when now() > expires_at)
       │
       └──── admin revokes ─> revoked
```

| From | To | Trigger | Side Effects |
|------|----|---------|-------------|
| `pending` | `accepted` | Invitee clicks link and accepts | `accepted_at` set. New User created (if not exists). OrganizationMembership created. RoleAssignment created with `role_id`. |
| `pending` | `expired` | `now()` exceeds `expires_at` | Automatic. No side effects. Checked lazily on token validation. |
| `pending` | `revoked` | Admin revokes the invitation | No side effects. Token becomes invalid. |

### Acceptance Flow

```
1. Invitee receives email with link: https://app.example.com/invite/{token}
2. System validates: token exists, status is 'pending', now() < expires_at
3. If invitee has existing User account (by email):
   a. Create OrganizationMembership (user_id, organization_id)
   b. Create RoleAssignment (membership_id, role_id)
4. If invitee has no User account:
   a. Create User (email, name from invitation, password from acceptance form)
   b. Create OrganizationMembership
   c. Create RoleAssignment
5. Update invitation: status='accepted', accepted_at=now()
6. Emit audit event: invitation.accepted
7. Redirect invitee to organization dashboard
```

---

## 13. PlatformError (Code Construct)

PlatformError is NOT a database entity. It is a typed class hierarchy used in application code to represent errors consistently across all 5 products (FR-021, FR-022). Documented here for completeness as it is a key entity in the spec.

### Structure

| Field | Type | Description |
|-------|------|-------------|
| `status` | `number` | HTTP status code |
| `code` | `string` | Namespaced error code: `auth/token-expired`, `rbac/permission-denied`, `tenant/not-found` |
| `message` | `string` | Developer-facing message with technical details |
| `userMessage` | `string` | Safe for end-user display. Never contains internal details. |
| `requestId` | `string` (optional) | Correlation ID for support investigations |
| `param` | `string` (optional) | Which field/parameter caused the error (for validation errors) |

### Subclass Hierarchy

```
PlatformError (base)
  ├── ValidationError        (HTTP 400)
  ├── AuthenticationError    (HTTP 401)
  ├── AuthorizationError     (HTTP 403)
  ├── NotFoundError          (HTTP 404)
  ├── ConflictError          (HTTP 409)
  ├── RateLimitError         (HTTP 429, includes retryAfter)
  └── ServerError            (HTTP 500)
```

### Error Code Namespaces

| Namespace | Examples |
|-----------|---------|
| `auth/*` | `auth/unauthenticated`, `auth/token-expired`, `auth/account-locked`, `auth/invalid-credentials` |
| `rbac/*` | `rbac/permission-denied`, `rbac/role-not-found`, `rbac/insufficient-hierarchy` |
| `tenant/*` | `tenant/not-found`, `tenant/suspended`, `tenant/archived`, `tenant/slug-reserved` |
| `users/*` | `users/not-found`, `users/email-taken`, `users/invalid-email` |
| `teams/*` | `teams/not-found`, `teams/slug-taken`, `teams/circular-hierarchy` |
| `invitations/*` | `invitations/expired`, `invitations/already-accepted`, `invitations/token-invalid` |
| `validation/*` | `validation/required-field`, `validation/invalid-format`, `validation/max-length-exceeded` |

### Standardized Response Format

All 5 products return errors in this exact JSON structure (FR-022):

```json
{
  "success": false,
  "error": {
    "code": "users/not-found",
    "message": "User usr_abc123 not found in tenant acme_corp",
    "userMessage": "The requested user could not be found.",
    "requestId": "req_xyz789",
    "param": "id"
  }
}
```

---

## 14. Seed Data

### Built-In Roles

The initial migration seeds the following 5 roles with `is_built_in = true` and `organization_id = null`:

| slug | name | hierarchy_level | permissions |
|------|------|----------------|-------------|
| `super_admin` | Super Admin | 0 | `['*']` |
| `admin` | Admin | 10 | `['users:*', 'roles:*', 'teams:*', 'departments:*', 'invitations:*', 'settings:*', 'audit:read']` |
| `manager` | Manager | 20 | `['users:read', 'teams:*', 'departments:read', 'invitations:create', 'invitations:read']` |
| `user` | User | 30 | `['users:read:self', 'teams:read', 'departments:read']` |
| `guest` | Guest | 40 | `['users:read:self']` |

### Default Permissions by Module

Products customize permissions per built-in role. The above are the platform-level defaults. Each product adds domain-specific permissions via `defineCustomRoles()`:

```typescript
// Dream Payroll example
defineCustomRoles([
  {
    slug: 'hr_admin',
    name: 'HR Admin',
    hierarchyLevel: 10,
    permissions: ['employee:*', 'salary:*', 'payroll:*', 'compliance:*'],
  },
  {
    slug: 'finance',
    name: 'Finance',
    hierarchyLevel: 15,
    permissions: ['payroll:approve', 'disbursement:*', 'salary:read'],
  },
  {
    slug: 'employee',
    name: 'Employee',
    hierarchyLevel: 30,
    permissions: ['employee:read:self', 'salary:read:self', 'payslip:read:self'],
  },
]);
```

### Test Organization

For development and testing, seed a default organization:

| Field | Value |
|-------|-------|
| `id` | Generated UUID (NOT hardcoded) |
| `name` | Test Organization |
| `slug` | `test-org` |
| `status` | `active` |
| `plan_tier` | `enterprise` |
| `currency` | `USD` |
| `region` | `us-east` |

Note: The test organization ID must come from an environment variable (`SEED_ORG_ID`), never from a hardcoded constant. This eliminates the `DEFAULT_ORG_ID` anti-pattern found in Dream Books (190 occurrences) and Dream Learn.

---

## 15. Migration Strategy

### Principles

1. **No separate migration runner.** Foundation provides table definitions; products add them to their existing migration systems (Drizzle `drizzle-kit push` or Prisma `prisma migrate dev`).
2. **Dual ORM support.** `@dream/types/drizzle` exports Drizzle table definitions. `@dream/types/prisma` exports Prisma model snippets. Products import the format matching their ORM (ADR-003).
3. **No forced ORM migration.** Dream Team and HireWise (Prisma) and Dream Payroll/Books/Learn (Drizzle) each use their native tools.

### Initial Migration (Foundation Tables)

Creates these tables in order (respecting FK dependencies):

```
1. users                      (no FK dependencies)
2. organizations              (no FK dependencies)
3. organization_memberships   (FK: users, organizations)
4. roles                      (FK: organizations -- nullable)
5. role_assignments            (FK: organization_memberships, roles, users)
6. sso_accounts               (FK: users)
7. teams                      (FK: organizations, users, teams -- self-ref)
8. team_members               (FK: teams, users)
9. departments                (FK: organizations, users, departments -- self-ref)
10. sessions                  (FK: users, organizations)
11. invitations               (FK: organizations, users, teams, roles)
12. audit_events              (FK: organizations -- logical only)

Seed: 5 built-in roles
```

### Product Integration Migrations

Each product adds FKs from their existing domain tables to the foundation tables:

| Product | Table | Change |
|---------|-------|--------|
| Dream Books | `invoices`, `accounts`, `contacts`, `transactions` | Add `organization_id` FK, remove hardcoded `DEFAULT_ORG_ID` |
| Dream Learn | `courses`, `learning_paths`, `enrollments` | Add `organization_id` FK, remove hardcoded demo org ID |
| Dream Team | `employees`, `leave_requests`, `payslips` | Rename `tenantId` to `organization_id` (or alias), add FK |
| Dream Payroll | `payroll_runs`, `salary_structures` | Already uses `organization_id` -- add FK constraint |
| HireWise | `tests`, `candidates`, `interviews` | Add `organization_id` column and FK (new concept for this product) |

---

## 16. Indexing Strategy

### Design Principles

1. **Tenant-scoped composites.** All tenant-scoped tables use `(tenant_id, ...)` composite indexes as the primary query pattern. This ensures query isolation and efficient per-tenant lookups.
2. **Business rule enforcement.** Unique constraints encode business rules (email uniqueness, slug uniqueness per org) at the database level, not just in application code.
3. **Audit optimization.** AuditEvent has the densest index set because it is the most query-intensive table (compliance reporting, security investigations, debugging).
4. **Partial indexes.** Use partial (filtered) indexes where applicable to reduce index size and improve write performance.

### Index Summary by Table

| Table | Index Count | Primary Query Pattern |
|-------|-------------|----------------------|
| `users` | 4 | Lookup by email, filter by status |
| `organizations` | 4 | Lookup by slug or domain, filter by status |
| `organization_memberships` | 3 | Lookup by (user, org) pair, list org members |
| `roles` | 4 | Lookup by slug within org, list by hierarchy level |
| `role_assignments` | 3 | List roles for a membership |
| `sso_accounts` | 3 | Lookup by (provider, external ID) |
| `teams` | 5 | Lookup by slug within org, traverse hierarchy |
| `team_members` | 3 | List team members, list user's teams |
| `departments` | 4 | Lookup by name within org, hierarchy path queries |
| `sessions` | 4 | Lookup by user, cleanup expired |
| `audit_events` | 6 | Tenant-scoped filtering by time, actor, action, resource |
| `invitations` | 4 | Token lookup, list pending per org |
| **Total** | **47** | |

### Partial Index Candidates

| Table | Index | Condition | Benefit |
|-------|-------|-----------|---------|
| `organizations` | `organizations_domain_unique` | `WHERE domain IS NOT NULL` | Most orgs have no custom domain; avoid indexing nulls |
| `invitations` | `invitations_pending_idx` | `WHERE status = 'pending'` | Most queries are for active/pending invitations |
| `users` | `users_active_idx` | `WHERE status = 'active' AND deleted_at IS NULL` | Most queries target active, non-deleted users |
| `sessions` | `sessions_active_idx` | `WHERE expires_at > now()` | Only active sessions are queried; expired ones are purged |

### Performance Targets (from Success Criteria)

| Operation | Target | Supporting Index |
|-----------|--------|-----------------|
| Authentication overhead | < 50ms per request (SC-006) | `users_email_unique` for user lookup |
| Permission checking | < 5ms per evaluation (SC-007) | JWT-embedded permissions (zero DB queries in common case) |
| Organization context extraction | < 10ms per request (SC-008) | `organizations_slug_unique` for subdomain, JWT for session |
| Audit event queryable | < 1s after operation (SC-009) | `audit_events_tenant_timestamp_idx` composite |
