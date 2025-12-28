/**
 * Webhook signature utilities.
 */

import { createHmac, timingSafeEqual } from 'crypto';
import { InvalidSignatureError } from './errors';

/**
 * Generate HMAC-SHA256 signature for webhook payload.
 *
 * @param payload - The raw JSON payload (string or Buffer)
 * @param secret - The webhook secret key
 * @param timestamp - Optional Unix timestamp (defaults to current time)
 * @returns Tuple of [signature, timestamp]
 */
export function generateSignature(
  payload: string | Buffer,
  secret: string,
  timestamp?: number
): [string, number] {
  const ts = timestamp ?? Math.floor(Date.now() / 1000);

  const payloadBuffer =
    typeof payload === 'string' ? Buffer.from(payload, 'utf-8') : payload;

  // Create signed payload: timestamp.payload
  const signedPayload = Buffer.concat([
    Buffer.from(`${ts}.`, 'utf-8'),
    payloadBuffer,
  ]);

  // Generate HMAC-SHA256 signature
  const hmac = createHmac('sha256', secret);
  hmac.update(signedPayload);
  const signature = hmac.digest('hex');

  return [`sha256=${signature}`, ts];
}

/**
 * Verify HMAC-SHA256 signature for webhook payload.
 *
 * @param payload - The raw JSON payload (string or Buffer)
 * @param signature - The signature from X-Webhook-Signature header
 * @param secret - The webhook secret key
 * @param timestamp - The timestamp from X-Webhook-Timestamp header
 * @param toleranceSeconds - Maximum age of request in seconds (default 5 minutes)
 * @returns True if signature is valid
 * @throws InvalidSignatureError if signature is invalid or request is too old
 */
export function verifySignature(
  payload: string | Buffer,
  signature: string,
  secret: string,
  timestamp: number,
  toleranceSeconds: number = 300
): boolean {
  // Check timestamp tolerance
  const currentTime = Math.floor(Date.now() / 1000);
  if (Math.abs(currentTime - timestamp) > toleranceSeconds) {
    throw new InvalidSignatureError(
      'Request timestamp is too old or in the future'
    );
  }

  const payloadBuffer =
    typeof payload === 'string' ? Buffer.from(payload, 'utf-8') : payload;

  // Recreate the signed payload
  const signedPayload = Buffer.concat([
    Buffer.from(`${timestamp}.`, 'utf-8'),
    payloadBuffer,
  ]);

  // Generate expected signature
  const hmac = createHmac('sha256', secret);
  hmac.update(signedPayload);
  const expectedSignature = `sha256=${hmac.digest('hex')}`;

  // Constant-time comparison to prevent timing attacks
  const sigBuffer = Buffer.from(signature, 'utf-8');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');

  if (sigBuffer.length !== expectedBuffer.length) {
    throw new InvalidSignatureError('Signature mismatch');
  }

  if (!timingSafeEqual(sigBuffer, expectedBuffer)) {
    throw new InvalidSignatureError('Signature mismatch');
  }

  return true;
}

/**
 * Parse the X-Webhook-Signature header value.
 *
 * @param header - The header value (e.g., "sha256=abc123...")
 * @returns The signature value
 */
export function parseSignatureHeader(header: string): string {
  if (header.startsWith('sha256=')) {
    return header;
  }
  return `sha256=${header}`;
}
