// Skill management system

import { Skills, LegendarySkills, ActiveSkills, getRandomSkills, getLegendarySkills, getRandomActiveSkills } from '../data/skills.js';

export class SkillSystem {
    constructor(game) {
        this.game = game;

        // Map of skill id -> stack count
        this.acquiredSkills = new Map();

        // Active skill slots (QWER)
        // Maps slot key -> skill id
        this.slotSkills = {
            Q: null,
            W: null,
            E: null,
            R: null
        };

        // Calculated bonuses
        this.bonuses = {
            damage: 0,
            bulletSpeed: 0,
            attackSpeed: 0,
            speed: 0,
            maxHp: 0,
            invincibility: 0,
            critical: 0,
            barrier: 0
        };
    }

    reset() {
        this.acquiredSkills.clear();
        this.slotSkills = {
            Q: null,
            W: null,
            E: null,
            R: null
        };
        this.bonuses = {
            damage: 0,
            bulletSpeed: 0,
            attackSpeed: 0,
            speed: 0,
            maxHp: 0,
            invincibility: 0,
            critical: 0,
            barrier: 0
        };
    }

    // Get which slots are already unlocked
    getUnlockedSlots() {
        const unlocked = [];
        for (const [key, skillId] of Object.entries(this.slotSkills)) {
            if (skillId !== null) {
                unlocked.push(key);
            }
        }
        return unlocked;
    }

    // Get random active skills for a specific slot
    getActiveSkillChoices(key, count = 3) {
        return getRandomActiveSkills(key, count);
    }

    // Unlock a slot with a specific skill
    unlockSlot(key, skillId) {
        if (!['Q', 'W', 'E', 'R'].includes(key)) return;

        this.slotSkills[key] = skillId;
        this.acquiredSkills.set(skillId, 1);

        // Update HUD
        this.game.hud.updateSkills(this.acquiredSkills);
    }

    // Level up an active QWER skill (or unlock it if new)
    levelUpActiveSkill(skillId, slotKey) {
        const currentLevel = this.acquiredSkills.get(skillId) || 0;

        // If this is a new skill, set it to the slot
        if (currentLevel === 0 && slotKey) {
            this.slotSkills[slotKey] = skillId;
        }

        this.acquiredSkills.set(skillId, currentLevel + 1);

        // Update HUD
        this.game.hud.updateSkills(this.acquiredSkills);
    }

    // Check if a slot is unlocked
    isSlotUnlocked(key) {
        return this.slotSkills[key] !== null;
    }

    // Get the skill assigned to a slot
    getSlotSkill(key) {
        return this.slotSkills[key];
    }

    getSkillChoices(count = 3) {
        return getRandomSkills(count, this.acquiredSkills);
    }

    getLegendarySkillChoices(count = 3) {
        return getLegendarySkills(count, this.acquiredSkills);
    }

    acquireSkill(skillId) {
        // Check both normal and legendary skills
        const skill = Skills[skillId] || LegendarySkills[skillId];
        if (!skill) return;

        // Update stack count
        const currentStacks = this.acquiredSkills.get(skillId) || 0;
        this.acquiredSkills.set(skillId, currentStacks + 1);

        // Apply skill effect
        this.applySkillEffect(skill);

        // Update HUD
        this.game.hud.updateSkills(this.acquiredSkills);
    }

    applySkillEffect(skill) {
        const player = this.game.player;
        if (!player) return;

        switch (skill.bonusType) {
            case 'damage':
            case 'bulletSpeed':
            case 'attackSpeed':
            case 'speed':
            case 'invincibility':
            case 'critical':
            case 'barrier':
                this.bonuses[skill.bonusType] += skill.bonusValue;
                if (skill.bonusType === 'barrier' && player) {
                    player.addBarrier(skill.bonusValue);
                }
                break;

            case 'maxHp':
                this.bonuses.maxHp += skill.bonusValue;
                player.applyMaxHpBonus(player.maxHp * skill.bonusValue);
                break;

            case 'instant':
                if (skill.instantEffect === 'heal') {
                    player.heal(skill.instantValue);
                }
                break;

            case 'special':
                this.applySpecialSkill(skill.id);
                break;

            case 'weapon':
                this.applyWeaponSkill(skill.weaponType);
                break;
        }

        // Update player stats
        this.updatePlayerStats();
    }

    applySpecialSkill(skillId) {
        const player = this.game.player;
        if (!player) return;

        switch (skillId) {
            case 'dash':
                player.enableDash();
                break;
            // Other special skills are checked via hasSkill()
        }
    }

    applyWeaponSkill(weaponType) {
        if (this.game.weaponSystem) {
            this.game.weaponSystem.addWeapon(weaponType);
        }
    }

    updatePlayerStats() {
        const player = this.game.player;
        if (!player) return;

        player.applySpeedBonus(1 + this.bonuses.speed);
        player.applyAttackSpeedBonus(1 + this.bonuses.attackSpeed);
    }

    hasSkill(skillId) {
        return this.acquiredSkills.has(skillId);
    }

    getSkillStacks(skillId) {
        return this.acquiredSkills.get(skillId) || 0;
    }

    getBonus(type) {
        return this.bonuses[type] || 0;
    }

    // Get all acquired skills for display
    getAcquiredSkillsList() {
        const list = [];
        for (const [skillId, stacks] of this.acquiredSkills) {
            const skill = Skills[skillId];
            if (skill) {
                list.push({
                    ...skill,
                    stacks
                });
            }
        }
        return list;
    }
}
