import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthClient } from '../auth';
import { DiscoveryError } from '../auth/errors';

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

const mockDiscoveryDoc = {
  issuer: 'https://auth.example.com',
  authorization_endpoint: 'https://auth.example.com/auth/authorize',
  token_endpoint: 'https://auth.example.com/auth/token',
  userinfo_endpoint: 'https://auth.example.com/auth/userinfo',
  jwks_uri: 'https://auth.example.com/.well-known/jwks.json',
  response_types_supported: ['code'],
  subject_types_supported: ['public'],
  id_token_signing_alg_values_supported: ['RS256'],
};

describe('AuthClient.discover', () => {
  let client: AuthClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new AuthClient({ issuerUrl: 'https://auth.example.com' });
  });

  it('should fetch and return the discovery document', async () => {
    mockGet.mockResolvedValueOnce({ data: mockDiscoveryDoc });

    const doc = await client.discover();

    expect(doc.issuer).toBe('https://auth.example.com');
    expect(doc.jwks_uri).toBe('https://auth.example.com/.well-known/jwks.json');
  });

  it('should cache the discovery document', async () => {
    mockGet.mockResolvedValueOnce({ data: mockDiscoveryDoc });

    await client.discover();
    await client.discover();

    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('should bypass cache with forceRefresh', async () => {
    mockGet.mockResolvedValue({ data: mockDiscoveryDoc });

    await client.discover();
    await client.discover(true);

    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it('should throw DiscoveryError on failure', async () => {
    mockGet.mockRejectedValueOnce(new Error('Network error'));

    await expect(client.discover()).rejects.toThrow(DiscoveryError);
  });
});
