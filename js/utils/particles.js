// Lightweight particle system with camera support

class Particle {
    constructor(x, y, vx, vy, color, radius, decay) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.radius = radius;
        this.alpha = 1;
        this.decay = decay;
        this.active = true;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.95;
        this.vy *= 0.95;
        this.alpha -= this.decay;
        if (this.alpha <= 0) this.active = false;
    }
}

export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 30;
    }

    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (!this.particles[i].active) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx, camera) {
        if (!camera) return;

        for (const p of this.particles) {
            if (!p.active) continue;

            const screen = camera.worldToScreen(p.x, p.y);
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(screen.x, screen.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    clear() {
        this.particles = [];
    }

    add(x, y, vx, vy, color, radius, decay) {
        if (this.particles.length >= this.maxParticles) return;
        this.particles.push(new Particle(x, y, vx, vy, color, radius, decay));
    }

    explosion(x, y, color = '#ff4400', count = 8) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 2 + Math.random() * 3;
            this.add(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 3, 0.04);
        }
    }

    hit(x, y, color = '#ffff00', count = 4) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 2;
            this.add(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 2, 0.06);
        }
    }

    spark(x, y, color = '#00ffff', count = 3) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random();
            this.add(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 2, 0.05);
        }
    }

    levelUp(x, y) {
        const colors = ['#ffff00', '#ff8800', '#ff00ff'];
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 * i) / 15;
            const speed = 3 + Math.random() * 4;
            const color = colors[i % 3];
            this.add(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 4, 0.025);
        }
    }

    expPickup(x, y) {
        this.add(x, y, 0, -1, '#ffff00', 3, 0.06);
    }

    heal(x, y) {
        for (let i = 0; i < 4; i++) {
            this.add(x, y + (Math.random() - 0.5) * 20, 0, -1.5, '#00ff44', 3, 0.04);
        }
    }

    damage(x, y) {
        for (let i = 0; i < 6; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            this.add(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, '#ff4400', 3, 0.05);
        }
    }

    spawn(x, y, color = '#ff00ff') {
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6;
            const speed = 1 + Math.random() * 2;
            this.add(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, color, 2, 0.04);
        }
    }

    trail(x, y, color = '#00ff88') {
        this.add(x, y, 0, 0, color, 2, 0.1);
    }

    get count() {
        return this.particles.length;
    }
}
