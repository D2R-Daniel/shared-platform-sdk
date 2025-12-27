/**
 * Notification type definitions
 */

export interface Notification {
  id: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  category: string;
  title: string;
  body?: string;
  data?: Record<string, any>;
  actionUrl?: string;
  imageUrl?: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export interface NotificationListResponse {
  data: Notification[];
  pagination: Pagination;
}

export interface NotificationPreferences {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  pushEnabled?: boolean;
  inAppEnabled?: boolean;
  digestFrequency?: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'never';
  digestTime?: string;
  quietHours?: {
    enabled: boolean;
    start?: string;
    end?: string;
    timezone?: string;
  };
  categories?: Record<string, { email?: boolean; sms?: boolean; push?: boolean; inApp?: boolean }>;
}

export interface NotificationCategory {
  id: string;
  name: string;
  description?: string;
  defaultChannels: string[];
  required: boolean;
  configurable: boolean;
}

export interface ChannelSubscription {
  id: string;
  channel: string;
  topic: string;
  subscribedAt: string;
}

export interface RegisteredDevice {
  id: string;
  platform: 'ios' | 'android' | 'web';
  name?: string;
  model?: string;
  lastActiveAt?: string;
  registeredAt: string;
}
