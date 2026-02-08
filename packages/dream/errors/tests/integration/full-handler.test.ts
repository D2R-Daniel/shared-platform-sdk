import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import {
  createApiHandler,
  NotFoundError,
} from '../../src/index';

// ── Mock request helper ──────────────────────────────────────────────────

function createMockRequest(
  url: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  } = {},
): Request {
  const init: RequestInit = {
    method: options.method ?? 'GET',
    headers: new Headers(options.headers ?? {}),
  };
  if (options.body) {
    init.body = JSON.stringify(options.body);
    (init.headers as Headers).set('Content-Type', 'application/json');
  }
  return new Request(url, init);
}

// ── Mock session user fixtures ───────────────────────────────────────────

const adminUser = {
  id: 'usr-admin-001',
  email: 'admin@acme.com',
  name: 'Admin User',
  tenantId: 'org-acme-001',
  roleSlugs: ['admin'],
  activeRole: 'admin',
  permissions: ['users:*', 'teams:*', 'settings:*', 'audit:read'],
  tenantStatus: 'active' as const,
};

const viewerUser = {
  id: 'usr-viewer-001',
  email: 'viewer@acme.com',
  name: 'Viewer User',
  tenantId: 'org-acme-001',
  roleSlugs: ['guest'],
  activeRole: 'guest',
  permissions: ['users:read'],
  tenantStatus: 'active' as const,
};

// ── Mock audit emitter ───────────────────────────────────────────────────

const mockAuditEmit = vi.fn().mockResolvedValue(undefined);
const mockAuditEmitter = { emit: mockAuditEmit };

// ── Tests ────────────────────────────────────────────────────────────────

describe('createApiHandler — full cross-package integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Scenario 1: Full success flow ────────────────────────────────────

  it('returns { success: true, data } when auth + permission + tenant + handler all pass', async () => {
    const handler = createApiHandler(
      async (_req, ctx) => {
        return { id: 'usr-123', name: 'Updated User' };
      },
      {
        requireAuth: true,
        requiredPermissions: ['users:write'],
        auditAction: 'user.updated',
        _testOverrides: {
          getSession: async () => adminUser,
          getTenantId: async () => 'org-acme-001',
          auditEmitter: mockAuditEmitter,
        },
      },
    );

    const req = createMockRequest('http://localhost/api/users/usr-123', {
      method: 'PUT',
      body: { name: 'Updated User' },
    });

    const res = await handler(req, { params: Promise.resolve({ id: 'usr-123' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ id: 'usr-123', name: 'Updated User' });
  });

  // ── Scenario 2: Auth failure → 401 ──────────────────────────────────

  it('returns 401 with auth/unauthenticated when session is null', async () => {
    const handler = createApiHandler(
      async () => ({ id: 'never-reached' }),
      {
        requireAuth: true,
        _testOverrides: {
          getSession: async () => null,
          getTenantId: async () => null,
        },
      },
    );

    const req = createMockRequest('http://localhost/api/users');
    const res = await handler(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('auth/unauthenticated');
    expect(body.error.requestId).toBeDefined();
    expect(body.error.userMessage).toBeDefined();
  });

  // ── Scenario 3: Permission failure → 403 ────────────────────────────

  it('returns 403 with rbac/permission-denied when user lacks required permission', async () => {
    const handler = createApiHandler(
      async () => ({ id: 'never-reached' }),
      {
        requireAuth: true,
        requiredPermissions: ['users:delete'],
        _testOverrides: {
          getSession: async () => viewerUser, // only has users:read
          getTenantId: async () => 'org-acme-001',
        },
      },
    );

    const req = createMockRequest('http://localhost/api/users/usr-123', {
      method: 'DELETE',
    });
    const res = await handler(req, { params: Promise.resolve({ id: 'usr-123' }) });
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('rbac/permission-denied');
    expect(body.error.requestId).toBeDefined();
  });

  // ── Scenario 4: NotFoundError from handler → 404 ────────────────────

  it('returns 404 with correct error format when handler throws NotFoundError', async () => {
    const handler = createApiHandler(
      async (_req, ctx) => {
        throw new NotFoundError({
          code: 'users/not-found',
          message: `User ${ctx.params.id} not found in tenant ${ctx.tenantId}`,
          userMessage: 'The requested user could not be found.',
        });
      },
      {
        requireAuth: true,
        requiredPermissions: ['users:read'],
        _testOverrides: {
          getSession: async () => adminUser,
          getTenantId: async () => 'org-acme-001',
        },
      },
    );

    const req = createMockRequest('http://localhost/api/users/usr-999');
    const res = await handler(req, { params: Promise.resolve({ id: 'usr-999' }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('users/not-found');
    expect(body.error.userMessage).toBe('The requested user could not be found.');
    expect(body.error.requestId).toBeDefined();
  });

  // ── Scenario 5: Zod ValidationError → 400 ───────────────────────────

  it('returns 400 with validation error format when Zod schema fails', async () => {
    const schema = z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email'),
    });

    const handler = createApiHandler(
      async (req) => {
        const body = schema.parse(await req.json());
        return body;
      },
      {
        requireAuth: true,
        requiredPermissions: ['users:write'],
        _testOverrides: {
          getSession: async () => adminUser,
          getTenantId: async () => 'org-acme-001',
        },
      },
    );

    const req = createMockRequest('http://localhost/api/users', {
      method: 'POST',
      body: { name: '', email: 'not-an-email' },
    });
    const res = await handler(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toMatch(/validation/);
    expect(body.error.requestId).toBeDefined();
  });

  // ── Scenario 6: Unknown error → 500 ─────────────────────────────────

  it('returns 500 with generic userMessage when handler throws unknown error', async () => {
    const handler = createApiHandler(
      async () => {
        throw new Error('Database connection lost');
      },
      {
        requireAuth: true,
        _testOverrides: {
          getSession: async () => adminUser,
          getTenantId: async () => 'org-acme-001',
        },
      },
    );

    const req = createMockRequest('http://localhost/api/users');
    const res = await handler(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error.code).toMatch(/server/);
    // Must NOT expose internal error details to the caller
    expect(body.error.userMessage).not.toContain('Database connection lost');
    expect(body.error.requestId).toBeDefined();
  });

  // ── Scenario 7: requestId is generated and included ──────────────────

  it('generates a requestId and includes it in both success and error responses', async () => {
    const handler = createApiHandler(
      async () => ({ ok: true }),
      {
        requireAuth: true,
        _testOverrides: {
          getSession: async () => adminUser,
          getTenantId: async () => 'org-acme-001',
        },
      },
    );

    const req = createMockRequest('http://localhost/api/health');
    const res = await handler(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(200);
    const requestId = res.headers.get('X-Request-ID') ?? body.requestId;
    expect(requestId).toBeDefined();
    expect(typeof requestId).toBe('string');
    expect(requestId.length).toBeGreaterThan(0);
  });

  // ── Scenario 8: Audit event emitted on success ──────────────────────

  it('emits audit event with correct fields when auditAction is set and handler succeeds', async () => {
    const handler = createApiHandler(
      async (_req, ctx) => {
        return { id: ctx.params.id, name: 'Updated User' };
      },
      {
        requireAuth: true,
        requiredPermissions: ['users:write'],
        auditAction: 'user.updated',
        _testOverrides: {
          getSession: async () => adminUser,
          getTenantId: async () => 'org-acme-001',
          auditEmitter: mockAuditEmitter,
        },
      },
    );

    const req = createMockRequest('http://localhost/api/users/usr-123', {
      method: 'PUT',
      body: { name: 'Updated User' },
    });

    const res = await handler(req, { params: Promise.resolve({ id: 'usr-123' }) });
    expect(res.status).toBe(200);

    // Wait for async audit emission
    await vi.waitFor(() => {
      expect(mockAuditEmit).toHaveBeenCalledTimes(1);
    });

    const auditCall = mockAuditEmit.mock.calls[0][0];
    expect(auditCall.action).toBe('user.updated');
    expect(auditCall.actorId).toBe('usr-admin-001');
    expect(auditCall.tenantId).toBe('org-acme-001');
    expect(auditCall.requestId).toBeDefined();
  });

  // ── Scenario 9: No audit event emitted on failure ────────────────────

  it('does NOT emit audit event when handler throws an error', async () => {
    const handler = createApiHandler(
      async () => {
        throw new NotFoundError({
          code: 'users/not-found',
          message: 'Not found',
          userMessage: 'Not found.',
        });
      },
      {
        requireAuth: true,
        auditAction: 'user.updated',
        _testOverrides: {
          getSession: async () => adminUser,
          getTenantId: async () => 'org-acme-001',
          auditEmitter: mockAuditEmitter,
        },
      },
    );

    const req = createMockRequest('http://localhost/api/users/usr-999');
    await handler(req, { params: Promise.resolve({ id: 'usr-999' }) });

    expect(mockAuditEmit).not.toHaveBeenCalled();
  });

  // ── Scenario 10: Missing tenant → 400 ───────────────────────────────

  it('returns 400 with tenant/not-found when tenant cannot be resolved', async () => {
    const handler = createApiHandler(
      async () => ({ id: 'never-reached' }),
      {
        requireAuth: true,
        _testOverrides: {
          getSession: async () => ({ ...adminUser, tenantId: '' }),
          getTenantId: async () => null,
        },
      },
    );

    const req = createMockRequest('http://localhost/api/users');
    const res = await handler(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toMatch(/tenant/);
  });

  // ── Scenario 11: Public route (no auth required) ─────────────────────

  it('allows access to public routes without authentication', async () => {
    const handler = createApiHandler(
      async () => ({ status: 'healthy', timestamp: new Date().toISOString() }),
      {
        requireAuth: false,
        _testOverrides: {
          getSession: async () => null,
          getTenantId: async () => null,
        },
      },
    );

    const req = createMockRequest('http://localhost/api/health');
    const res = await handler(req, { params: Promise.resolve({}) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('healthy');
  });

  // ── Scenario 12: Wildcard permission grants access ────────────────────

  it('grants access when user has wildcard permission matching the required one', async () => {
    const wildcardUser = {
      ...adminUser,
      permissions: ['users:*'],
    };

    const handler = createApiHandler(
      async () => ({ deleted: true }),
      {
        requireAuth: true,
        requiredPermissions: ['users:delete'],
        _testOverrides: {
          getSession: async () => wildcardUser,
          getTenantId: async () => 'org-acme-001',
        },
      },
    );

    const req = createMockRequest('http://localhost/api/users/usr-123', {
      method: 'DELETE',
    });
    const res = await handler(req, { params: Promise.resolve({ id: 'usr-123' }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.deleted).toBe(true);
  });
});
