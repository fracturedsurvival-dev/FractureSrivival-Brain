import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { processTrustUpdate, adjustTrustState } from '@/lib/services/brainAgent';

export async function POST(req: Request) {
  try {
    const { sourceId, targetId, eventType } = await req.json();
    if (!sourceId || !targetId || !eventType) {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
    }
    const delta = await processTrustUpdate(eventType);
    await adjustTrustState(sourceId, targetId, delta);
    const state = await prisma.trustState.findUnique({ where: { sourceId_targetId: { sourceId, targetId } } });
    return NextResponse.json({ trustLevel: state?.trustLevel ?? 0, delta }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: (e as Error).message }, { status: 500 });
  }
}
