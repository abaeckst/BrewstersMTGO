# Countdown Screen Design Specification

## Overview
A cinematic countdown screen that replaces the existing implementation with a 14-day mission timer, congratulations message, and scrolling credits. This screen maintains the spy-thriller terminal aesthetic while providing a passive viewing experience.

## Screen Flow
**State**: COUNTDOWN (triggered from BRIEFING → COUNTDOWN after "Accept Mission")
**Entry**: Auto-scroll to top, then begin sequence
**Exit**: Passive screen (no automatic transition)

## Screen Sequence

### Phase 1: Congratulations Message (0-8 seconds)
- **Start**: Pure darkness, 1200ms delay
- **Content**: Terminal-style print-out congratulating operative
- **Text**: "CONGRATULATIONS, OPERATIVE. YOU HAVE ACCEPTED THE MOST CRITICAL MISSION OF YOUR CAREER. YOU ARE THE ONLY AGENT WITH THE SKILLS AND CLEARANCE TO EXECUTE OPERATION: GOBLIN SURPRISE."
- **Animation**: Character-by-character reveal with cursor blink
- **Timing**: Standard terminal print speed (matching existing patterns)
- **Duration**: ~6 seconds total

### Phase 2: Timer Initialization (8-10 seconds)
- **Content**: 8-digit timer display appears
- **Layout**: 
  ```
  DAYS    HOURS   MINUTES  SECONDS
  [ 1][ 4]  [ 0][ 0]  [ 0][ 0]  [ 0][ 0]
  ```
- **Initial State**: Shows 14 days (1 4 0 0 0 0 0 0)
- **Animation**: Fade in from darkness over 1.0s
- **Spacing**: Single spaces between time units

### Phase 3: "YOUR TIME STARTS NOW" Sequence (10-14 seconds)
- **Position**: Below timer display
- **Words**: "YOUR" → "TIME" → "STARTS" → "NOW"
- **Timing**: 1 second between each word
- **Animation**: Fade in effect for each word
- **Audio**: No sound effects
- **Final State**: All words remain visible

### Phase 4: Mission Impossible Theme & Timer Start (14+ seconds)
- **Audio Trigger**: Mission Impossible theme begins when "NOW" appears
- **Audio Behavior**: Loops if theme finishes before countdown
- **Timer Behavior**: Begins true countdown (decreasing)
- **Timer Updates**: Every second, with digit animations

### Phase 5: Credits Scroll (18+ seconds)
- **Start Delay**: 4 seconds after timer begins
- **Header**: "GOOD LUCK FROM"
- **Content**: Scrolling contributor names
- **Speed**: Readable scroll rate (approximately 30px/second)
- **Position**: Below "YOUR TIME STARTS NOW" text
- **Behavior**: Continuous scroll, no breaks

## Visual Design

### Layout Structure
```
┌─────────────────────────────────────┐
│                                     │
│    [Congratulations Message]        │
│                                     │
│    DAYS    HOURS   MINUTES SECONDS  │
│   [ 1][ 4]  [ 0][ 0]  [ 0][ 0]  [ 0][ 0] │
│                                     │
│         YOUR TIME STARTS NOW        │
│                                     │
│          GOOD LUCK FROM             │
│         [Scrolling Credits]         │
│                                     │
└─────────────────────────────────────┘
```

### Typography & Colors
- **Aesthetic**: Dark terminal theme matching existing screens
- **Timer Digits**: Large, prominent, monospace font
- **Congratulations**: Terminal green (#00ff00) with glow effect
- **Timer Labels**: Secondary color with appropriate contrast
- **Credits**: Standard terminal styling

### Timer Digit Design
- **Size**: Large and prominent (clamp(4rem, 12vw, 8rem))
- **Font**: Monospace (Courier New)
- **Color**: Primary terminal green with glow
- **Background**: Subtle border/background for definition
- **Special Effects**: Optional subtle scan lines or glow enhancement

### Animations
- **Congratulations**: Character-by-character reveal
- **Timer**: Fade in on initialization
- **Words**: Individual fade in effects
- **Credits**: Continuous vertical scroll
- **Digit Changes**: Smooth transition when countdown updates

## Technical Requirements

### State Management
- **State**: COUNTDOWN
- **Entry Point**: From BRIEFING state after "Accept Mission"
- **Initialization**: Auto-scroll to top before sequence begins
- **Exit**: Passive screen (no automatic state transition)

### Audio Integration
- **Theme**: Mission Impossible theme from existing assets
- **Timing**: Begins when "NOW" appears
- **Behavior**: Loops if theme ends before countdown
- **Volume**: Consistent with existing audio levels

### Timer Logic
- **Initial Value**: 14 days (1,209,600 seconds)
- **Format**: DD HH MM SS (8 digits total)
- **Update Frequency**: Every second
- **Behavior**: True countdown (decreasing)
- **End State**: Continues to 00 00 00 00 (no special action)

### Performance Considerations
- **Scroll Position**: Reset to top on screen entry
- **Memory**: Clean interval management for timer
- **Cleanup**: Proper audio and timer cleanup on screen exit

## Contributors List
The following names will appear in the scrolling credits:

1. Andy Cooperfaus
2. BK
3. Ben Weitz
4. Boland
5. Cam Priest
6. Corey Burkhart
7. Dave Shields
8. Gaby
9. Jacob Wilson
10. Josh McCLain
11. LSV
12. Luna
13. Mack
14. Matt Costa
15. Matt Wright
16. Nassif
17. Ondrej
18. PV
19. Psulli
20. Reid
21. Seth
22. Siggy
23. Snook
24. Squirrel
25. Theo
26. Will K
27. Wrapter
28. Zaiem

## File Structure Changes

### Files to Remove/Replace
- `js/countdown-screen.js` (complete replacement)
- `css/screens/countdown.css` (complete replacement)
- HTML section in `index.html` (lines 281-323)

### Files to Modify
- `js/state.js` (maintain COUNTDOWN state)
- `js/app.js` (update screen controller import)
- `index.html` (new HTML structure)

## Implementation Standards

### Timing Consistency
- **JavaScript Delays**: 1200ms between major sequences
- **CSS Transitions**: 1.0s duration for all animations
- **Terminal Print**: Match existing character reveal speed

### CSS Architecture
- **Layer System**: Use existing @layer structure
- **Naming**: Follow established BEM-style conventions
- **Specificity**: Use !important strategically with stage classes
- **Mobile**: Responsive design with clamp() for scaling

### Testing Requirements
- **Visual**: Verify timer display and countdown accuracy
- **Audio**: Confirm Mission Impossible theme timing and looping
- **Mobile**: Test responsive behavior and touch interactions
- **Performance**: Validate smooth animations and memory usage

## Success Criteria
1. Cinematic 14-day countdown with accurate timer logic
2. Smooth terminal-style congratulations sequence
3. Synchronized Mission Impossible theme with looping
4. Readable scrolling credits with proper timing
5. Maintains spy-thriller aesthetic and user immersion
6. Mobile-responsive design with proper scaling
7. Clean integration with existing state management system