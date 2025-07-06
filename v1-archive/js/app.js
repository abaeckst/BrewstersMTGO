// BREWSTER'S MTGO MISSION TERMINAL - Main Application

import { AudioEngine } from './audio-engine.js';
import { StateMachine } from './state-machine.js';
import { SequenceController } from './sequences.js';

// Application State
const appState = {
    agentName: '',
    accessCode: '',
    missionAccepted: false,
    audioEnabled: false,
    currentScreen: 'loading'
};

// DOM Elements Cache
const elements = {
    screens: {},
    inputs: {},
    buttons: {},
    displays: {}
};

// Initialize Application
async function init() {
    console.log('🚀 Initializing Brewster\'s MTGO Mission Terminal...');
    
    // Cache DOM elements
    cacheElements();
    console.log('📦 DOM elements cached:', elements);
    
    // Initialize subsystems
    await AudioEngine.init();
    StateMachine.init(appState);
    SequenceController.init(elements, appState);
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up hidden reset shortcut
    setupResetShortcut();
    
    // Check for saved agent data
    loadSavedData();
    
    // Start initial sequence
    setTimeout(() => {
        console.log('🎬 Starting initial sequence...');
        console.log('Agent name:', appState.agentName);
        
        // localStorage cleared for testing - remove this line in production
        // localStorage.clear();
        
        if (appState.agentName) {
            // Returning agent - skip to boot sequence
            console.log('➡️ Transitioning to boot');
            StateMachine.transition('boot');
        } else {
            // New agent - show intro sequence
            console.log('➡️ Transitioning to intro');
            StateMachine.transition('intro');
        }
    }, 1500);
}

// Cache DOM Elements
function cacheElements() {
    // Screens
    elements.screens = {
        loading: document.getElementById('loading-screen'),
        intro: document.getElementById('intro-screen'),
        auth: document.getElementById('auth-screen'),
        boot: document.getElementById('boot-screen'),
        mission: document.getElementById('mission-screen'),
        'mission-declined': document.getElementById('mission-declined-screen'),
        'payout-processing': document.getElementById('payout-processing-screen'),
        'clearance-verification': document.getElementById('clearance-verification-screen'),
        'downloading-briefing': document.getElementById('downloading-briefing-screen'),
        briefing: document.getElementById('briefing-screen'),
        countdown: document.getElementById('countdown-screen'),
        credits: document.getElementById('credits-screen')
    };
    
    // Inputs
    elements.inputs = {
        agentName: document.getElementById('agent-name'),
        accessCode: document.getElementById('access-code')
    };
    
    // Buttons
    elements.buttons = {
        authSubmit: document.getElementById('auth-submit'),
        denyMission: document.getElementById('deny-button'),
        acceptMission: document.getElementById('accept-button')
    };
    
    // Display elements
    elements.displays = {
        authError: document.getElementById('auth-error'),
        briefingPrompt: document.getElementById('briefing-prompt'),
        terminalOutput: document.getElementById('terminal-output'),
        bootText: document.getElementById('boot-text'),
        welcomeText: document.querySelector('.welcome-text'),
        terminalWelcome: document.querySelector('.terminal-welcome')
    };
    
    // Legacy overlays - now using screen-based system
    elements.overlays = {};
}

// Set Up Event Listeners
function setupEventListeners() {
    // Authentication form with enhanced feedback
    elements.inputs.agentName.addEventListener('input', validateAuthForm);
    elements.inputs.accessCode.addEventListener('input', validateAuthForm);
    
    // Debug auth button
    console.log('Auth submit button:', elements.buttons.authSubmit);
    if (elements.buttons.authSubmit) {
        elements.buttons.authSubmit.addEventListener('click', handleAuthentication);
        console.log('✅ Auth submit event listener added');
    } else {
        console.error('❌ Auth submit button not found!');
    }
    
    // Enhanced input interactions
    elements.inputs.agentName.addEventListener('focus', () => handleInputFocus('agentName'));
    elements.inputs.agentName.addEventListener('blur', () => handleInputBlur('agentName'));
    elements.inputs.accessCode.addEventListener('focus', () => handleInputFocus('accessCode'));
    elements.inputs.accessCode.addEventListener('blur', () => handleInputBlur('accessCode'));
    
    // No keystroke sounds for cleaner experience
    
    // Enter key support for auth form
    elements.inputs.accessCode.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !elements.buttons.authSubmit.disabled) {
            handleAuthentication();
        }
    });
    
    
    // Enhanced Mission choice buttons - Touch/Click Support
    setupMissionButtonListeners();
    
    // Keyboard input for Y/N prompt
    document.addEventListener('keypress', handleKeyboardInput);
}

// Setup Mission Button Listeners
function setupMissionButtonListeners() {
    // Get button elements when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        const acceptButton = document.getElementById('accept-button');
        const declineButton = document.getElementById('decline-button');
        
        if (acceptButton) {
            acceptButton.addEventListener('click', () => {
                if (sequences.missionInputEnabled) {
                    console.log('🎯 Accept button clicked - ACCEPT MISSION');
                    AudioEngine.play('success');
                    sequences.missionInputEnabled = false; // Prevent multiple inputs
                    handleMissionChoice(true); // true = accept
                }
            });
            console.log('✅ Accept button event listener added');
        }
        
        if (declineButton) {
            declineButton.addEventListener('click', () => {
                if (sequences.missionInputEnabled) {
                    console.log('🚀 Decline button clicked - HONORABLE DISCHARGE');
                    AudioEngine.play('terminalBeep');
                    sequences.missionInputEnabled = false; // Prevent multiple inputs
                    handleMissionChoice(false); // false = decline
                }
            });
            console.log('✅ Decline button event listener added');
        }
    });
    
    // Also set up the listeners immediately if elements already exist
    const acceptButton = document.getElementById('accept-button');
    const declineButton = document.getElementById('decline-button');
    
    if (acceptButton) {
        acceptButton.addEventListener('click', () => {
            if (sequences.missionInputEnabled) {
                console.log('🎯 Accept button clicked - ACCEPT MISSION');
                AudioEngine.play('success');
                sequences.missionInputEnabled = false; // Prevent multiple inputs
                handleMissionChoice(true); // true = accept
            }
        });
        console.log('✅ Accept button event listener added (immediate)');
    }
    
    if (declineButton) {
        declineButton.addEventListener('click', () => {
            if (sequences.missionInputEnabled) {
                console.log('🚀 Decline button clicked - HONORABLE DISCHARGE');
                AudioEngine.play('terminalBeep');
                sequences.missionInputEnabled = false; // Prevent multiple inputs
                handleMissionChoice(false); // false = decline
            }
        });
        console.log('✅ Decline button event listener added (immediate)');
    }
}

// Enhanced Input Focus Handling
function handleInputFocus(inputType) {
    const input = inputType === 'agentName' ? elements.inputs.agentName : elements.inputs.accessCode;
    input.classList.add('input-focused');
    
    // Update status indicators
    updateInputStatus(inputType, 'active');
    
    // Minimal audio feedback
    AudioEngine.play('beep', { volume: 0.1 });
}

// Enhanced Input Blur Handling
function handleInputBlur(inputType) {
    const input = inputType === 'agentName' ? elements.inputs.agentName : elements.inputs.accessCode;
    input.classList.remove('input-focused');
    
    // Update status indicators
    updateInputStatus(inputType, 'inactive');
    
    // No audio on blur to reduce noise
}

// Update Input Status Indicators (simplified - no status panel)
function updateInputStatus(inputType, status) {
    // Status indicators removed for cleaner interface
    console.log(`Input ${inputType} status: ${status}`);
}

// Enhanced Validate Authentication Form
function validateAuthForm() {
    const agentName = elements.inputs.agentName.value.trim();
    const accessCode = elements.inputs.accessCode.value.trim();
    
    // Update button state
    const isValid = agentName.length >= 2 && accessCode.length >= 4;
    elements.buttons.authSubmit.disabled = !isValid;
    
    // Update visual feedback
    updateFormValidationFeedback(agentName, accessCode, isValid);
}

// Update Form Validation Feedback
function updateFormValidationFeedback(agentName, accessCode, isValid) {
    // Update input validation states
    const agentInput = elements.inputs.agentName;
    const codeInput = elements.inputs.accessCode;
    
    // Agent name validation feedback
    if (agentName.length === 0) {
        agentInput.classList.remove('input-valid', 'input-invalid');
    } else if (agentName.length >= 2) {
        agentInput.classList.add('input-valid');
        agentInput.classList.remove('input-invalid');
    } else {
        agentInput.classList.add('input-invalid');
        agentInput.classList.remove('input-valid');
    }
    
    // Access code validation feedback
    if (accessCode.length === 0) {
        codeInput.classList.remove('input-valid', 'input-invalid');
    } else if (accessCode.length >= 4) {
        codeInput.classList.add('input-valid');
        codeInput.classList.remove('input-invalid');
    } else {
        codeInput.classList.add('input-invalid');
        codeInput.classList.remove('input-valid');
    }
    
    // Update button appearance
    const submitButton = elements.buttons.authSubmit;
    if (isValid) {
        submitButton.classList.add('button-ready');
        submitButton.classList.remove('button-disabled');
    } else {
        submitButton.classList.add('button-disabled');
        submitButton.classList.remove('button-ready');
    }
}

// Handle Authentication
async function handleAuthentication() {
    const agentName = elements.inputs.agentName.value.trim().toUpperCase();
    const accessCode = elements.inputs.accessCode.value.trim().toUpperCase();
    
    // Simple audio feedback
    AudioEngine.play('beep', { volume: 0.2 });
    
    // Validate access code (placeholder validation)
    if (validateAccessCode(accessCode)) {
        // Save agent data
        appState.agentName = agentName;
        appState.accessCode = accessCode;
        saveAgentData();
        
        // Agent name stored in state (display element was removed for clean UI)
        
        // Simple success audio
        AudioEngine.play('success', { volume: 0.3 });
        
        // Transition to boot sequence
        await SequenceController.typeText(elements.displays.authError, 'ACCESS GRANTED', 50);
        setTimeout(() => {
            StateMachine.transition('boot');
        }, 1000);
    } else {
        // Show error with simple audio feedback
        elements.displays.authError.textContent = 'INVALID ACCESS CODE';
        elements.displays.authError.classList.remove('hidden');
        elements.inputs.accessCode.classList.add('animate-flash');
        
        // Simple error audio
        AudioEngine.play('alert', { volume: 0.2 });
        
        setTimeout(() => {
            elements.inputs.accessCode.classList.remove('animate-flash');
        }, 1000);
    }
}

// Validate Access Code
function validateAccessCode(code) {
    // Placeholder validation - accept any code with 4+ characters
    // In production, this would validate against actual codes
    return code.length >= 4;
}


// Handle Keyboard Input
function handleKeyboardInput(e) {
    const key = e.key.toLowerCase();
    const currentState = StateMachine.getCurrentState();
    
    // Mission screen keyboard commands disabled - now using touch/click interface
    // Keyboard A/M commands removed in favor of progressive button reveal and touch interface
}

// Handle Mission Choice
async function handleMissionChoice(accepted) {
    appState.missionAccepted = accepted;
    
    // Play sound
    AudioEngine.play('terminalBeep');
    
    // Transition to appropriate state
    if (accepted) {
        StateMachine.transition('clearance-verification');
    } else {
        StateMachine.transition('mission-declined');
    }
}

// Load Saved Agent Data
function loadSavedData() {
    const savedName = localStorage.getItem('agentName');
    const savedCode = localStorage.getItem('accessCode');
    
    if (savedName && savedCode) {
        appState.agentName = savedName;
        appState.accessCode = savedCode;
        // agentDisplayName element was removed - just store in state
        console.log('Loaded saved agent:', savedName);
    }
}

// Save Agent Data
function saveAgentData() {
    localStorage.setItem('agentName', appState.agentName);
    localStorage.setItem('accessCode', appState.accessCode);
}

// Setup Reset Shortcut (Ctrl+Shift+R + Mobile Reset)
function setupResetShortcut() {
    // Desktop reset shortcut
    document.addEventListener('keydown', (e) => {
        // Check for Ctrl+Shift+R
        if (e.ctrlKey && e.shiftKey && e.key === 'R') {
            e.preventDefault(); // Prevent browser's hard refresh
            performReset();
        }
    });
    
    // Mobile reset sequence (5 taps in bottom-right corner)
    let tapCount = 0;
    let resetTimer = null;
    
    document.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        const rightCorner = window.innerWidth - 100;
        const bottomCorner = window.innerHeight - 100;
        
        if (touch.clientX > rightCorner && touch.clientY > bottomCorner) {
            tapCount++;
            console.log(`🔄 Reset tap ${tapCount}/5`);
            
            if (tapCount === 1) {
                resetTimer = setTimeout(() => { 
                    tapCount = 0; 
                    console.log('🔄 Reset sequence timeout - cleared');
                }, 2000);
            }
            
            if (tapCount === 5) {
                clearTimeout(resetTimer);
                console.log('🔄 Mobile reset sequence activated');
                performReset();
            }
        }
    });
    
    // Reset function (shared by desktop and mobile)
    function performReset() {
        // Clear all localStorage
        localStorage.clear();
        console.log('🔄 LocalStorage cleared - Resetting application...');
        
        // Show quick feedback
        document.body.style.filter = 'brightness(2)';
        setTimeout(() => {
            document.body.style.filter = '';
            // Reload the page
            window.location.reload();
        }, 200);
    }
}

// Handle State Transitions
StateMachine.onTransition((newState, oldState) => {
    console.log(`📍 State transition: ${oldState} → ${newState}`);
    
    // Update current screen
    appState.currentScreen = newState;
    
    // Hide all screens
    Object.values(elements.screens).forEach(screen => {
        if (screen) {
            screen.classList.remove('active');
        }
    });
    
    // Show new screen
    if (elements.screens[newState]) {
        elements.screens[newState].classList.add('active');
    }
    
    // Run screen-specific initialization
    switch (newState) {
        case 'intro':
            SequenceController.runIntroSequence();
            break;
        case 'auth':
            SequenceController.runAuthFormReveal();
            break;
        case 'boot':
            SequenceController.runBootSequence();
            break;
        case 'mission':
            SequenceController.initMissionScreen();
            break;
        case 'mission-declined':
            SequenceController.runMissionDeclinedSequence();
            break;
        case 'payout-processing':
            SequenceController.runPayoutProcessingSequence();
            break;
        case 'clearance-verification':
            SequenceController.runClearanceVerificationSequence();
            break;
        case 'downloading-briefing':
            SequenceController.runDownloadingBriefingSequence();
            break;
        case 'briefing':
            SequenceController.showBriefing();
            break;
        case 'countdown':
            SequenceController.startCountdown();
            break;
        case 'credits':
            SequenceController.runCreditsSequence();
            break;
    }
});

// Error Handling
window.addEventListener('error', (e) => {
    console.error('❌ Application error:', e.error);
});

// Start application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Export for debugging
window.BrewstersMTGO = {
    state: appState,
    audio: AudioEngine,
    stateMachine: StateMachine,
    sequences: SequenceController
};