/**
 * Unit Tests for MissionScreen
 * Testing mission selection interface, animations, and user interactions
 */

import { MissionScreen } from '../../js/mission-screen.js';
import { TestHelpers } from '../utils/test-helpers.js';

// Mock AudioEngine
jest.mock('../../js/audio-engine.js', () => ({
    AudioEngine: {
        play: jest.fn().mockResolvedValue(undefined)
    }
}));

describe('MissionScreen', () => {
    let missionScreen;
    let mockScreen;
    
    beforeEach(() => {
        // Setup localStorage mock
        global.localStorage = {
            getItem: jest.fn((key) => {
                if (key === 'agentName') return 'Test Agent';
                return null;
            }),
            setItem: jest.fn(),
            removeItem: jest.fn()
        };
        
        // Setup window globals
        global.window.appState = {
            states: {
                BRIEFING: 'briefing',
                DECLINED: 'declined'
            },
            transition: jest.fn()
        };
        
        global.window.app = {
            cinematic: {
                transitionScreens: jest.fn()
            }
        };
        
        // Create mission screen DOM structure
        TestHelpers.createFullMockDOM();
        mockScreen = document.getElementById('mission-screen');
        mockScreen.innerHTML = `
            <div class="transmission-detection">
                <div class="signal-lock">SIGNAL LOCK: SEARCHING...</div>
            </div>
            <div class="signal-bars">
                <div class="bar" data-bar="1"></div>
                <div class="bar" data-bar="2"></div>
                <div class="bar" data-bar="3"></div>
                <div class="bar" data-bar="4"></div>
                <div class="bar" data-bar="5"></div>
            </div>
            <div class="personal-communication">
                <div class="personal-message"></div>
            </div>
            <div class="mission-choices">
                <button class="mission-button accept-button">Accept Mission</button>
                <button class="mission-button decline-button">Decline Mission</button>
            </div>
        `;
        
        missionScreen = new MissionScreen();
    });
    
    afterEach(() => {
        TestHelpers.cleanup();
        jest.clearAllMocks();
    });
    
    describe('Initialization', () => {
        test('should initialize with correct default state', () => {
            expect(missionScreen.signalWaveInterval).toBeNull();
            expect(missionScreen.currentSignalBar).toBe(0);
            expect(missionScreen.missionInputEnabled).toBe(false);
            expect(missionScreen.agentName).toBe('Test Agent');
        });
        
        test('should use default agent name when localStorage is empty', () => {
            localStorage.getItem.mockReturnValue(null);
            
            const newMissionScreen = new MissionScreen();
            
            expect(newMissionScreen.agentName).toBe('OPERATIVE');
        });
        
        test('should setup personal message with agent name', () => {
            expect(missionScreen.personalMessageText).toContain('OPERATIVE Test Agent');
            expect(missionScreen.personalMessageText).toContain('OPERATION: GOBLIN SURPRISE');
            expect(missionScreen.personalMessageText).toContain('MISSIONS COMPLETED: 173');
        });
    });
    
    describe('Screen Initialization', () => {
        test('should complete full initialization sequence', async () => {
            const resetSpy = jest.spyOn(missionScreen, 'reset');
            const initSignalDetectionSpy = jest.spyOn(missionScreen, 'initSignalDetection');
            const initPersonalCommunicationSpy = jest.spyOn(missionScreen, 'initPersonalCommunication');
            const initMissionChoicesSpy = jest.spyOn(missionScreen, 'initMissionChoices');
            
            await missionScreen.init();
            
            expect(resetSpy).toHaveBeenCalled();
            expect(initSignalDetectionSpy).toHaveBeenCalled();
            expect(initPersonalCommunicationSpy).toHaveBeenCalled();
            expect(initMissionChoicesSpy).toHaveBeenCalled();
            expect(missionScreen.missionInputEnabled).toBe(true);
        });
        
        test('should handle missing screen elements gracefully', async () => {
            document.getElementById('mission-screen').innerHTML = '';
            
            await expect(missionScreen.init()).resolves.not.toThrow();
        });
    });
    
    describe('Signal Detection', () => {
        test('should start and stop signal wave animation', async () => {
            const signalBars = mockScreen.querySelectorAll('.signal-bars .bar');
            const transmissionDetection = mockScreen.querySelector('.transmission-detection');
            
            const startSignalWaveSpy = jest.spyOn(missionScreen, 'startSignalWave');
            const stopSignalWaveSpy = jest.spyOn(missionScreen, 'stopSignalWave');
            
            // Use fake timers for controlled timing
            jest.useFakeTimers();
            
            const initPromise = missionScreen.initSignalDetection(signalBars, transmissionDetection);
            
            expect(startSignalWaveSpy).toHaveBeenCalledWith(signalBars);
            
            // Fast-forward through the detection phase
            jest.advanceTimersByTime(3000);
            
            expect(stopSignalWaveSpy).toHaveBeenCalledWith(signalBars);
            
            // Complete the sequence
            jest.advanceTimersByTime(1200);
            await initPromise;
            
            const { AudioEngine } = require('../../js/audio-engine.js');
            expect(AudioEngine.play).toHaveBeenCalledWith('connectionEstablish');
            expect(AudioEngine.play).toHaveBeenCalledWith('success');
            
            jest.useRealTimers();
        });
        
        test('should update signal lock status', async () => {
            const signalBars = mockScreen.querySelectorAll('.signal-bars .bar');
            const transmissionDetection = mockScreen.querySelector('.transmission-detection');
            
            jest.useFakeTimers();
            
            const initPromise = missionScreen.initSignalDetection(signalBars, transmissionDetection);
            jest.advanceTimersByTime(4200);
            await initPromise;
            
            const signalLock = transmissionDetection.querySelector('.signal-lock');
            expect(signalLock.textContent).toBe('SIGNAL LOCK: ESTABLISHED');
            expect(signalLock.classList.contains('phosphor-glow-active')).toBe(true);
            
            jest.useRealTimers();
        });
        
        test('should animate signal bars in sequence', () => {
            const signalBars = mockScreen.querySelectorAll('.signal-bars .bar');
            
            missionScreen.startSignalWave(signalBars);
            
            // Check initial state
            expect(signalBars[0].classList.contains('bouncing')).toBe(true);
            expect(missionScreen.signalWaveInterval).not.toBeNull();
            
            // Simulate interval progression
            jest.useFakeTimers();
            jest.advanceTimersByTime(250);
            
            expect(signalBars[0].classList.contains('bouncing')).toBe(false);
            expect(signalBars[1].classList.contains('bouncing')).toBe(true);
            
            jest.useRealTimers();
        });
        
        test('should lock signal bars when stopped', () => {
            const signalBars = mockScreen.querySelectorAll('.signal-bars .bar');
            
            missionScreen.startSignalWave(signalBars);
            missionScreen.stopSignalWave(signalBars);
            
            expect(missionScreen.signalWaveInterval).toBeNull();
            
            signalBars.forEach(bar => {
                expect(bar.classList.contains('bouncing')).toBe(false);
                expect(bar.classList.contains('locked')).toBe(true);
                expect(bar.style.opacity).toBe('1');
                expect(bar.style.background).toBe('var(--color-primary)');
            });
        });
    });
    
    describe('Personal Communication', () => {
        test('should type personal message with audio', async () => {
            const messageElement = mockScreen.querySelector('.personal-message');
            const container = mockScreen.querySelector('.personal-communication');
            
            const typeTextWithAudioSpy = jest.spyOn(missionScreen, 'typeTextWithAudio');
            
            await missionScreen.initPersonalCommunication(messageElement, container);
            
            expect(typeTextWithAudioSpy).toHaveBeenCalledWith(
                messageElement,
                missionScreen.personalMessageText,
                40
            );
            
            expect(container.classList.contains('phosphor-glow-active')).toBe(true);
            
            const { AudioEngine } = require('../../js/audio-engine.js');
            expect(AudioEngine.play).toHaveBeenCalledWith('alert');
        });
        
        test('should type text character by character with audio', async () => {
            const element = document.createElement('div');
            const testText = 'TEST MESSAGE';
            
            await missionScreen.typeTextWithAudio(element, testText, 10);
            
            expect(element.textContent).toBe(testText);
            
            const { AudioEngine } = require('../../js/audio-engine.js');
            // Should play audio for each non-space character
            const nonSpaceChars = testText.replace(/\s/g, '').length;
            expect(AudioEngine.play).toHaveBeenCalledTimes(nonSpaceChars);
        });
        
        test('should skip audio for spaces and newlines', async () => {
            const element = document.createElement('div');
            const testText = 'A B\nC';
            
            const { AudioEngine } = require('../../js/audio-engine.js');
            AudioEngine.play.mockClear();
            
            await missionScreen.typeTextWithAudio(element, testText, 1);
            
            // Should only play audio for 'A', 'B', 'C' (3 times)
            expect(AudioEngine.play).toHaveBeenCalledTimes(3);
        });
    });
    
    describe('Mission Choices', () => {
        test('should setup mission buttons with audio feedback', async () => {
            const setupMissionButtonsSpy = jest.spyOn(missionScreen, 'setupMissionButtons');
            const container = mockScreen.querySelector('.mission-choices');
            
            await missionScreen.initMissionChoices(container);
            
            expect(setupMissionButtonsSpy).toHaveBeenCalled();
            expect(container.classList.contains('phosphor-glow-active')).toBe(true);
            
            const { AudioEngine } = require('../../js/audio-engine.js');
            expect(AudioEngine.play).toHaveBeenCalledWith('dataTransfer');
            expect(AudioEngine.play).toHaveBeenCalledWith('beep');
        });
        
        test('should add event listeners to mission buttons', () => {
            const acceptButton = mockScreen.querySelector('.accept-button');
            const declineButton = mockScreen.querySelector('.decline-button');
            
            const acceptSpy = jest.spyOn(acceptButton, 'addEventListener');
            const declineSpy = jest.spyOn(declineButton, 'addEventListener');
            
            missionScreen.setupMissionButtons();
            
            expect(acceptSpy).toHaveBeenCalledWith('click', expect.any(Function));
            expect(acceptSpy).toHaveBeenCalledWith('mouseenter', expect.any(Function));
            expect(declineSpy).toHaveBeenCalledWith('click', expect.any(Function));
            expect(declineSpy).toHaveBeenCalledWith('mouseenter', expect.any(Function));
        });
        
        test('should handle missing buttons gracefully', () => {
            mockScreen.querySelector('.accept-button').remove();
            mockScreen.querySelector('.decline-button').remove();
            
            expect(() => {
                missionScreen.setupMissionButtons();
            }).not.toThrow();
        });
    });
    
    describe('Mission Choice Handling', () => {
        beforeEach(() => {
            missionScreen.missionInputEnabled = true;
        });
        
        test('should handle mission acceptance', async () => {
            jest.useFakeTimers();
            
            const choicePromise = missionScreen.handleMissionChoice(true);
            
            expect(missionScreen.missionInputEnabled).toBe(false);
            expect(localStorage.setItem).toHaveBeenCalledWith('missionAccepted', 'true');
            
            // Fast-forward through animations
            jest.advanceTimersByTime(2000);
            await choicePromise;
            
            const { AudioEngine } = require('../../js/audio-engine.js');
            expect(AudioEngine.play).toHaveBeenCalledWith('terminalBeep');
            expect(AudioEngine.play).toHaveBeenCalledWith('success');
            
            expect(window.appState.transition).toHaveBeenCalledWith(
                'briefing',
                window.app.cinematic
            );
            
            jest.useRealTimers();
        });
        
        test('should handle mission decline', async () => {
            jest.useFakeTimers();
            
            const choicePromise = missionScreen.handleMissionChoice(false);
            
            expect(localStorage.setItem).toHaveBeenCalledWith('missionAccepted', 'false');
            
            jest.advanceTimersByTime(2000);
            await choicePromise;
            
            const { AudioEngine } = require('../../js/audio-engine.js');
            expect(AudioEngine.play).toHaveBeenCalledWith('disconnect');
            
            expect(window.appState.transition).toHaveBeenCalledWith(
                'declined',
                window.app.cinematic
            );
            
            jest.useRealTimers();
        });
        
        test('should ignore input when disabled', async () => {
            missionScreen.missionInputEnabled = false;
            
            await missionScreen.handleMissionChoice(true);
            
            expect(localStorage.setItem).not.toHaveBeenCalled();
            expect(window.appState.transition).not.toHaveBeenCalled();
        });
        
        test('should provide visual feedback for selection', async () => {
            const acceptButton = mockScreen.querySelector('.accept-button');
            const declineButton = mockScreen.querySelector('.decline-button');
            
            jest.useFakeTimers();
            
            const choicePromise = missionScreen.handleMissionChoice(true);
            jest.advanceTimersByTime(1000);
            
            expect(acceptButton.classList.contains('selected')).toBe(true);
            expect(acceptButton.style.boxShadow).toBe('var(--glow-intense)');
            expect(declineButton.style.opacity).toBe('0.3');
            
            jest.advanceTimersByTime(1000);
            await choicePromise;
            
            jest.useRealTimers();
        });
    });
    
    describe('State Management', () => {
        test('should reset mission screen state', () => {
            // Setup some state to reset
            missionScreen.missionInputEnabled = true;
            missionScreen.currentSignalBar = 3;
            missionScreen.signalWaveInterval = setInterval(() => {}, 100);
            
            const signalBars = mockScreen.querySelectorAll('.signal-bars .bar');
            signalBars.forEach(bar => {
                bar.classList.add('bouncing', 'locked');
                bar.style.opacity = '0.5';
            });
            
            const buttons = mockScreen.querySelectorAll('.mission-button');
            buttons.forEach(button => {
                button.classList.add('selected');
                button.style.opacity = '0.3';
            });
            
            missionScreen.reset();
            
            expect(missionScreen.missionInputEnabled).toBe(false);
            expect(missionScreen.currentSignalBar).toBe(0);
            expect(missionScreen.signalWaveInterval).toBeNull();
            
            signalBars.forEach(bar => {
                expect(bar.classList.contains('bouncing')).toBe(false);
                expect(bar.classList.contains('locked')).toBe(false);
                expect(bar.style.opacity).toBe('');
            });
            
            buttons.forEach(button => {
                expect(button.classList.contains('selected')).toBe(false);
                expect(button.style.opacity).toBe('');
            });
        });
        
        test('should cleanup resources', () => {
            const resetSpy = jest.spyOn(missionScreen, 'reset');
            
            missionScreen.cleanup();
            
            expect(resetSpy).toHaveBeenCalled();
        });
        
        test('should return correct status', () => {
            missionScreen.missionInputEnabled = true;
            missionScreen.currentSignalBar = 2;
            missionScreen.signalWaveInterval = setInterval(() => {}, 100);
            
            const status = missionScreen.getStatus();
            
            expect(status).toEqual({
                inputEnabled: true,
                agentName: 'Test Agent',
                signalWaveActive: true,
                currentSignalBar: 2
            });
            
            clearInterval(missionScreen.signalWaveInterval);
        });
    });
    
    describe('User Interaction', () => {
        test('should play audio on button hover', () => {
            missionScreen.setupMissionButtons();
            
            const acceptButton = mockScreen.querySelector('.accept-button');
            
            // Simulate mouseenter event
            const mouseEnterEvent = new Event('mouseenter');
            acceptButton.dispatchEvent(mouseEnterEvent);
            
            const { AudioEngine } = require('../../js/audio-engine.js');
            expect(AudioEngine.play).toHaveBeenCalledWith('beep', { volume: 0.3 });
        });
        
        test('should handle button clicks', async () => {
            missionScreen.missionInputEnabled = true;
            missionScreen.setupMissionButtons();
            
            const handleMissionChoiceSpy = jest.spyOn(missionScreen, 'handleMissionChoice');
            const acceptButton = mockScreen.querySelector('.accept-button');
            
            // Simulate click event
            const clickEvent = new Event('click');
            acceptButton.dispatchEvent(clickEvent);
            
            expect(handleMissionChoiceSpy).toHaveBeenCalledWith(true);
        });
    });
    
    describe('Timing and Delays', () => {
        test('should provide delay utility function', async () => {
            const start = Date.now();
            await missionScreen.delay(100);
            const end = Date.now();
            
            expect(end - start).toBeGreaterThanOrEqual(90); // Allow some timing variance
        });
        
        test('should use appropriate delays in sequences', async () => {
            const delaySpy = jest.spyOn(missionScreen, 'delay').mockResolvedValue(undefined);
            
            const signalBars = mockScreen.querySelectorAll('.signal-bars .bar');
            const transmissionDetection = mockScreen.querySelector('.transmission-detection');
            
            await missionScreen.initSignalDetection(signalBars, transmissionDetection);
            
            expect(delaySpy).toHaveBeenCalledWith(3000); // Signal wave duration
            expect(delaySpy).toHaveBeenCalledWith(1200); // Post-lock delay
        });
    });
    
    describe('Error Handling', () => {
        test('should handle missing DOM elements gracefully', async () => {
            const emptyContainer = document.createElement('div');
            
            await expect(
                missionScreen.initSignalDetection([], emptyContainer)
            ).resolves.not.toThrow();
            
            await expect(
                missionScreen.initPersonalCommunication(null, emptyContainer)
            ).resolves.not.toThrow();
            
            await expect(
                missionScreen.initMissionChoices(emptyContainer)
            ).resolves.not.toThrow();
        });
        
        test('should handle missing window.appState gracefully', async () => {
            delete window.appState;
            missionScreen.missionInputEnabled = true;
            
            await expect(
                missionScreen.handleMissionChoice(true)
            ).resolves.not.toThrow();
        });
        
        test('should handle signal wave cleanup on reset', () => {
            // Start signal wave
            const signalBars = mockScreen.querySelectorAll('.signal-bars .bar');
            missionScreen.startSignalWave(signalBars);
            
            expect(missionScreen.signalWaveInterval).not.toBeNull();
            
            // Reset should clean up interval
            missionScreen.reset();
            
            expect(missionScreen.signalWaveInterval).toBeNull();
        });
        
        test('should handle missing signal bars in wave animation', () => {
            expect(() => {
                missionScreen.startSignalWave([]);
            }).not.toThrow();
            
            expect(() => {
                missionScreen.stopSignalWave([]);
            }).not.toThrow();
        });
    });
    
    describe('Audio Integration', () => {
        test('should play appropriate audio cues throughout sequence', async () => {
            const { AudioEngine } = require('../../js/audio-engine.js');
            
            // Complete initialization to test all audio cues
            await missionScreen.init();
            
            // Should play connection establish, success, alert, dataTransfer, beep
            expect(AudioEngine.play).toHaveBeenCalledWith('connectionEstablish');
            expect(AudioEngine.play).toHaveBeenCalledWith('success');
            expect(AudioEngine.play).toHaveBeenCalledWith('alert');
            expect(AudioEngine.play).toHaveBeenCalledWith('dataTransfer');
            expect(AudioEngine.play).toHaveBeenCalledWith('beep');
        });
        
        test('should handle audio failures gracefully', async () => {
            const { AudioEngine } = require('../../js/audio-engine.js');
            AudioEngine.play.mockRejectedValue(new Error('Audio failed'));
            
            await expect(missionScreen.init()).resolves.not.toThrow();
        });
    });
});