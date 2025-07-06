// BREWSTER'S MTGO MISSION TERMINAL - Audio Engine

export const AudioEngine = {
    // Audio context and state
    context: null,
    sounds: {},
    loaded: false,
    unlocked: false,
    volume: 0.75,
    
    // Sound definitions
    soundMap: {
        missionThemeShort: {
            url: 'assets/sounds/mission-theme-short.mp3',
            volume: 1.0
        },
        missionThemeFull: {
            url: 'assets/sounds/mission-impossible-8bit.mp3',
            volume: 0.8
        },
        terminalBeep: {
            url: 'assets/sounds/terminal-beep.mp3',
            volume: 0.5
        },
        typingSound: {
            url: 'assets/sounds/typing-sounds.mp3',
            volume: 0.3
        },
        bootUp: {
            url: 'assets/sounds/boot-up.mp3',
            volume: 0.6
        },
        glitch: {
            url: 'assets/sounds/glitch.mp3',
            volume: 0.4
        },
        success: {
            url: 'assets/sounds/success.mp3',
            volume: 0.7
        },
        alert: {
            url: 'assets/sounds/alert.mp3',
            volume: 0.6
        },
        disconnect: {
            url: 'assets/sounds/disconnect.mp3',
            volume: 0.5
        },
        beep: {
            url: 'assets/sounds/beep.mp3',
            volume: 0.4
        },
        // New enhanced sounds for cinematic experience
        connectionEstablish: {
            url: 'assets/sounds/connection-establish.mp3',
            volume: 0.5
        },
        connectionActive: {
            url: 'assets/sounds/connection-active.mp3',
            volume: 0.4
        },
        systemStatusChange: {
            url: 'assets/sounds/system-status.mp3',
            volume: 0.4
        },
        dataTransfer: {
            url: 'assets/sounds/data-transfer.mp3',
            volume: 0.3
        },
        flipClock: {
            url: 'assets/sounds/flip-clock.mp3',
            volume: 0.6
        },
        terminalTextBeep: {
            url: 'assets/sounds/terminal-text-beep.mp3',
            volume: 0.3
        },
        stateTransition: {
            url: 'assets/sounds/state-transition.mp3',
            volume: 0.5
        },
        screenFlicker: {
            url: 'assets/sounds/screen-flicker.mp3',
            volume: 0.2
        },
        ambientHum: {
            url: 'assets/sounds/ambient-hum.mp3',
            volume: 0.15,
            loop: true
        },
        crtPowerOn: {
            url: 'assets/sounds/crt-power-on.mp3',
            volume: 0.6
        }
    },
    
    // Initialize audio system
    async init() {
        console.log('🔊 Initializing audio engine...');
        
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
            
            // Preload sounds
            await this.preloadSounds();
            
            // Set up unlock handler for mobile
            this.setupMobileUnlock();
            
            // Set up integrated audio calibration
            this.setupIntegratedAudioCalibration();
            
            console.log('✅ Audio engine initialized');
            return true;
        } catch (error) {
            console.error('❌ Audio engine initialization failed:', error);
            return false;
        }
    },
    
    // Preload all sounds
    async preloadSounds() {
        const loadPromises = Object.entries(this.soundMap).map(async ([key, config]) => {
            try {
                // For now, create placeholder audio elements
                // In production, these would load actual files
                const audio = new Audio();
                audio.volume = config.volume * this.volume;
                audio.preload = 'auto';
                
                // Store audio element
                this.sounds[key] = {
                    audio,
                    config
                };
                
                console.log(`✓ Loaded sound: ${key}`);
            } catch (error) {
                console.error(`✗ Failed to load sound: ${key}`, error);
            }
        });
        
        await Promise.all(loadPromises);
        this.loaded = true;
    },
    
    // Set up mobile audio unlock
    setupMobileUnlock() {
        const unlock = () => {
            if (this.context.state === 'suspended') {
                this.context.resume().then(() => {
                    console.log('🔓 Audio context unlocked');
                    this.unlocked = true;
                    this.updateAudioStatus('unlocked');
                });
            }
        };
        
        // Try to unlock on any user interaction
        document.addEventListener('touchstart', unlock, { once: true });
        document.addEventListener('click', unlock, { once: true });
    },
    
    // Set up integrated audio calibration
    setupIntegratedAudioCalibration() {
        let audioCalibrated = false;
        
        // Audio calibration on first form interaction
        const calibrateAudio = async () => {
            if (audioCalibrated) return;
            
            console.log('🎵 Calibrating audio system...');
            
            try {
                // Ensure audio context is resumed (mobile requirement)
                if (this.context && this.context.state === 'suspended') {
                    await this.context.resume();
                }
                
                // Try to play a quiet test sound
                await this.play('terminalBeep', { volume: 0.1 });
                
                // Update audio status
                this.updateAudioStatus('calibrated');
                audioCalibrated = true;
                
                console.log('✅ Audio calibration successful');
                
                // Play welcome audio sequence
                setTimeout(() => {
                    this.playWelcomeAudioSequence();
                }, 100);
                
            } catch (error) {
                console.warn('⚠️ Audio calibration failed:', error);
                this.updateAudioStatus('failed');
            }
        };
        
        // Set up calibration triggers for mobile-first experience
        document.addEventListener('DOMContentLoaded', () => {
            // Add listeners to auth form inputs
            const agentInput = document.getElementById('agent-name');
            const codeInput = document.getElementById('access-code');
            
            if (agentInput) {
                // Multiple trigger events for better mobile support
                agentInput.addEventListener('focus', calibrateAudio, { once: true });
                agentInput.addEventListener('touchstart', calibrateAudio, { once: true });
                agentInput.addEventListener('input', calibrateAudio, { once: true });
            }
            if (codeInput) {
                codeInput.addEventListener('focus', calibrateAudio, { once: true });
                codeInput.addEventListener('touchstart', calibrateAudio, { once: true });
                codeInput.addEventListener('input', calibrateAudio, { once: true });
            }
            
            // Also add body-level touch trigger as fallback
            document.body.addEventListener('touchstart', calibrateAudio, { once: true });
            document.body.addEventListener('click', calibrateAudio, { once: true });
        });
    },
    
    // Update audio status indicators
    updateAudioStatus(status) {
        const diagnostics = document.querySelector('.system-diagnostics');
        if (!diagnostics) return;
        
        const audioStatusLine = diagnostics.querySelector('.audio-status-line');
        if (audioStatusLine) {
            // Remove all status classes
            audioStatusLine.classList.remove('audio-active', 'audio-calibrated', 'audio-failed');
            
            switch (status) {
                case 'unlocked':
                    audioStatusLine.textContent = 'AUDIO SYSTEM: ACTIVE';
                    audioStatusLine.classList.add('audio-active');
                    break;
                case 'calibrated':
                    audioStatusLine.textContent = 'AUDIO SYSTEM: CALIBRATED';
                    audioStatusLine.classList.add('audio-calibrated');
                    break;
                case 'failed':
                    audioStatusLine.textContent = 'AUDIO SYSTEM: SILENT MODE';
                    audioStatusLine.classList.add('audio-failed');
                    break;
                default:
                    audioStatusLine.textContent = 'AUDIO SYSTEM: STANDBY';
            }
        }
    },
    
    // Play welcome audio sequence
    async playWelcomeAudioSequence() {
        console.log('🎵 Playing welcome audio sequence...');
        
        // Soft connection establishment
        await this.play('connectionEstablish', { volume: 0.3 });
        
        // Brief system status sound
        setTimeout(() => {
            this.play('systemStatusChange', { volume: 0.2 });
        }, 800);
        
        // Low ambient hum to establish atmosphere
        setTimeout(() => {
            this.play('ambientHum', { volume: 0.1 });
        }, 1500);
    },
    
    // Play a sound with enhanced error handling
    async play(soundKey, options = {}) {
        if (!this.loaded) {
            console.warn('Audio engine not loaded');
            return;
        }
        
        // Check if audio is available
        if (!this.context || this.context.state === 'suspended') {
            console.log(`Audio not available, attempting to play: ${soundKey}`);
            // Still try to unlock if needed
            if (this.context) {
                try {
                    await this.context.resume();
                    this.unlocked = true;
                    this.updateAudioStatus('unlocked');
                } catch (error) {
                    console.warn('Failed to resume audio context:', error);
                }
            }
        }
        
        // Try to play actual audio file first
        if (this.sounds[soundKey] && this.sounds[soundKey].audio.src) {
            try {
                const sound = this.sounds[soundKey];
                const audio = sound.audio.cloneNode();
                
                // Apply options with volume balancing
                const finalVolume = (options.volume || sound.config.volume) * this.volume;
                audio.volume = Math.max(0, Math.min(1, finalVolume));
                if (options.loop || sound.config.loop) audio.loop = true;
                
                // Play the sound
                const playPromise = audio.play();
                if (playPromise) {
                    await playPromise;
                }
                
                return audio;
            } catch (error) {
                console.warn(`Audio file failed, using generated sound: ${soundKey}`, error);
            }
        }
        
        // Fallback to generated sounds
        this.playGeneratedSound(soundKey, options);
    },
    
    // Play generated fallback sounds
    playGeneratedSound(soundKey, options = {}) {
        if (!this.context || !this.unlocked) {
            console.log(`Generated sound: ${soundKey} (audio not unlocked)`);
            return;
        }
        
        switch(soundKey) {
            case 'missionThemeShort':
                // Two-note Mission Impossible theme snippet
                this.generateBeep(659, 200); // E
                setTimeout(() => this.generateBeep(698, 200), 300); // F#
                break;
                
            case 'missionThemeFull':
                // Extended theme simulation
                this.playMissionThemeGenerated();
                break;
                
            case 'terminalBeep':
                this.generateBeep(800, 100);
                break;
                
            case 'typingSound':
                // Rapid typing simulation
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => this.generateBeep(400 + Math.random() * 200, 30), i * 50);
                }
                break;
                
            case 'bootUp':
                // Boot sequence tones
                this.generateBeep(200, 150);
                setTimeout(() => this.generateBeep(400, 150), 200);
                setTimeout(() => this.generateBeep(600, 150), 400);
                break;
                
            case 'glitch':
                this.generateGlitch();
                break;
                
            case 'success':
                // Success chord
                this.generateBeep(523, 100); // C
                setTimeout(() => this.generateBeep(659, 100), 100); // E
                setTimeout(() => this.generateBeep(784, 200), 200); // G
                break;
                
            case 'alert':
                // Alert pattern
                this.generateBeep(1000, 100);
                setTimeout(() => this.generateBeep(800, 100), 150);
                setTimeout(() => this.generateBeep(1000, 100), 300);
                break;
                
            // Enhanced sounds for cinematic experience
            case 'connectionEstablish':
                // Connection establishment sequence
                this.generateBeep(400, 80);
                setTimeout(() => this.generateBeep(500, 80), 100);
                setTimeout(() => this.generateBeep(600, 80), 200);
                setTimeout(() => this.generateBeep(700, 120), 300);
                break;
                
            case 'connectionActive':
                // Active connection pulse
                this.generateBeep(600, 50);
                setTimeout(() => this.generateBeep(700, 50), 100);
                break;
                
            case 'systemStatusChange':
                // System status change notification
                this.generateBeep(880, 60);
                setTimeout(() => this.generateBeep(1100, 60), 100);
                break;
                
            case 'dataTransfer':
                // Data transfer effect
                for (let i = 0; i < 8; i++) {
                    setTimeout(() => {
                        this.generateBeep(300 + (i * 50), 30);
                    }, i * 40);
                }
                break;
                
            case 'flipClock':
                // Flip clock mechanism sound
                this.generateBeep(200, 40);
                setTimeout(() => this.generateBeep(300, 40), 50);
                setTimeout(() => this.generateBeep(400, 60), 100);
                break;
                
            case 'terminalTextBeep':
                // Soft terminal text beep
                this.generateBeep(600, 30);
                break;
                
            case 'stateTransition':
                // State transition sound
                this.generateBeep(523, 100); // C
                setTimeout(() => this.generateBeep(659, 100), 120); // E
                setTimeout(() => this.generateBeep(784, 150), 240); // G
                break;
                
            case 'screenFlicker':
                // Screen flicker effect
                this.generateBeep(50, 20);
                setTimeout(() => this.generateBeep(100, 20), 30);
                break;
                
            case 'ambientHum':
                // Ambient computer hum - low frequency drone
                this.generateAmbientHum();
                break;
                
            case 'crtPowerOn':
                // CRT power on sound
                this.generateBeep(50, 100);
                setTimeout(() => this.generateBeep(100, 150), 100);
                setTimeout(() => this.generateBeep(200, 200), 250);
                setTimeout(() => this.generateBeep(400, 300), 450);
                setTimeout(() => this.generateBeep(600, 100), 750);
                break;
                
            default:
                console.warn(`Unknown sound: ${soundKey}`);
                this.generateBeep(440, 100); // Default beep
        }
    },
    
    // Generate Mission Impossible theme
    playMissionThemeGenerated() {
        const theme = [
            { freq: 659, duration: 200, delay: 0 },    // E
            { freq: 698, duration: 200, delay: 300 },  // F#
            { freq: 784, duration: 400, delay: 600 },  // G
            { freq: 659, duration: 200, delay: 1100 }, // E
            { freq: 698, duration: 200, delay: 1400 }, // F#
            { freq: 784, duration: 400, delay: 1700 }, // G
            { freq: 880, duration: 800, delay: 2200 }, // A (the "drop")
        ];
        
        theme.forEach(note => {
            setTimeout(() => {
                this.generateBeep(note.freq, note.duration);
            }, note.delay);
        });
    },
    
    // Play typing sound effect
    async playTyping(duration = 100) {
        const audio = await this.play('typingSound');
        if (audio) {
            setTimeout(() => {
                audio.pause();
                audio.currentTime = 0;
            }, duration);
        }
        return audio;
    },
    
    // Play the Mission Impossible theme (synchronized with timer)
    async playThemeWithSync(onDropCallback) {
        // Try to play the full theme
        this.play('missionThemeFull');
        
        // The "drop" in our generated theme happens at 2.2 seconds (when the high A note plays)
        setTimeout(() => {
            if (onDropCallback) onDropCallback();
        }, 2200);
        
        return true;
    },
    
    // Stop all sounds
    stopAll() {
        Object.values(this.sounds).forEach(sound => {
            if (sound.audio) {
                sound.audio.pause();
                sound.audio.currentTime = 0;
            }
        });
    },
    
    // Set master volume
    setVolume(level) {
        this.volume = Math.max(0, Math.min(1, level));
        
        // Update all audio elements
        Object.values(this.sounds).forEach(sound => {
            if (sound.audio) {
                sound.audio.volume = sound.config.volume * this.volume;
            }
        });
    },
    
    // Generate ambient hum sound
    generateAmbientHum() {
        if (!this.context || !this.unlocked) return;
        
        // Create low frequency oscillator for hum
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(60, this.context.currentTime); // 60Hz hum
        
        // Add some harmonic complexity
        const oscillator2 = this.context.createOscillator();
        oscillator2.connect(gainNode);
        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(120, this.context.currentTime); // 120Hz harmonic
        
        // Low volume ambient sound
        gainNode.gain.setValueAtTime(0.05 * this.volume, this.context.currentTime);
        
        // Start oscillators
        oscillator.start();
        oscillator2.start();
        
        // Store for later stopping if needed
        this.ambientOscillators = [oscillator, oscillator2];
        
        return { oscillator, oscillator2, gainNode };
    },
    
    // Generate simple beep sound with enhanced wave types
    generateBeep(frequency = 800, duration = 100, waveType = 'square') {
        if (!this.context || !this.unlocked) return;
        
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = waveType;
        
        gainNode.gain.setValueAtTime(0.1 * this.volume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration / 1000);
        
        oscillator.start();
        oscillator.stop(this.context.currentTime + duration / 1000);
    },
    
    // Generate glitch sound effect
    generateGlitch() {
        const frequencies = [100, 200, 400, 800, 1600];
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.generateBeep(freq, 50);
            }, index * 30);
        });
    },
    
    // Enhanced audio functions for cinematic experience
    
    // Play connection establishment sequence
    async playConnectionSequence() {
        await this.play('connectionEstablish');
        return new Promise(resolve => {
            setTimeout(() => {
                this.play('connectionActive');
                resolve();
            }, 500);
        });
    },
    
    // Play enhanced typing with terminal beeps
    async playEnhancedTyping(duration = 100, charCount = 1) {
        // Play base typing sound
        const typingPromise = this.play('typingSound');
        
        // Add terminal beeps for each character
        for (let i = 0; i < charCount; i++) {
            setTimeout(() => {
                this.play('terminalTextBeep');
            }, i * (duration / charCount));
        }
        
        return typingPromise;
    },
    
    // Play data transfer effect
    async playDataTransfer(duration = 2000) {
        const startTime = Date.now();
        const interval = 200;
        
        const transferLoop = () => {
            if (Date.now() - startTime < duration) {
                this.play('dataTransfer');
                setTimeout(transferLoop, interval);
            }
        };
        
        transferLoop();
    },
    
    // Play flip clock sound with timing
    async playFlipClockSound(digitCount = 1) {
        for (let i = 0; i < digitCount; i++) {
            setTimeout(() => {
                this.play('flipClock');
            }, i * 100);
        }
    },
    
    // Play screen flicker effect
    async playScreenFlicker(intensity = 3) {
        for (let i = 0; i < intensity; i++) {
            setTimeout(() => {
                this.play('screenFlicker');
            }, i * 50);
        }
    },
    
    // Play system status change with emphasis
    async playSystemStatusChange(type = 'normal') {
        switch(type) {
            case 'success':
                this.play('success');
                break;
            case 'warning':
                this.play('alert');
                break;
            case 'error':
                this.play('glitch');
                break;
            default:
                this.play('systemStatusChange');
        }
    },
    
    // Enhanced audio sequences for auth experience
    
    // Play environmental terminal activation
    async playTerminalActivation() {
        console.log('🎵 Playing terminal activation sequence...');
        
        // Initial CRT power-on sound
        await this.play('crtPowerOn', { volume: 0.4 });
        
        // System initialization beeps
        setTimeout(() => {
            this.play('bootUp', { volume: 0.3 });
        }, 1000);
        
        // Connection establishment
        setTimeout(() => {
            this.play('connectionEstablish', { volume: 0.25 });
        }, 2000);
        
        // Ambient hum begins
        setTimeout(() => {
            this.play('ambientHum', { volume: 0.1 });
        }, 2500);
    },
    
    // Play security protocol initialization
    async playSecurityProtocolInit() {
        console.log('🎵 Playing security protocol initialization...');
        
        // Protocol activation sequence
        await this.play('systemStatusChange', { volume: 0.3 });
        
        // Data transfer sounds
        setTimeout(() => {
            this.play('dataTransfer', { volume: 0.2 });
        }, 300);
        
        // System ready confirmation
        setTimeout(() => {
            this.play('beep', { volume: 0.25 });
        }, 800);
    },
    
    // Play form interaction feedback
    async playFormInteractionFeedback(type, value = '') {
        switch (type) {
            case 'focus':
                this.play('beep', { volume: 0.15 });
                break;
            case 'blur':
                this.play('terminalBeep', { volume: 0.1 });
                break;
            case 'valid':
                this.play('success', { volume: 0.2 });
                break;
            case 'invalid':
                this.play('alert', { volume: 0.2 });
                break;
            case 'typing':
                this.play('terminalTextBeep', { volume: 0.1 });
                break;
            case 'submit':
                this.play('stateTransition', { volume: 0.3 });
                break;
            default:
                this.play('terminalBeep', { volume: 0.1 });
        }
    },
    
    // Play authentication success sequence
    async playAuthenticationSuccess() {
        console.log('🎵 Playing authentication success sequence...');
        
        // Success confirmation
        await this.play('success', { volume: 0.4 });
        
        // System access granted
        setTimeout(() => {
            this.play('connectionActive', { volume: 0.3 });
        }, 500);
        
        // State transition preparation
        setTimeout(() => {
            this.play('stateTransition', { volume: 0.35 });
        }, 1000);
    },
    
    // Play continuous ambient atmosphere with sophisticated controls
    async playAmbientAtmosphere() {
        // Start low-level ambient hum for atmosphere
        this.play('ambientHum', { volume: 0.08, loop: true });
        
        // Track ambient system for proper cleanup
        this.ambientSystemActive = true;
        
        // Occasional system status sounds with narrative purpose
        const playRandomSystemSound = () => {
            if (!this.ambientSystemActive) return;
            
            const sounds = [
                { sound: 'systemStatusChange', weight: 3, volume: 0.04 },
                { sound: 'dataTransfer', weight: 2, volume: 0.03 },
                { sound: 'beep', weight: 1, volume: 0.03 },
                { sound: 'terminalBeep', weight: 2, volume: 0.02 }
            ];
            
            // Weighted random selection
            const totalWeight = sounds.reduce((sum, item) => sum + item.weight, 0);
            let random = Math.random() * totalWeight;
            
            for (const item of sounds) {
                random -= item.weight;
                if (random <= 0) {
                    this.play(item.sound, { volume: item.volume });
                    break;
                }
            }
            
            // Schedule next sound with variable timing (20-45 seconds)
            const nextDelay = 20000 + Math.random() * 25000;
            setTimeout(playRandomSystemSound, nextDelay);
        };
        
        // Start ambient system sounds after auth completion
        setTimeout(playRandomSystemSound, 12000);
    },
    
    // Stop ambient atmosphere
    stopAmbientAtmosphere() {
        this.ambientSystemActive = false;
        
        // Stop ambient oscillators if they exist
        if (this.ambientOscillators) {
            this.ambientOscillators.forEach(osc => {
                try {
                    osc.stop();
                } catch (error) {
                    // Oscillator may already be stopped
                }
            });
            this.ambientOscillators = null;
        }
    },
    
    // Enhanced system polish for perfect timing
    async playTimedSequence(sequence) {
        for (const step of sequence) {
            if (step.delay) {
                await new Promise(resolve => setTimeout(resolve, step.delay));
            }
            
            if (step.sound) {
                this.play(step.sound, step.options || {});
            }
            
            if (step.callback) {
                step.callback();
            }
        }
    }
};