/**
 * End-to-End Tests for Complete User Journeys
 * Testing the full cinematic experience from boot to completion
 */

describe('Complete User Journey', () => {
  beforeEach(() => {
    cy.enableAudioTesting();
    cy.visitApplication();
  });

  describe('Successful Mission Flow', () => {
    it('should complete the full mission acceptance journey', () => {
      // Boot sequence
      cy.waitForBootSequence();
      cy.get('.boot-sequence-container').should('contain.text', 'TERMINAL READY');
      
      // Authentication
      cy.waitForScreen('auth');
      cy.fillAuthForm({ agentName: 'Cypress Agent' });
      cy.submitAuthForm();
      
      // Mission selection
      cy.waitForScreen('mission');
      cy.waitForSignalBars();
      cy.waitForSignalLock();
      cy.get('.personal-message').should('contain.text', 'OPERATIVE Cypress Agent');
      cy.selectMission('accept');
      
      // Briefing
      cy.waitForScreen('briefing');
      cy.get('.briefing-content').should('contain.text', 'CLASSIFIED');
      cy.get('.action-button.primary').click();
      
      // Countdown
      cy.waitForScreen('countdown');
      cy.waitForCountdown();
      
      // Skip the full countdown for testing
      cy.clock();
      cy.tick(60000);
      
      // Credits
      cy.waitForScreen('credits', 5000);
      cy.get('.credits-content').should('contain.text', 'MISSION COMPLETE');
    });

    it('should maintain consistent state throughout the journey', () => {
      cy.waitForBootSequence();
      cy.completeAuthentication('State Test Agent');
      
      // Verify agent name is stored
      cy.window().then((win) => {
        expect(win.localStorage.getItem('agentName')).to.equal('State Test Agent');
      });
      
      cy.selectMission('accept');
      
      // Verify mission choice is stored
      cy.getMissionChoice().should('equal', 'true');
      
      // Check that state transitions are logged (if debugging is enabled)
      cy.window().then((win) => {
        if (win.appState) {
          const history = win.appState.getHistory();
          expect(history).to.include.members(['boot-sequence', 'auth', 'mission', 'briefing']);
        }
      });
    });

    it('should handle audio throughout the experience', () => {
      cy.enableAudioTesting();
      cy.visitApplication();
      
      // Complete journey while tracking audio
      cy.waitForBootSequence();
      cy.completeAuthentication('Audio Test Agent');
      cy.waitForMissionScreen();
      
      // Verify audio was attempted to be played
      cy.getAudioPlayCount().should('be.greaterThan', 0);
      
      cy.selectMission('accept');
      cy.waitForScreen('briefing');
      
      // Audio should continue throughout
      cy.getAudioPlayCount().should('be.greaterThan', 5);
    });
  });

  describe('Mission Decline Flow', () => {
    it('should complete the mission decline journey', () => {
      cy.waitForBootSequence();
      cy.completeAuthentication('Decline Test Agent');
      cy.selectMission('decline');
      
      // Should go to declined screen
      cy.waitForScreen('declined');
      cy.get('.declined-content').should('contain.text', 'HONORABLE DISCHARGE');
      cy.get('.restart-button').should('be.visible');
    });

    it('should allow restart from declined screen', () => {
      cy.completeDeclineJourney('Restart Test Agent');
      
      // Click restart
      cy.get('.restart-button').click();
      
      // Should return to beginning (auth screen in this implementation)
      cy.waitForScreen('auth', 10000);
      cy.get('#agent-name').should('be.visible');
    });

    it('should store decline choice correctly', () => {
      cy.waitForBootSequence();
      cy.completeAuthentication('Decline Storage Test');
      cy.selectMission('decline');
      
      cy.getMissionChoice().should('equal', 'false');
    });
  });

  describe('Performance Requirements', () => {
    it('should load within 3 seconds', () => {
      cy.measureLoadTime().should('be.lessThan', 3000);
    });

    it('should complete boot sequence within reasonable time', () => {
      const startTime = Date.now();
      
      cy.waitForBootSequence();
      cy.waitForScreen('auth').then(() => {
        const totalTime = Date.now() - startTime;
        expect(totalTime).to.be.lessThan(20000); // 20 seconds max
      });
    });

    it('should handle rapid user interactions', () => {
      cy.waitForBootSequence();
      
      // Rapidly fill and submit auth form
      cy.get('#agent-name', { timeout: 15000 }).type('Rapid Test Agent');
      cy.get('button[type="submit"]').click();
      
      // Should handle rapid mission selection
      cy.get('.accept-button', { timeout: 10000 }).click();
      
      // Should not break the flow
      cy.waitForScreen('briefing');
    });
  });

  describe('Mobile Experience', () => {
    it('should work correctly on mobile viewport', () => {
      cy.setMobileViewport();
      
      cy.waitForBootSequence();
      cy.completeAuthentication('Mobile Test Agent');
      cy.waitForMissionScreen();
      
      // Check that interface is usable on mobile
      cy.get('.accept-button').should('be.visible');
      cy.get('.decline-button').should('be.visible');
      
      // Test touch interaction
      cy.get('.accept-button').click();
      cy.waitForScreen('briefing');
    });

    it('should maintain cinematic timing on mobile', () => {
      cy.setMobileViewport();
      
      cy.waitForBootSequence();
      
      // Boot sequence should still take appropriate time
      cy.get('#auth-screen', { timeout: 20000 }).should('be.visible');
      
      // Auth revelation should work
      cy.get('#agent-name', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid authentication gracefully', () => {
      cy.waitForBootSequence();
      cy.waitForScreen('auth');
      
      // Try to submit empty form
      cy.get('button[type="submit"]').click();
      
      // Should show error or remain on auth screen
      cy.get('#auth-screen').should('be.visible');
      
      // Should not proceed to next screen
      cy.get('#mission-screen').should('not.be.visible');
    });

    it('should handle missing local storage gracefully', () => {
      // Clear all storage
      cy.clearApplicationData();
      
      cy.waitForBootSequence();
      cy.completeAuthentication('Storage Test Agent');
      
      // Should still work without previous data
      cy.waitForMissionScreen();
      cy.get('.personal-message').should('contain.text', 'Storage Test Agent');
    });

    it('should not crash on audio failures', () => {
      // Mock audio to fail
      cy.window().then((win) => {
        win.Audio = function() {
          throw new Error('Audio not supported');
        };
      });
      
      cy.waitForBootSequence();
      cy.completeAuthentication('Audio Fail Test');
      
      // Should continue working despite audio failures
      cy.waitForMissionScreen();
      cy.selectMission('accept');
      cy.waitForScreen('briefing');
    });

    it('should handle console errors gracefully', () => {
      cy.expectNoConsoleErrors();
      
      cy.waitForBootSequence();
      cy.completeAuthentication('Error Test Agent');
      cy.waitForMissionScreen();
      cy.selectMission('accept');
      
      // Should complete without critical console errors
      cy.waitForScreen('briefing');
    });
  });

  describe('Accessibility', () => {
    it('should meet basic accessibility standards', () => {
      cy.waitForBootSequence();
      cy.checkAccessibility();
      
      cy.waitForScreen('auth');
      cy.checkAccessibility();
      
      cy.completeAuthentication('A11y Test Agent');
      cy.checkAccessibility();
    });

    it('should support keyboard navigation', () => {
      cy.waitForBootSequence();
      cy.waitForScreen('auth');
      
      // Test tab navigation
      cy.tabThroughInterface();
      cy.focused().should('have.id', 'agent-name');
      
      cy.focused().type('Keyboard Test Agent');
      cy.get('body').tab();
      cy.focused().should('have.attr', 'type', 'submit');
      
      // Submit with Enter key
      cy.focused().type('{enter}');
      cy.waitForScreen('mission');
    });

    it('should respect reduced motion preferences', () => {
      cy.testReducedMotion();
      
      cy.waitForBootSequence();
      cy.waitForScreen('auth');
      
      // Animations should be reduced but interface should still work
      cy.completeAuthentication('Reduced Motion Test');
      cy.waitForMissionScreen();
    });
  });

  describe('Visual Consistency', () => {
    it('should maintain terminal aesthetic throughout', () => {
      cy.waitForBootSequence();
      cy.shouldHaveTerminalStyling('#app');
      
      cy.waitForScreen('auth');
      cy.shouldHaveTerminalStyling('#auth-screen');
      
      cy.completeAuthentication('Visual Test Agent');
      cy.shouldHaveTerminalStyling('#mission-screen');
    });

    it('should display phosphor effects correctly', () => {
      cy.waitForBootSequence();
      cy.completeAuthentication('Phosphor Test Agent');
      cy.waitForMissionScreen();
      
      // Wait for signal lock to show phosphor effect
      cy.waitForSignalLock();
      cy.shouldHavePhosphorGlow('.signal-lock');
    });

    it('should scale text appropriately on different viewports', () => {
      // Test desktop
      cy.setDesktopViewport();
      cy.waitForBootSequence();
      cy.get('.boot-message').first().should('have.css', 'font-size').and('match', /2[0-9]px/);
      
      // Test mobile
      cy.setMobileViewport();
      cy.reload();
      cy.waitForBootSequence();
      cy.get('.boot-message').first().should('have.css', 'font-size').and('match', /2[0-9]px/);
    });
  });

  describe('Data Persistence', () => {
    it('should remember agent name across sessions', () => {
      cy.completeSuccessfulJourney('Persistent Test Agent');
      
      // Reload the page
      cy.reload();
      cy.waitForBootSequence();
      cy.waitForScreen('auth');
      
      // Agent name should be remembered in localStorage
      cy.window().then((win) => {
        expect(win.localStorage.getItem('agentName')).to.equal('Persistent Test Agent');
      });
    });

    it('should handle session restoration correctly', () => {
      cy.setAgentName('Restored Agent');
      
      cy.visitApplication();
      cy.waitForBootSequence();
      cy.waitForScreen('auth');
      
      // Should start fresh regardless of stored data
      cy.get('#agent-name').should('have.value', '');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long agent names', () => {
      const longName = 'A'.repeat(50);
      
      cy.waitForBootSequence();
      cy.waitForScreen('auth');
      cy.fillAuthForm({ agentName: longName });
      cy.submitAuthForm();
      
      // Should either truncate or show error
      cy.get('body').then($body => {
        const isOnMission = $body.find('#mission-screen:visible').length > 0;
        const isOnAuth = $body.find('#auth-screen:visible').length > 0;
        expect(isOnMission || isOnAuth).to.be.true;
      });
    });

    it('should handle special characters in agent name', () => {
      cy.waitForBootSequence();
      cy.waitForScreen('auth');
      cy.fillAuthForm({ agentName: 'Agent <script>alert("xss")</script>' });
      cy.submitAuthForm();
      
      // Should sanitize input and either proceed or show error
      cy.get('body').should('not.contain', 'alert("xss")');
    });

    it('should handle rapid screen transitions', () => {
      cy.waitForBootSequence();
      cy.completeAuthentication('Rapid Agent');
      
      // Rapidly click mission choice
      cy.get('.accept-button', { timeout: 10000 }).click();
      cy.get('.accept-button').click(); // Double click
      
      // Should not break the application
      cy.waitForScreen('briefing');
    });
  });
});