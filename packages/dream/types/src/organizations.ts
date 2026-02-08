export type OrganizationStatus = 'active' | 'suspended' | 'archived';
export type Currency = 'USD' | 'INR' | 'EUR' | 'GBP';
export type Region = 'us-east' | 'eu-west' | 'in-mumbai' | 'ap-singapore';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  planTier: string;
  logoUrl?: string;
  primaryColor?: string;
  domain?: string;
  currency: Currency;
  region: Region;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrgCreateInput {
  name: string;
  slug: string;
  planTier?: string;
  logoUrl?: string;
  primaryColor?: string;
  domain?: string;
  currency?: Currency;
  region?: Region;
  metadata?: Record<string, unknown>;
}

export interface OrgUpdateInput {
  name?: string;
  logoUrl?: string;
  primaryColor?: string;
  domain?: string;
  planTier?: string;
  metadata?: Record<string, unknown>;
}
