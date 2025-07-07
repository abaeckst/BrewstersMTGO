/**
 * iOS Safari Polyfills and Compatibility Fixes
 * Handles iOS-specific issues and missing features
 */

export class IOSPolyfills {
    static init() {
        console.log('📱 Checking for iOS device...');
        
        // Detect iOS
        this.isIOS = this.detectIOS();
        
        if (!this.isIOS) {
            console.log('💻 Desktop or non-iOS device detected, skipping all iOS fixes');
            return; // Early exit - don't apply ANY fixes on non-iOS devices
        }
        
        console.log('📱 iOS detected, applying compatibility fixes...');
        
        // Apply iOS-specific fixes ONLY on iOS
        this.fixViewportHeight();
        this.fixScrolling();
        this.fixTouchEvents();
        this.fixAudioContext();
        this.preventZoom();
        this.fixInputFocus();
        this.addSafeAreaCSS();
        this.fixWebkitTransforms();
        
        console.log('✅ iOS polyfills applied');
    }
    
    static detectIOS() {
        // Detect iOS devices with multiple checks to avoid false positives
        const isIOSUserAgent = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        // Additional iOS detection for iPad on iOS 13+
        const isIPadOS = (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        // Check for iOS Safari specifically (not Chrome on iOS)
        const isIOSSafari = isIOSUserAgent && /Safari/.test(navigator.userAgent) && !/CriOS/.test(navigator.userAgent);
        
        // iOS standalone mode check
        const isIOSStandalone = ('standalone' in window.navigator) && window.navigator.standalone === true;
        
        // Final determination - must be actual iOS, not desktop
        const isIOS = (isIOSUserAgent || isIPadOS || isIOSStandalone) && 'ontouchstart' in window;
        
        // Check iOS version for legacy support
        const iOSVersion = this.getIOSVersion();
        const needsLegacySupport = iOSVersion < 14;
        
        // Add iOS legacy class if needed
        if (isIOS && needsLegacySupport) {
            document.documentElement.classList.add('ios-legacy');
            console.log('📱 iOS Legacy mode enabled for iOS', iOSVersion);
        }
        
        console.log('📱 iOS Detection:', {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            isIOSUserAgent,
            isIPadOS,
            isIOSSafari,
            isIOSStandalone,
            iOSVersion,
            needsLegacySupport,
            finalResult: isIOS
        });
        
        return isIOS;
    }
    
    static getIOSVersion() {
        // Extract iOS version from user agent
        const match = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
        if (match) {
            return parseInt(match[1], 10);
        }
        
        // Fallback detection for newer iOS versions
        const versionMatch = navigator.userAgent.match(/Version\/(\d+)\./);
        if (versionMatch) {
            return parseInt(versionMatch[1], 10);
        }
        
        return 14; // Default to modern version if can't detect
    }
    
    static fixViewportHeight() {
        // Fix iOS viewport height issues with bottom bars
        const setViewportHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--ios-vh', `${vh}px`);
            
            // Apply to app container
            const appContainer = document.querySelector('.app-container');
            if (appContainer) {
                appContainer.style.minHeight = `${window.innerHeight}px`;
                appContainer.style.minHeight = '-webkit-fill-available';
            }
        };
        
        // Set initially
        setViewportHeight();
        
        // Update on orientation change and resize
        window.addEventListener('resize', setViewportHeight, { passive: true });
        window.addEventListener('orientationchange', () => {
            setTimeout(setViewportHeight, 100);
        }, { passive: true });
        
        console.log('📱 iOS viewport height fix applied');
    }
    
    static fixScrolling() {
        // Prevent iOS rubber-band scrolling
        document.body.style.overscrollBehavior = 'none';
        document.body.style.webkitOverscrollBehavior = 'none';
        
        // Enable momentum scrolling for specific elements
        const scrollableElements = document.querySelectorAll('.scrollable-content, .screen-content');
        scrollableElements.forEach(element => {
            element.style.webkitOverflowScrolling = 'touch';
            element.style.overscrollBehavior = 'contain';
        });
        
        console.log('📱 iOS scrolling fixes applied');
    }
    
    static fixTouchEvents() {
        // Prevent iOS double-tap zoom
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
        
        // Fix iOS touch event delays
        document.addEventListener('touchstart', (event) => {
            // Mark touch start for interaction tracking
            window.iosLastTouch = Date.now();
        }, { passive: true });
        
        console.log('📱 iOS touch event fixes applied');
    }
    
    static fixAudioContext() {
        // iOS requires user interaction to start audio
        let audioUnlocked = false;
        
        const unlockAudio = async () => {
            if (audioUnlocked) return;
            
            try {
                // Create a test audio context
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                // Create a silent buffer
                const buffer = audioContext.createBuffer(1, 1, 22050);
                const source = audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(audioContext.destination);
                source.start(0);
                
                // Resume context if suspended
                if (audioContext.state === 'suspended') {
                    await audioContext.resume();
                }
                
                audioUnlocked = true;
                console.log('📱 iOS audio context unlocked successfully');
                
                // Try to unlock main audio engine if available
                if (window.AudioEngine && window.AudioEngine.unlockAudioContext) {
                    await window.AudioEngine.unlockAudioContext();
                    console.log('📱 Main audio engine unlocked');
                }
                
                // Close test context
                audioContext.close();
                
            } catch (error) {
                console.warn('📱 iOS audio unlock failed:', error);
                
                // Fallback - try to unlock main audio engine directly
                if (window.AudioEngine && window.AudioEngine.unlockAudioContext) {
                    try {
                        await window.AudioEngine.unlockAudioContext();
                        audioUnlocked = true;
                        console.log('📱 Main audio engine unlocked (fallback)');
                    } catch (fallbackError) {
                        console.warn('📱 Audio unlock fallback failed:', fallbackError);
                    }
                }
            }
        };
        
        // Listen for first user interaction with multiple event types
        const events = ['touchstart', 'touchend', 'click', 'keydown'];
        events.forEach(event => {
            document.addEventListener(event, unlockAudio, { once: true, passive: true });
        });
        
        // Also try to unlock when wake screen is activated
        const wakeScreen = document.getElementById('wake-screen');
        if (wakeScreen) {
            wakeScreen.addEventListener('click', unlockAudio, { once: true, passive: true });
            wakeScreen.addEventListener('touchstart', unlockAudio, { once: true, passive: true });
        }
        
        console.log('📱 iOS audio context fix applied with enhanced unlocking');
    }
    
    static preventZoom() {
        // Prevent pinch zoom on iOS
        document.addEventListener('gesturestart', (event) => {
            event.preventDefault();
        }, { passive: false });
        
        document.addEventListener('gesturechange', (event) => {
            event.preventDefault();
        }, { passive: false });
        
        document.addEventListener('gestureend', (event) => {
            event.preventDefault();
        }, { passive: false });
        
        // Prevent double-tap zoom on specific elements
        const preventZoomElements = document.querySelectorAll('button, .button, .mission-button, .action-button');
        preventZoomElements.forEach(element => {
            element.style.touchAction = 'manipulation';
        });
        
        console.log('📱 iOS zoom prevention applied');
    }
    
    static fixInputFocus() {
        // Fix iOS input focus and keyboard issues
        const inputs = document.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Prevent zoom on focus
            if (parseFloat(getComputedStyle(input).fontSize) < 16) {
                input.style.fontSize = '16px';
            }
            
            // Fix iOS keyboard hiding input
            input.addEventListener('focus', () => {
                setTimeout(() => {
                    if (document.activeElement === input) {
                        input.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                            inline: 'nearest'
                        });
                    }
                }, 300);
            }, { passive: true });
            
            // Clear iOS input styling
            input.style.webkitAppearance = 'none';
            input.style.borderRadius = '0';
        });
        
        console.log('📱 iOS input focus fixes applied');
    }
    
    static addSafeAreaCSS() {
        // Dynamically add safe area CSS support
        const style = document.createElement('style');
        style.textContent = `
            @supports (padding: max(0px)) {
                .app-container {
                    padding-top: max(20px, env(safe-area-inset-top));
                    padding-bottom: max(20px, env(safe-area-inset-bottom));
                    padding-left: max(20px, env(safe-area-inset-left));
                    padding-right: max(20px, env(safe-area-inset-right));
                }
            }
        `;
        document.head.appendChild(style);
        
        console.log('📱 iOS safe area CSS applied');
    }
    
    static fixWebkitTransforms() {
        // Add webkit prefixes to critical animations
        const style = document.createElement('style');
        style.textContent = `
            @media screen and (-webkit-min-device-pixel-ratio: 0) {
                .reveal-element {
                    -webkit-transform: translateY(var(--space-md));
                    -webkit-transition: opacity var(--timing-slow) ease-out, -webkit-transform var(--timing-slow) ease-out;
                }
                
                .reveal-element.revealed {
                    -webkit-transform: translateY(0);
                }
                
                .screen {
                    -webkit-transform: scale(1);
                    -webkit-transition: opacity var(--timing-slow) ease-out, -webkit-transform var(--timing-slow) ease-out;
                }
            }
        `;
        document.head.appendChild(style);
        
        console.log('📱 iOS webkit transform fixes applied');
    }
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        IOSPolyfills.init();
    });
} else {
    IOSPolyfills.init();
}

export default IOSPolyfills;