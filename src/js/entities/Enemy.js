// Ultra-lightweight Enemy class

export class Enemy {
    constructor(x, y, config) {
        this.x = x;
        this.y = y;
        this.type = config.type;
        this.hp = config.hp;
        this.maxHp = config.hp;
        this.damage = config.damage;
        this.speed = config.speed;
        this.radius = config.radius;
        this.expValue = config.expValue;
        this.attackRate = config.attackRate || 0;
        this.attackTimer = 0;
        this.active = true;

        // Boss properties
        this.isBoss = config.isBoss || false;
        this.attackPattern = config.attackPattern || null;
        this.attackCooldown = config.attackCooldown || 3;

        // Special enemy properties
        this.explosionRadius = config.explosionRadius || 0;
        this.explosionDamage = config.explosionDamage || 0;
        this.splitCount = config.splitCount || 0;
        this.shieldReduction = config.shieldReduction || 0;
        this.healRange = config.healRange || 0;
        this.healAmount = config.healAmount || 0;
        this.healRate = config.healRate || 0;

        // Status effects
        this.frozen = false;
        this.frozenTimer = 0;

        // Weapon hit cooldown (prevents multi-hit per frame)
        this.weaponHitCooldown = 0;
    }

    update(dt, player) {
        if (!player) return;

        // Update weapon hit cooldown
        if (this.weaponHitCooldown > 0) {
            this.weaponHitCooldown -= dt;
        }

        // Update frozen timer
        if (this.frozen) {
            this.frozenTimer -= dt;
            if (this.frozenTimer <= 0) {
                this.frozen = false;
            }
            return; // Don't move while frozen
        }

        if (this.attackRate > 0) this.attackTimer += dt;

        // Simple chase
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const d = Math.sqrt(dx * dx + dy * dy);

        if (d > 1) {
            // Cowboy keeps distance
            if (this.type === 'cowboy' && d < 200) return;

            const s = this.speed * dt / d;
            this.x += dx * s;
            this.y += dy * s;
        }
    }

    canAttack() {
        return this.attackRate > 0 && this.attackTimer >= this.attackRate;
    }

    takeDamage(dmg) {
        this.hp -= dmg;
    }

    getHpRatio() {
        return this.hp / this.maxHp;
    }
}
