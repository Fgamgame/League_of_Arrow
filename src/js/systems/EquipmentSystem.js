// Equipment management and synthesis system

import { Equipment, EquipmentSlot, getRandomEquipment } from '../data/equipment.js';

export class EquipmentSystem {
    constructor(game) {
        this.game = game;

        // 3 equipment slots
        this.slots = [
            new EquipmentSlot(),
            new EquipmentSlot(),
            new EquipmentSlot()
        ];

        // Pending equipment
        this.pendingEquipment = [];
    }

    reset() {
        this.slots = [
            new EquipmentSlot(),
            new EquipmentSlot(),
            new EquipmentSlot()
        ];
        this.pendingEquipment = [];
        this.updateUI();
    }

    addRandomEquipment() {
        const equipId = getRandomEquipment();
        this.addEquipment(equipId);
    }

    addEquipment(equipId) {
        // First, try to merge with existing equipment of same type
        for (let i = 0; i < this.slots.length; i++) {
            const slot = this.slots[i];
            if (slot.equipment && slot.equipment.id === equipId && !slot.isMaxLevel()) {
                slot.upgrade();
                this.highlightSlot(i);
                this.updateUI();
                return true;
            }
        }

        // No merge possible, try to place in empty slot
        for (let i = 0; i < this.slots.length; i++) {
            if (this.slots[i].isEmpty()) {
                this.slots[i].setEquipment(equipId, 1);
                this.highlightSlot(i);
                this.updateUI();
                return true;
            }
        }

        // All slots full and no merge possible
        let replaceIndex = 0;
        let lowestLevel = Infinity;

        for (let i = 0; i < this.slots.length; i++) {
            const slot = this.slots[i];
            if (slot.level < lowestLevel) {
                lowestLevel = slot.level;
                replaceIndex = i;
            }
        }

        this.slots[replaceIndex].setEquipment(equipId, 1);
        this.highlightSlot(replaceIndex);
        this.updateUI();
        return true;
    }

    highlightSlot(index) {
        const slotElement = document.getElementById(`equip-slot-${index}`);
        if (slotElement) {
            slotElement.classList.add('highlight');
            setTimeout(() => {
                slotElement.classList.remove('highlight');
            }, 500);
        }
    }

    updateUI() {
        for (let i = 0; i < this.slots.length; i++) {
            const slot = this.slots[i];
            const element = document.getElementById(`equip-slot-${i}`);

            if (!element) continue;

            if (slot.isEmpty()) {
                element.innerHTML = '';
                element.classList.add('empty');
                element.removeAttribute('data-level');
                element.style.color = '';
                element.title = '';
            } else {
                // Use SVG icon
                element.innerHTML = `<div class="equip-icon">${slot.equipment.icon}</div>`;
                element.classList.remove('empty');
                element.setAttribute('data-level', `Lv.${slot.level}`);
                element.style.color = slot.equipment.color;
                element.style.borderColor = slot.equipment.color;
                element.style.boxShadow = `0 0 10px ${slot.equipment.color}`;
                element.title = `${slot.equipment.name} - ${slot.getDescription()}`;
            }
        }
    }

    // Get total bonuses from all equipment
    getTotalBonus(type) {
        let total = 0;

        for (const slot of this.slots) {
            if (slot.isEmpty()) continue;

            const effect = slot.getEffect();
            if (effect && effect.type === type) {
                total += effect.value;
            }
        }

        return total;
    }

    getDamageBonus() {
        return this.getTotalBonus('damage');
    }

    getDamageReduction() {
        return Math.min(0.75, this.getTotalBonus('damageReduction'));
    }

    getSpeedBonus() {
        return this.getTotalBonus('speed');
    }

    getEquippedItems() {
        return this.slots.filter(s => !s.isEmpty()).map(s => ({
            ...s.equipment,
            level: s.level,
            description: s.getDescription()
        }));
    }
}
