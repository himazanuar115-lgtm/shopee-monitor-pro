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
    const limit = Number(url.searchParams.get('limit') || '50');
    const sort = url.searchParams.get('sort');
    const storeId = url.searchParams.get('storeId');

    const where: any = { userId: token.id as string };
    if (storeId) where.storeId = storeId;

    const chats = await prisma.chat.findMany({
      where,
      orderBy: [
        ...(sort === 'unread'
          ? [{ status: 'asc' as const }, { createdAt: 'desc' as const }]
          : [{ createdAt: 'desc' as const }]),
      ],
      take: limit,
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
