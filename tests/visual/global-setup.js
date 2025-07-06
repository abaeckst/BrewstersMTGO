// Global setup for Playwright visual regression tests

async function globalSetup(config) {
  console.log('🎬 Setting up visual regression testing environment...');
  
  // Setup any global test data or configuration
  process.env.VISUAL_TESTING = 'true';
  
  // Ensure consistent environment for visual testing
  process.env.TZ = 'UTC';
  
  console.log('✅ Visual testing environment ready');
}

module.exports = globalSetup;