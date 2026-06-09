import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.id) {
      return NextResponse.json({ error: 'Unauthorized', message: 'Sesi tidak valid' }, { status: 401 });
    }

    const body = await request.json();

    const {
      storeId,
      name,
      sku,
      price,
      stock,
    }: {
      storeId?: string;
      name?: string;
      sku?: string;
      price?: number;
      stock?: number;
    } = body || {};

    if (!storeId) {
      return NextResponse.json({ error: 'Bad Request', message: 'storeId diperlukan' }, { status: 400 });
    }
    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: 'Bad Request', message: 'name wajib diisi' }, { status: 400 });
    }
    if (!sku || !String(sku).trim()) {
      return NextResponse.json({ error: 'Bad Request', message: 'sku wajib diisi' }, { status: 400 });
    }

    const priceNum = typeof price === 'number' ? price : Number(price);
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      return NextResponse.json({ error: 'Bad Request', message: 'price tidak valid' }, { status: 400 });
    }

    const stockNum = typeof stock === 'number' ? stock : Number(stock);
    if (!Number.isFinite(stockNum) || stockNum < 0) {
      return NextResponse.json({ error: 'Bad Request', message: 'stock tidak valid' }, { status: 400 });
    }

    const userId = token.id as string;

    const store = await prisma.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!store) {
      return NextResponse.json({ error: 'Not Found', message: 'Toko tidak ditemukan' }, { status: 404 });
    }

    const status = stockNum === 0 ? 'OUT_OF_STOCK' : 'ACTIVE';
    const isLowStock = stockNum < 10;

    // Upsert by (storeId, sku)
    await prisma.product.upsert({
      where: { storeId_sku: { storeId, sku: String(sku).trim() } },
      create: {
        userId,
        storeId,
        shopeeId: `manual-${Date.now()}`,
        name: String(name).trim(),
        sku: String(sku).trim(),
        price: priceNum,
        stock: stockNum,
        sold: 0,
        images: [],
        status,
        isLowStock,
      },
      update: {
        name: String(name).trim(),
        price: priceNum,
        stock: stockNum,
        status,
        isLowStock,
      },
    });

    await prisma.store.update({
      where: { id: storeId },
      data: {
        totalProducts: undefined as any,
      },
    });

    // Recompute totalProducts to keep metadata consistent
    const totalProducts = await prisma.product.count({ where: { storeId } });
    await prisma.store.update({
      where: { id: storeId },
      data: {
        totalProducts,
      },
    });

    return NextResponse.json({ success: true, message: 'Produk berhasil ditambahkan' }, { status: 200 });
  } catch (error: any) {
    console.error('[API /api/products/manual] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}

