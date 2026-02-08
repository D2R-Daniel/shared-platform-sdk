import { z } from 'zod';

export const permissionStringSchema = z.string().regex(/^(\*|[a-z_]+:[a-z_*]+(:[a-z_]+)?)$/);

export const roleSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  description: z.string().max(500).optional(),
  hierarchyLevel: z.number().int().min(0).max(100),
  isBuiltIn: z.boolean(),
  isActive: z.boolean(),
  organizationId: z.string().uuid().nullable(),
  permissions: z.array(z.string()),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const roleCreateSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  description: z.string().max(500).optional(),
  hierarchyLevel: z.number().int().min(1).max(100),
  permissions: z.array(z.string()),
  organizationId: z.string().uuid().optional(),
});
