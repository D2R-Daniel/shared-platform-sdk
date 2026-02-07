import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { AuthClient } from '../auth';
import {
  generatePKCEChallenge,
  generateCodeVerifier,
  generateCodeChallenge,
} from '../auth/pkce';

describe('PKCE Utilities', () => {
  describe('generateCodeVerifier', () => {
    it('should return a string of the default length', () => {
      const verifier = generateCodeVerifier();
      expect(verifier.length).toBe(64);
    });

    it('should return a string of a custom length', () => {
      const verifier = generateCodeVerifier(43);
      expect(verifier.length).toBe(43);
    });

    it('should return a base64url-safe string', () => {
      const verifier = generateCodeVerifier();
      expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('should generate unique values', () => {
      const v1 = generateCodeVerifier();
      const v2 = generateCodeVerifier();
      expect(v1).not.toBe(v2);
    });
  });

  describe('generateCodeChallenge', () => {
    it('should return a base64url-safe string', () => {
      const challenge = generateCodeChallenge('test-verifier');
      expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('should be deterministic for the same input', () => {
      const c1 = generateCodeChallenge('same-verifier');
      const c2 = generateCodeChallenge('same-verifier');
      expect(c1).toBe(c2);
    });

    it('should produce different outputs for different inputs', () => {
      const c1 = generateCodeChallenge('verifier-1');
      const c2 = generateCodeChallenge('verifier-2');
      expect(c1).not.toBe(c2);
    });
  });

  describe('generatePKCEChallenge', () => {
    it('should return codeVerifier, codeChallenge, and codeChallengeMethod', () => {
      const pkce = generatePKCEChallenge();
      expect(pkce.codeVerifier).toBeDefined();
      expect(pkce.codeChallenge).toBeDefined();
      expect(pkce.codeChallengeMethod).toBe('S256');
    });

    it('should have a challenge derived from the verifier', () => {
      const pkce = generatePKCEChallenge();
      const expectedChallenge = generateCodeChallenge(pkce.codeVerifier);
      expect(pkce.codeChallenge).toBe(expectedChallenge);
    });
  });
});

describe('AuthClient.buildAuthorizationUrl', () => {
  let client: AuthClient;

  beforeEach(() => {
    client = new AuthClient({
      issuerUrl: 'https://auth.example.com',
      clientId: 'test-client',
    });
  });

  it('should return a URL with all required OAuth2 parameters', () => {
    const result = client.buildAuthorizationUrl({
      redirectUri: 'https://app.example.com/callback',
    });

    const url = new URL(result.url);
    expect(url.origin).toBe('https://auth.example.com');
    expect(url.pathname).toBe('/auth/authorize');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('client_id')).toBe('test-client');
    expect(url.searchParams.get('redirect_uri')).toBe('https://app.example.com/callback');
    expect(url.searchParams.get('code_challenge')).toBe(result.pkce.codeChallenge);
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
  });

  it('should use default scope when none provided', () => {
    const result = client.buildAuthorizationUrl({
      redirectUri: 'https://app.example.com/callback',
    });

    const url = new URL(result.url);
    expect(url.searchParams.get('scope')).toBe('openid profile email');
  });

  it('should use custom scope when provided', () => {
    const result = client.buildAuthorizationUrl({
      redirectUri: 'https://app.example.com/callback',
      scope: 'openid custom:scope',
    });

    const url = new URL(result.url);
    expect(url.searchParams.get('scope')).toBe('openid custom:scope');
  });

  it('should generate state when not provided', () => {
    const result = client.buildAuthorizationUrl({
      redirectUri: 'https://app.example.com/callback',
    });

    expect(result.state).toBeDefined();
    expect(result.state.length).toBeGreaterThan(0);
  });

  it('should use provided state', () => {
    const result = client.buildAuthorizationUrl({
      redirectUri: 'https://app.example.com/callback',
      state: 'my-custom-state',
    });

    expect(result.state).toBe('my-custom-state');
    const url = new URL(result.url);
    expect(url.searchParams.get('state')).toBe('my-custom-state');
  });

  it('should include login_hint when provided', () => {
    const result = client.buildAuthorizationUrl({
      redirectUri: 'https://app.example.com/callback',
      loginHint: 'user@example.com',
    });

    const url = new URL(result.url);
    expect(url.searchParams.get('login_hint')).toBe('user@example.com');
  });

  it('should include provider as connection param', () => {
    const result = client.buildAuthorizationUrl({
      redirectUri: 'https://app.example.com/callback',
      provider: 'google',
    });

    const url = new URL(result.url);
    expect(url.searchParams.get('connection')).toBe('google');
  });

  it('should return a valid PKCE challenge', () => {
    const result = client.buildAuthorizationUrl({
      redirectUri: 'https://app.example.com/callback',
    });

    expect(result.pkce.codeVerifier).toBeDefined();
    expect(result.pkce.codeChallenge).toBeDefined();
    expect(result.pkce.codeChallengeMethod).toBe('S256');

    // Verify challenge is derived from verifier
    const expectedChallenge = generateCodeChallenge(result.pkce.codeVerifier);
    expect(result.pkce.codeChallenge).toBe(expectedChallenge);
  });
});
