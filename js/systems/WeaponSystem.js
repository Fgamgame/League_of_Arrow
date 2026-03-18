// WeaponSystem - Manages orbital weapons around player

export class WeaponSystem {
    constructor(game) {
        this.game = game;

        // Active weapons
        this.orbitingShields = 0;
        this.fireOrbs = 0;
        this.lightningRing = 0;
        this.poisonCloud = 0;
        this.boomerang = 0;
        this.shockwave = 0;
        this.auraBlade = 0;

        // Weapon state
        this.shieldAngle = 0;
        this.orbAngle = 0;
        this.lightningTimer = 0;
        this.lightningActive = false;
        this.lightningRadius = 0;
        this.lightningStrikes = []; // Store lightning bolt positions
        this.poisonTimer = 0;
        this.boomerangAngle = 0;
        this.boomerangOut = false;
        this.boomerangDist = 0;
        this.shockwaveTimer = 0;
        this.shockwaveActive = false;
        this.shockwaveRadius = 0;
        this.auraBladeTimer = 0;
        this.auraBladeActive = false;
        this.auraBladeRadius = 0;
    }

    reset() {
        this.orbitingShields = 0;
        this.fireOrbs = 0;
        this.lightningRing = 0;
        this.poisonCloud = 0;
        this.boomerang = 0;
        this.shockwave = 0;
        this.auraBlade = 0;
        this.shieldAngle = 0;
        this.orbAngle = 0;
        this.lightningTimer = 0;
        this.lightningActive = false;
        this.lightningRadius = 0;
        this.lightningStrikes = [];
        this.shockwaveTimer = 0;
        this.shockwaveActive = false;
        this.shockwaveRadius = 0;
        this.auraBladeTimer = 0;
        this.auraBladeActive = false;
        this.auraBladeRadius = 0;
    }

    addWeapon(type) {
        switch (type) {
            case 'shield': this.orbitingShields++; break;
            case 'fireOrb': this.fireOrbs++; break;
            case 'lightning': this.lightningRing++; break;
            case 'poison': this.poisonCloud++; break;
            case 'boomerang': this.boomerang++; break;
            case 'shockwave': this.shockwave++; break;
            case 'auraBlade': this.auraBlade++; break;
        }
    }

    update(deltaTime) {
        const player = this.game.player;
        if (!player) return;

        // Rotate shields
        this.shieldAngle += deltaTime * 2;

        // Rotate orbs faster
        this.orbAngle += deltaTime * 3;

        // Boomerang rotation
        this.boomerangAngle += deltaTime * 4;

        // Check collisions with enemies
        this.checkWeaponCollisions();

        // Lightning timer (4 second cooldown, -0.3s per level, min 2s)
        if (this.lightningRing > 0) {
            this.lightningTimer += deltaTime;
            const cooldown = Math.max(2, 4 - this.lightningRing * 0.3);
            if (this.lightningTimer >= cooldown) {
                this.lightningTimer = 0;
                this.triggerLightning();
            }

            // Update lightning animation
            if (this.lightningActive) {
                this.lightningRadius += deltaTime * 600;
                const maxRadius = 200 + this.lightningRing * 30;
                if (this.lightningRadius >= maxRadius) {
                    this.lightningActive = false;
                    this.lightningRadius = 0;
                    this.lightningStrikes = [];
                }
            }
        }

        // Poison timer (1 second tick)
        if (this.poisonCloud > 0) {
            this.poisonTimer += deltaTime;
            if (this.poisonTimer >= 1.0) {
                this.poisonTimer = 0;
                this.triggerPoison();
            }
        }

        // Shockwave timer (8 second cooldown, -0.5s per level, min 5s)
        if (this.shockwave > 0) {
            this.shockwaveTimer += deltaTime;
            const cooldown = Math.max(5, 8 - this.shockwave * 0.5);
            if (this.shockwaveTimer >= cooldown) {
                this.shockwaveTimer = 0;
                this.triggerShockwave();
            }

            // Update shockwave animation
            if (this.shockwaveActive) {
                this.shockwaveRadius += deltaTime * 400;
                if (this.shockwaveRadius >= 200 + this.shockwave * 30) {
                    this.shockwaveActive = false;
                    this.shockwaveRadius = 0;
                }
            }
        }

        // Aura Blade (3 second cooldown, -0.2s per level, min 1.5s)
        if (this.auraBlade > 0) {
            const cooldown = Math.max(1.5, 3 - this.auraBlade * 0.2);
            this.auraBladeTimer += deltaTime;
            if (this.auraBladeTimer >= cooldown) {
                this.auraBladeTimer = 0;
                this.triggerAuraBlade();
            }

            // Update aura blade animation
            if (this.auraBladeActive) {
                this.auraBladeRadius += deltaTime * 500;
                const maxRadius = 200 + this.auraBlade * 30;
                if (this.auraBladeRadius >= maxRadius) {
                    this.auraBladeActive = false;
                    this.auraBladeRadius = 0;
                }
            }
        }
    }

    checkWeaponCollisions() {
        const player = this.game.player;
        const enemies = this.game.enemies;
        const baseDamage = player.damage;

        // Shield collision (damage: 0.5x + 0.2x per level)
        if (this.orbitingShields > 0) {
            const shieldRadius = 120 + this.orbitingShields * 30;
            const shieldSize = 20;
            const shieldDamage = baseDamage * (0.5 + this.orbitingShields * 0.2);

            for (let i = 0; i < this.orbitingShields; i++) {
                const angle = this.shieldAngle + (Math.PI * 2 * i / Math.max(1, this.orbitingShields));
                const sx = player.x + Math.cos(angle) * shieldRadius;
                const sy = player.y + Math.sin(angle) * shieldRadius;

                for (const enemy of enemies) {
                    if (!enemy.active || enemy.weaponHitCooldown > 0) continue;
                    const dx = enemy.x - sx;
                    const dy = enemy.y - sy;
                    if (dx * dx + dy * dy < (shieldSize + enemy.radius) ** 2) {
                        enemy.takeDamage(shieldDamage);
                        enemy.weaponHitCooldown = 0.5;
                        if (enemy.hp <= 0) this.game.onEnemyKilled(enemy);
                    }
                }
            }
        }

        // Fire orb collision (damage: 0.3x + 0.15x per level)
        if (this.fireOrbs > 0) {
            const orbRadius = 150 + this.fireOrbs * 40;
            const orbSize = 15;
            const orbDamage = baseDamage * (0.3 + this.fireOrbs * 0.15);

            for (let i = 0; i < this.fireOrbs * 2; i++) {
                const angle = this.orbAngle + (Math.PI * 2 * i / (this.fireOrbs * 2));
                const ox = player.x + Math.cos(angle) * orbRadius;
                const oy = player.y + Math.sin(angle) * orbRadius;

                for (const enemy of enemies) {
                    if (!enemy.active || enemy.weaponHitCooldown > 0) continue;
                    const dx = enemy.x - ox;
                    const dy = enemy.y - oy;
                    if (dx * dx + dy * dy < (orbSize + enemy.radius) ** 2) {
                        enemy.takeDamage(orbDamage);
                        enemy.weaponHitCooldown = 0.4;
                        if (enemy.hp <= 0) this.game.onEnemyKilled(enemy);
                    }
                }
            }
        }

        // Boomerang collision (damage: 0.6x + 0.3x per level)
        if (this.boomerang > 0) {
            const boomRadius = 180 + this.boomerang * 50;
            const boomSize = 18;
            const boomDamage = baseDamage * (0.6 + this.boomerang * 0.3);

            for (let i = 0; i < this.boomerang; i++) {
                const angle = this.boomerangAngle + (Math.PI * 2 * i / this.boomerang);
                const bx = player.x + Math.cos(angle) * boomRadius;
                const by = player.y + Math.sin(angle) * boomRadius;

                for (const enemy of enemies) {
                    if (!enemy.active || enemy.weaponHitCooldown > 0) continue;
                    const dx = enemy.x - bx;
                    const dy = enemy.y - by;
                    if (dx * dx + dy * dy < (boomSize + enemy.radius) ** 2) {
                        enemy.takeDamage(boomDamage);
                        enemy.weaponHitCooldown = 0.5;
                        if (enemy.hp <= 0) this.game.onEnemyKilled(enemy);
                    }
                }
            }
        }
    }

    triggerLightning() {
        const player = this.game.player;
        const enemies = this.game.enemies;
        const range = 200 + this.lightningRing * 30;
        const damage = player.damage * (0.8 + this.lightningRing * 0.3);

        // Start animation
        this.lightningActive = true;
        this.lightningRadius = 0;
        this.lightningStrikes = [];

        for (const enemy of enemies) {
            if (!enemy.active) continue;
            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < range * range) {
                enemy.takeDamage(damage);
                this.game.addDamageNumber(enemy.x, enemy.y - 10, Math.floor(damage), false);
                // Store strike position for visual
                this.lightningStrikes.push({ x: enemy.x, y: enemy.y });
                if (enemy.hp <= 0) this.game.onEnemyKilled(enemy);
            }
        }

        // Screen effect
        if (this.lightningStrikes.length > 0) {
            this.game.effects.flash('#ffff88', 0.15);
            this.game.effects.shakeSmall();
        }
    }

    triggerPoison() {
        const player = this.game.player;
        const enemies = this.game.enemies;
        const range = 100 + this.poisonCloud * 25;
        const damage = player.damage * (0.1 + this.poisonCloud * 0.08);

        for (const enemy of enemies) {
            if (!enemy.active) continue;
            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            if (dx * dx + dy * dy < range * range) {
                enemy.takeDamage(damage);
                if (enemy.hp <= 0) this.game.onEnemyKilled(enemy);
            }
        }
    }

    triggerShockwave() {
        const player = this.game.player;
        const enemies = this.game.enemies;
        const range = 200 + this.shockwave * 30;
        const damage = player.damage * (0.8 + this.shockwave * 0.4);

        this.shockwaveActive = true;
        this.shockwaveRadius = 0;

        for (const enemy of enemies) {
            if (!enemy.active) continue;
            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            if (dx * dx + dy * dy < range * range) {
                enemy.takeDamage(damage);
                if (enemy.hp <= 0) this.game.onEnemyKilled(enemy);
            }
        }
    }

    triggerAuraBlade() {
        const player = this.game.player;
        const enemies = this.game.enemies;
        const range = 200 + this.auraBlade * 30;
        const damage = player.damage * (0.5 + this.auraBlade * 0.2);

        this.auraBladeActive = true;
        this.auraBladeRadius = 0;

        for (const enemy of enemies) {
            if (!enemy.active) continue;
            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < range * range) {
                // Damage falloff based on distance
                const dist = Math.sqrt(distSq);
                const falloff = 1 - (dist / range) * 0.3;
                const actualDamage = damage * falloff;
                enemy.takeDamage(actualDamage);
                this.game.addDamageNumber(enemy.x, enemy.y - 10, Math.floor(actualDamage), false);
                if (enemy.hp <= 0) this.game.onEnemyKilled(enemy);
            }
        }
    }

    // Get weapon data for rendering
    getWeaponData() {
        return {
            shields: this.orbitingShields,
            shieldAngle: this.shieldAngle,
            shieldRadius: 120 + this.orbitingShields * 30,
            fireOrbs: this.fireOrbs,
            orbAngle: this.orbAngle,
            orbRadius: 150 + this.fireOrbs * 40,
            lightning: this.lightningRing,
            lightningRadius: 200 + this.lightningRing * 30,
            lightningActive: this.lightningActive,
            lightningAnimRadius: this.lightningRadius,
            lightningStrikes: this.lightningStrikes,
            poison: this.poisonCloud,
            poisonRadius: 100 + this.poisonCloud * 25,
            boomerang: this.boomerang,
            boomerangAngle: this.boomerangAngle,
            boomerangRadius: 180 + this.boomerang * 50,
            shockwave: this.shockwave,
            shockwaveActive: this.shockwaveActive,
            shockwaveRadius: this.shockwaveRadius,
            shockwaveMaxRadius: 200 + this.shockwave * 30,
            auraBlade: this.auraBlade,
            auraBladeActive: this.auraBladeActive,
            auraBladeRadius: this.auraBladeRadius,
            auraBladeMaxRadius: 200 + this.auraBlade * 30
        };
    }
}
