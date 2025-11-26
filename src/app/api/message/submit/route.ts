import prisma from '@/lib/db';
import { checkSafety } from '@/lib/services/safety';
import { z } from 'zod';
import { handleApiError, successResponse, errorResponse } from '@/lib/api';

const messageSchema = z.object({
  npcId: z.string().cuid(),
  text: z.string().min(1).max(2000)
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { npcId, text } = messageSchema.parse(body);

    const safety = checkSafety(text);
    if (safety.status === 'FLAGGED') {
      await prisma.auditLog.create({ data: { type: 'SAFETY_FLAG', details: JSON.stringify({ npcId, reason: safety.reason }) } });
      return errorResponse(safety.reason || 'Safety check failed', 400, { status: 'REJECTED' });
    }
    await prisma.auditLog.create({ data: { type: 'MESSAGE_OK', details: JSON.stringify({ npcId }) } });
    return successResponse({ status: 'ACCEPTED' }, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
