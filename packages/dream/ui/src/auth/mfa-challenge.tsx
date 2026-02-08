'use client';

import React, { useState } from 'react';
import { Input } from '../primitives/input';
import { Button } from '../primitives/button';
import { Label } from '../primitives/label';
import { useDreamUI } from '../theme/use-dream-ui';
import { cn } from '../lib/cn';

export interface MfaChallengeProps {
  method?: 'totp';
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function MfaChallenge({
  method = 'totp',
  onSuccess,
  onError,
  className,
}: MfaChallengeProps) {
  const { apiAdapter } = useDreamUI();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  async function handleVerify() {
    if (!code) {
      setError('Please enter a code');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      await apiAdapter.verifyMfaSetup(code);
      onSuccess?.();
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Invalid code');
      setError(errorObj.message);
      onError?.(errorObj);
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-semibold">Two-factor authentication</h3>
      <p className="text-sm text-muted-foreground">
        {useBackupCode
          ? 'Enter one of your backup codes to verify your identity.'
          : 'Enter the 6-digit code from your authenticator app.'}
      </p>

      <div className="space-y-2">
        <Label htmlFor="mfa-challenge-code">
          {useBackupCode ? 'Backup code' : 'Verification code'}
        </Label>
        <Input
          id="mfa-challenge-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={useBackupCode ? 'Enter backup code' : '000000'}
          maxLength={useBackupCode ? 20 : 6}
          autoComplete="one-time-code"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <Button onClick={handleVerify} disabled={isVerifying} className="w-full">
        {isVerifying ? 'Verifying...' : 'Verify'}
      </Button>

      <button
        type="button"
        onClick={() => {
          setUseBackupCode(!useBackupCode);
          setCode('');
          setError(null);
        }}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
      >
        {useBackupCode ? 'Use authenticator code' : 'Use a backup code'}
      </button>
    </div>
  );
}
