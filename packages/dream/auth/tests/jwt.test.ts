import { describe, it, expect } from 'vitest';
import { enrichJwtToken } from '../src/jwt';
import type { JwtEnrichmentContext } from '../src/jwt';

const baseToken = {
  sub: 'user-123',
  email: 'alice@acme.com',
  name: 'Alice',
  iat: 1700000000,
};

const context: JwtEnrichmentContext = {
  tenantId: 'org-456',
  roleSlugs: ['admin', 'manager'],
  activeRole: 'admin',
  permissions: ['users:read', 'users:write', 'teams:*'],
  tenantStatus: 'active',
  planTier: 'enterprise',
  authProvider: 'azure-entra',
};

describe('enrichJwtToken', () => {
  it('should add tenantId to token', () => {
    const result = enrichJwtToken(baseToken, context);
    expect(result.tenantId).toBe('org-456');
  });

  it('should add roleSlugs as roles', () => {
    const result = enrichJwtToken(baseToken, context);
    expect(result.roles).toEqual(['admin', 'manager']);
  });

  it('should add activeRole', () => {
    const result = enrichJwtToken(baseToken, context);
    expect(result.activeRole).toBe('admin');
  });

  it('should add permissions array', () => {
    const result = enrichJwtToken(baseToken, context);
    expect(result.permissions).toEqual(['users:read', 'users:write', 'teams:*']);
  });

  it('should add tenantStatus', () => {
    const result = enrichJwtToken(baseToken, context);
    expect(result.tenantStatus).toBe('active');
  });

  it('should add planTier', () => {
    const result = enrichJwtToken(baseToken, context);
    expect(result.planTier).toBe('enterprise');
  });

  it('should add authProvider', () => {
    const result = enrichJwtToken(baseToken, context);
    expect(result.authProvider).toBe('azure-entra');
  });

  it('should preserve existing token fields (sub, email, name)', () => {
    const result = enrichJwtToken(baseToken, context);
    expect(result.sub).toBe('user-123');
    expect(result.email).toBe('alice@acme.com');
    expect(result.name).toBe('Alice');
  });

  it('should set exp to iat + 28800', () => {
    const result = enrichJwtToken(baseToken, context);
    expect(result.exp).toBe(1700000000 + 28800);
  });

  it('should use provided iat if present', () => {
    const tokenWithIat = { ...baseToken, iat: 1700001000 };
    const result = enrichJwtToken(tokenWithIat, context);
    expect(result.exp).toBe(1700001000 + 28800);
  });
});
