'use client';

import React from 'react';
import Image from 'next/image';
import { RavanaStatus } from '@/types/chat';
import { Sparkles, Crown, Flame, Volume2 } from 'lucide-react';

interface RavanaAvatarProps {
  status: RavanaStatus;
  currentLanguageName: string;
}

export const RavanaAvatar: React.FC<RavanaAvatarProps> = ({ status, currentLanguageName }) => {
  return (
    <div className="flex flex-col items-center justify-center p-3 sm:p-4 relative select-none">
      {/* Outer Ornate Filigree Frame */}
      <div className="relative group">
        {/* Dynamic Glow Aura & Halo behind frame */}
        <div
          className={`absolute -inset-3 rounded-full opacity-70 blur-xl transition-all duration-700 ${
            status === 'speaking'
              ? 'bg-gradient-to-r from-gold-glow via-royalRed-orange to-gold-glow scale-110 animate-pulse'
              : status === 'thinking'
              ? 'bg-gold-glow scale-105 animate-pulse'
              : 'bg-gold-dark/30'
          }`}
        />

        {/* Ancient Indian Manuscript Arch Frame */}
        <div
          className={`relative border-4 transition-all duration-700 bg-obsidian-950 p-2 sm:p-2.5 rounded-t-full rounded-b-2xl shadow-gold-glow max-w-[220px] sm:max-w-[260px] ${
            status === 'speaking'
              ? 'border-gold-glow ring-4 ring-gold-glow/40 shadow-gold-glow'
              : 'border-gold-antique'
          }`}
        >
          {/* Top Temple Arch Crown */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-obsidian-900 border-2 border-gold-antique px-3 py-1 rounded-full text-gold flex items-center gap-1.5 shadow-md z-20">
            <Crown className="w-4 h-4 text-gold-glow animate-pulse" />
            <span className="text-[10px] sm:text-xs font-serif uppercase tracking-widest text-gold-glow font-bold">
              दशानन रावण
            </span>
          </div>

          {/* Golden Corner Flourishes */}
          <div className="absolute top-2 left-2 text-gold-dark/70 text-xs font-serif pointer-events-none">
            ❖
          </div>
          <div className="absolute top-2 right-2 text-gold-dark/70 text-xs font-serif pointer-events-none">
            ❖
          </div>

          {/* Main Portrait Image Container */}
          <div className="relative w-44 h-52 sm:w-56 sm:h-64 rounded-t-full rounded-b-xl overflow-hidden border-2 border-gold/60">
            <Image
              src="/ravana-avatar.png"
              alt="King Ravana of Lanka"
              fill
              priority
              className={`object-cover object-center transition-all duration-700 ${
                status === 'speaking'
                  ? 'brightness-125 contrast-110 scale-105'
                  : status === 'thinking'
                  ? 'brightness-110 contrast-125 scale-105'
                  : 'brightness-100'
              }`}
            />

            {/* Subtle Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-transparent to-transparent opacity-80" />

            {/* Glowing Chant Runes when Thinking */}
            {status === 'thinking' && (
              <div className="absolute inset-0 bg-gold-dark/25 backdrop-blur-[1px] flex items-center justify-center animate-fade-in">
                <div className="text-center p-2">
                  <Flame className="w-8 h-8 text-gold-glow mx-auto animate-bounce mb-1" />
                  <p className="text-gold-glow font-serif text-xs font-bold tracking-widest uppercase animate-pulse">
                    Consulting 10 Wisdoms...
                  </p>
                </div>
              </div>
            )}

            {/* Animated Royal Speaking Halo Overlay */}
            {status === 'speaking' && (
              <div className="absolute inset-0 bg-royalRed-dark/20 backdrop-blur-[0.5px] flex items-end justify-center pb-3">
                <div className="bg-obsidian-950/90 border border-gold-glow px-3 py-1 rounded-full text-gold-glow text-[11px] font-serif font-bold flex items-center gap-1.5 shadow-gold-glow animate-pulse">
                  <Volume2 className="w-3.5 h-3.5 text-gold-glow animate-bounce" />
                  <span>CHANTING DECREE</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Royal Ribbon Frame */}
          <div className="mt-2 text-center border-t border-gold-antique/40 pt-1.5">
            <h2 className="font-serif text-gold-glow text-xs sm:text-sm font-bold tracking-wider drop-shadow-md uppercase">
              KING RAVANA
            </h2>
            <p className="text-[10px] text-gold-antique/80 font-serif italic">
              Lankeshwar • Master of 10 Wisdoms
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Status Indicator Badge */}
      <div className="mt-3 flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gold-antique/40 bg-royalRed-dark/80 text-gold-light text-xs font-serif shadow-md">
        <span
          className={`w-2 h-2 rounded-full ${
            status === 'speaking'
              ? 'bg-emerald-400 animate-ping'
              : status === 'thinking'
              ? 'bg-amber-400 animate-ping'
              : 'bg-gold-glow'
          }`}
        />
        <span>
          {status === 'speaking'
            ? `Chanting in ${currentLanguageName}...`
            : status === 'thinking'
            ? 'Pondering Seeker\'s Decree...'
            : `Listening in ${currentLanguageName}`}
        </span>
        <Sparkles className="w-3.5 h-3.5 text-gold-glow" />
      </div>
    </div>
  );
};
