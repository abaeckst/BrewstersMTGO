const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    experimentalStudio: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    
    setupNodeEvents(on, config) {
      // implement node event listeners here
      
      // Task for custom commands
      on('task', {
        log(message) {
          console.log(message);
          return null;
        }
      });
    },
    
    // Pattern for test files
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // Exclude patterns
    excludeSpecPattern: [
      '**/examples/*',
      '**/node_modules/*'
    ],
    
    // Support file
    supportFile: 'cypress/support/e2e.js',
    
    // Test isolation
    testIsolation: true,
    
    // Browser configuration
    chromeWebSecurity: false,
    
    // Environment variables
    env: {
      coverage: false,
      codeCoverage: {
        url: 'http://localhost:8000/__coverage__'
      }
    }
  },
  
  component: {
    devServer: {
      framework: 'vanilla',
      bundler: 'webpack'
    }
  }
});