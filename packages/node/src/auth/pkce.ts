/**
 * PKCE (Proof Key for Code Exchange) utilities.
 */

import { randomBytes, createHash } from 'node:crypto';
import { PKCEChallenge } from './types';

/**
 * Generate a cryptographically random code verifier (43-128 characters).
 */
export function generateCodeVerifier(length: number = 64): string {
  const buffer = randomBytes(length);
  return buffer
    .toString('base64url')
    .slice(0, length);
}

/**
 * Derive a code challenge from a code verifier using S256.
 */
export function generateCodeChallenge(codeVerifier: string): string {
  return createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
}

/**
 * Generate a full PKCE challenge pair.
 */
export function generatePKCEChallenge(): PKCEChallenge {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: 'S256',
  };
}
