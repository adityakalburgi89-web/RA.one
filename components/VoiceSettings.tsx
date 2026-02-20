'use client';

import React from 'react';
import { Settings, X, Volume2, Gauge, Sliders } from 'lucide-react';

export interface VoiceSettingsConfig {
  autoPlay: boolean;
  pace: number;
  pitch: number;
}

interface VoiceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  config: VoiceSettingsConfig;
  onChangeConfig: (newConfig: VoiceSettingsConfig) => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-obsidian-900 border-2 border-gold-antique rounded-2xl p-5 sm:p-6 shadow-gold-glow text-gold-light">
        {/* Top Ornate Header */}
        <div className="flex items-center justify-between border-b border-gold-antique/40 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gold-glow animate-spin-slow" />
            <h3 className="font-serif text-base sm:text-lg font-bold text-gold-glow uppercase tracking-wider">
              Voice Decree Settings • स्वर ನಿಯಂತ್ರಣ
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gold-antique hover:text-gold-glow hover:bg-royalRed-dark transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Form Controls */}
        <div className="space-y-5 font-serif">
          {/* Auto-Play Decree Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-gold-antique/30 bg-obsidian-950/70">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-gold-glow" />
              <div>
                <p className="text-xs sm:text-sm font-bold">Auto-Play Royal Decree</p>
                <p className="text-[11px] text-gold-antique/60">Automatically speak Ravana\'s text responses</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChangeConfig({ ...config, autoPlay: !config.autoPlay })}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center cursor-pointer ${
                config.autoPlay ? 'bg-gold-dark justify-end' : 'bg-obsidian-800 border border-gold-antique/30 justify-start'
              }`}
            >
              <span className={`w-4 h-4 rounded-full transition-transform ${config.autoPlay ? 'bg-gold-glow shadow-gold-glow' : 'bg-gold-antique/50'}`} />
            </button>
          </div>

          {/* Speech Pace / Cadence Slider */}
          <div className="p-3 rounded-xl border border-gold-antique/30 bg-obsidian-950/70 space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-gold-glow" />
                <span>Speech Pace / Tempo</span>
              </div>
              <span className="text-gold-glow font-mono">{config.pace}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.1"
              step="0.05"
              value={config.pace}
              onChange={(e) => onChangeConfig({ ...config, pace: parseFloat(e.target.value) })}
              className="w-full accent-gold-glow bg-obsidian-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gold-antique/60 font-sans">
              <span>0.8x (Majestic Slow)</span>
              <span>1.0x (Standard)</span>
              <span>1.1x (Fast)</span>
            </div>
          </div>

          {/* Pitch Tone Selector */}
          <div className="p-3 rounded-xl border border-gold-antique/30 bg-obsidian-950/70 space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold">
              <Sliders className="w-4 h-4 text-gold-glow" />
              <span>Voice Pitch & Resonance</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, pitch: -0.05 })}
                className={`py-2 px-3 rounded-lg border text-xs text-center transition-all cursor-pointer ${
                  config.pitch === -0.05
                    ? 'border-gold-glow bg-royalRed-dark text-gold-glow font-bold shadow-gold-glow'
                    : 'border-gold-antique/30 bg-obsidian-900 text-gold-antique hover:border-gold'
                }`}
              >
                Deep Monarch Tone (-0.05)
              </button>
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, pitch: 0.0 })}
                className={`py-2 px-3 rounded-lg border text-xs text-center transition-all cursor-pointer ${
                  config.pitch === 0.0
                    ? 'border-gold-glow bg-royalRed-dark text-gold-glow font-bold shadow-gold-glow'
                    : 'border-gold-antique/30 bg-obsidian-900 text-gold-antique hover:border-gold'
                }`}
              >
                Natural Human (0.0)
              </button>
            </div>
          </div>
        </div>

        {/* Done Action Button */}
        <div className="mt-6 border-t border-gold-antique/30 pt-3 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gold-gradient text-obsidian-950 font-bold font-serif text-sm hover:scale-[1.02] transition-transform shadow-gold-glow cursor-pointer"
          >
            Apply Voice Settings
          </button>
        </div>
      </div>
    </div>
  );
};
