import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AssetRegistry3D } from './AssetRegistry3D';
import { COLORS } from './Constants3D';

export class TempleWorld3D {
  public group: THREE.Group;
  private torchLights: { light: THREE.PointLight; baseIntensity: number; timeOffset: number }[] = [];
  private flameCones: THREE.Mesh[] = [];
  private flameRingMesh!: THREE.Mesh;
  private embersParticles!: THREE.Points;
  private embersPositions!: Float32Array;
  private animMixers: THREE.AnimationMixer[] = [];

  constructor(private assets: AssetRegistry3D) {
    this.group = new THREE.Group();
    this.buildCourtyardFloor();
    this.buildStonePillars();
    this.build3DFireBraziers();
    this.buildCentralShivaDeity();
    this.build3DSacredShrine();
    this.buildCurvedHorizonBackdrop();
    this.build3DEmbers();
    this.buildOpenSourceCreatures();
  }

  private buildCourtyardFloor(): void {
    // 1. Lower Temple Foundation
    const foundationGeo = new THREE.CylinderGeometry(18, 19, 1.2, 48);
    const stoneDarkMat = new THREE.MeshStandardMaterial({
      color: COLORS.STONE_DARK,
      roughness: 0.9,
      metalness: 0.1,
    });
    const foundation = new THREE.Mesh(foundationGeo, stoneDarkMat);
    foundation.position.y = -0.8;
    foundation.receiveShadow = true;
    this.group.add(foundation);

    // 2. Raised Central Mandapa Podium (with steps)
    const podiumGeo = new THREE.CylinderGeometry(15, 15.5, 0.6, 48);
    const podiumMat = new THREE.MeshStandardMaterial({
      color: 0x2b1c13,
      roughness: 0.82,
      metalness: 0.12,
    });
    const podium = new THREE.Mesh(podiumGeo, podiumMat);
    podium.position.y = -0.3;
    podium.receiveShadow = true;
    this.group.add(podium);

    // 3. Decorative Stage Decal from static asset
    const stageTex = this.assets.loadTexture('/images/SimpleAssets/nataraja-separated-elements/10-dancer-stage-platform.png');
    const stageGeo = new THREE.PlaneGeometry(24, 24);
    stageGeo.rotateX(-Math.PI / 2);

    const stageMat = new THREE.MeshStandardMaterial({
      map: stageTex,
      transparent: true,
      roughness: 0.8,
      metalness: 0.15,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    });
    const stageMesh = new THREE.Mesh(stageGeo, stageMat);
    stageMesh.position.y = 0.01;
    stageMesh.receiveShadow = true;
    this.group.add(stageMesh);

    // 4. Central Sacred Mandala Medallion
    const mandalaTex = this.assets.loadTexture('/images/SimpleAssets/ui/mandala-circle.png');
    const mandalaGeo = new THREE.PlaneGeometry(8.5, 8.5);
    mandalaGeo.rotateX(-Math.PI / 2);
    const mandalaMat = new THREE.MeshStandardMaterial({
      map: mandalaTex,
      transparent: true,
      opacity: 0.85,
      roughness: 0.6,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    const mandalaMesh = new THREE.Mesh(mandalaGeo, mandalaMat);
    mandalaMesh.position.y = 0.02;
    mandalaMesh.receiveShadow = true;
    this.group.add(mandalaMesh);
  }

  private buildStonePillars(): void {
    const pillarCount = 8;
    const radius = 13.5;

    const baseGeo = new THREE.BoxGeometry(1.5, 0.8, 1.5);
    const shaftGeo = new THREE.CylinderGeometry(0.55, 0.65, 6.2, 16);
    const capitalGeo = new THREE.BoxGeometry(1.7, 0.6, 1.7);

    const stoneMat = new THREE.MeshStandardMaterial({
      color: COLORS.STONE_HIGHLIGHT,
      roughness: 0.78,
      metalness: 0.2,
    });

    for (let i = 0; i < pillarCount; i++) {
      // Keep camera entry arch open
      const angle = (i / pillarCount) * Math.PI * 2;
      if (angle > 1.0 && angle < 2.1) continue;

      const px = Math.cos(angle) * radius;
      const pz = Math.sin(angle) * radius;

      const pillarGroup = new THREE.Group();
      pillarGroup.position.set(px, 0, pz);

      const base = new THREE.Mesh(baseGeo, stoneMat);
      base.position.y = 0.4;
      base.castShadow = true;
      base.receiveShadow = true;
      pillarGroup.add(base);

      const shaft = new THREE.Mesh(shaftGeo, stoneMat);
      shaft.position.y = 3.9;
      shaft.castShadow = true;
      shaft.receiveShadow = true;
      pillarGroup.add(shaft);

      const capital = new THREE.Mesh(capitalGeo, stoneMat);
      capital.position.y = 7.3;
      capital.castShadow = true;
      capital.receiveShadow = true;
      pillarGroup.add(capital);

      this.group.add(pillarGroup);
    }
  }

  private build3DFireBraziers(): void {
    const brazierPositions = [
      { x: -7, z: -3, offset: 0 },
      { x: 7, z: -3, offset: 1.5 },
      { x: -5, z: 6, offset: 3.0 },
      { x: 5, z: 6, offset: 4.5 },
    ];

    const bronzeMat = new THREE.MeshStandardMaterial({
      color: 0x5a3118,
      metalness: 0.75,
      roughness: 0.35,
    });

    const fireMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    brazierPositions.forEach((pos) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(pos.x, 0, pos.z);

      // 1. 3D Pedestal Plinth
      const plinthGeo = new THREE.CylinderGeometry(0.7, 0.9, 0.5, 16);
      const plinth = new THREE.Mesh(plinthGeo, bronzeMat);
      plinth.position.y = 0.25;
      plinth.castShadow = true;
      plinth.receiveShadow = true;
      bGroup.add(plinth);

      // 2. Sculpted Column Stem
      const stemGeo = new THREE.CylinderGeometry(0.35, 0.45, 1.8, 16);
      const stem = new THREE.Mesh(stemGeo, bronzeMat);
      stem.position.y = 1.4;
      stem.castShadow = true;
      bGroup.add(stem);

      // 3. Wide Fire Urn Bowl
      const bowlGeo = new THREE.CylinderGeometry(1.2, 0.45, 0.9, 16);
      const bowl = new THREE.Mesh(bowlGeo, bronzeMat);
      bowl.position.y = 2.65;
      bowl.castShadow = true;
      bGroup.add(bowl);

      // 4. Volumetric 3D Flame Core
      const flameGeo = new THREE.ConeGeometry(0.75, 1.4, 12);
      const flame = new THREE.Mesh(flameGeo, fireMat);
      flame.position.y = 3.65;
      bGroup.add(flame);
      this.flameCones.push(flame);

      // 5. Dynamic 3D Point Light casting real-time shadows
      const light = new THREE.PointLight(COLORS.TORCH_FIRE, 42, 25, 1.4);
      light.position.set(0, 3.8, 0);
      light.castShadow = true;
      light.shadow.bias = -0.002;
      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;
      bGroup.add(light);

      this.torchLights.push({
        light,
        baseIntensity: 42,
        timeOffset: pos.offset,
      });

      this.group.add(bGroup);
    });
  }

  private buildCentralShivaDeity(): void {
    const centralGroup = new THREE.Group();
    centralGroup.position.set(0, 0, 0);

    // 1. Ornate Circular Lotus Pedestal for the central deity
    const pedestalGeo = new THREE.CylinderGeometry(2.0, 2.3, 0.45, 32);
    const bronzeMat = new THREE.MeshStandardMaterial({
      color: 0x4a2e1b,
      roughness: 0.4,
      metalness: 0.8,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, bronzeMat);
    pedestal.position.y = 0.22;
    pedestal.receiveShadow = true;
    pedestal.castShadow = true;
    centralGroup.add(pedestal);

    // 2. Load the Shiva 3D Model provided by user in src/assets/Shiva/white_mesh.glb
    const loader = new GLTFLoader();
    loader.load('/models/shiva.glb', (gltf) => {
      const shivaModel = gltf.scene;
      shivaModel.scale.set(1.9, 1.9, 1.9);
      shivaModel.position.set(0, 2.1, 0);
      shivaModel.rotation.y = 0; // Facing front towards camera and player

      const statueMat = new THREE.MeshStandardMaterial({
        color: 0x5a3d28, // Ancient temple bronze / sacred black granite
        roughness: 0.32,
        metalness: 0.85,
      });

      shivaModel.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry.computeVertexNormals();
          mesh.material = statueMat;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });

      centralGroup.add(shivaModel);
    });

    // 3. Sacred Divine Golden Aura Light at Center
    const auraLight = new THREE.PointLight(0xf59e0b, 35, 14, 1.3);
    auraLight.position.set(0, 4.2, 0.5);
    auraLight.castShadow = true;
    centralGroup.add(auraLight);

    this.group.add(centralGroup);
  }

  private build3DSacredShrine(): void {
    const shrineGroup = new THREE.Group();
    shrineGroup.position.set(0, 0, -9.8);

    const goldMat = new THREE.MeshStandardMaterial({
      color: COLORS.ANTIQUE_GOLD,
      metalness: 0.85,
      roughness: 0.25,
    });

    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x3d281a,
      roughness: 0.8,
    });

    // 1. Tiered Stone Altar Base
    const base1 = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.5, 3.2), stoneMat);
    base1.position.y = 0.25;
    base1.castShadow = true;
    base1.receiveShadow = true;
    shrineGroup.add(base1);

    const base2 = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.4, 2.6), stoneMat);
    base2.position.y = 0.7;
    base2.castShadow = true;
    base2.receiveShadow = true;
    shrineGroup.add(base2);

    // 2. 3D Lotus Petal Ring Pedestal
    const petalCount = 12;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petalGeo = new THREE.ConeGeometry(0.35, 0.8, 6);
      petalGeo.rotateZ(Math.PI / 4);
      const petal = new THREE.Mesh(petalGeo, goldMat);
      petal.position.set(Math.cos(angle) * 1.3, 1.1, Math.sin(angle) * 1.0);
      petal.rotation.y = -angle;
      petal.castShadow = true;
      shrineGroup.add(petal);
    }

    // 3. Central Sacred Lingam / Relic Stone
    const lingamGeo = new THREE.CylinderGeometry(0.55, 0.6, 1.4, 16);
    const lingamMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.2,
      metalness: 0.6,
    });
    const lingam = new THREE.Mesh(lingamGeo, lingamMat);
    lingam.position.y = 1.6;
    lingam.castShadow = true;
    shrineGroup.add(lingam);

    // 4. Rotating 3D Golden Prabhamandala Arch behind altar
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 3.2, -0.6);

    const ringGeo = new THREE.TorusGeometry(2.4, 0.12, 12, 32);
    const ringMesh = new THREE.Mesh(ringGeo, goldMat);
    ringMesh.castShadow = true;
    archGroup.add(ringMesh);

    // Radiant Flame Rays on Ring
    const rayCount = 16;
    for (let r = 0; r < rayCount; r++) {
      const rAngle = (r / rayCount) * Math.PI * 2;
      const rayGeo = new THREE.ConeGeometry(0.12, 0.6, 6);
      const ray = new THREE.Mesh(rayGeo, goldMat);
      ray.position.set(Math.cos(rAngle) * 2.65, Math.sin(rAngle) * 2.65, 0);
      ray.rotation.z = rAngle - Math.PI / 2;
      archGroup.add(ray);
    }

    this.flameRingMesh = archGroup as unknown as THREE.Mesh;
    shrineGroup.add(archGroup);

    this.group.add(shrineGroup);
  }

  private buildCurvedHorizonBackdrop(): void {
    const bgTex = this.assets.loadTexture('/images/ravan-kailash-elements/11-forest-background.png');
    bgTex.wrapS = THREE.RepeatWrapping;
    bgTex.repeat.set(2, 1);

    const bgGeo = new THREE.CylinderGeometry(40, 40, 30, 32, 1, true, -Math.PI * 0.8, Math.PI * 1.6);
    const bgMat = new THREE.MeshBasicMaterial({
      map: bgTex,
      side: THREE.BackSide,
      fog: true,
    });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgMesh.position.y = 8;
    this.group.add(bgMesh);
  }

  private build3DEmbers(): void {
    const emberCount = 350;
    this.embersPositions = new Float32Array(emberCount * 3);

    for (let i = 0; i < emberCount; i++) {
      const idx = i * 3;
      this.embersPositions[idx] = (Math.random() - 0.5) * 28;
      this.embersPositions[idx + 1] = Math.random() * 8.5;
      this.embersPositions[idx + 2] = (Math.random() - 0.5) * 28;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.embersPositions, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(251, 191, 36, 1)');
    grad.addColorStop(0.5, 'rgba(217, 119, 6, 0.8)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);

    const particleTex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.PointsMaterial({
      map: particleTex,
      size: 0.38,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.embersParticles = new THREE.Points(geo, mat);
    this.group.add(this.embersParticles);
  }

  private buildOpenSourceCreatures(): void {
    const loader = new GLTFLoader();

    // 1. Mythological Sacred Warhorse (Ashva Mount from Open-Source Mixamo/Three.js Library)
    loader.load('/models/Horse.glb', (gltf) => {
      const horse = gltf.scene;
      horse.scale.set(0.016, 0.016, 0.016);
      horse.position.set(-9.5, 0, 2);
      horse.rotation.y = Math.PI / 3.2;

      horse.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // Apply warm terracotta bronze tint
          ((child as THREE.Mesh).material as THREE.MeshStandardMaterial).color = new THREE.Color(0xa65b2d);
        }
      });

      if (gltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(horse);
        mixer.clipAction(gltf.animations[0]).play();
        this.animMixers.push(mixer);
      }

      this.group.add(horse);
    });

    // 2. Soaring Celestial Bird (Garuda / Mayura from Open-Source Library)
    loader.load('/models/Flamingo.glb', (gltf) => {
      const bird = gltf.scene;
      bird.scale.set(0.018, 0.018, 0.018);
      bird.position.set(7.5, 6.0, -3.5);
      bird.rotation.y = -Math.PI / 3;

      bird.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          child.castShadow = true;
          // Divine radiant golden plumage
          ((child as THREE.Mesh).material as THREE.MeshStandardMaterial).color = new THREE.Color(COLORS.ANTIQUE_GOLD);
        }
      });

      if (gltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(bird);
        mixer.clipAction(gltf.animations[0]).play();
        this.animMixers.push(mixer);
      }

      this.group.add(bird);
    });
  }

  public update(time: number, dt: number): void {
    // Update open-source 3D animated creatures
    this.animMixers.forEach((m) => m.update(dt));

    // 1. Realistic fire flickering on torchlights
    this.torchLights.forEach((t) => {
      const noise = Math.sin(time * 8 + t.timeOffset) * 4.5 + Math.cos(time * 16 + t.timeOffset * 2) * 3;
      t.light.intensity = t.baseIntensity + noise;
    });

    // 2. Animated flame cones (breathing & dancing)
    this.flameCones.forEach((flame, i) => {
      const pulse = Math.sin(time * 10 + i) * 0.15;
      flame.scale.set(1 + pulse, 1 + pulse * 1.5, 1 + pulse);
    });

    // 3. Slow sacred rotation of the Prabhamandala arch
    if (this.flameRingMesh) {
      this.flameRingMesh.rotation.z += 0.2 * dt;
    }

    // 4. Floating 3D embers simulation
    if (this.embersPositions) {
      const count = this.embersPositions.length / 3;
      for (let i = 0; i < count; i++) {
        const yIdx = i * 3 + 1;
        this.embersPositions[yIdx] += 0.85 * dt;
        if (this.embersPositions[yIdx] > 8.5) {
          this.embersPositions[yIdx] = 0.2;
        }
      }
      this.embersParticles.geometry.attributes.position.needsUpdate = true;
    }
  }
}
