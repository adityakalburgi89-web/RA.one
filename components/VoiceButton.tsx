'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, AlertCircle, Volume2 } from 'lucide-react';
import { LanguageCode } from '@/types/chat';

interface VoiceButtonProps {
  selectedLanguage: LanguageCode;
  onTranscript: (transcript: string) => void;
  isRavanaSpeaking?: boolean;
  disabled?: boolean;
}

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  selectedLanguage,
  onTranscript,
  isRavanaSpeaking = false,
  disabled = false,
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Update voice state if Ravana starts speaking
  useEffect(() => {
    if (isRavanaSpeaking && voiceState === 'idle') {
      setVoiceState('speaking');
    } else if (!isRavanaSpeaking && voiceState === 'speaking') {
      setVoiceState('idle');
    }
  }, [isRavanaSpeaking, voiceState]);

  // Clean up recording stream on unmount
  useEffect(() => {
    return () => {
      stopMediaStream();
    };
  }, []);

  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
    }
  };

  const startRecording = async () => {
    if (disabled || voiceState === 'listening' || voiceState === 'processing') return;

    setErrorMessage(null);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all audio tracks immediately to prevent memory leaks
        stopMediaStream();

        if (audioChunksRef.current.length === 0) {
          setVoiceState('idle');
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        audioChunksRef.current = [];
        await handleUploadAudio(audioBlob);
      };

      mediaRecorder.start(250);
      setVoiceState('listening');
    } catch (err: any) {
      console.error('Error starting voice recording:', err);
      stopMediaStream();
      setVoiceState('error');
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Microphone permission denied.'
          : 'Could not access microphone.'
      );
      setTimeout(() => {
        setVoiceState('idle');
        setErrorMessage(null);
      }, 3500);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && voiceState === 'listening') {
      setVoiceState('processing');
      mediaRecorderRef.current.stop();
    }
  };

  const handleUploadAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'speech.webm');
      formData.append('language', selectedLanguage);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data && data.status === 'success' && data.transcript) {
        setVoiceState('idle');
        onTranscript(data.transcript);
      } else {
        setVoiceState('error');
        setErrorMessage(data.error || 'Could not transcribe speech. Speak clearly.');
        setTimeout(() => {
          setVoiceState('idle');
          setErrorMessage(null);
        }, 3500);
      }
    } catch (err) {
      console.error('Transcription POST error:', err);
      setVoiceState('error');
      setErrorMessage('Network error transcribing speech.');
      setTimeout(() => {
        setVoiceState('idle');
        setErrorMessage(null);
      }, 3500);
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Dynamic Status Banner above Mic Button */}
      {voiceState === 'listening' && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-royalRed-dark border border-gold-glow px-3 py-1 rounded-full text-gold-glow text-xs font-serif shadow-gold-glow flex items-center gap-2 z-30 whitespace-nowrap animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>🔴 LISTENING... Speak now</span>
        </div>
      )}

      {voiceState === 'processing' && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-obsidian-900 border border-gold-antique px-3 py-1 rounded-full text-gold-light text-xs font-serif shadow-md flex items-center gap-2 z-30 whitespace-nowrap">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-glow" />
          <span>◌ THINKING... Transcribing speech</span>
        </div>
      )}

      {voiceState === 'speaking' && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-royalRed-darkest border border-gold-glow px-3 py-1 rounded-full text-gold-glow text-xs font-serif shadow-gold-glow flex items-center gap-1.5 z-30 whitespace-nowrap animate-pulse">
          <Volume2 className="w-3.5 h-3.5 text-gold-glow" />
          <span>🔊 RAVANA SPEAKING</span>
        </div>
      )}

      {voiceState === 'error' && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-950 border border-red-500 px-3 py-1 rounded-full text-red-200 text-[11px] font-serif shadow-md flex items-center gap-1.5 z-30 whitespace-nowrap">
          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
          <span>⚠️ {errorMessage || 'Error accessing voice'}</span>
        </div>
      )}

      {/* Primary Voice Interaction Button */}
      {voiceState === 'idle' && (
        <button
          type="button"
          onClick={startRecording}
          disabled={disabled}
          title="Press to Speak to King Ravana (Sarvam Saaras STT)"
          className={`relative px-4 py-2.5 rounded-full border-2 border-gold-glow bg-gradient-to-r from-royalRed-dark via-obsidian-900 to-royalRed-dark text-gold-glow font-serif text-xs sm:text-sm font-bold flex items-center gap-2 shadow-gold-glow transition-all duration-300 group cursor-pointer ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
          }`}
        >
          <div className="p-1 rounded-full bg-gold-dark/40 border border-gold-glow group-hover:scale-110 transition-transform">
            <Mic className="w-4 h-4 text-gold-glow" />
          </div>
          <span className="tracking-wider uppercase">TAP TO SPEAK</span>
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-glow opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold-glow"></span>
          </span>
        </button>
      )}

      {/* Listening State Recording Active Button */}
      {voiceState === 'listening' && (
        <button
          type="button"
          onClick={stopRecording}
          title="Click to Stop Recording & Send Speech"
          className="relative px-5 py-2.5 rounded-full border-2 border-red-500 bg-royalRed-dark text-gold-glow font-serif text-xs sm:text-sm font-bold flex items-center gap-2 shadow-red-glow transition-all duration-300 cursor-pointer animate-pulse scale-105"
        >
          <Square className="w-4 h-4 fill-gold-glow text-gold-glow" />
          <span className="tracking-wider uppercase">STOP & SEND</span>
        </button>
      )}

      {/* Processing State Button */}
      {voiceState === 'processing' && (
        <button
          type="button"
          disabled
          className="px-5 py-2.5 rounded-full border-2 border-gold-antique/40 bg-obsidian-950 text-gold-glow font-serif text-xs sm:text-sm font-bold flex items-center gap-2 shrink-0 cursor-not-allowed opacity-80"
        >
          <Loader2 className="w-4 h-4 animate-spin text-gold-glow" />
          <span>TRANSCRIBING...</span>
        </button>
      )}

      {/* Ravana Speaking State Button */}
      {voiceState === 'speaking' && (
        <button
          type="button"
          onClick={startRecording}
          disabled={disabled}
          title="Interrupt & Speak to King Ravana"
          className="px-4 py-2.5 rounded-full border-2 border-gold-glow bg-royalRed-dark text-gold-glow font-serif text-xs sm:text-sm font-bold flex items-center gap-2 shadow-gold-glow transition-all duration-300 cursor-pointer hover:scale-105"
        >
          <Volume2 className="w-4 h-4 text-gold-glow animate-bounce" />
          <span>SPEAK AGAIN</span>
        </button>
      )}

      {/* Error State Button */}
      {voiceState === 'error' && (
        <button
          type="button"
          onClick={() => setVoiceState('idle')}
          className="px-4 py-2.5 rounded-full border-2 border-red-500 bg-red-950 text-red-200 font-serif text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer"
        >
          <AlertCircle className="w-4 h-4 text-red-400 animate-bounce" />
          <span>RETRY VOICE</span>
        </button>
      )}
    </div>
  );
};
