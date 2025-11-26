import prisma from '@/lib/db';
import { z } from 'zod';
import { handleApiError, successResponse, errorResponse } from '@/lib/api';

const createMissionSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  receiverId: z.string().cuid(),
  rewards: z.object({
    credits: z.number().optional(),
    itemId: z.string().optional() // ID of item in Giver's inventory to give as reward
  })
});

export async function POST(req: Request) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return errorResponse('UNAUTHORIZED', 401);

    const body = await req.json();
    const { title, description, receiverId, rewards } = createMissionSchema.parse(body);

    const giver = await prisma.nPC.findFirst({ where: { userId } });
    if (!giver) return errorResponse('NPC_NOT_FOUND', 404);

    // Validate Receiver
    const receiver = await prisma.nPC.findUnique({ where: { id: receiverId } });
    if (!receiver) return errorResponse('RECEIVER_NOT_FOUND', 404);

    // Validate Rewards (Check if Giver has them)
    if (rewards.credits) {
      const wallet = await prisma.wallet.findUnique({ where: { ownerId: giver.id } });
      if (!wallet || wallet.balance < rewards.credits) {
        return errorResponse('INSUFFICIENT_FUNDS_FOR_REWARD', 400);
      }
    }

    if (rewards.itemId) {
      const item = await prisma.inventoryItem.findUnique({
        where: { npcId_itemId: { npcId: giver.id, itemId: rewards.itemId } }
      });
      if (!item || item.quantity < 1) {
        return errorResponse('ITEM_NOT_OWNED', 400);
      }
    }

    const mission = await prisma.mission.create({
      data: {
        title,
        description,
        giverId: giver.id,
        receiverId,
        status: 'PENDING',
        rewards: rewards
      }
    });

    return successResponse(mission);
  } catch (e) {
    return handleApiError(e);
  }
}
