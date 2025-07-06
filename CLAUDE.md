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

**✅ LIVE PRODUCTION DEPLOYMENT - MISSION OPERATIONAL**
- **Live Site**: https://abaeckst.github.io/BrewstersMTGO ✅ VERIFIED OPERATIONAL
- V2 Architecture with modular CSS (19 files including countdown.css)
- System Wake-Up screen as initial state
- Streamlined Countdown Screen V2 with focused 14-day mission timer
- Comprehensive testing strategy (180+ tests, 80%+ coverage)
- Audio system converted to .wav format with Mission Impossible theme integration
- All persistent UI issues and state transition bugs resolved
- Enterprise-grade quality gates implemented
- **GitHub Pages Deployment**: Automatic deployment from main branch

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
- **Status**: ✅ LIVE AND OPERATIONAL
- **Last Verified**: 2025-07-06
- **Site Performance**: Fully functional with all features working
- **Audio System**: Mission Impossible theme integration confirmed
- **Mobile Compatibility**: Touch interactions verified on mobile devices
- **Terminal Experience**: Complete cinematic spy-thriller experience operational