import * as THREE from 'three';

type Effect = {
  mesh: THREE.Object3D;
  material: THREE.Material & { opacity?: number };
  life: number;
  duration: number;
  grow: number;
};

/** Original procedural combat VFX, kept intentionally small and dependency-free. */
export class CombatEffects {
  public readonly group = new THREE.Group();
  private effects: Effect[] = [];

  public slash(position: THREE.Vector3, direction: THREE.Vector3): void {
    const material = new THREE.MeshBasicMaterial({
      color: 0xffdc75,
      transparent: true,
      opacity: 0.96,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const arc = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.055, 8, 32, Math.PI * 0.92), material);
    arc.position.copy(position).addScaledVector(direction, 1.12);
    arc.position.y = 1.0;
    arc.rotation.set(Math.PI / 2, Math.atan2(direction.x, direction.z) - Math.PI * 0.46, 0);
    this.add(arc, material, 0.22, 1.65);
  }

  public pulse(position: THREE.Vector3): void {
    const material = new THREE.MeshBasicMaterial({
      color: 0xa5f3fc,
      transparent: true,
      opacity: 0.86,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.82, 48), material);
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(position);
    ring.position.y = 0.09;
    this.add(ring, material, 0.65, 5.8);
  }

  public impact(position: THREE.Vector3, boss = false): void {
    const material = new THREE.MeshBasicMaterial({
      color: boss ? 0xff9f43 : 0xd9ff9d,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const spark = new THREE.Mesh(new THREE.SphereGeometry(boss ? 0.42 : 0.26, 10, 8), material);
    spark.position.copy(position);
    spark.position.y = 1.3;
    this.add(spark, material, 0.22, 3.4);
  }

  public update(dt: number): void {
    this.effects = this.effects.filter((effect) => {
      effect.life += dt;
      const progress = effect.life / effect.duration;
      effect.mesh.scale.setScalar(1 + progress * effect.grow);
      effect.material.opacity = Math.max(0, 1 - progress);
      if (progress < 1) return true;
      this.group.remove(effect.mesh);
      return false;
    });
  }

  private add(mesh: THREE.Object3D, material: Effect['material'], duration: number, grow: number): void {
    this.group.add(mesh);
    this.effects.push({ mesh, material, life: 0, duration, grow });
  }
}
