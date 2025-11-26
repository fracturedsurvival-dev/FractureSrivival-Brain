import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateMemorySummary } from '@/lib/services/brainAgent';

export async function POST(req: Request) {
  try {
    const { npcId, rawContent, model, importance, tags } = await req.json();
    if (!npcId || !rawContent) {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
    }
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
    return NextResponse.json({ id: memory.id, summary: analysis.summary, importance: finalImportance, tags: finalTags }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: (e as Error).message }, { status: 500 });
  }
}
