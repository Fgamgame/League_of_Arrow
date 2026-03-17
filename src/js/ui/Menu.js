// Title menu and pause menu

export class Menu {
    constructor(game) {
        this.game = game;

        // Title menu
        this.titleMenu = document.getElementById('title-menu');
        this.startButton = document.getElementById('start-button');

        // Pause menu
        this.pauseMenu = document.getElementById('pause-menu');
        this.resumeButton = document.getElementById('resume-button');
        this.quitButton = document.getElementById('quit-button');

        this.bindEvents();
    }

    bindEvents() {
        // Start game
        this.startButton.addEventListener('click', () => {
            this.game.startGame();
        });

        // Resume game
        this.resumeButton.addEventListener('click', () => {
            this.game.resume();
        });

        // Quit to menu
        this.quitButton.addEventListener('click', () => {
            this.game.returnToMenu();
        });

        // Space/Enter to start from title
        window.addEventListener('keydown', (e) => {
            if (!this.titleMenu.classList.contains('hidden')) {
                if (e.code === 'Space' || e.code === 'Enter') {
                    this.game.startGame();
                }
            }
        });
    }

    show() {
        this.titleMenu.classList.remove('hidden');
    }

    hide() {
        this.titleMenu.classList.add('hidden');
    }
}
