import type { PlatformError, PlatformErrorJSON } from './platform-error';

// === Types ===

export interface SuccessResponseBody<T> {
  success: true;
  data: T;
}

export interface ErrorResponseBody {
  success: false;
  error: PlatformErrorJSON;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  totalItems: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponseBody<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}

// === Functions ===

export function successResponse<T>(data: T): SuccessResponseBody<T> {
  return {
    success: true,
    data,
  };
}

export function errorResponse(error: PlatformError): ErrorResponseBody {
  return {
    success: false,
    error: error.toJSON(),
  };
}

export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationParams,
): PaginatedResponseBody<T> {
  const { page, pageSize, totalItems } = pagination;
  const totalPages = pageSize > 0 ? Math.ceil(totalItems / pageSize) : 0;

  return {
    success: true,
    data,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    },
  };
}
