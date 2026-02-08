/**
 * Typed PERMISSIONS constant for autocomplete-friendly permission references.
 * Use these instead of raw strings to avoid typos and enable IDE support.
 */
export const PERMISSIONS = {
  USERS: {
    READ: 'users:read',
    WRITE: 'users:write',
    DELETE: 'users:delete',
    WILDCARD: 'users:*',
  },
  TEAMS: {
    READ: 'teams:read',
    WRITE: 'teams:write',
    MANAGE: 'teams:manage',
    WILDCARD: 'teams:*',
  },
  ROLES: {
    READ: 'roles:read',
    WRITE: 'roles:write',
    ASSIGN: 'roles:assign',
    WILDCARD: 'roles:*',
  },
  INVOICES: {
    READ: 'invoices:read',
    WRITE: 'invoices:write',
    DELETE: 'invoices:delete',
    WILDCARD: 'invoices:*',
  },
  REPORTS: {
    READ: 'reports:read',
    EXPORT: 'reports:export',
    WILDCARD: 'reports:*',
  },
  SETTINGS: {
    READ: 'settings:read',
    WRITE: 'settings:write',
    WILDCARD: 'settings:*',
  },
  AUDIT: {
    READ: 'audit:read',
    EXPORT: 'audit:export',
    WILDCARD: 'audit:*',
  },
  GLOBAL: '*',
} as const;
