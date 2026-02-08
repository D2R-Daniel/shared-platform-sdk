import { describe, it, expect } from 'vitest';

describe('@dream/multi-tenant barrel exports', () => {
  it('should export createTenantConfig from main entry', async () => {
    const mod = await import('../src/index');
    expect(mod.createTenantConfig).toBeTypeOf('function');
  });

  it('should export extraction functions from main entry', async () => {
    const mod = await import('../src/index');
    expect(mod.extractTenantFromSubdomain).toBeTypeOf('function');
    expect(mod.extractTenantFromHeader).toBeTypeOf('function');
    expect(mod.extractTenantFromQuery).toBeTypeOf('function');
  });

  it('should export checkTenantStatus from main entry', async () => {
    const mod = await import('../src/index');
    expect(mod.checkTenantStatus).toBeTypeOf('function');
  });

  it('should export TenantProvider from react subpath', async () => {
    const mod = await import('../src/react/index');
    expect(mod.TenantProvider).toBeTypeOf('function');
  });

  it('should export useTenant from react subpath', async () => {
    const mod = await import('../src/react/index');
    expect(mod.useTenant).toBeTypeOf('function');
  });

  it('should export MockTenantProvider from react subpath', async () => {
    const mod = await import('../src/react/index');
    expect(mod.MockTenantProvider).toBeTypeOf('function');
  });
});
