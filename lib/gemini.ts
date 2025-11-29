import { GoogleGenerativeAI, Content } from '@google/generative-ai';
import { getRavanaSystemPrompt, getMockRavanaResponse } from '@/lib/ravana';
import { LanguageCode, ApiChatMessage } from '@/types/chat';

export async function generateRavanaResponse(
  messages: ApiChatMessage[],
  languageCode: LanguageCode
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback to mock response if API key is missing or placeholder
  if (!apiKey || apiKey.trim() === '' || apiKey === 'YOUR_GEMINI_API_KEY') {
    console.log('[Ravana AI] GEMINI_API_KEY not set. Using internal persona fallback.');
    const latestUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    return getMockRavanaResponse(languageCode, latestUserMsg);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const systemInstruction = getRavanaSystemPrompt(languageCode);

    // Initialize model with isolated Ravana system prompt
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction,
    });

    if (!messages || messages.length === 0) {
      return getMockRavanaResponse(languageCode, '');
    }

    // Extract the latest user message
    const latestMessage = messages[messages.length - 1];
    const previousMessages = messages.slice(0, -1);

    // Format previous messages for Gemini Chat History
    const formattedHistory: Content[] = [];

    for (const msg of previousMessages) {
      if (msg.role === 'system') continue;
      const role = msg.role === 'user' ? 'user' : 'model';

      // Ensure proper alternating roles for Gemini SDK
      if (
        formattedHistory.length > 0 &&
        formattedHistory[formattedHistory.length - 1].role === role
      ) {
        // Combine consecutive messages of the same role
        formattedHistory[formattedHistory.length - 1].parts[0].text += `\n${msg.content}`;
      } else {
        formattedHistory.push({
          role: role,
          parts: [{ text: msg.content }],
        });
      }
    }

    // Ensure history starts with 'user' role if not empty
    while (formattedHistory.length > 0 && formattedHistory[0].role !== 'user') {
      formattedHistory.shift();
    }

    // Start chat session with formatted history
    const chat = model.startChat({
      history: formattedHistory,
    });

    const userPrompt = latestMessage.content || 'Greetings King Ravana.';
    const result = await chat.sendMessage(userPrompt);
    const response = await result.response;
    const responseText = response.text();

    if (responseText && responseText.trim()) {
      return responseText.trim();
    }

    return getMockRavanaResponse(languageCode, userPrompt);
  } catch (error) {
    console.error('Gemini API Error:', error);
    const latestUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    return getMockRavanaResponse(languageCode, latestUserMsg);
  }
}
