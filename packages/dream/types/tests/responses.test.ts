import { describe, it, expect } from 'vitest';
import type { ApiResponse, ApiErrorResponse, PaginatedResponse, CursorPaginatedResponse } from '../src/responses';

describe('Response types', () => {
  it('ApiResponse wraps data with success: true', () => {
    const response: ApiResponse<{ name: string }> = {
      success: true,
      data: { name: 'Alice' },
    };
    expect(response.success).toBe(true);
    expect(response.data.name).toBe('Alice');
  });

  it('ApiErrorResponse has structured error object', () => {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: 'users/not-found',
        message: 'User not found',
        userMessage: 'The user could not be found.',
        requestId: 'req-123',
      },
    };
    expect(response.success).toBe(false);
    expect(response.error.code).toBe('users/not-found');
  });

  it('PaginatedResponse includes pagination metadata', () => {
    const response: PaginatedResponse<string> = {
      success: true,
      data: ['a', 'b'],
      pagination: {
        page: 1,
        pageSize: 20,
        totalItems: 50,
        totalPages: 3,
        hasNext: true,
        hasPrevious: false,
      },
    };
    expect(response.pagination.totalPages).toBe(3);
  });

  it('CursorPaginatedResponse has cursor', () => {
    const response: CursorPaginatedResponse<string> = {
      success: true,
      data: ['a'],
      hasMore: true,
      nextCursor: 'cursor-abc',
    };
    expect(response.hasMore).toBe(true);
  });
});
