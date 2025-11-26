
import { NextResponse } from 'next/server';
import { generateVoice } from '@/lib/services/elevenlabs';

export async function POST(request: Request) {
  try {
    const { text, voiceId } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const audioBuffer = await generateVoice(text, voiceId);

    if (!audioBuffer) {
      console.error('Voice generation failed - check server logs for details');
      return NextResponse.json({ 
        error: 'Failed to generate audio', 
        details: 'Check server console for ElevenLabs API error' 
      }, { status: 500 });
    }

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error: any) {
    console.error('Voice API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}
