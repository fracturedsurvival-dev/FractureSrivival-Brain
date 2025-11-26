import { simulateInteraction } from '@/lib/services/brainAgent';
import { z } from 'zod';
import { handleApiError, successResponse } from '@/lib/api';
import { OracleProvider } from '@/lib/services/oracle';

const interactSchema = z.object({
  sourceId: z.string().cuid(),
  targetId: z.string().cuid(),
  content: z.string().min(1).max(1000),
  eventType: z.string().default('CHAT'),
  model: z.enum(['gpt-5', 'claude-sonnet-4.5', 'gpt-4o']).optional()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = interactSchema.parse(body); // Use parse to throw ZodError automatically

    const { sourceId, targetId, content, eventType, model } = validation;
    const result = await simulateInteraction(sourceId, targetId, content, eventType, model as OracleProvider | undefined);
    return successResponse(result);
  } catch (e) {
    return handleApiError(e);
  }
}
