/**
 * Declined Screen Controller - V2 Architecture
 * Handles mission declined / honorable discharge sequence
 * Part of Brewster's MTGO Mission Terminal V2
 */

import { AudioEngine } from './audio-engine.js';

class DeclinedScreen {
    constructor() {
        this.elements = {
            agentName: document.querySelector('.agent-name-declined'),
            restartButton: document.getElementById('restart-declined')
        };
        
        this.initializeEventListeners();
        console.log('❌ Declined screen controller initialized');
    }
    
    init() {
        console.log('❌ Initializing declined screen...');
        
        // Load agent name from localStorage
        const agentName = localStorage.getItem('agentName') || 'CLASSIFIED';
        this.elements.agentName.textContent = agentName;
        
        // Start declined sequence
        this.startDeclinedSequence();
    }
    
    startDeclinedSequence() {
        console.log('📄 Starting honorable discharge sequence');
        
        // Stage 1: Discharge confirmation (1s delay)
        setTimeout(() => {
            AudioEngine.play('systemReady');
            console.log('✅ Discharge confirmation played');
        }, 1000);
        
        // Stage 2: Discharge details animation (2s delay)
        setTimeout(() => {
            AudioEngine.play('terminalTextBeep');
            this.animateDischargeDetails();
            console.log('📊 Discharge details animated');
        }, 2000);
        
        // Stage 3: Final message reveal (4s delay)
        setTimeout(() => {
            AudioEngine.play('success');
            this.animateFinalMessage();
            console.log('💬 Final message revealed');
        }, 4000);
        
        
        // Stage 5: Reveal restart option (8s delay)
        setTimeout(() => {
            this.revealRestartOption();
            console.log('🔄 Restart option revealed');
        }, 8000);
    }
    
    animateDischargeDetails() {
        const stats = document.querySelectorAll('.discharge-stats .stat-item');
        stats.forEach((stat, index) => {
            setTimeout(() => {
                stat.style.animation = 'dataFlash 0.5s ease-out';
                AudioEngine.play('beep');
                
            }, index * 200);
        });
    }
    
    animateFinalMessage() {
        const messageContainer = document.querySelector('.final-message');
        if (messageContainer) {
            messageContainer.style.animation = 'messageReveal 1s ease-out forwards';
            
            const paragraphs = messageContainer.querySelectorAll('p');
            paragraphs.forEach((p, index) => {
                setTimeout(() => {
                    p.style.animation = 'textGlow 1s ease-out';
                    AudioEngine.play('beep');
                }, index * 800);
            });
        }
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes messageReveal {
                0% { 
                    opacity: 0; 
                    transform: translateY(20px); 
                }
                100% { 
                    opacity: 1; 
                    transform: translateY(0); 
                }
            }
            
            @keyframes textGlow {
                0%, 100% { 
                    text-shadow: 0 0 5px var(--color-primary); 
                }
                50% { 
                    text-shadow: 0 0 15px var(--color-primary), 0 0 25px var(--color-primary); 
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    
    revealRestartOption() {
        if (this.elements.restartButton) {
            this.elements.restartButton.style.opacity = '0';
            this.elements.restartButton.style.display = 'flex';
            this.elements.restartButton.style.animation = 'restartReveal 1.5s ease-out forwards';
            
            // Add restart reveal animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes restartReveal {
                    0% { 
                        opacity: 0; 
                        transform: translateY(30px) scale(0.9); 
                    }
                    100% { 
                        opacity: 1; 
                        transform: translateY(0) scale(1); 
                    }
                }
            `;
            document.head.appendChild(style);
            
            // Play reveal sound
            AudioEngine.play('systemReady');
        }
    }
    
    initializeEventListeners() {
        if (this.elements.restartButton) {
            this.elements.restartButton.addEventListener('click', () => {
                this.reconsiderMission();
            });
            
            // Audio feedback for hover
            this.elements.restartButton.addEventListener('mouseenter', () => {
                AudioEngine.play('beep');
            });
            
            this.elements.restartButton.addEventListener('touchstart', () => {
                AudioEngine.play('beep');
            }, { passive: true });
        }
        
        console.log('🎮 Declined screen event listeners initialized');
    }
    
    reconsiderMission() {
        console.log('🔄 Reconsidering mission - returning to intro');
        
        AudioEngine.play('success');
        
        // Visual feedback
        this.elements.restartButton.style.background = 'linear-gradient(45deg, #00aa00, #00ff00)';
        this.elements.restartButton.style.boxShadow = '0 0 30px rgba(0, 255, 0, 0.8)';
        this.elements.restartButton.style.color = 'var(--color-primary)';
        this.elements.restartButton.style.borderColor = 'var(--color-primary)';
        
        // Clear localStorage to reset the experience
        localStorage.removeItem('agentName');
        localStorage.removeItem('missionChoice');
        localStorage.removeItem('missionAccepted');
        
        // Add dramatic transition effect
        const screen = document.getElementById('declined-screen');
        screen.style.transition = 'all 1s ease-out';
        screen.style.background = 'linear-gradient(135deg, #002200 0%, #004400 50%, #002200 100%)';
        
        // Transition back to wake state after brief delay for clean restart
        setTimeout(() => {
            if (window.app && window.app.state) {
                console.log('🔄 Transitioning back to wake state for fresh start');
                window.app.transitionTo(window.app.state.states.WAKE);
            } else {
                console.error('❌ window.app or window.app.state not available for declined restart transition');
                location.reload(); // Fallback
            }
        }, 1000);
    }
    
    // Clean up when leaving the screen
    destroy() {
        console.log('🧹 Declined screen cleanup');
        
        // Clean up any active animations
        const screen = document.getElementById('declined-screen');
        if (screen) {
            screen.style.animation = '';
            screen.style.background = '';
            screen.style.transition = '';
        }
        
        // Remove any added styles
        const addedStyles = document.querySelectorAll('style');
        addedStyles.forEach(style => {
            if (style.textContent.includes('messageReveal') || 
                style.textContent.includes('textGlow') || 
                style.textContent.includes('restartReveal')) {
                if (document.head.contains(style)) {
                    document.head.removeChild(style);
                }
            }
        });
    }
}

export default DeclinedScreen;