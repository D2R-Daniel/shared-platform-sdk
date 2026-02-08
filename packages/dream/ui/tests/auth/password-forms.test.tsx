import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ForgotPasswordForm } from '../../src/auth/forgot-password-form';
import { ResetPasswordForm } from '../../src/auth/reset-password-form';
import { renderWithProviders } from '../../src/testing';

describe('ForgotPasswordForm', () => {
  it('renders email field and submit button', () => {
    renderWithProviders(<ForgotPasswordForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    renderWithProviders(<ForgotPasswordForm />);
    await userEvent.type(screen.getByLabelText(/email/i), 'not-email');
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });

  it('calls onSuccess on valid submission', async () => {
    const onSuccess = vi.fn();
    renderWithProviders(<ForgotPasswordForm onSuccess={onSuccess} />);
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('accepts className', () => {
    const { container } = renderWithProviders(
      <ForgotPasswordForm className="custom" />,
    );
    expect(container.firstChild).toHaveClass('custom');
  });
});

describe('ResetPasswordForm', () => {
  it('renders new password and confirm password fields', () => {
    renderWithProviders(<ResetPasswordForm token="test-token" />);
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  it('shows validation error for short password', async () => {
    renderWithProviders(<ResetPasswordForm token="test-token" />);
    await userEvent.type(screen.getByLabelText(/new password/i), 'short');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'short');
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
    expect(await screen.findByText(/at least 8/i)).toBeInTheDocument();
  });

  it('shows validation error when passwords do not match', async () => {
    renderWithProviders(<ResetPasswordForm token="test-token" />);
    await userEvent.type(screen.getByLabelText(/new password/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'different');
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
    expect(await screen.findByText(/passwords don.t match/i)).toBeInTheDocument();
  });

  it('calls onSuccess on valid submission', async () => {
    const onSuccess = vi.fn();
    renderWithProviders(<ResetPasswordForm token="test-token" onSuccess={onSuccess} />);
    await userEvent.type(screen.getByLabelText(/new password/i), 'password123');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('accepts className', () => {
    const { container } = renderWithProviders(
      <ResetPasswordForm token="test-token" className="custom" />,
    );
    expect(container.firstChild).toHaveClass('custom');
  });
});
