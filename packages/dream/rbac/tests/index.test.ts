import { describe, it, expect } from 'vitest';
import {
  matchesPermission,
  hasAnyPermission,
  hasAllPermissions,
  BUILT_IN_ROLES,
  requireMinimumRole,
  getRoleBySlug,
  defineCustomRoles,
  PERMISSIONS,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireRole,
  requireMinimumRoleMiddleware,
  AuthorizationError,
} from '../src/index';

describe('@dream/rbac barrel export', () => {
  it('exports permission matching functions', () => {
    expect(typeof matchesPermission).toBe('function');
    expect(typeof hasAnyPermission).toBe('function');
    expect(typeof hasAllPermissions).toBe('function');
  });

  it('exports role hierarchy', () => {
    expect(BUILT_IN_ROLES).toBeDefined();
    expect(typeof requireMinimumRole).toBe('function');
    expect(typeof getRoleBySlug).toBe('function');
  });

  it('exports custom roles', () => {
    expect(typeof defineCustomRoles).toBe('function');
  });

  it('exports PERMISSIONS constant', () => {
    expect(PERMISSIONS).toBeDefined();
    expect(PERMISSIONS.GLOBAL).toBe('*');
  });

  it('exports middleware HOFs', () => {
    expect(typeof requirePermission).toBe('function');
    expect(typeof requireAnyPermission).toBe('function');
    expect(typeof requireAllPermissions).toBe('function');
    expect(typeof requireRole).toBe('function');
    expect(typeof requireMinimumRoleMiddleware).toBe('function');
  });

  it('exports AuthorizationError', () => {
    expect(typeof AuthorizationError).toBe('function');
    const error = new AuthorizationError('test');
    expect(error.code).toBe('rbac/permission-denied');
    expect(error.statusCode).toBe(403);
  });
});
