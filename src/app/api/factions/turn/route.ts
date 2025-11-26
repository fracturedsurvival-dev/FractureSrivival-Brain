import { NextResponse } from 'next/server';
import { evaluateFactionTurn } from '@/lib/services/factionSystem';

export async function POST(req: Request) {
  try {
    const { factionId } = await req.json();
    
    if (!factionId) {
      return NextResponse.json({ error: 'FACTION_ID_REQUIRED' }, { status: 400 });
    }

    const result = await evaluateFactionTurn(factionId);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
