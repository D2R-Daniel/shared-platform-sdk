/**
 * Shared Platform SDK
 *
 * A unified SDK for authentication, user management, notifications,
 * audit logging, and feature flags across all platform services.
 *
 * @example
 * ```typescript
 * import { AuthClient, UserClient, NotificationClient } from '@platform/shared-sdk';
 * import { AuditClient, FeatureFlagClient } from '@platform/shared-sdk';
 * import { RoleClient, TeamClient, InvitationClient } from '@platform/shared-sdk';
 *
 * const auth = new AuthClient({ issuerUrl: 'https://auth.example.com' });
 * const users = new UserClient({ baseUrl: 'https://api.example.com' });
 * ```
 */

export { AuthClient } from './auth';
export { UserClient } from './users';
export { NotificationClient } from './notifications';
export { AuditClient } from './audit';
// Re-export key audit error classes
export {
  AuditError,
  AuditEntryNotFoundError,
  IntegrityViolationError,
} from './audit';
// Re-export audit event constants
export {
  ALL_AUDIT_EVENT_TYPES,
  AUDIT_EVENT_CATEGORIES,
} from './audit';
export { FeatureFlagClient } from './features';
export { TenantClient, DepartmentClient } from './tenants';
export { RoleClient, matchesPermission, hasAnyPermission, hasAllPermissions } from './permissions';
export { TeamClient } from './teams';
export { InvitationClient } from './invitations';
export { EmailClient } from './email';
export { SettingsClient } from './settings';
export { WebhookClient, generateSignature, verifySignature } from './webhooks';
export { APIKeyClient } from './apikeys';
export { SessionClient } from './sessions';

export type {
  // Auth types
  TokenResponse,
  TokenIntrospection,
  UserInfo,
  UserContext,
  Session,
  Role,
  Permission,
} from './auth';

// Re-export AssuranceLevel as a value (enum)
export { AssuranceLevel } from './auth';

export type {
  // User types
  User,
  UserSummary,
  UserProfile,
  UserPreferences,
  UserStatus,
  CreateUserRequest,
  UpdateUserRequest,
  InviteUserRequest,
  UserListResponse,
} from './users';

export type {
  // Notification types
  Notification,
  NotificationPreferences,
  NotificationCategory,
  ChannelSubscription,
  RegisteredDevice,
  EmailNotificationEvent,
  SMSNotificationEvent,
  PushNotificationEvent,
} from './notifications';

export type {
  // Audit types
  AuditEvent,
  AuditEventType,
  AuditLogEntry,
  AuditLogListResponse,
  AuditLogQuery,
  AuditActor,
  AuditTarget,
  AuditChange,
  AuditContext,
  AuditSeverity,
  CreateAuditEventRequest,
  BatchAuditResult,
  RetentionPolicy,
  ExportRequest as AuditExportRequest,
  ExportResult as AuditExportResult,
  IntegrityVerificationResult,
  IntegrityProof,
  AuditStream,
  CreateStreamRequest,
  UpdateStreamRequest,
  AlertRule,
  CreateAlertRuleRequest,
  UpdateAlertRuleRequest,
  PortalLink,
} from './audit';

export type {
  // Feature flag types
  FeatureFlag,
  FeatureFlagEvaluation,
  EvaluationContext,
  TargetingRule,
} from './features';

export type {
  // Tenant types
  Tenant,
  TenantSummary,
  TenantStatus,
  SubscriptionPlan,
  TenantFeatures,
  SSOConfig,
  SSOProvider,
  Department,
  DepartmentSummary,
  DepartmentTree,
  DepartmentWithDetails,
  CreateTenantRequest,
  UpdateTenantRequest,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
} from './tenants';

export type {
  // Role and permission types
  Role as RoleModel,
  RoleSummary,
  RoleAssignment,
  UserRole,
  PermissionCheckResult,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignRoleRequest,
  RoleListResponse,
} from './permissions';

export type {
  // Team types
  Team,
  TeamSummary,
  TeamTree,
  TeamWithDetails,
  TeamMember,
  TeamMemberRole,
  CreateTeamRequest,
  UpdateTeamRequest,
  AddTeamMemberRequest,
  TeamListResponse,
  TeamMembersResponse,
} from './teams';

export type {
  // Invitation types
  Invitation,
  InvitationSummary,
  InvitationStatus,
  InvitationType,
  ValidatedInvitation,
  CreateInvitationRequest,
  BulkInvitationRequest,
  BulkInvitationResult,
  AcceptInvitationRequest,
  AcceptInvitationResponse,
  InvitationListResponse,
} from './invitations';

export type {
  // Email types
  EmailTemplate,
  EmailConfig,
  SendEmailRequest,
  SendTemplateRequest,
  EmailSendResult,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  TemplateListResponse,
  TemplateCategory,
  // New types
  ProviderType,
  EmailSendStatus,
  DeliveryEventType,
  TemplateVersion,
  TemplateVersionListResponse,
  TemplateLocale,
  TemplateLocaleListResponse,
  TemplatePreview,
  SetTemplateLocaleRequest,
  Attachment,
  BatchRecipient,
  BatchSendRequest,
  BatchSendFailure,
  BatchSendResult,
  EmailSendRecord,
  SendHistoryListResponse,
  ListSendHistoryParams,
  EmailDeliveryEvent,
  EmailSendDetails,
  EmailProvider,
  ConfigureProviderRequest,
  EmailProviderListResponse,
} from './email';

export type {
  // Settings types
  SettingCategory,
  SettingType,
  SettingDefinition,
  TenantSettings,
  SettingValue,
  AllSettingsResponse,
  CategorySettingsResponse,
  // New types
  ChangeSource,
  Environment,
  SettingSource,
  ImportStrategy,
  ExportFormat,
  SettingChange,
  SettingChangeListResponse,
  EnvironmentOverride,
  EnvironmentOverrideListResponse,
  ExportResult,
  ImportError,
  ImportResult,
  ImportSettingsRequest,
  LockedSetting,
  LockedSettingListResponse,
  EffectiveSetting,
  BulkUpdateItem,
  BulkUpdateError,
  BulkUpdateResult,
} from './settings';

export type {
  // Webhook types
  WebhookEvent,
  DeliveryStatus,
  Webhook,
  WebhookDelivery,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  WebhookTestResult,
  WebhookListResponse,
  DeliveryListResponse,
  WebhookPayload,
} from './webhooks';

export type {
  // API Key types
  APIKeyEnvironment,
  APIKey,
  APIKeySummary,
  CreateAPIKeyRequest,
  CreateAPIKeyResponse,
  UpdateAPIKeyRequest,
  ValidateAPIKeyResponse,
  APIKeyUsage,
  RateLimitInfo,
  APIKeyListResponse,
} from './apikeys';

export type {
  // Session types
  SessionStatus,
  DeviceType,
  ConcurrentLimitAction,
  DeviceInfo,
  GeoLocation,
  SessionDetail,
  SessionActivity,
  SessionPolicy,
  SessionStats,
  SessionListOptions,
  AdminSessionListOptions,
  SessionListResponse,
  SessionActivityResponse,
} from './sessions';

// Re-export ActivityType as a value (enum)
export { ActivityType } from './sessions';

export const VERSION = '0.1.0';
