import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { SHOPEE_AUTH_URL, getRedirectUri, SHOPEE_SCOPES } from '@/lib/shopee/constants';
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

    let partnerId = process.env.SHOPEE_APP_ID;
    // Bypassing strict check for local development or pending Shopee approval
    if (!partnerId || partnerId === '123456' || partnerId.includes('YOUR_')) {
      console.warn('[Dev] Using fallback Shopee App ID: 123456');
      partnerId = '123456';
    }

    const state = generateOAuthState();
    const redirectUri = getRedirectUri();
    const scope = SHOPEE_SCOPES.join(' ');

    const authUrl = new URL(SHOPEE_AUTH_URL);
    authUrl.searchParams.set('partner_id', partnerId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('scope', scope);

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
