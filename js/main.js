// Main entry point

import { Game } from './core/Game.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Create game instance
    const game = new Game();

    // Expose game for debugging (optional)
    window.game = game;

    console.log('Neon Survivors loaded!');
});
