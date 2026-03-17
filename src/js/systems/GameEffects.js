// GameEffects - Screen shake, hit stop, slow motion, and visual juice

export class GameEffects {
    constructor(game) {
        this.game = game;

        // Screen shake
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;

        // Hit stop (freeze frame)
        this.hitStopDuration = 0;
        this.hitStopTimer = 0;

        // Slow motion
        this.slowMotionScale = 1;
        this.slowMotionDuration = 0;
        this.slowMotionTimer = 0;

        // Time scale
        this.timeScale = 1;

        // Flash effect
        this.flashColor = null;
        this.flashAlpha = 0;
        this.flashDuration = 0;

        // Center text announcement
        this.announceText = '';
        this.announceColor = '#ffffff';
        this.announceTimer = 0;
        this.announceDuration = 0;
        this.announceScale = 1;
    }

    update(deltaTime) {
        // Update screen shake
        if (this.shakeDuration > 0) {
            this.shakeDuration -= deltaTime;
            const progress = this.shakeDuration > 0 ? 1 : 0;
            this.shakeOffsetX = (Math.random() - 0.5) * 2 * this.shakeIntensity * progress;
            this.shakeOffsetY = (Math.random() - 0.5) * 2 * this.shakeIntensity * progress;

            if (this.shakeDuration <= 0) {
                this.shakeOffsetX = 0;
                this.shakeOffsetY = 0;
            }
        }

        // Update hit stop
        if (this.hitStopTimer > 0) {
            this.hitStopTimer -= deltaTime;
            if (this.hitStopTimer <= 0) {
                this.timeScale = this.slowMotionDuration > 0 ? this.slowMotionScale : 1;
            }
        }

        // Update slow motion
        if (this.slowMotionDuration > 0) {
            this.slowMotionTimer += deltaTime;
            if (this.slowMotionTimer >= this.slowMotionDuration) {
                this.slowMotionDuration = 0;
                this.slowMotionTimer = 0;
                this.slowMotionScale = 1;
                if (this.hitStopTimer <= 0) {
                    this.timeScale = 1;
                }
            }
        }

        // Update flash
        if (this.flashAlpha > 0) {
            this.flashAlpha -= deltaTime / this.flashDuration;
            if (this.flashAlpha < 0) this.flashAlpha = 0;
        }

        // Update announcement
        if (this.announceTimer > 0) {
            this.announceTimer -= deltaTime;
            // Scale animation
            const progress = 1 - (this.announceTimer / this.announceDuration);
            if (progress < 0.1) {
                this.announceScale = 0.5 + progress * 5; // Scale up
            } else if (progress > 0.7) {
                this.announceScale = 1 + (progress - 0.7) * 2; // Scale up and fade
            } else {
                this.announceScale = 1;
            }
        }
    }

    // Screen shake - intensity and duration in seconds
    shake(intensity, duration = 0.2) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
        this.shakeDuration = Math.max(this.shakeDuration, duration);
    }

    // Small shake for regular hits
    shakeSmall() {
        this.shake(1, 0.03);
    }

    // Medium shake for kills
    shakeMedium() {
        this.shake(2, 0.05);
    }

    // Large shake for critical hits or big events
    shakeLarge() {
        this.shake(4, 0.08);
    }

    // Epic shake for boss events
    shakeEpic() {
        this.shake(6, 0.12);
    }

    // Hit stop - freeze the game briefly
    hitStop(duration = 0.05) {
        this.hitStopDuration = duration;
        this.hitStopTimer = duration;
        this.timeScale = 0;
    }

    // Short hit stop for regular hits
    hitStopShort() {
        this.hitStop(0.02);
    }

    // Long hit stop for critical hits
    hitStopLong() {
        this.hitStop(0.06);
    }

    // Slow motion effect
    slowMotion(scale, duration) {
        this.slowMotionScale = scale;
        this.slowMotionDuration = duration;
        this.slowMotionTimer = 0;
        if (this.hitStopTimer <= 0) {
            this.timeScale = scale;
        }
    }

    // Boss kill slow motion
    bossKillSlowMo() {
        this.slowMotion(0.2, 1.0);
        this.shakeEpic();
    }

    // Level up effect
    levelUpEffect() {
        this.flash('#ffff00', 0.3);
        this.slowMotion(0.5, 0.3);
    }

    // Flash the screen
    flash(color, duration = 0.2) {
        this.flashColor = color;
        this.flashAlpha = 1;
        this.flashDuration = duration;
    }

    // Get modified delta time
    getModifiedDeltaTime(deltaTime) {
        return deltaTime * this.timeScale;
    }

    // Check if game is paused due to hit stop
    isHitStopped() {
        return this.hitStopTimer > 0;
    }

    // Draw flash effect
    drawFlash(ctx, width, height) {
        if (this.flashAlpha > 0 && this.flashColor) {
            ctx.save();
            ctx.fillStyle = this.flashColor;
            ctx.globalAlpha = this.flashAlpha * 0.5;
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
        }
    }

    // Get shake offset for camera
    getShakeOffset() {
        return {
            x: this.shakeOffsetX,
            y: this.shakeOffsetY
        };
    }

    // Announce text in center of screen
    announce(text, color = '#ffffff', duration = 1.5) {
        this.announceText = text;
        this.announceColor = color;
        this.announceTimer = duration;
        this.announceDuration = duration;
        this.announceScale = 0.5;
    }

    // Kill streak tier up effect
    killStreakTierUp(tierIndex, tierName, color) {
        // Subtle effect for tier ups
        const intensity = Math.min(tierIndex * 0.5, 3);
        this.shake(2 + intensity, 0.1);

        if (tierIndex >= 4) {
            // AMAZING and above: slow motion
            this.slowMotion(0.3, 0.4);
        }

        if (tierIndex >= 6) {
            // UNSTOPPABLE and above: flash
            this.flash(color, 0.3);
        }

        // Show announcement
        this.announce(tierName, color, 1.2);
    }

    // Draw announcement
    drawAnnouncement(ctx, width, height) {
        if (this.announceTimer <= 0) return;

        const alpha = Math.min(1, this.announceTimer / 0.3);
        const scale = this.announceScale;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Glow
        ctx.shadowColor = this.announceColor;
        ctx.shadowBlur = 30;

        // Text
        ctx.font = `bold ${64 * scale}px monospace`;
        ctx.fillStyle = this.announceColor;
        ctx.fillText(this.announceText, width / 2, height / 2 - 50);

        ctx.restore();
    }
}
