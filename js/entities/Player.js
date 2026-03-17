// Player entity with auto-attack bow (Dada Survivor style)

export const BowState = {
    IDLE: 'idle',
    DRAWING: 'drawing',
    RELEASING: 'releasing'
};

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15;

        // Stats
        this.maxHp = 100;
        this.hp = this.maxHp;
        this.speed = 250;
        this.damage = 12;
        this.attackSpeed = 1.5; // attacks per second
        this.bulletSpeed = 600;
        this.attackRange = 300; // Reduced range for LoL-style

        // Auto-attack timer (attacks continuously)
        this.attackTimer = 0;

        // Bow animation
        this.bowState = BowState.IDLE;
        this.bowAnimationTimer = 0;
        this.bowDrawProgress = 0;
        this.targetEnemy = null;

        // Animation timings (faster for rapid attacks)
        this.drawingTime = 0.1;
        this.releaseTime = 0.05;

        // Bow rotation (360 degrees, always faces target)
        this.bowAngle = 0;
        this.targetBowAngle = 0;
        this.bowRotationSpeed = 12; // radians per second

        // Invincibility
        this.invincible = false;
        this.invincibleTimer = 0;

        // Dash
        this.canDash = false;
        this.dashCooldown = 0;
        this.dashDuration = 0;
        this.dashDirection = { x: 0, y: 0 };

        // Movement direction (for sprite facing)
        this.facingRight = true;
        this.lastMoveX = 0;

        // Movement bonuses
        this.speedMultiplier = 1;
        this.attackSpeedMultiplier = 1;

        // Flag for when arrow should be fired
        this.shouldFireArrow = false;

        // Walking animation
        this.walkFrame = 0;
        this.walkTimer = 0;

        // Barrier shield
        this.barrier = 0;
        this.maxBarrier = 0;

        // Click-to-move target
        this.moveTarget = null;
        this.isMovingToTarget = false;

        // Active skills cooldowns
        this.skillCooldowns = {
            Q: 0,
            W: 0,
            E: 0,
            R: 0
        };

        // Phase skill state
        this.phasing = false;
        this.phasingTimer = 0;
    }

    update(deltaTime, input, bounds) {
        this.updateInfinite(deltaTime, input);

        // Keep player in bounds (for bounded mode)
        if (bounds) {
            this.x = Math.max(this.radius, Math.min(bounds.right - this.radius, this.x));
            this.y = Math.max(this.radius, Math.min(bounds.bottom - this.radius, this.y));
        }
    }

    updateInfinite(deltaTime, input) {
        // Update invincibility
        if (this.invincible) {
            this.invincibleTimer -= deltaTime;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }

        // Update phasing
        if (this.phasing) {
            this.phasingTimer -= deltaTime;
            if (this.phasingTimer <= 0) {
                this.phasing = false;
            }
        }

        // Update attack timer
        this.attackTimer += deltaTime;

        // Update skill cooldowns
        for (const key in this.skillCooldowns) {
            if (this.skillCooldowns[key] > 0) {
                this.skillCooldowns[key] -= deltaTime;
            }
        }

        // Update bow animation
        this.updateBowAnimation(deltaTime);

        // Smooth bow rotation toward target
        this.updateBowRotation(deltaTime);

        // Update dash
        if (this.dashDuration > 0) {
            this.dashDuration -= deltaTime;
            this.x += this.dashDirection.x * this.speed * 4 * deltaTime;
            this.y += this.dashDirection.y * this.speed * 4 * deltaTime;
        } else {
            // Click-to-move system
            this.moveTarget = input.getMoveTarget();

            if (this.moveTarget) {
                const dx = this.moveTarget.x - this.x;
                const dy = this.moveTarget.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 5) {
                    // Move toward target
                    const actualSpeed = this.speed * this.speedMultiplier;
                    const moveX = (dx / dist) * actualSpeed * deltaTime;
                    const moveY = (dy / dist) * actualSpeed * deltaTime;

                    this.x += moveX;
                    this.y += moveY;
                    this.isMovingToTarget = true;

                    // Update facing direction
                    if (dx !== 0) {
                        this.facingRight = dx > 0;
                        this.lastMoveX = dx > 0 ? 1 : -1;
                    }

                    // Walking animation
                    this.walkTimer += deltaTime;
                    if (this.walkTimer > 0.1) {
                        this.walkTimer = 0;
                        this.walkFrame = (this.walkFrame + 1) % 4;
                    }
                } else {
                    // Reached target
                    input.clearMoveTarget();
                    this.isMovingToTarget = false;
                    this.walkFrame = 0;
                }
            } else {
                this.isMovingToTarget = false;
                this.walkFrame = 0;
            }
        }

        // Dash cooldown
        if (this.dashCooldown > 0) {
            this.dashCooldown -= deltaTime;
        }

        // Check for dash input (Space to dash toward mouse)
        if (this.canDash && input.isDashPressed() && this.dashCooldown <= 0) {
            const mousePos = input.getMouseWorldPosition();
            const dx = mousePos.x - this.x;
            const dy = mousePos.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0) {
                this.dashDirection = { x: dx / dist, y: dy / dist };
                this.dashDuration = 0.15;
                this.dashCooldown = 1;
                this.invincible = true;
                this.invincibleTimer = 0.2;
            }
        }
    }

    updateBowRotation(deltaTime) {
        // Smoothly rotate bow toward target angle
        let angleDiff = this.targetBowAngle - this.bowAngle;

        // Normalize to -PI to PI
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        const maxRotation = this.bowRotationSpeed * deltaTime;
        if (Math.abs(angleDiff) < maxRotation) {
            this.bowAngle = this.targetBowAngle;
        } else {
            this.bowAngle += Math.sign(angleDiff) * maxRotation;
        }

        // Normalize bow angle
        while (this.bowAngle > Math.PI) this.bowAngle -= Math.PI * 2;
        while (this.bowAngle < -Math.PI) this.bowAngle += Math.PI * 2;
    }

    updateBowAnimation(deltaTime) {
        if (this.bowState === BowState.IDLE) {
            this.bowDrawProgress = 0;
            return;
        }

        this.bowAnimationTimer -= deltaTime;

        switch (this.bowState) {
            case BowState.DRAWING:
                const drawProgress = 1 - (this.bowAnimationTimer / (this.drawingTime / this.attackSpeedMultiplier));
                this.bowDrawProgress = Math.min(1, Math.max(0, drawProgress));
                if (this.bowAnimationTimer <= 0) {
                    this.bowState = BowState.RELEASING;
                    this.bowAnimationTimer = this.releaseTime;
                    this.shouldFireArrow = true;
                }
                break;

            case BowState.RELEASING:
                this.bowDrawProgress = Math.max(0, this.bowAnimationTimer / this.releaseTime);
                if (this.bowAnimationTimer <= 0) {
                    this.bowState = BowState.IDLE;
                    this.bowDrawProgress = 0;
                }
                break;
        }
    }

    canAttack() {
        const attackInterval = 1 / (this.attackSpeed * this.attackSpeedMultiplier);
        return this.attackTimer >= attackInterval && this.bowState === BowState.IDLE;
    }

    startBowAttack(target) {
        if (!this.canAttack()) return false;

        this.targetEnemy = target;
        this.targetBowAngle = Math.atan2(target.y - this.y, target.x - this.x);

        // Start drawing animation
        this.bowState = BowState.DRAWING;
        this.bowAnimationTimer = this.drawingTime / this.attackSpeedMultiplier;
        this.shouldFireArrow = false;
        this.attackTimer = 0;

        return true;
    }

    // Update target for tracking
    updateTarget(target) {
        if (target && target.active) {
            this.targetEnemy = target;
            this.targetBowAngle = Math.atan2(target.y - this.y, target.x - this.x);
        }
    }

    checkAndConsumeArrowFire() {
        if (this.shouldFireArrow) {
            this.shouldFireArrow = false;
            return true;
        }
        return false;
    }

    getBowAngle() {
        return this.bowAngle;
    }

    getAimDirection() {
        return this.bowAngle;
    }

    resetAttackCooldown() {
        this.attackTimer = 0;
    }

    isDrawingBow() {
        return this.bowState !== BowState.IDLE;
    }

    takeDamage(amount) {
        if (this.invincible) return;

        // Barrier absorbs damage first
        if (this.barrier > 0) {
            if (this.barrier >= amount) {
                this.barrier -= amount;
                return;
            } else {
                amount -= this.barrier;
                this.barrier = 0;
            }
        }

        this.hp = Math.max(0, this.hp - amount);
    }

    addBarrier(amount) {
        this.barrier += amount;
        this.maxBarrier += amount;
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    setInvincible(duration) {
        this.invincible = true;
        this.invincibleTimer = duration;
    }

    applySpeedBonus(multiplier) {
        this.speedMultiplier = multiplier;
    }

    applyAttackSpeedBonus(multiplier) {
        this.attackSpeedMultiplier = multiplier;
    }

    applyMaxHpBonus(bonus) {
        const hpRatio = this.hp / this.maxHp;
        this.maxHp += bonus;
        this.hp = this.maxHp * hpRatio;
    }

    enableDash() {
        this.canDash = true;
    }
}
