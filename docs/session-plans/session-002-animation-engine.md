# V2 Architecture Session #002: Animation Engine & State Connections

**Date:** 2025-07-05  
**Duration:** 2-3 hours  
**Phase:** Phase 2 - Cinematic Engine (Part 1)  
**Focus:** Animation system, state transitions, and auth screen migration

## Session Objectives

1. **Animation Infrastructure (45 mins)**
   - Implement smooth scroll system (native CSS or lightweight library)
   - Create reveal animation patterns
   - Set up transition timing system
   - Test performance on mobile

2. **State Machine Integration (30 mins)**
   - Connect state transitions to screen changes
   - Implement screen visibility management
   - Add transition callbacks for animations
   - Create debug state visualization

3. **Auth Screen Migration (45 mins)**
   - Port auth screen to V2 structure
   - Implement progressive reveal animation
   - Ensure form functionality works
   - Add input validation feedback

4. **Smooth Transitions (30 mins)**
   - Create intro → auth transition
   - Implement connected scroll animation
   - Add fade/scale effects
   - Test on mobile devices

5. **Testing & Documentation (30 mins)**
   - Test all transitions on mobile
   - Verify no layout shifts
   - Document animation patterns
   - Update progress tracking

## Detailed Implementation Plan

### 1. Animation System Architecture

```javascript
// cinematic.js - Enhanced animation engine
class CinematicEngine {
  constructor() {
    this.transitions = new Map();
    this.currentAnimation = null;
  }
  
  // Register screen transitions
  registerTransition(from, to, animation) {
    this.transitions.set(`${from}->${to}`, animation);
  }
  
  // Native smooth scroll with fallback
  smoothScrollTo(element, options = {}) {
    const defaultOptions = {
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    };
    
    // Try native smooth scroll first
    if ('scrollBehavior' in document.documentElement.style) {
      element.scrollIntoView({ ...defaultOptions, ...options });
    } else {
      // Fallback to manual animation
      this.manualSmoothScroll(element, options);
    }
  }
  
  // Progressive reveal pattern
  revealSequence(elements, options = {}) {
    const defaults = {
      delay: 200,
      duration: 800,
      easing: 'ease-out'
    };
    const config = { ...defaults, ...options };
    
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.style.transition = `all ${config.duration}ms ${config.easing}`;
        el.classList.add('revealed');
      }, index * config.delay);
    });
  }
}
```

### 2. State Machine Enhancement

```javascript
// state.js - Enhanced with animation hooks
class AppState {
  constructor() {
    this.screens = ['intro', 'auth', 'sound-test', 'mission', 'briefing', 'credits'];
    this.current = 0;
    this.listeners = new Map();
  }
  
  transition(to) {
    const from = this.screens[this.current];
    const toIndex = this.screens.indexOf(to);
    
    if (toIndex === -1) return;
    
    // Emit transition event
    this.emit('transition', { from, to });
    
    // Update current state
    this.current = toIndex;
    
    // Handle screen visibility
    this.updateScreenVisibility(from, to);
  }
  
  updateScreenVisibility(from, to) {
    // Hide old screen
    const fromScreen = document.getElementById(`${from}-screen`);
    const toScreen = document.getElementById(`${to}-screen`);
    
    if (fromScreen) {
      fromScreen.classList.add('transitioning-out');
    }
    
    if (toScreen) {
      toScreen.classList.remove('hidden');
      toScreen.classList.add('transitioning-in');
      
      // Trigger animations after DOM update
      requestAnimationFrame(() => {
        cinematic.transition(from, to);
      });
    }
  }
}
```

### 3. Auth Screen Structure

```html
<!-- Auth screen with V2 structure -->
<div id="auth-screen" class="screen hidden">
  <header class="screen-header">
    <h1 class="text-2xl reveal-element">OPERATIVE AUTHENTICATION</h1>
    <div class="status-line text-sm reveal-element">SECURE CHANNEL ESTABLISHED</div>
  </header>
  
  <main class="screen-content">
    <div class="terminal-container reveal-element">
      <form id="auth-form" class="auth-form">
        <div class="form-group reveal-element">
          <label for="agent-name" class="text-sm">AGENT DESIGNATION</label>
          <input 
            type="text" 
            id="agent-name" 
            class="terminal-input text-base"
            required
            autocomplete="off"
          />
        </div>
        
        <div class="form-group reveal-element">
          <label for="access-code" class="text-sm">ACCESS CODE</label>
          <input 
            type="password" 
            id="access-code" 
            class="terminal-input text-base"
            required
          />
        </div>
        
        <button type="submit" class="action-button text-lg reveal-element">
          AUTHENTICATE
        </button>
      </form>
    </div>
  </main>
  
  <footer class="screen-footer reveal-element">
    <p class="text-xs">UNAUTHORIZED ACCESS PROHIBITED</p>
  </footer>
</div>
```

### 4. CSS Animation Patterns

```css
/* Reveal animation system */
.reveal-element {
  opacity: 0;
  transform: translateY(20px);
}

.reveal-element.revealed {
  opacity: 1;
  transform: translateY(0);
}

/* Screen transition states */
.screen {
  opacity: 1;
  transform: scale(1);
}

.screen.hidden {
  display: none;
}

.screen.transitioning-out {
  animation: screenOut 800ms ease-in forwards;
}

.screen.transitioning-in {
  animation: screenIn 800ms ease-out forwards;
}

@keyframes screenOut {
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

@keyframes screenIn {
  from {
    opacity: 0;
    transform: scale(1.05);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Cinematic scroll snap (optional) */
.screen {
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
```

## Testing Checklist

- [ ] Intro → Auth transition smooth on mobile
- [ ] Auth form elements reveal in sequence
- [ ] No layout shifts during animations
- [ ] Smooth scroll works on iOS Safari
- [ ] Animations perform at 60fps
- [ ] State changes properly tracked
- [ ] Form validation provides feedback
- [ ] Keyboard navigation works

## Success Criteria

1. **Smooth Transitions**
   - No jerky movements
   - Connected feel between screens
   - Professional polish

2. **Performance**
   - 60fps animations on mobile
   - No lag or stutter
   - Fast state changes

3. **Auth Screen**
   - Clean migration to V2
   - Form fully functional
   - Progressive reveal working

## Next Session Preview

**Session #003: Audio Integration & Mission Screen**
- Migrate audio engine from V1
- Port mission selection screen
- Add sound effects to transitions
- Implement haptic feedback

## Notes

- Prioritizing native CSS solutions over heavy libraries
- Mobile performance is critical
- Each screen transition should feel cinematic
- Building reusable animation patterns

---

**Ready for implementation after user approval**