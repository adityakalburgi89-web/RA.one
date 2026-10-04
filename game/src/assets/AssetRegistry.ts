import Phaser from 'phaser';
import { PALETTE } from '../core/Constants';

export interface AssetEntry {
  key: string;
  path: string;
  type: 'image' | 'spritesheet';
}

export const ASSET_KEYS = {
  // Backgrounds & Environments
  BG_FOREST: 'bg-forest',
  BG_TEMPLE: 'bg-temple',
  FLOOR_STAGE: 'floor-dancer-stage',
  FLOOR_KAILASH: 'floor-kailash-platform',
  PROP_FIRE_HOLDER_LEFT: 'prop-fire-holder-left',
  PROP_FIRE_HOLDER_RIGHT: 'prop-fire-holder-right',
  PROP_LOTUS_PEDESTAL: 'prop-lotus-pedestal',
  PROP_FLAME_RING: 'prop-flame-ring',

  // Player Dance Frames (Bharatanatyam sequence)
  PLAYER_BASE: 'player-nataraja-base',
  PLAYER_FRAME_00: 'player-dance-00',
  PLAYER_FRAME_01: 'player-dance-01',
  PLAYER_FRAME_02: 'player-dance-02',
  PLAYER_FRAME_03: 'player-dance-03',
  PLAYER_FRAME_04: 'player-dance-04',
  PLAYER_FRAME_05: 'player-dance-05',
  PLAYER_FRAME_06: 'player-dance-06',
  PLAYER_FRAME_07: 'player-dance-07',

  // UI elements
  UI_ORNAMENTAL_FRAME: 'ui-ornamental-frame',
  UI_CORNER_TL: 'ui-corner-tl',
  UI_CORNER_TR: 'ui-corner-tr',
  UI_CORNER_BL: 'ui-corner-bl',
  UI_CORNER_BR: 'ui-corner-br',
  UI_MANDALA: 'ui-mandala-circle',

  // FX
  PARTICLE_EMBER: 'particle-ember',
} as const;

export const ASSET_REGISTRY: Record<string, string> = {
  // Environments & Props
  [ASSET_KEYS.BG_FOREST]: '/images/ravan-kailash-elements/11-forest-background.png',
  [ASSET_KEYS.BG_TEMPLE]: '/images/SimpleAssets/backgrounds/Background.png',
  [ASSET_KEYS.FLOOR_STAGE]: '/images/SimpleAssets/nataraja-separated-elements/10-dancer-stage-platform.png',
  [ASSET_KEYS.FLOOR_KAILASH]: '/images/ravan-kailash-elements/04-mount-kailash-platform.png',
  [ASSET_KEYS.PROP_FIRE_HOLDER_LEFT]: '/images/SimpleAssets/nataraja-separated-elements/Temple_Fire_Holder_Left.png',
  [ASSET_KEYS.PROP_FIRE_HOLDER_RIGHT]: '/images/SimpleAssets/nataraja-separated-elements/Temple_Fire_Holder_Right.png',
  [ASSET_KEYS.PROP_LOTUS_PEDESTAL]: '/images/SimpleAssets/nataraja-separated-elements/04-nataraja-lotus-pedestal.png',
  [ASSET_KEYS.PROP_FLAME_RING]: '/images/SimpleAssets/nataraja-separated-elements/02-flame-ring-prabhamandala.png',

  // Player Dance Frame Sequence
  [ASSET_KEYS.PLAYER_BASE]: '/images/SimpleAssets/nataraja-separated-elements/01-nataraja-character.png',
  [ASSET_KEYS.PLAYER_FRAME_00]: '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/00-original-dance-pose.png',
  [ASSET_KEYS.PLAYER_FRAME_01]: '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/01-araimandi-natyarambha.png',
  [ASSET_KEYS.PLAYER_FRAME_02]: '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/02-anjali-samapada.png',
  [ASSET_KEYS.PLAYER_FRAME_03]: '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/03-natta-adavu.png',
  [ASSET_KEYS.PLAYER_FRAME_04]: '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/04-kuditta-mettu.png',
  [ASSET_KEYS.PLAYER_FRAME_05]: '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/05-alidha-lunge.png',
  [ASSET_KEYS.PLAYER_FRAME_06]: '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/06-mandi-kneeling-pose.png',
  [ASSET_KEYS.PLAYER_FRAME_07]: '/images/SimpleAssets/nataraja-separated-elements/bharatanatyam-dance-steps/07-tatta-adavu-preparation.png',

  // UI
  [ASSET_KEYS.UI_ORNAMENTAL_FRAME]: '/images/SimpleAssets/ui/ornamental-frame.png',
  [ASSET_KEYS.UI_CORNER_TL]: '/images/SimpleAssets/ui/corner-top-left.png',
  [ASSET_KEYS.UI_CORNER_TR]: '/images/SimpleAssets/ui/corner-top-right.png',
  [ASSET_KEYS.UI_CORNER_BL]: '/images/SimpleAssets/ui/corner-bottom-left.png',
  [ASSET_KEYS.UI_CORNER_BR]: '/images/SimpleAssets/ui/corner-bottom-right.png',
  [ASSET_KEYS.UI_MANDALA]: '/images/SimpleAssets/ui/mandala-circle.png',
};

/**
 * Creates an emergency fallback texture if a PNG asset fails to load,
 * guaranteeing zero crash rate and zero missing texture errors.
 */
export function createFallbackTexture(scene: Phaser.Scene, key: string, width = 64, height = 64): void {
  if (scene.textures.exists(key)) return;

  const graphics = scene.make.graphics({ x: 0, y: 0 });
  graphics.fillStyle(PALETTE.CHARCOAL_BLACK, 0.9);
  graphics.lineStyle(2, PALETTE.ANTIQUE_GOLD, 1);
  graphics.fillRect(0, 0, width, height);
  graphics.strokeRect(0, 0, width, height);
  graphics.beginPath();
  graphics.moveTo(0, 0);
  graphics.lineTo(width, height);
  graphics.moveTo(width, 0);
  graphics.lineTo(0, height);
  graphics.strokePath();

  graphics.generateTexture(key, width, height);
  graphics.destroy();
}
