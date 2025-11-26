import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkSafety } from '@/lib/services/safety';

export async function POST(req: Request) {
  try {
    const { npcId, text } = await req.json();
    if (!npcId || !text) {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
    }
    const safety = checkSafety(text);
    if (safety.status === 'FLAGGED') {
      await prisma.auditLog.create({ data: { type: 'SAFETY_FLAG', details: JSON.stringify({ npcId, reason: safety.reason }) } });
      return NextResponse.json({ status: 'REJECTED', reason: safety.reason }, { status: 400 });
    }
    await prisma.auditLog.create({ data: { type: 'MESSAGE_OK', details: JSON.stringify({ npcId }) } });
    return NextResponse.json({ status: 'ACCEPTED' }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: (e as Error).message }, { status: 500 });
  }
}
