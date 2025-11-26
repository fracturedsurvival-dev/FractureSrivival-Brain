import { NextResponse } from 'next/server';
import { executeAttack } from '@/lib/services/combatSystem';

export async function POST(req: Request) {
  try {
    const { attackerId, defenderId } = await req.json();
    
    if (!attackerId || !defenderId) {
      return NextResponse.json({ error: 'MISSING_COMBATANTS' }, { status: 400 });
    }

    const result = await executeAttack(attackerId, defenderId);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
