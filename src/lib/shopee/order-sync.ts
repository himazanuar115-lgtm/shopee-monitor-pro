import { prisma } from '@/lib/db';

/**
 * Menyimulasikan sinkronisasi pesanan dari Shopee API v2.
 * Dalam skenario nyata, ini akan melibatkan pengambilan data dari endpoint Shopee
 * menggunakan partner_id, shop_id, dan access_token.
 */
export async function syncOrdersForStore(userId: string, storeId: string): Promise<void> {
  // 1. Simulasi struktur data dari Shopee API v2
  const mockShopeeOrders = [
    {
      order_sn: "260610SG123A",
      buyer_user_name: "Budi Santoso",
      total_amount: 150000,
      order_status: "READY_TO_SHIP"
    },
    {
      order_sn: "260610SG456B",
      buyer_user_name: "Siti Aminah",
      total_amount: 85000,
      order_status: "COMPLETED"
    }
  ];

  // 2. Cari produk valid di toko ini untuk OrderItem agar integritas DB terjaga
  const product = await prisma.product.findFirst({
    where: { storeId }
  });

  if (!product) {
    console.warn(`[Order Sync] Tidak ada produk ditemukan untuk toko ${storeId}. Item pesanan tidak akan dibuat.`);
  }

  // 3. Proses setiap pesanan melalui Upsert berdasarkan [storeId, orderNumber]
  for (const shopeeOrder of mockShopeeOrders) {
    const orderData = {
      userId,
      storeId,
      orderNumber: shopeeOrder.order_sn,
      buyerName: shopeeOrder.buyer_user_name,
      totalAmount: shopeeOrder.total_amount,
      status: shopeeOrder.order_status,
      paymentStatus: shopeeOrder.order_status === 'COMPLETED' ? 'PAID' : 'PENDING',
    };

    await prisma.order.upsert({
      where: {
        storeId_orderNumber: {
          storeId: storeId,
          orderNumber: shopeeOrder.order_sn,
        },
      },
      update: {
        status: orderData.status,
        paymentStatus: orderData.paymentStatus,
        updatedAt: new Date(),
      },
      create: {
        ...orderData,
        // Jika produk tersedia, buat satu item simulasi
        ...(product ? {
          items: {
            create: {
              productId: product.id,
              quantity: 1,
              price: shopeeOrder.total_amount,
            }
          }
        } : {})
      },
    });
  }

  // 4. Update metadata Toko (total pesanan dan total pendapatan)
  const totalOrders = await prisma.order.count({ where: { storeId } });
  const completedOrders = await prisma.order.aggregate({
    where: { storeId, status: 'COMPLETED' },
    _sum: { totalAmount: true }
  });

  await prisma.store.update({
    where: { id: storeId },
    data: {
      totalOrders,
      totalRevenue: completedOrders._sum.totalAmount || 0,
      lastSyncAt: new Date(),
    },
  });
}