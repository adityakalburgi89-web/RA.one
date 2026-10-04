import * as THREE from 'three';

export class AssetRegistry3D {
  private loader: THREE.TextureLoader;
  private cache: Map<string, THREE.Texture> = new Map();
  private dataCache: Map<string, THREE.Texture> = new Map();

  constructor() {
    this.loader = new THREE.TextureLoader();
  }

  public loadTexture(url: string): THREE.Texture {
    if (this.cache.has(url)) {
      return this.cache.get(url)!;
    }

    const texture = this.loader.load(url);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;

    this.cache.set(url, texture);
    return texture;
  }

  public getTexture(url: string): THREE.Texture | undefined {
    return this.cache.get(url);
  }

  /** Loads a non-colour PBR map such as a normal or roughness texture. */
  public loadDataTexture(url: string): THREE.Texture {
    if (this.dataCache.has(url)) {
      return this.dataCache.get(url)!;
    }
    const texture = this.loader.load(url);
    texture.colorSpace = THREE.NoColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    this.dataCache.set(url, texture);
    return texture;
  }
}
