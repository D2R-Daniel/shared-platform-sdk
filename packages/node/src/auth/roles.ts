/**
 * Role and permission definitions
 */

export interface Permission {
  id: string;
  resource: string;
  action: string;
  name: string;
  description: string;
  scope: 'global' | 'tenant' | 'team' | 'own';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  level: number;
  permissions: string[];
  inheritsFrom: string[];
  isSystem: boolean;
}

export const ROLES: Record<string, Role> = {
  super_admin: {
    id: 'super_admin',
    name: 'Super Administrator',
    description: 'Full platform access. Can manage all tenants, users, and system settings.',
    level: 100,
    permissions: ['*'],
    inheritsFrom: [],
    isSystem: true,
  },
  admin: {
    id: 'admin',
    name: 'Administrator',
    description: 'Full tenant access. Can manage users, settings, and all resources within their tenant.',
    level: 80,
    permissions: [
      'users:*',
      'roles:read',
      'roles:assign',
      'settings:*',
      'reports:*',
      'audit:read',
      'notifications:*',
    ],
    inheritsFrom: ['manager'],
    isSystem: true,
  },
  manager: {
    id: 'manager',
    name: 'Manager',
    description: 'Team management access. Can manage team members and view reports.',
    level: 60,
    permissions: [
      'users:read',
      'users:invite',
      'team:*',
      'reports:read',
      'reports:export',
    ],
    inheritsFrom: ['user'],
    isSystem: true,
  },
  user: {
    id: 'user',
    name: 'User',
    description: 'Standard user access. Can access platform features and manage their own profile.',
    level: 40,
    permissions: [
      'profile:*',
      'notifications:read',
      'notifications:update_preferences',
    ],
    inheritsFrom: ['guest'],
    isSystem: true,
  },
  guest: {
    id: 'guest',
    name: 'Guest',
    description: 'Limited access. Can view public content only.',
    level: 10,
    permissions: ['public:read'],
    inheritsFrom: [],
    isSystem: true,
  },
};

export const PERMISSIONS: Record<string, Permission> = {
  'users:create': { id: 'users:create', resource: 'users', action: 'create', name: 'Create Users', description: 'Create new user accounts', scope: 'tenant' },
  'users:read': { id: 'users:read', resource: 'users', action: 'read', name: 'View Users', description: 'View user profiles', scope: 'tenant' },
  'users:update': { id: 'users:update', resource: 'users', action: 'update', name: 'Update Users', description: 'Modify user accounts', scope: 'tenant' },
  'users:delete': { id: 'users:delete', resource: 'users', action: 'delete', name: 'Delete Users', description: 'Remove user accounts', scope: 'tenant' },
  'users:list': { id: 'users:list', resource: 'users', action: 'list', name: 'List Users', description: 'View user listings', scope: 'tenant' },
  'users:invite': { id: 'users:invite', resource: 'users', action: 'create', name: 'Invite Users', description: 'Send user invitations', scope: 'tenant' },
  'profile:read': { id: 'profile:read', resource: 'profile', action: 'read', name: 'View Own Profile', description: 'View own profile', scope: 'own' },
  'profile:update': { id: 'profile:update', resource: 'profile', action: 'update', name: 'Update Own Profile', description: 'Modify own profile', scope: 'own' },
  'roles:read': { id: 'roles:read', resource: 'roles', action: 'read', name: 'View Roles', description: 'View role definitions', scope: 'tenant' },
  'roles:assign': { id: 'roles:assign', resource: 'roles', action: 'assign', name: 'Assign Roles', description: 'Assign roles to users', scope: 'tenant' },
  'settings:read': { id: 'settings:read', resource: 'settings', action: 'read', name: 'View Settings', description: 'View platform settings', scope: 'tenant' },
  'settings:update': { id: 'settings:update', resource: 'settings', action: 'update', name: 'Update Settings', description: 'Modify platform settings', scope: 'tenant' },
  'reports:read': { id: 'reports:read', resource: 'reports', action: 'read', name: 'View Reports', description: 'Access reports', scope: 'tenant' },
  'reports:export': { id: 'reports:export', resource: 'reports', action: 'export', name: 'Export Reports', description: 'Export report data', scope: 'tenant' },
  'audit:read': { id: 'audit:read', resource: 'audit', action: 'read', name: 'View Audit Logs', description: 'Access audit trail', scope: 'tenant' },
  'notifications:read': { id: 'notifications:read', resource: 'notifications', action: 'read', name: 'View Notifications', description: 'View notifications', scope: 'own' },
  'notifications:manage': { id: 'notifications:manage', resource: 'notifications', action: 'manage', name: 'Manage Notifications', description: 'Configure notifications', scope: 'tenant' },
  'public:read': { id: 'public:read', resource: 'public', action: 'read', name: 'View Public Content', description: 'Access public content', scope: 'global' },
};

/**
 * Get all permissions for a role, including inherited ones.
 */
export function getRolePermissions(roleId: string): Set<string> {
  const role = ROLES[roleId];
  if (!role) return new Set();

  const permissions = new Set(role.permissions);

  for (const parentId of role.inheritsFrom) {
    const parentPerms = getRolePermissions(parentId);
    parentPerms.forEach((p) => permissions.add(p));
  }

  return permissions;
}

/**
 * Check if a permission is granted.
 * Supports wildcards: "users:*" matches "users:read"
 */
export function checkPermission(granted: string[], required: string): boolean {
  for (const p of granted) {
    if (p === '*') return true;
    if (p === required) return true;
    if (p.endsWith(':*')) {
      const resource = p.slice(0, -2);
      if (required.startsWith(`${resource}:`)) return true;
    }
  }
  return false;
}
