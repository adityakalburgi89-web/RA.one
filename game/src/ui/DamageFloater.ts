import * as THREE from 'three';

export interface FloaterOptions {
  color?: string;
  prefix?: string;
  isCrit?: boolean;
}

export class DamageFloater {
  private container: HTMLElement;

  constructor() {
    let floaterContainer = document.getElementById('floater-container');
    if (!floaterContainer) {
      floaterContainer = document.createElement('div');
      floaterContainer.id = 'floater-container';
      floaterContainer.style.position = 'fixed';
      floaterContainer.style.inset = '0';
      floaterContainer.style.pointerEvents = 'none';
      floaterContainer.style.zIndex = '10';
      floaterContainer.style.overflow = 'hidden';
      document.body.appendChild(floaterContainer);
    }
    this.container = floaterContainer;
  }

  public spawn(
    worldPos: THREE.Vector3,
    camera: THREE.Camera,
    text: string | number,
    options: FloaterOptions = {}
  ): void {
    const screenPos = this.toScreenPosition(worldPos, camera);
    if (screenPos.z > 1) return; // behind camera

    const el = document.createElement('div');
    el.className = 'damage-floater' + (options.isCrit ? ' is-crit' : '');
    el.textContent = `${options.prefix ?? ''}${text}`;

    if (options.color) {
      el.style.color = options.color;
    }

    // Small random offset
    const offsetX = (Math.random() - 0.5) * 32;
    const offsetY = (Math.random() - 0.5) * 16;
    el.style.left = `${screenPos.x + offsetX}px`;
    el.style.top = `${screenPos.y + offsetY}px`;

    this.container.appendChild(el);

    // Remove element after animation
    window.setTimeout(() => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, 900);
  }

  private toScreenPosition(pos: THREE.Vector3, camera: THREE.Camera): THREE.Vector3 {
    const vector = pos.clone();
    vector.y += 1.8; // Offset slightly above character head
    vector.project(camera);

    const halfWidth = window.innerWidth / 2;
    const halfHeight = window.innerHeight / 2;

    return new THREE.Vector3(
      vector.x * halfWidth + halfWidth,
      -(vector.y * halfHeight) + halfHeight,
      vector.z
    );
  }
}
