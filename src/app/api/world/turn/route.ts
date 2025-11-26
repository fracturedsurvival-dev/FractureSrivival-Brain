import { NextResponse } from 'next/server';
import { advanceWorldTime } from '@/lib/services/worldEngine';
import { processNPCTurn } from '@/lib/services/brainAgent';
import prisma from '@/lib/db';

export async function POST() {
  try {
    // 1. Advance World State (Events)
    const worldResult = await advanceWorldTime();
    
    // 2. Process NPC Turns
    const npcs = await prisma.nPC.findMany({ select: { id: true } });
    const npcLogs = [];

    for (const npc of npcs) {
      const result = await processNPCTurn(npc.id);
      if (result && result.log) {
        npcLogs.push(result.log);
      }
    }

    return NextResponse.json({
      world: worldResult,
      npcLogs
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
