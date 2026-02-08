'use client';

import React, { useMemo } from 'react';
import { DreamUIContext } from './use-dream-ui';
import type { DreamUIProviderProps, DreamUIContextValue } from './types';

export function DreamUIProvider({
  children,
  apiAdapter,
  branding = {},
  onError,
}: DreamUIProviderProps): React.JSX.Element {
  const value = useMemo<DreamUIContextValue>(
    () => ({
      apiAdapter,
      branding,
      onError: onError ?? (() => {}),
    }),
    [apiAdapter, branding, onError],
  );

  return <DreamUIContext.Provider value={value}>{children}</DreamUIContext.Provider>;
}
