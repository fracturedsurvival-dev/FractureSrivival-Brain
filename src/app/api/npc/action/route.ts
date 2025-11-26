import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');

    if (!token) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const payload = verifyToken(token.value);
    if (!payload || typeof payload === 'string') {
      return NextResponse.json({ error: 'INVALID_TOKEN' }, { status: 401 });
    }

    const { actionType } = await req.json();
    if (!['SCAVENGE', 'TRAIN', 'REST', 'SOCIALIZE'].includes(actionType)) {
      return NextResponse.json({ error: 'INVALID_ACTION' }, { status: 400 });
    }

    // Find NPC owned by user
    const npc = await prisma.nPC.findFirst({
      where: { userId: payload.userId }
    });

    if (!npc) {
      return NextResponse.json({ error: 'NPC_NOT_FOUND' }, { status: 404 });
    }

    // Calculate duration based on action
    let durationMinutes = 15;
    let statusMessage = "Performing action...";

    switch (actionType) {
      case 'SCAVENGE':
        durationMinutes = 30;
        statusMessage = "Scavenging the wasteland for resources...";
        break;
      case 'TRAIN':
        durationMinutes = 60;
        statusMessage = "Training combat skills in the simulation...";
        break;
      case 'REST':
        durationMinutes = 120;
        statusMessage = "Resting to recover health...";
        break;
      case 'SOCIALIZE':
        durationMinutes = 45;
        statusMessage = "Looking for other survivors...";
        break;
    }

    const expiresAt = new Date(Date.now() + durationMinutes * 60000);

    // Update NPC
    const updatedNpc = await prisma.nPC.update({
      where: { id: npc.id },
      data: {
        currentAction: actionType,
        actionExpiresAt: expiresAt
      }
    });

    return NextResponse.json({ 
      success: true, 
      npc: updatedNpc,
      message: statusMessage
    });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'SERVER_ERROR' }, { status: 500 });
  }
}
