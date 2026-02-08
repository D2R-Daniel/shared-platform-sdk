import { describe, it, expect } from 'vitest';
import type { Session, SessionUser, JWTPayload } from '../src/sessions';

describe('Session types', () => {
  it('SessionUser has JWT-embedded fields', () => {
    const user: SessionUser = {
      id: 'usr-1',
      email: 'alice@acme.com',
      name: 'Alice',
      tenantId: 'org-1',
      roleSlugs: ['admin'],
      activeRole: 'admin',
      permissions: ['users:*'],
      tenantStatus: 'active',
    };
    expect(user.tenantId).toBe('org-1');
    expect(user.permissions).toContain('users:*');
  });

  it('JWTPayload includes auth provider', () => {
    const payload: JWTPayload = {
      sub: 'usr-1',
      email: 'alice@acme.com',
      name: 'Alice',
      tenantId: 'org-1',
      roles: ['admin'],
      activeRole: 'admin',
      permissions: ['users:*'],
      planTier: 'enterprise',
      tenantStatus: 'active',
      authProvider: 'azure-entra',
      iat: Date.now(),
      exp: Date.now() + 28800,
    };
    expect(payload.authProvider).toBe('azure-entra');
  });
});
