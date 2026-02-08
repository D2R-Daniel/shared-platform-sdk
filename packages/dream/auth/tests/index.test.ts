import { describe, it, expect } from 'vitest';

describe('@dream/auth barrel exports', () => {
  it('should export createAuthConfig from main entry', async () => {
    const mod = await import('../src/index');
    expect(mod.createAuthConfig).toBeTypeOf('function');
  });

  it('should export lockout functions from main entry', async () => {
    const mod = await import('../src/index');
    expect(mod.createLockoutManager).toBeTypeOf('function');
  });

  it('should export enrichJwtToken from main entry', async () => {
    const mod = await import('../src/index');
    expect(mod.enrichJwtToken).toBeTypeOf('function');
  });

  it('should export AuthProvider from react subpath', async () => {
    const mod = await import('../src/react/index');
    expect(mod.AuthProvider).toBeTypeOf('function');
  });

  it('should export useAuth from react subpath', async () => {
    const mod = await import('../src/react/index');
    expect(mod.useAuth).toBeTypeOf('function');
  });

  it('should export MockAuthProvider from react subpath', async () => {
    const mod = await import('../src/react/index');
    expect(mod.MockAuthProvider).toBeTypeOf('function');
  });
});
