// Custom Cypress Commands for Brewster's MTGO Mission Terminal

// Application navigation commands
Cypress.Commands.add('visitApplication', (options = {}) => {
  const defaultOptions = {
    timeout: 30000,
    failOnStatusCode: false
  };
  
  cy.visit('/', { ...defaultOptions, ...options });
  
  // Wait for basic application structure
  cy.get('#app', { timeout: 15000 }).should('exist');
});

// Screen-specific commands
Cypress.Commands.add('waitForScreen', (screenId, timeout = 10000) => {
  cy.get(`#${screenId}-screen`, { timeout })
    .should('be.visible')
    .and('not.have.class', 'hidden');
});

Cypress.Commands.add('getCurrentScreen', () => {
  return cy.get('.screen:not(.hidden)').should('have.length', 1);
});

// Form interaction commands
Cypress.Commands.add('fillAuthForm', ({ agentName = 'Test Agent', accessCode = 'test123' } = {}) => {
  cy.get('#agent-name').should('be.visible').clear().type(agentName);
  
  // Handle optional access code field
  cy.get('body').then($body => {
    if ($body.find('#access-code').length > 0) {
      cy.get('#access-code').clear().type(accessCode);
    }
  });
});

Cypress.Commands.add('submitAuthForm', () => {
  cy.get('#auth-form button[type="submit"]')
    .should('be.visible')
    .and('not.be.disabled')
    .click();
});

// Audio testing commands
Cypress.Commands.add('enableAudioTesting', () => {
  cy.window().then((win) => {
    // Create a more sophisticated audio mock for testing
    let audioPlayCount = 0;
    let lastPlayedSound = null;
    
    win.AudioContext = function() {
      return {
        createOscillator: () => ({
          connect: cy.stub(),
          start: cy.stub(),
          stop: cy.stub(),
          frequency: { setValueAtTime: cy.stub() },
          type: 'sine'
        }),
        createGain: () => ({
          connect: cy.stub(),
          gain: { 
            setValueAtTime: cy.stub(),
            linearRampToValueAtTime: cy.stub(),
            exponentialRampToValueAtTime: cy.stub(),
            value: 1
          }
        }),
        destination: {},
        currentTime: 0,
        state: 'running',
        resume: () => Promise.resolve(),
        suspend: () => Promise.resolve(),
        close: () => Promise.resolve()
      };
    };
    
    win.Audio = function(src) {
      audioPlayCount++;
      lastPlayedSound = src;
      
      return {
        play: cy.stub().resolves(),
        pause: cy.stub(),
        load: cy.stub(),
        addEventListener: cy.stub(),
        removeEventListener: cy.stub(),
        cloneNode: cy.stub().returns(this),
        currentTime: 0,
        duration: 1,
        volume: 1,
        muted: false,
        paused: true,
        src: src || '',
        readyState: 4
      };
    };
    
    // Expose testing utilities
    win.audioTestUtils = {
      getPlayCount: () => audioPlayCount,
      getLastPlayedSound: () => lastPlayedSound,
      resetCounters: () => {
        audioPlayCount = 0;
        lastPlayedSound = null;
      }
    };
  });
});

Cypress.Commands.add('getAudioPlayCount', () => {
  return cy.window().then((win) => {
    return win.audioTestUtils?.getPlayCount() || 0;
  });
});

// Animation testing commands
Cypress.Commands.add('waitForAnimationComplete', (selector, timeout = 5000) => {
  cy.get(selector, { timeout }).should(($el) => {
    const element = $el[0];
    const computedStyle = window.getComputedStyle(element);
    
    // Check if animations/transitions are complete
    expect(computedStyle.animationPlayState).not.to.equal('running');
  });
});

Cypress.Commands.add('hasAnimation', (selector) => {
  return cy.get(selector).should(($el) => {
    const element = $el[0];
    const computedStyle = window.getComputedStyle(element);
    const hasAnimation = computedStyle.animation !== 'none';
    const hasTransition = computedStyle.transition !== 'all 0s ease 0s';
    
    expect(hasAnimation || hasTransition).to.be.true;
  });
});

// Signal bar testing commands
Cypress.Commands.add('waitForSignalBars', () => {
  cy.get('.signal-bars .bar').should('have.length', 5);
  cy.get('.signal-bars .bar.bouncing').should('exist');
});

Cypress.Commands.add('waitForSignalLock', (timeout = 10000) => {
  cy.get('.signal-bars .bar.locked', { timeout }).should('have.length', 5);
  cy.get('.signal-lock').should('contain.text', 'ESTABLISHED');
});

// Mission choice commands
Cypress.Commands.add('selectMission', (choice) => {
  if (choice === 'accept') {
    cy.get('.accept-button').should('be.visible').click();
    cy.waitForScreen('briefing');
  } else if (choice === 'decline') {
    cy.get('.decline-button').should('be.visible').click();
    cy.waitForScreen('declined');
  } else {
    throw new Error(`Invalid mission choice: ${choice}. Use 'accept' or 'decline'.`);
  }
});

// Countdown testing commands
Cypress.Commands.add('waitForCountdown', () => {
  cy.get('.timer-digits').should('be.visible');
  cy.get('.timer-digits').should('contain.text', '60');
});

Cypress.Commands.add('fastForwardCountdown', (seconds = 65) => {
  cy.clock();
  cy.tick(seconds * 1000);
  cy.clock().then(clock => clock.restore());
});

// Visual verification commands
Cypress.Commands.add('shouldHaveTerminalStyling', (selector = '#app') => {
  cy.get(selector).should(($el) => {
    const styles = window.getComputedStyle($el[0]);
    
    // Check for terminal-like background (dark)
    expect(styles.backgroundColor).to.match(/rgb\(0,\s*0,\s*0\)|#000|black/i);
    
    // Check for terminal-like text color (green)
    expect(styles.color).to.match(/#00ff|rgb\(0,\s*255|green/i);
  });
});

Cypress.Commands.add('shouldHavePhosphorGlow', (selector) => {
  cy.get(selector).should(($el) => {
    const styles = window.getComputedStyle($el[0]);
    expect(styles.textShadow || styles.boxShadow).to.include('0px');
  });
});

// Performance testing commands
Cypress.Commands.add('measureLoadTime', () => {
  cy.window().then((win) => {
    return new Promise((resolve) => {
      if (win.performance.timing.loadEventEnd) {
        const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart;
        resolve(loadTime);
      } else {
        win.addEventListener('load', () => {
          const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart;
          resolve(loadTime);
        });
      }
    });
  }).then((loadTime) => {
    cy.log(`Page load time: ${loadTime}ms`);
    expect(loadTime).to.be.lessThan(3000); // 3 second threshold
    return loadTime;
  });
});

// Responsive testing commands
Cypress.Commands.add('testMobileResponsiveness', () => {
  // Test on iPhone SE
  cy.viewport(375, 667);
  cy.get('#app').should('be.visible');
  cy.get('.terminal-container').should('have.css', 'width').and('match', /3(6|7)\d/); // Around 360-370px
  
  // Test on iPhone X
  cy.viewport(375, 812);
  cy.get('#app').should('be.visible');
  
  // Test on iPad
  cy.viewport(768, 1024);
  cy.get('#app').should('be.visible');
});

// Error handling commands
Cypress.Commands.add('expectNoConsoleErrors', () => {
  cy.window().then((win) => {
    const errors = [];
    const originalError = win.console.error;
    
    win.console.error = (...args) => {
      errors.push(args.join(' '));
      originalError.apply(win.console, args);
    };
    
    // Check for errors after a brief delay
    cy.wait(1000).then(() => {
      const criticalErrors = errors.filter(error => 
        !error.includes('ResizeObserver') && 
        !error.includes('non-passive event listener') &&
        !error.includes('AudioContext')
      );
      
      expect(criticalErrors).to.have.length(0);
    });
  });
});

// User journey commands
Cypress.Commands.add('completeSuccessfulJourney', (agentName = 'Test Agent') => {
  cy.visitApplication();
  cy.waitForBootSequence();
  cy.completeAuthentication(agentName);
  cy.waitForMissionScreen();
  cy.acceptMission();
  cy.waitForScreen('briefing');
  cy.get('.action-button.primary').click();
  cy.waitForScreen('countdown');
  // Note: Full countdown takes 60 seconds - tests may want to mock this
});

Cypress.Commands.add('completeDeclineJourney', (agentName = 'Test Agent') => {
  cy.visitApplication();
  cy.waitForBootSequence();
  cy.completeAuthentication(agentName);
  cy.waitForMissionScreen();
  cy.declineMission();
  cy.waitForScreen('declined');
});

// Accessibility helpers
Cypress.Commands.add('tabThroughInterface', () => {
  cy.get('body').tab();
  cy.focused().should('exist');
});

Cypress.Commands.add('checkKeyboardNavigation', () => {
  // Test tab navigation
  cy.get('body').tab();
  cy.focused().should('be.visible');
  
  // Test enter key on focused element
  cy.focused().type('{enter}');
});

// Local storage helpers specific to the application
Cypress.Commands.add('setAgentName', (name) => {
  cy.window().then((win) => {
    win.localStorage.setItem('agentName', name);
    win.sessionStorage.setItem('agentName', name);
  });
});

Cypress.Commands.add('getMissionChoice', () => {
  return cy.window().then((win) => {
    return win.localStorage.getItem('missionAccepted');
  });
});

// Debug commands
Cypress.Commands.add('debugState', () => {
  cy.window().then((win) => {
    cy.log('Current URL:', win.location.href);
    cy.log('Local Storage:', JSON.stringify(win.localStorage));
    cy.log('Session Storage:', JSON.stringify(win.sessionStorage));
    
    if (win.appState) {
      cy.log('App State:', win.appState.current);
      cy.log('State History:', win.appState.getHistory());
    }
    
    const visibleScreen = win.document.querySelector('.screen:not(.hidden)');
    cy.log('Visible Screen:', visibleScreen?.id || 'none');
  });
});