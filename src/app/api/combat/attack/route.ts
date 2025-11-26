import { executeAttack } from '@/lib/services/combatSystem';
import { z } from 'zod';
import { handleApiError, successResponse } from '@/lib/api';

const attackSchema = z.object({
  attackerId: z.string().cuid(),
  defenderId: z.string().cuid()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { attackerId, defenderId } = attackSchema.parse(body);

    const result = await executeAttack(attackerId, defenderId);
    return successResponse(result);
  } catch (e) {
    return handleApiError(e);
  }
}
