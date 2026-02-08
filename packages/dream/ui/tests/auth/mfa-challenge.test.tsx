import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MfaChallenge } from '../../src/auth/mfa-challenge';
import { renderWithProviders } from '../../src/testing';

describe('MfaChallenge', () => {
  it('renders 6-digit code input', () => {
    renderWithProviders(<MfaChallenge />);
    expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /verify/i })).toBeInTheDocument();
  });

  it('renders backup code toggle', () => {
    renderWithProviders(<MfaChallenge />);
    expect(screen.getByText(/backup code/i)).toBeInTheDocument();
  });

  it('shows backup code input when toggled', async () => {
    renderWithProviders(<MfaChallenge />);
    await userEvent.click(screen.getByText(/backup code/i));
    expect(screen.getByLabelText(/backup code/i)).toBeInTheDocument();
  });

  it('calls onSuccess after successful verification', async () => {
    const onSuccess = vi.fn();
    renderWithProviders(<MfaChallenge onSuccess={onSuccess} />, {
      adapter: {
        verifyMfaSetup: vi.fn().mockResolvedValue({}),
      },
    });
    await userEvent.type(screen.getByLabelText(/verification code/i), '123456');
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('is sealed - accepts className only, no slots prop', () => {
    const { container } = renderWithProviders(
      <MfaChallenge className="custom" />,
    );
    expect(container.firstChild).toHaveClass('custom');
  });

  it('shows error on invalid code', async () => {
    const onError = vi.fn();
    renderWithProviders(<MfaChallenge onError={onError} />, {
      adapter: {
        verifyMfaSetup: vi.fn().mockRejectedValue(new Error('Invalid code')),
      },
    });
    await userEvent.type(screen.getByLabelText(/verification code/i), '000000');
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid/i)).toBeInTheDocument();
    });
  });
});
