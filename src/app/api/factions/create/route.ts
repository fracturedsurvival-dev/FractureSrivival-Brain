import prisma from '@/lib/db';
import { z } from 'zod';
import { handleApiError, successResponse } from '@/lib/api';

const createFactionSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().min(10).max(500)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description } = createFactionSchema.parse(body);

    const faction = await prisma.faction.create({
      data: { name, description }
    });
    return successResponse(faction);
  } catch (e) {
    return handleApiError(e);
  }
}
