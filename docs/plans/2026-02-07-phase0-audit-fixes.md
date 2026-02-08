# Phase 0 Audit Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix 2 critical and 14 important issues found during the Phase 0 implementation audit, bringing all modules into full spec compliance.

**Architecture:** Each fix follows TDD — write/update failing test first, implement the fix, verify, commit. Fixes are grouped into 3 streams matching the original implementation: Stream A (Auth + Sessions), Stream B (Audit Logs), Stream C (Settings + Email + Root Exports).

**Tech Stack:** TypeScript, Vitest, jose (for JWT verification), Axios (auth/sessions), fetch (audit/settings/email)

---

## Stream A: Auth + Sessions Fixes

### Task 1: Replace jwt-decode with jose for JWT Signature Verification

**CRITICAL** — `validateToken()` currently uses `jwtDecode()` which does NOT verify signatures. Anyone can forge a token. Must use `jose` library for proper JWKS-based signature verification.

**Files:**
- Modify: `packages/node/src/auth/client.ts:465-546`
- Modify: `packages/node/src/__tests__/auth-validation.test.ts`
- Modify: `packages/node/package.json` (add `jose` dependency)

**Step 1: Install jose dependency**

```bash
cd packages/node && npm install jose
```

**Step 2: Write failing test for signature verification**

Add to `packages/node/src/__tests__/auth-validation.test.ts`:

```typescript
import { importJWK, SignJWT, generateKeyPair, exportJWK } from 'jose';

// Helper to create a properly signed token with known keys
async function createSignedToken(
  payload: Record<string, any>,
  kid: string = 'test-key-1'
) {
  const { privateKey, publicKey } = await generateKeyPair('RS256');
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'RS256', kid })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(privateKey);
  const publicJwk = await exportJWK(publicKey);
  return { jwt, publicJwk: { ...publicJwk, kid, alg: 'RS256', use: 'sig' } };
}

describe('AuthClient.validateToken (signature verification)', () => {
  it('should reject a token with invalid signature', async () => {
    // Create a token signed with one key, provide JWKS with a different key
    const { jwt: token } = await createSignedToken({ sub: 'user-1', iss: 'https://auth.example.com' });
    const { publicJwk: wrongKey } = await createSignedToken({ sub: 'other' }, 'wrong-key');

    // Mock discovery + JWKS
    const client = new AuthClient({ issuerUrl: 'https://auth.example.com' });
    vi.spyOn(client as any, 'discover').mockResolvedValue({
      issuer: 'https://auth.example.com',
      jwks_uri: 'https://auth.example.com/.well-known/jwks.json',
    });
    vi.spyOn(client as any, 'getSigningKeys').mockResolvedValue({ keys: [wrongKey] });

    const result = await client.validateToken(token);
    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe('invalid_signature');
  });

  it('should accept a token with valid signature', async () => {
    const payload = { sub: 'user-1', iss: 'https://auth.example.com', aud: 'my-app' };
    const { jwt: token, publicJwk } = await createSignedToken(payload);

    const client = new AuthClient({ issuerUrl: 'https://auth.example.com' });
    vi.spyOn(client as any, 'discover').mockResolvedValue({
      issuer: 'https://auth.example.com',
      jwks_uri: 'https://auth.example.com/.well-known/jwks.json',
    });
    vi.spyOn(client as any, 'getSigningKeys').mockResolvedValue({ keys: [publicJwk] });

    const result = await client.validateToken(token);
    expect(result.valid).toBe(true);
    expect(result.payload?.sub).toBe('user-1');
  });
});
```

**Step 3: Run test to verify it fails**

```bash
cd packages/node && npx vitest run src/__tests__/auth-validation.test.ts --reporter=verbose
```

Expected: New tests FAIL because `validateToken` doesn't verify signatures.

**Step 4: Implement signature verification**

Replace `validateToken` in `packages/node/src/auth/client.ts`:

```typescript
import { createRemoteJWKSet, jwtVerify, decodeJwt, errors as joseErrors } from 'jose';

// Remove: import { jwtDecode } from 'jwt-decode';
// (keep jwtDecode only for getAssuranceLevel which doesn't need verification)

async validateToken(
  token: string,
  options: TokenValidationOptions = {}
): Promise<TokenValidationResult> {
  try {
    // Get JWKS for signature verification
    const discovery = await this.discover();
    const jwks = await this.getSigningKeys();

    // Build a local JWKS key set from cached keys
    const getKey = async (header: { kid?: string; alg?: string }) => {
      const key = jwks.keys.find(
        (k) => k.kid === header.kid && (!k.alg || k.alg === header.alg)
      );
      if (!key) {
        throw new Error(`No matching key found for kid=${header.kid}`);
      }
      return await importJWK(key as any, header.alg);
    };

    // Decode header to find kid
    const headerPayload = token.split('.')[0];
    const header = JSON.parse(
      Buffer.from(headerPayload, 'base64url').toString()
    );
    const signingKey = await getKey(header);

    // Verify signature + standard claims
    const { payload: decoded } = await jwtVerify(token, signingKey as any, {
      issuer: options.issuer,
      audience: options.audience,
      clockTolerance: options.clockToleranceSeconds ?? 30,
    });

    // Check required scopes
    if (options.requiredScopes && options.requiredScopes.length > 0) {
      const tokenScopes = (decoded.scope as string)?.split(' ') ?? [];
      const missingScopes = options.requiredScopes.filter(
        (s) => !tokenScopes.includes(s)
      );
      if (missingScopes.length > 0) {
        return {
          valid: false,
          error: `Missing required scopes: ${missingScopes.join(', ')}`,
          errorCode: 'insufficient_scope',
        };
      }
    }

    // Check assurance level
    if (options.requiredAssuranceLevel) {
      const levelOrder = [AssuranceLevel.AAL1, AssuranceLevel.AAL2, AssuranceLevel.AAL3];
      const currentLevel = (decoded.acr as AssuranceLevel) ?? AssuranceLevel.AAL1;
      const currentIdx = levelOrder.indexOf(currentLevel);
      const requiredIdx = levelOrder.indexOf(options.requiredAssuranceLevel);

      if (currentIdx < requiredIdx) {
        return {
          valid: false,
          error: `Insufficient assurance level: current=${currentLevel}, required=${options.requiredAssuranceLevel}`,
          errorCode: 'insufficient_assurance',
        };
      }
    }

    return { valid: true, payload: decoded as TokenValidationResult['payload'] };
  } catch (error: any) {
    if (error?.code === 'ERR_JWT_EXPIRED') {
      return { valid: false, error: 'Token has expired', errorCode: 'expired' };
    }
    if (error?.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED' || error?.message?.includes('signature')) {
      return { valid: false, error: 'Invalid signature', errorCode: 'invalid_signature' };
    }
    if (error?.code === 'ERR_JWT_CLAIM_VALIDATION_FAILED') {
      if (error.claim === 'iss') {
        return { valid: false, error: `Invalid issuer: ${error.message}`, errorCode: 'invalid_issuer' };
      }
      if (error.claim === 'aud') {
        return { valid: false, error: `Invalid audience: ${error.message}`, errorCode: 'invalid_audience' };
      }
    }
    return { valid: false, error: error.message, errorCode: 'malformed' };
  }
}
```

**Step 5: Update existing validation tests**

Existing tests in `auth-validation.test.ts` use `jwt.sign('test-secret')` (symmetric HS256). These tests will break because `validateToken` now requires JWKS. Update the `createTestToken` helper and existing tests to mock `discover()` and `getSigningKeys()`, or provide a helper that generates RS256 key pairs.

**Step 6: Run all auth tests to verify they pass**

```bash
cd packages/node && npx vitest run src/__tests__/auth-validation.test.ts src/__tests__/auth-pkce.test.ts src/__tests__/auth-stepup.test.ts src/__tests__/auth-discovery.test.ts src/__tests__/auth-autorefresh.test.ts src/__tests__/auth.test.ts --reporter=verbose
```

Expected: ALL PASS

**Step 7: Commit**

```bash
git add packages/node/src/auth/client.ts packages/node/src/__tests__/auth-validation.test.ts packages/node/package.json packages/node/package-lock.json
git commit -m "fix(auth): replace jwt-decode with jose for JWT signature verification

CRITICAL: validateToken now verifies signatures against JWKS.
Previously used jwtDecode() which only decoded without verification."
```

---

### Task 2: Add Tests for exchangeCode and getClientCredentialsToken

**CRITICAL** — These two auth flows have zero test coverage.

**Files:**
- Create: `packages/node/src/__tests__/auth-token-exchange.test.ts`

**Step 1: Write tests for exchangeCode**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthClient } from '../auth';

describe('AuthClient.exchangeCode', () => {
  let client: AuthClient;
  const mockPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    client = new AuthClient({
      issuerUrl: 'https://auth.example.com',
      clientId: 'test-client',
      clientSecret: 'test-secret',
    });
    // Mock discover to return token endpoint
    vi.spyOn(client as any, 'discover').mockResolvedValue({
      issuer: 'https://auth.example.com',
      token_endpoint: 'https://auth.example.com/oauth/token',
    });
    // Mock the internal HTTP client
    (client as any).http.post = mockPost;
  });

  it('should exchange code for tokens with PKCE', async () => {
    mockPost.mockResolvedValue({
      data: {
        access_token: 'new-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'new-refresh-token',
      },
    });

    const result = await client.exchangeCode({
      code: 'auth-code-123',
      redirectUri: 'https://app.example.com/callback',
      codeVerifier: 'verifier-string',
    });

    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBe('new-refresh-token');
    expect(result.expiresIn).toBe(3600);
    expect(mockPost).toHaveBeenCalledWith(
      'https://auth.example.com/oauth/token',
      expect.objectContaining({
        grant_type: 'authorization_code',
        code: 'auth-code-123',
        redirect_uri: 'https://app.example.com/callback',
        code_verifier: 'verifier-string',
        client_id: 'test-client',
      }),
      expect.any(Object)
    );
  });

  it('should throw on invalid code', async () => {
    mockPost.mockRejectedValue({
      response: { status: 400, data: { error: 'invalid_grant' } },
    });

    await expect(
      client.exchangeCode({
        code: 'bad-code',
        redirectUri: 'https://app.example.com/callback',
        codeVerifier: 'verifier',
      })
    ).rejects.toThrow();
  });
});
```

**Step 2: Write tests for getClientCredentialsToken**

```typescript
describe('AuthClient.getClientCredentialsToken', () => {
  let client: AuthClient;
  const mockPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    client = new AuthClient({
      issuerUrl: 'https://auth.example.com',
      clientId: 'service-client',
      clientSecret: 'service-secret',
    });
    vi.spyOn(client as any, 'discover').mockResolvedValue({
      issuer: 'https://auth.example.com',
      token_endpoint: 'https://auth.example.com/oauth/token',
    });
    (client as any).http.post = mockPost;
  });

  it('should request M2M token with client credentials', async () => {
    mockPost.mockResolvedValue({
      data: {
        access_token: 'm2m-token',
        token_type: 'Bearer',
        expires_in: 7200,
      },
    });

    const result = await client.getClientCredentialsToken({
      scope: 'api:read api:write',
      audience: 'https://api.example.com',
    });

    expect(result.accessToken).toBe('m2m-token');
    expect(result.expiresIn).toBe(7200);
    expect(mockPost).toHaveBeenCalledWith(
      'https://auth.example.com/oauth/token',
      expect.objectContaining({
        grant_type: 'client_credentials',
        client_id: 'service-client',
        client_secret: 'service-secret',
        scope: 'api:read api:write',
        audience: 'https://api.example.com',
      }),
      expect.any(Object)
    );
  });

  it('should throw on unauthorized client', async () => {
    mockPost.mockRejectedValue({
      response: { status: 401, data: { error: 'invalid_client' } },
    });

    await expect(
      client.getClientCredentialsToken()
    ).rejects.toThrow();
  });
});
```

**Step 3: Run tests to verify they pass**

```bash
cd packages/node && npx vitest run src/__tests__/auth-token-exchange.test.ts --reporter=verbose
```

Expected: PASS (these test existing implemented methods — if they fail, the implementation needs fixing too)

**Step 4: Commit**

```bash
git add packages/node/src/__tests__/auth-token-exchange.test.ts
git commit -m "test(auth): add tests for exchangeCode and getClientCredentialsToken"
```

---

### Task 3: Add M2M Token Caching to getClientCredentialsToken

**Important** — Client credentials tokens should be cached and reused until close to expiry to avoid unnecessary round-trips.

**Files:**
- Modify: `packages/node/src/auth/client.ts:352-383`
- Modify: `packages/node/src/__tests__/auth-token-exchange.test.ts`

**Step 1: Write failing test for M2M caching**

Add to `auth-token-exchange.test.ts`:

```typescript
it('should cache M2M tokens and reuse until near expiry', async () => {
  mockPost.mockResolvedValue({
    data: {
      access_token: 'm2m-cached',
      token_type: 'Bearer',
      expires_in: 3600,
    },
  });

  const result1 = await client.getClientCredentialsToken({ scope: 'api:read' });
  const result2 = await client.getClientCredentialsToken({ scope: 'api:read' });

  expect(result1.accessToken).toBe('m2m-cached');
  expect(result2.accessToken).toBe('m2m-cached');
  // Should only call the token endpoint once
  expect(mockPost).toHaveBeenCalledTimes(1);
});

it('should use different cache entries for different scopes', async () => {
  mockPost
    .mockResolvedValueOnce({ data: { access_token: 'token-a', token_type: 'Bearer', expires_in: 3600 } })
    .mockResolvedValueOnce({ data: { access_token: 'token-b', token_type: 'Bearer', expires_in: 3600 } });

  const r1 = await client.getClientCredentialsToken({ scope: 'scope-a' });
  const r2 = await client.getClientCredentialsToken({ scope: 'scope-b' });

  expect(r1.accessToken).toBe('token-a');
  expect(r2.accessToken).toBe('token-b');
  expect(mockPost).toHaveBeenCalledTimes(2);
});
```

**Step 2: Run test to verify it fails**

```bash
cd packages/node && npx vitest run src/__tests__/auth-token-exchange.test.ts --reporter=verbose
```

Expected: FAIL — `mockPost` called twice for same scope.

**Step 3: Implement M2M token cache**

In `packages/node/src/auth/client.ts`, add a private cache map and modify `getClientCredentialsToken`:

```typescript
// Add to class properties:
private m2mTokenCache: Map<string, { token: TokenResponse; expiresAt: number }> = new Map();

// Modify getClientCredentialsToken:
async getClientCredentialsToken(
  options: ClientCredentialsOptions = {}
): Promise<TokenResponse> {
  const cacheKey = `${options.scope ?? ''}|${options.audience ?? ''}`;
  const cached = this.m2mTokenCache.get(cacheKey);
  const now = Math.floor(Date.now() / 1000);

  // Return cached token if still valid (with 60s buffer)
  if (cached && cached.expiresAt - 60 > now) {
    return cached.token;
  }

  const discovery = await this.discover();
  // ... (existing request logic) ...

  const token = this.mapTokenResponse(response.data);
  this.m2mTokenCache.set(cacheKey, {
    token,
    expiresAt: now + token.expiresIn,
  });

  return token;
}
```

**Step 4: Run tests to verify they pass**

```bash
cd packages/node && npx vitest run src/__tests__/auth-token-exchange.test.ts --reporter=verbose
```

Expected: PASS

**Step 5: Commit**

```bash
git add packages/node/src/auth/client.ts packages/node/src/__tests__/auth-token-exchange.test.ts
git commit -m "feat(auth): add M2M token caching for client credentials flow"
```

---

### Task 4: Add JWKS Auto-Refresh on Key-Not-Found

**Important** — When a JWT has a `kid` that's not in the cached JWKS, the client should refetch JWKS once before failing.

**Files:**
- Modify: `packages/node/src/auth/client.ts:428-452` (getSigningKeys method)
- Modify: `packages/node/src/__tests__/auth-validation.test.ts`

**Step 1: Write failing test**

Add to `auth-validation.test.ts`:

```typescript
it('should auto-refresh JWKS when kid is not found', async () => {
  const { jwt: token, publicJwk } = await createSignedToken(
    { sub: 'user-1', iss: 'https://auth.example.com' },
    'new-key-id'
  );

  const discoverSpy = vi.spyOn(client as any, 'discover').mockResolvedValue({
    issuer: 'https://auth.example.com',
    jwks_uri: 'https://auth.example.com/.well-known/jwks.json',
  });
  // First call returns old keys (no match), second call returns updated keys
  const getKeysSpy = vi.spyOn(client as any, 'getSigningKeys')
    .mockResolvedValueOnce({ keys: [{ kid: 'old-key', kty: 'RSA', n: 'xxx', e: 'AQAB' }] })
    .mockResolvedValueOnce({ keys: [publicJwk] });

  const result = await client.validateToken(token);
  expect(result.valid).toBe(true);
  // getSigningKeys should have been called twice (initial + refresh)
  expect(getKeysSpy).toHaveBeenCalledTimes(2);
});
```

**Step 2: Run test to verify it fails**

```bash
cd packages/node && npx vitest run src/__tests__/auth-validation.test.ts --reporter=verbose
```

Expected: FAIL — currently throws on first key miss without retrying.

**Step 3: Implement auto-refresh logic in validateToken**

In the key lookup section of `validateToken`, when `kid` is not found, invalidate the JWKS cache and refetch:

```typescript
// In validateToken, replace the getKey helper:
let jwks = await this.getSigningKeys();
let key = jwks.keys.find(k => k.kid === header.kid);

if (!key) {
  // Key not found — invalidate cache and refetch JWKS
  this.jwksCache = undefined;
  jwks = await this.getSigningKeys();
  key = jwks.keys.find(k => k.kid === header.kid);
  if (!key) {
    return { valid: false, error: `No signing key found for kid=${header.kid}`, errorCode: 'invalid_signature' };
  }
}
```

**Step 4: Run test to verify it passes**

```bash
cd packages/node && npx vitest run src/__tests__/auth-validation.test.ts --reporter=verbose
```

Expected: PASS

**Step 5: Commit**

```bash
git add packages/node/src/auth/client.ts packages/node/src/__tests__/auth-validation.test.ts
git commit -m "feat(auth): auto-refresh JWKS when signing key kid not found"
```

---

### Task 5: Fix Session revokeOtherSessions/revokeAllSessions Return Types

**Important** — Spec says these should return `{ revokedCount: number }`, currently they return `void`.

**Files:**
- Modify: `packages/node/src/sessions/client.ts:163-190`
- Modify: `packages/node/src/sessions/types.ts`
- Modify: `packages/node/src/__tests__/sessions.test.ts`

**Step 1: Add RevokeSessionsResult type**

Add to `packages/node/src/sessions/types.ts`:

```typescript
export interface RevokeSessionsResult {
  revokedCount: number;
}
```

**Step 2: Write failing tests**

Add to `sessions.test.ts`:

```typescript
it('should return revokedCount from revokeOtherSessions', async () => {
  mockPost.mockResolvedValue({ data: { revoked_count: 3 } });
  const result = await client.revokeOtherSessions(accessToken);
  expect(result).toEqual({ revokedCount: 3 });
});

it('should return revokedCount from revokeAllSessions', async () => {
  mockPost.mockResolvedValue({ data: { revoked_count: 5 } });
  const result = await client.revokeAllSessions(accessToken);
  expect(result).toEqual({ revokedCount: 5 });
});
```

**Step 3: Run test to verify it fails**

```bash
cd packages/node && npx vitest run src/__tests__/sessions.test.ts --reporter=verbose
```

Expected: FAIL — methods return `void`.

**Step 4: Update methods to return RevokeSessionsResult**

In `packages/node/src/sessions/client.ts`:

```typescript
async revokeOtherSessions(
  accessToken: string,
  reason?: string
): Promise<RevokeSessionsResult> {
  const response = await this.http.post<{ revoked_count: number }>(
    '/revoke-others',
    { reason },
    { headers: this.authHeaders(accessToken) }
  );
  return { revokedCount: response.data.revoked_count };
}

async revokeAllSessions(
  accessToken: string,
  reason?: string
): Promise<RevokeSessionsResult> {
  const response = await this.http.post<{ revoked_count: number }>(
    '/revoke-all',
    { reason },
    { headers: this.authHeaders(accessToken) }
  );
  return { revokedCount: response.data.revoked_count };
}
```

**Step 5: Run tests to verify they pass**

```bash
cd packages/node && npx vitest run src/__tests__/sessions.test.ts --reporter=verbose
```

Expected: PASS

**Step 6: Commit**

```bash
git add packages/node/src/sessions/client.ts packages/node/src/sessions/types.ts packages/node/src/__tests__/sessions.test.ts
git commit -m "fix(sessions): return revokedCount from revokeOtherSessions/revokeAllSessions"
```

---

### Task 6: Fix Session Error HTTP Status Mapping (409 -> 400)

**Important** — `SessionAlreadyRevokedError` maps to 409 but spec says 400.

**Files:**
- Modify: `packages/node/src/sessions/client.ts:135-155`
- Modify: `packages/node/src/__tests__/sessions.test.ts`

**Step 1: Write failing test**

In `sessions.test.ts`, find or add:

```typescript
it('should throw SessionAlreadyRevokedError on 400 with already_revoked code', async () => {
  mockPost.mockRejectedValue({
    response: { status: 400, data: { code: 'session_already_revoked', session_id: 'sess-1' } },
  });

  await expect(
    client.revokeSession(accessToken, 'sess-1')
  ).rejects.toBeInstanceOf(SessionAlreadyRevokedError);
});
```

**Step 2: Run test to verify it fails**

```bash
cd packages/node && npx vitest run src/__tests__/sessions.test.ts --reporter=verbose
```

Expected: FAIL — currently only checks status 409.

**Step 3: Fix the error mapping**

In `revokeSession`, change the 409 check to 400:

```typescript
if (error.response?.status === 400 && error.response?.data?.code === 'session_already_revoked') {
  throw new SessionAlreadyRevokedError(sessionId);
}
```

**Step 4: Run tests to verify they pass**

```bash
cd packages/node && npx vitest run src/__tests__/sessions.test.ts --reporter=verbose
```

Expected: PASS

**Step 5: Commit**

```bash
git add packages/node/src/sessions/client.ts packages/node/src/__tests__/sessions.test.ts
git commit -m "fix(sessions): map SessionAlreadyRevokedError to HTTP 400 per spec"
```

---

### Task 7: Fix GeoLocation Missing Fields and ConcurrentLimitAction Value

**Important** — `GeoLocation` missing `asn` and `organization` fields. `ConcurrentLimitAction` uses `'revoke_oldest'` but spec says `'terminate_oldest'`.

**Files:**
- Modify: `packages/node/src/sessions/types.ts`
- Modify: `packages/node/src/__tests__/sessions.test.ts`

**Step 1: Write failing test**

```typescript
it('should include asn and organization in GeoLocation', () => {
  const geo: GeoLocation = {
    country: 'US',
    region: 'CA',
    city: 'SF',
    latitude: 37.7749,
    longitude: -122.4194,
    timezone: 'America/Los_Angeles',
    asn: 'AS13335',
    organization: 'Cloudflare',
  };
  expect(geo.asn).toBe('AS13335');
  expect(geo.organization).toBe('Cloudflare');
});

it('should use terminate_oldest in ConcurrentLimitAction', () => {
  const action: ConcurrentLimitAction = 'terminate_oldest';
  expect(action).toBe('terminate_oldest');
});
```

**Step 2: Run test to verify it fails**

```bash
cd packages/node && npx vitest run src/__tests__/sessions.test.ts --reporter=verbose
```

Expected: FAIL — `asn` and `organization` don't exist on `GeoLocation`, `terminate_oldest` not in union.

**Step 3: Update types**

In `packages/node/src/sessions/types.ts`:

Add `asn?: string;` and `organization?: string;` to the `GeoLocation` interface.

Change `ConcurrentLimitAction` from `'revoke_oldest'` to `'terminate_oldest'`.

**Step 4: Update SessionClient to use terminate_oldest**

Search for any usages of `revoke_oldest` in `client.ts` and update them.

**Step 5: Run tests to verify they pass**

```bash
cd packages/node && npx vitest run src/__tests__/sessions.test.ts --reporter=verbose
```

Expected: PASS

**Step 6: Commit**

```bash
git add packages/node/src/sessions/types.ts packages/node/src/sessions/client.ts packages/node/src/__tests__/sessions.test.ts
git commit -m "fix(sessions): add GeoLocation.asn/organization, fix ConcurrentLimitAction value"
```

---

### Task 8: Add SessionStats.peakConcurrentTimestamp Field

**Important** — Missing from types per spec.

**Files:**
- Modify: `packages/node/src/sessions/types.ts`
- Modify: `packages/node/src/__tests__/sessions.test.ts`

**Step 1: Write failing test**

```typescript
it('should include peakConcurrentTimestamp in SessionStats', () => {
  const stats: SessionStats = {
    activeSessions: 10,
    totalSessions: 100,
    peakConcurrent: 15,
    peakConcurrentTimestamp: '2025-01-15T12:00:00Z',
    averageSessionDuration: 3600,
  };
  expect(stats.peakConcurrentTimestamp).toBe('2025-01-15T12:00:00Z');
});
```

**Step 2: Run test to verify it fails**

```bash
cd packages/node && npx vitest run src/__tests__/sessions.test.ts --reporter=verbose
```

Expected: FAIL — property not in type.

**Step 3: Add peakConcurrentTimestamp to SessionStats**

In `packages/node/src/sessions/types.ts`, add to `SessionStats`:

```typescript
peakConcurrentTimestamp?: string;
```

**Step 4: Run tests to verify they pass**

```bash
cd packages/node && npx vitest run src/__tests__/sessions.test.ts --reporter=verbose
```

Expected: PASS

**Step 5: Commit**

```bash
git add packages/node/src/sessions/types.ts packages/node/src/__tests__/sessions.test.ts
git commit -m "fix(sessions): add peakConcurrentTimestamp to SessionStats"
```

---

## Stream B: Audit Log Fixes

### Task 9: Fix ExportTooLargeError HTTP Status (400 -> 413)

**Important** — Spec says HTTP 413 for ExportTooLargeError, currently mapped to 400.

**Files:**
- Modify: `packages/node/src/audit/client.ts:147-160`
- Modify: `packages/node/src/__tests__/audit.test.ts`

**Step 1: Write failing test**

```typescript
it('should throw ExportTooLargeError on 413', async () => {
  fetchMock.mockResolvedValue(
    mockResponse({ code: 'export_too_large', error: 'Too large' }, 413)
  );
  await expect(client.exportLogs({ format: 'csv' } as any)).rejects.toBeInstanceOf(ExportTooLargeError);
});
```

**Step 2: Run test to verify it fails**

```bash
cd packages/node && npx vitest run src/__tests__/audit.test.ts --reporter=verbose
```

Expected: FAIL — 413 falls through to generic error handler.

**Step 3: Move ExportTooLargeError from status 400 to 413**

In `packages/node/src/audit/client.ts`, add a new status 413 handler:

```typescript
if (status === 413) {
  throw new ExportTooLargeError(errorMessage);
}
```

Remove the `export_too_large` check from the status 400 block.

**Step 4: Run tests to verify they pass**

```bash
cd packages/node && npx vitest run src/__tests__/audit.test.ts --reporter=verbose
```

Expected: PASS

**Step 5: Commit**

```bash
git add packages/node/src/audit/client.ts packages/node/src/__tests__/audit.test.ts
git commit -m "fix(audit): map ExportTooLargeError to HTTP 413 per spec"
```

---

### Task 10: Fix IntegrityViolationError HTTP Status (422 -> 409)

**Important** — Spec says HTTP 409 for IntegrityViolationError, currently mapped to 422.

**Files:**
- Modify: `packages/node/src/audit/client.ts:182-194`
- Modify: `packages/node/src/__tests__/audit.test.ts`

**Step 1: Write failing test**

```typescript
it('should throw IntegrityViolationError on 409 with integrity_violation code', async () => {
  fetchMock.mockResolvedValue(
    mockResponse({ code: 'integrity_violation', id: 'entry-5' }, 409)
  );
  await expect(
    client.verifyIntegrity('2024-01-01', '2024-01-31')
  ).rejects.toBeInstanceOf(IntegrityViolationError);
});
```

**Step 2: Run test to verify it fails**

```bash
cd packages/node && npx vitest run src/__tests__/audit.test.ts --reporter=verbose
```

Expected: FAIL — 409 only checks for `idempotency_conflict`.

**Step 3: Move IntegrityViolationError from 422 to 409**

In `packages/node/src/audit/client.ts`:

```typescript
if (status === 409) {
  if (errorCode === 'idempotency_conflict') {
    throw new IdempotencyConflictError(
      (data.idempotency_key as string) || 'unknown'
    );
  }
  if (errorCode === 'integrity_violation') {
    throw new IntegrityViolationError(entityId);
  }
}
```

Remove the 422 block for `integrity_violation`.

**Step 4: Run tests to verify they pass**

```bash
cd packages/node && npx vitest run src/__tests__/audit.test.ts --reporter=verbose
```

Expected: PASS

**Step 5: Commit**

```bash
git add packages/node/src/audit/client.ts packages/node/src/__tests__/audit.test.ts
git commit -m "fix(audit): map IntegrityViolationError to HTTP 409 per spec"
```

---

### Task 11: Add StreamTestError Handling and RateLimitError for 429

**Important** — `StreamTestError` is defined but never thrown. No handling for HTTP 429.

**Files:**
- Modify: `packages/node/src/audit/client.ts` (handleErrorResponse + testStream)
- Modify: `packages/node/src/audit/errors.ts` (add RateLimitError)
- Modify: `packages/node/src/__tests__/audit.test.ts`

**Step 1: Add RateLimitError to errors.ts**

```typescript
export class RateLimitError extends AuditError {
  public readonly retryAfterSeconds?: number;

  constructor(retryAfterSeconds?: number) {
    super(
      retryAfterSeconds
        ? `Rate limit exceeded. Retry after ${retryAfterSeconds} seconds.`
        : 'Rate limit exceeded.',
      retryAfterSeconds ? { retryAfterSeconds } : {}
    );
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
```

**Step 2: Write failing tests**

```typescript
import { RateLimitError, StreamTestError } from '../audit/errors';

it('should throw RateLimitError on 429', async () => {
  fetchMock.mockResolvedValue(
    mockResponse({ error: 'rate_limited' }, 429)
  );
  await expect(client.list()).rejects.toBeInstanceOf(RateLimitError);
});

it('should throw StreamTestError when stream test fails', async () => {
  fetchMock.mockResolvedValue(
    mockResponse({ code: 'stream_test_failed', error: 'Connection refused' }, 422)
  );
  await expect(client.testStream('stream-1')).rejects.toBeInstanceOf(StreamTestError);
});
```

**Step 3: Run tests to verify they fail**

```bash
cd packages/node && npx vitest run src/__tests__/audit.test.ts --reporter=verbose
```

Expected: FAIL

**Step 4: Implement error handling**

In `handleErrorResponse`:

```typescript
// Add 429 handler
if (status === 429) {
  const retryAfter = Number(response.headers.get('Retry-After')) || undefined;
  throw new RateLimitError(retryAfter);
}

// Add stream_test_failed to 422 handler
if (status === 422) {
  if (errorCode === 'stream_test_failed') {
    throw new StreamTestError(entityId || 'unknown', errorMessage);
  }
}
```

Add `StreamTestError` import at the top (already imported but need to add to the import if missing), and add `RateLimitError` import.

**Step 5: Run tests to verify they pass**

```bash
cd packages/node && npx vitest run src/__tests__/audit.test.ts --reporter=verbose
```

Expected: PASS

**Step 6: Commit**

```bash
git add packages/node/src/audit/client.ts packages/node/src/audit/errors.ts packages/node/src/__tests__/audit.test.ts
git commit -m "fix(audit): add RateLimitError for 429, wire StreamTestError for test failures"
```

---

### Task 12: Add Missing Audit Event Constants

**Important** — Missing event types: `role.*`, `invitation.*`, `admin.*`, `data.*` per spec.

**Files:**
- Modify: `packages/node/src/audit/events.ts`
- Modify: `packages/node/src/__tests__/audit.test.ts`

**Step 1: Write failing test**

```typescript
it('should include role events in AUDIT_EVENT_CATEGORIES', () => {
  expect(AUDIT_EVENT_CATEGORIES.role).toBeDefined();
  expect(AUDIT_EVENT_CATEGORIES.role).toContain('role.created');
});

it('should include invitation events', () => {
  expect(AUDIT_EVENT_CATEGORIES.invitation).toBeDefined();
  expect(AUDIT_EVENT_CATEGORIES.invitation).toContain('invitation.sent');
});

it('should include admin events', () => {
  expect(AUDIT_EVENT_CATEGORIES.admin).toBeDefined();
  expect(AUDIT_EVENT_CATEGORIES.admin).toContain('admin.session.revoked');
});

it('should include data events', () => {
  expect(AUDIT_EVENT_CATEGORIES.data).toBeDefined();
  expect(AUDIT_EVENT_CATEGORIES.data).toContain('data.exported');
});
```

**Step 2: Run test to verify it fails**

```bash
cd packages/node && npx vitest run src/__tests__/audit.test.ts --reporter=verbose
```

Expected: FAIL — categories don't exist.

**Step 3: Add missing event constants**

Add to `packages/node/src/audit/events.ts`:

```typescript
// Role events
export const ROLE_CREATED = 'role.created' as const;
export const ROLE_UPDATED = 'role.updated' as const;
export const ROLE_DELETED = 'role.deleted' as const;
export const ROLE_ASSIGNED = 'role.assigned' as const;
export const ROLE_UNASSIGNED = 'role.unassigned' as const;

// Invitation events
export const INVITATION_SENT = 'invitation.sent' as const;
export const INVITATION_ACCEPTED = 'invitation.accepted' as const;
export const INVITATION_REVOKED = 'invitation.revoked' as const;
export const INVITATION_EXPIRED = 'invitation.expired' as const;

// Admin events
export const ADMIN_SESSION_REVOKED = 'admin.session.revoked' as const;
export const ADMIN_USER_SUSPENDED = 'admin.user.suspended' as const;
export const ADMIN_USER_ACTIVATED = 'admin.user.activated' as const;
export const ADMIN_SETTINGS_CHANGED = 'admin.settings.changed' as const;

// Data events
export const DATA_EXPORTED = 'data.exported' as const;
export const DATA_IMPORTED = 'data.imported' as const;
export const DATA_DELETED = 'data.deleted' as const;
```

Add to `AUDIT_EVENT_CATEGORIES`:

```typescript
role: [ROLE_CREATED, ROLE_UPDATED, ROLE_DELETED, ROLE_ASSIGNED, ROLE_UNASSIGNED],
invitation: [INVITATION_SENT, INVITATION_ACCEPTED, INVITATION_REVOKED, INVITATION_EXPIRED],
admin: [ADMIN_SESSION_REVOKED, ADMIN_USER_SUSPENDED, ADMIN_USER_ACTIVATED, ADMIN_SETTINGS_CHANGED],
data: [DATA_EXPORTED, DATA_IMPORTED, DATA_DELETED],
```

**Step 4: Run tests to verify they pass**

```bash
cd packages/node && npx vitest run src/__tests__/audit.test.ts --reporter=verbose
```

Expected: PASS

**Step 5: Commit**

```bash
git add packages/node/src/audit/events.ts packages/node/src/__tests__/audit.test.ts
git commit -m "feat(audit): add role, invitation, admin, data event constants"
```

---

## Stream C: Settings + Email + Root Export Fixes

### Task 13: Fix importSettings Dead Code

**Important** — The catch block in `importSettings` has a dead code path checking `error.message.includes('422')` which never triggers since 422 is already handled by the `request()` method.

**Files:**
- Modify: `packages/node/src/settings/client.ts:280-297`
- Modify: `packages/node/src/__tests__/settings.test.ts`

**Step 1: Write test to verify importSettings error handling**

```typescript
it('should throw ImportValidationError on 422 from server', async () => {
  fetchMock.mockResolvedValue(
    mockResponse({ errors: [{ key: 'foo', reason: 'bad' }] }, 422)
  );
  await expect(
    client.importSettings('{}', 'json', 'merge')
  ).rejects.toBeInstanceOf(ImportValidationError);
});
```

**Step 2: Run test to verify behavior**

```bash
cd packages/node && npx vitest run src/__tests__/settings.test.ts --reporter=verbose
```

**Step 3: Remove dead catch block**

Replace the `importSettings` method body to remove the dead catch:

```typescript
async importSettings(
  data: string,
  format?: ExportFormat,
  strategy?: ImportStrategy
): Promise<ImportResult> {
  return this.request('POST', '/settings/import', {
    data,
    format: format ?? 'json',
    strategy: strategy ?? 'merge',
  });
}
```

The 422 error is already handled by the `request()` method's error handler, which throws `ImportValidationError` properly.

**Step 4: Run tests to verify they pass**

```bash
cd packages/node && npx vitest run src/__tests__/settings.test.ts --reporter=verbose
```

Expected: PASS

**Step 5: Commit**

```bash
git add packages/node/src/settings/client.ts packages/node/src/__tests__/settings.test.ts
git commit -m "fix(settings): remove dead catch block in importSettings"
```

---

### Task 14: Enhance SettingDefinition with Spec Fields

**Important** — SettingDefinition missing `is_locked`, `is_sensitive`, `group`, `depends_on`, `deprecated`, `deprecated_message` fields per spec.

**Files:**
- Modify: `packages/node/src/settings/types.ts:24-35`
- Modify: `packages/node/src/__tests__/settings.test.ts`

**Step 1: Write failing test**

```typescript
it('should support enhanced SettingDefinition fields', () => {
  const def: SettingDefinition = {
    key: 'feature.x',
    type: 'boolean',
    label: 'Feature X',
    category: 'features',
    is_public: true,
    is_readonly: false,
    display_order: 1,
    is_locked: true,
    is_sensitive: false,
    group: 'experimental',
    depends_on: ['feature.base'],
    deprecated: true,
    deprecated_message: 'Use feature.y instead',
  };
  expect(def.is_locked).toBe(true);
  expect(def.group).toBe('experimental');
  expect(def.deprecated).toBe(true);
});
```

**Step 2: Run test to verify it fails**

```bash
cd packages/node && npx vitest run src/__tests__/settings.test.ts --reporter=verbose
```

Expected: FAIL — extra properties not in type.

**Step 3: Add fields to SettingDefinition**

In `packages/node/src/settings/types.ts`:

```typescript
export interface SettingDefinition {
  key: string;
  type: SettingType;
  default_value?: unknown;
  label: string;
  description?: string;
  category: SettingCategory;
  is_public: boolean;
  is_readonly: boolean;
  is_locked?: boolean;
  is_sensitive?: boolean;
  group?: string;
  depends_on?: string[];
  deprecated?: boolean;
  deprecated_message?: string;
  validation_rules?: SettingValidationRules;
  display_order: number;
}
```

**Step 4: Run tests to verify they pass**

```bash
cd packages/node && npx vitest run src/__tests__/settings.test.ts --reporter=verbose
```

Expected: PASS

**Step 5: Commit**

```bash
git add packages/node/src/settings/types.ts packages/node/src/__tests__/settings.test.ts
git commit -m "feat(settings): enhance SettingDefinition with spec fields (is_locked, is_sensitive, group, etc.)"
```

---

### Task 15: Fix EmailClient 404 Error Mapping for Non-Template Endpoints

**Important** — All 404s map to `TemplateNotFoundError`, but history endpoint 404s should throw a different error.

**Files:**
- Modify: `packages/node/src/email/client.ts:106-108`
- Modify: `packages/node/src/email/errors.ts` (add `MessageNotFoundError`)
- Modify: `packages/node/src/__tests__/email.test.ts`

**Step 1: Add MessageNotFoundError**

In `packages/node/src/email/errors.ts`:

```typescript
export class MessageNotFoundError extends EmailError {
  public readonly messageId: string;

  constructor(messageId: string) {
    super(`Email message not found: ${messageId}`);
    this.name = 'MessageNotFoundError';
    this.messageId = messageId;
  }
}
```

**Step 2: Write failing test**

```typescript
import { MessageNotFoundError } from '../email/errors';

it('should throw MessageNotFoundError for 404 on history endpoint', async () => {
  fetchMock.mockResolvedValue(mockResponse({ error: 'Not found' }, 404));
  await expect(
    client.getSendDetails('msg-123')
  ).rejects.toBeInstanceOf(MessageNotFoundError);
});
```

**Step 3: Run test to verify it fails**

```bash
cd packages/node && npx vitest run src/__tests__/email.test.ts --reporter=verbose
```

Expected: FAIL — throws `TemplateNotFoundError` instead.

**Step 4: Fix the getSendDetails method**

Instead of relying on the generic 404 handler, add specific error handling in `getSendDetails`:

```typescript
async getSendDetails(messageId: string): Promise<EmailSendDetails> {
  try {
    return await this.request('GET', `/email/history/${messageId}`);
  } catch (error) {
    if (error instanceof TemplateNotFoundError) {
      throw new MessageNotFoundError(messageId);
    }
    throw error;
  }
}
```

**Step 5: Run tests to verify they pass**

```bash
cd packages/node && npx vitest run src/__tests__/email.test.ts --reporter=verbose
```

Expected: PASS

**Step 6: Commit**

```bash
git add packages/node/src/email/client.ts packages/node/src/email/errors.ts packages/node/src/__tests__/email.test.ts
git commit -m "fix(email): add MessageNotFoundError, use it for history endpoint 404s"
```

---

### Task 16: Add locale Field to SendTemplateRequest

**Important** — `SendTemplateRequest` is missing the `locale` field per spec.

**Files:**
- Modify: `packages/node/src/email/types.ts:67-75`
- Modify: `packages/node/src/__tests__/email.test.ts`

**Step 1: Write failing test**

```typescript
it('should accept locale in SendTemplateRequest', async () => {
  fetchMock.mockResolvedValue(mockResponse({ success: true, message_id: 'msg-1', recipients_count: 1 }));

  const request: SendTemplateRequest = {
    template_slug: 'welcome',
    to: ['user@example.com'],
    variables: { name: 'Test' },
    locale: 'fr',
  };

  await client.sendTemplate(request);

  const [, options] = fetchMock.mock.calls[0];
  const body = JSON.parse(options.body);
  expect(body.locale).toBe('fr');
});
```

**Step 2: Run test to verify it fails**

```bash
cd packages/node && npx vitest run src/__tests__/email.test.ts --reporter=verbose
```

Expected: FAIL — `locale` not in type.

**Step 3: Add locale to SendTemplateRequest**

In `packages/node/src/email/types.ts`:

```typescript
export interface SendTemplateRequest {
  template_slug: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  variables: Record<string, string>;
  from_name?: string;
  reply_to?: string;
  locale?: string;
}
```

**Step 4: Run tests to verify they pass**

```bash
cd packages/node && npx vitest run src/__tests__/email.test.ts --reporter=verbose
```

Expected: PASS

**Step 5: Commit**

```bash
git add packages/node/src/email/types.ts packages/node/src/__tests__/email.test.ts
git commit -m "feat(email): add locale field to SendTemplateRequest"
```

---

### Task 17: Enhance EmailTemplate with Spec Fields

**Important** — `EmailTemplate` missing `version`, `locales`, `html_content_dark` fields per spec.

**Files:**
- Modify: `packages/node/src/email/types.ts:14-28`
- Modify: `packages/node/src/__tests__/email.test.ts`

**Step 1: Write failing test**

```typescript
it('should support enhanced EmailTemplate fields', () => {
  const template: EmailTemplate = {
    id: 'tmpl-1',
    name: 'Welcome',
    slug: 'welcome',
    subject: 'Welcome!',
    html_content: '<h1>Hello</h1>',
    variables: ['name'],
    category: 'welcome',
    is_system: false,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    version: 3,
    locales: ['en', 'fr', 'de'],
    html_content_dark: '<h1 class="dark">Hello</h1>',
  };
  expect(template.version).toBe(3);
  expect(template.locales).toEqual(['en', 'fr', 'de']);
  expect(template.html_content_dark).toBeDefined();
});
```

**Step 2: Run test to verify it fails**

```bash
cd packages/node && npx vitest run src/__tests__/email.test.ts --reporter=verbose
```

Expected: FAIL — properties not in type.

**Step 3: Add fields to EmailTemplate**

In `packages/node/src/email/types.ts`:

```typescript
export interface EmailTemplate {
  id: string;
  tenant_id?: string;
  name: string;
  slug: string;
  subject: string;
  html_content: string;
  html_content_dark?: string;
  text_content?: string;
  variables: string[];
  category: TemplateCategory;
  is_system: boolean;
  is_active: boolean;
  version?: number;
  locales?: string[];
  created_at: string;
  updated_at: string;
}
```

**Step 4: Run tests to verify they pass**

```bash
cd packages/node && npx vitest run src/__tests__/email.test.ts --reporter=verbose
```

Expected: PASS

**Step 5: Commit**

```bash
git add packages/node/src/email/types.ts packages/node/src/__tests__/email.test.ts
git commit -m "feat(email): enhance EmailTemplate with version, locales, html_content_dark"
```

---

### Task 18: Add Missing Error Class Re-exports to Root index.ts

**Important** — New Settings and Email error classes are not re-exported from the root `index.ts`, making them inaccessible via `import { ... } from '@platform/shared-sdk'`.

**Files:**
- Modify: `packages/node/src/index.ts`
- Modify: `packages/node/src/__tests__/audit.test.ts` (verify imports)

**Step 1: Write failing test**

Create `packages/node/src/__tests__/root-exports.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('Root exports', () => {
  it('should export settings error classes', async () => {
    const mod = await import('../index');
    expect(mod.SettingsError).toBeDefined();
    expect(mod.SettingNotFoundError).toBeDefined();
    expect(mod.InvalidSettingValueError).toBeDefined();
    expect(mod.InvalidCategoryError).toBeDefined();
    expect(mod.SettingLockedError).toBeDefined();
    expect(mod.ReadonlySettingError).toBeDefined();
    expect(mod.ImportValidationError).toBeDefined();
  });

  it('should export email error classes', async () => {
    const mod = await import('../index');
    expect(mod.EmailError).toBeDefined();
    expect(mod.TemplateNotFoundError).toBeDefined();
    expect(mod.TemplateSlugExistsError).toBeDefined();
    expect(mod.EmailConfigError).toBeDefined();
    expect(mod.BatchTooLargeError).toBeDefined();
    expect(mod.ProviderConfigError).toBeDefined();
    expect(mod.MessageNotFoundError).toBeDefined();
  });

  it('should export session error classes', async () => {
    const mod = await import('../index');
    expect(mod.SessionError).toBeDefined();
    expect(mod.SessionNotFoundError).toBeDefined();
    expect(mod.SessionAlreadyRevokedError).toBeDefined();
  });

  it('should export audit RateLimitError', async () => {
    const mod = await import('../index');
    expect(mod.RateLimitError).toBeDefined();
    expect(mod.StreamTestError).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
cd packages/node && npx vitest run src/__tests__/root-exports.test.ts --reporter=verbose
```

Expected: FAIL — error classes not exported from root.

**Step 3: Add error re-exports to index.ts**

In `packages/node/src/index.ts`, add:

```typescript
// Settings error re-exports
export {
  SettingsError,
  SettingNotFoundError,
  InvalidSettingValueError,
  InvalidCategoryError,
  SettingLockedError,
  ReadonlySettingError,
  ImportValidationError,
  InvalidEnvironmentError,
} from './settings';

// Email error re-exports
export {
  EmailError,
  TemplateNotFoundError,
  TemplateSlugExistsError,
  EmailConfigError,
  BatchTooLargeError,
  ProviderConfigError,
  MessageNotFoundError,
  LocaleNotFoundError,
  VersionNotFoundError,
} from './email';

// Session error re-exports
export {
  SessionError,
  SessionNotFoundError,
  SessionAlreadyRevokedError,
  AdminRequiredError,
  InvalidSessionPolicyError,
} from './sessions';

// Additional audit error re-exports
export {
  RateLimitError,
  StreamTestError,
  StreamNotFoundError,
  AlertRuleNotFoundError,
  ExportNotFoundError,
  ExportTooLargeError,
  IdempotencyConflictError,
} from './audit';
```

Also update the settings and email module `index.ts` files to ensure these error classes are exported:

- Check `packages/node/src/settings/index.ts` exports errors
- Check `packages/node/src/email/index.ts` exports errors (add `MessageNotFoundError`)

**Step 4: Run tests to verify they pass**

```bash
cd packages/node && npx vitest run src/__tests__/root-exports.test.ts --reporter=verbose
```

Expected: PASS

**Step 5: Commit**

```bash
git add packages/node/src/index.ts packages/node/src/settings/index.ts packages/node/src/email/index.ts packages/node/src/__tests__/root-exports.test.ts
git commit -m "fix(exports): add missing error class re-exports to root index.ts"
```

---

## Final Verification

### Task 19: Run Full Test Suite and Build

**Files:** None (verification only)

**Step 1: Run all tests**

```bash
cd packages/node && npx vitest run --reporter=verbose
```

Expected: ALL tests PASS

**Step 2: Run TypeScript type checking**

```bash
cd packages/node && npx tsc --noEmit
```

Expected: No errors

**Step 3: Run full build (CJS + ESM + DTS)**

```bash
cd packages/node && npm run build
```

Expected: Build succeeds, all output bundles generated

**Step 4: Final commit if any loose ends**

Only if needed: fix any remaining issues discovered during verification.

**Step 5: Commit verification pass**

```bash
git add -A
git commit -m "chore: verify all Phase 0 audit fixes pass build and tests"
```

---

## Summary

| # | Task | Priority | Stream |
|---|------|----------|--------|
| 1 | JWT signature verification with jose | CRITICAL | A |
| 2 | Tests for exchangeCode / getClientCredentialsToken | CRITICAL | A |
| 3 | M2M token caching | Important | A |
| 4 | JWKS auto-refresh on key-not-found | Important | A |
| 5 | revokeOtherSessions/revokeAllSessions return types | Important | A |
| 6 | SessionAlreadyRevokedError HTTP 409 -> 400 | Important | A |
| 7 | GeoLocation fields + ConcurrentLimitAction fix | Important | A |
| 8 | SessionStats.peakConcurrentTimestamp | Important | A |
| 9 | ExportTooLargeError HTTP 400 -> 413 | Important | B |
| 10 | IntegrityViolationError HTTP 422 -> 409 | Important | B |
| 11 | StreamTestError + RateLimitError for 429 | Important | B |
| 12 | Missing audit event constants | Important | B |
| 13 | importSettings dead code cleanup | Important | C |
| 14 | SettingDefinition spec field enhancements | Important | C |
| 15 | EmailClient 404 error mapping fix | Important | C |
| 16 | SendTemplateRequest locale field | Important | C |
| 17 | EmailTemplate spec field enhancements | Important | C |
| 18 | Root index.ts missing error re-exports | Important | C |
| 19 | Full test suite + build verification | - | All |
