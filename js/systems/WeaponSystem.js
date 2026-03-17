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

        // Lightning timer (3 second cooldown)
        if (this.lightningRing > 0) {
            this.lightningTimer += deltaTime;
            const cooldown = Math.max(1.5, 3 - this.lightningRing * 0.3);
            if (this.lightningTimer >= cooldown) {
                this.lightningTimer = 0;
                this.triggerLightning();
            }

            // Update lightning animation
            if (this.lightningActive) {
                this.lightningRadius += deltaTime * 800;
                const maxRadius = 250 + this.lightningRing * 50;
                if (this.lightningRadius >= maxRadius) {
                    this.lightningActive = false;
                    this.lightningRadius = 0;
                    this.lightningStrikes = [];
                }
            }
        }

        // Poison timer
        if (this.poisonCloud > 0) {
            this.poisonTimer += deltaTime;
            if (this.poisonTimer >= 0.5) {
                this.poisonTimer = 0;
                this.triggerPoison();
            }
        }

        // Shockwave timer (5 second cooldown)
        if (this.shockwave > 0) {
            this.shockwaveTimer += deltaTime;
            if (this.shockwaveTimer >= 5) {
                this.shockwaveTimer = 0;
                this.triggerShockwave();
            }

            // Update shockwave animation
            if (this.shockwaveActive) {
                this.shockwaveRadius += deltaTime * 600;
                if (this.shockwaveRadius >= 300 + this.shockwave * 50) {
                    this.shockwaveActive = false;
                    this.shockwaveRadius = 0;
                }
            }
        }

        // Aura Blade - wide area auto attack (1.5 second cooldown, faster with stacks)
        if (this.auraBlade > 0) {
            const cooldown = Math.max(0.5, 1.5 - this.auraBlade * 0.2);
            this.auraBladeTimer += deltaTime;
            if (this.auraBladeTimer >= cooldown) {
                this.auraBladeTimer = 0;
                this.triggerAuraBlade();
            }

            // Update aura blade animation
            if (this.auraBladeActive) {
                this.auraBladeRadius += deltaTime * 800;
                const maxRadius = 350 + this.auraBlade * 50;
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

        // Shield collision
        if (this.orbitingShields > 0) {
            const shieldRadius = 120 + this.orbitingShields * 30;
            const shieldSize = 20;

            for (let i = 0; i < this.orbitingShields; i++) {
                const angle = this.shieldAngle + (Math.PI * 2 * i / Math.max(1, this.orbitingShields));
                const sx = player.x + Math.cos(angle) * shieldRadius;
                const sy = player.y + Math.sin(angle) * shieldRadius;

                for (const enemy of enemies) {
                    if (!enemy.active || enemy.weaponHitCooldown > 0) continue;
                    const dx = enemy.x - sx;
                    const dy = enemy.y - sy;
                    if (dx * dx + dy * dy < (shieldSize + enemy.radius) ** 2) {
                        enemy.takeDamage(baseDamage * 2 * this.orbitingShields);
                        enemy.weaponHitCooldown = 0.3;
                        if (enemy.hp <= 0) this.game.onEnemyKilled(enemy);
                    }
                }
            }
        }

        // Fire orb collision
        if (this.fireOrbs > 0) {
            const orbRadius = 150 + this.fireOrbs * 40;
            const orbSize = 15;

            for (let i = 0; i < this.fireOrbs * 2; i++) {
                const angle = this.orbAngle + (Math.PI * 2 * i / (this.fireOrbs * 2));
                const ox = player.x + Math.cos(angle) * orbRadius;
                const oy = player.y + Math.sin(angle) * orbRadius;

                for (const enemy of enemies) {
                    if (!enemy.active || enemy.weaponHitCooldown > 0) continue;
                    const dx = enemy.x - ox;
                    const dy = enemy.y - oy;
                    if (dx * dx + dy * dy < (orbSize + enemy.radius) ** 2) {
                        enemy.takeDamage(baseDamage * 1.5 * this.fireOrbs);
                        enemy.weaponHitCooldown = 0.25;
                        if (enemy.hp <= 0) this.game.onEnemyKilled(enemy);
                    }
                }
            }
        }

        // Boomerang collision
        if (this.boomerang > 0) {
            const boomRadius = 180 + this.boomerang * 50;
            const boomSize = 18;

            for (let i = 0; i < this.boomerang; i++) {
                const angle = this.boomerangAngle + (Math.PI * 2 * i / this.boomerang);
                const bx = player.x + Math.cos(angle) * boomRadius;
                const by = player.y + Math.sin(angle) * boomRadius;

                for (const enemy of enemies) {
                    if (!enemy.active || enemy.weaponHitCooldown > 0) continue;
                    const dx = enemy.x - bx;
                    const dy = enemy.y - by;
                    if (dx * dx + dy * dy < (boomSize + enemy.radius) ** 2) {
                        enemy.takeDamage(baseDamage * 3 * this.boomerang);
                        enemy.weaponHitCooldown = 0.3;
                        if (enemy.hp <= 0) this.game.onEnemyKilled(enemy);
                    }
                }
            }
        }
    }

    triggerLightning() {
        const player = this.game.player;
        const enemies = this.game.enemies;
        const range = 250 + this.lightningRing * 50;
        const damage = player.damage * (2 + this.lightningRing * 1.0);

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
        const range = 150 + this.poisonCloud * 50;
        const damage = player.damage * 0.4 * this.poisonCloud;

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
        const range = 300 + this.shockwave * 50;
        const damage = player.damage * 2 * this.shockwave;

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
        const range = 350 + this.auraBlade * 50;
        const damage = player.damage * (1.5 + this.auraBlade * 0.5);

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
            lightningRadius: 250 + this.lightningRing * 50,
            lightningActive: this.lightningActive,
            lightningAnimRadius: this.lightningRadius,
            lightningStrikes: this.lightningStrikes,
            poison: this.poisonCloud,
            poisonRadius: 150 + this.poisonCloud * 50,
            boomerang: this.boomerang,
            boomerangAngle: this.boomerangAngle,
            boomerangRadius: 180 + this.boomerang * 50,
            shockwave: this.shockwave,
            shockwaveActive: this.shockwaveActive,
            shockwaveRadius: this.shockwaveRadius,
            shockwaveMaxRadius: 300 + this.shockwave * 50,
            auraBlade: this.auraBlade,
            auraBladeActive: this.auraBladeActive,
            auraBladeRadius: this.auraBladeRadius,
            auraBladeMaxRadius: 350 + this.auraBlade * 50
        };
    }
}
