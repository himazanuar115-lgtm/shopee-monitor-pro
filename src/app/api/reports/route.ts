import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reports = await prisma.report.findMany({
      where: { userId: token.id as string },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
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

    const body = await request.json();
    const report = await prisma.report.create({
      data: {
        userId: token.id as string,
        title: body.title || 'Laporan Baru',
        description: body.description || '',
        type: body.type || 'CUSTOM',
        storeIds: body.storeIds || [],
        startDate: new Date(body.startDate || new Date()),
        endDate: new Date(body.endDate || new Date()),
        totalRevenue: body.totalRevenue || 0,
        totalOrders: body.totalOrders || 0,
        totalProducts: body.totalProducts || 0,
        totalChats: body.totalChats || 0,
        conversionRate: body.conversionRate || 0,
        data: body.data || {},
        fileUrl: body.fileUrl || '',
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
