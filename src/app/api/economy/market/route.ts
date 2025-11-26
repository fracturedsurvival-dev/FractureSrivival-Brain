import prisma from '@/lib/db';
import { z } from 'zod';
import { handleApiError, successResponse, errorResponse } from '@/lib/api';

export async function GET() {
  try {
    const listings = await prisma.marketListing.findMany({
      where: { active: true },
      include: { item: true, seller: { select: { name: true } } }
    });
    return successResponse(listings);
  } catch (e) {
    return handleApiError(e);
  }
}

const createListingSchema = z.object({
  itemId: z.string().cuid(),
  quantity: z.number().min(1),
  price: z.number().min(0),
  npcId: z.string().optional()
});

export async function POST(req: Request) {
  try {
    const userId = req.headers.get('x-user-id');
    
    const body = await req.json();
    const { itemId, quantity, price, npcId } = createListingSchema.parse(body);

    let npc;
    if (npcId) {
        npc = await prisma.nPC.findUnique({ where: { id: npcId } });
    } else if (userId) {
        npc = await prisma.nPC.findFirst({ where: { userId } });
    }

    if (!npc) return errorResponse('NPC_NOT_FOUND', 404);

    // Check inventory
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { npcId_itemId: { npcId: npc.id, itemId } }
    });

    if (!inventoryItem || inventoryItem.quantity < quantity) {
      return errorResponse('INSUFFICIENT_ITEMS', 400);
    }

    // Transaction: Reduce inventory -> Create listing
    const listing = await prisma.$transaction(async (tx) => {
      if (inventoryItem.quantity === quantity) {
        await tx.inventoryItem.delete({ where: { id: inventoryItem.id } });
      } else {
        await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: { quantity: { decrement: quantity } }
        });
      }

      return await tx.marketListing.create({
        data: {
          sellerId: npc.id,
          itemId,
          quantity,
          price
        }
      });
    });

    return successResponse(listing);
  } catch (e) {
    return handleApiError(e);
  }
}
