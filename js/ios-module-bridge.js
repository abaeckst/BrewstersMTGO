/**
 * iOS Module Bridge - Simple ES6 Module Loading
 * Since iOS supports ES6 modules but not dynamic imports, just load the main app
 */

console.log('📱 iOS Module Bridge: Loading main app with ES6 modules...');

// Load the main app as an ES6 module
const script = document.createElement('script');
script.type = 'module';
script.src = 'js/app.js';

script.onload = () => {
    console.log('✅ iOS Module Bridge: Main app loaded successfully');
};

script.onerror = (error) => {
    console.error('❌ iOS Module Bridge: Failed to load main app', error);
};

document.head.appendChild(script);