// PowerUpSystem - Temporary power-up drops and effects

import { soundManager } from './SoundManager.js';

// Power-up types
export const PowerUpType = {
    INVINCIBLE: 'invincible',    // Can't take damage
    DOUBLE_DAMAGE: 'doubleDamage', // 2x damage
    RAPID_FIRE: 'rapidFire',     // 3x attack speed
    MAGNET: 'magnet',            // Huge pickup range
    SPEED_BOOST: 'speedBoost',   // 2x movement speed
    MULTI_SHOT: 'multiShot'      // 5-way spread shot
};

export class PowerUpSystem {
    constructor(game) {
        this.game = game;

        // Active power-ups (type -> remaining duration)
        this.activePowerUps = new Map();

        // Power-up definitions
        this.powerUpDefs = {
            [PowerUpType.INVINCIBLE]: {
                name: '無敵',
                duration: 5,
                color: '#00ffff',
                icon: '🛡️',
                dropRate: 0.15
            },
            [PowerUpType.DOUBLE_DAMAGE]: {
                name: 'ダメージ2倍',
                duration: 8,
                color: '#ff4444',
                icon: '⚔️',
                dropRate: 0.2
            },
            [PowerUpType.RAPID_FIRE]: {
                name: '連射',
                duration: 6,
                color: '#ffff00',
                icon: '⚡',
                dropRate: 0.2
            },
            [PowerUpType.MAGNET]: {
                name: 'マグネット',
                duration: 10,
                color: '#ff00ff',
                icon: '🧲',
                dropRate: 0.15
            },
            [PowerUpType.SPEED_BOOST]: {
                name: 'スピード',
                duration: 7,
                color: '#00ff00',
                icon: '💨',
                dropRate: 0.2
            },
            [PowerUpType.MULTI_SHOT]: {
                name: 'マルチショット',
                duration: 6,
                color: '#ff8800',
                icon: '🎯',
                dropRate: 0.1
            }
        };

        // Dropped power-ups in world
        this.droppedPowerUps = [];

        // Visual effects
        this.pickupEffects = [];
    }

    reset() {
        this.activePowerUps.clear();
        this.droppedPowerUps = [];
        this.pickupEffects = [];
    }

    update(deltaTime) {
        // Update active power-up timers
        for (const [type, remaining] of this.activePowerUps.entries()) {
            const newRemaining = remaining - deltaTime;
            if (newRemaining <= 0) {
                this.activePowerUps.delete(type);
                this.onPowerUpExpired(type);
            } else {
                this.activePowerUps.set(type, newRemaining);
            }
        }

        // Update dropped power-ups
        for (const powerUp of this.droppedPowerUps) {
            powerUp.time += deltaTime;
            powerUp.bobOffset = Math.sin(powerUp.time * 4) * 5;

            // Expire after 15 seconds
            if (powerUp.time > 15) {
                powerUp.active = false;
            }
        }

        // Cleanup
        this.droppedPowerUps = this.droppedPowerUps.filter(p => p.active);

        // Update pickup effects
        for (let i = this.pickupEffects.length - 1; i >= 0; i--) {
            this.pickupEffects[i].time += deltaTime;
            if (this.pickupEffects[i].time > 1) {
                this.pickupEffects.splice(i, 1);
            }
        }

        // Check collisions with player
        this.checkPickups();
    }

    // Try to spawn a power-up at position (called on enemy death)
    trySpawn(x, y, isBoss = false) {
        // Base drop chance
        let dropChance = isBoss ? 1.0 : 0.02; // 2% normal, 100% boss

        if (Math.random() > dropChance) return;

        // Select random power-up type based on weights
        const types = Object.keys(this.powerUpDefs);
        const weights = types.map(t => this.powerUpDefs[t].dropRate);
        const totalWeight = weights.reduce((a, b) => a + b, 0);

        let rand = Math.random() * totalWeight;
        let selectedType = types[0];

        for (let i = 0; i < types.length; i++) {
            rand -= weights[i];
            if (rand <= 0) {
                selectedType = types[i];
                break;
            }
        }

        this.droppedPowerUps.push({
            x,
            y,
            type: selectedType,
            time: 0,
            bobOffset: 0,
            active: true
        });
    }

    checkPickups() {
        const player = this.game.player;
        if (!player) return;

        const pickupRange = 30;

        for (const powerUp of this.droppedPowerUps) {
            if (!powerUp.active) continue;

            const dx = player.x - powerUp.x;
            const dy = player.y - powerUp.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < pickupRange) {
                this.activatePowerUp(powerUp.type, powerUp.x, powerUp.y);
                powerUp.active = false;
            }
        }
    }

    activatePowerUp(type, x, y) {
        const def = this.powerUpDefs[type];
        if (!def) return;

        // Refresh duration if already active, or add new
        this.activePowerUps.set(type, def.duration);

        // Visual effect
        this.pickupEffects.push({
            x,
            y,
            type,
            time: 0
        });

        // Sound
        this.playPowerUpSound();

        // Apply immediate effects
        this.applyPowerUpEffect(type);
    }

    applyPowerUpEffect(type) {
        const player = this.game.player;
        if (!player) return;

        switch (type) {
            case PowerUpType.INVINCIBLE:
                // Handled in damage calculation
                break;
            case PowerUpType.SPEED_BOOST:
                // Handled in movement calculation
                break;
            // Other effects handled at calculation time
        }
    }

    onPowerUpExpired(type) {
        // Play expire sound (quieter)
        if (soundManager.initialized) {
            const now = soundManager.ctx.currentTime;
            const osc = soundManager.ctx.createOscillator();
            const gain = soundManager.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);

            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

            osc.connect(gain);
            gain.connect(soundManager.sfxGain);

            osc.start(now);
            osc.stop(now + 0.1);
        }
    }

    playPowerUpSound() {
        if (!soundManager.initialized) return;

        const now = soundManager.ctx.currentTime;

        // Power-up pickup jingle
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

        notes.forEach((freq, i) => {
            const osc = soundManager.ctx.createOscillator();
            const gain = soundManager.ctx.createGain();

            osc.type = 'square';
            osc.frequency.value = freq;

            const startTime = now + i * 0.05;
            gain.gain.setValueAtTime(0.15, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

            osc.connect(gain);
            gain.connect(soundManager.sfxGain);

            osc.start(startTime);
            osc.stop(startTime + 0.15);
        });
    }

    // Getters for active effects
    isInvincible() {
        return this.activePowerUps.has(PowerUpType.INVINCIBLE);
    }

    getDamageMultiplier() {
        return this.activePowerUps.has(PowerUpType.DOUBLE_DAMAGE) ? 2 : 1;
    }

    getAttackSpeedMultiplier() {
        return this.activePowerUps.has(PowerUpType.RAPID_FIRE) ? 3 : 1;
    }

    getMagnetRange() {
        return this.activePowerUps.has(PowerUpType.MAGNET) ? 500 : 0;
    }

    getSpeedMultiplier() {
        return this.activePowerUps.has(PowerUpType.SPEED_BOOST) ? 2 : 1;
    }

    isMultiShot() {
        return this.activePowerUps.has(PowerUpType.MULTI_SHOT);
    }

    // Get active power-ups for UI
    getActivePowerUps() {
        const result = [];
        for (const [type, remaining] of this.activePowerUps.entries()) {
            const def = this.powerUpDefs[type];
            result.push({
                type,
                name: def.name,
                icon: def.icon,
                color: def.color,
                remaining,
                maxDuration: def.duration
            });
        }
        return result;
    }

    // Draw dropped power-ups
    draw(ctx, camera) {
        for (const powerUp of this.droppedPowerUps) {
            if (!powerUp.active) continue;

            const screen = camera.worldToScreen(powerUp.x, powerUp.y + powerUp.bobOffset);
            const def = this.powerUpDefs[powerUp.type];

            // Glow
            ctx.save();
            ctx.shadowColor = def.color;
            ctx.shadowBlur = 15 + Math.sin(powerUp.time * 6) * 5;

            // Background circle
            ctx.fillStyle = def.color;
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, 20, 0, Math.PI * 2);
            ctx.fill();

            // Icon
            ctx.globalAlpha = 1;
            ctx.font = '20px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(def.icon, screen.x, screen.y);

            ctx.restore();
        }

        // Draw pickup effects
        for (const effect of this.pickupEffects) {
            const screen = camera.worldToScreen(effect.x, effect.y);
            const def = this.powerUpDefs[effect.type];
            const progress = effect.time;
            const alpha = 1 - progress;
            const scale = 1 + progress * 2;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = `${30 * scale}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(def.icon, screen.x, screen.y - progress * 50);
            ctx.restore();
        }
    }

    // Draw active power-up UI
    drawUI(ctx, x, y) {
        const activePowerUps = this.getActivePowerUps();
        if (activePowerUps.length === 0) return;

        ctx.save();

        let offsetY = 0;
        for (const powerUp of activePowerUps) {
            const ratio = powerUp.remaining / powerUp.maxDuration;

            // Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(x, y + offsetY, 150, 30);

            // Timer bar
            ctx.fillStyle = powerUp.color;
            ctx.fillRect(x, y + offsetY, 150 * ratio, 30);

            // Border
            ctx.strokeStyle = powerUp.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y + offsetY, 150, 30);

            // Icon and name
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${powerUp.icon} ${powerUp.name}`, x + 5, y + offsetY + 15);

            // Timer text
            ctx.textAlign = 'right';
            ctx.fillText(`${powerUp.remaining.toFixed(1)}s`, x + 145, y + offsetY + 15);

            offsetY += 35;
        }

        ctx.restore();
    }
}
