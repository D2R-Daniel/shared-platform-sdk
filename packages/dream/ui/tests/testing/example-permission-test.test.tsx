import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../src/testing';
import React from 'react';

function PermissionGate({
  permission,
  userPermissions,
  children,
  fallback = null,
}: {
  permission: string;
  userPermissions: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  if (userPermissions.includes(permission)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
}

describe('Example: permission-based rendering', () => {
  it('shows gated content for admin user', () => {
    renderWithProviders(
      <PermissionGate permission="users:write" userPermissions={['users:read', 'users:write', 'invitations:create']}>
        <button>Invite Member</button>
      </PermissionGate>
    );
    expect(screen.getByText('Invite Member')).toBeInTheDocument();
  });

  it('hides gated content for viewer user', () => {
    renderWithProviders(
      <PermissionGate
        permission="users:write"
        userPermissions={['users:read']}
        fallback={<span>Access denied</span>}
      >
        <button>Invite Member</button>
      </PermissionGate>
    );
    expect(screen.queryByText('Invite Member')).not.toBeInTheDocument();
    expect(screen.getByText('Access denied')).toBeInTheDocument();
  });
});
