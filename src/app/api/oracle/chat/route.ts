import { NextResponse } from 'next/server';
import { chat } from '@/lib/services/oracle';

export async function POST(req: Request) {
  try {
    const { query, model } = await req.json();
    const response = await chat(query, model);
    return NextResponse.json({ response });
  } catch (e) {
    return NextResponse.json({ response: `ERROR: ${(e as Error).message}` }, { status: 500 });
  }
}
