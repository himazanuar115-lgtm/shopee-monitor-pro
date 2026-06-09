import crypto from 'crypto';

/**
 * Generate HMAC-SHA256 signature for Shopee API requests.
 * Shopee uses `partner_id + api_path + timestamp + access_token + body` signed with partner_key.
 */
export function generateShopeeSignature(
  partnerId: string,
  apiPath: string,
  timestamp: number,
  accessToken: string,
  body: string = '',
): string {
  const baseString = `${partnerId}${apiPath}${timestamp}${accessToken}${body}`;

  const partnerKey = process.env.SHOPEE_APP_SECRET;
  if (!partnerKey) {
    throw new Error('SHOPEE_APP_SECRET is not set');
  }

  return crypto.createHmac('sha256', partnerKey).update(baseString).digest('hex');
}

/**
 * Generate a cryptographically secure random state parameter for OAuth CSRF protection.
 */
export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify that a received OAuth state matches what we stored.
 * Uses timing-safe comparison to prevent timing attacks.
 */
export function verifyOAuthState(received: string, stored: string): boolean {
  if (received.length !== stored.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(received, 'utf-8'), Buffer.from(stored, 'utf-8'));
}
