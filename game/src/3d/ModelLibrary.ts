import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

export interface CharacterInstance {
  model: THREE.Group;
  mixer: THREE.AnimationMixer;
  clips: THREE.AnimationClip[];
  actions: Map<string, THREE.AnimationAction>;
}

/**
 * Centralized Model and Animation Library.
 * Preloads the author-crafted Universal Animation Library 2 (UAL2_Standard.glb)
 * and produces independently skinned, rigged, and animated character instances
 * for the player hero and all enemies.
 */
export class ModelLibrary {
  private static instance: ModelLibrary;
  private ualScene: THREE.Group | null = null;
  private ualClips: THREE.AnimationClip[] = [];
  private isLoading = false;
  private loadListeners: Array<() => void> = [];

  public static getInstance(): ModelLibrary {
    if (!ModelLibrary.instance) {
      ModelLibrary.instance = new ModelLibrary();
    }
    return ModelLibrary.instance;
  }

  public preload(onReady?: () => void): void {
    if (this.ualScene) {
      if (onReady) onReady();
      return;
    }
    if (onReady) {
      this.loadListeners.push(onReady);
    }
    if (this.isLoading) return;
    this.isLoading = true;

    const loader = new GLTFLoader();
    loader.load(
      '/models/animation-library/UAL2_Standard.glb',
      (gltf) => {
        this.ualScene = gltf.scene;
        this.ualClips = gltf.animations;
        this.isLoading = false;
        const listeners = [...this.loadListeners];
        this.loadListeners = [];
        listeners.forEach((cb) => cb());
      },
      undefined,
      (err) => {
        console.error('ModelLibrary failed to load UAL2_Standard.glb:', err);
        this.isLoading = false;
      }
    );
  }

  public isReady(): boolean {
    return this.ualScene !== null;
  }

  /**
   * Spawns an independent cloned instance with its own skeleton,
   * cloned PBR materials, and dedicated AnimationMixer.
   */
  public createInstance(): CharacterInstance | null {
    if (!this.ualScene) return null;

    const clonedModel = SkeletonUtils.clone(this.ualScene) as THREE.Group;

    // Deep clone materials so player and distinct enemy types have independent visual styles
    clonedModel.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.SkinnedMesh;
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((mat) => mat.clone());
        } else if (mesh.material) {
          mesh.material = mesh.material.clone();
        }
      }
    });

    const mixer = new THREE.AnimationMixer(clonedModel);
    const actions = new Map<string, THREE.AnimationAction>();

    this.ualClips.forEach((clip) => {
      const action = mixer.clipAction(clip);
      actions.set(clip.name, action);
      actions.set(clip.name.toLowerCase(), action);
    });

    return {
      model: clonedModel,
      mixer,
      clips: this.ualClips,
      actions,
    };
  }
}
