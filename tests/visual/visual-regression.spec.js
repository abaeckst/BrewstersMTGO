/**
 * Visual Regression Tests for Brewster's MTGO Mission Terminal
 * Ensuring consistent visual appearance across browsers and devices
 */

const { test, expect } = require('@playwright/test');

// Helper function to mock audio and animations for consistent screenshots
async function setupVisualTestEnvironment(page) {
  await page.addInitScript(() => {
    // Mock AudioContext for consistent testing
    window.AudioContext = function() {
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
    window.Audio = function() {
      return {
        play: () => Promise.resolve(),
        pause: () => {},
        load: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        currentTime: 0,
        duration: 0,
        volume: 1
      };
    };
    
    // Disable animations for consistent screenshots
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-delay: 0.01ms !important;
        transition-duration: 0.01ms !important;
        transition-delay: 0.01ms !important;
      }
    `;
    document.head.appendChild(style);
  });
}

// Helper to wait for specific screen and animations to complete
async function waitForScreenStable(page, screenId, additionalWait = 1000) {
  await page.waitForSelector(`#${screenId}-screen:not(.hidden)`, { timeout: 15000 });
  await page.waitForTimeout(additionalWait); // Wait for animations to complete
}

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupVisualTestEnvironment(page);
  });

  test.describe('Boot Sequence', () => {
    test('boot sequence initial state', async ({ page }) => {
      await page.goto('/');
      
      // Wait for boot sequence to start
      await page.waitForSelector('#boot-sequence-screen', { timeout: 10000 });
      await page.waitForTimeout(2000); // Let initial messages appear
      
      await expect(page).toHaveScreenshot('boot-sequence-initial.png', {
        fullPage: true,
        mask: [
          page.locator('.timestamp'), // Hide any timestamps
          page.locator('.debug-info')  // Hide debug information
        ]
      });
    });

    test('boot sequence with messages', async ({ page }) => {
      await page.goto('/');
      
      // Wait for several boot messages to appear
      await page.waitForSelector('#boot-sequence-screen', { timeout: 10000 });
      await page.waitForTimeout(5000); // Let messages accumulate
      
      await expect(page).toHaveScreenshot('boot-sequence-messages.png', {
        fullPage: true
      });
    });
  });

  test.describe('Authentication Screen', () => {
    test('auth screen complete revelation', async ({ page }) => {
      await page.goto('/');
      
      // Wait for boot sequence to complete and auth screen to appear
      await waitForScreenStable(page, 'auth', 8000); // Wait for full revelation
      
      await expect(page).toHaveScreenshot('auth-screen-complete.png', {
        fullPage: true
      });
    });

    test('auth screen with form focus', async ({ page }) => {
      await page.goto('/');
      await waitForScreenStable(page, 'auth', 8000);
      
      // Focus on the agent name input
      await page.click('#agent-name');
      await page.waitForTimeout(500); // Wait for focus effects
      
      await expect(page).toHaveScreenshot('auth-screen-focused.png', {
        fullPage: true
      });
    });

    test('auth screen with filled form', async ({ page }) => {
      await page.goto('/');
      await waitForScreenStable(page, 'auth', 8000);
      
      // Fill the form
      await page.fill('#agent-name', 'Visual Test Agent');
      
      // Check if access code field exists
      const accessCodeField = await page.locator('#access-code').count();
      if (accessCodeField > 0) {
        await page.fill('#access-code', 'test123');
      }
      
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('auth-screen-filled.png', {
        fullPage: true
      });
    });
  });

  test.describe('Mission Screen', () => {
    test('mission screen signal detection', async ({ page }) => {
      await page.goto('/');
      
      // Complete auth flow
      await waitForScreenStable(page, 'auth', 8000);
      await page.fill('#agent-name', 'Visual Test Agent');
      
      const accessCodeField = await page.locator('#access-code').count();
      if (accessCodeField > 0) {
        await page.fill('#access-code', 'test123');
      }
      
      await page.click('button[type="submit"]');
      
      // Wait for mission screen
      await waitForScreenStable(page, 'mission', 3000);
      
      await expect(page).toHaveScreenshot('mission-screen-signal-detection.png', {
        fullPage: true
      });
    });

    test('mission screen signal locked', async ({ page }) => {
      await page.goto('/');
      
      // Complete auth and get to mission screen
      await waitForScreenStable(page, 'auth', 8000);
      await page.fill('#agent-name', 'Visual Test Agent');
      
      const accessCodeField = await page.locator('#access-code').count();
      if (accessCodeField > 0) {
        await page.fill('#access-code', 'test123');
      }
      
      await page.click('button[type="submit"]');
      await waitForScreenStable(page, 'mission', 3000);
      
      // Wait for signal lock to complete
      await page.waitForSelector('.signal-bars .bar.locked', { timeout: 15000 });
      await page.waitForTimeout(2000); // Wait for personal message
      
      await expect(page).toHaveScreenshot('mission-screen-signal-locked.png', {
        fullPage: true
      });
    });

    test('mission screen with personal message', async ({ page }) => {
      await page.goto('/');
      
      // Complete full mission screen sequence
      await waitForScreenStable(page, 'auth', 8000);
      await page.fill('#agent-name', 'Visual Test Agent');
      
      const accessCodeField = await page.locator('#access-code').count();
      if (accessCodeField > 0) {
        await page.fill('#access-code', 'test123');
      }
      
      await page.click('button[type="submit"]');
      await waitForScreenStable(page, 'mission', 3000);
      
      // Wait for full sequence including personal message
      await page.waitForSelector('.personal-message', { timeout: 15000 });
      await page.waitForTimeout(10000); // Wait for typing to complete
      
      await expect(page).toHaveScreenshot('mission-screen-personal-message.png', {
        fullPage: true
      });
    });

    test('mission screen button hover state', async ({ page }) => {
      await page.goto('/');
      
      // Get to mission screen with choices ready
      await waitForScreenStable(page, 'auth', 8000);
      await page.fill('#agent-name', 'Visual Test Agent');
      
      const accessCodeField = await page.locator('#access-code').count();
      if (accessCodeField > 0) {
        await page.fill('#access-code', 'test123');
      }
      
      await page.click('button[type="submit"]');
      await waitForScreenStable(page, 'mission', 15000); // Wait for full sequence
      
      // Hover over accept button
      await page.hover('.accept-button');
      await page.waitForTimeout(500);
      
      await expect(page).toHaveScreenshot('mission-screen-button-hover.png', {
        fullPage: true
      });
    });
  });

  test.describe('Briefing Screen', () => {
    test('briefing screen layout', async ({ page }) => {
      await page.goto('/');
      
      // Complete journey to briefing
      await waitForScreenStable(page, 'auth', 8000);
      await page.fill('#agent-name', 'Visual Test Agent');
      
      const accessCodeField = await page.locator('#access-code').count();
      if (accessCodeField > 0) {
        await page.fill('#access-code', 'test123');
      }
      
      await page.click('button[type="submit"]');
      await waitForScreenStable(page, 'mission', 15000);
      
      // Accept mission
      await page.click('.accept-button');
      await waitForScreenStable(page, 'briefing', 3000);
      
      await expect(page).toHaveScreenshot('briefing-screen.png', {
        fullPage: true
      });
    });
  });

  test.describe('Countdown Screen', () => {
    test('countdown screen initial state', async ({ page }) => {
      await page.goto('/');
      
      // Complete journey to countdown
      await waitForScreenStable(page, 'auth', 8000);
      await page.fill('#agent-name', 'Visual Test Agent');
      
      const accessCodeField = await page.locator('#access-code').count();
      if (accessCodeField > 0) {
        await page.fill('#access-code', 'test123');
      }
      
      await page.click('button[type="submit"]');
      await waitForScreenStable(page, 'mission', 15000);
      await page.click('.accept-button');
      await waitForScreenStable(page, 'briefing', 3000);
      await page.click('.action-button.primary');
      await waitForScreenStable(page, 'countdown', 3000);
      
      await expect(page).toHaveScreenshot('countdown-screen.png', {
        fullPage: true
      });
    });
  });

  test.describe('Declined Screen', () => {
    test('declined screen layout', async ({ page }) => {
      await page.goto('/');
      
      // Complete journey to declined screen
      await waitForScreenStable(page, 'auth', 8000);
      await page.fill('#agent-name', 'Visual Test Agent');
      
      const accessCodeField = await page.locator('#access-code').count();
      if (accessCodeField > 0) {
        await page.fill('#access-code', 'test123');
      }
      
      await page.click('button[type="submit"]');
      await waitForScreenStable(page, 'mission', 15000);
      
      // Decline mission
      await page.click('.decline-button');
      await waitForScreenStable(page, 'declined', 3000);
      
      await expect(page).toHaveScreenshot('declined-screen.png', {
        fullPage: true
      });
    });
  });

  test.describe('Mobile Responsive Design', () => {
    test('mobile auth screen', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto('/');
      
      await waitForScreenStable(page, 'auth', 8000);
      
      await expect(page).toHaveScreenshot('mobile-auth-screen.png', {
        fullPage: true
      });
    });

    test('mobile mission screen', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      await waitForScreenStable(page, 'auth', 8000);
      await page.fill('#agent-name', 'Mobile Test');
      
      const accessCodeField = await page.locator('#access-code').count();
      if (accessCodeField > 0) {
        await page.fill('#access-code', 'test123');
      }
      
      await page.click('button[type="submit"]');
      await waitForScreenStable(page, 'mission', 15000);
      
      await expect(page).toHaveScreenshot('mobile-mission-screen.png', {
        fullPage: true
      });
    });
  });

  test.describe('Tablet Layout', () => {
    test('tablet auth screen', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      await page.goto('/');
      
      await waitForScreenStable(page, 'auth', 8000);
      
      await expect(page).toHaveScreenshot('tablet-auth-screen.png', {
        fullPage: true
      });
    });
  });

  test.describe('Dark Theme Consistency', () => {
    test('should maintain dark terminal theme', async ({ page }) => {
      await page.goto('/');
      
      // Check initial dark theme
      await page.waitForSelector('#app', { timeout: 10000 });
      
      await expect(page).toHaveScreenshot('dark-theme-boot.png', {
        fullPage: true
      });
    });

    test('should maintain phosphor green colors', async ({ page }) => {
      await page.goto('/');
      await waitForScreenStable(page, 'auth', 8000);
      
      // Verify green phosphor colors are maintained
      const textColor = await page.evaluate(() => {
        const element = document.querySelector('h1');
        return window.getComputedStyle(element).color;
      });
      
      // Should be some variant of green
      expect(textColor).toMatch(/rgb\(0,\s*255|#00ff|green/i);
      
      await expect(page).toHaveScreenshot('phosphor-green-theme.png', {
        fullPage: true
      });
    });
  });

  test.describe('Cross-Browser Consistency', () => {
    test('should look consistent across browsers', async ({ page, browserName }) => {
      await page.goto('/');
      await waitForScreenStable(page, 'auth', 8000);
      
      await expect(page).toHaveScreenshot(`cross-browser-auth-${browserName}.png`, {
        fullPage: true
      });
    });
  });

  test.describe('Typography and Scaling', () => {
    test('should scale text appropriately on different viewports', async ({ page }) => {
      // Test desktop scaling
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');
      await waitForScreenStable(page, 'auth', 8000);
      
      await expect(page).toHaveScreenshot('typography-desktop.png', {
        fullPage: true
      });
    });

    test('should prevent word breaks on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 }); // iPhone SE portrait
      await page.goto('/');
      await waitForScreenStable(page, 'auth', 8000);
      
      // Check for any hyphenated words or broken text
      await expect(page).toHaveScreenshot('typography-mobile-no-breaks.png', {
        fullPage: true
      });
    });
  });

  test.describe('Animation States', () => {
    test('should capture loading/animation states consistently', async ({ page }) => {
      await page.goto('/');
      
      // Capture boot sequence in progress
      await page.waitForSelector('.boot-message', { timeout: 10000 });
      await page.waitForTimeout(3000); // Capture mid-animation
      
      await expect(page).toHaveScreenshot('animation-boot-progress.png', {
        fullPage: true
      });
    });
  });
});