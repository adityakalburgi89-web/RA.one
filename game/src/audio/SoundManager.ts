/**
 * SoundManager — High-fidelity Audio & Web Audio API synthesizer for Vana Path.
 * Provides epic BGM playback and procedural cinema-grade sound effects for all combat,
 * movements, revivals, enemy interactions, and UI events.
 */
export class SoundManager {
  private static instance: SoundManager | null = null;
  private ctx: AudioContext | null = null;

  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private bgmAudio: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private masterVol: number = 0.8;
  private musicVol: number = 0.65;
  private sfxVol: number = 0.85;

  private isAudioUnlocked: boolean = false;
  private currentTrack: string = '/Music/Bhoomiya Rakshaka.mp3';

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  constructor() {
    this.loadSettings();
  }

  /**
   * Unlock AudioContext on first user interaction (click/keypress)
   */
  public async unlockAudio(): Promise<void> {
    if (this.isAudioUnlocked && this.ctx && this.ctx.state === 'running') return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioContextClass();
      }

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      // Initialize Gain Nodes
      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.applyGains();
      this.isAudioUnlocked = true;

      // Start BGM if not already playing
      this.startBGM();
    } catch (e) {
      console.warn('AudioContext unlock failed:', e);
    }
  }

  private loadSettings(): void {
    try {
      const saved = localStorage.getItem('vana_path_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.masterVolume === 'number') this.masterVol = parsed.masterVolume;
        if (typeof parsed.musicVolume === 'number') this.musicVol = parsed.musicVolume;
        if (typeof parsed.sfxVolume === 'number') this.sfxVol = parsed.sfxVolume;
        if (typeof parsed.isMuted === 'boolean') this.isMuted = parsed.isMuted;
        if (parsed.musicTrack) {
          if (parsed.musicTrack === 'sitaram') this.currentTrack = '/Music/SitaramKalyanam.mp3';
          else this.currentTrack = '/Music/Bhoomiya Rakshaka.mp3';
        }
      }
    } catch {
      // Use defaults
    }
  }

  private applyGains(): void {
    if (!this.ctx || !this.masterGain || !this.musicGain || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const masterTarget = this.isMuted ? 0 : this.masterVol;
    this.masterGain.gain.setTargetAtTime(masterTarget, now, 0.05);
    this.musicGain.gain.setTargetAtTime(this.musicVol, now, 0.05);
    this.sfxGain.gain.setTargetAtTime(this.sfxVol, now, 0.05);

    if (this.bgmAudio) {
      this.bgmAudio.volume = this.isMuted ? 0 : Math.max(0, Math.min(1, this.masterVol * this.musicVol));
    }
  }

  public setMasterVolume(val: number): void {
    this.masterVol = Math.max(0, Math.min(1, val));
    this.applyGains();
  }

  public setMusicVolume(val: number): void {
    this.musicVol = Math.max(0, Math.min(1, val));
    this.applyGains();
  }

  public setSfxVolume(val: number): void {
    this.sfxVol = Math.max(0, Math.min(1, val));
    this.applyGains();
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.applyGains();
    return this.isMuted;
  }

  public setMute(muted: boolean): void {
    this.isMuted = muted;
    this.applyGains();
  }

  public getMasterVolume(): number { return this.masterVol; }
  public getMusicVolume(): number { return this.musicVol; }
  public getSfxVolume(): number { return this.sfxVol; }
  public getIsMuted(): boolean { return this.isMuted; }

  /**
   * Start or switch background soundtrack
   */
  public startBGM(trackUrl?: string): void {
    if (trackUrl) {
      this.currentTrack = trackUrl;
    }

    if (!this.bgmAudio) {
      this.bgmAudio = new Audio(this.currentTrack);
      this.bgmAudio.loop = true;
      this.bgmAudio.preload = 'auto';
    } else if (this.bgmAudio.src !== window.location.origin + this.currentTrack && !this.bgmAudio.src.endsWith(this.currentTrack)) {
      this.bgmAudio.pause();
      this.bgmAudio.src = this.currentTrack;
      this.bgmAudio.load();
    }

    this.bgmAudio.volume = this.isMuted ? 0 : Math.max(0, Math.min(1, this.masterVol * this.musicVol));
    this.bgmAudio.play().catch((err) => {
      console.log('BGM autoplay waiting for user interaction:', err.message);
    });
  }

  public pauseBGM(): void {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
  }

  public resumeBGM(): void {
    if (this.bgmAudio && !this.isMuted) {
      this.bgmAudio.play().catch(() => {});
    }
  }

  /**
   * Dips music volume slightly during pause menu
   */
  public duckBGMForPause(paused: boolean): void {
    if (!this.bgmAudio) return;
    const targetVol = this.isMuted ? 0 : Math.max(0, Math.min(1, this.masterVol * this.musicVol * (paused ? 0.35 : 1.0)));
    this.bgmAudio.volume = targetVol;
  }

  public changeMusicTrack(trackName: 'bhoomiya' | 'sitaram'): void {
    const url = trackName === 'sitaram' ? '/Music/SitaramKalyanam.mp3' : '/Music/Bhoomiya Rakshaka.mp3';
    this.startBGM(url);
  }

  // ==========================================
  // PROCEDURAL SOUND SYNTHESIS (SFX)
  // ==========================================

  private getSFXNode(): GainNode | null {
    if (!this.ctx || !this.sfxGain || this.isMuted) return null;
    if (this.ctx.state !== 'running') {
      this.ctx.resume().catch(() => {});
    }
    return this.sfxGain;
  }

  /**
   * Trishul Strike / Slash Whoosh (varies by combo step 0, 1, 2)
   */
  public playSlash(comboStep: number = 0): void {
    const target = this.getSFXNode();
    if (!this.ctx || !target) return;

    const t = this.ctx.currentTime;
    const freqs = [
      { start: 420, end: 120, duration: 0.16 },
      { start: 540, end: 150, duration: 0.18 },
      { start: 360, end: 90, duration: 0.22 },
    ];
    const conf = freqs[comboStep % freqs.length];

    // Bandpass filtered noise for air slice
    const bufferSize = this.ctx.sampleRate * conf.duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(conf.start * 2.5, t);
    filter.frequency.exponentialRampToValueAtTime(conf.end * 2, t + conf.duration);
    filter.Q.value = 3.5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + conf.duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(target);

    // Resonant blade edge tone
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(conf.start, t);
    osc.frequency.exponentialRampToValueAtTime(conf.end, t + conf.duration);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.001, t);
    oscGain.gain.linearRampToValueAtTime(0.18, t + 0.02);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, t + conf.duration);

    osc.connect(oscGain);
    oscGain.connect(target);

    noise.start(t);
    osc.start(t);
    osc.stop(t + conf.duration);
    noise.stop(t + conf.duration);
  }

  /**
   * Dash / Wind rush
   */
  public playDash(): void {
    const target = this.getSFXNode();
    if (!this.ctx || !target) return;

    const t = this.ctx.currentTime;
    const dur = 0.28;

    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.42, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(target);

    noise.start(t);
    noise.stop(t + dur);
  }

  /**
   * Prana Pulse — Sacred expansive shockwave & deep harmonic gong
   */
  public playPulse(): void {
    const target = this.getSFXNode();
    if (!this.ctx || !target) return;

    const t = this.ctx.currentTime;

    // Sub bass drop
    const sub = this.ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(160, t);
    sub.frequency.exponentialRampToValueAtTime(42, t + 0.55);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.001, t);
    subGain.gain.linearRampToValueAtTime(0.7, t + 0.04);
    subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);

    sub.connect(subGain);
    subGain.connect(target);
    sub.start(t);
    sub.stop(t + 0.7);

    // Resonant Temple bell gong frequencies (Fundamental + Harmonics)
    const bellFreqs = [216, 432, 648, 864];
    bellFreqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const bGain = this.ctx!.createGain();
      const initVol = 0.25 / (idx + 1);
      bGain.gain.setValueAtTime(0.001, t);
      bGain.gain.linearRampToValueAtTime(initVol, t + 0.02);
      bGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2 - idx * 0.15);

      osc.connect(bGain);
      bGain.connect(target);
      osc.start(t);
      osc.stop(t + 1.2);
    });
  }

  /**
   * Flesh / Armor Impact Hit
   */
  public playHit(isBoss: boolean = false): void {
    const target = this.getSFXNode();
    if (!this.ctx || !target) return;

    const t = this.ctx.currentTime;
    const dur = isBoss ? 0.35 : 0.22;

    const osc = this.ctx.createOscillator();
    osc.type = isBoss ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(isBoss ? 180 : 260, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(isBoss ? 0.55 : 0.38, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(gain);
    gain.connect(target);
    osc.start(t);
    osc.stop(t + dur);
  }

  /**
   * Soul / Prana Gem collected (celestial chime)
   */
  public playSoulCollect(): void {
    const target = this.getSFXNode();
    if (!this.ctx || !target) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Sacred major chord)

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.0001, t + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.2, t + idx * 0.04 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.04 + 0.45);

      osc.connect(gain);
      gain.connect(target);

      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.45);
    });
  }

  /**
   * Enemy Slain / Dissipation
   */
  public playEnemySlain(): void {
    const target = this.getSFXNode();
    if (!this.ctx || !target) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);

    osc.connect(gain);
    gain.connect(target);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  /**
   * Player Hurt
   */
  public playPlayerHurt(): void {
    const target = this.getSFXNode();
    if (!this.ctx || !target) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(60, t + 0.25);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.45, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(target);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  /**
   * Lotus Shrine Revive (Sacred Om 136.1Hz resonant drone)
   */
  public playRevive(): void {
    const target = this.getSFXNode();
    if (!this.ctx || !target) return;

    const t = this.ctx.currentTime;
    const omHarmonics = [136.1, 272.2, 408.3, 544.4];

    omHarmonics.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.35 / (i + 1), t + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);

      osc.connect(gain);
      gain.connect(target);
      osc.start(t);
      osc.stop(t + 2.2);
    });
  }

  /**
   * Kaalvan Boss Awaken — War Horn & Sub Rumble
   */
  public playBossAwaken(): void {
    const target = this.getSFXNode();
    if (!this.ctx || !target) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.linearRampToValueAtTime(110, t + 0.8);
    osc.frequency.exponentialRampToValueAtTime(55, t + 2.0);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.65, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.0);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(target);

    osc.start(t);
    osc.stop(t + 2.0);
  }

  /**
   * Victory Fanfare
   */
  public playVictory(): void {
    const target = this.getSFXNode();
    if (!this.ctx || !target) return;

    const t = this.ctx.currentTime;
    const chords = [
      { f: 440, delay: 0 },
      { f: 554.37, delay: 0.15 },
      { f: 659.25, delay: 0.3 },
      { f: 880, delay: 0.5 },
    ];

    chords.forEach(({ f, delay }) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t + delay);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.001, t + delay);
      gain.gain.linearRampToValueAtTime(0.28, t + delay + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 1.2);

      osc.connect(gain);
      gain.connect(target);
      osc.start(t + delay);
      osc.stop(t + delay + 1.2);
    });
  }

  /**
   * UI Click sound
   */
  public playButtonClick(): void {
    const target = this.getSFXNode();
    if (!this.ctx || !target) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.06);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);

    osc.connect(gain);
    gain.connect(target);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  /**
   * UI Hover tick
   */
  public playHover(): void {
    const target = this.getSFXNode();
    if (!this.ctx || !target) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.06, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

    osc.connect(gain);
    gain.connect(target);
    osc.start(t);
    osc.stop(t + 0.035);
  }

  /**
   * Pause & Resume toggle chimes
   */
  public playPauseToggle(isPaused: boolean): void {
    const target = this.getSFXNode();
    if (!this.ctx || !target) return;

    const t = this.ctx.currentTime;
    const startF = isPaused ? 520 : 380;
    const endF = isPaused ? 360 : 540;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(startF, t);
    osc.frequency.exponentialRampToValueAtTime(endF, t + 0.12);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

    osc.connect(gain);
    gain.connect(target);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  /**
   * Jump Launch leap whoosh
   */
  public playJump(): void {
    const target = this.getSFXNode();
    if (!this.ctx || !target) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(380, t + 0.18);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

    osc.connect(gain);
    gain.connect(target);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  /**
   * Jump Land impact thud
   */
  public playLand(): void {
    const target = this.getSFXNode();
    if (!this.ctx || !target) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);

    osc.connect(gain);
    gain.connect(target);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  /**
   * Sword / Trishul Defense Block (metallic shield deflection clang)
   */
  public playBlock(): void {
    const target = this.getSFXNode();
    if (!this.ctx || !target) return;

    const t = this.ctx.currentTime;
    const harmonics = [820, 1640, 2460];
    harmonics.forEach((f, idx) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.3 / (idx + 1), t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

      osc.connect(gain);
      gain.connect(target);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  /**
   * Heavy Combo Finisher Slash
   */
  public playHeavySlash(): void {
    const target = this.getSFXNode();
    if (!this.ctx || !target) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(480, t);
    osc.frequency.exponentialRampToValueAtTime(65, t + 0.35);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(250, t + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(target);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  /**
   * Melee Hook Punch
   */
  public playPunch(): void {
    const target = this.getSFXNode();
    if (!this.ctx || !target) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.18);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.42, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

    osc.connect(gain);
    gain.connect(target);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  /**
   * Slide sound
   */
  public playSlide(): void {
    const target = this.getSFXNode();
    if (!this.ctx || !target) return;

    const t = this.ctx.currentTime;
    const dur = 0.32;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, t);
    filter.frequency.linearRampToValueAtTime(200, t + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(target);
    noise.start(t);
    noise.stop(t + dur);
  }
}
