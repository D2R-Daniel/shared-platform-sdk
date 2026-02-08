// === Error Classes ===
export {
  PlatformError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServerError,
} from './platform-error';

export type {
  PlatformErrorOptions,
  SubclassErrorOptions,
  RateLimitErrorOptions,
  PlatformErrorJSON,
} from './platform-error';

// === API Handler ===
export { createApiHandler } from './handler';

export type {
  ApiContext,
  ApiHandler,
  ApiHandlerOptions,
  SessionUser,
} from './handler';

// === Response Formatters ===
export { successResponse, errorResponse, paginatedResponse } from './response';

export type {
  SuccessResponseBody,
  ErrorResponseBody,
  PaginationParams,
  PaginationMeta,
  PaginatedResponseBody,
} from './response';

// === Audit ===
export { InMemoryAuditEmitter, createAuditEmitter } from './audit';

export type { AuditEmitter, AuditEventInput } from './audit';
