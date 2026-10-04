import { SettingsManager, GameSettings, GraphicsQuality, CameraDistance, MusicTrack } from '../settings/SettingsManager';
import { SoundManager } from '../audio/SoundManager';

export class SettingsModal {
  private element: HTMLElement;
  private isOpen: boolean = false;
  private settingsManager = SettingsManager.getInstance();
  private soundManager = SoundManager.getInstance();

  // Tab buttons and panes
  private tabButtons: NodeListOf<HTMLButtonElement>;
  private tabPanes: NodeListOf<HTMLElement>;

  // Inputs
  private masterSlider: HTMLInputElement;
  private masterValue: HTMLElement;
  private musicSlider: HTMLInputElement;
  private musicValue: HTMLElement;
  private sfxSlider: HTMLInputElement;
  private sfxValue: HTMLElement;
  private muteToggle: HTMLInputElement;
  private musicTrackSelect: HTMLSelectElement;

  private qualitySelect: HTMLSelectElement;
  private fogToggle: HTMLInputElement;
  private fogDensitySlider: HTMLInputElement;
  private fogDensityValue: HTMLElement;
  private screenShakeToggle: HTMLInputElement;
  private fullscreenBtn: HTMLButtonElement;

  private cameraDistanceSelect: HTMLSelectElement;
  private damageNumbersToggle: HTMLInputElement;

  private closeBtn: HTMLButtonElement;
  private resetBtn: HTMLButtonElement;

  private onCloseCallback: (() => void) | null = null;

  constructor(onClose?: () => void) {
    this.onCloseCallback = onClose ?? null;
    this.element = this.required('settings-modal');

    this.tabButtons = this.element.querySelectorAll<HTMLButtonElement>('.settings-tab-btn');
    this.tabPanes = this.element.querySelectorAll<HTMLElement>('.settings-tab-pane');

    this.masterSlider = this.required('setting-master-vol') as HTMLInputElement;
    this.masterValue = this.required('setting-master-val');
    this.musicSlider = this.required('setting-music-vol') as HTMLInputElement;
    this.musicValue = this.required('setting-music-val');
    this.sfxSlider = this.required('setting-sfx-vol') as HTMLInputElement;
    this.sfxValue = this.required('setting-sfx-val');
    this.muteToggle = this.required('setting-mute') as HTMLInputElement;
    this.musicTrackSelect = this.required('setting-music-track') as HTMLSelectElement;

    this.qualitySelect = this.required('setting-quality') as HTMLSelectElement;
    this.fogToggle = this.required('setting-fog-enable') as HTMLInputElement;
    this.fogDensitySlider = this.required('setting-fog-density') as HTMLInputElement;
    this.fogDensityValue = this.required('setting-fog-val');
    this.screenShakeToggle = this.required('setting-screen-shake') as HTMLInputElement;
    this.fullscreenBtn = this.required('setting-fullscreen-btn') as HTMLButtonElement;

    this.cameraDistanceSelect = this.required('setting-camera-distance') as HTMLSelectElement;
    this.damageNumbersToggle = this.required('setting-damage-numbers') as HTMLInputElement;

    this.closeBtn = this.required('settings-close-btn') as HTMLButtonElement;
    this.resetBtn = this.required('settings-reset-btn') as HTMLButtonElement;

    this.initTabs();
    this.initInputs();
    this.syncFromSettings(this.settingsManager.getSettings());

    this.settingsManager.subscribe((settings) => {
      this.syncFromSettings(settings);
    });
  }

  private initTabs(): void {
    this.tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this.soundManager.playButtonClick();
        const tabTarget = btn.getAttribute('data-tab');
        this.tabButtons.forEach((b) => b.classList.remove('is-active'));
        this.tabPanes.forEach((p) => p.classList.remove('is-active'));

        btn.classList.add('is-active');
        const activePane = this.element.querySelector(`#tab-${tabTarget}`);
        if (activePane) {
          activePane.classList.add('is-active');
        }
      });
    });
  }

  private initInputs(): void {
    // Stop propagation so clicking in settings modal doesn't attack
    this.element.addEventListener('pointerdown', (e) => e.stopPropagation());
    this.element.addEventListener('click', (e) => e.stopPropagation());

    // Audio inputs
    this.masterSlider.addEventListener('input', () => {
      const val = parseFloat(this.masterSlider.value);
      this.masterValue.textContent = `${Math.round(val * 100)}%`;
      this.settingsManager.updateSetting('masterVolume', val);
    });

    this.musicSlider.addEventListener('input', () => {
      const val = parseFloat(this.musicSlider.value);
      this.musicValue.textContent = `${Math.round(val * 100)}%`;
      this.settingsManager.updateSetting('musicVolume', val);
    });

    this.sfxSlider.addEventListener('input', () => {
      const val = parseFloat(this.sfxSlider.value);
      this.sfxValue.textContent = `${Math.round(val * 100)}%`;
      this.settingsManager.updateSetting('sfxVolume', val);
    });
    this.sfxSlider.addEventListener('change', () => {
      this.soundManager.playSlash(0);
    });

    this.muteToggle.addEventListener('change', () => {
      this.settingsManager.updateSetting('isMuted', this.muteToggle.checked);
      this.soundManager.playButtonClick();
    });

    this.musicTrackSelect.addEventListener('change', () => {
      this.settingsManager.updateSetting('musicTrack', this.musicTrackSelect.value as MusicTrack);
      this.soundManager.playButtonClick();
    });

    // Graphics inputs
    this.qualitySelect.addEventListener('change', () => {
      this.settingsManager.updateSetting('graphicsQuality', this.qualitySelect.value as GraphicsQuality);
      this.soundManager.playButtonClick();
    });

    this.fogToggle.addEventListener('change', () => {
      this.settingsManager.updateSetting('fogEnabled', this.fogToggle.checked);
      this.soundManager.playButtonClick();
    });

    this.fogDensitySlider.addEventListener('input', () => {
      const val = parseFloat(this.fogDensitySlider.value);
      this.fogDensityValue.textContent = val.toFixed(3);
      this.settingsManager.updateSetting('fogDensity', val);
    });

    this.screenShakeToggle.addEventListener('change', () => {
      this.settingsManager.updateSetting('screenShake', this.screenShakeToggle.checked);
      this.soundManager.playButtonClick();
    });

    this.fullscreenBtn.addEventListener('click', () => {
      this.soundManager.playButtonClick();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // Gameplay inputs
    this.cameraDistanceSelect.addEventListener('change', () => {
      this.settingsManager.updateSetting('cameraDistance', this.cameraDistanceSelect.value as CameraDistance);
      this.soundManager.playButtonClick();
    });

    this.damageNumbersToggle.addEventListener('change', () => {
      this.settingsManager.updateSetting('damageNumbers', this.damageNumbersToggle.checked);
      this.soundManager.playButtonClick();
    });

    // Buttons
    this.closeBtn.addEventListener('click', () => {
      this.soundManager.playButtonClick();
      this.close();
    });

    this.resetBtn.addEventListener('click', () => {
      this.soundManager.playButtonClick();
      this.settingsManager.resetToDefaults();
    });
  }

  private syncFromSettings(settings: GameSettings): void {
    this.masterSlider.value = settings.masterVolume.toString();
    this.masterValue.textContent = `${Math.round(settings.masterVolume * 100)}%`;

    this.musicSlider.value = settings.musicVolume.toString();
    this.musicValue.textContent = `${Math.round(settings.musicVolume * 100)}%`;

    this.sfxSlider.value = settings.sfxVolume.toString();
    this.sfxValue.textContent = `${Math.round(settings.sfxVolume * 100)}%`;

    this.muteToggle.checked = settings.isMuted;
    this.musicTrackSelect.value = settings.musicTrack;

    this.qualitySelect.value = settings.graphicsQuality;
    this.fogToggle.checked = settings.fogEnabled;
    this.fogDensitySlider.value = settings.fogDensity.toString();
    this.fogDensityValue.textContent = settings.fogDensity.toFixed(3);
    this.screenShakeToggle.checked = settings.screenShake;

    this.cameraDistanceSelect.value = settings.cameraDistance;
    this.damageNumbersToggle.checked = settings.damageNumbers;
  }

  public open(): void {
    this.isOpen = true;
    this.element.classList.remove('is-hidden');
    this.syncFromSettings(this.settingsManager.getSettings());
  }

  public close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.element.classList.add('is-fading-out');
    setTimeout(() => {
      this.element.classList.add('is-hidden');
      this.element.classList.remove('is-fading-out');
      if (this.onCloseCallback) this.onCloseCallback();
    }, 200);
  }

  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public get visible(): boolean {
    return this.isOpen;
  }

  private required(id: string): HTMLElement {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Missing settings element #${id}`);
    return el;
  }
}
