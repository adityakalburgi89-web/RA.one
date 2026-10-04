import * as THREE from 'three';
import { CAMERA_CONFIG } from './Constants3D';

export class CinematicCamera3D {
  public camera: THREE.PerspectiveCamera;
  private currentLookAt: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(CAMERA_CONFIG.FOV, aspect, 0.1, 300);
    this.camera.position.copy(CAMERA_CONFIG.OFFSET);
    this.camera.lookAt(0, 0, 0);
  }

  public update(targetPosition: THREE.Vector3, dt: number): void {
    // Calculate desired camera position relative to target
    const desiredPos = targetPosition.clone().add(CAMERA_CONFIG.OFFSET);
    
    // Smooth cinematic lerp (independent of framerate)
    const factor = 1 - Math.exp(-CAMERA_CONFIG.LERP_SPEED * 60 * dt);
    this.camera.position.lerp(desiredPos, factor);

    // Desired look-at point (slightly above player base)
    const desiredLook = targetPosition.clone().add(CAMERA_CONFIG.LOOK_OFFSET);
    this.currentLookAt.lerp(desiredLook, factor);
    this.camera.lookAt(this.currentLookAt);
  }

  public snapTo(targetPosition: THREE.Vector3): void {
    this.camera.position.copy(targetPosition).add(CAMERA_CONFIG.OFFSET);
    this.currentLookAt.copy(targetPosition).add(CAMERA_CONFIG.LOOK_OFFSET);
    this.camera.lookAt(this.currentLookAt);
  }

  public onResize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
