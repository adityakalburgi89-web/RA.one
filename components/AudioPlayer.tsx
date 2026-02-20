'use client';

import React from 'react';
import { Volume2, Play, Pause, Loader2, AlertCircle } from 'lucide-react';
import { PlaybackState } from '@/types/chat';

interface AudioPlayerProps {
  state: PlaybackState;
  onTogglePlay: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ state, onTogglePlay }) => {
  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={onTogglePlay}
        disabled={state === 'loading'}
        className={`px-3 py-1 rounded-full border transition-all duration-300 flex items-center gap-2 cursor-pointer text-xs font-serif shadow-md ${
          state === 'speaking'
            ? 'border-gold-glow bg-royalRed-dark text-gold-glow shadow-gold-glow font-bold'
            : state === 'paused'
            ? 'border-amber-400/80 bg-obsidian-900 text-amber-300 hover:bg-royalRed-dark'
            : state === 'error'
            ? 'border-red-500 bg-red-950 text-red-200'
            : 'border-gold-antique/50 bg-obsidian-950/80 text-gold-antique hover:border-gold-glow hover:text-gold-glow hover:bg-obsidian-900'
        } ${state === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}`}
        title={
          state === 'speaking'
            ? 'Pause Royal Decree'
            : state === 'paused'
            ? 'Resume Speech'
            : 'Play Royal Decree Audio (Sarvam Bulbul V3)'
        }
      >
        {state === 'loading' && <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-glow" />}

        {state === 'speaking' && (
          <>
            <Volume2 className="w-3.5 h-3.5 text-gold-glow animate-pulse" />
            
            {/* Animated Golden Sound Waveform Bars */}
            <div className="flex items-center gap-0.5 h-3">
              <span className="w-0.5 h-full bg-gold-glow animate-[bounce_0.6s_infinite]" />
              <span className="w-0.5 h-2/3 bg-gold-glow animate-[bounce_0.4s_infinite]" />
              <span className="w-0.5 h-full bg-gold-glow animate-[bounce_0.8s_infinite]" />
              <span className="w-0.5 h-1/2 bg-gold-glow animate-[bounce_0.5s_infinite]" />
            </div>

            <span className="hidden sm:inline">Chanting...</span>
          </>
        )}

        {state === 'paused' && (
          <>
            <Pause className="w-3.5 h-3.5 text-amber-300" />
            <span>Paused</span>
          </>
        )}

        {state === 'play' && (
          <>
            <Play className="w-3.5 h-3.5 text-gold-glow fill-gold-glow" />
            <span>Replay Decree</span>
          </>
        )}

        {state === 'error' && (
          <>
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            <span>Retry Audio</span>
          </>
        )}
      </button>
    </div>
  );
};
