import * as THREE from 'three';
import { COLORS } from './Constants3D';
import { Trishul3D } from './weapons/Trishul3D';

export class CharacterMesh3D {
  public group: THREE.Group;

  // Joints for procedural 3D skeletal animation
  private torsoGroup: THREE.Group;
  private headGroup: THREE.Group;
  private leftArmGroup: THREE.Group;
  private rightArmGroup: THREE.Group;
  private leftLegGroup: THREE.Group;
  private rightLegGroup: THREE.Group;
  private leftKneeGroup: THREE.Group;
  private rightKneeGroup: THREE.Group;
  private weaponSocket: THREE.Group;

  private trishul: Trishul3D;

  constructor() {
    this.group = new THREE.Group();

    // Materials based on ancient Indian illustrated epic palette
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0x9e5229, // Warm terracotta / sun-tanned warrior skin
      roughness: 0.65,
      metalness: 0.05,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: COLORS.ANTIQUE_GOLD,
      roughness: 0.3,
      metalness: 0.85,
    });

    const clothMat = new THREE.MeshStandardMaterial({
      color: 0xa82b13, // Sacred crimson warrior dhoti
      roughness: 0.8,
      metalness: 0.1,
    });

    const darkTrimMat = new THREE.MeshStandardMaterial({
      color: 0x24140b,
      roughness: 0.8,
      metalness: 0.2,
    });

    // 1. Hips (Base Center of Mass)
    const hipsGeo = new THREE.CylinderGeometry(0.38, 0.32, 0.4, 12);
    const hips = new THREE.Mesh(hipsGeo, clothMat);
    hips.position.y = 1.6;
    hips.castShadow = true;
    this.group.add(hips);

    // Dhoti cloth drapery
    const dhotiGeo = new THREE.ConeGeometry(0.48, 0.75, 12);
    const dhoti = new THREE.Mesh(dhotiGeo, clothMat);
    dhoti.position.y = -0.25;
    dhoti.castShadow = true;
    hips.add(dhoti);

    // Golden waist belt (Kamarbandh)
    const beltGeo = new THREE.TorusGeometry(0.39, 0.05, 8, 16);
    const belt = new THREE.Mesh(beltGeo, goldMat);
    belt.rotation.x = Math.PI / 2;
    hips.add(belt);

    // 2. Torso (Spine & Chest)
    this.torsoGroup = new THREE.Group();
    this.torsoGroup.position.y = 0.25;
    hips.add(this.torsoGroup);

    const chestGeo = new THREE.CylinderGeometry(0.48, 0.36, 0.75, 12);
    const chest = new THREE.Mesh(chestGeo, skinMat);
    chest.position.y = 0.35;
    chest.castShadow = true;
    this.torsoGroup.add(chest);

    // Golden Neck Collar / Necklace (Haar)
    const necklaceGeo = new THREE.TorusGeometry(0.28, 0.045, 8, 16);
    const necklace = new THREE.Mesh(necklaceGeo, goldMat);
    necklace.position.set(0, 0.65, 0.04);
    necklace.rotation.x = Math.PI / 2.3;
    necklace.castShadow = true;
    this.torsoGroup.add(necklace);

    // Sacred Thread (Yajnopavita / Janeu) crossing chest diagonally
    const threadCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.25, 0.7, 0.25),
      new THREE.Vector3(0.0, 0.35, 0.38),
      new THREE.Vector3(0.28, -0.05, 0.25),
    ]);
    const threadGeo = new THREE.TubeGeometry(threadCurve, 16, 0.02, 6, false);
    const threadMesh = new THREE.Mesh(threadGeo, goldMat);
    this.torsoGroup.add(threadMesh);

    // 3. Head & Sacred Crown (Mukuta)
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 0.85;
    this.torsoGroup.add(this.headGroup);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.2, 12);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 0.05;
    this.headGroup.add(neck);

    // Head
    const headGeo = new THREE.SphereGeometry(0.24, 16, 16);
    headGeo.scale(0.9, 1.1, 0.95);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 0.3;
    head.castShadow = true;
    this.headGroup.add(head);

    // Indian Warrior Crown (Kirita Mukuta)
    const crownBaseGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.15, 16);
    const crownBase = new THREE.Mesh(crownBaseGeo, goldMat);
    crownBase.position.y = 0.44;
    crownBase.castShadow = true;
    this.headGroup.add(crownBase);

    const crownSpireGeo = new THREE.ConeGeometry(0.22, 0.48, 16);
    const crownSpire = new THREE.Mesh(crownSpireGeo, goldMat);
    crownSpire.position.y = 0.72;
    crownSpire.castShadow = true;
    this.headGroup.add(crownSpire);

    // Third-Eye Forehead Gemstone
    const gemGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 0.5,
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.position.set(0, 0.32, 0.24);
    this.headGroup.add(gem);

    // 4. Arms & Weapon Socket
    // Left Arm
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.52, 0.65, 0);
    this.torsoGroup.add(this.leftArmGroup);

    const shoulderPadGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const leftPad = new THREE.Mesh(shoulderPadGeo, goldMat);
    this.leftArmGroup.add(leftPad);

    const armGeo = new THREE.CylinderGeometry(0.11, 0.09, 0.45, 10);
    const leftUpperArm = new THREE.Mesh(armGeo, skinMat);
    leftUpperArm.position.y = -0.25;
    leftUpperArm.castShadow = true;
    this.leftArmGroup.add(leftUpperArm);

    const forearmGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.45, 10);
    const leftForearm = new THREE.Mesh(forearmGeo, goldMat); // Golden bracer
    leftForearm.position.y = -0.65;
    leftForearm.castShadow = true;
    this.leftArmGroup.add(leftForearm);

    // Right Arm (Weapon Hand)
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.52, 0.65, 0);
    this.torsoGroup.add(this.rightArmGroup);

    const rightPad = new THREE.Mesh(shoulderPadGeo, goldMat);
    this.rightArmGroup.add(rightPad);

    const rightUpperArm = new THREE.Mesh(armGeo, skinMat);
    rightUpperArm.position.y = -0.25;
    rightUpperArm.castShadow = true;
    this.rightArmGroup.add(rightUpperArm);

    const rightForearm = new THREE.Mesh(forearmGeo, goldMat);
    rightForearm.position.y = -0.65;
    rightForearm.castShadow = true;
    this.rightArmGroup.add(rightForearm);

    // Hand Weapon Socket
    this.weaponSocket = new THREE.Group();
    this.weaponSocket.position.set(0, -0.85, 0.1);
    this.weaponSocket.rotation.x = Math.PI / 4; // Angle weapon naturally forward
    this.rightArmGroup.add(this.weaponSocket);

    // Equip 3D Trishul
    this.trishul = new Trishul3D();
    this.weaponSocket.add(this.trishul.mesh);

    // 5. Legs & Feet
    // Left Leg
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(-0.22, -0.1, 0);
    hips.add(this.leftLegGroup);

    const thighGeo = new THREE.CylinderGeometry(0.15, 0.12, 0.65, 10);
    const leftThigh = new THREE.Mesh(thighGeo, skinMat);
    leftThigh.position.y = -0.32;
    leftThigh.castShadow = true;
    this.leftLegGroup.add(leftThigh);

    this.leftKneeGroup = new THREE.Group();
    this.leftKneeGroup.position.y = -0.65;
    this.leftLegGroup.add(this.leftKneeGroup);

    const calfGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.65, 10);
    const leftCalf = new THREE.Mesh(calfGeo, skinMat);
    leftCalf.position.y = -0.32;
    leftCalf.castShadow = true;
    this.leftKneeGroup.add(leftCalf);

    // Golden Anklet (Ghungroo) & Foot
    const ankletGeo = new THREE.TorusGeometry(0.1, 0.025, 8, 12);
    const leftAnklet = new THREE.Mesh(ankletGeo, goldMat);
    leftAnklet.rotation.x = Math.PI / 2;
    leftAnklet.position.y = -0.62;
    this.leftKneeGroup.add(leftAnklet);

    const footGeo = new THREE.BoxGeometry(0.14, 0.1, 0.32);
    const leftFoot = new THREE.Mesh(footGeo, darkTrimMat);
    leftFoot.position.set(0, -0.7, 0.08);
    leftFoot.castShadow = true;
    this.leftKneeGroup.add(leftFoot);

    // Right Leg
    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(0.22, -0.1, 0);
    hips.add(this.rightLegGroup);

    const rightThigh = new THREE.Mesh(thighGeo, skinMat);
    rightThigh.position.y = -0.32;
    rightThigh.castShadow = true;
    this.rightLegGroup.add(rightThigh);

    this.rightKneeGroup = new THREE.Group();
    this.rightKneeGroup.position.y = -0.65;
    this.rightLegGroup.add(this.rightKneeGroup);

    const rightCalf = new THREE.Mesh(calfGeo, skinMat);
    rightCalf.position.y = -0.32;
    rightCalf.castShadow = true;
    this.rightKneeGroup.add(rightCalf);

    const rightAnklet = new THREE.Mesh(ankletGeo, goldMat);
    rightAnklet.rotation.x = Math.PI / 2;
    rightAnklet.position.y = -0.62;
    this.rightKneeGroup.add(rightAnklet);

    const rightFoot = new THREE.Mesh(footGeo, darkTrimMat);
    rightFoot.position.set(0, -0.7, 0.08);
    rightFoot.castShadow = true;
    this.rightKneeGroup.add(rightFoot);

    // Overall hero scale
    this.group.scale.set(0.95, 0.95, 0.95);
  }

  /**
   * Procedural 3D Skeletal Animation Engine
   */
  public animate(walkTime: number, isRunning: boolean, dt: number): void {
    if (isRunning) {
      // Natural 3D bipedal running locomotion
      const cycle = walkTime * 12;

      // Legs swing in opposing sinusoidal phases
      this.leftLegGroup.rotation.x = Math.sin(cycle) * 0.75;
      this.rightLegGroup.rotation.x = -Math.sin(cycle) * 0.75;

      // Knees bend dynamically on the backswing
      this.leftKneeGroup.rotation.x = Math.max(0, -Math.sin(cycle) * 0.85);
      this.rightKneeGroup.rotation.x = Math.max(0, Math.sin(cycle) * 0.85);

      // Arms swing in counter-phase to legs
      this.leftArmGroup.rotation.x = -Math.sin(cycle) * 0.65;
      this.leftArmGroup.rotation.z = 0.2;

      this.rightArmGroup.rotation.x = Math.sin(cycle) * 0.45;
      this.rightArmGroup.rotation.z = -0.2;

      // Torso bob & slight athletic forward lean
      this.torsoGroup.position.y = 0.25 + Math.abs(Math.sin(cycle)) * 0.08;
      this.torsoGroup.rotation.x = 0.14; // Forward lean
      this.torsoGroup.rotation.y = Math.sin(cycle) * 0.12; // Torso twist

      // Trishul dynamic movement
      this.weaponSocket.rotation.x = Math.PI / 4 + Math.sin(cycle) * 0.15;
    } else {
      // Idle alert stance with subtle natural breathing
      const breath = Math.sin(walkTime * 2.5);

      this.torsoGroup.position.y = 0.25 + breath * 0.02;
      this.torsoGroup.rotation.x = 0;
      this.torsoGroup.rotation.y = 0;

      // Relaxed standing legs
      this.leftLegGroup.rotation.x = 0.08;
      this.rightLegGroup.rotation.x = -0.08;
      this.leftKneeGroup.rotation.x = 0;
      this.rightKneeGroup.rotation.x = 0;

      // Weapon held aloft ready for battle
      this.rightArmGroup.rotation.x = -0.25 + breath * 0.04;
      this.rightArmGroup.rotation.z = -0.15;
      this.leftArmGroup.rotation.x = 0.15 + breath * 0.03;
      this.leftArmGroup.rotation.z = 0.18;

      this.weaponSocket.rotation.x = 0.45;
    }
  }
}
