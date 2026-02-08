import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PermissionGate } from '../../src/react/permission-gate';
import { RoleGate } from '../../src/react/role-gate';
import { AdminGate } from '../../src/react/admin-gate';
import { RbacTestProvider } from '../../src/react/context';

describe('PermissionGate', () => {
  it('should render children when user has the required permission', () => {
    render(
      <RbacTestProvider permissions={['users:read']} activeRole="user" roleLevel={30}>
        <PermissionGate permission="users:read">
          <span>Visible</span>
        </PermissionGate>
      </RbacTestProvider>,
    );
    expect(screen.getByText('Visible')).toBeDefined();
  });

  it('should render fallback when permission is denied', () => {
    render(
      <RbacTestProvider permissions={['teams:read']} activeRole="user" roleLevel={30}>
        <PermissionGate permission="users:write" fallback={<span>Denied</span>}>
          <span>Visible</span>
        </PermissionGate>
      </RbacTestProvider>,
    );
    expect(screen.queryByText('Visible')).toBeNull();
    expect(screen.getByText('Denied')).toBeDefined();
  });

  it('should render nothing when no fallback and permission denied', () => {
    const { container } = render(
      <RbacTestProvider permissions={['teams:read']} activeRole="user" roleLevel={30}>
        <PermissionGate permission="users:write">
          <span>Visible</span>
        </PermissionGate>
      </RbacTestProvider>,
    );
    expect(screen.queryByText('Visible')).toBeNull();
    expect(container.innerHTML).toBe('');
  });

  it('should render nothing when outside provider (unauthenticated)', () => {
    const { container } = render(
      <PermissionGate permission="users:read">
        <span>Visible</span>
      </PermissionGate>,
    );
    expect(screen.queryByText('Visible')).toBeNull();
    expect(container.innerHTML).toBe('');
  });

  it('should render children when user has wildcard permission', () => {
    render(
      <RbacTestProvider permissions={['*']} activeRole="super_admin" roleLevel={0}>
        <PermissionGate permission="users:delete">
          <span>Wildcard Access</span>
        </PermissionGate>
      </RbacTestProvider>,
    );
    expect(screen.getByText('Wildcard Access')).toBeDefined();
  });
});

describe('RoleGate', () => {
  it('should render children for matching role', () => {
    render(
      <RbacTestProvider permissions={[]} activeRole="admin" roleLevel={10}>
        <RoleGate role="admin">
          <span>Admin Content</span>
        </RoleGate>
      </RbacTestProvider>,
    );
    expect(screen.getByText('Admin Content')).toBeDefined();
  });

  it('should not render children for non-matching role', () => {
    render(
      <RbacTestProvider permissions={[]} activeRole="user" roleLevel={30}>
        <RoleGate role="admin" fallback={<span>Not Admin</span>}>
          <span>Admin Content</span>
        </RoleGate>
      </RbacTestProvider>,
    );
    expect(screen.queryByText('Admin Content')).toBeNull();
    expect(screen.getByText('Not Admin')).toBeDefined();
  });
});

describe('AdminGate', () => {
  it('should render children for admin (level 10)', () => {
    render(
      <RbacTestProvider permissions={[]} activeRole="admin" roleLevel={10}>
        <AdminGate>
          <span>Admin Panel</span>
        </AdminGate>
      </RbacTestProvider>,
    );
    expect(screen.getByText('Admin Panel')).toBeDefined();
  });

  it('should render children for super_admin (level 0)', () => {
    render(
      <RbacTestProvider permissions={['*']} activeRole="super_admin" roleLevel={0}>
        <AdminGate>
          <span>Admin Panel</span>
        </AdminGate>
      </RbacTestProvider>,
    );
    expect(screen.getByText('Admin Panel')).toBeDefined();
  });

  it('should not render children for user role (level 30)', () => {
    render(
      <RbacTestProvider permissions={[]} activeRole="user" roleLevel={30}>
        <AdminGate fallback={<span>Access Denied</span>}>
          <span>Admin Panel</span>
        </AdminGate>
      </RbacTestProvider>,
    );
    expect(screen.queryByText('Admin Panel')).toBeNull();
    expect(screen.getByText('Access Denied')).toBeDefined();
  });
});
