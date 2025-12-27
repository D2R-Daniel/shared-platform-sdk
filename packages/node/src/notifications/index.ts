/**
 * Notification module
 */

export { NotificationClient } from './client';
export type { NotificationClientOptions } from './client';

export type {
  Notification,
  NotificationPreferences,
  NotificationCategory,
  ChannelSubscription,
  RegisteredDevice,
  NotificationListResponse,
} from './types';

export type {
  EmailNotificationEvent,
  SMSNotificationEvent,
  PushNotificationEvent,
  NotificationSentEvent,
  EmailRecipient,
  SMSRecipient,
  PushTarget,
  EventSource,
} from './events';
