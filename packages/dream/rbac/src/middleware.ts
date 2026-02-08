import { matchesPermission, hasAnyPermission, hasAllPermissions } from './permissions';
import { requireMinimumRole } from './hierarchy';

/**
 * Authorization error thrown by RBAC middleware when access is denied.
 */
export class AuthorizationError extends Error {
  public readonly code = 'rbac/permission-denied';
  public readonly statusCode = 403;

  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

type HandlerContext = {
  permissions: string[];
  activeRole: string;
  roleLevel: number;
};

type SimpleHandler = (req: any, ctx: HandlerContext) => Promise<any>;
type MiddlewareHOF = (handler: SimpleHandler) => SimpleHandler;

/**
 * Requires a single permission. Throws AuthorizationError if the user
 * does not have a permission that matches the required one.
 */
export function requirePermission(permission: string): MiddlewareHOF {
  return (handler: SimpleHandler): SimpleHandler => {
    return async (req: any, ctx: HandlerContext) => {
      const hasPermission = ctx.permissions.some((p) =>
        matchesPermission(p, permission),
      );
      if (!hasPermission) {
        throw new AuthorizationError(
          `Missing required permission: ${permission}`,
        );
      }
      return handler(req, ctx);
    };
  };
}

/**
 * Requires any one of the listed permissions (OR logic).
 * Throws AuthorizationError if the user has none of them.
 */
export function requireAnyPermission(
  ...permissions: string[]
): MiddlewareHOF {
  return (handler: SimpleHandler): SimpleHandler => {
    return async (req: any, ctx: HandlerContext) => {
      if (!hasAnyPermission(ctx.permissions, permissions)) {
        throw new AuthorizationError(
          `Missing required permissions (any of): ${permissions.join(', ')}`,
        );
      }
      return handler(req, ctx);
    };
  };
}

/**
 * Requires all of the listed permissions (AND logic).
 * Throws AuthorizationError if the user is missing any one of them.
 */
export function requireAllPermissions(
  ...permissions: string[]
): MiddlewareHOF {
  return (handler: SimpleHandler): SimpleHandler => {
    return async (req: any, ctx: HandlerContext) => {
      if (!hasAllPermissions(ctx.permissions, permissions)) {
        throw new AuthorizationError(
          `Missing required permissions (all of): ${permissions.join(', ')}`,
        );
      }
      return handler(req, ctx);
    };
  };
}

/**
 * Requires an exact role match. Throws AuthorizationError if the
 * user's active role does not match.
 */
export function requireRole(role: string): MiddlewareHOF {
  return (handler: SimpleHandler): SimpleHandler => {
    return async (req: any, ctx: HandlerContext) => {
      if (ctx.activeRole !== role) {
        throw new AuthorizationError(
          `Required role "${role}" but user has role "${ctx.activeRole}"`,
        );
      }
      return handler(req, ctx);
    };
  };
}

/**
 * Requires the user's hierarchy level to be at or above (lower number)
 * the specified minimum level. Throws AuthorizationError if not met.
 */
export function requireMinimumRoleMiddleware(
  minimumLevel: number,
): MiddlewareHOF {
  return (handler: SimpleHandler): SimpleHandler => {
    return async (req: any, ctx: HandlerContext) => {
      if (!requireMinimumRole(ctx.roleLevel, minimumLevel)) {
        throw new AuthorizationError(
          `Insufficient role level. Required: ${minimumLevel}, user has: ${ctx.roleLevel}`,
        );
      }
      return handler(req, ctx);
    };
  };
}
