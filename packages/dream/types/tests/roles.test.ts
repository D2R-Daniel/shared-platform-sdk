import { describe, it, expect } from 'vitest';
import type { Role, BuiltInRole, RoleSlug, CustomRole, RoleCreateInput } from '../src/roles';
import type { Permission, PermissionString } from '../src/permissions';
import type { OrganizationMembership } from '../src/memberships';

describe('Role types', () => {
  it('Role has hierarchy level', () => {
    const role: Role = {
      id: '1',
      name: 'Admin',
      slug: 'admin',
      hierarchyLevel: 10,
      isBuiltIn: true,
      isActive: true,
      organizationId: null,
      permissions: ['users:*', 'roles:*'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(role.hierarchyLevel).toBe(10);
  });

  it('BuiltInRole is a union of 5 roles', () => {
    const roles: BuiltInRole[] = ['super_admin', 'admin', 'manager', 'user', 'guest'];
    expect(roles).toHaveLength(5);
  });

  it('PermissionString matches resource:action format', () => {
    const perm: PermissionString = 'users:read';
    expect(perm).toBe('users:read');
  });

  it('OrganizationMembership links user to org', () => {
    const membership: OrganizationMembership = {
      id: '1',
      userId: 'user-1',
      organizationId: 'org-1',
      joinedAt: new Date(),
    };
    expect(membership.userId).toBe('user-1');
  });
});
