'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../primitives/card';
import { useDreamUI } from '../theme/use-dream-ui';
import { cn } from '../lib/cn';

export interface AuthLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, description, children, className, ...props }: AuthLayoutProps) {
  const { branding } = useDreamUI();

  return (
    <div className={cn('flex min-h-screen items-center justify-center p-4', className)} {...props}>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          {branding.logo && (
            <div className="flex justify-center mb-4">
              <img src={branding.logo} alt={branding.productName ?? 'Logo'} className="h-10" />
            </div>
          )}
          {branding.productName && !branding.logo && (
            <p className="text-lg font-semibold text-muted-foreground mb-2">{branding.productName}</p>
          )}
          {title && <CardTitle className="text-2xl">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
