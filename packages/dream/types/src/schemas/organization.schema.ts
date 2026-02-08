import { z } from 'zod';

export const orgStatusSchema = z.enum(['active', 'suspended', 'archived']);
export const currencySchema = z.enum(['USD', 'INR', 'EUR', 'GBP']);
export const regionSchema = z.enum(['us-east', 'eu-west', 'in-mumbai', 'ap-singapore']);

export const organizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(63).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  status: orgStatusSchema,
  planTier: z.string(),
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  domain: z.string().optional(),
  currency: currencySchema,
  region: regionSchema,
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const orgCreateSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(63).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  planTier: z.string().optional(),
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  domain: z.string().optional(),
  currency: currencySchema.optional(),
  region: regionSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
});
