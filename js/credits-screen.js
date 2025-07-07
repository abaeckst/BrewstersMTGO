/**
 * Credits Screen Controller - V2 Architecture
 * Handles mission completion credits with audio crescendo
 * Part of Brewster's MTGO Mission Terminal V2
 */

import { AudioEngine } from './audio-engine.js';

class CreditsScreen {
    constructor() {
        this.elements = {
            agentName: document.querySelector('.agent-name-credits'),
            restartButton: document.getElementById('restart-mission')
        };
        
        this.initializeEventListeners();
        console.log('🏆 Credits screen controller initialized');
    }
    
    async init() {
        console.log('🏆 Initializing credits screen...');
        console.log('📱 Device type:', window.innerWidth <= 768 ? 'Mobile' : 'Desktop');
        console.log('🔊 Audio context state:', AudioEngine.context?.state || 'No context');
        
        // Ensure audio context is unlocked for mobile
        if (AudioEngine.context && AudioEngine.context.state === 'suspended') {
            console.log('🔓 Attempting to unlock audio context for credits');
            const unlocked = await AudioEngine.unlockAudioContext();
            console.log('🔓 Audio unlock result:', unlocked);
            console.log('🔊 Audio context state after unlock:', AudioEngine.context?.state);
        }
        
        // Load agent name from localStorage
        const agentName = localStorage.getItem('agentName') || 'CLASSIFIED';
        this.elements.agentName.textContent = agentName;
        
        // For mobile: add a delay or require user interaction before starting audio-heavy sequence
        const isMobile = window.innerWidth <= 768 || 'ontouchstart' in window;
        if (isMobile && AudioEngine.context?.state === 'suspended') {
            console.log('📱 Mobile detected with suspended audio - adding interaction prompt');
            this.showMobileAudioPrompt();
        } else {
            // Start credits sequence
            this.startCreditsSequence();
        }
    }
    
    showMobileAudioPrompt() {
        console.log('📱 Showing mobile audio interaction prompt');
        
        // Create a temporary overlay prompting user to tap
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: #00ff00;
            font-family: var(--font-mono);
            font-size: var(--text-lg);
            text-align: center;
            padding: var(--space-md);
        `;
        overlay.innerHTML = '<div>TAP TO CONTINUE<br><span style="font-size: var(--text-sm);">Audio requires interaction</span></div>';
        
        const handleInteraction = async (e) => {
            e.preventDefault();
            console.log('📱 User interaction detected - unlocking audio');
            
            // Play a test sound to unlock audio
            AudioEngine.play('beep', { volume: 0.1 });
            
            // Remove overlay
            overlay.remove();
            
            // Remove listeners
            overlay.removeEventListener('click', handleInteraction);
            overlay.removeEventListener('touchstart', handleInteraction);
            
            // Start the credits sequence
            this.startCreditsSequence();
        };
        
        overlay.addEventListener('click', handleInteraction);
        overlay.addEventListener('touchstart', handleInteraction, { passive: false });
        
        document.body.appendChild(overlay);
    }
    
    startCreditsSequence() {
        console.log('🎬 Starting credits sequence with audio crescendo');
        console.log('🔊 Audio context state at sequence start:', AudioEngine.context?.state);
        console.log('🔊 Audio engine loaded:', AudioEngine.loaded);
        
        // For mobile: ensure audio is ready with immediate test sound
        if (window.innerWidth <= 768 || 'ontouchstart' in window) {
            console.log('📱 Mobile detected - playing immediate test sound');
            const testResult = AudioEngine.play('beep', { volume: 0.1 }); // Very quiet test sound
            console.log('📱 Mobile test sound result:', testResult ? 'Playing' : 'Failed');
        }
        
        // Stage 1: Mission complete confirmation (1s delay)
        setTimeout(() => {
            console.log('🎵 Attempting to play success sound...');
            const result = AudioEngine.play('success');
            console.log('✅ Mission complete confirmation result:', result ? 'Playing' : 'Failed');
        }, 1000);
        
        // Stage 2: Debrief section reveal (2s delay)
        setTimeout(() => {
            console.log('🎵 Attempting to play systemReady sound...');
            const result = AudioEngine.play('systemReady');
            console.log('📊 Debrief audio result:', result ? 'Playing' : 'Failed');
            this.animateCreditsSection('.debrief-stats');
            console.log('📊 Debrief section animated');
        }, 2000);
        
        // Stage 3: Special thanks reveal (4s delay)
        setTimeout(() => {
            console.log('🎵 Attempting to play terminalTextBeep sound...');
            const result = AudioEngine.play('terminalTextBeep');
            console.log('🙏 Thanks audio result:', result ? 'Playing' : 'Failed');
            this.animateCreditsSection('.thanks-list');
            console.log('🙏 Special thanks section animated');
        }, 4000);
        
        // Stage 4: Classified information reveal (6s delay)
        setTimeout(() => {
            console.log('🎵 Attempting to play alert sound...');
            const result = AudioEngine.play('alert'); // Dramatic warning sound
            console.log('🔒 Alert audio result:', result ? 'Playing' : 'Failed');
            this.animateCreditsSection('.classified-info');
            console.log('🔒 Classified information revealed');
        }, 6000);
        
        // Stage 5: Audio crescendo and final effects (8s delay)
        setTimeout(() => {
            this.playAudioCrescendo();
            this.addFinalEffects();
            console.log('🎵 Audio crescendo and final effects triggered');
        }, 8000);
        
        // Stage 6: Self-destruct countdown (12s delay)
        setTimeout(() => {
            this.startSelfDestructSequence();
        }, 12000);
    }
    
    animateCreditsSection(selector) {
        const section = document.querySelector(selector);
        if (section) {
            section.style.animation = 'creditsReveal 1s ease-out forwards';
            
            // Add individual item animations
            const items = section.querySelectorAll('.stat-item, .thanks-item, p');
            console.log(`🎬 Animating ${items.length} items in ${selector}`);
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.style.animation = 'dataFlash 0.5s ease-out';
                    const beepResult = AudioEngine.play('beep');
                    console.log(`🔊 Item ${index + 1}/${items.length} beep result:`, beepResult ? 'Playing' : 'Failed');
                }, index * 150);
            });
        }
    }
    
    playAudioCrescendo() {
        console.log('🎵 Starting audio crescendo sequence');
        // Play a sequence of increasingly dramatic sounds
        const crescendoSequence = [
            { sound: 'connectionEstablish', delay: 0 },
            { sound: 'systemReady', delay: 800 },
            { sound: 'success', delay: 1600 },
            { sound: 'terminalTextBeep', delay: 2400 }
        ];
        
        crescendoSequence.forEach(({ sound, delay }) => {
            setTimeout(() => {
                console.log(`🎵 Crescendo: Playing ${sound} at ${delay}ms`);
                const result = AudioEngine.play(sound);
                console.log(`🎵 Crescendo ${sound} result:`, result ? 'Playing' : 'Failed');
            }, delay);
        });
    }
    
    addFinalEffects() {
        // Create dramatic final visual effects
        const screen = document.getElementById('credits-screen');
        
        // Pulse effect
        screen.style.animation = 'finalCreditsEffect 3s ease-in-out infinite';
        
        // Add temporary style for final effect
        const style = document.createElement('style');
        style.textContent = `
            @keyframes finalCreditsEffect {
                0%, 100% { 
                    background: linear-gradient(135deg, #000000 0%, #002200 50%, #000000 100%);
                    transform: scale(1);
                }
                50% { 
                    background: linear-gradient(135deg, #001100 0%, #003300 50%, #001100 100%);
                    transform: scale(1.01);
                }
            }
            
            @keyframes creditsReveal {
                0% { 
                    opacity: 0; 
                    transform: translateY(20px); 
                }
                100% { 
                    opacity: 1; 
                    transform: translateY(0); 
                }
            }
        `;
        document.head.appendChild(style);
        
        // Clean up style after effects
        setTimeout(() => {
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        }, 10000);
    }
    
    startSelfDestructSequence() {
        console.log('💥 Starting self-destruct sequence');
        
        // Update classified info to show countdown
        const classifiedInfo = document.querySelector('.classified-info');
        if (classifiedInfo) {
            let countdown = 10;
            
            const countdownInterval = setInterval(() => {
                classifiedInfo.innerHTML = `
                    <p>This terminal will self-destruct in ${countdown} seconds...</p>
                    <p>Thank you for your service, Agent.</p>
                `;
                
                // Play beep for each second
                AudioEngine.play('beep');
                
                countdown--;
                
                if (countdown < 0) {
                    clearInterval(countdownInterval);
                    classifiedInfo.innerHTML = `
                        <p style="color: #ff0000; font-size: var(--text-lg); animation: syncPulse 0.5s infinite;">
                            TERMINAL LOCKED
                        </p>
                        <p>Mission files archived. Awaiting new assignment.</p>
                    `;
                    
                    // Play final dramatic sound
                    AudioEngine.play('alert');
                    
                    // Show restart button with dramatic effect
                    this.revealRestartButton();
                }
            }, 1000);
        }
    }
    
    revealRestartButton() {
        if (this.elements.restartButton) {
            this.elements.restartButton.style.opacity = '0';
            this.elements.restartButton.style.display = 'flex';
            this.elements.restartButton.style.animation = 'finalButtonReveal 2s ease-out forwards';
            
            // Add button reveal animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes finalButtonReveal {
                    0% { 
                        opacity: 0; 
                        transform: translateY(30px) scale(0.8); 
                    }
                    100% { 
                        opacity: 1; 
                        transform: translateY(0) scale(1); 
                    }
                }
            `;
            document.head.appendChild(style);
            
            console.log('🔄 Restart button revealed');
        }
    }
    
    initializeEventListeners() {
        if (this.elements.restartButton) {
            this.elements.restartButton.addEventListener('click', () => {
                this.restartMission();
            });
            
            // Audio feedback for hover
            this.elements.restartButton.addEventListener('mouseenter', () => {
                AudioEngine.play('beep');
            });
            
            this.elements.restartButton.addEventListener('touchstart', () => {
                AudioEngine.play('beep');
            }, { passive: true });
        }
        
        console.log('🎮 Credits screen event listeners initialized');
    }
    
    restartMission() {
        console.log('🔄 Restarting mission - returning to intro');
        
        AudioEngine.play('success');
        
        // Visual feedback
        this.elements.restartButton.style.background = 'linear-gradient(45deg, #00aa00, #00ff00)';
        this.elements.restartButton.style.boxShadow = '0 0 30px rgba(0, 255, 0, 0.8)';
        
        // Clear localStorage to reset the experience
        localStorage.removeItem('agentName');
        localStorage.removeItem('missionChoice');
        
        // Transition back to wake (restart) after brief delay
        setTimeout(() => {
            window.app.transitionTo(window.app.state.states.WAKE);
        }, 1000);
    }
    
    // Clean up when leaving the screen
    destroy() {
        console.log('🧹 Credits screen cleanup');
        
        // Clean up any active animations or intervals
        const screen = document.getElementById('credits-screen');
        if (screen) {
            screen.style.animation = '';
            screen.style.background = '';
        }
        
        // Remove any added styles
        const addedStyles = document.querySelectorAll('style');
        addedStyles.forEach(style => {
            if (style.textContent.includes('finalCreditsEffect') || 
                style.textContent.includes('creditsReveal') || 
                style.textContent.includes('finalButtonReveal')) {
                if (document.head.contains(style)) {
                    document.head.removeChild(style);
                }
            }
        });
    }
}

export default CreditsScreen;