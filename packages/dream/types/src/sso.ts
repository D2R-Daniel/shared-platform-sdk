export type SSOProvider = 'azure-entra' | 'google' | 'generic-oidc';

export interface SSOAccount {
  id: string;
  userId: string;
  provider: SSOProvider;
  providerAccountId: string;
  providerData?: Record<string, unknown>;
  createdAt: Date;
}
