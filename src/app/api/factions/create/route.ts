import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { name, description } = await req.json();
    const faction = await prisma.faction.create({
      data: { name, description }
    });
    return NextResponse.json(faction);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
