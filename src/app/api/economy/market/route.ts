import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { decideEconomicAction } from '@/lib/services/brainAgent';

export async function POST(req: Request) {
  try {
    const { npcId } = await req.json();
    
    if (!npcId) {
      return NextResponse.json({ error: 'NPC_ID_REQUIRED' }, { status: 400 });
    }

    const decision = await decideEconomicAction(npcId);

    if (decision.action === 'BUY' && decision.item && decision.cost) {
      // Execute Transaction
      const npc = await prisma.nPC.findUnique({ 
        where: { id: npcId },
        include: { wallet: true }
      });

      if (npc && npc.wallet) {
        await prisma.$transaction([
          prisma.wallet.update({
            where: { id: npc.wallet.id },
            data: { balance: { decrement: decision.cost } }
          }),
          prisma.transaction.create({
            data: {
              hash: 'market_' + Math.random().toString(36).substr(2, 9),
              from: npc.wallet.address,
              to: 'SYSTEM_MARKET',
              amount: decision.cost
            }
          }),
          // Log the purchase as a memory
          prisma.memoryEvent.create({
            data: {
              npcId,
              rawContent: `Purchased ${decision.item} for ${decision.cost} credits.`,
              summary: `Bought ${decision.item}`,
              importance: 3,
              tags: 'economy,purchase'
            }
          })
        ]);
      }
    }

    return NextResponse.json(decision);
  } catch (e) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: (e as Error).message }, { status: 500 });
  }
}
