import { prisma } from '@/lib/db';
import { TOKEN_REFRESH_THRESHOLD_SECONDS } from './constants';
import axios from 'axios';
import { ShopeeConnection } from '@prisma/client'; // Assuming ShopeeConnection model exists
import crypto from 'crypto'; // Import crypto for signature generation

interface ShopeeRefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expire_in: number; // seconds
  error?: string;
  message?: string;
}

/**
 * Simple in-memory lock to prevent multiple concurrent refreshes 
 * for the same connection within the same process.
 */
const refreshingPromises = new Map<string, Promise<ShopeeConnection>>();

/**
 * Securely store tokens for a Shopee connection.
 * Tokens are stored in the database (PostgreSQL).
 */
export async function storeTokens(params: {
  userId: string;
  storeId: string;
  shopId: number;
  shopName: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}): Promise<void> {
  await prisma.shopeeConnection.upsert({
    where: { shopId: params.shopId },
    update: {
      accessToken: params.accessToken,
      refreshToken: params.refreshToken,
      accessTokenExpiresAt: params.accessTokenExpiresAt,
      refreshTokenExpiresAt: params.refreshTokenExpiresAt,
      isActive: true,
      shopName: params.shopName,
      updatedAt: new Date(),
    },
    create: {
      userId: params.userId,
      storeId: params.storeId,
      shopId: params.shopId,
      shopName: params.shopName,
      accessToken: params.accessToken,
      refreshToken: params.refreshToken,
      accessTokenExpiresAt: params.accessTokenExpiresAt,
      refreshTokenExpiresAt: params.refreshTokenExpiresAt,
      isActive: true,
    },
  });
}

/**
 * Check if an access token is expired or about to expire based on the threshold.
 */
export function isTokenExpiringSoon(expiresAt: Date): boolean {
  const now = new Date();
  const thresholdMs = TOKEN_REFRESH_THRESHOLD_SECONDS * 1000;
  return expiresAt.getTime() - now.getTime() < thresholdMs;
}

/**
 * Refresh an access token using the refresh token.
 * Calls Shopee's token refresh endpoint and updates the database.
 * If refresh fails permanently, the connection is marked as inactive.
 */
export async function refreshAccessToken(connectionId: string): Promise<ShopeeConnection> {
  if (refreshingPromises.has(connectionId)) {
    console.log(`[Shopee Lock] Reusing refresh promise for connection ${connectionId}`);
    return refreshingPromises.get(connectionId)!;
  }

  const refreshPromise = (async () => {
    const connection = await prisma.shopeeConnection.findUniqueOrThrow({
      where: { id: connectionId },
    });

    const partnerId = process.env.SHOPEE_APP_ID;
    const partnerKey = process.env.SHOPEE_APP_SECRET;

    if (!partnerId || !partnerKey) {
      throw new Error('Missing Shopee credentials: SHOPEE_APP_ID or SHOPEE_APP_SECRET not set');
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const apiPath = '/api/v2/auth/access_token/get';
    const baseString = `${partnerId}${apiPath}${timestamp}${connection.refreshToken}${connection.shopId}`;
    const sign = crypto.createHmac('sha256', partnerKey).update(baseString).digest('hex');

    try {
      const response = await axios.post(
        `https://partner.shopeemobile.com${apiPath}?partner_id=${parseInt(partnerId, 10)}&timestamp=${timestamp}&sign=${sign}`,
        {
          refresh_token: connection.refreshToken,
          partner_id: parseInt(partnerId, 10),
          shop_id: connection.shopId,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const data = response.data as ShopeeRefreshTokenResponse;
      if (data.error) throw new Error(data.message || data.error);

      return await prisma.shopeeConnection.update({
        where: { id: connectionId },
        data: {
          accessToken: data.access_token,
          refreshToken: data.refresh_token || connection.refreshToken,
          accessTokenExpiresAt: new Date(Date.now() + (data.expire_in || 14400) * 1000),
          isActive: true,
          updatedAt: new Date(),
        },
      });
    } catch (error: any) {
      console.error(`[token-manager] Permanent failure for connection ${connection.id}:`, error.message);
      await prisma.shopeeConnection.update({
        where: { id: connectionId },
        data: { isActive: false },
      });
      throw new Error(`Failed to refresh Shopee token: ${error.message || 'Unknown error'}`);
    }
  })();

  console.log(`[Shopee Lock] Refresh started for connection ${connectionId}`);
  refreshingPromises.set(connectionId, refreshPromise);
  try {
    return await refreshPromise;
  } finally {
    refreshingPromises.delete(connectionId);
  }
}

/**
 * Get a valid Shopee connection for a user and store.
 * Automatically triggers a refresh if the token is nearing expiration.
 */
export async function getValidShopeeConnection(
  userId: string,
  storeId: string,
): Promise<ShopeeConnection | null> {
  let connection = await prisma.shopeeConnection.findFirst({
    where: { storeId, userId, isActive: true },
  });
  if (!connection) return null;

  if (isTokenExpiringSoon(connection.accessTokenExpiresAt)) {
    try {
      return await refreshAccessToken(connection.id);
    } catch (error) {
      console.error(`[token-manager] Failed to refresh token for ${connection.id}`);
      return null;
    }
  }
  return connection;
}

/**
 * Get a valid access token and shop ID for a store.
 * Throws an error if no active connection exists.
 */
export async function getValidAccessToken(
  storeId: string,
): Promise<{ accessToken: string; shopId: number }> {
  let connection = await prisma.shopeeConnection.findUnique({
    where: { storeId },
  });
  if (!connection) throw new Error(`No connection found for store ${storeId}.`);
  if (!connection.isActive) throw new Error(`Shopee connection for store ${storeId} is inactive.`);

  if (isTokenExpiringSoon(connection.accessTokenExpiresAt)) {
    try {
      connection = await refreshAccessToken(connection.id);
    } catch (error) {
      throw new Error(`Failed to refresh access token for store ${storeId}.`);
    }
  }
  return { accessToken: connection.accessToken, shopId: connection.shopId };
}
