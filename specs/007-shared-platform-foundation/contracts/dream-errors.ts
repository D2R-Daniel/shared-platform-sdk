// @dream/errors — Public API Contract
// Version: 0.1.0
// Purpose: Standardized error hierarchy and API route handler

import type { NextRequest, NextResponse } from 'next/server';
import type { ZodSchema } from 'zod';

// === Error Classes ===

export class PlatformError extends Error {
  status: number;
  code: string;
  message: string;
  userMessage: string;
  requestId?: string;
  param?: string;

  constructor(options: PlatformErrorOptions);
}

export class ValidationError extends PlatformError { status: 400; }
export class AuthenticationError extends PlatformError { status: 401; }
export class AuthorizationError extends PlatformError { status: 403; }
export class NotFoundError extends PlatformError { status: 404; }
export class ConflictError extends PlatformError { status: 409; }
export class RateLimitError extends PlatformError {
  status: 429;
  retryAfter?: number;
}
export class ServerError extends PlatformError { status: 500; }

interface PlatformErrorOptions {
  code: string;
  message: string;
  userMessage: string;
  requestId?: string;
  param?: string;
}

// === API Route Handler ===

export interface ApiHandlerOptions {
  requireAuth?: boolean; // default: true
  requiredPermissions?: string[];
  requiredRole?: string;
  minimumRoleLevel?: number;
  validationSchema?: ZodSchema;
  auditAction?: string; // e.g., 'user.updated'
}

export interface ApiContext {
  user: SessionUser;
  tenantId: string;
  permissions: string[];
  requestId: string;
  params: Record<string, string>;
}

export type ApiHandler<T = unknown> = (
  request: NextRequest,
  context: ApiContext,
) => Promise<T>;

export function createApiHandler<T>(
  handler: ApiHandler<T>,
  options?: ApiHandlerOptions,
): (request: NextRequest, routeContext: { params: Promise<Record<string, string>> }) => Promise<NextResponse>;

// === Response Formatters ===

export function successResponse<T>(data: T, status?: number): NextResponse;
export function errorResponse(error: PlatformError): NextResponse;
export function paginatedResponse<T>(data: T[], pagination: PaginationParams): NextResponse;

// === Audit Event Emission ===

export interface AuditEmitter {
  emit(event: AuditEventInput): Promise<void>;
}

export interface AuditEventInput {
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  tenantId: string;
  ipAddress: string;
  requestId: string;
}
