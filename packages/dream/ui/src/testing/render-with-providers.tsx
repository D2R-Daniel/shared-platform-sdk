import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { MockApiProvider, type MockApiProviderProps } from './mock-api-provider';

type ProviderOptions = Omit<MockApiProviderProps, 'children'>;

export function renderWithProviders(
  ui: React.ReactElement,
  providerOptions?: ProviderOptions,
  renderOptions?: Omit<RenderOptions, 'wrapper'>,
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <MockApiProvider {...providerOptions}>{children}</MockApiProvider>;
  }
  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
