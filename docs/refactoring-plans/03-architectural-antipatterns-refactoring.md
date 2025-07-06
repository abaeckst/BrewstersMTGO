# Architectural Anti-patterns Refactoring Plan

## Overview
The codebase exhibits several architectural anti-patterns including God Objects (CinematicEngine 500+ lines), global state pollution, tight DOM coupling, and no abstraction layers. This plan outlines a systematic approach to refactor these issues.

## Current Issues
1. **God Object**: CinematicEngine handles boot sequences, transitions, typing, scrolling, animations
2. **Global State**: window.app, window.appState, window.AudioEngine exposed globally
3. **Tight DOM Coupling**: Direct element manipulation throughout, hardcoded IDs
4. **No Abstraction Layer**: Business logic mixed with presentation
5. **Inconsistent Module Boundaries**: Overlapping responsibilities between modules

## Refactoring Strategy

### Phase 1: Decompose God Objects (Week 1-2)

#### Step 1.1: Analyze CinematicEngine Responsibilities
Current CinematicEngine handles:
1. Boot sequence orchestration
2. Screen transitions
3. Text typing effects
4. Scroll management
5. Signal bar animations
6. Stage revelations
7. Mission-specific animations
8. Countdown timer
9. Credits sequence

#### Step 1.2: Create Focused Service Classes
```javascript
// js/services/boot-sequence-service.js
export class BootSequenceService {
  constructor(typingService, audioEngine) {
    this.typingService = typingService;
    this.audioEngine = audioEngine;
    this.messages = [
      'INITIALIZING SECURE TERMINAL...',
      'LOADING ENCRYPTION PROTOCOLS...',
      // ... other messages
    ];
  }
  
  async run(container) {
    for (const message of this.messages) {
      const element = this.createMessageElement();
      container.appendChild(element);
      await this.typingService.typeText(element, message);
      await this.delay(CONFIG.timing.bootMessage);
    }
  }
  
  createMessageElement() {
    const div = document.createElement('div');
    div.className = 'boot-message';
    return div;
  }
}

// js/services/typing-service.js
export class TypingService {
  constructor(audioEngine) {
    this.audioEngine = audioEngine;
    this.defaultSpeed = 30; // ms per character
  }
  
  async typeText(element, text, speed = this.defaultSpeed) {
    element.textContent = '';
    
    for (const char of text) {
      element.textContent += char;
      if (char !== ' ') {
        await this.audioEngine.playSound('keypress');
      }
      await this.delay(speed);
    }
  }
  
  async typeWithCursor(element, text, speed) {
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.textContent = '_';
    element.appendChild(cursor);
    
    await this.typeText(element, text, speed);
    cursor.remove();
  }
}

// js/services/transition-service.js
export class TransitionService {
  constructor() {
    this.transitions = new Map();
  }
  
  register(name, transition) {
    this.transitions.set(name, transition);
  }
  
  async execute(name, fromElement, toElement, options = {}) {
    const transition = this.transitions.get(name);
    if (!transition) {
      throw new Error(`Transition '${name}' not found`);
    }
    
    return transition.execute(fromElement, toElement, options);
  }
}

// js/services/animation-service.js
export class AnimationService {
  constructor() {
    this.animations = new Map();
    this.running = new Map();
  }
  
  register(name, animation) {
    this.animations.set(name, animation);
  }
  
  start(name, element, options = {}) {
    const animation = this.animations.get(name);
    if (!animation) {
      throw new Error(`Animation '${name}' not found`);
    }
    
    const controller = animation.start(element, options);
    this.running.set(`${name}-${element.id}`, controller);
    return controller;
  }
  
  stop(name, element) {
    const key = `${name}-${element.id}`;
    const controller = this.running.get(key);
    if (controller) {
      controller.stop();
      this.running.delete(key);
    }
  }
  
  stopAll() {
    this.running.forEach(controller => controller.stop());
    this.running.clear();
  }
}

// js/services/revelation-service.js
export class RevelationService {
  constructor(animationService) {
    this.animationService = animationService;
  }
  
  async revealSequence(elements, options = {}) {
    const {
      stageDelay = CONFIG.timing.stageReveal,
      animationClass = 'reveal',
      sequential = true
    } = options;
    
    if (sequential) {
      for (const element of elements) {
        await this.revealElement(element, animationClass);
        await this.delay(stageDelay);
      }
    } else {
      await Promise.all(
        elements.map(el => this.revealElement(el, animationClass))
      );
    }
  }
  
  async revealElement(element, animationClass) {
    element.classList.add(animationClass);
    await this.waitForAnimation(element);
  }
  
  async waitForAnimation(element) {
    return new Promise(resolve => {
      element.addEventListener('animationend', resolve, { once: true });
      element.addEventListener('transitionend', resolve, { once: true });
    });
  }
}
```

#### Step 1.3: Refactor CinematicEngine
```javascript
// js/cinematic-engine-refactored.js
export class CinematicEngine {
  constructor(dependencies) {
    this.bootService = dependencies.bootService;
    this.typingService = dependencies.typingService;
    this.transitionService = dependencies.transitionService;
    this.animationService = dependencies.animationService;
    this.revelationService = dependencies.revelationService;
  }
  
  // Delegate to appropriate services
  async runBootSequence(container) {
    return this.bootService.run(container);
  }
  
  async typeText(element, text, speed) {
    return this.typingService.typeText(element, text, speed);
  }
  
  async transitionScreens(from, to, type) {
    return this.transitionService.execute(type, from, to);
  }
  
  async startAnimation(name, element, options) {
    return this.animationService.start(name, element, options);
  }
  
  async revealElements(elements, options) {
    return this.revelationService.revealSequence(elements, options);
  }
}
```

### Phase 2: Eliminate Global State (Week 2)

#### Step 2.1: Create Dependency Injection Container
```javascript
// js/core/container.js
export class DIContainer {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
  }
  
  // Register a service factory
  register(name, factory, options = {}) {
    this.services.set(name, {
      factory,
      singleton: options.singleton || false,
      dependencies: options.dependencies || []
    });
  }
  
  // Get a service instance
  get(name) {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service '${name}' not registered`);
    }
    
    if (service.singleton) {
      if (!this.singletons.has(name)) {
        this.singletons.set(name, this.createInstance(service));
      }
      return this.singletons.get(name);
    }
    
    return this.createInstance(service);
  }
  
  // Create an instance with dependencies
  createInstance(service) {
    const deps = service.dependencies.map(dep => this.get(dep));
    return service.factory(...deps);
  }
  
  // Clear all singletons
  reset() {
    this.singletons.clear();
  }
}

// js/core/service-registry.js
import { DIContainer } from './container.js';
import { StateManager } from '../state.js';
import { AudioEngine } from '../audio-engine.js';
import { TypingService } from '../services/typing-service.js';
// ... other imports

export function createServiceRegistry() {
  const container = new DIContainer();
  
  // Register core services
  container.register('state', () => new StateManager(), { 
    singleton: true 
  });
  
  container.register('audio', () => new AudioEngine(), { 
    singleton: true 
  });
  
  container.register('typing', (audio) => new TypingService(audio), {
    dependencies: ['audio']
  });
  
  // Register screen controllers
  container.register('authScreen', (state, audio) => {
    return new AuthScreen(state, audio);
  }, {
    dependencies: ['state', 'audio']
  });
  
  // ... register other services
  
  return container;
}
```

#### Step 2.2: Replace Global Access
```javascript
// Before - Global state
window.app = new App();
window.appState = window.app.state;
window.AudioEngine = AudioEngine;

// After - Dependency injection
// js/main.js
import { createServiceRegistry } from './core/service-registry.js';
import { Application } from './application.js';

// Create service container
const container = createServiceRegistry();

// Create application with injected dependencies
const app = new Application(container);

// Start application
app.start().catch(error => {
  console.error('Application failed to start:', error);
});

// No global exposure - services accessed through container
```

#### Step 2.3: Create Application Context
```javascript
// js/core/app-context.js
export class AppContext {
  constructor(container) {
    this.container = container;
    this.eventBus = new EventTarget();
  }
  
  getService(name) {
    return this.container.get(name);
  }
  
  emit(event, data) {
    this.eventBus.dispatchEvent(
      new CustomEvent(event, { detail: data })
    );
  }
  
  on(event, handler) {
    this.eventBus.addEventListener(event, handler);
  }
  
  off(event, handler) {
    this.eventBus.removeEventListener(event, handler);
  }
}

// Pass context to screens instead of globals
export class BaseScreen {
  constructor(screenId, context) {
    this.screenId = screenId;
    this.context = context;
    this.state = context.getService('state');
    this.audio = context.getService('audio');
  }
}
```

### Phase 3: Abstract DOM Manipulation (Week 3)

#### Step 3.1: Create DOM Abstraction Layer
```javascript
// js/core/dom-manager.js
export class DOMManager {
  constructor() {
    this.cache = new Map();
  }
  
  // Element selection with caching
  select(selector, parent = document) {
    const key = `${parent.id || 'document'}-${selector}`;
    
    if (!this.cache.has(key)) {
      const element = parent.querySelector(selector);
      if (element) {
        this.cache.set(key, element);
      }
    }
    
    return this.cache.get(key);
  }
  
  selectAll(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
  }
  
  // Element creation
  create(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key.startsWith('on')) {
        const event = key.slice(2).toLowerCase();
        element.addEventListener(event, value);
      } else {
        element.setAttribute(key, value);
      }
    });
    
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
    
    return element;
  }
  
  // Batch DOM updates
  batch(updates) {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
    });
  }
  
  // Safe element operations
  addClass(element, ...classes) {
    if (element) element.classList.add(...classes);
  }
  
  removeClass(element, ...classes) {
    if (element) element.classList.remove(...classes);
  }
  
  toggleClass(element, className, force) {
    if (element) element.classList.toggle(className, force);
  }
  
  setText(element, text) {
    if (element) element.textContent = text;
  }
  
  setHTML(element, html) {
    if (element) element.innerHTML = html;
  }
  
  setStyle(element, styles) {
    if (element) Object.assign(element.style, styles);
  }
  
  show(element) {
    if (element) {
      element.style.display = '';
      element.classList.remove('hidden');
    }
  }
  
  hide(element) {
    if (element) {
      element.classList.add('hidden');
    }
  }
  
  // Clear cache when needed
  clearCache() {
    this.cache.clear();
  }
}

// js/core/component.js
export class Component {
  constructor(props = {}) {
    this.props = props;
    this.state = {};
    this.dom = new DOMManager();
    this.element = null;
  }
  
  setState(newState) {
    const oldState = this.state;
    this.state = { ...this.state, ...newState };
    this.onStateChange(oldState, this.state);
    this.render();
  }
  
  mount(container) {
    this.element = this.render();
    container.appendChild(this.element);
    this.onMount();
  }
  
  unmount() {
    this.onUnmount();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
  
  // Lifecycle methods
  onMount() {}
  onUnmount() {}
  onStateChange(oldState, newState) {}
  
  // Abstract render method
  render() {
    throw new Error('render() must be implemented');
  }
}
```

#### Step 3.2: Create UI Components
```javascript
// js/components/terminal-button.js
export class TerminalButton extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  
  render() {
    return this.dom.create('button', {
      className: `terminal-button ${this.props.variant || ''}`,
      onClick: this.handleClick
    }, [this.props.label]);
  }
  
  handleClick(event) {
    if (this.props.onClick) {
      this.props.onClick(event);
    }
  }
}

// js/components/typing-text.js
export class TypingText extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayedText: '',
      isTyping: false
    };
  }
  
  onMount() {
    if (this.props.autoStart) {
      this.startTyping();
    }
  }
  
  async startTyping() {
    this.setState({ isTyping: true });
    const { text, speed = 30, onComplete } = this.props;
    
    for (let i = 0; i <= text.length; i++) {
      this.setState({ displayedText: text.slice(0, i) });
      await this.delay(speed);
    }
    
    this.setState({ isTyping: false });
    if (onComplete) onComplete();
  }
  
  render() {
    const element = this.dom.create('div', {
      className: 'typing-text'
    });
    
    this.dom.setText(element, this.state.displayedText);
    
    if (this.state.isTyping) {
      const cursor = this.dom.create('span', {
        className: 'cursor'
      }, ['_']);
      element.appendChild(cursor);
    }
    
    return element;
  }
}
```

### Phase 4: Decouple Screen Communication (Week 4)

#### Step 4.1: Implement Event-Driven Architecture
```javascript
// js/core/event-bus.js
export class EventBus {
  constructor() {
    this.events = new Map();
  }
  
  on(event, handler, context = null) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    this.events.get(event).push({ handler, context });
    
    // Return unsubscribe function
    return () => this.off(event, handler, context);
  }
  
  once(event, handler, context = null) {
    const wrapper = (...args) => {
      handler.apply(context, args);
      this.off(event, wrapper, context);
    };
    
    return this.on(event, wrapper, context);
  }
  
  off(event, handler, context = null) {
    const handlers = this.events.get(event);
    if (!handlers) return;
    
    const index = handlers.findIndex(h => 
      h.handler === handler && h.context === context
    );
    
    if (index !== -1) {
      handlers.splice(index, 1);
    }
    
    if (handlers.length === 0) {
      this.events.delete(event);
    }
  }
  
  emit(event, ...args) {
    const handlers = this.events.get(event);
    if (!handlers) return;
    
    handlers.forEach(({ handler, context }) => {
      handler.apply(context, args);
    });
  }
  
  clear() {
    this.events.clear();
  }
}

// js/core/screen-events.js
export const ScreenEvents = {
  // Screen lifecycle
  SCREEN_INIT: 'screen:init',
  SCREEN_SHOW: 'screen:show',
  SCREEN_HIDE: 'screen:hide',
  SCREEN_DESTROY: 'screen:destroy',
  
  // User actions
  AUTH_COMPLETE: 'auth:complete',
  SOUND_TEST_COMPLETE: 'sound:test:complete',
  MISSION_SELECTED: 'mission:selected',
  MISSION_DECLINED: 'mission:declined',
  BRIEFING_ACCEPTED: 'briefing:accepted',
  COUNTDOWN_COMPLETE: 'countdown:complete',
  
  // System events
  STATE_CHANGE: 'state:change',
  ERROR_OCCURRED: 'error:occurred',
  ANIMATION_COMPLETE: 'animation:complete'
};
```

#### Step 4.2: Refactor Screen Communication
```javascript
// Before - Direct coupling
class MissionScreen {
  handleAccept() {
    window.app.state.transition('briefing');
    window.app.showBriefingScreen();
  }
}

// After - Event-driven
class MissionScreen extends BaseScreen {
  constructor(screenId, context) {
    super(screenId, context);
    this.eventBus = context.getService('eventBus');
  }
  
  handleAccept() {
    // Emit event instead of direct call
    this.eventBus.emit(ScreenEvents.MISSION_SELECTED, {
      mission: 'accepted',
      timestamp: Date.now()
    });
  }
}

// Application listens for events
class Application {
  constructor(container) {
    this.eventBus = container.get('eventBus');
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    this.eventBus.on(ScreenEvents.MISSION_SELECTED, (data) => {
      this.handleMissionSelected(data);
    });
  }
  
  async handleMissionSelected(data) {
    await this.state.transition('briefing');
    await this.screenManager.show('briefing', data);
  }
}
```

### Phase 5: Module Boundary Cleanup (Week 5)

#### Step 5.1: Define Clear Module Interfaces
```javascript
// js/modules/README.md
/**
 * Module Architecture
 * 
 * Core Modules (Foundation):
 * - container.js - Dependency injection
 * - event-bus.js - Event communication
 * - dom-manager.js - DOM abstraction
 * - app-context.js - Application context
 * 
 * Service Modules (Business Logic):
 * - state-manager.js - State machine
 * - audio-engine.js - Sound management
 * - storage-service.js - Local storage
 * - validation-service.js - Input validation
 * 
 * UI Modules (Presentation):
 * - screens/* - Screen controllers
 * - components/* - Reusable UI components
 * - animations/* - Animation definitions
 * - transitions/* - Screen transitions
 * 
 * Utility Modules (Helpers):
 * - config.js - Configuration
 * - debug.js - Debug logging
 * - async-utils.js - Async helpers
 * - errors.js - Error classes
 */

// js/modules/interfaces.js
export const ModuleInterfaces = {
  // State Manager Interface
  StateManager: {
    getCurrentState: () => String,
    getStateHistory: () => Array,
    canTransition: (to) => Boolean,
    transition: (to, data) => Promise,
    on: (event, handler) => Function,
    off: (event, handler) => void
  },
  
  // Audio Engine Interface
  AudioEngine: {
    init: () => Promise,
    playSound: (name, options) => Promise,
    stopSound: (name) => void,
    setVolume: (volume) => void,
    mute: () => void,
    unmute: () => void
  },
  
  // Screen Controller Interface
  ScreenController: {
    init: () => Promise,
    show: (data) => Promise,
    hide: () => Promise,
    destroy: () => Promise,
    isActive: () => Boolean
  }
};
```

### Implementation Checklist

#### Week 1-2: God Object Decomposition
- [ ] Create service classes for each responsibility
- [ ] Extract boot sequence logic
- [ ] Extract typing service
- [ ] Extract animation service
- [ ] Extract transition service
- [ ] Refactor CinematicEngine to use services
- [ ] Test each service independently

#### Week 2: Global State Elimination
- [ ] Implement dependency injection container
- [ ] Create service registry
- [ ] Replace window.app with DI
- [ ] Replace window.appState with context
- [ ] Replace window.AudioEngine with service
- [ ] Create application context
- [ ] Update all screen constructors

#### Week 3: DOM Abstraction
- [ ] Create DOMManager class
- [ ] Create base Component class
- [ ] Convert buttons to components
- [ ] Convert text displays to components
- [ ] Replace direct DOM manipulation
- [ ] Implement batch updates
- [ ] Add component lifecycle

#### Week 4: Screen Decoupling
- [ ] Implement EventBus
- [ ] Define screen events
- [ ] Replace direct screen calls with events
- [ ] Update state transitions to use events
- [ ] Create screen manager service
- [ ] Test event flow

#### Week 5: Module Boundaries
- [ ] Document module interfaces
- [ ] Create module dependency graph
- [ ] Enforce module boundaries
- [ ] Remove circular dependencies
- [ ] Create integration tests
- [ ] Update documentation

### Success Metrics
- CinematicEngine reduced from 500+ to <100 lines
- Zero global variables (no window pollution)
- 100% of DOM manipulation through abstraction
- All screen communication via events
- Clear module boundaries with no circular deps
- Improved testability (can mock all dependencies)

### Architecture Principles
1. **Single Responsibility**: Each class has one clear purpose
2. **Dependency Injection**: No hardcoded dependencies
3. **Interface Segregation**: Small, focused interfaces
4. **Event-Driven**: Loose coupling through events
5. **Abstraction Layers**: Business logic separate from UI

### Testing Strategy
```javascript
// Example unit test with mocked dependencies
describe('MissionScreen', () => {
  let screen, mockContext, mockEventBus;
  
  beforeEach(() => {
    mockEventBus = {
      emit: jest.fn(),
      on: jest.fn(),
      off: jest.fn()
    };
    
    mockContext = {
      getService: jest.fn((name) => {
        if (name === 'eventBus') return mockEventBus;
      })
    };
    
    screen = new MissionScreen('mission-screen', mockContext);
  });
  
  test('emits event on mission accept', () => {
    screen.handleAccept();
    
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      ScreenEvents.MISSION_SELECTED,
      expect.objectContaining({
        mission: 'accepted'
      })
    );
  });
});
```