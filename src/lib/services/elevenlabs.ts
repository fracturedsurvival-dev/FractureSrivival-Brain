
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const DEFAULT_VOICE_ID = 'BHX0lrYA4CDdR45N7ynF'; // User provided voice ID

export async function generateVoice(text: string, voiceId: string = DEFAULT_VOICE_ID): Promise<ArrayBuffer | null> {
  if (!ELEVENLABS_API_KEY) {
    console.error('ELEVENLABS_API_KEY is missing in environment variables');
    return null;
  }

  console.log(`Generating voice for: "${text.substring(0, 20)}..." with ID: ${voiceId}`);

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ElevenLabs API Error (${response.status}):`, errorText);
      return null;
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('Failed to generate voice:', error);
    return null;
  }
}
