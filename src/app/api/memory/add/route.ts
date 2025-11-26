import prisma from '@/lib/db';
import { generateMemorySummary } from '@/lib/services/brainAgent';
import { z } from 'zod';
import { handleApiError, successResponse } from '@/lib/api';

const memorySchema = z.object({
  npcId: z.string().cuid(),
  rawContent: z.string().min(1),
  model: z.enum(['gpt-5', 'claude-sonnet-4.5']).optional(),
  importance: z.number().min(1).max(10).optional(),
  tags: z.string().optional()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { npcId, rawContent, model, importance, tags } = memorySchema.parse(body);
    
    const analysis = await generateMemorySummary(rawContent, model);
    
    // Use provided values if available, otherwise use analysis
    const finalImportance = importance || analysis.importance;
    const finalTags = tags || analysis.tags.join(',');

    const memory = await prisma.memoryEvent.create({ 
      data: { 
        npcId, 
        rawContent, 
        summary: analysis.summary,
        importance: finalImportance,
        tags: finalTags
      } 
    });
    return successResponse({ id: memory.id, summary: analysis.summary, importance: finalImportance, tags: finalTags }, 201);
  } catch (e) {
    return handleApiError(e);
  }
}
