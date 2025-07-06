// Global teardown for Playwright visual regression tests

async function globalTeardown(config) {
  console.log('🧹 Cleaning up visual regression testing environment...');
  
  // Cleanup any global test data
  delete process.env.VISUAL_TESTING;
  
  console.log('✅ Visual testing cleanup complete');
}

module.exports = globalTeardown;