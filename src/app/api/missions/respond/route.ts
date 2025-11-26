import prisma from '@/lib/db';
import { z } from 'zod';
import { handleApiError, successResponse, errorResponse } from '@/lib/api';

const respondSchema = z.object({
  missionId: z.string().cuid(),
  response: z.enum(['ACCEPTED', 'DECLINED', 'COMPLETED'])
});

export async function POST(req: Request) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return errorResponse('UNAUTHORIZED', 401);

    const body = await req.json();
    const { missionId, response } = respondSchema.parse(body);

    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      include: { 
        giver: { include: { wallet: true } },
        receiver: { include: { wallet: true } }
      }
    });

    if (!mission) return errorResponse('MISSION_NOT_FOUND', 404);

    // Authorization check: Only receiver can accept/decline/complete?
    // Actually, Giver might mark it as completed too?
    // For now, let's assume the Receiver claims completion.
    if (mission.receiver.userId !== userId) {
       // Allow Giver to mark complete too?
       if (mission.giver.userId !== userId) {
         return errorResponse('FORBIDDEN', 403);
       }
    }

    if (response === 'ACCEPTED') {
      if (mission.status !== 'PENDING') return errorResponse('MISSION_ALREADY_PROCESSED', 400);
      
      const updated = await prisma.mission.update({
        where: { id: missionId },
        data: { 
          status: response,
          startedAt: new Date()
        }
      });
      return successResponse(updated);
    }

    if (response === 'DECLINED') {
      if (mission.status !== 'PENDING') return errorResponse('MISSION_ALREADY_PROCESSED', 400);
      
      const updated = await prisma.mission.update({
        where: { id: missionId },
        data: { status: response }
      });
      return successResponse(updated);
    }

    if (response === 'COMPLETED') {
      if (mission.status !== 'ACCEPTED') return errorResponse('MISSION_NOT_ACTIVE', 400);

      // Check Timer
      if (mission.startedAt) {
        const now = new Date();
        const elapsedSeconds = (now.getTime() - mission.startedAt.getTime()) / 1000;
        if (elapsedSeconds < mission.duration) {
             return errorResponse('MISSION_IN_PROGRESS', 400);
        }
      }

      // Process Rewards
      const rewards = mission.rewards as { credits?: number, itemId?: string } | null;
      
      await prisma.$transaction(async (tx) => {
        // 1. Credits Transfer
        if (rewards?.credits) {
          if (!mission.giver.wallet || mission.giver.wallet.balance < rewards.credits) {
            throw new Error('GIVER_INSOLVENT');
          }
          
          await tx.wallet.update({
            where: { id: mission.giver.wallet.id },
            data: { balance: { decrement: rewards.credits } }
          });

          if (mission.receiver.wallet) {
            await tx.wallet.update({
              where: { id: mission.receiver.wallet.id },
              data: { balance: { increment: rewards.credits } }
            });
          }
        }

        // 2. Item Transfer
        if (rewards?.itemId) {
          const giverItem = await tx.inventoryItem.findUnique({
            where: { npcId_itemId: { npcId: mission.giverId, itemId: rewards.itemId } }
          });

          if (!giverItem || giverItem.quantity < 1) {
             throw new Error('GIVER_LOST_ITEM');
          }

          // Remove from Giver
          if (giverItem.quantity === 1) {
            await tx.inventoryItem.delete({ where: { id: giverItem.id } });
          } else {
            await tx.inventoryItem.update({
              where: { id: giverItem.id },
              data: { quantity: { decrement: 1 } }
            });
          }

          // Add to Receiver
          const receiverItem = await tx.inventoryItem.findUnique({
            where: { npcId_itemId: { npcId: mission.receiverId, itemId: rewards.itemId } }
          });

          if (receiverItem) {
            await tx.inventoryItem.update({
              where: { id: receiverItem.id },
              data: { quantity: { increment: 1 } }
            });
          } else {
            await tx.inventoryItem.create({
              data: {
                npcId: mission.receiverId,
                itemId: rewards.itemId,
                quantity: 1
              }
            });
          }
        }

        // 3. Update Mission
        await tx.mission.update({
          where: { id: missionId },
          data: { status: 'COMPLETED' }
        });
      });

      return successResponse({ status: 'COMPLETED', message: 'Rewards transferred.' });
    }

    return errorResponse('INVALID_ACTION', 400);
  } catch (e) {
    return handleApiError(e);
  }
}
