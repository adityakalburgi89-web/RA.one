import * as THREE from 'three';
import { AssetRegistry3D } from './AssetRegistry3D';
import { Trishul3D } from './weapons/Trishul3D';

export class NatarajaCharacter3D {
  public group: THREE.Group;

  // 3D Joints & Assemblies
  private torsoGroup: THREE.Group;
  private headGroup: THREE.Group;
  private hairCrownGroup: THREE.Group;
  private serpentMesh: THREE.Mesh;
  private sashGroup: THREE.Group;

  // 4 Arms
  private upperRightArm: THREE.Group; // Holds Damru
  private upperLeftArm: THREE.Group;  // Wields Trishul
  private lowerRightArm: THREE.Group; // Abhaya Mudra (blessing)
  private lowerLeftArm: THREE.Group;  // Gaja-Hasta (crossing mudra)

  // Legs
  private leftLegGroup: THREE.Group;
  private rightLegGroup: THREE.Group;

  private trishul: Trishul3D;

  constructor(private assets: AssetRegistry3D) {
    this.group = new THREE.Group();

    // Sacred Deity Palette
    const deitySkinMat = new THREE.MeshStandardMaterial({
      color: 0x6e8796, // Sacred ash-blue (Bhasma / Nilakantha tone)
      roughness: 0.6,
      metalness: 0.1,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.25,
    });

    const tigerPeltMat = new THREE.MeshStandardMaterial({
      color: 0xc27803,
      roughness: 0.85,
      metalness: 0.05,
    });

    const silkDhotiMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Radiant ochre silk
      roughness: 0.7,
      metalness: 0.15,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x1f140c,
      roughness: 0.9,
    });

    // High-res texture of the actual hand-painted Nataraja artwork
    const charTexture = this.assets.loadTexture('/images/SimpleAssets/nataraja-separated-elements/shiva-natarajan-with-trishul-transparent.png');
    charTexture.colorSpace = THREE.SRGBColorSpace;

    // 1. Hips & Pleated Silk Dhoti
    const hipsGeo = new THREE.CylinderGeometry(0.36, 0.32, 0.42, 16);
    const hips = new THREE.Mesh(hipsGeo, silkDhotiMat);
    hips.position.y = 1.65;
    hips.castShadow = true;
    this.group.add(hips);

    // Draped tiger skin waist wrap
    const peltGeo = new THREE.CylinderGeometry(0.42, 0.45, 0.55, 16);
    const peltMesh = new THREE.Mesh(peltGeo, tigerPeltMat);
    peltMesh.position.y = -0.05;
    peltMesh.castShadow = true;
    hips.add(peltMesh);

    // 2. Torso with Tiger Skin Sash & Rudraksha Malas
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.y = 0.25;
    hips.add(this.torsoGroup);

    const chestGeo = new THREE.CylinderGeometry(0.46, 0.36, 0.8, 16);
    const chest = new THREE.Mesh(chestGeo, deitySkinMat);
    chest.position.y = 0.38;
    chest.castShadow = true;
    this.torsoGroup.add(chest);

    // Diagonal Tiger Pelt Sash across chest
    const sashCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.35, 0.75, 0.22),
      new THREE.Vector3(0.0, 0.38, 0.32),
      new THREE.Vector3(0.32, -0.05, 0.22),
    ]);
    const sashGeo = new THREE.TubeGeometry(sashCurve, 16, 0.08, 8, false);
    const chestSash = new THREE.Mesh(sashGeo, tigerPeltMat);
    chestSash.castShadow = true;
    this.torsoGroup.add(chestSash);

    // Rudraksha bead malas (sacred prayer necklaces)
    for (let m = 0; m < 3; m++) {
      const malaGeo = new THREE.TorusGeometry(0.24 + m * 0.05, 0.02, 6, 16);
      const mala = new THREE.Mesh(malaGeo, new THREE.MeshStandardMaterial({ color: 0x4a2410, roughness: 0.9 }));
      mala.rotation.x = Math.PI / 2.2;
      mala.position.set(0, 0.65 - m * 0.1, 0.08 + m * 0.04);
      mala.castShadow = true;
      this.torsoGroup.add(mala);
    }

    // 3. Head, Divine Third Eye, & Radiating Jatas (Flowing Hairlocks)
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 0.9;
    this.torsoGroup.add(this.headGroup);

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.18, 0.22, 12), deitySkinMat);
    neck.position.y = 0.05;
    this.headGroup.add(neck);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), deitySkinMat);
    head.scale.set(0.92, 1.15, 0.95);
    head.position.y = 0.32;
    head.castShadow = true;
    this.headGroup.add(head);

    // Third Eye (Trinetra)
    const thirdEye = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.8 })
    );
    thirdEye.position.set(0, 0.35, 0.24);
    this.headGroup.add(thirdEye);

    // Coiled Cobra (Vasuki) on right shoulder
    const snakeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.15, 0.05, 0.12),
      new THREE.Vector3(0.05, 0.12, 0.18),
      new THREE.Vector3(0.28, 0.18, 0.1),
      new THREE.Vector3(0.35, 0.45, 0.14), // Raised hood
    ]);
    const snakeGeo = new THREE.TubeGeometry(snakeCurve, 20, 0.035, 8, false);
    this.serpentMesh = new THREE.Mesh(snakeGeo, new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 }));
    this.serpentMesh.castShadow = true;
    this.headGroup.add(this.serpentMesh);

    // Radiating Wild Jatas (The Cosmic Dreadlocks from the PNG)
    this.hairCrownGroup = new THREE.Group();
    this.hairCrownGroup.position.set(0, 0.45, -0.05);
    this.headGroup.add(this.hairCrownGroup);

    // Mukuṭa (Topknot bun)
    const bun = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.35, 12), hairMat);
    bun.position.y = 0.15;
    this.hairCrownGroup.add(bun);

    // Golden Crescent Moon (Chandrama)
    const moonGeo = new THREE.TorusGeometry(0.14, 0.025, 8, 16, Math.PI * 0.85);
    const moon = new THREE.Mesh(moonGeo, goldMat);
    moon.position.set(-0.15, 0.22, 0.15);
    moon.rotation.z = Math.PI / 4;
    this.hairCrownGroup.add(moon);

    // Radiating locks flowing outward horizontally (8 dramatic curved strands)
    const strandDirections = [-1, 1];
    strandDirections.forEach((dir) => {
      for (let s = 0; s < 4; s++) {
        const height = s * 0.12;
        const spread = 0.5 + s * 0.22;
        const lockCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(dir * 0.15, 0.15 + height * 0.5, -0.05),
          new THREE.Vector3(dir * (spread * 0.6), 0.2 + height, -0.15),
          new THREE.Vector3(dir * spread, 0.15 + height * 0.8, -0.2),
          new THREE.Vector3(dir * (spread * 1.15), 0.3 + height, -0.1),
        ]);
        const lockGeo = new THREE.TubeGeometry(lockCurve, 16, 0.035 - s * 0.005, 6, false);
        const lockMesh = new THREE.Mesh(lockGeo, hairMat);
        lockMesh.castShadow = true;
        this.hairCrownGroup.add(lockMesh);
      }
    });

    // 4. THE FOUR SACRED ARMS OF NATARAJA
    // [ARM 1]: Upper Right Arm holding the Damru (Creation)
    this.upperRightArm = new THREE.Group();
    this.upperRightArm.position.set(0.55, 0.65, 0);
    this.torsoGroup.add(this.upperRightArm);

    const uRightMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.6, 10), deitySkinMat);
    uRightMesh.position.set(0.18, 0.18, 0);
    uRightMesh.rotation.z = -Math.PI / 4;
    uRightMesh.castShadow = true;
    this.upperRightArm.add(uRightMesh);

    // Damru (Hourglass drum) held in upper right hand
    const damruGroup = new THREE.Group();
    damruGroup.position.set(0.42, 0.42, 0);
    const drum1 = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.14, 10), goldMat);
    drum1.rotation.z = Math.PI / 2;
    damruGroup.add(drum1);
    const drum2 = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.14, 10), goldMat);
    drum2.rotation.z = -Math.PI / 2;
    drum2.position.x = 0.14;
    damruGroup.add(drum2);
    damruGroup.scale.set(0.85, 0.85, 0.85);
    this.upperRightArm.add(damruGroup);

    // [ARM 2]: Upper Left Arm wielding the Divine Trishul (Destruction / Righteousness)
    this.upperLeftArm = new THREE.Group();
    this.upperLeftArm.position.set(-0.55, 0.65, 0);
    this.torsoGroup.add(this.upperLeftArm);

    const uLeftMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.6, 10), deitySkinMat);
    uLeftMesh.position.set(-0.18, 0.18, 0);
    uLeftMesh.rotation.z = Math.PI / 4;
    uLeftMesh.castShadow = true;
    this.upperLeftArm.add(uLeftMesh);

    // Socket the tall 3D Golden Trishul in the upper left hand!
    this.trishul = new Trishul3D();
    this.trishul.mesh.position.set(-0.4, -0.4, 0.1);
    this.trishul.mesh.rotation.z = 0.15;
    this.upperLeftArm.add(this.trishul.mesh);

    // [ARM 3]: Lower Right Arm in Abhaya Mudra (Fearlessness / Protection)
    this.lowerRightArm = new THREE.Group();
    this.lowerRightArm.position.set(0.48, 0.4, 0.1);
    this.torsoGroup.add(this.lowerRightArm);

    const lRightUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.08, 0.45, 10), deitySkinMat);
    lRightUpper.position.set(0.12, -0.15, 0.05);
    lRightUpper.rotation.z = -0.3;
    lRightUpper.castShadow = true;
    this.lowerRightArm.add(lRightUpper);

    // Raised open palm (Abhaya Mudra)
    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.04), goldMat);
    palm.position.set(0.24, 0.05, 0.15);
    palm.rotation.x = -0.2;
    this.lowerRightArm.add(palm);

    // [ARM 4]: Lower Left Arm in Gaja-Hasta (Elephant trunk mudra crossing chest)
    this.lowerLeftArm = new THREE.Group();
    this.lowerLeftArm.position.set(-0.48, 0.4, 0.1);
    this.torsoGroup.add(this.lowerLeftArm);

    const gajaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.35, -0.15, 0.25),
      new THREE.Vector3(0.65, -0.35, 0.28),
      new THREE.Vector3(0.85, -0.55, 0.2), // Pointing toward lifted sacred foot
    ]);
    const gajaGeo = new THREE.TubeGeometry(gajaCurve, 16, 0.065, 8, false);
    const gajaMesh = new THREE.Mesh(gajaGeo, deitySkinMat);
    gajaMesh.castShadow = true;
    this.lowerLeftArm.add(gajaMesh);

    // 5. Flowing Celestial Wind Sashes (Uttariya blowing in the wind)
    this.sashGroup = new THREE.Group();
    this.sashGroup.position.set(0.3, 0.1, -0.15);
    hips.add(this.sashGroup);

    const ribbonCurve1 = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.4, -0.2, -0.3),
      new THREE.Vector3(0.85, 0.1, -0.6),
      new THREE.Vector3(1.4, -0.15, -0.8),
    ]);
    const ribbonGeo1 = new THREE.TubeGeometry(ribbonCurve1, 20, 0.06, 6, false);
    const ribbon1 = new THREE.Mesh(ribbonGeo1, silkDhotiMat);
    ribbon1.castShadow = true;
    this.sashGroup.add(ribbon1);

    // 6. Dynamic Legs
    // Left Leg (Supporting leg)
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(-0.2, -0.1, 0);
    hips.add(this.leftLegGroup);

    const legGeo = new THREE.CylinderGeometry(0.14, 0.1, 0.7, 10);
    const leftLeg = new THREE.Mesh(legGeo, deitySkinMat);
    leftLeg.position.y = -0.35;
    leftLeg.castShadow = true;
    this.leftLegGroup.add(leftLeg);

    const leftCalf = new THREE.Mesh(legGeo, deitySkinMat);
    leftCalf.position.y = -0.95;
    leftCalf.castShadow = true;
    this.leftLegGroup.add(leftCalf);

    // Golden anklets (Ghungroo)
    const ankletGeo = new THREE.TorusGeometry(0.11, 0.03, 8, 12);
    const leftAnklet = new THREE.Mesh(ankletGeo, goldMat);
    leftAnklet.rotation.x = Math.PI / 2;
    leftAnklet.position.y = -1.25;
    this.leftLegGroup.add(leftAnklet);

    // Right Leg (Moving / Lifted dance leg)
    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(0.2, -0.1, 0);
    hips.add(this.rightLegGroup);

    const rightThigh = new THREE.Mesh(legGeo, deitySkinMat);
    rightThigh.position.y = -0.35;
    rightThigh.castShadow = true;
    this.rightLegGroup.add(rightThigh);

    const rightCalf = new THREE.Mesh(legGeo, deitySkinMat);
    rightCalf.position.y = -0.95;
    rightCalf.castShadow = true;
    this.rightLegGroup.add(rightCalf);

    const rightAnklet = new THREE.Mesh(ankletGeo, goldMat);
    rightAnklet.rotation.x = Math.PI / 2;
    rightAnklet.position.y = -1.25;
    this.rightLegGroup.add(rightAnklet);

    // Set overall scale to match hero proportions in the temple
    this.group.scale.set(1.1, 1.1, 1.1);
  }

  /**
   * Fluid 3D Animation for the 4-Armed Cosmic Nataraja
   */
  public animate(time: number, isRunning: boolean, dt: number): void {
    const breath = Math.sin(time * 3);

    // Wind billowing through radiating Jatas and celestial ribbons
    this.hairCrownGroup.rotation.y = Math.sin(time * 4) * 0.08;
    this.sashGroup.rotation.y = Math.sin(time * 5) * 0.15;
    this.sashGroup.rotation.z = Math.cos(time * 4) * 0.1;

    if (isRunning) {
      const cycle = time * 12;

      // Legs swing in 3D locomotion
      this.leftLegGroup.rotation.x = Math.sin(cycle) * 0.7;
      this.rightLegGroup.rotation.x = -Math.sin(cycle) * 0.7;

      // Upper arms holding Trishul and Damru sway majestically
      this.upperRightArm.rotation.x = Math.sin(cycle) * 0.35;
      this.upperLeftArm.rotation.x = -Math.sin(cycle) * 0.35;

      // Torso athletic sway
      this.torsoGroup.position.y = 0.25 + Math.abs(Math.sin(cycle)) * 0.09;
      this.torsoGroup.rotation.x = 0.12;
      this.torsoGroup.rotation.y = Math.sin(cycle) * 0.15;
    } else {
      // Celestial Nataraja stance with breathing motion
      this.torsoGroup.position.y = 0.25 + breath * 0.02;
      this.torsoGroup.rotation.x = 0;
      this.torsoGroup.rotation.y = breath * 0.04;

      this.leftLegGroup.rotation.x = 0.1;
      this.rightLegGroup.rotation.x = -0.15; // Lifted slightly in classical posture

      // Gentle movement of the 4 arms
      this.upperRightArm.rotation.x = breath * 0.06;
      this.upperLeftArm.rotation.x = -breath * 0.05;
      this.lowerRightArm.position.y = 0.4 + breath * 0.015;
      this.lowerLeftArm.position.y = 0.4 - breath * 0.015;
    }
  }
}
