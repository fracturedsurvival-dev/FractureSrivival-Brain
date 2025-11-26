import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sourceId = searchParams.get('sourceId');
    const targetId = searchParams.get('targetId');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (sourceId) where.sourceId = sourceId;
    if (targetId) where.targetId = targetId;
    const states = await prisma.trustState.findMany({ where, select: { id: true, sourceId: true, targetId: true, trustLevel: true, updatedAt: true } });
    return NextResponse.json(states);
  } catch (e) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: (e as Error).message }, { status: 500 });
  }
}
