// Wave spawning system

import { Enemy } from '../entities/Enemy.js';
import { EnemyTypes, scaleEnemyStats } from '../entities/EnemyTypes.js';
import { getWaveConfig, selectEnemyType } from '../data/enemies.js';
import { randomRange } from '../utils/math.js';

export class WaveSystem {
    constructor(game) {
        this.game = game;

        this.currentWave = 0;
        this.waveConfig = null;
        this.spawnTimer = 0;
        this.enemiesSpawned = 0;
        this.waveComplete = false;

        // Wave timing
        this.waveDuration = 30; // seconds per wave
        this.waveTimer = 0;
        this.betweenWaveDelay = 3;
        this.delayTimer = 0;
        this.isDelaying = false;
    }

    reset() {
        this.currentWave = 0;
        this.waveConfig = null;
        this.spawnTimer = 0;
        this.enemiesSpawned = 0;
        this.waveComplete = false;
        this.waveTimer = 0;
        this.delayTimer = 0;
        this.isDelaying = false;

        // Start first wave
        this.startNextWave();
    }

    update(deltaTime) {
        // Handle between-wave delay
        if (this.isDelaying) {
            this.delayTimer -= deltaTime;
            if (this.delayTimer <= 0) {
                this.isDelaying = false;
                this.startNextWave();
            }
            return;
        }

        // Update wave timer
        this.waveTimer += deltaTime;

        // Check if wave is complete
        if (this.waveConfig) {
            const isBossWave = this.waveConfig.isBossWave;

            if (isBossWave) {
                // Boss wave ends when boss is defeated
                if (this.enemiesSpawned > 0 && this.game.enemies.length === 0) {
                    this.endWave();
                }
            } else {
                // Normal wave ends by timer or max enemies killed
                if (this.waveTimer >= this.waveDuration) {
                    this.endWave();
                }
            }
        }

        // Spawn enemies
        this.updateSpawning(deltaTime);
    }

    updateSpawning(deltaTime) {
        if (!this.waveConfig || this.waveComplete) return;

        // Check spawn limit
        if (this.enemiesSpawned >= this.waveConfig.maxEnemies) return;

        // Check current enemy count (allow more enemies for Dada Survivor feel)
        const maxActive = Math.min(50, this.waveConfig.maxEnemies);
        if (this.game.enemies.length >= maxActive) return;

        // Spawn timer
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.waveConfig.spawnRate) {
            this.spawnTimer = 0;
            this.spawnEnemy();
        }
    }

    spawnEnemy() {
        if (!this.waveConfig) return;

        // Select enemy type
        const enemyTypeName = selectEnemyType(this.waveConfig.enemies);
        const baseConfig = EnemyTypes[enemyTypeName];

        if (!baseConfig) return;

        // Scale enemy stats for current wave
        const scaledConfig = scaleEnemyStats(baseConfig, this.currentWave);

        // Get spawn position (outside screen edges)
        const position = this.getSpawnPosition();

        // Create enemy
        const enemy = new Enemy(position.x, position.y, scaledConfig);
        this.game.enemies.push(enemy);
        this.enemiesSpawned++;

        // Spawn particle effect
        this.game.particles.spawn(position.x, position.y);
    }

    getSpawnPosition() {
        const bounds = this.game.renderer.getBounds();
        const margin = 50;
        const player = this.game.player;

        let x, y;
        const side = Math.floor(Math.random() * 4);

        switch (side) {
            case 0: // Top
                x = randomRange(margin, bounds.right - margin);
                y = -margin;
                break;
            case 1: // Right
                x = bounds.right + margin;
                y = randomRange(margin, bounds.bottom - margin);
                break;
            case 2: // Bottom
                x = randomRange(margin, bounds.right - margin);
                y = bounds.bottom + margin;
                break;
            case 3: // Left
                x = -margin;
                y = randomRange(margin, bounds.bottom - margin);
                break;
        }

        // Make sure spawn isn't too close to player
        if (player) {
            const minDist = 150;
            const dx = x - player.x;
            const dy = y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < minDist) {
                // Push spawn point away from player
                const angle = Math.atan2(dy, dx);
                x = player.x + Math.cos(angle) * minDist;
                y = player.y + Math.sin(angle) * minDist;
            }
        }

        return { x, y };
    }

    startNextWave() {
        this.currentWave++;
        this.waveConfig = getWaveConfig(this.currentWave);
        this.spawnTimer = 0;
        this.enemiesSpawned = 0;
        this.waveComplete = false;
        this.waveTimer = 0;

        // Show wave notification
        this.showWaveNotification();
    }

    endWave() {
        this.waveComplete = true;
        this.isDelaying = true;
        this.delayTimer = this.betweenWaveDelay;
    }

    showWaveNotification() {
        const notification = document.getElementById('wave-notification');
        const text = document.getElementById('wave-text');

        if (this.waveConfig && this.waveConfig.isBossWave) {
            text.textContent = `WAVE ${this.currentWave} - BOSS`;
            text.style.color = 'var(--neon-red)';
        } else {
            text.textContent = `WAVE ${this.currentWave}`;
            text.style.color = 'var(--neon-orange)';
        }

        notification.classList.remove('hidden');

        setTimeout(() => {
            notification.classList.add('hidden');
        }, 2000);
    }
}
