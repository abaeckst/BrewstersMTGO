/**
 * Briefing Screen Controller - V2 Architecture
 * Handles mission briefing, agent dossier display, and mission acceptance/decline
 * Part of Brewster's MTGO Mission Terminal V2
 */

class BriefingScreen {
    constructor() {
        this.elements = {
            agentName: document.querySelector('.agent-name-display'),
            missionStatus: document.querySelector('.mission-status'),
            acceptButton: document.getElementById('briefing-accept'),
            declineButton: document.getElementById('briefing-decline')
        };
        
        this.initializeEventListeners();
    }
    
    init() {
        console.log('🎭 Initializing briefing screen...');
        
        // Load agent name from localStorage
        const agentName = localStorage.getItem('agentName') || 'CLASSIFIED';
        this.elements.agentName.textContent = agentName;
        
        // Start briefing sequence
        this.startBriefingSequence();
    }
    
    startBriefingSequence() {
        // Stage 1: Classification banner reveal (1s delay)
        setTimeout(() => {
            window.AudioEngine.play('connectionEstablish');
            this.elements.missionStatus.textContent = 'BRIEFING ACTIVE';
            console.log('🔴 Classification banner activated');
        }, 1000);
        
        // Stage 2: Dossier data population (2s delay)
        setTimeout(() => {
            window.AudioEngine.play('terminalTextBeep');
            this.animateDataPopulation();
            console.log('📊 Dossier data population started');
        }, 2000);
        
        // Stage 3: Mission parameters reveal (4s delay)
        setTimeout(() => {
            window.AudioEngine.play('systemReady');
            this.elements.missionStatus.textContent = 'AWAITING CONFIRMATION';
            console.log('⏳ Mission parameters revealed - awaiting response');
        }, 4000);
    }
    
    animateDataPopulation() {
        const details = document.querySelectorAll('.detail-value, .param-value');
        details.forEach((detail, index) => {
            setTimeout(() => {
                detail.style.animation = 'dataFlash 0.5s ease-out';
                window.AudioEngine.play('beep');
            }, index * 200);
        });
    }
    
    initializeEventListeners() {
        // Detect touch support for mobile compatibility
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Mission acceptance button
        this.elements.acceptButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.AudioEngine.play('confirmationBeep');
            this.acceptMission();
        });
        
        // Mission decline button
        this.elements.declineButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.AudioEngine.play('errorBeep');
            this.declineMission();
        });
        
        // Touch support for mobile
        if (hasTouch) {
            this.elements.acceptButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.AudioEngine.play('confirmationBeep');
                this.acceptMission();
            }, { passive: false });
            
            this.elements.declineButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.AudioEngine.play('errorBeep');
                this.declineMission();
            }, { passive: false });
        }
        
        // Audio feedback for hover interactions
        [this.elements.acceptButton, this.elements.declineButton].forEach(button => {
            button.addEventListener('mouseenter', () => {
                window.AudioEngine.play('beep');
            });
            
            button.addEventListener('touchstart', (e) => {
                window.AudioEngine.play('beep');
            }, { passive: true });
        });
        
        console.log('🎮 Briefing screen event listeners initialized with mobile support');
    }
    
    acceptMission() {
        console.log('✅ Mission accepted - transitioning to countdown');
        this.elements.missionStatus.textContent = 'MISSION ACCEPTED';
        
        // Visual feedback
        this.elements.acceptButton.style.background = 'linear-gradient(45deg, #00aa00, #00ff00)';
        this.elements.acceptButton.style.boxShadow = '0 0 30px rgba(0, 255, 0, 0.8)';
        
        // Transition to countdown after brief delay
        setTimeout(() => {
            window.app.transitionTo(window.app.state.states.COUNTDOWN);
        }, 1500);
    }
    
    declineMission() {
        console.log('❌ Mission declined - refreshing page');
        this.elements.missionStatus.textContent = 'MISSION DECLINED';
        
        // Visual feedback
        this.elements.declineButton.style.background = 'linear-gradient(45deg, #aa0000, #ff0000)';
        this.elements.declineButton.style.boxShadow = '0 0 30px rgba(255, 0, 0, 0.8)';
        
        // Refresh page after brief delay
        setTimeout(() => {
            location.reload();
        }, 1500);
    }
    
    // Clean up when leaving the screen
    destroy() {
        console.log('🧹 Briefing screen cleanup');
        // Remove any active animations or intervals if needed
    }
}

export default BriefingScreen;