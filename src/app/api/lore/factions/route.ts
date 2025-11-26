import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const blobs = await prisma.textBlob.findMany({ where: { category: 'FACTION' } });
    return NextResponse.json(
      blobs.map(b => ({ id: b.id, slug: b.slug, content: b.content }))
    );
  } catch (e) {
    return NextResponse.json({ error: 'DB_UNAVAILABLE', message: (e as Error).message }, { status: 500 });
  }
}
