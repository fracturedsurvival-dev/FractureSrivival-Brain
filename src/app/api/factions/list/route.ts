import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const factions = await prisma.faction.findMany({
      include: { members: true }
    });
    return NextResponse.json(factions);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
