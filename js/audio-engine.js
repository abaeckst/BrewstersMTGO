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
            volume: 0.3,
            useGenerated: true // Prefer generated for unique sound
        },
        typingSound: {
            url: 'assets/sounds/typing-sounds.wav',
            volume: 0.2,
            useGenerated: true // Prefer generated for unique sound
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
    
    // Initialize audio system with V2 integration and iOS diagnostics
    async init() {
        console.log('🔊 V2 Audio Engine initializing...');
        console.log('📱 iOS Detection:', this.isIOS());
        console.log('🎵 AudioContext Support:', !!(window.AudioContext || window.webkitAudioContext));
        
        try {
            // Initialize Web Audio Context with iOS-specific handling
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) {
                console.log('❌ No AudioContext support - using fallback mode');
                this.loaded = true; // Mark as loaded for generated sounds
                this.setupMobileUnlock();
                return true;
            }
            
            this.context = new AudioContextClass();
            console.log('✅ AudioContext created:', this.context.state);
            
            // Setup mobile audio unlock
            this.setupMobileUnlock();
            
            // iOS-safe preloading with timeout
            console.log('📥 Starting audio preload...');
            const preloadSuccess = await this.preloadSoundsWithTimeout();
            console.log('📥 Preload result:', preloadSuccess);
            
            // Always mark as loaded for iOS compatibility
            this.loaded = true;
            console.log('✅ V2 Audio Engine initialized successfully');
            console.log('📊 Final status:', this.getStatus());
            
            return true;
        } catch (error) {
            console.log('❌ Audio engine initialization failed:', error);
            console.log('🔄 Enabling fallback mode...');
            
            // Enable fallback mode - still mark as loaded for generated sounds
            this.loaded = true;
            this.setupMobileUnlock();
            return true; // Return true to prevent blocking app initialization
        }
    },
    
    // Setup mobile audio unlock for iOS/Android with enhanced reliability
    setupMobileUnlock() {
        let unlockAttempted = false;
        
        const unlock = async () => {
            if (unlockAttempted) {
                console.log('🔓 Audio unlock already attempted');
                return;
            }
            unlockAttempted = true;
            
            console.log('🔓 Attempting audio unlock...');
            console.log('📊 Context state:', this.context ? this.context.state : 'none');
            
            if (!this.context) {
                console.log('🔓 No audio context - generating one for unlock');
                try {
                    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                    if (AudioContextClass) {
                        this.context = new AudioContextClass();
                        console.log('🔓 Audio context created during unlock');
                    }
                } catch (error) {
                    console.log('🔓 Failed to create audio context during unlock:', error);
                    this.unlocked = true; // Mark as unlocked for generated sounds
                    return;
                }
            }
            
            if (this.context && this.context.state === 'suspended') {
                try {
                    await this.context.resume();
                    console.log('🔓 Audio context resumed');
                    
                    // iOS-specific: Create and play multiple silent buffers
                    const bufferTests = [
                        { channels: 1, samples: 1, rate: 22050 },
                        { channels: 1, samples: 100, rate: 44100 },
                        { channels: 2, samples: 1, rate: 48000 }
                    ];
                    
                    for (const test of bufferTests) {
                        try {
                            const buffer = this.context.createBuffer(test.channels, test.samples, test.rate);
                            const source = this.context.createBufferSource();
                            source.buffer = buffer;
                            source.connect(this.context.destination);
                            source.start();
                            console.log(`🔓 Silent buffer test passed: ${test.channels}ch/${test.rate}Hz`);
                        } catch (bufferError) {
                            console.log(`🔓 Silent buffer test failed: ${bufferError.message}`);
                        }
                    }
                    
                    this.unlocked = true;
                    console.log('🔓 Audio unlock successful');
                    
                    // Trigger welcome audio sequence after unlock
                    setTimeout(() => {
                        this.play('terminalBeep', { volume: 0.1 });
                    }, 100);
                    
                } catch (error) {
                    console.log('🔓 Audio unlock failed:', error);
                    // Still mark as unlocked for generated sounds
                    this.unlocked = true;
                    unlockAttempted = false; // Allow retry
                }
            } else {
                console.log('🔓 Audio context not suspended, marking as unlocked');
                this.unlocked = true;
            }
        };
        
        // Comprehensive event listeners for maximum iOS compatibility
        const events = [
            'touchstart', 'touchend', 'touchmove',
            'mousedown', 'mouseup', 'click',
            'keydown', 'keyup', 'keypress',
            'pointerdown', 'pointerup'
        ];
        
        events.forEach(event => {
            document.addEventListener(event, unlock, { 
                once: true, 
                passive: true, 
                capture: true 
            });
        });
        
        // Also unlock on any form interaction
        document.addEventListener('focusin', unlock, { once: true });
        
        // iOS-specific: Unlock on visibility change (app foreground)
        document.addEventListener('visibilitychange', unlock, { once: true });
        
        console.log('🔓 Mobile audio unlock listeners setup complete');
    },
    
    // Manual unlock method for iOS compatibility with enhanced reliability
    async unlockAudioContext() {
        if (this.unlocked) {
            return true;
        }
        
        if (!this.context) {
            return false;
        }
        
        try {
            // For iOS Safari, we need to resume the context on user interaction
            if (this.context.state === 'suspended') {
                await this.context.resume();
            }
            
            // Enhanced iOS unlock: Create and play multiple test sounds
            const tests = [
                { type: 'sine', freq: 440, duration: 0.01 },
                { type: 'triangle', freq: 880, duration: 0.01 },
                { type: 'square', freq: 220, duration: 0.01 }
            ];
            
            for (const test of tests) {
                const oscillator = this.context.createOscillator();
                const gainNode = this.context.createGain();
                
                oscillator.type = test.type;
                oscillator.frequency.value = test.freq;
                gainNode.gain.value = 0; // Silent
                
                oscillator.connect(gainNode);
                gainNode.connect(this.context.destination);
                
                oscillator.start();
                oscillator.stop(this.context.currentTime + test.duration);
                
                // Small delay between tests
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            
            // Create a silent buffer and play it (iOS-specific requirement)
            const buffer = this.context.createBuffer(1, this.context.sampleRate * 0.01, this.context.sampleRate);
            const source = this.context.createBufferSource();
            source.buffer = buffer;
            source.connect(this.context.destination);
            source.start();
            
            this.unlocked = true;
            return true;
            
        } catch (error) {
            // Silent failure - return false but don't log errors
            return false;
        }
    },
    
    // Preload all audio files with iOS-safe timeout
    async preloadSoundsWithTimeout() {
        console.log('📥 Preloading audio files with timeout...');
        console.log(`📱 Device info: iOS=${this.isIOS()}, UserAgent=${navigator.userAgent.substring(0, 50)}...`);
        
        const promises = Object.entries(this.soundMap).map(([key, config]) => {
            return new Promise((resolve) => {
                const audio = new Audio();
                audio.preload = 'auto';
                audio.volume = (config.volume || 0.5) * this.volume;
                
                if (config.loop) {
                    audio.loop = true;
                }
                
                // iOS-specific: Set timeout for each file (longer for theme files)
                const isThemeFile = key.toLowerCase().includes('theme');
                const timeoutDuration = this.isIOS() ? (isThemeFile ? 10000 : 3000) : 5000;
                
                console.log(`📥 Loading ${key} with ${timeoutDuration}ms timeout (iOS: ${this.isIOS()}, Theme: ${isThemeFile})`);
                console.log(`📂 File URL: ${config.url}`);
                
                const timeout = setTimeout(() => {
                    console.log(`⏰ TIMEOUT loading ${key} after ${timeoutDuration}ms - using generated fallback`);
                    this.sounds[key] = { audio: null, config, useGenerated: true };
                    resolve();
                }, timeoutDuration);
                
                audio.addEventListener('canplaythrough', () => {
                    clearTimeout(timeout);
                    this.sounds[key] = { audio, config };
                    console.log(`✅ Successfully loaded: ${key}`);
                    resolve();
                });
                
                audio.addEventListener('error', (e) => {
                    clearTimeout(timeout);
                    console.log(`❌ ERROR loading ${key}:`, e.type, e.message || 'Unknown error');
                    console.log(`❌ Error details:`, { 
                        src: audio.src, 
                        readyState: audio.readyState, 
                        networkState: audio.networkState,
                        error: audio.error ? audio.error.code : 'none'
                    });
                    this.sounds[key] = { audio: null, config, useGenerated: true };
                    resolve(); // Still resolve to not block initialization
                });
                
                // Add additional debugging events
                audio.addEventListener('loadstart', () => {
                    console.log(`📥 Load started: ${key}`);
                });
                
                audio.addEventListener('loadeddata', () => {
                    console.log(`📊 Data loaded: ${key}`);
                });
                
                audio.addEventListener('canplay', () => {
                    console.log(`▶️ Can play: ${key}`);
                });
                
                audio.src = config.url;
            });
        });
        
        try {
            await Promise.all(promises);
            console.log('✅ Audio preloading complete');
            return true;
        } catch (error) {
            console.log('❌ Audio preloading failed:', error);
            return false;
        }
    },
    
    // Legacy method for backward compatibility
    async preloadSounds() {
        return this.preloadSoundsWithTimeout();
    },
    
    // Play sound with fallback to generated audio
    async play(soundKey, options = {}) {
        console.log(`🎵 Playing sound: ${soundKey}`, options);
        
        if (!this.loaded) {
            console.log('🔊 Audio engine not loaded - attempting to play generated sound anyway');
            // Try generated sound even if not loaded
            return this.playGeneratedSound(soundKey, options);
        }
        
        const config = this.soundMap[soundKey];
        if (!config) {
            console.warn(`⚠️ Sound not found: ${soundKey}`);
            return null;
        }
        
        // Check if audio context needs to be unlocked (iOS Safari)
        if (this.context && this.context.state === 'suspended' && !this.unlocked) {
            console.log('🔓 Audio context suspended - attempting unlock');
            await this.unlockAudioContext();
        }
        
        try {
            // Check if we should prefer generated sound for this key
            const configUseGenerated = config.useGenerated;
            const soundUseGenerated = this.sounds[soundKey] && this.sounds[soundKey].useGenerated;
            const shouldUseGenerated = configUseGenerated || soundUseGenerated;
            
            console.log(`🎵 Generated sound check for ${soundKey}:`);
            console.log(`  - config.useGenerated: ${configUseGenerated}`);
            console.log(`  - sound.useGenerated: ${soundUseGenerated}`);
            console.log(`  - shouldUseGenerated: ${shouldUseGenerated}`);
            
            if (shouldUseGenerated) {
                console.log(`🎵 Using generated sound for: ${soundKey} (reason: ${configUseGenerated ? 'config' : 'timeout/error'})`);
                return this.playGeneratedSound(soundKey, options);
            }
            
            // Try file-based audio first
            if (this.sounds[soundKey] && this.sounds[soundKey].audio) {
                console.log(`🎵 Playing file-based audio for: ${soundKey}`);
                const audio = this.sounds[soundKey].audio.cloneNode();
                audio.volume = (options.volume || config.volume || 0.5) * this.volume;
                
                if (options.loop !== undefined) {
                    audio.loop = options.loop;
                    console.log(`🎵 Loop set to: ${options.loop}`);
                }
                
                // Mobile-specific handling for long audio files
                const isMobile = this.isIOS() || /Android/i.test(navigator.userAgent);
                const isLongAudio = soundKey.includes('Theme') || soundKey.includes('theme');
                
                if (isMobile && isLongAudio) {
                    console.log('📱 Mobile device detected with long audio - applying mobile-specific handling');
                    
                    // Set additional mobile-friendly properties
                    audio.preload = 'auto';
                    audio.crossOrigin = 'anonymous';
                    
                    // Add comprehensive event listeners for mobile debugging
                    audio.addEventListener('loadstart', () => console.log('🎵 Load started'));
                    audio.addEventListener('loadeddata', () => console.log('🎵 Data loaded'));
                    audio.addEventListener('canplay', () => console.log('🎵 Can play'));
                    audio.addEventListener('canplaythrough', () => console.log('🎵 Can play through'));
                    audio.addEventListener('play', () => console.log('🎵 Play event fired'));
                    audio.addEventListener('playing', () => console.log('🎵 Playing event fired'));
                    audio.addEventListener('pause', () => console.log('⏸️ Pause event fired'));
                    audio.addEventListener('ended', () => console.log('🏁 Ended event fired'));
                    audio.addEventListener('error', (e) => {
                        console.error('❌ Audio error event:', e);
                        console.error('❌ Audio error code:', audio.error ? audio.error.code : 'unknown');
                        console.error('❌ Audio error message:', audio.error ? audio.error.message : 'unknown');
                    });
                    audio.addEventListener('stalled', () => console.log('⏸️ Audio stalled'));
                    audio.addEventListener('waiting', () => console.log('⏳ Audio waiting'));
                    audio.addEventListener('suspend', () => console.log('⏸️ Audio suspended'));
                    audio.addEventListener('abort', () => console.log('❌ Audio aborted'));
                    audio.addEventListener('emptied', () => console.log('🗑️ Audio emptied'));
                    
                    // For looping audio on mobile, set up manual loop handling
                    if (options.loop) {
                        audio.addEventListener('ended', () => {
                            console.log('🔄 Audio ended - restarting for loop');
                            audio.currentTime = 0;
                            audio.play().catch(e => console.error('❌ Loop restart failed:', e));
                        });
                    }
                }
                
                // iOS Safari specific handling
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    try {
                        await playPromise;
                        console.log(`✅ Audio playing successfully: ${soundKey}`);
                        return audio;
                    } catch (error) {
                        console.error(`❌ Audio play failed for ${soundKey}:`, error);
                        console.log('🔄 Falling back to generated sound');
                        return this.playGeneratedSound(soundKey, options);
                    }
                }
                
                console.log(`✅ Audio started (legacy): ${soundKey}`);
                return audio;
            }
            
            // Fallback to generated sound
            console.log(`🎵 No file-based audio found for ${soundKey} - using generated sound`);
            return this.playGeneratedSound(soundKey, options);
            
        } catch (error) {
            console.error(`❌ Audio play error for ${soundKey}:`, error);
            // Silent fallback to generated sound
            return this.playGeneratedSound(soundKey, options);
        }
    },
    
    // Generate synthesized audio fallback with enhanced envelopes
    playGeneratedSound(soundKey, options = {}) {
        console.log(`🎵 Playing generated sound: ${soundKey}`, options);
        
        // Special handling for Mission Impossible theme
        if (soundKey === 'missionThemeFull') {
            console.log('🎵 Playing generated Mission Impossible theme');
            return this.playGeneratedMissionTheme(options);
        }
        
        // If no audio context, try to create one
        if (!this.context) {
            console.log('🎵 No audio context for generated sound - attempting to create one');
            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) {
                    this.context = new AudioContextClass();
                    console.log('🎵 Audio context created for generated sound');
                } else {
                    console.log('🎵 No AudioContext support - cannot play generated sound');
                    return null;
                }
            } catch (error) {
                console.log('🎵 Failed to create audio context for generated sound:', error);
                return null;
            }
        }
        
        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            
            // Sound-specific parameters
            const soundParams = this.getGeneratedSoundParams(soundKey);
            
            oscillator.type = soundParams.type;
            oscillator.frequency.setValueAtTime(soundParams.frequency, this.context.currentTime);
            
            // Enhanced envelope shaping based on sound type
            const finalVolume = (options.volume || soundParams.volume) * this.volume;
            const envelope = soundParams.envelope || 'smooth';
            
            this.applyEnvelope(gainNode, envelope, finalVolume, soundParams.duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);
            
            oscillator.start(this.context.currentTime);
            oscillator.stop(this.context.currentTime + soundParams.duration);
            
            console.log(`🎵 Generated sound played: ${soundKey}`);
            return oscillator;
            
        } catch (error) {
            console.log(`🎵 Generated sound failed for ${soundKey}:`, error);
            return null;
        }
    },
    
    // Apply envelope shaping for better sound quality
    applyEnvelope(gainNode, envelope, volume, duration) {
        const now = this.context.currentTime;
        const attackTime = duration * 0.1;
        const sustainTime = duration * 0.7;
        const releaseTime = duration * 0.2;
        
        gainNode.gain.setValueAtTime(0, now);
        
        switch (envelope) {
            case 'sharp':
                gainNode.gain.linearRampToValueAtTime(volume, now + 0.005);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
                break;
                
            case 'quick':
                gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
                break;
                
            case 'sustain':
                gainNode.gain.linearRampToValueAtTime(volume, now + attackTime);
                gainNode.gain.setValueAtTime(volume * 0.8, now + attackTime + sustainTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
                break;
                
            case 'pulse':
                gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
                gainNode.gain.linearRampToValueAtTime(volume * 0.3, now + duration * 0.5);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
                break;
                
            case 'harsh':
                gainNode.gain.setValueAtTime(volume, now);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
                break;
                
            case 'long':
                gainNode.gain.linearRampToValueAtTime(volume, now + attackTime);
                gainNode.gain.setValueAtTime(volume * 0.9, now + attackTime + sustainTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
                break;
                
            case 'power':
                gainNode.gain.linearRampToValueAtTime(volume * 0.5, now + 0.1);
                gainNode.gain.linearRampToValueAtTime(volume, now + 0.3);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
                break;
                
            default: // smooth
                gainNode.gain.linearRampToValueAtTime(volume, now + attackTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        }
    },
    
    // Get parameters for generated sounds
    getGeneratedSoundParams(soundKey) {
        const params = {
            beep: { type: 'sine', frequency: 800, duration: 0.1, volume: 0.3 },
            terminalBeep: { type: 'square', frequency: 1000, duration: 0.15, volume: 0.4 },
            terminalTextBeep: { type: 'sine', frequency: 1200, duration: 0.08, volume: 0.3, envelope: 'sharp' },
            typingSound: { type: 'triangle', frequency: 800, duration: 0.06, volume: 0.2, envelope: 'quick' },
            success: { type: 'sine', frequency: 523, duration: 0.3, volume: 0.5, envelope: 'sustain' },
            alert: { type: 'triangle', frequency: 440, duration: 0.2, volume: 0.4, envelope: 'pulse' },
            glitch: { type: 'sawtooth', frequency: 150, duration: 0.1, volume: 0.3, envelope: 'harsh' },
            stateTransition: { type: 'sine', frequency: 660, duration: 0.2, volume: 0.4, envelope: 'smooth' },
            dataTransfer: { type: 'square', frequency: 1200, duration: 0.05, volume: 0.3, envelope: 'quick' },
            bootUp: { type: 'sine', frequency: 220, duration: 1.0, volume: 0.4, envelope: 'long' },
            crtPowerOn: { type: 'triangle', frequency: 100, duration: 0.8, volume: 0.5, envelope: 'power' },
            connectionEstablish: { type: 'sine', frequency: 880, duration: 0.3, volume: 0.4, envelope: 'smooth' },
            connectionActive: { type: 'square', frequency: 1100, duration: 0.15, volume: 0.3, envelope: 'pulse' },
            systemStatusChange: { type: 'triangle', frequency: 660, duration: 0.2, volume: 0.4, envelope: 'smooth' },
            flipClock: { type: 'sine', frequency: 440, duration: 0.1, volume: 0.5, envelope: 'sharp' },
            screenFlicker: { type: 'sawtooth', frequency: 200, duration: 0.05, volume: 0.2, envelope: 'harsh' },
            systemReady: { type: 'sine', frequency: 880, duration: 0.25, volume: 0.4, envelope: 'smooth' },
            default: { type: 'sine', frequency: 440, duration: 0.1, volume: 0.3, envelope: 'smooth' }
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
    
    // Generate comprehensive Mission Impossible theme for mobile fallback
    playGeneratedMissionTheme(options = {}) {
        console.log('🎵 Playing generated Mission Impossible theme with looping');
        
        if (!this.context) {
            console.log('🎵 No audio context for generated Mission theme');
            return null;
        }
        
        try {
            // Main Mission Impossible theme notes (simplified 8-bit style)
            const themeNotes = [
                // Main melody - iconic opening
                { freq: 659.25, duration: 0.25, delay: 0.0 },     // E5
                { freq: 659.25, duration: 0.25, delay: 0.5 },     // E5
                { freq: 698.46, duration: 0.25, delay: 1.0 },     // F#5
                { freq: 698.46, duration: 0.25, delay: 1.5 },     // F#5
                { freq: 784.00, duration: 0.5, delay: 2.0 },      // G5
                { freq: 784.00, duration: 0.5, delay: 3.0 },      // G5
                { freq: 659.25, duration: 0.25, delay: 4.0 },     // E5
                { freq: 659.25, duration: 0.25, delay: 4.5 },     // E5
                { freq: 698.46, duration: 0.25, delay: 5.0 },     // F#5
                { freq: 698.46, duration: 0.25, delay: 5.5 },     // F#5
                { freq: 784.00, duration: 0.5, delay: 6.0 },      // G5
                { freq: 784.00, duration: 0.5, delay: 7.0 },      // G5
                
                // Secondary melody
                { freq: 880.00, duration: 0.5, delay: 8.0 },      // A5
                { freq: 987.77, duration: 0.25, delay: 9.0 },     // B5
                { freq: 1046.50, duration: 0.5, delay: 9.5 },     // C6
                { freq: 880.00, duration: 0.5, delay: 10.5 },     // A5
                { freq: 784.00, duration: 0.5, delay: 11.5 },     // G5
                { freq: 698.46, duration: 0.5, delay: 12.5 },     // F#5
                { freq: 659.25, duration: 1.0, delay: 13.5 },     // E5 (extended)
                
                // Bass line accompaniment
                { freq: 164.81, duration: 0.5, delay: 2.0 },      // E3
                { freq: 196.00, duration: 0.5, delay: 4.0 },      // G3
                { freq: 220.00, duration: 0.5, delay: 6.0 },      // A3
                { freq: 246.94, duration: 0.5, delay: 8.0 },      // B3
                { freq: 261.63, duration: 0.5, delay: 10.0 },     // C4
                { freq: 196.00, duration: 0.5, delay: 12.0 },     // G3
                { freq: 164.81, duration: 1.0, delay: 14.0 },     // E3 (extended)
            ];
            
            const playThemeOnce = () => {
                themeNotes.forEach(note => {
                    setTimeout(() => {
                        this.generateThemeNote(note.freq, note.duration, note.freq > 400 ? 'triangle' : 'sine');
                    }, note.delay * 1000);
                });
            };
            
            // Play immediately
            playThemeOnce();
            
            // Set up looping if requested
            if (options.loop) {
                const loopInterval = setInterval(() => {
                    console.log('🔄 Looping generated Mission Impossible theme');
                    playThemeOnce();
                }, 16000); // 16 seconds per loop
                
                // Return a mock audio element with stop functionality
                return {
                    stop: () => {
                        console.log('🛑 Stopping generated Mission Impossible theme loop');
                        clearInterval(loopInterval);
                    },
                    pause: () => {
                        console.log('⏸️ Pausing generated Mission Impossible theme loop');
                        clearInterval(loopInterval);
                    },
                    addEventListener: () => {}, // Mock for compatibility
                    volume: options.volume || 0.8,
                    loop: options.loop || false
                };
            }
            
            return { stop: () => {}, pause: () => {}, addEventListener: () => {} };
            
        } catch (error) {
            console.error('❌ Generated Mission Impossible theme failed:', error);
            return null;
        }
    },
    
    // Generate individual theme note with enhanced sound
    generateThemeNote(frequency, duration, waveType = 'triangle') {
        if (!this.context) return;
        
        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            const filterNode = this.context.createBiquadFilter();
            
            // Set up oscillator
            oscillator.type = waveType;
            oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
            
            // Set up filter for 8-bit sound
            filterNode.type = 'lowpass';
            filterNode.frequency.setValueAtTime(frequency * 2, this.context.currentTime);
            filterNode.Q.setValueAtTime(1, this.context.currentTime);
            
            // Set up gain envelope
            const finalVolume = 0.3 * this.volume;
            gainNode.gain.setValueAtTime(0, this.context.currentTime);
            gainNode.gain.linearRampToValueAtTime(finalVolume, this.context.currentTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(finalVolume * 0.7, this.context.currentTime + duration * 0.7);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
            
            // Connect nodes
            oscillator.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(this.context.destination);
            
            oscillator.start(this.context.currentTime);
            oscillator.stop(this.context.currentTime + duration);
            
        } catch (error) {
            console.warn('⚠️ Theme note generation failed:', error);
        }
    },
    
    // Start ambient audio system
    startAmbientSystem() {
        if (this.ambientSystemActive) return;
        
        this.ambientSystemActive = true;
        console.log('🌊 Starting ambient audio system');
        
        // Ambient hum removed - not needed for the experience
        
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
    
    // iOS detection helper
    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    },
    
    // Comprehensive mobile debugging
    getMobileDebugInfo() {
        const info = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            isIOS: this.isIOS(),
            audioContextSupport: !!(window.AudioContext || window.webkitAudioContext),
            contextState: this.context ? this.context.state : 'none',
            loaded: this.loaded,
            unlocked: this.unlocked,
            soundsTotal: Object.keys(this.soundMap).length,
            soundsLoaded: Object.keys(this.sounds).length,
            fileBasedSounds: Object.values(this.sounds).filter(s => s.audio).length,
            generatedSounds: Object.values(this.sounds).filter(s => s.useGenerated).length,
            volume: this.volume,
            timestamp: new Date().toISOString()
        };
        
        console.log('📱 Mobile Debug Info:', info);
        return info;
    },
    
    // Force initialization for debugging
    async forceInit() {
        console.log('🔄 Force initializing audio engine...');
        this.loaded = false;
        this.unlocked = false;
        this.context = null;
        this.sounds = {};
        
        const result = await this.init();
        this.getMobileDebugInfo();
        return result;
    },
    
    // Get audio engine status with iOS diagnostics
    getStatus() {
        const fileBasedSounds = Object.values(this.sounds).filter(s => s.audio).length;
        const generatedSounds = Object.values(this.sounds).filter(s => s.useGenerated).length;
        
        // Check Mission Impossible theme specifically
        const missionThemeStatus = this.sounds.missionThemeFull ? {
            exists: true,
            hasAudio: !!this.sounds.missionThemeFull.audio,
            useGenerated: this.sounds.missionThemeFull.useGenerated,
            config: this.sounds.missionThemeFull.config
        } : { exists: false };
        
        return {
            loaded: this.loaded,
            unlocked: this.unlocked,
            volume: this.volume,
            ambientActive: this.ambientSystemActive,
            missionTheme: missionThemeStatus,
            contextState: this.context ? this.context.state : 'none',
            soundsLoaded: Object.keys(this.sounds).length,
            fileBasedSounds,
            generatedSounds,
            isIOS: this.isIOS(),
            audioContextSupport: !!(window.AudioContext || window.webkitAudioContext)
        };
    }
};

// Auto-initialization removed for iOS compatibility
// AudioEngine will be initialized by main app.js to prevent circular dependencies

export default AudioEngine;