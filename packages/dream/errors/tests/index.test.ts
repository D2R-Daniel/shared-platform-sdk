import { describe, it, expect } from 'vitest';
import * as ErrorsPackage from '../src/index';

describe('@dream/errors barrel export', () => {
  it('exports PlatformError base class', () => {
    expect(ErrorsPackage.PlatformError).toBeDefined();
    expect(typeof ErrorsPackage.PlatformError).toBe('function');
  });

  it('exports all 7 error subclasses', () => {
    expect(ErrorsPackage.ValidationError).toBeDefined();
    expect(ErrorsPackage.AuthenticationError).toBeDefined();
    expect(ErrorsPackage.AuthorizationError).toBeDefined();
    expect(ErrorsPackage.NotFoundError).toBeDefined();
    expect(ErrorsPackage.ConflictError).toBeDefined();
    expect(ErrorsPackage.RateLimitError).toBeDefined();
    expect(ErrorsPackage.ServerError).toBeDefined();
  });

  it('exports createApiHandler', () => {
    expect(ErrorsPackage.createApiHandler).toBeDefined();
    expect(typeof ErrorsPackage.createApiHandler).toBe('function');
  });

  it('exports response formatters', () => {
    expect(ErrorsPackage.successResponse).toBeDefined();
    expect(typeof ErrorsPackage.successResponse).toBe('function');

    expect(ErrorsPackage.errorResponse).toBeDefined();
    expect(typeof ErrorsPackage.errorResponse).toBe('function');

    expect(ErrorsPackage.paginatedResponse).toBeDefined();
    expect(typeof ErrorsPackage.paginatedResponse).toBe('function');
  });

  it('exports InMemoryAuditEmitter', () => {
    expect(ErrorsPackage.InMemoryAuditEmitter).toBeDefined();
    expect(typeof ErrorsPackage.InMemoryAuditEmitter).toBe('function');
  });

  it('exports createAuditEmitter factory', () => {
    expect(ErrorsPackage.createAuditEmitter).toBeDefined();
    expect(typeof ErrorsPackage.createAuditEmitter).toBe('function');
  });

  it('error subclasses produce correct instances through barrel import', () => {
    const error = new ErrorsPackage.NotFoundError({
      code: 'test/not-found',
      message: 'Not found',
      userMessage: 'Not found.',
    });

    expect(error).toBeInstanceOf(ErrorsPackage.PlatformError);
    expect(error).toBeInstanceOf(ErrorsPackage.NotFoundError);
    expect(error.status).toBe(404);
  });
});
