import { NextRequest, NextResponse } from 'next/server';
import { generateSarvamAudio } from '@/lib/sarvam';
import { LanguageCode } from '@/types/chat';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, language = 'kn-IN' } = body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return NextResponse.json(
        { error: 'Text is required for TTS', status: 'error' },
        { status: 400 }
      );
    }

    const langCode = (language as LanguageCode) || 'kn-IN';
    const audioDataUrl = await generateSarvamAudio(text, langCode);

    if (!audioDataUrl) {
      return NextResponse.json(
        { error: 'Failed to synthesize voice with Sarvam AI', status: 'error' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      audio: audioDataUrl,
      status: 'success',
    });
  } catch (error) {
    console.error('[API /api/tts] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error during voice synthesis', status: 'error' },
      { status: 500 }
    );
  }
}
