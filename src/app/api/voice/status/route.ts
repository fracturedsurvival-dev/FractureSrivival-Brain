
import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.ELEVENLABS_API_KEY;
  return NextResponse.json({ 
    configured: !!key, 
    length: key ? key.length : 0,
    firstChar: key ? key[0] : null
  });
}
