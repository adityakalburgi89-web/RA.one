import { SoundManager } from '../audio/SoundManager';

const LORE_TIPS = [
  '“The Trishul spear commands the trinity of existence: creation, preservation, and cosmic resolve.”',
  '“Dash with [SHIFT] to glide through incoming shadows and avoid critical corruption strikes.”',
  '“Release Prana Pulse with [E] when circled by multiple Ashen Shades to purge their dark auras.”',
  '“The sacred Lotus Shrine restores fallen champions who dare walk the Vana Path.”',
  '“Kaalvan draws energy from his minions; cleansing the shades weakens his grove barriers.”',
  '“Collect fallen soul orbs to mend your vitality and elevate your spiritual attunement.”',
];

export class LoadingScreen {
  private element: HTMLElement;
  private progressBar: HTMLElement;
  private progressText: HTMLElement;
  private statusText: HTMLElement;
  private loreText: HTMLElement;
  private startButton: HTMLElement;
  private progressContainer: HTMLElement;

  private currentProgress: number = 0;
  private targetProgress: number = 0;
  private isComplete: boolean = false;
  private loreInterval: number = 0;
  private animationFrame: number = 0;
  private onStartCallback: (() => void) | null = null;

  constructor(onStartCallback?: () => void) {
    this.onStartCallback = onStartCallback ?? null;
    this.element = this.required('loading-screen');
    this.progressBar = this.required('loading-progress-bar');
    this.progressText = this.required('loading-progress-text');
    this.statusText = this.required('loading-status-text');
    this.loreText = this.required('loading-lore-text');
    this.startButton = this.required('loading-start-btn');
    this.progressContainer = this.required('loading-progress-container');

    this.initLoreCarousel();
    this.initEvents();
    this.animateProgress();
  }

  private initEvents(): void {
    const handleStart = () => {
      if (!this.isComplete) return;
      SoundManager.getInstance().unlockAudio().then(() => {
        SoundManager.getInstance().playButtonClick();
      });
      this.hide();
      if (this.onStartCallback) {
        this.onStartCallback();
      }
    };

    this.startButton.addEventListener('click', handleStart);

    window.addEventListener('keydown', (e) => {
      if (this.isComplete && (e.code === 'Space' || e.code === 'Enter') && this.element.style.display !== 'none') {
        e.preventDefault();
        handleStart();
      }
    });
  }

  private initLoreCarousel(): void {
    let index = 0;
    this.loreText.textContent = LORE_TIPS[0];

    this.loreInterval = window.setInterval(() => {
      index = (index + 1) % LORE_TIPS.length;
      this.loreText.style.opacity = '0';
      setTimeout(() => {
        this.loreText.textContent = LORE_TIPS[index];
        this.loreText.style.opacity = '1';
      }, 350);
    }, 4500);
  }

  private animateProgress = (): void => {
    // Smooth progress interpolation
    if (this.currentProgress < this.targetProgress) {
      this.currentProgress += Math.max(0.5, (this.targetProgress - this.currentProgress) * 0.1);
      if (this.currentProgress > 99.5 && this.targetProgress >= 100) {
        this.currentProgress = 100;
        this.onFinishedLoading();
      }
      this.updateDisplay(this.currentProgress);
    }

    if (!this.isComplete || this.currentProgress < 100) {
      this.animationFrame = requestAnimationFrame(this.animateProgress);
    }
  };

  public setProgress(percent: number, status?: string): void {
    this.targetProgress = Math.min(100, Math.max(this.targetProgress, percent));
    if (status) {
      this.statusText.textContent = status;
    }
  }

  private updateDisplay(percent: number): void {
    const rounded = Math.floor(percent);
    this.progressBar.style.width = `${percent}%`;
    this.progressText.textContent = `${rounded}%`;

    if (rounded < 25) {
      this.statusText.textContent = 'Awakening the Sacred Grove...';
    } else if (rounded < 50) {
      this.statusText.textContent = 'Forging Divine Trishul Geometry...';
    } else if (rounded < 75) {
      this.statusText.textContent = 'Channeling Vedic Prana...';
    } else if (rounded < 100) {
      this.statusText.textContent = 'Summoning Ashen Shadows & Shrines...';
    } else {
      this.statusText.textContent = 'Sacred Realm Manifested.';
    }
  }

  private onFinishedLoading(): void {
    if (this.isComplete) return;
    this.isComplete = true;

    window.clearInterval(this.loreInterval);

    // Fade out progress track and reveal the pulsating start button
    this.progressContainer.style.opacity = '0';
    setTimeout(() => {
      this.progressContainer.style.display = 'none';
      this.startButton.classList.remove('is-hidden');
      this.startButton.focus();
    }, 400);
  }

  public hide(): void {
    this.element.classList.add('is-fading');
    setTimeout(() => {
      this.element.style.display = 'none';
      cancelAnimationFrame(this.animationFrame);
    }, 650);
  }

  private required(id: string): HTMLElement {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Missing loading screen element #${id}`);
    return el;
  }
}
