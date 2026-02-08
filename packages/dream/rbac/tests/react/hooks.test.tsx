import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePermission, useRole, useHasMinimumRole } from '../../src/react/hooks';
import { RbacTestProvider } from '../../src/react/context';

describe('usePermission', () => {
  it('should return true when user has the permission', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RbacTestProvider permissions={['users:read', 'teams:write']} activeRole="user" roleLevel={30}>
        {children}
      </RbacTestProvider>
    );

    const { result } = renderHook(() => usePermission('users:read'), { wrapper });
    expect(result.current).toBe(true);
  });

  it('should return false when user does not have the permission', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RbacTestProvider permissions={['users:read']} activeRole="user" roleLevel={30}>
        {children}
      </RbacTestProvider>
    );

    const { result } = renderHook(() => usePermission('users:delete'), { wrapper });
    expect(result.current).toBe(false);
  });

  it('should return false when outside provider', () => {
    const { result } = renderHook(() => usePermission('users:read'));
    expect(result.current).toBe(false);
  });
});

describe('useRole', () => {
  it('should return role information from context', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RbacTestProvider permissions={[]} activeRole="admin" roleLevel={10} roles={['admin', 'user']}>
        {children}
      </RbacTestProvider>
    );

    const { result } = renderHook(() => useRole(), { wrapper });
    expect(result.current.role).toBe('admin');
    expect(result.current.roles).toEqual(['admin', 'user']);
    expect(result.current.hierarchyLevel).toBe(10);
  });

  it('should return safe defaults when outside provider', () => {
    const { result } = renderHook(() => useRole());
    expect(result.current.role).toBe('');
    expect(result.current.roles).toEqual([]);
    expect(result.current.hierarchyLevel).toBe(-1);
  });
});

describe('useHasMinimumRole', () => {
  it('should return true when user meets minimum role', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RbacTestProvider permissions={[]} activeRole="admin" roleLevel={10}>
        {children}
      </RbacTestProvider>
    );

    const { result } = renderHook(() => useHasMinimumRole('manager'), { wrapper });
    expect(result.current).toBe(true);
  });

  it('should return false when user does not meet minimum role', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <RbacTestProvider permissions={[]} activeRole="user" roleLevel={30}>
        {children}
      </RbacTestProvider>
    );

    const { result } = renderHook(() => useHasMinimumRole('admin'), { wrapper });
    expect(result.current).toBe(false);
  });

  it('should return false when outside provider', () => {
    const { result } = renderHook(() => useHasMinimumRole('user'));
    expect(result.current).toBe(false);
  });
});
