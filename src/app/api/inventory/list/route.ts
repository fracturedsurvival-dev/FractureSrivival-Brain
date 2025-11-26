import prisma from '@/lib/db';
import { handleApiError, successResponse, errorResponse } from '@/lib/api';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const npcId = searchParams.get('npcId');
    const userId = req.headers.get('x-user-id');

    let targetNpcId = npcId;

    if (!targetNpcId) {
        if (!userId) return errorResponse('UNAUTHORIZED', 401);
        const npc = await prisma.nPC.findFirst({ where: { userId } });
        if (!npc) return errorResponse('NPC_NOT_FOUND', 404);
        targetNpcId = npc.id;
    }

    const inventory = await prisma.inventoryItem.findMany({
      where: { npcId: targetNpcId },
      include: { item: true }
    });

    return successResponse(inventory);
  } catch (e) {
    return handleApiError(e);
  }
}
