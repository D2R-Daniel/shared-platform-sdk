import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useAuth } from '../../src/react/use-auth';
import { MockAuthProvider } from '../../src/react/testing';
import type { SessionUser } from '../../src/react/auth-context';

const mockUser: SessionUser = {
  id: 'user-123',
  email: 'alice@acme.com',
  name: 'Alice',
  tenantId: 'org-456',
  roles: ['admin'],
  activeRole: 'admin',
  permissions: ['users:read', 'users:write'],
};

describe('MockAuthProvider', () => {
  it('should provide user data via useAuth', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MockAuthProvider user={mockUser}>{children}</MockAuthProvider>
      ),
    });

    expect(result.current.user).toEqual(mockUser);
  });

  it('should set isAuthenticated to true when user exists', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MockAuthProvider user={mockUser}>{children}</MockAuthProvider>
      ),
    });

    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should set isAuthenticated to false when user is null', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MockAuthProvider user={null}>{children}</MockAuthProvider>
      ),
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should default isLoading to false', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MockAuthProvider user={null}>{children}</MockAuthProvider>
      ),
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should call onSignOut when signOut is invoked', async () => {
    const onSignOut = vi.fn();
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MockAuthProvider user={mockUser} onSignOut={onSignOut}>
          {children}
        </MockAuthProvider>
      ),
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it('should call onSwitchOrganization when switchOrganization is invoked', async () => {
    const onSwitchOrganization = vi.fn();
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <MockAuthProvider user={mockUser} onSwitchOrganization={onSwitchOrganization}>
          {children}
        </MockAuthProvider>
      ),
    });

    await act(async () => {
      await result.current.switchOrganization('org-789');
    });

    expect(onSwitchOrganization).toHaveBeenCalledWith('org-789');
  });
});
