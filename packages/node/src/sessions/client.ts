/**
 * HTTP client for session management operations.
 */

import axios, { AxiosInstance } from 'axios';
import {
  SessionDetail,
  SessionListOptions,
  AdminSessionListOptions,
  SessionListResponse,
  SessionActivityResponse,
  SessionPolicy,
  SessionStats,
} from './types';
import {
  SessionError,
  SessionNotFoundError,
  SessionAlreadyRevokedError,
  AdminRequiredError,
  InvalidSessionPolicyError,
} from './errors';

export interface SessionClientOptions {
  /** Base URL of the platform API */
  baseUrl: string;
  /** Default access token (can be overridden per-method) */
  accessToken?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * Client for session management operations.
 *
 * @example
 * ```typescript
 * const sessions = new SessionClient({
 *   baseUrl: 'https://api.example.com',
 * });
 *
 * // List active sessions
 * const list = await sessions.listSessions(accessToken);
 * console.log(`You have ${list.total} active sessions`);
 *
 * // Revoke all other sessions
 * await sessions.revokeOtherSessions(accessToken, 'Security precaution');
 * ```
 */
export class SessionClient {
  private http: AxiosInstance;
  private accessToken?: string;

  constructor(options: SessionClientOptions) {
    this.accessToken = options.accessToken;

    this.http = axios.create({
      baseURL: `${options.baseUrl.replace(/\/$/, '')}/sessions`,
      timeout: options.timeout ?? 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Set the default access token for subsequent requests.
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  private authHeaders(accessToken?: string): Record<string, string> {
    const token = accessToken ?? this.accessToken;
    if (!token) {
      throw new SessionError('Access token is required');
    }
    return { Authorization: `Bearer ${token}` };
  }

  /**
   * List the current user's sessions.
   *
   * @param accessToken - JWT access token
   * @param options - Pagination and filter options
   */
  async listSessions(
    accessToken: string,
    options?: SessionListOptions
  ): Promise<SessionListResponse> {
    const params: Record<string, unknown> = {};
    if (options?.status) params.status = options.status;
    if (options?.page) params.page = options.page;
    if (options?.pageSize) params.page_size = options.pageSize;
    if (options?.sortBy) params.sort_by = options.sortBy;
    if (options?.sortOrder) params.sort_order = options.sortOrder;

    const response = await this.http.get<SessionListResponse>('/', {
      headers: this.authHeaders(accessToken),
      params,
    });

    return response.data;
  }

  /**
   * Get details of a specific session.
   *
   * @param accessToken - JWT access token
   * @param sessionId - Session to retrieve
   */
  async getSession(
    accessToken: string,
    sessionId: string
  ): Promise<SessionDetail> {
    try {
      const response = await this.http.get<SessionDetail>(`/${sessionId}`, {
        headers: this.authHeaders(accessToken),
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new SessionNotFoundError(sessionId);
      }
      throw this.handleError(error);
    }
  }

  /**
   * Revoke a specific session.
   *
   * @param accessToken - JWT access token
   * @param sessionId - Session to revoke
   * @param reason - Optional reason for revocation
   */
  async revokeSession(
    accessToken: string,
    sessionId: string,
    reason?: string
  ): Promise<void> {
    try {
      await this.http.post(
        `/${sessionId}/revoke`,
        { reason },
        { headers: this.authHeaders(accessToken) }
      );
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new SessionNotFoundError(sessionId);
      }
      if (error.response?.status === 409) {
        throw new SessionAlreadyRevokedError(sessionId);
      }
      throw this.handleError(error);
    }
  }

  /**
   * Revoke all sessions except the current one.
   *
   * @param accessToken - JWT access token
   * @param reason - Optional reason for revocation
   */
  async revokeOtherSessions(
    accessToken: string,
    reason?: string
  ): Promise<void> {
    await this.http.post(
      '/revoke-others',
      { reason },
      { headers: this.authHeaders(accessToken) }
    );
  }

  /**
   * Revoke all sessions including the current one.
   * After this call, the user will need to re-authenticate.
   *
   * @param accessToken - JWT access token
   * @param reason - Optional reason for revocation
   */
  async revokeAllSessions(
    accessToken: string,
    reason?: string
  ): Promise<void> {
    await this.http.post(
      '/revoke-all',
      { reason },
      { headers: this.authHeaders(accessToken) }
    );
  }

  /**
   * Extend the lifetime of a session.
   *
   * @param accessToken - JWT access token
   * @param sessionId - Session to extend (defaults to current session)
   */
  async extendSession(
    accessToken: string,
    sessionId?: string
  ): Promise<SessionDetail> {
    const path = sessionId ? `/${sessionId}/extend` : '/current/extend';

    try {
      const response = await this.http.post<SessionDetail>(path, null, {
        headers: this.authHeaders(accessToken),
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new SessionNotFoundError(sessionId ?? 'current');
      }
      throw this.handleError(error);
    }
  }

  /**
   * Get the activity log for a specific session.
   *
   * @param accessToken - JWT access token
   * @param sessionId - Session to get activity for
   */
  async getSessionActivity(
    accessToken: string,
    sessionId: string
  ): Promise<SessionActivityResponse> {
    try {
      const response = await this.http.get<SessionActivityResponse>(
        `/${sessionId}/activity`,
        { headers: this.authHeaders(accessToken) }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new SessionNotFoundError(sessionId);
      }
      throw this.handleError(error);
    }
  }

  // --- Session Policy (admin) ---

  /**
   * Set the session policy for the tenant.
   * Requires admin privileges.
   *
   * @param policy - The session policy configuration
   */
  async setSessionPolicy(policy: SessionPolicy): Promise<SessionPolicy> {
    try {
      const response = await this.http.put<SessionPolicy>(
        '/policy',
        {
          max_session_lifetime_minutes: policy.maxSessionLifetimeMinutes,
          idle_timeout_minutes: policy.idleTimeoutMinutes,
          max_concurrent_sessions: policy.maxConcurrentSessions,
          on_concurrent_limit_reached: policy.onConcurrentLimitReached,
          bind_to_ip: policy.bindToIP,
          bind_to_device: policy.bindToDevice,
          require_mfa_for_new_session: policy.requireMFAForNewSession,
        },
        { headers: this.authHeaders() }
      );

      return this.mapSessionPolicy(response.data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new AdminRequiredError();
      }
      if (error.response?.status === 422) {
        const data = error.response.data;
        throw new InvalidSessionPolicyError(
          data?.field ?? 'unknown',
          data?.message ?? 'Invalid policy configuration'
        );
      }
      throw this.handleError(error);
    }
  }

  /**
   * Get the current session policy for the tenant.
   */
  async getSessionPolicy(): Promise<SessionPolicy> {
    try {
      const response = await this.http.get<SessionPolicy>('/policy', {
        headers: this.authHeaders(),
      });

      return this.mapSessionPolicy(response.data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new AdminRequiredError();
      }
      throw this.handleError(error);
    }
  }

  // --- Admin Operations ---

  /**
   * List sessions for a specific user (admin only).
   *
   * @param userId - Target user ID
   * @param options - Pagination and filter options
   */
  async adminListUserSessions(
    userId: string,
    options?: AdminSessionListOptions
  ): Promise<SessionListResponse> {
    const params: Record<string, unknown> = {};
    if (options?.status) params.status = options.status;
    if (options?.page) params.page = options.page;
    if (options?.pageSize) params.page_size = options.pageSize;
    if (options?.sortBy) params.sort_by = options.sortBy;
    if (options?.sortOrder) params.sort_order = options.sortOrder;
    if (options?.deviceType) params.device_type = options.deviceType;
    if (options?.country) params.country = options.country;
    if (options?.authMethod) params.auth_method = options.authMethod;
    if (options?.createdAfter) params.created_after = options.createdAfter;
    if (options?.createdBefore) params.created_before = options.createdBefore;

    try {
      const response = await this.http.get<SessionListResponse>(
        `/admin/users/${userId}`,
        {
          headers: this.authHeaders(),
          params,
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new AdminRequiredError();
      }
      throw this.handleError(error);
    }
  }

  /**
   * Revoke a specific session for a user (admin only).
   *
   * @param userId - Target user ID
   * @param sessionId - Session to revoke
   * @param reason - Optional revocation reason
   */
  async adminRevokeUserSession(
    userId: string,
    sessionId: string,
    reason?: string
  ): Promise<void> {
    try {
      await this.http.post(
        `/admin/users/${userId}/${sessionId}/revoke`,
        { reason },
        { headers: this.authHeaders() }
      );
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new AdminRequiredError();
      }
      if (error.response?.status === 404) {
        throw new SessionNotFoundError(sessionId);
      }
      if (error.response?.status === 409) {
        throw new SessionAlreadyRevokedError(sessionId);
      }
      throw this.handleError(error);
    }
  }

  /**
   * Revoke all sessions for a user (admin only).
   *
   * @param userId - Target user ID
   * @param reason - Optional revocation reason
   */
  async adminRevokeAllUserSessions(
    userId: string,
    reason?: string
  ): Promise<void> {
    try {
      await this.http.post(
        `/admin/users/${userId}/revoke-all`,
        { reason },
        { headers: this.authHeaders() }
      );
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new AdminRequiredError();
      }
      throw this.handleError(error);
    }
  }

  /**
   * Get session statistics for the tenant (admin only).
   *
   * @param tenantId - Optional tenant ID (for super-admin cross-tenant queries)
   */
  async adminGetSessionStats(tenantId?: string): Promise<SessionStats> {
    const params: Record<string, unknown> = {};
    if (tenantId) params.tenant_id = tenantId;

    try {
      const response = await this.http.get<SessionStats>('/admin/stats', {
        headers: this.authHeaders(),
        params,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new AdminRequiredError();
      }
      throw this.handleError(error);
    }
  }

  // --- Private Helpers ---

  private mapSessionPolicy(data: any): SessionPolicy {
    return {
      maxSessionLifetimeMinutes: data.max_session_lifetime_minutes ?? data.maxSessionLifetimeMinutes,
      idleTimeoutMinutes: data.idle_timeout_minutes ?? data.idleTimeoutMinutes,
      maxConcurrentSessions: data.max_concurrent_sessions ?? data.maxConcurrentSessions,
      onConcurrentLimitReached: data.on_concurrent_limit_reached ?? data.onConcurrentLimitReached,
      bindToIP: data.bind_to_ip ?? data.bindToIP,
      bindToDevice: data.bind_to_device ?? data.bindToDevice,
      requireMFAForNewSession: data.require_mfa_for_new_session ?? data.requireMFAForNewSession,
    };
  }

  private handleError(error: any): SessionError {
    const data = error.response?.data;
    return new SessionError(
      data?.message ?? data?.error ?? error.message
    );
  }
}
