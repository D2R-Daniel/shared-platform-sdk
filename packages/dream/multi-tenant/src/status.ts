export type OrganizationStatus = 'active' | 'suspended' | 'archived';

export interface TenantStatusResult {
  valid: boolean;
  error?: string;
}

const STATUS_ERRORS: Record<string, string> = {
  suspended: 'Organization is suspended. Contact your administrator.',
  archived: 'Organization has been archived. Read-only access only.',
};

export function checkTenantStatus(status: OrganizationStatus): TenantStatusResult {
  if (status === 'active') {
    return { valid: true };
  }

  return {
    valid: false,
    error: STATUS_ERRORS[status],
  };
}
