// Enemy type definitions

export const EnemyTypes = {
    // Basic melee enemy - moves toward player
    melee: {
        type: 'melee',
        radius: 12,
        hp: 20,
        speed: 80,
        damage: 10,
        expValue: 1
    },

    // Ranged enemy - keeps distance and shoots
    ranged: {
        type: 'ranged',
        radius: 10,
        hp: 15,
        speed: 60,
        damage: 8,
        expValue: 2,
        attackRange: 250,
        attackSpeed: 0.8,
        bulletSpeed: 150
    },

    // Charger enemy - fast dash attacks
    charger: {
        type: 'charger',
        radius: 14,
        hp: 25,
        speed: 50,
        damage: 15,
        expValue: 2,
        chargeSpeed: 350,
        chargeCooldown: 2
    },

    // Elite melee - stronger version
    eliteMelee: {
        type: 'elite',
        radius: 18,
        hp: 80,
        speed: 70,
        damage: 20,
        expValue: 5
    },

    // Elite ranged - stronger ranged
    eliteRanged: {
        type: 'elite',
        radius: 15,
        hp: 60,
        speed: 50,
        damage: 15,
        expValue: 5,
        attackRange: 300,
        attackSpeed: 1.2,
        bulletSpeed: 200
    },

    // Boss - appears every 5 waves
    boss: {
        type: 'boss',
        radius: 35,
        hp: 300,
        speed: 40,
        damage: 25,
        expValue: 20,
        attackRange: 350,
        attackSpeed: 1.5,
        bulletSpeed: 180
    },

    // Exploder - explodes on death dealing AOE damage
    exploder: {
        type: 'exploder',
        radius: 12,
        hp: 15,
        speed: 100,
        damage: 8,
        expValue: 2,
        explosionRadius: 80,
        explosionDamage: 20
    },

    // Splitter - splits into smaller enemies on death
    splitter: {
        type: 'splitter',
        radius: 14,
        hp: 30,
        speed: 60,
        damage: 10,
        expValue: 3,
        splitCount: 2
    },

    // Mini splitter - spawned when splitter dies
    miniSplitter: {
        type: 'splitter',
        radius: 8,
        hp: 10,
        speed: 90,
        damage: 5,
        expValue: 1,
        splitCount: 0
    },

    // Shield - has frontal shield that reduces damage
    shield: {
        type: 'shield',
        radius: 16,
        hp: 50,
        speed: 50,
        damage: 15,
        expValue: 4,
        shieldReduction: 0.7
    },

    // Healer - heals nearby enemies
    healer: {
        type: 'healer',
        radius: 12,
        hp: 25,
        speed: 40,
        damage: 5,
        expValue: 5,
        healRange: 150,
        healAmount: 5,
        healRate: 2
    }
};

// Scaling functions for difficulty
export function scaleEnemyStats(baseConfig, wave) {
    const hpScale = 1 + (wave - 1) * 0.15;
    const damageScale = 1 + (wave - 1) * 0.1;
    const speedScale = Math.min(1.5, 1 + (wave - 1) * 0.02);

    return {
        ...baseConfig,
        hp: Math.floor(baseConfig.hp * hpScale),
        damage: Math.floor(baseConfig.damage * damageScale),
        speed: baseConfig.speed * speedScale,
        expValue: Math.floor(baseConfig.expValue * (1 + (wave - 1) * 0.1))
    };
}

// Get random enemy type for wave
export function getEnemyTypeForWave(wave) {
    const types = ['melee'];

    if (wave >= 2) types.push('ranged');
    if (wave >= 3) types.push('charger');
    if (wave >= 5) types.push('eliteMelee');
    if (wave >= 7) types.push('eliteRanged');

    // Weight toward basic enemies
    const weights = {
        melee: 10,
        ranged: 5,
        charger: 4,
        eliteMelee: 2,
        eliteRanged: 2
    };

    let totalWeight = 0;
    for (const type of types) {
        totalWeight += weights[type];
    }

    let random = Math.random() * totalWeight;
    for (const type of types) {
        random -= weights[type];
        if (random <= 0) {
            return type;
        }
    }

    return 'melee';
}
