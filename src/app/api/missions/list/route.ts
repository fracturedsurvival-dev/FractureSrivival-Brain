import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const npcId = searchParams.get('npcId');

  if (!npcId) {
    return NextResponse.json({ error: 'MISSING_NPC_ID' }, { status: 400 });
  }

  try {
    const missions = await prisma.mission.findMany({
      where: {
        OR: [
          { giverId: npcId },
          { receiverId: npcId }
        ]
      },
      include: {
        giver: { select: { name: true } },
        receiver: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(missions, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: (e as Error).message }, { status: 500 });
  }
}
