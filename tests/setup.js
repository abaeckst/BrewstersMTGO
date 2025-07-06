/**
 * Jest Test Setup
 * Configure browser environment mocks and utilities
 */

import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock browser APIs
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Audio API for testing
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn().mockResolvedValue(undefined),
  pause: jest.fn(),
  load: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  currentTime: 0,
  duration: 0,
  volume: 1,
  muted: false,
  paused: true,
  readyState: 4, // HAVE_ENOUGH_DATA
  src: '',
  crossOrigin: null
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
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};
global.localStorage = localStorageMock;

// Mock sessionStorage
global.sessionStorage = localStorageMock;

// Mock performance API
global.performance = {
  ...global.performance,
  now: jest.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000
  },
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  getEntriesByType: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn()
};

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => {
  setTimeout(cb, 16); // ~60fps
  return 1;
});

global.cancelAnimationFrame = jest.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

// Mock window.scrollTo
global.scrollTo = jest.fn();

// Mock CSS.supports
global.CSS = {
  supports: jest.fn(() => true)
};

// Setup console mocks for cleaner test output
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  // Comment out the lines below to see console output during tests
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // Keep error for debugging
  error: originalConsole.error
};

// Global test helpers
global.flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));
global.waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock fetch for any potential HTTP calls
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({}),
    text: async () => '',
    blob: async () => new Blob(),
    arrayBuffer: async () => new ArrayBuffer(0)
  })
);

// Clean up after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset localStorage
  localStorage.clear();
  
  // Clean up DOM
  document.body.innerHTML = '';
  document.head.innerHTML = '';
  
  // Reset window properties
  delete window.location;
  window.location = new URL('http://localhost/');
  
  // Reset performance marks
  performance.clearMarks();
  performance.clearMeasures();
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});