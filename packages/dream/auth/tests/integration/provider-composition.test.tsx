import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { MockAuthProvider } from '../../src/react/testing';
import { useAuth } from '../../src/react';
import { MockTenantProvider } from '@dream/multi-tenant/react';
import { useTenant } from '@dream/multi-tenant/react';
import {
  RbacTestProvider,
  PermissionGate,
  AdminGate,
  RoleGate,
  usePermission,
  useRole,
} from '@dream/rbac';
import type { SessionUser } from '../../src/react/auth-context';
import type { Organization } from '@dream/multi-tenant/react';

// ── Fixtures ──────────────────────────────────────────────────────────────

const adminUser: SessionUser = {
  id: 'usr-admin-001',
  email: 'admin@acme.com',
  name: 'Alice Admin',
  tenantId: 'org-acme-001',
  roles: ['admin'],
  activeRole: 'admin',
  permissions: ['users:*', 'teams:*', 'settings:*', 'audit:read', 'invoices:write'],
};

const guestUser: SessionUser = {
  id: 'usr-guest-001',
  email: 'guest@acme.com',
  name: 'Bob Guest',
  tenantId: 'org-acme-001',
  roles: ['guest'],
  activeRole: 'guest',
  permissions: ['users:read'],
};

const testOrg: Organization = {
  id: 'org-acme-001',
  name: 'Acme Corp',
  slug: 'acme',
  status: 'active',
  planTier: 'enterprise',
};

// ── Helper components that use hooks ──────────────────────────────────────

function AuthInfo() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <div>Not authenticated</div>;
  return (
    <div>
      <span data-testid="user-name">{user?.name}</span>
      <span data-testid="user-email">{user?.email}</span>
      <span data-testid="user-role">{user?.activeRole}</span>
    </div>
  );
}

function TenantInfo() {
  const { tenantId, organization, isLoading } = useTenant();
  if (isLoading) return <div>Loading tenant...</div>;
  return (
    <div>
      <span data-testid="tenant-id">{tenantId}</span>
      <span data-testid="org-name">{organization?.name}</span>
      <span data-testid="org-plan">{organization?.planTier}</span>
    </div>
  );
}

function PermissionCheck({ permission }: { permission: string }) {
  const hasPermission = usePermission(permission);
  return <span data-testid={`perm-${permission}`}>{hasPermission ? 'granted' : 'denied'}</span>;
}

function RoleInfo() {
  const { role, roles } = useRole();
  return (
    <div>
      <span data-testid="active-role">{role}</span>
      <span data-testid="all-roles">{roles.join(',')}</span>
    </div>
  );
}

// ── Full provider wrapper ────────────────────────────────────────────────

function FullProviders({
  user,
  tenantId,
  organization,
  children,
}: {
  user: SessionUser | null;
  tenantId: string;
  organization: Organization;
  children: React.ReactNode;
}) {
  return (
    <MockAuthProvider user={user}>
      <MockTenantProvider
        tenantId={tenantId}
        organization={organization}
        organizations={[organization]}
      >
        <RbacTestProvider
          permissions={user?.permissions ?? []}
          activeRole={user?.activeRole ?? ''}
          roleLevel={user?.activeRole === 'admin' ? 10 : user?.activeRole === 'guest' ? 40 : -1}
          roles={user?.roles ?? []}
        >
          {children}
        </RbacTestProvider>
      </MockTenantProvider>
    </MockAuthProvider>
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────

describe('React provider composition — cross-package integration', () => {
  afterEach(cleanup);

  // ── 1. useAuth() works inside nested providers ──────────────────────

  it('useAuth() returns user data inside nested providers', () => {
    render(
      <FullProviders user={adminUser} tenantId="org-acme-001" organization={testOrg}>
        <AuthInfo />
      </FullProviders>,
    );

    expect(screen.getByTestId('user-name').textContent).toBe('Alice Admin');
    expect(screen.getByTestId('user-email').textContent).toBe('admin@acme.com');
    expect(screen.getByTestId('user-role').textContent).toBe('admin');
  });

  // ── 2. useTenant() works inside nested providers ────────────────────

  it('useTenant() returns organization data inside nested providers', () => {
    render(
      <FullProviders user={adminUser} tenantId="org-acme-001" organization={testOrg}>
        <TenantInfo />
      </FullProviders>,
    );

    expect(screen.getByTestId('tenant-id').textContent).toBe('org-acme-001');
    expect(screen.getByTestId('org-name').textContent).toBe('Acme Corp');
    expect(screen.getByTestId('org-plan').textContent).toBe('enterprise');
  });

  // ── 3. usePermission() returns correct values ───────────────────────

  it('usePermission() returns true for granted permissions and false for denied ones', () => {
    render(
      <FullProviders user={adminUser} tenantId="org-acme-001" organization={testOrg}>
        <PermissionCheck permission="users:read" />
        <PermissionCheck permission="users:delete" />
        <PermissionCheck permission="invoices:write" />
        <PermissionCheck permission="billing:read" />
      </FullProviders>,
    );

    // admin has users:* — should match users:read and users:delete
    expect(screen.getByTestId('perm-users:read').textContent).toBe('granted');
    expect(screen.getByTestId('perm-users:delete').textContent).toBe('granted');
    // admin has invoices:write explicitly
    expect(screen.getByTestId('perm-invoices:write').textContent).toBe('granted');
    // admin does NOT have billing:read
    expect(screen.getByTestId('perm-billing:read').textContent).toBe('denied');
  });

  // ── 4. PermissionGate renders based on user permissions ─────────────

  it('PermissionGate renders children when user has the permission', () => {
    render(
      <FullProviders user={adminUser} tenantId="org-acme-001" organization={testOrg}>
        <PermissionGate permission="users:write">
          <button>Edit User</button>
        </PermissionGate>
      </FullProviders>,
    );

    expect(screen.getByText('Edit User')).toBeDefined();
  });

  it('PermissionGate renders fallback when user lacks the permission', () => {
    render(
      <FullProviders user={guestUser} tenantId="org-acme-001" organization={testOrg}>
        <PermissionGate permission="users:write" fallback={<span>No access</span>}>
          <button>Edit User</button>
        </PermissionGate>
      </FullProviders>,
    );

    expect(screen.queryByText('Edit User')).toBeNull();
    expect(screen.getByText('No access')).toBeDefined();
  });

  // ── 5. AdminGate renders for admin user ─────────────────────────────

  it('AdminGate renders children for admin user', () => {
    render(
      <FullProviders user={adminUser} tenantId="org-acme-001" organization={testOrg}>
        <AdminGate>
          <span>Admin Panel</span>
        </AdminGate>
      </FullProviders>,
    );

    expect(screen.getByText('Admin Panel')).toBeDefined();
  });

  // ── 6. AdminGate hides for guest user ───────────────────────────────

  it('AdminGate hides children for guest user', () => {
    render(
      <FullProviders user={guestUser} tenantId="org-acme-001" organization={testOrg}>
        <AdminGate fallback={<span>Restricted</span>}>
          <span>Admin Panel</span>
        </AdminGate>
      </FullProviders>,
    );

    expect(screen.queryByText('Admin Panel')).toBeNull();
    expect(screen.getByText('Restricted')).toBeDefined();
  });

  // ── 7. RoleGate matches active role ─────────────────────────────────

  it('RoleGate renders children when active role matches', () => {
    render(
      <FullProviders user={adminUser} tenantId="org-acme-001" organization={testOrg}>
        <RoleGate role="admin">
          <span>Admin Content</span>
        </RoleGate>
      </FullProviders>,
    );

    expect(screen.getByText('Admin Content')).toBeDefined();
  });

  it('RoleGate hides children when active role does not match', () => {
    render(
      <FullProviders user={guestUser} tenantId="org-acme-001" organization={testOrg}>
        <RoleGate role="admin" fallback={<span>Not admin</span>}>
          <span>Admin Content</span>
        </RoleGate>
      </FullProviders>,
    );

    expect(screen.queryByText('Admin Content')).toBeNull();
    expect(screen.getByText('Not admin')).toBeDefined();
  });

  // ── 8. useRole() returns role info ──────────────────────────────────

  it('useRole() returns active role and all role slugs', () => {
    render(
      <FullProviders user={adminUser} tenantId="org-acme-001" organization={testOrg}>
        <RoleInfo />
      </FullProviders>,
    );

    expect(screen.getByTestId('active-role').textContent).toBe('admin');
    expect(screen.getByTestId('all-roles').textContent).toBe('admin');
  });

  // ── 9. Unauthenticated user — all gates deny ───────────────────────

  it('all gates render fallback when user is null (not authenticated)', () => {
    render(
      <FullProviders user={null} tenantId="org-acme-001" organization={testOrg}>
        <AuthInfo />
        <PermissionGate permission="users:read" fallback={<span>perm-denied</span>}>
          <span>perm-granted</span>
        </PermissionGate>
        <AdminGate fallback={<span>admin-denied</span>}>
          <span>admin-granted</span>
        </AdminGate>
        <RoleGate role="admin" fallback={<span>role-denied</span>}>
          <span>role-granted</span>
        </RoleGate>
      </FullProviders>,
    );

    expect(screen.getByText('Not authenticated')).toBeDefined();
    expect(screen.getByText('perm-denied')).toBeDefined();
    expect(screen.getByText('admin-denied')).toBeDefined();
    expect(screen.getByText('role-denied')).toBeDefined();
  });
});
