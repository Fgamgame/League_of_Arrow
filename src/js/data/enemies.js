// Enemy spawn configurations for waves

export const WaveConfigs = {
    // Wave patterns - Dada Survivor style (more enemies, faster spawns)
    basic: {
        enemies: [
            { type: 'melee', weight: 10 }
        ],
        spawnRate: 0.6,
        maxEnemies: 25
    },
    mixed: {
        enemies: [
            { type: 'melee', weight: 8 },
            { type: 'ranged', weight: 4 }
        ],
        spawnRate: 0.5,
        maxEnemies: 35
    },
    aggressive: {
        enemies: [
            { type: 'melee', weight: 6 },
            { type: 'charger', weight: 5 }
        ],
        spawnRate: 0.4,
        maxEnemies: 40
    },
    ranged: {
        enemies: [
            { type: 'ranged', weight: 8 },
            { type: 'melee', weight: 4 }
        ],
        spawnRate: 0.5,
        maxEnemies: 30
    },
    elite: {
        enemies: [
            { type: 'melee', weight: 5 },
            { type: 'ranged', weight: 3 },
            { type: 'eliteMelee', weight: 2 },
            { type: 'eliteRanged', weight: 2 }
        ],
        spawnRate: 0.4,
        maxEnemies: 45
    },
    swarm: {
        enemies: [
            { type: 'melee', weight: 10 }
        ],
        spawnRate: 0.2,
        maxEnemies: 60
    },
    // New wave types with special enemies
    explosive: {
        enemies: [
            { type: 'melee', weight: 5 },
            { type: 'exploder', weight: 6 }
        ],
        spawnRate: 0.5,
        maxEnemies: 35
    },
    splitting: {
        enemies: [
            { type: 'splitter', weight: 8 },
            { type: 'melee', weight: 4 }
        ],
        spawnRate: 0.6,
        maxEnemies: 25
    },
    defensive: {
        enemies: [
            { type: 'shield', weight: 5 },
            { type: 'healer', weight: 3 },
            { type: 'melee', weight: 4 }
        ],
        spawnRate: 0.5,
        maxEnemies: 30
    },
    chaos: {
        enemies: [
            { type: 'melee', weight: 4 },
            { type: 'ranged', weight: 3 },
            { type: 'charger', weight: 2 },
            { type: 'exploder', weight: 3 },
            { type: 'splitter', weight: 2 },
            { type: 'shield', weight: 2 },
            { type: 'healer', weight: 1 }
        ],
        spawnRate: 0.35,
        maxEnemies: 50
    },
    boss: {
        enemies: [
            { type: 'boss', weight: 1 }
        ],
        spawnRate: 999,
        maxEnemies: 1,
        isBossWave: true
    }
};

// Get wave config based on wave number
export function getWaveConfig(waveNumber) {
    // Boss wave every 5 waves
    if (waveNumber % 5 === 0) {
        return { ...WaveConfigs.boss, waveNumber };
    }

    // Progress difficulty with variety
    let config;
    if (waveNumber <= 2) {
        config = WaveConfigs.basic;
    } else if (waveNumber <= 3) {
        config = WaveConfigs.mixed;
    } else if (waveNumber === 4) {
        config = WaveConfigs.explosive;
    } else if (waveNumber <= 6) {
        const options = [WaveConfigs.aggressive, WaveConfigs.ranged, WaveConfigs.splitting];
        config = options[Math.floor(Math.random() * options.length)];
    } else if (waveNumber <= 8) {
        const options = [WaveConfigs.elite, WaveConfigs.defensive, WaveConfigs.explosive];
        config = options[Math.floor(Math.random() * options.length)];
    } else if (waveNumber <= 9) {
        config = WaveConfigs.chaos;
    } else {
        // High waves - full variety
        const configs = [
            WaveConfigs.mixed, WaveConfigs.aggressive, WaveConfigs.elite,
            WaveConfigs.swarm, WaveConfigs.explosive, WaveConfigs.splitting,
            WaveConfigs.defensive, WaveConfigs.chaos
        ];
        config = configs[Math.floor(Math.random() * configs.length)];
    }

    // Scale spawn rate and max enemies
    const scale = 1 + (waveNumber - 1) * 0.1;

    return {
        ...config,
        waveNumber,
        spawnRate: Math.max(0.25, config.spawnRate / scale),
        maxEnemies: Math.floor(config.maxEnemies * scale)
    };
}

// Select enemy type based on weights
export function selectEnemyType(enemies) {
    const totalWeight = enemies.reduce((sum, e) => sum + e.weight, 0);
    let random = Math.random() * totalWeight;

    for (const enemy of enemies) {
        random -= enemy.weight;
        if (random <= 0) {
            return enemy.type;
        }
    }

    return enemies[0].type;
}
