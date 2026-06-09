import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';

/**
 * GET /api/products?storeId=...
 * Mengambil daftar produk dari database untuk toko tertentu.
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.id) {
      return NextResponse.json({ error: 'Unauthorized', message: 'Sesi tidak valid' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Number(limitParam) : 200;

    const products = await prisma.product.findMany({
      where: storeId
        ? { storeId, userId: token.id as string }
        : { userId: token.id as string },
      orderBy: { updatedAt: 'desc' },
      take: Number.isFinite(limit) ? limit : 200,
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('[API /api/products] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}

/**
 * POST /api/products
 * Memicu sinkronisasi produk dari Shopee ke database lokal.
 * Mode: Mock data untuk development/testing
 */
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.id) {
      return NextResponse.json({ error: 'Unauthorized', message: 'Sesi tidak valid' }, { status: 401 });
    }

    const userId = token.id as string;
    const { storeId } = await request.json();

    if (!storeId) {
      return NextResponse.json({ error: 'Bad Request', message: 'storeId diperlukan' }, { status: 400 });
    }

    // 1. Create Mock Data (5 Products)
    const mockProducts = [
      { shopeeId: 'shopee-mock-1', sku: 'SKU-001', name: 'Sepatu Lari Pro', price: 250000, stock: 15 },
      { shopeeId: 'shopee-mock-2', sku: 'SKU-002', name: 'Kaos Olahraga Dry-Fit', price: 85000, stock: 50 },
      { shopeeId: 'shopee-mock-3', sku: 'SKU-003', name: 'Celana Training XL', price: 120000, stock: 5 },
      { shopeeId: 'shopee-mock-4', sku: 'SKU-004', name: 'Tas Gym Waterproof', price: 175000, stock: 0 },
      { shopeeId: 'shopee-mock-5', sku: 'SKU-005', name: 'Botol Minum 1L', price: 45000, stock: 100 },
    ];

    let created = 0;
    let updated = 0;

    // 2. Upsert Logic ke Database
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
      message: 'Sinkronisasi produk berhasil dimulai.',
      total: mockProducts.length,
      created,
      updated,
      deactivated: deactivatedResult.count,
    }, { status: 200 });
  } catch (error: any) {
    console.error('[API /api/products] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}