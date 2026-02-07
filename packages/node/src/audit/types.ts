/**
 * Audit logging type definitions.
 */

// ---------------------------------------------------------------------------
// Enums as union types
// ---------------------------------------------------------------------------

export type AuditSeverity = 'info' | 'warning' | 'critical';

export type AuditActorType = 'user' | 'service' | 'system' | 'api_key';

export type AuditSource = 'api' | 'dashboard' | 'system' | 'webhook';

export type ExportFormat = 'json' | 'csv' | 'cef';

export type ExportDestinationType = 'download' | 's3' | 'gcs';

export type ExportStatus = 'processing' | 'completed' | 'failed';

export type ArchiveFormat = 'json' | 'parquet';

export type StreamDestinationType =
  | 'webhook'
  | 'datadog'
  | 'splunk'
  | 's3'
  | 'gcs'
  | 'http';

export type AlertNotificationChannelType = 'email' | 'webhook' | 'slack';

// ---------------------------------------------------------------------------
// Event type union (expanded, backward-compatible)
// ---------------------------------------------------------------------------

export type AuditEventType =
  // Authentication events
  | 'auth.login.success'
  | 'auth.login.failure'
  | 'auth.logout'
  | 'auth.password.change'
  | 'auth.password.reset'
  | 'auth.mfa.enabled'
  | 'auth.mfa.disabled'
  | 'auth.session.created'
  | 'auth.session.revoked'
  | 'auth.token.refreshed'
  // User management events
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.suspended'
  | 'user.activated'
  | 'user.role.assigned'
  | 'user.role.removed'
  | 'user.invited'
  | 'user.invitation.accepted'
  // Resource events
  | 'resource.created'
  | 'resource.updated'
  | 'resource.deleted'
  | 'resource.accessed'
  // Team events
  | 'team.created'
  | 'team.updated'
  | 'team.deleted'
  | 'team.member.added'
  | 'team.member.removed'
  | 'team.member.role.changed'
  // Settings events
  | 'settings.updated'
  | 'settings.reset'
  // Webhook events
  | 'webhook.created'
  | 'webhook.updated'
  | 'webhook.deleted'
  // API Key events
  | 'apikey.created'
  | 'apikey.revoked'
  | 'apikey.rotated'
  // Audit system events
  | 'audit.export.requested'
  | 'audit.export.completed'
  | 'audit.integrity.violation'
  | 'audit.stream.created'
  | 'audit.stream.failed'
  | 'audit.alert.triggered'
  // System events
  | 'system.error'
  | 'system.warning'
  // Custom
  | 'custom'
  | string; // Allow custom event type strings

// ---------------------------------------------------------------------------
// Core models
// ---------------------------------------------------------------------------

export interface GeoLocation {
  country: string;
  country_code: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface AuditActor {
  id: string;
  type: AuditActorType;
  name?: string;
  email?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditTarget {
  id: string;
  type: string;
  name?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditChange {
  field: string;
  old_value?: unknown;
  new_value?: unknown;
  type?: string;
}

export interface AuditContext {
  ip_address?: string;
  user_agent?: string;
  geo_location?: GeoLocation;
  session_id?: string;
  request_id?: string;
  source?: AuditSource;
}

export interface AuditLogEntry {
  id: string;
  tenant_id: string;
  event_type: AuditEventType;
  action: string;
  description?: string;
  actor: AuditActor;
  targets: AuditTarget[];
  changes: AuditChange[];
  metadata?: Record<string, unknown>;
  severity: AuditSeverity;
  context?: AuditContext;
  integrity_hash?: string;
  previous_hash?: string;
  idempotency_key?: string;
  created_at: string;
}

export interface Pagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next?: boolean;
  has_previous?: boolean;
}

export interface AuditLogListResponse {
  data: AuditLogEntry[];
  pagination: Pagination;
}

// ---------------------------------------------------------------------------
// Request / query types
// ---------------------------------------------------------------------------

export interface CreateAuditEventRequest {
  event_type: AuditEventType;
  action: string;
  description?: string;
  actor: AuditActor;
  targets?: AuditTarget[];
  changes?: AuditChange[];
  metadata?: Record<string, unknown>;
  severity?: AuditSeverity;
  idempotency_key?: string;
}

export interface BatchAuditResult {
  logged_count: number;
  failed_count: number;
  errors: Array<{ index: number; message: string }>;
}

export interface AuditLogQuery {
  event_type?: AuditEventType;
  event_types?: AuditEventType[];
  actor_id?: string;
  actor_type?: AuditActorType;
  target_id?: string;
  target_type?: string;
  severity?: AuditSeverity;
  start_date?: Date | string;
  end_date?: Date | string;
  search?: string;
  sort?: string;
  page?: number;
  page_size?: number;
}

// ---------------------------------------------------------------------------
// Event type management
// ---------------------------------------------------------------------------

export interface AuditEventTypeDefinition {
  name: string;
  category: string;
  description?: string;
  severity: AuditSeverity;
  schema?: Record<string, unknown>; // JSON Schema
  auto_capture: boolean;
  version: number;
}

export interface CreateEventTypeRequest {
  name: string;
  category: string;
  description?: string;
  severity?: AuditSeverity;
  schema?: Record<string, unknown>;
  auto_capture?: boolean;
}

export interface UpdateEventTypeRequest {
  description?: string;
  severity?: AuditSeverity;
  schema?: Record<string, unknown>;
  auto_capture?: boolean;
}

// ---------------------------------------------------------------------------
// Retention policy
// ---------------------------------------------------------------------------

export interface RetentionPolicy {
  retention_days: number; // minimum 90
  archive_enabled: boolean;
  archive_destination?: string;
  archive_format?: ArchiveFormat;
  auto_delete_after_archive: boolean;
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export interface ExportDestinationConfig {
  bucket?: string;
  prefix?: string;
  region?: string;
  credentials?: Record<string, string>;
}

export interface ExportRequest {
  query: AuditLogQuery;
  format: ExportFormat;
  destination?: ExportDestinationType;
  destination_config?: ExportDestinationConfig;
}

export interface ExportResult {
  export_id: string;
  status: ExportStatus;
  record_count?: number;
  file_size_bytes?: number;
  download_url?: string;
  expires_at?: string;
  started_at: string;
  completed_at?: string;
}

// ---------------------------------------------------------------------------
// Integrity verification
// ---------------------------------------------------------------------------

export interface IntegrityVerificationResult {
  verified: boolean;
  entries_checked: number;
  first_invalid_entry_id?: string;
  reason?: string;
  verified_range: {
    start_date: string;
    end_date: string;
  };
}

export interface IntegrityProof {
  entry_id: string;
  integrity_hash: string;
  previous_hash: string;
  chain_position: number;
  verification_data: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// SIEM streaming
// ---------------------------------------------------------------------------

export interface StreamFilter {
  event_types?: AuditEventType[];
  severity?: AuditSeverity[];
  actor_types?: AuditActorType[];
}

export interface AuditStream {
  id: string;
  name: string;
  description?: string;
  destination_type: StreamDestinationType;
  destination_config: Record<string, unknown>;
  filter?: StreamFilter;
  is_active: boolean;
  last_delivery_at?: string;
  error_count: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateStreamRequest {
  name: string;
  description?: string;
  destination_type: StreamDestinationType;
  destination_config: Record<string, unknown>;
  filter?: StreamFilter;
  is_active?: boolean;
}

export interface UpdateStreamRequest {
  name?: string;
  description?: string;
  destination_config?: Record<string, unknown>;
  filter?: StreamFilter;
  is_active?: boolean;
}

export interface StreamTestResult {
  success: boolean;
  message?: string;
  latency_ms?: number;
}

// ---------------------------------------------------------------------------
// Alert rules
// ---------------------------------------------------------------------------

export interface AlertCondition {
  event_type?: AuditEventType;
  event_types?: AuditEventType[];
  severity?: AuditSeverity;
  actor_type?: AuditActorType;
  count_threshold?: number;
  time_window_minutes?: number;
  group_by?: string;
}

export interface NotificationChannel {
  type: AlertNotificationChannelType;
  config: Record<string, unknown>;
}

export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  condition: AlertCondition;
  notification_channels: NotificationChannel[];
  is_active: boolean;
  cooldown_minutes: number;
  last_triggered_at?: string;
  trigger_count: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateAlertRuleRequest {
  name: string;
  description?: string;
  condition: AlertCondition;
  notification_channels: NotificationChannel[];
  is_active?: boolean;
  cooldown_minutes?: number;
}

export interface UpdateAlertRuleRequest {
  name?: string;
  description?: string;
  condition?: AlertCondition;
  notification_channels?: NotificationChannel[];
  is_active?: boolean;
  cooldown_minutes?: number;
}

export interface AlertRuleTestResult {
  would_trigger: boolean;
  matching_events_count: number;
  sample_events: AuditLogEntry[];
}

// ---------------------------------------------------------------------------
// Portal
// ---------------------------------------------------------------------------

export interface PortalLink {
  url: string;
  expires_at: string;
  organization_id: string;
}

// ---------------------------------------------------------------------------
// Backward-compatible aliases (deprecated -- use new names)
// ---------------------------------------------------------------------------

/** @deprecated Use AuditLogQuery instead */
export type ListAuditLogsParams = AuditLogQuery;

/** @deprecated Use CreateAuditEventRequest instead */
export type AuditEvent = CreateAuditEventRequest;
