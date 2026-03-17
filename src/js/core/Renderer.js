// Renderer - Canvas drawing with camera support and visual HP degradation

import { Palettes, drawPlayerSprite, drawPixelSprite, getSpriteForType } from '../utils/PixelArt.js';
import { BowState } from '../entities/Player.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 0;
        this.height = 0;

        this.ctx.imageSmoothingEnabled = false;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const container = this.canvas.parentElement;
        const maxWidth = container.clientWidth - 40;
        const maxHeight = container.clientHeight - 40;

        const targetRatio = 16 / 9;
        let width = maxWidth;
        let height = width / targetRatio;

        if (height > maxHeight) {
            height = maxHeight;
            width = height * targetRatio;
        }

        width = Math.max(800, Math.min(1600, width));
        height = Math.max(450, Math.min(900, height));

        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;

        this.ctx.imageSmoothingEnabled = false;
    }

    clear(camera) {
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.width, this.height);

        if (camera) {
            this.drawInfiniteGrid(camera);
        }
    }

    drawInfiniteGrid(camera) {
        const gridSize = 100;
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.08)';
        this.ctx.lineWidth = 1;

        // Calculate grid offset based on camera
        const offsetX = -camera.x % gridSize;
        const offsetY = -camera.y % gridSize;

        for (let x = offsetX; x < this.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        for (let y = offsetY; y < this.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }

    drawPlayer(player, camera, weaponData) {
        const screen = camera.worldToScreen(player.x, player.y);

        this.ctx.save();

        if (player.invincible && Math.floor(Date.now() / 100) % 2 === 0) {
            this.ctx.globalAlpha = 0.5;
        }

        // Draw orbital weapons behind player
        if (weaponData) {
            this.drawOrbitalWeapons(screen, weaponData, camera);
        }

        // Draw attack range circle
        this.drawAttackRange(player, screen);

        // Draw barrier shield
        this.drawBarrier(player, screen);

        drawPlayerSprite(this.ctx, player, Palettes.player, screen.x, screen.y, 2.5);
        this.drawBow(player, screen);

        this.ctx.restore();
    }

    drawOrbitalWeapons(screen, data, camera) {
        // Draw shields
        if (data.shields > 0) {
            const shieldRadius = data.shieldRadius || 120;
            this.ctx.fillStyle = '#4488ff';
            this.ctx.strokeStyle = '#88ccff';
            this.ctx.lineWidth = 2;
            for (let i = 0; i < data.shields; i++) {
                const angle = data.shieldAngle + (Math.PI * 2 * i / data.shields);
                const x = screen.x + Math.cos(angle) * shieldRadius;
                const y = screen.y + Math.sin(angle) * shieldRadius;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 15, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
            }
        }

        // Draw fire orbs
        if (data.fireOrbs > 0) {
            const orbRadius = data.orbRadius || 150;
            this.ctx.fillStyle = '#ff4400';
            for (let i = 0; i < data.fireOrbs * 2; i++) {
                const angle = data.orbAngle + (Math.PI * 2 * i / (data.fireOrbs * 2));
                const x = screen.x + Math.cos(angle) * orbRadius;
                const y = screen.y + Math.sin(angle) * orbRadius;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 12, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        // Draw boomerangs
        if (data.boomerang > 0) {
            const boomRadius = data.boomerangRadius || 180;
            this.ctx.fillStyle = '#aa8855';
            for (let i = 0; i < data.boomerang; i++) {
                const angle = data.boomerangAngle + (Math.PI * 2 * i / data.boomerang);
                const x = screen.x + Math.cos(angle) * boomRadius;
                const y = screen.y + Math.sin(angle) * boomRadius;

                this.ctx.save();
                this.ctx.translate(x, y);
                this.ctx.rotate(angle);
                this.ctx.beginPath();
                this.ctx.moveTo(-15, 0);
                this.ctx.lineTo(0, -8);
                this.ctx.lineTo(15, 0);
                this.ctx.lineTo(0, 8);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.restore();
            }
        }

        // Draw lightning ring (range indicator)
        if (data.lightning > 0) {
            const range = data.lightningRadius || 250;
            this.ctx.strokeStyle = `rgba(255, 255, 100, ${0.2 + Math.random() * 0.1})`;
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([10, 10]);
            this.ctx.beginPath();
            this.ctx.arc(screen.x, screen.y, range, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        // Draw lightning strike animation
        if (data.lightningActive && data.lightningAnimRadius > 0) {
            const maxRadius = data.lightningRadius;
            const progress = data.lightningAnimRadius / maxRadius;
            const alpha = 1 - progress;

            // Expanding ring
            this.ctx.strokeStyle = `rgba(255, 255, 100, ${alpha * 0.8})`;
            this.ctx.lineWidth = 4 + (1 - alpha) * 8;
            this.ctx.shadowColor = '#ffff00';
            this.ctx.shadowBlur = 20;
            this.ctx.beginPath();
            this.ctx.arc(screen.x, screen.y, data.lightningAnimRadius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;

            // Inner electric ring
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(screen.x, screen.y, data.lightningAnimRadius * 0.6, 0, Math.PI * 2);
            this.ctx.stroke();

            // Draw lightning bolts to hit enemies
            if (data.lightningStrikes && data.lightningStrikes.length > 0) {
                for (const strike of data.lightningStrikes) {
                    const strikeScreen = camera.worldToScreen(strike.x, strike.y);
                    this.drawLightningBolt(screen.x, screen.y, strikeScreen.x, strikeScreen.y, alpha);
                }
            }
        }

        // Draw poison cloud
        if (data.poison > 0) {
            const range = data.poisonRadius || 150;
            this.ctx.fillStyle = 'rgba(100, 200, 100, 0.2)';
            this.ctx.beginPath();
            this.ctx.arc(screen.x, screen.y, range, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw shockwave effect
        if (data.shockwaveActive && data.shockwaveRadius > 0) {
            const alpha = 1 - (data.shockwaveRadius / data.shockwaveMaxRadius);
            this.ctx.strokeStyle = `rgba(0, 200, 255, ${alpha * 0.8})`;
            this.ctx.lineWidth = 4 + (1 - alpha) * 6;
            this.ctx.beginPath();
            this.ctx.arc(screen.x, screen.y, data.shockwaveRadius, 0, Math.PI * 2);
            this.ctx.stroke();

            // Inner ring
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(screen.x, screen.y, data.shockwaveRadius * 0.7, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Draw aura blade effect
        if (data.auraBladeActive && data.auraBladeRadius > 0) {
            const alpha = 1 - (data.auraBladeRadius / data.auraBladeMaxRadius);

            // Outer wave
            this.ctx.strokeStyle = `rgba(255, 100, 50, ${alpha * 0.8})`;
            this.ctx.lineWidth = 3 + (1 - alpha) * 8;
            this.ctx.beginPath();
            this.ctx.arc(screen.x, screen.y, data.auraBladeRadius, 0, Math.PI * 2);
            this.ctx.stroke();

            // Inner glow
            this.ctx.fillStyle = `rgba(255, 150, 50, ${alpha * 0.15})`;
            this.ctx.beginPath();
            this.ctx.arc(screen.x, screen.y, data.auraBladeRadius, 0, Math.PI * 2);
            this.ctx.fill();

            // Core ring
            this.ctx.strokeStyle = `rgba(255, 200, 100, ${alpha * 0.6})`;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(screen.x, screen.y, data.auraBladeRadius * 0.5, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        // Draw aura blade range indicator (subtle)
        if (data.auraBlade > 0 && !data.auraBladeActive) {
            const range = data.auraBladeMaxRadius;
            this.ctx.strokeStyle = 'rgba(255, 100, 50, 0.15)';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([8, 8]);
            this.ctx.beginPath();
            this.ctx.arc(screen.x, screen.y, range, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
    }

    drawAttackRange(player, screen) {
        const range = player.attackRange;

        // Outer range circle (subtle)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.arc(screen.x, screen.y, range, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Inner glow when attacking
        if (player.isDrawingBow()) {
            this.ctx.strokeStyle = 'rgba(255, 200, 100, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(screen.x, screen.y, range, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }

    drawBarrier(player, screen) {
        if (player.barrier > 0) {
            const barrierRatio = player.barrier / player.maxBarrier;
            const alpha = 0.3 + barrierRatio * 0.4;
            this.ctx.strokeStyle = `rgba(0, 200, 255, ${alpha})`;
            this.ctx.fillStyle = `rgba(0, 200, 255, ${alpha * 0.3})`;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(screen.x, screen.y, 35, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        }
    }

    drawBow(player, screen) {
        const { bowState, bowDrawProgress } = player;
        const angle = player.getBowAngle();

        this.ctx.save();
        this.ctx.translate(screen.x, screen.y);
        this.ctx.rotate(angle);

        const bowColor = '#8B4513';
        const stringColor = '#ffffff';
        const arrowColor = '#8B4513';
        const arrowHead = '#c0c0c0';
        const featherColor = '#ff4444';

        const bowLength = 30;
        const bowWidth = 4;
        const bowOffset = 20;
        const stringPull = bowDrawProgress * 15;

        // Bow curve
        this.ctx.strokeStyle = bowColor;
        this.ctx.lineWidth = bowWidth;
        this.ctx.lineCap = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(bowOffset, -bowLength / 2);
        this.ctx.quadraticCurveTo(bowOffset + 8 - stringPull * 0.3, 0, bowOffset, bowLength / 2);
        this.ctx.stroke();

        // Bowstring
        this.ctx.strokeStyle = stringColor;
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(bowOffset, -bowLength / 2);
        this.ctx.lineTo(bowOffset - stringPull, 0);
        this.ctx.lineTo(bowOffset, bowLength / 2);
        this.ctx.stroke();

        // Arrow when drawing
        if (bowState !== BowState.IDLE) {
            const showArrow = bowState !== BowState.RELEASING || bowDrawProgress > 0.5;

            if (showArrow) {
                const arrowX = bowOffset - stringPull;
                const arrowTipX = arrowX + 25;

                this.ctx.strokeStyle = arrowColor;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(arrowX - 8, 0);
                this.ctx.lineTo(arrowTipX, 0);
                this.ctx.stroke();

                this.ctx.fillStyle = arrowHead;
                this.ctx.beginPath();
                this.ctx.moveTo(arrowTipX + 8, 0);
                this.ctx.lineTo(arrowTipX, -4);
                this.ctx.lineTo(arrowTipX, 4);
                this.ctx.closePath();
                this.ctx.fill();

                this.ctx.fillStyle = featherColor;
                this.ctx.beginPath();
                this.ctx.moveTo(arrowX - 5, 0);
                this.ctx.lineTo(arrowX - 12, -5);
                this.ctx.lineTo(arrowX - 8, 0);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.moveTo(arrowX - 5, 0);
                this.ctx.lineTo(arrowX - 12, 5);
                this.ctx.lineTo(arrowX - 8, 0);
                this.ctx.closePath();
                this.ctx.fill();
            }
        }

        this.ctx.restore();
    }

    drawEnemy(enemy, camera) {
        const screen = camera.worldToScreen(enemy.x, enemy.y);
        const hpRatio = enemy.getHpRatio();

        // Get sprite for this enemy type
        const { sprite, palette } = getSpriteForType(enemy.type);

        // Scale based on enemy type
        const scales = {
            melee: 1.8,
            ranged: 1.8,
            charger: 2.0,
            elite: 2.2,
            boss: 4.0,
            giantZombie: 4.5,
            zombieKing: 4.0,
            hellDog: 3.5,
            exploder: 1.6,
            splitter: 1.5,
            shield: 2.0,
            healer: 1.7
        };
        const scale = scales[enemy.type] || 1.8;

        this.ctx.save();

        // Boss aura effect - BIG and MENACING
        if (enemy.isBoss) {
            const time = Date.now() / 1000;
            const pulseSize = 1 + Math.sin(time * 2) * 0.15;
            const auraRadius = enemy.radius * 2.5 * pulseSize;

            // Outer glow
            const gradient = this.ctx.createRadialGradient(
                screen.x, screen.y, enemy.radius,
                screen.x, screen.y, auraRadius
            );

            const bossColors = {
                giantZombie: ['rgba(255, 100, 0, 0.6)', 'rgba(255, 50, 0, 0)'],
                zombieKing: ['rgba(150, 0, 255, 0.6)', 'rgba(100, 0, 200, 0)'],
                hellDog: ['rgba(255, 50, 50, 0.6)', 'rgba(200, 0, 0, 0)']
            };
            const colors = bossColors[enemy.type] || ['rgba(255, 0, 0, 0.5)', 'rgba(255, 0, 0, 0)'];

            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(1, colors[1]);

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(screen.x, screen.y, auraRadius, 0, Math.PI * 2);
            this.ctx.fill();

            // Boss name indicator
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 12px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = colors[0].replace('0.6', '1');
            this.ctx.shadowBlur = 10;
            const bossNames = {
                giantZombie: 'GIANT',
                zombieKing: 'KING',
                hellDog: 'HELL'
            };
            this.ctx.fillText(bossNames[enemy.type] || 'BOSS', screen.x, screen.y - enemy.radius - 20);
            this.ctx.shadowBlur = 0;
        }

        // Damage flash effect
        if (hpRatio < 0.3) {
            this.ctx.globalAlpha = 0.7 + Math.sin(Date.now() / 100) * 0.3;
        }

        // Frozen effect
        if (enemy.frozen) {
            this.ctx.filter = 'hue-rotate(180deg) saturate(0.5)';
        }

        // Draw the sprite
        drawPixelSprite(this.ctx, sprite, palette, screen.x, screen.y, scale);

        // HP bar for enemies with less than full health
        if (hpRatio < 1) {
            const barWidth = enemy.radius * 2;
            const barHeight = 4;
            const barY = screen.y - enemy.radius - 10;

            // Background
            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(screen.x - barWidth / 2, barY, barWidth, barHeight);

            // HP fill
            this.ctx.fillStyle = hpRatio > 0.5 ? '#0f0' : hpRatio > 0.25 ? '#ff0' : '#f00';
            this.ctx.fillRect(screen.x - barWidth / 2, barY, barWidth * hpRatio, barHeight);
        }

        this.ctx.restore();
    }

    drawBullet(bullet, camera) {
        const screen = camera.worldToScreen(bullet.x, bullet.y);

        if (bullet.isEnemyBullet) {
            this.ctx.fillStyle = '#ff4400';
            this.ctx.fillRect(screen.x - 4, screen.y - 4, 8, 8);
        } else {
            // Bigger arrow with glow
            const angle = Math.atan2(bullet.vy, bullet.vx);
            this.ctx.save();
            this.ctx.translate(screen.x, screen.y);
            this.ctx.rotate(angle);

            // Glow effect
            this.ctx.shadowColor = '#ffaa00';
            this.ctx.shadowBlur = 8;

            // Arrow shaft
            this.ctx.strokeStyle = '#8B4513';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(-15, 0);
            this.ctx.lineTo(12, 0);
            this.ctx.stroke();

            // Arrow head
            this.ctx.fillStyle = '#ddd';
            this.ctx.beginPath();
            this.ctx.moveTo(18, 0);
            this.ctx.lineTo(10, -5);
            this.ctx.lineTo(10, 5);
            this.ctx.closePath();
            this.ctx.fill();

            // Feathers
            this.ctx.fillStyle = '#ff4444';
            this.ctx.beginPath();
            this.ctx.moveTo(-12, 0);
            this.ctx.lineTo(-18, -6);
            this.ctx.lineTo(-14, 0);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.moveTo(-12, 0);
            this.ctx.lineTo(-18, 6);
            this.ctx.lineTo(-14, 0);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.restore();
        }
    }

    drawPickup(pickup, camera) {
        const screen = camera.worldToScreen(pickup.x, pickup.y);

        if (pickup.type === 'exp') {
            this.ctx.fillStyle = '#ff0';
            this.ctx.fillRect(screen.x - 3, screen.y - 3, 6, 6);
        } else if (pickup.type === 'gold') {
            // Gold coin
            this.ctx.save();
            this.ctx.fillStyle = '#ffd700';
            this.ctx.shadowColor = '#ffd700';
            this.ctx.shadowBlur = 5;
            this.ctx.beginPath();
            this.ctx.arc(screen.x, screen.y, 6, 0, Math.PI * 2);
            this.ctx.fill();
            // Inner circle
            this.ctx.fillStyle = '#ffaa00';
            this.ctx.beginPath();
            this.ctx.arc(screen.x, screen.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        } else {
            // Health
            this.ctx.fillStyle = '#0f4';
            this.ctx.fillRect(screen.x - 2, screen.y - 5, 4, 10);
            this.ctx.fillRect(screen.x - 5, screen.y - 2, 10, 4);
        }
    }

    getBounds() {
        return {
            left: 0,
            right: this.width,
            top: 0,
            bottom: this.height
        };
    }

    drawClickIndicators(indicators, camera) {
        for (const indicator of indicators) {
            const screen = camera.worldToScreen(indicator.x, indicator.y);
            const progress = indicator.time / indicator.maxTime;
            const alpha = 1 - progress;

            this.ctx.save();
            this.ctx.globalAlpha = alpha;

            if (indicator.type === 'move') {
                // Green move indicator (LoL style)
                const size = 15 + progress * 10;
                this.ctx.strokeStyle = '#00ff00';
                this.ctx.lineWidth = 2;

                // Outer circle
                this.ctx.beginPath();
                this.ctx.arc(screen.x, screen.y, size, 0, Math.PI * 2);
                this.ctx.stroke();

                // Inner cross
                this.ctx.beginPath();
                this.ctx.moveTo(screen.x - 5, screen.y);
                this.ctx.lineTo(screen.x + 5, screen.y);
                this.ctx.moveTo(screen.x, screen.y - 5);
                this.ctx.lineTo(screen.x, screen.y + 5);
                this.ctx.stroke();

            } else if (indicator.type === 'attack') {
                // Red attack indicator
                const size = 12 + progress * 8;
                this.ctx.strokeStyle = '#ff4444';
                this.ctx.lineWidth = 2;

                // X mark
                this.ctx.beginPath();
                this.ctx.moveTo(screen.x - size / 2, screen.y - size / 2);
                this.ctx.lineTo(screen.x + size / 2, screen.y + size / 2);
                this.ctx.moveTo(screen.x + size / 2, screen.y - size / 2);
                this.ctx.lineTo(screen.x - size / 2, screen.y + size / 2);
                this.ctx.stroke();

            } else if (indicator.type === 'ultimate') {
                // Ultimate area indicator
                const radius = indicator.radius || 100;
                const pulseRadius = radius * (0.5 + progress * 0.5);

                // Fill
                this.ctx.fillStyle = `rgba(255, 200, 0, ${alpha * 0.3})`;
                this.ctx.beginPath();
                this.ctx.arc(screen.x, screen.y, pulseRadius, 0, Math.PI * 2);
                this.ctx.fill();

                // Border
                this.ctx.strokeStyle = '#ffcc00';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
            }

            this.ctx.restore();
        }
    }

    drawAttackModeRange(player, camera) {
        const screen = camera.worldToScreen(player.x, player.y);
        const range = player.attackRange;

        // Draw attack range circle (more visible in attack mode)
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 100, 100, 0.6)';
        this.ctx.fillStyle = 'rgba(255, 100, 100, 0.1)';
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        this.ctx.arc(screen.x, screen.y, range, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawLightningBolt(x1, y1, x2, y2, alpha) {
        const segments = 6;
        const jitter = 15;

        this.ctx.save();
        this.ctx.strokeStyle = `rgba(255, 255, 100, ${alpha})`;
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = '#ffff00';
        this.ctx.shadowBlur = 15;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);

        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const midX = x1 + (x2 - x1) * t + (Math.random() - 0.5) * jitter * 2;
            const midY = y1 + (y2 - y1) * t + (Math.random() - 0.5) * jitter * 2;
            this.ctx.lineTo(midX, midY);
        }
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();

        // Inner bright core
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);

        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const midX = x1 + (x2 - x1) * t + (Math.random() - 0.5) * jitter;
            const midY = y1 + (y2 - y1) * t + (Math.random() - 0.5) * jitter;
            this.ctx.lineTo(midX, midY);
        }
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawSkillCooldowns(cooldowns, skillSystem) {
        const slots = ['Q', 'W', 'E', 'R'];
        const slotColors = {
            Q: '#ff8800',
            W: '#00aaff',
            E: '#00ff88',
            R: '#ff4400'
        };

        const size = 55;
        const gap = 8;
        const totalWidth = slots.length * size + (slots.length - 1) * gap;
        const startX = (this.width - totalWidth) / 2;
        const startY = this.height - 75;

        for (let i = 0; i < slots.length; i++) {
            const key = slots[i];
            const isUnlocked = skillSystem.isSlotUnlocked(key);
            const cooldown = cooldowns[key];
            const x = startX + i * (size + gap);
            const y = startY;
            const color = slotColors[key];

            this.ctx.save();

            // Glow effect for available skills
            if (isUnlocked && cooldown <= 0) {
                this.ctx.shadowColor = color;
                this.ctx.shadowBlur = 10;
            }

            // Background
            this.ctx.fillStyle = isUnlocked ? 'rgba(30, 30, 50, 0.95)' : 'rgba(20, 20, 30, 0.6)';
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, size, size, 8);
            this.ctx.fill();

            // Border with slot color
            this.ctx.strokeStyle = isUnlocked ? (cooldown <= 0 ? color : '#666688') : '#333344';
            this.ctx.lineWidth = isUnlocked && cooldown <= 0 ? 3 : 2;
            this.ctx.stroke();

            this.ctx.shadowBlur = 0;

            // Key label
            this.ctx.fillStyle = isUnlocked ? (cooldown <= 0 ? '#ffffff' : '#888888') : '#444444';
            this.ctx.font = 'bold 24px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(key, x + size / 2, y + size / 2);

            // Cooldown overlay
            if (cooldown > 0 && isUnlocked) {
                // Dark overlay
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
                this.ctx.beginPath();
                this.ctx.roundRect(x, y, size, size, 8);
                this.ctx.fill();

                // Cooldown number
                this.ctx.fillStyle = '#ffff00';
                this.ctx.font = 'bold 22px monospace';
                this.ctx.fillText(Math.ceil(cooldown).toString(), x + size / 2, y + size / 2);
            }

            // "Not acquired" indicator
            if (!isUnlocked) {
                this.ctx.fillStyle = '#666666';
                this.ctx.font = '10px monospace';
                this.ctx.fillText('---', x + size / 2, y + size - 8);
            }

            this.ctx.restore();
        }
    }
}
