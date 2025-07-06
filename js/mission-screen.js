/**
 * V2 Architecture - Mission Screen Controller
 * Handles mission selection with cinematic animations and audio integration
 */

import { AudioEngine } from './audio-engine.js';

export class MissionScreen {
    constructor() {
        this.signalWaveInterval = null;
        this.currentSignalBar = 0;
        this.missionInputEnabled = false;
        this.agentName = '';
        this.personalMessageText = '';
    }
    
    /**
     * Delay utility for timing control
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    setupPersonalMessage() {
        this.personalMessageText = `OPERATIVE ${this.agentName},

YOUR SERVICE RECORD: EXCEPTIONAL
YEARS IN FIELD: 36
MISSIONS COMPLETED: 173

COMMAND HAS SELECTED YOU FOR ONE FINAL ASSIGNMENT.
OPERATION: GOBLIN SURPRISE

YOU HAVE EARNED THE RIGHT TO CHOOSE YOUR FINAL MISSION:`;
    }
    
    /**
     * Initialize mission screen with V2 cinematic sequence
     */
    async init() {
        console.log('🎯 Initializing mission screen...');
        console.log('📊 Document state:', {
            readyState: document.readyState,
            scrollHeight: document.documentElement.scrollHeight,
            clientHeight: document.documentElement.clientHeight,
            scrollTop: window.pageYOffset || document.documentElement.scrollTop
        });
        
        // Get current agent name from localStorage
        this.agentName = localStorage.getItem('agentName') || 'OPERATIVE';
        
        // Setup personal message content with current agent name
        this.setupPersonalMessage();
        
        // Reset scroll position to top
        console.log('📍 Resetting scroll position to top');
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        console.log('📍 Scroll position after reset:', window.pageYOffset || document.documentElement.scrollTop);
        
        // Get DOM elements
        const screen = document.getElementById('mission-screen');
        const personalMessage = screen.querySelector('.personal-message');
        const signalBars = screen.querySelectorAll('.signal-bars .bar');
        const transmissionDetection = screen.querySelector('.transmission-detection');
        const personalCommunication = screen.querySelector('.personal-communication');
        const missionChoices = screen.querySelector('.mission-choices');
        
        if (!screen || !personalMessage || !signalBars.length) {
            console.error('❌ Mission screen elements not found');
            return;
        }
        
        // Reset any previous state
        this.reset();
        
        // CRITICAL FIX: Force CSS re-evaluation and wait for layout to settle
        // The hybrid positioning CSS might not take effect immediately
        await this.delay(100); // Allow CSS transition to complete
        
        // Force reflow to ensure CSS changes are applied
        screen.offsetHeight; // Trigger layout recalculation
        
        // Debug: Check CSS positioning and document flow after screen becomes active
        console.log('🔍 [DEBUG] Mission screen positioning check:');
        const computedStyle = window.getComputedStyle(screen);
        console.log('📐 Position:', computedStyle.position);
        console.log('📐 Top:', computedStyle.top);
        console.log('📐 Left:', computedStyle.left);
        console.log('📐 Z-index:', computedStyle.zIndex);
        console.log('📐 Min-height:', computedStyle.minHeight);
        console.log('📐 Height:', computedStyle.height);
        console.log('📐 CSS Classes:', screen.className);
        
        // Check document dimensions
        console.log('📏 [DEBUG] Document dimensions:');
        console.log('📏 Body scrollHeight:', document.body.scrollHeight);
        console.log('📏 Body clientHeight:', document.body.clientHeight);
        console.log('📏 Document scrollHeight:', document.documentElement.scrollHeight);
        console.log('📏 Document clientHeight:', document.documentElement.clientHeight);
        console.log('📏 Window innerHeight:', window.innerHeight);
        console.log('📏 Screen scrollHeight:', screen.scrollHeight);
        console.log('📏 Screen clientHeight:', screen.clientHeight);
        
        // CRITICAL: If document still has no scrollable height, force content expansion
        if (document.documentElement.scrollHeight <= document.documentElement.clientHeight) {
            console.log('⚠️ [CRITICAL] Document has no scrollable height - forcing expansion');
            // Add temporary expanding element to force document flow
            const forceExpand = document.createElement('div');
            forceExpand.style.height = '120vh';
            forceExpand.style.width = '1px';
            forceExpand.style.visibility = 'hidden';
            forceExpand.id = 'force-expand-temp';
            screen.appendChild(forceExpand);
            
            // Force reflow again
            document.body.offsetHeight;
            
            console.log('📏 [FORCED] Document scrollHeight after expansion:', document.documentElement.scrollHeight);
        }
        
        // Stage 1: Signal detection with audio
        await this.initSignalDetection(signalBars, transmissionDetection);
        
        // 1st Scroll: Position personal communication area at top of viewport
        if (window.app && window.app.cinematic) {
            await window.app.cinematic.smoothScrollTo(personalCommunication);
        }
        
        // Stage 2: Personal message with typing effect
        await this.initPersonalCommunication(personalMessage, personalCommunication);
        
        // 3rd Scroll: Position mission choices area at top of viewport
        if (window.app && window.app.cinematic) {
            await window.app.cinematic.smoothScrollTo(missionChoices);
        }
        
        // Stage 3: Mission choices with progressive reveal
        await this.initMissionChoices(missionChoices);
        
        // Enable mission input
        this.missionInputEnabled = true;
        
        // Clean up temporary expanding element if it was created
        const tempExpand = document.getElementById('force-expand-temp');
        if (tempExpand) {
            console.log('🧹 [CLEANUP] Removing temporary expanding element');
            tempExpand.remove();
        }
        
        console.log('✅ Mission screen ready for input');
    }
    
    /**
     * Stage 1: Signal detection with cascading wave animation
     */
    async initSignalDetection(signalBars, container) {
        console.log('📡 Starting signal detection...');
        
        // Play connection establishment audio
        AudioEngine.play('connectionEstablish');
        
        // Start cascading signal wave
        this.startSignalWave(signalBars);
        
        // Let the signal wave run for dramatic effect
        await this.delay(3000);
        
        // Lock signal and stop animation
        this.stopSignalWave(signalBars);
        
        // Signal locked - play success audio
        AudioEngine.play('success');
        
        // Update signal lock status
        const signalLock = container.querySelector('.signal-lock');
        if (signalLock) {
            signalLock.textContent = 'SIGNAL LOCK: ESTABLISHED';
            signalLock.classList.add('phosphor-glow-active');
        }
        
        await this.delay(1200);
    }
    
    /**
     * Stage 2: Personal communication with typing effect
     */
    async initPersonalCommunication(messageElement, container) {
        console.log('📝 Starting personal communication...');
        
        // Play alert audio for personal transmission
        AudioEngine.play('alert');
        
        // Make container visible first - add revealed class
        container.classList.add('revealed');
        
        // Also make the message element itself visible (it has reveal-element class)
        messageElement.classList.add('revealed');
        
        // Clear any existing content
        messageElement.textContent = '';
        
        // Type the personal message with audio
        await this.typeTextWithAudio(messageElement, this.personalMessageText, 40);
        
        // Add phosphor glow effect
        container.classList.add('phosphor-glow-active');
        
        await this.delay(1200);
    }
    
    /**
     * Stage 3: Mission choices with progressive reveal
     */
    async initMissionChoices(container) {
        console.log('🎯 Revealing mission choices...');
        
        // Play data transfer audio
        AudioEngine.play('dataTransfer');
        
        // Reveal elements in sequence
        const choicePrompt = container.querySelector('.choice-prompt');
        const optionHeaders = container.querySelectorAll('.option-header');
        const buttons = container.querySelectorAll('.mission-button');
        const hint = container.querySelector('.choice-hint');
        
        // Reveal prompt first
        if (choicePrompt) {
            choicePrompt.style.opacity = '0';
            choicePrompt.style.transform = 'translateY(20px)';
            this.revealElement(choicePrompt);
        }
        await this.delay(800);
        
        // Reveal option headers
        for (const header of optionHeaders) {
            header.style.opacity = '0';
            header.style.transform = 'translateY(15px)';
            this.revealElement(header);
            AudioEngine.play('terminalTextBeep', { volume: 0.1 });
            await this.delay(600);
        }
        
        // Reveal buttons
        for (const button of buttons) {
            button.style.opacity = '0';
            button.style.transform = 'translateY(20px) scale(0.95)';
            this.revealElement(button);
            AudioEngine.play('terminalBeep', { volume: 0.15 });
            await this.delay(600);
        }
        
        // Reveal hint
        if (hint) {
            hint.style.opacity = '0';
            hint.style.transform = 'translateY(10px)';
            this.revealElement(hint);
        }
        
        // Setup button event listeners
        this.setupMissionButtons();
        
        // Final beep to indicate readiness
        await this.delay(400);
        AudioEngine.play('beep');
    }
    
    /**
     * Reveal element with animation
     */
    revealElement(element, duration = 800) {
        element.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) scale(1)';
        });
    }
    
    /**
     * Start cascading signal wave animation
     */
    startSignalWave(signalBars) {
        this.currentSignalBar = 0;
        
        this.signalWaveInterval = setInterval(() => {
            // Remove bouncing from all bars
            signalBars.forEach(bar => bar.classList.remove('bouncing'));
            
            // Add bouncing to current bar
            if (signalBars[this.currentSignalBar]) {
                signalBars[this.currentSignalBar].classList.add('bouncing');
            }
            
            // Move to next bar
            this.currentSignalBar = (this.currentSignalBar + 1) % signalBars.length;
            
            // Play subtle data transfer sound
            if (this.currentSignalBar === 0) {
                AudioEngine.play('terminalTextBeep', { volume: 0.2 });
            }
        }, 250);
    }
    
    /**
     * Stop signal wave and lock all bars
     */
    stopSignalWave(signalBars) {
        if (this.signalWaveInterval) {
            clearInterval(this.signalWaveInterval);
            this.signalWaveInterval = null;
        }
        
        // Lock all bars in active state
        signalBars.forEach(bar => {
            bar.classList.remove('bouncing');
            bar.classList.add('locked');
            bar.style.opacity = '1';
            bar.style.background = 'var(--color-primary)';
            bar.style.boxShadow = '0 0 10px var(--color-primary)';
        });
    }
    
    /**
     * Type text with character-by-character animation and audio
     */
    async typeTextWithAudio(element, text, delay = 50) {
        element.textContent = '';
        
        for (let i = 0; i < text.length; i++) {
            element.textContent += text[i];
            
            // Play typing sound for visible characters
            if (text[i] !== ' ' && text[i] !== '\n') {
                AudioEngine.play('terminalTextBeep', { volume: 0.1 });
            }
            
            // 2nd Scroll: Check if we need to scroll to keep typing area visible
            if (text[i] === '\n' || i % 50 === 0) { // Check on newlines and every 50 characters
                this.checkAndScrollToKeepVisible(element);
            }
            
            // Wait before next character
            await this.delay(delay);
        }
    }
    
    /**
     * Check if element is becoming invisible and scroll to keep it visible
     * Uses document-level scrolling for mission screen
     */
    checkAndScrollToKeepVisible(element) {
        if (!element) return;
        
        // Use document-level scrolling for mission screen
        const elementRect = element.getBoundingClientRect();
        const scrollBuffer = window.innerWidth <= 768 ? 100 : 150; // Mobile vs desktop buffer
        const viewportHeight = window.innerHeight;
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        
        // Check if element bottom is near or below viewport bottom
        if (elementRect.bottom > viewportHeight - scrollBuffer) {
            const scrollAmount = elementRect.bottom - viewportHeight + scrollBuffer;
            const targetScroll = currentScroll + scrollAmount;
            
            
            // Quick scroll (no animation) to keep typing area visible
            window.scrollTo({
                top: targetScroll,
                behavior: 'auto' // Instant, no animation
            });

        }
    }
    
    /**
     * Find the scrollable container for a given element
     * Returns null for mission screen to force document-level scrolling
     */
    findScrollableContainer(element) {
        let current = element;
        
        while (current && current !== document.body) {
            // Check if current element is a screen with absolute/fixed positioning
            const computedStyle = window.getComputedStyle(current);
            
            if (current.classList.contains('screen') && 
                (computedStyle.position === 'absolute' || computedStyle.position === 'fixed')) {
                
                // Special case: Mission screen should use document-level scrolling
                if (current.id === 'mission-screen') {
                    return null; // Force document-level scrolling
                }
                
                // Look for scrollable container within this screen
                const scrollableContent = current.querySelector('.scrollable-content');
                if (scrollableContent) {
                    return scrollableContent;
                }
                
                // If no specific scrollable container, check if screen itself can scroll
                const screenContent = current.querySelector('.screen-content');
                if (screenContent) {
                    return screenContent;
                }
                
                // Fallback to the screen itself
                return current;
            }
            
            current = current.parentElement;
        }
        
        return null;
    }
    
    /**
     * Setup mission button event listeners with audio feedback
     */
    setupMissionButtons() {
        const acceptButton = document.querySelector('.accept-button');
        const declineButton = document.querySelector('.decline-button');
        
        if (acceptButton) {
            acceptButton.addEventListener('click', () => this.handleMissionChoice(true));
            acceptButton.addEventListener('mouseenter', () => {
                AudioEngine.play('beep', { volume: 0.3 });
            });
        }
        
        if (declineButton) {
            declineButton.addEventListener('click', () => this.handleMissionChoice(false));
            declineButton.addEventListener('mouseenter', () => {
                AudioEngine.play('beep', { volume: 0.3 });
            });
        }
    }
    
    /**
     * Handle mission choice selection
     */
    async handleMissionChoice(accepted) {
        if (!this.missionInputEnabled) {
            console.log('⚠️ Mission input not enabled yet');
            return;
        }
        
        console.log(`🎯 Mission choice: ${accepted ? 'ACCEPTED' : 'DECLINED'}`);
        
        // Disable further input
        this.missionInputEnabled = false;
        
        // Play selection audio
        AudioEngine.play('terminalBeep');
        
        // Store choice
        localStorage.setItem('missionAccepted', accepted.toString());
        
        // Visual feedback
        const buttons = document.querySelectorAll('.mission-button');
        buttons.forEach(button => {
            if ((accepted && button.classList.contains('accept-button')) ||
                (!accepted && button.classList.contains('decline-button'))) {
                button.classList.add('selected');
                button.style.boxShadow = 'var(--glow-intense)';
            } else {
                button.style.opacity = '0.3';
            }
        });
        
        // Wait for visual feedback
        await this.delay(1000);
        
        // Play confirmation audio
        if (accepted) {
            AudioEngine.play('success');
        } else {
            AudioEngine.play('disconnect');
        }
        
        // Transition to next state
        await this.delay(800);
        
        // Trigger state transition through app (cinematic system handles scroll reset)
        if (window.appState) {
            const nextState = accepted ? window.appState.states.BRIEFING : window.appState.states.DECLINED;
            window.appState.transition(nextState, window.app.cinematic);
        }
    }
    
    /**
     * Reset mission screen state
     */
    reset() {
        this.missionInputEnabled = false;
        this.currentSignalBar = 0;
        
        if (this.signalWaveInterval) {
            clearInterval(this.signalWaveInterval);
            this.signalWaveInterval = null;
        }
        
        // Reset signal bars
        const signalBars = document.querySelectorAll('.signal-bars .bar');
        signalBars.forEach(bar => {
            bar.classList.remove('bouncing', 'locked');
            bar.style.opacity = '';
            bar.style.background = '';
            bar.style.boxShadow = '';
        });
        
        // Reset buttons
        const buttons = document.querySelectorAll('.mission-button');
        buttons.forEach(button => {
            button.classList.remove('selected');
            button.style.opacity = '';
            button.style.boxShadow = '';
        });
        
        // Reset glow effects
        const glowElements = document.querySelectorAll('.phosphor-glow-active');
        glowElements.forEach(element => {
            element.classList.remove('phosphor-glow-active');
        });
    }
    
    /**
     * Cleanup when leaving mission screen
     */
    cleanup() {
        this.reset();
        console.log('🧹 Mission screen cleaned up');
    }
    
    /**
     * Utility: Promise-based delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Get mission screen status
     */
    getStatus() {
        return {
            inputEnabled: this.missionInputEnabled,
            agentName: this.agentName,
            signalWaveActive: this.signalWaveInterval !== null,
            currentSignalBar: this.currentSignalBar
        };
    }
}

export default MissionScreen;