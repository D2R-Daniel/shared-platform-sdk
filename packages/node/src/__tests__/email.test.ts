import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailClient } from '../email';
import {
  TemplateNotFoundError,
  VersionNotFoundError,
  LocaleNotFoundError,
  ProviderConfigError,
  BatchTooLargeError,
} from '../email/errors';

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

describe('EmailClient', () => {
  let client: EmailClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new EmailClient({
      baseUrl: 'https://api.example.com',
      accessToken: 'test-token',
    });
  });

  describe('previewTemplate', () => {
    it('should preview a template with variables', async () => {
      const mockPreview = {
        subject: 'Welcome, John!',
        html_content: '<h1>Welcome, John!</h1>',
        text_content: 'Welcome, John!',
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockPreview));

      const result = await client.previewTemplate('tpl-1', { name: 'John' });

      expect(result.subject).toBe('Welcome, John!');
      expect(result.html_content).toContain('John');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/email/templates/tpl-1/preview'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ variables: { name: 'John' }, locale: undefined }),
        })
      );
    });

    it('should pass locale for preview', async () => {
      mockFetch.mockResolvedValueOnce(
        createJsonResponse({ subject: 'Bienvenue!', html_content: '<h1>Bienvenue!</h1>' })
      );

      await client.previewTemplate('tpl-1', { name: 'Jean' }, 'fr');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: JSON.stringify({ variables: { name: 'Jean' }, locale: 'fr' }),
        })
      );
    });

    it('should throw TemplateNotFoundError on 404', async () => {
      mockFetch.mockResolvedValueOnce(createErrorResponse(404));

      await expect(client.previewTemplate('bad-id', {})).rejects.toThrow(TemplateNotFoundError);
    });
  });

  describe('previewTemplateBySlug', () => {
    it('should preview by slug', async () => {
      const mockPreview = {
        subject: 'Hello!',
        html_content: '<h1>Hello!</h1>',
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockPreview));

      const result = await client.previewTemplateBySlug('welcome-email', { name: 'Jane' });

      expect(result.subject).toBe('Hello!');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/email/templates/slug/welcome-email/preview'),
        expect.anything()
      );
    });
  });

  describe('listTemplateVersions', () => {
    it('should list all versions of a template', async () => {
      const mockVersions = {
        data: [
          {
            version: 2,
            template_id: 'tpl-1',
            html_content: '<h1>v2</h1>',
            subject: 'v2 Subject',
            variables: ['name'],
            change_notes: 'Updated header',
            created_at: '2024-01-15T10:00:00Z',
            created_by: 'user-1',
          },
          {
            version: 1,
            template_id: 'tpl-1',
            html_content: '<h1>v1</h1>',
            subject: 'v1 Subject',
            variables: ['name'],
            created_at: '2024-01-10T10:00:00Z',
            created_by: 'user-1',
          },
        ],
        total: 2,
        page: 1,
        page_size: 20,
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockVersions));

      const result = await client.listTemplateVersions('tpl-1');

      expect(result.data).toHaveLength(2);
      expect(result.data[0].version).toBe(2);
      expect(result.data[1].version).toBe(1);
    });
  });

  describe('getTemplateVersion', () => {
    it('should get a specific version', async () => {
      const mockVersion = {
        version: 1,
        template_id: 'tpl-1',
        html_content: '<h1>v1</h1>',
        subject: 'v1 Subject',
        variables: ['name'],
        created_at: '2024-01-10T10:00:00Z',
        created_by: 'user-1',
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockVersion));

      const result = await client.getTemplateVersion('tpl-1', 1);

      expect(result.version).toBe(1);
      expect(result.template_id).toBe('tpl-1');
    });

    it('should throw VersionNotFoundError on 404', async () => {
      mockFetch.mockResolvedValueOnce(createErrorResponse(404));

      await expect(client.getTemplateVersion('tpl-1', 99)).rejects.toThrow(VersionNotFoundError);
    });
  });

  describe('revertToVersion', () => {
    it('should revert template to a previous version', async () => {
      const mockTemplate = {
        id: 'tpl-1',
        tenant_id: 'tenant-1',
        name: 'Welcome',
        slug: 'welcome-email',
        subject: 'v1 Subject',
        html_content: '<h1>v1</h1>',
        variables: ['name'],
        category: 'welcome',
        is_system: false,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockTemplate));

      const result = await client.revertToVersion('tpl-1', 1);

      expect(result.subject).toBe('v1 Subject');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/email/templates/tpl-1/versions/1/revert'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('setTemplateLocale', () => {
    it('should set locale content for a template', async () => {
      const mockLocale = {
        template_id: 'tpl-1',
        locale: 'fr',
        subject: 'Bienvenue, {{name}}!',
        html_content: '<h1>Bienvenue, {{name}}!</h1>',
        text_content: 'Bienvenue, {{name}}!',
        variables: ['name'],
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockLocale));

      const result = await client.setTemplateLocale('tpl-1', 'fr', {
        subject: 'Bienvenue, {{name}}!',
        html_content: '<h1>Bienvenue, {{name}}!</h1>',
        text_content: 'Bienvenue, {{name}}!',
      });

      expect(result.locale).toBe('fr');
      expect(result.subject).toContain('Bienvenue');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/email/templates/tpl-1/locales/fr'),
        expect.objectContaining({ method: 'PUT' })
      );
    });

    it('should throw TemplateNotFoundError on 404', async () => {
      mockFetch.mockResolvedValueOnce(createErrorResponse(404));

      await expect(
        client.setTemplateLocale('bad-id', 'fr', {
          subject: 'Test',
          html_content: '<p>Test</p>',
        })
      ).rejects.toThrow(TemplateNotFoundError);
    });
  });

  describe('getTemplateLocale', () => {
    it('should get locale content', async () => {
      const mockLocale = {
        template_id: 'tpl-1',
        locale: 'es',
        subject: 'Bienvenido!',
        html_content: '<h1>Bienvenido!</h1>',
        variables: ['name'],
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockLocale));

      const result = await client.getTemplateLocale('tpl-1', 'es');

      expect(result.locale).toBe('es');
      expect(result.subject).toBe('Bienvenido!');
    });

    it('should throw LocaleNotFoundError on 404', async () => {
      mockFetch.mockResolvedValueOnce(createErrorResponse(404));

      await expect(client.getTemplateLocale('tpl-1', 'zz')).rejects.toThrow(
        LocaleNotFoundError
      );
    });
  });

  describe('listTemplateLocales', () => {
    it('should list all locales for a template', async () => {
      const mockResponse = {
        data: [
          { template_id: 'tpl-1', locale: 'en', subject: 'Welcome!', html_content: '<h1>Welcome!</h1>', variables: ['name'] },
          { template_id: 'tpl-1', locale: 'fr', subject: 'Bienvenue!', html_content: '<h1>Bienvenue!</h1>', variables: ['name'] },
        ],
        total: 2,
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockResponse));

      const result = await client.listTemplateLocales('tpl-1');

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  describe('deleteTemplateLocale', () => {
    it('should delete a locale', async () => {
      mockFetch.mockResolvedValueOnce(createJsonResponse(undefined, 204));

      await client.deleteTemplateLocale('tpl-1', 'fr');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/email/templates/tpl-1/locales/fr'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('should throw LocaleNotFoundError on 404', async () => {
      mockFetch.mockResolvedValueOnce(createErrorResponse(404));

      await expect(client.deleteTemplateLocale('tpl-1', 'zz')).rejects.toThrow(
        LocaleNotFoundError
      );
    });
  });

  describe('listProviders', () => {
    it('should list all configured email providers', async () => {
      const mockResponse = {
        data: [
          {
            type: 'sendgrid',
            config: { api_key: '***' },
            is_active: true,
            verified_at: '2024-01-10T10:00:00Z',
          },
          {
            type: 'smtp',
            config: { host: 'smtp.example.com', port: 587 },
            is_active: false,
            verified_at: null,
          },
        ],
        total: 2,
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockResponse));

      const result = await client.listProviders();

      expect(result.data).toHaveLength(2);
      expect(result.data[0].type).toBe('sendgrid');
      expect(result.data[0].is_active).toBe(true);
    });
  });

  describe('configureProvider', () => {
    it('should configure a new email provider', async () => {
      const mockProvider = {
        type: 'sendgrid',
        config: { api_key: 'SG.xxxxx' },
        is_active: true,
        verified_at: null,
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockProvider));

      const result = await client.configureProvider({
        type: 'sendgrid',
        config: { api_key: 'SG.xxxxx' },
        is_active: true,
      });

      expect(result.type).toBe('sendgrid');
      expect(result.is_active).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/email/providers'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            type: 'sendgrid',
            config: { api_key: 'SG.xxxxx' },
            is_active: true,
          }),
        })
      );
    });

    it('should throw ProviderConfigError on 422', async () => {
      mockFetch.mockResolvedValueOnce(
        createErrorResponse(422, {
          provider_type: 'ses',
          message: 'Invalid AWS credentials',
        })
      );

      await expect(
        client.configureProvider({
          type: 'ses',
          config: { access_key: 'bad' },
        })
      ).rejects.toThrow(ProviderConfigError);
    });
  });

  describe('sendBatch', () => {
    it('should send batch emails', async () => {
      const mockResult = {
        batch_id: 'batch-1',
        total: 3,
        sent_count: 2,
        failed_count: 1,
        failures: [
          { to: 'bad@example.com', error: 'Invalid email address' },
        ],
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockResult));

      const result = await client.sendBatch({
        template_slug: 'welcome-email',
        recipients: [
          { to: 'user1@example.com', variables: { name: 'User 1' } },
          { to: 'user2@example.com', variables: { name: 'User 2' } },
          { to: 'bad@example.com', variables: { name: 'Bad' } },
        ],
      });

      expect(result.batch_id).toBe('batch-1');
      expect(result.sent_count).toBe(2);
      expect(result.failed_count).toBe(1);
      expect(result.failures).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/email/send-batch'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should throw BatchTooLargeError on 413', async () => {
      mockFetch.mockResolvedValueOnce(
        createErrorResponse(413, {
          recipient_count: 1001,
          max_recipients: 1000,
        })
      );

      await expect(
        client.sendBatch({
          template_slug: 'bulk',
          recipients: Array(1001).fill({ to: 'a@b.com', variables: {} }),
        })
      ).rejects.toThrow(BatchTooLargeError);
    });
  });

  describe('listSendHistory', () => {
    it('should list send history with filters', async () => {
      const mockResponse = {
        data: [
          {
            message_id: 'msg-1',
            template_slug: 'welcome-email',
            to: ['user@example.com'],
            subject: 'Welcome!',
            status: 'delivered',
            provider: 'sendgrid',
            sent_at: '2024-01-15T10:00:00Z',
            delivered_at: '2024-01-15T10:01:00Z',
          },
        ],
        total: 1,
        page: 1,
        page_size: 20,
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockResponse));

      const result = await client.listSendHistory({
        status: 'delivered',
        page: 1,
        page_size: 20,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('delivered');

      const calledUrl = mockFetch.mock.calls[0][0] as string;
      expect(calledUrl).toContain('status=delivered');
    });
  });

  describe('getSendDetails', () => {
    it('should get send details with delivery events', async () => {
      const mockDetails = {
        record: {
          message_id: 'msg-1',
          template_slug: 'welcome-email',
          to: ['user@example.com'],
          subject: 'Welcome!',
          status: 'delivered',
          provider: 'sendgrid',
          sent_at: '2024-01-15T10:00:00Z',
          delivered_at: '2024-01-15T10:01:00Z',
        },
        events: [
          {
            message_id: 'msg-1',
            event_type: 'delivered',
            timestamp: '2024-01-15T10:01:00Z',
          },
          {
            message_id: 'msg-1',
            event_type: 'opened',
            timestamp: '2024-01-15T11:00:00Z',
          },
        ],
      };

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockDetails));

      const result = await client.getSendDetails('msg-1');

      expect(result.record.message_id).toBe('msg-1');
      expect(result.events).toHaveLength(2);
      expect(result.events[0].event_type).toBe('delivered');
      expect(result.events[1].event_type).toBe('opened');
    });
  });
});
