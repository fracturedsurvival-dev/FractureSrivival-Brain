import { prisma } from '@/lib/db';
import { z } from 'zod';
import { handleApiError, successResponse } from '@/lib/api';

const createNpcSchema = z.object({
  name: z.string().min(2).max(50),
  faction: z.string().optional(),
  alignment: z.string().optional()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, faction, alignment } = createNpcSchema.parse(body);

    const npc = await prisma.nPC.create({
      data: {
        name,
        faction,
        alignment
      }
    });

    return successResponse(npc);
  } catch (e) {
    return handleApiError(e);
  }
}
