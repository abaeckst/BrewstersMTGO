// BREWSTER'S MTGO MISSION TERMINAL - State Machine

import { AudioEngine } from './audio-engine.js';

export const StateMachine = {
    // State definitions
    states: {
        loading: {
            name: 'loading',
            canTransitionTo: ['intro', 'auth', 'boot']
        },
        intro: {
            name: 'intro',
            canTransitionTo: ['auth']
        },
        auth: {
            name: 'auth',
            canTransitionTo: ['boot']
        },
        boot: {
            name: 'boot',
            canTransitionTo: ['mission']
        },
        mission: {
            name: 'mission',
            canTransitionTo: ['mission-declined', 'clearance-verification', 'briefing', 'credits']
        },
        'mission-declined': {
            name: 'mission-declined',
            canTransitionTo: ['payout-processing']
        },
        'payout-processing': {
            name: 'payout-processing',
            canTransitionTo: ['credits']
        },
        'clearance-verification': {
            name: 'clearance-verification',
            canTransitionTo: ['downloading-briefing']
        },
        'downloading-briefing': {
            name: 'downloading-briefing',
            canTransitionTo: ['briefing']
        },
        briefing: {
            name: 'briefing',
            canTransitionTo: ['countdown']
        },
        countdown: {
            name: 'countdown',
            canTransitionTo: ['credits']
        },
        credits: {
            name: 'credits',
            canTransitionTo: []
        }
    },
    
    // Current state
    currentState: 'loading',
    previousState: null,
    
    // State history
    history: [],
    
    // Transition callbacks
    transitionCallbacks: [],
    
    // App state reference
    appState: null,
    
    // Initialize state machine
    init(appState) {
        this.appState = appState;
        this.history.push(this.currentState);
        console.log('🎮 State machine initialized');
    },
    
    // Register transition callback
    onTransition(callback) {
        this.transitionCallbacks.push(callback);
    },
    
    // Transition to new state
    transition(newState) {
        const current = this.states[this.currentState];
        const next = this.states[newState];
        
        console.log('Attempting transition:', this.currentState, '→', newState);
        console.log('Available states:', Object.keys(this.states));
        
        // Validate transition
        if (!next) {
            console.error(`Invalid state: ${newState}`);
            return false;
        }
        
        if (current && !current.canTransitionTo.includes(newState)) {
            console.warn(`Invalid transition: ${this.currentState} → ${newState}`);
            return false;
        }
        
        // Perform transition
        this.previousState = this.currentState;
        this.currentState = newState;
        this.history.push(newState);
        
            // Play state transition sound
        this.playTransitionSound(newState);
        
        // Notify callbacks
        this.transitionCallbacks.forEach(callback => {
            callback(newState, this.previousState);
        });
        
        console.log(`✓ State transition: ${this.previousState} → ${newState}`);
        return true;
    },
    
    // Get current state
    getState() {
        return this.currentState;
    },
    
    // Check if in specific state
    isInState(state) {
        return this.currentState === state;
    },
    
    // Can transition to state
    canTransitionTo(state) {
        const current = this.states[this.currentState];
        return current && current.canTransitionTo.includes(state);
    },
    
    // Get state history
    getHistory() {
        return [...this.history];
    },
    
    // Reset state machine
    reset() {
        this.currentState = 'loading';
        this.previousState = null;
        this.history = ['loading'];
        console.log('🔄 State machine reset');
    },
    
    // Play appropriate sound for state transition
    playTransitionSound(newState) {
        switch(newState) {
            case 'auth':
                AudioEngine.play('stateTransition');
                break;
            case 'boot':
                AudioEngine.play('bootUp');
                break;
            case 'mission':
                AudioEngine.play('alert');
                break;
            case 'mission-declined':
                AudioEngine.playSystemStatusChange('warning');
                break;
            case 'briefing':
                AudioEngine.play('success');
                break;
            case 'countdown':
                AudioEngine.play('missionThemeShort');
                break;
            case 'credits':
                AudioEngine.play('disconnect');
                break;
            default:
                AudioEngine.play('stateTransition');
        }
    }
};