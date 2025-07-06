/**
 * V2 Architecture - State Machine
 * Simple, predictable state management with audio integration
 */

import { AudioEngine } from './audio-engine.js';

export class AppState {
    constructor() {
        this.states = {
            WAKE: 'wake',
            BOOT_SEQUENCE: 'boot-sequence',
            AUTH: 'auth',
            SOUND_TEST: 'soundTest',
            BOOT: 'boot',
            MISSION: 'mission',
            BRIEFING: 'briefing',
            COUNTDOWN: 'countdown',
            DECLINED: 'declined',
            CREDITS: 'credits'
        };
        
        this.currentState = this.states.WAKE;
        this.stateHistory = [this.states.WAKE];
        this.listeners = new Map();
    }
    
    /**
     * Get current state
     */
    get current() {
        return this.currentState;
    }
    
    /**
     * Transition to a new state with cinematic animation
     */
    async transition(newState, cinematicEngine = null) {
        const oldState = this.currentState;
        
        // Validate state transition
        if (!this.isValidTransition(oldState, newState)) {
            console.warn(`⚠️ Invalid state transition: ${oldState} → ${newState}`);
            return false;
        }
        
        console.log(`🔄 State transition: ${oldState} → ${newState}`);
        
        // Play state transition audio
        AudioEngine.playStateTransition(oldState, newState);
        
        // Update state
        this.currentState = newState;
        this.stateHistory.push(newState);
        
        // Notify listeners before animation
        this.notifyListeners(oldState, newState);
        
        // Handle screen transitions with cinematic engine
        if (cinematicEngine) {
            await this.handleScreenTransition(oldState, newState, cinematicEngine);
        } else {
            // Fallback to basic screen switching
            this.updateScreenVisibility(oldState, newState);
        }
        
        // Play contextual audio for new state
        AudioEngine.playContextualAudio(newState);
        
        return true;
    }
    
    /**
     * Handle screen transitions with cinematic animations
     */
    async handleScreenTransition(from, to, cinematicEngine) {
        try {
            // Get screen elements
            const fromScreen = document.getElementById(`${from}-screen`);
            const toScreen = document.getElementById(`${to}-screen`);
            
            if (!fromScreen || !toScreen) {
                console.warn('Screen elements not found, falling back to basic transition');
                this.updateScreenVisibility(from, to);
                return;
            }
            
            // Use cinematic engine for smooth transition
            await cinematicEngine.transitionScreens(from, to);
            
        } catch (error) {
            console.error('Error during screen transition:', error);
            this.updateScreenVisibility(from, to);
        }
    }
    
    /**
     * Enhanced screen visibility management with layout isolation
     */
    updateScreenVisibility(from, to) {
        const fromScreen = document.getElementById(`${from}-screen`);
        const toScreen = document.getElementById(`${to}-screen`);
        
        if (fromScreen) {
            // Enhanced cleanup for outgoing screen
            this.resetScreenLayout(fromScreen);
            fromScreen.classList.remove('active', 'screen-active');
            fromScreen.classList.add('hidden', 'screen-hidden');
            
            // Debug: Verify z-index for absolute positioning
            console.log(`📐 Screen deactivated: ${fromScreen.id}, z-index: ${getComputedStyle(fromScreen).zIndex}`);
            
            // Reset reveal-element states to prevent layout issues
            const revealElements = fromScreen.querySelectorAll('.reveal-element');
            revealElements.forEach(element => {
                element.classList.remove('revealed');
            });
            
            // Reset any sequential revelation states
            const stageElements = fromScreen.querySelectorAll('[class*="-stage-"]');
            stageElements.forEach(element => {
                // Reset stage classes to initial hidden state
                element.className = element.className.replace(/\b\w+-stage-\d+-reveal\b/g, '');
            });
        }
        
        if (toScreen) {
            // Prepare incoming screen with clean state
            this.prepareScreenLayout(toScreen);
            toScreen.classList.remove('hidden', 'screen-hidden');
            toScreen.classList.add('active', 'screen-active');
            
            // Debug: Verify z-index for absolute positioning
            console.log(`📐 Screen activated: ${toScreen.id}, z-index: ${getComputedStyle(toScreen).zIndex}`);
        }
    }
    
    /**
     * Reset screen layout to clean state
     */
    resetScreenLayout(screen) {
        if (!screen) return;
        
        // Add screen isolation classes
        screen.classList.add('screen-isolated', 'screen-stable');
        
        // Reset transforms and transitions
        screen.style.transform = '';
        screen.style.transition = '';
        
        // Comprehensive scroll position reset
        this.resetAllScrollContexts(screen);
        
        // Clear any residual styles that could affect layout
        const problematicElements = screen.querySelectorAll('.reveal-element, [class*="-stage-"]');
        problematicElements.forEach(element => {
            element.style.transform = '';
            element.style.transition = '';
        });
        
        console.log(`🧹 Screen layout reset: ${screen.id}`);
    }
    
    /**
     * Prepare screen layout for activation
     */
    prepareScreenLayout(screen) {
        if (!screen) return;
        
        // Ensure screen is ready for display
        screen.classList.add('screen-isolated', 'screen-stable');
        
        // Comprehensive scroll position reset to top
        this.resetAllScrollContexts(screen);
        
        // Force layout recalculation
        screen.offsetHeight;
        
        console.log(`🎬 Screen prepared: ${screen.id}`);
    }
    
    /**
     * Comprehensive scroll context reset for absolute positioning architecture
     */
    resetAllScrollContexts(screen = null) {
        try {
            // Reset document level scroll
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            
            // Reset app container scroll (critical for absolute positioning)
            const appContainer = document.getElementById('app');
            if (appContainer) {
                appContainer.scrollTop = 0;
                console.log(`📐 State: App container scroll reset: ${appContainer.scrollTop}`);
            }
            
            // Reset specific screen scroll if provided
            if (screen) {
                screen.scrollTop = 0;
                console.log(`📐 State: Screen scroll reset: ${screen.id}, scrollTop: ${screen.scrollTop}`);
            }
            
            // Reset all screen elements scroll for good measure
            const allScreens = document.querySelectorAll('.screen');
            allScreens.forEach(screenEl => {
                if (screenEl) {
                    screenEl.scrollTop = 0;
                }
            });
            
            // Force layout recalculation to ensure scroll reset takes effect
            document.body.offsetHeight;
            
            console.log(`📐 State: Comprehensive scroll reset completed`);
            
        } catch (error) {
            console.error('State: Error during scroll reset:', error);
            // Fallback to basic scroll reset
            window.scrollTo(0, 0);
            if (screen) {
                screen.scrollTop = 0;
            }
        }
    }
    
    /**
     * Check if a state transition is valid
     */
    isValidTransition(from, to) {
        const validTransitions = {
            [this.states.WAKE]: [this.states.BOOT_SEQUENCE],
            [this.states.BOOT_SEQUENCE]: [this.states.AUTH],
            [this.states.AUTH]: [this.states.SOUND_TEST, this.states.MISSION], // Allow direct auth -> mission
            [this.states.SOUND_TEST]: [this.states.BOOT],
            [this.states.BOOT]: [this.states.MISSION],
            [this.states.MISSION]: [this.states.BRIEFING, this.states.DECLINED],
            [this.states.BRIEFING]: [this.states.COUNTDOWN, this.states.DECLINED],
            [this.states.COUNTDOWN]: [this.states.CREDITS],
            [this.states.DECLINED]: [this.states.WAKE], // Allow restart from declined
            [this.states.CREDITS]: [this.states.WAKE]  // Allow restart from credits
        };
        
        return validTransitions[from]?.includes(to) ?? false;
    }
    
    /**
     * Add state change listener
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    /**
     * Remove state change listener
     */
    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    /**
     * Notify listeners of state change
     */
    notifyListeners(oldState, newState) {
        const callbacks = this.listeners.get('stateChange') || [];
        callbacks.forEach(callback => {
            callback({ from: oldState, to: newState });
        });
    }
    
    /**
     * Reset to initial state
     */
    reset() {
        this.currentState = this.states.WAKE;
        this.stateHistory = [this.states.WAKE];
        console.log('🔄 State machine reset');
    }
    
    /**
     * Get state history
     */
    getHistory() {
        return [...this.stateHistory];
    }
}