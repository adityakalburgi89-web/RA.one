import { NextRequest, NextResponse } from 'next/server';
import { generateRavanaResponse } from '@/lib/gemini';
import { LanguageCode, ApiChatResponse, ApiChatMessage } from '@/types/chat';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, language = 'kn-IN' } = body;

    const langCode = (language as LanguageCode) || 'kn-IN';

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        {
          text: 'Speak clearly, mortal seeker. Do not send empty words across the celestial void.',
          language: langCode,
          error: 'Messages array is required',
        } as ApiChatResponse,
        { status: 400 }
      );
    }

    // Call Gemini API backend with isolated Ravana persona and chat history
    const replyText = await generateRavanaResponse(messages as ApiChatMessage[], langCode);

    return NextResponse.json({
      text: replyText,
      language: langCode,
    } as ApiChatResponse);
  } catch (error) {
    console.error('[API /api/chat] Error:', error);
    return NextResponse.json(
      {
        text: 'A disturbance echoes through the skies of Lanka. Speak your query once again.',
        language: 'kn-IN',
        error: 'Internal Server Error',
      } as ApiChatResponse,
      { status: 500 }
    );
  }
}
