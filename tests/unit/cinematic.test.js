/**
 * Unit Tests for CinematicEngine
 * Testing animation engine, screen transitions, and visual effects
 */

import { CinematicEngine } from '../../js/cinematic.js';
import { TestHelpers } from '../utils/test-helpers.js';

// Mock MissionScreen
jest.mock('../../js/mission-screen.js', () => ({
    MissionScreen: jest.fn().mockImplementation(() => ({
        init: jest.fn()
    }))
}));

describe('CinematicEngine', () => {
    let cinematicEngine;
    let mockApp;
    
    beforeEach(() => {
        cinematicEngine = new CinematicEngine();
        
        // Create DOM structure
        TestHelpers.createFullMockDOM();
        
        // Mock window.AudioEngine
        global.window.AudioEngine = {
            play: jest.fn().mockResolvedValue(undefined)
        };
        
        // Mock window.app
        global.window.app = {
            transitionTo: jest.fn()
        };
        
        // Mock performance.now for animations
        global.performance.now = jest.fn(() => Date.now());
        
        // Mock localStorage and sessionStorage
        global.localStorage = {
            setItem: jest.fn(),
            getItem: jest.fn(),
            removeItem: jest.fn()
        };
        
        global.sessionStorage = {
            setItem: jest.fn(),
            getItem: jest.fn(),
            removeItem: jest.fn()
        };
    });
    
    afterEach(() => {
        TestHelpers.cleanup();
        jest.clearAllMocks();
    });
    
    describe('Initialization', () => {
        test('should initialize with correct default state', () => {
            expect(cinematicEngine.animations).toBeInstanceOf(Map);
            expect(cinematicEngine.isPaused).toBe(false);
            expect(cinematicEngine.transitions).toBeInstanceOf(Map);
            expect(cinematicEngine.currentAnimation).toBeNull();
        });
        
        test('should setup mobile detection correctly', () => {
            // Mock mobile viewport
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 400
            });
            
            const mobileEngine = new CinematicEngine();
            expect(mobileEngine.isMobile).toBe(true);
        });
        
        test('should setup desktop detection correctly', () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 1200
            });
            
            const desktopEngine = new CinematicEngine();
            expect(desktopEngine.isMobile).toBe(false);
        });
        
        test('should detect touch support', () => {
            Object.defineProperty(window, 'ontouchstart', {
                writable: true,
                configurable: true,
                value: true
            });
            
            const touchEngine = new CinematicEngine();
            expect(touchEngine.isTouch).toBe(true);
        });
    });
    
    describe('Boot Sequence', () => {
        test('should start scan lines immediately', () => {
            const app = document.getElementById('app');
            
            cinematicEngine.startScanLines();
            
            expect(app.classList.contains('terminal-active')).toBe(true);
        });
        
        test('should play environmental buildup with CRT effects', async () => {
            const app = document.getElementById('app');
            
            await cinematicEngine.playEnvironmentalBuildup();
            
            expect(window.AudioEngine.play).toHaveBeenCalledWith('crtPowerOn');
            expect(app.style.opacity).toBe('1');
        });
        
        test('should type boot messages with correct timing', async () => {
            const container = document.querySelector('.boot-sequence-container');
            const message = '> TEST MESSAGE';
            
            await cinematicEngine.typeBootMessage(container, message, 800);
            
            expect(container.children.length).toBe(1);
            const messageEl = container.children[0];
            expect(messageEl.textContent).toBe(message);
            expect(messageEl.classList.contains('boot-message')).toBe(true);
        });
        
        test('should play complete boot sequence', async () => {
            const startScanLinesSpy = jest.spyOn(cinematicEngine, 'startScanLines');
            const playEnvironmentalBuildupSpy = jest.spyOn(cinematicEngine, 'playEnvironmentalBuildup');
            const typeBootMessageSpy = jest.spyOn(cinematicEngine, 'typeBootMessage');
            
            await cinematicEngine.playBootSequence();
            
            expect(startScanLinesSpy).toHaveBeenCalled();
            expect(playEnvironmentalBuildupSpy).toHaveBeenCalled();
            expect(typeBootMessageSpy).toHaveBeenCalledTimes(8); // 8 boot messages
            expect(window.AudioEngine.play).toHaveBeenCalledWith('success', { volume: 0.4 });
        });
        
        test('should handle missing boot container gracefully', async () => {
            document.querySelector('.boot-sequence-container').remove();
            
            await expect(cinematicEngine.playBootSequence()).resolves.not.toThrow();
        });
    });
    
    describe('Auth Screen Sequential Revelation', () => {
        test('should reveal auth stages in sequence', async () => {
            const revealAuthStageSpy = jest.spyOn(cinematicEngine, 'revealAuthStage');
            
            // Use fake timers to control timing
            jest.useFakeTimers();
            
            const revelationPromise = cinematicEngine.playAuthReveal();
            
            // Fast-forward through all delays
            jest.advanceTimersByTime(6000);
            
            await revelationPromise;
            
            expect(revealAuthStageSpy).toHaveBeenCalledTimes(6);
            expect(revealAuthStageSpy).toHaveBeenCalledWith(1);
            expect(revealAuthStageSpy).toHaveBeenCalledWith(2);
            expect(revealAuthStageSpy).toHaveBeenCalledWith(3);
            expect(revealAuthStageSpy).toHaveBeenCalledWith(4);
            expect(revealAuthStageSpy).toHaveBeenCalledWith(5);
            expect(revealAuthStageSpy).toHaveBeenCalledWith(6);
            
            jest.useRealTimers();
        });
        
        test('should reveal auth stage elements correctly', () => {
            const authScreen = document.getElementById('auth-screen');
            
            // Add stage elements to test
            const stageElement = document.createElement('div');
            stageElement.className = 'auth-stage-1-hidden';
            authScreen.appendChild(stageElement);
            
            cinematicEngine.revealAuthStage(1);
            
            expect(stageElement.classList.contains('auth-stage-1-hidden')).toBe(false);
            expect(stageElement.classList.contains('auth-stage-1-reveal')).toBe(true);
        });
        
        test('should play audio cues during revelation', async () => {
            jest.useFakeTimers();
            
            const revelationPromise = cinematicEngine.playAuthReveal();
            jest.advanceTimersByTime(6000);
            await revelationPromise;
            
            expect(window.AudioEngine.play).toHaveBeenCalledWith('terminalBeep', { volume: 0.2 });
            expect(window.AudioEngine.play).toHaveBeenCalledWith('terminalTextBeep', { volume: 0.1 });
            
            jest.useRealTimers();
        });
        
        test('should handle missing auth screen gracefully', () => {
            document.getElementById('auth-screen').remove();
            
            expect(() => {
                cinematicEngine.revealAuthStage(1);
            }).not.toThrow();
        });
    });
    
    describe('Text Animations', () => {
        test('should type message character by character', async () => {
            const element = document.createElement('div');
            const message = 'Hello World';
            
            await cinematicEngine.typeMessage(element, message, 10);
            
            expect(element.textContent).toBe(message);
            expect(element.style.opacity).toBe('1');
        });
        
        test('should reveal text with typing effect', async () => {
            const element = document.createElement('div');
            element.textContent = 'Original Text';
            
            await cinematicEngine.revealText(element, 10);
            
            expect(element.textContent).toBe('Original Text');
            expect(element.style.opacity).toBe('1');
        });
        
        test('should handle empty text gracefully', async () => {
            const element = document.createElement('div');
            
            await cinematicEngine.typeMessage(element, '', 10);
            
            expect(element.textContent).toBe('');
        });
        
        test('should respect pause state during typing', async () => {
            const element = document.createElement('div');
            cinematicEngine.isPaused = true;
            
            const waitForResumeSpy = jest.spyOn(cinematicEngine, 'waitForResume')
                .mockResolvedValue(undefined);
            
            await cinematicEngine.typeMessage(element, 'A', 10);
            
            expect(waitForResumeSpy).toHaveBeenCalled();
        });
    });
    
    describe('Element Animations', () => {
        test('should fade in element correctly', async () => {
            const element = document.createElement('div');
            document.body.appendChild(element);
            
            await cinematicEngine.fadeIn(element, 100);
            
            expect(element.style.opacity).toBe('1');
            expect(element.style.transition).toContain('opacity');
        });
        
        test('should reveal element with transform animation', () => {
            const element = document.createElement('div');
            document.body.appendChild(element);
            
            cinematicEngine.revealElement(element, 100, 'ease-out');
            
            // Initially hidden
            expect(element.style.opacity).toBe('0');
            expect(element.style.transform).toBe('translateY(20px)');
            
            // Should trigger animation on next frame
            return new Promise(resolve => {
                requestAnimationFrame(() => {
                    expect(element.style.transition).toContain('opacity');
                    expect(element.style.transition).toContain('transform');
                    resolve();
                });
            });
        });
        
        test('should handle null element in revealElement', () => {
            expect(() => {
                cinematicEngine.revealElement(null);
            }).not.toThrow();
        });
        
        test('should handle element without style property', () => {
            const fakeElement = { nodeType: 1 }; // Mock DOM element without style
            
            expect(() => {
                cinematicEngine.revealElement(fakeElement);
            }).not.toThrow();
        });
    });
    
    describe('Reveal Sequence', () => {
        test('should reveal multiple elements in sequence', async () => {
            const elements = [
                document.createElement('div'),
                document.createElement('div'),
                document.createElement('div')
            ];
            
            elements.forEach(el => document.body.appendChild(el));
            
            const revealElementSpy = jest.spyOn(cinematicEngine, 'revealElement');
            
            await cinematicEngine.revealSequence(elements, { delay: 10 });
            
            expect(revealElementSpy).toHaveBeenCalledTimes(3);
        });
        
        test('should filter out null elements from sequence', async () => {
            const elements = [
                document.createElement('div'),
                null,
                document.createElement('div'),
                undefined
            ];
            
            const revealElementSpy = jest.spyOn(cinematicEngine, 'revealElement');
            
            await cinematicEngine.revealSequence(elements);
            
            expect(revealElementSpy).toHaveBeenCalledTimes(2);
        });
        
        test('should handle NodeList input', async () => {
            const container = document.createElement('div');
            container.innerHTML = '<div></div><div></div>';
            document.body.appendChild(container);
            
            const nodeList = container.querySelectorAll('div');
            const revealElementSpy = jest.spyOn(cinematicEngine, 'revealElement');
            
            await cinematicEngine.revealSequence(nodeList);
            
            expect(revealElementSpy).toHaveBeenCalledTimes(2);
        });
    });
    
    describe('Screen Transitions', () => {
        test('should transition between screens smoothly', async () => {
            const fromScreen = document.getElementById('auth-screen');
            const toScreen = document.getElementById('mission-screen');
            
            const smoothScrollToSpy = jest.spyOn(cinematicEngine, 'smoothScrollTo')
                .mockResolvedValue(undefined);
            const triggerScreenRevealSpy = jest.spyOn(cinematicEngine, 'triggerScreenReveal');
            
            await cinematicEngine.transitionScreens('auth', 'mission');
            
            expect(fromScreen.classList.contains('hidden')).toBe(true);
            expect(fromScreen.classList.contains('active')).toBe(false);
            expect(toScreen.classList.contains('active')).toBe(true);
            expect(toScreen.classList.contains('hidden')).toBe(false);
            expect(smoothScrollToSpy).toHaveBeenCalledWith(toScreen);
            expect(triggerScreenRevealSpy).toHaveBeenCalledWith('mission');
        });
        
        test('should handle missing screen elements', async () => {
            document.getElementById('auth-screen').remove();
            
            await expect(
                cinematicEngine.transitionScreens('auth', 'mission')
            ).resolves.not.toThrow();
        });
        
        test('should trigger correct screen-specific reveals', () => {
            const playAuthRevealSpy = jest.spyOn(cinematicEngine, 'playAuthReveal')
                .mockResolvedValue(undefined);
            const setupAuthFormSpy = jest.spyOn(cinematicEngine, 'setupAuthForm');
            
            jest.useFakeTimers();
            
            cinematicEngine.triggerScreenReveal('auth');
            
            jest.advanceTimersByTime(500);
            
            expect(playAuthRevealSpy).toHaveBeenCalled();
            
            jest.useRealTimers();
        });
        
        test('should initialize mission screen correctly', () => {
            const missionScreen = document.getElementById('mission-screen');
            missionScreen.innerHTML = '<div class="reveal-element"></div>';
            
            const revealSequenceSpy = jest.spyOn(cinematicEngine, 'revealSequence')
                .mockResolvedValue(undefined);
            
            jest.useFakeTimers();
            
            cinematicEngine.triggerScreenReveal('mission');
            
            expect(revealSequenceSpy).toHaveBeenCalled();
            
            // Fast-forward to mission screen init
            jest.advanceTimersByTime(1000);
            
            jest.useRealTimers();
        });
    });
    
    describe('Smooth Scrolling', () => {
        test('should perform smooth scroll to element', async () => {
            const element = document.createElement('div');
            document.body.appendChild(element);
            
            // Mock getBoundingClientRect
            element.getBoundingClientRect = jest.fn(() => ({
                top: 100,
                left: 0,
                bottom: 200,
                right: 100,
                width: 100,
                height: 100
            }));
            
            const scrollToSpy = jest.spyOn(window, 'scrollTo');
            
            await cinematicEngine.smoothScrollTo(element);
            
            expect(scrollToSpy).toHaveBeenCalled();
        });
        
        test('should handle element selector string', async () => {
            const element = document.createElement('div');
            element.id = 'test-element';
            document.body.appendChild(element);
            
            const scrollToSpy = jest.spyOn(window, 'scrollTo');
            
            await cinematicEngine.smoothScrollTo('#test-element');
            
            expect(scrollToSpy).toHaveBeenCalled();
        });
        
        test('should handle missing element gracefully', async () => {
            await expect(
                cinematicEngine.smoothScrollTo('#nonexistent')
            ).resolves.not.toThrow();
        });
        
        test('should use manual scroll fallback when needed', async () => {
            cinematicEngine.supportsScrollBehavior = false;
            const manualSmoothScrollSpy = jest.spyOn(cinematicEngine, 'manualSmoothScroll')
                .mockResolvedValue(undefined);
            
            const element = document.createElement('div');
            document.body.appendChild(element);
            
            await cinematicEngine.smoothScrollTo(element);
            
            expect(manualSmoothScrollSpy).toHaveBeenCalled();
        });
    });
    
    describe('Auth Form Handling', () => {
        test('should setup auth form interactions', () => {
            const form = document.getElementById('auth-form');
            const input = form.querySelector('#agent-name');
            input.className = 'terminal-input';
            
            const addEventListenerSpy = jest.spyOn(input, 'addEventListener');
            
            cinematicEngine.setupAuthForm();
            
            expect(addEventListenerSpy).toHaveBeenCalledWith('focus', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('input', expect.any(Function));
        });
        
        test('should handle auth form submission', async () => {
            const form = document.getElementById('auth-form');
            const agentInput = form.querySelector('#agent-name');
            const accessInput = document.createElement('input');
            accessInput.id = 'access-code';
            accessInput.value = 'test123';
            form.appendChild(accessInput);
            
            agentInput.value = 'Test Agent';
            
            await cinematicEngine.handleAuthSubmission(form);
            
            expect(localStorage.setItem).toHaveBeenCalledWith('agentName', 'Test Agent');
            expect(sessionStorage.setItem).toHaveBeenCalledWith('agentName', 'Test Agent');
            expect(window.app.transitionTo).toHaveBeenCalledWith('mission');
        });
        
        test('should validate required fields', async () => {
            const form = document.getElementById('auth-form');
            const showAuthErrorSpy = jest.spyOn(cinematicEngine, 'showAuthError')
                .mockResolvedValue(undefined);
            const resetAuthFormSpy = jest.spyOn(cinematicEngine, 'resetAuthForm');
            
            // Empty form
            await cinematicEngine.handleAuthSubmission(form);
            
            expect(showAuthErrorSpy).toHaveBeenCalledWith('INCOMPLETE CREDENTIALS');
            expect(resetAuthFormSpy).toHaveBeenCalled();
        });
        
        test('should validate access code length', async () => {
            const form = document.getElementById('auth-form');
            const agentInput = form.querySelector('#agent-name');
            const accessInput = document.createElement('input');
            accessInput.id = 'access-code';
            accessInput.value = '123'; // Too short
            form.appendChild(accessInput);
            
            agentInput.value = 'Test Agent';
            
            const showAuthErrorSpy = jest.spyOn(cinematicEngine, 'showAuthError')
                .mockResolvedValue(undefined);
            
            await cinematicEngine.handleAuthSubmission(form);
            
            expect(showAuthErrorSpy).toHaveBeenCalledWith('ACCESS CODE TOO SHORT');
        });
        
        test('should show and remove auth errors', async () => {
            const form = document.getElementById('auth-form');
            
            await cinematicEngine.showAuthError('TEST ERROR');
            
            const errorEl = form.querySelector('.auth-error');
            expect(errorEl).toBeTruthy();
            expect(errorEl.textContent).toContain('TEST ERROR');
            
            // Should remove existing error before showing new one
            await cinematicEngine.showAuthError('NEW ERROR');
            
            const errors = form.querySelectorAll('.auth-error');
            expect(errors.length).toBe(1);
        });
    });
    
    describe('Animation Control', () => {
        test('should pause and resume animations', async () => {
            cinematicEngine.pauseAnimations();
            expect(cinematicEngine.isPaused).toBe(true);
            
            cinematicEngine.resumeAnimations();
            expect(cinematicEngine.isPaused).toBe(false);
        });
        
        test('should wait for resume when paused', async () => {
            cinematicEngine.isPaused = true;
            
            let resumed = false;
            
            const waitPromise = cinematicEngine.waitForResume().then(() => {
                resumed = true;
            });
            
            // Should not resolve while paused
            await new Promise(resolve => setTimeout(resolve, 50));
            expect(resumed).toBe(false);
            
            // Resume and check resolution
            cinematicEngine.resumeAnimations();
            await waitPromise;
            expect(resumed).toBe(true);
        });
    });
    
    describe('Visual Effects', () => {
        test('should apply CRT flicker effect', async () => {
            const app = document.getElementById('app');
            
            await cinematicEngine.applyCRTFlicker(100);
            
            expect(app.style.opacity).toBe('1');
        });
        
        test('should create phosphor trail effect', () => {
            const element = document.createElement('div');
            
            cinematicEngine.createPhosphorTrail(element);
            
            expect(element.classList.contains('phosphor-glow-active')).toBe(true);
            
            // Should remove class after timeout
            jest.useFakeTimers();
            jest.advanceTimersByTime(2000);
            
            expect(element.classList.contains('phosphor-glow-active')).toBe(false);
            
            jest.useRealTimers();
        });
        
        test('should handle missing app element in CRT flicker', async () => {
            document.getElementById('app').remove();
            
            await expect(
                cinematicEngine.applyCRTFlicker()
            ).resolves.not.toThrow();
        });
    });
    
    describe('Utility Functions', () => {
        test('should provide delay utility', async () => {
            const start = Date.now();
            await cinematicEngine.delay(100);
            const end = Date.now();
            
            expect(end - start).toBeGreaterThanOrEqual(90); // Allow some timing variance
        });
        
        test('should provide easing function', () => {
            expect(cinematicEngine.easeOutCubic(0)).toBe(0);
            expect(cinematicEngine.easeOutCubic(1)).toBe(1);
            expect(cinematicEngine.easeOutCubic(0.5)).toBeGreaterThan(0);
            expect(cinematicEngine.easeOutCubic(0.5)).toBeLessThan(1);
        });
    });
    
    describe('Error Handling', () => {
        test('should handle missing form elements gracefully', () => {
            expect(() => {
                cinematicEngine.setupAuthForm();
            }).not.toThrow();
        });
        
        test('should handle transition without screens', async () => {
            await expect(
                cinematicEngine.transitionScreens('nonexistent', 'alsononexistent')
            ).resolves.not.toThrow();
        });
        
        test('should handle reveal sequence with empty array', async () => {
            await expect(
                cinematicEngine.revealSequence([])
            ).resolves.not.toThrow();
        });
    });
});