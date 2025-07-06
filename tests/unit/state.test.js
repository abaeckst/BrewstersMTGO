/**
 * Unit Tests for State Management
 * Testing the AppState class and state transitions
 */

import { AppState } from '../../js/state.js';
import { TestHelpers, MockCinematicEngine } from '../utils/test-helpers.js';

// Mock the AudioEngine
jest.mock('../../js/audio-engine.js', () => ({
    AudioEngine: {
        playStateTransition: jest.fn(),
        playContextualAudio: jest.fn()
    }
}));

describe('AppState', () => {
    let appState;
    let mockCinematicEngine;
    
    beforeEach(() => {
        appState = new AppState();
        mockCinematicEngine = new MockCinematicEngine();
        TestHelpers.createFullMockDOM();
    });
    
    afterEach(() => {
        TestHelpers.cleanup();
    });
    
    describe('Initialization', () => {
        test('should initialize with boot-sequence state', () => {
            expect(appState.current).toBe('boot-sequence');
        });
        
        test('should have initial state in history', () => {
            expect(appState.getHistory()).toEqual(['boot-sequence']);
        });
        
        test('should define all required states', () => {
            const expectedStates = [
                'boot-sequence',
                'auth',
                'soundTest',
                'boot',
                'mission',
                'briefing',
                'countdown',
                'declined',
                'credits'
            ];
            
            expectedStates.forEach(state => {
                expect(Object.values(appState.states)).toContain(state);
            });
        });
    });
    
    describe('State Transitions', () => {
        test('should transition from boot-sequence to auth', async () => {
            const result = await appState.transition('auth');
            
            expect(result).toBe(true);
            expect(appState.current).toBe('auth');
            expect(appState.getHistory()).toEqual(['boot-sequence', 'auth']);
        });
        
        test('should transition from auth to mission', async () => {
            await appState.transition('auth');
            const result = await appState.transition('mission');
            
            expect(result).toBe(true);
            expect(appState.current).toBe('mission');
        });
        
        test('should transition from mission to briefing', async () => {
            await appState.transition('auth');
            await appState.transition('mission');
            const result = await appState.transition('briefing');
            
            expect(result).toBe(true);
            expect(appState.current).toBe('briefing');
        });
        
        test('should transition from mission to declined', async () => {
            await appState.transition('auth');
            await appState.transition('mission');
            const result = await appState.transition('declined');
            
            expect(result).toBe(true);
            expect(appState.current).toBe('declined');
        });
        
        test('should transition from briefing to countdown', async () => {
            await appState.transition('auth');
            await appState.transition('mission');
            await appState.transition('briefing');
            const result = await appState.transition('countdown');
            
            expect(result).toBe(true);
            expect(appState.current).toBe('countdown');
        });
        
        test('should transition from countdown to credits', async () => {
            await appState.transition('auth');
            await appState.transition('mission');
            await appState.transition('briefing');
            await appState.transition('countdown');
            const result = await appState.transition('credits');
            
            expect(result).toBe(true);
            expect(appState.current).toBe('credits');
        });
        
        test('should reject invalid state transitions', async () => {
            const result = await appState.transition('credits');
            
            expect(result).toBe(false);
            expect(appState.current).toBe('boot-sequence');
        });
        
        test('should not transition to non-existent state', async () => {
            const result = await appState.transition('invalid-state');
            
            expect(result).toBe(false);
            expect(appState.current).toBe('boot-sequence');
        });
    });
    
    describe('State Validation', () => {
        test('should validate boot-sequence to auth transition', () => {
            expect(appState.isValidTransition('boot-sequence', 'auth')).toBe(true);
        });
        
        test('should validate auth to mission transition', () => {
            expect(appState.isValidTransition('auth', 'mission')).toBe(true);
        });
        
        test('should validate mission to briefing transition', () => {
            expect(appState.isValidTransition('mission', 'briefing')).toBe(true);
        });
        
        test('should validate mission to declined transition', () => {
            expect(appState.isValidTransition('mission', 'declined')).toBe(true);
        });
        
        test('should invalidate boot-sequence to mission transition', () => {
            expect(appState.isValidTransition('boot-sequence', 'mission')).toBe(false);
        });
        
        test('should invalidate auth to credits transition', () => {
            expect(appState.isValidTransition('auth', 'credits')).toBe(false);
        });
        
        test('should handle undefined transitions', () => {
            expect(appState.isValidTransition('unknown', 'auth')).toBe(false);
        });
    });
    
    describe('Event Listeners', () => {
        test('should register state change listeners', () => {
            const listener = jest.fn();
            appState.on('stateChange', listener);
            
            expect(appState.listeners.get('stateChange')).toContain(listener);
        });
        
        test('should notify listeners on state change', async () => {
            const listener = jest.fn();
            appState.on('stateChange', listener);
            
            await appState.transition('auth');
            
            expect(listener).toHaveBeenCalledWith({
                from: 'boot-sequence',
                to: 'auth'
            });
        });
        
        test('should support multiple listeners', async () => {
            const listener1 = jest.fn();
            const listener2 = jest.fn();
            
            appState.on('stateChange', listener1);
            appState.on('stateChange', listener2);
            
            await appState.transition('auth');
            
            expect(listener1).toHaveBeenCalled();
            expect(listener2).toHaveBeenCalled();
        });
        
        test('should remove listeners', () => {
            const listener = jest.fn();
            appState.on('stateChange', listener);
            appState.off('stateChange', listener);
            
            expect(appState.listeners.get('stateChange')).not.toContain(listener);
        });
    });
    
    describe('Screen Transitions', () => {
        test('should handle screen transitions with cinematic engine', async () => {
            const transitionSpy = jest.spyOn(mockCinematicEngine, 'transitionScreens');
            
            await appState.transition('auth', mockCinematicEngine);
            
            expect(transitionSpy).toHaveBeenCalledWith('boot-sequence', 'auth');
        });
        
        test('should fallback to basic screen switching when cinematic engine fails', async () => {
            const faultyEngine = {
                transitionScreens: jest.fn().mockRejectedValue(new Error('Animation failed'))
            };
            
            const updateSpy = jest.spyOn(appState, 'updateScreenVisibility');
            
            await appState.transition('auth', faultyEngine);
            
            expect(updateSpy).toHaveBeenCalledWith('boot-sequence', 'auth');
        });
        
        test('should update screen visibility correctly', () => {
            const bootScreen = document.getElementById('boot-sequence-screen');
            const authScreen = document.getElementById('auth-screen');
            
            // Initial state
            expect(bootScreen.classList.contains('active')).toBe(true);
            expect(authScreen.classList.contains('hidden')).toBe(true);
            
            appState.updateScreenVisibility('boot-sequence', 'auth');
            
            // After transition
            expect(bootScreen.classList.contains('active')).toBe(false);
            expect(bootScreen.classList.contains('hidden')).toBe(true);
            expect(authScreen.classList.contains('hidden')).toBe(false);
            expect(authScreen.classList.contains('active')).toBe(true);
        });
        
        test('should handle missing screen elements gracefully', () => {
            // Remove screen elements
            document.getElementById('auth-screen').remove();
            
            expect(() => {
                appState.updateScreenVisibility('boot-sequence', 'auth');
            }).not.toThrow();
        });
    });
    
    describe('State History', () => {
        test('should track state history correctly', async () => {
            await appState.transition('auth');
            await appState.transition('mission');
            await appState.transition('briefing');
            
            expect(appState.getHistory()).toEqual([
                'boot-sequence',
                'auth',
                'mission',
                'briefing'
            ]);
        });
        
        test('should return a copy of history to prevent mutation', () => {
            const history = appState.getHistory();
            history.push('invalid-state');
            
            expect(appState.getHistory()).not.toContain('invalid-state');
        });
    });
    
    describe('Reset Functionality', () => {
        test('should reset to initial state', async () => {
            await appState.transition('auth');
            await appState.transition('mission');
            
            appState.reset();
            
            expect(appState.current).toBe('intro');
            expect(appState.getHistory()).toEqual(['intro']);
        });
    });
    
    describe('Audio Integration', () => {
        test('should play state transition audio', async () => {
            const { AudioEngine } = require('../../js/audio-engine.js');
            
            await appState.transition('auth');
            
            expect(AudioEngine.playStateTransition).toHaveBeenCalledWith('boot-sequence', 'auth');
        });
        
        test('should play contextual audio for new state', async () => {
            const { AudioEngine } = require('../../js/audio-engine.js');
            
            await appState.transition('auth');
            
            expect(AudioEngine.playContextualAudio).toHaveBeenCalledWith('auth');
        });
    });
    
    describe('Complete User Journey', () => {
        test('should complete successful mission acceptance flow', async () => {
            const listener = jest.fn();
            appState.on('stateChange', listener);
            
            // Complete the full acceptance flow
            await appState.transition('auth');
            await appState.transition('mission');
            await appState.transition('briefing');
            await appState.transition('countdown');
            await appState.transition('credits');
            
            expect(appState.current).toBe('credits');
            expect(listener).toHaveBeenCalledTimes(5);
            
            const finalHistory = appState.getHistory();
            expect(finalHistory).toEqual([
                'boot-sequence',
                'auth',
                'mission',
                'briefing',
                'countdown',
                'credits'
            ]);
        });
        
        test('should complete mission decline flow', async () => {
            const listener = jest.fn();
            appState.on('stateChange', listener);
            
            // Complete the decline flow
            await appState.transition('auth');
            await appState.transition('mission');
            await appState.transition('declined');
            
            expect(appState.current).toBe('declined');
            expect(listener).toHaveBeenCalledTimes(3);
            
            const finalHistory = appState.getHistory();
            expect(finalHistory).toEqual([
                'boot-sequence',
                'auth',
                'mission',
                'declined'
            ]);
        });
    });
    
    describe('Error Handling', () => {
        test('should handle transition with null cinematic engine', async () => {
            const result = await appState.transition('auth', null);
            
            expect(result).toBe(true);
            expect(appState.current).toBe('auth');
        });
        
        test('should handle transition with undefined cinematic engine', async () => {
            const result = await appState.transition('auth', undefined);
            
            expect(result).toBe(true);
            expect(appState.current).toBe('auth');
        });
        
        test('should handle listener errors gracefully', async () => {
            const faultyListener = jest.fn().mockImplementation(() => {
                throw new Error('Listener error');
            });
            
            appState.on('stateChange', faultyListener);
            
            expect(async () => {
                await appState.transition('auth');
            }).not.toThrow();
        });
    });
});