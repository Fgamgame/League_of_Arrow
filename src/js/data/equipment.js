// Equipment definitions with SVG icons

export const EquipmentIcons = {
    blaster: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 14L8 10L12 14" fill="currentColor"/>
        <rect x="8" y="10" width="12" height="4" rx="1" fill="currentColor"/>
        <path d="M18 10L22 12L18 14"/>
        <circle cx="10" cy="12" r="1" fill="var(--bg-dark)"/>
    </svg>`,

    shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 3L4 7V12C4 16.5 7.5 20.5 12 22C16.5 20.5 20 16.5 20 12V7L12 3Z" fill="currentColor" opacity="0.3"/>
        <path d="M12 3L4 7V12C4 16.5 7.5 20.5 12 22C16.5 20.5 20 16.5 20 12V7L12 3Z"/>
        <path d="M12 8V16M8 12H16"/>
    </svg>`,

    booster: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2L8 6H10V12H14V6H16L12 2Z" fill="currentColor"/>
        <path d="M8 14L6 22H10L12 16L14 22H18L16 14H8Z" fill="currentColor" opacity="0.7"/>
        <path d="M8 14H16"/>
    </svg>`
};

export const Equipment = {
    blaster: {
        id: 'blaster',
        name: '基本ブラスター',
        icon: EquipmentIcons.blaster,
        color: '#ff4444',
        maxLevel: 5,
        effect: (level) => ({
            type: 'damage',
            value: level * 5
        }),
        description: (level) => `攻撃力+${level * 5}`
    },
    shield: {
        id: 'shield',
        name: 'プラズマシールド',
        icon: EquipmentIcons.shield,
        color: '#44ff44',
        maxLevel: 5,
        effect: (level) => ({
            type: 'damageReduction',
            value: level * 0.05
        }),
        description: (level) => `ダメージ軽減${level * 5}%`
    },
    booster: {
        id: 'booster',
        name: 'ブースター',
        icon: EquipmentIcons.booster,
        color: '#4488ff',
        maxLevel: 5,
        effect: (level) => ({
            type: 'speed',
            value: level * 0.1
        }),
        description: (level) => `移動速度+${level * 10}%`
    }
};

// Equipment slot structure
export class EquipmentSlot {
    constructor() {
        this.equipment = null;
        this.level = 0;
    }

    setEquipment(equipId, level = 1) {
        this.equipment = Equipment[equipId];
        this.level = level;
    }

    upgrade() {
        if (this.equipment && this.level < this.equipment.maxLevel) {
            this.level++;
            return true;
        }
        return false;
    }

    getEffect() {
        if (!this.equipment) return null;
        return this.equipment.effect(this.level);
    }

    getDescription() {
        if (!this.equipment) return '';
        return this.equipment.description(this.level);
    }

    isEmpty() {
        return this.equipment === null;
    }

    isMaxLevel() {
        return this.equipment && this.level >= this.equipment.maxLevel;
    }
}

// Get random equipment
export function getRandomEquipment() {
    const equipIds = Object.keys(Equipment);
    return equipIds[Math.floor(Math.random() * equipIds.length)];
}
