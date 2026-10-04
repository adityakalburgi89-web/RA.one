import Phaser from 'phaser';
import { DEPTH, PLAYER_CONFIG, PALETTE } from '../core/Constants';
import { ASSET_KEYS } from '../assets/AssetRegistry';

export type PlayerState = 'IDLE' | 'RUN';

export class Player extends Phaser.GameObjects.Container {
  public sprite: Phaser.GameObjects.Sprite;
  public shadow: Phaser.GameObjects.Ellipse;
  public currentState: PlayerState = 'IDLE';

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;

  private velocityX: number = 0;
  private velocityY: number = 0;
  private animTimer: number = 0;
  private currentFrameIndex: number = 0;

  // Frame sequences for running & idle
  private readonly idleFrames = [
    ASSET_KEYS.PLAYER_FRAME_00,
    ASSET_KEYS.PLAYER_FRAME_01,
    ASSET_KEYS.PLAYER_FRAME_02,
  ];

  private readonly runFrames = [
    ASSET_KEYS.PLAYER_FRAME_03,
    ASSET_KEYS.PLAYER_FRAME_04,
    ASSET_KEYS.PLAYER_FRAME_05,
    ASSET_KEYS.PLAYER_FRAME_06,
    ASSET_KEYS.PLAYER_FRAME_07,
  ];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // Subtle soft shadow underneath character
    this.shadow = scene.add.ellipse(0, 70, 70, 24, 0x000000, 0.45);
    this.add(this.shadow);

    // Initial character sprite - scaled nicely for 1080p
    const initialKey = scene.textures.exists(ASSET_KEYS.PLAYER_FRAME_00)
      ? ASSET_KEYS.PLAYER_FRAME_00
      : (scene.textures.exists(ASSET_KEYS.PLAYER_BASE) ? ASSET_KEYS.PLAYER_BASE : 'fallback-player');

    this.sprite = scene.add.sprite(0, 0, initialKey);
    this.sprite.setScale(0.35); // Native asset is ~1200px tall, 0.35 scales down to ~400px high
    this.sprite.setOrigin(0.5, 0.78); // Origin at character's base/feet
    this.add(this.sprite);

    // Setup input keys
    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.keyW = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyS = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }

    scene.add.existing(this);
    this.updateDepth();
  }

  public update(time: number, delta: number): void {
    const dt = delta / 1000;
    this.handleMovementInput(dt);
    this.updateAnimation(delta);
    this.updateDepth();
  }

  private handleMovementInput(dt: number): void {
    let inputX = 0;
    let inputY = 0;

    const isW = this.keyW?.isDown || this.cursors?.up?.isDown;
    const isS = this.keyS?.isDown || this.cursors?.down?.isDown;
    const isA = this.keyA?.isDown || this.cursors?.left?.isDown;
    const isD = this.keyD?.isDown || this.cursors?.right?.isDown;

    if (isW) inputY -= 1;
    if (isS) inputY += 1;
    if (isA) inputX -= 1;
    if (isD) inputX += 1;

    // Isometric 2.5D projection:
    // When moving purely horizontally, velocity is full.
    // When moving vertically, perspective compresses movement slightly (2:1 isometric feeling).
    if (inputX !== 0 && inputY !== 0) {
      // Normalize diagonal vector
      const length = Math.SQRT2;
      inputX /= length;
      inputY /= length;
    }

    const targetVelX = inputX * PLAYER_CONFIG.BASE_SPEED;
    const targetVelY = inputY * (PLAYER_CONFIG.BASE_SPEED * 0.85); // 2.5D vertical foreshortening

    // Smooth acceleration & deceleration
    const accelRate = (inputX !== 0 || inputY !== 0) ? PLAYER_CONFIG.ACCELERATION : PLAYER_CONFIG.DECELERATION;
    this.velocityX = Phaser.Math.Linear(this.velocityX, targetVelX, Math.min(1, accelRate * dt / 300));
    this.velocityY = Phaser.Math.Linear(this.velocityY, targetVelY, Math.min(1, accelRate * dt / 300));

    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;

    // Flip sprite based on movement direction
    if (inputX < 0) {
      this.sprite.setFlipX(true);
    } else if (inputX > 0) {
      this.sprite.setFlipX(false);
    }

    // State change
    const isMoving = Math.abs(this.velocityX) > 20 || Math.abs(this.velocityY) > 20;
    const newState: PlayerState = isMoving ? 'RUN' : 'IDLE';

    if (newState !== this.currentState) {
      this.currentState = newState;
      this.animTimer = 0;
      this.currentFrameIndex = 0;
    }
  }

  private updateAnimation(delta: number): void {
    this.animTimer += delta;
    const frameInterval = this.currentState === 'RUN' ? 120 : 350; // Faster cycle when running

    if (this.animTimer >= frameInterval) {
      this.animTimer = 0;
      const activeFrames = this.currentState === 'RUN' ? this.runFrames : this.idleFrames;

      this.currentFrameIndex = (this.currentFrameIndex + 1) % activeFrames.length;
      const targetFrame = activeFrames[this.currentFrameIndex];

      if (this.scene.textures.exists(targetFrame)) {
        this.sprite.setTexture(targetFrame);
      }
    }
  }

  /**
   * Continuous dynamic 2.5D depth sorting based on ground feet contact point
   */
  public updateDepth(): void {
    this.setDepth(DEPTH.Y_SORT_OFFSET + this.y);
  }
}
