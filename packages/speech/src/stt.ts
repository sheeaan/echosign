import speech from '@google-cloud/speech';
import { DEFAULT_STT_CONFIG, type STTConfig } from './config.js';
import { existsSync } from 'fs';
import { resolve } from 'path';

// Only initialize client if credentials are available
let client: speech.SpeechClient | null = null;
const keyPath = resolve('./sa-key.json');

if (existsSync(keyPath)) {
  client = new speech.SpeechClient({ keyFilename: keyPath });
} else {
  console.warn('⚠️  Google Cloud service account key (sa-key.json) not found. STT will return mock responses.');
}

export async function recognizeBatch(
  audioBuffer: Buffer,
  config?: Partial<STTConfig>,
): Promise<{ transcript: string; confidence: number }> {
  // If no credentials, return mock response
  if (!client) {
    return {
      transcript: 'Mock transcript - Google Cloud credentials not configured',
      confidence: 0.85,
    };
  }

  const mergedConfig = { ...DEFAULT_STT_CONFIG, ...config };

  const [response] = await client.recognize({
    config: {
      encoding: mergedConfig.encoding as 'WEBM_OPUS',
      sampleRateHertz: mergedConfig.sampleRateHertz,
      languageCode: mergedConfig.languageCode,
      model: mergedConfig.model,
      useEnhanced: mergedConfig.useEnhanced,
      enableAutomaticPunctuation: mergedConfig.enableAutomaticPunctuation,
      speechContexts: mergedConfig.speechContexts,
    },
    audio: {
      content: audioBuffer.toString('base64'),
    },
  });

  const results = response.results ?? [];
  if (results.length === 0) {
    return { transcript: '', confidence: 0 };
  }

  const best = results[0].alternatives?.[0];
  return {
    transcript: best?.transcript ?? '',
    confidence: best?.confidence ?? 0,
  };
}
