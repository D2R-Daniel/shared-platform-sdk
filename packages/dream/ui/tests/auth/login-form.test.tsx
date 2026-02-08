import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../../src/auth/login-form';
import { renderWithProviders } from '../../src/testing';

describe('LoginForm', () => {
  it('renders email and password fields', () => {
    renderWithProviders(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    renderWithProviders(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/email/i), 'not-email');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });

  it('shows validation error for empty password', async () => {
    renderWithProviders(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  it('calls onSuccess on valid submission', async () => {
    const onSuccess = vi.fn();
    renderWithProviders(<LoginForm onSuccess={onSuccess} />);
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'test@example.com', password: 'password123' }),
      );
    });
  });

  it('renders social login buttons when providers configured', () => {
    renderWithProviders(<LoginForm providers={['credentials', 'google']} />);
    expect(screen.getByText(/Google/)).toBeInTheDocument();
  });

  it('renders custom slot content', () => {
    renderWithProviders(
      <LoginForm slots={{ footer: <div>Custom footer</div> }} />,
    );
    expect(screen.getByText('Custom footer')).toBeInTheDocument();
  });

  it('renders beforeFields slot', () => {
    renderWithProviders(
      <LoginForm slots={{ beforeFields: <div>Before fields</div> }} />,
    );
    expect(screen.getByText('Before fields')).toBeInTheDocument();
  });

  it('renders afterFields slot', () => {
    renderWithProviders(
      <LoginForm slots={{ afterFields: <div>After fields</div> }} />,
    );
    expect(screen.getByText('After fields')).toBeInTheDocument();
  });

  it('accepts className', () => {
    const { container } = renderWithProviders(
      <LoginForm className="custom" />,
    );
    expect(container.firstChild).toHaveClass('custom');
  });
});
