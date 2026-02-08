import { describe, it, expect } from 'vitest';
import { createTenantConfig } from '../src/config';

describe('createTenantConfig', () => {
  it('should default mode to multi', () => {
    const config = createTenantConfig({ mode: 'multi' });
    expect(config.mode).toBe('multi');
  });

  it('should default extractionSources to [session]', () => {
    const config = createTenantConfig({ mode: 'multi' });
    expect(config.extractionSources).toEqual(['session']);
  });

  it('should accept single mode with singleTenantId', () => {
    const config = createTenantConfig({
      mode: 'single',
      singleTenantId: 'org-fixed-123',
    });
    expect(config.mode).toBe('single');
    expect(config.singleTenantId).toBe('org-fixed-123');
  });

  it('should throw when single mode is used without singleTenantId', () => {
    expect(() => {
      createTenantConfig({ mode: 'single' });
    }).toThrow('singleTenantId is required when mode is "single"');
  });

  it('should default headerName to X-Tenant-ID', () => {
    const config = createTenantConfig({ mode: 'multi' });
    expect(config.headerName).toBe('X-Tenant-ID');
  });

  it('should default queryParam to tenantId', () => {
    const config = createTenantConfig({ mode: 'multi' });
    expect(config.queryParam).toBe('tenantId');
  });

  it('should default statusEnforcement to true', () => {
    const config = createTenantConfig({ mode: 'multi' });
    expect(config.statusEnforcement).toBe(true);
  });

  it('should override defaults with custom config', () => {
    const config = createTenantConfig({
      mode: 'multi',
      extractionSources: ['subdomain', 'header'],
      headerName: 'X-Org-ID',
      queryParam: 'orgId',
      statusEnforcement: false,
    });
    expect(config.extractionSources).toEqual(['subdomain', 'header']);
    expect(config.headerName).toBe('X-Org-ID');
    expect(config.queryParam).toBe('orgId');
    expect(config.statusEnforcement).toBe(false);
  });

  it('should apply default excludeSubdomains to SubdomainConfig', () => {
    const config = createTenantConfig({
      mode: 'multi',
      subdomainConfig: { baseDomain: 'dreamteam.app' },
    });
    expect(config.subdomainConfig).toBeDefined();
    expect(config.subdomainConfig!.excludeSubdomains).toContain('www');
    expect(config.subdomainConfig!.excludeSubdomains).toContain('api');
    expect(config.subdomainConfig!.excludeSubdomains).toContain('admin');
    expect(config.subdomainConfig!.excludeSubdomains).toContain('auth');
    expect(config.subdomainConfig!.excludeSubdomains).toContain('mail');
    expect(config.subdomainConfig!.excludeSubdomains).toContain('cdn');
    expect(config.subdomainConfig!.excludeSubdomains).toContain('static');
  });

  it('should merge custom excludeSubdomains with defaults', () => {
    const config = createTenantConfig({
      mode: 'multi',
      subdomainConfig: {
        baseDomain: 'dreamteam.app',
        excludeSubdomains: ['staging', 'preview'],
      },
    });
    expect(config.subdomainConfig!.excludeSubdomains).toContain('www');
    expect(config.subdomainConfig!.excludeSubdomains).toContain('staging');
    expect(config.subdomainConfig!.excludeSubdomains).toContain('preview');
  });

  it('should set subdomainConfig to null when not provided', () => {
    const config = createTenantConfig({ mode: 'multi' });
    expect(config.subdomainConfig).toBeNull();
  });
});
