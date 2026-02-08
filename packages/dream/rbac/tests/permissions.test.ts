import { describe, it, expect } from 'vitest';
import {
  matchesPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '../src/permissions';

describe('matchesPermission', () => {
  it('should match exact permission strings', () => {
    expect(matchesPermission('users:read', 'users:read')).toBe(true);
  });

  it('should match action wildcard against any action on same resource', () => {
    expect(matchesPermission('users:*', 'users:read')).toBe(true);
    expect(matchesPermission('users:*', 'users:write')).toBe(true);
    expect(matchesPermission('users:*', 'users:delete')).toBe(true);
  });

  it('should match global wildcard against any permission', () => {
    expect(matchesPermission('*', 'users:read')).toBe(true);
    expect(matchesPermission('*', 'teams:write')).toBe(true);
    expect(matchesPermission('*', 'settings:delete')).toBe(true);
  });

  it('should not match different resources', () => {
    expect(matchesPermission('users:read', 'teams:read')).toBe(false);
  });

  it('should not match different actions on same resource', () => {
    expect(matchesPermission('users:read', 'users:write')).toBe(false);
  });

  it('should not allow wildcard on resource part to match different resources', () => {
    expect(matchesPermission('*:read', 'users:read')).toBe(false);
  });

  it('should match base permission against scoped permission', () => {
    expect(matchesPermission('users:read', 'users:read:self')).toBe(true);
  });

  it('should match action wildcard against scoped permissions', () => {
    expect(matchesPermission('users:*', 'users:read:self')).toBe(true);
  });

  it('should be case-sensitive for permission strings', () => {
    expect(matchesPermission('users:read', 'Users:Read')).toBe(false);
    expect(matchesPermission('USERS:READ', 'users:read')).toBe(false);
  });

  it('should handle invalid formats gracefully without crashing', () => {
    expect(matchesPermission('', 'users:read')).toBe(false);
    expect(matchesPermission('users:read', '')).toBe(false);
    expect(matchesPermission('', '')).toBe(false);
    expect(matchesPermission('invalid', 'users:read')).toBe(false);
  });
});

describe('hasAnyPermission', () => {
  it('should return false when user has no permissions', () => {
    expect(hasAnyPermission([], ['users:read'])).toBe(false);
  });

  it('should return true when user has at least one matching permission', () => {
    expect(hasAnyPermission(['users:read'], ['users:read', 'users:write'])).toBe(true);
  });

  it('should return false when no permissions match', () => {
    expect(hasAnyPermission(['teams:read'], ['users:read', 'users:write'])).toBe(false);
  });

  it('should return true when user has global wildcard', () => {
    expect(hasAnyPermission(['*'], ['users:read', 'teams:write'])).toBe(true);
  });

  it('should return false when required permissions array is empty', () => {
    expect(hasAnyPermission(['users:read'], [])).toBe(false);
  });
});

describe('hasAllPermissions', () => {
  it('should return true when user has all required permissions', () => {
    expect(
      hasAllPermissions(['users:read', 'users:write', 'teams:read'], ['users:read', 'teams:read']),
    ).toBe(true);
  });

  it('should return false when user is missing one required permission', () => {
    expect(hasAllPermissions(['users:read'], ['users:read', 'users:write'])).toBe(false);
  });

  it('should return true when required permissions array is empty', () => {
    expect(hasAllPermissions(['users:read'], [])).toBe(true);
  });

  it('should return true when user has global wildcard', () => {
    expect(hasAllPermissions(['*'], ['users:read', 'teams:write', 'settings:delete'])).toBe(true);
  });

  it('should return true when action wildcard covers required permissions', () => {
    expect(hasAllPermissions(['users:*'], ['users:read', 'users:write'])).toBe(true);
  });
});
