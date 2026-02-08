/**
 * Matches a single user permission against a required permission.
 *
 * Matching rules:
 * - Exact: 'users:read' matches 'users:read'
 * - Action wildcard: 'users:*' matches 'users:read'
 * - Global wildcard: '*' matches anything
 * - Scope extension: 'users:read' matches 'users:read:self'
 * - No cross-resource wildcard: '*:read' does NOT match 'users:read'
 */
export function matchesPermission(
  userPermission: string,
  requiredPermission: string,
): boolean {
  // Handle empty strings
  if (!userPermission || !requiredPermission) {
    return false;
  }

  // Global wildcard matches everything
  if (userPermission === '*') {
    return true;
  }

  // Both must be in resource:action format
  const userParts = userPermission.split(':');
  const requiredParts = requiredPermission.split(':');

  if (userParts.length < 2 || requiredParts.length < 2) {
    return false;
  }

  const [userResource, userAction] = userParts;
  const [requiredResource, requiredAction] = requiredParts;

  // Resources must match exactly
  if (userResource !== requiredResource) {
    return false;
  }

  // Action wildcard matches any action (including scoped)
  if (userAction === '*') {
    return true;
  }

  // Exact action match
  if (userAction === requiredAction) {
    return true;
  }

  return false;
}

/**
 * Returns true if the user has ANY of the required permissions (OR logic).
 * Returns false if requiredPermissions is empty.
 */
export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: string[],
): boolean {
  if (requiredPermissions.length === 0) {
    return false;
  }

  return requiredPermissions.some((required) =>
    userPermissions.some((user) => matchesPermission(user, required)),
  );
}

/**
 * Returns true if the user has ALL of the required permissions (AND logic).
 * Returns true if requiredPermissions is empty (vacuous truth).
 */
export function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: string[],
): boolean {
  if (requiredPermissions.length === 0) {
    return true;
  }

  return requiredPermissions.every((required) =>
    userPermissions.some((user) => matchesPermission(user, required)),
  );
}
