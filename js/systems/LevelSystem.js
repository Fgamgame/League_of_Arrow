// Level and experience system

export class LevelSystem {
    constructor(game) {
        this.game = game;
        this.level = 1;
        this.exp = 0;
        this.expToNextLevel = 10;

        // EXP scaling - increases more steeply per level
        this.baseExp = 10;
        this.expGrowth = 1.35; // Steeper growth
    }

    reset() {
        this.level = 1;
        this.exp = 0;
        this.expToNextLevel = this.baseExp;
    }

    addExp(amount) {
        this.exp += amount;

        // Check for level up
        while (this.exp >= this.expToNextLevel) {
            this.levelUp();
        }

        // Update HUD
        this.game.hud.updateExp(this.exp, this.expToNextLevel);
    }

    levelUp() {
        this.exp -= this.expToNextLevel;
        this.level++;

        // Calculate next level requirement (steeper curve)
        // Lv2: 14, Lv3: 18, Lv4: 25, Lv5: 33, Lv6: 45, Lv7: 61...
        this.expToNextLevel = Math.floor(this.baseExp * Math.pow(this.expGrowth, this.level - 1));

        // Update HUD
        this.game.hud.updateLevel(this.level);

        // Trigger skill selection
        this.game.onLevelUp();
    }

    getExpProgress() {
        return this.exp / this.expToNextLevel;
    }
}
