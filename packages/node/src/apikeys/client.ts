/**
 * HTTP client for API key operations.
 */

import {
  APIKeyEnvironment,
  APIKeySummary,
  APIKeyUsage,
  CreateAPIKeyRequest,
  CreateAPIKeyResponse,
  UpdateAPIKeyRequest,
  ValidateAPIKeyResponse,
  APIKeyListResponse,
  ListAPIKeysParams,
} from './types';
import { APIKeyNotFoundError } from './errors';

export interface APIKeyClientOptions {
  baseUrl: string;
  accessToken?: string;
  timeout?: number;
}

export class APIKeyClient {
  private baseUrl: string;
  private accessToken?: string;
  private timeout: number;

  constructor(options: APIKeyClientOptions) {
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
          throw new APIKeyNotFoundError('unknown');
        }
        throw new Error(`HTTP ${status}: ${response.statusText}`);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // API Key CRUD Operations

  async list(params?: ListAPIKeysParams): Promise<APIKeyListResponse> {
    return this.request('GET', '/api-keys', undefined, params as Record<string, unknown>);
  }

  async get(keyId: string): Promise<APIKeySummary> {
    try {
      return await this.request('GET', `/api-keys/${keyId}`);
    } catch (error) {
      if (error instanceof APIKeyNotFoundError) {
        throw new APIKeyNotFoundError(keyId);
      }
      throw error;
    }
  }

  async create(request: CreateAPIKeyRequest): Promise<CreateAPIKeyResponse> {
    return this.request('POST', '/api-keys', request);
  }

  async update(keyId: string, request: UpdateAPIKeyRequest): Promise<APIKeySummary> {
    try {
      return await this.request('PUT', `/api-keys/${keyId}`, request);
    } catch (error) {
      if (error instanceof APIKeyNotFoundError) {
        throw new APIKeyNotFoundError(keyId);
      }
      throw error;
    }
  }

  async revoke(keyId: string, reason?: string): Promise<void> {
    const body = reason ? { reason } : undefined;
    try {
      await this.request('DELETE', `/api-keys/${keyId}`, body);
    } catch (error) {
      if (error instanceof APIKeyNotFoundError) {
        throw new APIKeyNotFoundError(keyId);
      }
      throw error;
    }
  }

  async regenerate(keyId: string): Promise<CreateAPIKeyResponse> {
    try {
      return await this.request('POST', `/api-keys/${keyId}/regenerate`);
    } catch (error) {
      if (error instanceof APIKeyNotFoundError) {
        throw new APIKeyNotFoundError(keyId);
      }
      throw error;
    }
  }

  // Usage Operations

  async getUsage(keyId: string, period: string = 'day'): Promise<APIKeyUsage> {
    try {
      return await this.request('GET', `/api-keys/${keyId}/usage`, undefined, {
        period,
      });
    } catch (error) {
      if (error instanceof APIKeyNotFoundError) {
        throw new APIKeyNotFoundError(keyId);
      }
      throw error;
    }
  }

  // Validation Operations

  async validate(
    key: string,
    requiredPermission?: string
  ): Promise<ValidateAPIKeyResponse> {
    const body: Record<string, string> = { key };
    if (requiredPermission) {
      body.required_permission = requiredPermission;
    }
    return this.request('POST', '/api-keys/validate', body);
  }

  async isValid(key: string): Promise<boolean> {
    const result = await this.validate(key);
    return result.valid;
  }

  async hasPermission(key: string, permission: string): Promise<boolean> {
    const result = await this.validate(key, permission);
    return result.valid && (result.has_permission ?? false);
  }
}
