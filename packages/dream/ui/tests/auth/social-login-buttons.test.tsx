import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SocialLoginButtons } from '../../src/auth/social-login-buttons';

describe('SocialLoginButtons', () => {
  it('renders buttons for configured providers', () => {
    render(<SocialLoginButtons providers={['google', 'azure-entra']} />);
    expect(screen.getByText(/Google/)).toBeInTheDocument();
    expect(screen.getByText(/Microsoft/)).toBeInTheDocument();
  });

  it('renders SSO button for generic-oidc', () => {
    render(<SocialLoginButtons providers={['generic-oidc']} />);
    expect(screen.getByText(/SSO/)).toBeInTheDocument();
  });

  it('renders vertically by default', () => {
    const { container } = render(
      <SocialLoginButtons providers={['google', 'azure-entra']} />,
    );
    expect(container.firstChild).toHaveClass('flex-col');
  });

  it('renders horizontally when specified', () => {
    const { container } = render(
      <SocialLoginButtons providers={['google', 'azure-entra']} layout="horizontal" />,
    );
    expect(container.firstChild).toHaveClass('flex-row');
  });

  it('calls onProviderClick when button is clicked', async () => {
    const onProviderClick = vi.fn();
    render(
      <SocialLoginButtons
        providers={['google']}
        onProviderClick={onProviderClick}
      />,
    );
    await userEvent.click(screen.getByText(/Google/));
    expect(onProviderClick).toHaveBeenCalledWith('google');
  });

  it('accepts className', () => {
    const { container } = render(
      <SocialLoginButtons providers={['google']} className="custom" />,
    );
    expect(container.firstChild).toHaveClass('custom');
  });
});
