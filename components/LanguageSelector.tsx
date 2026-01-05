'use client';

import React from 'react';
import { LANGUAGES } from '@/lib/languages';
import { LanguageCode } from '@/types/chat';
import { Globe, Languages } from 'lucide-react';

interface LanguageSelectorProps {
  selectedLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelectLanguage,
  disabled = false,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto my-2 px-2">
      {/* Header Label */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-gold-antique/60" />
        <div className="flex items-center gap-1.5 text-gold-antique text-xs uppercase font-serif tracking-widest">
          <Languages className="w-3.5 h-3.5 text-gold" />
          <span>Select Royal Tongue / भाषा चयन</span>
        </div>
        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-gold-antique/60" />
      </div>

      {/* Language Selector Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {Object.values(LANGUAGES).map((lang) => {
          const isSelected = selectedLanguage === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => !disabled && onSelectLanguage(lang.code)}
              disabled={disabled}
              className={`relative px-3.5 py-1.5 rounded-full border transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'border-gold-glow bg-royalRed-dark text-gold-light shadow-gold-glow scale-105 font-bold'
                  : 'border-gold-antique/40 bg-obsidian-800/90 text-gold-antique/80 hover:border-gold hover:text-gold hover:bg-obsidian-700'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="text-sm font-bold text-gold-glow">{lang.scriptSymbol}</span>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-xs font-serif">{lang.nativeName}</span>
                <span className="text-[10px] text-gold-antique/70 font-sans">{lang.name}</span>
              </div>
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-gold-glow animate-ping" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
