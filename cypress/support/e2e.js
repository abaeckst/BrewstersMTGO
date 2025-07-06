// Cypress E2E Support File
// Import commands.js and custom commands

import './commands';
import 'cypress-axe';

// Global configuration
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing on uncaught exceptions
  // that might be expected in our cinematic application
  if (err.message.includes('ResizeObserver')) {
    return false;
  }
  if (err.message.includes('AudioContext')) {
    return false;
  }
  // Let other errors fail the test
  return true;
});

// Custom commands for Brewster's MTGO testing
Cypress.Commands.add('waitForBootSequence', (timeout = 15000) => {
  cy.get('#boot-sequence-screen', { timeout }).should('be.visible');
  cy.get('.boot-sequence-container', { timeout }).should('exist');
  // Wait for boot sequence to complete
  cy.wait(8000); // Boot sequence duration
});

Cypress.Commands.add('completeAuthentication', (agentName = 'Test Agent', accessCode = 'test123') => {
  cy.get('#auth-screen', { timeout: 15000 }).should('be.visible');
  cy.get('#agent-name').should('be.visible').type(agentName);
  
  // Check if access code field exists (might be simplified in some versions)
  cy.get('body').then($body => {
    if ($body.find('#access-code').length > 0) {
      cy.get('#access-code').type(accessCode);
    }
  });
  
  cy.get('button[type="submit"]').click();
  
  // Wait for transition to complete
  cy.get('#mission-screen', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('waitForMissionScreen', () => {
  cy.get('#mission-screen', { timeout: 10000 }).should('be.visible');
  cy.get('.signal-bars').should('be.visible');
  cy.get('.accept-button').should('be.visible');
  cy.get('.decline-button').should('be.visible');
});

Cypress.Commands.add('acceptMission', () => {
  cy.get('.accept-button').should('be.visible').click();
  cy.get('#briefing-screen', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('declineMission', () => {
  cy.get('.decline-button').should('be.visible').click();
  cy.get('#declined-screen', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('checkAccessibility', () => {
  cy.injectAxe();
  cy.checkA11y(null, {
    rules: {
      // Disable color contrast rule for terminal-style interface
      'color-contrast': { enabled: false },
      // Disable some rules that may not apply to our cinematic interface
      'region': { enabled: false }
    }
  });
});

Cypress.Commands.add('mockAudioContext', () => {
  cy.window().then((win) => {
    // Mock AudioContext to prevent audio-related errors
    win.AudioContext = win.AudioContext || function() {
      return {
        createOscillator: () => ({
          connect: () => {},
          start: () => {},
          stop: () => {},
          frequency: { setValueAtTime: () => {} }
        }),
        createGain: () => ({
          connect: () => {},
          gain: { 
            setValueAtTime: () => {},
            linearRampToValueAtTime: () => {},
            exponentialRampToValueAtTime: () => {}
          }
        }),
        destination: {},
        currentTime: 0,
        state: 'running',
        resume: () => Promise.resolve()
      };
    };
    
    // Mock Audio constructor
    win.Audio = function() {
      return {
        play: () => Promise.resolve(),
        pause: () => {},
        load: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        currentTime: 0,
        duration: 0,
        volume: 1,
        muted: false,
        paused: true
      };
    };
  });
});

// Mobile device testing helpers
Cypress.Commands.add('setMobileViewport', () => {
  cy.viewport(375, 667); // iPhone SE
});

Cypress.Commands.add('setTabletViewport', () => {
  cy.viewport(768, 1024); // iPad
});

Cypress.Commands.add('setDesktopViewport', () => {
  cy.viewport(1280, 720); // Desktop
});

// Performance testing helpers
Cypress.Commands.add('measurePageLoad', () => {
  cy.window().then((win) => {
    win.performance.mark('pageLoadStart');
  });
  
  cy.get('#app').should('be.visible').then(() => {
    cy.window().then((win) => {
      win.performance.mark('pageLoadEnd');
      win.performance.measure('pageLoad', 'pageLoadStart', 'pageLoadEnd');
      
      const measure = win.performance.getEntriesByName('pageLoad')[0];
      cy.log(`Page load time: ${measure.duration}ms`);
      
      // Assert page loads within 3 seconds
      expect(measure.duration).to.be.lessThan(3000);
    });
  });
});

// Screenshot helpers for visual testing
Cypress.Commands.add('captureFullPage', (name) => {
  cy.screenshot(name, { 
    capture: 'fullPage',
    blackout: ['.timestamp', '.debug-info'] // Hide dynamic elements
  });
});

// Local storage helpers
Cypress.Commands.add('clearApplicationData', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

// Skip animation helpers for faster testing
Cypress.Commands.add('disableAnimations', () => {
  cy.get('head').then($head => {
    $head.append(`
      <style>
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-delay: 0.01ms !important;
          transition-duration: 0.01ms !important;
          transition-delay: 0.01ms !important;
        }
      </style>
    `);
  });
});

// Custom assertions
Cypress.Commands.add('shouldHaveTerminalStyle', { prevSubject: true }, (subject) => {
  cy.wrap(subject)
    .should('have.css', 'font-family').and('match', /monospace|courier/i);
  
  cy.wrap(subject)
    .should('have.css', 'color').and('match', /#00ff|rgb\(0,\s*255|green/i);
});

// Wait for animations to complete
Cypress.Commands.add('waitForAnimations', (duration = 1000) => {
  cy.wait(duration);
});

// Accessibility testing with reduced motion
Cypress.Commands.add('testReducedMotion', () => {
  cy.window().then((win) => {
    // Mock prefers-reduced-motion
    Object.defineProperty(win, 'matchMedia', {
      writable: true,
      value: (query) => ({
        matches: query.includes('prefers-reduced-motion: reduce'),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {}
      })
    });
  });
});

// Before each test setup
beforeEach(() => {
  // Mock audio context to prevent errors
  cy.mockAudioContext();
  
  // Clear application data
  cy.clearApplicationData();
  
  // Set consistent viewport
  cy.setDesktopViewport();
});

// After each test cleanup
afterEach(() => {
  // Capture screenshot on failure
  cy.on('fail', (err) => {
    cy.screenshot('test-failure', { capture: 'fullPage' });
    throw err;
  });
});