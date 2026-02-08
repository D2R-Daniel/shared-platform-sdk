import { describe, it, expect } from 'vitest';
import { successResponse, errorResponse, paginatedResponse } from '../src/response';
import { NotFoundError, ValidationError, PlatformError } from '../src/platform-error';

describe('successResponse', () => {
  it('wraps data with success: true', () => {
    const result = successResponse({ id: 'usr_123', name: 'Alice' });

    expect(result).toEqual({
      success: true,
      data: { id: 'usr_123', name: 'Alice' },
    });
  });

  it('works with arrays', () => {
    const result = successResponse([1, 2, 3]);

    expect(result).toEqual({
      success: true,
      data: [1, 2, 3],
    });
  });

  it('works with null data', () => {
    const result = successResponse(null);

    expect(result).toEqual({
      success: true,
      data: null,
    });
  });

  it('works with primitive data', () => {
    const result = successResponse('deleted');

    expect(result).toEqual({
      success: true,
      data: 'deleted',
    });
  });
});

describe('errorResponse', () => {
  it('extracts error fields from PlatformError', () => {
    const error = new NotFoundError({
      code: 'users/not-found',
      message: 'User usr_abc123 not found in tenant acme_corp',
      userMessage: 'The requested user could not be found.',
    });

    const result = errorResponse(error);

    expect(result).toEqual({
      success: false,
      error: {
        code: 'users/not-found',
        message: 'User usr_abc123 not found in tenant acme_corp',
        userMessage: 'The requested user could not be found.',
      },
    });
  });

  it('includes requestId when present', () => {
    const error = new NotFoundError({
      code: 'users/not-found',
      message: 'User not found',
      userMessage: 'User not found.',
      requestId: 'req_xyz789',
    });

    const result = errorResponse(error);

    expect(result.error.requestId).toBe('req_xyz789');
  });

  it('includes param when present', () => {
    const error = new ValidationError({
      code: 'users/invalid-email',
      message: 'Email is invalid',
      userMessage: 'Please enter a valid email address.',
      param: 'email',
    });

    const result = errorResponse(error);

    expect(result.error.param).toBe('email');
  });

  it('omits requestId and param when not present', () => {
    const error = new NotFoundError({
      code: 'users/not-found',
      message: 'Not found',
      userMessage: 'Not found.',
    });

    const result = errorResponse(error);

    expect('requestId' in result.error).toBe(false);
    expect('param' in result.error).toBe(false);
  });

  it('works with base PlatformError', () => {
    const error = new PlatformError({
      status: 503,
      code: 'service/unavailable',
      message: 'Service temporarily unavailable',
      userMessage: 'The service is temporarily unavailable.',
      requestId: 'req_123',
    });

    const result = errorResponse(error);

    expect(result.success).toBe(false);
    expect(result.error.code).toBe('service/unavailable');
    expect(result.error.requestId).toBe('req_123');
  });
});

describe('paginatedResponse', () => {
  it('calculates totalPages correctly', () => {
    const result = paginatedResponse(
      [{ id: '1' }, { id: '2' }],
      { page: 1, pageSize: 2, totalItems: 5 },
    );

    expect(result.pagination.totalPages).toBe(3);
  });

  it('calculates hasNext and hasPrevious for first page', () => {
    const result = paginatedResponse(
      [{ id: '1' }, { id: '2' }],
      { page: 1, pageSize: 2, totalItems: 5 },
    );

    expect(result.pagination.hasNext).toBe(true);
    expect(result.pagination.hasPrevious).toBe(false);
  });

  it('calculates hasNext and hasPrevious for middle page', () => {
    const result = paginatedResponse(
      [{ id: '3' }, { id: '4' }],
      { page: 2, pageSize: 2, totalItems: 5 },
    );

    expect(result.pagination.hasNext).toBe(true);
    expect(result.pagination.hasPrevious).toBe(true);
  });

  it('calculates hasNext and hasPrevious for last page', () => {
    const result = paginatedResponse(
      [{ id: '5' }],
      { page: 3, pageSize: 2, totalItems: 5 },
    );

    expect(result.pagination.hasNext).toBe(false);
    expect(result.pagination.hasPrevious).toBe(true);
  });

  it('returns full pagination metadata', () => {
    const result = paginatedResponse(
      [{ id: '1' }],
      { page: 1, pageSize: 10, totalItems: 1 },
    );

    expect(result).toEqual({
      success: true,
      data: [{ id: '1' }],
      pagination: {
        page: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    });
  });

  it('handles empty data', () => {
    const result = paginatedResponse(
      [],
      { page: 1, pageSize: 10, totalItems: 0 },
    );

    expect(result.data).toEqual([]);
    expect(result.pagination.totalPages).toBe(0);
    expect(result.pagination.hasNext).toBe(false);
    expect(result.pagination.hasPrevious).toBe(false);
  });
});
