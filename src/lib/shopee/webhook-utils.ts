import crypto from 'crypto';

/**
 * Verifies the authenticity of an incoming Shopee webhook request using HMAC-SHA256.
 * According to Shopee v2 webhook specifications, the signature is calculated using
 * HMAC-SHA256 with the partner_key (SHOPEE_APP_SECRET) and the raw request body.
 *
 * @param rawBody The raw string body of the incoming webhook request.
 * @param signature The signature provided in the 'X-Shopee-Signature' header.
 * @returns True if the signature is valid, false otherwise.
 */
export function verifyShopeeSignature(rawBody: string, signature: string): boolean {
  const partnerKey = process.env.SHOPEE_APP_SECRET;

  if (!partnerKey) {
    console.warn('[Webhook Security] SHOPEE_APP_SECRET is not configured. Webhook signature verification skipped.');
    // In a production environment, you might want to throw an error or
    // explicitly return false if the secret is missing, as it's a critical security component.
    return false;
  }

  // Calculate the expected signature
  const expectedSignature = crypto
    .createHmac('sha256', partnerKey)
    .update(rawBody)
    .digest('hex');

  // Compare the expected signature with the received signature in a timing-safe manner
  return crypto.timingSafeEqual(Buffer.from(expectedSignature, 'utf-8'), Buffer.from(signature, 'utf-8'));
}