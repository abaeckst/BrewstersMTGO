/**
 * Credits Screen Controller - V2 Architecture
 * Handles mission completion credits with audio crescendo
 * Part of Brewster's MTGO Mission Terminal V2
 */

class CreditsScreen {
    constructor() {
        this.elements = {
            agentName: document.querySelector('.agent-name-credits'),
            restartButton: document.getElementById('restart-mission')
        };
        
        this.initializeEventListeners();
        console.log('🏆 Credits screen controller initialized');
    }
    
    init() {
        console.log('🏆 Initializing credits screen...');
        
        // Load agent name from localStorage
        const agentName = localStorage.getItem('agentName') || 'CLASSIFIED';
        this.elements.agentName.textContent = agentName;
        
        // Start credits sequence
        this.startCreditsSequence();
    }
    
    startCreditsSequence() {
        console.log('🎬 Starting credits sequence with audio crescendo');
        
        // Stage 1: Mission complete confirmation (1s delay)
        setTimeout(() => {
            window.AudioEngine.play('confirmationBeep');
            console.log('✅ Mission complete confirmation played');
        }, 1000);
        
        // Stage 2: Debrief section reveal (2s delay)
        setTimeout(() => {
            window.AudioEngine.play('systemReady');
            this.animateCreditsSection('.debrief-stats');
            console.log('📊 Debrief section animated');
        }, 2000);
        
        // Stage 3: Special thanks reveal (4s delay)
        setTimeout(() => {
            window.AudioEngine.play('terminalTextBeep');
            this.animateCreditsSection('.thanks-list');
            console.log('🙏 Special thanks section animated');
        }, 4000);
        
        // Stage 4: Classified information reveal (6s delay)
        setTimeout(() => {
            window.AudioEngine.play('errorBeep'); // Dramatic warning sound
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
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.style.animation = 'dataFlash 0.5s ease-out';
                    window.AudioEngine.play('beep');
                }, index * 150);
            });
        }
    }
    
    playAudioCrescendo() {
        // Play a sequence of increasingly dramatic sounds
        const crescendoSequence = [
            { sound: 'connectionEstablish', delay: 0 },
            { sound: 'systemReady', delay: 800 },
            { sound: 'confirmationBeep', delay: 1600 },
            { sound: 'terminalTextBeep', delay: 2400 }
        ];
        
        crescendoSequence.forEach(({ sound, delay }) => {
            setTimeout(() => {
                window.AudioEngine.play(sound);
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
                window.AudioEngine.play('beep');
                
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
                    window.AudioEngine.play('errorBeep');
                    
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
                window.AudioEngine.play('beep');
            });
            
            this.elements.restartButton.addEventListener('touchstart', () => {
                window.AudioEngine.play('beep');
            }, { passive: true });
        }
        
        console.log('🎮 Credits screen event listeners initialized');
    }
    
    restartMission() {
        console.log('🔄 Restarting mission - returning to intro');
        
        window.AudioEngine.play('confirmationBeep');
        
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