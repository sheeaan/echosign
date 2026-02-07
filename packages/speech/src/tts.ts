import tts from '@google-cloud/text-to-speech';
import { DEFAULT_TTS_CONFIG, type TTSConfig } from './config.js';
import { existsSync } from 'fs';
import { resolve } from 'path';

// Only initialize client if credentials are available
let client: InstanceType<typeof tts.TextToSpeechClient> | null = null;
const keyPath = resolve('./sa-key.json');

if (existsSync(keyPath)) {
  client = new tts.TextToSpeechClient({ keyFilename: keyPath });
} else {
  console.warn('⚠️  Google Cloud service account key (sa-key.json) not found. TTS will return silent audio.');
}

function wrapSSML(text: string, rate: number, pitch: number): string {
  return `<speak>
  <prosody rate="${rate}" pitch="${pitch}st">
    <emphasis level="strong">Emergency Alert.</emphasis>
    <break time="300ms"/>
    ${text}
  </prosody>
</speak>`;
}

export async function synthesize(
  text: string,
  profile?: Partial<TTSConfig>,
): Promise<{ audioContent: Buffer; format: string }> {
  // If no credentials, return silent MP3
  if (!client) {
    // Return a minimal silent MP3 buffer
    return {
      audioContent: Buffer.from([]),
      format: 'mp3',
    };
  }

  const config = { ...DEFAULT_TTS_CONFIG, ...profile };
  const ssml = wrapSSML(text, config.speakingRate, config.pitch);

  const [response] = await client.synthesizeSpeech({
    input: { ssml },
    voice: {
      languageCode: config.languageCode,
      name: config.voiceName,
    },
    audioConfig: {
      audioEncoding: config.audioEncoding as 'MP3',
      speakingRate: config.speakingRate,
      pitch: config.pitch,
    },
  });

  return {
    audioContent: Buffer.from(response.audioContent as Uint8Array),
    format: config.audioEncoding.toLowerCase(),
  };
}
