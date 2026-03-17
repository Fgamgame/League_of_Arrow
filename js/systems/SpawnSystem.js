// SpawnSystem - Optimized enemy spawning just outside screen

import { Enemy } from '../entities/Enemy.js';
import { Bullet } from '../entities/Bullet.js';
import { soundManager } from './SoundManager.js';

export class SpawnSystem {
    constructor(game) {
        this.game = game;

        this.spawnTimer = 0;
        this.baseSpawnRate = 0.5;
        this.spawnMargin = 80; // Just outside screen edge

        this.difficulty = 1;
        this.difficultyTimer = 0;
        this.difficultyIncreaseRate = 30;

        this.maxEnemies = 40; // Reduced for performance

        this.bossTimer = 0;
        this.bossInterval = 120;

        // Kill-based boss spawning
        this.killsForNextBoss = 50;
        this.bossKillIncrement = 30;
        this.currentBoss = null;

        // Boss warning system
        this.bossWarningActive = false;
        this.bossWarningTimer = 0;
        this.bossWarningDuration = 3;
        this.pendingBossType = null;
    }

    reset() {
        this.spawnTimer = 0;
        this.difficulty = 1;
        this.difficultyTimer = 0;
        this.bossTimer = 0;
        this.killsForNextBoss = 50;
        this.currentBoss = null;
        this.bossWarningActive = false;
        this.bossWarningTimer = 0;
        this.pendingBossType = null;
    }

    update(deltaTime) {
        if (!this.game.player) return;

        // Update difficulty
        this.difficultyTimer += deltaTime;
        if (this.difficultyTimer >= this.difficultyIncreaseRate) {
            this.difficultyTimer = 0;
            this.difficulty += 0.2;
        }

        // Boss warning phase
        if (this.bossWarningActive) {
            this.bossWarningTimer += deltaTime;

            // Periodic shake during warning (subtle)
            if (Math.floor(this.bossWarningTimer * 2) !== Math.floor((this.bossWarningTimer - deltaTime) * 2)) {
                this.game.effects.shake(2, 0.05);
            }

            if (this.bossWarningTimer >= this.bossWarningDuration) {
                this.bossWarningActive = false;
                this.bossWarningTimer = 0;
                this.actuallySpawnBoss();
            }
            return; // Don't spawn regular enemies during warning
        }

        // Boss spawns based on kill count (not timer)
        if (!this.currentBoss && !this.bossWarningActive && this.game.kills >= this.killsForNextBoss) {
            this.startBossWarning();
            this.killsForNextBoss += this.bossKillIncrement;
        }

        // Check if current boss is dead
        if (this.currentBoss && !this.currentBoss.active) {
            this.game.onBossKilled(this.currentBoss);
            this.currentBoss = null;
        }

        // Update boss attacks
        if (this.currentBoss && this.currentBoss.active) {
            this.updateBossAttacks(deltaTime);
        }

        // Check enemy limit
        if (this.game.enemies.length >= this.maxEnemies) return;

        // Spawn rate scales with difficulty
        const spawnRate = this.baseSpawnRate / this.difficulty;

        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= spawnRate) {
            this.spawnTimer = 0;
            this.spawnEnemy();
        }
    }

    startBossWarning() {
        this.bossWarningActive = true;
        this.bossWarningTimer = 0;

        // Select boss type
        const bossTypes = ['giantZombie', 'zombieKing', 'hellDog'];
        this.pendingBossType = bossTypes[Math.floor(Math.random() * bossTypes.length)];

        // Boss names for announcement
        const bossNames = {
            giantZombie: 'GIANT ZOMBIE',
            zombieKing: 'ZOMBIE KING',
            hellDog: 'HELL DOG'
        };

        // Warning announcement
        this.game.effects.announce('WARNING!', '#ff0000', 1.5);
        this.game.effects.flash('#ff0000', 0.3);
        soundManager.playBossAppear();

        // Second announcement with boss name
        setTimeout(() => {
            if (this.bossWarningActive) {
                this.game.effects.announce(bossNames[this.pendingBossType] + ' INCOMING!', '#ff4400', 1.5);
            }
        }, 1500);
    }

    spawnEnemy() {
        const player = this.game.player;
        const camera = this.game.camera;
        if (!player || !camera) return;

        // Spawn just outside visible screen
        const side = Math.floor(Math.random() * 4);
        let x, y;
        const margin = this.spawnMargin;

        switch (side) {
            case 0: // Top
                x = camera.x + Math.random() * camera.screenWidth;
                y = camera.y - margin;
                break;
            case 1: // Right
                x = camera.x + camera.screenWidth + margin;
                y = camera.y + Math.random() * camera.screenHeight;
                break;
            case 2: // Bottom
                x = camera.x + Math.random() * camera.screenWidth;
                y = camera.y + camera.screenHeight + margin;
                break;
            case 3: // Left
                x = camera.x - margin;
                y = camera.y + Math.random() * camera.screenHeight;
                break;
        }

        // Select enemy type based on difficulty
        const type = this.selectEnemyType();
        const config = this.getEnemyConfig(type);

        // Scale stats with difficulty
        config.hp = Math.floor(config.hp * (1 + (this.difficulty - 1) * 0.3));
        config.damage = Math.floor(config.damage * (1 + (this.difficulty - 1) * 0.2));

        this.game.enemies.push(new Enemy(x, y, config));
    }

    selectEnemyType() {
        const rand = Math.random();
        const diff = this.difficulty;

        // Early game: basic enemies
        if (diff < 2) {
            if (rand < 0.6) return 'melee';
            if (rand < 0.85) return 'ranged';
            return 'charger';
        }

        // Mid game: introduce special enemies
        if (diff < 4) {
            if (rand < 0.35) return 'melee';
            if (rand < 0.5) return 'ranged';
            if (rand < 0.65) return 'charger';
            if (rand < 0.8) return 'exploder';
            if (rand < 0.9) return 'splitter';
            return 'shield';
        }

        // Late game: full variety including healers
        if (rand < 0.25) return 'melee';
        if (rand < 0.4) return 'ranged';
        if (rand < 0.5) return 'charger';
        if (rand < 0.6) return 'elite';
        if (rand < 0.7) return 'exploder';
        if (rand < 0.8) return 'splitter';
        if (rand < 0.9) return 'shield';
        return 'healer';
    }

    getEnemyConfig(type) {
        const configs = {
            melee: {
                type: 'melee',
                hp: 20,
                maxHp: 20,
                damage: 10,
                speed: 80,
                radius: 12,
                expValue: 1
            },
            ranged: {
                type: 'ranged',
                hp: 15,
                maxHp: 15,
                damage: 8,
                speed: 60,
                radius: 10,
                expValue: 2,
                attackRate: 1.5
            },
            charger: {
                type: 'charger',
                hp: 25,
                maxHp: 25,
                damage: 15,
                speed: 120,
                radius: 14,
                expValue: 2
            },
            elite: {
                type: 'elite',
                hp: 80,
                maxHp: 80,
                damage: 20,
                speed: 70,
                radius: 18,
                expValue: 5
            },
            exploder: {
                type: 'exploder',
                hp: 15,
                maxHp: 15,
                damage: 8,
                speed: 100,
                radius: 12,
                expValue: 2,
                explosionRadius: 80,
                explosionDamage: 20
            },
            splitter: {
                type: 'splitter',
                hp: 30,
                maxHp: 30,
                damage: 10,
                speed: 60,
                radius: 14,
                expValue: 3,
                splitCount: 2
            },
            shield: {
                type: 'shield',
                hp: 50,
                maxHp: 50,
                damage: 15,
                speed: 50,
                radius: 16,
                expValue: 4,
                shieldReduction: 0.7
            },
            healer: {
                type: 'healer',
                hp: 25,
                maxHp: 25,
                damage: 5,
                speed: 40,
                radius: 12,
                expValue: 5,
                healRange: 150,
                healAmount: 5,
                healRate: 2
            }
        };

        return { ...configs[type] } || { ...configs.melee };
    }

    actuallySpawnBoss() {
        const player = this.game.player;
        const camera = this.game.camera;
        if (!player || !camera) return;

        const bossType = this.pendingBossType || 'giantZombie';

        // Spawn boss just outside screen
        const side = Math.floor(Math.random() * 4);
        let x, y;

        switch (side) {
            case 0: x = camera.x + camera.screenWidth / 2; y = camera.y - 100; break;
            case 1: x = camera.x + camera.screenWidth + 100; y = camera.y + camera.screenHeight / 2; break;
            case 2: x = camera.x + camera.screenWidth / 2; y = camera.y + camera.screenHeight + 100; break;
            case 3: x = camera.x - 100; y = camera.y + camera.screenHeight / 2; break;
        }

        // Boss configurations with attack patterns - MASSIVE AND TERRIFYING!
        const bossConfigs = {
            giantZombie: {
                type: 'giantZombie',
                hp: 3000,
                maxHp: 3000,
                damage: 40,
                speed: 30,
                radius: 60,
                expValue: 25,
                isBoss: true,
                attackPattern: 'groundPound',
                attackCooldown: 3,
                attackTimer: 0
            },
            zombieKing: {
                type: 'zombieKing',
                hp: 2500,
                maxHp: 2500,
                damage: 35,
                speed: 40,
                radius: 55,
                expValue: 30,
                isBoss: true,
                attackPattern: 'summon',
                attackCooldown: 4,
                attackTimer: 0
            },
            hellDog: {
                type: 'hellDog',
                hp: 2000,
                maxHp: 2000,
                damage: 50,
                speed: 70,
                radius: 50,
                expValue: 25,
                isBoss: true,
                attackPattern: 'fireball',
                attackCooldown: 1.5,
                attackTimer: 0
            }
        };

        const config = { ...bossConfigs[bossType] };

        // Boss scales with player level AND difficulty
        const playerLevel = this.game.levelSystem.level || 1;
        const levelMultiplier = 1 + (playerLevel - 1) * 0.5; // +50% HP per level
        const difficultyMultiplier = 1 + (this.difficulty - 1) * 0.3;

        config.hp = Math.floor(config.hp * levelMultiplier * difficultyMultiplier);
        config.maxHp = config.hp;
        config.damage = Math.floor(config.damage * (1 + (playerLevel - 1) * 0.2)); // +20% damage per level

        const boss = new Enemy(x, y, config);
        this.game.enemies.push(boss);
        this.currentBoss = boss;

        // Epic entrance effects
        this.game.effects.shakeEpic();
        this.game.effects.slowMotion(0.3, 0.5);
        this.game.effects.flash('#ff0000', 0.3);

        const bossNames = {
            giantZombie: 'GIANT ZOMBIE',
            zombieKing: 'ZOMBIE KING',
            hellDog: 'HELL DOG'
        };
        this.game.effects.announce(bossNames[bossType], '#ff0000', 2.0);
    }

    // Legacy method name for compatibility
    spawnBoss() {
        this.startBossWarning();
    }

    updateBossAttacks(deltaTime) {
        const boss = this.currentBoss;
        if (!boss || !boss.active) return;

        boss.attackTimer = (boss.attackTimer || 0) + deltaTime;

        if (boss.attackTimer >= (boss.attackCooldown || 3)) {
            boss.attackTimer = 0;
            this.executeBossAttack(boss);
        }
    }

    executeBossAttack(boss) {
        const player = this.game.player;
        if (!player) return;

        switch (boss.attackPattern) {
            case 'groundPound':
                this.bossGroundPound(boss);
                break;
            case 'summon':
                this.bossSummon(boss);
                break;
            case 'fireball':
                this.bossFireball(boss);
                break;
        }
    }

    bossGroundPound(boss) {
        // Ground pound: MASSIVE AOE damage around boss
        const radius = 250;
        const damage = boss.damage * 2;
        const player = this.game.player;

        const dx = player.x - boss.x;
        const dy = player.y - boss.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius) {
            this.game.onPlayerHit(damage);
        }

        // Visual effect
        this.game.novaEffects.push({
            x: boss.x, y: boss.y, radius: 0, maxRadius: radius,
            time: 0, maxTime: 0.4, color: '#ff4400'
        });
        this.game.effects.shakeLarge();
        soundManager.playSkillR();
    }

    bossSummon(boss) {
        // Summon a HORDE of minions around boss
        const summonCount = 5 + Math.floor(this.difficulty);

        for (let i = 0; i < summonCount; i++) {
            const angle = (Math.PI * 2 / summonCount) * i;
            const dist = 60;
            const x = boss.x + Math.cos(angle) * dist;
            const y = boss.y + Math.sin(angle) * dist;

            const config = this.getEnemyConfig('melee');
            config.hp = Math.floor(config.hp * 0.5);
            config.maxHp = config.hp;
            this.game.enemies.push(new Enemy(x, y, config));
        }

        // Visual effect
        this.game.effects.flash('#8800ff', 0.2);
        this.game.effects.announce('SUMMON!', '#8800ff', 0.8);
    }

    bossFireball(boss) {
        // Fire a BARRAGE of projectiles toward player
        const player = this.game.player;
        const baseAngle = Math.atan2(player.y - boss.y, player.x - boss.x);
        const projectileCount = 8;
        const spread = 0.8;

        for (let i = 0; i < projectileCount; i++) {
            const angle = baseAngle + (i - (projectileCount - 1) / 2) * spread / (projectileCount - 1);
            const speed = 300;

            // Create enemy bullet
            this.game.bullets.push(new Bullet(
                boss.x + Math.cos(angle) * 30,
                boss.y + Math.sin(angle) * 30,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                boss.damage,
                true // isEnemy
            ));
        }

        this.game.effects.flash('#ff4400', 0.1);
    }

    getCurrentBoss() {
        return this.currentBoss;
    }
}
