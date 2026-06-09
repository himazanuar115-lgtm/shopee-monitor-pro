import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const statusFilter = url.searchParams.get('status');
    const query = url.searchParams.get('query');

    const where: any = { userId: token.id as string };
    if (statusFilter) where.status = statusFilter;
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { shopeeId: { contains: query, mode: 'insensitive' } },
      ];
    }

    const stores = await prisma.store.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        shopeeConnections: {
          select: {
            id: true,
            shopId: true,
            shopName: true,
            isActive: true,
            lastSyncAt: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const storeCount = await prisma.store.count({ where: { userId: token.id as string } });
    if (storeCount >= 10) {
      return NextResponse.json(
        { error: 'Batas maksimal 10 toko telah tercapai' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const store = await prisma.store.create({
      data: {
        name: body.name,
        shopeeId: body.shopeeId,
        apiKey: body.apiKey,
        apiSecret: body.apiSecret,
        userId: token.id as string,
        status: 'ACTIVE',
        rating: 4.5,
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalChats: 0,
        totalVisitors: 0,
        conversionRate: 0,
        isConnected: true,
      },
    });

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
