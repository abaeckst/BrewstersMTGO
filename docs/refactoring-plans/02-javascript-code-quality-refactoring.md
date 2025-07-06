# JavaScript Code Quality Refactoring Plan

## Overview
The JavaScript codebase has 50+ console.log statements, magic numbers throughout, weak error handling, and potential memory leaks. This plan provides a systematic approach to improve code quality and maintainability.

## Current Issues
1. **Debug Statements**: 50+ console.log calls in production
2. **Magic Numbers**: Hardcoded delays (500ms, 800ms, 1200ms) everywhere
3. **Error Handling**: Silent failures with only console warnings
4. **Memory Leaks**: Event listeners and timers not cleaned up
5. **Inconsistent Patterns**: Mix of async/await and setTimeout

## Refactoring Strategy

### Phase 1: Configuration & Constants (Week 1)

#### Step 1.1: Create Configuration Module
```javascript
// js/config.js
export const CONFIG = {
  // Timing configurations
  timing: {
    immediate: 0,
    fast: 200,
    normal: 500,
    slow: 800,
    cinematic: 1200,
    dramatic: 2000,
    bootMessage: 800,
    stageReveal: 1200,
    transitionDuration: 1000
  },
  
  // Animation settings
  animation: {
    fps: 60,
    easing: 'ease-out',
    signalBounce: {
      duration: 600,
      height: 10
    }
  },
  
  // Audio settings
  audio: {
    defaultVolume: 0.7,
    fadeInDuration: 200,
    fadeOutDuration: 500
  },
  
  // Screen dimensions
  screen: {
    mobile: {
      breakpoint: 768,
      terminalWidth: 600
    },
    desktop: {
      maxWidth: 1200,
      terminalWidth: 800
    }
  },
  
  // Storage keys
  storage: {
    agentName: 'brewsters-mtgo-agent',
    soundEnabled: 'brewsters-mtgo-sound',
    missionChoice: 'brewsters-mtgo-mission'
  },
  
  // Debug settings
  debug: {
    enabled: location.search.includes('debug'),
    logLevel: 'info', // 'error' | 'warn' | 'info' | 'debug'
    showTimings: true,
    showStateTransitions: true
  }
};

// Freeze config to prevent accidental mutations
Object.freeze(CONFIG);
```

#### Step 1.2: Replace Magic Numbers
```javascript
// Before
setTimeout(() => {
  this.revealNextElement();
}, 1200);

// After
import { CONFIG } from './config.js';

setTimeout(() => {
  this.revealNextElement();
}, CONFIG.timing.stageReveal);
```

### Phase 2: Debug System Implementation (Week 1)

#### Step 2.1: Create Debug Module
```javascript
// js/debug.js
import { CONFIG } from './config.js';

class DebugSystem {
  constructor() {
    this.enabled = CONFIG.debug.enabled;
    this.logLevel = CONFIG.debug.logLevel;
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }
  
  error(message, ...args) {
    if (this.shouldLog('error')) {
      console.error(`❌ ${message}`, ...args);
    }
  }
  
  warn(message, ...args) {
    if (this.shouldLog('warn')) {
      console.warn(`⚠️ ${message}`, ...args);
    }
  }
  
  info(message, ...args) {
    if (this.shouldLog('info')) {
      console.info(`ℹ️ ${message}`, ...args);
    }
  }
  
  debug(message, ...args) {
    if (this.shouldLog('debug')) {
      console.log(`🔍 ${message}`, ...args);
    }
  }
  
  time(label) {
    if (this.enabled && CONFIG.debug.showTimings) {
      console.time(label);
    }
  }
  
  timeEnd(label) {
    if (this.enabled && CONFIG.debug.showTimings) {
      console.timeEnd(label);
    }
  }
  
  shouldLog(level) {
    if (!this.enabled) return false;
    return this.levels[level] <= this.levels[this.logLevel];
  }
  
  // Production-safe debug groups
  group(label) {
    if (this.enabled) console.group(label);
  }
  
  groupEnd() {
    if (this.enabled) console.groupEnd();
  }
}

export const Debug = new DebugSystem();
```

#### Step 2.2: Replace Console.log Statements
```javascript
// Before
console.log('🎬 Starting boot sequence...');
console.warn(`⚠️ Invalid state transition: ${oldState} -> ${newState}`);

// After
import { Debug } from './debug.js';

Debug.info('Starting boot sequence...');
Debug.warn(`Invalid state transition: ${oldState} -> ${newState}`);
```

### Phase 3: Error Handling System (Week 2)

#### Step 3.1: Create Error Classes
```javascript
// js/errors.js
export class AppError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }
}

export class StateError extends AppError {
  constructor(message, currentState, attemptedState) {
    super(message, 'STATE_ERROR', { currentState, attemptedState });
    this.name = 'StateError';
  }
}

export class AudioError extends AppError {
  constructor(message, soundName) {
    super(message, 'AUDIO_ERROR', { soundName });
    this.name = 'AudioError';
  }
}

export class ValidationError extends AppError {
  constructor(message, field, value) {
    super(message, 'VALIDATION_ERROR', { field, value });
    this.name = 'ValidationError';
  }
}
```

#### Step 3.2: Implement Error Boundary
```javascript
// js/error-handler.js
import { Debug } from './debug.js';

export class ErrorHandler {
  constructor() {
    this.errorCallbacks = new Map();
    this.setupGlobalHandler();
  }
  
  setupGlobalHandler() {
    window.addEventListener('error', (event) => {
      this.handleError(event.error);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason);
    });
  }
  
  handleError(error) {
    Debug.error('Application error:', error);
    
    // Log to error tracking service in production
    if (!CONFIG.debug.enabled) {
      this.logToService(error);
    }
    
    // Show user-friendly error
    this.showUserError(error);
    
    // Execute error callbacks
    const callbacks = this.errorCallbacks.get(error.constructor) || [];
    callbacks.forEach(callback => callback(error));
  }
  
  showUserError(error) {
    const errorDisplay = document.getElementById('error-display');
    if (!errorDisplay) return;
    
    const message = this.getUserMessage(error);
    errorDisplay.textContent = message;
    errorDisplay.classList.add('visible');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorDisplay.classList.remove('visible');
    }, 5000);
  }
  
  getUserMessage(error) {
    const messages = {
      STATE_ERROR: 'System state error. Please refresh the page.',
      AUDIO_ERROR: 'Audio playback failed. Check your sound settings.',
      VALIDATION_ERROR: 'Invalid input. Please check your entry.',
      NETWORK_ERROR: 'Connection failed. Please check your internet.',
      DEFAULT: 'An unexpected error occurred. Please try again.'
    };
    
    return messages[error.code] || messages.DEFAULT;
  }
  
  registerErrorHandler(ErrorClass, callback) {
    if (!this.errorCallbacks.has(ErrorClass)) {
      this.errorCallbacks.set(ErrorClass, []);
    }
    this.errorCallbacks.get(ErrorClass).push(callback);
  }
  
  async tryCatch(fn, fallback = null) {
    try {
      return await fn();
    } catch (error) {
      this.handleError(error);
      return fallback;
    }
  }
  
  logToService(error) {
    // Implement error logging service integration
    // e.g., Sentry, LogRocket, etc.
  }
}

export const errorHandler = new ErrorHandler();
```

#### Step 3.3: Wrap Operations in Error Handling
```javascript
// Before
async playSound(soundName) {
  const audio = this.sounds.get(soundName);
  if (!audio) {
    console.warn(`Sound not found: ${soundName}`);
    return;
  }
  await audio.play();
}

// After
async playSound(soundName) {
  return errorHandler.tryCatch(async () => {
    const audio = this.sounds.get(soundName);
    if (!audio) {
      throw new AudioError(`Sound not found: ${soundName}`, soundName);
    }
    await audio.play();
  });
}
```

### Phase 4: Memory Management (Week 2)

#### Step 4.1: Create Resource Manager
```javascript
// js/resource-manager.js
export class ResourceManager {
  constructor() {
    this.timers = new Set();
    this.intervals = new Set();
    this.listeners = new Map();
    this.animations = new Set();
  }
  
  // Timer management
  setTimeout(callback, delay) {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      callback();
    }, delay);
    this.timers.add(timer);
    return timer;
  }
  
  clearTimeout(timer) {
    if (this.timers.has(timer)) {
      clearTimeout(timer);
      this.timers.delete(timer);
    }
  }
  
  // Interval management
  setInterval(callback, delay) {
    const interval = setInterval(callback, delay);
    this.intervals.add(interval);
    return interval;
  }
  
  clearInterval(interval) {
    if (this.intervals.has(interval)) {
      clearInterval(interval);
      this.intervals.delete(interval);
    }
  }
  
  // Event listener management
  addEventListener(element, event, handler, options) {
    if (!this.listeners.has(element)) {
      this.listeners.set(element, new Map());
    }
    
    const elementListeners = this.listeners.get(element);
    if (!elementListeners.has(event)) {
      elementListeners.set(event, new Set());
    }
    
    elementListeners.get(event).add({ handler, options });
    element.addEventListener(event, handler, options);
  }
  
  removeEventListener(element, event, handler) {
    const elementListeners = this.listeners.get(element);
    if (!elementListeners) return;
    
    const eventHandlers = elementListeners.get(event);
    if (!eventHandlers) return;
    
    eventHandlers.forEach(({ handler: h, options }) => {
      if (h === handler) {
        element.removeEventListener(event, h, options);
        eventHandlers.delete({ handler: h, options });
      }
    });
  }
  
  // Animation management
  requestAnimationFrame(callback) {
    const id = requestAnimationFrame((timestamp) => {
      this.animations.delete(id);
      callback(timestamp);
    });
    this.animations.add(id);
    return id;
  }
  
  cancelAnimationFrame(id) {
    if (this.animations.has(id)) {
      cancelAnimationFrame(id);
      this.animations.delete(id);
    }
  }
  
  // Cleanup all resources
  cleanup() {
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    
    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    
    // Remove all event listeners
    this.listeners.forEach((events, element) => {
      events.forEach((handlers, event) => {
        handlers.forEach(({ handler, options }) => {
          element.removeEventListener(event, handler, options);
        });
      });
    });
    this.listeners.clear();
    
    // Cancel all animations
    this.animations.forEach(id => cancelAnimationFrame(id));
    this.animations.clear();
  }
}
```

#### Step 4.2: Base Screen Class with Cleanup
```javascript
// js/base-screen.js
import { ResourceManager } from './resource-manager.js';
import { Debug } from './debug.js';

export class BaseScreen {
  constructor(screenId) {
    this.screenId = screenId;
    this.element = document.getElementById(screenId);
    this.resources = new ResourceManager();
    this.active = false;
  }
  
  // Lifecycle methods
  async initialize() {
    Debug.info(`Initializing ${this.screenId}`);
    this.setupEventListeners();
  }
  
  async show() {
    Debug.info(`Showing ${this.screenId}`);
    this.active = true;
    this.element.classList.add('visible');
  }
  
  async hide() {
    Debug.info(`Hiding ${this.screenId}`);
    this.active = false;
    this.element.classList.remove('visible');
  }
  
  async cleanup() {
    Debug.info(`Cleaning up ${this.screenId}`);
    this.resources.cleanup();
    this.active = false;
  }
  
  // Resource-managed methods
  setTimeout(callback, delay) {
    return this.resources.setTimeout(callback, delay);
  }
  
  setInterval(callback, delay) {
    return this.resources.setInterval(callback, delay);
  }
  
  addEventListener(element, event, handler, options) {
    this.resources.addEventListener(element, event, handler, options);
  }
  
  requestAnimationFrame(callback) {
    return this.resources.requestAnimationFrame(callback);
  }
  
  // Utility methods
  async delay(ms) {
    return new Promise(resolve => this.setTimeout(resolve, ms));
  }
  
  querySelector(selector) {
    return this.element.querySelector(selector);
  }
  
  querySelectorAll(selector) {
    return this.element.querySelectorAll(selector);
  }
  
  // Abstract methods to implement
  setupEventListeners() {
    throw new Error('setupEventListeners must be implemented');
  }
}
```

### Phase 5: Async Pattern Standardization (Week 3)

#### Step 5.1: Create Async Utilities
```javascript
// js/async-utils.js
export class AsyncQueue {
  constructor() {
    this.queue = [];
    this.running = false;
  }
  
  async add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      if (!this.running) {
        this.process();
      }
    });
  }
  
  async process() {
    if (this.queue.length === 0) {
      this.running = false;
      return;
    }
    
    this.running = true;
    const { fn, resolve, reject } = this.queue.shift();
    
    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    }
    
    this.process();
  }
}

export async function retry(fn, options = {}) {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 2,
    onRetry = () => {}
  } = options;
  
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxAttempts) {
        throw error;
      }
      
      const waitTime = delay * Math.pow(backoff, attempt - 1);
      onRetry(attempt, waitTime, error);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
}

export function debounce(fn, delay) {
  let timeoutId;
  
  return function debounced(...args) {
    clearTimeout(timeoutId);
    
    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        resolve(fn.apply(this, args));
      }, delay);
    });
  };
}

export function throttle(fn, limit) {
  let inThrottle;
  let lastResult;
  
  return function throttled(...args) {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = fn.apply(this, args);
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    
    return lastResult;
  };
}
```

#### Step 5.2: Standardize Async Patterns
```javascript
// Before - Mixed patterns
function showScreen() {
  setTimeout(() => {
    element.classList.add('visible');
    setTimeout(() => {
      this.startAnimation();
    }, 500);
  }, 1200);
}

// After - Consistent async/await
async showScreen() {
  await this.delay(CONFIG.timing.cinematic);
  element.classList.add('visible');
  await this.delay(CONFIG.timing.normal);
  await this.startAnimation();
}
```

### Implementation Checklist

#### Week 1: Foundation
- [ ] Create config.js with all timing constants
- [ ] Create debug.js module
- [ ] Replace 25% of console.logs with Debug calls
- [ ] Replace 25% of magic numbers with config values

#### Week 2: Error Handling & Memory
- [ ] Implement error classes and handler
- [ ] Create ResourceManager class
- [ ] Implement BaseScreen class
- [ ] Migrate 2 screens to use BaseScreen

#### Week 3: Async Patterns
- [ ] Create async utilities module
- [ ] Standardize all setTimeout to async/await
- [ ] Implement retry logic for critical operations
- [ ] Add debounce/throttle to user inputs

#### Week 4: Full Migration
- [ ] Complete console.log replacement
- [ ] Complete magic number replacement
- [ ] Migrate all screens to BaseScreen
- [ ] Add error handling to all async operations

#### Week 5: Testing & Documentation
- [ ] Write unit tests for utilities
- [ ] Create integration tests for error handling
- [ ] Document new patterns and conventions
- [ ] Performance testing and optimization

### Success Metrics
- Reduce console.log statements from 50+ to 0 in production
- Replace 100% of magic numbers with configuration
- Zero memory leaks in Chrome DevTools profiler
- 100% of async operations have error handling
- Reduce uncaught errors in production by 90%

### Code Review Checklist
- [ ] No hardcoded timing values
- [ ] No direct console.log usage
- [ ] All async operations use try/catch or errorHandler
- [ ] All screens extend BaseScreen
- [ ] Resources are cleaned up on screen transitions
- [ ] Error messages are user-friendly
- [ ] Debug logging uses appropriate levels

### Migration Guide
1. **Gradual Migration**: Use feature flags to roll out changes
2. **Compatibility Layer**: Keep old patterns working during transition
3. **Team Training**: Document new patterns with examples
4. **Automated Checks**: ESLint rules to enforce new patterns
5. **Monitoring**: Track errors and performance metrics