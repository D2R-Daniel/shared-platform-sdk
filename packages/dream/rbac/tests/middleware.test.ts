import { describe, it, expect } from 'vitest';
import {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireRole,
  requireMinimumRoleMiddleware,
} from '../src/middleware';

const echoHandler = async (req: any, ctx: any) => ({ ok: true });

function makeCtx(overrides: Partial<{
  permissions: string[];
  activeRole: string;
  roleLevel: number;
}> = {}) {
  return {
    permissions: overrides.permissions ?? [],
    activeRole: overrides.activeRole ?? 'user',
    roleLevel: overrides.roleLevel ?? 30,
  };
}

describe('requirePermission', () => {
  it('should allow when user has the required permission', async () => {
    const wrapped = requirePermission('users:read')(echoHandler);
    const result = await wrapped({}, makeCtx({ permissions: ['users:read'] }));
    expect(result).toEqual({ ok: true });
  });

  it('should throw AuthorizationError when permission is missing', async () => {
    const wrapped = requirePermission('users:write')(echoHandler);
    await expect(
      wrapped({}, makeCtx({ permissions: ['users:read'] })),
    ).rejects.toThrow();

    try {
      await wrapped({}, makeCtx({ permissions: ['users:read'] }));
    } catch (e: any) {
      expect(e.code).toBe('rbac/permission-denied');
    }
  });

  it('should allow when user has wildcard permission', async () => {
    const wrapped = requirePermission('users:read')(echoHandler);
    const result = await wrapped({}, makeCtx({ permissions: ['*'] }));
    expect(result).toEqual({ ok: true });
  });
});

describe('requireAnyPermission', () => {
  it('should allow when user has any of the required permissions', async () => {
    const wrapped = requireAnyPermission('users:read', 'users:write')(echoHandler);
    const result = await wrapped({}, makeCtx({ permissions: ['users:write'] }));
    expect(result).toEqual({ ok: true });
  });

  it('should throw when user has none of the required permissions', async () => {
    const wrapped = requireAnyPermission('users:write', 'users:delete')(echoHandler);
    await expect(
      wrapped({}, makeCtx({ permissions: ['users:read'] })),
    ).rejects.toThrow();

    try {
      await wrapped({}, makeCtx({ permissions: ['users:read'] }));
    } catch (e: any) {
      expect(e.code).toBe('rbac/permission-denied');
    }
  });
});

describe('requireAllPermissions', () => {
  it('should allow when user has all required permissions', async () => {
    const wrapped = requireAllPermissions('users:read', 'teams:read')(echoHandler);
    const result = await wrapped(
      {},
      makeCtx({ permissions: ['users:read', 'teams:read', 'settings:read'] }),
    );
    expect(result).toEqual({ ok: true });
  });

  it('should throw when user is missing one required permission', async () => {
    const wrapped = requireAllPermissions('users:read', 'teams:write')(echoHandler);
    await expect(
      wrapped({}, makeCtx({ permissions: ['users:read'] })),
    ).rejects.toThrow();

    try {
      await wrapped({}, makeCtx({ permissions: ['users:read'] }));
    } catch (e: any) {
      expect(e.code).toBe('rbac/permission-denied');
    }
  });
});

describe('requireRole', () => {
  it('should allow when user has the exact required role', async () => {
    const wrapped = requireRole('admin')(echoHandler);
    const result = await wrapped({}, makeCtx({ activeRole: 'admin' }));
    expect(result).toEqual({ ok: true });
  });

  it('should throw when user has a different role', async () => {
    const wrapped = requireRole('admin')(echoHandler);
    await expect(
      wrapped({}, makeCtx({ activeRole: 'user' })),
    ).rejects.toThrow();

    try {
      await wrapped({}, makeCtx({ activeRole: 'user' }));
    } catch (e: any) {
      expect(e.code).toBe('rbac/permission-denied');
    }
  });
});

describe('requireMinimumRoleMiddleware', () => {
  it('should allow when user level meets minimum', async () => {
    const wrapped = requireMinimumRoleMiddleware(20)(echoHandler);
    const result = await wrapped({}, makeCtx({ roleLevel: 10 }));
    expect(result).toEqual({ ok: true });
  });

  it('should allow when user level equals minimum', async () => {
    const wrapped = requireMinimumRoleMiddleware(20)(echoHandler);
    const result = await wrapped({}, makeCtx({ roleLevel: 20 }));
    expect(result).toEqual({ ok: true });
  });

  it('should throw when user level is too low (higher number)', async () => {
    const wrapped = requireMinimumRoleMiddleware(10)(echoHandler);
    await expect(
      wrapped({}, makeCtx({ roleLevel: 30 })),
    ).rejects.toThrow();

    try {
      await wrapped({}, makeCtx({ roleLevel: 30 }));
    } catch (e: any) {
      expect(e.code).toBe('rbac/permission-denied');
    }
  });

  it('should have error code rbac/permission-denied', async () => {
    const wrapped = requireMinimumRoleMiddleware(10)(echoHandler);
    try {
      await wrapped({}, makeCtx({ roleLevel: 30 }));
    } catch (e: any) {
      expect(e.code).toBe('rbac/permission-denied');
      expect(e.message).toBeTruthy();
    }
  });
});
