import { SoundManager } from '../audio/SoundManager';

export type GraphicsQuality = 'low' | 'medium' | 'high' | 'ultra';
export type MusicTrack = 'bhoomiya' | 'sitaram';
export type CameraDistance = 'normal' | 'cinematic' | 'far';

export interface GameSettings {
  masterVolume: number; // 0..1
  musicVolume: number;  // 0..1
  sfxVolume: number;    // 0..1
  isMuted: boolean;
  musicTrack: MusicTrack;
  graphicsQuality: GraphicsQuality;
  fogEnabled: boolean;
  fogDensity: number;   // 0.01..0.05
  screenShake: boolean;
  damageNumbers: boolean;
  cameraDistance: CameraDistance;
}

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.8,
  musicVolume: 0.65,
  sfxVolume: 0.85,
  isMuted: false,
  musicTrack: 'bhoomiya',
  graphicsQuality: 'high',
  fogEnabled: true,
  fogDensity: 0.027,
  screenShake: true,
  damageNumbers: true,
  cameraDistance: 'normal',
};

export class SettingsManager {
  private static instance: SettingsManager | null = null;
  private settings: GameSettings;
  private listeners: Array<(settings: GameSettings) => void> = [];

  public static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  constructor() {
    this.settings = this.load();
  }

  public getSettings(): GameSettings {
    return { ...this.settings };
  }

  public updateSetting<K extends keyof GameSettings>(key: K, value: GameSettings[K]): void {
    this.settings[key] = value;
    this.save();
    this.applyAudioSettings();
    this.notifyListeners();
  }

  public updateSettings(partial: Partial<GameSettings>): void {
    this.settings = { ...this.settings, ...partial };
    this.save();
    this.applyAudioSettings();
    this.notifyListeners();
  }

  public resetToDefaults(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.save();
    this.applyAudioSettings();
    this.notifyListeners();
  }

  public subscribe(listener: (settings: GameSettings) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((l) => l(this.getSettings()));
  }

  private load(): GameSettings {
    try {
      const raw = localStorage.getItem('vana_path_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {
      // Fallback
    }
    return { ...DEFAULT_SETTINGS };
  }

  private save(): void {
    try {
      localStorage.setItem('vana_path_settings', JSON.stringify(this.settings));
    } catch {
      // Ignore
    }
  }

  private applyAudioSettings(): void {
    const sound = SoundManager.getInstance();
    sound.setMasterVolume(this.settings.masterVolume);
    sound.setMusicVolume(this.settings.musicVolume);
    sound.setSfxVolume(this.settings.sfxVolume);
    sound.setMute(this.settings.isMuted);
    sound.changeMusicTrack(this.settings.musicTrack);
  }
}
