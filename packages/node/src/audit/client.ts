/**
 * Audit logging client for tracking user actions and system events.
 *
 * Provides comprehensive audit logging with hash-chain integrity,
 * SIEM streaming, alert rules, and export capabilities.
 */

import type {
  AuditLogEntry,
  AuditLogListResponse,
  AuditLogQuery,
  CreateAuditEventRequest,
  BatchAuditResult,
  AuditEventTypeDefinition,
  CreateEventTypeRequest,
  UpdateEventTypeRequest,
  RetentionPolicy,
  ExportRequest,
  ExportResult,
  IntegrityVerificationResult,
  IntegrityProof,
  AuditStream,
  CreateStreamRequest,
  UpdateStreamRequest,
  StreamTestResult,
  AlertRule,
  CreateAlertRuleRequest,
  UpdateAlertRuleRequest,
  AlertRuleTestResult,
  PortalLink,
} from './types';
import {
  AuditError,
  AuditEntryNotFoundError,
  InvalidEventTypeError,
  SchemaValidationError,
  ExportNotFoundError,
  ExportTooLargeError,
  RetentionPolicyError,
  IntegrityViolationError,
  StreamNotFoundError,
  AlertRuleNotFoundError,
  IdempotencyConflictError,
} from './errors';

export interface AuditClientOptions {
  baseUrl: string;
  accessToken?: string;
  timeout?: number;
}

/** @deprecated Use AuditClientOptions */
export type AuditClientConfig = AuditClientOptions;

export class AuditClient {
  private baseUrl: string;
  private accessToken?: string;
  private timeout: number;

  constructor(options: AuditClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.accessToken = options.accessToken;
    this.timeout = options.timeout ?? 30000;
  }

  /**
   * Set the access token for authenticated requests.
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Internal fetch wrapper with error mapping.
   */
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
          if (value instanceof Date) {
            url.searchParams.append(key, value.toISOString());
          } else if (Array.isArray(value)) {
            value.forEach((v) => url.searchParams.append(key, String(v)));
          } else {
            url.searchParams.append(key, String(value));
          }
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
        await this.handleErrorResponse(response);
      }

      if (response.status === 204) {
        return undefined as T;
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Map HTTP error responses to typed error classes.
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    const status = response.status;
    let data: Record<string, unknown> = {};
    try {
      data = (await response.json()) as Record<string, unknown>;
    } catch {
      // ignore parse failures
    }

    const errorCode = data.code as string | undefined;
    const errorMessage = (data.error as string) || (data.message as string) || response.statusText;
    const entityId = data.id as string | undefined;

    if (status === 400) {
      if (errorCode === 'invalid_event_type') {
        throw new InvalidEventTypeError(entityId || 'unknown');
      }
      if (errorCode === 'schema_validation_failed') {
        throw new SchemaValidationError(entityId || 'unknown', errorMessage);
      }
      if (errorCode === 'retention_policy_invalid') {
        throw new RetentionPolicyError(errorMessage);
      }
      if (errorCode === 'export_too_large') {
        throw new ExportTooLargeError(errorMessage);
      }
      throw new AuditError(`Bad request: ${errorMessage}`, { status, ...data });
    }

    if (status === 404) {
      if (errorCode === 'entry_not_found') {
        throw new AuditEntryNotFoundError(entityId || 'unknown');
      }
      if (errorCode === 'event_type_not_found') {
        throw new InvalidEventTypeError(entityId || 'unknown');
      }
      if (errorCode === 'export_not_found') {
        throw new ExportNotFoundError(entityId || 'unknown');
      }
      if (errorCode === 'stream_not_found') {
        throw new StreamNotFoundError(entityId || 'unknown');
      }
      if (errorCode === 'alert_rule_not_found') {
        throw new AlertRuleNotFoundError(entityId || 'unknown');
      }
      throw new AuditEntryNotFoundError(entityId || 'unknown');
    }

    if (status === 409) {
      if (errorCode === 'idempotency_conflict') {
        throw new IdempotencyConflictError(
          (data.idempotency_key as string) || 'unknown'
        );
      }
    }

    if (status === 422) {
      if (errorCode === 'integrity_violation') {
        throw new IntegrityViolationError(entityId);
      }
    }

    throw new AuditError(`HTTP ${status}: ${errorMessage}`, { status, ...data });
  }

  // ---------------------------------------------------------------------------
  // Core audit log operations
  // ---------------------------------------------------------------------------

  /**
   * Log a single audit event.
   */
  async log(event: CreateAuditEventRequest): Promise<AuditLogEntry> {
    return this.request('POST', '/api/audit', event);
  }

  /**
   * Log a batch of audit events.
   *
   * Returns a summary of how many were logged vs. failed.
   */
  async logBatch(events: CreateAuditEventRequest[]): Promise<BatchAuditResult> {
    return this.request('POST', '/api/audit/batch', { events });
  }

  /**
   * List audit log entries with optional filtering and pagination.
   */
  async list(query?: AuditLogQuery): Promise<AuditLogListResponse> {
    const params: Record<string, unknown> = {};
    if (query) {
      if (query.event_type) params.event_type = query.event_type;
      if (query.event_types) params.event_types = query.event_types;
      if (query.actor_id) params.actor_id = query.actor_id;
      if (query.actor_type) params.actor_type = query.actor_type;
      if (query.target_id) params.target_id = query.target_id;
      if (query.target_type) params.target_type = query.target_type;
      if (query.severity) params.severity = query.severity;
      if (query.start_date) params.start_date = query.start_date;
      if (query.end_date) params.end_date = query.end_date;
      if (query.search) params.search = query.search;
      if (query.sort) params.sort = query.sort;
      if (query.page) params.page = query.page;
      if (query.page_size) params.page_size = query.page_size;
    }

    return this.request('GET', '/api/audit', undefined, params);
  }

  /**
   * Get a specific audit log entry by ID.
   */
  async get(entryId: string): Promise<AuditLogEntry> {
    try {
      return await this.request('GET', `/api/audit/${entryId}`);
    } catch (error) {
      if (error instanceof AuditEntryNotFoundError) {
        throw new AuditEntryNotFoundError(entryId);
      }
      throw error;
    }
  }

  /**
   * Get audit log entries for a specific actor/user.
   */
  async getByActor(
    actorId: string,
    query?: Omit<AuditLogQuery, 'actor_id'>
  ): Promise<AuditLogListResponse> {
    return this.list({ ...query, actor_id: actorId });
  }

  /**
   * Get audit log entries for a specific resource.
   */
  async getByResource(
    targetType: string,
    targetId: string,
    query?: Omit<AuditLogQuery, 'target_type' | 'target_id'>
  ): Promise<AuditLogListResponse> {
    return this.list({ ...query, target_type: targetType, target_id: targetId });
  }

  // ---------------------------------------------------------------------------
  // Event type management
  // ---------------------------------------------------------------------------

  /**
   * List all registered event types.
   */
  async listEventTypes(): Promise<AuditEventTypeDefinition[]> {
    const response = await this.request<{ data: AuditEventTypeDefinition[] }>(
      'GET',
      '/api/audit/event-types'
    );
    return response.data;
  }

  /**
   * Get a specific event type definition.
   */
  async getEventType(name: string): Promise<AuditEventTypeDefinition> {
    try {
      return await this.request('GET', `/api/audit/event-types/${name}`);
    } catch (error) {
      if (error instanceof InvalidEventTypeError) {
        throw new InvalidEventTypeError(name);
      }
      throw error;
    }
  }

  /**
   * Create a custom event type definition.
   */
  async createEventType(
    definition: CreateEventTypeRequest
  ): Promise<AuditEventTypeDefinition> {
    return this.request('POST', '/api/audit/event-types', definition);
  }

  /**
   * Update an existing event type definition.
   */
  async updateEventType(
    name: string,
    definition: UpdateEventTypeRequest
  ): Promise<AuditEventTypeDefinition> {
    try {
      return await this.request('PUT', `/api/audit/event-types/${name}`, definition);
    } catch (error) {
      if (error instanceof InvalidEventTypeError) {
        throw new InvalidEventTypeError(name);
      }
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Retention policy
  // ---------------------------------------------------------------------------

  /**
   * Get the current retention policy for the tenant.
   */
  async getRetentionPolicy(): Promise<RetentionPolicy> {
    return this.request('GET', '/api/audit/retention');
  }

  /**
   * Set the retention policy for the tenant.
   *
   * @param policy - Retention policy to set. `retention_days` must be >= 90.
   */
  async setRetentionPolicy(policy: RetentionPolicy): Promise<RetentionPolicy> {
    return this.request('PUT', '/api/audit/retention', policy);
  }

  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------

  /**
   * Start an asynchronous export of audit logs.
   */
  async exportLogs(request: ExportRequest): Promise<ExportResult> {
    return this.request('POST', '/api/audit/exports', request);
  }

  /**
   * Get the status of an export job.
   */
  async getExportStatus(exportId: string): Promise<ExportResult> {
    try {
      return await this.request('GET', `/api/audit/exports/${exportId}`);
    } catch (error) {
      if (error instanceof AuditEntryNotFoundError || error instanceof ExportNotFoundError) {
        throw new ExportNotFoundError(exportId);
      }
      throw error;
    }
  }

  /**
   * Download a completed export.
   *
   * Returns the export result with a populated `download_url`.
   */
  async downloadExport(exportId: string): Promise<ExportResult> {
    try {
      return await this.request('GET', `/api/audit/exports/${exportId}/download`);
    } catch (error) {
      if (error instanceof AuditEntryNotFoundError || error instanceof ExportNotFoundError) {
        throw new ExportNotFoundError(exportId);
      }
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Integrity verification
  // ---------------------------------------------------------------------------

  /**
   * Verify the hash-chain integrity of audit logs in a date range.
   */
  async verifyIntegrity(
    startDate: Date | string,
    endDate: Date | string
  ): Promise<IntegrityVerificationResult> {
    return this.request('POST', '/api/audit/integrity/verify', {
      start_date: startDate instanceof Date ? startDate.toISOString() : startDate,
      end_date: endDate instanceof Date ? endDate.toISOString() : endDate,
    });
  }

  /**
   * Get the integrity proof for a specific audit log entry.
   */
  async getIntegrityProof(entryId: string): Promise<IntegrityProof> {
    try {
      return await this.request('GET', `/api/audit/integrity/${entryId}`);
    } catch (error) {
      if (error instanceof AuditEntryNotFoundError) {
        throw new AuditEntryNotFoundError(entryId);
      }
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // SIEM streaming
  // ---------------------------------------------------------------------------

  /**
   * Create a new audit log stream.
   */
  async createStream(config: CreateStreamRequest): Promise<AuditStream> {
    return this.request('POST', '/api/audit/streams', config);
  }

  /**
   * List all configured audit log streams.
   */
  async listStreams(): Promise<AuditStream[]> {
    const response = await this.request<{ data: AuditStream[] }>(
      'GET',
      '/api/audit/streams'
    );
    return response.data;
  }

  /**
   * Get a specific audit log stream by ID.
   */
  async getStream(streamId: string): Promise<AuditStream> {
    try {
      return await this.request('GET', `/api/audit/streams/${streamId}`);
    } catch (error) {
      if (error instanceof StreamNotFoundError) {
        throw new StreamNotFoundError(streamId);
      }
      throw error;
    }
  }

  /**
   * Update an existing audit log stream.
   */
  async updateStream(
    streamId: string,
    config: UpdateStreamRequest
  ): Promise<AuditStream> {
    try {
      return await this.request('PUT', `/api/audit/streams/${streamId}`, config);
    } catch (error) {
      if (error instanceof StreamNotFoundError) {
        throw new StreamNotFoundError(streamId);
      }
      throw error;
    }
  }

  /**
   * Delete an audit log stream.
   */
  async deleteStream(streamId: string): Promise<void> {
    try {
      await this.request('DELETE', `/api/audit/streams/${streamId}`);
    } catch (error) {
      if (error instanceof StreamNotFoundError) {
        throw new StreamNotFoundError(streamId);
      }
      throw error;
    }
  }

  /**
   * Test a stream's connectivity and configuration.
   */
  async testStream(streamId: string): Promise<StreamTestResult> {
    try {
      return await this.request('POST', `/api/audit/streams/${streamId}/test`);
    } catch (error) {
      if (error instanceof StreamNotFoundError) {
        throw new StreamNotFoundError(streamId);
      }
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Alert rules
  // ---------------------------------------------------------------------------

  /**
   * Create a new alert rule.
   */
  async createAlertRule(rule: CreateAlertRuleRequest): Promise<AlertRule> {
    return this.request('POST', '/api/audit/alerts', rule);
  }

  /**
   * List all alert rules.
   */
  async listAlertRules(): Promise<AlertRule[]> {
    const response = await this.request<{ data: AlertRule[] }>(
      'GET',
      '/api/audit/alerts'
    );
    return response.data;
  }

  /**
   * Get a specific alert rule by ID.
   */
  async getAlertRule(ruleId: string): Promise<AlertRule> {
    try {
      return await this.request('GET', `/api/audit/alerts/${ruleId}`);
    } catch (error) {
      if (error instanceof AlertRuleNotFoundError) {
        throw new AlertRuleNotFoundError(ruleId);
      }
      throw error;
    }
  }

  /**
   * Update an existing alert rule.
   */
  async updateAlertRule(
    ruleId: string,
    rule: UpdateAlertRuleRequest
  ): Promise<AlertRule> {
    try {
      return await this.request('PUT', `/api/audit/alerts/${ruleId}`, rule);
    } catch (error) {
      if (error instanceof AlertRuleNotFoundError) {
        throw new AlertRuleNotFoundError(ruleId);
      }
      throw error;
    }
  }

  /**
   * Delete an alert rule.
   */
  async deleteAlertRule(ruleId: string): Promise<void> {
    try {
      await this.request('DELETE', `/api/audit/alerts/${ruleId}`);
    } catch (error) {
      if (error instanceof AlertRuleNotFoundError) {
        throw new AlertRuleNotFoundError(ruleId);
      }
      throw error;
    }
  }

  /**
   * Test an alert rule against recent events without triggering it.
   */
  async testAlertRule(ruleId: string): Promise<AlertRuleTestResult> {
    try {
      return await this.request('POST', `/api/audit/alerts/${ruleId}/test`);
    } catch (error) {
      if (error instanceof AlertRuleNotFoundError) {
        throw new AlertRuleNotFoundError(ruleId);
      }
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Portal
  // ---------------------------------------------------------------------------

  /**
   * Generate a temporary portal link for viewing audit logs.
   *
   * @param orgId - Organization/tenant ID
   * @param ttl - Time-to-live in seconds (default: server-side default, typically 3600)
   */
  async generatePortalLink(orgId: string, ttl?: number): Promise<PortalLink> {
    const body: Record<string, unknown> = { organization_id: orgId };
    if (ttl !== undefined) {
      body.ttl = ttl;
    }
    return this.request('POST', '/api/audit/portal', body);
  }
}
