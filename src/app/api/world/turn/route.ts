import { NextResponse } from 'next/server';
import { advanceWorldTime } from '@/lib/services/worldEngine';

export async function POST() {
  try {
    const result = await advanceWorldTime();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
