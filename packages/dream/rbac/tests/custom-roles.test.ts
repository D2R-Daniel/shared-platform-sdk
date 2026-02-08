import { describe, it, expect, beforeEach } from 'vitest';
import { defineCustomRoles, resetCustomRoles } from '../src/custom-roles';
import { getRoleBySlug } from '../src/hierarchy';

describe('defineCustomRoles', () => {
  beforeEach(() => {
    resetCustomRoles();
  });

  it('should accept a valid custom role and return it', () => {
    const result = defineCustomRoles([
      {
        slug: 'team-lead',
        name: 'Team Lead',
        hierarchyLevel: 15,
        permissions: ['users:read', 'teams:*'],
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('team-lead');
    expect(result[0].name).toBe('Team Lead');
    expect(result[0].hierarchyLevel).toBe(15);
    expect(result[0].permissions).toEqual(['users:read', 'teams:*']);
  });

  it('should reject hierarchy level 0 (reserved for super_admin)', () => {
    expect(() =>
      defineCustomRoles([
        {
          slug: 'custom-top',
          name: 'Custom Top',
          hierarchyLevel: 0,
          permissions: ['*'],
        },
      ]),
    ).toThrow('Hierarchy level must be between 1 and 100');
  });

  it('should reject hierarchy level greater than 100', () => {
    expect(() =>
      defineCustomRoles([
        {
          slug: 'custom-low',
          name: 'Custom Low',
          hierarchyLevel: 101,
          permissions: ['users:read'],
        },
      ]),
    ).toThrow('Hierarchy level must be between 1 and 100');
  });

  it('should reject invalid slug format', () => {
    expect(() =>
      defineCustomRoles([
        {
          slug: 'Invalid Slug!',
          name: 'Bad Slug',
          hierarchyLevel: 25,
          permissions: ['users:read'],
        },
      ]),
    ).toThrow('Invalid slug format');
  });

  it('should accept slugs with lowercase letters, numbers, and hyphens', () => {
    const result = defineCustomRoles([
      {
        slug: 'dept-manager-2',
        name: 'Department Manager 2',
        hierarchyLevel: 18,
        permissions: ['departments:*'],
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('dept-manager-2');
  });

  it('should return multiple custom roles in order', () => {
    const result = defineCustomRoles([
      {
        slug: 'senior-manager',
        name: 'Senior Manager',
        hierarchyLevel: 15,
        permissions: ['users:read', 'teams:*'],
      },
      {
        slug: 'junior-user',
        name: 'Junior User',
        hierarchyLevel: 35,
        permissions: ['users:read:self'],
      },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe('senior-manager');
    expect(result[1].slug).toBe('junior-user');
  });

  it('should allow custom roles with product-specific permissions', () => {
    const result = defineCustomRoles([
      {
        slug: 'billing-admin',
        name: 'Billing Admin',
        hierarchyLevel: 12,
        permissions: ['invoices:*', 'payments:*', 'subscriptions:read'],
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].permissions).toContain('invoices:*');
    expect(result[0].permissions).toContain('payments:*');
  });

  it('should make custom roles findable via getRoleBySlug', () => {
    defineCustomRoles([
      {
        slug: 'custom-viewer',
        name: 'Custom Viewer',
        hierarchyLevel: 35,
        permissions: ['users:read:self'],
      },
    ]);

    const found = getRoleBySlug('custom-viewer');
    expect(found).toBeDefined();
    expect(found!.slug).toBe('custom-viewer');
    expect(found!.hierarchyLevel).toBe(35);
  });

  it('should support optional organizationId scoping', () => {
    const result = defineCustomRoles([
      {
        slug: 'org-admin',
        name: 'Org Admin',
        hierarchyLevel: 11,
        permissions: ['users:*', 'teams:*'],
        organizationId: 'org-123',
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('org-admin');
  });

  it('should reject empty permissions array', () => {
    expect(() =>
      defineCustomRoles([
        {
          slug: 'no-perms',
          name: 'No Permissions',
          hierarchyLevel: 50,
          permissions: [],
        },
      ]),
    ).toThrow('Permissions must be a non-empty array');
  });
});
