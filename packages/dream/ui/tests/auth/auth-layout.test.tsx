import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { AuthLayout } from '../../src/auth/auth-layout';
import { renderWithProviders } from '../../src/testing';

describe('AuthLayout', () => {
  it('renders title and description', () => {
    renderWithProviders(
      <AuthLayout title="Sign in" description="Welcome back">
        <div>Form content</div>
      </AuthLayout>,
    );
    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('Form content')).toBeInTheDocument();
  });

  it('renders children', () => {
    renderWithProviders(
      <AuthLayout>
        <div>Child content</div>
      </AuthLayout>,
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders product branding from provider', () => {
    renderWithProviders(
      <AuthLayout title="Sign in">
        <div>Form</div>
      </AuthLayout>,
      { branding: { productName: 'Dream Team', logo: '/logo.svg' } },
    );
    expect(screen.getByRole('img')).toHaveAttribute('src', '/logo.svg');
  });

  it('renders productName when logo is provided', () => {
    renderWithProviders(
      <AuthLayout title="Sign in">
        <div>Form</div>
      </AuthLayout>,
      { branding: { productName: 'Dream Team', logo: '/logo.svg' } },
    );
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Dream Team');
  });

  it('renders productName text when no logo', () => {
    renderWithProviders(
      <AuthLayout>
        <div>Form</div>
      </AuthLayout>,
      { branding: { productName: 'Dream Team' } },
    );
    expect(screen.getByText('Dream Team')).toBeInTheDocument();
  });

  it('accepts className', () => {
    const { container } = renderWithProviders(
      <AuthLayout title="Test" className="custom">
        <div>Form</div>
      </AuthLayout>,
    );
    expect(container.firstChild).toHaveClass('custom');
  });
});
