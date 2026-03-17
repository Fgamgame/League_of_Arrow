// Input handler for LoL-style mouse + keyboard controls

export class Input {
    constructor() {
        this.keys = {};
        this.keysJustPressed = {};

        // Mouse state
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseWorldX = 0;
        this.mouseWorldY = 0;

        // Click events
        this.rightClick = null;  // { x, y, time } - move command
        this.leftClick = null;   // { x, y, time } - attack command
        this.attackModeClick = null; // { x, y, time } - A+click attack

        // Attack mode (A key)
        this.attackMode = false;

        // Active skills (QWER)
        this.skillPressed = {
            Q: false,
            W: false,
            E: false,
            R: false
        };

        // Move target for pathfinding
        this.moveTarget = null;

        // Camera reference (set by Game)
        this.camera = null;
        this.canvas = null;

        this.bindEvents();
    }

    setCamera(camera, canvas) {
        this.camera = camera;
        this.canvas = canvas;
    }

    bindEvents() {
        // Keyboard events
        window.addEventListener('keydown', (e) => {
            if (!this.keys[e.code]) {
                this.keysJustPressed[e.code] = true;
            }
            this.keys[e.code] = true;

            // A key - toggle attack mode
            if (e.code === 'KeyA') {
                this.attackMode = true;
            }

            // QWER - active skills
            if (e.code === 'KeyQ') this.skillPressed.Q = true;
            if (e.code === 'KeyW') this.skillPressed.W = true;
            if (e.code === 'KeyE') this.skillPressed.E = true;
            if (e.code === 'KeyR') this.skillPressed.R = true;

            // S key - stop movement
            if (e.code === 'KeyS') {
                this.moveTarget = null;
            }

            // Prevent default for game keys
            if (['Space', 'KeyA', 'KeyS'].includes(e.code)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;

            // Cancel attack mode when A is released (optional, could keep it)
            if (e.code === 'KeyA') {
                this.attackMode = false;
            }
        });

        // Mouse move
        window.addEventListener('mousemove', (e) => {
            if (this.canvas) {
                const rect = this.canvas.getBoundingClientRect();
                this.mouseX = e.clientX - rect.left;
                this.mouseY = e.clientY - rect.top;

                // Update world coordinates
                if (this.camera) {
                    const world = this.camera.screenToWorld(this.mouseX, this.mouseY);
                    this.mouseWorldX = world.x;
                    this.mouseWorldY = world.y;
                }
            }
        });

        // Mouse click
        window.addEventListener('mousedown', (e) => {
            if (!this.canvas) return;

            const rect = this.canvas.getBoundingClientRect();
            const screenX = e.clientX - rect.left;
            const screenY = e.clientY - rect.top;

            // Check if click is within canvas
            if (screenX < 0 || screenX > rect.width || screenY < 0 || screenY > rect.height) {
                return;
            }

            if (this.camera) {
                const world = this.camera.screenToWorld(screenX, screenY);

                if (e.button === 2) {
                    // Right click - move
                    this.rightClick = { x: world.x, y: world.y, time: Date.now() };
                    this.moveTarget = { x: world.x, y: world.y };
                    this.attackMode = false; // Cancel attack mode on move
                } else if (e.button === 0) {
                    // Left click - attack or attack mode click
                    if (this.attackMode) {
                        this.attackModeClick = { x: world.x, y: world.y, time: Date.now() };
                        this.attackMode = false;
                    } else {
                        this.leftClick = { x: world.x, y: world.y, time: Date.now() };
                    }
                }
            }

            e.preventDefault();
        });

        // Prevent context menu on right click
        window.addEventListener('contextmenu', (e) => {
            if (this.canvas) {
                const rect = this.canvas.getBoundingClientRect();
                if (e.clientX >= rect.left && e.clientX <= rect.right &&
                    e.clientY >= rect.top && e.clientY <= rect.bottom) {
                    e.preventDefault();
                }
            }
        });

        // Handle focus loss
        window.addEventListener('blur', () => {
            this.keys = {};
            this.keysJustPressed = {};
            this.attackMode = false;
            this.skillPressed = { Q: false, W: false, E: false, R: false };
        });
    }

    update() {
        // Clear just pressed keys after one frame
        this.keysJustPressed = {};

        // Clear click events after they've been processed
        this.rightClick = null;
        this.leftClick = null;
        this.attackModeClick = null;

        // Clear skill presses
        this.skillPressed = { Q: false, W: false, E: false, R: false };
    }

    isKeyDown(code) {
        return this.keys[code] === true;
    }

    isKeyJustPressed(code) {
        return this.keysJustPressed[code] === true;
    }

    // Get move target (right click destination)
    getMoveTarget() {
        return this.moveTarget;
    }

    // Clear move target when reached
    clearMoveTarget() {
        this.moveTarget = null;
    }

    // Check for right click move command
    getRightClick() {
        return this.rightClick;
    }

    // Check for left click attack
    getLeftClick() {
        return this.leftClick;
    }

    // Check for A+click attack
    getAttackModeClick() {
        return this.attackModeClick;
    }

    // Check if in attack mode
    isAttackMode() {
        return this.attackMode;
    }

    // Get mouse world position
    getMouseWorldPosition() {
        return { x: this.mouseWorldX, y: this.mouseWorldY };
    }

    // Get active skill press (QWER)
    getActiveSkillPressed() {
        if (this.skillPressed.Q) return 'Q';
        if (this.skillPressed.W) return 'W';
        if (this.skillPressed.E) return 'E';
        if (this.skillPressed.R) return 'R';
        return null;
    }

    // Legacy: Movement vector (for compatibility, now uses click-to-move)
    getMovementVector() {
        // No longer used for player movement, but keep for UI
        return { x: 0, y: 0 };
    }

    isMoving() {
        return this.moveTarget !== null;
    }

    // Skill selection keys (for level up screen)
    getSkillSelection() {
        if (this.isKeyJustPressed('Digit1') || this.isKeyJustPressed('Numpad1')) return 0;
        if (this.isKeyJustPressed('Digit2') || this.isKeyJustPressed('Numpad2')) return 1;
        if (this.isKeyJustPressed('Digit3') || this.isKeyJustPressed('Numpad3')) return 2;
        return -1;
    }

    // Pause key
    isPausePressed() {
        return this.isKeyJustPressed('Escape');
    }

    // Dash key (Space)
    isDashPressed() {
        return this.isKeyJustPressed('Space');
    }

    // Shop key (X or B)
    isShopPressed() {
        return this.isKeyJustPressed('KeyX') || this.isKeyJustPressed('KeyB');
    }
}
