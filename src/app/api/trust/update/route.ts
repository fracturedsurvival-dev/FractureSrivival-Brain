import prisma from '@/lib/db';
import { processTrustUpdate, adjustTrustState } from '@/lib/services/brainAgent';
import { z } from 'zod';
import { handleApiError, successResponse } from '@/lib/api';

const trustUpdateSchema = z.object({
  sourceId: z.string().cuid(),
  targetId: z.string().cuid(),
  eventType: z.string().min(1)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sourceId, targetId, eventType } = trustUpdateSchema.parse(body);

    const delta = await processTrustUpdate(eventType);
    await adjustTrustState(sourceId, targetId, delta);
    const state = await prisma.trustState.findUnique({ where: { sourceId_targetId: { sourceId, targetId } } });
    return successResponse({ trustLevel: state?.trustLevel ?? 0, delta });
  } catch (e) {
    return handleApiError(e);
  }
}
