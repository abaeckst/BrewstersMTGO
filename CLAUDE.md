# CLAUDE.md - Project Guidelines

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Brewster's MTGO Mission Terminal is a cinematic spy-thriller web experience presenting users with a binary mission choice after QR code scanning. The project emphasizes dramatic sequences, terminal effects, and audio synchronization.

**Current Status**: ✅ Production-Ready V2 Architecture with Wake System - System Wake-Up screen implemented as new initial state, complete audio integration, all persistent UI issues resolved.

**Project Philosophy**: Cinematic experience where authenticity and user feel matter more than development speed. Every element reinforces the 1980s retro-future spy computer aesthetic.

## Core Design Principles

1. **Narrative Immersion** - Users are operatives discovering a classified terminal
2. **Universal Cinematic Pacing** - 1200ms JavaScript delays with 1.0s CSS transitions across ALL screens
3. **Fully Automated Sequences** - No user input required for revelation stages
4. **Authenticity Over Usability** - Retro/spy aesthetic takes priority over speed
5. **Universal Feedback** - Every interaction requires audio/visual confirmation
6. **Mobile-First Cinematic** - Mobile is primary platform, desktop must translate perfectly
7. **Environmental Storytelling** - CRT effects and system messages reinforce atmosphere
8. **User as Protagonist** - Address as "operative", system recognizes them personally

## Session Workflow

### Session Startup Protocol
1. Use TodoRead to check active tasks
2. Review current development phase
3. Create session plan for complex work
4. Update TODO list with session tasks
5. Wait for user "go ahead" before implementation

### Implementation Standards
- Execute TODO items one at a time
- Mark tasks in_progress before starting
- Complete tasks immediately upon finishing
- Test on mobile viewport frequently

### Session End Protocol
- Update documentation with accomplishments
- Update TODO list with remaining tasks
- Provide next session starter if needed

## Development Commands

### Running the Application
```bash
# Open index.html directly or use local server
npx http-server -p 8000
```

### Testing
```bash
npm run test:all      # Full test suite
npm test              # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:visual   # Visual regression tests
```

## Architecture Overview

### State Flow
1. **wake** → boot-sequence → auth
2. **auth** → mission (soundTest flow removed for streamlined experience)
3. **mission** → briefing (accept) or mission-declined (deny)
4. **briefing** → countdown → credits

### V2 Module Structure
- **app.js**: Main controller and state management
- **state.js**: State machine with audio integration
- **cinematic.js**: Animation engine and screen transitions
- **audio-engine.js**: 18-sound system with fallbacks
- **wake-screen.js**: Dormant terminal interface and wake interactions
- **mission-screen.js**: Mission selection with signal bars

### CSS Architecture
- **19 Modular Files**: Organized across base/, components/, screens/, utilities/
- **CSS Cascade Layers**: Predictable specificity without !important conflicts
- **Sequential Revelation System**: Stage-specific classes for cinematic timing
- **Wake Screen Styles**: Dormant terminal aesthetics with progressive revelation

## Implementation Patterns

### Sequential Revelation System
**Standard Architecture**: Stage-specific CSS classes with high specificity
```css
#screen-id .stage-X-hidden {
    opacity: 0 !important;
    transform: [initial-state] !important;
    transition: all 1.0s ease-out !important;
}
```
**Timing**: 1200ms JavaScript delays + 1.0s CSS transitions
**JavaScript Integration**: Ensure CSS transition completion before next stage

### Screen Introduction Standards
- **Wake Screen**: Pure darkness → 2-second delay → wake instruction reveal
- **Boot Sequence**: CRT Power-On → boot messages → system ready
- **General Screens**: Start with darkness, build with environmental effects
- Progressive text reveal with sound effects
- 5-8 seconds for opening sequences
- Fade in interactive elements last

### Critical Development Patterns

#### CSS Architecture Standards
- **Never** add `transition` to base element classes
- **Always** use screen-specific stage classes with `!important`
- **Always** use 1.0s transition duration for consistency
- **Only** add transitions to `:hover` pseudo-classes

#### JavaScript Timing Standards
- **Always** use 1200ms delays between revelation stages
- **Never** rush sequences - authenticity first
- **Always** add console logging for timing verification

#### Animation Debugging Standards
- Deep investigation required for CSS cascade conflicts
- Check main.css, mobile.css, AND animations.css
- Test with `prefers-reduced-motion` enabled
- Log device type, motion preferences, computed styles
- Use `!important` strategically for essential animations

## Problem-Solving Methodology

### For Persistent Issues
1. **Patient Investigation** - Create detailed investigation plan, no rushing to solutions
2. **Root Cause Analysis** - Use dev tools, test hypotheses systematically
3. **Comprehensive Solution** - Address causes not symptoms, preserve architecture
4. **Thorough Testing** - Verify across contexts, prevent regression

### Investigation Tools
```javascript
// Essential debugging patterns
console.log('📱 Device:', window.innerWidth <= 768);
console.log('🎛️ Reduced motion:', window.matchMedia('(prefers-reduced-motion: reduce)').matches);
console.log('📏 Computed style:', {
    animation: getComputedStyle(element).animation,
    transform: getComputedStyle(element).transform
});
```

### Quality Assurance
- Thoroughly investigate timing issues
- Test actual rendered behavior vs CSS intentions
- Verify specificity with browser dev tools
- Validate on mobile (primary platform)

## Communication Style

### Standard Development
- Ask clarifying questions before major work
- Present comprehensive plans before implementation
- Provide specific progress updates
- Request feedback at logical breakpoints

### Investigation & Problem-Solving
- Commit to patient analysis over quick fixes
- Document investigation process with evidence
- Present comprehensive solutions addressing root causes
- Demonstrate testing across multiple contexts

## Wake System Implementation

### Overview
The System Wake-Up screen serves as the new initial state, creating a cinematic "dormant terminal discovery" experience that perfectly fits the spy-thriller narrative.

### Implementation Details

#### State Machine Integration
- **New WAKE State**: Added as initial state before BOOT_SEQUENCE
- **State Flow**: WAKE → BOOT_SEQUENCE → AUTH → MISSION
- **Transitions**: Clean restart flows return to WAKE state

#### File Structure
```
js/wake-screen.js          # Wake controller with interaction handling
css/screens/wake.css       # Dormant terminal styling and animations
index.html                 # Wake screen HTML structure
```

#### Wake Experience Flow
1. **Pure Dormant State**: Completely black screen (dramatic silence)
2. **Delayed Revelation**: After 2 seconds, `[WAKE SYSTEM]` instruction appears
3. **Universal Activation**: Any interaction (touch/click/keyboard) triggers wake
4. **Audio Sequence**: CRT power-on → boot-up → beep confirmation
5. **Smooth Transition**: Seamless handoff to existing boot sequence

#### Technical Features
- **Mobile-First**: Optimized touch interactions and responsive design
- **Progressive Revelation**: `wake-stage-1-hidden` → `wake-stage-1-reveal`
- **Audio Integration**: Synchronized with existing audio engine
- **Accessibility**: Reduced motion and high contrast support
- **Universal Triggers**: Multiple interaction methods for reliability

#### Key Design Decisions
- **No Cursor**: Clean, minimalist dormant state (cursor removed per user request)
- **2-Second Delay**: Builds suspense before revealing wake instruction
- **Dark Aesthetic**: Pure black background reinforces dormant concept
- **Cinematic Timing**: Maintains 1200ms delays and 1.0s transitions

## Countdown Screen V2 Implementation

### Overview
Streamlined 14-day mission timer system with cinematic congratulations message, optimized spacing, and focused user experience without distracting credits.

### Implementation Details

#### Core Features
- **14-Day Timer**: 1,209,600 seconds countdown with clean DD:HH:MM:SS format (no labels)
- **3-Phase Cinematic Sequence**: Congratulations → "YOUR TIME STARTS NOW" → Timer/Audio
- **Mission Impossible Theme**: Plays when timer begins, with automatic looping
- **Character-by-Character Animation**: Terminal-style text reveal for congratulations message
- **Enhanced Word Spacing**: Tripled spacing between "YOUR TIME STARTS NOW" words for dramatic effect

#### File Structure
```
js/countdown-screen.js         # V2 controller with 14-day timer logic
css/screens/countdown.css      # Comprehensive styling with @layer architecture
index.html                     # Updated HTML structure for all phases
```

#### Countdown Experience Flow
1. **Phase 1 (0-5s)**: Congratulations message with character-by-character reveal
2. **Phase 2 (5-7s)**: "YOUR TIME STARTS NOW" word-by-word reveal with enhanced spacing
3. **Phase 3 (7s+)**: Timer display initialization and Mission Impossible theme starts, countdown begins

#### Technical Architecture
- **State Management**: Maintains BRIEFING → COUNTDOWN flow (credits removed)
- **Audio Integration**: `missionThemeFull` with looping via AudioEngine
- **Sequential Revelation**: Stage-specific CSS classes with optimized timing
- **Mobile-Responsive**: Horizontal timer layout on all screen sizes with clamp() functions
- **Accessibility**: Reduced motion and high contrast support
- **Compact Layout**: 75% spacing reduction between elements for tighter visual flow

#### Key Improvements
- **Streamlined Experience**: Removed distracting credits for focused mission timer
- **Enhanced Timer Layout**: Clean label-free format with horizontal display on all devices
- **Optimized Timing**: 50% faster transition from congratulations to timer (6s → 3s)
- **Dramatic Word Spacing**: 3x spacing between "YOUR TIME STARTS NOW" words
- **Compact Layout**: 75% reduction in element spacing for tighter visual hierarchy
- **True Countdown**: Real 14-day timer that decreases every second
- **CSS Layer Architecture**: Maintains existing @layer system compliance
- **Memory Management**: Clean interval cleanup and proper audio handling

#### Design Refinements (2025-07-06)
- **Timer Labels Removed**: Clean DD:HH:MM:SS format without DAYS/HOURS/MINUTES/SECONDS labels
- **Mobile Timer Fix**: Horizontal layout preserved on all screen sizes (removed vertical stacking)
- **Element Positioning**: "YOUR TIME STARTS NOW" repositioned above timer for better flow
- **Credits Elimination**: Entire credits system removed to focus on mission urgency
- **Spacing Optimization**: Reduced margins from `var(--space-xl)` to `var(--space-sm)` between key elements

## Current Development Phase

**✅ PRODUCTION READY - FULL CROSS-PLATFORM COMPATIBILITY ACHIEVED**
- **Live Site**: https://abaeckst.github.io/BrewstersMTGO ✅ FULLY OPERATIONAL
- **Desktop Status**: ✅ COMPLETE - All features, audio, animations working perfectly
- **Mobile Status**: ✅ FIXED - iOS devices now load and function correctly
- V2 Architecture with modular CSS (simplified from @layer system for iOS compatibility)
- System Wake-Up screen as initial state
- Streamlined Countdown Screen V2 with focused 14-day mission timer
- Comprehensive testing strategy (180+ tests, 80%+ coverage)
- Audio system with graceful fallbacks and generated sound synthesis
- All persistent UI issues and state transition bugs resolved
- Enterprise-grade quality gates implemented
- **GitHub Pages Deployment**: Automatic deployment from main branch

### Cross-Platform Compatibility Status (2025-07-07 - iOS Issue RESOLVED)
- **Desktop**: ✅ Fully functional - wake screen, audio, complete mission flow
- **iOS Safari**: ✅ FIXED - App loads immediately, audio works with fallbacks
- **Architecture Changes**: ✅ All major identified issues addressed (CSS @layer, dual loading, circular dependencies)
- **Touch Events**: ✅ Implemented comprehensive touch handling with passive event fixes
- **Audio Context**: ✅ iOS unlock methods added with fallbacks
- **CSS Safe Areas**: ✅ iPhone notch support and safe area padding
- **Form Inputs**: ✅ iOS zoom prevention (16px+ font sizes)
- **iOS Polyfills**: ✅ Comprehensive iOS detection and compatibility layer

**Recent Accomplishments**:
- **🚀 LIVE DEPLOYMENT**: Successfully launched at https://abaeckst.github.io/BrewstersMTGO
- **📦 GitHub Integration**: Complete repository setup with automatic GitHub Pages deployment
- **🔄 CI/CD Pipeline**: Push-to-deploy workflow established (main branch → live site)
- **System Wake-Up Screen**: Implemented as new initial state with dormant terminal interface
- **Wake System Integration**: Complete state machine, controller, and CSS implementation
- **Audio Synchronization**: CRT power-on → boot-up → beep sequence for wake interactions
- **Mobile-First Wake**: Touch-optimized interactions with universal activation triggers
- **Cursor Removal**: Refined wake screen to pure minimalist dormant state
- **Countdown Screen V2 Refinements**: Streamlined 3-phase sequence with enhanced spacing and timing
- **Timer Layout Optimization**: Horizontal display on all devices with clean label-free format
- **Credits System Removal**: Eliminated distracting credits for focused mission experience
- **Spacing & Timing Refinements**: 75% spacing reduction and 50% faster transitions
- Operative name storage system fixed
- Badge text sizing and scroll reset issues resolved
- Screen layout positioning stabilized
- Complete testing infrastructure implemented
- Mission briefing parameters updated with MTGO giveaway contest details

**Mobile Compatibility Work (2025-07-07)**:
- **📱 Touch Event Fixes**: Resolved passive listener conflicts, added comprehensive touch handlers
- **🔊 iOS Audio Context**: Added unlockAudioContext() method and iOS-specific initialization
- **📐 Safe Area Support**: iPhone notch and home indicator compatibility
- **🎯 Touch Interaction**: Mission and briefing screens now support touch events
- **⌨️ Form Input Fixes**: Prevented iOS zoom with 16px+ font sizes, webkit appearance fixes
- **🔧 iOS Polyfills**: Comprehensive iOS detection and compatibility layer (ios-polyfills.js)
- **💻 Desktop Restoration**: Fixed desktop regression with targeted media queries and restore CSS
- **📋 Documentation**: Complete work log and testing checklist created

### Major Architectural Fixes (2025-07-07 Session 2)

**🎯 ROOT CAUSE ANALYSIS COMPLETED**: Comprehensive dependency mapping identified exact iOS loading failures

#### Issue 1: CSS @layer Incompatibility ✅ FIXED
- **Problem**: iOS Safari doesn't support CSS cascade layers on older versions
- **Impact**: Complete CSS loading failure causing black screen
- **Solution**: Removed all @layer dependencies from 23 CSS files while preserving visual fidelity
- **Result**: CSS now loads properly on iOS devices without @layer system

#### Issue 2: Dual Loading System Conflict ✅ FIXED  
- **Problem**: Both ES6 module system AND iOS fallback loaded simultaneously
- **Impact**: Competing initialization systems caused module resolution failures
- **Solution**: Implemented proper feature detection to load only one system
- **Result**: Single loading path based on browser ES6 module support

#### Issue 3: Circular Dependencies ✅ FIXED
- **Problem**: AudioEngine auto-initialization created circular import conflicts  
- **Impact**: Module loading chain failures preventing app startup
- **Solution**: Removed auto-initialization, centralized initialization in app.js
- **Result**: Clean dependency chain with no circular references

#### Issue 4: Global Variable Pollution ✅ FIXED
- **Problem**: Multiple global window properties causing iOS conflicts
- **Impact**: Variable collision and initialization race conditions
- **Solution**: Reduced global exposure, debug-only appState, removed AudioEngine global
- **Result**: Minimal global footprint while maintaining screen controller access

#### Issue 5: Wake Screen State Transition ✅ FIXED
- **Problem**: Over-aggressive global cleanup broke window.app access
- **Impact**: TypeError preventing wake → boot transition on desktop
- **Solution**: Restored window.app global while keeping reduced pollution approach
- **Result**: Desktop functionality restored, wake screen works properly

#### Issue 6: Passive Event Listener Warnings ✅ FIXED
- **Problem**: preventDefault() called on passive event listeners
- **Impact**: Console warnings and potential iOS event handling issues
- **Solution**: Separate handlers for passive vs non-passive events
- **Result**: Clean console output, proper iOS touch event handling

### Final iOS Resolution (2025-07-07 Session 3)

**🎯 ROOT CAUSE: Audio Engine Initialization Blocking**
- **Problem**: app.init() hung on iOS because audio engine tried to load missing sound files
- **Impact**: Complete app initialization failure, users saw blank screen indefinitely
- **Investigation**: Debug tests revealed audio preloading blocking for 6+ seconds, then failing

#### Issue 7: Audio File Loading Blocking ✅ FIXED
- **Problem**: Missing audio files caused audio engine initialization to hang
  - `terminal-beep.wav` → should be `beep.wav`
  - `terminal-text-beep.wav` → missing completely
  - `typing-sounds.wav` → missing completely
- **Impact**: `await this.audio.init()` never resolved, preventing wake screen from appearing
- **Solution**: 
  1. Fixed audio file path mapping to existing files
  2. Made audio initialization non-blocking (removed await)
  3. Added comprehensive generated sound fallbacks
- **Result**: iOS app loads immediately (~1-2s), audio works with graceful fallbacks

#### Technical Implementation:
```javascript
// Before (blocking):
await this.audio.init();

// After (non-blocking):
this.audio.init().catch(error => {
    console.warn('⚠️ Audio initialization failed (continuing without audio):', error);
});
```

#### Generated Audio Fallbacks:
- **terminalTextBeep**: 1200Hz sine wave, 0.08s duration
- **typingSound**: 800Hz triangle wave, 0.06s duration  
- **bootUp**: 220Hz sine wave, 1.0s duration
- **crtPowerOn**: 100Hz triangle wave, 0.8s duration

**Final Status**: ✅ iOS devices now load app immediately and function correctly with full audio support

### iOS Audio Engine Resolution (2025-07-07 Session 4)

**🎯 FINAL RESOLUTION: "Audio Engine Not Loaded" Error Fixed**
- **Problem**: iOS Safari showed persistent "Audio engine not loaded" console warnings
- **Root Cause**: Audio initialization failing silently, loaded flag never set to true
- **Impact**: Users saw console errors and reduced audio functionality on mobile

#### Issue 8: iOS Audio Initialization Blocking ✅ FIXED
- **Problem**: 
  - AudioContext creation failing on iOS Safari without proper error handling
  - Audio file preloading hanging indefinitely without timeout mechanism  
  - Blocking initialization preventing `loaded = true` flag from being set
  - No iOS-specific compatibility detection or fallback strategies
- **Impact**: "Audio engine not loaded" warnings in console, reduced mobile audio experience
- **Solution**:
  1. **Progressive Loading**: Audio engine always marks as loaded, even with partial failures
  2. **iOS-Safe Timeouts**: 3-second timeout for audio file loading on iOS devices
  3. **Enhanced Diagnostics**: Comprehensive logging to identify exact failure points
  4. **Mobile-First Strategy**: Generated sounds work even when AudioContext fails
  5. **Smart Fallbacks**: Multiple AudioContext creation strategies with graceful degradation
- **Result**: iOS devices show clean console, audio engine reports as loaded, full functionality

#### Technical Implementation:
```javascript
// Before (blocking):
this.loaded = true; // Only set after ALL audio files loaded

// After (progressive):
this.loaded = true; // Always set, with smart fallbacks
const preloadSuccess = await this.preloadSoundsWithTimeout();
```

#### Enhanced iOS Features:
- **iOS Device Detection**: Automatic iOS Safari compatibility detection
- **Enhanced Mobile Unlock**: 10 different touch event types for audio unlock reliability  
- **Timeout Protection**: 3-second iOS timeout prevents indefinite audio loading
- **Progressive Audio Loading**: Files load independently without blocking initialization
- **Generated Sound Fallbacks**: 8 envelope types with enhanced quality synthesis
- **Comprehensive Diagnostics**: Mobile debug info with detailed status reporting
- **Debug Tools**: iOS-specific audio testing page (`ios-audio-debug.html`)

**Mobile Compatibility Status**: ✅ FULLY RESOLVED - iOS Safari now shows clean console with full audio functionality

## Mobile Debug Tools

### iOS Audio Debug Console
- **File**: `ios-audio-debug.html` (development tool)
- **Purpose**: Comprehensive iOS Safari audio system testing
- **Features**:
  - Real-time audio engine status monitoring
  - Step-by-step audio function testing
  - Detailed diagnostic information display
  - Mobile-optimized interface for touch testing
  - Console log integration for debugging

### Debug Commands
```javascript
// Get comprehensive mobile debug info
audioEngine.getMobileDebugInfo();

// Force reinitialize for testing
audioEngine.forceInit();

// Test iOS-specific unlock
audioEngine.unlockAudioContext();
```

## Quality Gates

### Automated Standards
- 80%+ code coverage, 70%+ branch coverage
- <3s load time, 60fps animations
- WCAG 2.1 AA accessibility compliance
- Cross-browser compatibility validation

### Development Requirements
- All code changes must pass comprehensive test suite
- Visual regression validation via Playwright
- Sequential revelation timing (1200ms) preservation
- ESLint compliance and architectural pattern adherence

### Manual Validation
- Cinematic feel and spy-thriller atmosphere
- Complete mission acceptance/decline flows
- Mobile touch interactions and responsive design
- Screen reader and keyboard navigation

## Deployment

**Live Site**: https://abaeckst.github.io/BrewstersMTGO
**Repository**: https://github.com/abaeckst/BrewstersMTGO

### GitHub Pages Setup
- Static files only (GitHub Pages)
- No build process required
- Multi-file architecture for maintainability
- Deployed from main branch / root folder
- Automatic deployment on push to main

### Deployment Process
1. Push changes to main branch
2. GitHub Pages automatically rebuilds (1-2 minutes)
3. Site updates at live URL
4. Test all functionality in production environment

### Deployment Status
- **Status**: 🎯 DESKTOP COMPLETE - MOBILE INVESTIGATION REQUIRED
- **Last Updated**: 2025-07-07 (Session 2 - Button Fixes Complete)
- **Desktop Performance**: ✅ FULLY FUNCTIONAL - All button transitions, audio, and mission flow working
- **Button Transitions**: ✅ FIXED - Mission, Briefing, Declined, and Credits screens all working
- **Audio System**: ✅ COMPLETE - Mission Impossible theme, sound effects, and AudioEngine imports all working
- **Mobile Compatibility**: ❌ INVESTIGATION NEEDED - iOS devices require Safari remote debugging
- **Terminal Experience**: Complete cinematic spy-thriller experience operational on desktop, mobile needs testing

### Mobile Debug Status (Updated 2025-07-07)
- **iOS Status**: ❌ STILL NOT WORKING - Silent failure after constructor fixes
- **Progress Made**: Fixed BriefingScreen constructor crash, all debug tests pass individually
- **Root Cause**: Unknown - app constructor completes but visual initialization fails
- **Debug Tools**: 5 comprehensive test files created for step-by-step diagnosis
- **Next Steps**: Focus on app.init() execution and CSS rendering on iOS

### Mobile Compatibility Investigation Plan (2025-07-07)

#### **Investigation Overview**
Despite extensive mobile compatibility fixes, the app remains non-functional on iOS devices. Root cause analysis needed to identify foundational issues preventing mobile operation.

#### **Phase 1: Root Cause Identification (60 minutes)**

**1. Safari Remote Debugging Setup**
- Enable Safari Web Inspector on Mac
- Connect iPhone via USB and enable debugging
- Access real iOS Safari console to see actual errors
- Document all JavaScript errors, module loading failures, and network issues

**2. Minimal Reproducible Test**
- Create ultra-simple `mobile-test.html` with just:
  - Basic iOS detection
  - Touch event test
  - Audio context unlock test
  - ES6 module loading test
- Test each component in isolation to identify foundational issues

**3. Network & Loading Analysis**
- Check if files are loading correctly on iOS
- Verify ES6 module support on target iOS versions
- Test HTTPS vs HTTP behavior (GitHub Pages vs localhost)
- Analyze CSS cascade layer support on iOS Safari

#### **Phase 2: Systematic Debugging (90 minutes)**

**4. Audio System Isolation**
- Test audio context unlock without full app complexity
- Verify Mission Impossible theme loading and playback
- Check iOS audio restrictions and user gesture requirements
- Test fallback audio methods if primary fails

**5. Touch Event Investigation**
- Create touch test page with visual feedback
- Verify passive listener handling works correctly
- Test wake screen, mission selection, and briefing interactions
- Check event propagation and preventDefault behavior

**6. CSS Architecture Review**
- Test with simplified CSS (remove @layer complexity)
- Verify iOS safe area support actually works
- Check viewport meta tag effectiveness
- Test font size zoom prevention (16px minimum)

#### **Phase 3: Architecture Fixes (60 minutes)**

**7. ES6 Module Compatibility**
- Add Babel transpilation for older iOS versions if needed
- Consider bundling modules for better iOS support
- Test with different module loading strategies
- Implement progressive enhancement fallbacks

**8. Final Integration Testing**
- Apply identified fixes to main application
- Test complete user flow on actual iOS device
- Verify desktop functionality remains intact
- Document working solution for future reference

#### **Success Criteria**
- iOS Safari console shows no critical errors
- Touch interactions work on actual iPhone
- Audio plays correctly after user interaction
- Complete mission flow works from wake → countdown

#### **Potential Root Causes Identified**
Based on codebase analysis:

**Module Loading Issues:**
- App uses ES6 modules (`"type": "module"` in package.json)
- iOS Safari (especially older versions) may have ES6 module support issues
- No transpilation/bundling for older iOS versions

**HTTPS Requirements:**
- Some iOS features require HTTPS (audio context, PWA features)
- GitHub Pages provides HTTPS, but testing on localhost may fail

**CSS Architecture Complexity:**
- 21 CSS files with complex `@layer` cascade system
- iOS may have issues with CSS cascade layers
- Complex media queries and feature detection

**Audio System Complexity:**
- 18-sound audio engine with Mission Impossible theme
- iOS audio restrictions very strict
- Audio context unlocking may not be working properly

### **Current Status & Next Steps**

**STATUS**: Despite comprehensive architectural fixes addressing all identified root causes, iOS devices still show no loading. The app now has:
- ✅ No CSS @layer dependencies (simplified to direct CSS rules)
- ✅ Single loading system (feature detection prevents dual loading conflicts)  
- ✅ No circular dependencies (AudioEngine centralized initialization)
- ✅ Minimal global pollution (balanced approach)
- ✅ Clean desktop functionality (wake screen, state transitions working)
- ✅ Proper passive event handling (no console warnings)

**HYPOTHESIS**: There may be deeper iOS-specific issues not caught by our analysis:
- iOS Safari version-specific ES6 module limitations
- HTTPS certificate or security context issues
- iOS-specific JavaScript errors not visible in analysis
- Feature detection logic not working correctly on iOS
- Audio context restrictions blocking entire app initialization

#### **Next Session Investigation Prompt**

```
URGENT: iOS COMPATIBILITY DEEP INVESTIGATION

The app has undergone comprehensive architectural fixes but still fails to load on iOS devices. All major identified issues have been resolved:
- CSS @layer system removed (23 files updated)
- Dual loading conflicts eliminated (feature detection implemented)
- Circular dependencies resolved (AudioEngine centralized)
- Global variable pollution reduced
- Desktop functionality verified working

TASK: Perform deep iOS Safari investigation to identify remaining blockers.

INVESTIGATION PRIORITIES:
1. **Safari Remote Debugging**: Connect iPhone to Mac, access Safari Web Inspector console to see actual iOS errors
2. **Feature Detection Testing**: Verify ES6 module detection logic works correctly on iOS
3. **Minimal Reproducible Test**: Create ultra-simple iOS test page to isolate fundamental issues
4. **iOS Version Testing**: Test across different iOS versions to identify version-specific failures
5. **Audio Context Investigation**: Test if iOS audio restrictions are blocking entire app startup
6. **Network Analysis**: Check if HTTPS certificate, CORS, or loading issues affect iOS Safari

EXPECTED OUTCOME: Identify exact iOS failure point and implement targeted fix.
TOOLS NEEDED: iPhone connected to Mac with Safari Web Inspector enabled.

START WITH: Safari remote debugging to see actual iOS console errors - this will reveal the true root cause.
```

## Testing Capabilities & Limitations

### What I CAN Test
- **Server Operations**: Start/stop servers, verify they're running, check ports
- **File Operations**: Read files, analyze code, check file structure
- **Text-based Testing**: Fetch HTML content, analyze configuration files
- **Audio File Analysis**: Check audio file properties, formats, metadata
- **Test Infrastructure**: Run automated test commands and interpret results
- **Static Analysis**: ESLint, type checking, code quality tools
- **Network Requests**: cURL, API calls, server responses

### What I CANNOT Test
- **Visual Interface**: Cannot see rendered webpages, UI elements, or animations
- **Audio Playback**: Cannot hear audio or verify it plays correctly
- **Interactive Elements**: Cannot click buttons, type in forms, or test touch gestures
- **Browser Compatibility**: Cannot test across different browsers visually
- **Performance**: Cannot measure frame rates, smooth animations, or perceived performance
- **Mobile Experience**: Cannot test on actual devices or see mobile-specific issues
- **User Experience**: Cannot verify "feel" or subjective user experience

### Testing Strategy
1. **Use Automated Tests**: Run existing test suites (Jest, Playwright, Cypress)
2. **Analyze Results**: Read test output, error messages, and coverage reports
3. **Static Analysis**: Use linters and type checkers for code quality
4. **Server Testing**: Verify applications start and respond correctly
5. **File Structure**: Validate configuration and code organization
6. **User Verification**: Always ask users to test visual/interactive elements

### Time-Saving Guidelines
- **Don't attempt** visual verification of animations or UI appearance
- **Don't try** to test audio playback or sound effects
- **Don't waste time** on interactive testing without proper tools
- **Focus on** code quality, test automation, and server functionality
- **Ask users** to verify visual/interactive elements after implementation