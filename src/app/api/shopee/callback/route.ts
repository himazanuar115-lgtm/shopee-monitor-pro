import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';
import { storeTokens } from '@/lib/shopee/token-manager';
import { verifyOAuthState } from '@/lib/shopee/crypto';

/**
 * GET /api/shopee/callback
 *
 * Handles the redirect from Shopee after the user grants/denies authorization.
 * 1. Verifies the CSRF state parameter against the stored cookie.
 * 2. Exchanges the authorization code for access/refresh tokens.
 * 3. Fetches shop info to get the shop name.
 * 4. Persists tokens via storeTokens().
 * 5. Creates or updates the Store record linked by shopeeShopId.
 * 6. Redirects to /stores.
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.redirect(
        new URL('/login?error=unauthorized', request.url),
      );
    }

    const userId = token.id as string;

    // --- Dev Mock Bypass ---
    if (process.env.NODE_ENV === 'development') {
      const url = new URL(request.url);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const shopIdParam = url.searchParams.get('shop_id');
      const storedState = request.cookies.get('shopee_oauth_state')?.value;

      // Check for mock parameters and valid state
      if (code === 'mock_auth_code_for_dev' && shopIdParam === '99' && verifyOAuthState(state || '', storedState || '')) {
        console.warn("[Dev Mock Activated] Bypassing real Shopee token exchange. Creating mock store connection.");

        const mockShopId = 99; // Consistent mock shop ID
        const mockShopName = "Bunda Store (Simulasi Local)";
        const mockAccessToken = "mock_access_token_dev";
        const mockRefreshToken = "mock_refresh_token_dev";
        const now = new Date();
        const accessTokenExpiresAt = new Date(now.getTime() + 3600 * 1000); // 1 hour
        const refreshTokenExpiresAt = new Date(now.getTime() + 365 * 24 * 3600 * 1000); // 1 year

        // Ensure a mock store exists for the user
        let store = await prisma.store.findFirst({
          where: { userId, shopeeShopId: mockShopId },
        });

        if (!store) {
          store = await prisma.store.create({
            data: {
              userId,
              name: mockShopName,
              shopeeId: `SHOP-${mockShopId}`, // Unique string ID for Shopee
              apiKey: 'mock_api_key_dev',
              apiSecret: 'mock_api_secret_dev',
              shopeeShopId: mockShopId,
              isConnected: true,
              status: 'ACTIVE',
              rating: 0,
              totalOrders: 0,
              totalRevenue: 0,
              totalProducts: 0,
              totalChats: 0,
              totalVisitors: 0,
              conversionRate: 0,
            },
          });
        } else {
          // Update existing mock store
          store = await prisma.store.update({
            where: { id: store.id },
            data: { name: mockShopName, isConnected: true, status: 'ACTIVE' },
          });
        }

        // Store mock tokens
        await storeTokens({
          userId, storeId: store.id, shopId: mockShopId, shopName: mockShopName,
          accessToken: mockAccessToken, refreshToken: mockRefreshToken,
          accessTokenExpiresAt, refreshTokenExpiresAt,
        });

        console.log(`[Dev Mock] Successfully connected mock shop ${mockShopId} for user ${userId}`);
        const mockResponse = NextResponse.redirect(new URL('/stores?connected=true', request.url));
        mockResponse.cookies.set('shopee_oauth_state', '', { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 0, path: '/' });
        return mockResponse;
      }
    }
    // --- End Dev Mock Bypass ---

    // ── 1. Verify state ──
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const shopIdParam = url.searchParams.get('shop_id');

    const storedState = request.cookies.get('shopee_oauth_state')?.value;

    // Clear the state cookie regardless of outcome
    const response = NextResponse.redirect(new URL('/stores', request.url));
    response.cookies.set('shopee_oauth_state', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    // Handle user denial
    if (error) {
      const errorDesc = url.searchParams.get('error_description') || 'User denied authorization';
      console.warn('[shopee-callback] Authorization denied:', error, errorDesc);
      response.headers.set(
        'Location',
        `/stores?error=denied&message=${encodeURIComponent(errorDesc)}`,
      );
      return new NextResponse(null, {
        status: 302,
        headers: response.headers,
      });
    }

    if (!code || !shopIdParam) {
      console.error('[shopee-callback] Missing authorization code or shop_id');
      response.headers.set(
        'Location',
        '/stores?error=missing_params&message=Missing authorization code or shop_id',
      );
      return new NextResponse(null, {
        status: 302,
        headers: response.headers,
      });
    }

    if (!state || !storedState) {
      console.error('[shopee-callback] Missing state parameter');
      response.headers.set(
        'Location',
        '/stores?error=invalid_state&message=Missing state parameter',
      );
      return new NextResponse(null, {
        status: 302,
        headers: response.headers,
      });
    }

    if (!verifyOAuthState(state, storedState)) {
      console.error('[shopee-callback] State mismatch — possible CSRF');
      response.headers.set(
        'Location',
        '/stores?error=invalid_state&message=State mismatch',
      );
      return new NextResponse(null, {
        status: 302,
        headers: response.headers,
      });
    }

    // ── 2. Exchange code for tokens ──
    let partnerId = process.env.SHOPEE_APP_ID;
    let partnerKey = process.env.SHOPEE_APP_SECRET;

    // Dev Bypass: Use fallback dummy credentials if missing in development mode
    if (process.env.NODE_ENV === 'development' && (!partnerId || !partnerKey)) {
      console.warn("[Dev Bypass] SHOPEE_APP_ID or SECRET missing. Falling back to local dummy credentials.");
      partnerId = partnerId || "123456";
      partnerKey = partnerKey || "dummy_secret_key";
    }

    if (!partnerId || !partnerKey) {
      console.error('[shopee-callback] SHOPEE_APP_ID or SHOPEE_APP_SECRET not configured');
      response.headers.set(
        'Location',
        '/stores?error=config&message=Shopee integration not configured',
      );
      return new NextResponse(null, {
        status: 302,
        headers: response.headers,
      });
    }

    // ── 2a. Generate Signature for Shopee API V2 ──
    const path = '/api/v2/auth/token/get';
    const timestamp = Math.floor(Date.now() / 1000);
    const baseString = `${partnerId}${path}${timestamp}`;
    const sign = crypto.createHmac('sha256', partnerKey).update(baseString).digest('hex');

    const tokenUrl = new URL('https://partner.shopeemobile.com/api/v2/auth/token/get');
    tokenUrl.searchParams.set('partner_id', partnerId);
    tokenUrl.searchParams.set('timestamp', timestamp.toString());
    tokenUrl.searchParams.set('sign', sign);

    const tokenResponse = await fetch(
      tokenUrl.toString(),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: parseInt(partnerId, 10),
          code,
          shop_id: parseInt(shopIdParam, 10),
        }),
      },
    );

    if (!tokenResponse.ok) {
      const errBody = await tokenResponse.text();
      console.error('[shopee-callback] Token exchange failed:', tokenResponse.status, errBody);
      response.headers.set(
        'Location',
        '/stores?error=token_exchange&message=Failed to exchange authorization code',
      );
      return new NextResponse(null, {
        status: 302,
        headers: response.headers,
      });
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('[shopee-callback] Token exchange error:', tokenData.error, tokenData.message);
      response.headers.set(
        'Location',
        `/stores?error=token_exchange&message=${encodeURIComponent(tokenData.message || 'Token exchange failed')}`,
      );
      return new NextResponse(null, {
        status: 302,
        headers: response.headers,
      });
    }

    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      expire_in: expiresIn,
      shop_id: shopId,
      shop_name: shopName,
    } = tokenData;

    if (!accessToken || !refreshToken || !shopId) {
      console.error('[shopee-callback] Incomplete token response:', tokenData);
      response.headers.set(
        'Location',
        '/stores?error=incomplete_response&message=Incomplete token response from Shopee',
      );
      return new NextResponse(null, {
        status: 302,
        headers: response.headers,
      });
    }

    // ── 3. Compute expiry ──
    const now = new Date();
    // Shopee returns expire_in in seconds; default 4 hours
    const accessTokenExpiresAt = new Date(now.getTime() + (expiresIn || 14400) * 1000);
    // Refresh token typically lasts longer — use a generous default (365 days)
    const refreshTokenExpiresAt = new Date(
      now.getTime() + 365 * 24 * 60 * 60 * 1000,
    );

    // ── 4. Create or resolve Store ──
    const resolvedShopName = shopName || `Shop #${shopId}`;

    // Look for an existing Store with this shopeeShopId
    let store = await prisma.store.findUnique({
      where: { shopeeShopId: shopId },
    });

    if (!store) {
      // Check if the user has an existing store with no shopeeShopId yet (placeholder)
      // to link, or create a new one.
      const existingUnlinked = await prisma.store.findFirst({
        where: {
          userId,
          shopeeShopId: null,
          isConnected: false,
        },
        orderBy: { createdAt: 'asc' },
      });

      if (existingUnlinked) {
        store = await prisma.store.update({
          where: { id: existingUnlinked.id },
          data: {
            shopeeShopId: shopId,
            name: resolvedShopName,
            isConnected: true,
            status: 'ACTIVE',
          },
        });
      } else {
        // Create a new Store
        store = await prisma.store.create({
          data: {
            userId,
            name: resolvedShopName,
            shopeeId: `SHOP-${shopId}`,
            apiKey: '',
            apiSecret: '',
            shopeeShopId: shopId,
            isConnected: true,
            status: 'ACTIVE',
            rating: 0,
            totalOrders: 0,
            totalRevenue: 0,
            totalProducts: 0,
            totalChats: 0,
            totalVisitors: 0,
            conversionRate: 0,
          },
        });
      }
    } else {
      // Store exists — update connection status
      store = await prisma.store.update({
        where: { id: store.id },
        data: {
          name: resolvedShopName,
          isConnected: true,
          status: 'ACTIVE',
        },
      });
    }

    // ── 5. Persist tokens ──
    await storeTokens({
      userId,
      storeId: store.id,
      shopId,
      shopName: resolvedShopName,
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
    });

    console.log(`[shopee-callback] Successfully connected shop ${shopId} for user ${userId}`);

    response.headers.set('Location', '/stores?connected=true');
    return new NextResponse(null, {
      status: 302,
      headers: response.headers,
    });
  } catch (err) {
    console.error('[shopee-callback] Unexpected error:', err);
    const fallbackUrl = new URL('/stores', request.url);
    fallbackUrl.searchParams.set('error', 'internal');
    fallbackUrl.searchParams.set('message', 'An unexpected error occurred');
    return NextResponse.redirect(fallbackUrl);
  }
}
