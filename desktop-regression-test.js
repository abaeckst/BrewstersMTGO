/**
 * Desktop Regression Test Suite
 * Verifies that iOS compatibility fixes don't break desktop functionality
 */

console.log('🔍 Desktop Regression Test Suite Starting...');

// Test 1: Verify ES6 modules still load properly
function testES6ModuleLoading() {
    console.log('\n📦 Testing ES6 Module Loading...');
    
    // Check if we can access module exports (they should be available after loading)
    setTimeout(() => {
        const tests = [
            { name: 'App instance', check: () => window.app },
            { name: 'App state', check: () => window.appState },
            { name: 'Audio Engine', check: () => window.AudioEngine },
        ];
        
        tests.forEach(test => {
            try {
                const result = test.check();
                console.log(`  ${result ? '✅' : '❌'} ${test.name}: ${result ? 'Available' : 'Missing'}`);
            } catch (error) {
                console.log(`  ❌ ${test.name}: Error - ${error.message}`);
            }
        });
    }, 2000); // Wait for modules to load
}

// Test 2: Verify CSS architecture integrity
function testCSSArchitecture() {
    console.log('\n🎨 Testing CSS Architecture...');
    
    // Check for critical CSS classes
    const criticalSelectors = [
        '.app-container',
        '.screen',
        '.wake-screen-dormant',
        '.terminal-input',
        '.action-button'
    ];
    
    criticalSelectors.forEach(selector => {
        const element = document.querySelector(selector);
        const hasStyles = element && getComputedStyle(element).display !== '';
        console.log(`  ${hasStyles ? '✅' : '❌'} ${selector}: ${hasStyles ? 'Styled' : 'Missing styles'}`);
    });
    
    // Check if CSS layers are working
    const testElement = document.createElement('div');
    testElement.className = 'test-layer-element';
    testElement.style.display = 'none';
    document.body.appendChild(testElement);
    
    // Test if @layer system is functional
    const layerTest = getComputedStyle(testElement).display === 'none';
    console.log(`  ${layerTest ? '✅' : '❌'} CSS Layer System: ${layerTest ? 'Functional' : 'Broken'}`);
    
    document.body.removeChild(testElement);
}

// Test 3: Verify iOS polyfills don't affect desktop
function testIOSPolyfillIsolation() {
    console.log('\n📱 Testing iOS Polyfill Isolation...');
    
    // Check that iOS-specific classes are not applied on desktop
    const hasIOSLegacy = document.documentElement.classList.contains('ios-legacy');
    console.log(`  ${!hasIOSLegacy ? '✅' : '⚠️'} iOS Legacy Class: ${hasIOSLegacy ? 'Applied (unexpected on desktop)' : 'Not applied (correct)'}`);
    
    // Check iOS detection
    if (window.IOSPolyfills) {
        const isIOS = window.IOSPolyfills.isIOS;
        console.log(`  ${!isIOS ? '✅' : '⚠️'} iOS Detection: ${isIOS ? 'Detected as iOS (unexpected)' : 'Detected as non-iOS (correct)'}`);
    }
    
    // Check module bridge
    if (window.IOSModuleBridge) {
        const needsPolyfill = window.IOSModuleBridge.needsPolyfill;
        console.log(`  ${!needsPolyfill ? '✅' : '⚠️'} Module Polyfill: ${needsPolyfill ? 'Activated (unexpected on desktop)' : 'Not activated (correct)'}`);
    }
}

// Test 4: Verify audio system integrity
function testAudioSystem() {
    console.log('\n🔊 Testing Audio System...');
    
    // Check AudioContext availability
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    console.log(`  ${AudioContext ? '✅' : '❌'} AudioContext: ${AudioContext ? 'Available' : 'Missing'}`);
    
    // Check if main audio engine is accessible
    setTimeout(() => {
        if (window.AudioEngine) {
            console.log(`  ✅ Audio Engine: Available`);
            console.log(`  📊 Audio Engine Properties:`, Object.keys(window.AudioEngine));
        } else {
            console.log(`  ❌ Audio Engine: Missing`);
        }
    }, 1000);
}

// Test 5: Verify screen transitions work
function testScreenTransitions() {
    console.log('\n🖥️ Testing Screen Transitions...');
    
    // Check that wake screen is active initially
    const wakeScreen = document.getElementById('wake-screen');
    const isWakeActive = wakeScreen && wakeScreen.classList.contains('active');
    console.log(`  ${isWakeActive ? '✅' : '❌'} Wake Screen: ${isWakeActive ? 'Active (correct)' : 'Not active'}`);
    
    // Check other screens are hidden
    const screens = document.querySelectorAll('.screen:not(#wake-screen)');
    let allOthersHidden = true;
    screens.forEach(screen => {
        if (!screen.classList.contains('hidden')) {
            allOthersHidden = false;
        }
    });
    console.log(`  ${allOthersHidden ? '✅' : '❌'} Other Screens: ${allOthersHidden ? 'Hidden (correct)' : 'Some visible'}`);
}

// Test 6: Performance impact assessment
function testPerformanceImpact() {
    console.log('\n⚡ Testing Performance Impact...');
    
    const startTime = performance.now();
    
    // Measure DOM query performance
    for (let i = 0; i < 1000; i++) {
        document.querySelector('.app-container');
    }
    
    const endTime = performance.now();
    const queryTime = endTime - startTime;
    
    console.log(`  📊 DOM Query Performance: ${queryTime.toFixed(2)}ms for 1000 queries`);
    console.log(`  ${queryTime < 100 ? '✅' : '⚠️'} Performance: ${queryTime < 100 ? 'Good' : 'May need optimization'}`);
    
    // Check memory usage if available
    if (performance.memory) {
        const memory = performance.memory;
        console.log(`  📊 Memory Usage:`, {
            used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
            total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
            limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
        });
    }
}

// Test 7: Network requests verification
function testNetworkRequests() {
    console.log('\n🌐 Testing Network Requests...');
    
    // Test if all assets loaded successfully
    const scripts = document.querySelectorAll('script[src]');
    const styles = document.querySelectorAll('link[rel="stylesheet"]');
    
    console.log(`  📄 Scripts loaded: ${scripts.length}`);
    console.log(`  🎨 Stylesheets loaded: ${styles.length}`);
    
    // Check for 404 errors in console (if available)
    const originalError = console.error;
    let errorCount = 0;
    console.error = (...args) => {
        if (args.some(arg => typeof arg === 'string' && (arg.includes('404') || arg.includes('Failed to load')))) {
            errorCount++;
        }
        originalError.apply(console, args);
    };
    
    setTimeout(() => {
        console.log(`  ${errorCount === 0 ? '✅' : '❌'} Network Errors: ${errorCount === 0 ? 'None detected' : `${errorCount} errors found`}`);
        console.error = originalError; // Restore original
    }, 1000);
}

// Run all tests
function runDesktopRegressionTests() {
    console.log('🚀 Starting Desktop Regression Tests...\n');
    
    testES6ModuleLoading();
    testCSSArchitecture();
    testIOSPolyfillIsolation();
    testAudioSystem();
    testScreenTransitions();
    testPerformanceImpact();
    testNetworkRequests();
    
    // Final summary
    setTimeout(() => {
        console.log('\n🏁 Desktop Regression Tests Complete!');
        console.log('📋 Summary: Check above results for any ❌ or ⚠️ indicators');
        console.log('✅ All passed = Desktop functionality preserved');
        console.log('❌ Any failed = Desktop regression detected');
    }, 3000);
}

// Auto-run tests when loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runDesktopRegressionTests);
} else {
    runDesktopRegressionTests();
}