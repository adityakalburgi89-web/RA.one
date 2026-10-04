import { ThreeEngine } from './3d/ThreeEngine';

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('game-container');
  if (container) {
    (window as any).engine = new ThreeEngine(container);
  }
});
