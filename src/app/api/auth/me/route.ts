import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { npc: { include: { wallet: true } } }
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ 
      user: { id: user.id, email: user.email },
      npc: user.npc
    });

  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
