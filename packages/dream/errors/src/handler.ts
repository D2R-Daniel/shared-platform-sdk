import { PlatformError, ValidationError, AuthenticationError, AuthorizationError, type SubclassErrorOptions } from './platform-error';
import { successResponse, errorResponse } from './response';
import { matchesPermission } from '@dream/rbac';
import type { AuditEmitter } from './audit';

// === Types ===

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  roleSlugs?: string[];
  activeRole?: string;
  permissions?: string[];
  tenantStatus?: string;
}

export interface ApiContext {
  user: SessionUser | null;
  tenantId: string;
  permissions: string[];
  requestId: string;
  params: Record<string, string>;
}

interface TestOverrides {
  getSession?: () => Promise<SessionUser | null>;
  getTenantId?: () => Promise<string | null>;
  auditEmitter?: { emit: (event: Record<string, unknown>) => Promise<void> };
}

export interface ApiHandlerOptions {
  requireAuth?: boolean;
  requiredPermissions?: string[];
  requiredRole?: string;
  minimumRoleLevel?: number;
  auditAction?: string;
  /** @internal Test-only: inject mock dependencies */
  _testOverrides?: TestOverrides;
}

export type ApiHandler<T = unknown> = (
  request: Request,
  context: ApiContext,
) => Promise<T>;

// === ZodError detection ===

interface ZodLikeError {
  name: string;
  issues: Array<{ path: (string | number)[]; message: string }>;
}

function isZodError(error: unknown): error is ZodLikeError {
  return (
    error instanceof Error &&
    error.name === 'ZodError' &&
    'issues' in error &&
    Array.isArray((error as ZodLikeError).issues)
  );
}

// === Route context (Next.js style) ===

interface RouteContext {
  params: Promise<Record<string, string>>;
}

// === createApiHandler ===

export function createApiHandler<T>(
  handler: ApiHandler<T>,
  options?: ApiHandlerOptions,
): (request: Request, routeContext?: RouteContext) => Promise<Response> {
  return async (request: Request, routeContext?: RouteContext): Promise<Response> => {
    const requestId = crypto.randomUUID();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
    };

    try {
      const overrides = options?._testOverrides;
      const params = routeContext ? await routeContext.params : {};

      // --- Auth check ---
      let sessionUser: SessionUser | null = null;

      if (overrides?.getSession) {
        sessionUser = await overrides.getSession();
      }

      if (options?.requireAuth && !sessionUser) {
        throw new AuthenticationError({
          code: 'auth/unauthenticated',
          message: 'Authentication required',
          userMessage: 'Please sign in to continue.',
          requestId,
        });
      }

      // --- Tenant check ---
      let tenantId = sessionUser?.tenantId ?? '';

      if (overrides?.getTenantId) {
        const resolvedTenant = await overrides.getTenantId();
        if (resolvedTenant) {
          tenantId = resolvedTenant;
        }
      }

      if (options?.requireAuth && sessionUser && !tenantId) {
        throw new ValidationError({
          code: 'tenant/not-found',
          message: 'Tenant could not be resolved',
          userMessage: 'Organization not found. Please select an organization.',
          requestId,
        });
      }

      // --- Permission check ---
      const userPermissions = sessionUser?.permissions ?? [];

      if (options?.requiredPermissions && options.requiredPermissions.length > 0 && sessionUser) {
        const hasPermission = options.requiredPermissions.every((required) =>
          userPermissions.some((held) => matchesPermission(held, required)),
        );

        if (!hasPermission) {
          throw new AuthorizationError({
            code: 'rbac/permission-denied',
            message: `Missing required permissions: ${options.requiredPermissions.join(', ')}`,
            userMessage: 'You do not have permission to perform this action.',
            requestId,
          });
        }
      }

      // Build context
      const context: ApiContext = {
        user: sessionUser,
        tenantId,
        permissions: userPermissions,
        requestId,
        params,
      };

      const result = await handler(request, context);
      const body = successResponse(result);

      // --- Audit emission (on success only) ---
      if (options?.auditAction && overrides?.auditEmitter && sessionUser) {
        overrides.auditEmitter.emit({
          action: options.auditAction,
          actorId: sessionUser.id,
          tenantId,
          requestId,
        }).catch(() => {
          // Audit emission failures should not break the response
        });
      }

      return new Response(JSON.stringify(body), {
        status: 200,
        headers,
      });
    } catch (error: unknown) {
      if (error instanceof PlatformError) {
        // Attach requestId to the error so it appears in the response body
        const errorWithRequestId = new (error.constructor as new (opts: SubclassErrorOptions & { status?: number; retryAfter?: number }) => PlatformError)({
          ...error,
          message: error.message,
          requestId,
        });

        const body = errorResponse(errorWithRequestId);

        return new Response(JSON.stringify(body), {
          status: error.status,
          headers,
        });
      }

      if (isZodError(error)) {
        const zodMessages = error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join('; ');

        const validationError = new ValidationError({
          code: 'validation/invalid-input',
          message: zodMessages,
          userMessage: 'The provided input is invalid. Please check your data and try again.',
          requestId,
        });

        const body = errorResponse(validationError);

        return new Response(JSON.stringify(body), {
          status: 400,
          headers,
        });
      }

      // Unknown error — do NOT expose internal details
      const serverError = new PlatformError({
        status: 500,
        code: 'server/internal-error',
        message: 'An internal server error occurred',
        userMessage: 'An unexpected error occurred. Please try again.',
        requestId,
      });

      const body = errorResponse(serverError);

      return new Response(JSON.stringify(body), {
        status: 500,
        headers,
      });
    }
  };
}
