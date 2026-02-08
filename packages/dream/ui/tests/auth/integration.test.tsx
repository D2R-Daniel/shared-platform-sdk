import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { AuthLayout } from '../../src/auth/auth-layout';
import { LoginForm } from '../../src/auth/login-form';
import { renderWithProviders } from '../../src/testing';

describe('Auth Integration', () => {
  it('renders branded login page end-to-end', () => {
    renderWithProviders(
      <AuthLayout title="Welcome" description="Sign in to continue">
        <LoginForm providers={['credentials', 'google']} />
      </AuthLayout>,
      { branding: { productName: 'Dream Team' } },
    );
    expect(screen.getByText('Dream Team')).toBeInTheDocument();
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText('Sign in to continue')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText(/Google/)).toBeInTheDocument();
  });

  it('renders login page with branding logo', () => {
    renderWithProviders(
      <AuthLayout title="Welcome">
        <LoginForm />
      </AuthLayout>,
      { branding: { productName: 'TestApp', logo: '/test-logo.png' } },
    );
    expect(screen.getByRole('img')).toHaveAttribute('src', '/test-logo.png');
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });

  it('renders login page with slots', () => {
    renderWithProviders(
      <AuthLayout title="Welcome">
        <LoginForm
          slots={{
            footer: <p>Don&apos;t have an account? Sign up</p>,
          }}
        />
      </AuthLayout>,
    );
    expect(screen.getByText('Welcome')).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account/)).toBeInTheDocument();
  });
});
