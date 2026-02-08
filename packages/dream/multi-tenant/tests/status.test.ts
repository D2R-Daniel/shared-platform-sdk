import { describe, it, expect } from 'vitest';
import { checkTenantStatus } from '../src/status';

describe('checkTenantStatus', () => {
  it('should return valid for active organization', () => {
    const result = checkTenantStatus('active');
    expect(result).toEqual({ valid: true });
  });

  it('should return invalid with error for suspended organization', () => {
    const result = checkTenantStatus('suspended');
    expect(result).toEqual({
      valid: false,
      error: 'Organization is suspended. Contact your administrator.',
    });
  });

  it('should return invalid with error for archived organization', () => {
    const result = checkTenantStatus('archived');
    expect(result).toEqual({
      valid: false,
      error: 'Organization has been archived. Read-only access only.',
    });
  });
});
