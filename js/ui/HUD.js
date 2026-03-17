// HUD - Heads Up Display with skill display

import { formatTime } from '../utils/math.js';
import { Skills, LegendarySkills } from '../data/skills.js';

export class HUD {
    constructor(game) {
        this.game = game;

        this.container = document.getElementById('hud');
        this.hpFill = document.getElementById('hp-fill');
        this.levelValue = document.getElementById('level-value');
        this.timerValue = document.getElementById('timer-value');
        this.killValue = document.getElementById('kill-value');
        this.goldValue = document.getElementById('gold-value');
        this.expFill = document.getElementById('exp-fill');
        this.skillSlots = document.getElementById('skill-slots');

        // Shop elements
        this.shopButton = document.getElementById('shop-button');
        this.shopModal = document.getElementById('shop-modal');
        this.shopItems = document.getElementById('shop-items');
        this.shopGoldValue = document.getElementById('shop-gold-value');
        this.shopClose = document.getElementById('shop-close');

        // Ultimate gauge elements
        this.ultimateContainer = document.getElementById('ultimate-container');
        this.ultimateFill = document.getElementById('ultimate-fill');
        this.ultimateLabel = document.getElementById('ultimate-label');
        this.ultimateReady = document.getElementById('ultimate-ready');

        this.setupShopEvents();
        this.updateInterval = null;
    }

    setupShopEvents() {
        this.shopButton.addEventListener('click', () => {
            this.game.openShop();
        });

        this.shopClose.addEventListener('click', () => {
            this.game.closeShop();
        });
    }

    show() {
        this.container.classList.remove('hidden');
        this.startUpdateLoop();
    }

    hide() {
        this.container.classList.add('hidden');
        this.stopUpdateLoop();
    }

    // Reset all HUD values to 0 (for game over)
    reset() {
        this.hpFill.style.width = '0%';
        this.levelValue.textContent = '0';
        this.timerValue.textContent = '00:00';
        this.killValue.textContent = '0';
        this.goldValue.textContent = '0';
        this.expFill.style.width = '0%';
        this.ultimateFill.style.width = '0%';
        this.ultimateContainer.classList.remove('ready');
        this.ultimateLabel.classList.remove('hidden');
        this.ultimateReady.classList.add('hidden');
        this.skillSlots.innerHTML = '';
    }

    startUpdateLoop() {
        this.updateInterval = setInterval(() => this.update(), 100);
    }

    stopUpdateLoop() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    update() {
        if (!this.game.player) return;

        this.updateHP(this.game.player.hp, this.game.player.maxHp);
        this.timerValue.textContent = this.game.getFormattedTime();
        this.killValue.textContent = this.game.kills;
        this.updateUltimate();
    }

    updateUltimate() {
        const gauge = this.game.ultimateGauge;
        const maxGauge = this.game.ultimateMaxGauge;
        const isReady = this.game.ultimateReady;

        const percentage = (gauge / maxGauge) * 100;
        this.ultimateFill.style.width = `${percentage}%`;

        if (isReady) {
            this.ultimateContainer.classList.add('ready');
            this.ultimateLabel.classList.add('hidden');
            this.ultimateReady.classList.remove('hidden');
        } else {
            this.ultimateContainer.classList.remove('ready');
            this.ultimateLabel.classList.remove('hidden');
            this.ultimateReady.classList.add('hidden');
        }
    }

    updateHP(current, max) {
        const percentage = (current / max) * 100;
        this.hpFill.style.width = `${percentage}%`;

        if (percentage <= 30) {
            this.hpFill.classList.add('low');
        } else {
            this.hpFill.classList.remove('low');
        }
    }

    updateLevel(level) {
        this.levelValue.textContent = level;

        this.levelValue.parentElement.classList.add('pulse');
        setTimeout(() => {
            this.levelValue.parentElement.classList.remove('pulse');
        }, 500);
    }

    updateExp(current, max) {
        const percentage = (current / max) * 100;
        this.expFill.style.width = `${percentage}%`;
    }

    updateGold(gold) {
        this.goldValue.textContent = gold;
        if (this.shopModal && !this.shopModal.classList.contains('hidden')) {
            this.shopGoldValue.textContent = gold;
            this.refreshShopItems();
        }
    }

    showShop() {
        this.shopModal.classList.remove('hidden');
        this.shopGoldValue.textContent = this.game.gold;
        this.refreshShopItems();
    }

    hideShop() {
        this.shopModal.classList.add('hidden');
    }

    refreshShopItems() {
        this.shopItems.innerHTML = '';

        // Get purchasable skills (exclude active skills)
        const purchasableSkills = Object.values(Skills).filter(skill => {
            if (skill.category === 'active') return false;
            return true;
        });

        // Group by category
        const categories = {
            attack: { name: 'ATTACK', color: '#ff4444', skills: [] },
            defense: { name: 'DEFENSE', color: '#44ff44', skills: [] },
            movement: { name: 'MOVEMENT', color: '#4444ff', skills: [] },
            special: { name: 'SPECIAL', color: '#ffff44', skills: [] },
            weapon: { name: 'WEAPON', color: '#ff8844', skills: [] }
        };

        purchasableSkills.forEach(skill => {
            if (categories[skill.category]) {
                categories[skill.category].skills.push(skill);
            }
        });

        // Render each category
        Object.entries(categories).forEach(([categoryKey, category]) => {
            if (category.skills.length === 0) return;

            const section = document.createElement('div');
            section.className = 'shop-category';

            const header = document.createElement('div');
            header.className = 'shop-category-header';
            header.style.borderColor = category.color;
            header.innerHTML = `<span style="color: ${category.color}">${category.name}</span>`;
            section.appendChild(header);

            const itemsGrid = document.createElement('div');
            itemsGrid.className = 'shop-category-items';

            category.skills.forEach(skill => {
                const currentLevel = this.game.skillSystem.getSkillStacks(skill.id);
                const maxLevel = skill.maxStacks || 1;
                const isMaxed = currentLevel >= maxLevel;

                const basePrice = this.getSkillBasePrice(skill);
                const price = isMaxed ? 0 : Math.floor(basePrice * (1 + currentLevel * 0.5));
                const canAfford = this.game.gold >= price && !isMaxed;

                const item = document.createElement('div');
                item.className = `shop-item ${canAfford ? '' : 'cannot-afford'} ${isMaxed ? 'maxed' : ''}`;
                item.style.borderColor = category.color;

                item.innerHTML = `
                    <div class="item-icon" style="color: ${category.color}">${skill.icon}</div>
                    <div class="item-name">${skill.name}</div>
                    <div class="item-level">Lv.${currentLevel}/${maxLevel}</div>
                    <div class="item-effect">${skill.effect}</div>
                    <div class="item-price">${isMaxed ? 'MAX' : `🪙 ${price}`}</div>
                `;

                if (canAfford) {
                    item.addEventListener('click', () => {
                        this.game.purchaseSkill(skill.id, price);
                    });
                }

                itemsGrid.appendChild(item);
            });

            section.appendChild(itemsGrid);
            this.shopItems.appendChild(section);
        });
    }

    getSkillBasePrice(skill) {
        const prices = {
            attack: 30,
            defense: 25,
            movement: 20,
            special: 40,
            weapon: 50
        };
        return prices[skill.category] || 30;
    }

    updateSkills(acquiredSkills) {
        this.skillSlots.innerHTML = '';

        acquiredSkills.forEach((level, skillId) => {
            // Check both normal and legendary skills
            const skill = Skills[skillId] || LegendarySkills[skillId];
            if (!skill) return;

            const slot = document.createElement('div');
            slot.className = 'skill-slot';

            // Color by category
            const colors = {
                attack: '#ff4444',
                defense: '#44ff44',
                movement: '#4444ff',
                special: '#ffff44',
                weapon: '#ff8844',
                legendary: '#ffd700',
                active: '#00ffff'
            };
            const color = colors[skill.category] || '#ffffff';

            // Generate stars for stack level
            const stars = '★'.repeat(Math.min(level, 5));

            slot.innerHTML = `
                <div class="skill-icon" style="color: ${color}">${skill.icon}</div>
                <div class="skill-stars">${stars}</div>
            `;
            slot.title = `${skill.name} Lv.${level}`;

            // Add legendary glow
            if (skill.isLegendary) {
                slot.classList.add('legendary-slot');
            }

            this.skillSlots.appendChild(slot);
        });
    }
}
