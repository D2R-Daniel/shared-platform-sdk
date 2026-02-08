import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../src/testing';
import { useDreamUI } from '../../src/theme/use-dream-ui';

function TestComponent() {
  const { branding } = useDreamUI();
  return <span data-testid="name">{branding.productName ?? 'default'}</span>;
}

describe('renderWithProviders', () => {
  it('wraps component in DreamUIProvider with defaults', () => {
    renderWithProviders(<TestComponent />);
    expect(screen.getByTestId('name')).toHaveTextContent('default');
  });

  it('accepts custom branding', () => {
    renderWithProviders(<TestComponent />, {
      branding: { productName: 'TestProd' },
    });
    expect(screen.getByTestId('name')).toHaveTextContent('TestProd');
  });
});
