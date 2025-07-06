# Security Vulnerabilities Refactoring Plan

## Overview
The application has several security vulnerabilities including no input sanitization, XSS risks, exposed global state, and unsafe data handling. This plan addresses these issues systematically.

## Current Security Issues
1. **Input Validation**: No sanitization of agent names or user inputs
2. **XSS Vulnerabilities**: Direct HTML manipulation without escaping
3. **Global State Exposure**: window.app allows external manipulation
4. **Local Storage**: Unencrypted sensitive data storage
5. **No Content Security Policy**: Missing security headers

## Refactoring Strategy

### Phase 1: Input Validation & Sanitization (Week 1)

#### Step 1.1: Create Input Sanitization Service
```javascript
// js/security/sanitizer.js
export class InputSanitizer {
  constructor() {
    // Define allowed characters for different input types
    this.patterns = {
      agentName: /^[a-zA-Z0-9\s\-_]{1,30}$/,
      alphanumeric: /^[a-zA-Z0-9]+$/,
      numeric: /^[0-9]+$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    };
    
    // HTML entities map
    this.htmlEntities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;'
    };
  }
  
  // Escape HTML special characters
  escapeHtml(str) {
    if (typeof str !== 'string') return '';
    
    return str.replace(/[&<>"'\/]/g, (match) => {
      return this.htmlEntities[match];
    });
  }
  
  // Remove all HTML tags
  stripTags(str) {
    if (typeof str !== 'string') return '';
    
    return str.replace(/<[^>]*>/g, '');
  }
  
  // Validate and sanitize agent name
  sanitizeAgentName(input) {
    if (typeof input !== 'string') {
      throw new ValidationError('Agent name must be a string', 'agentName', input);
    }
    
    // Trim whitespace
    const trimmed = input.trim();
    
    // Check length
    if (trimmed.length === 0) {
      throw new ValidationError('Agent name cannot be empty', 'agentName', trimmed);
    }
    
    if (trimmed.length > 30) {
      throw new ValidationError('Agent name too long (max 30 characters)', 'agentName', trimmed);
    }
    
    // Check pattern
    if (!this.patterns.agentName.test(trimmed)) {
      throw new ValidationError(
        'Agent name contains invalid characters. Only letters, numbers, spaces, hyphens, and underscores allowed.',
        'agentName',
        trimmed
      );
    }
    
    // Additional security checks
    const sanitized = this.escapeHtml(trimmed);
    
    // Check for common XSS patterns
    if (this.containsXSSPatterns(sanitized)) {
      throw new ValidationError('Invalid input detected', 'agentName', sanitized);
    }
    
    return sanitized;
  }
  
  // Check for common XSS patterns
  containsXSSPatterns(str) {
    const xssPatterns = [
      /javascript:/gi,
      /on\w+\s*=/gi,  // onclick=, onload=, etc.
      /<script/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /eval\(/gi,
      /expression\(/gi
    ];
    
    return xssPatterns.some(pattern => pattern.test(str));
  }
  
  // Sanitize for display in DOM
  sanitizeForDisplay(str) {
    if (typeof str !== 'string') return '';
    
    // First escape HTML
    const escaped = this.escapeHtml(str);
    
    // Then check for XSS patterns
    if (this.containsXSSPatterns(escaped)) {
      console.warn('Potential XSS attempt blocked');
      return '[Invalid Input]';
    }
    
    return escaped;
  }
  
  // Validate against pattern
  validate(input, type) {
    const pattern = this.patterns[type];
    if (!pattern) {
      throw new Error(`Unknown validation type: ${type}`);
    }
    
    return pattern.test(input);
  }
}

// js/security/validation-service.js
export class ValidationService {
  constructor(sanitizer) {
    this.sanitizer = sanitizer;
  }
  
  // Comprehensive input validation
  validateInput(value, rules) {
    const errors = [];
    
    // Required check
    if (rules.required && !value) {
      errors.push('This field is required');
    }
    
    // Type check
    if (rules.type && typeof value !== rules.type) {
      errors.push(`Must be a ${rules.type}`);
    }
    
    // Length checks
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`Minimum length is ${rules.minLength}`);
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`Maximum length is ${rules.maxLength}`);
    }
    
    // Pattern check
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(rules.patternMessage || 'Invalid format');
    }
    
    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) errors.push(customError);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  // Create validated input component
  createValidatedInput(options) {
    const {
      type = 'text',
      rules = {},
      onValid = () => {},
      onInvalid = () => {}
    } = options;
    
    const input = document.createElement('input');
    input.type = type;
    
    const validate = () => {
      const result = this.validateInput(input.value, rules);
      
      if (result.valid) {
        input.classList.remove('invalid');
        input.classList.add('valid');
        onValid(input.value);
      } else {
        input.classList.remove('valid');
        input.classList.add('invalid');
        onInvalid(result.errors);
      }
      
      return result;
    };
    
    input.addEventListener('input', validate);
    input.addEventListener('blur', validate);
    
    return { input, validate };
  }
}
```

#### Step 1.2: Update Auth Screen with Validation
```javascript
// js/screens/auth-screen-secure.js
export class AuthScreen extends BaseScreen {
  constructor(screenId, context) {
    super(screenId, context);
    this.sanitizer = context.getService('sanitizer');
    this.validation = context.getService('validation');
  }
  
  setupEventListeners() {
    const form = this.querySelector('#auth-form');
    const input = this.querySelector('#agent-name-input');
    const errorDisplay = this.querySelector('#error-display');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      try {
        // Sanitize and validate input
        const rawInput = input.value;
        const sanitized = this.sanitizer.sanitizeAgentName(rawInput);
        
        // Store sanitized value
        this.storage.setSecure('agentName', sanitized);
        
        // Continue to next screen
        await this.context.emit('auth:complete', { agentName: sanitized });
        
      } catch (error) {
        if (error instanceof ValidationError) {
          this.showError(error.message);
        } else {
          this.showError('An error occurred. Please try again.');
          console.error('Auth error:', error);
        }
      }
    });
    
    // Real-time validation
    input.addEventListener('input', () => {
      try {
        this.sanitizer.sanitizeAgentName(input.value);
        this.clearError();
      } catch (error) {
        if (error instanceof ValidationError) {
          this.showError(error.message);
        }
      }
    });
  }
  
  showError(message) {
    const errorDisplay = this.querySelector('#error-display');
    errorDisplay.textContent = message;
    errorDisplay.classList.add('visible');
  }
  
  clearError() {
    const errorDisplay = this.querySelector('#error-display');
    errorDisplay.classList.remove('visible');
  }
}
```

### Phase 2: XSS Prevention (Week 1)

#### Step 2.1: Create Safe DOM Manipulation
```javascript
// js/security/safe-dom.js
export class SafeDOM {
  constructor(sanitizer) {
    this.sanitizer = sanitizer;
  }
  
  // Safe text content setting
  setText(element, text) {
    if (!element) return;
    // textContent is safe from XSS
    element.textContent = this.sanitizer.sanitizeForDisplay(text);
  }
  
  // Safe HTML setting with sanitization
  setHTML(element, html, options = {}) {
    if (!element) return;
    
    const { 
      allowedTags = ['b', 'i', 'em', 'strong', 'span'],
      allowedAttributes = []
    } = options;
    
    // Use DOMPurify or similar library in production
    const sanitized = this.sanitizeHTML(html, allowedTags, allowedAttributes);
    element.innerHTML = sanitized;
  }
  
  // Basic HTML sanitization (use DOMPurify in production)
  sanitizeHTML(html, allowedTags, allowedAttributes) {
    // Create a temporary element
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Remove all scripts
    const scripts = temp.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // Remove event handlers
    const allElements = temp.querySelectorAll('*');
    allElements.forEach(el => {
      // Remove on* attributes
      Array.from(el.attributes).forEach(attr => {
        if (attr.name.startsWith('on')) {
          el.removeAttribute(attr.name);
        }
      });
      
      // Remove href="javascript:"
      if (el.hasAttribute('href')) {
        const href = el.getAttribute('href');
        if (href && href.trim().toLowerCase().startsWith('javascript:')) {
          el.removeAttribute('href');
        }
      }
      
      // Check if tag is allowed
      if (!allowedTags.includes(el.tagName.toLowerCase())) {
        el.replaceWith(...el.childNodes);
      }
      
      // Remove non-allowed attributes
      Array.from(el.attributes).forEach(attr => {
        if (!allowedAttributes.includes(attr.name)) {
          el.removeAttribute(attr.name);
        }
      });
    });
    
    return temp.innerHTML;
  }
  
  // Create element with safe attributes
  createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    // Safely set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = this.sanitizer.escapeHtml(value);
      } else if (key === 'textContent') {
        element.textContent = value; // textContent is safe
      } else if (key.startsWith('data-')) {
        // Data attributes are generally safe
        element.setAttribute(key, this.sanitizer.escapeHtml(value));
      } else if (['id', 'class', 'type', 'name'].includes(key)) {
        // Whitelist safe attributes
        element.setAttribute(key, this.sanitizer.escapeHtml(value));
      }
      // Ignore event handlers and other potentially dangerous attributes
    });
    
    // Safely add children
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        element.appendChild(child);
      }
    });
    
    return element;
  }
  
  // Safe template rendering
  renderTemplate(template, data) {
    // Escape all data values
    const safeData = {};
    Object.entries(data).forEach(([key, value]) => {
      safeData[key] = this.sanitizer.escapeHtml(String(value));
    });
    
    // Simple template replacement (use a proper template engine in production)
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return safeData[key] || '';
    });
  }
}
```

#### Step 2.2: Content Security Policy
```javascript
// js/security/csp-manager.js
export class CSPManager {
  constructor() {
    this.policies = {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'"], // Remove unsafe-inline in production
      'style-src': ["'self'", "'unsafe-inline'"],  // Remove unsafe-inline in production
      'img-src': ["'self'", 'data:', 'https:'],
      'font-src': ["'self'"],
      'connect-src': ["'self'"],
      'media-src': ["'self'"],
      'object-src': ["'none'"],
      'frame-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': []
    };
  }
  
  // Generate CSP header string
  generateCSP() {
    return Object.entries(this.policies)
      .map(([directive, sources]) => {
        if (sources.length === 0) return directive;
        return `${directive} ${sources.join(' ')}`;
      })
      .join('; ');
  }
  
  // Apply CSP via meta tag (limited effectiveness)
  applyCSP() {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = this.generateCSP();
    document.head.appendChild(meta);
  }
  
  // Generate nonce for inline scripts
  generateNonce() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, array));
  }
}

// For production, set CSP headers server-side:
// Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{random}'; style-src 'self' 'nonce-{random}'; object-src 'none'; base-uri 'self';
```

### Phase 3: Secure State Management (Week 2)

#### Step 3.1: Encapsulate Global State
```javascript
// js/security/secure-state.js
export class SecureStateManager {
  constructor() {
    // Private state storage
    const privateState = new WeakMap();
    
    // State container
    class StateContainer {
      constructor(initialState) {
        privateState.set(this, {
          current: initialState,
          history: [],
          listeners: new Map()
        });
        
        // Freeze the container to prevent modification
        Object.freeze(this);
      }
      
      get current() {
        return privateState.get(this).current;
      }
      
      transition(newState, validator) {
        const state = privateState.get(this);
        
        // Validate transition
        if (validator && !validator(state.current, newState)) {
          throw new StateError('Invalid state transition', state.current, newState);
        }
        
        // Update state
        state.history.push(state.current);
        state.current = newState;
        
        // Notify listeners
        state.listeners.forEach(listener => {
          listener(newState, state.history[state.history.length - 1]);
        });
      }
      
      subscribe(listener) {
        const state = privateState.get(this);
        const id = Symbol('listener');
        state.listeners.set(id, listener);
        
        return () => state.listeners.delete(id);
      }
    }
    
    this.StateContainer = StateContainer;
  }
  
  create(initialState) {
    return new this.StateContainer(initialState);
  }
}

// Usage - No external access to internal state
const secureState = new SecureStateManager();
const appState = secureState.create('loading');

// Cannot modify from outside
// appState.current = 'hacked'; // Error: Cannot assign to read-only property
// No access to private state
```

#### Step 3.2: Secure Storage Service
```javascript
// js/security/secure-storage.js
export class SecureStorage {
  constructor(crypto) {
    this.crypto = crypto;
    this.prefix = 'brewsters-mtgo-';
  }
  
  // Encrypt data before storing
  async setSecure(key, value) {
    try {
      const serialized = JSON.stringify(value);
      const encrypted = await this.encrypt(serialized);
      localStorage.setItem(this.prefix + key, encrypted);
    } catch (error) {
      console.error('Storage encryption failed:', error);
      throw new Error('Failed to store data securely');
    }
  }
  
  // Decrypt data when retrieving
  async getSecure(key) {
    try {
      const encrypted = localStorage.getItem(this.prefix + key);
      if (!encrypted) return null;
      
      const decrypted = await this.decrypt(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Storage decryption failed:', error);
      // Remove corrupted data
      this.remove(key);
      return null;
    }
  }
  
  // Simple encryption using Web Crypto API
  async encrypt(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    // Generate key from a password (in production, use proper key management)
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode('your-secret-key'), // Use environment variable in production
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('unique-salt'), // Use random salt in production
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    
    // Generate IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    // Convert to base64 for storage
    return btoa(String.fromCharCode.apply(null, combined));
  }
  
  async decrypt(encryptedBase64) {
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    // Derive key (same as encryption)
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode('your-secret-key'),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('unique-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    // Convert back to text
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }
  
  remove(key) {
    localStorage.removeItem(this.prefix + key);
  }
  
  clear() {
    // Only clear our prefixed items
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .forEach(key => localStorage.removeItem(key));
  }
}
```

### Phase 4: Security Headers & Configuration (Week 2)

#### Step 4.1: Security Configuration
```javascript
// js/security/security-config.js
export const SecurityConfig = {
  // Content Security Policy
  csp: {
    enabled: true,
    reportOnly: false,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'"],
      'img-src': ["'self'", 'data:'],
      'font-src': ["'self'"],
      'connect-src': ["'self'"],
      'media-src': ["'self'"],
      'object-src': ["'none'"],
      'frame-src': ["'none'"],
      'worker-src': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'self'"],
      'manifest-src': ["'self'"]
    }
  },
  
  // Security headers (for server configuration)
  headers: {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  },
  
  // Input validation rules
  validation: {
    agentName: {
      minLength: 1,
      maxLength: 30,
      pattern: /^[a-zA-Z0-9\s\-_]+$/,
      sanitize: true
    },
    missionCode: {
      pattern: /^[A-Z0-9]{6}$/,
      transform: (value) => value.toUpperCase()
    }
  },
  
  // Storage encryption
  storage: {
    encrypt: true,
    keyDerivation: {
      algorithm: 'PBKDF2',
      iterations: 100000,
      hash: 'SHA-256'
    },
    encryption: {
      algorithm: 'AES-GCM',
      keyLength: 256
    }
  },
  
  // Session configuration
  session: {
    timeout: 30 * 60 * 1000, // 30 minutes
    renewOnActivity: true,
    secure: true,
    sameSite: 'strict'
  }
};
```

#### Step 4.2: Security Audit Service
```javascript
// js/security/security-audit.js
export class SecurityAudit {
  constructor() {
    this.violations = [];
    this.setupCSPReporting();
  }
  
  setupCSPReporting() {
    // Listen for CSP violations
    document.addEventListener('securitypolicyviolation', (e) => {
      this.logViolation({
        type: 'CSP',
        directive: e.violatedDirective,
        blocked: e.blockedURI,
        source: e.sourceFile,
        line: e.lineNumber,
        column: e.columnNumber
      });
    });
  }
  
  logViolation(violation) {
    this.violations.push({
      ...violation,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
    
    // In production, send to logging service
    if (!CONFIG.debug.enabled) {
      this.reportToService(violation);
    }
  }
  
  // Audit current page for security issues
  audit() {
    const report = {
      timestamp: new Date().toISOString(),
      issues: []
    };
    
    // Check for inline scripts
    const inlineScripts = document.querySelectorAll('script:not([src])');
    if (inlineScripts.length > 0) {
      report.issues.push({
        severity: 'high',
        type: 'inline-script',
        count: inlineScripts.length,
        message: 'Inline scripts detected. Use external scripts with CSP nonce.'
      });
    }
    
    // Check for inline styles
    const inlineStyles = document.querySelectorAll('[style]');
    if (inlineStyles.length > 0) {
      report.issues.push({
        severity: 'medium',
        type: 'inline-style',
        count: inlineStyles.length,
        message: 'Inline styles detected. Use CSS classes instead.'
      });
    }
    
    // Check for javascript: URLs
    const jsUrls = document.querySelectorAll('[href^="javascript:"]');
    if (jsUrls.length > 0) {
      report.issues.push({
        severity: 'critical',
        type: 'javascript-url',
        count: jsUrls.length,
        message: 'javascript: URLs detected. Potential XSS vector.'
      });
    }
    
    // Check for event handlers
    const eventHandlers = document.querySelectorAll('[onclick], [onload], [onerror], [onmouseover]');
    if (eventHandlers.length > 0) {
      report.issues.push({
        severity: 'high',
        type: 'inline-event-handler',
        count: eventHandlers.length,
        message: 'Inline event handlers detected. Use addEventListener instead.'
      });
    }
    
    // Check for external resources
    const externalScripts = document.querySelectorAll('script[src^="http://"]');
    if (externalScripts.length > 0) {
      report.issues.push({
        severity: 'high',
        type: 'insecure-script',
        count: externalScripts.length,
        message: 'Scripts loaded over HTTP. Use HTTPS only.'
      });
    }
    
    // Check localStorage for sensitive data
    const sensitivePatterns = ['password', 'token', 'key', 'secret'];
    Object.keys(localStorage).forEach(key => {
      sensitivePatterns.forEach(pattern => {
        if (key.toLowerCase().includes(pattern)) {
          report.issues.push({
            severity: 'high',
            type: 'sensitive-storage',
            key: key,
            message: `Potentially sensitive data in localStorage: ${key}`
          });
        }
      });
    });
    
    return report;
  }
  
  reportToService(data) {
    // Send to security monitoring service
    // Example: Sentry, LogRocket, custom endpoint
  }
}
```

### Implementation Checklist

#### Week 1: Input Validation & XSS Prevention
- [ ] Create InputSanitizer class
- [ ] Create ValidationService
- [ ] Implement SafeDOM utilities
- [ ] Update auth screen with validation
- [ ] Replace all innerHTML with safe methods
- [ ] Add CSP meta tag
- [ ] Audit and fix existing XSS vectors

#### Week 2: State & Storage Security
- [ ] Implement SecureStateManager
- [ ] Create SecureStorage with encryption
- [ ] Remove global state exposure
- [ ] Encrypt sensitive localStorage data
- [ ] Implement session timeout
- [ ] Add security audit service
- [ ] Create security configuration

#### Week 3: Testing & Hardening
- [ ] Security audit of entire codebase
- [ ] Penetration testing (XSS attempts)
- [ ] Input fuzzing tests
- [ ] CSP violation monitoring
- [ ] Performance impact assessment
- [ ] Documentation update
- [ ] Security training materials

### Success Metrics
- Zero XSS vulnerabilities in OWASP ZAP scan
- 100% input validation coverage
- All localStorage data encrypted
- No global state exposure
- CSP policy with no unsafe-inline
- Pass security audit with no critical issues

### Security Testing Checklist
```javascript
// Example security tests
describe('Security Tests', () => {
  describe('Input Sanitization', () => {
    test('blocks XSS in agent name', () => {
      const malicious = '<script>alert("xss")</script>';
      expect(() => sanitizer.sanitizeAgentName(malicious))
        .toThrow(ValidationError);
    });
    
    test('escapes HTML entities', () => {
      const input = '<b>Bold & "quoted"</b>';
      const output = sanitizer.escapeHtml(input);
      expect(output).toBe('&lt;b&gt;Bold &amp; &quot;quoted&quot;&lt;/b&gt;');
    });
  });
  
  describe('Secure Storage', () => {
    test('encrypts data before storage', async () => {
      await storage.setSecure('test', 'sensitive data');
      const raw = localStorage.getItem('brewsters-mtgo-test');
      expect(raw).not.toBe('sensitive data');
      expect(raw).toMatch(/^[A-Za-z0-9+/=]+$/); // Base64
    });
  });
});
```

### Deployment Security Checklist
- [ ] Enable HTTPS everywhere
- [ ] Set security headers server-side
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Enable CORS properly
- [ ] Audit third-party dependencies
- [ ] Implement security monitoring
- [ ] Create incident response plan