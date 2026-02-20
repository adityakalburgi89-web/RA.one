'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Message, LanguageCode, RavanaStatus, PlaybackState } from '@/types/chat';
import { LANGUAGES } from '@/lib/languages';
import { MessageBubble } from '@/components/MessageBubble';
import { VoiceButton } from '@/components/VoiceButton';
import { VoiceSettingsModal, VoiceSettingsConfig } from '@/components/VoiceSettings';
import {
  Send,
  Sparkles,
  Flame,
  HelpCircle,
  RefreshCw,
  Crown,
  Settings
} from 'lucide-react';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  selectedLanguage: LanguageCode;
  status: RavanaStatus;
  activeAudioMessageId: string | null;
  playbackState: PlaybackState;
  onPlayAudio: (message: Message) => void;
  onSelectSampleQuestion: (question: string) => void;
  onResetChat: () => void;
  voiceConfig: VoiceSettingsConfig;
  onChangeVoiceConfig: (config: VoiceSettingsConfig) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onSendMessage,
  selectedLanguage,
  status,
  activeAudioMessageId,
  playbackState,
  onPlayAudio,
  onSelectSampleQuestion,
  onResetChat,
  voiceConfig,
  onChangeVoiceConfig,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const langConfig = LANGUAGES[selectedLanguage] || LANGUAGES['kn-IN'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, status, activeAudioMessageId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && status !== 'thinking') {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-obsidian-900/90 border-2 border-gold-antique/60 rounded-2xl overflow-hidden shadow-gold-glow relative max-w-4xl mx-auto my-2">
      {/* Ancient Parchment Watermark Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Top Conversation Header */}
      <div className="bg-gradient-to-r from-obsidian-950 via-royalRed-darkest to-obsidian-950 p-3 sm:p-4 border-b border-gold-antique/50 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              status === 'speaking'
                ? 'bg-emerald-400 animate-ping'
                : status === 'thinking'
                ? 'bg-amber-400 animate-ping'
                : 'bg-gold-glow'
            }`}
          />
          <span className="font-serif text-gold-glow text-xs sm:text-sm font-bold uppercase tracking-wider">
            {langConfig.name} • Dialogue with Ravana
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice Settings Modal Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            title="Voice Settings"
            className="p-1.5 rounded-full border border-gold-antique/40 bg-obsidian-900 text-gold-antique hover:border-gold-glow hover:text-gold-glow transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Clear / New Chat Action Button */}
          <button
            onClick={onResetChat}
            title="New Conversation / Clear Chat"
            className="px-2.5 py-1 rounded-full border border-gold-antique/40 bg-obsidian-900 text-gold-antique text-xs font-serif hover:border-gold hover:text-gold hover:bg-royalRed-dark transition-all flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>

      {/* Main Conversation Scroll View */}
      <div className="flex-1 p-3 sm:p-5 overflow-y-auto min-h-[360px] max-h-[520px] space-y-4 relative scrollbar-thin scrollbar-thumb-gold-dark scrollbar-track-obsidian-950">
        {/* EMPTY STATE */}
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-full border-2 border-gold-glow bg-royalRed-dark flex items-center justify-center shadow-gold-glow animate-pulse">
                <Crown className="w-9 h-9 text-gold-glow" />
              </div>
            </div>

            <h3 className="font-serif text-gold-glow text-lg sm:text-xl font-bold mb-2">
              {langConfig.greeting}
            </h3>

            <p className="text-gold-antique/80 font-serif text-xs sm:text-sm max-w-lg mb-6 leading-relaxed">
              The Ten-Headed Emperor of Lanka awaits your inquiry. Speak your query aloud using the microphone or ask of Vedic philosophy, warfare, and music.
            </p>

            {/* Suggested Prompt Cards */}
            <div className="w-full max-w-xl">
              <div className="flex items-center gap-1.5 justify-center text-gold-antique/70 text-xs font-serif mb-3">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Suggested Queries for King Ravana</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {langConfig.sampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectSampleQuestion(q)}
                    className="p-3 text-left rounded-xl border border-gold-antique/30 bg-obsidian-950/80 hover:border-gold-glow hover:bg-royalRed-dark/50 text-gold-light text-xs font-serif transition-all duration-300 shadow-md group flex items-start justify-between gap-2 cursor-pointer"
                  >
                    <span>"{q}"</span>
                    <Sparkles className="w-3.5 h-3.5 text-gold-antique group-hover:text-gold-glow shrink-0 mt-0.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* MESSAGE HISTORY */
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isActiveAudio={msg.id === activeAudioMessageId}
              playbackState={playbackState}
              onPlayAudio={onPlayAudio}
            />
          ))
        )}

        {/* THINKING STATE INDICATOR */}
        {status === 'thinking' && (
          <div className="flex justify-start my-3">
            <div className="bg-royalRed-darkest border border-gold-antique rounded-xl p-3.5 text-gold-glow flex items-center gap-3 shadow-gold-glow">
              <Flame className="w-5 h-5 text-gold-glow animate-bounce" />
              <div className="flex flex-col">
                <span className="font-serif text-xs font-bold tracking-wider uppercase">
                  KING RAVANA IS PONDERing...
                </span>
                <span className="text-[11px] text-gold-antique/70 italic font-serif">
                  Consulting the 4 Vedas & 6 Shastras
                </span>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <span className="w-2 h-2 rounded-full bg-gold-glow animate-ping" />
                <span className="w-2 h-2 rounded-full bg-gold-glow animate-ping delay-150" />
                <span className="w-2 h-2 rounded-full bg-gold-glow animate-ping delay-300" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Decorative Ornate Line Separator */}
      <div className="h-[2px] w-full bg-gradient-to-r from-gold-dark via-gold-glow to-gold-dark" />

      {/* VOICE-FIRST HERO INPUT FORM AREA */}
      <div className="p-3 sm:p-4 bg-gradient-to-t from-obsidian-950 to-obsidian-900 flex flex-col sm:flex-row items-center gap-3 z-10">
        {/* PRIMARY ACTION: VoiceButton */}
        <div className="w-full sm:w-auto flex justify-center shrink-0">
          <VoiceButton
            selectedLanguage={selectedLanguage}
            onTranscript={(transcript) => onSendMessage(transcript)}
            isRavanaSpeaking={status === 'speaking'}
            disabled={status === 'thinking'}
          />
        </div>

        {/* SECONDARY ACTION: Text Area Input */}
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2 w-full">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={langConfig.placeholder}
            disabled={status === 'thinking'}
            className="w-full bg-obsidian-950 border-2 border-gold-antique/50 focus:border-gold-glow rounded-xl px-4 py-2.5 text-gold-light placeholder-gold-antique/40 font-serif text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 shadow-inner transition-all"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || status === 'thinking'}
            className={`p-2.5 rounded-xl bg-gold-gradient border border-gold-glow text-obsidian-950 font-bold flex items-center justify-center shadow-gold-glow transition-all shrink-0 ${
              !inputText.trim() || status === 'thinking'
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-105 active:scale-95 cursor-pointer'
            }`}
            title="Send Text Message"
          >
            <Send className="w-4 h-4 text-obsidian-950" />
          </button>
        </form>
      </div>

      {/* Voice Settings Modal */}
      <VoiceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={voiceConfig}
        onChangeConfig={onChangeVoiceConfig}
      />
    </div>
  );
};
