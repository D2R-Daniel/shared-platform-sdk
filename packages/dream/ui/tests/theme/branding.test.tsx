import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DreamUIProvider } from '../../src/theme/provider';
import { useDreamUI } from '../../src/theme/use-dream-ui';
import type { ApiAdapter } from '../../src/lib/api-adapter';

const mockAdapter = {} as ApiAdapter;

function BrandingConsumer() {
  const { branding } = useDreamUI();
  return (
    <div>
      <span data-testid="logo">{branding.logo ?? 'no-logo'}</span>
      <span data-testid="name">{branding.productName ?? 'no-name'}</span>
      <span data-testid="support">{branding.supportUrl ?? 'no-support'}</span>
      <span data-testid="terms">{branding.termsUrl ?? 'no-terms'}</span>
      <span data-testid="privacy">{branding.privacyUrl ?? 'no-privacy'}</span>
    </div>
  );
}

describe('Branding propagation', () => {
  it('propagates all branding fields from provider', () => {
    render(
      <DreamUIProvider
        apiAdapter={mockAdapter}
        branding={{
          logo: '/logo.svg',
          productName: 'Dream Team',
          supportUrl: 'https://support.example.com',
          termsUrl: 'https://terms.example.com',
          privacyUrl: 'https://privacy.example.com',
        }}
      >
        <BrandingConsumer />
      </DreamUIProvider>
    );
    expect(screen.getByTestId('logo')).toHaveTextContent('/logo.svg');
    expect(screen.getByTestId('name')).toHaveTextContent('Dream Team');
    expect(screen.getByTestId('support')).toHaveTextContent('https://support.example.com');
    expect(screen.getByTestId('terms')).toHaveTextContent('https://terms.example.com');
    expect(screen.getByTestId('privacy')).toHaveTextContent('https://privacy.example.com');
  });

  it('uses empty defaults when no branding provided', () => {
    render(
      <DreamUIProvider apiAdapter={mockAdapter}>
        <BrandingConsumer />
      </DreamUIProvider>
    );
    expect(screen.getByTestId('logo')).toHaveTextContent('no-logo');
    expect(screen.getByTestId('name')).toHaveTextContent('no-name');
  });
});
