/**
 * HTTP client for webhook operations.
 */

import {
  Webhook,
  WebhookDelivery,
  WebhookEvent,
  WebhookListResponse,
  DeliveryListResponse,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  WebhookTestResult,
  EventInfo,
  ListWebhooksParams,
  ListDeliveriesParams,
} from './types';
import { WebhookNotFoundError, DeliveryNotFoundError } from './errors';

export interface WebhookClientOptions {
  baseUrl: string;
  accessToken?: string;
  timeout?: number;
}

export class WebhookClient {
  private baseUrl: string;
  private accessToken?: string;
  private timeout: number;

  constructor(options: WebhookClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.accessToken = options.accessToken;
    this.timeout = options.timeout ?? 30000;
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: Record<string, unknown>
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const status = response.status;
        if (status === 404) {
          throw new WebhookNotFoundError('unknown');
        }
        throw new Error(`HTTP ${status}: ${response.statusText}`);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Webhook CRUD Operations

  async list(params?: ListWebhooksParams): Promise<WebhookListResponse> {
    return this.request('GET', '/webhooks', undefined, params as Record<string, unknown>);
  }

  async get(webhookId: string): Promise<Webhook> {
    try {
      return await this.request('GET', `/webhooks/${webhookId}`);
    } catch (error) {
      if (error instanceof WebhookNotFoundError) {
        throw new WebhookNotFoundError(webhookId);
      }
      throw error;
    }
  }

  async create(request: CreateWebhookRequest): Promise<Webhook> {
    return this.request('POST', '/webhooks', request);
  }

  async update(webhookId: string, request: UpdateWebhookRequest): Promise<Webhook> {
    try {
      return await this.request('PUT', `/webhooks/${webhookId}`, request);
    } catch (error) {
      if (error instanceof WebhookNotFoundError) {
        throw new WebhookNotFoundError(webhookId);
      }
      throw error;
    }
  }

  async delete(webhookId: string): Promise<void> {
    try {
      await this.request('DELETE', `/webhooks/${webhookId}`);
    } catch (error) {
      if (error instanceof WebhookNotFoundError) {
        throw new WebhookNotFoundError(webhookId);
      }
      throw error;
    }
  }

  async test(webhookId: string, event?: WebhookEvent): Promise<WebhookTestResult> {
    const body = event ? { event } : {};
    try {
      return await this.request('POST', `/webhooks/${webhookId}/test`, body);
    } catch (error) {
      if (error instanceof WebhookNotFoundError) {
        throw new WebhookNotFoundError(webhookId);
      }
      throw error;
    }
  }

  async rotateSecret(webhookId: string): Promise<Webhook> {
    try {
      return await this.request('POST', `/webhooks/${webhookId}/rotate-secret`);
    } catch (error) {
      if (error instanceof WebhookNotFoundError) {
        throw new WebhookNotFoundError(webhookId);
      }
      throw error;
    }
  }

  // Delivery Operations

  async listDeliveries(
    webhookId: string,
    params?: ListDeliveriesParams
  ): Promise<DeliveryListResponse> {
    try {
      return await this.request(
        'GET',
        `/webhooks/${webhookId}/deliveries`,
        undefined,
        params as Record<string, unknown>
      );
    } catch (error) {
      if (error instanceof WebhookNotFoundError) {
        throw new WebhookNotFoundError(webhookId);
      }
      throw error;
    }
  }

  async getDelivery(webhookId: string, deliveryId: string): Promise<WebhookDelivery> {
    try {
      return await this.request(
        'GET',
        `/webhooks/${webhookId}/deliveries/${deliveryId}`
      );
    } catch (error) {
      if (error instanceof WebhookNotFoundError) {
        throw new DeliveryNotFoundError(deliveryId);
      }
      throw error;
    }
  }

  async retryDelivery(webhookId: string, deliveryId: string): Promise<WebhookDelivery> {
    try {
      return await this.request(
        'POST',
        `/webhooks/${webhookId}/deliveries/${deliveryId}/retry`
      );
    } catch (error) {
      if (error instanceof WebhookNotFoundError) {
        throw new DeliveryNotFoundError(deliveryId);
      }
      throw error;
    }
  }

  // Event Operations

  async listEvents(): Promise<EventInfo[]> {
    const response = await this.request<{ events: EventInfo[] }>(
      'GET',
      '/webhooks/events'
    );
    return response.events || [];
  }
}
