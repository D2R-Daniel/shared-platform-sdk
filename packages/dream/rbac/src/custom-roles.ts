import type { RoleDefinition } from '@dream/types';

export interface CustomRoleDefinition {
  slug: string;
  name: string;
  hierarchyLevel: number;
  permissions: string[];
  organizationId?: string;
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Internal registry of custom roles, keyed by slug */
let customRoleRegistry: Map<string, RoleDefinition> = new Map();

/**
 * Resets the custom role registry. Used for test cleanup.
 */
export function resetCustomRoles(): void {
  customRoleRegistry = new Map();
}

/**
 * Returns a custom role by slug, or undefined if not found.
 * Called by getRoleBySlug in hierarchy.ts as a fallback.
 */
export function getCustomRole(slug: string): RoleDefinition | undefined {
  return customRoleRegistry.get(slug);
}

/**
 * Validates and registers custom role definitions.
 *
 * Validation rules:
 * - Hierarchy level must be between 1 and 100 (0 reserved for super_admin)
 * - Slug must be lowercase alphanumeric with hyphens
 * - Permissions must be a non-empty array of strings
 *
 * @returns The validated RoleDefinition array
 */
export function defineCustomRoles(
  roles: CustomRoleDefinition[],
): RoleDefinition[] {
  const result: RoleDefinition[] = [];

  for (const role of roles) {
    // Validate hierarchy level
    if (role.hierarchyLevel < 1 || role.hierarchyLevel > 100) {
      throw new Error(
        `Hierarchy level must be between 1 and 100. Got ${role.hierarchyLevel} for role "${role.slug}".`,
      );
    }

    // Validate slug format
    if (!SLUG_PATTERN.test(role.slug)) {
      throw new Error(
        `Invalid slug format: "${role.slug}". Must be lowercase alphanumeric with hyphens.`,
      );
    }

    // Validate permissions
    if (!Array.isArray(role.permissions) || role.permissions.length === 0) {
      throw new Error(
        `Permissions must be a non-empty array of strings for role "${role.slug}".`,
      );
    }

    const roleDef: RoleDefinition = {
      slug: role.slug,
      name: role.name,
      hierarchyLevel: role.hierarchyLevel,
      permissions: role.permissions,
    };

    customRoleRegistry.set(role.slug, roleDef);
    result.push(roleDef);
  }

  return result;
}
