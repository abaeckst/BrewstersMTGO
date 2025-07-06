# Testing Strategy & Implementation Plan

## Overview
The application currently has zero test coverage across the entire codebase. This plan establishes comprehensive testing strategies from unit tests to end-to-end validation, ensuring code quality and preventing regressions.

## Current Testing Gaps
1. **Zero Test Coverage**: No unit, integration, or end-to-end tests
2. **No Testing Infrastructure**: Missing testing frameworks and tools
3. **Manual Testing Only**: All validation is manual and inconsistent
4. **No CI/CD Validation**: No automated testing in deployment pipeline
5. **Security Testing**: No automated security vulnerability scanning

## Testing Strategy Architecture

### Phase 1: Testing Infrastructure Setup (Week 1)

#### Step 1.1: Core Testing Framework
```javascript
// package.json - Add testing dependencies
{
  "devDependencies": {
    "jest": "^29.0.0",
    "jsdom": "^22.0.0",
    "@testing-library/dom": "^9.0.0",
    "@testing-library/jest-dom": "^5.0.0",
    "cypress": "^12.0.0",
    "playwright": "^1.30.0",
    "eslint-plugin-jest": "^27.0.0",
    "jest-environment-jsdom": "^29.0.0"
  },
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "test:visual": "playwright test",
    "test:security": "npm audit && snyk test"
  }
}

// jest.config.js
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/js/**/*.test.js'
  ],
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/**/*.test.js',
    '!js/vendor/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/js/$1'
  },
  transform: {
    '^.+\\.js$': 'babel-jest'
  }
};

// tests/setup.js
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock browser APIs
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock audio for testing
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  load: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock performance API
global.performance = {
  ...global.performance,
  now: jest.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000
  }
};
```

#### Step 1.2: Test Utilities and Helpers
```javascript
// tests/utils/test-helpers.js
export class TestHelpers {
  // DOM test utilities
  static createMockElement(tag = 'div', attributes = {}) {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return element;
  }
  
  static createMockScreen(screenId) {
    const screen = this.createMockElement('div', { 
      id: screenId,
      class: 'screen'
    });
    document.body.appendChild(screen);
    return screen;
  }
  
  // Event simulation
  static simulateUserInput(element, value) {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  static simulateClick(element) {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }
  
  static simulateKeyPress(element, key) {
    element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  }
  
  // Async utilities
  static async waitFor(condition, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await condition()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    throw new Error('Condition not met within timeout');
  }
  
  static async waitForElement(selector, timeout = 5000) {
    return this.waitFor(() => document.querySelector(selector), timeout);
  }
  
  // Mock factories
  static createMockContext() {
    return {
      getService: jest.fn((name) => {
        const services = {
          'state': new MockStateManager(),
          'audio': new MockAudioEngine(),
          'eventBus': new MockEventBus(),
          'sanitizer': new MockSanitizer()
        };
        return services[name];
      }),
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn()
    };
  }
  
  // Performance test utilities
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
  
  // Memory leak detection
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
  
  // Visual regression utilities
  static async captureScreenshot(element = document.body) {
    // Mock implementation - would use actual screenshot library in real tests
    return `screenshot-${Date.now()}.png`;
  }
  
  // Cleanup utilities
  static cleanup() {
    document.body.innerHTML = '';
    jest.clearAllMocks();
    localStorage.clear();
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
    this.history.push(oldState);
    
    // Notify listeners
    this.listeners.forEach(listener => listener(newState, oldState));
    return true;
  }
  
  on(event, handler) {
    this.listeners.set(event, handler);
    return () => this.listeners.delete(event);
  }
}

export class MockAudioEngine {
  constructor() {
    this.sounds = new Map();
    this.playHistory = [];
  }
  
  async playSound(name) {
    this.playHistory.push(name);
    return Promise.resolve();
  }
  
  getPlayHistory() {
    return [...this.playHistory];
  }
}

export class MockEventBus {
  constructor() {
    this.events = new Map();
  }
  
  emit(event, data) {
    const handlers = this.events.get(event) || [];
    handlers.forEach(handler => handler(data));
  }
  
  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(handler);
  }
}

export class MockSanitizer {
  sanitizeAgentName(input) {
    if (!input || input.length > 30) {
      throw new Error('Invalid input');
    }
    return input.trim();
  }
  
  escapeHtml(str) {
    return str.replace(/[&<>"']/g, (match) => {
      const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
      return entities[match];
    });
  }
}
```

### Phase 2: Unit Testing Implementation (Week 2)

#### Step 2.1: Configuration and State Management Tests
```javascript
// tests/unit/config.test.js
import { CONFIG } from '../../js/config.js';

describe('Configuration', () => {
  test('should have all required timing values', () => {
    expect(CONFIG.timing).toBeDefined();
    expect(CONFIG.timing.immediate).toBe(0);
    expect(CONFIG.timing.cinematic).toBe(1200);
    expect(CONFIG.timing.stageReveal).toBe(1200);
  });
  
  test('should have consistent color scheme', () => {
    expect(CONFIG.colors).toBeDefined();
    expect(CONFIG.colors.primary).toBe('#00ff00');
    expect(CONFIG.colors.secondary).toBe('#00ff88');
  });
  
  test('should freeze configuration to prevent mutations', () => {
    expect(() => {
      CONFIG.timing.immediate = 100;
    }).toThrow();
  });
  
  test('should have mobile-responsive settings', () => {
    expect(CONFIG.screen.mobile.breakpoint).toBe(768);
    expect(CONFIG.screen.mobile.terminalWidth).toBeGreaterThan(0);
  });
});

// tests/unit/state-manager.test.js
import { StateManager } from '../../js/state.js';
import { TestHelpers } from '../utils/test-helpers.js';

describe('StateManager', () => {
  let stateManager;
  
  beforeEach(() => {
    stateManager = new StateManager();
  });
  
  afterEach(() => {
    TestHelpers.cleanup();
  });
  
  test('should initialize with loading state', () => {
    expect(stateManager.getCurrentState()).toBe('loading');
  });
  
  test('should transition between valid states', async () => {
    await stateManager.transition('auth');
    expect(stateManager.getCurrentState()).toBe('auth');
    
    await stateManager.transition('mission');
    expect(stateManager.getCurrentState()).toBe('mission');
  });
  
  test('should reject invalid state transitions', async () => {
    await expect(stateManager.transition('invalid-state')).rejects.toThrow();
  });
  
  test('should maintain state history', async () => {
    await stateManager.transition('auth');
    await stateManager.transition('mission');
    
    const history = stateManager.getStateHistory();
    expect(history).toContain('loading');
    expect(history).toContain('auth');
  });
  
  test('should notify listeners on state change', async () => {
    const listener = jest.fn();
    stateManager.on('stateChange', listener);
    
    await stateManager.transition('auth');
    
    expect(listener).toHaveBeenCalledWith('auth', 'loading');
  });
  
  test('should validate transition permissions', async () => {
    // Can't go directly from loading to mission
    await expect(stateManager.transition('mission')).rejects.toThrow();
    
    // Must go through auth first
    await stateManager.transition('auth');
    await stateManager.transition('mission');
    expect(stateManager.getCurrentState()).toBe('mission');
  });
});
```

#### Step 2.2: Screen Controller Tests
```javascript
// tests/unit/auth-screen.test.js
import { AuthScreen } from '../../js/screens/auth-screen.js';
import { TestHelpers, MockSanitizer } from '../utils/test-helpers.js';

describe('AuthScreen', () => {
  let authScreen;
  let mockContext;
  let screenElement;
  
  beforeEach(() => {
    screenElement = TestHelpers.createMockScreen('auth-screen');
    screenElement.innerHTML = `
      <form id="auth-form">
        <input id="agent-name-input" type="text" />
        <button type="submit">Submit</button>
      </form>
      <div id="error-display"></div>
    `;
    
    mockContext = TestHelpers.createMockContext();
    authScreen = new AuthScreen('auth-screen', mockContext);
  });
  
  afterEach(() => {
    TestHelpers.cleanup();
  });
  
  test('should initialize with correct screen ID', () => {
    expect(authScreen.screenId).toBe('auth-screen');
  });
  
  test('should setup event listeners on initialization', async () => {
    await authScreen.initialize();
    
    const form = document.getElementById('auth-form');
    expect(form).toBeDefined();
  });
  
  test('should sanitize and validate agent name input', async () => {
    await authScreen.initialize();
    
    const input = document.getElementById('agent-name-input');
    const form = document.getElementById('auth-form');
    
    TestHelpers.simulateUserInput(input, 'Valid Agent Name');
    
    const submitEvent = new Event('submit');
    form.dispatchEvent(submitEvent);
    
    expect(mockContext.getService('sanitizer').sanitizeAgentName)
      .toHaveBeenCalledWith('Valid Agent Name');
  });
  
  test('should show error for invalid input', async () => {
    await authScreen.initialize();
    
    const mockSanitizer = mockContext.getService('sanitizer');
    mockSanitizer.sanitizeAgentName = jest.fn().mockImplementation(() => {
      throw new Error('Invalid input');
    });
    
    const input = document.getElementById('agent-name-input');
    const form = document.getElementById('auth-form');
    
    TestHelpers.simulateUserInput(input, '<script>alert("xss")</script>');
    
    const submitEvent = new Event('submit');
    form.dispatchEvent(submitEvent);
    
    await TestHelpers.waitFor(() => {
      const errorDisplay = document.getElementById('error-display');
      return errorDisplay.classList.contains('visible');
    });
    
    const errorDisplay = document.getElementById('error-display');
    expect(errorDisplay.textContent).toContain('Invalid input');
  });
  
  test('should clean up resources on destruction', async () => {
    await authScreen.initialize();
    
    const cleanupSpy = jest.spyOn(authScreen, 'cleanup');
    await authScreen.cleanup();
    
    expect(cleanupSpy).toHaveBeenCalled();
  });
  
  test('should handle sequential revelation stages', async () => {
    await authScreen.initialize();
    
    const stages = [
      '.auth-stage-1-hidden',
      '.auth-stage-2-hidden',
      '.auth-stage-3-hidden'
    ];
    
    stages.forEach(stage => {
      const elements = document.querySelectorAll(stage);
      expect(elements.length).toBeGreaterThan(0);
    });
  });
});

// tests/unit/mission-screen.test.js
import { MissionScreen } from '../../js/screens/mission-screen.js';
import { TestHelpers } from '../utils/test-helpers.js';

describe('MissionScreen', () => {
  let missionScreen;
  let mockContext;
  let screenElement;
  
  beforeEach(() => {
    screenElement = TestHelpers.createMockScreen('mission-screen');
    screenElement.innerHTML = `
      <div class="signal-bars">
        <div class="bar" data-bar="1"></div>
        <div class="bar" data-bar="2"></div>
        <div class="bar" data-bar="3"></div>
        <div class="bar" data-bar="4"></div>
        <div class="bar" data-bar="5"></div>
      </div>
      <button class="mission-button accept-button">Accept</button>
      <button class="mission-button decline-button">Decline</button>
    `;
    
    mockContext = TestHelpers.createMockContext();
    missionScreen = new MissionScreen('mission-screen', mockContext);
  });
  
  afterEach(() => {
    TestHelpers.cleanup();
  });
  
  test('should animate signal bars on initialization', async () => {
    await missionScreen.initialize();
    
    // Wait for signal animation to start
    await TestHelpers.waitFor(() => {
      const bars = document.querySelectorAll('.signal-bars .bar.bouncing');
      return bars.length > 0;
    });
    
    const animatedBars = document.querySelectorAll('.signal-bars .bar.bouncing');
    expect(animatedBars.length).toBeGreaterThan(0);
  });
  
  test('should emit mission selected event on accept', async () => {
    await missionScreen.initialize();
    
    const acceptButton = document.querySelector('.accept-button');
    TestHelpers.simulateClick(acceptButton);
    
    expect(mockContext.emit).toHaveBeenCalledWith(
      'mission:selected',
      expect.objectContaining({ mission: 'accepted' })
    );
  });
  
  test('should emit mission declined event on decline', async () => {
    await missionScreen.initialize();
    
    const declineButton = document.querySelector('.decline-button');
    TestHelpers.simulateClick(declineButton);
    
    expect(mockContext.emit).toHaveBeenCalledWith(
      'mission:declined',
      expect.objectContaining({ mission: 'declined' })
    );
  });
  
  test('should stop animations when screen is hidden', async () => {
    await missionScreen.initialize();
    await missionScreen.show();
    
    // Start animations
    await missionScreen.startSignalAnimation();
    
    // Hide screen
    await missionScreen.hide();
    
    // Check that animations are stopped
    const animatedBars = document.querySelectorAll('.signal-bars .bar.bouncing');
    expect(animatedBars.length).toBe(0);
  });
});
```

#### Step 2.3: Utility and Service Tests
```javascript
// tests/unit/sanitizer.test.js
import { InputSanitizer } from '../../js/security/sanitizer.js';

describe('InputSanitizer', () => {
  let sanitizer;
  
  beforeEach(() => {
    sanitizer = new InputSanitizer();
  });
  
  test('should escape HTML entities', () => {
    const input = '<script>alert("xss")</script>';
    const output = sanitizer.escapeHtml(input);
    expect(output).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });
  
  test('should validate agent name length', () => {
    expect(() => {
      sanitizer.sanitizeAgentName('');
    }).toThrow('Agent name cannot be empty');
    
    expect(() => {
      sanitizer.sanitizeAgentName('a'.repeat(31));
    }).toThrow('Agent name too long');
  });
  
  test('should allow valid agent names', () => {
    const validNames = [
      'Agent Smith',
      'john_doe',
      'Agent-007',
      'ValidName123'
    ];
    
    validNames.forEach(name => {
      expect(() => {
        sanitizer.sanitizeAgentName(name);
      }).not.toThrow();
    });
  });
  
  test('should reject invalid characters', () => {
    const invalidNames = [
      '<script>',
      'alert("xss")',
      'name\x00null',
      'name;DROP TABLE users;'
    ];
    
    invalidNames.forEach(name => {
      expect(() => {
        sanitizer.sanitizeAgentName(name);
      }).toThrow();
    });
  });
  
  test('should detect XSS patterns', () => {
    const xssInputs = [
      'javascript:alert(1)',
      'onclick="alert(1)"',
      '<script>evil()</script>',
      'eval("evil code")'
    ];
    
    xssInputs.forEach(input => {
      expect(sanitizer.containsXSSPatterns(input)).toBe(true);
    });
  });
});

// tests/unit/resource-manager.test.js
import { ResourceManager } from '../../js/performance/resource-manager.js';
import { TestHelpers } from '../utils/test-helpers.js';

describe('ResourceManager', () => {
  let resourceManager;
  
  beforeEach(() => {
    resourceManager = new ResourceManager();
  });
  
  afterEach(() => {
    resourceManager.cleanup();
    TestHelpers.cleanup();
  });
  
  test('should track setTimeout calls', () => {
    const callback = jest.fn();
    const id = resourceManager.setTimeout(callback, 100);
    
    expect(resourceManager.getResourceCount().timers).toBe(1);
    
    resourceManager.clearTimeout(id);
    expect(resourceManager.getResourceCount().timers).toBe(0);
  });
  
  test('should track event listeners', () => {
    const element = document.createElement('div');
    const handler = jest.fn();
    
    const id = resourceManager.addEventListener(element, 'click', handler);
    
    expect(resourceManager.getResourceCount().listeners).toBe(1);
    
    resourceManager.removeEventListener(id);
    expect(resourceManager.getResourceCount().listeners).toBe(0);
  });
  
  test('should clean up all resources', () => {
    // Create various resources
    resourceManager.setTimeout(() => {}, 1000);
    resourceManager.setInterval(() => {}, 1000);
    resourceManager.addEventListener(document.body, 'click', () => {});
    resourceManager.requestAnimationFrame(() => {});
    
    const before = resourceManager.getResourceCount();
    expect(before.timers + before.intervals + before.listeners + before.animations).toBeGreaterThan(0);
    
    resourceManager.cleanup();
    
    const after = resourceManager.getResourceCount();
    expect(after.timers + after.intervals + after.listeners + after.animations).toBe(0);
  });
  
  test('should detect memory leaks', async () => {
    const beforeSnapshot = TestHelpers.captureMemorySnapshot();
    
    // Simulate memory leak
    const leakyObjects = [];
    for (let i = 0; i < 1000; i++) {
      leakyObjects.push(new Array(1000).fill('memory leak'));
    }
    
    const afterSnapshot = TestHelpers.captureMemorySnapshot();
    
    if (beforeSnapshot && afterSnapshot) {
      const hasLeak = TestHelpers.detectMemoryLeak(beforeSnapshot, afterSnapshot, 1024 * 1024);
      expect(hasLeak).toBe(true);
    }
  });
});
```

### Phase 3: Integration Testing (Week 3)

#### Step 3.1: Screen Transition Tests
```javascript
// tests/integration/screen-transitions.test.js
import { App } from '../../js/app.js';
import { TestHelpers } from '../utils/test-helpers.js';

describe('Screen Transitions Integration', () => {
  let app;
  
  beforeEach(async () => {
    // Setup DOM structure
    document.body.innerHTML = `
      <div id="app-container">
        <div id="auth-screen" class="screen"></div>
        <div id="mission-screen" class="screen"></div>
        <div id="briefing-screen" class="screen"></div>
      </div>
    `;
    
    app = new App();
    await app.initialize();
  });
  
  afterEach(() => {
    TestHelpers.cleanup();
  });
  
  test('should complete full user journey', async () => {
    // Start at auth screen
    expect(app.getCurrentScreen()).toBe('auth');
    
    // Complete authentication
    await app.completeAuth('Test Agent');
    
    // Should transition to mission screen
    await TestHelpers.waitFor(() => app.getCurrentScreen() === 'mission');
    expect(app.getCurrentScreen()).toBe('mission');
    
    // Accept mission
    await app.acceptMission();
    
    // Should transition to briefing
    await TestHelpers.waitFor(() => app.getCurrentScreen() === 'briefing');
    expect(app.getCurrentScreen()).toBe('briefing');
  });
  
  test('should handle mission decline flow', async () => {
    await app.completeAuth('Test Agent');
    await TestHelpers.waitFor(() => app.getCurrentScreen() === 'mission');
    
    // Decline mission
    await app.declineMission();
    
    // Should transition to declined screen
    await TestHelpers.waitFor(() => app.getCurrentScreen() === 'declined');
    expect(app.getCurrentScreen()).toBe('declined');
  });
  
  test('should maintain state consistency during transitions', async () => {
    const stateHistory = [];
    
    app.state.on('stateChange', (newState) => {
      stateHistory.push(newState);
    });
    
    await app.completeAuth('Test Agent');
    await app.acceptMission();
    
    expect(stateHistory).toEqual(['auth', 'mission', 'briefing']);
  });
  
  test('should clean up previous screen resources', async () => {
    const authScreen = app.getScreen('auth');
    const cleanupSpy = jest.spyOn(authScreen, 'cleanup');
    
    await app.completeAuth('Test Agent');
    
    // Auth screen should be cleaned up when transitioning away
    expect(cleanupSpy).toHaveBeenCalled();
  });
});

// tests/integration/audio-visual-sync.test.js
import { AudioEngine } from '../../js/audio-engine.js';
import { CinematicEngine } from '../../js/cinematic.js';
import { TestHelpers } from '../utils/test-helpers.js';

describe('Audio-Visual Synchronization', () => {
  let audioEngine;
  let cinematicEngine;
  
  beforeEach(async () => {
    audioEngine = new AudioEngine();
    cinematicEngine = new CinematicEngine(audioEngine);
    
    await audioEngine.initialize();
  });
  
  afterEach(() => {
    TestHelpers.cleanup();
  });
  
  test('should synchronize typing animation with audio', async () => {
    const element = document.createElement('div');
    const text = 'Hello, Agent.';
    
    const audioPlaySpy = jest.spyOn(audioEngine, 'playSound');
    
    await cinematicEngine.typeText(element, text);
    
    // Should play keypress sound for each character (excluding spaces)
    const expectedSounds = text.replace(/\s/g, '').length;
    expect(audioPlaySpy).toHaveBeenCalledTimes(expectedSounds);
  });
  
  test('should coordinate state transitions with audio cues', async () => {
    const mockState = {
      transition: jest.fn().mockResolvedValue(true),
      getCurrentState: jest.fn().mockReturnValue('auth')
    };
    
    const audioPlaySpy = jest.spyOn(audioEngine, 'playSound');
    
    await cinematicEngine.transitionToScreen('mission', mockState);
    
    expect(audioPlaySpy).toHaveBeenCalledWith('state-transition');
    expect(mockState.transition).toHaveBeenCalledWith('mission');
  });
  
  test('should handle audio failures gracefully', async () => {
    // Mock audio failure
    audioEngine.playSound = jest.fn().mockRejectedValue(new Error('Audio failed'));
    
    const element = document.createElement('div');
    
    // Should not throw despite audio failure
    await expect(
      cinematicEngine.typeText(element, 'Test text')
    ).resolves.not.toThrow();
    
    // Text should still be displayed
    expect(element.textContent).toBe('Test text');
  });
});
```

### Phase 4: End-to-End Testing (Week 4)

#### Step 4.1: Cypress E2E Tests
```javascript
// cypress/e2e/user-journey.cy.js
describe('Complete User Journey', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.viewport(1280, 720);
  });
  
  it('should complete successful mission flow', () => {
    // Boot sequence
    cy.get('.boot-sequence-container').should('be.visible');
    cy.contains('INITIALIZING SECURE TERMINAL', { timeout: 10000 });
    
    // Auth screen
    cy.get('#auth-screen', { timeout: 15000 }).should('be.visible');
    cy.get('#agent-name-input').type('Test Agent');
    cy.get('button[type="submit"]').click();
    
    // Mission screen
    cy.get('#mission-screen', { timeout: 10000 }).should('be.visible');
    cy.get('.signal-bars .bar.bouncing').should('exist');
    cy.get('.accept-button').click();
    
    // Briefing screen
    cy.get('#briefing-screen', { timeout: 10000 }).should('be.visible');
    cy.contains('CLASSIFIED');
    cy.get('.action-button.primary').click();
    
    // Countdown screen
    cy.get('#countdown-screen', { timeout: 10000 }).should('be.visible');
    cy.get('.timer-digits').should('be.visible');
    
    // Wait for countdown completion
    cy.get('#credits-screen', { timeout: 65000 }).should('be.visible');
    cy.contains('MISSION COMPLETE');
  });
  
  it('should handle mission decline flow', () => {
    // Navigate to mission screen
    cy.get('#agent-name-input', { timeout: 15000 }).type('Test Agent');
    cy.get('button[type="submit"]').click();
    
    // Decline mission
    cy.get('#mission-screen', { timeout: 10000 }).should('be.visible');
    cy.get('.decline-button').click();
    
    // Should go to declined screen
    cy.get('#declined-screen', { timeout: 10000 }).should('be.visible');
    cy.contains('HONORABLE DISCHARGE');
  });
  
  it('should validate input sanitization', () => {
    cy.get('#agent-name-input', { timeout: 15000 }).type('<script>alert("xss")</script>');
    cy.get('button[type="submit"]').click();
    
    // Should show error message
    cy.get('#error-display').should('be.visible');
    cy.get('#error-display').should('contain', 'Invalid input');
  });
  
  it('should work on mobile viewport', () => {
    cy.viewport('iphone-x');
    
    // Should display properly on mobile
    cy.get('#auth-screen', { timeout: 15000 }).should('be.visible');
    cy.get('.terminal-container').should('be.visible');
    
    // Form should be usable
    cy.get('#agent-name-input').type('Mobile Agent');
    cy.get('button[type="submit"]').click();
    
    cy.get('#mission-screen', { timeout: 10000 }).should('be.visible');
  });
  
  it('should maintain performance benchmarks', () => {
    cy.visit('/', {
      onBeforeLoad: (win) => {
        // Start performance monitoring
        win.performance.mark('start');
      }
    });
    
    // Measure time to interactive
    cy.get('#agent-name-input', { timeout: 15000 }).should('be.visible');
    
    cy.window().then((win) => {
      win.performance.mark('interactive');
      win.performance.measure('time-to-interactive', 'start', 'interactive');
      
      const measure = win.performance.getEntriesByName('time-to-interactive')[0];
      expect(measure.duration).to.be.lessThan(3000); // 3 seconds max
    });
  });
});

// cypress/e2e/accessibility.cy.js
describe('Accessibility Testing', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.injectAxe();
  });
  
  it('should meet WCAG accessibility standards', () => {
    cy.get('#auth-screen', { timeout: 15000 });
    cy.checkA11y();
  });
  
  it('should support keyboard navigation', () => {
    cy.get('body').tab();
    cy.focused().should('have.id', 'agent-name-input');
    
    cy.focused().type('Keyboard User');
    cy.focused().tab();
    cy.focused().should('have.attr', 'type', 'submit');
    
    cy.focused().press('Enter');
    cy.get('#mission-screen', { timeout: 10000 }).should('be.visible');
  });
  
  it('should respect reduced motion preferences', () => {
    cy.visit('/', {
      onBeforeLoad: (win) => {
        // Mock reduced motion preference
        win.matchMedia = cy.stub().returns({
          matches: true,
          addEventListener: cy.stub(),
          removeEventListener: cy.stub()
        });
      }
    });
    
    // Animations should be reduced or disabled
    cy.get('.signal-bars .bar').should('not.have.class', 'bouncing');
  });
});
```

#### Step 4.2: Visual Regression Testing
```javascript
// tests/visual/visual-regression.spec.js
import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('auth screen appearance', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#auth-screen', { timeout: 15000 });
    
    // Wait for all animations to complete
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveScreenshot('auth-screen.png');
  });
  
  test('mission screen with signal animation', async ({ page }) => {
    await page.goto('/');
    
    // Complete auth flow
    await page.waitForSelector('#agent-name-input', { timeout: 15000 });
    await page.fill('#agent-name-input', 'Visual Test Agent');
    await page.click('button[type="submit"]');
    
    // Wait for mission screen
    await page.waitForSelector('#mission-screen', { timeout: 10000 });
    await page.waitForSelector('.signal-bars .bar.bouncing');
    
    // Capture with animation
    await expect(page).toHaveScreenshot('mission-screen-animated.png');
  });
  
  test('mobile layout consistency', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    await page.goto('/');
    await page.waitForSelector('#auth-screen', { timeout: 15000 });
    
    await expect(page).toHaveScreenshot('auth-screen-mobile.png');
  });
  
  test('dark mode compatibility', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.waitForSelector('#auth-screen', { timeout: 15000 });
    
    await expect(page).toHaveScreenshot('auth-screen-dark.png');
  });
  
  test('high contrast mode', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await page.goto('/');
    await page.waitForSelector('#auth-screen', { timeout: 15000 });
    
    await expect(page).toHaveScreenshot('auth-screen-high-contrast.png');
  });
});
```

### Implementation Checklist

#### Week 1: Infrastructure
- [ ] Install and configure Jest testing framework
- [ ] Create test utilities and mock factories
- [ ] Set up Cypress for E2E testing
- [ ] Configure Playwright for visual testing
- [ ] Create test database and fixtures
- [ ] Set up CI/CD pipeline integration

#### Week 2: Unit Tests
- [ ] Write configuration and utilities tests
- [ ] Create state management tests
- [ ] Implement screen controller tests
- [ ] Add security and sanitization tests
- [ ] Write performance and memory tests
- [ ] Achieve 80%+ code coverage

#### Week 3: Integration Tests
- [ ] Create screen transition tests
- [ ] Test audio-visual synchronization
- [ ] Validate error handling flows
- [ ] Test resource management integration
- [ ] Verify state consistency
- [ ] Performance integration testing

#### Week 4: E2E and Visual Tests
- [ ] Complete user journey tests
- [ ] Mobile responsiveness validation
- [ ] Accessibility compliance testing
- [ ] Visual regression test suite
- [ ] Performance benchmarking
- [ ] Cross-browser compatibility

#### Week 5: Security and Load Testing
- [ ] Security vulnerability scanning
- [ ] XSS and injection testing
- [ ] Load and stress testing
- [ ] Memory leak detection
- [ ] Documentation and training
- [ ] Test automation optimization

### Success Metrics
- **Code Coverage**: 80%+ line coverage, 70%+ branch coverage
- **Test Reliability**: <5% flaky test rate
- **Performance**: All tests complete in <10 minutes
- **Security**: Zero critical vulnerabilities detected
- **Accessibility**: WCAG 2.1 AA compliance
- **Cross-browser**: 95%+ test pass rate on Chrome, Firefox, Safari, Edge

### CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots

  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install
      - run: npm run test:visual

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm audit
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### Monitoring and Maintenance
1. **Automated Test Execution**: All tests run on every commit
2. **Performance Monitoring**: Track test execution times
3. **Coverage Tracking**: Monitor code coverage trends
4. **Flaky Test Detection**: Identify and fix unreliable tests
5. **Test Documentation**: Maintain comprehensive test documentation
6. **Regular Updates**: Keep testing frameworks and tools current