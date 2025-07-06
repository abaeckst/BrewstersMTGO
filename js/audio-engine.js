// BREWSTER'S MTGO MISSION TERMINAL - V2 Audio Engine
// Ported from V1 with V2 architecture integration and enhanced mobile support

export const AudioEngine = {
    // Audio context and state
    context: null,
    sounds: {},
    loaded: false,
    unlocked: false,
    volume: 0.75,
    
    // Ambient system
    ambientOscillators: [],
    ambientSystemActive: false,
    
    // Sound definitions - 18 cinematic effects
    soundMap: {
        // Mission Impossible theme integration
        missionThemeShort: {
            url: 'assets/sounds/mission-theme-short.wav',
            volume: 1.0
        },
        missionThemeFull: {
            url: 'assets/sounds/mission-impossible-8bit.wav',
            volume: 0.8
        },
        
        // Terminal & system sounds
        terminalBeep: {
            url: 'assets/sounds/terminal-beep.wav',
            volume: 0.5
        },
        terminalTextBeep: {
            url: 'assets/sounds/terminal-text-beep.wav',
            volume: 0.3
        },
        typingSound: {
            url: 'assets/sounds/typing-sounds.wav',
            volume: 0.3
        },
        bootUp: {
            url: 'assets/sounds/boot-up.wav',
            volume: 0.6
        },
        crtPowerOn: {
            url: 'assets/sounds/crt-power-on.wav',
            volume: 0.7
        },
        
        // Interface & feedback
        beep: {
            url: 'assets/sounds/beep.wav',
            volume: 0.4
        },
        success: {
            url: 'assets/sounds/success.wav',
            volume: 0.7
        },
        alert: {
            url: 'assets/sounds/alert.wav',
            volume: 0.6
        },
        glitch: {
            url: 'assets/sounds/glitch.wav',
            volume: 0.4
        },
        disconnect: {
            url: 'assets/sounds/disconnect.wav',
            volume: 0.5
        },
        
        // Cinematic & narrative
        connectionEstablish: {
            url: 'assets/sounds/connection-establish.wav',
            volume: 0.5
        },
        connectionActive: {
            url: 'assets/sounds/connection-active.wav',
            volume: 0.4
        },
        systemStatusChange: {
            url: 'assets/sounds/system-status.wav',
            volume: 0.4
        },
        dataTransfer: {
            url: 'assets/sounds/data-transfer.wav',
            volume: 0.3
        },
        flipClock: {
            url: 'assets/sounds/flip-clock.wav',
            volume: 0.6
        },
        stateTransition: {
            url: 'assets/sounds/state-transition.wav',
            volume: 0.5
        },
        screenFlicker: {
            url: 'assets/sounds/screen-flicker.wav',
            volume: 0.2
        },
        
        // System ready sound for briefing screen
        systemReady: {
            url: 'assets/sounds/system-status.wav',
            volume: 0.4
        }
    },
    
    // Initialize audio system with V2 integration
    async init() {
        console.log('🔊 V2 Audio Engine initializing...');
        
        try {
            // Initialize Web Audio Context
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            
            // Setup mobile audio unlock
            this.setupMobileUnlock();
            
            // Preload all sounds
            await this.preloadSounds();
            
            this.loaded = true;
            console.log('✅ V2 Audio Engine initialized successfully');
            
            // CRT power-on sound will be played when needed (no ambient system)
            console.log('🔌 Audio engine ready - no ambient hum');
            
            return true;
        } catch (error) {
            console.error('❌ Audio engine initialization failed:', error);
            return false;
        }
    },
    
    // Setup mobile audio unlock for iOS/Android
    setupMobileUnlock() {
        const unlock = async () => {
            if (this.context && this.context.state === 'suspended') {
                try {
                    await this.context.resume();
                    this.unlocked = true;
                    console.log('🔓 Mobile audio unlocked');
                    
                    // Trigger welcome audio sequence
                    setTimeout(() => {
                        this.play('terminalBeep', { volume: 0.1 });
                    }, 100);
                    
                } catch (error) {
                    console.warn('⚠️ Mobile audio unlock failed:', error);
                }
            }
        };
        
        // Multiple event listeners for reliability
        const events = ['touchstart', 'touchend', 'mousedown', 'click', 'keydown'];
        events.forEach(event => {
            document.addEventListener(event, unlock, { once: true, passive: true });
        });
        
        // Also unlock on any form interaction
        document.addEventListener('focusin', unlock, { once: true });
    },
    
    // Preload all audio files
    async preloadSounds() {
        console.log('📥 Preloading audio files...');
        
        const promises = Object.entries(this.soundMap).map(([key, config]) => {
            return new Promise((resolve) => {
                const audio = new Audio();
                audio.preload = 'auto';
                audio.volume = (config.volume || 0.5) * this.volume;
                
                if (config.loop) {
                    audio.loop = true;
                }
                
                audio.addEventListener('canplaythrough', () => {
                    this.sounds[key] = { audio, config };
                    console.log(`✅ Loaded: ${key}`);
                    resolve();
                });
                
                audio.addEventListener('error', (e) => {
                    console.warn(`⚠️ Failed to load ${key}:`, e);
                    this.sounds[key] = { audio: null, config };
                    resolve(); // Still resolve to not block initialization
                });
                
                audio.src = config.url;
            });
        });
        
        await Promise.all(promises);
        console.log('✅ Audio preloading complete');
    },
    
    // Play sound with fallback to generated audio
    async play(soundKey, options = {}) {
        if (!this.loaded) {
            console.warn('⚠️ Audio engine not loaded');
            return null;
        }
        
        const config = this.soundMap[soundKey];
        if (!config) {
            console.warn(`⚠️ Sound not found: ${soundKey}`);
            return null;
        }
        
        try {
            // Try file-based audio first
            if (this.sounds[soundKey] && this.sounds[soundKey].audio) {
                const audio = this.sounds[soundKey].audio.cloneNode();
                audio.volume = (options.volume || config.volume || 0.5) * this.volume;
                
                if (options.loop !== undefined) {
                    audio.loop = options.loop;
                }
                
                await audio.play();
                return audio;
            }
            
            // Fallback to generated sound
            console.log(`🎵 Using generated sound for: ${soundKey}`);
            return this.playGeneratedSound(soundKey, options);
            
        } catch (error) {
            console.warn(`⚠️ Audio playback failed for ${soundKey}:`, error);
            
            // Final fallback to generated sound
            return this.playGeneratedSound(soundKey, options);
        }
    },
    
    // Generate synthesized audio fallback
    playGeneratedSound(soundKey, options = {}) {
        if (!this.context) return null;
        
        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            
            // Sound-specific parameters
            const soundParams = this.getGeneratedSoundParams(soundKey);
            
            oscillator.type = soundParams.type;
            oscillator.frequency.setValueAtTime(soundParams.frequency, this.context.currentTime);
            
            gainNode.gain.setValueAtTime(0, this.context.currentTime);
            gainNode.gain.linearRampToValueAtTime(
                (options.volume || soundParams.volume) * this.volume,
                this.context.currentTime + 0.01
            );
            gainNode.gain.exponentialRampToValueAtTime(
                0.001,
                this.context.currentTime + soundParams.duration
            );
            
            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);
            
            oscillator.start(this.context.currentTime);
            oscillator.stop(this.context.currentTime + soundParams.duration);
            
            return oscillator;
            
        } catch (error) {
            console.warn(`⚠️ Generated sound failed for ${soundKey}:`, error);
            return null;
        }
    },
    
    // Get parameters for generated sounds
    getGeneratedSoundParams(soundKey) {
        const params = {
            beep: { type: 'sine', frequency: 800, duration: 0.1, volume: 0.3 },
            terminalBeep: { type: 'square', frequency: 1000, duration: 0.15, volume: 0.4 },
            success: { type: 'sine', frequency: 523, duration: 0.3, volume: 0.5 },
            alert: { type: 'triangle', frequency: 440, duration: 0.2, volume: 0.4 },
            glitch: { type: 'sawtooth', frequency: 150, duration: 0.1, volume: 0.3 },
            stateTransition: { type: 'sine', frequency: 660, duration: 0.2, volume: 0.4 },
            dataTransfer: { type: 'square', frequency: 1200, duration: 0.05, volume: 0.3 },
            default: { type: 'sine', frequency: 440, duration: 0.1, volume: 0.3 }
        };
        
        return params[soundKey] || params.default;
    },
    
    // Mission Impossible theme with callback sync
    async playThemeWithSync(onDropCallback) {
        try {
            // Play full theme
            const audio = await this.play('missionThemeFull');
            
            if (audio) {
                // Sync callback to theme "drop" at 2.2 seconds
                setTimeout(() => {
                    if (onDropCallback) {
                        onDropCallback();
                    }
                }, 2200);
            } else {
                // Fallback: play generated theme
                this.playMissionThemeGenerated(onDropCallback);
            }
            
        } catch (error) {
            console.warn('⚠️ Mission theme playback failed:', error);
            this.playMissionThemeGenerated(onDropCallback);
        }
    },
    
    // Generated Mission Impossible theme fallback
    playMissionThemeGenerated(onDropCallback) {
        const theme = [
            { freq: 659, duration: 0.2, delay: 0 },     // E
            { freq: 698, duration: 0.2, delay: 300 },   // F#
            { freq: 784, duration: 0.4, delay: 600 },   // G
            { freq: 880, duration: 0.8, delay: 2200 },  // A (the "drop")
        ];
        
        theme.forEach(note => {
            setTimeout(() => {
                this.generateBeep(note.freq, note.duration);
            }, note.delay);
        });
        
        // Callback sync for generated theme
        if (onDropCallback) {
            setTimeout(onDropCallback, 2200);
        }
    },
    
    // Generate specific frequency beep
    generateBeep(frequency, duration) {
        if (!this.context) return;
        
        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
            
            gainNode.gain.setValueAtTime(0, this.context.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3 * this.volume, this.context.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);
            
            oscillator.start(this.context.currentTime);
            oscillator.stop(this.context.currentTime + duration);
            
        } catch (error) {
            console.warn('⚠️ Beep generation failed:', error);
        }
    },
    
    // Start ambient audio system
    startAmbientSystem() {
        if (this.ambientSystemActive) return;
        
        this.ambientSystemActive = true;
        console.log('🌊 Starting ambient audio system');
        
        // Play ambient hum if available
        this.play('ambientHum', { volume: 0.1, loop: true });
        
        // Start generated ambient oscillators
        this.createAmbientOscillators();
    },
    
    // Create generated ambient sounds
    createAmbientOscillators() {
        if (!this.context) return;
        
        try {
            // Low frequency hum
            const hum = this.context.createOscillator();
            const humGain = this.context.createGain();
            
            hum.type = 'sine';
            hum.frequency.setValueAtTime(60, this.context.currentTime);
            humGain.gain.setValueAtTime(0.05 * this.volume, this.context.currentTime);
            
            hum.connect(humGain);
            humGain.connect(this.context.destination);
            hum.start();
            
            this.ambientOscillators.push({ oscillator: hum, gain: humGain });
            
            // High frequency CRT whine
            const whine = this.context.createOscillator();
            const whineGain = this.context.createGain();
            
            whine.type = 'sine';
            whine.frequency.setValueAtTime(15000, this.context.currentTime);
            whineGain.gain.setValueAtTime(0.02 * this.volume, this.context.currentTime);
            
            whine.connect(whineGain);
            whineGain.connect(this.context.destination);
            whine.start();
            
            this.ambientOscillators.push({ oscillator: whine, gain: whineGain });
            
        } catch (error) {
            console.warn('⚠️ Ambient oscillator creation failed:', error);
        }
    },
    
    // Stop ambient system
    stopAmbientSystem() {
        if (!this.ambientSystemActive) return;
        
        this.ambientSystemActive = false;
        console.log('🔇 Stopping ambient audio system');
        
        // Stop all ambient oscillators
        this.ambientOscillators.forEach(({ oscillator, gain }) => {
            try {
                gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.5);
                oscillator.stop(this.context.currentTime + 0.5);
            } catch (error) {
                console.warn('⚠️ Ambient oscillator stop failed:', error);
            }
        });
        
        this.ambientOscillators = [];
    },
    
    // V2 State Machine Integration
    playStateTransition(fromState, toState) {
        const transitions = {
            'boot-sequence-auth': 'stateTransition',
            'auth-mission': 'connectionEstablish',
            'mission-briefing': 'success',
            'briefing-countdown': 'success',
            'countdown-credits': 'flipClock',
            'default': 'beep'
        };
        
        const transitionKey = `${fromState}-${toState}`;
        const soundKey = transitions[transitionKey] || transitions.default;
        
        console.log(`🎵 Playing transition audio: ${fromState} → ${toState} (${soundKey})`);
        this.play(soundKey);
    },
    
    // Play contextual audio for screen states
    playContextualAudio(screenState) {
        const contextualSounds = {
            'boot-sequence': 'crtPowerOn',
            'auth': 'terminalBeep',
            'mission': 'alert',
            'briefing': 'dataTransfer',
            'countdown': 'flipClock',
            'credits': 'success'
        };
        
        const soundKey = contextualSounds[screenState];
        if (soundKey) {
            console.log(`🎵 Playing contextual audio for: ${screenState} (${soundKey})`);
            this.play(soundKey);
        }
    },
    
    // Set master volume
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        console.log(`🔊 Volume set to: ${Math.round(this.volume * 100)}%`);
        
        // Update ambient oscillator volumes
        this.ambientOscillators.forEach(({ gain }) => {
            if (gain) {
                gain.gain.setValueAtTime(gain.gain.value * this.volume, this.context.currentTime);
            }
        });
    },
    
    // Get audio engine status
    getStatus() {
        return {
            loaded: this.loaded,
            unlocked: this.unlocked,
            volume: this.volume,
            ambientActive: this.ambientSystemActive,
            contextState: this.context ? this.context.state : 'none',
            soundsLoaded: Object.keys(this.sounds).length
        };
    }
};

// Auto-initialize when imported
if (typeof window !== 'undefined') {
    // Initialize audio engine when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            AudioEngine.init();
        });
    } else {
        AudioEngine.init();
    }
}

export default AudioEngine;