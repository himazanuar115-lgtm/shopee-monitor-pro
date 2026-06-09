import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';

export async function GET() {
  return NextResponse.json({ 
    message: "Gunakan metode POST untuk memicu sinkronisasi produk." 
  });
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.id) {
      return NextResponse.json({ error: 'Unauthorized', message: 'Sesi diperlukan' }, { status: 401 });
    }

    const userId = token.id as string;
    const body = await request.json().catch(() => ({}));
    const { storeId } = body;

    if (!storeId) {
      return NextResponse.json({ error: 'Bad Request', message: 'storeId diperlukan' }, { status: 400 });
    }

    // 1. Create Mock Data (5 Products) - aligned with schema
    const mockProducts = [
      { shopeeId: 'shopee-mock-1', sku: 'SKU-001', name: 'Sepatu Lari Pro', price: 250000, stock: 15 },
      { shopeeId: 'shopee-mock-2', sku: 'SKU-002', name: 'Kaos Olahraga Dry-Fit', price: 85000, stock: 50 },
      { shopeeId: 'shopee-mock-3', sku: 'SKU-003', name: 'Celana Training XL', price: 120000, stock: 5 },
      { shopeeId: 'shopee-mock-4', sku: 'SKU-004', name: 'Tas Gym Waterproof', price: 175000, stock: 0 },
      { shopeeId: 'shopee-mock-5', sku: 'SKU-005', name: 'Botol Minum 1L', price: 45000, stock: 100 },
    ];

    let created = 0;
    let updated = 0;

    // 2. Upsert Logic ke Database menggunakan composite key storeId_sku
    for (const item of mockProducts) {
      const existing = await prisma.product.findFirst({
        where: {
          storeId: storeId,
          sku: item.sku,
        }
      });

      if (existing) {
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            shopeeId: item.shopeeId,
            name: item.name,
            price: item.price,
            stock: item.stock,
            status: item.stock === 0 ? 'OUT_OF_STOCK' : 'ACTIVE',
            isLowStock: item.stock < 10,
            updatedAt: new Date(),
          }
        });
        updated++;
      } else {
        await prisma.product.create({
          data: {
            shopeeId: item.shopeeId,
            sku: item.sku,
            name: item.name,
            price: item.price,
            stock: item.stock,
            status: item.stock === 0 ? 'OUT_OF_STOCK' : 'ACTIVE',
            isLowStock: item.stock < 10,
            userId: userId,
            storeId: storeId,
          }
        });
        created++;
      }
    }

    // 3. Deactivate produk yang tidak ada di list mock saat ini
    const mockSkus = mockProducts.map(p => p.sku);
    const deactivatedResult = await prisma.product.updateMany({
      where: {
        storeId: storeId,
        sku: { notIn: mockSkus },
        status: { not: 'DEACTIVATED' }
      },
      data: { status: 'DEACTIVATED' }
    });

    // 4. Update Store metadata
    await prisma.store.update({
      where: { id: storeId },
      data: {
        totalProducts: created + updated,
        lastSyncAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      total: mockProducts.length,
      created,
      updated,
      deactivated: deactivatedResult.count,
      message: `Sinkronisasi berhasil: ${created} produk baru, ${updated} diperbarui, ${deactivatedResult.count} dinonaktifkan`
    });
  } catch (error: any) {
    console.error('[API /api/products/sync] Error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: error.message 
    }, { status: 500 });
  }
}
