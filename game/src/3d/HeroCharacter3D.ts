import * as THREE from 'three';
import { ModelLibrary, CharacterInstance } from './ModelLibrary';
import { Trishul3D } from './weapons/Trishul3D';
import { COLORS } from './Constants3D';

export class HeroCharacter3D {
  public group: THREE.Group;
  public isLoaded: boolean = false;
  public model: THREE.Group | null = null;
  public mixer: THREE.AnimationMixer | null = null;
  public actions: Map<string, THREE.AnimationAction> = new Map();
  public currentActionName: string = 'idle_shield_loop';

  private oneShotActionName: string | null = null;
  private oneShotRemaining = 0;
  private loopActionName: string | null = null;
  private customIdleName: string | null = null;
  private trishul: Trishul3D;
  private haloMesh: THREE.Mesh | null = null;

  constructor(onLoadCallback?: () => void) {
    this.group = new THREE.Group();
    this.trishul = new Trishul3D();

    const lib = ModelLibrary.getInstance();
    lib.preload(() => {
      this.initCharacter(lib.createInstance(), onLoadCallback);
    });
  }

  private initCharacter(inst: CharacterInstance | null, onLoadCallback?: () => void): void {
    if (!inst) return;

    this.model = inst.model;
    this.mixer = inst.mixer;
    this.actions = inst.actions;

    // Heroic height (approx 2.45m tall in world units)
    this.model.scale.set(1.35, 1.35, 1.35);

    // 1. Assign Vedic Warrior PBR Aesthetics to the Cloned SkinnedMesh
    this.model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.SkinnedMesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const updateMat = (m: THREE.Material) => {
          const std = m as THREE.MeshStandardMaterial;
          if (!std.color) return;

          if (std.name === 'M_Joints') {
            // Gleaming Antique Gold Armored Joints & Bracers
            std.color.setHex(COLORS.ANTIQUE_GOLD);
            std.roughness = 0.22;
            std.metalness = 0.92;
          } else {
            // Warm Sun-Blessed Terracotta Warrior Skin
            std.color.setHex(0xb46b43);
            std.roughness = 0.58;
            std.metalness = 0.1;
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

    // 2. Attach Sacred 3D Trishul to hand_r Bone
    const rightHand = this.model.getObjectByName('hand_r');
    if (rightHand) {
      this.trishul.mesh.scale.set(0.65, 0.65, 0.65);
      this.trishul.mesh.position.set(0, 0.08, 0);
      // Aligned with forearm grip
      this.trishul.mesh.rotation.set(-Math.PI / 2, 0, 0);
      rightHand.add(this.trishul.mesh);
    } else {
      this.group.add(this.trishul.mesh);
    }

    // 3. Attach Kirita Mukuta (Golden Crown) & Third Eye Gem to Head Bone
    const head = this.model.getObjectByName('Head');
    if (head) {
      const crownGroup = new THREE.Group();
      crownGroup.position.set(0, 0.15, 0.02);

      const goldMat = new THREE.MeshStandardMaterial({
        color: COLORS.ANTIQUE_GOLD,
        roughness: 0.18,
        metalness: 0.95,
      });

      // Royal Tiered Mukuta Crown
      const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.1, 16), goldMat);
      crownBase.castShadow = true;
      crownGroup.add(crownBase);

      const crownSpire = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.32, 16), goldMat);
      crownSpire.position.y = 0.2;
      crownSpire.castShadow = true;
      crownGroup.add(crownSpire);

      // Third Eye Fiery Ruby Gem
      const ruby = new THREE.Mesh(
        new THREE.SphereGeometry(0.024, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xff2222, emissive: 0xff2222, emissiveIntensity: 1.6 })
      );
      ruby.position.set(0, -0.04, 0.12);
      crownGroup.add(ruby);

      head.add(crownGroup);
    }

    // 4. Divine Prana Halo behind the Hero
    const haloGeo = new THREE.RingGeometry(0.75, 0.92, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xf7d981,
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.haloMesh = new THREE.Mesh(haloGeo, haloMat);
    this.haloMesh.position.set(0, 1.8, -0.2);
    this.group.add(this.haloMesh);

    // 5. Configure Locomotion and Combat Actions
    const walkAction = this.getAction('walk_carry_loop');
    if (walkAction) {
      walkAction.setEffectiveTimeScale(1.42);
      this.actions.set('run', walkAction);
    }

    // Set Initial Combat Guard Idle
    const initialIdle = this.getAction('idle_shield_loop') || this.getAction('idle_no_loop') || this.actions.values().next().value;
    if (initialIdle) {
      initialIdle.reset().play();
      this.currentActionName = 'idle_shield_loop';
    }

    this.group.add(this.model);
    this.isLoaded = true;

    if (onLoadCallback) {
      onLoadCallback();
    }
  }

  public getAction(name: string): THREE.AnimationAction | null {
    const key = name.toLowerCase();
    return this.actions.get(name) || this.actions.get(key) || null;
  }

  public hasAction(clipName: string): boolean {
    return this.getAction(clipName) !== null;
  }

  public playLibraryAction(clipName: string, preferredDuration = 0.55): boolean {
    const action = this.getAction(clipName);
    if (!action || !this.mixer) return false;

    const key = clipName.toLowerCase();
    const clipDuration = Math.max(action.getClip().duration, 0.05);
    const playbackRate = THREE.MathUtils.clamp(clipDuration / preferredDuration, 0.8, 2.5);
    const playbackDuration = clipDuration / playbackRate;
    const previousAction = this.getAction(this.currentActionName);

    action.reset();
    action.enabled = true;
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.setEffectiveTimeScale(playbackRate);
    action.setEffectiveWeight(1);
    action.play();

    if (previousAction && previousAction !== action) {
      action.crossFadeFrom(previousAction, 0.08, false);
    }

    this.currentActionName = key;
    this.oneShotActionName = key;
    this.oneShotRemaining = playbackDuration;
    return true;
  }

  public playLoopAction(clipName: string, fadeDuration = 0.15): boolean {
    const action = this.getAction(clipName);
    if (!action || !this.mixer) return false;

    const key = clipName.toLowerCase();
    if (this.loopActionName === key) return true;

    const previousAction = this.getAction(this.currentActionName);
    action.reset();
    action.enabled = true;
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(1);
    action.play();

    if (previousAction && previousAction !== action) {
      action.crossFadeFrom(previousAction, fadeDuration, false);
    }

    this.currentActionName = key;
    this.loopActionName = key;
    this.oneShotActionName = null;
    return true;
  }

  public stopLoopAction(fadeDuration = 0.18): void {
    if (this.loopActionName) {
      const act = this.getAction(this.loopActionName);
      if (act) act.fadeOut(fadeDuration);
    }
    this.loopActionName = null;
  }

  public setCustomIdle(clipName: string | null): void {
    this.customIdleName = clipName ? clipName.toLowerCase() : null;
  }

  public update(dt: number, isMoving: boolean, _attackProgress = 0, isGrounded = true): void {
    if (this.mixer) {
      this.mixer.update(dt);
    }

    if (this.haloMesh) {
      this.haloMesh.rotation.z += dt * 0.45;
    }

    if (this.oneShotActionName) {
      this.oneShotRemaining = Math.max(0, this.oneShotRemaining - dt);
      if (this.oneShotRemaining === 0) this.oneShotActionName = null;
    }

    // Determine target animation hierarchy:
    // 1. One-shot action (strike, jump takeoff, jump land, dash, hook punch, slide)
    // 2. Mid-air jump loop (NinjaJump_Idle_Loop)
    // 3. Persistent loop action (Sword_Block)
    // 4. Locomotion (Walk_Carry_Loop at athletic run rate)
    // 5. Idle posture (Idle_Shield_Loop or dynamic custom idles)
    let targetActionName: string;

    if (this.oneShotActionName) {
      targetActionName = this.oneShotActionName;
    } else if (!isGrounded && this.hasAction('ninjajump_idle_loop')) {
      targetActionName = 'ninjajump_idle_loop';
    } else if (this.loopActionName) {
      targetActionName = this.loopActionName;
    } else if (isMoving && this.hasAction('walk_carry_loop')) {
      targetActionName = 'walk_carry_loop';
    } else if (this.customIdleName && this.hasAction(this.customIdleName)) {
      targetActionName = this.customIdleName;
    } else {
      targetActionName = 'idle_shield_loop';
    }

    const currentAct = this.getAction(this.currentActionName);
    const targetAct = this.getAction(targetActionName);

    if (this.currentActionName !== targetActionName && targetAct) {
      if (currentAct) {
        currentAct.fadeOut(0.15);
      }
      targetAct.reset().fadeIn(0.15).play();
      this.currentActionName = targetActionName;
    }
  }
}
