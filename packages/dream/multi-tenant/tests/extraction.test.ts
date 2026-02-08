import { describe, it, expect } from 'vitest';
import {
  extractTenantFromSubdomain,
  extractTenantFromHeader,
  extractTenantFromQuery,
} from '../src/extraction';

describe('extractTenantFromSubdomain', () => {
  it('should extract tenant from subdomain: acme.dreamteam.app → acme', () => {
    const result = extractTenantFromSubdomain('acme.dreamteam.app', {
      baseDomain: 'dreamteam.app',
    });
    expect(result).toBe('acme');
  });

  it('should return null for www subdomain', () => {
    const result = extractTenantFromSubdomain('www.dreamteam.app', {
      baseDomain: 'dreamteam.app',
    });
    expect(result).toBeNull();
  });

  it('should return null for api subdomain', () => {
    const result = extractTenantFromSubdomain('api.dreamteam.app', {
      baseDomain: 'dreamteam.app',
    });
    expect(result).toBeNull();
  });

  it('should respect custom excludeSubdomains', () => {
    const result = extractTenantFromSubdomain('staging.dreamteam.app', {
      baseDomain: 'dreamteam.app',
      excludeSubdomains: ['staging', 'preview'],
    });
    expect(result).toBeNull();
  });

  it('should return null for bare domain (no subdomain)', () => {
    const result = extractTenantFromSubdomain('dreamteam.app', {
      baseDomain: 'dreamteam.app',
    });
    expect(result).toBeNull();
  });

  it('should handle multi-level base domains', () => {
    const result = extractTenantFromSubdomain('acme.app.example.co.uk', {
      baseDomain: 'app.example.co.uk',
    });
    expect(result).toBe('acme');
  });
});

describe('extractTenantFromHeader', () => {
  it('should read X-Tenant-ID header', () => {
    const headers = new Headers({ 'X-Tenant-ID': 'org-123' });
    const result = extractTenantFromHeader(headers, 'X-Tenant-ID');
    expect(result).toBe('org-123');
  });

  it('should read custom header name', () => {
    const headers = new Headers({ 'X-Organization': 'org-456' });
    const result = extractTenantFromHeader(headers, 'X-Organization');
    expect(result).toBe('org-456');
  });

  it('should return null when header is missing', () => {
    const headers = new Headers();
    const result = extractTenantFromHeader(headers, 'X-Tenant-ID');
    expect(result).toBeNull();
  });
});

describe('extractTenantFromQuery', () => {
  it('should extract tenantId from query string', () => {
    const result = extractTenantFromQuery(
      'https://app.example.com/api/users?tenantId=org-789',
      'tenantId',
    );
    expect(result).toBe('org-789');
  });

  it('should return null when query param is missing', () => {
    const result = extractTenantFromQuery(
      'https://app.example.com/api/users',
      'tenantId',
    );
    expect(result).toBeNull();
  });

  it('should use custom param name', () => {
    const result = extractTenantFromQuery(
      'https://app.example.com/api/users?orgId=org-111',
      'orgId',
    );
    expect(result).toBe('org-111');
  });
});
