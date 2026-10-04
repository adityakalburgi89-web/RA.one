import { SoundManager } from '../audio/SoundManager';
import { SettingsManager } from '../settings/SettingsManager';

export type GameUIState = {
  health: number;
  maxHealth: number;
  experience: number;
  level: number;
  foesRemaining: number;
  quest: string;
  dashReady: boolean;
  pulseReady: boolean;
  dashCooldownRatio: number;
  pulseCooldownRatio: number;
  boss?: { name: string; health: number; maxHealth: number };
  isPaused?: boolean;
};

export class GameUI {
  private readonly healthFill = this.required('health-fill');
  private readonly healthText = this.required('health-text');
  private readonly xpFill = this.required('xp-fill');
  private readonly levelText = this.required('level-text');
  private readonly questTitle = this.required('quest-title');
  private readonly questDetail = this.required('quest-detail');
  private readonly dashKey = this.required('dash-key');
  private readonly dashLabel = this.required('dash-label');
  private readonly pulseKey = this.required('pulse-key');
  private readonly pulseLabel = this.required('pulse-label');
  private readonly bossPanel = this.required('boss-panel');
  private readonly bossName = this.required('boss-name');
  private readonly bossFill = this.required('boss-fill');
  private readonly notification = this.required('notification');

  // Top Right Utilities
  private readonly soundToggleBtn = this.optional('hud-sound-btn');
  private readonly pauseToggleBtn = this.optional('hud-pause-btn');
  private readonly settingsBtn = this.optional('hud-settings-btn');

  private noticeTimer = 0;
  private soundManager = SoundManager.getInstance();
  private settingsManager = SettingsManager.getInstance();

  constructor(
    onTogglePause?: () => void,
    onOpenSettings?: () => void
  ) {
    this.setupUtilityButtons(onTogglePause, onOpenSettings);
  }

  private setupUtilityButtons(onTogglePause?: () => void, onOpenSettings?: () => void): void {
    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isMuted = this.soundManager.toggleMute();
        this.settingsManager.updateSetting('isMuted', isMuted);
        this.updateSoundButton(isMuted);
      });
      this.updateSoundButton(this.soundManager.getIsMuted());
    }

    if (this.pauseToggleBtn && onTogglePause) {
      this.pauseToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onTogglePause();
      });
    }

    if (this.settingsBtn && onOpenSettings) {
      this.settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.soundManager.playButtonClick();
        onOpenSettings();
      });
    }

    this.settingsManager.subscribe((settings) => {
      this.updateSoundButton(settings.isMuted);
    });
  }

  public updateSoundButton(isMuted: boolean): void {
    if (!this.soundToggleBtn) return;
    this.soundToggleBtn.innerHTML = isMuted ? '🔇' : '🔊';
    this.soundToggleBtn.setAttribute('title', isMuted ? 'Unmute Sound (M)' : 'Mute Sound (M)');
    this.soundToggleBtn.classList.toggle('is-muted', isMuted);
  }

  public updatePauseButton(isPaused: boolean): void {
    if (!this.pauseToggleBtn) return;
    this.pauseToggleBtn.innerHTML = isPaused ? '▶' : '⏸';
    this.pauseToggleBtn.setAttribute('title', isPaused ? 'Resume Game (ESC/P)' : 'Pause Game (ESC/P)');
  }

  public update(state: GameUIState): void {
    const healthRatio = state.health / state.maxHealth;
    this.healthFill.style.width = `${Math.max(0, healthRatio) * 100}%`;
    this.healthText.textContent = `${Math.ceil(state.health)} / ${state.maxHealth}`;
    this.xpFill.style.width = `${Math.min(100, state.experience % 100)}%`;
    this.levelText.textContent = `LEVEL ${state.level}`;
    this.questTitle.textContent = state.quest;
    this.questDetail.textContent = `${state.foesRemaining} corruption ${state.foesRemaining === 1 ? 'remains' : 'remain'} in the grove`;
    this.updateAbility(this.dashKey, this.dashLabel, state.dashReady, state.dashCooldownRatio, 'DASH');
    this.updateAbility(this.pulseKey, this.pulseLabel, state.pulseReady, state.pulseCooldownRatio, 'PRANA PULSE');

    if (state.boss) {
      this.bossPanel.classList.add('is-visible');
      this.bossName.textContent = state.boss.name;
      this.bossFill.style.width = `${Math.max(0, state.boss.health / state.boss.maxHealth) * 100}%`;
    } else {
      this.bossPanel.classList.remove('is-visible');
    }

    if (typeof state.isPaused === 'boolean') {
      this.updatePauseButton(state.isPaused);
    }
  }

  public announce(message: string, duration = 2.7): void {
    window.clearTimeout(this.noticeTimer);
    this.notification.textContent = message;
    this.notification.classList.add('is-visible');
    this.noticeTimer = window.setTimeout(() => this.notification.classList.remove('is-visible'), duration * 1000);
  }

  private updateAbility(key: HTMLElement, label: HTMLElement, ready: boolean, ratio: number, title: string): void {
    key.style.setProperty('--cooldown', `${Math.max(0, ratio) * 100}%`);
    key.classList.toggle('is-ready', ready);
    label.textContent = ready ? title : `${title} ${Math.ceil(ratio * (title === 'DASH' ? 1.05 : 6))}s`;
  }

  private required(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Missing HUD element #${id}`);
    return element;
  }

  private optional(id: string): HTMLElement | null {
    return document.getElementById(id);
  }
}
