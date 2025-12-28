/**
 * HTTP client for settings operations.
 */

import {
  SettingCategory,
  SettingDefinition,
  SettingValue,
  AllSettingsResponse,
  CategorySettingsResponse,
  GetDefinitionsParams,
} from './types';
import {
  SettingNotFoundError,
  InvalidSettingValueError,
  InvalidCategoryError,
} from './errors';

export interface SettingsClientOptions {
  baseUrl: string;
  accessToken?: string;
  timeout?: number;
}

export class SettingsClient {
  private baseUrl: string;
  private accessToken?: string;
  private timeout: number;

  constructor(options: SettingsClientOptions) {
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
        let data: Record<string, unknown> = {};
        try {
          data = await response.json();
        } catch {
          // ignore
        }

        if (status === 400) {
          const error = (data.error as string) || 'Invalid settings values';
          const key = (data.key as string) || 'unknown';
          throw new InvalidSettingValueError(key, error);
        }
        if (status === 404) {
          throw new SettingNotFoundError('unknown');
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

  // Settings Operations

  async getAll(includeDefinitions: boolean = false): Promise<AllSettingsResponse> {
    return this.request('GET', '/settings', undefined, {
      include_definitions: includeDefinitions,
    });
  }

  async getCategory(category: SettingCategory): Promise<CategorySettingsResponse> {
    try {
      return await this.request('GET', `/settings/${category}`);
    } catch (error) {
      if (error instanceof InvalidSettingValueError) {
        throw new InvalidCategoryError(category);
      }
      throw error;
    }
  }

  async updateCategory(
    category: SettingCategory,
    settings: Record<string, unknown>
  ): Promise<CategorySettingsResponse> {
    try {
      return await this.request('PUT', `/settings/${category}`, { settings });
    } catch (error) {
      if (error instanceof SettingNotFoundError) {
        throw new InvalidCategoryError(category);
      }
      throw error;
    }
  }

  async get(key: string): Promise<SettingValue> {
    try {
      return await this.request('GET', `/settings/${key}`);
    } catch (error) {
      if (error instanceof SettingNotFoundError) {
        throw new SettingNotFoundError(key);
      }
      throw error;
    }
  }

  async set(key: string, value: unknown): Promise<SettingValue> {
    try {
      return await this.request('PUT', `/settings/${key}`, { value });
    } catch (error) {
      if (error instanceof SettingNotFoundError) {
        throw new SettingNotFoundError(key);
      }
      throw error;
    }
  }

  async resetCategory(category: SettingCategory): Promise<CategorySettingsResponse> {
    try {
      return await this.request('POST', `/settings/reset/${category}`);
    } catch (error) {
      if (error instanceof InvalidSettingValueError) {
        throw new InvalidCategoryError(category);
      }
      throw error;
    }
  }

  async getDefinitions(params?: GetDefinitionsParams): Promise<SettingDefinition[]> {
    const response = await this.request<{ definitions: SettingDefinition[] }>(
      'GET',
      '/settings/definitions',
      undefined,
      params as Record<string, unknown>
    );
    return response.definitions || [];
  }

  // Convenience Methods

  async getValue<T = unknown>(key: string, defaultValue?: T): Promise<T> {
    try {
      const setting = await this.get(key);
      return setting.value as T;
    } catch (error) {
      if (error instanceof SettingNotFoundError && defaultValue !== undefined) {
        return defaultValue;
      }
      throw error;
    }
  }

  async isFeatureEnabled(feature: string): Promise<boolean> {
    const key = feature.startsWith('features.') ? feature : `features.${feature}`;
    return this.getValue<boolean>(key, false);
  }
}
