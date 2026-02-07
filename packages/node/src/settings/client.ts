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
  SettingChangeListResponse,
  Environment,
  EnvironmentOverride,
  EnvironmentOverrideListResponse,
  ExportFormat,
  ExportResult,
  ImportStrategy,
  ImportResult,
  LockedSetting,
  LockedSettingListResponse,
  EffectiveSetting,
  BulkUpdateItem,
  BulkUpdateResult,
} from './types';
import {
  SettingNotFoundError,
  InvalidSettingValueError,
  InvalidCategoryError,
  ImportValidationError,
  SettingLockedError,
  ReadonlySettingError,
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
          data = (await response.json()) as Record<string, unknown>;
        } catch {
          // ignore
        }

        if (status === 400) {
          const error = (data.error as string) || 'Invalid settings values';
          const key = (data.key as string) || 'unknown';
          throw new InvalidSettingValueError(key, error);
        }
        if (status === 403) {
          const key = (data.key as string) || 'unknown';
          if (data.code === 'readonly_setting') {
            throw new ReadonlySettingError(key);
          }
          throw new Error(`HTTP 403: Forbidden`);
        }
        if (status === 404) {
          throw new SettingNotFoundError('unknown');
        }
        if (status === 422) {
          const errors = (data.errors as Array<{ key: string; reason: string }>) || [];
          throw new ImportValidationError(errors);
        }
        if (status === 423) {
          const key = (data.key as string) || 'unknown';
          const lockedBy = (data.locked_by as string) || undefined;
          throw new SettingLockedError(key, lockedBy);
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

  // History Operations

  async getSettingHistory(
    key: string,
    page?: number,
    pageSize?: number
  ): Promise<SettingChangeListResponse> {
    try {
      return await this.request('GET', `/settings/${key}/history`, undefined, {
        page,
        page_size: pageSize,
      });
    } catch (error) {
      if (error instanceof SettingNotFoundError) {
        throw new SettingNotFoundError(key);
      }
      throw error;
    }
  }

  async getCategoryHistory(
    category: SettingCategory,
    page?: number,
    pageSize?: number
  ): Promise<SettingChangeListResponse> {
    try {
      return await this.request('GET', `/settings/${category}/history`, undefined, {
        page,
        page_size: pageSize,
      });
    } catch (error) {
      if (error instanceof InvalidSettingValueError) {
        throw new InvalidCategoryError(category);
      }
      throw error;
    }
  }

  // Environment Override Operations

  async getForEnvironment(key: string, environment: Environment): Promise<SettingValue> {
    try {
      return await this.request('GET', `/settings/${key}/environments/${environment}`);
    } catch (error) {
      if (error instanceof SettingNotFoundError) {
        throw new SettingNotFoundError(key);
      }
      throw error;
    }
  }

  async setForEnvironment(
    key: string,
    value: unknown,
    environment: Environment
  ): Promise<EnvironmentOverride> {
    try {
      return await this.request(
        'PUT',
        `/settings/${key}/environments/${environment}`,
        { value }
      );
    } catch (error) {
      if (error instanceof SettingNotFoundError) {
        throw new SettingNotFoundError(key);
      }
      throw error;
    }
  }

  async listEnvironmentOverrides(
    environment: Environment
  ): Promise<EnvironmentOverrideListResponse> {
    return this.request('GET', `/settings/environments/${environment}`);
  }

  // Import/Export Operations

  async exportSettings(
    format?: ExportFormat,
    categories?: SettingCategory[]
  ): Promise<ExportResult> {
    return this.request('GET', '/settings/export', undefined, {
      format,
      categories: categories?.join(','),
    });
  }

  async importSettings(
    data: string,
    format?: ExportFormat,
    strategy?: ImportStrategy
  ): Promise<ImportResult> {
    try {
      return await this.request('POST', '/settings/import', {
        data,
        format: format ?? 'json',
        strategy: strategy ?? 'merge',
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('422')) {
        throw new ImportValidationError([]);
      }
      throw error;
    }
  }

  // Locking Operations

  async lockSetting(key: string, reason?: string): Promise<LockedSetting> {
    try {
      return await this.request('POST', `/settings/${key}/lock`, {
        reason,
      });
    } catch (error) {
      if (error instanceof SettingNotFoundError) {
        throw new SettingNotFoundError(key);
      }
      throw error;
    }
  }

  async unlockSetting(key: string): Promise<void> {
    try {
      await this.request('POST', `/settings/${key}/unlock`);
    } catch (error) {
      if (error instanceof SettingNotFoundError) {
        throw new SettingNotFoundError(key);
      }
      throw error;
    }
  }

  async listLockedSettings(): Promise<LockedSettingListResponse> {
    return this.request('GET', '/settings/locked');
  }

  // Advanced Operations

  async getEffectiveSetting(
    key: string,
    userId?: string,
    environment?: Environment
  ): Promise<EffectiveSetting> {
    try {
      return await this.request('GET', `/settings/${key}/effective`, undefined, {
        user_id: userId,
        environment,
      });
    } catch (error) {
      if (error instanceof SettingNotFoundError) {
        throw new SettingNotFoundError(key);
      }
      throw error;
    }
  }

  async getSensitiveValue(key: string): Promise<SettingValue> {
    try {
      return await this.request('GET', `/settings/${key}/sensitive`);
    } catch (error) {
      if (error instanceof SettingNotFoundError) {
        throw new SettingNotFoundError(key);
      }
      throw error;
    }
  }

  async bulkUpdate(settings: BulkUpdateItem[]): Promise<BulkUpdateResult> {
    return this.request('PUT', '/settings/bulk', { settings });
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
