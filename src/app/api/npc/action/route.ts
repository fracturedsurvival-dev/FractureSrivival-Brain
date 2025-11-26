import prisma from '@/lib/db';
import { z } from 'zod';
import { handleApiError, successResponse, errorResponse } from '@/lib/api';

const actionSchema = z.object({
  actionType: z.enum(['SCAVENGE', 'TRAIN', 'REST', 'SOCIALIZE'])
});

export async function POST(req: Request) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return errorResponse('UNAUTHORIZED', 401);

    const body = await req.json();
    const { actionType } = actionSchema.parse(body);

    // Find NPC owned by user
    const npc = await prisma.nPC.findFirst({
      where: { userId }
    });

    if (!npc) {
      return errorResponse('NPC_NOT_FOUND', 404);
    }

    // Calculate duration based on action
    let durationMinutes = 0.05; // Default 3 seconds (0.05 * 60 = 3)
    let statusMessage = "Performing action...";
    let rewardItem = null;

    switch (actionType) {
      case 'SCAVENGE':
        durationMinutes = 0.05; // 3 seconds
        statusMessage = "Scavenging the wasteland for resources...";
        
        // Scavenge Logic
        const items = await prisma.item.findMany({
            where: { type: 'RESOURCE' }
        });
        
        if (items.length > 0) {
            // Simple random pick for now
            const randomItem = items[Math.floor(Math.random() * items.length)];
            
            // Add to inventory
            const existingInv = await prisma.inventoryItem.findUnique({
                where: { npcId_itemId: { npcId: npc.id, itemId: randomItem.id } }
            });

            if (existingInv) {
                await prisma.inventoryItem.update({
                    where: { id: existingInv.id },
                    data: { quantity: { increment: 1 } }
                });
            } else {
                await prisma.inventoryItem.create({
                    data: {
                        npcId: npc.id,
                        itemId: randomItem.id,
                        quantity: 1
                    }
                });
            }
            rewardItem = randomItem.name;
            statusMessage = `Scavenge complete. Found: ${randomItem.name}`;
        }
        break;
      case 'TRAIN':
        durationMinutes = 0.05;
        statusMessage = "Training combat skills in the simulation...";
        break;
      case 'REST':
        durationMinutes = 0.05;
        statusMessage = "Resting to recover health...";
        break;
      case 'SOCIALIZE':
        durationMinutes = 0.05;
        statusMessage = "Looking for other survivors...";
        break;
    }

    const expiresAt = new Date(Date.now() + durationMinutes * 60000);

    // Update NPC
    const updatedNpc = await prisma.nPC.update({
      where: { id: npc.id },
      data: {
        currentAction: actionType,
        actionExpiresAt: expiresAt
      }
    });

    return successResponse({ 
      npc: updatedNpc,
      message: statusMessage,
      reward: rewardItem
    });

  } catch (e) {
    return handleApiError(e);
  }
}
