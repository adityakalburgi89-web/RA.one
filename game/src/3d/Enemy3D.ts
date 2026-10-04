import * as THREE from 'three';
import { ModelLibrary, CharacterInstance } from './ModelLibrary';

export type EnemyKind = 'shade' | 'warden';

/**
 * Corrupted Rakshasa / Ashen Demon Enemy.
 * Rigged humanoid demon character powered by the Universal Animation Library.
 * Features distinct Asura demonic aesthetics (charred obsidian skin, glowing magma runes,
 * demonic horns, razor talons) and real authored skeletal attack, stalk, and hurt animations.
 */
export class Enemy3D {
  public readonly group = new THREE.Group();
  public readonly maxHealth: number;
  public health: number;
  public readonly name: string;
  public readonly isBoss: boolean;

  private model: THREE.Group | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private actions: Map<string, THREE.AnimationAction> = new Map();
  private currentAction: string = 'zombie_idle_loop';
  private attackActionPlaying = false;
  private hurtActionPlaying = false;
  private actionTimer = 0;

  private readonly aura: THREE.Mesh;
  private readonly healthFill: THREE.Mesh;
  private readonly healthBack: THREE.Mesh;
  private readonly eyeMeshes: THREE.Mesh[] = [];
  public readonly spawnPosition: THREE.Vector3;

  private attackCooldown: number = 1.2;
  private hitFlash = 0;
  private lifeTime = 0;
  private dead = false;
  private deathTimer = 0;

  constructor(public kind: EnemyKind, position: THREE.Vector3, index: number) {
    this.isBoss = kind === 'warden';
    this.name = this.isBoss ? 'Kaalvan, Ashen Grove Warden' : 'Ashen Rakshasa Shade';
    this.maxHealth = this.isBoss ? 360 : 85;
    this.health = this.maxHealth;
    this.spawnPosition = position.clone();
    this.group.name = this.name;
    this.group.position.copy(position);

    const scale = this.isBoss ? 1.75 : 1.15 + (index % 3) * 0.08;

    // 1. Swirling Dark Miasma Corruption Aura at feet
    this.aura = new THREE.Mesh(
      new THREE.RingGeometry(0.72 * scale, 1.1 * scale, 32),
      new THREE.MeshBasicMaterial({
        color: this.isBoss ? 0xb91c1c : 0x7c2d12,
        transparent: true,
        opacity: this.isBoss ? 0.45 : 0.28,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    this.aura.rotation.x = -Math.PI / 2;
    this.aura.position.y = 0.035;
    this.group.add(this.aura);

    // 2. Floating Health Bar overhead
    const barWidth = 1.4 * scale;
    this.healthBack = new THREE.Mesh(
      new THREE.PlaneGeometry(barWidth, 0.1),
      new THREE.MeshBasicMaterial({ color: 0x090507, transparent: true, opacity: 0.9, depthTest: false })
    );
    this.healthBack.position.y = 2.65 * scale;
    this.healthBack.renderOrder = 9;
    this.group.add(this.healthBack);

    this.healthFill = new THREE.Mesh(
      new THREE.PlaneGeometry(barWidth - 0.04, 0.06),
      new THREE.MeshBasicMaterial({ color: this.isBoss ? 0xef4444 : 0xf97316, depthTest: false })
    );
    this.healthFill.position.set(0, 2.65 * scale, 0.005);
    this.healthFill.renderOrder = 10;
    this.group.add(this.healthFill);

    // 3. Instantiate Rigged Skeletal Mesh from ModelLibrary
    const lib = ModelLibrary.getInstance();
    if (lib.isReady()) {
      this.initModel(lib.createInstance(), scale);
    } else {
      lib.preload(() => {
        if (!this.dead) this.initModel(lib.createInstance(), scale);
      });
    }
  }

  private initModel(inst: CharacterInstance | null, scale: number): void {
    if (!inst) return;

    this.model = inst.model;
    this.mixer = inst.mixer;
    this.actions = inst.actions;

    this.model.scale.set(scale, scale, scale);

    // Demonic Asura Palette Materials
    const demonFleshColor = this.isBoss ? 0x22131a : 0x161219;
    const demonPlateColor = this.isBoss ? 0x3d1722 : 0x251c24;
    const glowRuneColor = this.isBoss ? 0xff2a00 : 0xd946ef;

    this.model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.SkinnedMesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const updateMat = (m: THREE.Material) => {
          const std = m as THREE.MeshStandardMaterial;
          if (!std.color) return;

          if (std.name === 'M_Joints') {
            // Corrupted Magma Veins & Spiked Plates
            std.color.setHex(demonPlateColor);
            std.emissive = new THREE.Color(glowRuneColor);
            std.emissiveIntensity = this.isBoss ? 0.95 : 0.55;
            std.roughness = 0.45;
            std.metalness = 0.8;
          } else {
            // Charred Volcanic Obsidian Flesh
            std.color.setHex(demonFleshColor);
            std.roughness = 0.78;
            std.metalness = 0.15;
          }
          std.needsUpdate = true;
        };

        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(updateMat);
        } else if (mesh.material) {
          updateMat(mesh.material);
        }
      }
    });

    // 4. Attach Demonic Curved Horns to Head Bone
    const head = this.model.getObjectByName('Head');
    if (head) {
      const hornMat = new THREE.MeshStandardMaterial({
        color: 0x0f0b12,
        roughness: 0.35,
        metalness: 0.7,
      });

      const hornCount = this.isBoss ? 4 : 2;
      for (let h = 0; h < hornCount; h++) {
        const side = h % 2 === 0 ? 1 : -1;
        const tier = h >= 2 ? 0.65 : 1.0;
        const hornCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(side * 0.08 * tier, 0.1, 0.02),
          new THREE.Vector3(side * 0.22 * tier, 0.26 * tier, -0.04),
          new THREE.Vector3(side * 0.35 * tier, 0.42 * tier, 0.08),
        ]);
        const hornGeo = new THREE.TubeGeometry(hornCurve, 8, 0.032 * tier, 6, false);
        const hornMesh = new THREE.Mesh(hornGeo, hornMat);
        hornMesh.castShadow = true;
        head.add(hornMesh);
      }

      // Burning Demonic Magma Eyes
      [-1, 1].forEach((dir) => {
        const eye = new THREE.Mesh(
          new THREE.SphereGeometry(0.026, 8, 8),
          new THREE.MeshStandardMaterial({
            color: this.isBoss ? 0xff2200 : 0xff4400,
            emissive: this.isBoss ? 0xff2200 : 0xff3b00,
            emissiveIntensity: 2.8,
          })
        );
        eye.position.set(dir * 0.065, 0.05, 0.13);
        head.add(eye);
        this.eyeMeshes.push(eye);
      });
    }

    // 5. Attach Razor Demonic Talons to Hands
    ['hand_l', 'hand_r'].forEach((handName) => {
      const hand = this.model?.getObjectByName(handName);
      if (hand) {
        const clawMat = new THREE.MeshStandardMaterial({
          color: 0x050406,
          metalness: 0.9,
          roughness: 0.15,
        });
        for (let c = -1; c <= 1; c++) {
          const claw = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.14, 5), clawMat);
          claw.position.set(c * 0.035, 0.1, 0.02);
          claw.rotation.x = Math.PI / 2;
          hand.add(claw);
        }
      }
    });

    // Start with hunched menacing breathing idle
    this.playAction('zombie_idle_loop', 0.2);
    this.group.add(this.model);
  }

  private playAction(name: string, fadeDuration = 0.15, loop = true): void {
    const key = name.toLowerCase();
    const action = this.actions.get(name) || this.actions.get(key);
    if (!action || !this.mixer) return;

    if (this.currentAction === key && loop) return;

    const prevAction = this.actions.get(this.currentAction);
    action.reset();
    action.enabled = true;
    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
    action.clampWhenFinished = !loop;
    action.play();

    if (prevAction && prevAction !== action) {
      action.crossFadeFrom(prevAction, fadeDuration, false);
    }

    this.currentAction = key;
  }

  public update(playerPosition: THREE.Vector3, dt: number, time: number): number {
    if (this.dead) {
      if (this.mixer) this.mixer.update(dt);
      this.deathTimer += dt;
      // Sink smoothly into ash
      this.group.position.y -= dt * 0.8;
      this.group.scale.multiplyScalar(Math.max(0.01, 1 - dt * 1.2));
      return 0;
    }

    this.lifeTime += dt;
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.hitFlash = Math.max(0, this.hitFlash - dt * 4.5);

    if (this.actionTimer > 0) {
      this.actionTimer -= dt;
      if (this.actionTimer <= 0) {
        this.attackActionPlaying = false;
        this.hurtActionPlaying = false;
      }
    }

    if (this.mixer) {
      this.mixer.update(dt);
    }

    // Aura pulse & rotation
    this.aura.rotation.z += dt * (this.isBoss ? -1.8 : 1.1);
    this.aura.scale.setScalar(1 + Math.sin(time * 3.4 + this.spawnPosition.x) * 0.08);

    // Eye glow pulse
    this.eyeMeshes.forEach((eye) => {
      const mat = eye.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = 2.4 + Math.sin(time * 6 + this.spawnPosition.z) * 0.8 + this.hitFlash * 3;
      }
    });

    const toPlayer = playerPosition.clone().sub(this.group.position);
    toPlayer.y = 0;
    const distance = toPlayer.length();
    const aggroRadius = this.isBoss ? 16.0 : 10.5;

    // Smoothly turn to face player when in awareness range
    if (distance > 0.05 && distance <= aggroRadius + 3) {
      const targetAngle = Math.atan2(toPlayer.x, toPlayer.z);
      this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, targetAngle, Math.min(1, dt * 7.5));
    }

    const engagementRange = this.isBoss ? 2.6 : 2.1;
    let dealtDamage = 0;

    // AI State Machine:
    // 1. Outside Aggro Radius -> Guard post in menacing idle
    if (distance > aggroRadius && !this.attackActionPlaying && !this.hurtActionPlaying) {
      this.playAction('Zombie_Idle_Loop', 0.18, true);
      return 0;
    }

    // 2. In Attack Range -> Perform authored Claw Slash (Zombie_Scratch) or Smash (Melee_Hook)
    if (distance <= engagementRange && this.attackCooldown <= 0 && !this.hurtActionPlaying) {
      this.attackCooldown = this.isBoss ? 1.6 : 2.1;
      this.attackActionPlaying = true;
      this.actionTimer = 0.72;

      // Choose attack animation: claw swipe or hook punch
      const attackClip = Math.random() > 0.4 ? 'Zombie_Scratch' : 'Melee_Hook';
      this.playAction(attackClip, 0.1, false);

      dealtDamage = this.isBoss ? 16 : 9;
    }
    // 3. Chasing Player -> Stalking prowl walk (Zombie_Walk_Fwd_Loop)
    else if (distance > engagementRange && !this.attackActionPlaying && !this.hurtActionPlaying) {
      const moveSpeed = this.isBoss ? 2.8 : 3.2;
      this.group.position.addScaledVector(toPlayer.normalize(), Math.min(distance - engagementRange, moveSpeed * dt));
      this.playAction('Zombie_Walk_Fwd_Loop', 0.15, true);
    }
    // 4. Idle / Waiting -> Hunched menacing idle
    else if (!this.attackActionPlaying && !this.hurtActionPlaying) {
      this.playAction('Zombie_Idle_Loop', 0.18, true);
    }

    return dealtDamage;
  }

  public takeDamage(amount: number, knockback: THREE.Vector3): boolean {
    if (this.dead) return false;

    this.health = Math.max(0, this.health - amount);
    this.hitFlash = 1;

    // Apply knockback impulse
    this.group.position.addScaledVector(knockback.setY(0).normalize(), this.isBoss ? 0.35 : 0.85);
    this.updateHealthBar();

    // Trigger authored reeling hit reaction
    this.hurtActionPlaying = true;
    this.attackActionPlaying = false;
    this.actionTimer = 0.42;
    this.playAction('Hit_Knockback', 0.08, false);

    if (this.health <= 0) {
      this.dead = true;
      this.playAction('Consume', 0.1, false);
      this.healthBack.visible = false;
      this.healthFill.visible = false;
      this.aura.visible = false;
      return true;
    }

    return false;
  }

  public get isDead(): boolean {
    return this.dead;
  }

  public get healthRatio(): number {
    return this.health / this.maxHealth;
  }

  private updateHealthBar(): void {
    const ratio = this.healthRatio;
    this.healthFill.scale.x = Math.max(0.001, ratio);
    const scale = this.isBoss ? 1.75 : 1.15;
    const barWidth = 1.4 * scale;
    this.healthFill.position.x = -((1 - ratio) * (barWidth / 2));
  }
}
