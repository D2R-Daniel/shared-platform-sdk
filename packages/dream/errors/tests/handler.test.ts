import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApiHandler } from '../src/handler';
import {
  PlatformError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  ServerError,
} from '../src/platform-error';
import type { ApiContext } from '../src/handler';

// Helper to create a minimal Request
function makeRequest(url = 'http://localhost/api/test', init?: RequestInit): Request {
  return new Request(url, init);
}

// Helper to create a mock ApiContext
function makeContext(overrides?: Partial<ApiContext>): ApiContext {
  return {
    user: {
      userId: 'usr_test123',
      email: 'test@example.com',
      name: 'Test User',
    },
    tenantId: 'tnt_acme',
    permissions: ['users:read', 'users:write'],
    requestId: 'req_test',
    params: {},
    ...overrides,
  };
}

// Fake ZodError (mimics Zod's error shape without importing zod)
class FakeZodError extends Error {
  issues: Array<{ path: (string | number)[]; message: string }>;

  constructor(issues: Array<{ path: (string | number)[]; message: string }>) {
    super('Validation failed');
    this.name = 'ZodError';
    this.issues = issues;
  }
}

describe('createApiHandler', () => {
  it('returns success response when handler resolves', async () => {
    const handler = createApiHandler(async (_req, _ctx) => {
      return { id: 'usr_123', name: 'Alice' };
    });

    const request = makeRequest();
    const response = await handler(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      success: true,
      data: { id: 'usr_123', name: 'Alice' },
    });
  });

  it('generates a requestId and sets X-Request-ID header', async () => {
    const handler = createApiHandler(async (_req, _ctx) => {
      return { ok: true };
    });

    const request = makeRequest();
    const response = await handler(request);

    const requestId = response.headers.get('X-Request-ID');
    expect(requestId).toBeDefined();
    expect(requestId).toBeTruthy();
    expect(typeof requestId).toBe('string');
  });

  it('passes requestId to the handler context', async () => {
    let capturedRequestId: string | undefined;

    const handler = createApiHandler(async (_req, ctx) => {
      capturedRequestId = ctx.requestId;
      return { ok: true };
    });

    const request = makeRequest();
    const response = await handler(request);

    const headerRequestId = response.headers.get('X-Request-ID');
    expect(capturedRequestId).toBe(headerRequestId);
  });

  it('catches ValidationError and returns 400', async () => {
    const handler = createApiHandler(async () => {
      throw new ValidationError({
        code: 'users/invalid-email',
        message: 'Email is invalid',
        userMessage: 'Please enter a valid email address.',
        param: 'email',
      });
    });

    const request = makeRequest();
    const response = await handler(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('users/invalid-email');
    expect(body.error.param).toBe('email');
  });

  it('catches NotFoundError and returns 404', async () => {
    const handler = createApiHandler(async () => {
      throw new NotFoundError({
        code: 'users/not-found',
        message: 'User usr_abc123 not found',
        userMessage: 'The requested user could not be found.',
      });
    });

    const request = makeRequest();
    const response = await handler(request);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('users/not-found');
  });

  it('catches AuthenticationError and returns 401', async () => {
    const handler = createApiHandler(async () => {
      throw new AuthenticationError({
        code: 'auth/unauthenticated',
        message: 'No valid session',
        userMessage: 'Please sign in to continue.',
      });
    });

    const request = makeRequest();
    const response = await handler(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('auth/unauthenticated');
  });

  it('adds requestId to PlatformError in error response', async () => {
    const handler = createApiHandler(async () => {
      throw new NotFoundError({
        code: 'users/not-found',
        message: 'Not found',
        userMessage: 'Not found.',
      });
    });

    const request = makeRequest();
    const response = await handler(request);
    const body = await response.json();

    expect(body.error.requestId).toBeDefined();
    expect(body.error.requestId).toBe(response.headers.get('X-Request-ID'));
  });

  it('catches ZodError and maps to ValidationError (400)', async () => {
    const handler = createApiHandler(async () => {
      throw new FakeZodError([
        { path: ['email'], message: 'Invalid email' },
        { path: ['name'], message: 'Required' },
      ]);
    });

    const request = makeRequest();
    const response = await handler(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('validation/invalid-input');
    expect(body.error.requestId).toBeDefined();
  });

  it('catches unknown errors and maps to ServerError (500)', async () => {
    const handler = createApiHandler(async () => {
      throw new Error('Unexpected database connection failure');
    });

    const request = makeRequest();
    const response = await handler(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('server/internal-error');
    expect(body.error.userMessage).toBe(
      'An unexpected error occurred. Please try again.',
    );
    // Internal message should NOT be exposed
    expect(body.error.message).not.toContain('database connection');
  });

  it('catches non-Error throwables and maps to ServerError (500)', async () => {
    const handler = createApiHandler(async () => {
      throw 'string error'; // eslint-disable-line no-throw-literal
    });

    const request = makeRequest();
    const response = await handler(request);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('server/internal-error');
  });

  it('sets Content-Type to application/json', async () => {
    const handler = createApiHandler(async () => {
      return { ok: true };
    });

    const request = makeRequest();
    const response = await handler(request);

    expect(response.headers.get('Content-Type')).toContain('application/json');
  });
});
