// Playwright Configuration for Visual Regression Testing
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/visual',
  
  // Timeout configuration
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
    toMatchSnapshot: {
      // Threshold for visual differences
      threshold: 0.2,
      mode: 'pixel'
    }
  },
  
  // Test configuration
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/visual-results.json' }]
  ],
  
  // Global test setup
  use: {
    baseURL: 'http://localhost:8000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Reduce motion for consistent screenshots
    reducedMotion: 'reduce',
    
    // Consistent viewport for screenshots
    viewport: { width: 1280, height: 720 },
    
    // Ignore HTTPS errors for local testing
    ignoreHTTPSErrors: true,
    
    // Longer timeout for cinematic sequences
    actionTimeout: 10000,
    navigationTimeout: 30000
  },

  // Test projects for different browsers and viewports
  projects: [
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },
    
    {
      name: 'webkit-desktop',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 }
      },
    },
    
    {
      name: 'firefox-desktop',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 }
      },
    },
    
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        viewport: { width: 393, height: 851 }
      },
    },
    
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 390, height: 844 }
      },
    },
    
    {
      name: 'tablet-ipad',
      use: { 
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 1366 }
      },
    }
  ],

  // Local dev server
  webServer: {
    command: 'npx http-server -p 8000 -c-1',
    port: 8000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  
  // Output directories
  outputDir: 'test-results/',
  
  // Global setup and teardown
  globalSetup: require.resolve('./tests/visual/global-setup.js'),
  globalTeardown: require.resolve('./tests/visual/global-teardown.js'),
});