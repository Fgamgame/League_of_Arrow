// Skill definitions with SVG icons

// SVG Icon definitions
export const SkillIcons = {
    // Attack icons
    damage_up: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z"/>
    </svg>`,

    bullet_speed_up: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 12H19M19 12L13 6M19 12L13 18"/>
        <path d="M2 12H6" opacity="0.5"/>
    </svg>`,

    piercing: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 12H20"/>
        <path d="M16 8L20 12L16 16"/>
        <circle cx="8" cy="12" r="2" fill="currentColor"/>
        <circle cx="14" cy="12" r="2" fill="currentColor"/>
    </svg>`,

    spread_shot: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 12L12 12"/>
        <path d="M12 12L20 6"/>
        <path d="M12 12L20 12"/>
        <path d="M12 12L20 18"/>
        <circle cx="20" cy="6" r="2" fill="currentColor"/>
        <circle cx="20" cy="12" r="2" fill="currentColor"/>
        <circle cx="20" cy="18" r="2" fill="currentColor"/>
    </svg>`,

    attack_speed_up: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor"/>
    </svg>`,

    // Defense icons
    heal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 4V20M4 12H20" stroke-width="4" stroke-linecap="round"/>
    </svg>`,

    max_hp_up: `<svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>`,

    invincibility_up: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 3L4 7V12C4 16.5 7.5 20.5 12 22C16.5 20.5 20 16.5 20 12V7L12 3Z" fill="currentColor" opacity="0.3"/>
        <path d="M12 3L4 7V12C4 16.5 7.5 20.5 12 22C16.5 20.5 20 16.5 20 12V7L12 3Z"/>
        <path d="M9 12L11 14L15 10" stroke-width="2.5"/>
    </svg>`,

    // Movement icons
    speed_up: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 19V5M12 5L6 11M12 5L18 11"/>
        <path d="M6 19H18"/>
    </svg>`,

    dash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 12H14" stroke-dasharray="2 2"/>
        <path d="M14 12H20"/>
        <path d="M17 8L21 12L17 16"/>
        <circle cx="12" cy="12" r="3" fill="currentColor"/>
    </svg>`,

    // Special icons
    magnet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 8C4 8 4 14 8 18C12 22 18 22 22 18" stroke-width="3"/>
        <rect x="2" y="4" width="6" height="6" fill="#ff4444"/>
        <rect x="16" y="14" width="6" height="6" fill="#4444ff"/>
    </svg>`,

    lucky: `<svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C10.8 2 10 3 10 4C10 5 9 6 8 6C6 6 4 7.5 4 10C4 12 5 14 7 15C7 16 6.5 17 6 18C5.5 19 6 20 7 20C8 20 10 19 12 19C14 19 16 20 17 20C18 20 18.5 19 18 18C17.5 17 17 16 17 15C19 14 20 12 20 10C20 7.5 18 6 16 6C15 6 14 5 14 4C14 3 13.2 2 12 2Z"/>
    </svg>`,

    critical: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
        <path d="M12 2V6M12 18V22M2 12H6M18 12H22"/>
    </svg>`,

    // Weapon icons
    orbiting_shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="8" stroke-dasharray="4 2"/>
        <circle cx="12" cy="4" r="3" fill="#4488ff"/>
        <circle cx="12" cy="20" r="3" fill="#4488ff"/>
    </svg>`,

    fire_orb: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="8" stroke-dasharray="3 3"/>
        <circle cx="5" cy="12" r="3" fill="#ff4400"/>
        <circle cx="19" cy="12" r="3" fill="#ff4400"/>
        <circle cx="12" cy="5" r="3" fill="#ff6600"/>
        <circle cx="12" cy="19" r="3" fill="#ff6600"/>
    </svg>`,

    lightning_ring: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="9" stroke="#ffff00" stroke-dasharray="2 2"/>
        <polygon points="12 3 14 10 11 10 13 17 10 17 8 10 11 10" fill="#ffff00"/>
    </svg>`,

    poison_cloud: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="8" fill="rgba(100, 200, 100, 0.3)" stroke="#66cc66"/>
        <circle cx="8" cy="10" r="2" fill="#44aa44"/>
        <circle cx="14" cy="9" r="3" fill="#55bb55"/>
        <circle cx="12" cy="15" r="2" fill="#44aa44"/>
    </svg>`,

    boomerang: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="8" stroke-dasharray="4 4"/>
        <path d="M6 12L12 8L18 12L12 16Z" fill="#aa8855" stroke="#886633"/>
    </svg>`,

    // New defense skill - Barrier Shield
    barrier_shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L3 7V12C3 17.5 7 21.5 12 23C17 21.5 21 17.5 21 12V7L12 2Z" fill="rgba(0, 200, 255, 0.3)"/>
        <path d="M12 2L3 7V12C3 17.5 7 21.5 12 23C17 21.5 21 17.5 21 12V7L12 2Z"/>
        <circle cx="12" cy="12" r="4" fill="rgba(0, 255, 255, 0.5)"/>
    </svg>`,

    // New attack skill - Shockwave (area attack with cooldown)
    shockwave: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3" fill="currentColor"/>
        <circle cx="12" cy="12" r="6" opacity="0.7"/>
        <circle cx="12" cy="12" r="9" opacity="0.4"/>
        <circle cx="12" cy="12" r="11" opacity="0.2"/>
    </svg>`,

    // Auto area attack - Aura Blade
    aura_blade: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" fill="rgba(255, 100, 100, 0.2)" stroke="#ff4444"/>
        <circle cx="12" cy="12" r="6" fill="rgba(255, 150, 50, 0.3)" stroke="#ff8800"/>
        <circle cx="12" cy="12" r="2" fill="#ffaa00"/>
        <path d="M12 2L14 6L12 4L10 6L12 2Z" fill="#ff4444"/>
        <path d="M22 12L18 14L20 12L18 10L22 12Z" fill="#ff4444"/>
        <path d="M12 22L10 18L12 20L14 18L12 22Z" fill="#ff4444"/>
        <path d="M2 12L6 10L4 12L6 14L2 12Z" fill="#ff4444"/>
    </svg>`,

    // Legendary Skills Icons (Boss rewards only)
    time_slow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6V12L16 14"/>
        <path d="M4 12H6M18 12H20M12 4V6M12 18V20" opacity="0.5"/>
    </svg>`,

    chain_lightning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M13 2L4 14H11L10 22L20 10H13L13 2Z" fill="currentColor"/>
        <path d="M16 8L22 6" stroke-width="1.5"/>
        <path d="M18 14L23 16" stroke-width="1.5"/>
    </svg>`,

    vampire: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#880000"/>
        <path d="M8 10L10 14M16 10L14 14" stroke="#fff" stroke-width="2"/>
    </svg>`,

    explosion: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="4" fill="#ff4400"/>
        <path d="M12 2L14 8L12 6L10 8L12 2Z" fill="#ff6600"/>
        <path d="M22 12L16 14L18 12L16 10L22 12Z" fill="#ff6600"/>
        <path d="M12 22L10 16L12 18L14 16L12 22Z" fill="#ff6600"/>
        <path d="M2 12L8 10L6 12L8 14L2 12Z" fill="#ff6600"/>
    </svg>`,

    double_shot: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 12H18"/>
        <path d="M14 8L18 12L14 16"/>
        <circle cx="20" cy="12" r="3" fill="currentColor"/>
        <text x="20" y="13" font-size="5" fill="white" text-anchor="middle">x2</text>
    </svg>`,

    revival: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L15 8H9L12 2Z" fill="#00ff88"/>
        <circle cx="12" cy="14" r="6"/>
        <path d="M12 11V17M9 14H15"/>
        <path d="M8 20L12 22L16 20" stroke-width="1.5"/>
    </svg>`,

    // Active Skills (QWER) - Multiple options per key
    // Q Skills (Attack Buffs)
    skill_empower: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="8" fill="rgba(255, 170, 0, 0.3)"/>
        <path d="M12 4V20" stroke-width="3"/>
        <path d="M8 8L12 4L16 8"/>
        <path d="M8 16L12 20L16 16"/>
        <circle cx="12" cy="12" r="3" fill="currentColor"/>
    </svg>`,
    skill_berserk: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="9" fill="rgba(255, 0, 0, 0.3)"/>
        <path d="M12 6L14 10H10L12 6Z" fill="currentColor"/>
        <path d="M8 14L12 10L16 14" stroke-width="2"/>
        <path d="M6 18L12 12L18 18" stroke-width="2"/>
    </svg>`,
    skill_precision: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="9"/>
        <circle cx="12" cy="12" r="5"/>
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
        <path d="M12 3V7M12 17V21M3 12H7M17 12H21"/>
    </svg>`,

    // W Skills (Area Attacks)
    skill_nova: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3" fill="currentColor"/>
        <circle cx="12" cy="12" r="6" stroke-dasharray="4 2"/>
        <circle cx="12" cy="12" r="9" stroke-dasharray="4 2"/>
        <path d="M12 2V6M12 18V22M2 12H6M18 12H22"/>
    </svg>`,
    skill_frost_wave: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3" fill="rgba(100, 200, 255, 0.5)"/>
        <path d="M12 3L12 7M12 17L12 21"/>
        <path d="M3 12L7 12M17 12L21 12"/>
        <path d="M5.6 5.6L8.4 8.4M15.6 15.6L18.4 18.4"/>
        <path d="M5.6 18.4L8.4 15.6M15.6 8.4L18.4 5.6"/>
    </svg>`,
    skill_gravity: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="4" fill="rgba(128, 0, 255, 0.5)"/>
        <circle cx="12" cy="12" r="8" stroke-dasharray="2 2"/>
        <path d="M12 4L12 8M12 16L12 20"/>
        <path d="M4 12L8 12M16 12L20 12"/>
        <path d="M6 6L9 9M15 15L18 18M6 18L9 15M15 9L18 6"/>
    </svg>`,

    // E Skills (Mobility)
    skill_dash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M5 12H15" stroke-dasharray="3 2"/>
        <path d="M15 12L22 12"/>
        <path d="M18 8L22 12L18 16"/>
        <circle cx="8" cy="12" r="4" fill="rgba(100, 255, 100, 0.3)"/>
    </svg>`,
    skill_blink: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="6" cy="12" r="3" fill="rgba(100, 100, 255, 0.5)" stroke-dasharray="2 2"/>
        <circle cx="18" cy="12" r="3" fill="currentColor"/>
        <path d="M9 12H15" stroke-dasharray="2 2"/>
        <path d="M12 9L15 12L12 15"/>
    </svg>`,
    skill_phase: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="8" stroke-dasharray="4 2"/>
        <circle cx="12" cy="12" r="4" fill="rgba(200, 100, 255, 0.3)"/>
        <path d="M12 4V8M12 16V20M4 12H8M16 12H20"/>
    </svg>`,

    // R Skills (Ultimate)
    skill_meteor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="16" r="6" fill="rgba(255, 100, 0, 0.4)"/>
        <circle cx="12" cy="16" r="3" fill="rgba(255, 200, 0, 0.6)"/>
        <path d="M12 2L12 10" stroke-width="3"/>
        <path d="M8 4L12 8L16 4"/>
        <path d="M6 6L10 10M18 6L14 10"/>
    </svg>`,
    skill_laser: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="10" y="2" width="4" height="20" fill="rgba(255, 0, 0, 0.5)"/>
        <path d="M6 12H18" stroke-width="3"/>
        <circle cx="12" cy="12" r="3" fill="currentColor"/>
        <path d="M12 2V22" stroke-width="4" stroke="rgba(255, 100, 100, 0.8)"/>
    </svg>`,
    skill_blackhole: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="4" fill="rgba(50, 0, 100, 0.8)"/>
        <circle cx="12" cy="12" r="7" stroke-dasharray="3 2"/>
        <circle cx="12" cy="12" r="10" stroke-dasharray="2 3"/>
        <path d="M5 5L8 8M19 5L16 8M5 19L8 16M19 19L16 16"/>
    </svg>`
};

export const Skills = {
    // Attack skills
    damage_up: {
        id: 'damage_up',
        name: '攻撃力UP',
        icon: SkillIcons.damage_up,
        category: 'attack',
        effect: 'ダメージ+25%',
        bonusType: 'damage',
        bonusValue: 0.25,
        stackable: true,
        maxStacks: 5
    },
    bullet_speed_up: {
        id: 'bullet_speed_up',
        name: '弾速UP',
        icon: SkillIcons.bullet_speed_up,
        category: 'attack',
        effect: '弾の速度+40%',
        bonusType: 'bulletSpeed',
        bonusValue: 0.4,
        stackable: true,
        maxStacks: 3
    },
    piercing: {
        id: 'piercing',
        name: '貫通弾',
        icon: SkillIcons.piercing,
        category: 'attack',
        effect: '弾が敵を貫通',
        bonusType: 'special',
        stackable: false
    },
    spread_shot: {
        id: 'spread_shot',
        name: '拡散弾',
        icon: SkillIcons.spread_shot,
        category: 'attack',
        effect: '3方向に発射',
        bonusType: 'special',
        stackable: false
    },
    attack_speed_up: {
        id: 'attack_speed_up',
        name: '攻撃速度UP',
        icon: SkillIcons.attack_speed_up,
        category: 'attack',
        effect: '攻撃速度+30%',
        bonusType: 'attackSpeed',
        bonusValue: 0.3,
        stackable: true,
        maxStacks: 4
    },

    // Defense skills
    heal: {
        id: 'heal',
        name: 'HP回復',
        icon: SkillIcons.heal,
        category: 'defense',
        effect: 'HP+30回復',
        bonusType: 'instant',
        instantEffect: 'heal',
        instantValue: 30,
        stackable: true,
        maxStacks: 99
    },
    max_hp_up: {
        id: 'max_hp_up',
        name: '最大HPUP',
        icon: SkillIcons.max_hp_up,
        category: 'defense',
        effect: '最大HP+25%',
        bonusType: 'maxHp',
        bonusValue: 0.25,
        stackable: true,
        maxStacks: 5
    },
    invincibility_up: {
        id: 'invincibility_up',
        name: '無敵時間延長',
        icon: SkillIcons.invincibility_up,
        category: 'defense',
        effect: 'ダメージ後の無敵+0.5秒',
        bonusType: 'invincibility',
        bonusValue: 0.5,
        stackable: true,
        maxStacks: 3
    },

    // Movement skills
    speed_up: {
        id: 'speed_up',
        name: '移動速度UP',
        icon: SkillIcons.speed_up,
        category: 'movement',
        effect: '移動速度+25%',
        bonusType: 'speed',
        bonusValue: 0.25,
        stackable: true,
        maxStacks: 4
    },
    dash: {
        id: 'dash',
        name: 'ダッシュ',
        icon: SkillIcons.dash,
        category: 'movement',
        effect: 'スペースで短距離ダッシュ',
        bonusType: 'special',
        stackable: false
    },

    // Special skills
    lucky: {
        id: 'lucky',
        name: 'ラッキー',
        icon: SkillIcons.lucky,
        category: 'special',
        effect: 'レアドロップ率UP',
        bonusType: 'special',
        stackable: false
    },
    critical: {
        id: 'critical',
        name: 'クリティカル',
        icon: SkillIcons.critical,
        category: 'special',
        effect: 'クリティカル率+10%',
        bonusType: 'critical',
        bonusValue: 0.1,
        stackable: true,
        maxStacks: 4
    },

    // Weapon skills (orbital weapons)
    orbiting_shield: {
        id: 'orbiting_shield',
        name: '周回シールド',
        icon: SkillIcons.orbiting_shield,
        category: 'weapon',
        effect: 'プレイヤーの周りを回転するシールド',
        bonusType: 'weapon',
        weaponType: 'shield',
        stackable: true,
        maxStacks: 4
    },
    fire_orb: {
        id: 'fire_orb',
        name: 'ファイアオーブ',
        icon: SkillIcons.fire_orb,
        category: 'weapon',
        effect: '炎の球体が敵を焼く',
        bonusType: 'weapon',
        weaponType: 'fireOrb',
        stackable: true,
        maxStacks: 4
    },
    lightning_ring: {
        id: 'lightning_ring',
        name: 'ライトニングリング',
        icon: SkillIcons.lightning_ring,
        category: 'weapon',
        effect: '周囲の敵に雷撃',
        bonusType: 'weapon',
        weaponType: 'lightning',
        stackable: true,
        maxStacks: 3
    },
    poison_cloud: {
        id: 'poison_cloud',
        name: '毒雲',
        icon: SkillIcons.poison_cloud,
        category: 'weapon',
        effect: '毒のオーラで継続ダメージ',
        bonusType: 'weapon',
        weaponType: 'poison',
        stackable: true,
        maxStacks: 3
    },
    boomerang: {
        id: 'boomerang',
        name: 'ブーメラン',
        icon: SkillIcons.boomerang,
        category: 'weapon',
        effect: '回転するブーメランが敵を斬る',
        bonusType: 'weapon',
        weaponType: 'boomerang',
        stackable: true,
        maxStacks: 3
    },
    aura_blade: {
        id: 'aura_blade',
        name: 'オーラブレード',
        icon: SkillIcons.aura_blade,
        category: 'weapon',
        effect: '広範囲に自動で攻撃するオーラ',
        bonusType: 'weapon',
        weaponType: 'auraBlade',
        stackable: true,
        maxStacks: 5
    },

    // New Defense Skill - Barrier Shield
    barrier_shield: {
        id: 'barrier_shield',
        name: 'バリアシールド',
        icon: SkillIcons.barrier_shield,
        category: 'defense',
        effect: 'ダメージを30吸収するバリア',
        bonusType: 'barrier',
        bonusValue: 30,
        stackable: true,
        maxStacks: 5
    },

    // New Attack Skill - Shockwave
    shockwave: {
        id: 'shockwave',
        name: 'ショックウェーブ',
        icon: SkillIcons.shockwave,
        category: 'attack',
        effect: '5秒ごとに周囲の敵にダメージ',
        bonusType: 'weapon',
        weaponType: 'shockwave',
        stackable: true,
        maxStacks: 3
    },

};

// Active Skills organized by key slot (QWER)
export const ActiveSkills = {
    // Q Skills - Attack Buffs
    Q: {
        skill_empower: {
            id: 'skill_empower',
            name: 'エンパワー',
            icon: SkillIcons.skill_empower,
            category: 'active',
            effect: '5秒間攻撃力2倍＆貫通付与',
            description: '通常攻撃を大幅強化',
            activeKey: 'Q',
            stackable: true,
            maxStacks: 3
        },
        skill_berserk: {
            id: 'skill_berserk',
            name: 'バーサーク',
            icon: SkillIcons.skill_berserk,
            category: 'active',
            effect: '攻撃速度3倍、被ダメージ1.5倍',
            description: 'リスクと引き換えに超連射',
            activeKey: 'Q',
            stackable: true,
            maxStacks: 3
        },
        skill_precision: {
            id: 'skill_precision',
            name: 'プレシジョン',
            icon: SkillIcons.skill_precision,
            category: 'active',
            effect: '5秒間クリティカル率100%',
            description: '全攻撃がクリティカル',
            activeKey: 'Q',
            stackable: true,
            maxStacks: 3
        }
    },

    // W Skills - Area Attacks
    W: {
        skill_nova: {
            id: 'skill_nova',
            name: 'ノヴァ',
            icon: SkillIcons.skill_nova,
            category: 'active',
            effect: '周囲の敵全員にダメージ',
            description: '即発動の範囲攻撃',
            activeKey: 'W',
            stackable: true,
            maxStacks: 3
        },
        skill_frost_wave: {
            id: 'skill_frost_wave',
            name: 'フロストウェーブ',
            icon: SkillIcons.skill_frost_wave,
            category: 'active',
            effect: '範囲ダメージ＋敵を凍結',
            description: '敵を3秒間停止させる',
            activeKey: 'W',
            stackable: true,
            maxStacks: 3
        },
        skill_gravity: {
            id: 'skill_gravity',
            name: 'グラビティ',
            icon: SkillIcons.skill_gravity,
            category: 'active',
            effect: '敵を中心に引き寄せてダメージ',
            description: '敵を集めて一網打尽',
            activeKey: 'W',
            stackable: true,
            maxStacks: 3
        }
    },

    // E Skills - Mobility
    E: {
        skill_dash: {
            id: 'skill_dash',
            name: 'イヴェイド',
            icon: SkillIcons.skill_dash,
            category: 'active',
            effect: 'マウス方向へ高速ダッシュ',
            description: '無敵時間付きの回避',
            activeKey: 'E',
            stackable: true,
            maxStacks: 3
        },
        skill_blink: {
            id: 'skill_blink',
            name: 'ブリンク',
            icon: SkillIcons.skill_blink,
            category: 'active',
            effect: 'マウス位置へ瞬間移動',
            description: '長距離を一瞬で移動',
            activeKey: 'E',
            stackable: true,
            maxStacks: 3
        },
        skill_phase: {
            id: 'skill_phase',
            name: 'フェイズ',
            icon: SkillIcons.skill_phase,
            category: 'active',
            effect: '3秒間透明化＆無敵',
            description: '敵をすり抜けられる',
            activeKey: 'E',
            stackable: true,
            maxStacks: 3
        }
    },

    // R Skills - Ultimate
    R: {
        skill_meteor: {
            id: 'skill_meteor',
            name: 'メテオストライク',
            icon: SkillIcons.skill_meteor,
            category: 'active',
            effect: '超大型範囲攻撃＆スロー',
            description: '隕石を落として大爆発',
            activeKey: 'R',
            stackable: true,
            maxStacks: 3
        },
        skill_laser: {
            id: 'skill_laser',
            name: 'デスレーザー',
            icon: SkillIcons.skill_laser,
            category: 'active',
            effect: '貫通レーザーで直線上を薙ぎ払う',
            description: '一直線上の敵を殲滅',
            activeKey: 'R',
            stackable: true,
            maxStacks: 3
        },
        skill_blackhole: {
            id: 'skill_blackhole',
            name: 'ブラックホール',
            icon: SkillIcons.skill_blackhole,
            category: 'active',
            effect: '敵を吸い込み続けてダメージ',
            description: '持続する範囲攻撃',
            activeKey: 'R',
            stackable: true,
            maxStacks: 3
        }
    }
};

// Get random active skills for a specific key
export function getRandomActiveSkills(key, count = 3) {
    const keySkills = ActiveSkills[key];
    if (!keySkills) return [];

    const skillArray = Object.values(keySkills);
    const shuffled = skillArray.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, skillArray.length));
}

// Legendary Skills (Boss rewards only - not in normal pool)
export const LegendarySkills = {
    time_slow: {
        id: 'time_slow',
        name: 'タイムスロー',
        icon: SkillIcons.time_slow,
        category: 'legendary',
        effect: '周囲の敵の動きを30%遅くする',
        bonusType: 'special',
        isLegendary: true,
        stackable: true,
        maxStacks: 3
    },
    chain_lightning: {
        id: 'chain_lightning',
        name: 'チェインライトニング',
        icon: SkillIcons.chain_lightning,
        category: 'legendary',
        effect: '攻撃が3体の敵に連鎖する',
        bonusType: 'special',
        isLegendary: true,
        stackable: true,
        maxStacks: 3
    },
    vampire: {
        id: 'vampire',
        name: 'ヴァンパイア',
        icon: SkillIcons.vampire,
        category: 'legendary',
        effect: '敵を倒すとHP5回復',
        bonusType: 'special',
        isLegendary: true,
        stackable: true,
        maxStacks: 3
    },
    explosion: {
        id: 'explosion',
        name: 'エクスプロージョン',
        icon: SkillIcons.explosion,
        category: 'legendary',
        effect: '敵を倒すと周囲に爆発ダメージ',
        bonusType: 'special',
        isLegendary: true,
        stackable: true,
        maxStacks: 3
    },
    double_shot: {
        id: 'double_shot',
        name: 'ダブルショット',
        icon: SkillIcons.double_shot,
        category: 'legendary',
        effect: '一発で2倍のダメージを与える',
        bonusType: 'damage',
        bonusValue: 1.0,
        isLegendary: true,
        stackable: true,
        maxStacks: 3
    },
    revival: {
        id: 'revival',
        name: 'リバイバル',
        icon: SkillIcons.revival,
        category: 'legendary',
        effect: '死亡時にHP50%で復活（1回）',
        bonusType: 'special',
        isLegendary: true,
        stackable: true,
        maxStacks: 2
    }
};

// Get random skills for level up selection (excludes active skills - those are in ActiveSkills)
export function getRandomSkills(count, acquiredSkills) {
    const availableSkills = Object.values(Skills).filter(skill => {
        // Exclude active skills (QWER skills are handled separately)
        if (skill.category === 'active') {
            return false;
        }
        if (!skill.stackable && acquiredSkills.has(skill.id)) {
            return false;
        }
        const currentStacks = acquiredSkills.get(skill.id) || 0;
        if (skill.maxStacks && currentStacks >= skill.maxStacks) {
            return false;
        }
        return true;
    });

    const shuffled = availableSkills.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// Get random legendary skills for boss rewards
export function getLegendarySkills(count, acquiredSkills) {
    const availableSkills = Object.values(LegendarySkills).filter(skill => {
        if (!skill.stackable && acquiredSkills.has(skill.id)) {
            return false;
        }
        const currentStacks = acquiredSkills.get(skill.id) || 0;
        if (skill.maxStacks && currentStacks >= skill.maxStacks) {
            return false;
        }
        return true;
    });

    const shuffled = availableSkills.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}
