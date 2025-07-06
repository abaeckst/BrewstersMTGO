# Performance & Memory Management Refactoring Plan

## Overview
The application has performance issues including memory leaks, inefficient DOM operations, unbounded animations, and no resource management. This plan addresses these issues to improve performance and user experience.

## Current Performance Issues
1. **Memory Leaks**: Event listeners and timers not cleaned up
2. **Inefficient DOM**: Multiple reflows, no batching
3. **Unbounded Animations**: Animations continue when screens hidden
4. **No Resource Management**: All assets loaded upfront
5. **Blocking Operations**: Synchronous operations blocking UI

## Refactoring Strategy

### Phase 1: Memory Leak Prevention (Week 1)

#### Step 1.1: Enhanced Resource Manager
```javascript
// js/performance/resource-manager.js
export class ResourceManager {
  constructor() {
    this.resources = {
      timers: new Map(),
      intervals: new Map(),
      listeners: new Map(),
      observers: new Map(),
      animations: new Map(),
      connections: new Map(),
      workers: new Map()
    };
    
    this.memoryTracker = new MemoryTracker();
    this.setupPerformanceMonitoring();
  }
  
  // Enhanced timer management with metadata
  setTimeout(callback, delay, label = 'anonymous') {
    const id = Date.now() + Math.random();
    const timer = {
      id,
      label,
      startTime: performance.now(),
      delay,
      callback: () => {
        this.resources.timers.delete(id);
        this.memoryTracker.recordTimerComplete(id);
        callback();
      }
    };
    
    const timeoutId = setTimeout(timer.callback, delay);
    timer.timeoutId = timeoutId;
    
    this.resources.timers.set(id, timer);
    this.memoryTracker.recordTimerStart(id, label, delay);
    
    return id;
  }
  
  clearTimeout(id) {
    const timer = this.resources.timers.get(id);
    if (timer) {
      clearTimeout(timer.timeoutId);
      this.resources.timers.delete(id);
      this.memoryTracker.recordTimerCancelled(id);
    }
  }
  
  // Enhanced interval management
  setInterval(callback, delay, label = 'anonymous') {
    const id = Date.now() + Math.random();
    const interval = {
      id,
      label,
      startTime: performance.now(),
      delay,
      executions: 0,
      callback: () => {
        interval.executions++;
        this.memoryTracker.recordIntervalExecution(id);
        callback();
      }
    };
    
    const intervalId = setInterval(interval.callback, delay);
    interval.intervalId = intervalId;
    
    this.resources.intervals.set(id, interval);
    this.memoryTracker.recordIntervalStart(id, label, delay);
    
    return id;
  }
  
  clearInterval(id) {
    const interval = this.resources.intervals.get(id);
    if (interval) {
      clearInterval(interval.intervalId);
      this.resources.intervals.delete(id);
      this.memoryTracker.recordIntervalComplete(id);
    }
  }
  
  // Enhanced event listener management
  addEventListener(element, event, handler, options = {}, label = 'anonymous') {
    const id = Date.now() + Math.random();
    const listener = {
      id,
      label,
      element,
      event,
      handler,
      options,
      startTime: performance.now(),
      executions: 0
    };
    
    const wrappedHandler = (...args) => {
      listener.executions++;
      this.memoryTracker.recordListenerExecution(id);
      handler(...args);
    };
    
    element.addEventListener(event, wrappedHandler, options);
    listener.wrappedHandler = wrappedHandler;
    
    this.resources.listeners.set(id, listener);
    this.memoryTracker.recordListenerStart(id, label, event);
    
    return id;
  }
  
  removeEventListener(id) {
    const listener = this.resources.listeners.get(id);
    if (listener) {
      listener.element.removeEventListener(
        listener.event,
        listener.wrappedHandler,
        listener.options
      );
      this.resources.listeners.delete(id);
      this.memoryTracker.recordListenerRemoved(id);
    }
  }
  
  // Animation frame management
  requestAnimationFrame(callback, label = 'anonymous') {
    const id = Date.now() + Math.random();
    const animation = {
      id,
      label,
      startTime: performance.now(),
      callback: (timestamp) => {
        this.resources.animations.delete(id);
        this.memoryTracker.recordAnimationComplete(id);
        callback(timestamp);
      }
    };
    
    const animationId = requestAnimationFrame(animation.callback);
    animation.animationId = animationId;
    
    this.resources.animations.set(id, animation);
    this.memoryTracker.recordAnimationStart(id, label);
    
    return id;
  }
  
  cancelAnimationFrame(id) {
    const animation = this.resources.animations.get(id);
    if (animation) {
      cancelAnimationFrame(animation.animationId);
      this.resources.animations.delete(id);
      this.memoryTracker.recordAnimationCancelled(id);
    }
  }
  
  // Intersection Observer management
  createObserver(callback, options = {}, label = 'anonymous') {
    const id = Date.now() + Math.random();
    const observer = new IntersectionObserver(callback, options);
    
    this.resources.observers.set(id, {
      id,
      label,
      observer,
      startTime: performance.now(),
      observations: 0
    });
    
    this.memoryTracker.recordObserverStart(id, label);
    
    return {
      id,
      observe: (element) => {
        observer.observe(element);
        this.resources.observers.get(id).observations++;
      },
      unobserve: (element) => observer.unobserve(element),
      disconnect: () => this.disconnectObserver(id)
    };
  }
  
  disconnectObserver(id) {
    const observer = this.resources.observers.get(id);
    if (observer) {
      observer.observer.disconnect();
      this.resources.observers.delete(id);
      this.memoryTracker.recordObserverDisconnected(id);
    }
  }
  
  // Resource monitoring
  getResourceCount() {
    return {
      timers: this.resources.timers.size,
      intervals: this.resources.intervals.size,
      listeners: this.resources.listeners.size,
      observers: this.resources.observers.size,
      animations: this.resources.animations.size,
      connections: this.resources.connections.size,
      workers: this.resources.workers.size
    };
  }
  
  // Performance monitoring
  setupPerformanceMonitoring() {
    // Monitor resource usage every 5 seconds
    this.monitoringInterval = setInterval(() => {
      this.memoryTracker.recordResourceSnapshot(this.getResourceCount());
    }, 5000);
  }
  
  // Comprehensive cleanup
  cleanup() {
    Debug.info('🧹 Starting resource cleanup...');
    
    // Clear all timers
    this.resources.timers.forEach(timer => {
      clearTimeout(timer.timeoutId);
    });
    this.resources.timers.clear();
    
    // Clear all intervals
    this.resources.intervals.forEach(interval => {
      clearInterval(interval.intervalId);
    });
    this.resources.intervals.clear();
    
    // Remove all event listeners
    this.resources.listeners.forEach(listener => {
      listener.element.removeEventListener(
        listener.event,
        listener.wrappedHandler,
        listener.options
      );
    });
    this.resources.listeners.clear();
    
    // Disconnect all observers
    this.resources.observers.forEach(observer => {
      observer.observer.disconnect();
    });
    this.resources.observers.clear();
    
    // Cancel all animations
    this.resources.animations.forEach(animation => {
      cancelAnimationFrame(animation.animationId);
    });
    this.resources.animations.clear();
    
    // Close all connections
    this.resources.connections.forEach(connection => {
      if (connection.close) connection.close();
    });
    this.resources.connections.clear();
    
    // Terminate workers
    this.resources.workers.forEach(worker => {
      worker.terminate();
    });
    this.resources.workers.clear();
    
    // Clear monitoring
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    Debug.info('✅ Resource cleanup complete');
  }
}

// js/performance/memory-tracker.js
export class MemoryTracker {
  constructor() {
    this.metrics = {
      timers: { created: 0, completed: 0, cancelled: 0 },
      intervals: { created: 0, completed: 0, executions: 0 },
      listeners: { created: 0, removed: 0, executions: 0 },
      observers: { created: 0, disconnected: 0 },
      animations: { created: 0, completed: 0, cancelled: 0 },
      memory: { snapshots: [], lastGC: null }
    };
    
    this.startTime = performance.now();
    this.setupMemoryMonitoring();
  }
  
  // Timer tracking
  recordTimerStart(id, label, delay) {
    this.metrics.timers.created++;
    Debug.debug(`⏰ Timer created: ${label} (${delay}ms)`);
  }
  
  recordTimerComplete(id) {
    this.metrics.timers.completed++;
  }
  
  recordTimerCancelled(id) {
    this.metrics.timers.cancelled++;
  }
  
  // Memory monitoring
  setupMemoryMonitoring() {
    if (performance.memory) {
      setInterval(() => {
        this.recordMemorySnapshot();
      }, 10000); // Every 10 seconds
    }
  }
  
  recordMemorySnapshot() {
    if (!performance.memory) return;
    
    const snapshot = {
      timestamp: performance.now(),
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    };
    
    this.metrics.memory.snapshots.push(snapshot);
    
    // Keep only last 100 snapshots
    if (this.metrics.memory.snapshots.length > 100) {
      this.metrics.memory.snapshots.shift();
    }
    
    // Check for memory leaks
    this.checkForMemoryLeaks();
  }
  
  checkForMemoryLeaks() {
    const snapshots = this.metrics.memory.snapshots;
    if (snapshots.length < 10) return;
    
    // Check if memory usage is consistently increasing
    const recent = snapshots.slice(-5);
    const older = snapshots.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, s) => sum + s.used, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.used, 0) / older.length;
    
    const increase = recentAvg - olderAvg;
    const threshold = 5 * 1024 * 1024; // 5MB
    
    if (increase > threshold) {
      Debug.warn(`⚠️ Potential memory leak detected: ${(increase / 1024 / 1024).toFixed(2)}MB increase`);
    }
  }
  
  // Resource snapshot recording
  recordResourceSnapshot(resources) {
    Debug.debug('📊 Resource snapshot:', resources);
    
    // Check for resource leaks
    const total = Object.values(resources).reduce((sum, count) => sum + count, 0);
    if (total > 50) {
      Debug.warn(`⚠️ High resource count: ${total} resources active`);
    }
  }
  
  // Performance report
  getPerformanceReport() {
    const uptime = performance.now() - this.startTime;
    const memorySnapshots = this.metrics.memory.snapshots;
    
    return {
      uptime: Math.round(uptime),
      timers: this.metrics.timers,
      intervals: this.metrics.intervals,
      listeners: this.metrics.listeners,
      observers: this.metrics.observers,
      animations: this.metrics.animations,
      memory: {
        current: memorySnapshots.length > 0 ? memorySnapshots[memorySnapshots.length - 1] : null,
        trend: this.calculateMemoryTrend(),
        averageUsage: this.calculateAverageMemoryUsage()
      }
    };
  }
  
  calculateMemoryTrend() {
    const snapshots = this.metrics.memory.snapshots;
    if (snapshots.length < 2) return 0;
    
    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];
    
    return last.used - first.used;
  }
  
  calculateAverageMemoryUsage() {
    const snapshots = this.metrics.memory.snapshots;
    if (snapshots.length === 0) return 0;
    
    const total = snapshots.reduce((sum, s) => sum + s.used, 0);
    return total / snapshots.length;
  }
}
```

#### Step 1.2: Smart Screen Lifecycle Management
```javascript
// js/performance/smart-screen-manager.js
export class SmartScreenManager {
  constructor(resourceManager) {
    this.resourceManager = resourceManager;
    this.screens = new Map();
    this.activeScreen = null;
    this.visibilityObserver = null;
    this.setupVisibilityObserver();
  }
  
  // Register screen with lifecycle management
  registerScreen(screen) {
    const screenId = screen.screenId;
    
    this.screens.set(screenId, {
      screen,
      state: 'inactive',
      resources: new ResourceManager(),
      lastActivated: null,
      activationCount: 0
    });
    
    // Wrap screen methods to track resource usage
    this.wrapScreenMethods(screen);
  }
  
  wrapScreenMethods(screen) {
    const original = {
      show: screen.show?.bind(screen),
      hide: screen.hide?.bind(screen),
      cleanup: screen.cleanup?.bind(screen)
    };
    
    // Override show method
    screen.show = async (...args) => {
      const screenData = this.screens.get(screen.screenId);
      screenData.state = 'active';
      screenData.lastActivated = performance.now();
      screenData.activationCount++;
      
      this.activeScreen = screen.screenId;
      
      // Pause other screens
      this.pauseInactiveScreens();
      
      // Call original show
      if (original.show) {
        await original.show(...args);
      }
      
      // Start monitoring this screen
      this.startScreenMonitoring(screen.screenId);
    };
    
    // Override hide method
    screen.hide = async (...args) => {
      const screenData = this.screens.get(screen.screenId);
      screenData.state = 'inactive';
      
      // Stop monitoring
      this.stopScreenMonitoring(screen.screenId);
      
      // Call original hide
      if (original.hide) {
        await original.hide(...args);
      }
      
      // Clean up screen resources
      this.cleanupScreenResources(screen.screenId);
    };
    
    // Override cleanup method
    screen.cleanup = async (...args) => {
      this.unregisterScreen(screen.screenId);
      
      if (original.cleanup) {
        await original.cleanup(...args);
      }
    };
  }
  
  // Pause inactive screens to save resources
  pauseInactiveScreens() {
    this.screens.forEach((screenData, screenId) => {
      if (screenId !== this.activeScreen && screenData.state === 'active') {
        this.pauseScreen(screenId);
      }
    });
  }
  
  pauseScreen(screenId) {
    const screenData = this.screens.get(screenId);
    if (!screenData) return;
    
    // Stop animations
    const screen = screenData.screen;
    if (screen.pauseAnimations) {
      screen.pauseAnimations();
    }
    
    // Reduce update frequency
    if (screen.reduceUpdateFrequency) {
      screen.reduceUpdateFrequency();
    }
    
    screenData.state = 'paused';
    Debug.info(`⏸️ Screen paused: ${screenId}`);
  }
  
  resumeScreen(screenId) {
    const screenData = this.screens.get(screenId);
    if (!screenData) return;
    
    const screen = screenData.screen;
    if (screen.resumeAnimations) {
      screen.resumeAnimations();
    }
    
    if (screen.restoreUpdateFrequency) {
      screen.restoreUpdateFrequency();
    }
    
    screenData.state = 'active';
    Debug.info(`▶️ Screen resumed: ${screenId}`);
  }
  
  // Monitor screen resource usage
  startScreenMonitoring(screenId) {
    const screenData = this.screens.get(screenId);
    if (!screenData) return;
    
    screenData.monitoringInterval = setInterval(() => {
      this.checkScreenPerformance(screenId);
    }, 2000);
  }
  
  stopScreenMonitoring(screenId) {
    const screenData = this.screens.get(screenId);
    if (!screenData) return;
    
    if (screenData.monitoringInterval) {
      clearInterval(screenData.monitoringInterval);
      screenData.monitoringInterval = null;
    }
  }
  
  checkScreenPerformance(screenId) {
    const screenData = this.screens.get(screenId);
    if (!screenData) return;
    
    const resources = screenData.resources.getResourceCount();
    const totalResources = Object.values(resources).reduce((sum, count) => sum + count, 0);
    
    // Check for resource leaks
    if (totalResources > 25) {
      Debug.warn(`⚠️ High resource usage in ${screenId}: ${totalResources} resources`);
    }
    
    // Check for memory leaks
    if (performance.memory) {
      const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
      if (memoryUsage > 50) {
        Debug.warn(`⚠️ High memory usage: ${memoryUsage.toFixed(2)}MB`);
      }
    }
  }
  
  // Clean up screen resources
  cleanupScreenResources(screenId) {
    const screenData = this.screens.get(screenId);
    if (!screenData) return;
    
    // Stop monitoring
    this.stopScreenMonitoring(screenId);
    
    // Clean up resources
    screenData.resources.cleanup();
    
    Debug.info(`🧹 Cleaned up resources for ${screenId}`);
  }
  
  // Visibility observer for performance optimization
  setupVisibilityObserver() {
    this.visibilityObserver = this.resourceManager.createObserver(
      (entries) => {
        entries.forEach(entry => {
          const screenId = entry.target.id;
          if (entry.isIntersecting) {
            this.resumeScreen(screenId);
          } else {
            this.pauseScreen(screenId);
          }
        });
      },
      { threshold: 0.1 },
      'screen-visibility'
    );
  }
  
  // Unregister screen
  unregisterScreen(screenId) {
    this.cleanupScreenResources(screenId);
    this.screens.delete(screenId);
  }
  
  // Global cleanup
  cleanup() {
    this.screens.forEach((_, screenId) => {
      this.cleanupScreenResources(screenId);
    });
    this.screens.clear();
    
    if (this.visibilityObserver) {
      this.visibilityObserver.disconnect();
    }
  }
}
```

### Phase 2: DOM Performance Optimization (Week 2)

#### Step 2.1: Efficient DOM Manipulation
```javascript
// js/performance/dom-optimizer.js
export class DOMOptimizer {
  constructor() {
    this.batchedUpdates = new Map();
    this.measurementCache = new Map();
    this.isUpdating = false;
    this.updateQueue = [];
  }
  
  // Batch DOM updates to minimize reflows
  batchUpdate(element, updates) {
    if (!this.batchedUpdates.has(element)) {
      this.batchedUpdates.set(element, []);
    }
    
    this.batchedUpdates.get(element).push(...updates);
    
    // Schedule batch processing
    this.scheduleBatchProcess();
  }
  
  scheduleBatchProcess() {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    requestAnimationFrame(() => {
      this.processBatchedUpdates();
      this.isUpdating = false;
    });
  }
  
  processBatchedUpdates() {
    // Group updates by type to minimize reflows
    const reads = [];
    const writes = [];
    
    this.batchedUpdates.forEach((updates, element) => {
      updates.forEach(update => {
        if (update.type === 'read') {
          reads.push({ element, update });
        } else {
          writes.push({ element, update });
        }
      });
    });
    
    // Process all reads first
    reads.forEach(({ element, update }) => {
      this.processRead(element, update);
    });
    
    // Then process all writes
    writes.forEach(({ element, update }) => {
      this.processWrite(element, update);
    });
    
    // Clear batch
    this.batchedUpdates.clear();
  }
  
  processRead(element, update) {
    switch (update.operation) {
      case 'getBoundingClientRect':
        update.result = element.getBoundingClientRect();
        break;
      case 'getComputedStyle':
        update.result = window.getComputedStyle(element);
        break;
      case 'offsetHeight':
        update.result = element.offsetHeight;
        break;
      case 'offsetWidth':
        update.result = element.offsetWidth;
        break;
    }
    
    if (update.callback) {
      update.callback(update.result);
    }
  }
  
  processWrite(element, update) {
    switch (update.operation) {
      case 'style':
        Object.assign(element.style, update.value);
        break;
      case 'className':
        element.className = update.value;
        break;
      case 'textContent':
        element.textContent = update.value;
        break;
      case 'innerHTML':
        element.innerHTML = update.value;
        break;
      case 'setAttribute':
        element.setAttribute(update.name, update.value);
        break;
      case 'removeAttribute':
        element.removeAttribute(update.name);
        break;
    }
  }
  
  // Optimized element creation
  createOptimizedElement(config) {
    const { tag, attributes = {}, styles = {}, children = [] } = config;
    
    // Create element with document fragment for better performance
    const fragment = document.createDocumentFragment();
    const element = document.createElement(tag);
    
    // Set attributes efficiently
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    
    // Set styles efficiently
    Object.assign(element.style, styles);
    
    // Add children
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        element.appendChild(child);
      }
    });
    
    fragment.appendChild(element);
    return fragment;
  }
  
  // Cached measurements
  getCachedMeasurement(element, property) {
    const key = `${element.id || element.tagName}-${property}`;
    
    if (this.measurementCache.has(key)) {
      return this.measurementCache.get(key);
    }
    
    let value;
    switch (property) {
      case 'bounds':
        value = element.getBoundingClientRect();
        break;
      case 'computedStyle':
        value = window.getComputedStyle(element);
        break;
      case 'dimensions':
        value = {
          width: element.offsetWidth,
          height: element.offsetHeight
        };
        break;
    }
    
    this.measurementCache.set(key, value);
    
    // Clear cache after next frame
    requestAnimationFrame(() => {
      this.measurementCache.delete(key);
    });
    
    return value;
  }
  
  // Efficient scroll optimization
  optimizeScroll(container, options = {}) {
    const {
      throttle = 16, // ~60fps
      passive = true,
      capture = false
    } = options;
    
    let ticking = false;
    let lastScrollY = container.scrollTop;
    
    const scrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = container.scrollTop;
          const scrollDelta = scrollY - lastScrollY;
          
          // Optimize based on scroll direction
          if (Math.abs(scrollDelta) > 0) {
            this.handleScrollOptimization(container, scrollY, scrollDelta);
          }
          
          lastScrollY = scrollY;
          ticking = false;
        });
        ticking = true;
      }
    };
    
    container.addEventListener('scroll', scrollHandler, { passive, capture });
    
    return () => {
      container.removeEventListener('scroll', scrollHandler, { passive, capture });
    };
  }
  
  handleScrollOptimization(container, scrollY, scrollDelta) {
    // Reduce animations during fast scrolling
    if (Math.abs(scrollDelta) > 10) {
      document.body.classList.add('fast-scrolling');
    } else {
      document.body.classList.remove('fast-scrolling');
    }
    
    // Implement virtual scrolling for large lists
    this.updateVirtualScrolling(container, scrollY);
  }
  
  updateVirtualScrolling(container, scrollY) {
    // Basic virtual scrolling implementation
    const items = container.querySelectorAll('.virtual-item');
    const containerHeight = container.offsetHeight;
    const itemHeight = 50; // Assumed item height
    
    const visibleStart = Math.floor(scrollY / itemHeight);
    const visibleEnd = Math.min(visibleStart + Math.ceil(containerHeight / itemHeight) + 1, items.length);
    
    items.forEach((item, index) => {
      if (index >= visibleStart && index <= visibleEnd) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  }
}
```

#### Step 2.2: Animation Performance Optimization
```javascript
// js/performance/animation-optimizer.js
export class AnimationOptimizer {
  constructor(resourceManager) {
    this.resourceManager = resourceManager;
    this.animations = new Map();
    this.animationQueue = [];
    this.isProcessing = false;
    this.performanceMonitor = new AnimationPerformanceMonitor();
  }
  
  // Optimized animation registration
  registerAnimation(name, config) {
    const optimizedConfig = this.optimizeAnimationConfig(config);
    this.animations.set(name, optimizedConfig);
  }
  
  optimizeAnimationConfig(config) {
    const {
      duration = 1000,
      easing = 'ease-out',
      properties = {},
      onComplete = () => {},
      priority = 'normal'
    } = config;
    
    return {
      duration,
      easing,
      properties: this.optimizeAnimationProperties(properties),
      onComplete,
      priority,
      useGPU: this.shouldUseGPU(properties),
      canParallelize: this.canParallelize(properties)
    };
  }
  
  optimizeAnimationProperties(properties) {
    const optimized = {};
    
    Object.entries(properties).forEach(([property, value]) => {
      // Use transform instead of changing layout properties
      if (property === 'left' || property === 'top') {
        optimized.transform = optimized.transform || {};
        optimized.transform[property === 'left' ? 'translateX' : 'translateY'] = value;
      } else if (property === 'width' || property === 'height') {
        // Use scale for size changes when possible
        optimized.transform = optimized.transform || {};
        optimized.transform[property === 'width' ? 'scaleX' : 'scaleY'] = value;
      } else {
        optimized[property] = value;
      }
    });
    
    return optimized;
  }
  
  shouldUseGPU(properties) {
    const gpuProperties = ['transform', 'opacity', 'filter'];
    return Object.keys(properties).some(prop => gpuProperties.includes(prop));
  }
  
  canParallelize(properties) {
    const parallelizable = ['opacity', 'transform', 'filter'];
    return Object.keys(properties).every(prop => parallelizable.includes(prop));
  }
  
  // Intelligent animation queueing
  queueAnimation(element, animationName, options = {}) {
    const animation = this.animations.get(animationName);
    if (!animation) {
      throw new Error(`Animation '${animationName}' not found`);
    }
    
    const animationTask = {
      id: Date.now() + Math.random(),
      element,
      animation: { ...animation, ...options },
      queueTime: performance.now(),
      priority: options.priority || animation.priority
    };
    
    // Insert based on priority
    this.insertByPriority(animationTask);
    
    // Start processing if not already running
    if (!this.isProcessing) {
      this.processAnimationQueue();
    }
    
    return animationTask.id;
  }
  
  insertByPriority(task) {
    const priorities = { high: 0, normal: 1, low: 2 };
    const taskPriority = priorities[task.priority] || 1;
    
    let insertIndex = this.animationQueue.length;
    for (let i = 0; i < this.animationQueue.length; i++) {
      const queuedPriority = priorities[this.animationQueue[i].priority] || 1;
      if (taskPriority < queuedPriority) {
        insertIndex = i;
        break;
      }
    }
    
    this.animationQueue.splice(insertIndex, 0, task);
  }
  
  async processAnimationQueue() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    while (this.animationQueue.length > 0) {
      const task = this.animationQueue.shift();
      
      // Check if we should skip this animation due to performance
      if (this.shouldSkipAnimation(task)) {
        continue;
      }
      
      await this.executeAnimation(task);
    }
    
    this.isProcessing = false;
  }
  
  shouldSkipAnimation(task) {
    // Skip animations if performance is poor
    const performanceMetrics = this.performanceMonitor.getMetrics();
    
    if (performanceMetrics.fps < 30 && task.priority === 'low') {
      Debug.info(`⚡ Skipping low priority animation due to performance`);
      return true;
    }
    
    // Skip if element is not visible
    if (!this.isElementVisible(task.element)) {
      Debug.info(`⚡ Skipping animation for invisible element`);
      return true;
    }
    
    return false;
  }
  
  isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0
    );
  }
  
  async executeAnimation(task) {
    const { element, animation } = task;
    
    // Apply GPU acceleration if beneficial
    if (animation.useGPU) {
      element.style.willChange = 'transform, opacity';
      element.style.backfaceVisibility = 'hidden';
      element.style.transform = element.style.transform || 'translateZ(0)';
    }
    
    // Start performance monitoring
    const startTime = performance.now();
    
    // Execute animation
    await this.runAnimation(element, animation);
    
    // Clean up GPU acceleration
    if (animation.useGPU) {
      element.style.willChange = '';
      element.style.backfaceVisibility = '';
    }
    
    // Record performance
    const endTime = performance.now();
    this.performanceMonitor.recordAnimation(task.id, endTime - startTime);
  }
  
  runAnimation(element, animation) {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const startValues = this.getStartValues(element, animation.properties);
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / animation.duration, 1);
        
        // Apply easing
        const easedProgress = this.applyEasing(progress, animation.easing);
        
        // Apply properties
        this.applyAnimationProperties(element, animation.properties, startValues, easedProgress);
        
        if (progress < 1) {
          this.resourceManager.requestAnimationFrame(animate, `animation-${animation.name}`);
        } else {
          animation.onComplete();
          resolve();
        }
      };
      
      this.resourceManager.requestAnimationFrame(animate, `animation-${animation.name}`);
    });
  }
  
  getStartValues(element, properties) {
    const startValues = {};
    const computedStyle = window.getComputedStyle(element);
    
    Object.keys(properties).forEach(property => {
      startValues[property] = parseFloat(computedStyle[property]) || 0;
    });
    
    return startValues;
  }
  
  applyEasing(progress, easing) {
    switch (easing) {
      case 'ease-out':
        return 1 - Math.pow(1 - progress, 3);
      case 'ease-in':
        return Math.pow(progress, 3);
      case 'ease-in-out':
        return progress < 0.5 
          ? 4 * Math.pow(progress, 3)
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      default:
        return progress;
    }
  }
  
  applyAnimationProperties(element, properties, startValues, progress) {
    Object.entries(properties).forEach(([property, endValue]) => {
      const startValue = startValues[property] || 0;
      const currentValue = startValue + (endValue - startValue) * progress;
      
      if (property === 'transform') {
        this.applyTransform(element, endValue, progress);
      } else {
        element.style[property] = `${currentValue}px`;
      }
    });
  }
  
  applyTransform(element, transforms, progress) {
    const transformString = Object.entries(transforms)
      .map(([transform, value]) => `${transform}(${value * progress})`)
      .join(' ');
    
    element.style.transform = transformString;
  }
}

// js/performance/animation-performance-monitor.js
export class AnimationPerformanceMonitor {
  constructor() {
    this.metrics = {
      fps: 60,
      frameTime: 16.67,
      droppedFrames: 0,
      totalFrames: 0
    };
    
    this.frameHistory = [];
    this.lastFrameTime = performance.now();
    this.monitorFrameRate();
  }
  
  monitorFrameRate() {
    const frame = (currentTime) => {
      const frameTime = currentTime - this.lastFrameTime;
      this.frameHistory.push(frameTime);
      
      // Keep only last 60 frames
      if (this.frameHistory.length > 60) {
        this.frameHistory.shift();
      }
      
      // Calculate FPS
      const averageFrameTime = this.frameHistory.reduce((sum, time) => sum + time, 0) / this.frameHistory.length;
      this.metrics.fps = 1000 / averageFrameTime;
      this.metrics.frameTime = averageFrameTime;
      
      // Count dropped frames
      if (frameTime > 20) { // More than 20ms = dropped frame
        this.metrics.droppedFrames++;
      }
      
      this.metrics.totalFrames++;
      this.lastFrameTime = currentTime;
      
      requestAnimationFrame(frame);
    };
    
    requestAnimationFrame(frame);
  }
  
  recordAnimation(animationId, duration) {
    Debug.debug(`📊 Animation completed: ${animationId} (${duration.toFixed(2)}ms)`);
  }
  
  getMetrics() {
    return { ...this.metrics };
  }
}
```

### Implementation Checklist

#### Week 1: Memory Management
- [ ] Implement enhanced ResourceManager
- [ ] Create MemoryTracker
- [ ] Implement SmartScreenManager
- [ ] Add resource monitoring
- [ ] Wrap all existing timers/listeners
- [ ] Add memory leak detection
- [ ] Test resource cleanup

#### Week 2: DOM Optimization
- [ ] Create DOMOptimizer
- [ ] Implement batched updates
- [ ] Add measurement caching
- [ ] Optimize scroll handling
- [ ] Implement virtual scrolling
- [ ] Create AnimationOptimizer
- [ ] Add performance monitoring

#### Week 3: Asset Management
- [ ] Implement lazy loading
- [ ] Add resource preloading
- [ ] Optimize image loading
- [ ] Implement audio pooling
- [ ] Add service worker caching
- [ ] Optimize font loading
- [ ] Bundle optimization

#### Week 4: Testing & Profiling
- [ ] Performance testing suite
- [ ] Memory leak tests
- [ ] Animation performance tests
- [ ] Load testing
- [ ] Mobile performance testing
- [ ] Accessibility performance
- [ ] Bundle analysis

### Success Metrics
- Zero memory leaks in DevTools profiler
- Maintain 60fps during animations
- Reduce First Contentful Paint by 50%
- Reduce JavaScript bundle size by 30%
- Pass Core Web Vitals thresholds
- Improve Lighthouse performance score to 90+

### Performance Budget
- JavaScript bundle: <200KB gzipped
- CSS bundle: <50KB gzipped
- Images: <100KB total
- Fonts: <30KB total
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3.5s