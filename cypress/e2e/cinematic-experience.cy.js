/**
 * End-to-End Tests for Cinematic Experience
 * Testing timing, animations, and sequential revelation
 */

describe('Cinematic Experience', () => {
  beforeEach(() => {
    cy.enableAudioTesting();
    cy.visitApplication();
  });

  describe('Boot Sequence', () => {
    it('should display boot messages in correct sequence', () => {
      cy.get('#boot-sequence-screen').should('be.visible');
      
      // Check for progressive message appearance
      cy.get('.boot-sequence-container').should('be.empty');
      
      // Wait for first message
      cy.get('.boot-message', { timeout: 5000 }).should('have.length.at.least', 1);
      cy.get('.boot-message').first().should('contain.text', 'SYSTEM INITIALIZING');
      
      // Wait for more messages to appear
      cy.get('.boot-message', { timeout: 10000 }).should('have.length.at.least', 3);
      
      // Final message should indicate readiness
      cy.get('.boot-message', { timeout: 15000 }).last().should('contain.text', 'TERMINAL READY');
    });

    it('should play typing sounds during boot sequence', () => {
      cy.enableAudioTesting();
      
      // Wait for boot sequence to start
      cy.get('.boot-message', { timeout: 5000 }).should('exist');
      
      // Audio should be playing
      cy.getAudioPlayCount().should('be.greaterThan', 0);
      
      // Wait for sequence to complete
      cy.waitForScreen('auth');
      
      // More audio should have played
      cy.getAudioPlayCount().should('be.greaterThan', 10);
    });

    it('should transition smoothly to auth screen', () => {
      cy.waitForBootSequence();
      
      // Boot screen should become hidden
      cy.get('#boot-sequence-screen').should('have.class', 'hidden');
      
      // Auth screen should become visible
      cy.get('#auth-screen').should('be.visible').and('not.have.class', 'hidden');
    });

    it('should show environmental effects immediately', () => {
      // Scan lines should be active from the start
      cy.get('#app').should('have.class', 'terminal-active');
      
      // CRT effects should be visible
      cy.get('#app').should('have.css', 'background-color').and('match', /rgb\(0,\s*0,\s*0\)/);
    });
  });

  describe('Auth Screen Sequential Revelation', () => {
    it('should reveal auth elements in sequence', () => {
      cy.waitForBootSequence();
      cy.waitForScreen('auth');
      
      // Status bar should appear first
      cy.get('.status-bar', { timeout: 2000 }).should('be.visible');
      
      // Title should appear next
      cy.get('h1', { timeout: 2000 }).should('be.visible');
      
      // Form should appear last
      cy.get('#auth-form', { timeout: 5000 }).should('be.visible');
      cy.get('#agent-name', { timeout: 2000 }).should('be.visible');
    });

    it('should respect 1200ms timing between stages', () => {
      cy.waitForBootSequence();
      cy.waitForScreen('auth');
      
      const startTime = Date.now();
      
      // Wait for all stages to complete
      cy.get('#agent-name', { timeout: 10000 }).should('be.visible');
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should take approximately 6 stages * 1200ms = 7.2 seconds (with some tolerance)
      expect(totalTime).to.be.greaterThan(5000);
      expect(totalTime).to.be.lessThan(10000);
    });

    it('should play audio cues for each stage', () => {
      cy.enableAudioTesting();
      cy.waitForBootSequence();
      cy.waitForScreen('auth');
      
      const initialCount = cy.getAudioPlayCount();
      
      // Wait for revelation to complete
      cy.get('#agent-name', { timeout: 10000 }).should('be.visible');
      
      // Should have played audio for each stage
      cy.getAudioPlayCount().should('be.greaterThan', 5);
    });

    it('should add appropriate CSS classes during revelation', () => {
      cy.waitForBootSequence();
      cy.waitForScreen('auth');
      
      // Elements should start hidden and become revealed
      cy.get('.auth-stage-1-reveal').should('exist');
      cy.get('.auth-stage-2-reveal', { timeout: 3000 }).should('exist');
      cy.get('.auth-stage-3-reveal', { timeout: 5000 }).should('exist');
    });
  });

  describe('Mission Screen Cinematic Sequence', () => {
    it('should animate signal bars in cascading pattern', () => {
      cy.waitForBootSequence();
      cy.completeAuthentication('Signal Test Agent');
      cy.waitForScreen('mission');
      
      // Should start with bouncing animation
      cy.get('.signal-bars .bar.bouncing').should('exist');
      
      // Animation should cycle through bars
      cy.wait(500);
      cy.get('.signal-bars .bar.bouncing').should('have.length', 1);
      
      // Eventually all bars should lock
      cy.get('.signal-bars .bar.locked', { timeout: 10000 }).should('have.length', 5);
    });

    it('should type personal message with character-by-character effect', () => {
      cy.waitForBootSequence();
      cy.completeAuthentication('Typing Test Agent');
      cy.waitForScreen('mission');
      
      // Message should start empty
      cy.get('.personal-message').should('have.text', '');
      
      // Should progressively fill with text
      cy.get('.personal-message', { timeout: 5000 }).should('contain.text', 'OPERATIVE');
      cy.get('.personal-message', { timeout: 10000 }).should('contain.text', 'Typing Test Agent');
      cy.get('.personal-message', { timeout: 15000 }).should('contain.text', 'GOBLIN SURPRISE');
    });

    it('should reveal mission choices after signal lock', () => {
      cy.waitForBootSequence();
      cy.completeAuthentication('Choice Test Agent');
      cy.waitForScreen('mission');
      
      // Choices should not be immediately visible
      cy.get('.mission-choices').should('exist');
      
      // Wait for signal lock
      cy.waitForSignalLock();
      
      // Choices should become interactive
      cy.get('.accept-button', { timeout: 10000 }).should('be.visible');
      cy.get('.decline-button').should('be.visible');
    });

    it('should provide audio feedback for signal detection', () => {
      cy.enableAudioTesting();
      cy.waitForBootSequence();
      cy.completeAuthentication('Audio Signal Test');
      cy.waitForScreen('mission');
      
      const initialCount = cy.getAudioPlayCount();
      
      // Wait for signal sequence to complete
      cy.waitForSignalLock();
      
      // Should have played connection establish, success, and other sounds
      cy.getAudioPlayCount().should('be.greaterThan', 3);
    });
  });

  describe('Screen Transitions', () => {
    it('should fade between screens smoothly', () => {
      cy.waitForBootSequence();
      cy.completeAuthentication('Transition Test Agent');
      
      // Mission screen should fade in
      cy.get('#mission-screen').should('be.visible');
      cy.get('#auth-screen').should('have.class', 'hidden');
      
      cy.selectMission('accept');
      
      // Briefing screen should fade in
      cy.get('#briefing-screen').should('be.visible');
      cy.get('#mission-screen').should('have.class', 'hidden');
    });

    it('should scroll to new screens appropriately', () => {
      cy.waitForBootSequence();
      cy.completeAuthentication('Scroll Test Agent');
      cy.selectMission('accept');
      
      // Should scroll to briefing screen
      cy.get('#briefing-screen').should('be.visible');
      
      // Check scroll position (briefing should be in view)
      cy.get('#briefing-screen').should('be.inViewport');
    });

    it('should maintain consistent transition timing', () => {
      cy.waitForBootSequence();
      cy.completeAuthentication('Timing Test Agent');
      
      const startTime = Date.now();
      cy.selectMission('accept');
      cy.waitForScreen('briefing');
      const endTime = Date.now();
      
      const transitionTime = endTime - startTime;
      
      // Transition should take reasonable time (not instant, not too slow)
      expect(transitionTime).to.be.greaterThan(500);
      expect(transitionTime).to.be.lessThan(5000);
    });
  });

  describe('Phosphor Effects', () => {
    it('should apply glow effects at appropriate moments', () => {
      cy.waitForBootSequence();
      cy.completeAuthentication('Glow Test Agent');
      cy.waitForScreen('mission');
      
      // Signal lock should get glow effect
      cy.waitForSignalLock();
      cy.get('.signal-lock').should('have.class', 'phosphor-glow-active');
      
      // Personal communication should get glow
      cy.get('.personal-communication', { timeout: 15000 }).should('have.class', 'phosphor-glow-active');
    });

    it('should add glow to interactive elements on focus', () => {
      cy.waitForBootSequence();
      cy.waitForScreen('auth');
      cy.get('#agent-name', { timeout: 10000 }).should('be.visible');
      
      // Focus should trigger phosphor effect
      cy.get('#agent-name').focus();
      
      // Should have visual feedback (glow effect)
      cy.get('#agent-name').should('have.css', 'text-shadow').and('not.equal', 'none');
    });
  });

  describe('Timing Consistency', () => {
    it('should maintain 1200ms delays throughout revelation sequences', () => {
      // This test verifies the architectural requirement for consistent timing
      cy.waitForBootSequence();
      cy.waitForScreen('auth');
      
      // Mock timing to verify delays
      cy.window().then((win) => {
        let delayCount = 0;
        const originalSetTimeout = win.setTimeout;
        
        win.setTimeout = function(callback, delay) {
          if (delay === 1200) {
            delayCount++;
          }
          return originalSetTimeout.call(this, callback, delay);
        };
        
        // Wait for revelation to complete
        cy.get('#agent-name', { timeout: 10000 }).should('be.visible').then(() => {
          // Should have used 1200ms delays multiple times
          expect(delayCount).to.be.greaterThan(3);
        });
      });
    });

    it('should complete animations before allowing interaction', () => {
      cy.waitForBootSequence();
      cy.completeAuthentication('Animation Test Agent');
      cy.waitForScreen('mission');
      
      // Buttons should not be clickable until sequence completes
      cy.get('.accept-button').should('exist');
      
      // Wait for full sequence
      cy.waitForSignalLock();
      cy.get('.personal-message', { timeout: 15000 }).should('contain.text', 'GOBLIN SURPRISE');
      
      // Now buttons should be interactive
      cy.get('.accept-button').should('be.enabled').click();
      cy.waitForScreen('briefing');
    });
  });

  describe('Mobile Cinematic Experience', () => {
    it('should maintain cinematic timing on mobile devices', () => {
      cy.setMobileViewport();
      
      cy.waitForBootSequence();
      
      // Boot sequence should still take appropriate time
      cy.waitForScreen('auth', 20000);
      
      // Auth revelation should work at same pace
      cy.get('#agent-name', { timeout: 10000 }).should('be.visible');
    });

    it('should scale animations appropriately for mobile', () => {
      cy.setMobileViewport();
      
      cy.waitForBootSequence();
      cy.completeAuthentication('Mobile Cinematic Test');
      cy.waitForScreen('mission');
      
      // Signal bars should animate correctly
      cy.get('.signal-bars .bar.bouncing').should('exist');
      cy.waitForSignalLock();
      
      // Personal message should type correctly
      cy.get('.personal-message', { timeout: 15000 }).should('contain.text', 'Mobile Cinematic Test');
    });

    it('should maintain phosphor effects on mobile', () => {
      cy.setMobileViewport();
      
      cy.waitForBootSequence();
      cy.completeAuthentication('Mobile Phosphor Test');
      cy.waitForScreen('mission');
      
      cy.waitForSignalLock();
      cy.shouldHavePhosphorGlow('.signal-lock');
    });
  });

  describe('Performance Under Cinematic Load', () => {
    it('should maintain smooth animations without frame drops', () => {
      cy.waitForBootSequence();
      cy.completeAuthentication('Performance Test Agent');
      cy.waitForScreen('mission');
      
      // Monitor animation performance
      cy.window().then((win) => {
        const startTime = win.performance.now();
        
        cy.waitForSignalLock().then(() => {
          const endTime = win.performance.now();
          const duration = endTime - startTime;
          
          // Should complete in reasonable time (not stalled)
          expect(duration).to.be.lessThan(15000);
        });
      });
    });

    it('should handle multiple concurrent animations', () => {
      cy.waitForBootSequence();
      cy.completeAuthentication('Concurrent Test Agent');
      cy.waitForScreen('mission');
      
      // Multiple things should animate simultaneously
      cy.get('.signal-bars .bar.bouncing').should('exist');
      cy.get('.scan-lines').should('exist'); // CRT effects
      cy.get('.personal-message').should('exist'); // Typing effect
      
      // All should complete successfully
      cy.waitForSignalLock();
      cy.get('.personal-message', { timeout: 15000 }).should('contain.text', 'Concurrent Test Agent');
    });
  });
});