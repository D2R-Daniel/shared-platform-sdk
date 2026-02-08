'use client';

import { createContext, useContext } from 'react';
import type { DreamUIContextValue } from './types';

export const DreamUIContext = createContext<DreamUIContextValue | null>(null);

export function useDreamUI(): DreamUIContextValue {
  const ctx = useContext(DreamUIContext);
  if (!ctx) {
    throw new Error('useDreamUI must be used within a DreamUIProvider');
  }
  return ctx;
}
