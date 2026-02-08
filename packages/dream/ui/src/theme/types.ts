import type { ReactNode } from 'react';
import type { ApiAdapter } from '../lib/api-adapter';

export interface BrandingConfig {
  logo?: string;
  productName?: string;
  supportUrl?: string;
  termsUrl?: string;
  privacyUrl?: string;
}

export interface DreamUIError {
  component: string;
  errorType: string;
  action: string;
  error: Error;
}

export interface DreamUIContextValue {
  apiAdapter: ApiAdapter;
  branding: BrandingConfig;
  onError: (error: DreamUIError) => void;
}

export interface DreamUIProviderProps {
  children: ReactNode;
  apiAdapter: ApiAdapter;
  branding?: BrandingConfig;
  onError?: (error: DreamUIError) => void;
}
