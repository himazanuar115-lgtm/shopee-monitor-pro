// Shopee Open Platform v2 API base URLs
// Documentation: https://open.shopee.com

export const SHOPEE_API_BASE_URL = 'https://partner.shopeemobile.com';

export const SHOPEE_AUTH_URL = 'https://partner.shopeemobile.com/api/v2/shop/auth_partner';

// The path Shopee will callback to after user grants/denies authorization
export function getRedirectUri(): string {
  const base = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  return `${base}/api/shopee/callback`;
}

// Number of seconds before token expiry to trigger a proactive refresh
export const TOKEN_REFRESH_THRESHOLD_SECONDS = 300; // 5 minutes

// Scopes requested from Shopee
export const SHOPEE_SCOPES = [
  'shopee:merchant:read',
  'shopee:order:read',
  'shopee:order:write',
  'shopee:product:read',
  'shopee:product:write',
  'shopee:conversation:read',
  'shopee:conversation:write',
];
