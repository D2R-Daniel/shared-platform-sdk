import { describe, it, expect } from 'vitest';
import {
  PlatformError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServerError,
} from '../src/platform-error';

describe('PlatformError', () => {
  it('sets all properties from options', () => {
    const error = new PlatformError({
      status: 500,
      code: 'test/error',
      message: 'Something went wrong internally',
      userMessage: 'Something went wrong. Please try again.',
      requestId: 'req_abc123',
      param: 'email',
    });

    expect(error.status).toBe(500);
    expect(error.code).toBe('test/error');
    expect(error.message).toBe('Something went wrong internally');
    expect(error.userMessage).toBe('Something went wrong. Please try again.');
    expect(error.requestId).toBe('req_abc123');
    expect(error.param).toBe('email');
  });

  it('extends Error', () => {
    const error = new PlatformError({
      status: 500,
      code: 'test/error',
      message: 'Test error',
      userMessage: 'Test error occurred.',
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(PlatformError);
  });

  it('sets name to "PlatformError"', () => {
    const error = new PlatformError({
      status: 500,
      code: 'test/error',
      message: 'Test error',
      userMessage: 'Test error occurred.',
    });

    expect(error.name).toBe('PlatformError');
  });

  it('captures stack trace', () => {
    const error = new PlatformError({
      status: 500,
      code: 'test/error',
      message: 'Test error',
      userMessage: 'Test error occurred.',
    });

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('PlatformError');
  });

  it('makes requestId and param optional', () => {
    const error = new PlatformError({
      status: 400,
      code: 'test/error',
      message: 'Test error',
      userMessage: 'Test error occurred.',
    });

    expect(error.requestId).toBeUndefined();
    expect(error.param).toBeUndefined();
  });

  it('serializes to JSON correctly', () => {
    const error = new PlatformError({
      status: 404,
      code: 'users/not-found',
      message: 'User usr_abc123 not found',
      userMessage: 'The requested user could not be found.',
      requestId: 'req_xyz789',
      param: 'id',
    });

    const json = error.toJSON();

    expect(json).toEqual({
      code: 'users/not-found',
      message: 'User usr_abc123 not found',
      userMessage: 'The requested user could not be found.',
      requestId: 'req_xyz789',
      param: 'id',
    });
  });

  it('toJSON omits undefined optional fields', () => {
    const error = new PlatformError({
      status: 400,
      code: 'test/error',
      message: 'Test error',
      userMessage: 'Test error occurred.',
    });

    const json = error.toJSON();

    expect(json).toEqual({
      code: 'test/error',
      message: 'Test error',
      userMessage: 'Test error occurred.',
    });
    expect('requestId' in json).toBe(false);
    expect('param' in json).toBe(false);
  });
});

describe('ValidationError', () => {
  it('has status 400', () => {
    const error = new ValidationError({
      code: 'users/invalid-email',
      message: 'Email is invalid',
      userMessage: 'Please enter a valid email address.',
      param: 'email',
    });

    expect(error.status).toBe(400);
  });

  it('is instanceof PlatformError and ValidationError', () => {
    const error = new ValidationError({
      code: 'users/invalid-email',
      message: 'Email is invalid',
      userMessage: 'Please enter a valid email.',
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(PlatformError);
    expect(error).toBeInstanceOf(ValidationError);
  });

  it('has name "ValidationError"', () => {
    const error = new ValidationError({
      code: 'test/validation',
      message: 'Invalid',
      userMessage: 'Invalid input.',
    });

    expect(error.name).toBe('ValidationError');
  });
});

describe('AuthenticationError', () => {
  it('has status 401', () => {
    const error = new AuthenticationError({
      code: 'auth/unauthenticated',
      message: 'No valid session found',
      userMessage: 'Please sign in to continue.',
    });

    expect(error.status).toBe(401);
  });

  it('is instanceof PlatformError', () => {
    const error = new AuthenticationError({
      code: 'auth/unauthenticated',
      message: 'No valid session',
      userMessage: 'Please sign in.',
    });

    expect(error).toBeInstanceOf(PlatformError);
    expect(error).toBeInstanceOf(AuthenticationError);
  });

  it('has name "AuthenticationError"', () => {
    const error = new AuthenticationError({
      code: 'auth/unauthenticated',
      message: 'No session',
      userMessage: 'Sign in required.',
    });

    expect(error.name).toBe('AuthenticationError');
  });
});

describe('AuthorizationError', () => {
  it('has status 403', () => {
    const error = new AuthorizationError({
      code: 'rbac/permission-denied',
      message: 'Missing permission: users:write',
      userMessage: 'You do not have permission to perform this action.',
    });

    expect(error.status).toBe(403);
  });

  it('is instanceof PlatformError', () => {
    const error = new AuthorizationError({
      code: 'rbac/permission-denied',
      message: 'Denied',
      userMessage: 'Permission denied.',
    });

    expect(error).toBeInstanceOf(PlatformError);
    expect(error).toBeInstanceOf(AuthorizationError);
  });
});

describe('NotFoundError', () => {
  it('has status 404', () => {
    const error = new NotFoundError({
      code: 'users/not-found',
      message: 'User usr_abc123 not found',
      userMessage: 'The requested user could not be found.',
    });

    expect(error.status).toBe(404);
  });

  it('is instanceof PlatformError', () => {
    const error = new NotFoundError({
      code: 'users/not-found',
      message: 'Not found',
      userMessage: 'Resource not found.',
    });

    expect(error).toBeInstanceOf(PlatformError);
    expect(error).toBeInstanceOf(NotFoundError);
  });
});

describe('ConflictError', () => {
  it('has status 409', () => {
    const error = new ConflictError({
      code: 'users/email-taken',
      message: 'Email already registered',
      userMessage: 'An account with this email already exists.',
    });

    expect(error.status).toBe(409);
  });

  it('is instanceof PlatformError', () => {
    const error = new ConflictError({
      code: 'users/email-taken',
      message: 'Conflict',
      userMessage: 'Conflict.',
    });

    expect(error).toBeInstanceOf(PlatformError);
    expect(error).toBeInstanceOf(ConflictError);
  });
});

describe('RateLimitError', () => {
  it('has status 429', () => {
    const error = new RateLimitError({
      code: 'rate-limit/exceeded',
      message: 'Too many requests',
      userMessage: 'Too many requests. Please try again later.',
    });

    expect(error.status).toBe(429);
  });

  it('supports retryAfter property', () => {
    const error = new RateLimitError({
      code: 'rate-limit/exceeded',
      message: 'Too many requests',
      userMessage: 'Please wait before retrying.',
      retryAfter: 60,
    });

    expect(error.retryAfter).toBe(60);
  });

  it('makes retryAfter optional', () => {
    const error = new RateLimitError({
      code: 'rate-limit/exceeded',
      message: 'Too many requests',
      userMessage: 'Please wait.',
    });

    expect(error.retryAfter).toBeUndefined();
  });

  it('is instanceof PlatformError', () => {
    const error = new RateLimitError({
      code: 'rate-limit/exceeded',
      message: 'Rate limited',
      userMessage: 'Rate limited.',
    });

    expect(error).toBeInstanceOf(PlatformError);
    expect(error).toBeInstanceOf(RateLimitError);
  });
});

describe('ServerError', () => {
  it('has status 500', () => {
    const error = new ServerError({
      code: 'server/internal',
      message: 'Unexpected database connection failure',
      userMessage: 'An unexpected error occurred. Please try again.',
    });

    expect(error.status).toBe(500);
  });

  it('is instanceof PlatformError', () => {
    const error = new ServerError({
      code: 'server/internal',
      message: 'Internal',
      userMessage: 'Internal error.',
    });

    expect(error).toBeInstanceOf(PlatformError);
    expect(error).toBeInstanceOf(ServerError);
  });

  it('has name "ServerError"', () => {
    const error = new ServerError({
      code: 'server/internal',
      message: 'Internal',
      userMessage: 'Internal error.',
    });

    expect(error.name).toBe('ServerError');
  });
});
