
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { buyerId, sellerId, itemId, quantity, price } = await req.json();

    if (!buyerId || !sellerId || !itemId || !quantity || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Start transaction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Check buyer funds
      const buyerWallet = await tx.wallet.findUnique({ where: { ownerId: buyerId } });
      if (!buyerWallet || buyerWallet.balance < price) {
        throw new Error('Insufficient funds');
      }

      // 2. Check seller inventory
      const sellerInventory = await tx.inventoryItem.findFirst({
        where: { npcId: sellerId, itemId: itemId }
      });

      if (!sellerInventory || sellerInventory.quantity < quantity) {
        throw new Error('Item not available');
      }

      // 3. Transfer Credits
      await tx.wallet.update({
        where: { id: buyerWallet.id },
        data: { balance: { decrement: price } }
      });

      // Find seller wallet
      const sellerWallet = await tx.wallet.findUnique({ where: { ownerId: sellerId } });
      if (sellerWallet) {
        await tx.wallet.update({
          where: { id: sellerWallet.id },
          data: { balance: { increment: price } }
        });
      } else {
        // If seller has no wallet, create one? Or just fail? 
        // For now, let's assume all NPCs have wallets or create one.
        await tx.wallet.create({
            data: {
                ownerId: sellerId,
                address: `0x${Math.random().toString(16).slice(2)}`, // Mock address
                balance: price
            }
        });
      }

      // 4. Transfer Item
      // Remove from seller
      if (sellerInventory.quantity === quantity) {
        await tx.inventoryItem.delete({ where: { id: sellerInventory.id } });
      } else {
        await tx.inventoryItem.update({
          where: { id: sellerInventory.id },
          data: { quantity: { decrement: quantity } }
        });
      }

      // Add to buyer
      const buyerInventory = await tx.inventoryItem.findFirst({
        where: { npcId: buyerId, itemId: itemId }
      });

      if (buyerInventory) {
        await tx.inventoryItem.update({
          where: { id: buyerInventory.id },
          data: { quantity: { increment: quantity } }
        });
      } else {
        await tx.inventoryItem.create({
          data: {
            npcId: buyerId,
            itemId: itemId,
            quantity: quantity
          }
        });
      }

      return { success: true };
    });

    return NextResponse.json(result);

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Trade failed' }, { status: 500 });
  }
}
