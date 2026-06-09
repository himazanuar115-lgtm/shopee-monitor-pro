import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import crypto from 'crypto';
import { getRedirectUri } from '@/lib/shopee/constants';
import { generateOAuthState } from '@/lib/shopee/crypto';

/**
 * GET /api/shopee/connect
 *
 * Initiates the Shopee OAuth flow.
 * Generates a CSRF state token, stores it in an httpOnly cookie,
 * and redirects the user to Shopee's authorization page.
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // --- Dev Mock Bypass ---
    if (process.env.NODE_ENV === 'development') {
      console.warn("[Dev Mock Activated] Bypassing real Shopee server requests. Redirecting to local mock callback.");
      const state = generateOAuthState(); // Generate a real state for CSRF check
      const redirectUri = getRedirectUri();
      const mockCallbackUrl = new URL(redirectUri);
      mockCallbackUrl.searchParams.set('code', 'mock_auth_code_for_dev');
      mockCallbackUrl.searchParams.set('state', state);
      mockCallbackUrl.searchParams.set('shop_id', '99'); // Mock shop ID for local dev

      const response = NextResponse.redirect(mockCallbackUrl.toString());
      response.cookies.set('shopee_oauth_state', state, {
        httpOnly: true, secure: false, sameSite: 'lax', maxAge: 600, path: '/',
      });
      return response;
    }
    // --- End Dev Mock Bypass ---

    let partnerId = process.env.SHOPEE_APP_ID;
    // Bypassing strict check for local development or pending Shopee approval
    if (!partnerId || partnerId === '123456' || partnerId.includes('YOUR_')) {
      partnerId = '123456';
    }

    const partnerKey = process.env.SHOPEE_APP_SECRET || "dummy_secret";
    const state = generateOAuthState();
    const redirectUri = getRedirectUri();
    
    // Shopee V2 Auth URL requires signature and timestamp
    const path = "/api/v2/shop/auth_partner";
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Base string: partner_id + path + timestamp
    const baseString = `${partnerId}${path}${timestamp}`;
    const sign = crypto.createHmac('sha256', partnerKey).update(baseString).digest('hex');

    // Build the correct V2 Auth URL
    const authUrl = new URL('https://partner.test-stable.shopeemobile.com/api/v2/shop/auth_partner');
    authUrl.searchParams.set('partner_id', partnerId);
    authUrl.searchParams.set('timestamp', timestamp.toString());
    authUrl.searchParams.set('sign', sign);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);

    const response = NextResponse.redirect(authUrl.toString());

    // Store state in an httpOnly cookie for CSRF verification on callback
    response.cookies.set('shopee_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[shopee-connect] Error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Shopee OAuth' },
      { status: 500 },
    );
  }
}
