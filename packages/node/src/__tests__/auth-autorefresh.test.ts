import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { AuthClient } from '../auth';

// Create mock functions at module level
const mockGet = vi.fn();
const mockPost = vi.fn();

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
      post: mockPost,
    })),
  },
}));

function createTestToken(
  payload: Record<string, any>,
  options: jwt.SignOptions = {}
): string {
  return jwt.sign(payload, 'test-secret', { expiresIn: '1h', ...options });
}

describe('AuthClient.onTokenRefresh', () => {
  let client: AuthClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new AuthClient({
      issuerUrl: 'https://auth.example.com',
      clientId: 'test-client',
    });
  });

  it('should call callback when refreshToken succeeds', async () => {
    const callback = vi.fn();
    client.onTokenRefresh(callback);

    mockPost.mockResolvedValueOnce({
      data: {
        access_token: 'new-access',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'new-refresh',
      },
    });

    await client.refreshToken('old-refresh');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({ accessToken: 'new-access' })
    );
  });

  it('should unregister callback with returned function', async () => {
    const callback = vi.fn();
    const unregister = client.onTokenRefresh(callback);
    unregister();

    mockPost.mockResolvedValueOnce({
      data: {
        access_token: 'new-access',
        token_type: 'Bearer',
        expires_in: 3600,
      },
    });

    await client.refreshToken('old-refresh');

    expect(callback).not.toHaveBeenCalled();
  });
});

describe('AuthClient.enableAutoRefresh', () => {
  let client: AuthClient;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    client = new AuthClient({
      issuerUrl: 'https://auth.example.com',
      clientId: 'test-client',
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return a handle with stop and isActive', () => {
    const token = createTestToken({ sub: 'user-123' });
    const handle = client.enableAutoRefresh(token, {
      refreshToken: 'refresh-token',
    });

    expect(handle.isActive()).toBe(true);
    handle.stop();
    expect(handle.isActive()).toBe(false);
  });

  it('should call onRefresh callback on successful refresh', async () => {
    const onRefresh = vi.fn();
    const token = createTestToken(
      { sub: 'user-123' },
      { expiresIn: '120s' } // 2 minutes
    );

    mockPost.mockResolvedValueOnce({
      data: {
        access_token: createTestToken({ sub: 'user-123' }, { expiresIn: '1h' }),
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'new-refresh',
      },
    });

    const handle = client.enableAutoRefresh(token, {
      refreshToken: 'refresh-token',
      refreshBeforeExpirySeconds: 60,
      onRefresh,
    });

    // Advance past the refresh point (2 min - 60 sec = 60 sec)
    await vi.advanceTimersByTimeAsync(61000);

    expect(onRefresh).toHaveBeenCalledTimes(1);
    handle.stop();
  });

  it('should call onError after maxRetries failures', async () => {
    const onError = vi.fn();
    const token = createTestToken(
      { sub: 'user-123' },
      { expiresIn: '30s' }
    );

    mockPost.mockRejectedValue(new Error('Network error'));

    const handle = client.enableAutoRefresh(token, {
      refreshToken: 'refresh-token',
      refreshBeforeExpirySeconds: 60,
      maxRetries: 2,
      onError,
    });

    // First attempt (immediate since 30s < 60s buffer)
    await vi.advanceTimersByTimeAsync(1000);
    // First retry (2s exponential backoff)
    await vi.advanceTimersByTimeAsync(3000);
    // Second retry (4s exponential backoff) - hits maxRetries
    await vi.advanceTimersByTimeAsync(5000);

    expect(onError).toHaveBeenCalledTimes(1);
    expect(handle.isActive()).toBe(false);
  });

  it('should stop refreshing when stop is called', async () => {
    const onRefresh = vi.fn();
    const token = createTestToken(
      { sub: 'user-123' },
      { expiresIn: '120s' }
    );

    const handle = client.enableAutoRefresh(token, {
      refreshToken: 'refresh-token',
      refreshBeforeExpirySeconds: 60,
      onRefresh,
    });

    handle.stop();

    await vi.advanceTimersByTimeAsync(120000);

    expect(onRefresh).not.toHaveBeenCalled();
  });
});
