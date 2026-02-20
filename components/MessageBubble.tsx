'use client';

import React from 'react';
import { Message, PlaybackState } from '@/types/chat';
import { AudioPlayer } from '@/components/AudioPlayer';
import { Crown, User, Scroll } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isActiveAudio?: boolean;
  playbackState?: PlaybackState;
  onPlayAudio?: (message: Message) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isActiveAudio = false,
  playbackState = 'play',
  onPlayAudio,
}) => {
  const isRavana = message.role === 'ravana';

  const currentBubbleState: PlaybackState = isActiveAudio ? playbackState : 'play';

  return (
    <div
      className={`w-full flex my-3 transition-all duration-500 ${
        isRavana ? 'justify-start' : 'justify-end'
      }`}
    >
      <div
        className={`relative max-w-[90%] sm:max-w-[80%] rounded-xl p-4 sm:p-5 shadow-2xl transition-all duration-500 ${
          isRavana
            ? isActiveAudio && currentBubbleState === 'speaking'
              ? 'bg-gradient-to-b from-royalRed-dark to-royalRed-darkest border-2 border-gold-glow text-gold-light shadow-gold-glow scale-[1.01] rounded-tl-none'
              : 'bg-gradient-to-b from-royalRed-dark to-royalRed-darkest border-2 border-gold-antique text-gold-light shadow-red-glow rounded-tl-none'
            : 'bg-parchment-gradient border-2 border-parchment-border text-parchment-ink shadow-inner-parchment rounded-tr-none'
        }`}
      >
        {/* Ornate Corner Accents */}
        {isRavana ? (
          <>
            <div className="absolute top-1 left-1.5 text-gold-antique/50 text-[10px] select-none font-serif">
              ❖
            </div>
            <div className="absolute top-1 right-1.5 text-gold-antique/50 text-[10px] select-none font-serif">
              ❖
            </div>
            <div className="absolute bottom-1 left-1.5 text-gold-antique/50 text-[10px] select-none font-serif">
              ❖
            </div>
            <div className="absolute bottom-1 right-1.5 text-gold-antique/50 text-[10px] select-none font-serif">
              ❖
            </div>
          </>
        ) : (
          <>
            <div className="absolute top-1 left-1.5 text-gold-bronze/40 text-[10px] select-none font-serif">
              ❧
            </div>
            <div className="absolute top-1 right-1.5 text-gold-bronze/40 text-[10px] select-none font-serif">
              ❧
            </div>
          </>
        )}

        {/* Sender Header Banner */}
        <div className="flex items-center justify-between gap-2 border-b pb-2 mb-2.5 border-opacity-30 border-gold-antique">
          <div className="flex items-center gap-2">
            {isRavana ? (
              <div className="p-1 rounded-full bg-gold/20 border border-gold-glow">
                <Crown className="w-4 h-4 text-gold-glow" />
              </div>
            ) : (
              <div className="p-1 rounded-full bg-obsidian-900/10 border border-parchment-ink/30">
                <User className="w-4 h-4 text-parchment-ink" />
              </div>
            )}
            <span
              className={`font-serif text-xs font-bold tracking-wider uppercase ${
                isRavana ? 'text-gold-glow' : 'text-obsidian-900'
              }`}
            >
              {isRavana ? 'KING RAVANA • ಲಂಕೇಶ್ವರ' : 'MORTAL SEEKER'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* AudioPlayer for Ravana Messages */}
            {isRavana && onPlayAudio && (
              <AudioPlayer
                state={currentBubbleState}
                onTogglePlay={() => onPlayAudio(message)}
              />
            )}

            <div className="flex items-center gap-1 opacity-70">
              <Scroll className={`w-3 h-3 ${isRavana ? 'text-gold-antique' : 'text-parchment-ink'}`} />
              <span className={`text-[10px] font-serif ${isRavana ? 'text-gold-antique' : 'text-parchment-ink/80'}`}>
                {typeof message.timestamp === 'string'
                  ? message.timestamp
                  : message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div
          className={`font-serif text-sm sm:text-base leading-relaxed whitespace-pre-wrap ${
            isRavana
              ? 'text-gold-light tracking-wide font-normal'
              : 'text-obsidian-950 font-medium'
          }`}
        >
          {message.content}
        </div>

        {/* Bottom Decorative Scroll Tail */}
        {isRavana && (
          <div className="mt-3 pt-2 border-t border-gold-antique/20 flex items-center justify-between text-[10px] text-gold-antique/60 font-serif">
            <span>⚜ Golden Lanka Royal Decree</span>
            <span>ॐ नमः शिवाय</span>
          </div>
        )}
      </div>
    </div>
  );
};
