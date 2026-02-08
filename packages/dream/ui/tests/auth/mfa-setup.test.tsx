import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MfaSetup } from '../../src/auth/mfa-setup';
import { renderWithProviders } from '../../src/testing';

describe('MfaSetup', () => {
  it('renders QR code area and verification input', () => {
    renderWithProviders(<MfaSetup />, {
      adapter: {
        initiateMfaSetup: vi.fn().mockResolvedValue({
          qrCodeUrl: 'https://example.com/qr.png',
          secret: 'JBSWY3DPEHPK3PXP',
        }),
      },
    });
    expect(screen.getByText(/set up/i)).toBeInTheDocument();
  });

  it('shows verification code input', async () => {
    renderWithProviders(<MfaSetup />, {
      adapter: {
        initiateMfaSetup: vi.fn().mockResolvedValue({
          qrCodeUrl: 'https://example.com/qr.png',
          secret: 'JBSWY3DPEHPK3PXP',
        }),
      },
    });
    await waitFor(() => {
      expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
    });
  });

  it('calls onComplete after successful verification', async () => {
    const onComplete = vi.fn();
    const backupCodes = ['code1', 'code2', 'code3'];
    renderWithProviders(<MfaSetup onComplete={onComplete} />, {
      adapter: {
        initiateMfaSetup: vi.fn().mockResolvedValue({
          qrCodeUrl: 'https://example.com/qr.png',
          secret: 'JBSWY3DPEHPK3PXP',
        }),
        verifyMfaSetup: vi.fn().mockResolvedValue({ backupCodes }),
      },
    });

    await waitFor(() => {
      expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
    });

    await userEvent.type(screen.getByLabelText(/verification code/i), '123456');
    await userEvent.click(screen.getByRole('button', { name: /verify/i }));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledWith(backupCodes);
    });
  });

  it('renders skip button when onSkip is provided', () => {
    renderWithProviders(<MfaSetup onSkip={() => {}} />, {
      adapter: {
        initiateMfaSetup: vi.fn().mockResolvedValue({
          qrCodeUrl: 'https://example.com/qr.png',
          secret: 'JBSWY3DPEHPK3PXP',
        }),
      },
    });
    expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
  });

  it('calls onSkip when skip button is clicked', async () => {
    const onSkip = vi.fn();
    renderWithProviders(<MfaSetup onSkip={onSkip} />, {
      adapter: {
        initiateMfaSetup: vi.fn().mockResolvedValue({
          qrCodeUrl: 'https://example.com/qr.png',
          secret: 'JBSWY3DPEHPK3PXP',
        }),
      },
    });
    await userEvent.click(screen.getByRole('button', { name: /skip/i }));
    expect(onSkip).toHaveBeenCalled();
  });

  it('accepts className', () => {
    const { container } = renderWithProviders(<MfaSetup className="custom" />, {
      adapter: {
        initiateMfaSetup: vi.fn().mockResolvedValue({
          qrCodeUrl: 'https://example.com/qr.png',
          secret: 'JBSWY3DPEHPK3PXP',
        }),
      },
    });
    expect(container.firstChild).toHaveClass('custom');
  });
});
