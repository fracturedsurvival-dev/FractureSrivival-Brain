import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const blob = await prisma.textBlob.findUnique({ where: { slug: 'world_status' } });
    if (blob) {
      try {
        const parsed = JSON.parse(blob.content);
        return NextResponse.json(parsed);
      } catch {
        return NextResponse.json({ content: blob.content, parseError: true });
      }
    }
    return NextResponse.json({
      status: 'ONLINE',
      world: 'Fractured Survival',
      message: 'Placeholder status until DB seeded.'
    });
  } catch (e) {
    return NextResponse.json({ error: 'DB_UNAVAILABLE', message: (e as Error).message }, { status: 500 });
  }
}
