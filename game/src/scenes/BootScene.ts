import Phaser from 'phaser';
import { ASSET_KEYS, ASSET_REGISTRY, createFallbackTexture } from '../assets/AssetRegistry';
import { GAME_WIDTH, GAME_HEIGHT, PALETTE } from '../core/Constants';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  public preload(): void {
    this.createManuscriptLoadingUI();

    // Register safe load error fallbacks
    this.load.on('loaderror', (fileObj: Phaser.Loader.File) => {
      console.warn(`[AssetRegistry] Failed to load ${fileObj.key} from ${fileObj.src}. Generating fallback stamp.`);
      createFallbackTexture(this, fileObj.key);
    });

    // Generate glowing ember particle texture
    if (!this.textures.exists(ASSET_KEYS.PARTICLE_EMBER)) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xffffff, 1);
      g.fillCircle(8, 8, 8);
      g.generateTexture(ASSET_KEYS.PARTICLE_EMBER, 16, 16);
      g.destroy();
    }

    // Queue all assets from central registry
    for (const [key, path] of Object.entries(ASSET_REGISTRY)) {
      this.load.image(key, path);
    }
  }

  public create(): void {
    // Fade out and launch the 2.5D Temple level
    this.cameras.main.fadeOut(500, 15, 10, 8);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('TempleScene');
    });
  }

  private createManuscriptLoadingUI(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Background tint
    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, PALETTE.CHARCOAL_BLACK);

    // Title in ancient gold
    const titleText = this.add.text(cx, cy - 80, 'THE FORGOTTEN MANDAPA', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '44px',
      color: '#f59e0b',
      stroke: '#451a03',
      strokeThickness: 4,
      letterSpacing: 4,
    }).setOrigin(0.5);

    const subtitleText = this.add.text(cx, cy - 25, 'Entering Sacred Grounds...', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '18px',
      color: '#d97706',
      letterSpacing: 2,
    }).setOrigin(0.5);

    // Progress bar frame
    const barWidth = 480;
    const barHeight = 16;
    const progressBorder = this.add.graphics();
    progressBorder.lineStyle(2, PALETTE.ANTIQUE_GOLD, 0.9);
    progressBorder.strokeRect(cx - barWidth / 2, cy + 30, barWidth, barHeight);

    const progressBar = this.add.graphics();

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(PALETTE.BURNT_ORANGE, 1);
      progressBar.fillRect(cx - barWidth / 2 + 2, cy + 32, (barWidth - 4) * value, barHeight - 4);
    });
  }
}
