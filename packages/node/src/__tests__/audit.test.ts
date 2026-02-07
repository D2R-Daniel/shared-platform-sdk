import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditClient } from '../audit';
import {
  AuditEntryNotFoundError,
  InvalidEventTypeError,
  ExportNotFoundError,
  StreamNotFoundError,
  AlertRuleNotFoundError,
  IdempotencyConflictError,
} from '../audit/errors';
import type {
  AuditLogEntry,
  CreateAuditEventRequest,
  AuditLogListResponse,
} from '../audit/types';
import {
  ALL_AUDIT_EVENT_TYPES,
  AUDIT_EVENT_CATEGORIES,
  AUTH_LOGIN_SUCCESS,
  USER_CREATED,
} from '../audit/events';
import {
  AuditError,
  IntegrityViolationError,
} from '../audit/errors';

// Helper to create a mock Response
function mockResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
    headers: new Headers(),
  } as Response;
}

function mock404(code: string, id?: string): Response {
  return mockResponse({ code, id, error: 'Not found' }, 404);
}

describe('AuditClient', () => {
  let client: AuditClient;
  let fetchMock: ReturnType<typeof vi.fn>;

  const sampleEntry: AuditLogEntry = {
    id: 'entry-1',
    tenant_id: 'tenant-1',
    event_type: 'user.created',
    action: 'create',
    description: 'User created',
    actor: { id: 'user-1', type: 'user', name: 'Admin' },
    targets: [{ id: 'user-2', type: 'user', name: 'New User' }],
    changes: [{ field: 'status', old_value: null, new_value: 'active' }],
    severity: 'info',
    created_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
    client = new AuditClient({
      baseUrl: 'https://api.example.com',
      accessToken: 'test-token',
    });
  });

  describe('log', () => {
    it('should log a single audit event', async () => {
      fetchMock.mockResolvedValueOnce(mockResponse(sampleEntry));

      const event: CreateAuditEventRequest = {
        event_type: 'user.created',
        action: 'create',
        actor: { id: 'user-1', type: 'user' },
      };

      const result = await client.log(event);

      expect(result.id).toBe('entry-1');
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.example.com/api/audit',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('logBatch', () => {
    it('should log a batch of audit events', async () => {
      const batchResult = { logged_count: 2, failed_count: 0, errors: [] };
      fetchMock.mockResolvedValueOnce(mockResponse(batchResult));

      const events: CreateAuditEventRequest[] = [
        { event_type: 'user.created', action: 'create', actor: { id: 'u1', type: 'user' } },
        { event_type: 'user.updated', action: 'update', actor: { id: 'u1', type: 'user' } },
      ];

      const result = await client.logBatch(events);

      expect(result.logged_count).toBe(2);
      expect(result.failed_count).toBe(0);
    });
  });

  describe('list', () => {
    it('should list audit entries with query params', async () => {
      const listResponse: AuditLogListResponse = {
        data: [sampleEntry],
        pagination: { page: 1, page_size: 20, total_items: 1, total_pages: 1 },
      };
      fetchMock.mockResolvedValueOnce(mockResponse(listResponse));

      const result = await client.list({
        event_type: 'user.created',
        severity: 'info',
        page: 1,
        page_size: 20,
      });

      expect(result.data).toHaveLength(1);
      const calledUrl = fetchMock.mock.calls[0][0] as string;
      expect(calledUrl).toContain('event_type=user.created');
      expect(calledUrl).toContain('severity=info');
    });

    it('should handle Date objects in query', async () => {
      fetchMock.mockResolvedValueOnce(
        mockResponse({ data: [], pagination: { page: 1, page_size: 20, total_items: 0, total_pages: 0 } })
      );

      await client.list({
        start_date: new Date('2024-01-01T00:00:00Z'),
        end_date: new Date('2024-02-01T00:00:00Z'),
      });

      const calledUrl = fetchMock.mock.calls[0][0] as string;
      expect(calledUrl).toContain('start_date=2024-01-01');
      expect(calledUrl).toContain('end_date=2024-02-01');
    });
  });

  describe('get', () => {
    it('should get a single audit entry', async () => {
      fetchMock.mockResolvedValueOnce(mockResponse(sampleEntry));

      const result = await client.get('entry-1');

      expect(result.id).toBe('entry-1');
    });

    it('should throw AuditEntryNotFoundError on 404', async () => {
      fetchMock.mockResolvedValueOnce(mock404('entry_not_found', 'entry-999'));

      await expect(client.get('entry-999')).rejects.toThrow(AuditEntryNotFoundError);
    });
  });

  describe('getByActor', () => {
    it('should delegate to list with actor_id', async () => {
      fetchMock.mockResolvedValueOnce(
        mockResponse({ data: [sampleEntry], pagination: { page: 1, page_size: 20, total_items: 1, total_pages: 1 } })
      );

      await client.getByActor('user-1');

      const calledUrl = fetchMock.mock.calls[0][0] as string;
      expect(calledUrl).toContain('actor_id=user-1');
    });
  });

  describe('getByResource', () => {
    it('should delegate to list with target_type and target_id', async () => {
      fetchMock.mockResolvedValueOnce(
        mockResponse({ data: [], pagination: { page: 1, page_size: 20, total_items: 0, total_pages: 0 } })
      );

      await client.getByResource('team', 'team-1');

      const calledUrl = fetchMock.mock.calls[0][0] as string;
      expect(calledUrl).toContain('target_type=team');
      expect(calledUrl).toContain('target_id=team-1');
    });
  });

  describe('event types', () => {
    it('should list event types', async () => {
      const types = [{ name: 'user.created', category: 'user', severity: 'info', auto_capture: true, version: 1 }];
      fetchMock.mockResolvedValueOnce(mockResponse({ data: types }));

      const result = await client.listEventTypes();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('user.created');
    });

    it('should get event type by name', async () => {
      const eventType = { name: 'user.created', category: 'user', severity: 'info', auto_capture: true, version: 1 };
      fetchMock.mockResolvedValueOnce(mockResponse(eventType));

      const result = await client.getEventType('user.created');

      expect(result.name).toBe('user.created');
    });

    it('should throw InvalidEventTypeError for unknown event type', async () => {
      fetchMock.mockResolvedValueOnce(mock404('event_type_not_found', 'unknown.event'));

      await expect(client.getEventType('unknown.event')).rejects.toThrow(InvalidEventTypeError);
    });

    it('should create event type', async () => {
      const created = { name: 'custom.action', category: 'custom', severity: 'info', auto_capture: false, version: 1 };
      fetchMock.mockResolvedValueOnce(mockResponse(created));

      const result = await client.createEventType({
        name: 'custom.action',
        category: 'custom',
      });

      expect(result.name).toBe('custom.action');
    });

    it('should update event type', async () => {
      const updated = { name: 'user.created', category: 'user', description: 'Updated', severity: 'warning', auto_capture: true, version: 2 };
      fetchMock.mockResolvedValueOnce(mockResponse(updated));

      const result = await client.updateEventType('user.created', { severity: 'warning' });

      expect(result.severity).toBe('warning');
    });
  });

  describe('retention policy', () => {
    it('should get retention policy', async () => {
      const policy = { retention_days: 365, archive_enabled: true, archive_format: 'json', auto_delete_after_archive: false };
      fetchMock.mockResolvedValueOnce(mockResponse(policy));

      const result = await client.getRetentionPolicy();

      expect(result.retention_days).toBe(365);
    });

    it('should set retention policy', async () => {
      const policy = { retention_days: 180, archive_enabled: false, auto_delete_after_archive: false };
      fetchMock.mockResolvedValueOnce(mockResponse(policy));

      const result = await client.setRetentionPolicy(policy as any);

      expect(result.retention_days).toBe(180);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.example.com/api/audit/retention',
        expect.objectContaining({ method: 'PUT' })
      );
    });
  });

  describe('exports', () => {
    it('should start an export', async () => {
      const exportResult = { export_id: 'exp-1', status: 'processing', started_at: '2024-01-01T00:00:00Z' };
      fetchMock.mockResolvedValueOnce(mockResponse(exportResult));

      const result = await client.exportLogs({
        query: { event_type: 'user.created' },
        format: 'json',
      });

      expect(result.export_id).toBe('exp-1');
      expect(result.status).toBe('processing');
    });

    it('should get export status', async () => {
      const exportResult = { export_id: 'exp-1', status: 'completed', record_count: 100, started_at: '2024-01-01T00:00:00Z' };
      fetchMock.mockResolvedValueOnce(mockResponse(exportResult));

      const result = await client.getExportStatus('exp-1');

      expect(result.status).toBe('completed');
    });

    it('should throw ExportNotFoundError on 404', async () => {
      fetchMock.mockResolvedValueOnce(mock404('export_not_found', 'exp-999'));

      await expect(client.getExportStatus('exp-999')).rejects.toThrow(ExportNotFoundError);
    });

    it('should download export', async () => {
      const exportResult = { export_id: 'exp-1', status: 'completed', download_url: 'https://cdn.example.com/export.json', started_at: '2024-01-01T00:00:00Z' };
      fetchMock.mockResolvedValueOnce(mockResponse(exportResult));

      const result = await client.downloadExport('exp-1');

      expect(result.download_url).toBeDefined();
    });
  });

  describe('integrity', () => {
    it('should verify integrity with Date objects', async () => {
      const verification = { verified: true, entries_checked: 500, verified_range: { start_date: '2024-01-01', end_date: '2024-02-01' } };
      fetchMock.mockResolvedValueOnce(mockResponse(verification));

      const result = await client.verifyIntegrity(
        new Date('2024-01-01T00:00:00Z'),
        new Date('2024-02-01T00:00:00Z')
      );

      expect(result.verified).toBe(true);
      expect(result.entries_checked).toBe(500);
    });

    it('should verify integrity with string dates', async () => {
      const verification = { verified: false, entries_checked: 100, first_invalid_entry_id: 'entry-50', reason: 'Hash mismatch', verified_range: { start_date: '2024-01-01', end_date: '2024-01-15' } };
      fetchMock.mockResolvedValueOnce(mockResponse(verification));

      const result = await client.verifyIntegrity('2024-01-01', '2024-01-15');

      expect(result.verified).toBe(false);
      expect(result.first_invalid_entry_id).toBe('entry-50');
    });

    it('should get integrity proof', async () => {
      const proof = { entry_id: 'entry-1', integrity_hash: 'abc123', previous_hash: 'xyz789', chain_position: 42, verification_data: {} };
      fetchMock.mockResolvedValueOnce(mockResponse(proof));

      const result = await client.getIntegrityProof('entry-1');

      expect(result.integrity_hash).toBe('abc123');
      expect(result.chain_position).toBe(42);
    });
  });

  describe('streams', () => {
    const sampleStream = {
      id: 'stream-1',
      name: 'Splunk Stream',
      destination_type: 'splunk',
      destination_config: { url: 'https://splunk.example.com', token: 'xxx' },
      is_active: true,
      error_count: 0,
      created_at: '2024-01-01T00:00:00Z',
    };

    it('should create a stream', async () => {
      fetchMock.mockResolvedValueOnce(mockResponse(sampleStream));

      const result = await client.createStream({
        name: 'Splunk Stream',
        destination_type: 'splunk',
        destination_config: { url: 'https://splunk.example.com', token: 'xxx' },
      });

      expect(result.id).toBe('stream-1');
    });

    it('should list streams', async () => {
      fetchMock.mockResolvedValueOnce(mockResponse({ data: [sampleStream] }));

      const result = await client.listStreams();

      expect(result).toHaveLength(1);
    });

    it('should get stream by id', async () => {
      fetchMock.mockResolvedValueOnce(mockResponse(sampleStream));

      const result = await client.getStream('stream-1');

      expect(result.name).toBe('Splunk Stream');
    });

    it('should throw StreamNotFoundError on 404', async () => {
      fetchMock.mockResolvedValueOnce(mock404('stream_not_found', 'stream-999'));

      await expect(client.getStream('stream-999')).rejects.toThrow(StreamNotFoundError);
    });

    it('should update stream', async () => {
      const updated = { ...sampleStream, is_active: false };
      fetchMock.mockResolvedValueOnce(mockResponse(updated));

      const result = await client.updateStream('stream-1', { is_active: false });

      expect(result.is_active).toBe(false);
    });

    it('should delete stream', async () => {
      fetchMock.mockResolvedValueOnce(mockResponse(undefined, 204));

      await expect(client.deleteStream('stream-1')).resolves.toBeUndefined();
    });

    it('should test stream', async () => {
      fetchMock.mockResolvedValueOnce(mockResponse({ success: true, latency_ms: 45 }));

      const result = await client.testStream('stream-1');

      expect(result.success).toBe(true);
    });
  });

  describe('alert rules', () => {
    const sampleRule = {
      id: 'rule-1',
      name: 'Failed Login Alert',
      condition: { event_type: 'auth.login.failure', count_threshold: 5, time_window_minutes: 10 },
      notification_channels: [{ type: 'email', config: { to: 'admin@example.com' } }],
      is_active: true,
      cooldown_minutes: 30,
      trigger_count: 0,
      created_at: '2024-01-01T00:00:00Z',
    };

    it('should create alert rule', async () => {
      fetchMock.mockResolvedValueOnce(mockResponse(sampleRule));

      const result = await client.createAlertRule({
        name: 'Failed Login Alert',
        condition: { event_type: 'auth.login.failure', count_threshold: 5, time_window_minutes: 10 },
        notification_channels: [{ type: 'email', config: { to: 'admin@example.com' } }],
      });

      expect(result.id).toBe('rule-1');
    });

    it('should list alert rules', async () => {
      fetchMock.mockResolvedValueOnce(mockResponse({ data: [sampleRule] }));

      const result = await client.listAlertRules();

      expect(result).toHaveLength(1);
    });

    it('should get alert rule', async () => {
      fetchMock.mockResolvedValueOnce(mockResponse(sampleRule));

      const result = await client.getAlertRule('rule-1');

      expect(result.name).toBe('Failed Login Alert');
    });

    it('should throw AlertRuleNotFoundError on 404', async () => {
      fetchMock.mockResolvedValueOnce(mock404('alert_rule_not_found', 'rule-999'));

      await expect(client.getAlertRule('rule-999')).rejects.toThrow(AlertRuleNotFoundError);
    });

    it('should update alert rule', async () => {
      const updated = { ...sampleRule, cooldown_minutes: 60 };
      fetchMock.mockResolvedValueOnce(mockResponse(updated));

      const result = await client.updateAlertRule('rule-1', { cooldown_minutes: 60 });

      expect(result.cooldown_minutes).toBe(60);
    });

    it('should delete alert rule', async () => {
      fetchMock.mockResolvedValueOnce(mockResponse(undefined, 204));

      await expect(client.deleteAlertRule('rule-1')).resolves.toBeUndefined();
    });

    it('should test alert rule', async () => {
      fetchMock.mockResolvedValueOnce(mockResponse({ would_trigger: true, matching_events_count: 7, sample_events: [] }));

      const result = await client.testAlertRule('rule-1');

      expect(result.would_trigger).toBe(true);
    });
  });

  describe('portal', () => {
    it('should generate portal link with ttl', async () => {
      const link = { url: 'https://portal.example.com/audit?token=xyz', expires_at: '2024-01-01T01:00:00Z', organization_id: 'org-1' };
      fetchMock.mockResolvedValueOnce(mockResponse(link));

      const result = await client.generatePortalLink('org-1', 7200);

      expect(result.url).toContain('portal.example.com');
      expect(result.organization_id).toBe('org-1');
    });

    it('should generate portal link without ttl', async () => {
      const link = { url: 'https://portal.example.com/audit?token=abc', expires_at: '2024-01-01T01:00:00Z', organization_id: 'org-1' };
      fetchMock.mockResolvedValueOnce(mockResponse(link));

      const result = await client.generatePortalLink('org-1');

      expect(result.url).toBeDefined();
    });
  });
});

describe('Audit Event Constants', () => {
  it('should export at least 30 standard event types', () => {
    expect(ALL_AUDIT_EVENT_TYPES.length).toBeGreaterThanOrEqual(30);
  });

  it('should have all categories defined', () => {
    const categories = Object.keys(AUDIT_EVENT_CATEGORIES);
    expect(categories).toContain('auth');
    expect(categories).toContain('user');
    expect(categories).toContain('team');
    expect(categories).toContain('resource');
    expect(categories).toContain('settings');
    expect(categories).toContain('webhook');
    expect(categories).toContain('apikey');
    expect(categories).toContain('audit');
    expect(categories).toContain('system');
  });

  it('should have correct constant values', () => {
    expect(AUTH_LOGIN_SUCCESS).toBe('auth.login.success');
    expect(USER_CREATED).toBe('user.created');
  });
});

describe('Audit Errors', () => {
  it('should create AuditError with details', () => {
    const error = new AuditError('test error', { key: 'value' });
    expect(error.message).toBe('test error');
    expect(error.name).toBe('AuditError');
    expect(error.details.key).toBe('value');
  });

  it('should create AuditEntryNotFoundError', () => {
    const error = new AuditEntryNotFoundError('entry-1');
    expect(error.message).toContain('entry-1');
    expect(error.name).toBe('AuditEntryNotFoundError');
    expect(error instanceof AuditError).toBe(true);
  });

  it('should create IntegrityViolationError with optional entryId', () => {
    const withId = new IntegrityViolationError('entry-50');
    expect(withId.message).toContain('entry-50');

    const withoutId = new IntegrityViolationError();
    expect(withoutId.message).toBe('Integrity violation detected');
  });

  it('should create IdempotencyConflictError', () => {
    const error = new IdempotencyConflictError('key-123');
    expect(error.message).toContain('key-123');
    expect(error.name).toBe('IdempotencyConflictError');
  });
});
