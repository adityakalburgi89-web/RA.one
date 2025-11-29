export type MessageRole = 'user' | 'ravana' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date | string;
  language?: string;
  audioUrl?: string;
}

export type LanguageCode = 'hi-IN' | 'kn-IN' | 'te-IN' | 'ta-IN' | 'en-IN';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  greeting: string;
  placeholder: string;
  scriptSymbol: string;
  sampleQuestions: string[];
}

export type RavanaStatus = 'idle' | 'thinking' | 'speaking';

export type PlaybackState = 'speaking' | 'paused' | 'play' | 'error' | 'loading';

export interface ApiChatMessage {
  role: 'user' | 'ravana' | 'assistant' | 'system';
  content: string;
}

export interface ApiChatRequest {
  messages: ApiChatMessage[];
  language: LanguageCode;
}

export interface ApiChatResponse {
  text: string;
  language: LanguageCode;
  error?: string;
}
