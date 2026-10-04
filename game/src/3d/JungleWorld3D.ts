import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AssetRegistry3D } from './AssetRegistry3D';
import { COLORS } from './Constants3D';

type Torch = { flame: THREE.Mesh; light: THREE.PointLight; phase: number };

/** Level one: a self-contained jungle clearing with an ancient mandapa ruin. */
export class JungleWorld3D {
  public group = new THREE.Group();
  private waterMaterial: THREE.MeshStandardMaterial;
  private idolHalo: THREE.Mesh | null = null;
  private torches: Torch[] = [];
  private mistLayers: THREE.Mesh[] = [];
  private fireflyPositions!: Float32Array;
  private fireflyBasePositions!: Float32Array;
  private fireflySeeds: number[] = [];
  private fireflies!: THREE.Points;
  private leafPositions!: Float32Array;
  private leafVelocities!: Float32Array;
  private fallingLeaves!: THREE.Points;
  private grassMesh: THREE.InstancedMesh | null = null;

  constructor(private assets: AssetRegistry3D) {
    this.group.name = 'VanaPathFirstJungle';
    this.waterMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.RIVER, emissive: COLORS.RIVER_GLOW, emissiveIntensity: 0.45,
      roughness: 0.18, metalness: 0.24, transparent: true, opacity: 0.88,
    });
    this.createPaintedHorizon();
    this.createForestFloor();
    this.createWindingRiver();
    this.createRiverLotuses();
    this.createStonePath();
    this.createMandapaRuin();
    this.createShrineAndTorches();
    this.createForestGuardianIdol();
    this.createJungleCanopy();
    this.createBambooGroves();
    this.createForestScatter();
    this.createBermudaGrassField();
    this.createAtmosphere();
  }

  private createPaintedHorizon(): void {
    const horizon = new THREE.Mesh(
      new THREE.PlaneGeometry(92, 40),
      new THREE.MeshBasicMaterial({ map: this.assets.loadTexture('/images/ravan-kailash-elements/11-forest-background.png'), fog: true })
    );
    horizon.position.set(0, 17, -47);
    this.group.add(horizon);
    this.addBackdropLayer('/images/ravan-kailash-elements/mountain-jungle-filler-pack/03-distant-mountain-range.png', 0, 10, -43, 66, 16, 0.75);
    this.addBackdropLayer('/images/ravan-kailash-elements/mountain-jungle-filler-pack/01-left-jungle-mountain.png', -28, 12, -38, 31, 27, 0.96);
    this.addBackdropLayer('/images/ravan-kailash-elements/mountain-jungle-filler-pack/02-right-jungle-mountain.png', 28, 12, -38, 31, 27, 0.96);
  }

  private addBackdropLayer(path: string, x: number, y: number, z: number, width: number, height: number, opacity: number): void {
    const layer = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map: this.assets.loadTexture(path), transparent: true, opacity, depthWrite: false, fog: true })
    );
    layer.position.set(x, y, z);
    this.group.add(layer);
  }

  private createForestFloor(): void {
    const earth = new THREE.Mesh(new THREE.CircleGeometry(46, 72), this.createCc0TerrainMaterial(COLORS.EARTH, 16));
    earth.rotation.x = -Math.PI / 2;
    earth.receiveShadow = true;
    this.group.add(earth);
    const clearing = new THREE.Mesh(new THREE.CircleGeometry(17.5, 56), this.createCc0TerrainMaterial(COLORS.CLEARING, 6));
    clearing.rotation.x = -Math.PI / 2;
    clearing.position.y = 0.012;
    clearing.receiveShadow = true;
    this.group.add(clearing);
    const mossRing = new THREE.Mesh(new THREE.RingGeometry(17.5, 24, 64), this.createCc0TerrainMaterial(COLORS.MOSS_DARK, 8));
    mossRing.rotation.x = -Math.PI / 2;
    mossRing.position.y = 0.015;
    mossRing.receiveShadow = true;
    this.group.add(mossRing);
  }

  private createCc0TerrainMaterial(tint: number, repeat: number): THREE.MeshStandardMaterial {
    const colour = this.cloneRepeatingTexture(
      this.assets.loadTexture('/textures/polyhaven/brown_mud_rocks_01_diff_1k.jpg'),
      repeat
    );
    const normal = this.cloneRepeatingTexture(
      this.assets.loadDataTexture('/textures/polyhaven/brown_mud_rocks_01_nor_gl_1k.jpg'),
      repeat
    );
    const roughness = this.cloneRepeatingTexture(
      this.assets.loadDataTexture('/textures/polyhaven/brown_mud_rocks_01_rough_1k.jpg'),
      repeat
    );
    return new THREE.MeshStandardMaterial({
      color: tint,
      map: colour,
      normalMap: normal,
      normalScale: new THREE.Vector2(0.55, 0.55),
      roughnessMap: roughness,
      roughness: 0.88,
      metalness: 0,
    });
  }

  private cloneRepeatingTexture(source: THREE.Texture, repeat: number): THREE.Texture {
    const texture = source.clone();
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeat, repeat);
    texture.needsUpdate = true;
    return texture;
  }

  private createWindingRiver(): void {
    const centers: THREE.Vector3[] = [];
    const segments = 42;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      centers.push(new THREE.Vector3(22 + Math.sin(t * Math.PI * 3.1) * 3.4, 0.045, 38 - t * 79));
    }
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    centers.forEach((center, index) => {
      const previous = centers[Math.max(0, index - 1)];
      const next = centers[Math.min(centers.length - 1, index + 1)];
      const tangent = next.clone().sub(previous).normalize();
      const perpendicular = new THREE.Vector3(-tangent.z, 0, tangent.x);
      const halfWidth = 2.45 + Math.sin(index * 0.75) * 0.45;
      const left = center.clone().addScaledVector(perpendicular, halfWidth);
      const right = center.clone().addScaledVector(perpendicular, -halfWidth);
      vertices.push(left.x, left.y, left.z, right.x, right.y, right.z);
      uvs.push(0, index / segments, 1, index / segments);
      if (index < segments) {
        const a = index * 2;
        indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const river = new THREE.Mesh(geometry, this.waterMaterial);
    river.receiveShadow = true;
    this.group.add(river);
    const bankMaterial = new THREE.MeshStandardMaterial({ color: COLORS.RIVER_BANK, roughness: 0.95 });
    for (let i = 2; i < centers.length - 2; i += 2) {
      const center = centers[i];
      const bankRock = this.createRock(0.35 + (i % 5) * 0.08, bankMaterial);
      bankRock.position.set(center.x + (i % 4 === 0 ? -3 : 3), 0.23, center.z + Math.sin(i) * 0.7);
      bankRock.rotation.set(0.15 * i, i * 0.5, 0.1);
      this.group.add(bankRock);
    }
  }

  private createStonePath(): void {
    const stoneMaterial = new THREE.MeshStandardMaterial({ color: COLORS.STONE_MID, roughness: 0.88, metalness: 0.06 });
    for (let i = 0; i < 31; i++) {
      const t = i / 30;
      const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.72 + (i % 4) * 0.09, 0.8 + (i % 4) * 0.09, 0.18, 7), stoneMaterial);
      stone.position.set(Math.sin(t * Math.PI * 2.3) * 2.7 - t * 1.3, 0.09, 24 - t * 51);
      stone.rotation.set(0, i * 0.83, (i % 3 - 1) * 0.045);
      stone.castShadow = true;
      stone.receiveShadow = true;
      this.group.add(stone);
    }
  }



  private createRiverLotuses(): void {
    const leafMaterial = new THREE.MeshStandardMaterial({
      color: 0x355f35,
      roughness: 0.72,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    const flowerMaterial = new THREE.MeshStandardMaterial({
      color: 0xf0a8b3,
      emissive: 0x7d263c,
      emissiveIntensity: 0.12,
      roughness: 0.52,
      side: THREE.DoubleSide,
    });
    [[20.4, 15.2, 0.85], [24.2, 3.7, 0.58], [19.4, -9.6, 0.72], [24.8, -24.4, 0.62]].forEach(([x, z, scale], index) => {
      const lotus = new THREE.Group();
      lotus.position.set(x, 0.09, z);
      lotus.rotation.y = index * 1.37;
      const pad = new THREE.Mesh(new THREE.CircleGeometry(scale, 16, 0, Math.PI * 1.76), leafMaterial);
      pad.rotation.x = -Math.PI / 2;
      lotus.add(pad);
      for (let petalIndex = 0; petalIndex < 7; petalIndex++) {
        const angle = (petalIndex / 7) * Math.PI * 2;
        const petal = new THREE.Mesh(new THREE.CircleGeometry(scale * 0.26, 8), flowerMaterial);
        petal.position.set(Math.cos(angle) * scale * 0.23, 0.055, Math.sin(angle) * scale * 0.23);
        petal.rotation.set(-Math.PI / 2.8, angle, 0);
        petal.scale.set(0.68, 1.3, 1);
        lotus.add(petal);
      }
      this.group.add(lotus);
    });
  }

  private createMandapaRuin(): void {
    const ruin = new THREE.Group();
    ruin.name = 'AncientMandapaRuin';
    ruin.position.set(0, 0, -20);
    const stone = new THREE.MeshStandardMaterial({ color: COLORS.STONE_LIGHT, roughness: 0.83, metalness: 0.08 });
    const trim = new THREE.MeshStandardMaterial({ color: COLORS.STONE_DARK, roughness: 0.9 });
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.72, 8.5), trim);
    plinth.position.y = 0.36;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    ruin.add(plinth);
    const upperStep = new THREE.Mesh(new THREE.BoxGeometry(11.9, 0.36, 6.9), stone);
    upperStep.position.y = 0.88;
    upperStep.castShadow = true;
    upperStep.receiveShadow = true;
    ruin.add(upperStep);
    [[-4.8, -2.8, 4.1], [4.8, -2.8, 3.7], [-4.8, 2.8, 2.9], [4.8, 2.8, 4.4]].forEach(([x, z, height], index) => {
      const pillar = this.createPillar(height, stone, trim, index % 2 === 0);
      pillar.position.set(x, 1.06, z);
      ruin.add(pillar);
    });
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.6, 0.8), stone);
    lintel.position.set(0, 5.35, -2.8);
    lintel.rotation.z = -0.035;
    lintel.castShadow = true;
    ruin.add(lintel);
    const arch = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.22, 8, 18, Math.PI), trim);
    arch.position.set(0, 3.25, -2.7);
    arch.rotation.z = Math.PI;
    arch.castShadow = true;
    ruin.add(arch);
    this.addVine(ruin, new THREE.Vector3(-4.8, 4.2, -2.8), new THREE.Vector3(-3.7, 1.6, -2.4), 0.09);
    this.addVine(ruin, new THREE.Vector3(4.8, 3.8, 2.8), new THREE.Vector3(3.9, 1.45, 3.1), 0.07);
    this.group.add(ruin);
  }

  private createPillar(height: number, stone: THREE.MeshStandardMaterial, trim: THREE.MeshStandardMaterial, broken: boolean): THREE.Group {
    const group = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.42, 1.28), trim);
    base.position.y = 0.21;
    base.castShadow = true;
    group.add(base);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.48, height, 10), stone);
    shaft.position.y = height / 2 + 0.42;
    shaft.castShadow = true;
    shaft.receiveShadow = true;
    group.add(shaft);
    if (broken) {
      const brokenRock = this.createRock(0.48, trim);
      brokenRock.position.y = height + 0.38;
      brokenRock.rotation.set(0.6, 0.3, -0.4);
      group.add(brokenRock);
    } else {
      const capital = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.42, 1.45), trim);
      capital.position.y = height + 0.63;
      capital.castShadow = true;
      group.add(capital);
    }
    return group;
  }

  private createShrineAndTorches(): void {
    const shrine = new THREE.Group();
    shrine.name = 'LotusWaypointShrine';
    shrine.position.set(0, 0, -20.1);
    const darkStone = new THREE.MeshStandardMaterial({ color: COLORS.STONE_DARK, roughness: 0.82 });
    const gold = new THREE.MeshStandardMaterial({ color: COLORS.LOTUS_GOLD, emissive: COLORS.LOTUS_GOLD, emissiveIntensity: 0.32, roughness: 0.3, metalness: 0.72 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.38, 0.4, 12), darkStone);
    base.position.y = 1.28;
    base.castShadow = true;
    shrine.add(base);
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.8, 0.42, 12), gold);
    bowl.position.y = 1.68;
    shrine.add(bowl);
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.25, 5), gold);
      petal.position.set(Math.cos(angle) * 0.92, 2.1, Math.sin(angle) * 0.92);
      petal.rotation.set(Math.PI / 2.7, 0, -angle);
      petal.castShadow = true;
      shrine.add(petal);
    }
    // Sacred Shiva 3D Idol seated within the Golden Lotus Sanctum
    const loader = new GLTFLoader();
    loader.load(
      '/models/shiva.glb',
      (gltf) => {
        const shiva = gltf.scene;
        const shivaMat = new THREE.MeshStandardMaterial({
          color: 0xdfab43, // Rich warm antique gold
          metalness: 0.82,
          roughness: 0.32,
          emissive: 0x241804,
          emissiveIntensity: 0.15,
        });

        shiva.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            m.geometry.computeVertexNormals();
            m.material = shivaMat;
            m.castShadow = true;
            m.receiveShadow = true;
          }
        });

        // Compute size and scale to 2.8 units tall
        const box = new THREE.Box3().setFromObject(shiva);
        const size = new THREE.Vector3();
        box.getSize(size);
        const targetH = 2.8;
        const s = targetH / (size.y || 1);
        shiva.scale.set(s, s, s);

        // Center directly on top of the golden lotus bowl (rim at y = 1.89)
        const updatedBox = new THREE.Box3().setFromObject(shiva);
        const center = new THREE.Vector3();
        updatedBox.getCenter(center);
        shiva.position.x = -center.x;
        shiva.position.y = 1.88 - updatedBox.min.y;
        shiva.position.z = -center.z;

        // Face forward toward approaching hero and camera
        shiva.rotation.y = 0;

        shrine.add(shiva);
      },
      undefined,
      (err) => console.error('Error loading Shiva model into LotusWaypointShrine:', err)
    );

    // Sacred Prabhamandala (Divine Aura Halo behind head)
    const haloMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xfbbf24,
      emissiveIntensity: 0.75,
      roughness: 0.25,
      metalness: 0.8,
    });
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.045, 16, 36), haloMat);
    halo.position.set(0, 3.82, -0.15);
    shrine.add(halo);

    // Key divine illumination: angled slightly to sculpt 3D depth and facial detail
    const divineFrontLight = new THREE.PointLight(0xfff1cf, 18, 14, 1.3);
    divineFrontLight.position.set(1.2, 4.2, 2.2);
    divineFrontLight.castShadow = true;
    shrine.add(divineFrontLight);

    // Warm ambient glow rising from the golden lotus petals
    const lotusGlow = new THREE.PointLight(0xf59e0b, 14, 6, 1.8);
    lotusGlow.position.set(0, 2.1, 0.3);
    shrine.add(lotusGlow);

    // Celestial rim light separating statue from backdrop
    const rimLight = new THREE.PointLight(0x93c5fd, 9, 8, 2.0);
    rimLight.position.set(0, 4.2, -1.5);
    shrine.add(rimLight);
    const shrineLight = new THREE.PointLight(COLORS.LOTUS_GOLD, 20, 14, 1.7);
    shrineLight.position.y = 2.8;
    shrine.add(shrineLight);
    this.group.add(shrine);
    [[-5.6, -14.5, 0.2], [5.6, -14.5, 1.4], [-6.1, -25.7, 2.8], [6.1, -25.7, 4.2]].forEach(([x, z, phase]) => this.createTorch(x, z, phase));
  }

  private createTorch(x: number, z: number, phase: number): void {
    const holder = new THREE.Group();
    holder.position.set(x, 0, z);
    const bronze = new THREE.MeshStandardMaterial({ color: COLORS.BRONZE, metalness: 0.65, roughness: 0.38 });
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.6, 0.35, 10), bronze);
    plinth.position.y = 0.18;
    plinth.castShadow = true;
    holder.add(plinth);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.22, 1.2, 10), bronze);
    stem.position.y = 0.84;
    stem.castShadow = true;
    holder.add(stem);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.26, 0.36, 10), bronze);
    cup.position.y = 1.55;
    cup.castShadow = true;
    holder.add(cup);
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.88, 10), new THREE.MeshBasicMaterial({ color: COLORS.TORCH_FIRE, transparent: true, opacity: 0.92 }));
    flame.position.y = 2.08;
    holder.add(flame);
    const light = new THREE.PointLight(COLORS.TORCH_FIRE, 13, 12, 1.8);
    light.position.y = 2.1;
    light.castShadow = true;
    light.shadow.mapSize.set(512, 512);
    holder.add(light);
    this.torches.push({ flame, light, phase });
    this.group.add(holder);
  }

  /**
   * A fictional vanadevata (forest guardian) statue. It is original geometry,
   * not a scan or reproduction of a sacred work.
   */
  private createForestGuardianIdol(): void {
    const idol = new THREE.Group();
    idol.name = 'VanadevataForestGuardianIdol';
    idol.position.set(-10.5, 0, -8.8);
    idol.rotation.y = 0.42;

    const stone = this.createCc0TerrainMaterial(COLORS.STONE_LIGHT, 1.15);
    const moss = new THREE.MeshStandardMaterial({ color: COLORS.MOSS_STONE, roughness: 0.94 });
    const glow = new THREE.MeshStandardMaterial({
      color: COLORS.IDOL_GLOW,
      emissive: COLORS.IDOL_GLOW,
      emissiveIntensity: 0.85,
      roughness: 0.35,
      metalness: 0.18,
    });

    const lowerPlinth = new THREE.Mesh(new THREE.CylinderGeometry(2.15, 2.45, 0.45, 12), stone);
    lowerPlinth.position.y = 0.23;
    lowerPlinth.castShadow = true;
    lowerPlinth.receiveShadow = true;
    idol.add(lowerPlinth);
    const upperPlinth = new THREE.Mesh(new THREE.CylinderGeometry(1.72, 1.98, 0.36, 12), stone);
    upperPlinth.position.y = 0.62;
    upperPlinth.castShadow = true;
    idol.add(upperPlinth);

    // A lotus-inspired base keeps the silhouette distinctly temple-like.
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.42, 8, 6), stone);
      petal.position.set(Math.cos(angle) * 1.22, 0.98, Math.sin(angle) * 1.22);
      petal.scale.set(0.72, 0.32, 1.42);
      petal.rotation.y = -angle;
      petal.castShadow = true;
      idol.add(petal);
    }

    // Seated guardian body, stylized rather than based on a religious icon.
    const foldedLegs = new THREE.Mesh(new THREE.SphereGeometry(1.15, 14, 9), stone);
    foldedLegs.position.set(0, 1.25, 0.08);
    foldedLegs.scale.set(1.25, 0.45, 0.78);
    foldedLegs.castShadow = true;
    idol.add(foldedLegs);
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.94, 1.85, 12), stone);
    torso.position.y = 2.16;
    torso.castShadow = true;
    torso.receiveShadow = true;
    idol.add(torso);
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.075, 8, 18), glow);
    collar.position.y = 2.84;
    collar.rotation.x = Math.PI / 2;
    idol.add(collar);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.58, 14, 12), stone);
    head.position.y = 3.52;
    head.scale.set(0.88, 1.08, 0.88);
    head.castShadow = true;
    idol.add(head);
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.54, 0.75, 8), stone);
    crown.position.y = 4.25;
    crown.castShadow = true;
    idol.add(crown);

    [-1, 1].forEach((side) => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 1.35, 10), stone);
      arm.position.set(side * 0.82, 2.34, 0.06);
      arm.rotation.z = side * -0.72;
      arm.castShadow = true;
      idol.add(arm);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.23, 10, 8), stone);
      hand.position.set(side * 1.3, 1.87, 0.24);
      hand.castShadow = true;
      idol.add(hand);
    });

    const heartGem = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), glow);
    heartGem.position.set(0, 2.42, 0.78);
    idol.add(heartGem);
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(1.28, 0.075, 8, 32),
      new THREE.MeshBasicMaterial({ color: COLORS.IDOL_GLOW, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending })
    );
    halo.position.set(0, 3.35, -0.2);
    idol.add(halo);
    this.idolHalo = halo;

    for (let i = 0; i < 9; i++) {
      const mossPatch = new THREE.Mesh(new THREE.DodecahedronGeometry(0.13 + (i % 3) * 0.04, 0), moss);
      mossPatch.position.set(Math.sin(i * 1.9) * 0.9, 0.88 + (i % 4) * 0.15, Math.cos(i * 2.1) * 0.92);
      mossPatch.scale.set(1.4, 0.32, 1);
      idol.add(mossPatch);
    }
    const idolLight = new THREE.PointLight(COLORS.IDOL_GLOW, 8, 8, 2);
    idolLight.position.set(0, 3, 1.2);
    idol.add(idolLight);
    this.group.add(idol);
  }

  private createJungleCanopy(): void {
    const trees: Array<[number, number, number, number]> = [
      [-28, -27, 10, 1.15], [-20, -28, 8.5, 0.98], [-34, -10, 10.5, 1.25], [-23, -6, 7.5, 0.85],
      [-31, 14, 11, 1.2], [-17, 22, 8, 0.9], [29, -29, 11, 1.18], [20, -26, 7.8, 0.92],
      [33, -10, 10.2, 1.2], [23, -7, 7.3, 0.84], [32, 15, 11.4, 1.28], [18, 23, 8.1, 0.94],
      [-8, -36, 9.5, 1.1], [9, -37, 9.2, 1.05], [-12, 33, 9, 1.0], [11, 34, 9.3, 1.1],
    ];
    trees.forEach(([x, z, height, scale], index) => this.createTree(x, z, height, scale, index));
  }

  private createTree(x: number, z: number, height: number, scale: number, index: number): void {
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);
    tree.rotation.y = index * 1.83;

    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: index % 2 ? COLORS.TRUNK_LIGHT : COLORS.TRUNK_DARK,
      roughness: 0.95,
      metalness: 0.05,
    });

    // Authentic Searsia Lucida 4K Botanical Foliage Material
    const searsiaDiff = this.assets.loadTexture('/textures/foliage/searsia_diff.jpg');
    const searsiaAlpha = this.assets.loadTexture('/textures/foliage/searsia_alpha.png');
    const searsiaFoliageMat = new THREE.MeshStandardMaterial({
      map: searsiaDiff,
      alphaMap: searsiaAlpha,
      transparent: true,
      alphaTest: 0.32,
      roughness: 0.68,
      metalness: 0.06,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
    });

    const innerCanopyMat = new THREE.MeshStandardMaterial({
      color: COLORS.LEAF_DARK,
      roughness: 0.96,
      flatShading: true,
    });

    // 1. Organic Tapered Trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.38 * scale, 0.65 * scale, height, 9), trunkMaterial);
    trunk.position.y = height / 2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    tree.add(trunk);

    // 2. Buttress Roots
    for (let root = 0; root < 5; root++) {
      const angle = (root / 5) * Math.PI * 2;
      const buttress = new THREE.Mesh(new THREE.ConeGeometry(0.28 * scale, 1.6 * scale, 5), trunkMaterial);
      buttress.position.set(Math.cos(angle) * 0.65 * scale, 0.54 * scale, Math.sin(angle) * 0.65 * scale);
      buttress.rotation.z = Math.PI / 2.45;
      buttress.rotation.y = -angle;
      buttress.castShadow = true;
      tree.add(buttress);
    }

    // 3. Spreading Searsia Branches
    for (let branch = 0; branch < 5; branch++) {
      const angle = branch * ((Math.PI * 2) / 5) + 0.25;
      const branchHeight = height * (0.62 + (branch % 3) * 0.1);
      const branchLength = (2.8 + (branch % 2) * 0.8) * scale;
      const branchMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1 * scale, 0.22 * scale, branchLength, 7),
        trunkMaterial
      );
      branchMesh.position.set(Math.cos(angle) * 1.1 * scale, branchHeight, Math.sin(angle) * 1.1 * scale);
      branchMesh.rotation.z = Math.PI / 2.35;
      branchMesh.rotation.y = angle;
      branchMesh.castShadow = true;
      tree.add(branchMesh);

      // Foliage cards at branch tips
      const tipX = Math.cos(angle) * (branchLength * 0.85);
      const tipZ = Math.sin(angle) * (branchLength * 0.85);
      for (let c = 0; c < 3; c++) {
        const cardAngle = (c / 3) * Math.PI;
        const leafCard = new THREE.Mesh(
          new THREE.PlaneGeometry(3.6 * scale, 3.2 * scale),
          searsiaFoliageMat
        );
        leafCard.position.set(tipX, branchHeight + 0.4 + c * 0.2, tipZ);
        leafCard.rotation.y = angle + cardAngle;
        leafCard.rotation.x = Math.PI / 6 * (c - 1);
        leafCard.castShadow = true;
        leafCard.receiveShadow = true;
        tree.add(leafCard);
      }
    }

    // 4. Multi-cluster Crown Canopy (Core Volume + Textured Searsia Leaf Domes)
    const crownClusters: Array<[number, number, number, number]> = [
      [0, height + 0.8, 0, 2.8],
      [-1.5, height - 0.2, 0.5, 2.2],
      [1.5, height - 0.3, -0.6, 2.3],
      [0.3, height + 2.2, 0.2, 2.1],
      [-0.8, height + 1.8, -1.2, 1.8],
      [1.1, height + 1.5, 1.2, 1.8],
    ];

    crownClusters.forEach(([cx, cy, cz, radius]) => {
      // Inner density volume
      const innerCore = new THREE.Mesh(
        new THREE.IcosahedronGeometry(radius * 0.65 * scale, 1),
        innerCanopyMat
      );
      innerCore.position.set(cx * scale, cy * scale, cz * scale);
      innerCore.castShadow = true;
      innerCore.receiveShadow = true;
      tree.add(innerCore);

      // Layered Searsia Lucida 4K foliage cards
      for (let p = 0; p < 4; p++) {
        const pRot = (p / 4) * Math.PI;
        const leafPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(radius * 1.85 * scale, radius * 1.65 * scale),
          searsiaFoliageMat
        );
        leafPlane.position.set(cx * scale, cy * scale, cz * scale);
        leafPlane.rotation.y = pRot;
        leafPlane.rotation.x = (p % 2 === 0 ? 1 : -1) * 0.28;
        leafPlane.castShadow = true;
        leafPlane.receiveShadow = true;
        tree.add(leafPlane);
      }
    });

    this.group.add(tree);
  }

  private createBambooGroves(): void {
    [[-17, -23, 10], [17, -23, 12], [-23, 10, 11], [22, 12, 12], [-16, 27, 9], [15, 28, 10]].forEach(([x, z, count], groveIndex) => {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      const bamboo = new THREE.MeshStandardMaterial({ color: COLORS.BAMBOO, roughness: 0.8 });
      const leaves = new THREE.MeshStandardMaterial({ color: COLORS.LEAF_MID, roughness: 0.92, side: THREE.DoubleSide });
      for (let i = 0; i < count; i++) {
        const angle = i * 2.4 + groveIndex;
        const distance = 0.6 + (i % 4) * 0.5;
        const height = 4.6 + (i % 5) * 0.55;
        const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.11, height, 7), bamboo);
        stalk.position.set(Math.cos(angle) * distance, height / 2, Math.sin(angle) * distance);
        stalk.rotation.z = Math.sin(i * 1.3) * 0.08;
        stalk.castShadow = true;
        group.add(stalk);
        for (let node = 1; node < 5; node++) {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.014, 5, 8), bamboo);
          ring.position.set(stalk.position.x, node * (height / 5), stalk.position.z);
          ring.rotation.x = Math.PI / 2;
          group.add(ring);
        }
        for (let leaf = 0; leaf < 3; leaf++) {
          const blade = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 1.05), leaves);
          blade.position.set(stalk.position.x + Math.cos(leaf * 2.1) * 0.3, height * (0.6 + leaf * 0.1), stalk.position.z + Math.sin(leaf * 2.1) * 0.3);
          blade.rotation.set(Math.PI / 2.6, leaf * 2.1, -0.55 + leaf * 0.25);
          group.add(blade);
        }
      }
      this.group.add(group);
    });
  }

  private createForestScatter(): void {
    const rockMaterials = [
      new THREE.MeshStandardMaterial({ color: COLORS.STONE_DARK, roughness: 0.96, flatShading: true }),
      new THREE.MeshStandardMaterial({ color: COLORS.STONE_MID, roughness: 0.94, flatShading: true }),
      new THREE.MeshStandardMaterial({ color: COLORS.MOSS_STONE, roughness: 0.97, flatShading: true }),
    ];
    for (let i = 0; i < 105; i++) {
      const angle = i * 2.399;
      const rock = this.createRock(0.18 + (i % 6) * 0.08, rockMaterials[i % rockMaterials.length]);
      rock.position.set(Math.cos(angle) * (18 + ((i * 17) % 19)), 0.12, Math.sin(angle) * (18 + ((i * 17) % 19)));
      rock.rotation.set(i * 0.17, i * 0.71, i * 0.12);
      this.group.add(rock);
    }
    const fernMaterial = new THREE.MeshStandardMaterial({ color: COLORS.FERN, roughness: 0.94, side: THREE.DoubleSide });
    for (let i = 0; i < 64; i++) {
      const angle = i * 2.71;
      const radius = 17 + ((i * 7) % 15);
      this.createFern(Math.cos(angle) * radius, Math.sin(angle) * radius, 0.55 + (i % 3) * 0.15, fernMaterial);
    }
  }

  private createRock(size: number, material: THREE.MeshStandardMaterial): THREE.Mesh {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), material);
    rock.scale.set(1.2, 0.72, 1);
    rock.castShadow = true;
    rock.receiveShadow = true;
    return rock;
  }

  private createFern(x: number, z: number, scale: number, material: THREE.MeshStandardMaterial): void {
    const fern = new THREE.Group();
    fern.position.set(x, 0.15, z);
    for (let frond = 0; frond < 7; frond++) {
      const angle = (frond / 7) * Math.PI * 2;
      const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.26 * scale, 1.35 * scale), material);
      leaf.position.set(Math.cos(angle) * 0.33 * scale, 0.34 * scale, Math.sin(angle) * 0.33 * scale);
      leaf.rotation.set(-Math.PI / 2.8, angle, Math.PI / 2.7);
      fern.add(leaf);
    }
    this.group.add(fern);
  }

  /**
   * Generates a lush field of photorealistic Bermuda grass tufts (using authentic 1K botanical textures)
   * clustered across the jungle floor and riverbanks with instanced rendering.
   */
  private createBermudaGrassField(): void {
    const grassDiff = this.assets.loadTexture('/textures/foliage/grass_bermuda_diff.jpg');
    const grassAlpha = this.assets.loadTexture('/textures/foliage/grass_bermuda_alpha.png');

    const grassMat = new THREE.MeshStandardMaterial({
      map: grassDiff,
      alphaMap: grassAlpha,
      transparent: true,
      alphaTest: 0.3,
      roughness: 0.72,
      metalness: 0.04,
      side: THREE.DoubleSide,
      shadowSide: THREE.DoubleSide,
    });

    // 3-card star clump geometry
    const cardW = 1.15;
    const cardH = 0.82;

    const positions: number[] = [];
    const uvs: number[] = [];
    const normals: number[] = [];
    const indices: number[] = [];

    const angles = [0, Math.PI / 3, (2 * Math.PI) / 3];
    angles.forEach((angle, cardIdx) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const hw = cardW / 2;

      const x0 = -hw * cos;
      const z0 = -hw * sin;
      const x1 = hw * cos;
      const z1 = hw * sin;

      const baseIdx = cardIdx * 4;

      positions.push(
        x0, 0, z0,
        x1, 0, z1,
        x1, cardH, z1,
        x0, cardH, z0
      );

      uvs.push(
        0, 0,
        1, 0,
        1, 1,
        0, 1
      );

      for (let n = 0; n < 4; n++) {
        normals.push(0, 1, 0);
      }

      indices.push(
        baseIdx, baseIdx + 1, baseIdx + 2,
        baseIdx, baseIdx + 2, baseIdx + 3
      );
    });

    const clumpGeo = new THREE.BufferGeometry();
    clumpGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    clumpGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    clumpGeo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    clumpGeo.setIndex(indices);

    const totalInstances = 520;
    this.grassMesh = new THREE.InstancedMesh(clumpGeo, grassMat, totalInstances);
    this.grassMesh.castShadow = true;
    this.grassMesh.receiveShadow = true;

    const dummy = new THREE.Object3D();
    let placed = 0;
    let seed = 73;

    const pseudoRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    while (placed < totalInstances) {
      const angle = pseudoRandom() * Math.PI * 2;
      const dist = 3.5 + pseudoRandom() * 26.0;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      // Keep central walkway clear
      if (Math.abs(x) < 1.75 && z > -17.5 && z < 14) continue;
      // Keep Shiva Shrine sanctum clear
      if (Math.abs(x) < 4.2 && z < -15.0) continue;
      // Exclude deep river channel (allow riverbanks)
      if (x > 20 && x < 25 && z > -10 && z < 18) continue;

      const scale = 0.7 + pseudoRandom() * 0.65;
      const rotY = pseudoRandom() * Math.PI * 2;
      const tilt = (pseudoRandom() - 0.5) * 0.14;

      dummy.position.set(x, 0.02, z);
      dummy.rotation.set(tilt, rotY, 0);
      dummy.scale.set(scale, scale * (0.85 + pseudoRandom() * 0.35), scale);
      dummy.updateMatrix();

      this.grassMesh.setMatrixAt(placed, dummy.matrix);
      placed++;
    }

    this.grassMesh.instanceMatrix.needsUpdate = true;
    this.group.add(this.grassMesh);
  }

  private addVine(parent: THREE.Group, from: THREE.Vector3, to: THREE.Vector3, thickness: number): void {
    const middle = from.clone().lerp(to, 0.5).add(new THREE.Vector3(0.45, -0.75, 0.3));
    const vine = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([from, middle, to]), 16, thickness, 6, false), new THREE.MeshStandardMaterial({ color: COLORS.VINE, roughness: 0.9 }));
    vine.castShadow = true;
    parent.add(vine);
  }

  private createAtmosphere(): void {
    this.createMistLayers();
    this.createFireflies();
    this.createFallingLeaves();
  }

  private createMistLayers(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 32;
    const context = canvas.getContext('2d')!;
    const gradient = context.createRadialGradient(64, 16, 2, 64, 16, 64);
    gradient.addColorStop(0, 'rgba(198, 234, 202, 0.42)');
    gradient.addColorStop(0.55, 'rgba(130, 177, 151, 0.15)');
    gradient.addColorStop(1, 'rgba(130, 177, 151, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    const mistTexture = new THREE.CanvasTexture(canvas);
    [[-12, 2.2, -8, 12], [10, 1.7, -14, 14], [-8, 2.8, -29, 15], [13, 2.5, 7, 11]].forEach(([x, y, z, width]) => {
      const mist = new THREE.Mesh(new THREE.PlaneGeometry(width, 3.2), new THREE.MeshBasicMaterial({ map: mistTexture, transparent: true, opacity: 0.34, depthWrite: false, color: COLORS.MIST }));
      mist.position.set(x, y, z);
      this.mistLayers.push(mist);
      this.group.add(mist);
    });
  }

  private createFireflies(): void {
    const count = 190;
    this.fireflyPositions = new Float32Array(count * 3);
    this.fireflyBasePositions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const index = i * 3;
      const angle = i * 2.399;
      const radius = 4 + (i % 27) * 0.85;
      this.fireflyBasePositions[index] = Math.cos(angle) * radius;
      this.fireflyBasePositions[index + 1] = 0.7 + (i % 12) * 0.35;
      this.fireflyBasePositions[index + 2] = Math.sin(angle) * radius;
      this.fireflyPositions[index] = this.fireflyBasePositions[index];
      this.fireflyPositions[index + 1] = this.fireflyBasePositions[index + 1];
      this.fireflyPositions[index + 2] = this.fireflyBasePositions[index + 2];
      this.fireflySeeds.push(i * 0.37);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.fireflyPositions, 3));
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d')!;
    const glow = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    glow.addColorStop(0, 'rgba(255, 248, 172, 1)');
    glow.addColorStop(0.22, 'rgba(210, 255, 116, 0.94)');
    glow.addColorStop(1, 'rgba(210, 255, 116, 0)');
    context.fillStyle = glow;
    context.fillRect(0, 0, 32, 32);
    this.fireflies = new THREE.Points(geometry, new THREE.PointsMaterial({ map: new THREE.CanvasTexture(canvas), color: COLORS.FIREFLY, size: 0.26, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.group.add(this.fireflies);
  }

  private createFallingLeaves(): void {
    const count = 80;
    this.leafPositions = new Float32Array(count * 3);
    this.leafVelocities = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const index = i * 3;
      this.leafPositions[index] = ((i * 7) % 31) - 15;
      this.leafPositions[index + 1] = 3 + ((i * 11) % 22) * 0.45;
      this.leafPositions[index + 2] = ((i * 13) % 38) - 19;
      this.leafVelocities[i] = 0.35 + (i % 7) * 0.06;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(this.leafPositions, 3));
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#b6a44a';
    context.beginPath();
    context.moveTo(8, 0);
    context.quadraticCurveTo(16, 7, 8, 16);
    context.quadraticCurveTo(0, 7, 8, 0);
    context.fill();
    this.fallingLeaves = new THREE.Points(geometry, new THREE.PointsMaterial({ map: new THREE.CanvasTexture(canvas), size: 0.34, transparent: true, opacity: 0.7, depthWrite: false, color: COLORS.FALLEN_LEAF }));
    this.group.add(this.fallingLeaves);
  }

  public update(time: number, dt: number): void {
    this.waterMaterial.emissiveIntensity = 0.34 + Math.sin(time * 1.4) * 0.1;
    if (this.idolHalo) {
      this.idolHalo.rotation.y = time * 0.32;
      this.idolHalo.scale.setScalar(1 + Math.sin(time * 1.8) * 0.035);
    }
    this.torches.forEach(({ flame, light, phase }) => {
      const flicker = Math.sin(time * 9 + phase) * 0.14 + Math.sin(time * 15 + phase * 2) * 0.07;
      flame.scale.set(1 + flicker, 1 + flicker * 1.65, 1 + flicker);
      light.intensity = 13 + flicker * 11;
    });
    this.mistLayers.forEach((mist, index) => {
      mist.position.x += Math.sin(time * 0.18 + index) * dt * 0.18;
      (mist.material as THREE.MeshBasicMaterial).opacity = 0.22 + Math.sin(time * 0.45 + index) * 0.09;
    });
    for (let i = 0; i < this.fireflySeeds.length; i++) {
      const index = i * 3;
      const seed = this.fireflySeeds[i];
      this.fireflyPositions[index] = this.fireflyBasePositions[index] + Math.sin(time * 1.2 + seed) * 0.28;
      this.fireflyPositions[index + 1] = this.fireflyBasePositions[index + 1] + Math.sin(time * 2.1 + seed) * 0.24;
      this.fireflyPositions[index + 2] = this.fireflyBasePositions[index + 2] + Math.cos(time * 1.4 + seed) * 0.28;
    }
    this.fireflies.geometry.attributes.position.needsUpdate = true;
    for (let i = 0; i < this.leafVelocities.length; i++) {
      const index = i * 3;
      this.leafPositions[index + 1] -= this.leafVelocities[i] * dt;
      this.leafPositions[index] += Math.sin(time * 1.6 + i) * dt * 0.16;
      if (this.leafPositions[index + 1] < 0.25) this.leafPositions[index + 1] = 10 + (i % 14) * 0.5;
    }
    this.fallingLeaves.geometry.attributes.position.needsUpdate = true;
    if (this.grassMesh) {
      this.grassMesh.rotation.y = Math.sin(time * 0.72) * 0.006;
    }
  }
}
