# CSS Architecture Refactoring Plan

## Overview
The current CSS architecture has 53 !important declarations, 2,090 lines in a single file, and severe cascade conflicts. This plan outlines a systematic approach to refactor the CSS for better maintainability and performance.

## Current Issues
1. **Specificity Wars**: 53 !important declarations indicate cascade conflicts
2. **Monolithic File**: 2,090 lines in main.css makes maintenance difficult
3. **Magic Values**: Hardcoded values mixed with CSS variables
4. **Complex Selectors**: Overly specific selectors causing specificity battles
5. **No Component Isolation**: Global styles affecting unintended elements

## Refactoring Strategy

### Phase 1: CSS Variable Extraction (Week 1)

#### Step 1.1: Create CSS Variable System
```css
/* css/variables.css */
:root {
  /* Timing Variables */
  --timing-immediate: 0ms;
  --timing-fast: 200ms;
  --timing-normal: 500ms;
  --timing-slow: 800ms;
  --timing-cinematic: 1200ms;
  --timing-dramatic: 2000ms;
  
  /* Colors */
  --color-primary: #00ff00;
  --color-secondary: #00ff88;
  --color-danger: #ff0044;
  --color-warning: #ffaa00;
  --color-black: #000000;
  --color-white: #ffffff;
  
  /* Typography Scale */
  --text-xs: 16px;
  --text-sm: 18px;
  --text-base: 24px;
  --text-lg: 32px;
  --text-xl: 40px;
  --text-2xl: 48px;
  --text-3xl: 56px;
  
  /* Spacing Scale */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  
  /* Effects */
  --glow-small: 0 0 5px;
  --glow-medium: 0 0 10px;
  --glow-large: 0 0 20px;
  --shadow-terminal: 0 0 10px rgba(0, 255, 0, 0.5);
}
```

#### Step 1.2: Replace Hardcoded Values
- Search and replace all hardcoded colors with variables
- Replace timing values with timing variables
- Replace font sizes with typography scale
- Document any values that don't fit the scale

### Phase 2: Reduce !important Usage (Week 2)

#### Step 2.1: Audit !important Declarations
Create spreadsheet tracking:
- Selector using !important
- Property being forced
- Reason for !important
- Conflicting rule location
- Proposed fix

#### Step 2.2: Implement Specificity Solutions
```css
/* Instead of: */
.terminal-button {
  color: #00ff00 !important;
}

/* Use higher specificity: */
#app .screen .terminal-button {
  color: var(--color-primary);
}

/* Or use CSS Layers: */
@layer base {
  .terminal-button {
    color: var(--color-primary);
  }
}

@layer components {
  /* Component overrides */
}

@layer utilities {
  /* Utility overrides */
}
```

#### Step 2.3: BEM Naming Convention
Migrate to BEM for better specificity control:
```css
/* Current */
.screen .content .button.active

/* BEM Refactor */
.screen__button--active
```

### Phase 3: File Splitting Strategy (Week 3)

#### Step 3.1: Create Modular Structure
```
css/
├── base/
│   ├── reset.css      # Browser resets
│   ├── variables.css  # CSS custom properties
│   └── typography.css # Base font styles
├── components/
│   ├── buttons.css    # Button components
│   ├── forms.css      # Form elements
│   ├── terminal.css   # Terminal UI
│   └── animations.css # Reusable animations
├── screens/
│   ├── auth.css       # Auth screen specific
│   ├── mission.css    # Mission screen specific
│   ├── briefing.css   # Briefing screen specific
│   └── [etc...]
├── utilities/
│   ├── spacing.css    # Margin/padding utilities
│   ├── text.css       # Text utilities
│   └── effects.css    # Visual effects
└── main.css           # Import orchestrator
```

#### Step 3.2: Import Strategy
```css
/* main.css */
/* Base layer - loaded first */
@import 'base/reset.css';
@import 'base/variables.css';
@import 'base/typography.css';

/* Component layer */
@import 'components/buttons.css';
@import 'components/forms.css';
@import 'components/terminal.css';
@import 'components/animations.css';

/* Screen-specific styles */
@import 'screens/auth.css';
@import 'screens/mission.css';
/* ... other screens ... */

/* Utility layer - highest specificity */
@import 'utilities/spacing.css';
@import 'utilities/text.css';
@import 'utilities/effects.css';
```

### Phase 4: Component Isolation (Week 4)

#### Step 4.1: Implement CSS Modules Pattern
```css
/* components/terminal-button.css */
.terminal-button {
  /* Base styles */
  display: inline-block;
  padding: var(--space-md) var(--space-lg);
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  background: transparent;
  font-family: 'Terminal', monospace;
  font-size: var(--text-base);
  text-transform: uppercase;
  cursor: pointer;
  transition: all var(--timing-fast) ease-out;
}

.terminal-button:hover {
  background: var(--color-primary);
  color: var(--color-black);
  box-shadow: var(--glow-medium) var(--color-primary);
}

.terminal-button--large {
  padding: var(--space-lg) var(--space-xl);
  font-size: var(--text-lg);
}

.terminal-button--danger {
  color: var(--color-danger);
  border-color: var(--color-danger);
}
```

#### Step 4.2: Scope Styles to Components
```css
/* Use data attributes for component scoping */
[data-component="mission-screen"] {
  /* Component-specific styles */
}

/* Or use CSS-in-JS approach with build step */
.mission-screen_container_x7k2 {
  /* Auto-generated unique class */
}
```

### Phase 5: Performance Optimization (Week 5)

#### Step 5.1: Critical CSS Extraction
```html
<!-- Inline critical CSS -->
<style>
  /* Only above-the-fold styles */
  :root { /* variables */ }
  body { /* base styles */ }
  #loading-screen { /* initial screen */ }
</style>

<!-- Load rest async -->
<link rel="preload" href="css/main.css" as="style">
<link rel="stylesheet" href="css/main.css" media="print" onload="this.media='all'">
```

#### Step 5.2: Remove Unused CSS
- Use PurgeCSS to identify unused selectors
- Remove legacy V1 styles
- Eliminate duplicate declarations

### Implementation Checklist

#### Week 1: Foundation
- [ ] Create variables.css with comprehensive token system
- [ ] Set up CSS file structure
- [ ] Begin replacing hardcoded values
- [ ] Document CSS architecture decisions

#### Week 2: Specificity Refactor
- [ ] Complete !important audit spreadsheet
- [ ] Begin removing !important declarations
- [ ] Implement BEM naming for 25% of components
- [ ] Test cascade changes thoroughly

#### Week 3: Modularization
- [ ] Split main.css into modular files
- [ ] Set up import orchestration
- [ ] Migrate screen-specific styles
- [ ] Ensure no regression in functionality

#### Week 4: Component Architecture
- [ ] Complete BEM migration
- [ ] Implement component isolation patterns
- [ ] Create component documentation
- [ ] Add CSS linting rules

#### Week 5: Optimization
- [ ] Extract and inline critical CSS
- [ ] Remove unused selectors
- [ ] Optimize file sizes
- [ ] Performance testing

### Success Metrics
- Reduce !important declarations from 53 to <10
- Decrease main CSS file from 2,090 lines to <500 lines
- Improve Lighthouse CSS performance score by 20%
- Achieve 100% CSS variable usage for colors/spacing
- Reduce CSS file size by 30%

### Testing Strategy
1. Visual regression testing with Percy or BackstopJS
2. Cross-browser testing (Chrome, Firefox, Safari, Edge)
3. Mobile device testing (iOS Safari, Chrome Android)
4. Performance benchmarking before/after
5. Accessibility testing for contrast/readability

### Rollback Plan
- Keep original main.css as main-legacy.css
- Implement feature flags for gradual rollout
- Maintain side-by-side comparison environment
- Document all breaking changes

### Long-term Maintenance
1. **CSS Style Guide**: Document patterns and conventions
2. **Component Library**: Build Storybook for components
3. **Automated Testing**: CSS regression tests in CI/CD
4. **Code Reviews**: CSS-specific review checklist
5. **Performance Budget**: Max CSS size limits