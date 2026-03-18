// Game - Main game loop with camera scrolling and continuous spawning

import { Input } from './Input.js';
import { Renderer } from './Renderer.js';
import { Camera } from './Camera.js';
import { Player } from '../entities/Player.js';
import { Bullet } from '../entities/Bullet.js';
import { Pickup } from '../entities/Pickup.js';
import { Enemy } from '../entities/Enemy.js';
import { EnemyTypes, scaleEnemyStats } from '../entities/EnemyTypes.js';
import { LevelSystem } from '../systems/LevelSystem.js';
import { SkillSystem } from '../systems/SkillSystem.js';
import { SpawnSystem } from '../systems/SpawnSystem.js';
import { EquipmentSystem } from '../systems/EquipmentSystem.js';
import { WeaponSystem } from '../systems/WeaponSystem.js';
import { HUD } from '../ui/HUD.js';
import { SkillSelect } from '../ui/SkillSelect.js';
import { GameOver } from '../ui/GameOver.js';
import { Menu } from '../ui/Menu.js';
import { ParticleSystem } from '../utils/particles.js';
import {
    checkBulletEnemyCollisions,
    checkEnemyBulletPlayerCollisions,
    checkEnemyPlayerCollisions,
    checkPickupPlayerCollisions,
    findNearestEnemy
} from '../utils/collision.js';
import { formatTime } from '../utils/math.js';
import { soundManager } from '../systems/SoundManager.js';
import { GameEffects } from '../systems/GameEffects.js';
import { ComboSystem } from '../systems/ComboSystem.js';
import { PowerUpSystem } from '../systems/PowerUpSystem.js';
import { SkillIcons } from '../data/skills.js';

export const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    SHOP: 'shop',
    SKILL_SELECT: 'skill_select',
    SLOT_SELECT: 'slot_select',
    ACTIVE_SKILL_SELECT: 'active_skill_select',
    LEGENDARY_SELECT: 'legendary_select',
    WEAPON_SELECT: 'weapon_select',
    GAME_OVER: 'game_over'
};

export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.input = new Input();
        this.renderer = new Renderer(this.canvas);
        this.camera = new Camera(this.renderer.width, this.renderer.height);
        this.particles = new ParticleSystem();

        // Game state
        this.state = GameState.MENU;
        this.gameTime = 0;
        this.kills = 0;
        this.gold = 0;
        this.shopOpen = false;

        // Entities (optimized arrays)
        this.player = null;
        this.enemies = [];
        this.bullets = [];
        this.pickups = [];

        // Systems
        this.levelSystem = new LevelSystem(this);
        this.skillSystem = new SkillSystem(this);
        this.spawnSystem = new SpawnSystem(this);
        this.equipmentSystem = new EquipmentSystem(this);
        this.weaponSystem = new WeaponSystem(this);

        // UI
        this.hud = new HUD(this);
        this.skillSelect = new SkillSelect(this);
        this.gameOverUI = new GameOver(this);
        this.menu = new Menu(this);

        // Timing
        this.lastTime = 0;
        this.deltaTime = 0;

        // Damage numbers (lightweight)
        this.damageNumbers = [];

        // Boss HP UI
        this.bossHpContainer = document.getElementById('boss-hp-container');
        this.bossHpFill = document.getElementById('boss-hp-fill');
        this.bossName = document.getElementById('boss-name');

        // Legendary skill selection UI
        this.legendaryContainer = document.getElementById('legendary-select');
        this.legendaryOptions = document.getElementById('legendary-options');
        this.legendaryChoices = [];
        this.legendaryAnimating = false;

        // Slot selection UI
        this.slotSelectContainer = document.getElementById('slot-select');
        this.slotOptions = document.getElementById('slot-options');
        this.activeSkillSelectContainer = document.getElementById('active-skill-select');
        this.activeSkillOptions = document.getElementById('active-skill-options');
        this.activeSkillKeyLabel = document.getElementById('active-skill-key');
        this.selectedSlotKey = null;
        this.activeSkillChoices = [];
        this.slotSelectAnimating = false;

        // Initial weapon selection
        this.weaponChoices = [];
        this.weaponSelectAnimating = false;

        // Resize handler
        window.addEventListener('resize', () => {
            this.camera.resize(this.renderer.width, this.renderer.height);
        });

        // Click indicators
        this.clickIndicators = [];

        // Skill effects
        this.empowerBuff = { active: false, duration: 0, timer: 0 };
        this.novaEffects = [];
        this.meteorEffects = [];

        // Ultimate skill
        this.ultimateGauge = 0;
        this.ultimateMaxGauge = 50; // Kills needed
        this.ultimateReady = false;
        this.ultimateActive = false;
        this.ultimateTimer = 0;
        this.laserEffect = null;
        this.blackholeEffect = null;

        // Game feel systems
        this.effects = new GameEffects(this);
        this.combo = new ComboSystem(this);
        this.powerUps = new PowerUpSystem(this);

        // Start game loop
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    loop(timestamp) {
        this.deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        if (this.deltaTime > 0.1) this.deltaTime = 0.1;

        this.update();
        this.render();
        this.input.update();

        requestAnimationFrame(this.loop);
    }

    update() {
        switch (this.state) {
            case GameState.MENU:
                break;

            case GameState.PLAYING:
                this.updatePlaying();
                break;

            case GameState.PAUSED:
                if (this.input.isPausePressed()) {
                    this.resume();
                }
                break;

            case GameState.SHOP:
                if (this.input.isPausePressed() || this.input.isShopPressed()) {
                    this.closeShop();
                }
                break;

            case GameState.SKILL_SELECT:
                this.skillSelect.update();
                break;

            case GameState.SLOT_SELECT:
                this.updateSlotSelect();
                break;

            case GameState.ACTIVE_SKILL_SELECT:
                this.updateActiveSkillSelect();
                break;

            case GameState.LEGENDARY_SELECT:
                this.updateLegendarySelect();
                break;

            case GameState.WEAPON_SELECT:
                this.updateWeaponSelect();
                break;

            case GameState.GAME_OVER:
                break;
        }
    }

    updatePlaying() {
        if (this.input.isPausePressed()) {
            this.pause();
            return;
        }

        // Shop key (X or B)
        if (this.input.isShopPressed()) {
            this.openShop();
            return;
        }

        // Update effects system (always runs)
        this.effects.update(this.deltaTime);

        // Get modified delta time (for hit stop / slow motion)
        const dt = this.effects.getModifiedDeltaTime(this.deltaTime);

        // Skip gameplay updates during hit stop
        if (this.effects.isHitStopped()) {
            return;
        }

        this.gameTime += dt;

        // Update combo system
        this.combo.update(dt);

        // Update power-up system
        this.powerUps.update(dt);

        // Apply power-up effects to player
        if (this.player) {
            const speedMult = 1 + this.skillSystem.getBonus('speed');
            const powerUpSpeedMult = this.powerUps.getSpeedMultiplier();
            this.player.applySpeedBonus(speedMult * powerUpSpeedMult);

            const atkSpeedMult = 1 + this.skillSystem.getBonus('attackSpeed');
            const powerUpAtkSpeedMult = this.powerUps.getAttackSpeedMultiplier();
            this.player.applyAttackSpeedBonus(atkSpeedMult * powerUpAtkSpeedMult);
        }

        // Update player (infinite world - no bounds)
        if (this.player) {
            this.player.updateInfinite(dt, this.input);

            // Update camera to follow player
            this.camera.update(this.player.x, this.player.y);

            // Check if bow animation reached release point
            if (this.player.checkAndConsumeArrowFire()) {
                this.fireArrow();
            }

            // Handle click indicators
            this.handleClickIndicators();

            // Handle attack inputs (left click or A+click)
            this.handleAttackInput();

            // Handle active skill input (QWER)
            this.handleActiveSkillInput();

            // Handle ultimate skill (Space)
            this.handleUltimateInput();
        }

        // Update enemies
        const visibleBounds = this.camera.getWorldBounds(200);
        for (let i = 0; i < this.enemies.length; i++) {
            const enemy = this.enemies[i];
            enemy.update(dt, this.player);

            // Enemy attacks (ranged types)
            if ((enemy.type === 'cowboy' || enemy.type === 'ranged' || enemy.type === 'eliteRanged') && enemy.canAttack()) {
                this.enemyAttack(enemy);
            }

            // Healer: heal nearby enemies
            if (enemy.type === 'healer' && enemy.active) {
                enemy.healTimer = (enemy.healTimer || 0) + dt;
                if (enemy.healTimer >= (enemy.healRate || 2)) {
                    enemy.healTimer = 0;
                    const healRange = enemy.healRange || 150;
                    const healAmount = enemy.healAmount || 5;
                    for (const other of this.enemies) {
                        if (other === enemy || !other.active) continue;
                        const dx = other.x - enemy.x;
                        const dy = other.y - enemy.y;
                        if (dx * dx + dy * dy < healRange * healRange) {
                            other.hp = Math.min(other.maxHp, other.hp + healAmount);
                        }
                    }
                }
            }

            // Deactivate if outside screen + margin
            if (!this.camera.isVisible(enemy.x, enemy.y, 150)) {
                enemy.active = false;
            }
        }

        // Update bullets
        for (let i = 0; i < this.bullets.length; i++) {
            const bullet = this.bullets[i];
            bullet.updateInfinite(dt);

            // Deactivate if outside screen
            if (!this.camera.isVisible(bullet.x, bullet.y, 50)) {
                bullet.active = false;
            }
        }

        // Update pickups
        for (let i = 0; i < this.pickups.length; i++) {
            this.pickups[i].update(dt);
        }

        // Update particles
        this.particles.update();

        // Continuous spawning
        this.spawnSystem.update(dt);

        // Update orbital weapons
        this.weaponSystem.update(dt);

        // Check collisions
        this.checkCollisions();

        // Cleanup
        this.cleanup();

        // Update damage numbers
        this.updateDamageNumbers();

        // Update boss HP bar
        this.updateBossHPBar();

        // Update empower buff
        if (this.empowerBuff.active) {
            this.empowerBuff.timer -= dt;
            if (this.empowerBuff.timer <= 0) {
                this.empowerBuff.active = false;
            }
        }

        // Update nova effects
        for (let i = this.novaEffects.length - 1; i >= 0; i--) {
            const nova = this.novaEffects[i];
            nova.time += dt;
            nova.radius = (nova.time / nova.maxTime) * nova.maxRadius;
            if (nova.time >= nova.maxTime) {
                this.novaEffects.splice(i, 1);
            }
        }

        // Update meteor effects
        for (let i = this.meteorEffects.length - 1; i >= 0; i--) {
            const meteor = this.meteorEffects[i];
            meteor.time += dt;
            if (meteor.time >= meteor.maxTime) {
                this.meteorEffects.splice(i, 1);
            }
        }

        // Update laser effect
        if (this.laserEffect) {
            this.laserEffect.time += dt;
            if (this.laserEffect.time >= this.laserEffect.maxTime) {
                this.laserEffect = null;
            }
        }

        // Update blackhole effect
        if (this.blackholeEffect) {
            this.blackholeEffect.time += dt;
            const bh = this.blackholeEffect;

            // Pull and damage enemies
            for (const enemy of this.enemies) {
                if (!enemy.active) continue;
                const dx = bh.x - enemy.x;
                const dy = bh.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < bh.radius && dist > 0) {
                    // Pull toward center
                    enemy.x += (dx / dist) * 100 * dt;
                    enemy.y += (dy / dist) * 100 * dt;
                    // Damage over time
                    if (Math.random() < dt * 3) {
                        enemy.takeDamage(bh.damage);
                        if (enemy.hp <= 0) this.onEnemyKilled(enemy);
                    }
                }
            }

            if (bh.time >= bh.maxTime) {
                this.blackholeEffect = null;
            }
        }
    }

    fireArrow() {
        if (!this.player) return;

        // Play shoot sound
        soundManager.playShoot();

        const spread = this.skillSystem.hasSkill('spread_shot');
        let piercing = this.skillSystem.hasSkill('piercing');
        let multiShot = this.powerUps.isMultiShot();
        const bulletSpeed = this.player.bulletSpeed * (1 + this.skillSystem.getBonus('bulletSpeed'));
        const powerUpDamageMult = this.powerUps.getDamageMultiplier();

        // Apply empower buff
        let empowerDamageMult = 1;
        if (this.empowerBuff.active) {
            empowerDamageMult = this.empowerBuff.damageMultiplier || 1;
            piercing = piercing || this.empowerBuff.piercing;
            multiShot = multiShot || this.empowerBuff.multiShot;
        }

        const damage = this.player.damage * (1 + this.skillSystem.getBonus('damage')) * powerUpDamageMult * empowerDamageMult;

        const aimDirection = this.player.getAimDirection();

        // Determine shot pattern
        let angles;
        if (multiShot) {
            // 5-way spread
            angles = [-0.3, -0.15, 0, 0.15, 0.3];
        } else if (spread) {
            // 3-way spread from skill
            angles = [-0.15, 0, 0.15];
        } else {
            // Single shot
            angles = [0];
        }

        for (const offset of angles) {
            const angle = aimDirection + offset;
            this.bullets.push(new Bullet(
                this.player.x + Math.cos(angle) * 25,
                this.player.y + Math.sin(angle) * 25,
                Math.cos(angle) * bulletSpeed,
                Math.sin(angle) * bulletSpeed,
                damage,
                false,
                piercing
            ));
        }
    }

    enemyAttack(enemy) {
        if (!this.player) return;

        const angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
        const speed = 250;

        this.bullets.push(new Bullet(
            enemy.x,
            enemy.y,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            enemy.damage * 0.5,
            true
        ));
        enemy.attackTimer = 0;
    }

    checkCollisions() {
        if (!this.player) return;

        // Player bullets hitting enemies
        const bulletHits = checkBulletEnemyCollisions(this.bullets, this.enemies);
        for (const { bullet, enemy } of bulletHits) {
            const critChance = this.skillSystem.getBonus('critical');
            const isCritical = Math.random() < critChance;
            const powerUpDamageMult = this.powerUps.getDamageMultiplier();
            let damage = bullet.damage * (isCritical ? 2 : 1) * powerUpDamageMult;

            // Shield enemy: reduce frontal damage
            if (enemy.type === 'shield') {
                const bulletAngle = Math.atan2(bullet.vy, bullet.vx);
                const toPlayer = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
                const angleDiff = Math.abs(bulletAngle - toPlayer);
                // If bullet coming from player's direction (frontal)
                if (angleDiff < Math.PI / 2 || angleDiff > Math.PI * 1.5) {
                    damage *= (1 - (enemy.shieldReduction || 0.7));
                }
            }

            enemy.takeDamage(damage);
            this.addDamageNumber(enemy.x, enemy.y - 20, Math.floor(damage), isCritical);

            // Play hit sound and effects
            if (isCritical) {
                soundManager.playCritical();
                this.effects.shakeLarge();
                this.effects.hitStopLong();
            } else {
                soundManager.playHit();
                this.effects.shakeSmall();
            }

            if (!bullet.piercing) {
                bullet.active = false;
            }

            if (enemy.hp <= 0) {
                this.onEnemyKilled(enemy);
            }
        }

        // Enemy bullets hitting player (check power-up invincibility too)
        const isInvincible = this.player.invincible || this.powerUps.isInvincible();
        if (!isInvincible) {
            const playerHits = checkEnemyBulletPlayerCollisions(this.bullets, this.player);
            for (const { bullet } of playerHits) {
                this.onPlayerHit(bullet.damage);
                bullet.active = false;
            }
        }

        // Enemies touching player
        if (!isInvincible) {
            const enemyHits = checkEnemyPlayerCollisions(this.enemies, this.player);
            for (const { enemy } of enemyHits) {
                this.onPlayerHit(enemy.damage);
                break;
            }
        }

        // Pickups (magnet always active - wide range, power-up extends)
        const baseMagnetRange = 250;
        const powerUpMagnetRange = this.powerUps.getMagnetRange();
        const magnetRange = Math.max(baseMagnetRange, powerUpMagnetRange);
        const { collisions, attracted } = checkPickupPlayerCollisions(
            this.pickups,
            this.player,
            magnetRange
        );

        for (const { pickup } of collisions) {
            this.onPickupCollected(pickup);
            pickup.active = false;
        }

        for (const { pickup, distance } of attracted) {
            const speed = (magnetRange - distance) / magnetRange * 10;
            const angle = Math.atan2(this.player.y - pickup.y, this.player.x - pickup.x);
            pickup.x += Math.cos(angle) * speed;
            pickup.y += Math.sin(angle) * speed;
        }
    }

    onEnemyKilled(enemy) {
        this.kills++;

        // Play kill sound
        soundManager.playKill();

        // Add to combo and get multiplier
        const comboMultiplier = this.combo.addKill();

        // Screen shake based on enemy type
        if (enemy.isBoss) {
            this.effects.shakeEpic();
            this.effects.bossKillSlowMo();
        } else {
            this.effects.shakeMedium();
        }

        // Special death effects for new enemy types
        this.handleSpecialEnemyDeath(enemy);

        // Drop exp with combo bonus
        const expAmount = enemy.expValue || 1;
        const luckyBonus = this.skillSystem.hasSkill('lucky') ? 1.5 : 1;
        const finalExp = Math.floor(expAmount * luckyBonus * comboMultiplier);

        this.pickups.push(new Pickup(enemy.x, enemy.y, 'exp', finalExp));

        // Gold drop based on enemy type - BOSSES DROP BIG LOOT!
        const baseGold = enemy.isBoss ? 150 : (5 + Math.floor(Math.random() * 5));
        const goldAmount = Math.floor(baseGold * luckyBonus);
        this.pickups.push(new Pickup(enemy.x + 10, enemy.y, 'gold', goldAmount));

        // Boss drops multiple gold pickups for visual effect
        if (enemy.isBoss) {
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 / 5) * i;
                const dist = 30;
                this.pickups.push(new Pickup(
                    enemy.x + Math.cos(angle) * dist,
                    enemy.y + Math.sin(angle) * dist,
                    'gold',
                    Math.floor(30 * luckyBonus)
                ));
            }
        }

        // Rare drops
        if (Math.random() < 0.03 * luckyBonus) {
            this.pickups.push(new Pickup(enemy.x, enemy.y, 'health', 20));
        }

        // Try to spawn power-up
        this.powerUps.trySpawn(enemy.x, enemy.y, enemy.isBoss);

        // Build ultimate gauge - bosses give more charge
        const ultCharge = enemy.isBoss ? 25 : 1;
        this.ultimateGauge = Math.min(this.ultimateMaxGauge, this.ultimateGauge + ultCharge);
        if (this.ultimateGauge >= this.ultimateMaxGauge && !this.ultimateReady) {
            this.ultimateReady = true;
            this.effects.announce('ULTIMATE READY!', '#ff00ff', 1.5);
            this.effects.flash('#ff00ff', 0.3);
        }

        enemy.active = false;
    }

    handleSpecialEnemyDeath(enemy) {
        // Exploder: deals AOE damage on death
        if (enemy.type === 'exploder') {
            const explosionRadius = enemy.explosionRadius || 80;
            const explosionDamage = enemy.explosionDamage || 20;

            // Damage player if in range
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            if (dx * dx + dy * dy < explosionRadius * explosionRadius) {
                this.onPlayerHit(explosionDamage);
            }

            // Visual effect
            this.novaEffects.push({
                x: enemy.x, y: enemy.y, radius: 0, maxRadius: explosionRadius,
                time: 0, maxTime: 0.3, color: '#ff4400'
            });
            this.effects.shakeLarge();
        }

        // Splitter: spawns smaller enemies on death
        if (enemy.type === 'splitter' && enemy.splitCount > 0) {
            for (let i = 0; i < enemy.splitCount; i++) {
                const angle = (Math.PI * 2 / enemy.splitCount) * i;
                const offsetX = Math.cos(angle) * 30;
                const offsetY = Math.sin(angle) * 30;

                const miniConfig = scaleEnemyStats(EnemyTypes.miniSplitter, this.waveSystem.currentWave);
                const mini = new Enemy(enemy.x + offsetX, enemy.y + offsetY, miniConfig);
                this.enemies.push(mini);
            }
        }
    }

    onPlayerHit(damage) {
        const reduction = this.equipmentSystem.getDamageReduction();
        const actualDamage = damage * (1 - reduction);

        this.player.takeDamage(actualDamage);

        // Play hurt sound and screen shake
        soundManager.playHurt();
        this.effects.shakeLarge();
        this.effects.flash('#ff0000', 0.2);

        const invincibilityBonus = this.skillSystem.getBonus('invincibility');
        this.player.setInvincible(0.5 + invincibilityBonus);

        if (this.player.hp <= 0) {
            this.gameOver();
        }
    }

    onPickupCollected(pickup) {
        // Play pickup sound
        soundManager.playPickup();

        if (pickup.type === 'exp') {
            this.levelSystem.addExp(pickup.value);
        } else if (pickup.type === 'health') {
            this.player.heal(pickup.value);
        } else if (pickup.type === 'gold') {
            this.gold += pickup.value;
            this.hud.updateGold(this.gold);
        }
    }

    onLevelUp() {
        // Play level up sound and effects
        soundManager.playLevelUp();
        this.effects.levelUpEffect();

        // Always show QWER skill selection
        // Players can choose any QWER skill to unlock or level up
        this.state = GameState.SKILL_SELECT;
        this.skillSelect.showQWERSkillSelect();
    }

    handleClickIndicators() {
        // Add new click indicators
        const rightClick = this.input.getRightClick();
        if (rightClick) {
            this.clickIndicators.push({
                x: rightClick.x,
                y: rightClick.y,
                type: 'move',
                time: 0,
                maxTime: 0.5
            });
            // Play move sound
            soundManager.playMove();
        }

        const leftClick = this.input.getLeftClick();
        if (leftClick) {
            this.clickIndicators.push({
                x: leftClick.x,
                y: leftClick.y,
                type: 'attack',
                time: 0,
                maxTime: 0.3
            });
            // Play click sound
            soundManager.playClick();
        }

        const attackModeClick = this.input.getAttackModeClick();
        if (attackModeClick) {
            this.clickIndicators.push({
                x: attackModeClick.x,
                y: attackModeClick.y,
                type: 'attack',
                time: 0,
                maxTime: 0.3
            });
            // Play click sound
            soundManager.playClick();
        }

        // Update and cleanup indicators
        for (let i = this.clickIndicators.length - 1; i >= 0; i--) {
            this.clickIndicators[i].time += this.deltaTime;
            if (this.clickIndicators[i].time >= this.clickIndicators[i].maxTime) {
                this.clickIndicators.splice(i, 1);
            }
        }
    }

    handleAttackInput() {
        if (!this.player || !this.player.canAttack()) return;

        // Always auto-attack nearest enemy in range (survivor style)
        const nearest = findNearestEnemy(
            this.player.x,
            this.player.y,
            this.enemies,
            this.player.attackRange
        );

        if (nearest) {
            this.player.startBowAttack(nearest);
        }
    }

    handleActiveSkillInput() {
        const skillKey = this.input.getActiveSkillPressed();
        if (!skillKey || !this.player) return;

        const mousePos = this.input.getMouseWorldPosition();

        // Check cooldown
        if (this.player.skillCooldowns[skillKey] > 0) return;

        // Execute skill based on key
        switch (skillKey) {
            case 'Q':
                this.executeSkillQ(mousePos);
                break;
            case 'W':
                this.executeSkillW(mousePos);
                break;
            case 'E':
                this.executeSkillE(mousePos);
                break;
            case 'R':
                this.executeSkillR(mousePos);
                break;
        }
    }

    handleUltimateInput() {
        if (!this.ultimateReady || this.ultimateActive) return;

        // Check for Space key
        if (this.input.isKeyJustPressed('Space')) {
            this.executeUltimate();
        }
    }

    executeUltimate() {
        this.ultimateReady = false;
        this.ultimateActive = true;
        this.ultimateTimer = 0;
        this.ultimateGauge = 0;

        // Epic announcement
        this.effects.announce('ULTIMATE!', '#ff00ff', 2.0);

        // Slow motion for dramatic effect
        this.effects.slowMotion(0.1, 0.5);

        // Screen effects
        this.effects.flash('#ff00ff', 0.5);
        this.effects.shakeEpic();

        // Play sound
        soundManager.playUltimate();

        // Delay the actual damage for dramatic effect
        setTimeout(() => {
            this.executeUltimateDamage();
        }, 400);
    }

    executeUltimateDamage() {
        if (!this.player) return;

        // Massive screen-wide explosion
        const radius = 800;
        const baseDamage = this.player.damage * 20;

        // Damage all enemies
        for (const enemy of this.enemies) {
            if (!enemy.active) continue;

            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < radius) {
                const falloff = 1 - (dist / radius) * 0.5;
                const damage = baseDamage * falloff;
                enemy.takeDamage(damage);
                this.addDamageNumber(enemy.x, enemy.y - 20, Math.floor(damage), true);

                if (enemy.hp <= 0) {
                    this.onEnemyKilled(enemy);
                }
            }
        }

        // Multiple visual explosions
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i;
            const dist = 150;
            const x = this.player.x + Math.cos(angle) * dist;
            const y = this.player.y + Math.sin(angle) * dist;

            this.novaEffects.push({
                x, y, radius: 0, maxRadius: 200,
                time: 0, maxTime: 0.4, color: '#ff00ff'
            });
        }

        // Center explosion
        this.novaEffects.push({
            x: this.player.x, y: this.player.y,
            radius: 0, maxRadius: radius,
            time: 0, maxTime: 0.6, color: '#ff88ff'
        });

        this.effects.shakeEpic();
        this.ultimateActive = false;
    }

    executeSkillQ(mousePos) {
        // Q - Attack buff skills
        const skillId = this.skillSystem.getSlotSkill('Q');
        if (!skillId) return;

        soundManager.playSkillQ();
        const stacks = this.skillSystem.getSkillStacks(skillId);

        switch (skillId) {
            case 'skill_empower':
                // Empower: damage x1.5, multi-shot (no piercing)
                this.empowerBuff = {
                    active: true,
                    duration: 4 + stacks,
                    timer: 4 + stacks,
                    damageMultiplier: 1.5 + stacks * 0.3,
                    piercing: false,
                    multiShot: true
                };
                this.effects.flash('#ffaa00', 0.3);
                this.player.skillCooldowns.Q = Math.max(5, 15 - stacks * 2);
                break;

            case 'skill_berserk':
                // Berserk: attack speed x3, but take more damage
                this.empowerBuff = {
                    active: true,
                    duration: 5 + stacks,
                    timer: 5 + stacks,
                    attackSpeedMultiplier: 3 + stacks * 0.5,
                    damageTakenMultiplier: 1.5 - stacks * 0.1
                };
                this.effects.flash('#ff0000', 0.3);
                this.player.skillCooldowns.Q = Math.max(3, 15 - stacks * 2.5);
                break;

            case 'skill_precision':
                // Precision: 100% critical rate
                this.empowerBuff = {
                    active: true,
                    duration: 5 + stacks,
                    timer: 5 + stacks,
                    criticalRate: 1.0
                };
                this.effects.flash('#ffffff', 0.3);
                this.player.skillCooldowns.Q = Math.max(3, 12 - stacks * 2);
                break;
        }

        this.effects.shakeMedium();
    }

    executeSkillW(mousePos) {
        // W - Area attack skills
        const skillId = this.skillSystem.getSlotSkill('W');
        if (!skillId) return;

        soundManager.playSkillW();
        const stacks = this.skillSystem.getSkillStacks(skillId);
        const baseDamage = this.player.damage * (1 + this.skillSystem.getBonus('damage'));

        switch (skillId) {
            case 'skill_nova': {
                // Nova: instant AOE around player
                const damage = baseDamage * (3 + stacks * 1.5);
                const radius = 150 + stacks * 40;
                this.executeAOEDamage(this.player.x, this.player.y, radius, damage, '#00ffff');
                this.player.skillCooldowns.W = Math.max(2, 8 - stacks * 1.2);
                break;
            }

            case 'skill_frost_wave': {
                // Frost Wave: AOE + freeze enemies
                const damage = baseDamage * (2 + stacks * 1.2);
                const radius = 180 + stacks * 35;
                const hitEnemies = this.executeAOEDamage(this.player.x, this.player.y, radius, damage, '#88ddff');
                // Freeze hit enemies
                for (const enemy of hitEnemies) {
                    enemy.frozen = true;
                    enemy.frozenTimer = 3 + stacks;
                }
                this.player.skillCooldowns.W = Math.max(2, 10 - stacks * 1.5);
                break;
            }

            case 'skill_gravity': {
                // Gravity: pull enemies to center and damage
                const damage = baseDamage * (2.5 + stacks * 1.5);
                const radius = 200 + stacks * 40;
                const pullStrength = 50 + stacks * 20;
                // Pull enemies toward player
                for (const enemy of this.enemies) {
                    if (!enemy.active) continue;
                    const dx = this.player.x - enemy.x;
                    const dy = this.player.y - enemy.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < radius && dist > 0) {
                        enemy.x += dx / dist * pullStrength;
                        enemy.y += dy / dist * pullStrength;
                    }
                }
                // Delayed damage at center
                setTimeout(() => {
                    this.executeAOEDamage(this.player.x, this.player.y, 100 + stacks * 30, damage, '#aa00ff');
                }, 300);
                this.novaEffects.push({
                    x: this.player.x, y: this.player.y,
                    radius: radius, maxRadius: 0,
                    time: 0, maxTime: 0.3, color: '#8800ff'
                });
                this.player.skillCooldowns.W = Math.max(3, 12 - stacks * 1.8);
                break;
            }
        }
    }

    executeAOEDamage(x, y, radius, damage, color) {
        const hitEnemies = [];
        for (const enemy of this.enemies) {
            if (!enemy.active) continue;
            const dx = enemy.x - x;
            const dy = enemy.y - y;
            if (dx * dx + dy * dy < radius * radius) {
                enemy.takeDamage(damage);
                hitEnemies.push(enemy);
                this.addDamageNumber(enemy.x, enemy.y - 20, Math.floor(damage), false);
                if (enemy.hp <= 0) this.onEnemyKilled(enemy);
            }
        }
        // Visual effect
        this.novaEffects.push({
            x, y, radius: 0, maxRadius: radius,
            time: 0, maxTime: 0.4, color
        });
        if (hitEnemies.length > 5) {
            this.effects.shakeLarge();
        } else if (hitEnemies.length > 0) {
            this.effects.shakeMedium();
        }
        return hitEnemies;
    }

    executeSkillE(mousePos) {
        // E - Mobility skills
        const skillId = this.skillSystem.getSlotSkill('E');
        if (!skillId) return;

        soundManager.playSkillE();
        const stacks = this.skillSystem.getSkillStacks(skillId);
        const dx = mousePos.x - this.player.x;
        const dy = mousePos.y - this.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        switch (skillId) {
            case 'skill_dash':
                // Dash: quick dash with invincibility
                if (dist > 0) {
                    this.player.dashDirection = { x: dx / dist, y: dy / dist };
                    this.player.dashDuration = 0.2 + stacks * 0.08;
                    this.player.invincible = true;
                    this.player.invincibleTimer = 0.3 + stacks * 0.1;
                }
                this.player.skillCooldowns.E = Math.max(1.5, 8 - stacks * 1.3);
                break;

            case 'skill_blink':
                // Blink: teleport to mouse position
                const blinkDist = Math.min(dist, 300 + stacks * 80);
                if (dist > 0) {
                    this.player.x += (dx / dist) * blinkDist;
                    this.player.y += (dy / dist) * blinkDist;
                }
                this.effects.flash('#4488ff', 0.2);
                this.player.skillCooldowns.E = Math.max(2, 10 - stacks * 1.5);
                break;

            case 'skill_phase':
                // Phase: become invincible and pass through enemies
                this.player.phasing = true;
                this.player.phasingTimer = 3 + stacks * 1.5;
                this.player.invincible = true;
                this.player.invincibleTimer = 3 + stacks * 1.5;
                this.effects.flash('#cc88ff', 0.3);
                this.player.skillCooldowns.E = Math.max(4, 15 - stacks * 2);
                break;
        }
    }

    executeSkillR(mousePos) {
        // R - Ultimate skills
        const skillId = this.skillSystem.getSlotSkill('R');
        if (!skillId) return;

        soundManager.playSkillR();
        const stacks = this.skillSystem.getSkillStacks(skillId);
        const baseDamage = this.player.damage * (1 + this.skillSystem.getBonus('damage'));

        switch (skillId) {
            case 'skill_meteor': {
                // Meteor Strike: massive AOE
                const damage = baseDamage * (5 + stacks * 3);
                const radius = 200 + stacks * 60;
                this.effects.slowMotion(0.3, 0.8);

                setTimeout(() => {
                    for (const enemy of this.enemies) {
                        if (!enemy.active) continue;
                        const dx = enemy.x - mousePos.x;
                        const dy = enemy.y - mousePos.y;
                        const distSq = dx * dx + dy * dy;
                        if (distSq < radius * radius) {
                            const falloff = 1 - Math.sqrt(distSq) / radius * 0.5;
                            const actualDamage = damage * falloff;
                            enemy.takeDamage(actualDamage);
                            this.addDamageNumber(enemy.x, enemy.y - 20, Math.floor(actualDamage), true);
                            if (enemy.hp <= 0) this.onEnemyKilled(enemy);
                        }
                    }
                    this.effects.shakeEpic();
                    this.effects.flash('#ff4400', 0.5);
                }, 300);

                this.meteorEffects.push({
                    x: mousePos.x, y: mousePos.y, radius,
                    time: 0, maxTime: 1.2, phase: 'falling'
                });
                this.player.skillCooldowns.R = Math.max(6, 25 - stacks * 4);
                break;
            }

            case 'skill_laser': {
                // Death Laser: line damage
                const damage = baseDamage * (4 + stacks * 2);
                const dx = mousePos.x - this.player.x;
                const dy = mousePos.y - this.player.y;
                const angle = Math.atan2(dy, dx);
                const laserLength = 800 + stacks * 100;
                const laserWidth = 40 + stacks * 15;

                // Check enemies along the line
                for (const enemy of this.enemies) {
                    if (!enemy.active) continue;
                    const ex = enemy.x - this.player.x;
                    const ey = enemy.y - this.player.y;
                    const projLength = ex * Math.cos(angle) + ey * Math.sin(angle);
                    const perpDist = Math.abs(-ex * Math.sin(angle) + ey * Math.cos(angle));

                    if (projLength > 0 && projLength < laserLength && perpDist < laserWidth) {
                        enemy.takeDamage(damage);
                        this.addDamageNumber(enemy.x, enemy.y - 20, Math.floor(damage), true);
                        if (enemy.hp <= 0) this.onEnemyKilled(enemy);
                    }
                }

                // Laser visual effect
                this.laserEffect = {
                    x: this.player.x, y: this.player.y,
                    angle, length: laserLength, width: laserWidth,
                    time: 0, maxTime: 0.5
                };
                this.effects.shakeEpic();
                this.effects.flash('#ff0000', 0.4);
                this.player.skillCooldowns.R = Math.max(5, 20 - stacks * 3);
                break;
            }

            case 'skill_blackhole': {
                // Black Hole: sustained AOE that pulls enemies
                const damage = baseDamage * (1 + stacks);
                const radius = 180 + stacks * 50;

                this.blackholeEffect = {
                    x: mousePos.x, y: mousePos.y, radius,
                    damage, time: 0, maxTime: 4 + stacks * 1.5
                };
                this.effects.shakeMedium();
                this.player.skillCooldowns.R = Math.max(8, 30 - stacks * 4);
                break;
            }
        }
    }

    updateBossHPBar() {
        const boss = this.spawnSystem.getCurrentBoss();
        if (boss && boss.active) {
            this.bossHpContainer.classList.remove('hidden');
            const hpPercent = (boss.hp / boss.maxHp) * 100;
            this.bossHpFill.style.width = `${hpPercent}%`;

            // Boss name based on type
            const bossNames = {
                giantZombie: 'ジャイアントゾンビ',
                zombieKing: 'ゾンビキング',
                hellDog: 'ヘルハウンド'
            };
            this.bossName.textContent = bossNames[boss.type] || 'BOSS';
        } else {
            this.bossHpContainer.classList.add('hidden');
        }
    }

    onBossKilled(boss) {
        // Play boss death sound
        soundManager.playBossDeath();

        // Hide boss HP bar
        this.bossHpContainer.classList.add('hidden');

        // Show legendary skill selection
        this.state = GameState.LEGENDARY_SELECT;
        this.showLegendarySelect();
    }

    showLegendarySelect() {
        this.legendaryChoices = this.skillSystem.getLegendarySkillChoices(3);
        this.legendaryOptions.innerHTML = '';

        this.legendaryChoices.forEach((skill, index) => {
            const card = this.createLegendaryCard(skill, index);
            this.legendaryOptions.appendChild(card);

            // Staggered entrance animation
            setTimeout(() => {
                card.classList.add('visible');
            }, 100 + index * 150);
        });

        this.legendaryContainer.classList.remove('hidden');
        this.legendaryAnimating = true;

        setTimeout(() => {
            this.legendaryAnimating = false;
        }, 600);
    }

    createLegendaryCard(skill, index) {
        const card = document.createElement('div');
        card.className = `skill-card legendary ${skill.category}`;
        card.dataset.index = index;

        const stacks = this.skillSystem.getSkillStacks(skill.id);
        const nextLevel = stacks + 1;
        const stars = '★'.repeat(Math.min(nextLevel, 5));
        const stackText = stacks > 0 ? `<span class="stack-count">${stars}</span>` : '';

        card.innerHTML = `
            <div class="card-glow"></div>
            <div class="card-content">
                <div class="category-badge">LEGENDARY</div>
                <div class="icon-container">
                    <div class="icon-bg"></div>
                    <div class="icon">${skill.icon}</div>
                    ${stackText}
                </div>
                <div class="skill-info">
                    <div class="name">${skill.name}</div>
                    <div class="effect">${skill.effect}</div>
                </div>
                <div class="key-hint">
                    <span class="key">${index + 1}</span>
                    <span class="hint-text">を押して選択</span>
                </div>
            </div>
            <div class="card-particles"></div>
        `;

        card.addEventListener('click', () => {
            if (!this.legendaryAnimating) {
                this.selectLegendarySkill(index);
            }
        });

        return card;
    }

    // Slot selection methods
    showSlotSelect() {
        this.state = GameState.SLOT_SELECT;
        this.slotSelectAnimating = true;
        this.slotOptions.innerHTML = '';

        const unlockedSlots = this.skillSystem.getUnlockedSlots();
        const slots = [
            { key: 'Q', name: '攻撃強化', cssClass: 'q-slot' },
            { key: 'W', name: '範囲攻撃', cssClass: 'w-slot' },
            { key: 'E', name: '機動力', cssClass: 'e-slot' }
        ];

        slots.forEach((slot, index) => {
            const isLocked = unlockedSlots.includes(slot.key);
            const card = document.createElement('div');
            card.className = `slot-card ${slot.cssClass}${isLocked ? ' locked' : ''}`;
            card.dataset.key = slot.key;
            card.innerHTML = `
                <div class="key-label">${slot.key}</div>
                <div class="slot-name">${slot.name}</div>
                ${isLocked ? '<div class="slot-locked">解放済み</div>' : ''}
            `;

            if (!isLocked) {
                card.addEventListener('click', () => this.selectSlot(slot.key));
            }

            this.slotOptions.appendChild(card);

            setTimeout(() => {
                card.classList.add('visible');
            }, 100 + index * 150);
        });

        this.slotSelectContainer.classList.remove('hidden');

        setTimeout(() => {
            this.slotSelectAnimating = false;
        }, 600);
    }

    updateSlotSelect() {
        if (this.slotSelectAnimating) return;

        const unlockedSlots = this.skillSystem.getUnlockedSlots();

        // Check keyboard input (Q, W, E keys) - use just pressed to avoid repeat
        if (this.input.isKeyJustPressed('KeyQ') && !unlockedSlots.includes('Q')) {
            this.selectSlot('Q');
            return;
        }
        if (this.input.isKeyJustPressed('KeyW') && !unlockedSlots.includes('W')) {
            this.selectSlot('W');
            return;
        }
        if (this.input.isKeyJustPressed('KeyE') && !unlockedSlots.includes('E')) {
            this.selectSlot('E');
            return;
        }

        // Number key selection (1, 2, 3)
        const selection = this.input.getSkillSelection();
        if (selection >= 0 && selection < 3) {
            const keys = ['Q', 'W', 'E'];
            const key = keys[selection];
            if (!unlockedSlots.includes(key)) {
                this.selectSlot(key);
            }
        }
    }

    selectSlot(key) {
        if (this.slotSelectAnimating) return;

        soundManager.playClick();
        this.slotSelectAnimating = true;
        this.selectedSlotKey = key;

        const cards = this.slotOptions.querySelectorAll('.slot-card');
        cards.forEach(card => {
            if (card.dataset.key === key) {
                card.classList.add('selected');
            } else {
                card.classList.add('not-selected');
            }
        });

        setTimeout(() => {
            this.slotSelectContainer.classList.add('hidden');
            this.showActiveSkillSelect(key);
        }, 400);
    }

    showActiveSkillSelect(key) {
        this.state = GameState.ACTIVE_SKILL_SELECT;
        this.slotSelectAnimating = true;
        this.activeSkillKeyLabel.textContent = key;
        this.activeSkillOptions.innerHTML = '';

        // Import is at top level, we need to get skills from skillSystem
        this.activeSkillChoices = this.skillSystem.getActiveSkillChoices(key, 3);

        this.activeSkillChoices.forEach((skill, index) => {
            const card = document.createElement('div');
            card.className = 'active-skill-card';
            card.dataset.index = index;
            card.innerHTML = `
                <div class="skill-icon">${skill.icon}</div>
                <div class="skill-name">${skill.name}</div>
                <div class="skill-effect">${skill.effect}</div>
                <div class="skill-description">${skill.description || ''}</div>
                <div class="key-hint">
                    <span class="key">${index + 1}</span> を押して選択
                </div>
            `;

            card.addEventListener('click', () => this.selectActiveSkill(index));
            this.activeSkillOptions.appendChild(card);

            setTimeout(() => {
                card.classList.add('visible');
            }, 100 + index * 150);
        });

        this.activeSkillSelectContainer.classList.remove('hidden');

        setTimeout(() => {
            this.slotSelectAnimating = false;
        }, 600);
    }

    showRSkillSelect() {
        this.state = GameState.ACTIVE_SKILL_SELECT;
        this.slotSelectAnimating = true;
        this.selectedSlotKey = 'R';
        this.activeSkillKeyLabel.textContent = 'R';
        this.activeSkillOptions.innerHTML = '';

        this.activeSkillChoices = this.skillSystem.getActiveSkillChoices('R', 3);

        this.activeSkillChoices.forEach((skill, index) => {
            const card = document.createElement('div');
            card.className = 'active-skill-card';
            card.dataset.index = index;
            card.innerHTML = `
                <div class="skill-icon">${skill.icon}</div>
                <div class="skill-name">${skill.name}</div>
                <div class="skill-effect">${skill.effect}</div>
                <div class="skill-description">${skill.description || ''}</div>
                <div class="key-hint">
                    <span class="key">${index + 1}</span> を押して選択
                </div>
            `;

            card.addEventListener('click', () => this.selectActiveSkill(index));
            this.activeSkillOptions.appendChild(card);

            setTimeout(() => {
                card.classList.add('visible');
            }, 100 + index * 150);
        });

        this.activeSkillSelectContainer.classList.remove('hidden');

        setTimeout(() => {
            this.slotSelectAnimating = false;
        }, 600);
    }

    updateActiveSkillSelect() {
        if (this.slotSelectAnimating) return;

        const selection = this.input.getSkillSelection();
        if (selection >= 0 && selection < this.activeSkillChoices.length) {
            this.selectActiveSkill(selection);
        }
    }

    selectActiveSkill(index) {
        if (this.slotSelectAnimating) return;
        if (index < 0 || index >= this.activeSkillChoices.length) return;

        soundManager.playClick();
        this.slotSelectAnimating = true;

        const skill = this.activeSkillChoices[index];
        const cards = this.activeSkillOptions.querySelectorAll('.active-skill-card');

        cards.forEach((card, i) => {
            if (i === index) {
                card.classList.add('selected');
            } else {
                card.classList.add('not-selected');
            }
        });

        setTimeout(() => {
            // Unlock the slot and acquire the skill
            this.skillSystem.unlockSlot(this.selectedSlotKey, skill.id);
            this.activeSkillSelectContainer.classList.add('hidden');
            this.state = GameState.PLAYING;
            this.slotSelectAnimating = false;
        }, 500);
    }

    updateLegendarySelect() {
        if (this.legendaryAnimating) return;

        const selection = this.input.getSkillSelection();
        if (selection >= 0 && selection < this.legendaryChoices.length) {
            this.selectLegendarySkill(selection);
        }
    }

    selectLegendarySkill(index) {
        if (this.legendaryAnimating) return;

        // Play selection sound
        soundManager.playClick();

        this.legendaryAnimating = true;
        const skill = this.legendaryChoices[index];
        const cards = this.legendaryOptions.querySelectorAll('.skill-card');

        cards.forEach((card, i) => {
            if (i === index) {
                card.classList.add('selected');
            } else {
                card.classList.add('not-selected');
            }
        });

        setTimeout(() => {
            this.skillSystem.acquireSkill(skill.id);
            this.legendaryContainer.classList.add('hidden');
            this.state = GameState.PLAYING;
            this.legendaryAnimating = false;
        }, 500);
    }

    addDamageNumber(x, y, value, isCritical = false) {
        if (this.damageNumbers.length > 10) return;
        this.damageNumbers.push({ x, y, value, isCritical, alpha: 1, vy: -2 });
    }

    updateDamageNumbers() {
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const num = this.damageNumbers[i];
            num.y += num.vy;
            num.alpha -= 0.03;

            if (num.alpha <= 0) {
                this.damageNumbers.splice(i, 1);
            }
        }
    }

    cleanup() {
        // Efficient cleanup
        this.enemies = this.enemies.filter(e => e.active);
        this.bullets = this.bullets.filter(b => b.active);
        this.pickups = this.pickups.filter(p => p.active);

        // Limit bullets
        if (this.bullets.length > 30) {
            this.bullets = this.bullets.slice(-20);
        }

        // Limit pickups for performance
        if (this.pickups.length > 50) {
            this.pickups = this.pickups.slice(-30);
        }
    }

    render() {
        // Apply screen shake to camera
        const shakeOffset = this.effects.getShakeOffset();
        this.camera.shakeOffsetX = shakeOffset.x;
        this.camera.shakeOffsetY = shakeOffset.y;

        this.renderer.clear(this.camera);

        if (this.state === GameState.MENU) {
            return;
        }

        // Draw pickups
        for (const pickup of this.pickups) {
            if (this.camera.isVisible(pickup.x, pickup.y, 30)) {
                this.renderer.drawPickup(pickup, this.camera);
            }
        }

        // Draw power-ups in world
        this.powerUps.draw(this.renderer.ctx, this.camera);

        // Draw enemies
        for (const enemy of this.enemies) {
            if (this.camera.isVisible(enemy.x, enemy.y, 50)) {
                this.renderer.drawEnemy(enemy, this.camera);
            }
        }

        // Draw player with orbital weapons
        if (this.player) {
            this.renderer.drawPlayer(this.player, this.camera, this.weaponSystem.getWeaponData());
        }

        // Draw bullets
        for (const bullet of this.bullets) {
            if (this.camera.isVisible(bullet.x, bullet.y, 20)) {
                this.renderer.drawBullet(bullet, this.camera);
            }
        }

        // Draw particles
        this.particles.draw(this.renderer.ctx, this.camera);

        // Draw damage numbers
        for (const num of this.damageNumbers) {
            const screen = this.camera.worldToScreen(num.x, num.y);
            this.renderer.ctx.save();
            this.renderer.ctx.globalAlpha = num.alpha;
            this.renderer.ctx.font = num.isCritical ? 'bold 20px monospace' : 'bold 14px monospace';
            this.renderer.ctx.fillStyle = num.isCritical ? '#ffff00' : '#ffffff';
            this.renderer.ctx.textAlign = 'center';
            this.renderer.ctx.fillText(num.value.toString(), screen.x, screen.y);
            this.renderer.ctx.restore();
        }

        // Draw nova effects
        for (const nova of this.novaEffects) {
            const screen = this.camera.worldToScreen(nova.x, nova.y);
            const alpha = 1 - (nova.time / nova.maxTime);
            this.renderer.ctx.save();
            this.renderer.ctx.strokeStyle = nova.color;
            this.renderer.ctx.lineWidth = 4;
            this.renderer.ctx.globalAlpha = alpha;
            this.renderer.ctx.shadowColor = nova.color;
            this.renderer.ctx.shadowBlur = 20;
            this.renderer.ctx.beginPath();
            this.renderer.ctx.arc(screen.x, screen.y, nova.radius, 0, Math.PI * 2);
            this.renderer.ctx.stroke();
            // Inner ring
            this.renderer.ctx.globalAlpha = alpha * 0.5;
            this.renderer.ctx.lineWidth = 2;
            this.renderer.ctx.beginPath();
            this.renderer.ctx.arc(screen.x, screen.y, nova.radius * 0.6, 0, Math.PI * 2);
            this.renderer.ctx.stroke();
            this.renderer.ctx.restore();
        }

        // Draw meteor effects
        for (const meteor of this.meteorEffects) {
            const screen = this.camera.worldToScreen(meteor.x, meteor.y);
            const progress = meteor.time / meteor.maxTime;

            this.renderer.ctx.save();

            if (progress < 0.25) {
                // Falling meteor indicator
                const fallProgress = progress / 0.25;
                const warningAlpha = 0.3 + Math.sin(meteor.time * 20) * 0.2;

                // Warning circle
                this.renderer.ctx.fillStyle = `rgba(255, 50, 0, ${warningAlpha})`;
                this.renderer.ctx.beginPath();
                this.renderer.ctx.arc(screen.x, screen.y, meteor.radius * fallProgress, 0, Math.PI * 2);
                this.renderer.ctx.fill();

                // Falling meteor visual
                const meteorY = screen.y - 300 * (1 - fallProgress);
                this.renderer.ctx.fillStyle = '#ff4400';
                this.renderer.ctx.shadowColor = '#ff6600';
                this.renderer.ctx.shadowBlur = 30;
                this.renderer.ctx.beginPath();
                this.renderer.ctx.arc(screen.x, meteorY, 20 + fallProgress * 30, 0, Math.PI * 2);
                this.renderer.ctx.fill();

            } else if (progress < 0.4) {
                // Impact flash
                const impactProgress = (progress - 0.25) / 0.15;
                const flashAlpha = 1 - impactProgress;

                this.renderer.ctx.fillStyle = `rgba(255, 255, 200, ${flashAlpha})`;
                this.renderer.ctx.beginPath();
                this.renderer.ctx.arc(screen.x, screen.y, meteor.radius * (1 + impactProgress * 0.5), 0, Math.PI * 2);
                this.renderer.ctx.fill();

            } else {
                // Expanding fire ring
                const ringProgress = (progress - 0.4) / 0.6;
                const ringAlpha = 1 - ringProgress;

                // Outer fire ring
                this.renderer.ctx.strokeStyle = `rgba(255, 100, 0, ${ringAlpha})`;
                this.renderer.ctx.lineWidth = 10 * (1 - ringProgress);
                this.renderer.ctx.shadowColor = '#ff4400';
                this.renderer.ctx.shadowBlur = 30;
                this.renderer.ctx.beginPath();
                this.renderer.ctx.arc(screen.x, screen.y, meteor.radius * (0.5 + ringProgress * 0.5), 0, Math.PI * 2);
                this.renderer.ctx.stroke();

                // Inner glow
                this.renderer.ctx.fillStyle = `rgba(255, 200, 50, ${ringAlpha * 0.3})`;
                this.renderer.ctx.beginPath();
                this.renderer.ctx.arc(screen.x, screen.y, meteor.radius * (0.3 + ringProgress * 0.2), 0, Math.PI * 2);
                this.renderer.ctx.fill();
            }

            this.renderer.ctx.restore();
        }

        // Draw laser effect
        if (this.laserEffect) {
            const laser = this.laserEffect;
            const screen = this.camera.worldToScreen(laser.x, laser.y);
            const alpha = 1 - (laser.time / laser.maxTime);

            this.renderer.ctx.save();
            this.renderer.ctx.translate(screen.x, screen.y);
            this.renderer.ctx.rotate(laser.angle);

            // Laser beam
            const gradient = this.renderer.ctx.createLinearGradient(0, 0, laser.length, 0);
            gradient.addColorStop(0, `rgba(255, 0, 0, ${alpha})`);
            gradient.addColorStop(0.5, `rgba(255, 100, 100, ${alpha})`);
            gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);

            this.renderer.ctx.fillStyle = gradient;
            this.renderer.ctx.shadowColor = '#ff0000';
            this.renderer.ctx.shadowBlur = 30;
            this.renderer.ctx.fillRect(0, -laser.width / 2, laser.length, laser.width);

            // Core beam (brighter center)
            const coreGradient = this.renderer.ctx.createLinearGradient(0, 0, laser.length, 0);
            coreGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
            coreGradient.addColorStop(0.5, `rgba(255, 200, 200, ${alpha * 0.5})`);
            coreGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
            this.renderer.ctx.fillStyle = coreGradient;
            this.renderer.ctx.fillRect(0, -laser.width / 4, laser.length, laser.width / 2);

            this.renderer.ctx.restore();
        }

        // Draw blackhole effect
        if (this.blackholeEffect) {
            const bh = this.blackholeEffect;
            const screen = this.camera.worldToScreen(bh.x, bh.y);
            const pulse = 0.8 + Math.sin(bh.time * 5) * 0.2;

            this.renderer.ctx.save();

            // Outer pull zone
            const outerGradient = this.renderer.ctx.createRadialGradient(
                screen.x, screen.y, 0,
                screen.x, screen.y, bh.radius
            );
            outerGradient.addColorStop(0, 'rgba(50, 0, 100, 0.8)');
            outerGradient.addColorStop(0.5, 'rgba(100, 0, 150, 0.4)');
            outerGradient.addColorStop(1, 'rgba(150, 50, 200, 0)');
            this.renderer.ctx.fillStyle = outerGradient;
            this.renderer.ctx.beginPath();
            this.renderer.ctx.arc(screen.x, screen.y, bh.radius * pulse, 0, Math.PI * 2);
            this.renderer.ctx.fill();

            // Spinning lines
            this.renderer.ctx.strokeStyle = 'rgba(200, 100, 255, 0.6)';
            this.renderer.ctx.lineWidth = 2;
            for (let i = 0; i < 6; i++) {
                const angle = (bh.time * 2 + i * Math.PI / 3);
                this.renderer.ctx.beginPath();
                this.renderer.ctx.arc(screen.x, screen.y, bh.radius * 0.3, angle, angle + 0.5);
                this.renderer.ctx.stroke();
            }

            // Core
            this.renderer.ctx.fillStyle = 'rgba(20, 0, 40, 0.9)';
            this.renderer.ctx.shadowColor = '#8800ff';
            this.renderer.ctx.shadowBlur = 20;
            this.renderer.ctx.beginPath();
            this.renderer.ctx.arc(screen.x, screen.y, 30, 0, Math.PI * 2);
            this.renderer.ctx.fill();

            this.renderer.ctx.restore();
        }

        // Draw empower buff indicator on player
        if (this.empowerBuff.active && this.player) {
            const screen = this.camera.worldToScreen(this.player.x, this.player.y);
            this.renderer.ctx.save();
            this.renderer.ctx.strokeStyle = '#ffaa00';
            this.renderer.ctx.lineWidth = 3;
            this.renderer.ctx.shadowColor = '#ffaa00';
            this.renderer.ctx.shadowBlur = 15;
            this.renderer.ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.3;
            this.renderer.ctx.beginPath();
            this.renderer.ctx.arc(screen.x, screen.y, 40, 0, Math.PI * 2);
            this.renderer.ctx.stroke();
            this.renderer.ctx.restore();
        }

        // Draw click indicators
        this.renderer.drawClickIndicators(this.clickIndicators, this.camera);

        // Draw attack mode range if active
        if (this.input.isAttackMode() && this.player) {
            this.renderer.drawAttackModeRange(this.player, this.camera);
        }

        // Draw skill cooldown UI
        if (this.player) {
            this.renderer.drawSkillCooldowns(this.player.skillCooldowns, this.skillSystem);
        }

        // Draw combo UI (top center)
        this.combo.draw(this.renderer.ctx, this.renderer.width / 2, 80);

        // Draw power-up UI (top left under HUD)
        this.powerUps.drawUI(this.renderer.ctx, 20, 120);

        // Draw flash effect
        this.effects.drawFlash(this.renderer.ctx, this.renderer.width, this.renderer.height);

        // Draw center announcements (kill streaks, etc.)
        this.effects.drawAnnouncement(this.renderer.ctx, this.renderer.width, this.renderer.height);
    }

    startGame() {
        // Initialize and start sound
        soundManager.init();
        soundManager.resume();
        soundManager.startBGM();

        this.gameTime = 0;
        this.kills = 0;
        this.gold = 0;
        this.shopOpen = false;

        this.enemies = [];
        this.bullets = [];
        this.pickups = [];
        this.particles.clear();
        this.damageNumbers = [];

        // Player starts at world origin
        this.player = new Player(0, 0);

        // Reset camera
        this.camera.x = -this.renderer.width / 2;
        this.camera.y = -this.renderer.height / 2;

        this.levelSystem.reset();
        this.skillSystem.reset();
        this.spawnSystem.reset();
        this.equipmentSystem.reset();
        this.weaponSystem.reset();
        this.combo.reset();
        this.powerUps.reset();
        this.empowerBuff = { active: false, duration: 0, timer: 0 };
        this.novaEffects = [];
        this.meteorEffects = [];
        this.laserEffect = null;
        this.blackholeEffect = null;

        // Reset ultimate
        this.ultimateGauge = 0;
        this.ultimateReady = false;
        this.ultimateActive = false;

        this.menu.hide();
        this.hud.show();
        this.bossHpContainer.classList.add('hidden');
        this.legendaryContainer.classList.add('hidden');

        // Set up input system with camera
        this.input.setCamera(this.camera, this.canvas);
        this.clickIndicators = [];

        // Show initial weapon selection
        this.showInitialWeaponSelect();
    }

    showInitialWeaponSelect() {
        this.state = GameState.WEAPON_SELECT;
        this.weaponSelectAnimating = false;

        // Get 3 random weapons (using SkillIcons for proper SVG icons)
        const allWeapons = [
            { id: 'orbiting_shield', name: '周回シールド', icon: SkillIcons.orbiting_shield, effect: 'プレイヤーの周りを回転するシールド', type: 'shield' },
            { id: 'fire_orb', name: 'ファイアオーブ', icon: SkillIcons.fire_orb, effect: '炎の球体が敵を焼く', type: 'fireOrb' },
            { id: 'lightning_ring', name: 'ライトニングリング', icon: SkillIcons.lightning_ring, effect: '周囲の敵に雷撃', type: 'lightning' },
            { id: 'poison_cloud', name: '毒雲', icon: SkillIcons.poison_cloud, effect: '毒のオーラで継続ダメージ', type: 'poison' },
            { id: 'boomerang', name: 'ブーメラン', icon: SkillIcons.boomerang, effect: '回転するブーメランが敵を斬る', type: 'boomerang' },
            { id: 'aura_blade', name: 'オーラブレード', icon: SkillIcons.aura_blade, effect: '広範囲に自動で攻撃するオーラ', type: 'auraBlade' }
        ];

        // Shuffle and pick 3
        const shuffled = allWeapons.sort(() => Math.random() - 0.5);
        this.weaponChoices = shuffled.slice(0, 3);

        // Show weapon selection UI
        this.showWeaponSelectUI();
    }

    showWeaponSelectUI() {
        const container = document.getElementById('skill-select');
        const optionsContainer = document.getElementById('skill-options');
        const title = container.querySelector('h2');

        title.textContent = 'CHOOSE YOUR WEAPON!';
        optionsContainer.innerHTML = '';

        this.weaponChoices.forEach((weapon, index) => {
            const card = document.createElement('div');
            card.className = 'skill-card weapon';
            card.dataset.index = index;

            card.innerHTML = `
                <div class="card-glow"></div>
                <div class="card-content">
                    <div class="category-badge">WEAPON</div>
                    <div class="icon-container">
                        <div class="icon-bg"></div>
                        <div class="icon">${weapon.icon}</div>
                    </div>
                    <div class="skill-info">
                        <div class="name">${weapon.name}</div>
                        <div class="effect">${weapon.effect}</div>
                    </div>
                    <div class="key-hint">
                        <span class="key">${index + 1}</span>
                        <span class="hint-text">を押して選択</span>
                    </div>
                </div>
                <div class="card-particles"></div>
            `;

            card.addEventListener('click', () => this.selectInitialWeapon(index));

            optionsContainer.appendChild(card);

            setTimeout(() => {
                card.classList.add('visible');
            }, 100 + index * 150);
        });

        container.classList.remove('hidden');
    }

    updateWeaponSelect() {
        if (this.weaponSelectAnimating) return;

        // Check for 1/2/3 key input
        const selection = this.input.getSkillSelection();
        if (selection >= 0 && selection < this.weaponChoices.length) {
            this.selectInitialWeapon(selection);
        }
    }

    selectInitialWeapon(index) {
        if (this.weaponSelectAnimating) return;
        if (index < 0 || index >= this.weaponChoices.length) return;

        this.weaponSelectAnimating = true;

        soundManager.playClick();
        const weapon = this.weaponChoices[index];

        // Visual selection feedback
        const cards = document.querySelectorAll('#skill-options .skill-card');
        cards.forEach((card, i) => {
            if (i === index) {
                card.classList.add('selected');
            } else {
                card.classList.add('not-selected');
            }
        });

        // Delay to show selection effect
        setTimeout(() => {
            // Add the weapon
            this.weaponSystem.addWeapon(weapon.type);

            // Hide selection and start playing
            document.getElementById('skill-select').classList.add('hidden');
            this.state = GameState.PLAYING;

            // Announce
            this.effects.announce(weapon.name + ' GET!', '#ff8800', 1.5);
        }, 300);
    }

    pause() {
        this.state = GameState.PAUSED;
        document.getElementById('pause-menu').classList.remove('hidden');
    }

    resume() {
        this.state = GameState.PLAYING;
        document.getElementById('pause-menu').classList.add('hidden');
    }

    gameOver() {
        // Stop BGM and play game over sound
        soundManager.stopBGM();
        soundManager.playGameOver();

        this.state = GameState.GAME_OVER;
        this.hud.reset();
        this.hud.hide();
        this.gameOverUI.show(this.levelSystem.level, this.gameTime, this.kills);
    }

    restart() {
        this.gameOverUI.hide();
        this.startGame();
    }

    returnToMenu() {
        this.state = GameState.MENU;
        this.hud.hide();
        this.gameOverUI.hide();
        this.bossHpContainer.classList.add('hidden');
        this.legendaryContainer.classList.add('hidden');
        document.getElementById('pause-menu').classList.add('hidden');
        this.menu.show();
    }

    // Shop methods
    openShop() {
        if (this.state !== GameState.PLAYING) return;
        this.shopOpen = true;
        this.hud.showShop();
        this.state = GameState.SHOP;
    }

    closeShop() {
        this.shopOpen = false;
        this.hud.hideShop();
        this.state = GameState.PLAYING;
    }

    purchaseSkill(skillId, price) {
        if (this.gold < price) return;

        this.gold -= price;
        this.skillSystem.acquireSkill(skillId);
        this.hud.updateGold(this.gold);

        // Play purchase sound
        soundManager.playClick();
    }

    getFormattedTime() {
        return formatTime(this.gameTime);
    }
}
