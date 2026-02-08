'use client';

import React, { useEffect, useState } from 'react';
import { Input } from '../primitives/input';
import { Button } from '../primitives/button';
import { Label } from '../primitives/label';
import { useDreamUI } from '../theme/use-dream-ui';
import { cn } from '../lib/cn';

interface MfaSetupData {
  qrCodeUrl: string;
  secret: string;
}

export interface MfaSetupProps extends React.HTMLAttributes<HTMLDivElement> {
  method?: 'totp';
  onComplete?: (backupCodes: string[]) => void;
  onSkip?: () => void;
}

export function MfaSetup({
  method = 'totp',
  onComplete,
  onSkip,
  className,
  ...props
}: MfaSetupProps) {
  const { apiAdapter } = useDreamUI();
  const [setupData, setSetupData] = useState<MfaSetupData | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);

  useEffect(() => {
    apiAdapter.initiateMfaSetup().then((data) => {
      setSetupData(data as MfaSetupData);
    });
  }, [apiAdapter]);

  async function handleVerify() {
    if (!code || code.length < 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const result = (await apiAdapter.verifyMfaSetup(code)) as {
        backupCodes: string[];
      };
      setBackupCodes(result.backupCodes);
      onComplete?.(result.backupCodes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  }

  if (backupCodes) {
    return (
      <div className={cn('space-y-4', className)} {...props}>
        <h3 className="text-lg font-semibold">Backup codes</h3>
        <p className="text-sm text-muted-foreground">
          Save these backup codes in a safe place. You can use them to access your account if you
          lose your authenticator device.
        </p>
        <div className="rounded-md border p-4 font-mono text-sm">
          {backupCodes.map((bcode) => (
            <div key={bcode}>{bcode}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)} {...props}>
      <h3 className="text-lg font-semibold">Set up two-factor authentication</h3>
      <p className="text-sm text-muted-foreground">
        Scan the QR code below with your authenticator app, then enter the verification code.
      </p>

      {setupData && (
        <div className="space-y-4">
          <div className="flex justify-center rounded-md border p-4">
            <img src={setupData.qrCodeUrl} alt="QR Code" className="h-48 w-48" />
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Manual key: <code className="font-mono">{setupData.secret}</code>
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="mfa-code">Verification code</Label>
        <Input
          id="mfa-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="000000"
          maxLength={6}
          autoComplete="one-time-code"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <div className="flex gap-2">
        <Button onClick={handleVerify} disabled={isVerifying} className="flex-1">
          {isVerifying ? 'Verifying...' : 'Verify'}
        </Button>
        {onSkip && (
          <Button variant="outline" onClick={onSkip} type="button">
            Skip
          </Button>
        )}
      </div>
    </div>
  );
}
