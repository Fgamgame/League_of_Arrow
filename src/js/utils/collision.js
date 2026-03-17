// Collision detection utilities

import { distance, circlesCollide } from './math.js';

export function checkCircleCollision(entity1, entity2) {
    return circlesCollide(
        entity1.x, entity1.y, entity1.radius,
        entity2.x, entity2.y, entity2.radius
    );
}

export function checkBulletEnemyCollisions(bullets, enemies) {
    const collisions = [];

    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        if (!bullet.active || bullet.isEnemyBullet) continue;

        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (!enemy.active) continue;

            if (checkCircleCollision(bullet, enemy)) {
                collisions.push({ bullet, enemy, bulletIndex: i, enemyIndex: j });
                if (!bullet.piercing) break;
            }
        }
    }

    return collisions;
}

export function checkEnemyBulletPlayerCollisions(bullets, player) {
    const collisions = [];

    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        if (!bullet.active || !bullet.isEnemyBullet) continue;

        if (checkCircleCollision(bullet, player)) {
            collisions.push({ bullet, bulletIndex: i });
        }
    }

    return collisions;
}

export function checkEnemyPlayerCollisions(enemies, player) {
    const collisions = [];

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (!enemy.active) continue;

        if (checkCircleCollision(enemy, player)) {
            collisions.push({ enemy, enemyIndex: i });
        }
    }

    return collisions;
}

export function checkPickupPlayerCollisions(pickups, player, magnetRange = 0) {
    const collisions = [];
    const attracted = [];

    for (let i = pickups.length - 1; i >= 0; i--) {
        const pickup = pickups[i];
        if (!pickup.active) continue;

        const dist = distance(pickup.x, pickup.y, player.x, player.y);

        if (dist <= player.radius + pickup.radius) {
            collisions.push({ pickup, pickupIndex: i });
        } else if (magnetRange > 0 && dist <= magnetRange) {
            attracted.push({ pickup, pickupIndex: i, distance: dist });
        }
    }

    return { collisions, attracted };
}

export function findNearestEnemy(x, y, enemies, maxRange = Infinity) {
    let nearest = null;
    let nearestDist = maxRange;

    for (const enemy of enemies) {
        if (!enemy.active) continue;

        const dist = distance(x, y, enemy.x, enemy.y);
        if (dist < nearestDist) {
            nearestDist = dist;
            nearest = enemy;
        }
    }

    return nearest;
}

export function getEntitiesInRange(x, y, entities, range) {
    return entities.filter(entity => {
        if (!entity.active) return false;
        return distance(x, y, entity.x, entity.y) <= range;
    });
}
