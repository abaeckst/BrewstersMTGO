/**
 * Wake Screen Controller
 * Handles dormant terminal interface and wake-up interactions
 */

export class WakeScreen {
    constructor() {
        this.initialized = false;
        this.isActivating = false;
        this.wakeListenersAdded = false;
        this.activationTimeout = null;
        this.lastInteractionTime = null;
    }

    /**
     * Initialize the wake screen
     */
    async init() {
        if (this.initialized) {
            console.log('💤 Wake screen already initialized');
            return;
        }

        console.log('💤 Initializing wake screen...');

        // Get wake screen elements
        this.wakeScreen = document.getElementById('wake-screen');
        this.wakeContainer = this.wakeScreen?.querySelector('.dormant-terminal-container');
        this.wakeTrigger = document.getElementById('wake-trigger');

        if (!this.wakeScreen || !this.wakeContainer || !this.wakeTrigger) {
            console.error('❌ Wake screen elements not found');
            return;
        }

        // Setup wake triggers
        this.setupWakeTriggers();

        // Start dormant sequence
        await this.startDormantSequence();

        this.initialized = true;
        console.log('✅ Wake screen initialized');
    }

    /**
     * Setup wake trigger interactions
     */
    setupWakeTriggers() {
        if (this.wakeListenersAdded) {
            console.log('💤 Wake listeners already added');
            return;
        }

        console.log('💤 Setting up wake triggers...');

        // Detect touch support for iOS compatibility
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Primary interaction events - non-passive for preventDefault support
        const primaryEvents = ['click', 'touchstart', 'keydown'];
        
        // Secondary events - passive for performance
        const secondaryEvents = ['touchend', 'mousedown'];

        // Add primary events (non-passive) for preventDefault support
        primaryEvents.forEach(eventType => {
            this.wakeContainer.addEventListener(eventType, (e) => {
                this.handleWakeInteraction(e);
            }, { passive: false });
        });

        // Add secondary events (passive) for additional interaction coverage
        secondaryEvents.forEach(eventType => {
            this.wakeContainer.addEventListener(eventType, (e) => {
                this.handleWakeInteractionPassive(e);
            }, { passive: true });
        });

        // Global wake triggers for any interaction
        document.addEventListener('keydown', (e) => {
            if (this.wakeScreen?.classList.contains('active')) {
                this.handleWakeInteraction(e);
            }
        }, { passive: false });

        // iOS-specific touch handling for full-screen wake
        if (hasTouch) {
            document.addEventListener('touchstart', (e) => {
                if (this.wakeScreen?.classList.contains('active')) {
                    this.handleWakeInteraction(e);
                }
            }, { passive: false });
        }

        this.wakeListenersAdded = true;
        console.log('✅ Wake triggers setup complete with iOS compatibility');
    }

    /**
     * Start the dormant sequence with progressive revelation
     */
    async startDormantSequence() {
        console.log('💤 Starting dormant sequence...');

        // Stage 1: Show wake instruction (after 2 seconds for dramatic effect)
        await this.delay(2000);
        this.revealWakeStage(1);

        console.log('💤 Dormant sequence complete, waiting for interaction...');
    }

    /**
     * Handle wake interaction
     */
    async handleWakeInteraction(event) {
        // Prevent multiple activation attempts
        if (this.isActivating) {
            console.log('💤 Wake activation already in progress');
            return;
        }

        // Debounce rapid touch events (iOS can fire multiple events)
        const now = Date.now();
        if (this.lastInteractionTime && (now - this.lastInteractionTime) < 300) {
            console.log('💤 Debouncing rapid wake interactions');
            return;
        }
        this.lastInteractionTime = now;

        // Prevent default behavior for non-passive events
        if (event.cancelable) {
            event.preventDefault();
        }
        
        // Stop event propagation to prevent duplicate handling
        event.stopPropagation();
        
        this.isActivating = true;
        console.log('💤 Wake interaction detected, starting activation...', event.type);

        // MOBILE FIX: Load audio files during user interaction (critical for iOS) - non-blocking
        this.loadAudioAfterInteraction().catch(error => {
            console.warn('📱 Audio loading failed but continuing wake sequence:', error);
        });

        // Initialize audio context on first user interaction (critical for iOS) - non-blocking
        const audioEngine = window.app?.audio;
        if (audioEngine && !audioEngine.unlocked) {
            audioEngine.unlockAudioContext().catch(error => {
                console.warn('📱 Audio unlock failed but continuing wake sequence:', error);
            });
        }

        // Audio feedback - immediate beep to confirm interaction
        if (audioEngine) {
            audioEngine.play('terminalBeep', { volume: 0.3 });
        }

        // Visual feedback - immediate activation state
        this.wakeContainer.classList.add('wake-activating');

        // Start wake-up sequence
        await this.startWakeUpSequence();
    }

    /**
     * Handle wake interactions for passive event listeners (no preventDefault)
     */
    async handleWakeInteractionPassive(event) {
        // Skip if already activating or not ready
        if (this.isActivating || !this.isReady) {
            console.log('💤 Wake activation already in progress');
            return;
        }

        // Debounce rapid interactions
        const now = Date.now();
        if (this.lastInteractionTime && (now - this.lastInteractionTime) < 300) {
            console.log('💤 Debouncing rapid wake interactions');
            return;
        }
        this.lastInteractionTime = now;

        // NO preventDefault() call for passive events
        // Stop event propagation to prevent duplicate handling
        event.stopPropagation();
        
        this.isActivating = true;
        console.log('💤 Wake interaction detected (passive), starting activation...', event.type);

        // Initialize audio context on first user interaction (critical for iOS) - non-blocking
        const audioEngine = window.app?.audio;
        if (audioEngine && !audioEngine.unlocked) {
            audioEngine.unlockAudioContext().catch(error => {
                console.warn('📱 Audio unlock failed but continuing wake sequence:', error);
            });
        }

        // Audio feedback - immediate beep to confirm interaction
        if (audioEngine) {
            audioEngine.play('terminalBeep', { volume: 0.3 });
        }

        // Visual feedback - immediate activation state
        this.wakeContainer.classList.add('wake-activating');

        // Start wake-up sequence
        await this.startWakeUpSequence();
    }

    /**
     * Start the wake-up sequence with audio and visual effects
     */
    async startWakeUpSequence() {
        console.log('💤 Starting wake-up sequence...');

        // Phase 1: CRT Power-On sound (immediate)
        if (window.AudioEngine) {
            window.AudioEngine.play('crtPowerOn', { volume: 0.7 });
        }

        // Phase 2: Visual activation feedback (500ms)
        await this.delay(500);

        // Phase 3: Boot-up sound preparation
        if (window.AudioEngine) {
            window.AudioEngine.play('bootUp', { volume: 0.6 });
        }

        // Phase 4: System beep confirmation (1000ms)
        await this.delay(1000);
        if (window.AudioEngine) {
            window.AudioEngine.play('beep', { volume: 0.4 });
        }

        // Phase 5: Transition to boot sequence (1500ms total)
        await this.delay(500);

        console.log('💤 Wake-up complete, transitioning to boot sequence...');

        // Trigger state transition to boot sequence
        if (window.app) {
            await window.app.transitionTo(window.app.state.states.BOOT_SEQUENCE);
        } else {
            console.error('❌ App instance not available for state transition');
        }
    }

    /**
     * Reveal wake screen stage progressively
     */
    revealWakeStage(stage) {
        if (!this.wakeScreen) return;

        const stageElements = this.wakeScreen.querySelectorAll(`.wake-stage-${stage}-hidden`);
        stageElements.forEach(element => {
            element.classList.remove(`wake-stage-${stage}-hidden`);
            element.classList.add(`wake-stage-${stage}-reveal`);
        });

        console.log(`💤 Wake stage ${stage} revealed`);

        // Audio feedback for stage progression
        if (window.AudioEngine) {
            window.AudioEngine.play('terminalTextBeep', { volume: 0.1 });
        }
    }

    /**
     * Reset wake screen to dormant state
     */
    reset() {
        console.log('💤 Resetting wake screen to dormant state...');

        this.isActivating = false;
        this.initialized = false;

        // Clear activation timeout if exists
        if (this.activationTimeout) {
            clearTimeout(this.activationTimeout);
            this.activationTimeout = null;
        }

        // Reset visual states
        if (this.wakeContainer) {
            this.wakeContainer.classList.remove('wake-activating');
        }

        // Reset stage classes
        if (this.wakeScreen) {
            const allStageElements = this.wakeScreen.querySelectorAll('[class*="wake-stage-"]');
            allStageElements.forEach(element => {
                element.className = element.className.replace(/\bwake-stage-\d+-reveal\b/g, '');
                if (!element.className.includes('wake-stage-')) {
                    element.classList.add('wake-stage-1-hidden');
                }
            });
        }

        console.log('💤 Wake screen reset complete');
    }

    /**
     * Get wake screen status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            isActivating: this.isActivating,
            listenersAdded: this.wakeListenersAdded,
            screenActive: this.wakeScreen?.classList.contains('active') || false
        };
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * MOBILE FIX: Load audio files after user interaction
     */
    async loadAudioAfterInteraction() {
        console.log('📱 Attempting to load audio after user interaction...');
        
        // Access AudioEngine through window.app.audio (correct path)
        const audioEngine = window.app?.audio;
        if (audioEngine && audioEngine.loadAudioAfterInteraction) {
            try {
                const success = await audioEngine.loadAudioAfterInteraction();
                console.log('📱 Audio loading result:', success);
                return success;
            } catch (error) {
                console.error('📱 Audio loading failed:', error);
                return false;
            }
        } else {
            console.log('📱 AudioEngine not available via window.app.audio or method missing');
            console.log('📱 Available:', { 
                app: !!window.app, 
                audio: !!window.app?.audio, 
                method: !!window.app?.audio?.loadAudioAfterInteraction 
            });
            return false;
        }
    }

    /**
     * Cleanup method
     */
    destroy() {
        console.log('💤 Destroying wake screen...');
        
        this.reset();
        
        // Remove event listeners
        if (this.wakeContainer && this.wakeListenersAdded) {
            this.wakeContainer.replaceWith(this.wakeContainer.cloneNode(true));
        }
        
        this.wakeListenersAdded = false;
        console.log('💤 Wake screen destroyed');
    }
}

export default WakeScreen;