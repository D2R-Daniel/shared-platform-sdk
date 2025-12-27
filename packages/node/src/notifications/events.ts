/**
 * Notification event types for event-driven notifications.
 * These correspond to the Avro schemas in events/notifications/
 */

export type EmailEventType = 'TRANSACTIONAL' | 'MARKETING' | 'SYSTEM' | 'DIGEST';
export type SMSEventType = 'TRANSACTIONAL' | 'OTP' | 'ALERT' | 'MARKETING';
export type PushEventType = 'ALERT' | 'INFO' | 'ACTION_REQUIRED' | 'SILENT';
export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type DeliveryStatus = 'SENT' | 'DELIVERED' | 'FAILED' | 'BOUNCED' | 'REJECTED' | 'DEFERRED' | 'EXPIRED';

export interface EventSource {
  service: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
}

export interface EmailRecipient {
  userId?: string;
  email: string;
  name?: string;
  locale?: string;
}

export interface EmailTemplate {
  templateId: string;
  version?: string;
  variables: Record<string, string>;
}

export interface EmailTracking {
  enableOpenTracking?: boolean;
  enableClickTracking?: boolean;
  campaignId?: string;
  tags?: string[];
}

export interface EmailNotificationEvent {
  eventId: string;
  eventType: EmailEventType;
  timestamp: Date | string;
  tenantId: string;
  recipient: EmailRecipient;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  template: EmailTemplate;
  priority?: Priority;
  category: string;
  tracking?: EmailTracking;
  replyTo?: string;
  headers?: Record<string, string>;
  metadata?: Record<string, string>;
  correlationId?: string;
  source: EventSource;
}

export interface SMSRecipient {
  userId?: string;
  phoneNumber: string;
  name?: string;
  countryCode?: string;
}

export interface SMSTemplate {
  templateId: string;
  version?: string;
  variables: Record<string, string>;
}

export interface SMSNotificationEvent {
  eventId: string;
  eventType: SMSEventType;
  timestamp: Date | string;
  tenantId: string;
  recipient: SMSRecipient;
  template?: SMSTemplate;
  message?: string;
  priority?: Priority;
  category: string;
  senderId?: string;
  validityPeriod?: number;
  metadata?: Record<string, string>;
  correlationId?: string;
  source: EventSource;
}

export interface DeviceToken {
  token: string;
  platform: 'IOS' | 'ANDROID' | 'WEB' | 'HUAWEI';
  appId?: string;
}

export interface PushTarget {
  userId?: string;
  deviceTokens?: DeviceToken[];
  topic?: string;
  condition?: string;
}

export interface PushNotificationContent {
  title: string;
  body: string;
  imageUrl?: string;
  icon?: string;
  badge?: number;
  sound?: string;
  clickAction?: string;
  tag?: string;
}

export interface PushNotificationEvent {
  eventId: string;
  eventType: PushEventType;
  timestamp: Date | string;
  tenantId: string;
  target: PushTarget;
  notification: PushNotificationContent;
  data?: Record<string, string>;
  priority?: 'NORMAL' | 'HIGH';
  category: string;
  ttl?: number;
  collapseKey?: string;
  metadata?: Record<string, string>;
  correlationId?: string;
  source: EventSource;
}

export interface ProviderInfo {
  name: string;
  messageId?: string;
  responseCode?: string;
  responseMessage?: string;
}

export interface DeliveryTiming {
  queuedAt: Date | string;
  sentAt?: Date | string;
  deliveredAt?: Date | string;
  processingTimeMs: number;
}

export interface NotificationSentEvent {
  eventId: string;
  timestamp: Date | string;
  originalEventId: string;
  notificationType: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  tenantId: string;
  recipient: { userId?: string; destination: string };
  status: DeliveryStatus;
  statusDetails?: string;
  provider: ProviderInfo;
  timing: DeliveryTiming;
  templateId?: string;
  category: string;
  metadata?: Record<string, string>;
  correlationId?: string;
}
