// SoundManager - Procedural audio using Web Audio API

export class SoundManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.initialized = false;

        // Volume settings
        this.masterVolume = 0.5;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.6;

        // BGM state
        this.bgmPlaying = false;
        this.bgmNodes = [];
        this.bgmInterval = null;
    }

    // Must be called after user interaction (click)
    init() {
        if (this.initialized) return;

        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();

            // Master gain
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = this.masterVolume;
            this.masterGain.connect(this.ctx.destination);

            // Music gain
            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = this.musicVolume;
            this.musicGain.connect(this.masterGain);

            // SFX gain
            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = this.sfxVolume;
            this.sfxGain.connect(this.masterGain);

            this.initialized = true;
            console.log('SoundManager initialized');
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    // Resume context if suspended
    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // ===== SOUND EFFECT GENERATORS =====

    // Bow shooting sound - quick "twang"
    playShoot() {
        if (!this.initialized) return;

        const now = this.ctx.currentTime;

        // Create oscillator for twang
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    // Arrow hit sound - thud
    playHit() {
        if (!this.initialized) return;

        const now = this.ctx.currentTime;

        // Noise burst for impact
        const bufferSize = this.ctx.sampleRate * 0.05;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1000;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(now);
    }

    // Critical hit - sharper impact
    playCritical() {
        if (!this.initialized) return;

        const now = this.ctx.currentTime;

        // Higher pitched impact
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.08);

        // Add noise burst
        this.playHit();
    }

    // Enemy death - explosion pop
    playKill() {
        if (!this.initialized) return;

        const now = this.ctx.currentTime;

        // Low frequency thump
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.15);

        // Pop noise
        const bufferSize = this.ctx.sampleRate * 0.08;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            const decay = Math.pow(1 - i / bufferSize, 2);
            data[i] = (Math.random() * 2 - 1) * decay;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800;
        filter.Q.value = 1;

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.value = 0.15;

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.sfxGain);

        noise.start(now);
    }

    // Level up - triumphant arpeggio
    playLevelUp() {
        if (!this.initialized) return;

        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            const startTime = now + i * 0.08;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(startTime);
            osc.stop(startTime + 0.3);
        });
    }

    // Click sound - UI feedback
    playClick() {
        if (!this.initialized) return;

        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.03);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.03);
    }

    // Move command - softer click
    playMove() {
        if (!this.initialized) return;

        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = 600;

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    // Skill Q - Volley (whoosh with multiple tones)
    playSkillQ() {
        if (!this.initialized) return;

        const now = this.ctx.currentTime;

        // Whoosh sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        // Filter for whoosh
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(500, now + 0.2);
        filter.Q.value = 2;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.2);
    }

    // Skill W - Frost (icy crystalline sound)
    playSkillW() {
        if (!this.initialized) return;

        const now = this.ctx.currentTime;

        // High frequency shimmer
        for (let i = 0; i < 3; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(2000 + i * 500, now);
            osc.frequency.exponentialRampToValueAtTime(1000 + i * 200, now + 0.3);

            gain.gain.setValueAtTime(0.08, now + i * 0.02);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(now + i * 0.02);
            osc.stop(now + 0.3);
        }
    }

    // Skill E - Dash (quick swoosh)
    playSkillE() {
        if (!this.initialized) return;

        const now = this.ctx.currentTime;

        // Fast sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 3000;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    // Skill R - Ultimate (epic buildup and explosion)
    playSkillR() {
        if (!this.initialized) return;

        const now = this.ctx.currentTime;

        // Buildup
        const buildOsc = this.ctx.createOscillator();
        const buildGain = this.ctx.createGain();

        buildOsc.type = 'sawtooth';
        buildOsc.frequency.setValueAtTime(100, now);
        buildOsc.frequency.exponentialRampToValueAtTime(500, now + 0.3);

        buildGain.gain.setValueAtTime(0.1, now);
        buildGain.gain.linearRampToValueAtTime(0.3, now + 0.3);
        buildGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        buildOsc.connect(buildGain);
        buildGain.connect(this.sfxGain);

        buildOsc.start(now);
        buildOsc.stop(now + 0.4);

        // Impact
        setTimeout(() => {
            const impactOsc = this.ctx.createOscillator();
            const impactGain = this.ctx.createGain();

            impactOsc.type = 'sine';
            impactOsc.frequency.setValueAtTime(80, this.ctx.currentTime);
            impactOsc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.5);

            impactGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
            impactGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

            impactOsc.connect(impactGain);
            impactGain.connect(this.sfxGain);

            impactOsc.start(this.ctx.currentTime);
            impactOsc.stop(this.ctx.currentTime + 0.5);
        }, 300);
    }

    // Boss appear - ominous rumble
    playBossAppear() {
        if (!this.initialized) return;

        const now = this.ctx.currentTime;

        // Deep rumble
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50, now);
        osc.frequency.linearRampToValueAtTime(30, now + 1);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.3);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.7);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 200;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 1);
    }

    // Boss death - epic explosion
    playBossDeath() {
        if (!this.initialized) return;

        const now = this.ctx.currentTime;

        // Multiple explosions
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.playKill();
            }, i * 100);
        }

        // Final big explosion
        setTimeout(() => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.8);

            gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.8);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 500;

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(this.ctx.currentTime);
            osc.stop(this.ctx.currentTime + 0.8);
        }, 500);
    }

    // Pickup sound
    playPickup() {
        if (!this.initialized) return;

        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(1100, now + 0.05);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    // Player hurt
    playHurt() {
        if (!this.initialized) return;

        const now = this.ctx.currentTime;

        // Distorted impact
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        // Distortion
        const distortion = this.ctx.createWaveShaper();
        const curve = new Float32Array(256);
        for (let i = 0; i < 256; i++) {
            const x = (i / 128) - 1;
            curve[i] = Math.tanh(x * 3);
        }
        distortion.curve = curve;

        osc.connect(distortion);
        distortion.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.2);
    }

    // Ultimate skill - powerful activation sound
    playUltimate() {
        if (!this.initialized) return;

        const now = this.ctx.currentTime;

        // Rising power-up sweep
        const sweepOsc = this.ctx.createOscillator();
        const sweepGain = this.ctx.createGain();

        sweepOsc.type = 'sawtooth';
        sweepOsc.frequency.setValueAtTime(80, now);
        sweepOsc.frequency.exponentialRampToValueAtTime(800, now + 0.3);

        sweepGain.gain.setValueAtTime(0.2, now);
        sweepGain.gain.linearRampToValueAtTime(0.4, now + 0.25);
        sweepGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        const sweepFilter = this.ctx.createBiquadFilter();
        sweepFilter.type = 'lowpass';
        sweepFilter.frequency.setValueAtTime(400, now);
        sweepFilter.frequency.exponentialRampToValueAtTime(4000, now + 0.3);

        sweepOsc.connect(sweepFilter);
        sweepFilter.connect(sweepGain);
        sweepGain.connect(this.sfxGain);

        sweepOsc.start(now);
        sweepOsc.stop(now + 0.5);

        // Massive impact after buildup
        setTimeout(() => {
            const impactTime = this.ctx.currentTime;

            // Deep bass explosion
            const bassOsc = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();

            bassOsc.type = 'sine';
            bassOsc.frequency.setValueAtTime(60, impactTime);
            bassOsc.frequency.exponentialRampToValueAtTime(15, impactTime + 0.8);

            bassGain.gain.setValueAtTime(0.6, impactTime);
            bassGain.gain.exponentialRampToValueAtTime(0.01, impactTime + 0.8);

            bassOsc.connect(bassGain);
            bassGain.connect(this.sfxGain);

            bassOsc.start(impactTime);
            bassOsc.stop(impactTime + 0.8);

            // Explosion noise
            const bufferSize = this.ctx.sampleRate * 0.3;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                const decay = Math.pow(1 - i / bufferSize, 1.5);
                data[i] = (Math.random() * 2 - 1) * decay;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const noiseFilter = this.ctx.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.value = 600;
            noiseFilter.Q.value = 0.5;

            const noiseGain = this.ctx.createGain();
            noiseGain.gain.value = 0.4;

            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.sfxGain);

            noise.start(impactTime);

            // Chord hit
            const chordNotes = [261.63, 329.63, 392, 523.25]; // C4, E4, G4, C5
            chordNotes.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.value = freq;

                gain.gain.setValueAtTime(0.15, impactTime);
                gain.gain.exponentialRampToValueAtTime(0.01, impactTime + 0.6);

                osc.connect(gain);
                gain.connect(this.sfxGain);

                osc.start(impactTime);
                osc.stop(impactTime + 0.6);
            });
        }, 300);
    }

    // Game over
    playGameOver() {
        if (!this.initialized) return;

        const now = this.ctx.currentTime;
        const notes = [392, 349.23, 329.63, 293.66]; // G4, F4, E4, D4 (descending)

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.value = freq;

            const startTime = now + i * 0.2;
            gain.gain.setValueAtTime(0.2, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

            osc.connect(gain);
            gain.connect(this.sfxGain);

            osc.start(startTime);
            osc.stop(startTime + 0.4);
        });
    }

    // ===== BACKGROUND MUSIC =====

    startBGM() {
        if (!this.initialized || this.bgmPlaying) return;

        this.bgmPlaying = true;
        this.playBGMLoop();
    }

    playBGMLoop() {
        if (!this.bgmPlaying) return;

        const now = this.ctx.currentTime;

        // Simple bass line loop
        const bassNotes = [65.41, 65.41, 87.31, 82.41]; // C2, C2, F2, E2
        const beatDuration = 0.4;

        bassNotes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.value = freq;

            const startTime = now + i * beatDuration;
            gain.gain.setValueAtTime(0.15, startTime);
            gain.gain.exponentialRampToValueAtTime(0.05, startTime + beatDuration * 0.8);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + beatDuration);

            osc.connect(gain);
            gain.connect(this.musicGain);

            osc.start(startTime);
            osc.stop(startTime + beatDuration);

            this.bgmNodes.push(osc);
        });

        // Hi-hat pattern
        for (let i = 0; i < 8; i++) {
            const bufferSize = this.ctx.sampleRate * 0.02;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let j = 0; j < bufferSize; j++) {
                data[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / bufferSize, 3);
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 8000;

            const gain = this.ctx.createGain();
            gain.gain.value = 0.05;

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);

            const startTime = now + i * beatDuration / 2;
            noise.start(startTime);

            this.bgmNodes.push(noise);
        }

        // Kick drum on beats 1 and 3
        [0, 2].forEach(beat => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            const startTime = now + beat * beatDuration;
            osc.frequency.setValueAtTime(150, startTime);
            osc.frequency.exponentialRampToValueAtTime(30, startTime + 0.1);

            gain.gain.setValueAtTime(0.3, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

            osc.connect(gain);
            gain.connect(this.musicGain);

            osc.start(startTime);
            osc.stop(startTime + 0.15);

            this.bgmNodes.push(osc);
        });

        // Loop
        this.bgmInterval = setTimeout(() => {
            this.bgmNodes = [];
            this.playBGMLoop();
        }, beatDuration * 4 * 1000);
    }

    stopBGM() {
        this.bgmPlaying = false;

        if (this.bgmInterval) {
            clearTimeout(this.bgmInterval);
            this.bgmInterval = null;
        }

        this.bgmNodes.forEach(node => {
            try {
                node.stop();
            } catch (e) {
                // Node already stopped
            }
        });
        this.bgmNodes = [];
    }

    // Volume controls
    setMasterVolume(value) {
        this.masterVolume = Math.max(0, Math.min(1, value));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    }

    setMusicVolume(value) {
        this.musicVolume = Math.max(0, Math.min(1, value));
        if (this.musicGain) {
            this.musicGain.gain.value = this.musicVolume;
        }
    }

    setSfxVolume(value) {
        this.sfxVolume = Math.max(0, Math.min(1, value));
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.sfxVolume;
        }
    }
}

// Global singleton
export const soundManager = new SoundManager();
