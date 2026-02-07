/**
 * Audit logging module exports.
 */

// Client
export { AuditClient } from './client';
export type { AuditClientOptions, AuditClientConfig } from './client';

// Types
export type {
  // Core models
  AuditSeverity,
  AuditActorType,
  AuditSource,
  AuditEventType,
  GeoLocation,
  AuditActor,
  AuditTarget,
  AuditChange,
  AuditContext,
  AuditLogEntry,
  Pagination,
  AuditLogListResponse,
  // Request/query
  CreateAuditEventRequest,
  BatchAuditResult,
  AuditLogQuery,
  // Event types
  AuditEventTypeDefinition,
  CreateEventTypeRequest,
  UpdateEventTypeRequest,
  // Retention
  RetentionPolicy,
  ArchiveFormat,
  // Export
  ExportFormat,
  ExportDestinationType,
  ExportStatus,
  ExportDestinationConfig,
  ExportRequest,
  ExportResult,
  // Integrity
  IntegrityVerificationResult,
  IntegrityProof,
  // Streaming
  StreamDestinationType,
  StreamFilter,
  AuditStream,
  CreateStreamRequest,
  UpdateStreamRequest,
  StreamTestResult,
  // Alerts
  AlertNotificationChannelType,
  AlertCondition,
  NotificationChannel,
  AlertRule,
  CreateAlertRuleRequest,
  UpdateAlertRuleRequest,
  AlertRuleTestResult,
  // Portal
  PortalLink,
  // Backward-compatible aliases
  ListAuditLogsParams,
  AuditEvent,
} from './types';

// Errors
export {
  AuditError,
  AuditEntryNotFoundError,
  InvalidEventTypeError,
  SchemaValidationError,
  ExportNotFoundError,
  ExportTooLargeError,
  RetentionPolicyError,
  IntegrityViolationError,
  StreamNotFoundError,
  StreamTestError,
  AlertRuleNotFoundError,
  IdempotencyConflictError,
} from './errors';

// Event constants
export {
  // Auth events
  AUTH_LOGIN_SUCCESS,
  AUTH_LOGIN_FAILURE,
  AUTH_LOGOUT,
  AUTH_PASSWORD_CHANGE,
  AUTH_PASSWORD_RESET,
  AUTH_MFA_ENABLED,
  AUTH_MFA_DISABLED,
  AUTH_SESSION_CREATED,
  AUTH_SESSION_REVOKED,
  AUTH_TOKEN_REFRESHED,
  // User events
  USER_CREATED,
  USER_UPDATED,
  USER_DELETED,
  USER_SUSPENDED,
  USER_ACTIVATED,
  USER_ROLE_ASSIGNED,
  USER_ROLE_REMOVED,
  USER_INVITED,
  USER_INVITATION_ACCEPTED,
  // Team events
  TEAM_CREATED,
  TEAM_UPDATED,
  TEAM_DELETED,
  TEAM_MEMBER_ADDED,
  TEAM_MEMBER_REMOVED,
  TEAM_MEMBER_ROLE_CHANGED,
  // Resource events
  RESOURCE_CREATED,
  RESOURCE_UPDATED,
  RESOURCE_DELETED,
  RESOURCE_ACCESSED,
  // Settings events
  SETTINGS_UPDATED,
  SETTINGS_RESET,
  // Webhook events
  WEBHOOK_CREATED,
  WEBHOOK_UPDATED,
  WEBHOOK_DELETED,
  // API Key events
  APIKEY_CREATED,
  APIKEY_REVOKED,
  APIKEY_ROTATED,
  // Audit system events
  AUDIT_EXPORT_REQUESTED,
  AUDIT_EXPORT_COMPLETED,
  AUDIT_INTEGRITY_VIOLATION,
  AUDIT_STREAM_CREATED,
  AUDIT_STREAM_FAILED,
  AUDIT_ALERT_TRIGGERED,
  // System events
  SYSTEM_ERROR,
  SYSTEM_WARNING,
  // Grouped
  AUDIT_EVENT_CATEGORIES,
  ALL_AUDIT_EVENT_TYPES,
} from './events';
