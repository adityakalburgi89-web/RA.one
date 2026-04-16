import { NextRequest, NextResponse } from 'next/server';
import { transcribeSarvamAudio } from '@/lib/sarvam';
import { LanguageCode } from '@/types/chat';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const language = (formData.get('language') as LanguageCode) || 'kn-IN';

    if (!file) {
      return NextResponse.json(
        { error: 'Audio file is required for transcription', status: 'error' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const transcript = await transcribeSarvamAudio(buffer, file.name || 'audio.webm', language);

    if (!transcript) {
      return NextResponse.json(
        { error: 'Could not transcribe speech. Speak clearly and try again.', status: 'error' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      transcript: transcript,
      language: language,
      status: 'success',
    });
  } catch (error) {
    console.error('[API /api/transcribe] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error during transcription', status: 'error' },
      { status: 500 }
    );
  }
}
