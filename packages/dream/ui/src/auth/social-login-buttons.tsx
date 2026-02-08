'use client';

import React from 'react';
import { Button } from '../primitives/button';
import { cn } from '../lib/cn';

export interface SocialLoginButtonsProps extends React.HTMLAttributes<HTMLDivElement> {
  providers: Array<'google' | 'azure-entra' | 'generic-oidc'>;
  layout?: 'vertical' | 'horizontal';
  callbackUrl?: string;
  onProviderClick?: (provider: string) => void;
}

const PROVIDER_CONFIG = {
  google: { label: 'Continue with Google', icon: 'G' },
  'azure-entra': { label: 'Continue with Microsoft', icon: 'M' },
  'generic-oidc': { label: 'Continue with SSO', icon: 'S' },
} as const;

export function SocialLoginButtons({
  providers,
  layout = 'vertical',
  callbackUrl,
  onProviderClick,
  className,
  ...props
}: SocialLoginButtonsProps) {
  return (
    <div
      className={cn(
        'flex gap-2',
        layout === 'vertical' ? 'flex-col' : 'flex-row',
        className,
      )}
      {...props}
    >
      {providers.map((provider) => {
        const config = PROVIDER_CONFIG[provider];
        return (
          <Button
            key={provider}
            variant="outline"
            className="w-full"
            onClick={() => onProviderClick?.(provider)}
            type="button"
          >
            <span className="mr-2 font-bold">{config.icon}</span>
            {config.label}
          </Button>
        );
      })}
    </div>
  );
}
