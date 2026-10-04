import * as THREE from 'three';
import { COLORS } from '../Constants3D';

export class Trishul3D {
  public mesh: THREE.Group;

  constructor() {
    this.mesh = new THREE.Group();

    const goldMat = new THREE.MeshStandardMaterial({
      color: COLORS.ANTIQUE_GOLD,
      metalness: 0.85,
      roughness: 0.25,
    });

    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x2e2520,
      metalness: 0.7,
      roughness: 0.35,
    });

    // 1. Long Staff / Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.035, 0.035, 2.7, 16);
    const shaft = new THREE.Mesh(shaftGeo, ironMat);
    shaft.position.y = 1.0;
    shaft.castShadow = true;
    this.mesh.add(shaft);

    // Golden grip rings
    const ringGeo = new THREE.TorusGeometry(0.05, 0.02, 8, 16);
    const ring1 = new THREE.Mesh(ringGeo, goldMat);
    ring1.position.y = 0.5;
    ring1.rotation.x = Math.PI / 2;
    this.mesh.add(ring1);

    const ring2 = new THREE.Mesh(ringGeo, goldMat);
    ring2.position.y = 1.4;
    ring2.rotation.x = Math.PI / 2;
    this.mesh.add(ring2);

    // 2. Collar & Crossbar
    const collarGeo = new THREE.CylinderGeometry(0.08, 0.05, 0.18, 16);
    const collar = new THREE.Mesh(collarGeo, goldMat);
    collar.position.y = 2.35;
    collar.castShadow = true;
    this.mesh.add(collar);

    const barGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.65, 12);
    const bar = new THREE.Mesh(barGeo, goldMat);
    bar.rotation.z = Math.PI / 2;
    bar.position.y = 2.45;
    bar.castShadow = true;
    this.mesh.add(bar);

    // 3. Central Trident Blade (The Divine Center Prong)
    const centerBladeGeo = new THREE.ConeGeometry(0.07, 0.65, 8);
    const centerBlade = new THREE.Mesh(centerBladeGeo, goldMat);
    centerBlade.position.y = 2.8;
    centerBlade.castShadow = true;
    this.mesh.add(centerBlade);

    // 4. Left & Right Curved Prongs (Trident horns)
    const curvePoints = (side: number) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.3, 2.45, 0),
        new THREE.Vector3(side * 0.38, 2.75, 0),
        new THREE.Vector3(side * 0.22, 3.05, 0),
      ]);
      const prongGeo = new THREE.TubeGeometry(curve, 16, 0.03, 8, false);
      const prong = new THREE.Mesh(prongGeo, goldMat);
      prong.castShadow = true;
      return prong;
    };

    this.mesh.add(curvePoints(1));  // Right prong
    this.mesh.add(curvePoints(-1)); // Left prong

    // Damru (sacred drum) attached below trident head
    const drumGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.16, 12);
    const drum = new THREE.Mesh(drumGeo, ironMat);
    drum.position.set(0.08, 2.22, 0);
    drum.rotation.z = Math.PI / 4;
    drum.castShadow = true;
    this.mesh.add(drum);

    // Scale overall weapon to realistic hero proportion
    this.mesh.scale.set(0.85, 0.85, 0.85);
  }
}
