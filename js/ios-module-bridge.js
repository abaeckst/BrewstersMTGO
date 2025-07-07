/**
 * iOS Module Bridge - Progressive Enhancement for iOS Safari < 14
 * Provides lightweight ES6 module polyfill for older iOS versions
 * Zero impact on desktop and modern browsers
 */

class IOSModuleBridge {
    constructor() {
        this.isIOS = this.detectIOS();
        this.needsPolyfill = this.checkModuleSupport();
        this.modules = new Map();
        this.loadQueue = [];
        this.initialized = false;
    }

    /**
     * Detect iOS devices specifically
     */
    detectIOS() {
        const isIOSUserAgent = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isIPadOS = (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const isIOSStandalone = ('standalone' in window.navigator) && window.navigator.standalone === true;
        
        return (isIOSUserAgent || isIPadOS || isIOSStandalone) && 'ontouchstart' in window;
    }

    /**
     * Check if iOS Safari supports ES6 modules properly
     */
    checkModuleSupport() {
        if (!this.isIOS) {
            return false; // Not iOS, no polyfill needed
        }

        // Check for ES6 module support
        const hasModuleSupport = 'noModule' in HTMLScriptElement.prototype;
        
        // Check iOS version from user agent
        const iOSVersion = this.getIOSVersion();
        const safariVersion = this.getSafariVersion();
        
        // iOS Safari < 14 or Safari < 14 needs polyfill
        const needsPolyfill = !hasModuleSupport || iOSVersion < 14 || safariVersion < 14;
        
        console.log('📱 iOS Module Support Check:', {
            isIOS: this.isIOS,
            iOSVersion,
            safariVersion,
            hasModuleSupport,
            needsPolyfill
        });

        return needsPolyfill;
    }

    /**
     * Get iOS version from user agent
     */
    getIOSVersion() {
        const match = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
        if (match) {
            return parseInt(match[1], 10);
        }
        return 14; // Default to modern version if can't detect
    }

    /**
     * Get Safari version from user agent
     */
    getSafariVersion() {
        const match = navigator.userAgent.match(/Version\/(\d+)\./);
        if (match) {
            return parseInt(match[1], 10);
        }
        return 14; // Default to modern version if can't detect
    }

    /**
     * Initialize the module bridge if needed
     */
    async init() {
        if (!this.needsPolyfill) {
            console.log('📱 iOS Module Bridge: Not needed, using native ES6 modules');
            return;
        }

        console.log('📱 iOS Module Bridge: Initializing polyfill...');
        
        // Create module polyfill
        this.setupModulePolyfill();
        
        // Load main application with polyfill
        await this.loadMainApplication();
        
        this.initialized = true;
        console.log('✅ iOS Module Bridge: Initialized successfully');
    }

    /**
     * Setup basic module polyfill
     */
    setupModulePolyfill() {
        // Create a basic module system
        window.IOSModules = {
            registry: new Map(),
            
            // Define a module
            define: (name, deps, factory) => {
                this.modules.set(name, {
                    dependencies: deps,
                    factory: factory,
                    exports: null,
                    loaded: false
                });
            },
            
            // Import a module
            import: async (name) => {
                if (this.modules.has(name)) {
                    const module = this.modules.get(name);
                    if (!module.loaded) {
                        // Load dependencies first
                        const depExports = await Promise.all(
                            module.dependencies.map(dep => this.import(dep))
                        );
                        
                        // Execute module factory
                        module.exports = module.factory(...depExports);
                        module.loaded = true;
                    }
                    return module.exports;
                }
                throw new Error(`Module '${name}' not found`);
            }
        };
    }

    /**
     * Load main application with simplified imports
     */
    async loadMainApplication() {
        // Create a simplified version of the main app for iOS
        const appScript = document.createElement('script');
        appScript.textContent = `
            (async function() {
                console.log('📱 iOS Module Bridge: Loading simplified application...');
                
                // Basic iOS-compatible app initialization
                class SimpleApp {
                    constructor() {
                        this.debug = window.location.search.includes('debug');
                        this.initialized = false;
                    }
                    
                    async init() {
                        console.log('📱 iOS Simple App: Initializing...');
                        
                        // Initialize iOS polyfills first
                        if (window.IOSPolyfills) {
                            window.IOSPolyfills.init();
                        }
                        
                        // Basic screen management
                        this.setupBasicScreens();
                        
                        // Basic event listeners
                        this.setupBasicEvents();
                        
                        // Start with wake screen
                        this.showWakeScreen();
                        
                        this.initialized = true;
                        console.log('✅ iOS Simple App: Initialized');
                    }
                    
                    setupBasicScreens() {
                        // Cache screen elements
                        this.screens = {
                            wake: document.getElementById('wake-screen'),
                            boot: document.getElementById('boot-sequence-screen'),
                            auth: document.getElementById('auth-screen'),
                            mission: document.getElementById('mission-screen'),
                            briefing: document.getElementById('briefing-screen'),
                            countdown: document.getElementById('countdown-screen'),
                            credits: document.getElementById('credits-screen'),
                            declined: document.getElementById('declined-screen')
                        };
                    }
                    
                    setupBasicEvents() {
                        // Wake screen activation
                        const wakeScreen = this.screens.wake;
                        if (wakeScreen) {
                            const wakeHandler = () => {
                                console.log('📱 Wake screen activated');
                                this.transitionToAuth();
                            };
                            
                            wakeScreen.addEventListener('click', wakeHandler);
                            wakeScreen.addEventListener('touchstart', wakeHandler);
                        }
                        
                        // Auth form submission
                        const authForm = document.getElementById('auth-form');
                        if (authForm) {
                            authForm.addEventListener('submit', (e) => {
                                e.preventDefault();
                                this.transitionToMission();
                            });
                        }
                        
                        // Mission buttons
                        const acceptButton = document.querySelector('.accept-button');
                        const declineButton = document.querySelector('.decline-button');
                        
                        if (acceptButton) {
                            acceptButton.addEventListener('click', () => {
                                this.transitionToBriefing();
                            });
                        }
                        
                        if (declineButton) {
                            declineButton.addEventListener('click', () => {
                                this.transitionToDeclined();
                            });
                        }
                    }
                    
                    showScreen(screenName) {
                        // Hide all screens
                        Object.values(this.screens).forEach(screen => {
                            if (screen) {
                                screen.classList.remove('active');
                                screen.classList.add('hidden');
                            }
                        });
                        
                        // Show target screen
                        const targetScreen = this.screens[screenName];
                        if (targetScreen) {
                            targetScreen.classList.remove('hidden');
                            targetScreen.classList.add('active');
                        }
                    }
                    
                    showWakeScreen() {
                        this.showScreen('wake');
                        
                        // Show wake instruction after delay
                        setTimeout(() => {
                            const wakeInstruction = document.querySelector('.wake-instruction');
                            if (wakeInstruction) {
                                wakeInstruction.classList.remove('wake-stage-1-hidden');
                            }
                        }, 2000);
                    }
                    
                    transitionToAuth() {
                        this.showScreen('auth');
                        
                        // Progressive reveal for auth screen
                        setTimeout(() => {
                            const elements = document.querySelectorAll('[class*="auth-stage-"]');
                            elements.forEach((element, index) => {
                                setTimeout(() => {
                                    element.classList.add('revealed');
                                }, index * 300);
                            });
                        }, 500);
                    }
                    
                    transitionToMission() {
                        this.showScreen('mission');
                        
                        // Progressive reveal
                        setTimeout(() => {
                            const elements = document.querySelectorAll('.reveal-element');
                            elements.forEach((element, index) => {
                                setTimeout(() => {
                                    element.classList.add('revealed');
                                }, index * 300);
                            });
                        }, 500);
                    }
                    
                    transitionToBriefing() {
                        this.showScreen('briefing');
                    }
                    
                    transitionToDeclined() {
                        this.showScreen('declined');
                    }
                }
                
                // Initialize simple app
                window.iosApp = new SimpleApp();
                await window.iosApp.init();
            })();
        `;
        
        document.head.appendChild(appScript);
    }
}

// Initialize iOS Module Bridge if needed
const iosModuleBridge = new IOSModuleBridge();

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        iosModuleBridge.init();
    });
} else {
    iosModuleBridge.init();
}

// Export for potential use
window.IOSModuleBridge = iosModuleBridge;