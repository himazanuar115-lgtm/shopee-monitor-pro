import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { syncProductsForStore } from '@/lib/shopee/product-sync';

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

    // Perform real synchronization with Shopee API v2
    await syncProductsForStore(userId, storeId);

    return NextResponse.json({
      success: true,
      message: "Sinkronisasi produk dengan Shopee berhasil diperbarui."
    });
  } catch (error: any) {
    console.error('[API /api/products/sync] Error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: error.message 
    }, { status: 500 });
  }
}
