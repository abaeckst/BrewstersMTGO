/**
 * Countdown Screen Controller - V2 Architecture
 * 14-day mission timer with congratulations message, scrolling credits, and Mission Impossible theme
 * Part of Brewster's MTGO Mission Terminal V2
 */

import { AudioEngine } from './audio-engine.js';

class CountdownScreen {
    constructor() {
        // 14 days in seconds (14 * 24 * 60 * 60 = 1,209,600)
        this.initialTime = 1209600;
        this.timeRemaining = this.initialTime;
        this.timerInterval = null;
        this.audioTriggered = false;
        this.phase = 'initializing';
        
        // Element references (will be cached on init)
        this.elements = {};
        
        console.log('⏰ Countdown screen V2 controller initialized');
    }
    
    init() {
        console.log('⏰ Initializing countdown screen V2...');
        
        // Auto-scroll to top before sequence begins
        this.scrollToTop();
        
        // Cache element references
        this.cacheElements();
        
        // Reset state for new countdown
        this.resetState();
        
        // Start the cinematic sequence
        this.startCinematicSequence();
    }
    
    scrollToTop() {
        // Comprehensive scroll reset as per project standards
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        
        const countdownScreen = document.getElementById('countdown-screen');
        if (countdownScreen) {
            countdownScreen.scrollTop = 0;
        }
        
        console.log('📜 Countdown screen: Scroll reset to top');
    }
    
    cacheElements() {
        // Cache all element references for performance
        this.elements = {
            congratulationsMessage: document.getElementById('congratulations-message'),
            timerDisplay: document.getElementById('timer-display'),
            daysTens: document.getElementById('days-tens'),
            daysOnes: document.getElementById('days-ones'),
            hoursTens: document.getElementById('hours-tens'),
            hoursOnes: document.getElementById('hours-ones'),
            minutesTens: document.getElementById('minutes-tens'),
            minutesOnes: document.getElementById('minutes-ones'),
            secondsTens: document.getElementById('seconds-tens'),
            secondsOnes: document.getElementById('seconds-ones'),
            timeStartsSection: document.getElementById('time-starts-section'),
            wordYour: document.getElementById('word-your'),
            wordTime: document.getElementById('word-time'),
            wordStarts: document.getElementById('word-starts'),
            wordNow: document.getElementById('word-now')
        };
    }
    
    resetState() {
        // Reset timer and phase
        this.timeRemaining = this.initialTime;
        this.audioTriggered = false;
        this.phase = 'initializing';
        
        // Reset all stage visibility
        this.resetStageVisibility();
        
        // Initialize timer display
        this.updateTimerDisplay();
        
        console.log('🔄 Countdown screen state reset');
    }
    
    resetStageVisibility() {
        // Hide all elements initially using stage classes
        const stageElements = document.querySelectorAll('.countdown-stage-hidden');
        stageElements.forEach(element => {
            element.classList.remove('countdown-stage-reveal');
            element.classList.add('countdown-stage-hidden');
        });
    }
    
    async startCinematicSequence() {
        console.log('🎬 Starting countdown cinematic sequence...');
        
        // Phase 1: Congratulations Message (0-8 seconds)
        await this.playPhase1Congratulations();
        
        // Phase 2: Timer Initialization (8-10 seconds)
        await this.playPhase2TimerInit();
        
        // Phase 3: "YOUR TIME STARTS NOW" (10-14 seconds)
        await this.playPhase3TimeStarts();
        
        // Phase 4: Mission Impossible Theme & Timer Start (14+ seconds)
        await this.playPhase4AudioAndTimer();
        
    }
    
    async playPhase1Congratulations() {
        console.log('🎭 Phase 1: Congratulations message');
        this.phase = 'congratulations';
        
        // 1200ms delay for dramatic effect
        await this.delay(1200);
        
        // Reveal congratulations message with character-by-character animation
        if (this.elements.congratulationsMessage) {
            this.elements.congratulationsMessage.classList.remove('countdown-stage-hidden');
            this.elements.congratulationsMessage.classList.add('countdown-stage-reveal');
            
            // Start character-by-character animation
            await this.animateTextReveal(this.elements.congratulationsMessage);
        }
        
        // Wait for message to complete (~3 seconds total)
        await this.delay(3000);
    }
    
    async playPhase2TimerInit() {
        console.log('⏰ Phase 2: Timer initialization');
        this.phase = 'timer-init';
        
        // Reveal timer display
        if (this.elements.timerDisplay) {
            this.elements.timerDisplay.classList.remove('countdown-stage-hidden');
            this.elements.timerDisplay.classList.add('countdown-stage-reveal');
        }
        
        // Wait for timer fade in (1.0s transition)
        await this.delay(1000);
        
        // Brief pause after timer appears
        await this.delay(1000);
    }
    
    async playPhase3TimeStarts() {
        console.log('⏱️ Phase 3: YOUR TIME STARTS NOW');
        this.phase = 'time-starts';
        
        // Reveal the time starts section
        if (this.elements.timeStartsSection) {
            this.elements.timeStartsSection.classList.remove('countdown-stage-hidden');
            this.elements.timeStartsSection.classList.add('countdown-stage-reveal');
        }
        
        // Reveal each word with 1-second delays
        const words = ['wordYour', 'wordTime', 'wordStarts', 'wordNow'];
        
        for (const wordKey of words) {
            if (this.elements[wordKey]) {
                this.elements[wordKey].classList.remove('countdown-stage-hidden');
                this.elements[wordKey].classList.add('countdown-stage-reveal');
            }
            await this.delay(1000);
        }
    }
    
    async playPhase4AudioAndTimer() {
        console.log('🎵 Phase 4: Mission Impossible theme & timer start');
        this.phase = 'audio-timer';
        
        // Play Mission Impossible theme when "NOW" appears (with looping)
        if (!this.audioTriggered) {
            console.log('🎵 About to play Mission Impossible theme...');
            console.log('📱 Mobile Debug Info:', JSON.stringify(AudioEngine.getMobileDebugInfo(), null, 2));
            console.log('🔊 Audio Engine Status:', JSON.stringify(AudioEngine.getStatus(), null, 2));
            
            // Check if audio engine is properly loaded
            if (!AudioEngine.loaded) {
                console.warn('⚠️ Audio engine not loaded - attempting to initialize');
                try {
                    await AudioEngine.init();
                    console.log('✅ Audio engine initialized successfully');
                } catch (error) {
                    console.error('❌ Audio engine initialization failed:', error);
                }
            }
            
            // Check for mobile-specific audio context issues
            if (AudioEngine.context && AudioEngine.context.state === 'suspended') {
                console.warn('⚠️ Audio context suspended - attempting to unlock');
                try {
                    await AudioEngine.unlockAudioContext();
                    console.log('✅ Audio context unlocked successfully');
                } catch (error) {
                    console.error('❌ Audio context unlock failed:', error);
                }
            }
            
            // Check if missionThemeFull exists in sounds
            const soundExists = AudioEngine.sounds && AudioEngine.sounds.missionThemeFull;
            console.log('🎵 Mission theme sound exists:', !!soundExists);
            if (soundExists) {
                console.log('🎵 Mission theme config:', JSON.stringify(AudioEngine.sounds.missionThemeFull, null, 2));
            }
            
            // Check if we're on mobile and need different handling
            const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            console.log('📱 Is mobile device:', isMobile);
            console.log('📱 Is iOS:', AudioEngine.isIOS());
            
            try {
                // For mobile devices, use enhanced iOS-aware playback
                const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                if (isMobile) {
                    console.log('📱 Mobile detected - using enhanced iOS-aware playback');
                    // Add a brief delay to allow any pending audio context operations
                    await this.delay(100);
                }
                
                // Use enhanced playback method if available (handles primed audio)
                const audioElement = AudioEngine.playWithIOSFallback ? 
                    await AudioEngine.playWithIOSFallback('missionThemeFull', { loop: true }) :
                    await AudioEngine.play('missionThemeFull', { loop: true });
                this.audioTriggered = true;
                
                if (audioElement) {
                    console.log('✅ Mission Impossible theme started successfully');
                    console.log('🎵 Audio element:', audioElement);
                    console.log('🎵 Audio element type:', typeof audioElement);
                    
                    // For mobile devices, add additional event listeners
                    if (isMobile && audioElement.addEventListener) {
                        audioElement.addEventListener('play', () => {
                            console.log('🎵 Audio started playing');
                        });
                        audioElement.addEventListener('pause', () => {
                            console.log('⏸️ Audio paused');
                        });
                        audioElement.addEventListener('ended', () => {
                            console.log('🏁 Audio ended');
                        });
                        audioElement.addEventListener('error', (e) => {
                            console.error('❌ Audio error:', e);
                        });
                    }
                } else {
                    console.warn('⚠️ Mission Impossible theme failed to start - no audio element returned');
                }
            } catch (error) {
                console.error('❌ Mission Impossible theme playback failed:', error);
                this.audioTriggered = true; // Still mark as triggered to prevent retries
            }
        }
        
        // Start the actual countdown
        this.startCountdownTimer();
    }
    
    
    startCountdownTimer() {
        console.log('⏰ Starting 14-day countdown timer');
        
        // Update display immediately
        this.updateTimerDisplay();
        
        // Start 1-second interval
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            // Check if countdown is complete
            if (this.timeRemaining <= 0) {
                this.completeCountdown();
            }
        }, 1000);
    }
    
    updateTimerDisplay() {
        // Calculate days, hours, minutes, seconds
        const days = Math.floor(this.timeRemaining / (24 * 60 * 60));
        const hours = Math.floor((this.timeRemaining % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((this.timeRemaining % (60 * 60)) / 60);
        const seconds = this.timeRemaining % 60;
        
        // Break down into individual digits
        const daysTens = Math.floor(days / 10);
        const daysOnes = days % 10;
        const hoursTens = Math.floor(hours / 10);
        const hoursOnes = hours % 10;
        const minutesTens = Math.floor(minutes / 10);
        const minutesOnes = minutes % 10;
        const secondsTens = Math.floor(seconds / 10);
        const secondsOnes = seconds % 10;
        
        // Update digits with smooth animation
        this.updateDigit(this.elements.daysTens, daysTens);
        this.updateDigit(this.elements.daysOnes, daysOnes);
        this.updateDigit(this.elements.hoursTens, hoursTens);
        this.updateDigit(this.elements.hoursOnes, hoursOnes);
        this.updateDigit(this.elements.minutesTens, minutesTens);
        this.updateDigit(this.elements.minutesOnes, minutesOnes);
        this.updateDigit(this.elements.secondsTens, secondsTens);
        this.updateDigit(this.elements.secondsOnes, secondsOnes);
    }
    
    updateDigit(element, value) {
        if (!element) return;
        
        const currentValue = parseInt(element.textContent) || 0;
        if (currentValue !== value) {
            // Add digit change animation
            element.classList.add('digit-changing');
            
            // Update value after brief delay
            setTimeout(() => {
                element.textContent = value;
                element.classList.remove('digit-changing');
            }, 150);
        }
    }
    
    
    async animateTextReveal(element) {
        if (!element) return;
        
        const text = element.textContent;
        element.textContent = '';
        element.classList.add('typing-cursor');
        
        // Character-by-character reveal
        for (let i = 0; i < text.length; i++) {
            element.textContent += text[i];
            await this.delay(50); // Terminal print speed
        }
        
        // Remove cursor after completion
        element.classList.remove('typing-cursor');
    }
    
    completeCountdown() {
        console.log('🚀 Countdown complete - 14 days elapsed!');
        
        // Stop timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.phase = 'completed';
        
        // Continue showing credits (no automatic transition)
        console.log('🎬 Countdown completed - passive screen mode');
    }
    
    // Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Clean up when leaving the screen
    destroy() {
        console.log('🧹 Countdown screen V2 cleanup');
        
        // Clear timer interval
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Reset state
        this.audioTriggered = false;
        this.phase = 'initializing';
        
        // Clear any animations
        
        console.log('✅ Countdown screen V2 cleanup complete');
    }
}

export default CountdownScreen;