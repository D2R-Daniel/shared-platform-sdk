'use client';

import React from 'react';
import { DreamUIProvider } from '../theme/provider';
import type { ApiAdapter } from '../lib/api-adapter';
import type { BrandingConfig, DreamUIError } from '../theme/types';

const noopAsync = async () => {};
const noopAsyncReturn = async () => ({}) as never;

function createNoopAdapter(): ApiAdapter {
  return {
    listMembers: noopAsyncReturn,
    removeMember: noopAsync,
    createInvitation: noopAsyncReturn,
    listInvitations: noopAsyncReturn,
    revokeInvitation: noopAsync,
    listRoles: async () => [],
    createRole: noopAsyncReturn,
    updateRole: noopAsyncReturn,
    deleteRole: noopAsync,
    assignRole: noopAsync,
    getOrganization: noopAsyncReturn,
    updateOrganization: noopAsyncReturn,
    createOrganization: noopAsyncReturn,
    listAuditEvents: noopAsyncReturn,
    listApiKeys: async () => [],
    createApiKey: noopAsyncReturn,
    revokeApiKey: noopAsync,
    listWebhooks: async () => [],
    createWebhook: noopAsyncReturn,
    updateWebhook: noopAsyncReturn,
    deleteWebhook: noopAsync,
    testWebhook: noopAsyncReturn,
    listUserSessions: async () => [],
    listAllSessions: noopAsyncReturn,
    revokeSession: noopAsync,
    updateProfile: noopAsyncReturn,
    changePassword: noopAsync,
    uploadAvatar: async () => ({ url: '' }),
    getMfaStatus: noopAsyncReturn,
    initiateMfaSetup: noopAsyncReturn,
    verifyMfaSetup: noopAsyncReturn,
    disableMfa: noopAsync,
    getNotificationPreferences: noopAsyncReturn,
    updateNotificationPreferences: noopAsyncReturn,
    listConnectedAccounts: async () => [],
    disconnectAccount: noopAsync,
  };
}

export interface MockApiProviderProps {
  children: React.ReactNode;
  adapter?: Partial<ApiAdapter>;
  branding?: BrandingConfig;
  onError?: (error: DreamUIError) => void;
}

export function MockApiProvider({
  children,
  adapter,
  branding,
  onError,
}: MockApiProviderProps): React.JSX.Element {
  const fullAdapter: ApiAdapter = { ...createNoopAdapter(), ...adapter };
  return (
    <DreamUIProvider apiAdapter={fullAdapter} branding={branding} onError={onError}>
      {children}
    </DreamUIProvider>
  );
}

export { createNoopAdapter };
