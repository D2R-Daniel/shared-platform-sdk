# Data Model: @dream/ui

**Feature**: 008-shared-ui-components | **Date**: 2026-02-07

## Overview

`@dream/ui` is a pure consumer of existing types from `@dream/types`, `@dream/auth`, `@dream/rbac`, `@dream/multi-tenant`, and `@dream/errors`. It does NOT define new database entities. It defines:

1. **ApiAdapter interface** — the contract between UI components and backends
2. **DreamUIProvider config** — branding, adapter, and error callback
3. **Component prop interfaces** — per-component props with slots
4. **Theme token definitions** — CSS custom property contract

## 1. ApiAdapter Interface

The central data contract. Products implement this or use the default `createFetchAdapter()`.

```typescript
// Types consumed from @dream/types
import type {
  User, UserUpdateInput,
  Organization, OrgCreateInput, OrgUpdateInput,
  Role, RoleCreateInput,
  Invitation, InvitationStatus,
  PaginatedResponse,
} from '@dream/types';

// Pagination params (offset-based, matches @dream/errors PaginationParams)
interface ListParams {
  page?: number;
  pageSize?: number;
}

// === ApiAdapter: all data operations consumed by @dream/ui components ===

interface ApiAdapter {
  // Members (consumed by MemberList, RoleAssignmentDialog)
  listMembers(params: ListParams): Promise<PaginatedResponse<MemberWithRole>>;
  removeMember(userId: string): Promise<void>;

  // Invitations (consumed by InviteMemberDialog, MemberList)
  listInvitations(params: ListParams): Promise<PaginatedResponse<Invitation>>;
  createInvitation(data: CreateInvitationInput): Promise<Invitation>;
  revokeInvitation(id: string): Promise<void>;

  // Roles (consumed by RoleEditor, RoleAssignmentDialog, InviteMemberDialog)
  listRoles(): Promise<Role[]>;
  createRole(data: RoleCreateInput): Promise<Role>;
  updateRole(id: string, data: Partial<RoleCreateInput>): Promise<Role>;
  deleteRole(id: string): Promise<void>;
  assignRole(userId: string, roleId: string): Promise<void>;

  // Organization (consumed by OrgSettingsForm, OrgCreateDialog)
  getOrganization(): Promise<Organization>;
  updateOrganization(data: OrgUpdateInput): Promise<Organization>;
  createOrganization(data: OrgCreateInput): Promise<Organization>;

  // Audit (consumed by AuditLogViewer)
  listAuditEvents(params: AuditListParams): Promise<PaginatedResponse<AuditEvent>>;

  // API Keys (consumed by ApiKeyManager)
  listApiKeys(): Promise<ApiKey[]>;
  createApiKey(data: CreateApiKeyInput): Promise<ApiKeyWithSecret>;
  revokeApiKey(id: string): Promise<void>;

  // Webhooks (consumed by WebhookManager)
  listWebhooks(): Promise<Webhook[]>;
  createWebhook(data: CreateWebhookInput): Promise<Webhook>;
  updateWebhook(id: string, data: Partial<CreateWebhookInput>): Promise<Webhook>;
  deleteWebhook(id: string): Promise<void>;
  testWebhook(id: string, eventType: string): Promise<WebhookTestResult>;

  // Sessions (consumed by ActiveSessions, SessionManager)
  listUserSessions(): Promise<SessionInfo[]>;
  listAllSessions(params: ListParams): Promise<PaginatedResponse<SessionInfo>>;
  revokeSession(id: string): Promise<void>;

  // User Profile (consumed by UserProfileForm, ChangePasswordForm)
  updateProfile(data: UserUpdateInput): Promise<User>;
  changePassword(data: ChangePasswordInput): Promise<void>;
  uploadAvatar(file: File): Promise<{ url: string }>;

  // MFA (consumed by MfaSetup, MfaChallenge, SecuritySettings)
  getMfaStatus(): Promise<MfaStatus>;
  initiateMfaSetup(): Promise<MfaSetupData>;
  verifyMfaSetup(code: string): Promise<{ backupCodes: string[] }>;
  disableMfa(code: string): Promise<void>;

  // Notification Preferences (consumed by NotificationPreferences)
  getNotificationPreferences(): Promise<NotificationPrefs>;
  updateNotificationPreferences(data: NotificationPrefs): Promise<NotificationPrefs>;

  // Connected Accounts (consumed by ConnectedAccounts)
  listConnectedAccounts(): Promise<ConnectedAccount[]>;
  disconnectAccount(provider: string): Promise<void>;
}
```

## 2. Supporting Types (defined by @dream/ui)

These types are specific to UI components and not part of `@dream/types`:

```typescript
// Member with role info (joined from User + Role assignment)
interface MemberWithRole {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: Role;
  joinedAt: Date;
}

// Invitation creation
interface CreateInvitationInput {
  email: string;
  roleId: string;
}

// Audit events
interface AuditEvent {
  id: string;
  timestamp: Date;
  actorId: string;
  actorName: string;
  actorEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  ipAddress?: string;
  changes?: { before: Record<string, unknown>; after: Record<string, unknown> };
  metadata?: Record<string, unknown>;
}

interface AuditListParams extends ListParams {
  dateFrom?: Date;
  dateTo?: Date;
  actorId?: string;
  action?: string;
  resource?: string;
}

// API Keys
interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

interface ApiKeyWithSecret extends ApiKey {
  key: string; // Full key, shown once
}

interface CreateApiKeyInput {
  name: string;
  scopes: string[];
  expiresAt?: Date;
}

// Webhooks
interface Webhook {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  secret: string;
  lastDeliveryAt?: Date;
  lastDeliveryStatus?: number;
  createdAt: Date;
}

interface CreateWebhookInput {
  url: string;
  events: string[];
}

interface WebhookTestResult {
  statusCode: number;
  responseBody?: string;
  duration: number;
}

// Sessions
interface SessionInfo {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  deviceType: string;
  browser?: string;
  ipAddress: string;
  location?: string;
  lastActiveAt: Date;
  createdAt: Date;
  isCurrent: boolean;
}

// Password
interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

// MFA
interface MfaStatus {
  isEnabled: boolean;
  method?: 'totp';
  enabledAt?: Date;
}

interface MfaSetupData {
  secret: string;
  qrCodeUrl: string;
}

// Notifications
interface NotificationPrefs {
  categories: NotificationCategory[];
}

interface NotificationCategory {
  id: string;
  name: string;
  email: boolean;
  inApp: boolean;
}

// Connected Accounts
interface ConnectedAccount {
  provider: string;
  providerDisplayName: string;
  email: string;
  connectedAt: Date;
}
```

## 3. DreamUIProvider Config

```typescript
interface DreamUIConfig {
  apiAdapter: ApiAdapter;
  branding?: BrandingConfig;
  onError?: (error: DreamUIError) => void;
}

interface BrandingConfig {
  logo?: string;
  productName?: string;
  supportUrl?: string;
  termsUrl?: string;
  privacyUrl?: string;
}

interface DreamUIError {
  component: string;   // e.g., 'MemberList', 'LoginForm'
  errorType: string;   // e.g., 'fetch_error', 'validation_error'
  action: string;      // e.g., 'load_members', 'submit_login'
  error: Error;        // original error
}
```

## 4. Theme Token Contract

50+ CSS custom properties. Products override in their `globals.css`.

| Token | Default (Light) | Dark Override | Used By |
|-------|----------------|--------------|---------|
| `--dream-color-primary` | `222 47% 11%` | `210 40% 98%` | Buttons, links, focus rings |
| `--dream-color-primary-foreground` | `210 40% 98%` | `222 47% 11%` | Text on primary backgrounds |
| `--dream-color-secondary` | `210 40% 96%` | `217 33% 18%` | Secondary buttons |
| `--dream-color-accent` | `210 40% 96%` | `217 33% 18%` | Highlighted items |
| `--dream-color-destructive` | `0 84% 60%` | `0 63% 31%` | Delete buttons, error states |
| `--dream-color-destructive-foreground` | `210 40% 98%` | `210 40% 98%` | Text on destructive |
| `--dream-color-muted` | `210 40% 96%` | `217 33% 18%` | Disabled, subtle |
| `--dream-color-muted-foreground` | `215 16% 47%` | `215 20% 65%` | Secondary text |
| `--dream-color-background` | `0 0% 100%` | `222 84% 5%` | Page background |
| `--dream-color-foreground` | `222 84% 5%` | `210 40% 98%` | Primary text |
| `--dream-color-card` | `0 0% 100%` | `222 84% 5%` | Card background |
| `--dream-color-card-foreground` | `222 84% 5%` | `210 40% 98%` | Card text |
| `--dream-color-border` | `214 32% 91%` | `217 33% 18%` | Borders, dividers |
| `--dream-color-input` | `214 32% 91%` | `217 33% 18%` | Input borders |
| `--dream-color-ring` | `222 84% 5%` | `213 31% 91%` | Focus ring |
| `--dream-radius-sm` | `0.25rem` | — | Small elements |
| `--dream-radius-md` | `0.375rem` | — | Default radius |
| `--dream-radius-lg` | `0.5rem` | — | Cards, dialogs |
| `--dream-radius-xl` | `0.75rem` | — | Large cards |
| `--dream-font-sans` | `system-ui, sans-serif` | — | Body text |
| `--dream-font-mono` | `ui-monospace, monospace` | — | Code, API keys |

## 5. Entity Relationships

```
DreamUIProvider
  ├── uses ApiAdapter (injected via context)
  ├── provides BrandingConfig (consumed by AuthLayout, UserButton)
  └── provides onError callback (called by all data-fetching components)

Components consume from existing providers:
  AuthProvider → useAuth() → SessionUser (user identity, signIn, signOut)
  TenantProvider → useTenant() → Organization[], switchOrganization()
  RbacContext → usePermission(), useRole() → permission gates

ApiAdapter maps to backend:
  listMembers() → GET /api/platform/members
  createInvitation() → POST /api/platform/invitations
  listAuditEvents() → GET /api/platform/audit
  ... (standard REST conventions)
```
