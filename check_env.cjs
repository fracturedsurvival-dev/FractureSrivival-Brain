
require('dotenv').config();
console.log("Checking ElevenLabs API Key...");
if (process.env.ELEVENLABS_API_KEY) {
    console.log("ELEVENLABS_API_KEY is SET.");
    console.log("Length:", process.env.ELEVENLABS_API_KEY.length);
} else {
    console.log("ELEVENLABS_API_KEY is NOT SET.");
}
