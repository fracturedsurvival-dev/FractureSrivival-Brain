
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const jobs = [
      { id: 'SCAVENGER', name: 'Scavenger', description: 'Finds resources in the wasteland.' },
      { id: 'TRADER', name: 'Trader', description: 'Buys and sells goods.' },
      { id: 'MERCENARY', name: 'Mercenary', description: 'Fights for credits.' },
      { id: 'MEDIC', name: 'Medic', description: 'Heals the wounded.' },
    ];
    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { jobId } = await req.json();
    
    const npc = await prisma.nPC.findFirst({ where: { userId } });
    if (!npc) return NextResponse.json({ error: 'NPC not found' }, { status: 404 });

    const updatedNpc = await prisma.nPC.update({
      where: { id: npc.id },
      data: { job: jobId }
    });

    return NextResponse.json({ success: true, npc: updatedNpc });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}
