/**
 * V2 Architecture - Cinematic Engine
 * Handles all animations and visual effects
 */

import { MissionScreen } from './mission-screen.js';

export class CinematicEngine {
    constructor() {
        this.animations = new Map();
        this.isPaused = false;
        this.transitions = new Map();
        this.currentAnimation = null;
        this.missionScreen = new MissionScreen();
        this.setupMobileDetection();
    }
    
    /**
     * Setup mobile detection for animation optimization
     */
    setupMobileDetection() {
        this.isMobile = window.innerWidth <= 768;
        this.isTouch = 'ontouchstart' in window;
        this.supportsScrollBehavior = 'scrollBehavior' in document.documentElement.style;
    }
    
    
    /**
     * Play the wake sequence with dormant terminal
     */
    async playWakeSequence() {
        console.log('💤 Starting wake sequence - dormant terminal mode...');
        
        // Wake sequence is primarily handled by WakeScreen controller
        // This method exists for consistency with architecture patterns
        
        // Add minimal CRT effects for dormant state
        const app = document.getElementById('app');
        if (app) {
            app.classList.add('terminal-active');
        }
        
        console.log('💤 Wake sequence setup complete - waiting for user interaction');
    }

    /**
     * Play the boot sequence with dramatic typing
     */
    async playBootSequence() {
        console.log('🔌 Starting boot sequence as first experience...');
        
        // Start with immediate visual activity - scan lines and CRT effects
        this.startScanLines();
        
        // Enhanced boot messages for 7-second duration
        const bootMessages = [
            "> SYSTEM INITIALIZING...",
            "> HARDWARE VERIFICATION... OK",
            "> LOADING SECURITY PROTOCOLS...",
            "> SCANNING FOR SURVEILLANCE...",
            "> ENVIRONMENT SECURE",
            "> ESTABLISHING ENCRYPTED CONNECTION...",
            "> CONNECTION ESTABLISHED",
            "> TERMINAL READY"
        ];
        
        // Get boot container
        const bootContainer = document.querySelector('#boot-sequence-screen .boot-sequence-container');
        if (!bootContainer) {
            console.warn('Boot sequence container not found');
            return;
        }
        
        // Ensure container is clean and positioned at top
        bootContainer.innerHTML = '';
        bootContainer.scrollTop = 0;
        
        // Environmental buildup (CRT power-on) - immediate
        await this.playEnvironmentalBuildup();
        
        // Type out each message with dramatic timing
        const messageDelay = 800; // ~800ms per message for 7 seconds total
        
        for (let i = 0; i < bootMessages.length; i++) {
            await this.typeBootMessage(bootContainer, bootMessages[i], messageDelay);
        }
        
        // Final system ready sound
        if (window.AudioEngine) {
            window.AudioEngine.play('success', { volume: 0.4 });
        }
        
        console.log('✨ Boot sequence complete - terminal authenticated');
    }
    
    /**
     * Reveal boot sequence stages progressively
     */
    revealBootStage(stage) {
        const bootScreen = document.getElementById('boot-sequence-screen');
        if (!bootScreen) return;
        
        const stageElements = bootScreen.querySelectorAll(`.boot-stage-${stage}-hidden`);
        stageElements.forEach(element => {
            element.classList.remove(`boot-stage-${stage}-hidden`);
            element.classList.add(`boot-stage-${stage}-reveal`);
        });
        
        console.log(`🔌 Boot stage ${stage} revealed`);
    }
    
    /**
     * Play mission screen sequential reveal
     */
    async playMissionReveal() {
        console.log('🎯 Starting mission screen cinematic reveal...');
        console.log('📊 Document state at mission reveal:', {
            readyState: document.readyState,
            missionScreenExists: !!document.getElementById('mission-screen'),
            documentHeight: document.documentElement.scrollHeight,
            viewportHeight: window.innerHeight,
            currentScroll: window.pageYOffset || document.documentElement.scrollTop
        });
        
        const screen = document.getElementById('mission-screen');
        if (!screen) {
            console.error('❌ Mission screen not found!');
            return;
        }
        
        // Stage 1: Header elements
        const statusBar = screen.querySelector('.status-bar');
        const title = screen.querySelector('h1');
        if (statusBar) {
            statusBar.style.opacity = '0';
            statusBar.style.transform = 'translateY(-10px)';
            await this.delay(200);
            this.revealElement(statusBar);
        }
        await this.delay(600);
        if (title) {
            title.style.opacity = '0';
            title.style.transform = 'translateY(20px)';
            this.revealElement(title);
        }
        await this.delay(1200);
        
        // Stage 2: Signal detection
        const transmissionDetection = screen.querySelector('.transmission-detection');
        if (transmissionDetection) {
            transmissionDetection.style.opacity = '0';
            transmissionDetection.style.transform = 'translateY(30px)';
            this.revealElement(transmissionDetection);
        }
        await this.delay(1200);
        
        // Stage 3: Personal communication header
        const commHeader = screen.querySelector('.communication-header');
        if (commHeader) {
            commHeader.style.opacity = '0';
            commHeader.style.transform = 'translateY(20px)';
            this.revealElement(commHeader);
        }
        await this.delay(800);
        
        // Stage 4: Initialize mission screen controller for the rest
        console.log('🎯 Initializing MissionScreen controller...');
        await this.missionScreen.init();
        
        console.log('✅ Mission screen cinematic reveal complete');
    }
    
    /**
     * Play auth screen sequential revelation
     */
    async playAuthReveal() {
        console.log('🔐 Starting auth screen sequential revelation...');
        
        // Stage 1: Status bar (immediate)
        await this.delay(200);
        this.revealAuthStage(1);
        if (window.AudioEngine) {
            window.AudioEngine.play('terminalBeep', { volume: 0.2 });
        }
        
        // Stage 2: Title and subtitle (1200ms delay)
        await this.delay(1200);
        this.revealAuthStage(2);
        if (window.AudioEngine) {
            window.AudioEngine.play('terminalTextBeep', { volume: 0.1 });
        }
        
        // Stage 3: Terminal container (1200ms delay)
        await this.delay(1200);
        this.revealAuthStage(3);
        if (window.AudioEngine) {
            window.AudioEngine.play('terminalBeep', { volume: 0.15 });
        }
        
        // Stage 4: Form elements (1200ms delay)
        await this.delay(1200);
        this.revealAuthStage(4);
        if (window.AudioEngine) {
            window.AudioEngine.play('terminalTextBeep', { volume: 0.1 });
        }
        
        // Stage 5: Submit button (1200ms delay)
        await this.delay(1200);
        this.revealAuthStage(5);
        if (window.AudioEngine) {
            window.AudioEngine.play('terminalBeep', { volume: 0.2 });
        }
        
        // Stage 6: Footer (1200ms delay)
        await this.delay(1200);
        this.revealAuthStage(6);
        if (window.AudioEngine) {
            window.AudioEngine.play('terminalTextBeep', { volume: 0.1 });
        }
        
        console.log('✨ Auth screen sequential revelation complete');
    }
    
    /**
     * Reveal auth screen stage progressively
     */
    revealAuthStage(stage) {
        const authScreen = document.getElementById('auth-screen');
        if (!authScreen) return;
        
        const stageElements = authScreen.querySelectorAll(`.auth-stage-${stage}-hidden`);
        stageElements.forEach(element => {
            element.classList.remove(`auth-stage-${stage}-hidden`);
            element.classList.add(`auth-stage-${stage}-reveal`);
        });
        
        console.log(`🔐 Auth stage ${stage} revealed`);
    }
    
    
    
    /**
     * Environmental buildup with immediate CRT power-on
     */
    async playEnvironmentalBuildup() {
        const app = document.getElementById('app');
        if (!app) return;
        
        // Ensure app is visible for boot sequence
        app.style.opacity = '1';
        app.style.transition = 'opacity 300ms ease-out';
        
        // Play CRT power-on sound immediately
        if (window.AudioEngine) {
            window.AudioEngine.play('crtPowerOn');
        }
        
        // Quick flash effect to simulate CRT stabilization
        await this.delay(100);
        app.style.opacity = '0.9';
        await this.delay(100);
        app.style.opacity = '1';
        
        console.log('🔌 Environmental buildup complete - CRT ready');
    }
    
    
    /**
     * Start scan lines effect immediately
     */
    startScanLines() {
        const app = document.getElementById('app');
        if (app) {
            app.classList.add('terminal-active');
            console.log('📺 Scan lines activated');
        }
    }
    
    
    /**
     * Type boot message with terminal-style appearance
     */
    async typeBootMessage(container, message, totalTime) {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = 'boot-message boot-message-typing';
        messageEl.style.opacity = '1';
        
        container.appendChild(messageEl);
        
        // Calculate typing speed to fill the time
        const typingSpeed = Math.max(20, (totalTime - 200) / message.length); // Reserve 200ms for pauses
        
        // Type character by character
        for (let i = 0; i < message.length; i++) {
            if (this.isPaused) {
                await this.waitForResume();
            }
            
            messageEl.textContent += message[i];
            
            // Play typing sound for non-space characters
            if (message[i] !== ' ' && window.AudioEngine) {
                window.AudioEngine.play('terminalTextBeep', { volume: 0.1 });
            }
            
            await this.delay(typingSpeed);
        }
        
        // Remove typing cursor
        messageEl.classList.remove('boot-message-typing');
        
        // Minimal pause after message completion
        await this.delay(50);
        
        // System beep for message completion
        if (window.AudioEngine) {
            window.AudioEngine.play('terminalBeep', { volume: 0.2 });
        }
        
        // Minimal delay before next message - tight timing
        await this.delay(Math.max(25, totalTime - (message.length * typingSpeed) - 150));
    }
    
    /**
     * Type message character by character
     */
    async typeMessage(element, message, speed = 30) {
        element.style.opacity = '1';
        element.textContent = '';
        
        for (let i = 0; i < message.length; i++) {
            if (this.isPaused) {
                await this.waitForResume();
            }
            
            element.textContent += message[i];
            await this.delay(speed);
        }
    }
    
    /**
     * Reveal text with typing effect
     */
    async revealText(element, speed = 50) {
        const text = element.textContent;
        element.textContent = '';
        element.style.opacity = '1';
        
        for (let i = 0; i < text.length; i++) {
            if (this.isPaused) {
                await this.waitForResume();
            }
            
            element.textContent += text[i];
            await this.delay(speed);
        }
    }
    
    /**
     * Fade in element
     */
    async fadeIn(element, duration = 1000) {
        element.style.transition = `opacity ${duration}ms ease-out`;
        element.style.opacity = '0';
        
        // Force reflow
        element.offsetHeight;
        
        element.style.opacity = '1';
        await this.delay(duration);
    }
    
    /**
     * Smooth scroll to element with mobile optimization
     * Enhanced to work with V2 architecture's absolute positioning
     */
    async smoothScrollTo(element, options = {}) {
        console.log('🎯 [smoothScrollTo] Called with:', { element, options });
        
        const defaultOptions = {
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest',
            offset: this.isMobile ? 20 : 40
        };
        
        const config = { ...defaultOptions, ...options };
        console.log('🔧 [smoothScrollTo] Config:', config);
        
        // Get target element
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (!target) {
            console.error('❌ [smoothScrollTo] Target element not found!');
            return;
        }
        
        console.log('🎯 [smoothScrollTo] Target element:', target);
        console.log('📍 [smoothScrollTo] Target rect:', target.getBoundingClientRect());
        
        // Check if target is within an absolutely positioned screen
        const screenContainer = this.findScrollableContainer(target);
        console.log('📦 [smoothScrollTo] Container found:', screenContainer);
        
        if (screenContainer) {
            // Use screen-aware scrolling for absolute positioning
            console.log('📜 [smoothScrollTo] Using container scrolling');
            await this.smoothScrollWithinContainer(target, screenContainer, config);
        } else {
            // Fallback to document-level scrolling
            console.log('📜 [smoothScrollTo] Using document-level scrolling');
            await this.documentLevelScroll(target, config);
        }
        
        console.log('✅ [smoothScrollTo] Completed');
    }
    
    /**
     * Find the scrollable container for a given element
     * Handles V2 architecture's absolute positioning
     * Returns null for mission screen to force document-level scrolling
     */
    findScrollableContainer(element) {
        console.log('🔍 [findScrollableContainer] Starting search for element:', element);
        let current = element;
        
        while (current && current !== document.body) {
            // Check if current element is a screen with absolute/fixed positioning
            const computedStyle = window.getComputedStyle(current);
            
            if (current.classList.contains('screen') && 
                (computedStyle.position === 'absolute' || computedStyle.position === 'fixed')) {
                
                console.log('💻 [findScrollableContainer] Found screen:', current.id, 'position:', computedStyle.position);
                
                // Special case: Mission screen should use document-level scrolling
                if (current.id === 'mission-screen') {
                    console.log('🎯 [findScrollableContainer] Mission screen detected - returning null for document scrolling');
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
        
        console.log('🔍 [findScrollableContainer] No scrollable container found - returning null');
        return null;
    }
    
    /**
     * Smooth scroll within a container (for absolute positioning)
     */
    async smoothScrollWithinContainer(target, container, config) {
        const containerRect = container.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        
        // Calculate scroll position within container
        const containerScrollTop = container.scrollTop;
        const targetOffsetTop = targetRect.top - containerRect.top + containerScrollTop;
        const targetPosition = Math.max(0, targetOffsetTop - config.offset);
        
        // Use native smooth scroll if supported
        if (this.supportsScrollBehavior) {
            container.scrollTo({
                top: targetPosition,
                behavior: config.behavior
            });
        } else {
            // Fallback to manual smooth scroll on container
            await this.manualSmoothScrollContainer(container, targetPosition, 800);
        }
    }
    
    /**
     * Document-level scrolling (fallback)
     */
    async documentLevelScroll(target, config) {
        const rect = target.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetPosition = rect.top + scrollTop - config.offset;
        
        // Enhanced debug logging
        console.log('📜 [documentLevelScroll] Enhanced debug info:');
        console.log('📏 Document dimensions:', {
            scrollHeight: document.documentElement.scrollHeight,
            clientHeight: document.documentElement.clientHeight,
            scrollableHeight: document.documentElement.scrollHeight - document.documentElement.clientHeight
        });
        console.log('📏 Body dimensions:', {
            scrollHeight: document.body.scrollHeight,
            clientHeight: document.body.clientHeight,
            scrollableHeight: document.body.scrollHeight - document.body.clientHeight
        });
        console.log('📜 Target element info:', {
            id: target.id,
            className: target.className,
            rect: rect,
            offsetTop: target.offsetTop,
            offsetParent: target.offsetParent
        });
        console.log('📜 [documentLevelScroll] Calculations:', {
            rectTop: rect.top,
            currentScrollTop: scrollTop,
            offset: config.offset,
            targetPosition: targetPosition,
            supportsScrollBehavior: this.supportsScrollBehavior
        });
        
        // Use native smooth scroll if supported
        if (this.supportsScrollBehavior) {
            console.log('📜 [documentLevelScroll] Using native smooth scroll');
            window.scrollTo({
                top: targetPosition,
                behavior: config.behavior
            });
        } else {
            // Fallback to manual smooth scroll
            console.log('📜 [documentLevelScroll] Using manual smooth scroll fallback');
            await this.manualSmoothScroll(targetPosition, 800);
        }
        
        // Debug: Check final state
        const finalScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        console.log('📍 [documentLevelScroll] Scroll complete. Final position:', finalScrollTop);
        console.log('📍 [documentLevelScroll] Final document dimensions:', {
            scrollHeight: document.documentElement.scrollHeight,
            clientHeight: document.documentElement.clientHeight,
            scrollableHeight: document.documentElement.scrollHeight - document.documentElement.clientHeight
        });
    }
    
    /**
     * Manual smooth scroll fallback (document level)
     */
    async manualSmoothScroll(targetPosition, duration = 800) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const startTime = performance.now();
        
        return new Promise(resolve => {
            const animateScroll = (currentTime) => {
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / duration, 1);
                const easeProgress = this.easeOutCubic(progress);
                
                window.scrollTo(0, startPosition + distance * easeProgress);
                
                if (progress < 1) {
                    requestAnimationFrame(animateScroll);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(animateScroll);
        });
    }
    
    /**
     * Manual smooth scroll fallback (container level)
     */
    async manualSmoothScrollContainer(container, targetPosition, duration = 800) {
        const startPosition = container.scrollTop;
        const distance = targetPosition - startPosition;
        const startTime = performance.now();
        
        return new Promise(resolve => {
            const animateScroll = (currentTime) => {
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / duration, 1);
                const easeProgress = this.easeOutCubic(progress);
                
                container.scrollTop = startPosition + distance * easeProgress;
                
                if (progress < 1) {
                    requestAnimationFrame(animateScroll);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(animateScroll);
        });
    }
    
    /**
     * Easing function for smooth animations
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    /**
     * Progressive reveal sequence
     */
    async revealSequence(elements, options = {}) {
        const defaults = {
            delay: 300,
            duration: 800,
            easing: 'ease-out',
            stagger: true
        };
        const config = { ...defaults, ...options };
        
        const elementArray = Array.isArray(elements) ? elements : Array.from(elements);
        console.log('🔍 elementArray after conversion:', elementArray);
        
        // Filter out null/undefined elements
        const validElements = elementArray.filter(element => element !== null && element !== undefined);
        console.log('🔍 validElements after filtering:', validElements);
        
        console.log(`🎬 Revealing ${validElements.length} elements`);
        
        // Start all animations
        const promises = validElements.map((element, index) => {
            return new Promise(resolve => {
                const delay = config.stagger ? index * config.delay : 0;
                
                setTimeout(() => {
                    this.revealElement(element, config.duration, config.easing);
                    resolve();
                }, delay);
            });
        });
        
        // Wait for all to complete
        await Promise.all(promises);
    }
    
    /**
     * Reveal single element
     */
    revealElement(element, duration = 800, easing = 'ease-out') {
        if (!element) {
            console.warn('🚨 revealElement called with null/undefined element');
            return;
        }
        
        // Debug: Check what we received
        console.log('🔍 revealElement called with:', element, 'type:', typeof element, 'nodeType:', element.nodeType);
        
        // Additional safety check for DOM elements
        if (!element.style) {
            console.error('🚨 Element has no style property:', element);
            return;
        }
        
        // Set initial state
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
        
        // Force reflow
        element.offsetHeight;
        
        // Trigger animation
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            element.classList.add('revealed');
        });
    }
    
    /**
     * Comprehensive scroll position reset for absolute positioning architecture
     */
    resetAllScrollPositions() {
        try {
            // Reset document level scroll
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            
            // Reset app container scroll (critical for absolute positioning)
            const appContainer = document.getElementById('app');
            if (appContainer) {
                appContainer.scrollTop = 0;
                console.log(`📐 App container scroll reset: ${appContainer.scrollTop}`);
            }
            
            // Reset any scrollable screen elements
            const screens = document.querySelectorAll('.screen');
            screens.forEach(screen => {
                if (screen) {
                    screen.scrollTop = 0;
                    console.log(`📐 Screen scroll reset: ${screen.id}, scrollTop: ${screen.scrollTop}`);
                }
            });
            
            // Force layout recalculation to ensure scroll reset takes effect
            document.body.offsetHeight;
            
            console.log(`📐 Comprehensive scroll reset completed`);
            
        } catch (error) {
            console.error('Error during scroll reset:', error);
            // Fallback to basic scroll reset
            window.scrollTo(0, 0);
        }
    }
    
    /**
     * Screen transition animation with smooth scroll
     */
    async transitionScreens(fromScreen, toScreen) {
        console.log(`🎬 Transitioning: ${fromScreen} → ${toScreen}`);
        
        const fromElement = document.getElementById(`${fromScreen}-screen`);
        const toElement = document.getElementById(`${toScreen}-screen`);
        
        if (!fromElement || !toElement) {
            console.error('Screen elements not found');
            return;
        }
        
        // Phase 1: Fade out current screen
        fromElement.style.transition = 'opacity 600ms ease-in';
        fromElement.style.opacity = '0';
        
        await this.delay(300);
        
        // Phase 2: Switch visibility
        fromElement.classList.remove('active');
        fromElement.classList.add('hidden');
        toElement.classList.remove('hidden');
        toElement.classList.add('active');
        
        // Phase 3: Comprehensive scroll reset for absolute positioning architecture
        this.resetAllScrollPositions();
        
        // Phase 4: Fade in new screen
        toElement.style.opacity = '0';
        toElement.style.transition = 'opacity 600ms ease-out';
        
        await this.delay(100);
        
        toElement.style.opacity = '1';
        
        // Phase 5: Trigger reveal animations for new screen
        await this.delay(400);
        this.triggerScreenReveal(toScreen);
    }
    
    /**
     * Trigger reveal animations for a specific screen
     */
    triggerScreenReveal(screenName) {
        const screen = document.getElementById(`${screenName}-screen`);
        if (!screen) return;
        
        // Setup screen-specific interactions
        if (screenName === 'wake') {
            // Wake screen uses its own controller system
            console.log(`💤 ${screenName} screen transition complete - wake controller will handle interactions`);
        } else if (screenName === 'boot-sequence') {
            // Boot sequence screen uses its own revelation system
            console.log(`🎬 ${screenName} screen transition complete - boot sequence will handle revelation`);
        } else if (screenName === 'auth') {
            // Use auth-specific sequential revelation system
            console.log(`🔐 ${screenName} screen using sequential revelation system`);
            setTimeout(async () => {
                await this.playAuthReveal();
                // Setup auth form after revelation completes
                this.setupAuthForm();
            }, 500);
        } else if (screenName === 'mission') {
            // Mission screen uses custom sequential revelation
            console.log(`🎯 ${screenName} screen using custom cinematic sequence`);
            setTimeout(() => {
                this.playMissionReveal();
            }, 500);
        } else if (screenName === 'briefing' || screenName === 'countdown' || 
                   screenName === 'credits' || screenName === 'declined') {
            // Other screens use generic reveal system
            const revealElements = screen.querySelectorAll('.reveal-element');
            console.log(`🔍 Found ${revealElements.length} reveal elements for ${screenName}:`, revealElements);
            
            if (revealElements.length > 0) {
                this.revealSequence(revealElements);
            }
            
            console.log(`🎬 ${screenName} screen transition complete`);
        }
    }
    
    /**
     * Pause all animations
     */
    pauseAnimations() {
        this.isPaused = true;
        console.log('⏸️ Animations paused');
    }
    
    /**
     * Resume animations
     */
    resumeAnimations() {
        this.isPaused = false;
        console.log('▶️ Animations resumed');
    }
    
    /**
     * Wait for animations to resume
     */
    async waitForResume() {
        while (this.isPaused) {
            await this.delay(100);
        }
    }
    
    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Apply CRT flicker effect
     */
    async applyCRTFlicker(duration = 200) {
        const app = document.getElementById('app');
        if (!app) return;
        
        app.style.opacity = '0.8';
        await this.delay(duration / 2);
        app.style.opacity = '1';
        await this.delay(duration / 2);
    }
    
    /**
     * Create phosphor trail effect
     */
    createPhosphorTrail(element) {
        // This would create a subtle glow trail
        // For now, just add glow class
        element.classList.add('phosphor-glow-active');
        
        setTimeout(() => {
            element.classList.remove('phosphor-glow-active');
        }, 2000);
    }
    
    /**
     * Setup auth form interactions
     */
    setupAuthForm() {
        const form = document.getElementById('auth-form');
        const inputs = form?.querySelectorAll('.terminal-input');
        
        if (!form || !inputs) return;
        
        // Add focus/blur effects
        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                this.createPhosphorTrail(e.target);
            });
            
            input.addEventListener('input', (e) => {
                // Add typing feedback
                if (e.target.value.length > 0) {
                    e.target.style.textShadow = '0 0 3px var(--color-primary)';
                } else {
                    e.target.style.textShadow = 'none';
                }
            });
        });
        
        // Handle form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAuthSubmission(form);
        });
    }
    
    /**
     * Handle authentication form submission
     */
    async handleAuthSubmission(form) {
        const button = form.querySelector('.action-button');
        const agentName = form.querySelector('#agent-name').value.trim();
        const accessCode = form.querySelector('#access-code').value.trim();
        
        // Disable form
        button.disabled = true;
        button.textContent = 'AUTHENTICATING...';
        
        // Basic validation
        if (!agentName || !accessCode) {
            await this.showAuthError('INCOMPLETE CREDENTIALS');
            this.resetAuthForm(form);
            return;
        }
        
        if (accessCode.length < 4) {
            await this.showAuthError('ACCESS CODE TOO SHORT');
            this.resetAuthForm(form);
            return;
        }
        
        // Simulate authentication delay
        await this.delay(2000);
        
        // Store agent name for later use
        localStorage.setItem('agentName', agentName);
        
        // Success animation
        button.textContent = 'AUTHENTICATED';
        this.createPhosphorTrail(button);
        
        await this.delay(1000);
        
        // Trigger transition to mission state (skipping sound test for now)
        if (window.app) {
            window.app.transitionTo('mission');
        }
    }
    
    /**
     * Show authentication error
     */
    async showAuthError(message) {
        const form = document.getElementById('auth-form');
        if (!form) return;
        
        // Create error element
        const existingError = form.querySelector('.auth-error');
        if (existingError) {
            existingError.remove();
        }
        
        const errorEl = document.createElement('div');
        errorEl.className = 'auth-error text-sm';
        errorEl.style.color = 'var(--color-danger)';
        errorEl.style.textAlign = 'center';
        errorEl.style.fontWeight = 'bold';
        errorEl.style.marginTop = 'var(--space-md)';
        errorEl.textContent = `⚠ ${message}`;
        
        form.appendChild(errorEl);
        
        // Flash effect
        await this.applyCRTFlicker(100);
        
        // Remove after delay
        setTimeout(() => {
            errorEl.remove();
        }, 3000);
    }
    
    /**
     * Reset auth form to normal state
     */
    resetAuthForm(form) {
        const button = form.querySelector('.action-button');
        button.disabled = false;
        button.textContent = 'AUTHENTICATE';
    }
}