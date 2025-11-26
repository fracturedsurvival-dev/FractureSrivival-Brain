import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const npcs = await prisma.nPC.findMany({ 
      select: { 
        id: true, 
        name: true, 
        faction: true, 
        alignment: true,
        health: true,
        status: true,
        userId: true
      } 
    });
    return NextResponse.json(npcs);
  } catch (e) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: (e as Error).message }, { status: 500 });
  }
}
