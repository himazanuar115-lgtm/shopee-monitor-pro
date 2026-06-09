import { prisma } from '@/lib/db';
import { createShopeeClient } from './client';
import { getValidShopeeConnection } from './token-manager';

interface ShopeeItem {
  item_id: number;
  item_name: string;
  item_sku: string;
  description?: string;
  price_info?: Array<{
    current_price: number;
  }>;
  stock_info?: Array<{
    stock_type: number;
    stock_value: number;
  }>;
  image_info: {
    image_url_list: string[];
  };
  item_status: string;
}

interface GetItemListResponse {
  response: {
    item_id_list: number[];
    has_next: boolean;
    next_offset?: string;
  };
  error?: string;
  message?: string;
}

interface GetItemBaseInfoResponse {
  response: {
    item_list: ShopeeItem[];
  };
  error?: string;
  message?: string;
}

const SHOPEE_PRODUCT_STATUS_MAP: Record<string, string> = {
  NORMAL: 'ACTIVE',
  UNLIST: 'INACTIVE',
  BANNED: 'BANNED',
  DELETED: 'DELETED',
};

async function fetchShopeeProducts(client: any, offset: string = '') {
  const response: GetItemListResponse = await client.get('/api/v2/product/get_item_list', {
    page_size: 100,
    offset,
    item_status: 'NORMAL,UNLIST,BANNED',
  });

  if (response.error) {
    throw new Error(`Shopee List API Error: ${response.message || response.error}`);
  }

  return response.response;
}

async function fetchProductDetails(client: any, itemIds: number[]) {
  const response: GetItemBaseInfoResponse = await client.get('/api/v2/product/get_item_base_info', {
    item_id_list: itemIds.join(','),
  });

  if (response.error) {
    throw new Error(`Shopee Detail API Error: ${response.message || response.error}`);
  }

  return response.response.item_list;
}

async function upsertProductsBatch(userId: string, storeId: string, items: ShopeeItem[]) {
  const uniqueItems = new Map<string, ShopeeItem>();
  for (const item of items) {
    uniqueItems.set(String(item.item_id), item);
  }

  const upserts = Array.from(uniqueItems.values()).map((item) => {
    const price = item.price_info?.[0]?.current_price ?? 0;
    const stock = item.stock_info?.find((s) => s.stock_type === 1)?.stock_value ?? 0;
    const shopeeId = String(item.item_id);

    const productData = {
      userId,
      storeId,
      shopeeId,
      name: item.item_name,
      sku: item.item_sku || `SKU-${shopeeId}`,
      description: item.description || '',
      price,
      stock,
      images: item.image_info?.image_url_list || [],
      status: SHOPEE_PRODUCT_STATUS_MAP[item.item_status] || 'INACTIVE',
      isLowStock: stock < 10,
      updatedAt: new Date(),
    };

    return prisma.product.upsert({
      where: {
        storeId_sku: {
          storeId: storeId,
          sku: item.item_sku || `SHOPEE-${shopeeId}`,
        },
      },
      update: productData,
      create: productData,
    });
  });

  await Promise.all(upserts);
  return upserts.length;
}

export async function syncProductsForStore(userId: string, storeId: string): Promise<void> {
  const connection = await getValidShopeeConnection(userId, storeId);
  if (!connection) {
    throw new Error('Shopee connection is missing or invalid.');
  }

  const partnerId = process.env.SHOPEE_APP_ID;
  const partnerKey = process.env.SHOPEE_APP_SECRET;
  if (!partnerId || !partnerKey) {
    throw new Error('Shopee API credentials are not configured.');
  }

  const shopeeClient = createShopeeClient({
    partnerId: parseInt(partnerId, 10),
    partnerKey,
    shopId: connection.shopId,
    accessToken: connection.accessToken,
  });

  let hasNext = true;
  let offset = '';
  let totalProcessed = 0;

  try {
    while (hasNext) {
      const listData = await fetchShopeeProducts(shopeeClient, offset);
      const itemIds = listData.item_id_list || [];

      if (itemIds.length > 0) {
        const DETAIL_BATCH_SIZE = 50;
        for (let i = 0; i < itemIds.length; i += DETAIL_BATCH_SIZE) {
          const batchIds = itemIds.slice(i, i + DETAIL_BATCH_SIZE);
          const details = await fetchProductDetails(shopeeClient, batchIds);
          const syncedCount = await upsertProductsBatch(userId, storeId, details);
          totalProcessed += syncedCount;
        }
      }

      hasNext = listData.has_next;
      offset = listData.next_offset || '';
    }

    const syncTime = new Date();
    await prisma.$transaction([
      prisma.store.update({
        where: { id: storeId },
        data: {
          totalProducts: totalProcessed,
          lastSyncAt: syncTime,
        },
      }),
      prisma.shopeeConnection.update({
        where: { id: connection.id },
        data: {
          lastSyncAt: syncTime,
        },
      }),
    ]);

    console.log(`[Product Sync] Completed for store ${storeId}: ${totalProcessed} products.`);
  } catch (error: any) {
    console.error(`[Product Sync] Failed for store ${storeId}:`, error.message);
    throw error;
  }
}