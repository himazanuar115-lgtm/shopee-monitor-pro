import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';

export async function PATCH(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pathname = new URL(request.url).pathname;
    const segments = pathname.split('/').filter(Boolean);
    const id = segments[segments.length - 1];

    const body = await request.json();
    const { reply, status, isReplied } = body;

    const updated = await prisma.chat.updateMany({
      where: {
        id,
        userId: token.id as string,
      },
      data: {
        reply: reply ?? undefined,
        status: status ?? 'REPLIED',
        isReplied: isReplied ?? true,
        repliedAt: reply ? new Date() : undefined,
      },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
