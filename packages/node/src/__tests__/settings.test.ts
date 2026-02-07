import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettingsClient } from '../settings';
import {
  SettingNotFoundError,
  InvalidCategoryError,
} from '../settings/errors';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

function createJsonResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: 'OK',
    json: () => Promise.resolve(data),
    headers: new Headers(),
    redirected: false,
    type: 'basic',
    url: '',
    clone: () => ({} as Response),
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    text: () => Promise.resolve(''),
  } as Response;
}

function createErrorResponse(status: number, data: unknown = {}): Response {
  return {
    ok: false,
    status,
    statusText: 'Error',
    json: () => Promise.resolve(data),
    headers: new Headers(),
    redirected: false,
    type: 'basic',
    url: '',
    clone: () => ({} as Response),
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    text: () => Promise.resolve(''),
  } as Response;
}

describe('SettingsClient', () => {
  let client: SettingsClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new SettingsClient({
      baseUrl: 'https://api.example.com',
      accessToken: 'test-token',
    });
  });

  describe('getSettingHistory', () => {
    it('should return change history for a setting key', async () => {
      const mockHistory = {
        data: [
          {
            id: 'change-1',
            tenant_id: 'tenant-1',
            key: 'general.site_name',
            old_value: 'Old Name',
            new_value: 'New Name',
            changed_by: 'user-1',
            changed_at: '2024-01-15T10:00:00Z',
            change_source: 'api',
          },
        ],
        total: 1,
        page: 1,
        page_size: 20,
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockHistory));

      const result = await client.getSettingHistory('general.site_name');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].key).toBe('general.site_name');
      expect(result.data[0].change_source).toBe('api');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/settings/general.site_name/history'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should pass pagination params', async () => {
      mockFetch.mockResolvedValueOnce(
        createJsonResponse({ data: [], total: 0, page: 2, page_size: 10 })
      );

      await client.getSettingHistory('general.site_name', 2, 10);

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('page=2');
      expect(calledUrl).toContain('page_size=10');
    });

    it('should throw SettingNotFoundError for 404', async () => {
      mockFetch.mockResolvedValueOnce(createErrorResponse(404));

      await expect(client.getSettingHistory('nonexistent.key')).rejects.toThrow(
        SettingNotFoundError
      );
    });
  });

  describe('getCategoryHistory', () => {
    it('should return change history for a category', async () => {
      const mockHistory = {
        data: [
          {
            id: 'change-2',
            tenant_id: 'tenant-1',
            key: 'general.timezone',
            old_value: 'UTC',
            new_value: 'US/Eastern',
            changed_by: 'user-1',
            changed_at: '2024-01-15T10:00:00Z',
            change_source: 'dashboard',
          },
        ],
        total: 1,
        page: 1,
        page_size: 20,
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockHistory));

      const result = await client.getCategoryHistory('general');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].change_source).toBe('dashboard');
    });
  });

  describe('getForEnvironment', () => {
    it('should get environment-specific setting value', async () => {
      const mockValue = {
        key: 'general.debug_mode',
        value: true,
        definition: undefined,
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockValue));

      const result = await client.getForEnvironment('general.debug_mode', 'staging');

      expect(result.key).toBe('general.debug_mode');
      expect(result.value).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/settings/general.debug_mode/environments/staging'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should throw SettingNotFoundError on 404', async () => {
      mockFetch.mockResolvedValueOnce(createErrorResponse(404));

      await expect(
        client.getForEnvironment('nonexistent.key', 'production')
      ).rejects.toThrow(SettingNotFoundError);
    });
  });

  describe('setForEnvironment', () => {
    it('should set environment-specific value', async () => {
      const mockOverride = {
        key: 'general.debug_mode',
        environment: 'staging',
        value: true,
        overridden_at: '2024-01-15T10:00:00Z',
        overridden_by: 'user-1',
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockOverride));

      const result = await client.setForEnvironment('general.debug_mode', true, 'staging');

      expect(result.environment).toBe('staging');
      expect(result.value).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/settings/general.debug_mode/environments/staging'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ value: true }),
        })
      );
    });
  });

  describe('listEnvironmentOverrides', () => {
    it('should list all overrides for an environment', async () => {
      const mockResponse = {
        data: [
          {
            key: 'general.debug_mode',
            environment: 'staging',
            value: true,
            overridden_at: '2024-01-15T10:00:00Z',
            overridden_by: 'user-1',
          },
        ],
        total: 1,
        page: 1,
        page_size: 20,
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockResponse));

      const result = await client.listEnvironmentOverrides('staging');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].environment).toBe('staging');
    });
  });

  describe('exportSettings', () => {
    it('should export settings as JSON', async () => {
      const mockExport = {
        format: 'json',
        data: '{"general": {"site_name": "My Site"}}',
        exported_at: '2024-01-15T10:00:00Z',
        category_count: 1,
        setting_count: 1,
        tenant_id: 'tenant-1',
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockExport));

      const result = await client.exportSettings('json');

      expect(result.format).toBe('json');
      expect(result.category_count).toBe(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/settings/export'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should pass format and categories as query params', async () => {
      mockFetch.mockResolvedValueOnce(
        createJsonResponse({
          format: 'yaml',
          data: '',
          exported_at: '',
          category_count: 0,
          setting_count: 0,
          tenant_id: 'tenant-1',
        })
      );

      await client.exportSettings('yaml', ['general', 'branding']);

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('format=yaml');
      expect(calledUrl).toContain('categories=general%2Cbranding');
    });
  });

  describe('importSettings', () => {
    it('should import settings with merge strategy', async () => {
      const mockImport = {
        imported_count: 5,
        skipped_count: 1,
        error_count: 0,
        errors: [],
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockImport));

      const result = await client.importSettings(
        '{"general": {"site_name": "Imported"}}',
        'json',
        'merge'
      );

      expect(result.imported_count).toBe(5);
      expect(result.errors).toHaveLength(0);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/settings/import'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            data: '{"general": {"site_name": "Imported"}}',
            format: 'json',
            strategy: 'merge',
          }),
        })
      );
    });

    it('should throw ImportValidationError on 422', async () => {
      mockFetch.mockResolvedValueOnce(
        createErrorResponse(422, {
          errors: [{ key: 'invalid.key', reason: 'Unknown setting' }],
        })
      );

      await expect(
        client.importSettings('{"bad": "data"}')
      ).rejects.toThrow('Import validation failed');
    });
  });

  describe('lockSetting', () => {
    it('should lock a setting with a reason', async () => {
      const mockLocked = {
        key: 'security.mfa_required',
        locked_by: 'admin-1',
        locked_at: '2024-01-15T10:00:00Z',
        reason: 'Compliance requirement',
        locked_value: true,
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockLocked));

      const result = await client.lockSetting('security.mfa_required', 'Compliance requirement');

      expect(result.key).toBe('security.mfa_required');
      expect(result.reason).toBe('Compliance requirement');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/settings/security.mfa_required/lock'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ reason: 'Compliance requirement' }),
        })
      );
    });

    it('should throw SettingNotFoundError on 404', async () => {
      mockFetch.mockResolvedValueOnce(createErrorResponse(404));

      await expect(client.lockSetting('nonexistent.key')).rejects.toThrow(SettingNotFoundError);
    });
  });

  describe('unlockSetting', () => {
    it('should unlock a setting', async () => {
      mockFetch.mockResolvedValueOnce(createJsonResponse(undefined, 204));

      await client.unlockSetting('security.mfa_required');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/settings/security.mfa_required/unlock'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('listLockedSettings', () => {
    it('should list all locked settings', async () => {
      const mockResponse = {
        data: [
          {
            key: 'security.mfa_required',
            locked_by: 'admin-1',
            locked_at: '2024-01-15T10:00:00Z',
            reason: 'Compliance',
            locked_value: true,
          },
        ],
        total: 1,
        page: 1,
        page_size: 20,
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockResponse));

      const result = await client.listLockedSettings();

      expect(result.data).toHaveLength(1);
      expect(result.data[0].locked_by).toBe('admin-1');
    });
  });

  describe('getEffectiveSetting', () => {
    it('should get effective setting with source info', async () => {
      const mockEffective = {
        key: 'features.dark_mode',
        value: true,
        source: 'environment_override',
        inherited: false,
        definition: {
          key: 'features.dark_mode',
          type: 'boolean',
          label: 'Dark Mode',
          category: 'features',
          is_public: true,
          is_readonly: false,
          display_order: 1,
        },
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockEffective));

      const result = await client.getEffectiveSetting(
        'features.dark_mode',
        'user-1',
        'staging'
      );

      expect(result.source).toBe('environment_override');
      expect(result.inherited).toBe(false);
      expect(result.value).toBe(true);

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('user_id=user-1');
      expect(calledUrl).toContain('environment=staging');
    });

    it('should throw SettingNotFoundError on 404', async () => {
      mockFetch.mockResolvedValueOnce(createErrorResponse(404));

      await expect(client.getEffectiveSetting('nonexistent.key')).rejects.toThrow(
        SettingNotFoundError
      );
    });
  });

  describe('getSensitiveValue', () => {
    it('should retrieve a sensitive setting value', async () => {
      const mockValue = {
        key: 'integrations.api_secret',
        value: 'decrypted-secret-value',
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockValue));

      const result = await client.getSensitiveValue('integrations.api_secret');

      expect(result.key).toBe('integrations.api_secret');
      expect(result.value).toBe('decrypted-secret-value');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/settings/integrations.api_secret/sensitive'),
        expect.objectContaining({ method: 'GET' })
      );
    });
  });

  describe('bulkUpdate', () => {
    it('should bulk update multiple settings', async () => {
      const mockResult = {
        updated_count: 2,
        skipped_count: 0,
        errors: [],
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockResult));

      const settings = [
        { key: 'general.site_name', value: 'New Name' },
        { key: 'general.timezone', value: 'US/Pacific' },
      ];

      const result = await client.bulkUpdate(settings);

      expect(result.updated_count).toBe(2);
      expect(result.errors).toHaveLength(0);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/settings/bulk'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ settings }),
        })
      );
    });

    it('should return partial results with errors', async () => {
      const mockResult = {
        updated_count: 1,
        skipped_count: 0,
        errors: [{ key: 'security.mfa_required', reason: 'Setting is locked' }],
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockResult));

      const result = await client.bulkUpdate([
        { key: 'general.site_name', value: 'New' },
        { key: 'security.mfa_required', value: false },
      ]);

      expect(result.updated_count).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].key).toBe('security.mfa_required');
    });
  });
});
