import { NextResponse } from 'next/server';
import { simulateInteraction } from '@/lib/services/brainAgent';

export async function POST(req: Request) {
  try {
    const { sourceId, targetId, content, eventType, model } = await req.json();
    if (!sourceId || !targetId || !content || !eventType) {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
    }
    const result = await simulateInteraction(sourceId, targetId, content, eventType, model);
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: (e as Error).message }, { status: 500 });
  }
}
