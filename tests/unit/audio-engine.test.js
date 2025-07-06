/**
 * Unit Tests for AudioEngine
 * Testing audio functionality, mobile unlock, and sound generation
 */

import { AudioEngine } from '../../js/audio-engine.js';
import { TestHelpers } from '../utils/test-helpers.js';

describe('AudioEngine', () => {
    let mockAudioContext;
    let mockOscillator;
    let mockGainNode;
    
    beforeEach(() => {
        // Reset AudioEngine state
        AudioEngine.context = null;
        AudioEngine.sounds = {};
        AudioEngine.loaded = false;
        AudioEngine.unlocked = false;
        AudioEngine.volume = 0.75;
        AudioEngine.ambientOscillators = [];
        AudioEngine.ambientSystemActive = false;
        
        // Mock Web Audio API
        mockOscillator = {
            type: 'sine',
            frequency: { 
                setValueAtTime: jest.fn(),
                value: 440
            },
            connect: jest.fn(),
            start: jest.fn(),
            stop: jest.fn(),
            disconnect: jest.fn()
        };
        
        mockGainNode = {
            gain: {
                setValueAtTime: jest.fn(),
                linearRampToValueAtTime: jest.fn(),
                exponentialRampToValueAtTime: jest.fn(),
                value: 1
            },
            connect: jest.fn(),
            disconnect: jest.fn()
        };
        
        mockAudioContext = TestHelpers.createMockAudioContext();
        mockAudioContext.createOscillator = jest.fn(() => mockOscillator);
        mockAudioContext.createGain = jest.fn(() => mockGainNode);
        
        global.AudioContext = jest.fn(() => mockAudioContext);
        global.webkitAudioContext = jest.fn(() => mockAudioContext);
        
        // Mock Audio constructor for sound loading
        global.Audio = jest.fn().mockImplementation(() => ({
            play: jest.fn().mockResolvedValue(undefined),
            pause: jest.fn(),
            load: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            cloneNode: jest.fn().mockReturnThis(),
            currentTime: 0,
            duration: 0,
            volume: 1,
            loop: false,
            src: '',
            preload: 'auto'
        }));
    });
    
    afterEach(() => {
        TestHelpers.cleanup();
        jest.clearAllMocks();
    });
    
    describe('Initialization', () => {
        test('should initialize audio context', async () => {
            const result = await AudioEngine.init();
            
            expect(result).toBe(true);
            expect(AudioEngine.loaded).toBe(true);
            expect(AudioEngine.context).toBeTruthy();
            expect(global.AudioContext).toHaveBeenCalled();
        });
        
        test('should handle initialization failure gracefully', async () => {
            global.AudioContext = jest.fn(() => {
                throw new Error('AudioContext not supported');
            });
            global.webkitAudioContext = undefined;
            
            const result = await AudioEngine.init();
            
            expect(result).toBe(false);
            expect(AudioEngine.loaded).toBe(false);
        });
        
        test('should set up mobile unlock handlers', async () => {
            const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
            
            await AudioEngine.init();
            
            const mobileEvents = ['touchstart', 'touchend', 'mousedown', 'click', 'keydown'];
            mobileEvents.forEach(event => {
                expect(addEventListenerSpy).toHaveBeenCalledWith(
                    event,
                    expect.any(Function),
                    { once: true, passive: true }
                );
            });
            
            expect(addEventListenerSpy).toHaveBeenCalledWith(
                'focusin',
                expect.any(Function),
                { once: true }
            );
        });
        
        test('should have all required sound mappings', async () => {
            await AudioEngine.init();
            
            const expectedSounds = [
                'terminalBeep',
                'terminalTextBeep',
                'typingSound',
                'bootUp',
                'crtPowerOn',
                'beep',
                'success',
                'alert',
                'glitch',
                'disconnect',
                'connectionEstablish',
                'connectionActive',
                'systemStatusChange',
                'dataTransfer',
                'flipClock',
                'stateTransition',
                'screenFlicker',
                'missionThemeShort',
                'missionThemeFull'
            ];
            
            expectedSounds.forEach(sound => {
                expect(AudioEngine.soundMap[sound]).toBeDefined();
                expect(AudioEngine.soundMap[sound].url).toMatch(/assets\/sounds/);
            });
        });
    });
    
    describe('Sound Loading', () => {
        test('should preload all sounds', async () => {
            const mockAudio = {
                addEventListener: jest.fn((event, callback) => {
                    if (event === 'canplaythrough') {
                        setTimeout(callback, 0);
                    }
                }),
                volume: 0,
                loop: false,
                src: ''
            };
            
            global.Audio = jest.fn(() => mockAudio);
            
            await AudioEngine.init();
            
            expect(global.Audio).toHaveBeenCalledTimes(
                Object.keys(AudioEngine.soundMap).length
            );
        });
        
        test('should handle sound loading errors gracefully', async () => {
            const mockAudio = {
                addEventListener: jest.fn((event, callback) => {
                    if (event === 'error') {
                        setTimeout(() => callback(new Error('Load failed')), 0);
                    }
                }),
                volume: 0,
                loop: false,
                src: ''
            };
            
            global.Audio = jest.fn(() => mockAudio);
            
            await AudioEngine.init();
            
            // Should still complete initialization despite load errors
            expect(AudioEngine.loaded).toBe(true);
        });
    });
    
    describe('Sound Playback', () => {
        beforeEach(async () => {
            await AudioEngine.init();
        });
        
        test('should play loaded sound', async () => {
            const mockAudio = {
                play: jest.fn().mockResolvedValue(undefined),
                cloneNode: jest.fn().mockReturnThis(),
                volume: 0,
                loop: false
            };
            
            AudioEngine.sounds.beep = {
                audio: mockAudio,
                config: { volume: 0.5 }
            };
            
            const result = await AudioEngine.play('beep');
            
            expect(mockAudio.cloneNode).toHaveBeenCalled();
            expect(mockAudio.play).toHaveBeenCalled();
            expect(result).toBe(mockAudio);
        });
        
        test('should handle play options correctly', async () => {
            const mockAudio = {
                play: jest.fn().mockResolvedValue(undefined),
                cloneNode: jest.fn().mockReturnThis(),
                volume: 0,
                loop: false
            };
            
            AudioEngine.sounds.beep = {
                audio: mockAudio,
                config: { volume: 0.5 }
            };
            
            await AudioEngine.play('beep', { volume: 0.8, loop: true });
            
            expect(mockAudio.volume).toBe(0.8 * AudioEngine.volume);
            expect(mockAudio.loop).toBe(true);
        });
        
        test('should fall back to generated sound when file fails', async () => {
            const playGeneratedSoundSpy = jest.spyOn(AudioEngine, 'playGeneratedSound');
            
            AudioEngine.sounds.beep = {
                audio: {
                    cloneNode: jest.fn().mockReturnThis(),
                    play: jest.fn().mockRejectedValue(new Error('Play failed'))
                },
                config: { volume: 0.5 }
            };
            
            await AudioEngine.play('beep');
            
            expect(playGeneratedSoundSpy).toHaveBeenCalledWith('beep', {});
        });
        
        test('should return null for non-existent sounds', async () => {
            const result = await AudioEngine.play('nonexistent');
            
            expect(result).toBeNull();
        });
        
        test('should return null when not loaded', async () => {
            AudioEngine.loaded = false;
            
            const result = await AudioEngine.play('beep');
            
            expect(result).toBeNull();
        });
    });
    
    describe('Generated Sound Fallback', () => {
        beforeEach(async () => {
            await AudioEngine.init();
        });
        
        test('should generate oscillator-based sounds', () => {
            const result = AudioEngine.playGeneratedSound('beep');
            
            expect(mockAudioContext.createOscillator).toHaveBeenCalled();
            expect(mockAudioContext.createGain).toHaveBeenCalled();
            expect(mockOscillator.connect).toHaveBeenCalledWith(mockGainNode);
            expect(mockGainNode.connect).toHaveBeenCalledWith(mockAudioContext.destination);
            expect(mockOscillator.start).toHaveBeenCalled();
            expect(mockOscillator.stop).toHaveBeenCalled();
            expect(result).toBe(mockOscillator);
        });
        
        test('should use correct parameters for different sound types', () => {
            const testCases = [
                { sound: 'beep', expectedType: 'sine', expectedFreq: 800 },
                { sound: 'terminalBeep', expectedType: 'square', expectedFreq: 1000 },
                { sound: 'success', expectedType: 'sine', expectedFreq: 523 },
                { sound: 'alert', expectedType: 'triangle', expectedFreq: 440 },
                { sound: 'glitch', expectedType: 'sawtooth', expectedFreq: 150 }
            ];
            
            testCases.forEach(({ sound, expectedType, expectedFreq }) => {
                AudioEngine.playGeneratedSound(sound);
                
                expect(mockOscillator.type).toBe(expectedType);
                expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(
                    expectedFreq,
                    expect.any(Number)
                );
            });
        });
        
        test('should handle audio context errors gracefully', () => {
            AudioEngine.context = null;
            
            const result = AudioEngine.playGeneratedSound('beep');
            
            expect(result).toBeNull();
        });
        
        test('should handle oscillator creation errors', () => {
            mockAudioContext.createOscillator = jest.fn(() => {
                throw new Error('Oscillator creation failed');
            });
            
            const result = AudioEngine.playGeneratedSound('beep');
            
            expect(result).toBeNull();
        });
    });
    
    describe('Mission Impossible Theme', () => {
        beforeEach(async () => {
            await AudioEngine.init();
        });
        
        test('should play theme with sync callback', async () => {
            const mockCallback = jest.fn();
            const mockAudio = {
                play: jest.fn().mockResolvedValue(undefined),
                cloneNode: jest.fn().mockReturnThis()
            };
            
            AudioEngine.sounds.missionThemeFull = {
                audio: mockAudio,
                config: { volume: 0.8 }
            };
            
            await AudioEngine.playThemeWithSync(mockCallback);
            
            expect(mockAudio.play).toHaveBeenCalled();
            
            // Fast-forward timer to test callback
            jest.advanceTimersByTime(2200);
            expect(mockCallback).toHaveBeenCalled();
        });
        
        test('should fall back to generated theme when file fails', async () => {
            const mockCallback = jest.fn();
            const playMissionThemeGeneratedSpy = jest.spyOn(
                AudioEngine,
                'playMissionThemeGenerated'
            );
            
            AudioEngine.sounds.missionThemeFull = {
                audio: {
                    cloneNode: jest.fn().mockReturnThis(),
                    play: jest.fn().mockRejectedValue(new Error('Theme failed'))
                },
                config: { volume: 0.8 }
            };
            
            await AudioEngine.playThemeWithSync(mockCallback);
            
            expect(playMissionThemeGeneratedSpy).toHaveBeenCalledWith(mockCallback);
        });
        
        test('should generate Mission Impossible theme notes', () => {
            const mockCallback = jest.fn();
            const generateBeepSpy = jest.spyOn(AudioEngine, 'generateBeep');
            
            AudioEngine.playMissionThemeGenerated(mockCallback);
            
            const expectedNotes = [
                { freq: 659, duration: 0.2 },
                { freq: 698, duration: 0.2 },
                { freq: 784, duration: 0.4 },
                { freq: 880, duration: 0.8 }
            ];
            
            // Fast-forward to trigger all notes
            jest.advanceTimersByTime(3000);
            
            expectedNotes.forEach(({ freq, duration }) => {
                expect(generateBeepSpy).toHaveBeenCalledWith(freq, duration);
            });
            
            expect(mockCallback).toHaveBeenCalled();
        });
    });
    
    describe('State Machine Integration', () => {
        beforeEach(async () => {
            await AudioEngine.init();
        });
        
        test('should play correct transition sounds', () => {
            const playSpy = jest.spyOn(AudioEngine, 'play');
            
            const testCases = [
                { from: 'boot-sequence', to: 'auth', expected: 'stateTransition' },
                { from: 'auth', to: 'mission', expected: 'connectionEstablish' },
                { from: 'mission', to: 'briefing', expected: 'success' },
                { from: 'briefing', to: 'countdown', expected: 'missionThemeShort' },
                { from: 'countdown', to: 'credits', expected: 'flipClock' },
                { from: 'unknown', to: 'state', expected: 'beep' }
            ];
            
            testCases.forEach(({ from, to, expected }) => {
                AudioEngine.playStateTransition(from, to);
                expect(playSpy).toHaveBeenCalledWith(expected);
                playSpy.mockClear();
            });
        });
        
        test('should play contextual audio for screen states', () => {
            const playSpy = jest.spyOn(AudioEngine, 'play');
            
            const testCases = [
                { state: 'boot-sequence', expected: 'crtPowerOn' },
                { state: 'auth', expected: 'terminalBeep' },
                { state: 'mission', expected: 'alert' },
                { state: 'briefing', expected: 'dataTransfer' },
                { state: 'countdown', expected: 'flipClock' },
                { state: 'credits', expected: 'success' }
            ];
            
            testCases.forEach(({ state, expected }) => {
                AudioEngine.playContextualAudio(state);
                expect(playSpy).toHaveBeenCalledWith(expected);
                playSpy.mockClear();
            });
        });
        
        test('should ignore unknown screen states', () => {
            const playSpy = jest.spyOn(AudioEngine, 'play');
            
            AudioEngine.playContextualAudio('unknown-state');
            
            expect(playSpy).not.toHaveBeenCalled();
        });
    });
    
    describe('Ambient Audio System', () => {
        beforeEach(async () => {
            await AudioEngine.init();
        });
        
        test('should start ambient system', () => {
            const playSpy = jest.spyOn(AudioEngine, 'play');
            const createAmbientSpy = jest.spyOn(AudioEngine, 'createAmbientOscillators');
            
            AudioEngine.startAmbientSystem();
            
            expect(AudioEngine.ambientSystemActive).toBe(true);
            expect(playSpy).toHaveBeenCalledWith('ambientHum', { volume: 0.1, loop: true });
            expect(createAmbientSpy).toHaveBeenCalled();
        });
        
        test('should not start ambient system if already active', () => {
            AudioEngine.ambientSystemActive = true;
            const playSpy = jest.spyOn(AudioEngine, 'play');
            
            AudioEngine.startAmbientSystem();
            
            expect(playSpy).not.toHaveBeenCalled();
        });
        
        test('should create ambient oscillators', () => {
            AudioEngine.createAmbientOscillators();
            
            expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(2);
            expect(mockAudioContext.createGain).toHaveBeenCalledTimes(2);
            expect(AudioEngine.ambientOscillators).toHaveLength(2);
        });
        
        test('should stop ambient system', () => {
            // Setup ambient system first
            AudioEngine.startAmbientSystem();
            AudioEngine.ambientOscillators = [
                { oscillator: mockOscillator, gain: mockGainNode }
            ];
            
            AudioEngine.stopAmbientSystem();
            
            expect(AudioEngine.ambientSystemActive).toBe(false);
            expect(mockGainNode.gain.exponentialRampToValueAtTime).toHaveBeenCalled();
            expect(mockOscillator.stop).toHaveBeenCalled();
            expect(AudioEngine.ambientOscillators).toHaveLength(0);
        });
        
        test('should not stop ambient system if not active', () => {
            AudioEngine.ambientSystemActive = false;
            const stopSpy = jest.spyOn(mockOscillator, 'stop');
            
            AudioEngine.stopAmbientSystem();
            
            expect(stopSpy).not.toHaveBeenCalled();
        });
    });
    
    describe('Volume Control', () => {
        beforeEach(async () => {
            await AudioEngine.init();
        });
        
        test('should set volume within valid range', () => {
            AudioEngine.setVolume(0.5);
            expect(AudioEngine.volume).toBe(0.5);
            
            AudioEngine.setVolume(1.5);
            expect(AudioEngine.volume).toBe(1.0);
            
            AudioEngine.setVolume(-0.5);
            expect(AudioEngine.volume).toBe(0.0);
        });
        
        test('should update ambient oscillator volumes', () => {
            AudioEngine.ambientOscillators = [
                { oscillator: mockOscillator, gain: mockGainNode }
            ];
            
            AudioEngine.setVolume(0.5);
            
            expect(mockGainNode.gain.setValueAtTime).toHaveBeenCalled();
        });
    });
    
    describe('Mobile Audio Unlock', () => {
        beforeEach(async () => {
            mockAudioContext.state = 'suspended';
            await AudioEngine.init();
        });
        
        test('should unlock audio on user interaction', async () => {
            mockAudioContext.resume = jest.fn().mockResolvedValue(undefined);
            const playSpy = jest.spyOn(AudioEngine, 'play');
            
            // Simulate touch event
            const touchEvent = new Event('touchstart');
            document.dispatchEvent(touchEvent);
            
            await flushPromises();
            
            expect(mockAudioContext.resume).toHaveBeenCalled();
            expect(AudioEngine.unlocked).toBe(true);
            
            // Should play welcome beep after unlock
            setTimeout(() => {
                expect(playSpy).toHaveBeenCalledWith('terminalBeep', { volume: 0.1 });
            }, 100);
        });
        
        test('should handle unlock failure gracefully', async () => {
            mockAudioContext.resume = jest.fn().mockRejectedValue(new Error('Unlock failed'));
            
            const touchEvent = new Event('touchstart');
            document.dispatchEvent(touchEvent);
            
            await flushPromises();
            
            expect(AudioEngine.unlocked).toBe(false);
        });
    });
    
    describe('Status and Diagnostics', () => {
        test('should return correct status', async () => {
            await AudioEngine.init();
            
            const status = AudioEngine.getStatus();
            
            expect(status).toEqual({
                loaded: true,
                unlocked: false,
                volume: 0.75,
                ambientActive: false,
                contextState: 'running',
                soundsLoaded: Object.keys(AudioEngine.sounds).length
            });
        });
        
        test('should handle missing audio context in status', () => {
            AudioEngine.context = null;
            
            const status = AudioEngine.getStatus();
            
            expect(status.contextState).toBe('none');
        });
    });
    
    describe('Error Handling', () => {
        test('should handle beep generation errors', () => {
            AudioEngine.context = null;
            
            expect(() => {
                AudioEngine.generateBeep(440, 0.2);
            }).not.toThrow();
        });
        
        test('should handle ambient oscillator creation errors', () => {
            mockAudioContext.createOscillator = jest.fn(() => {
                throw new Error('Oscillator failed');
            });
            
            expect(() => {
                AudioEngine.createAmbientOscillators();
            }).not.toThrow();
        });
        
        test('should handle ambient stop errors gracefully', () => {
            AudioEngine.ambientSystemActive = true;
            AudioEngine.ambientOscillators = [{
                oscillator: {
                    stop: jest.fn(() => { throw new Error('Stop failed'); })
                },
                gain: {
                    gain: {
                        exponentialRampToValueAtTime: jest.fn(() => { 
                            throw new Error('Ramp failed'); 
                        })
                    }
                }
            }];
            
            expect(() => {
                AudioEngine.stopAmbientSystem();
            }).not.toThrow();
        });
    });
});