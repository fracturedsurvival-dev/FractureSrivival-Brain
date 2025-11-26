import { simulateInteraction } from '@/lib/services/brainAgent';
import { z } from 'zod';
import { handleApiError, successResponse } from '@/lib/api';

const interactSchema = z.object({
  sourceId: z.string().cuid(),
  targetId: z.string().cuid(),
  content: z.string().min(1).max(1000),
  eventType: z.string().default('CHAT'),
  model: z.string().optional()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = interactSchema.parse(body); // Use parse to throw ZodError automatically

    const { sourceId, targetId, content, eventType, model } = validation;
    const result = await simulateInteraction(sourceId, targetId, content, eventType, model);
    return successResponse(result);
  } catch (e) {
    return handleApiError(e);
  }
}
