// Lightweight Pickup entity

export class Pickup {
    constructor(x, y, type, value) {
        this.x = x;
        this.y = y;
        this.type = type; // 'exp', 'health', or 'gold'
        this.value = value;
        this.radius = type === 'gold' ? 8 : 6;
        this.active = true;
        this.lifetime = 20;
    }

    update(deltaTime) {
        this.lifetime -= deltaTime;
        if (this.lifetime <= 0) {
            this.active = false;
        }
    }
}
