/**
 * V2 Architecture - Viewport Detection and Responsive Utilities
 * Provides comprehensive viewport management for responsive design
 */

export class ViewportManager {
    constructor() {
        this.breakpoints = {
            mobile: 768,
            tablet: 1024,
            laptop: 1366,
            desktop: 1920
        };
        
        this.currentViewport = this.detectViewport();
        this.listeners = new Map();
        
        // Set up resize listener
        this.setupResizeListener();
        
        // Initialize CSS custom properties
        this.updateViewportProperties();
    }
    
    /**
     * Detect current viewport category
     */
    detectViewport() {
        const width = window.innerWidth;
        
        if (width <= this.breakpoints.mobile) {
            return 'mobile';
        } else if (width <= this.breakpoints.tablet) {
            return 'tablet';
        } else if (width <= this.breakpoints.laptop) {
            return 'laptop';
        } else {
            return 'desktop';
        }
    }
    
    /**
     * Get current viewport dimensions
     */
    getDimensions() {
        return {
            width: window.innerWidth,
            height: window.innerHeight,
            aspectRatio: window.innerWidth / window.innerHeight,
            orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
            pixelRatio: window.devicePixelRatio || 1
        };
    }
    
    /**
     * Update CSS custom properties for responsive design
     */
    updateViewportProperties() {
        const root = document.documentElement;
        const dimensions = this.getDimensions();
        
        // Set viewport dimensions
        root.style.setProperty('--viewport-width', `${dimensions.width}px`);
        root.style.setProperty('--viewport-height', `${dimensions.height}px`);
        root.style.setProperty('--viewport-aspect', dimensions.aspectRatio.toFixed(2));
        
        // Set scaling factors based on viewport
        const scalingFactors = this.getScalingFactors();
        root.style.setProperty('--scale-text', scalingFactors.text);
        root.style.setProperty('--scale-spacing', scalingFactors.spacing);
        root.style.setProperty('--scale-container', scalingFactors.container);
        
        // Set viewport class on body
        document.body.className = document.body.className
            .replace(/viewport-\w+/g, '')
            .trim() + ` viewport-${this.currentViewport}`;
    }
    
    /**
     * Get scaling factors for current viewport
     */
    getScalingFactors() {
        const baseFactors = {
            mobile: { text: 1, spacing: 1, container: 1 },
            tablet: { text: 1.1, spacing: 1.2, container: 0.9 },
            laptop: { text: 0.85, spacing: 0.9, container: 0.8 },
            desktop: { text: 1, spacing: 1, container: 1 }
        };
        
        return baseFactors[this.currentViewport] || baseFactors.desktop;
    }
    
    /**
     * Set up resize listener with debouncing
     */
    setupResizeListener() {
        let resizeTimeout;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newViewport = this.detectViewport();
                
                if (newViewport !== this.currentViewport) {
                    const oldViewport = this.currentViewport;
                    this.currentViewport = newViewport;
                    
                    // Update properties
                    this.updateViewportProperties();
                    
                    // Notify listeners
                    this.notifyListeners('change', {
                        from: oldViewport,
                        to: newViewport,
                        dimensions: this.getDimensions()
                    });
                } else {
                    // Just update dimensions
                    this.updateViewportProperties();
                    this.notifyListeners('resize', this.getDimensions());
                }
            }, 250);
        });
    }
    
    /**
     * Add viewport change listener
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    /**
     * Remove viewport change listener
     */
    off(event, callback) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    /**
     * Notify all listeners
     */
    notifyListeners(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }
    
    /**
     * Check if current viewport matches a query
     */
    matches(query) {
        if (query === 'mobile') return this.currentViewport === 'mobile';
        if (query === 'tablet') return this.currentViewport === 'tablet';
        if (query === 'laptop') return this.currentViewport === 'laptop';
        if (query === 'desktop') return this.currentViewport === 'desktop';
        
        // Handle range queries
        if (query.includes('<=')) {
            const viewport = query.replace('<=', '').trim();
            const currentIndex = Object.keys(this.breakpoints).indexOf(this.currentViewport);
            const targetIndex = Object.keys(this.breakpoints).indexOf(viewport);
            return currentIndex <= targetIndex;
        }
        
        if (query.includes('>=')) {
            const viewport = query.replace('>=', '').trim();
            const currentIndex = Object.keys(this.breakpoints).indexOf(this.currentViewport);
            const targetIndex = Object.keys(this.breakpoints).indexOf(viewport);
            return currentIndex >= targetIndex;
        }
        
        return false;
    }
}

// Export singleton instance
export const viewport = new ViewportManager();