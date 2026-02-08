import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DreamUIProvider } from '../../src/theme/provider';
import { useDreamUI } from '../../src/theme/use-dream-ui';
import type { ApiAdapter } from '../../src/lib/api-adapter';

const mockAdapter = {} as ApiAdapter;

function TestConsumer() {
  const { branding, apiAdapter } = useDreamUI();
  return (
    <div>
      <span data-testid="product">{branding.productName ?? 'none'}</span>
      <span data-testid="has-adapter">{apiAdapter ? 'yes' : 'no'}</span>
    </div>
  );
}

describe('DreamUIProvider', () => {
  it('provides apiAdapter and default branding to children', () => {
    render(
      <DreamUIProvider apiAdapter={mockAdapter}>
        <TestConsumer />
      </DreamUIProvider>
    );
    expect(screen.getByTestId('product')).toHaveTextContent('none');
    expect(screen.getByTestId('has-adapter')).toHaveTextContent('yes');
  });

  it('provides custom branding', () => {
    render(
      <DreamUIProvider apiAdapter={mockAdapter} branding={{ productName: 'TestApp' }}>
        <TestConsumer />
      </DreamUIProvider>
    );
    expect(screen.getByTestId('product')).toHaveTextContent('TestApp');
  });

  it('throws when useDreamUI is used outside provider', () => {
    expect(() => render(<TestConsumer />)).toThrow(
      'useDreamUI must be used within a DreamUIProvider'
    );
  });
});
