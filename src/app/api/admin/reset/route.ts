import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { action } = await req.json();

    if (action === 'WIPE_MEMORIES') {
      await prisma.memoryEvent.deleteMany({});
      return NextResponse.json({ message: 'All memories wiped.' });
    }

    if (action === 'WIPE_TRUST') {
      await prisma.trustState.deleteMany({});
      await prisma.trustEvent.deleteMany({});
      return NextResponse.json({ message: 'All trust states wiped.' });
    }

    if (action === 'RESET_WORLD') {
      await prisma.worldEvent.deleteMany({});
      return NextResponse.json({ message: 'World events cleared.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
