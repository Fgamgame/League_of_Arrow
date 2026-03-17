// Camera system - follows player in infinite world

export class Camera {
    constructor(screenWidth, screenHeight) {
        this.x = 0;
        this.y = 0;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;

        // Smooth follow
        this.smoothing = 0.1;

        // Screen shake offset
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
    }

    update(targetX, targetY) {
        // Center camera on target with smoothing
        const targetCamX = targetX - this.screenWidth / 2;
        const targetCamY = targetY - this.screenHeight / 2;

        this.x += (targetCamX - this.x) * this.smoothing;
        this.y += (targetCamY - this.y) * this.smoothing;
    }

    resize(screenWidth, screenHeight) {
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
    }

    // Convert world coordinates to screen coordinates (with shake offset)
    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.x + this.shakeOffsetX,
            y: worldY - this.y + this.shakeOffsetY
        };
    }

    // Convert screen coordinates to world coordinates
    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.x,
            y: screenY + this.y
        };
    }

    // Check if world position is visible on screen
    isVisible(worldX, worldY, margin = 100) {
        const screen = this.worldToScreen(worldX, worldY);
        return screen.x >= -margin &&
               screen.x <= this.screenWidth + margin &&
               screen.y >= -margin &&
               screen.y <= this.screenHeight + margin;
    }

    // Get visible bounds in world coordinates
    getWorldBounds(margin = 0) {
        return {
            left: this.x - margin,
            right: this.x + this.screenWidth + margin,
            top: this.y - margin,
            bottom: this.y + this.screenHeight + margin
        };
    }
}
