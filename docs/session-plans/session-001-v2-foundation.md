# V2 Architecture Session #001: Foundation Setup

**Date:** 2025-07-05  
**Duration:** 2-3 hours  
**Phase:** Phase 1 - Foundation (Part 1)  
**Focus:** Project setup, core CSS architecture, and base HTML structure

## Session Objectives

1. **Project Setup (30 mins)**
   - Create v2 directory structure
   - Set up development environment
   - Prepare for modern build tools integration

2. **Core CSS Architecture (60 mins)**
   - Implement fluid typography system using clamp()
   - Create CSS custom properties foundation
   - Establish grid-based layout system
   - Set up container architecture

3. **Base HTML Migration (60 mins)**
   - Convert intro screen to new structure
   - Implement semantic HTML5 patterns
   - Add container structure with safe areas
   - Test text wrapping without hyphenation

4. **Initial Testing (30 mins)**
   - Verify typography scales properly
   - Test on mobile viewport (primary target)
   - Ensure no text overflow or hyphenation
   - Document any issues for next session

## Detailed Implementation Plan

### 1. Project Setup
```
/mnt/c/Users/abaec/Development/brewstersmtgo/
├── v2/
│   ├── index.html          (new entry point)
│   ├── css/
│   │   └── main.css        (single CSS file)
│   ├── js/
│   │   ├── app.js          (simplified controller)
│   │   ├── state.js        (state machine)
│   │   └── cinematic.js    (animation engine)
│   └── assets/             (copy from v1)
```

### 2. CSS Foundation Structure
```css
/* main.css structure:
   1. Reset & Base
   2. Custom Properties
   3. Typography System
   4. Layout System
   5. Components
   6. Animations
   7. Utilities
*/
```

### 3. HTML Pattern Example
```html
<div id="intro-screen" class="screen">
  <header class="screen-header">
    <h1 class="text-3xl">CLASSIFIED TERMINAL</h1>
  </header>
  <main class="screen-content">
    <div class="terminal-container">
      <p class="text-base text-content">
        System initialization in progress...
      </p>
    </div>
  </main>
  <footer class="screen-footer">
    <!-- CTA or navigation -->
  </footer>
</div>
```

## Success Criteria

1. **Typography Working**
   - Text scales smoothly between devices
   - No ugly hyphenation anywhere
   - All text fits within viewport

2. **Layout Stable**
   - Grid system prevents overflow
   - Safe areas respected on iPhone
   - Content properly contained

3. **Foundation Ready**
   - Clean CSS architecture established
   - Patterns proven on intro screen
   - Ready for Phase 2 animations

## Next Session Preview

**Session #002: Complete Foundation & Start Animations**
- Migrate remaining HTML screens
- Begin GSAP integration
- Implement first reveal animations
- Test scroll behavior

## Notes & Decisions

- Starting with intro screen as proof of concept
- Using CSS clamp() for fluid typography (no media queries needed)
- Grid-based layout for better control
- Single CSS file to eliminate cascade conflicts
- Mobile-first approach throughout

## TODOs for This Session

1. Create v2 directory structure
2. Implement CSS custom properties system
3. Build fluid typography scale
4. Create grid-based screen layout
5. Migrate intro screen to new structure
6. Test on mobile viewport
7. Document any issues found

---

**Ready to begin implementation after user approval**