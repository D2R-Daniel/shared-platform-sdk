import { z } from 'zod';

export const userStatusSchema = z.enum(['active', 'suspended', 'deleted']);

export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().max(255),
  name: z.string().min(1).max(255),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  avatarUrl: z.string().url().optional(),
  status: userStatusSchema,
  emailVerified: z.boolean(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const userCreateSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(255),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  avatarUrl: z.string().url().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  avatarUrl: z.string().url().optional(),
  status: userStatusSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});
