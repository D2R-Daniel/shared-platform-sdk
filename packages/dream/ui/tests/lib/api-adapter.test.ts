import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createFetchAdapter } from '../../src/lib/api-adapter';

describe('createFetchAdapter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('constructs correct URL for listMembers', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [], total: 0 }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const adapter = createFetchAdapter({ baseUrl: '/api/platform' });
    await adapter.listMembers({ page: 1, pageSize: 10 });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/platform/members?page=1&pageSize=10',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('constructs correct URL for createInvitation with POST', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: '1', email: 'test@example.com' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const adapter = createFetchAdapter({ baseUrl: '/api/platform' });
    await adapter.createInvitation({ email: 'test@example.com', roleId: 'admin' });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/platform/invitations',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', roleId: 'admin' }),
      }),
    );
  });

  it('throws on non-OK response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });
    vi.stubGlobal('fetch', mockFetch);

    const adapter = createFetchAdapter({ baseUrl: '/api/platform' });
    await expect(adapter.listMembers({ page: 1 })).rejects.toThrow('failed: 404');
  });

  it('handles DELETE with void return', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
    });
    vi.stubGlobal('fetch', mockFetch);

    const adapter = createFetchAdapter({ baseUrl: '/api/platform' });
    await adapter.removeMember('user-123');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/platform/members/user-123',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});
