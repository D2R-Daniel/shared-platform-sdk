export interface ListParams {
  page?: number;
  pageSize?: number;
}

export interface ApiAdapter {
  // Members
  listMembers(params: ListParams): Promise<unknown>;
  removeMember(userId: string): Promise<void>;
  // Invitations
  createInvitation(data: { email: string; roleId: string }): Promise<unknown>;
  listInvitations(params: ListParams): Promise<unknown>;
  revokeInvitation(id: string): Promise<void>;
  // Roles
  listRoles(): Promise<unknown[]>;
  createRole(data: unknown): Promise<unknown>;
  updateRole(id: string, data: unknown): Promise<unknown>;
  deleteRole(id: string): Promise<void>;
  assignRole(userId: string, roleId: string): Promise<void>;
  // Organization
  getOrganization(): Promise<unknown>;
  updateOrganization(data: unknown): Promise<unknown>;
  createOrganization(data: unknown): Promise<unknown>;
  // Audit
  listAuditEvents(params: unknown): Promise<unknown>;
  // API Keys
  listApiKeys(): Promise<unknown[]>;
  createApiKey(data: unknown): Promise<unknown>;
  revokeApiKey(id: string): Promise<void>;
  // Webhooks
  listWebhooks(): Promise<unknown[]>;
  createWebhook(data: unknown): Promise<unknown>;
  updateWebhook(id: string, data: unknown): Promise<unknown>;
  deleteWebhook(id: string): Promise<void>;
  testWebhook(id: string, eventType: string): Promise<unknown>;
  // Sessions
  listUserSessions(): Promise<unknown[]>;
  listAllSessions(params: ListParams): Promise<unknown>;
  revokeSession(id: string): Promise<void>;
  // User Profile
  updateProfile(data: unknown): Promise<unknown>;
  changePassword(data: { currentPassword: string; newPassword: string }): Promise<void>;
  uploadAvatar(file: File): Promise<{ url: string }>;
  // MFA
  getMfaStatus(): Promise<unknown>;
  initiateMfaSetup(): Promise<unknown>;
  verifyMfaSetup(code: string): Promise<unknown>;
  disableMfa(code: string): Promise<void>;
  // Notifications
  getNotificationPreferences(): Promise<unknown>;
  updateNotificationPreferences(data: unknown): Promise<unknown>;
  // Connected Accounts
  listConnectedAccounts(): Promise<unknown[]>;
  disconnectAccount(provider: string): Promise<void>;
}

export interface CreateFetchAdapterOptions {
  baseUrl: string;
}

function createMethod(baseUrl: string, method: string, path: string) {
  return async (bodyOrParams?: unknown) => {
    const url = `${baseUrl}${path}`;
    const options: RequestInit = { method, headers: { 'Content-Type': 'application/json' } };
    if (bodyOrParams && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(bodyOrParams);
    }
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`${method} ${path} failed: ${res.status}`);
    if (res.status === 204) return;
    return res.json();
  };
}

export function createFetchAdapter({ baseUrl }: CreateFetchAdapterOptions): ApiAdapter {
  const get = (path: string) => createMethod(baseUrl, 'GET', path);
  const post = (path: string) => createMethod(baseUrl, 'POST', path);
  const put = (path: string) => createMethod(baseUrl, 'PUT', path);
  const del = (path: string) => createMethod(baseUrl, 'DELETE', path);

  return {
    listMembers: (params) => get(`/members?page=${params.page ?? 1}&pageSize=${params.pageSize ?? 20}`)(),
    removeMember: (id) => del(`/members/${id}`)() as Promise<void>,
    createInvitation: (data) => post('/invitations')(data),
    listInvitations: (params) => get(`/invitations?page=${params.page ?? 1}&pageSize=${params.pageSize ?? 20}`)(),
    revokeInvitation: (id) => del(`/invitations/${id}`)() as Promise<void>,
    listRoles: () => get('/roles')() as Promise<unknown[]>,
    createRole: (data) => post('/roles')(data),
    updateRole: (id, data) => put(`/roles/${id}`)(data),
    deleteRole: (id) => del(`/roles/${id}`)() as Promise<void>,
    assignRole: (userId, roleId) => post(`/members/${userId}/role`)({ roleId }) as Promise<void>,
    getOrganization: () => get('/organization')(),
    updateOrganization: (data) => put('/organization')(data),
    createOrganization: (data) => post('/organizations')(data),
    listAuditEvents: (params) => post('/audit/query')(params),
    listApiKeys: () => get('/api-keys')() as Promise<unknown[]>,
    createApiKey: (data) => post('/api-keys')(data),
    revokeApiKey: (id) => del(`/api-keys/${id}`)() as Promise<void>,
    listWebhooks: () => get('/webhooks')() as Promise<unknown[]>,
    createWebhook: (data) => post('/webhooks')(data),
    updateWebhook: (id, data) => put(`/webhooks/${id}`)(data),
    deleteWebhook: (id) => del(`/webhooks/${id}`)() as Promise<void>,
    testWebhook: (id, eventType) => post(`/webhooks/${id}/test`)({ eventType }),
    listUserSessions: () => get('/sessions/me')() as Promise<unknown[]>,
    listAllSessions: () => get('/sessions')() as Promise<unknown>,
    revokeSession: (id) => del(`/sessions/${id}`)() as Promise<void>,
    updateProfile: (data) => put('/profile')(data),
    changePassword: (data) => post('/profile/password')(data) as Promise<void>,
    uploadAvatar: async (file) => {
      const form = new FormData();
      form.append('avatar', file);
      const res = await fetch(`${baseUrl}/profile/avatar`, { method: 'POST', body: form });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      return res.json();
    },
    getMfaStatus: () => get('/mfa/status')(),
    initiateMfaSetup: () => post('/mfa/setup')({}),
    verifyMfaSetup: (code) => post('/mfa/verify')({ code }),
    disableMfa: (code) => post('/mfa/disable')({ code }) as Promise<void>,
    getNotificationPreferences: () => get('/notifications/preferences')(),
    updateNotificationPreferences: (data) => put('/notifications/preferences')(data),
    listConnectedAccounts: () => get('/connected-accounts')() as Promise<unknown[]>,
    disconnectAccount: (provider) => del(`/connected-accounts/${provider}`)() as Promise<void>,
  };
}
