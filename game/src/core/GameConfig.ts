import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './Constants';
import { BootScene } from '../scenes/BootScene';
import { TempleScene } from '../scenes/TempleScene';

export const GameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#0c0806',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: true,
  },
  scene: [BootScene, TempleScene],
};
