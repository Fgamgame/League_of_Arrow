// Game Over screen

import { formatTime } from '../utils/math.js';

export class GameOver {
    constructor(game) {
        this.game = game;

        this.container = document.getElementById('game-over');
        this.finalLevel = document.getElementById('final-level');
        this.finalTime = document.getElementById('final-time');
        this.finalKills = document.getElementById('final-kills');
        this.restartButton = document.getElementById('restart-button');

        this.bindEvents();
    }

    bindEvents() {
        this.restartButton.addEventListener('click', () => {
            this.game.restart();
        });

        // R key to restart
        window.addEventListener('keydown', (e) => {
            if (this.container.classList.contains('hidden')) return;
            if (e.code === 'KeyR' || e.code === 'Space' || e.code === 'Enter') {
                this.game.restart();
            }
        });
    }

    show(level, time, kills) {
        this.finalLevel.textContent = level;
        this.finalTime.textContent = formatTime(time);
        this.finalKills.textContent = kills;

        this.container.classList.remove('hidden');
        this.container.classList.add('fade-in');
    }

    hide() {
        this.container.classList.add('hidden');
        this.container.classList.remove('fade-in');
    }
}
