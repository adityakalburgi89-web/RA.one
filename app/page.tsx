'use client';

import React, { useState, useRef } from 'react';
import { Message, LanguageCode, RavanaStatus, PlaybackState } from '@/types/chat';
import { DEFAULT_LANGUAGE, LANGUAGES } from '@/lib/languages';
import { LanguageSelector } from '@/components/LanguageSelector';
import { RavanaAvatar } from '@/components/RavanaAvatar';
import { ChatWindow } from '@/components/ChatWindow';
import { VoiceSettingsConfig } from '@/components/VoiceSettings';
import RavanSection from '@/components/RavanSection';

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<RavanaStatus>('idle');

  // Voice Settings State
  const [voiceConfig, setVoiceConfig] = useState<VoiceSettingsConfig>({
    autoPlay: true,
    pace: 0.92,
    pitch: -0.05,
  });

  // Audio Playback Manager State
  const [activeAudioMessageId, setActiveAudioMessageId] = useState<string | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('play');
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const currentLanguageObj = LANGUAGES[selectedLanguage] || LANGUAGES['kn-IN'];

  // Stop any currently active audio playback immediately to avoid overlap or memory leaks
  const stopActiveAudio = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current.currentTime = 0;
      activeAudioRef.current = null;
    }
    setActiveAudioMessageId(null);
    setPlaybackState('play');
    setStatus('idle');
  };

  // Synthesize & play voice decree for a Ravana message
  const playAudioForMessage = async (targetMessage: Message) => {
    // Toggle pause/play if clicking the currently active message
    if (activeAudioMessageId === targetMessage.id && activeAudioRef.current) {
      if (playbackState === 'speaking') {
        activeAudioRef.current.pause();
        setPlaybackState('paused');
        setStatus('idle');
      } else if (playbackState === 'paused') {
        activeAudioRef.current.play();
        setPlaybackState('speaking');
        setStatus('speaking');
      }
      return;
    }

    // Stop any previously playing audio
    stopActiveAudio();

    setActiveAudioMessageId(targetMessage.id);
    setPlaybackState('loading');

    let audioSrc = targetMessage.audioUrl;

    // Fetch TTS audio from /api/speak if not already cached
    if (!audioSrc) {
      try {
        const res = await fetch('/api/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: targetMessage.content,
            language: targetMessage.language || selectedLanguage,
            pace: voiceConfig.pace,
            pitch: voiceConfig.pitch,
          }),
        });

        const data = await res.json();

        if (data && data.audio) {
          audioSrc = data.audio;
          // Cache audio URL in message object
          setMessages((prev) =>
            prev.map((m) => (m.id === targetMessage.id ? { ...m, audioUrl: audioSrc } : m))
          );
        } else {
          setPlaybackState('error');
          return;
        }
      } catch (err) {
        console.error('Audio synthesis API error:', err);
        setPlaybackState('error');
        return;
      }
    }

    // Play Audio via HTML5 Audio
    try {
      const audio = new Audio(audioSrc);
      activeAudioRef.current = audio;
      setPlaybackState('speaking');
      setStatus('speaking');

      audio.play();

      audio.onended = () => {
        setPlaybackState('play');
        setStatus('idle');
        setActiveAudioMessageId(null);
        activeAudioRef.current = null;
      };

      audio.onerror = () => {
        setPlaybackState('error');
        setStatus('idle');
        activeAudioRef.current = null;
      };
    } catch (err) {
      console.error('Audio play error:', err);
      setPlaybackState('error');
      setStatus('idle');
    }
  };

  const handleSendMessage = async (text: string) => {
    // Immediately stop any active audio playback when user sends a new message
    stopActiveAudio();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
      language: selectedLanguage,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setStatus('thinking');

    try {
      // Build request payload for POST /api/chat
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          language: selectedLanguage,
        }),
      });

      const data = await res.json();

      if (data && data.text) {
        const ravanaMessageId = (Date.now() + 1).toString();
        const ravanaMessage: Message = {
          id: ravanaMessageId,
          role: 'ravana',
          content: data.text,
          timestamp: new Date(),
          language: data.language || selectedLanguage,
        };

        setMessages((prev) => [...prev, ravanaMessage]);
        setStatus('idle');

        // Automatically synthesize and play Ravana's voice decree if autoPlay is enabled!
        if (voiceConfig.autoPlay) {
          playAudioForMessage(ravanaMessage);
        }
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ravana',
          content: 'A disturbance echoes through the skies of Lanka. Speak your query once again.',
          timestamp: new Date(),
          language: selectedLanguage,
        };
        setMessages((prev) => [...prev, errorMessage]);
        setStatus('idle');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ravana',
        content: 'The celestial realm is momentarily clouded. Speak your question once again.',
        timestamp: new Date(),
        language: selectedLanguage,
      };
      setMessages((prev) => [...prev, errorMessage]);
      setStatus('idle');
    }
  };

  const handleSelectSampleQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handleResetChat = () => {
    stopActiveAudio();
    setMessages([]);
    setStatus('idle');
  };

  return (
    <main className="min-h-screen bg-obsidian-950 text-gold-light flex flex-col justify-between relative selection:bg-gold/30 selection:text-gold-glow">
      {/* Background Royal Ornamentation Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#C5A059_1px,transparent_1px)] [background-size:24px_24px] z-0" />

      {/* TOP HEADER */}
      <header className="relative z-10 pt-5 pb-2 px-4 text-center border-b border-gold-antique/30 bg-gradient-to-b from-obsidian-950 via-obsidian-900 to-transparent">
        {/* Top Royal Crest Icon */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="h-[1px] w-16 sm:w-24 bg-gradient-to-r from-transparent to-gold-glow" />
          <span className="text-gold-glow text-lg font-serif">❖ ॐ ❖</span>
          <div className="h-[1px] w-16 sm:w-24 bg-gradient-to-l from-transparent to-gold-glow" />
        </div>

        {/* Main Title */}
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-widest gold-text-shimmer uppercase drop-shadow-lg">
          RAVANA AI
        </h1>

        {/* Subtitle */}
        <p className="font-serif text-xs sm:text-base text-gold-antique font-medium tracking-widest uppercase mt-1">
          THE VOICE OF LANKA • लङ्केश्वरस्य स्वरः
        </p>

        {/* Architectural Arch Divider */}
        <div className="ornate-divider max-w-md mx-auto my-2">
          <span>⚜</span>
        </div>

        {/* 3D Game Quick Launch Link */}
        <div className="mt-2 flex items-center justify-center gap-3">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-serif font-bold uppercase tracking-widest text-gold-glow bg-obsidian-900/80 border border-gold-antique/50 rounded-full hover:border-gold-glow hover:bg-gold-antique/20 hover:scale-105 transition-all shadow-[0_0_12px_rgba(247,217,129,0.25)]"
          >
            <span>⚔️ PLAY 3D VANA PATH GAME</span>
            <span className="text-[10px] text-emerald-400">● PORT 3000</span>
          </a>
        </div>
      </header>

      {/* LANGUAGE SELECTOR BAR */}
      <section className="relative z-10 py-1">
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onSelectLanguage={(lang) => {
            stopActiveAudio();
            setSelectedLanguage(lang);
          }}
          disabled={status === 'thinking'}
        />
      </section>

      {/* MAIN HERO & CHAT CONTAINER */}
      <section className="relative z-10 flex-1 container mx-auto px-3 sm:px-6 py-2 flex flex-col md:flex-row items-center md:items-start justify-center gap-6 max-w-6xl">
        {/* Left Side: Ravana Royal Avatar */}
        <div className="w-full md:w-1/3 flex flex-col items-center justify-center shrink-0">
          <RavanaAvatar
            status={status}
            currentLanguageName={currentLanguageObj.name}
          />
        </div>

        {/* Right Side: Royal Scroll Chat Window */}
        <div className="w-full md:w-2/3 flex flex-col flex-1">
          <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            selectedLanguage={selectedLanguage}
            status={status}
            activeAudioMessageId={activeAudioMessageId}
            playbackState={playbackState}
            onPlayAudio={playAudioForMessage}
            onSelectSampleQuestion={handleSelectSampleQuestion}
            onResetChat={handleResetChat}
            voiceConfig={voiceConfig}
            onChangeVoiceConfig={(newConfig) => setVoiceConfig(newConfig)}
          />
        </div>
      </section>

      {/* RAVAN FOLK ART SAGA SECTION */}
      <section className="relative z-10 w-full mt-8 border-t border-gold-antique/30">
        <RavanSection />
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-3 px-4 border-t border-gold-antique/30 bg-obsidian-950 text-center text-[11px] text-gold-antique/60 font-serif">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 max-w-4xl mx-auto">
          <span>RAVANA AI — Voice of Lanka</span>
          <span className="hidden sm:inline">•</span>
          <span>Voice-First Royal Lanka Experience</span>
          <span className="hidden sm:inline">•</span>
          <span>Sarvam Saaras STT & Bulbul V3 Voice</span>
        </div>
      </footer>
    </main>
  );
}
