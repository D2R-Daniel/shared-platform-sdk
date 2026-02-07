import { describe, it, expect, vi, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { AuthClient, AssuranceLevel } from '../auth';

function createTestToken(
  payload: Record<string, any>,
  options: jwt.SignOptions = {}
): string {
  return jwt.sign(payload, 'test-secret', { expiresIn: '1h', ...options });
}

describe('AuthClient.validateToken', () => {
  let client: AuthClient;

  const validPayload = {
    sub: 'user-123',
    email: 'test@example.com',
    scope: 'openid profile email',
    iss: 'https://auth.example.com',
    aud: 'my-app',
    acr: 'aal2',
  };

  beforeEach(() => {
    client = new AuthClient({ issuerUrl: 'https://auth.example.com' });
  });

  it('should return valid=true for a valid token', async () => {
    const token = createTestToken(validPayload);
    const result = await client.validateToken(token);

    expect(result.valid).toBe(true);
    expect(result.payload?.sub).toBe('user-123');
  });

  it('should return expired error for an expired token', async () => {
    const token = jwt.sign(validPayload, 'test-secret', { expiresIn: '-1h' });
    const result = await client.validateToken(token);

    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe('expired');
  });

  it('should return invalid_issuer when issuer does not match', async () => {
    const token = createTestToken(validPayload);
    const result = await client.validateToken(token, {
      issuer: 'https://other-issuer.com',
    });

    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe('invalid_issuer');
  });

  it('should return invalid_audience when audience does not match', async () => {
    const token = createTestToken(validPayload);
    const result = await client.validateToken(token, {
      audience: 'wrong-audience',
    });

    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe('invalid_audience');
  });

  it('should return insufficient_scope when required scopes are missing', async () => {
    const token = createTestToken(validPayload);
    const result = await client.validateToken(token, {
      requiredScopes: ['admin:write'],
    });

    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe('insufficient_scope');
  });

  it('should return insufficient_assurance when level is too low', async () => {
    const token = createTestToken({ ...validPayload, acr: 'aal1' });
    const result = await client.validateToken(token, {
      requiredAssuranceLevel: AssuranceLevel.AAL3,
    });

    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe('insufficient_assurance');
  });

  it('should pass when assurance level meets requirement', async () => {
    const token = createTestToken({ ...validPayload, acr: 'aal2' });
    const result = await client.validateToken(token, {
      requiredAssuranceLevel: AssuranceLevel.AAL2,
    });

    expect(result.valid).toBe(true);
  });

  it('should return malformed for an unparseable token', async () => {
    const result = await client.validateToken('not-a-jwt');

    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe('malformed');
  });

  it('should respect clockToleranceSeconds', async () => {
    // Token that expired 10 seconds ago
    const token = jwt.sign(validPayload, 'test-secret', { expiresIn: '-10s' });

    // With 30s tolerance (default), should still be valid
    const result = await client.validateToken(token, {
      clockToleranceSeconds: 30,
    });
    expect(result.valid).toBe(true);

    // With 0s tolerance, should be expired
    const strictResult = await client.validateToken(token, {
      clockToleranceSeconds: 0,
    });
    expect(strictResult.valid).toBe(false);
    expect(strictResult.errorCode).toBe('expired');
  });
});
