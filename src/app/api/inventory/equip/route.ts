import prisma from '@/lib/db';
import { z } from 'zod';
import { handleApiError, successResponse, errorResponse } from '@/lib/api';

const equipItemSchema = z.object({
  itemId: z.string().cuid(),
  equip: z.boolean() // true to equip, false to unequip
});

export async function POST(req: Request) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return errorResponse('UNAUTHORIZED', 401);

    const body = await req.json();
    const { itemId, equip } = equipItemSchema.parse(body);

    const npc = await prisma.nPC.findFirst({ where: { userId } });
    if (!npc) return errorResponse('NPC_NOT_FOUND', 404);

    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { npcId_itemId: { npcId: npc.id, itemId } },
      include: { item: true }
    });

    if (!inventoryItem) return errorResponse('ITEM_NOT_FOUND', 404);

    if (equip) {
      // Check type
      const type = inventoryItem.item.type;
      if (type !== 'WEAPON' && type !== 'ARMOR') {
        return errorResponse('ITEM_NOT_EQUIPPABLE', 400);
      }

      // Unequip others of same type
      await prisma.inventoryItem.updateMany({
        where: {
          npcId: npc.id,
          equipped: true,
          item: { type: type }
        },
        data: { equipped: false }
      });
    }

    const updatedItem = await prisma.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: { equipped: equip }
    });

    return successResponse(updatedItem);
  } catch (e) {
    return handleApiError(e);
  }
}
