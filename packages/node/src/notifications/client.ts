import axios, { AxiosInstance } from 'axios';
import {
  Notification,
  NotificationListResponse,
  NotificationPreferences,
  NotificationCategory,
  ChannelSubscription,
  RegisteredDevice,
} from './types';

export interface NotificationClientOptions {
  baseUrl: string;
  accessToken?: string;
  timeout?: number;
}

export interface ListNotificationsParams {
  page?: number;
  pageSize?: number;
  status?: 'unread' | 'read' | 'all';
  category?: string;
  type?: 'email' | 'sms' | 'push' | 'in_app';
}

export class NotificationClient {
  private http: AxiosInstance;
  private accessToken?: string;

  constructor(options: NotificationClientOptions) {
    this.accessToken = options.accessToken;

    this.http = axios.create({
      baseURL: `${options.baseUrl.replace(/\/$/, '')}/api/v1`,
      timeout: options.timeout ?? 30000,
      headers: this.buildHeaders(),
    });
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    return headers;
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
    this.http.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  async list(params: ListNotificationsParams = {}): Promise<NotificationListResponse> {
    const response = await this.http.get<NotificationListResponse>('/notifications', {
      params: {
        page: params.page ?? 1,
        page_size: params.pageSize ?? 20,
        status: params.status ?? 'all',
        category: params.category,
        type: params.type,
      },
    });
    return response.data;
  }

  async get(notificationId: string): Promise<Notification> {
    const response = await this.http.get<Notification>(`/notifications/${notificationId}`);
    return response.data;
  }

  async delete(notificationId: string): Promise<void> {
    await this.http.delete(`/notifications/${notificationId}`);
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await this.http.post<Notification>(`/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllAsRead(category?: string, before?: string): Promise<number> {
    const response = await this.http.post<{ updated_count: number }>('/notifications/read-all', {
      category,
      before,
    });
    return response.data.updated_count;
  }

  async getUnreadCount(): Promise<{ count: number; byCategory?: Record<string, number> }> {
    const response = await this.http.get<{ count: number; by_category?: Record<string, number> }>(
      '/notifications/unread-count'
    );
    return {
      count: response.data.count,
      byCategory: response.data.by_category,
    };
  }

  async getPreferences(): Promise<NotificationPreferences> {
    const response = await this.http.get<NotificationPreferences>('/notifications/preferences');
    return response.data;
  }

  async updatePreferences(data: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await this.http.put<NotificationPreferences>('/notifications/preferences', data);
    return response.data;
  }

  async listCategories(): Promise<NotificationCategory[]> {
    const response = await this.http.get<{ categories: NotificationCategory[] }>('/notifications/categories');
    return response.data.categories;
  }

  async listSubscriptions(): Promise<ChannelSubscription[]> {
    const response = await this.http.get<{ subscriptions: ChannelSubscription[] }>('/notifications/subscriptions');
    return response.data.subscriptions;
  }

  async subscribe(channel: string, topic: string, endpoint?: string): Promise<ChannelSubscription> {
    const response = await this.http.post<ChannelSubscription>('/notifications/subscriptions', {
      channel,
      topic,
      endpoint,
    });
    return response.data;
  }

  async unsubscribe(subscriptionId: string): Promise<void> {
    await this.http.delete(`/notifications/subscriptions/${subscriptionId}`);
  }

  async listDevices(): Promise<RegisteredDevice[]> {
    const response = await this.http.get<{ devices: RegisteredDevice[] }>('/notifications/devices');
    return response.data.devices;
  }

  async registerDevice(
    token: string,
    platform: 'ios' | 'android' | 'web',
    name?: string,
    model?: string
  ): Promise<RegisteredDevice> {
    const response = await this.http.post<RegisteredDevice>('/notifications/devices', {
      token,
      platform,
      name,
      model,
    });
    return response.data;
  }

  async unregisterDevice(deviceId: string): Promise<void> {
    await this.http.delete(`/notifications/devices/${deviceId}`);
  }

  async sendTest(channel: 'email' | 'sms' | 'push', message?: string): Promise<{ message: string; notificationId?: string }> {
    const response = await this.http.post('/notifications/test', { channel, message });
    return response.data;
  }
}
