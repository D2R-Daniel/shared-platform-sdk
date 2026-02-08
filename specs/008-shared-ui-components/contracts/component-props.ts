/**
 * @dream/ui Component Props Contracts
 *
 * This file defines the TypeScript interfaces for all @dream/ui component props.
 * It serves as the API contract for Phase 1-4 implementation.
 *
 * NOTE: This is a DESIGN ARTIFACT, not runtime code. The actual implementations
 * will live in packages/dream/ui/src/.
 */

import type { ReactNode } from 'react';
import type { SessionUser, SignInOptions } from '@dream/auth/react';
import type { Organization } from '@dream/multi-tenant/react';
import type { Role } from '@dream/types';

// ============================================================
// THEME & PROVIDER
// ============================================================

export interface BrandingConfig {
  logo?: string;
  productName?: string;
  supportUrl?: string;
  termsUrl?: string;
  privacyUrl?: string;
}

export interface DreamUIError {
  component: string;
  errorType: string;
  action: string;
  error: Error;
}

export interface DreamUIProviderProps {
  children: ReactNode;
  apiAdapter: ApiAdapter;
  branding?: BrandingConfig;
  onError?: (error: DreamUIError) => void;
}

// ============================================================
// AUTH SURFACE (Phase 1)
// ============================================================

export interface LoginFormSlots {
  beforeFields?: ReactNode;
  afterFields?: ReactNode;
  submitButton?: (props: { isSubmitting: boolean; isValid: boolean }) => ReactNode;
  footer?: ReactNode;
  divider?: ReactNode;
}

export interface LoginFormProps {
  providers?: Array<'credentials' | 'google' | 'azure-entra' | 'generic-oidc'>;
  onSuccess?: (user: SessionUser) => void;
  onError?: (error: Error) => void;
  callbackUrl?: string;
  className?: string;
  slots?: LoginFormSlots;
}

export interface SignupFormSlots {
  beforeFields?: ReactNode;
  afterFields?: ReactNode;
  submitButton?: (props: { isSubmitting: boolean; isValid: boolean }) => ReactNode;
  footer?: ReactNode;
}

export interface SignupFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  invitationToken?: string;
  className?: string;
  slots?: SignupFormSlots;
}

export interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export interface ResetPasswordFormProps {
  token: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export interface MfaSetupProps {
  method?: 'totp';
  onComplete?: (backupCodes: string[]) => void;
  onSkip?: () => void;
  className?: string;
}

// Sealed: className only, no slots (FR-016, FR-081)
export interface MfaChallengeProps {
  method?: 'totp';
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export interface SocialLoginButtonsProps {
  providers: Array<'google' | 'azure-entra' | 'generic-oidc'>;
  layout?: 'vertical' | 'horizontal';
  callbackUrl?: string;
  className?: string;
}

export interface AuthLayoutProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

// ============================================================
// ORG MANAGEMENT SURFACE (Phase 2-3)
// ============================================================

export interface OrgSwitcherProps {
  afterSwitch?: (org: Organization) => void;
  className?: string;
}

export interface OrgSettingsFormSlots {
  afterFields?: ReactNode;
}

export interface OrgSettingsFormProps {
  onSave?: (org: Organization) => void;
  className?: string;
  slots?: OrgSettingsFormSlots;
}

export interface MemberListProps {
  pageSize?: number;
  onRemove?: (userId: string) => void;
  className?: string;
}

export interface InviteMemberDialogProps {
  defaultRole?: string;
  onInvite?: (email: string, roleId: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export interface RoleEditorProps {
  onSave?: (role: Role) => void;
  className?: string;
}

export interface RoleAssignmentDialogProps {
  userId: string;
  currentRoleId: string;
  onAssign?: (userId: string, roleId: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export interface OrgCreateDialogProps {
  onCreated?: (org: Organization) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

// ============================================================
// USER PROFILE SURFACE (Phase 2-3)
// ============================================================

export interface UserButtonSlots {
  menuItems?: ReactNode;
}

export interface UserButtonProps {
  afterSignOut?: () => void;
  className?: string;
  slots?: UserButtonSlots;
}

export interface UserProfileFormProps {
  onSave?: () => void;
  className?: string;
}

export interface ChangePasswordFormProps {
  onSuccess?: () => void;
  requireCurrent?: boolean;
  className?: string;
}

export interface NotificationPreferencesProps {
  className?: string;
}

export interface SecuritySettingsProps {
  className?: string;
}

export interface ActiveSessionsProps {
  onRevoke?: (sessionId: string) => void;
  className?: string;
}

export interface ConnectedAccountsProps {
  className?: string;
}

// ============================================================
// ADMIN SURFACE (Phase 4)
// ============================================================

export interface AuditLogViewerProps {
  pageSize?: number;
  defaultFilters?: {
    dateFrom?: Date;
    dateTo?: Date;
    action?: string;
    resource?: string;
  };
  className?: string;
}

export interface AuditLogFiltersProps {
  value?: {
    dateFrom?: Date;
    dateTo?: Date;
    actorId?: string;
    action?: string;
    resource?: string;
  };
  onChange?: (filters: AuditLogFiltersProps['value']) => void;
  className?: string;
}

// Sealed: className only (FR-081)
export interface ApiKeyCreateDialogProps {
  onCreated?: (key: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export interface ApiKeyManagerProps {
  onRevoke?: (keyId: string) => void;
  onCreate?: (key: string) => void;
  className?: string;
}

export interface WebhookManagerProps {
  onDelete?: (webhookId: string) => void;
  onCreate?: () => void;
  className?: string;
}

export interface WebhookCreateDialogProps {
  onCreated?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export interface WebhookTestDialogProps {
  webhookId: string;
  onTest?: (result: { statusCode: number; duration: number }) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export interface SessionManagerProps {
  pageSize?: number;
  onRevoke?: (sessionId: string) => void;
  className?: string;
}

// ============================================================
// API ADAPTER (see data-model.md for full interface)
// ============================================================

// Re-exported here for completeness. Full definition in data-model.md.
export interface ApiAdapter {
  // Members
  listMembers(params: { page?: number; pageSize?: number }): Promise<unknown>;
  removeMember(userId: string): Promise<void>;
  // Invitations
  createInvitation(data: { email: string; roleId: string }): Promise<unknown>;
  listInvitations(params: { page?: number; pageSize?: number }): Promise<unknown>;
  revokeInvitation(id: string): Promise<void>;
  // Roles
  listRoles(): Promise<unknown>;
  createRole(data: unknown): Promise<unknown>;
  updateRole(id: string, data: unknown): Promise<unknown>;
  deleteRole(id: string): Promise<void>;
  assignRole(userId: string, roleId: string): Promise<void>;
  // Organization
  getOrganization(): Promise<unknown>;
  updateOrganization(data: unknown): Promise<unknown>;
  createOrganization(data: unknown): Promise<unknown>;
  // Audit
  listAuditEvents(params: unknown): Promise<unknown>;
  // API Keys
  listApiKeys(): Promise<unknown>;
  createApiKey(data: unknown): Promise<unknown>;
  revokeApiKey(id: string): Promise<void>;
  // Webhooks
  listWebhooks(): Promise<unknown>;
  createWebhook(data: unknown): Promise<unknown>;
  updateWebhook(id: string, data: unknown): Promise<unknown>;
  deleteWebhook(id: string): Promise<void>;
  testWebhook(id: string, eventType: string): Promise<unknown>;
  // Sessions
  listUserSessions(): Promise<unknown>;
  listAllSessions(params: unknown): Promise<unknown>;
  revokeSession(id: string): Promise<void>;
  // User Profile
  updateProfile(data: unknown): Promise<unknown>;
  changePassword(data: { currentPassword: string; newPassword: string }): Promise<void>;
  uploadAvatar(file: File): Promise<{ url: string }>;
  // MFA
  getMfaStatus(): Promise<unknown>;
  initiateMfaSetup(): Promise<unknown>;
  verifyMfaSetup(code: string): Promise<unknown>;
  disableMfa(code: string): Promise<void>;
  // Notifications
  getNotificationPreferences(): Promise<unknown>;
  updateNotificationPreferences(data: unknown): Promise<unknown>;
  // Connected Accounts
  listConnectedAccounts(): Promise<unknown>;
  disconnectAccount(provider: string): Promise<void>;
}
