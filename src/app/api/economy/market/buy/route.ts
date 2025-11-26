import prisma from '@/lib/db';
import { z } from 'zod';
import { handleApiError, successResponse, errorResponse } from '@/lib/api';

const buyItemSchema = z.object({
  listingId: z.string().cuid(),
  quantity: z.number().min(1)
});

export async function POST(req: Request) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return errorResponse('UNAUTHORIZED', 401);

    const body = await req.json();
    const { listingId, quantity } = buyItemSchema.parse(body);

    const buyer = await prisma.nPC.findFirst({ 
      where: { userId },
      include: { wallet: true }
    });
    if (!buyer || !buyer.wallet) return errorResponse('BUYER_NOT_FOUND', 404);

    const listing = await prisma.marketListing.findUnique({
      where: { id: listingId },
      include: { seller: { include: { wallet: true } } }
    });

    if (!listing || !listing.active) return errorResponse('LISTING_NOT_FOUND', 404);
    if (listing.quantity < quantity) return errorResponse('INSUFFICIENT_STOCK', 400);

    const totalCost = listing.price * quantity;
    if (buyer.wallet.balance < totalCost) return errorResponse('INSUFFICIENT_FUNDS', 400);

    // Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Transfer Money
      await tx.wallet.update({
        where: { id: buyer.wallet!.id },
        data: { balance: { decrement: totalCost } }
      });

      if (listing.seller && listing.seller.wallet) {
        await tx.wallet.update({
          where: { id: listing.seller.wallet.id },
          data: { balance: { increment: totalCost } }
        });
      }

      // 2. Update Listing
      if (listing.quantity === quantity) {
        await tx.marketListing.update({
          where: { id: listing.id },
          data: { active: false, quantity: 0 }
        });
      } else {
        await tx.marketListing.update({
          where: { id: listing.id },
          data: { quantity: { decrement: quantity } }
        });
      }

      // 3. Transfer Item (Add to Buyer)
      const existingItem = await tx.inventoryItem.findUnique({
        where: { npcId_itemId: { npcId: buyer.id, itemId: listing.itemId } }
      });

      if (existingItem) {
        await tx.inventoryItem.update({
          where: { id: existingItem.id },
          data: { quantity: { increment: quantity } }
        });
      } else {
        await tx.inventoryItem.create({
          data: {
            npcId: buyer.id,
            itemId: listing.itemId,
            quantity
          }
        });
      }

      // 4. Record Transaction
      await tx.transaction.create({
        data: {
          from: buyer.wallet!.address,
          to: listing.seller?.wallet?.address || 'SYSTEM',
          amount: totalCost,
          hash: `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
      });

      return { success: true, purchased: quantity, cost: totalCost };
    });

    return successResponse(result);
  } catch (e) {
    return handleApiError(e);
  }
}
