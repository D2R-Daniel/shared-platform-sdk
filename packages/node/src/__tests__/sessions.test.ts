import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionClient } from '../sessions';
import {
  SessionNotFoundError,
  SessionAlreadyRevokedError,
  AdminRequiredError,
  InvalidSessionPolicyError,
} from '../sessions/errors';

// Create mock functions at module level
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
      post: mockPost,
      put: mockPut,
      delete: mockDelete,
    })),
  },
}));

const mockSession = {
  id: 'session-123',
  userId: 'user-456',
  status: 'active',
  createdAt: '2025-01-15T10:00:00Z',
  lastActiveAt: '2025-01-15T12:00:00Z',
  expiresAt: '2025-01-16T10:00:00Z',
  isCurrent: true,
  ipAddress: '192.168.1.1',
  device: {
    userAgent: 'Mozilla/5.0',
    browserName: 'Chrome',
    browserVersion: '120',
    osName: 'macOS',
    osVersion: '14',
    deviceType: 'desktop',
    isMobile: false,
    isBot: false,
  },
  authenticationMethod: 'password',
  mfaVerified: true,
  assuranceLevel: 'aal2',
};

describe('SessionClient', () => {
  let client: SessionClient;
  const accessToken = 'test-access-token';

  beforeEach(() => {
    vi.clearAllMocks();
    client = new SessionClient({ baseUrl: 'https://api.example.com' });
  });

  describe('listSessions', () => {
    it('should send GET with auth header', async () => {
      mockGet.mockResolvedValueOnce({
        data: { data: [mockSession], total: 1, page: 1, pageSize: 20 },
      });

      const result = await client.listSessions(accessToken);

      expect(mockGet).toHaveBeenCalledWith('/', expect.objectContaining({
        headers: { Authorization: `Bearer ${accessToken}` },
      }));
      expect(result.data).toHaveLength(1);
    });

    it('should pass filter params', async () => {
      mockGet.mockResolvedValueOnce({
        data: { data: [], total: 0, page: 1, pageSize: 10 },
      });

      await client.listSessions(accessToken, {
        status: 'active',
        page: 2,
        pageSize: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(mockGet).toHaveBeenCalledWith('/', expect.objectContaining({
        params: {
          status: 'active',
          page: 2,
          page_size: 10,
          sort_by: 'createdAt',
          sort_order: 'desc',
        },
      }));
    });
  });

  describe('getSession', () => {
    it('should return session detail', async () => {
      mockGet.mockResolvedValueOnce({ data: mockSession });

      const result = await client.getSession(accessToken, 'session-123');

      expect(result.id).toBe('session-123');
    });

    it('should throw SessionNotFoundError on 404', async () => {
      mockGet.mockRejectedValueOnce({
        response: { status: 404 },
      });

      await expect(
        client.getSession(accessToken, 'missing')
      ).rejects.toThrow(SessionNotFoundError);
    });
  });

  describe('revokeSession', () => {
    it('should send POST with reason', async () => {
      mockPost.mockResolvedValueOnce({ data: {} });

      await client.revokeSession(accessToken, 'session-123', 'Suspicious activity');

      expect(mockPost).toHaveBeenCalledWith(
        '/session-123/revoke',
        { reason: 'Suspicious activity' },
        expect.objectContaining({
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      );
    });

    it('should throw SessionNotFoundError on 404', async () => {
      mockPost.mockRejectedValueOnce({
        response: { status: 404 },
      });

      await expect(
        client.revokeSession(accessToken, 'missing')
      ).rejects.toThrow(SessionNotFoundError);
    });

    it('should throw SessionAlreadyRevokedError on 409', async () => {
      mockPost.mockRejectedValueOnce({
        response: { status: 409 },
      });

      await expect(
        client.revokeSession(accessToken, 'already-revoked')
      ).rejects.toThrow(SessionAlreadyRevokedError);
    });
  });

  describe('revokeOtherSessions', () => {
    it('should send POST to /revoke-others', async () => {
      mockPost.mockResolvedValueOnce({ data: {} });

      await client.revokeOtherSessions(accessToken, 'Security');

      expect(mockPost).toHaveBeenCalledWith(
        '/revoke-others',
        { reason: 'Security' },
        expect.objectContaining({
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      );
    });
  });

  describe('revokeAllSessions', () => {
    it('should send POST to /revoke-all', async () => {
      mockPost.mockResolvedValueOnce({ data: {} });

      await client.revokeAllSessions(accessToken, 'Account compromised');

      expect(mockPost).toHaveBeenCalledWith(
        '/revoke-all',
        { reason: 'Account compromised' },
        expect.objectContaining({
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      );
    });
  });

  describe('extendSession', () => {
    it('should send to /{id}/extend with sessionId', async () => {
      mockPost.mockResolvedValueOnce({ data: mockSession });

      await client.extendSession(accessToken, 'session-123');

      expect(mockPost).toHaveBeenCalledWith(
        '/session-123/extend',
        null,
        expect.any(Object)
      );
    });

    it('should send to /current/extend without sessionId', async () => {
      mockPost.mockResolvedValueOnce({ data: mockSession });

      await client.extendSession(accessToken);

      expect(mockPost).toHaveBeenCalledWith(
        '/current/extend',
        null,
        expect.any(Object)
      );
    });

    it('should throw SessionNotFoundError on 404', async () => {
      mockPost.mockRejectedValueOnce({
        response: { status: 404 },
      });

      await expect(
        client.extendSession(accessToken, 'missing')
      ).rejects.toThrow(SessionNotFoundError);
    });
  });

  describe('getSessionActivity', () => {
    it('should return activity log', async () => {
      const mockActivity = {
        data: [
          {
            id: 'act-1',
            sessionId: 'session-123',
            action: 'login_succeeded',
            timestamp: '2025-01-15T10:00:00Z',
            ipAddress: '192.168.1.1',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 20,
      };
      mockGet.mockResolvedValueOnce({ data: mockActivity });

      const result = await client.getSessionActivity(accessToken, 'session-123');

      expect(result.data).toHaveLength(1);
      expect(result.data[0].action).toBe('login_succeeded');
    });

    it('should throw SessionNotFoundError on 404', async () => {
      mockGet.mockRejectedValueOnce({
        response: { status: 404 },
      });

      await expect(
        client.getSessionActivity(accessToken, 'missing')
      ).rejects.toThrow(SessionNotFoundError);
    });
  });

  // Admin & Policy Methods

  describe('setSessionPolicy', () => {
    const mockPolicy = {
      maxSessionLifetimeMinutes: 1440,
      idleTimeoutMinutes: 30,
      maxConcurrentSessions: 5,
      onConcurrentLimitReached: 'deny_new' as const,
      bindToIP: false,
      bindToDevice: false,
      requireMFAForNewSession: true,
    };

    it('should send PUT with snake_case body', async () => {
      mockPut.mockResolvedValueOnce({
        data: {
          max_session_lifetime_minutes: 1440,
          idle_timeout_minutes: 30,
          max_concurrent_sessions: 5,
          on_concurrent_limit_reached: 'deny_new',
          bind_to_ip: false,
          bind_to_device: false,
          require_mfa_for_new_session: true,
        },
      });

      client.setAccessToken('admin-token');
      const result = await client.setSessionPolicy(mockPolicy);

      expect(mockPut).toHaveBeenCalledWith(
        '/policy',
        expect.objectContaining({
          max_session_lifetime_minutes: 1440,
          idle_timeout_minutes: 30,
        }),
        expect.any(Object)
      );
      expect(result.maxSessionLifetimeMinutes).toBe(1440);
    });

    it('should throw AdminRequiredError on 403', async () => {
      mockPut.mockRejectedValueOnce({
        response: { status: 403 },
      });

      client.setAccessToken('user-token');
      await expect(
        client.setSessionPolicy(mockPolicy)
      ).rejects.toThrow(AdminRequiredError);
    });

    it('should throw InvalidSessionPolicyError on 422', async () => {
      mockPut.mockRejectedValueOnce({
        response: {
          status: 422,
          data: { field: 'maxConcurrentSessions', message: 'Must be positive' },
        },
      });

      client.setAccessToken('admin-token');
      await expect(
        client.setSessionPolicy({ ...mockPolicy, maxConcurrentSessions: -1 })
      ).rejects.toThrow(InvalidSessionPolicyError);
    });
  });

  describe('getSessionPolicy', () => {
    it('should return the current policy', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          max_session_lifetime_minutes: 1440,
          idle_timeout_minutes: 30,
          max_concurrent_sessions: 5,
          on_concurrent_limit_reached: 'deny_new',
          bind_to_ip: false,
          bind_to_device: false,
          require_mfa_for_new_session: false,
        },
      });

      client.setAccessToken('admin-token');
      const result = await client.getSessionPolicy();

      expect(result.maxSessionLifetimeMinutes).toBe(1440);
      expect(result.idleTimeoutMinutes).toBe(30);
    });

    it('should throw AdminRequiredError on 403', async () => {
      mockGet.mockRejectedValueOnce({
        response: { status: 403 },
      });

      client.setAccessToken('user-token');
      await expect(client.getSessionPolicy()).rejects.toThrow(AdminRequiredError);
    });
  });

  describe('adminListUserSessions', () => {
    it('should send GET with userId in path', async () => {
      mockGet.mockResolvedValueOnce({
        data: { data: [mockSession], total: 1, page: 1, pageSize: 20 },
      });

      client.setAccessToken('admin-token');
      await client.adminListUserSessions('user-456');

      expect(mockGet).toHaveBeenCalledWith(
        '/admin/users/user-456',
        expect.any(Object)
      );
    });

    it('should pass admin filter params', async () => {
      mockGet.mockResolvedValueOnce({
        data: { data: [], total: 0, page: 1, pageSize: 20 },
      });

      client.setAccessToken('admin-token');
      await client.adminListUserSessions('user-456', {
        deviceType: 'mobile',
        country: 'US',
        authMethod: 'sso',
      });

      expect(mockGet).toHaveBeenCalledWith(
        '/admin/users/user-456',
        expect.objectContaining({
          params: expect.objectContaining({
            device_type: 'mobile',
            country: 'US',
            auth_method: 'sso',
          }),
        })
      );
    });

    it('should throw AdminRequiredError on 403', async () => {
      mockGet.mockRejectedValueOnce({
        response: { status: 403 },
      });

      client.setAccessToken('user-token');
      await expect(
        client.adminListUserSessions('user-456')
      ).rejects.toThrow(AdminRequiredError);
    });
  });

  describe('adminRevokeUserSession', () => {
    it('should send POST with reason', async () => {
      mockPost.mockResolvedValueOnce({ data: {} });

      client.setAccessToken('admin-token');
      await client.adminRevokeUserSession('user-456', 'session-123', 'Policy violation');

      expect(mockPost).toHaveBeenCalledWith(
        '/admin/users/user-456/session-123/revoke',
        { reason: 'Policy violation' },
        expect.any(Object)
      );
    });

    it('should throw AdminRequiredError on 403', async () => {
      mockPost.mockRejectedValueOnce({
        response: { status: 403 },
      });

      client.setAccessToken('user-token');
      await expect(
        client.adminRevokeUserSession('user-456', 'session-123')
      ).rejects.toThrow(AdminRequiredError);
    });

    it('should throw SessionNotFoundError on 404', async () => {
      mockPost.mockRejectedValueOnce({
        response: { status: 404 },
      });

      client.setAccessToken('admin-token');
      await expect(
        client.adminRevokeUserSession('user-456', 'missing')
      ).rejects.toThrow(SessionNotFoundError);
    });

    it('should throw SessionAlreadyRevokedError on 409', async () => {
      mockPost.mockRejectedValueOnce({
        response: { status: 409 },
      });

      client.setAccessToken('admin-token');
      await expect(
        client.adminRevokeUserSession('user-456', 'already-revoked')
      ).rejects.toThrow(SessionAlreadyRevokedError);
    });
  });

  describe('adminRevokeAllUserSessions', () => {
    it('should send POST with reason', async () => {
      mockPost.mockResolvedValueOnce({ data: {} });

      client.setAccessToken('admin-token');
      await client.adminRevokeAllUserSessions('user-456', 'Account compromised');

      expect(mockPost).toHaveBeenCalledWith(
        '/admin/users/user-456/revoke-all',
        { reason: 'Account compromised' },
        expect.any(Object)
      );
    });

    it('should throw AdminRequiredError on 403', async () => {
      mockPost.mockRejectedValueOnce({
        response: { status: 403 },
      });

      client.setAccessToken('user-token');
      await expect(
        client.adminRevokeAllUserSessions('user-456')
      ).rejects.toThrow(AdminRequiredError);
    });
  });

  describe('adminGetSessionStats', () => {
    const mockStats = {
      totalActiveSessions: 150,
      uniqueUsers: 75,
      sessionsByDeviceType: { desktop: 100, mobile: 40, tablet: 10 },
      sessionsByAuthMethod: { password: 80, sso: 70 },
      sessionsByCountry: { US: 100, GB: 30, DE: 20 },
      averageSessionDurationMinutes: 45,
      peakConcurrentSessions: 120,
    };

    it('should return stats', async () => {
      mockGet.mockResolvedValueOnce({ data: mockStats });

      client.setAccessToken('admin-token');
      const result = await client.adminGetSessionStats();

      expect(result.totalActiveSessions).toBe(150);
      expect(result.uniqueUsers).toBe(75);
    });

    it('should pass tenantId as query param', async () => {
      mockGet.mockResolvedValueOnce({ data: mockStats });

      client.setAccessToken('admin-token');
      await client.adminGetSessionStats('tenant-789');

      expect(mockGet).toHaveBeenCalledWith(
        '/admin/stats',
        expect.objectContaining({
          params: { tenant_id: 'tenant-789' },
        })
      );
    });

    it('should throw AdminRequiredError on 403', async () => {
      mockGet.mockRejectedValueOnce({
        response: { status: 403 },
      });

      client.setAccessToken('user-token');
      await expect(
        client.adminGetSessionStats()
      ).rejects.toThrow(AdminRequiredError);
    });
  });
});
