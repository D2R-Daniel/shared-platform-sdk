import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DreamUIProvider } from '../../src/theme/provider';
import { useDreamUI } from '../../src/theme/use-dream-ui';
import type { ApiAdapter } from '../../src/lib/api-adapter';

const mockAdapter = {} as ApiAdapter;

function ThemedComponent() {
  const { branding } = useDreamUI();
  return (
    <div data-testid="themed" style={{ color: 'var(--dream-color-primary)' }}>
      {branding.productName ?? 'unbranded'}
    </div>
  );
}

describe('CSS Custom Properties Theming', () => {
  it('renders components with CSS custom property references', () => {
    const { getByTestId } = render(
      <DreamUIProvider apiAdapter={mockAdapter}>
        <ThemedComponent />
      </DreamUIProvider>
    );
    const el = getByTestId('themed');
    expect(el).toBeInTheDocument();
    expect(el.style.color).toBe('var(--dream-color-primary)');
  });

  it('applies branding from provider to components', () => {
    const { getByTestId } = render(
      <DreamUIProvider apiAdapter={mockAdapter} branding={{ productName: 'MyApp' }}>
        <ThemedComponent />
      </DreamUIProvider>
    );
    expect(getByTestId('themed')).toHaveTextContent('MyApp');
  });
});
