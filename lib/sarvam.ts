import { LanguageCode } from '@/types/chat';

// Language-specific phonetic replacement dictionary to fix TTS mispronunciations
const PRONUNCIATION_MAP: Record<LanguageCode, Array<[RegExp, string]>> = {
  'en-IN': [
    [/\bRavana\b/gi, 'Raa-va-na'],
    [/\bRavan\b/gi, 'Raa-va-na'],
    [/\bLankeshwar\b/gi, 'Lun-kesh-war'],
    [/\bDashanan\b/gi, 'Da-shaa-nan'],
    [/\bShiva Tandava Stotram\b/gi, 'Shee-va Taan-da-va Stoh-tram'],
    [/\bShiva\b/gi, 'Shee-va'],
    [/\bMahadeva\b/gi, 'Ma-haa-dey-va'],
    [/\bVedas\b/gi, 'Vey-dhas'],
    [/\bShastras\b/gi, 'Shaas-thras'],
    [/\bPushpaka Vimana\b/gi, 'Push-pa-ka Vi-maa-na'],
    [/\bSuvarna Lanka\b/gi, 'Soo-var-na Lun-ka'],
    [/\bRamayana\b/gi, 'Raa-maa-ya-na'],
    [/\bValmiki\b/gi, 'Vaal-mee-kee'],
    [/\bKailash\b/gi, 'Kai-laash'],
    [/\bSamaveda\b/gi, 'Saama-vey-dha'],
  ],
  'hi-IN': [],
  'kn-IN': [],
  'te-IN': [],
  'ta-IN': [],
};

// Expand digits to full native words to avoid mechanical number reading
function expandNumbersToWords(text: string, languageCode: LanguageCode): string {
  if (languageCode === 'hi-IN') {
    return text
      .replace(/\b10\b/g, 'दस')
      .replace(/\b4\b/g, 'चार')
      .replace(/\b6\b/g, 'छह');
  }
  if (languageCode === 'kn-IN') {
    return text
      .replace(/\b10\b/g, 'ಹತ್ತು')
      .replace(/\b4\b/g, 'ನಾಲ್ಕು')
      .replace(/\b6\b/g, 'ಆರು');
  }
  if (languageCode === 'te-IN') {
    return text
      .replace(/\b10\b/g, 'పది')
      .replace(/\b4\b/g, 'నాలుగు')
      .replace(/\b6\b/g, 'ఆరు');
  }
  if (languageCode === 'ta-IN') {
    return text
      .replace(/\b10\b/g, 'பத்து')
      .replace(/\b4\b/g, 'நான்கு')
      .replace(/\b6\b/g, 'ஆறு');
  }
  if (languageCode === 'en-IN') {
    return text
      .replace(/\b10\b/g, 'ten')
      .replace(/\b4\b/g, 'four')
      .replace(/\b6\b/g, 'six');
  }
  return text;
}

/**
 * Pre-processes text to inject natural speech pauses, phonetically correct mispronunciations,
 * and expand numbers so TTS synthesis sounds natural, human, and clear.
 */
export function prepareTextForDramaticSpeech(text: string, languageCode: LanguageCode): string {
  let cleaned = text
    .replace(/[❖ॐ⚜श्री❧]/g, '') // Remove UI ornamentation glyphs
    .replace(/[*_#]/g, '')       // Remove markdown formatting
    .replace(/\s+/g, ' ')
    .trim();

  // Expand numbers to native words
  cleaned = expandNumbersToWords(cleaned, languageCode);

  // Apply phonetic transliteration map for English / target language
  const rules = PRONUNCIATION_MAP[languageCode] || [];
  for (const [pattern, replacement] of rules) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  // Add subtle breathing pauses after titles and greetings
  cleaned = cleaned
    .replace(/(लङ्केश्वर|दशानन|मरणशील|मर्त्यನೇ|ಮಾನవుಡ|மானுடனே|seeker|mortal)/gi, '$1...')
    .replace(/—/g, '... ');

  return cleaned;
}

/**
 * Text-to-Speech (TTS) using Sarvam AI Bulbul V3
 */
export async function generateSarvamAudio(
  text: string,
  languageCode: LanguageCode,
  pace: number = 0.92,
  pitch: number = -0.05
): Promise<string | null> {
  const apiKey = process.env.SARVAM_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    console.warn('[Sarvam AI] SARVAM_API_KEY is missing in environment.');
    return null;
  }

  const cleanText = prepareTextForDramaticSpeech(text, languageCode);
  if (!cleanText) return null;

  // Primary speaker: 'varun' for deep, expressive voice persona
  const speaker = 'varun';

  try {
    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      body: JSON.stringify({
        inputs: [cleanText],
        target_language_code: languageCode,
        speaker: speaker,   // Sarvam AI 'varun' voice
        pitch: pitch,       // Configurable pitch tone
        pace: pace,         // Configurable pace (default 0.92)
        loudness: 1.1,      // Clean loudness avoiding audio clipping
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: 'bulbul:v3',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Sarvam AI TTS] HTTP ${response.status} Error:`, errText);
      return null;
    }

    const data = await response.json();

    if (data && data.audios && data.audios.length > 0) {
      const base64Audio = data.audios[0];
      return `data:audio/wav;base64,${base64Audio}`;
    }

    return null;
  } catch (error) {
    console.error('[Sarvam AI TTS] Speech synthesis failed:', error);
    return null;
  }
}

/**
 * Speech-to-Text (STT) using Sarvam AI Saaras STT API
 * Accepts an audio Buffer and language code, returns transcribed text
 */
export async function transcribeSarvamAudio(
  audioBuffer: Buffer,
  filename: string,
  languageCode: LanguageCode
): Promise<string | null> {
  const apiKey = process.env.SARVAM_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    console.warn('[Sarvam AI STT] SARVAM_API_KEY is missing in environment.');
    return null;
  }

  try {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/webm' });
    formData.append('file', blob, filename || 'recording.webm');
    formData.append('language_code', languageCode);
    formData.append('model', 'saaras:v1');

    const response = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Sarvam AI STT] HTTP ${response.status} Error:`, errText);
      return null;
    }

    const data = await response.json();

    if (data && data.transcript) {
      return data.transcript.trim();
    }

    return null;
  } catch (error) {
    console.error('[Sarvam AI STT] Transcription failed:', error);
    return null;
  }
}
