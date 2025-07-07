/**
 * V2 Architecture - Main Application Controller
 * Simplified, clean, maintainable
 */

import { AppState } from './state.js';
import { CinematicEngine } from './cinematic.js';
import { AudioEngine } from './audio-engine.js';
import { viewport } from './viewport.js';
import WakeScreen from './wake-screen.js';
import BriefingScreen from './briefing-screen.js';
import CountdownScreen from './countdown-screen.js';
import CreditsScreen from './credits-screen.js';
import DeclinedScreen from './declined-screen.js';
import IOSPolyfills from './ios-polyfills.js';

class App {
    constructor() {
        this.state = new AppState();
        this.cinematic = new CinematicEngine();
        this.audio = AudioEngine;
        this.viewport = viewport;
        this.screens = {};
        
        // Initialize screen controllers
        this.wakeScreen = new WakeScreen();
        this.briefingScreen = new BriefingScreen();
        this.countdownScreen = new CountdownScreen();
        this.creditsScreen = new CreditsScreen();
        this.declinedScreen = new DeclinedScreen();
        
        // Development mode flag
        this.debug = window.location.search.includes('debug');
    }
    
    async init() {
        console.log('🚀 V2 Architecture - Initializing...');
        
        // Clear any cached state and reset UI
        this.resetApplicationState();
        
        // Initialize audio engine
        await this.audio.init();
        
        // Cache screen elements
        this.cacheScreenElements();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start directly with wake sequence
        await this.startWakeSequence();
        
        console.log('✅ Application initialized');
    }
    
    resetApplicationState() {
        console.log('🔄 Resetting application state...');
        
        // Fix: Reset document scroll position FIRST to prevent boot sequence scroll issues
        this.resetDocumentScroll();
        
        // Clear any cached user data that might skip intro
        sessionStorage.removeItem('appInitialized');
        sessionStorage.removeItem('introShown');
        sessionStorage.removeItem('bootCompleted');
        
        // Clear localStorage items that might skip boot on refresh
        localStorage.removeItem('bootShown');
        localStorage.removeItem('hasSeenBoot');
        localStorage.removeItem('agentName');
        
        // Reset all screens to initial state
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.remove('active');
            screen.classList.add('hidden');
        });
        
        // Ensure wake screen is active as initial state
        const wakeScreen = document.getElementById('wake-screen');
        if (wakeScreen) {
            wakeScreen.classList.remove('hidden');
            wakeScreen.classList.add('active');
        }
        
        // Clear any dynamic content that might persist
        const bootContainer = document.querySelector('.boot-sequence-container');
        if (bootContainer) {
            bootContainer.innerHTML = '';
            // Reset container scroll position as well
            bootContainer.scrollTop = 0;
        }
        
        // Clear auth form values to prevent browser auto-fill persistence
        const agentNameInput = document.getElementById('agent-name');
        const accessCodeInput = document.getElementById('access-code');
        if (agentNameInput) agentNameInput.value = '';
        if (accessCodeInput) accessCodeInput.value = '';
        
        // Reset CRT effects
        const app = document.getElementById('app');
        if (app) {
            app.classList.remove('terminal-active');
            app.style.opacity = '1';
        }
        
        console.log('✅ Application state reset complete');
    }
    
    /**
     * Reset document scroll position to top
     * Fixes boot sequence "sometimes starts scrolled down" issue
     */
    resetDocumentScroll() {
        // Multiple approaches to ensure scroll reset works across browsers
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        
        // Force immediate scroll position update
        if (document.scrollingElement) {
            document.scrollingElement.scrollTop = 0;
        }
        
        console.log('📜 Document scroll reset to top');
    }
    
    cacheScreenElements() {
        // Get all screen elements
        const screenElements = document.querySelectorAll('.screen');
        screenElements.forEach(screen => {
            this.screens[screen.id] = screen;
        });
        
        if (this.debug) {
            console.log('📱 Cached screens:', Object.keys(this.screens));
        }
    }
    
    setupEventListeners() {
        // Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.cinematic.pauseAnimations();
            } else {
                this.cinematic.resumeAnimations();
            }
        });
        
        // Handle resize for responsive updates
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
        
        // Set up state change listener
        this.state.on('stateChange', (transition) => {
            if (this.debug) {
                console.log('🔄 State changed:', transition);
            }
            
            // Initialize screen controllers when transitioning to their states
            this.handleStateChange(transition);
        });
    }
    
    
    showScreen(screenId) {
        // Hide all screens properly
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
            screen.classList.add('hidden');
            
            // Reset any reveal-element opacity to prevent layout issues
            const revealElements = screen.querySelectorAll('.reveal-element');
            revealElements.forEach(element => {
                element.classList.remove('revealed');
            });
        });
        
        // Show target screen
        const targetScreen = this.screens[screenId];
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            targetScreen.classList.add('active');
            
            if (this.debug) {
                console.log('🖥️ Showing screen:', screenId);
            }
        }
    }
    
    handleResize() {
        // Log viewport info in debug mode
        if (this.debug) {
            console.log('📐 Viewport resized:', {
                width: window.innerWidth,
                height: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio
            });
        }
        
        // Update cinematic engine mobile detection
        this.cinematic.setupMobileDetection();
    }
    
    /**
     * Transition to a new state with cinematic animation
     * Public method for triggering transitions from anywhere
     */
    async transitionTo(newState) {
        return await this.state.transition(newState, this.cinematic);
    }
    
    /**
     * Get current state
     */
    getCurrentState() {
        return this.state.current;
    }
    
    /**
     * Start the wake sequence with dormant terminal (initial state)
     */
    async startWakeSequence() {
        console.log('💤 Wake sequence starting as initial state...');
        
        // Ensure document is at top before starting wake sequence
        this.resetDocumentScroll();
        
        // Make sure wake screen is active
        this.showScreen('wake-screen');
        
        // Initialize wake screen controller
        await this.wakeScreen.init();
        
        console.log('💤 Wake sequence initialized, waiting for user interaction...');
    }

    /**
     * Start the boot sequence with dramatic typing (after wake)
     */
    async startBootSequence() {
        console.log('🔌 Boot sequence starting after wake...');
        
        // Ensure document is at top before starting boot sequence
        this.resetDocumentScroll();
        
        // Make sure boot sequence screen is active
        this.showScreen('boot-sequence-screen');
        
        // Start the cinematic boot sequence and wait for actual completion
        await this.cinematic.playBootSequence();
        
        // Transition to auth immediately after boot sequence completes
        // Remove hardcoded delay - use completion-based transition
        console.log('🔌 Boot sequence complete, transitioning to auth...');
        await this.state.transition(this.state.states.AUTH, this.cinematic);
    }
    
    /**
     * Handle state changes and initialize appropriate screen controllers
     */
    handleStateChange(transition) {
        const { to } = transition;
        
        // Initialize screen controllers based on new state
        switch (to) {
            case this.state.states.WAKE:
                console.log('💤 Initializing wake sequence...');
                setTimeout(() => {
                    this.startWakeSequence();
                }, 500); // Small delay for screen transition
                break;
                
            case this.state.states.BOOT_SEQUENCE:
                console.log('🔌 Initializing boot sequence...');
                setTimeout(() => {
                    this.startBootSequence();
                }, 500); // Small delay for screen transition
                break;
                
            case this.state.states.BRIEFING:
                console.log('🎭 Initializing briefing screen...');
                setTimeout(() => {
                    this.briefingScreen.init();
                }, 500); // Small delay for screen transition
                break;
                
            case this.state.states.COUNTDOWN:
                console.log('⏰ Initializing countdown screen...');
                setTimeout(() => {
                    this.countdownScreen.init();
                }, 500);
                break;
                
            case this.state.states.CREDITS:
                console.log('🏆 Initializing credits screen...');
                setTimeout(() => {
                    this.creditsScreen.init();
                }, 500);
                break;
                
            case this.state.states.DECLINED:
                console.log('❌ Initializing declined screen...');
                setTimeout(() => {
                    this.declinedScreen.init();
                }, 500);
                break;
        }
    }
}

// Initialize app when DOM is ready - iOS compatibility: balanced global exposure
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const app = new App();
        // Always expose app globally for screen controllers - debug-only state access
        window.app = app;
        if (window.location.search.includes('debug')) {
            window.appState = app.state;
        }
        app.init();
    });
} else {
    const app = new App();
    // Always expose app globally for screen controllers - debug-only state access
    window.app = app;
    if (window.location.search.includes('debug')) {
        window.appState = app.state;
    }
    app.init();
}