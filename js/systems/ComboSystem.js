// ComboSystem - Kill streaks, combos, and multipliers

import { soundManager } from './SoundManager.js';

export class ComboSystem {
    constructor(game) {
        this.game = game;

        // Combo state
        this.comboCount = 0;
        this.comboTimer = 0;
        this.comboTimeout = 2.0; // Seconds before combo resets
        this.maxCombo = 0;

        // Multiplier tiers
        this.multiplierTiers = [
            { count: 0, multiplier: 1.0, name: '' },
            { count: 5, multiplier: 1.2, name: 'NICE!' },
            { count: 10, multiplier: 1.5, name: 'GREAT!' },
            { count: 20, multiplier: 2.0, name: 'AWESOME!' },
            { count: 30, multiplier: 2.5, name: 'AMAZING!' },
            { count: 50, multiplier: 3.0, name: 'INCREDIBLE!' },
            { count: 75, multiplier: 4.0, name: 'UNSTOPPABLE!' },
            { count: 100, multiplier: 5.0, name: 'GODLIKE!' }
        ];

        // Display state
        this.displayCombo = 0;
        this.displayScale = 1;
        this.tierChangedTimer = 0;
        this.currentTierIndex = 0;
        this.previousTierIndex = 0;

        // Combo break effect
        this.comboBreakTimer = 0;
    }

    reset() {
        this.comboCount = 0;
        this.comboTimer = 0;
        this.maxCombo = 0;
        this.displayCombo = 0;
        this.displayScale = 1;
        this.currentTierIndex = 0;
        this.previousTierIndex = 0;
    }

    update(deltaTime) {
        // Update combo timer
        if (this.comboCount > 0) {
            this.comboTimer += deltaTime;

            if (this.comboTimer >= this.comboTimeout) {
                this.breakCombo();
            }
        }

        // Animate display combo toward actual combo
        if (this.displayCombo < this.comboCount) {
            this.displayCombo = Math.min(this.displayCombo + deltaTime * 50, this.comboCount);
        }

        // Decay scale animation
        if (this.displayScale > 1) {
            this.displayScale = Math.max(1, this.displayScale - deltaTime * 3);
        }

        // Tier change timer
        if (this.tierChangedTimer > 0) {
            this.tierChangedTimer -= deltaTime;
        }

        // Combo break timer
        if (this.comboBreakTimer > 0) {
            this.comboBreakTimer -= deltaTime;
        }
    }

    // Called when an enemy is killed
    addKill() {
        this.comboCount++;
        this.comboTimer = 0;
        this.displayScale = 1.5;

        // Track max combo
        if (this.comboCount > this.maxCombo) {
            this.maxCombo = this.comboCount;
        }

        // Check for tier change
        const newTierIndex = this.getTierIndex();
        if (newTierIndex > this.currentTierIndex) {
            this.previousTierIndex = this.currentTierIndex;
            this.currentTierIndex = newTierIndex;
            this.tierChangedTimer = 1.5;
            this.displayScale = 2.0;

            // Play tier up sound
            this.playTierUpSound();

            // Trigger visual effects
            const tier = this.multiplierTiers[newTierIndex];
            const colors = [
                '#ffffff', '#88ff88', '#88ffff', '#ffff88',
                '#ffaa44', '#ff88ff', '#ff4444', '#ffd700'
            ];
            this.game.effects.killStreakTierUp(newTierIndex, tier.name, colors[newTierIndex]);
        }

        return this.getCurrentMultiplier();
    }

    breakCombo() {
        if (this.comboCount > 10) {
            this.comboBreakTimer = 1.0;
        }
        this.comboCount = 0;
        this.comboTimer = 0;
        this.displayCombo = 0;
        this.currentTierIndex = 0;
        this.previousTierIndex = 0;
    }

    getTierIndex() {
        for (let i = this.multiplierTiers.length - 1; i >= 0; i--) {
            if (this.comboCount >= this.multiplierTiers[i].count) {
                return i;
            }
        }
        return 0;
    }

    getCurrentTier() {
        return this.multiplierTiers[this.currentTierIndex];
    }

    getCurrentMultiplier() {
        return this.getCurrentTier().multiplier;
    }

    getComboTimeRemaining() {
        return Math.max(0, this.comboTimeout - this.comboTimer);
    }

    getComboTimeRatio() {
        return this.getComboTimeRemaining() / this.comboTimeout;
    }

    playTierUpSound() {
        if (!soundManager.initialized) return;

        const now = soundManager.ctx.currentTime;
        const tier = this.currentTierIndex;

        // Higher tier = higher pitch fanfare
        const baseFreq = 440 * Math.pow(1.2, tier);

        for (let i = 0; i < 3; i++) {
            const osc = soundManager.ctx.createOscillator();
            const gain = soundManager.ctx.createGain();

            osc.type = 'square';
            osc.frequency.value = baseFreq * (1 + i * 0.25);

            const startTime = now + i * 0.08;
            gain.gain.setValueAtTime(0.15, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

            osc.connect(gain);
            gain.connect(soundManager.sfxGain);

            osc.start(startTime);
            osc.stop(startTime + 0.2);
        }
    }

    // Draw combo UI
    draw(ctx, x, y) {
        if (this.comboCount < 5 && this.comboBreakTimer <= 0) return;

        ctx.save();

        // Combo break effect
        if (this.comboBreakTimer > 0) {
            ctx.globalAlpha = this.comboBreakTimer;
            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 24px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('COMBO BREAK!', x, y);
            ctx.restore();
            return;
        }

        const tier = this.getCurrentTier();
        const scale = this.displayScale;

        // Colors based on tier
        const colors = [
            '#ffffff', // Default
            '#88ff88', // NICE
            '#88ffff', // GREAT
            '#ffff88', // AWESOME
            '#ffaa44', // AMAZING
            '#ff88ff', // INCREDIBLE
            '#ff4444', // UNSTOPPABLE
            '#ffd700'  // GODLIKE
        ];
        const color = colors[this.currentTierIndex] || '#ffffff';

        // Combo counter
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;

        // Main combo text
        ctx.font = `bold ${32 * scale}px monospace`;
        ctx.fillStyle = color;
        ctx.fillText(`${Math.floor(this.displayCombo)} COMBO`, x, y);

        // Tier name
        if (tier.name && this.tierChangedTimer > 0) {
            const tierAlpha = Math.min(1, this.tierChangedTimer);
            const tierScale = 1 + (1 - tierAlpha) * 0.5;
            ctx.globalAlpha = tierAlpha;
            ctx.font = `bold ${28 * tierScale}px monospace`;
            ctx.fillStyle = color;
            ctx.fillText(tier.name, x, y - 45);
        }

        // Multiplier
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 10;
        ctx.font = 'bold 18px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`x${tier.multiplier.toFixed(1)} EXP`, x, y + 30);

        // Timer bar
        const barWidth = 120;
        const barHeight = 4;
        const timeRatio = this.getComboTimeRatio();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x - barWidth / 2, y + 50, barWidth, barHeight);

        ctx.fillStyle = color;
        ctx.fillRect(x - barWidth / 2, y + 50, barWidth * timeRatio, barHeight);

        ctx.restore();
    }
}
