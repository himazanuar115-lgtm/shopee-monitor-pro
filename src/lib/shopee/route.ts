import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { syncOrdersForStore } from '@/lib/shopee/order-sync';

/**
 * POST /api/orders/sync
 * 
 * Endpoint untuk memicu sinkronisasi pesanan Shopee untuk toko tertentu.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validasi sesi
    const token = await getToken({ req: request });
    if (!token || !token.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Sesi diperlukan' }, 
        { status: 401 }
      );
    }

    const userId = token.id as string;
    const body = await request.json().catch(() => ({}));
    const { storeId } = body;

    // 2. Validasi request body
    if (!storeId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'storeId diperlukan' }, 
        { status: 400 }
      );
    }

    // 3. Panggil utility sinkronisasi pesanan
    await syncOrdersForStore(userId, storeId);

    return NextResponse.json({
      success: true,
      message: "Sinkronisasi pesanan Shopee berhasil diperbarui."
    });
  } catch (error: any) {
    console.error('[API /api/orders/sync] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message }, 
      { status: 500 }
    );
  }
}