import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { generateWorldEvent } from '@/lib/services/worldEngine';

export async function POST(req: Request) {
  try {
    const { title, description, type, generate } = await req.json();

    if (generate) {
      const event = await generateWorldEvent();
      return NextResponse.json(event);
    }

    const event = await prisma.worldEvent.create({
      data: { title, description, type }
    });
    return NextResponse.json(event);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
