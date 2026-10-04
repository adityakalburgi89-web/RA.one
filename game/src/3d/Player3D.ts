import * as THREE from 'three';
import { AssetRegistry3D } from './AssetRegistry3D';
import { PLAYER_3D_CONFIG } from './Constants3D';
import { HeroCharacter3D } from './HeroCharacter3D';
import { SoundManager } from '../audio/SoundManager';

export class Player3D {
  public group: THREE.Group;
  public velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public isRunning: boolean = false;
  public readonly maxHealth = 120;
  public health = this.maxHealth;
  public isDefeated = false;
  public isPaused = false;

  // Jump & Ground physics
  public isGrounded = true;
  private jumpVelocity = 0;
  private readonly GRAVITY = -34;
  private readonly JUMP_POWER = 13.5;
  private jumpRequested = false;

  // Block & Defense state
  public isBlocking = false;

  // Special animation triggers
  private punchRequested = false;
  private slideRequested = false;
  private slideTimer = 0;
  private comboResetTimer = 0;
  private idleTimer = 0;
  private currentIdleIndex = 0;

  public character: HeroCharacter3D;
  private shadowMesh: THREE.Mesh;
  private currentFacingAngle: number = 0;
  private attackRequested = false;
  private pulseRequested = false;
  private dashRequested = false;
  private attackComboStep = 0;
  private attackTimer = 0;
  private attackCooldown = 0;
  private dashTimer = 0;
  private dashCooldown = 0;
  private pulseCooldown = 0;
  private damageGraceTimer = 0;

  // Keyboard inputs
  private keys: Record<string, boolean> = {
    w: false,
    a: false,
    s: false,
    d: false,
    q: false,
    space: false,
    shift: false,
  };

  constructor(private assets: AssetRegistry3D) {
    this.group = new THREE.Group();

    // Position player in front of the Lotus Shiva Shrine facing north
    this.group.position.set(0, 0, -17.5);
    this.currentFacingAngle = Math.PI; // Face north toward the shrine
    this.damageGraceTimer = 3.5; // Divine protection grace when entering grove

    // Instantiate Rigged 3D Character with Open-Source Mixamo Skeletal Animations & UAL2 library
    this.character = new HeroCharacter3D();
    this.group.add(this.character.group);

    // Ground contact soft shadow decal
    const shadowGeo = new THREE.PlaneGeometry(1.8, 1.2);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.position.y = 0.02;
    this.group.add(this.shadowMesh);

    this.setupControls();
  }

  private setupControls(): void {
    window.addEventListener('keydown', (e) => {
      if (this.isPaused) return;
      const k = e.key ? e.key.toLowerCase() : '';
      const c = e.code ? e.code.toLowerCase() : '';

      if (k === 'w' || c === 'keyw' || k === 'arrowup') this.keys.w = true;
      if (k === 'a' || c === 'keya' || k === 'arrowleft') this.keys.a = true;
      if (k === 's' || c === 'keys' || k === 'arrowdown') this.keys.s = true;
      if (k === 'd' || c === 'keyd' || k === 'arrowright') this.keys.d = true;

      // Jump: Space or K
      if ((c === 'space' || k === 'k') && !e.repeat) {
        if (this.isGrounded) {
          this.jumpRequested = true;
        } else {
          // If already in air, Space acts as aerial strike!
          this.attackRequested = true;
        }
      }

      // Strike: J
      if (k === 'j' && !e.repeat) this.attackRequested = true;

      // Pulse: E
      if ((k === 'e' || c === 'keye') && !e.repeat) this.pulseRequested = true;

      // Dash: Shift
      if ((k === 'shift' || c === 'shiftleft' || c === 'shiftright') && !e.repeat) this.dashRequested = true;

      // Block: Q
      if ((k === 'q' || c === 'keyq') && !e.repeat) {
        this.keys.q = true;
        this.startBlocking();
      }

      // Slide: C
      if ((k === 'c' || c === 'keyc') && !e.repeat) {
        this.slideRequested = true;
      }

      // Melee Punch: F
      if ((k === 'f' || c === 'keyf') && !e.repeat) {
        this.punchRequested = true;
      }

      // Emote / Cheer: V
      if ((k === 'v' || c === 'keyv') && !e.repeat) {
        this.character.playLibraryAction('Yes', 1.2);
      }
    });

    window.addEventListener('keyup', (e) => {
      const k = e.key ? e.key.toLowerCase() : '';
      const c = e.code ? e.code.toLowerCase() : '';

      if (k === 'w' || c === 'keyw' || k === 'arrowup') this.keys.w = false;
      if (k === 'a' || c === 'keya' || k === 'arrowleft') this.keys.a = false;
      if (k === 's' || c === 'keys' || k === 'arrowdown') this.keys.s = false;
      if (k === 'd' || c === 'keyd' || k === 'arrowright') this.keys.d = false;

      if (k === 'q' || c === 'keyq') {
        this.keys.q = false;
        this.stopBlocking();
      }
    });

    window.addEventListener('pointerdown', (event) => {
      if (this.isPaused) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.closest('button, input, select, .hud-btn, #pause-overlay, #settings-modal, #loading-screen') || target.tagName === 'BUTTON' || target.tagName === 'INPUT')) {
        return;
      }

      // Left click = Strike
      if (event.button === 0) {
        this.attackRequested = true;
      }
      // Right click = Block
      else if (event.button === 2) {
        this.startBlocking();
      }
    });

    window.addEventListener('pointerup', (event) => {
      if (event.button === 2) {
        this.stopBlocking();
      }
    });

    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  private startBlocking(): void {
    if (this.isDefeated || !this.isGrounded) return;
    this.isBlocking = true;
    this.character.playLoopAction('Sword_Block', 0.15);
  }

  private stopBlocking(): void {
    if (this.isBlocking) {
      this.isBlocking = false;
      this.character.stopLoopAction(0.18);
    }
  }

  public update(dt: number): void {
    if (this.isPaused) return;

    this.attackTimer = Math.max(0, this.attackTimer - dt);
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.dashTimer = Math.max(0, this.dashTimer - dt);
    this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    this.pulseCooldown = Math.max(0, this.pulseCooldown - dt);
    this.damageGraceTimer = Math.max(0, this.damageGraceTimer - dt);
    this.slideTimer = Math.max(0, this.slideTimer - dt);

    // Combo reset timer
    if (this.comboResetTimer > 0) {
      this.comboResetTimer -= dt;
      if (this.comboResetTimer <= 0) {
        this.attackComboStep = 0;
      }
    }

    this.handleMovement(dt);
  }

  private handleMovement(dt: number): void {
    // 1. Process Jump Request
    if (this.jumpRequested && this.isGrounded && !this.isDefeated && !this.isBlocking) {
      this.jumpRequested = false;
      this.isGrounded = false;
      this.jumpVelocity = this.JUMP_POWER;
      this.character.playLibraryAction('NinjaJump_Start', 0.22);
      SoundManager.getInstance().playJump();
    }

    // 2. Vertical Jump / Gravity Physics
    if (!this.isGrounded) {
      this.jumpVelocity += this.GRAVITY * dt;
      this.group.position.y += this.jumpVelocity * dt;

      if (this.group.position.y <= 0) {
        this.group.position.y = 0;
        this.isGrounded = true;
        this.jumpVelocity = 0;
        this.character.playLibraryAction('NinjaJump_Land', 0.22);
        SoundManager.getInstance().playLand();
      }
    }

    // Dynamic ground shadow scaling based on airborne height
    const shadowScale = Math.max(0.35, 1 - this.group.position.y / 4.5);
    this.shadowMesh.scale.set(shadowScale, shadowScale, 1);

    // 3. Process Slide Request
    let moveX = 0;
    let moveZ = 0;

    if (this.keys.w) moveZ -= 1;
    if (this.keys.s) moveZ += 1;
    if (this.keys.a) moveX -= 1;
    if (this.keys.d) moveX += 1;

    // Normalize diagonal input
    if (moveX !== 0 && moveZ !== 0) {
      const len = Math.SQRT2;
      moveX /= len;
      moveZ /= len;
    }

    const hasInput = moveX !== 0 || moveZ !== 0;

    if (this.slideRequested && this.isGrounded && hasInput && this.slideTimer <= 0 && !this.isDefeated) {
      this.slideRequested = false;
      this.slideTimer = 0.55;
      this.character.playLibraryAction('Slide_Start', 0.45);
      SoundManager.getInstance().playSlide();
      const slideDir = this.getFacingDirection().multiplyScalar(18);
      this.velocity.x = slideDir.x;
      this.velocity.z = slideDir.z;
    }

    // 4. Process Melee Hook Punch
    if (this.punchRequested && !this.isDefeated) {
      this.punchRequested = false;
      this.character.playLibraryAction('Melee_Hook', 0.42);
      SoundManager.getInstance().playPunch();
    }

    // 5. Process Dash Request
    const dashDirection = hasDirection(moveX, moveZ)
      ? new THREE.Vector3(moveX, 0, moveZ)
      : this.getFacingDirection();

    if (this.dashRequested && this.dashCooldown <= 0 && !this.isDefeated) {
      this.dashRequested = false;
      this.dashTimer = 0.18;
      this.dashCooldown = 1.05;
      this.damageGraceTimer = 0.28;
      this.velocity.copy(dashDirection.multiplyScalar(23));

      // Alternate between Sword_Dash and Shield_Dash for rich animation variety
      const dashAnim = Math.random() > 0.5 ? 'Sword_Dash' : 'Shield_Dash';
      this.character.playLibraryAction(dashAnim, 0.38);
      SoundManager.getInstance().playDash();
    }

    // Movement speed modifiers (blocking slows, attacking slows, airborne preserves momentum)
    let speedMultiplier = 1;
    if (this.isBlocking) speedMultiplier = 0.4;
    else if (this.attackTimer > 0) speedMultiplier = 0.34;

    const targetVelX = moveX * PLAYER_3D_CONFIG.SPEED * speedMultiplier;
    const targetVelZ = moveZ * PLAYER_3D_CONFIG.SPEED * speedMultiplier;

    const accel = this.dashTimer > 0 || this.slideTimer > 0
      ? 0
      : (hasInput ? PLAYER_3D_CONFIG.ACCELERATION : PLAYER_3D_CONFIG.DECELERATION);

    // Smooth velocity interpolation in 3D
    if (this.dashTimer <= 0 && this.slideTimer <= 0) {
      this.velocity.x = THREE.MathUtils.damp(this.velocity.x, targetVelX, accel, dt);
      this.velocity.z = THREE.MathUtils.damp(this.velocity.z, targetVelZ, accel, dt);
    }

    // Apply movement in 3D world space
    this.group.position.x += this.velocity.x * dt;
    this.group.position.z += this.velocity.z * dt;

    // Boundary restraint
    const maxRadius = PLAYER_3D_CONFIG.LEVEL_RADIUS;
    const dist = Math.hypot(this.group.position.x, this.group.position.z);
    if (dist > maxRadius) {
      const angle = Math.atan2(this.group.position.z, this.group.position.x);
      this.group.position.x = Math.cos(angle) * maxRadius;
      this.group.position.z = Math.sin(angle) * maxRadius;
    }

    // Determine running state & facing angle in 3D
    const speed = Math.hypot(this.velocity.x, this.velocity.z);
    this.isRunning = speed > 0.6 && this.isGrounded;

    if (hasInput && !this.isBlocking) {
      const targetAngle = Math.atan2(moveX, moveZ);
      let angleDiff = targetAngle - this.currentFacingAngle;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      this.currentFacingAngle += angleDiff * Math.min(1, 14 * dt);
      this.character.group.rotation.y = this.currentFacingAngle;
    }

    // 6. Idle Variety Cycle (when standing still for a while)
    if (!this.isRunning && this.isGrounded && !this.isBlocking && this.attackTimer <= 0) {
      this.idleTimer += dt;
      if (this.idleTimer > 3.5) {
        const idles = ['Idle_Shield_Loop', 'Idle_FoldArms_Loop', 'Idle_No_Loop'];
        this.character.setCustomIdle(idles[this.currentIdleIndex]);
        if (this.idleTimer > 10.0) {
          this.currentIdleIndex = (this.currentIdleIndex + 1) % idles.length;
          this.idleTimer = 3.5;
        }
      }
    } else {
      this.idleTimer = 0;
      this.character.setCustomIdle(null);
    }

    // Skeletal animation update
    const attackProgress = this.attackTimer > 0 ? 1 - this.attackTimer / 0.34 : 0;
    this.character.update(dt, this.isRunning && this.attackTimer <= 0, attackProgress, this.isGrounded);
  }

  public get currentComboStep(): number {
    return this.attackComboStep;
  }

  public consumeAttackRequest(): boolean {
    if (!this.attackRequested) return false;
    this.attackRequested = false;
    if (this.attackCooldown > 0 || this.isDefeated) return false;

    // Full 5-hit combat combo sequence including Heavy Finisher and Regular Combo
    const combo = [
      { clip: 'Sword_Regular_A', dur: 0.44 },
      { clip: 'Sword_Regular_B', dur: 0.44 },
      { clip: 'Sword_Regular_C', dur: 0.48 },
      { clip: 'Sword_Heavy_Combo', dur: 0.72 },
      { clip: 'Sword_Regular_Combo', dur: 0.65 },
    ];

    const current = combo[this.attackComboStep % combo.length];
    this.attackTimer = current.dur * 0.75;
    this.attackCooldown = current.dur * 0.85;

    this.character.playLibraryAction(current.clip, current.dur);

    // Audio effects
    if (current.clip === 'Sword_Heavy_Combo') {
      SoundManager.getInstance().playHeavySlash();
    } else {
      SoundManager.getInstance().playSlash(this.attackComboStep);
    }

    this.attackComboStep = (this.attackComboStep + 1) % combo.length;
    this.comboResetTimer = 1.4;
    return true;
  }

  public consumePulseRequest(): boolean {
    if (!this.pulseRequested) return false;
    this.pulseRequested = false;
    if (this.pulseCooldown > 0 || this.isDefeated) return false;
    this.pulseCooldown = 6;
    this.damageGraceTimer = 0.42;
    this.character.playLibraryAction('Shield_OneShot', 0.72);
    return true;
  }

  public getFacingDirection(): THREE.Vector3 {
    return new THREE.Vector3(Math.sin(this.currentFacingAngle), 0, Math.cos(this.currentFacingAngle));
  }

  public takeDamage(amount: number): boolean {
    if (this.damageGraceTimer > 0 || this.isDefeated) return false;

    // Block defense reduction: 75% damage absorbed!
    if (this.isBlocking) {
      amount *= 0.25;
      SoundManager.getInstance().playBlock();
      this.character.playLibraryAction('Sword_Block', 0.25);
    } else {
      this.character.playLibraryAction('Hit_Knockback', 0.5);
      SoundManager.getInstance().playPlayerHurt();
    }

    this.health = Math.max(0, this.health - amount);
    this.damageGraceTimer = 0.62;
    this.isDefeated = this.health <= 0;
    return true;
  }

  public heal(amount: number): void {
    if (!this.isDefeated) this.health = Math.min(this.maxHealth, this.health + amount);
  }

  public revive(position: THREE.Vector3): void {
    this.group.position.copy(position);
    this.group.position.y = 0;
    this.velocity.set(0, 0, 0);
    this.health = this.maxHealth;
    this.isDefeated = false;
    this.isGrounded = true;
    this.jumpVelocity = 0;
    this.damageGraceTimer = 2.4;
    // Majestic rise from ground
    this.character.playLibraryAction('LayToIdle', 0.95);
    SoundManager.getInstance().playRevive();
  }

  public playVictory(): void {
    this.character.playLibraryAction('Yes', 1.4);
  }

  public get dashReady(): boolean {
    return this.dashCooldown <= 0;
  }

  public get pulseReady(): boolean {
    return this.pulseCooldown <= 0;
  }

  public get dashCooldownRatio(): number {
    return this.dashCooldown / 1.05;
  }

  public get pulseCooldownRatio(): number {
    return this.pulseCooldown / 6;
  }

  public getPosition(): THREE.Vector3 {
    return this.group.position;
  }
}

function hasDirection(x: number, z: number): boolean {
  return x !== 0 || z !== 0;
}
