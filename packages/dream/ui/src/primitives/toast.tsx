'use client';

import React from 'react';
import { Toaster as SonnerToaster, toast } from 'sonner';

/* Cast Sonner Toaster to work around React 18/19 type mismatch */
const SonnerToasterCompat = SonnerToaster as unknown as React.FC<{
  position?: string;
  toastOptions?: {
    duration?: number;
    classNames?: Record<string, string>;
  };
}>;

function Toaster(): React.JSX.Element {
  return (
    <SonnerToasterCompat
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: 'border bg-background text-foreground shadow-lg',
          error: 'border-destructive bg-destructive text-destructive-foreground',
        },
      }}
    />
  );
}

export { Toaster, toast };
