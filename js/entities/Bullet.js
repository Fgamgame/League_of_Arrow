// Bullet entity

export class Bullet {
    constructor(x, y, vx, vy, damage, isEnemyBullet = false, piercing = false) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.isEnemyBullet = isEnemyBullet;
        this.piercing = piercing;

        this.radius = isEnemyBullet ? 5 : 15;
        this.active = true;

        // Track enemies hit (for piercing)
        this.hitEnemies = new Set();
    }

    update(deltaTime, bounds) {
        if (!this.active) return;

        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Deactivate if out of bounds
        if (bounds) {
            if (this.x < -this.radius ||
                this.x > bounds.right + this.radius ||
                this.y < -this.radius ||
                this.y > bounds.bottom + this.radius) {
                this.active = false;
            }
        }
    }

    updateInfinite(deltaTime) {
        if (!this.active) return;
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
    }

    hasHitEnemy(enemy) {
        return this.hitEnemies.has(enemy);
    }

    markHitEnemy(enemy) {
        this.hitEnemies.add(enemy);
    }
}
