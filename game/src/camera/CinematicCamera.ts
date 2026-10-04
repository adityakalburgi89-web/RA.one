import Phaser from 'phaser';

export class CinematicCamera {
  private camera: Phaser.Cameras.Scene2D.Camera;
  private target: Phaser.GameObjects.Components.Transform | null = null;
  private lerpFactor: number = 0.06; // Cinematic smooth interpolation
  private leadDistance: number = 40; // Looks ahead slightly in movement direction

  constructor(scene: Phaser.Scene) {
    this.camera = scene.cameras.main;
    this.camera.setRoundPixels(true);
    this.camera.fadeIn(1200, 15, 10, 8); // Atmospheric fade-in from charcoal
  }

  public setBounds(x: number, y: number, width: number, height: number): void {
    this.camera.setBounds(x, y, width, height);
  }

  public follow(target: Phaser.GameObjects.Components.Transform): void {
    this.target = target;
    // Set smooth camera follow
    this.camera.startFollow(target, true, this.lerpFactor, this.lerpFactor);
  }

  public setZoom(zoom: number, duration = 600): void {
    this.camera.zoomTo(zoom, duration, 'Cubic.easeOut');
  }

  public shake(duration = 200, intensity = 0.008): void {
    this.camera.shake(duration, intensity);
  }

  public update(): void {
    // Custom camera adjustments (e.g. dynamic offset or cinematic sway)
  }
}
