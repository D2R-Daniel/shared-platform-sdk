import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { AuthClient, AssuranceLevel } from '../auth';
import { InvalidTokenError } from '../auth/errors';

function createTestToken(
  payload: Record<string, any>,
  options: jwt.SignOptions = {}
): string {
  return jwt.sign(payload, 'test-secret', { expiresIn: '1h', ...options });
}

describe('AuthClient.getAssuranceLevel', () => {
  let client: AuthClient;

  beforeEach(() => {
    client = new AuthClient({ issuerUrl: 'https://auth.example.com' });
  });

  it('should return AAL1 when no acr claim is present', () => {
    const token = createTestToken({ sub: 'user-123' });
    expect(client.getAssuranceLevel(token)).toBe(AssuranceLevel.AAL1);
  });

  it('should return the correct level from acr claim', () => {
    const token = createTestToken({ sub: 'user-123', acr: 'aal2' });
    expect(client.getAssuranceLevel(token)).toBe(AssuranceLevel.AAL2);
  });

  it('should return AAL3 when acr is aal3', () => {
    const token = createTestToken({ sub: 'user-123', acr: 'aal3' });
    expect(client.getAssuranceLevel(token)).toBe(AssuranceLevel.AAL3);
  });

  it('should throw InvalidTokenError for malformed token', () => {
    expect(() => client.getAssuranceLevel('invalid')).toThrow(InvalidTokenError);
  });
});

describe('AuthClient.requireStepUp', () => {
  let client: AuthClient;

  beforeEach(() => {
    client = new AuthClient({ issuerUrl: 'https://auth.example.com' });
  });

  it('should return required=false when current level meets target', async () => {
    const token = createTestToken({ sub: 'user-123', acr: 'aal2' });
    const result = await client.requireStepUp(token, AssuranceLevel.AAL2);

    expect(result.required).toBe(false);
    expect(result.currentLevel).toBe(AssuranceLevel.AAL2);
    expect(result.accessToken).toBe(token);
  });

  it('should return required=false when current level exceeds target', async () => {
    const token = createTestToken({ sub: 'user-123', acr: 'aal3' });
    const result = await client.requireStepUp(token, AssuranceLevel.AAL2);

    expect(result.required).toBe(false);
  });
});
