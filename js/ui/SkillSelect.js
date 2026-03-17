// Skill selection UI with enhanced animations

import { GameState } from '../core/Game.js';
import { soundManager } from '../systems/SoundManager.js';
import { ActiveSkills } from '../data/skills.js';

export class SkillSelect {
    constructor(game) {
        this.game = game;

        this.container = document.getElementById('skill-select');
        this.optionsContainer = document.getElementById('skill-options');

        this.currentChoices = [];
        this.selectedIndex = -1;
        this.isAnimating = false;
        this.isActiveSkillMode = false; // For QWER skill level up
    }

    // Show QWER skill selection - can pick any QWER skill to unlock or level up
    showQWERSkillSelect() {
        this.isActiveSkillMode = true;
        this.selectedIndex = -1;
        this.isAnimating = true;

        // Collect available QWER skills
        const allQWERSkills = [];
        for (const key of ['Q', 'W', 'E', 'R']) {
            const existingSkillId = this.game.skillSystem.getSlotSkill(key);

            if (existingSkillId) {
                // Slot already has a skill - only allow leveling up that skill
                const skill = ActiveSkills[key]?.[existingSkillId];
                if (skill) {
                    const currentLevel = this.game.skillSystem.getSkillStacks(existingSkillId);
                    const maxLevel = skill.maxStacks || 5;
                    if (currentLevel < maxLevel) {
                        allQWERSkills.push({
                            ...skill,
                            slotKey: key
                        });
                    }
                }
            } else {
                // Slot is empty - can pick any skill for this slot
                const keySkills = ActiveSkills[key];
                if (keySkills) {
                    for (const skill of Object.values(keySkills)) {
                        allQWERSkills.push({
                            ...skill,
                            slotKey: key
                        });
                    }
                }
            }
        }

        // Shuffle and pick 3
        const shuffled = allQWERSkills.sort(() => Math.random() - 0.5);
        this.currentChoices = shuffled.slice(0, 3);

        // Clear and build skill cards
        this.optionsContainer.innerHTML = '';

        // Update title
        const title = this.container.querySelector('h2');
        title.textContent = 'SKILL UP!';
        title.classList.remove('animate');
        void title.offsetWidth;
        title.classList.add('animate');

        // Create cards
        this.currentChoices.forEach((skill, index) => {
            const card = this.createQWERSkillCard(skill, index);
            this.optionsContainer.appendChild(card);

            setTimeout(() => {
                card.classList.add('visible');
            }, 100 + index * 150);
        });

        this.container.classList.remove('hidden');

        setTimeout(() => {
            this.isAnimating = false;
        }, 600);
    }

    createQWERSkillCard(skill, index) {
        const card = document.createElement('div');
        card.className = 'skill-card active';
        card.dataset.index = index;

        const currentLevel = this.game.skillSystem.getSkillStacks(skill.id);
        const maxLevel = skill.maxStacks || 5;
        const nextLevel = currentLevel + 1;
        const isNew = currentLevel === 0;

        // Show stars for level
        const stars = '★'.repeat(Math.min(nextLevel, maxLevel));

        card.innerHTML = `
            <div class="card-glow"></div>
            <div class="card-content">
                <div class="category-badge">${skill.slotKey}</div>
                <div class="icon-container">
                    <div class="icon-bg"></div>
                    <div class="icon">${skill.icon}</div>
                    <span class="stack-count">${stars}</span>
                </div>
                <div class="skill-info">
                    <div class="name">${skill.name}</div>
                    <div class="effect">${isNew ? 'NEW!' : `Lv.${currentLevel} → Lv.${nextLevel}`}</div>
                    <div class="description">${skill.effect}</div>
                </div>
                <div class="key-hint">
                    <span class="key">${index + 1}</span>
                    <span class="hint-text">を押して選択</span>
                </div>
            </div>
            <div class="card-particles"></div>
        `;

        card.addEventListener('mouseenter', () => this.onCardHover(card, index));
        card.addEventListener('mouseleave', () => this.onCardLeave(card));
        card.addEventListener('click', () => {
            if (!this.isAnimating) {
                this.selectSkill(index);
            }
        });

        return card;
    }

    // Show QWER skill level up selection (legacy - kept for compatibility)
    showActiveSkillUpgrade() {
        this.showQWERSkillSelect();
    }

    createActiveSkillCard(skill, index) {
        const card = document.createElement('div');
        card.className = 'skill-card active';
        card.dataset.index = index;

        const currentLevel = this.game.skillSystem.getSkillStacks(skill.id);
        const maxLevel = skill.maxStacks || 5;
        const nextLevel = currentLevel + 1;
        const stars = '★'.repeat(Math.min(nextLevel, maxLevel));

        card.innerHTML = `
            <div class="card-glow"></div>
            <div class="card-content">
                <div class="category-badge">${skill.slotKey}</div>
                <div class="icon-container">
                    <div class="icon-bg"></div>
                    <div class="icon">${skill.icon}</div>
                    <span class="stack-count">${stars}</span>
                </div>
                <div class="skill-info">
                    <div class="name">${skill.name}</div>
                    <div class="effect">Lv.${currentLevel} → Lv.${nextLevel}</div>
                </div>
                <div class="key-hint">
                    <span class="key">${index + 1}</span>
                    <span class="hint-text">を押して選択</span>
                </div>
            </div>
            <div class="card-particles"></div>
        `;

        card.addEventListener('mouseenter', () => this.onCardHover(card, index));
        card.addEventListener('mouseleave', () => this.onCardLeave(card));
        card.addEventListener('click', () => {
            if (!this.isAnimating) {
                this.selectSkill(index);
            }
        });

        return card;
    }

    show() {
        this.isActiveSkillMode = false;
        this.currentChoices = this.game.skillSystem.getSkillChoices(3);
        this.selectedIndex = -1;
        this.isAnimating = true;

        // Clear and build skill cards
        this.optionsContainer.innerHTML = '';

        // Add title animation
        const title = this.container.querySelector('h2');
        title.textContent = 'LEVEL UP!';
        title.classList.remove('animate');
        void title.offsetWidth; // Force reflow
        title.classList.add('animate');

        // Create cards with staggered animation
        this.currentChoices.forEach((skill, index) => {
            const card = this.createSkillCard(skill, index);
            this.optionsContainer.appendChild(card);

            // Staggered entrance animation
            setTimeout(() => {
                card.classList.add('visible');
            }, 100 + index * 150);
        });

        this.container.classList.remove('hidden');

        // Enable selection after animation
        setTimeout(() => {
            this.isAnimating = false;
        }, 600);
    }

    hide() {
        this.container.classList.add('hidden');
        this.currentChoices = [];
    }

    createSkillCard(skill, index) {
        const card = document.createElement('div');
        card.className = `skill-card ${skill.category}`;
        card.dataset.index = index;

        // Get current stack count - show stars for levels
        const stacks = this.game.skillSystem.getSkillStacks(skill.id);
        const nextLevel = stacks + 1;
        const stars = '★'.repeat(Math.min(nextLevel, 5));
        const stackText = stacks > 0 ? `<span class="stack-count">${stars}</span>` : '';

        // Category label
        const categoryLabels = {
            attack: 'ATTACK',
            defense: 'DEFENSE',
            movement: 'MOVEMENT',
            special: 'SPECIAL',
            weapon: 'WEAPON',
            active: 'ACTIVE'
        };

        card.innerHTML = `
            <div class="card-glow"></div>
            <div class="card-content">
                <div class="category-badge">${categoryLabels[skill.category]}</div>
                <div class="icon-container">
                    <div class="icon-bg"></div>
                    <div class="icon">${skill.icon}</div>
                    ${stackText}
                </div>
                <div class="skill-info">
                    <div class="name">${skill.name}</div>
                    <div class="effect">${skill.effect}</div>
                </div>
                <div class="key-hint">
                    <span class="key">${index + 1}</span>
                    <span class="hint-text">を押して選択</span>
                </div>
            </div>
            <div class="card-particles"></div>
        `;

        // Hover effects
        card.addEventListener('mouseenter', () => this.onCardHover(card, index));
        card.addEventListener('mouseleave', () => this.onCardLeave(card));

        // Click handler
        card.addEventListener('click', () => {
            if (!this.isAnimating) {
                this.selectSkill(index);
            }
        });

        return card;
    }

    onCardHover(card, index) {
        if (this.isAnimating) return;

        this.selectedIndex = index;
        card.classList.add('hovered');

        // Create particles
        this.createHoverParticles(card);
    }

    onCardLeave(card) {
        card.classList.remove('hovered');
        this.selectedIndex = -1;
    }

    createHoverParticles(card) {
        const particleContainer = card.querySelector('.card-particles');
        const particleCount = 5;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'hover-particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 0.5}s`;
            particleContainer.appendChild(particle);

            setTimeout(() => particle.remove(), 1000);
        }
    }

    update() {
        if (this.isAnimating) return;

        // Keyboard selection
        const selection = this.game.input.getSkillSelection();
        if (selection >= 0 && selection < this.currentChoices.length) {
            this.selectSkill(selection);
        }
    }

    selectSkill(index) {
        if (index < 0 || index >= this.currentChoices.length) return;
        if (this.isAnimating) return;

        // Play selection sound
        soundManager.playClick();

        this.isAnimating = true;
        const skill = this.currentChoices[index];
        const cards = this.optionsContainer.querySelectorAll('.skill-card');

        // Highlight selected card
        cards.forEach((card, i) => {
            if (i === index) {
                card.classList.add('selected');
                this.createSelectionEffect(card);
            } else {
                card.classList.add('not-selected');
            }
        });

        // Apply skill after animation
        setTimeout(() => {
            if (this.isActiveSkillMode) {
                // Level up the active skill (pass slotKey for new skills)
                this.game.skillSystem.levelUpActiveSkill(skill.id, skill.slotKey);
            } else {
                // Normal skill acquisition
                this.game.skillSystem.acquireSkill(skill.id);
            }
            this.hide();
            this.game.state = GameState.PLAYING;
            this.isAnimating = false;
        }, 500);
    }

    createSelectionEffect(card) {
        // Add burst effect
        const burst = document.createElement('div');
        burst.className = 'selection-burst';
        card.appendChild(burst);

        // Add multiple particles
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'burst-particle';
            particle.style.setProperty('--angle', `${(i / 12) * 360}deg`);
            burst.appendChild(particle);
        }
    }
}
