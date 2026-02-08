import { describe, it, expect } from 'vitest';
import { createAuthConfig } from '../src/config';

describe('createAuthConfig', () => {
  it('should set default session maxAge to 28800 (8 hours)', () => {
    const config = createAuthConfig({ providers: [] });
    expect(config.sessionMaxAge).toBe(28800);
  });

  it('should respect custom session maxAge', () => {
    const config = createAuthConfig({ providers: [], sessionMaxAge: 3600 });
    expect(config.sessionMaxAge).toBe(3600);
  });

  it('should set session strategy to jwt', () => {
    const config = createAuthConfig({ providers: [] });
    expect(config.sessionStrategy).toBe('jwt');
  });

  it('should apply default lockout config (5 attempts, 15 min)', () => {
    const config = createAuthConfig({ providers: [] });
    expect(config.lockout).toEqual({
      maxAttempts: 5,
      durationMinutes: 15,
    });
  });

  it('should override lockout config with custom values', () => {
    const config = createAuthConfig({
      providers: [],
      lockout: { maxAttempts: 3, durationMinutes: 30 },
    });
    expect(config.lockout).toEqual({
      maxAttempts: 3,
      durationMinutes: 30,
    });
  });

  it('should pass through publicRoutes', () => {
    const routes = ['/login', '/api/health', '/signup'];
    const config = createAuthConfig({ providers: [], publicRoutes: routes });
    expect(config.publicRoutes).toEqual(routes);
  });

  it('should default publicRoutes to empty array', () => {
    const config = createAuthConfig({ providers: [] });
    expect(config.publicRoutes).toEqual([]);
  });

  it('should store providers array', () => {
    const config = createAuthConfig({
      providers: ['credentials', 'google'],
    });
    expect(config.providers).toEqual(['credentials', 'google']);
  });

  it('should pass through callbacks', () => {
    const onSignIn = async () => true;
    const onSignOut = async () => {};
    const config = createAuthConfig({
      providers: [],
      callbacks: { onSignIn, onSignOut },
    });
    expect(config.callbacks?.onSignIn).toBe(onSignIn);
    expect(config.callbacks?.onSignOut).toBe(onSignOut);
  });

  it('should produce all defaults from empty-ish config', () => {
    const config = createAuthConfig({ providers: [] });

    expect(config.sessionMaxAge).toBe(28800);
    expect(config.sessionStrategy).toBe('jwt');
    expect(config.lockout).toEqual({ maxAttempts: 5, durationMinutes: 15 });
    expect(config.publicRoutes).toEqual([]);
    expect(config.providers).toEqual([]);
    expect(config.callbacks).toBeUndefined();
  });
});
