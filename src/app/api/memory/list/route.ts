import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const npcId = searchParams.get('npcId');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (npcId) where.npcId = npcId;
    const memories = await prisma.memoryEvent.findMany({ where, select: { id: true, npcId: true, summary: true, createdAt: true, importance: true, tags: true } , orderBy: { createdAt: 'desc' } });
    return NextResponse.json(memories);
  } catch (e) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: (e as Error).message }, { status: 500 });
  }
}
