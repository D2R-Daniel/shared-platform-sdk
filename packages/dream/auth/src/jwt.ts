const SESSION_MAX_AGE = 28800; // 8 hours in seconds

export interface JwtEnrichmentContext {
  tenantId: string;
  roleSlugs: string[];
  activeRole: string;
  permissions: string[];
  tenantStatus: string;
  planTier: string;
  authProvider: string;
}

export function enrichJwtToken(
  token: Record<string, unknown>,
  context: JwtEnrichmentContext,
): Record<string, unknown> {
  const iat = typeof token.iat === 'number' ? token.iat : Math.floor(Date.now() / 1000);

  return {
    ...token,
    tenantId: context.tenantId,
    roles: context.roleSlugs,
    activeRole: context.activeRole,
    permissions: context.permissions,
    tenantStatus: context.tenantStatus,
    planTier: context.planTier,
    authProvider: context.authProvider,
    iat,
    exp: iat + SESSION_MAX_AGE,
  };
}
