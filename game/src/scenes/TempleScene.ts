import Phaser from 'phaser';
import { DEPTH, GAME_WIDTH, GAME_HEIGHT, PALETTE } from '../core/Constants';
import { ASSET_KEYS } from '../assets/AssetRegistry';
import { Player } from '../player/Player';
import { CinematicCamera } from '../camera/CinematicCamera';

export class TempleScene extends Phaser.Scene {
  private player!: Player;
  private cinematicCamera!: CinematicCamera;
  private backgroundLayer!: Phaser.GameObjects.TileSprite | Phaser.GameObjects.Image;
  private worldBounds = { x: 0, y: 0, width: 3200, height: 2000 };

  constructor() {
    super('TempleScene');
  }

  public create(): void {
    // 1. Far Parallax Background (Deep forest & mountain ruins)
    this.createParallaxBackground();

    // 2. Playable 2.5D Isometric Platform & Ground Environment
    this.createPlayableGround();

    // 3. World Props with Dynamic Depth (Y-sorted)
    this.createTempleProps();

    // 4. Atmospheric Fire Particles & Ambient Embers
    this.createAtmosphericEffects();

    // 5. Player Entity
    const startX = this.worldBounds.width / 2;
    const startY = this.worldBounds.height / 2 + 100;
    this.player = new Player(this, startX, startY);

    // 6. Cinematic Camera
    this.cinematicCamera = new CinematicCamera(this);
    this.cinematicCamera.setBounds(
      this.worldBounds.x,
      this.worldBounds.y,
      this.worldBounds.width,
      this.worldBounds.height
    );
    this.cinematicCamera.follow(this.player);

    // 7. Illustrated Manuscript Frame HUD (Fixed to Screen)
    this.createManuscriptFrameHUD();
  }

  public override update(time: number, delta: number): void {
    if (this.player) {
      this.player.update(time, delta);
    }
    if (this.cinematicCamera) {
      this.cinematicCamera.update();
    }
  }

  private createParallaxBackground(): void {
    const bgKey = this.textures.exists(ASSET_KEYS.BG_FOREST)
      ? ASSET_KEYS.BG_FOREST
      : ASSET_KEYS.BG_TEMPLE;

    // Place wide background image spanning world bounds
    const bg = this.add.image(this.worldBounds.width / 2, this.worldBounds.height / 2, bgKey);
    bg.setDisplaySize(this.worldBounds.width, this.worldBounds.height);
    bg.setDepth(DEPTH.FAR_BACKGROUND);
    bg.setTint(0xcfb08c); // Warm antique parchment tint
  }

  private createPlayableGround(): void {
    const cx = this.worldBounds.width / 2;
    const cy = this.worldBounds.height / 2;

    // Stylized stone courtyard base
    const groundRect = this.add.ellipse(cx, cy + 150, 1800, 950, 0x1f140e, 0.95);
    groundRect.setDepth(DEPTH.FLOOR_BASE);
    groundRect.setStrokeStyle(4, PALETTE.BURNT_ORANGE, 0.5);

    // Central Dancer Stage / Mandapa Platform from asset
    if (this.textures.exists(ASSET_KEYS.FLOOR_STAGE)) {
      const stage = this.add.image(cx, cy + 180, ASSET_KEYS.FLOOR_STAGE);
      stage.setDepth(DEPTH.FLOOR_CARPET);
      stage.setScale(1.2);
      stage.setAlpha(0.9);
    }
  }

  private createTempleProps(): void {
    const cx = this.worldBounds.width / 2;
    const cy = this.worldBounds.height / 2;

    // Left & Right Temple Fire Holders (Braziers)
    const leftTorchY = cy - 40;
    const rightTorchY = cy - 40;

    if (this.textures.exists(ASSET_KEYS.PROP_FIRE_HOLDER_LEFT)) {
      const leftTorch = this.add.image(cx - 500, leftTorchY, ASSET_KEYS.PROP_FIRE_HOLDER_LEFT);
      leftTorch.setScale(0.55);
      leftTorch.setOrigin(0.5, 0.9);
      leftTorch.setDepth(DEPTH.Y_SORT_OFFSET + leftTorchY);
    }

    if (this.textures.exists(ASSET_KEYS.PROP_FIRE_HOLDER_RIGHT)) {
      const rightTorch = this.add.image(cx + 500, rightTorchY, ASSET_KEYS.PROP_FIRE_HOLDER_RIGHT);
      rightTorch.setScale(0.55);
      rightTorch.setOrigin(0.5, 0.9);
      rightTorch.setDepth(DEPTH.Y_SORT_OFFSET + rightTorchY);
    }

    // Sacred Lotus Pedestal prop north of the stage
    if (this.textures.exists(ASSET_KEYS.PROP_LOTUS_PEDESTAL)) {
      const pedestalY = cy - 120;
      const pedestal = this.add.image(cx, pedestalY, ASSET_KEYS.PROP_LOTUS_PEDESTAL);
      pedestal.setScale(0.45);
      pedestal.setOrigin(0.5, 0.85);
      pedestal.setDepth(DEPTH.Y_SORT_OFFSET + pedestalY);
    }
  }

  private createAtmosphericEffects(): void {
    const cx = this.worldBounds.width / 2;
    const cy = this.worldBounds.height / 2;

    // Floating warm fire embers around the sacred mandapa
    const particles = this.add.particles(cx, cy, ASSET_KEYS.PARTICLE_EMBER, {
      x: { min: -700, max: 700 },
      y: { min: -400, max: 400 },
      speed: { min: 20, max: 60 },
      angle: { min: 250, max: 290 },
      scale: { start: 0.15, end: 0 },
      alpha: { start: 0.8, end: 0 },
      tint: [PALETTE.WARM_AMBER, PALETTE.BURNT_ORANGE, PALETTE.ANTIQUE_GOLD],
      lifespan: 2500,
      frequency: 180,
    });
    particles.setDepth(DEPTH.FOREGROUND_PROPS);
  }

  private createManuscriptFrameHUD(): void {
    // 4 Corner Indian Ornamental Flourishes fixed to viewport
    const corners = [
      { key: ASSET_KEYS.UI_CORNER_TL, x: 20, y: 20, origin: [0, 0] },
      { key: ASSET_KEYS.UI_CORNER_TR, x: GAME_WIDTH - 20, y: 20, origin: [1, 0] },
      { key: ASSET_KEYS.UI_CORNER_BL, x: 20, y: GAME_HEIGHT - 20, origin: [0, 1] },
      { key: ASSET_KEYS.UI_CORNER_BR, x: GAME_WIDTH - 20, y: GAME_HEIGHT - 20, origin: [1, 1] },
    ];

    corners.forEach((c) => {
      if (this.textures.exists(c.key)) {
        const img = this.add.image(c.x, c.y, c.key);
        img.setOrigin(c.origin[0], c.origin[1]);
        img.setScale(0.5);
        img.setScrollFactor(0); // Lock to screen
        img.setDepth(DEPTH.UI_LAYER);
        img.setAlpha(0.85);
      }
    });

    // Top Title Medallion
    const title = this.add.text(GAME_WIDTH / 2, 38, 'THE SUNKEN MANDAPA', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '22px',
      color: '#f59e0b',
      stroke: '#2b180d',
      strokeThickness: 3,
      letterSpacing: 3,
    });
    title.setOrigin(0.5);
    title.setScrollFactor(0);
    title.setDepth(DEPTH.UI_LAYER);
  }
}
