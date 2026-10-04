import { SoundManager } from '../audio/SoundManager';
import { SettingsManager } from '../settings/SettingsManager';
import { SettingsModal } from './SettingsModal';

export class PauseMenu {
  private element: HTMLElement;
  private isPaused: boolean = false;
  private soundManager = SoundManager.getInstance();
  private settingsManager = SettingsManager.getInstance();

  private resumeBtn: HTMLButtonElement;
  private settingsBtn: HTMLButtonElement;
  private restartBtn: HTMLButtonElement;
  private quickMuteBtn: HTMLButtonElement;
  private quickVolSlider: HTMLInputElement;

  private settingsModal: SettingsModal;
  private onPauseStateChanged: ((paused: boolean) => void) | null = null;
  private onRestartRequested: (() => void) | null = null;

  constructor(
    settingsModal: SettingsModal,
    onPauseStateChanged?: (paused: boolean) => void,
    onRestartRequested?: () => void
  ) {
    this.settingsModal = settingsModal;
    this.onPauseStateChanged = onPauseStateChanged ?? null;
    this.onRestartRequested = onRestartRequested ?? null;

    this.element = this.required('pause-overlay');
    this.resumeBtn = this.required('pause-resume-btn') as HTMLButtonElement;
    this.settingsBtn = this.required('pause-settings-btn') as HTMLButtonElement;
    this.restartBtn = this.required('pause-restart-btn') as HTMLButtonElement;
    this.quickMuteBtn = this.required('pause-quick-mute') as HTMLButtonElement;
    this.quickVolSlider = this.required('pause-quick-vol') as HTMLInputElement;

    this.initEvents();
    this.syncQuickAudio();
  }

  private initEvents(): void {
    // Stop propagation so clicking in pause overlay doesn't attack
    this.element.addEventListener('pointerdown', (e) => e.stopPropagation());
    this.element.addEventListener('click', (e) => e.stopPropagation());

    this.resumeBtn.addEventListener('click', () => {
      this.soundManager.playButtonClick();
      this.resume();
    });

    this.settingsBtn.addEventListener('click', () => {
      this.soundManager.playButtonClick();
      this.settingsModal.open();
    });

    this.restartBtn.addEventListener('click', () => {
      this.soundManager.playButtonClick();
      this.resume();
      if (this.onRestartRequested) {
        this.onRestartRequested();
      }
    });

    this.quickMuteBtn.addEventListener('click', () => {
      const isMuted = this.soundManager.toggleMute();
      this.settingsManager.updateSetting('isMuted', isMuted);
      this.syncQuickAudio();
    });

    this.quickVolSlider.addEventListener('input', () => {
      const val = parseFloat(this.quickVolSlider.value);
      this.settingsManager.updateSetting('masterVolume', val);
      this.syncQuickAudio();
    });

    window.addEventListener('keydown', (e) => {
      const code = e.code.toLowerCase();
      const key = e.key ? e.key.toLowerCase() : '';

      // If settings modal is open, Escape closes settings first
      if (this.settingsModal.visible && (code === 'escape' || key === 'escape')) {
        e.preventDefault();
        this.settingsModal.close();
        return;
      }

      // Escape or P toggles Pause
      if (code === 'escape' || code === 'keyp' || key === 'p') {
        const loading = document.getElementById('loading-screen');
        if (loading && loading.style.display !== 'none' && !loading.classList.contains('is-fading')) {
          return; // Don't pause during initial loading
        }

        e.preventDefault();
        this.toggle();
      }
    });

    this.settingsManager.subscribe(() => {
      this.syncQuickAudio();
    });
  }

  private syncQuickAudio(): void {
    const isMuted = this.soundManager.getIsMuted();
    const masterVol = this.soundManager.getMasterVolume();

    this.quickMuteBtn.textContent = isMuted ? '🔇 MUTED' : '🔊 SOUND ON';
    this.quickMuteBtn.classList.toggle('is-muted', isMuted);
    this.quickVolSlider.value = masterVol.toString();
  }

  public pause(): void {
    if (this.isPaused) return;
    this.isPaused = true;
    this.element.classList.remove('is-hidden');
    this.soundManager.duckBGMForPause(true);
    this.soundManager.playPauseToggle(true);

    if (this.onPauseStateChanged) {
      this.onPauseStateChanged(true);
    }
  }

  public resume(): void {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.element.classList.add('is-hidden');
    this.settingsModal.close();
    this.soundManager.duckBGMForPause(false);
    this.soundManager.playPauseToggle(false);

    if (this.onPauseStateChanged) {
      this.onPauseStateChanged(false);
    }
  }

  public toggle(): void {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  public get paused(): boolean {
    return this.isPaused;
  }

  private required(id: string): HTMLElement {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Missing pause menu element #${id}`);
    return el;
  }
}
