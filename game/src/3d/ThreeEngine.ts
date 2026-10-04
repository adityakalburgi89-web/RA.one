import * as THREE from 'three';
import { COLORS } from './Constants3D';
import { AssetRegistry3D } from './AssetRegistry3D';
import { JungleWorld3D } from './JungleWorld3D';
import { Player3D } from './Player3D';
import { CinematicCamera3D } from './CinematicCamera3D';
import { Enemy3D, EnemyKind } from './Enemy3D';
import { CombatEffects } from './CombatEffects';
import { GameUI } from './GameUI';
import { SoundManager } from '../audio/SoundManager';
import { SettingsManager, GameSettings } from '../settings/SettingsManager';
import { SettingsModal } from '../ui/SettingsModal';
import { PauseMenu } from '../ui/PauseMenu';
import { LoadingScreen } from '../ui/LoadingScreen';
import { DamageFloater } from '../ui/DamageFloater';
import { ModelLibrary } from './ModelLibrary';

type SoulDrop = { mesh: THREE.Group; value: number; heal: number; phase: number };
type EncounterState = 'shades' | 'summoning' | 'warden' | 'victory';

export class ThreeEngine {
  private renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  private cameraSystem: CinematicCamera3D;
  private assets: AssetRegistry3D;
  private world: JungleWorld3D;
  public player: Player3D;
  private clock: THREE.Clock;
  private readonly effects: CombatEffects;
  private readonly ui: GameUI;
  private enemies: Enemy3D[] = [];
  private soulDrops: SoulDrop[] = [];
  private encounterState: EncounterState = 'shades';
  private summonTimer = 0;
  private defeatTimer = 0;
  private experience = 0;
  private level = 1;

  // New Audio, Pause, Loading, & Settings Subsystems
  private sound: SoundManager;
  private settingsManager: SettingsManager;
  private settingsModal: SettingsModal;
  private pauseMenu: PauseMenu;
  private loadingScreen: LoadingScreen;
  private floaters: DamageFloater;

  private isPaused: boolean = false;
  private isGameStarted: boolean = false;
  private keyLight!: THREE.DirectionalLight;

  constructor(container: HTMLElement) {
    this.clock = new THREE.Clock();

    // 0. Initialize Subsystems
    ModelLibrary.getInstance().preload();
    this.sound = SoundManager.getInstance();
    this.settingsManager = SettingsManager.getInstance();
    this.floaters = new DamageFloater();

    // 1. Initialize a humid, early-morning jungle atmosphere.
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.FOG);
    this.scene.fog = new THREE.FogExp2(COLORS.FOG, 0.027);

    // 2. Initialize High-Performance WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    container.appendChild(this.renderer.domElement);

    // 3. Setup Cinematic 3D Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.cameraSystem = new CinematicCamera3D(aspect);

    // 4. Asset Manager
    this.assets = new AssetRegistry3D();

    // 5. Environmental Lights
    this.setupLighting();

    // 6. Instantiate level one: Vana Path jungle clearing.
    this.world = new JungleWorld3D(this.assets);
    this.scene.add(this.world.group);

    // 7. Instantiate 3D Player
    this.player = new Player3D(this.assets);
    this.scene.add(this.player.group);
    this.cameraSystem.snapTo(this.player.group.position);

    // 8. Original combat effects
    this.effects = new CombatEffects();
    this.scene.add(this.effects.group);

    // 9. Modals & UI Systems
    this.settingsModal = new SettingsModal();
    this.pauseMenu = new PauseMenu(
      this.settingsModal,
      (paused) => this.setPaused(paused),
      () => this.restartEncounter()
    );

    this.ui = new GameUI(
      () => this.pauseMenu.toggle(),
      () => this.settingsModal.open()
    );

    this.spawnEncounter('shade');

    // 10. Thematic Loading Screen setup
    this.loadingScreen = new LoadingScreen(() => {
      this.isGameStarted = true;
      this.clock.start();
      this.ui.announce('The grove is tainted. Cleanse the Ashen Shades.', 3.5);
    });

    this.setupLoadingTracking();

    // 11. Settings Listeners & Apply Initial Settings
    this.settingsManager.subscribe((settings) => this.applySettings(settings));
    this.applySettings(this.settingsManager.getSettings());

    // 12. Global Event Listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));
    window.addEventListener('keydown', (event) => {
      const key = event.key ? event.key.toLowerCase() : '';
      if (key === 'r' && this.encounterState === 'victory') this.restartEncounter();
      if (key === 'm') {
        const muted = this.sound.toggleMute();
        this.settingsManager.updateSetting('isMuted', muted);
        this.ui.updateSoundButton(muted);
      }
    });

    // 13. Start 60 FPS Game Loop
    this.animate();
  }

  private setupLoadingTracking(): void {
    let progressFallback = 10;
    const interval = window.setInterval(() => {
      progressFallback += 18;
      this.loadingScreen.setProgress(progressFallback);
      if (progressFallback >= 100) {
        window.clearInterval(interval);
      }
    }, 280);

    THREE.DefaultLoadingManager.onProgress = (_url, itemsLoaded, itemsTotal) => {
      const pct = Math.min(96, Math.round((itemsLoaded / itemsTotal) * 100));
      this.loadingScreen.setProgress(pct);
    };

    THREE.DefaultLoadingManager.onLoad = () => {
      window.clearInterval(interval);
      this.loadingScreen.setProgress(100, 'Grove Fully Manifested');
    };
  }

  private setupLighting(): void {
    const hemisphere = new THREE.HemisphereLight(0x91bfa8, 0x142116, 2.05);
    this.scene.add(hemisphere);
    const ambientLight = new THREE.AmbientLight(COLORS.AMBIENT, 0.72);
    this.scene.add(ambientLight);

    // Dawn key light cuts through the canopy and catches the stone path.
    this.keyLight = new THREE.DirectionalLight(COLORS.KEY_LIGHT, 2.25);
    this.keyLight.position.set(-18, 28, 12);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 60;
    this.keyLight.shadow.camera.left = -32;
    this.keyLight.shadow.camera.right = 32;
    this.keyLight.shadow.camera.top = 32;
    this.keyLight.shadow.camera.bottom = -32;
    this.keyLight.shadow.bias = -0.0005;
    this.scene.add(this.keyLight);
  }

  private applySettings(settings: GameSettings): void {
    // Quality Presets
    switch (settings.graphicsQuality) {
      case 'low':
        this.renderer.setPixelRatio(1);
        this.renderer.shadowMap.enabled = false;
        break;
      case 'medium':
        this.renderer.setPixelRatio(1);
        this.renderer.shadowMap.enabled = true;
        this.keyLight.shadow.mapSize.set(1024, 1024);
        break;
      case 'high':
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.renderer.shadowMap.enabled = true;
        this.keyLight.shadow.mapSize.set(2048, 2048);
        break;
      case 'ultra':
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.keyLight.shadow.mapSize.set(2048, 2048);
        break;
    }

    // Fog Control
    if (settings.fogEnabled) {
      this.scene.fog = new THREE.FogExp2(COLORS.FOG, settings.fogDensity);
    } else {
      this.scene.fog = null;
    }

    // Camera preset
    if (settings.cameraDistance === 'cinematic') {
      this.cameraSystem.camera.fov = 42;
      this.cameraSystem.camera.updateProjectionMatrix();
    } else if (settings.cameraDistance === 'far') {
      this.cameraSystem.camera.fov = 56;
      this.cameraSystem.camera.updateProjectionMatrix();
    } else {
      this.cameraSystem.camera.fov = 48;
      this.cameraSystem.camera.updateProjectionMatrix();
    }
  }

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
    this.player.isPaused = paused;
    if (!paused) {
      // Discard accumulated clock delta to prevent jump
      this.clock.getDelta();
    }
    this.updateHud();
  }

  private onWindowResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    this.cameraSystem.onResize(width, height);
  }

  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));

    // If game has not started yet or is paused, render the frame without physics advance
    if (!this.isGameStarted || this.isPaused) {
      this.clock.getDelta(); // Discard dt
      this.renderer.render(this.scene, this.cameraSystem.camera);
      return;
    }

    const dt = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // Update Player & World Systems
    this.player.update(dt);
    this.world.update(elapsedTime, dt);
    this.effects.update(dt);

    if (this.player.isDefeated) {
      this.defeatTimer += dt;
      if (this.defeatTimer > 2.4) {
        this.player.revive(new THREE.Vector3(0, 0, -17.5));
        this.defeatTimer = 0;
        this.ui.announce('The shrine restores you. Press on, guardian.');
      }
    } else {
      this.defeatTimer = 0;
      this.updateCombat(dt, elapsedTime);
    }

    // Camera smoothly tracks player
    this.cameraSystem.update(this.player.getPosition(), dt);

    this.updateHud();

    // Render 3D Frame
    this.renderer.render(this.scene, this.cameraSystem.camera);
  }

  private updateCombat(dt: number, time: number): void {
    if (this.player.consumeAttackRequest()) this.performTrishulStrike();
    if (this.player.consumePulseRequest()) this.performPranaPulse();

    this.enemies.forEach((enemy) => {
      const damage = enemy.update(this.player.getPosition(), dt, time);
      if (damage > 0 && this.player.takeDamage(damage)) {
        this.effects.impact(this.player.getPosition(), enemy.isBoss);

        if (this.settingsManager.getSettings().damageNumbers) {
          this.floaters.spawn(this.player.getPosition(), this.cameraSystem.camera, Math.round(damage), {
            color: '#ff4d4d',
            prefix: '- ',
          });
        }
      }
    });

    this.collectSouls(time);

    if (this.enemies.length === 0 && this.encounterState === 'shades') {
      this.encounterState = 'summoning';
      this.summonTimer = 1.9;
      this.ui.announce('A deeper corruption answers the fallen shades…');
    }
    if (this.encounterState === 'summoning') {
      this.summonTimer -= dt;
      if (this.summonTimer <= 0) {
        this.encounterState = 'warden';
        this.spawnEncounter('warden');
        this.sound.playBossAwaken();
        this.ui.announce('Kaalvan, the Grove Warden, has awakened!');
      }
    }
  }

  private performTrishulStrike(): void {
    const origin = this.player.getPosition();
    const direction = this.player.getFacingDirection();
    this.effects.slash(origin, direction);

    const isHeavy = this.player.currentComboStep === 3 || this.player.currentComboStep === 4;

    this.enemies.slice().forEach((enemy) => {
      const towardEnemy = enemy.group.position.clone().sub(origin);
      towardEnemy.y = 0;
      const distance = towardEnemy.length();
      const inFront = distance > 0.01 && direction.dot(towardEnemy.normalize()) > -0.12;
      if (distance <= 3.25 && inFront) {
        const damage = enemy.isBoss ? (isHeavy ? 56 : 32) : (isHeavy ? 72 : 42);
        const slain = enemy.takeDamage(damage, direction.clone());
        this.effects.impact(enemy.group.position, enemy.isBoss || isHeavy);
        this.sound.playHit(enemy.isBoss);

        if (this.settingsManager.getSettings().damageNumbers) {
          this.floaters.spawn(enemy.group.position, this.cameraSystem.camera, damage, {
            color: isHeavy ? '#ff6633' : (enemy.isBoss ? '#ff8e6b' : '#ffea75'),
            isCrit: isHeavy || enemy.isBoss,
            prefix: isHeavy ? '💥 ' : '',
          });
        }

        if (slain) this.defeatEnemy(enemy);
      }
    });
  }

  private performPranaPulse(): void {
    const origin = this.player.getPosition();
    this.effects.pulse(origin);
    this.sound.playPulse();
    this.ui.announce('Prana Pulse released.');

    this.enemies.slice().forEach((enemy) => {
      const direction = enemy.group.position.clone().sub(origin);
      direction.y = 0;
      if (direction.length() <= 6.8) {
        const damage = enemy.isBoss ? 36 : 52;
        const slain = enemy.takeDamage(damage, direction);
        this.effects.impact(enemy.group.position, enemy.isBoss);
        this.sound.playHit(enemy.isBoss);

        if (this.settingsManager.getSettings().damageNumbers) {
          this.floaters.spawn(enemy.group.position, this.cameraSystem.camera, damage, {
            color: '#a8ff85',
            isCrit: true,
            prefix: '★ ',
          });
        }

        if (slain) this.defeatEnemy(enemy);
      }
    });
  }

  private defeatEnemy(enemy: Enemy3D): void {
    this.scene.remove(enemy.group);
    this.enemies = this.enemies.filter((candidate) => candidate !== enemy);
    this.sound.playEnemySlain();
    this.spawnSoul(enemy.group.position, enemy.isBoss ? 38 : 18, enemy.isBoss ? 20 : 9);
    if (enemy.isBoss) {
      this.encounterState = 'victory';
      this.sound.playVictory();
      this.player.playVictory();
      this.ui.announce('The grove is cleansed. You have restored the Vana Path!', 4.5);
    }
  }

  private spawnEncounter(kind: EnemyKind): void {
    const locations = kind === 'warden'
      ? [[0, -2]]
      : [[-14, -5], [-7, 5], [11, -4], [9, 9], [0, 12]];
    locations.forEach(([x, z], index) => {
      const enemy = new Enemy3D(kind, new THREE.Vector3(x, 0, z), index);
      this.enemies.push(enemy);
      this.scene.add(enemy.group);
      this.effects.impact(enemy.group.position, kind === 'warden');
    });
  }

  private spawnSoul(position: THREE.Vector3, value: number, heal: number): void {
    const group = new THREE.Group();
    group.position.copy(position);
    const core = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.28, 0),
      new THREE.MeshStandardMaterial({ color: 0xd9ff9d, emissive: 0x77cc65, emissiveIntensity: 1.4, roughness: 0.25, metalness: 0.35 })
    );
    core.position.y = 0.58;
    group.add(core);
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.38, 0.025, 6, 18),
      new THREE.MeshBasicMaterial({ color: 0xd9ff9d, transparent: true, opacity: 0.78, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    halo.position.y = 0.58;
    halo.rotation.x = Math.PI / 2;
    group.add(halo);
    this.soulDrops.push({ mesh: group, value, heal, phase: this.soulDrops.length * 1.9 });
    this.scene.add(group);
  }

  private collectSouls(time: number): void {
    this.soulDrops = this.soulDrops.filter((soul) => {
      soul.mesh.rotation.y += 0.045;
      soul.mesh.position.y = Math.sin(time * 3 + soul.phase) * 0.1;
      if (soul.mesh.position.distanceTo(this.player.getPosition()) > 1.35) return true;
      this.scene.remove(soul.mesh);
      this.player.heal(soul.heal);
      this.experience += soul.value;
      this.level = 1 + Math.floor(this.experience / 100);
      this.effects.impact(this.player.getPosition());
      this.sound.playSoulCollect();

      if (this.settingsManager.getSettings().damageNumbers) {
        this.floaters.spawn(this.player.getPosition(), this.cameraSystem.camera, `+${soul.heal} HP`, {
          color: '#9affb4',
          prefix: '',
        });
      }

      return false;
    });
  }

  private updateHud(): void {
    const boss = this.enemies.find((enemy) => enemy.isBoss);
    const quest = this.encounterState === 'victory'
      ? 'THE VANA PATH RESTORED'
      : this.encounterState === 'warden'
        ? 'DEFEAT KAALVAN, THE GROVE WARDEN'
        : this.encounterState === 'summoning'
          ? 'THE ANCIENT GROVE STIRS'
          : 'CLEANSE THE OUTER GROVE';
    this.ui.update({
      health: this.player.health,
      maxHealth: this.player.maxHealth,
      experience: this.experience,
      level: this.level,
      foesRemaining: this.enemies.length,
      quest,
      dashReady: this.player.dashReady,
      pulseReady: this.player.pulseReady,
      dashCooldownRatio: this.player.dashCooldownRatio,
      pulseCooldownRatio: this.player.pulseCooldownRatio,
      boss: boss ? { name: boss.name, health: boss.health, maxHealth: boss.maxHealth } : undefined,
      isPaused: this.isPaused,
    });
  }

  public restartEncounter(): void {
    this.enemies.forEach((enemy) => this.scene.remove(enemy.group));
    this.soulDrops.forEach((soul) => this.scene.remove(soul.mesh));
    this.enemies = [];
    this.soulDrops = [];
    this.experience = 0;
    this.level = 1;
    this.encounterState = 'shades';
    this.player.revive(new THREE.Vector3(0, 0, -17.5));
    this.spawnEncounter('shade');
    this.ui.announce('The path darkens again. Cleanse the grove.');
  }
}
