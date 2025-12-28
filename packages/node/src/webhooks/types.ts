/**
 * Webhooks service types.
 */

export type WebhookEvent =
  // User events
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.activated'
  | 'user.deactivated'
  // Team events
  | 'team.created'
  | 'team.updated'
  | 'team.deleted'
  | 'team.member_added'
  | 'team.member_removed'
  | 'team.member_role_changed'
  // Invitation events
  | 'invitation.created'
  | 'invitation.sent'
  | 'invitation.accepted'
  | 'invitation.expired'
  | 'invitation.revoked'
  // Role events
  | 'role.created'
  | 'role.updated'
  | 'role.deleted'
  | 'role.assigned'
  | 'role.removed'
  // Session events
  | 'session.created'
  | 'session.expired'
  // Settings events
  | 'settings.updated';

export type DeliveryStatus = 'pending' | 'success' | 'failed' | 'retrying';

export interface Webhook {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  url: string;
  secret: string;
  events: WebhookEvent[];
  headers?: Record<string, string>;
  is_active: boolean;
  retry_count: number;
  timeout_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface WebhookSummary {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  is_active: boolean;
  created_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event: WebhookEvent;
  payload: Record<string, unknown>;
  request_headers?: Record<string, string>;
  response_status?: number;
  response_headers?: Record<string, string>;
  response_body?: string;
  duration_ms?: number;
  attempts: number;
  status: DeliveryStatus;
  error_message?: string;
  next_retry_at?: string;
  delivered_at?: string;
  created_at: string;
}

export interface CreateWebhookRequest {
  name: string;
  description?: string;
  url: string;
  events: WebhookEvent[];
  headers?: Record<string, string>;
  retry_count?: number;
  timeout_seconds?: number;
}

export interface UpdateWebhookRequest {
  name?: string;
  description?: string;
  url?: string;
  events?: WebhookEvent[];
  headers?: Record<string, string>;
  is_active?: boolean;
  retry_count?: number;
  timeout_seconds?: number;
}

export interface WebhookTestResult {
  success: boolean;
  status_code?: number;
  duration_ms?: number;
  error?: string;
}

export interface WebhookListResponse {
  data: Webhook[];
  total: number;
  page: number;
  page_size: number;
}

export interface DeliveryListResponse {
  data: WebhookDelivery[];
  total: number;
  page: number;
  page_size: number;
}

export interface WebhookPayload {
  id: string;
  event: WebhookEvent;
  timestamp: string;
  tenant_id: string;
  data: Record<string, unknown>;
}

export interface EventInfo {
  name: WebhookEvent;
  description: string;
  category: string;
}

export interface ListWebhooksParams {
  page?: number;
  page_size?: number;
  is_active?: boolean;
  event?: WebhookEvent;
}

export interface ListDeliveriesParams {
  page?: number;
  page_size?: number;
  status?: DeliveryStatus;
  event?: WebhookEvent;
}
