/**
 * Test Utilities and Helpers
 * Comprehensive testing utilities for Brewster's MTGO Mission Terminal
 */

import { screen, fireEvent, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

export class TestHelpers {
  // DOM manipulation utilities
  static createMockElement(tag = 'div', attributes = {}, innerHTML = '') {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    if (innerHTML) {
      element.innerHTML = innerHTML;
    }
    return element;
  }
  
  static createMockScreen(screenId, className = 'screen') {
    const screen = this.createMockElement('div', { 
      id: screenId,
      class: className
    });
    document.body.appendChild(screen);
    return screen;
  }
  
  static createFullMockDOM() {
    document.body.innerHTML = `
      <div id="app" class="app-container">
        <div id="boot-sequence-screen" class="screen active boot-screen-fullscreen">
          <div class="boot-sequence-container"></div>
        </div>
        <div id="auth-screen" class="screen hidden">
          <form id="auth-form" class="auth-form">
            <input id="agent-name" type="text" />
            <button type="submit">Submit</button>
          </form>
          <div id="error-display" class="error-display"></div>
        </div>
        <div id="mission-screen" class="screen hidden">
          <div class="signal-bars">
            <div class="bar" data-bar="1"></div>
            <div class="bar" data-bar="2"></div>
            <div class="bar" data-bar="3"></div>
            <div class="bar" data-bar="4"></div>
            <div class="bar" data-bar="5"></div>
          </div>
          <button class="mission-button accept-button">Accept Mission</button>
          <button class="mission-button decline-button">Decline Mission</button>
        </div>
        <div id="briefing-screen" class="screen hidden">
          <div class="briefing-content">
            <h1>Mission Briefing</h1>
            <button class="action-button primary">Continue</button>
          </div>
        </div>
        <div id="countdown-screen" class="screen hidden">
          <div class="timer-display">
            <div class="timer-digits">60</div>
          </div>
        </div>
        <div id="credits-screen" class="screen hidden">
          <div class="credits-content">
            <h1>Mission Complete</h1>
          </div>
        </div>
        <div id="declined-screen" class="screen hidden">
          <div class="declined-content">
            <h1>Mission Declined</h1>
            <button class="restart-button">Restart</button>
          </div>
        </div>
      </div>
    `;
    return document.getElementById('app');
  }
  
  // Event simulation utilities
  static async simulateUserInput(element, value) {
    const user = userEvent.setup();
    await user.clear(element);
    await user.type(element, value);
  }
  
  static async simulateClick(element) {
    const user = userEvent.setup();
    await user.click(element);
  }
  
  static async simulateKeyPress(element, key) {
    const user = userEvent.setup();
    await user.type(element, key);
  }
  
  static simulateFormSubmit(form) {
    fireEvent.submit(form);
  }
  
  // Async utilities
  static async waitForCondition(condition, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await condition()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    throw new Error(`Condition not met within ${timeout}ms`);
  }
  
  static async waitForElement(selector, timeout = 5000) {
    return waitFor(() => {
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error(`Element ${selector} not found`);
      }
      return element;
    }, { timeout });
  }
  
  static async waitForElementToBeVisible(selector, timeout = 5000) {
    return waitFor(() => {
      const element = document.querySelector(selector);
      if (!element || element.classList.contains('hidden')) {
        throw new Error(`Element ${selector} not visible`);
      }
      return element;
    }, { timeout });
  }
  
  // Mock context factory
  static createMockContext() {
    return {
      state: new MockStateManager(),
      audio: new MockAudioEngine(),
      cinematic: new MockCinematicEngine(),
      getService: jest.fn((name) => {
        const services = {
          'state': new MockStateManager(),
          'audio': new MockAudioEngine(),
          'cinematic': new MockCinematicEngine(),
          'sanitizer': new MockSanitizer()
        };
        return services[name] || null;
      }),
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn()
    };
  }
  
  // Performance testing utilities
  static measurePerformance(fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    return {
      result,
      duration: end - start
    };
  }
  
  static async measureAsyncPerformance(fn) {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    return {
      result,
      duration: end - start
    };
  }
  
  // Memory testing utilities
  static captureMemorySnapshot() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        timestamp: Date.now()
      };
    }
    return null;
  }
  
  static detectMemoryLeak(before, after, threshold = 5 * 1024 * 1024) {
    if (!before || !after) return false;
    return (after.used - before.used) > threshold;
  }
  
  // Screen state testing
  static getVisibleScreen() {
    return document.querySelector('.screen:not(.hidden)');
  }
  
  static getActiveScreen() {
    return document.querySelector('.screen.active');
  }
  
  static isScreenVisible(screenId) {
    const screen = document.getElementById(screenId);
    return screen && !screen.classList.contains('hidden');
  }
  
  // Animation testing utilities
  static hasAnimationClass(element, className) {
    return element.classList.contains(className);
  }
  
  static getComputedAnimationStyle(element) {
    const computed = window.getComputedStyle(element);
    return {
      animation: computed.animation,
      transform: computed.transform,
      opacity: computed.opacity,
      transition: computed.transition
    };
  }
  
  // Audio testing utilities
  static createMockAudioContext() {
    return {
      createOscillator: jest.fn(() => ({
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        frequency: { value: 440 }
      })),
      createGain: jest.fn(() => ({
        connect: jest.fn(),
        gain: { value: 1 }
      })),
      destination: {},
      currentTime: 0,
      sampleRate: 44100,
      state: 'running',
      close: jest.fn(),
      resume: jest.fn().mockResolvedValue(undefined)
    };
  }
  
  // Cleanup utilities
  static cleanup() {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    jest.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  }
  
  // Validation utilities
  static validateCinematicTiming(expectedDelay = 1200) {
    const tolerance = 100; // 100ms tolerance
    return (actualDelay) => {
      return Math.abs(actualDelay - expectedDelay) <= tolerance;
    };
  }
  
  static validateSequentialReveal(elements, expectedStages) {
    return elements.every((element, index) => {
      const expectedClass = `stage-${expectedStages[index]}-hidden`;
      return element.classList.contains(expectedClass);
    });
  }
}

// Mock classes for testing
export class MockStateManager {
  constructor() {
    this.currentState = 'loading';
    this.history = [];
    this.listeners = new Map();
  }
  
  getCurrentState() {
    return this.currentState;
  }
  
  async transition(newState) {
    const oldState = this.currentState;
    this.currentState = newState;
    this.history.push({ from: oldState, to: newState, timestamp: Date.now() });
    
    // Notify listeners
    this.listeners.forEach((handler, event) => {
      if (event === 'stateChange') {
        handler(newState, oldState);
      }
    });
    
    return true;
  }
  
  getStateHistory() {
    return this.history.map(entry => entry.from);
  }
  
  on(event, handler) {
    this.listeners.set(event, handler);
    return () => this.listeners.delete(event);
  }
  
  off(event) {
    this.listeners.delete(event);
  }
  
  validateTransition(from, to) {
    const validTransitions = {
      'loading': ['auth', 'boot'],
      'boot': ['auth'],
      'auth': ['mission'],
      'mission': ['briefing', 'declined'],
      'briefing': ['countdown'],
      'countdown': ['credits'],
      'declined': ['auth'],
      'credits': ['auth']
    };
    
    return validTransitions[from]?.includes(to) || false;
  }
}

export class MockAudioEngine {
  constructor() {
    this.sounds = new Map();
    this.playHistory = [];
    this.isInitialized = false;
    this.volume = 1;
  }
  
  async init() {
    this.isInitialized = true;
    return true;
  }
  
  async playSound(name, options = {}) {
    this.playHistory.push({
      name,
      options,
      timestamp: Date.now()
    });
    return Promise.resolve();
  }
  
  async playSequence(sounds) {
    for (const sound of sounds) {
      await this.playSound(sound.name, sound.options);
    }
  }
  
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }
  
  getVolume() {
    return this.volume;
  }
  
  getPlayHistory() {
    return [...this.playHistory];
  }
  
  clearPlayHistory() {
    this.playHistory = [];
  }
  
  isInitialized() {
    return this.isInitialized;
  }
}

export class MockCinematicEngine {
  constructor() {
    this.animations = [];
    this.isTyping = false;
  }
  
  async typeText(element, text, options = {}) {
    this.isTyping = true;
    const chars = text.split('');
    
    for (let i = 0; i < chars.length; i++) {
      element.textContent += chars[i];
      await new Promise(resolve => setTimeout(resolve, options.delay || 50));
    }
    
    this.isTyping = false;
    return element;
  }
  
  async revealElement(element, options = {}) {
    const animation = {
      element,
      type: 'reveal',
      options,
      timestamp: Date.now()
    };
    
    this.animations.push(animation);
    element.classList.remove('hidden');
    
    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay));
    }
    
    return element;
  }
  
  async hideElement(element, options = {}) {
    const animation = {
      element,
      type: 'hide',
      options,
      timestamp: Date.now()
    };
    
    this.animations.push(animation);
    element.classList.add('hidden');
    
    return element;
  }
  
  async transitionScreens(fromScreen, toScreen, options = {}) {
    const animation = {
      type: 'transition',
      from: fromScreen,
      to: toScreen,
      options,
      timestamp: Date.now()
    };
    
    this.animations.push(animation);
    
    if (fromScreen) {
      fromScreen.classList.add('hidden');
    }
    
    if (toScreen) {
      toScreen.classList.remove('hidden');
    }
    
    return true;
  }
  
  getAnimationHistory() {
    return [...this.animations];
  }
  
  clearAnimationHistory() {
    this.animations = [];
  }
  
  isCurrentlyTyping() {
    return this.isTyping;
  }
}

export class MockSanitizer {
  sanitizeAgentName(input) {
    if (!input || typeof input !== 'string') {
      throw new Error('Agent name cannot be empty');
    }
    
    if (input.length > 30) {
      throw new Error('Agent name too long');
    }
    
    // Check for dangerous patterns
    if (this.containsXSSPatterns(input)) {
      throw new Error('Invalid characters detected');
    }
    
    return input.trim();
  }
  
  escapeHtml(str) {
    const entityMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;'
    };
    
    return String(str).replace(/[&<>"'\/]/g, (s) => entityMap[s]);
  }
  
  containsXSSPatterns(input) {
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /onclick=/i,
      /onerror=/i,
      /onload=/i,
      /eval\s*\(/i,
      /document\.cookie/i,
      /window\.location/i,
      /<\/script>/i,
      /vbscript:/i,
      /expression\s*\(/i
    ];
    
    return xssPatterns.some(pattern => pattern.test(input));
  }
  
  validateInput(input, type = 'text') {
    switch (type) {
      case 'agentName':
        return this.sanitizeAgentName(input);
      case 'html':
        return this.escapeHtml(input);
      default:
        return input;
    }
  }
}

// Export all utilities
export default TestHelpers;