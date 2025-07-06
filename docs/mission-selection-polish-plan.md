# Mission Selection Screen Polish Implementation Plan

## Overview
Polish the mission selection screen with auto-scroll, improved button styling, and enhanced user prompts based on user feedback.

## User Requirements
1. **Auto-scroll**: Smooth scroll during progressive revelation to keep new content visible at bottom of viewport
2. **Button improvements**: Identical sizing, bigger/bolder text, side-by-side layout on mobile
3. **Simplified button text**: Remove status text, keep only "ACCEPT MISSION" and "HONORABLE DISCHARGE"
4. **Enhanced prompt**: "Tap Your Selection" - 24px, bright red, continuous slow pulse

## Implementation Phases

### Phase 1: Auto-scroll During Progressive Revelation
**File**: `js/sequences.js`
- Add smooth scroll functionality to each of the 8 revelation stages
- Integrate with existing 1200ms delays between stages
- Use `scrollIntoView({ behavior: 'smooth', block: 'end' })` to keep new elements visible
- Coordinate timing with 1.0s CSS transitions to feel natural

**Technical Details**:
- Stage 1 (Transmission): Scroll to detection section after reveal
- Stage 2 (Communication): Scroll to personal message after typing
- Stage 3-8 (Choices): Scroll to each new choice element as it appears
- Ensure scroll doesn't interfere with ongoing typing animations

### Phase 2: Button Styling Improvements
**Files**: `css/mobile.css`, `index.html`

**Uniform Sizing**:
- Set both mission buttons to identical width and height
- Use consistent padding and margins
- Ensure buttons render identically across mobile breakpoints (375px, 768px)

**Enhanced Text**:
- Increase button text font-size to 22-24px
- Add `font-weight: bold` for better visibility
- Optimize line-height for button height

**Side-by-side Layout**:
- Modify `.progressive-choices` to use flexbox row layout on mobile
- Add proper spacing between buttons
- Ensure buttons fit comfortably side-by-side on iPhone screens

### Phase 3: Simplified Button Text
**File**: `index.html`
- Remove `.button-status` spans containing "CLASSIFIED" and "MISSION DECLINED"
- Keep only main action text: "ACCEPT MISSION" and "HONORABLE DISCHARGE"
- Update button structure to be cleaner

### Phase 4: Enhanced "Tap Your Selection" Prompt
**Files**: `css/mobile.css`, `css/animations.css`

**Visual Enhancement**:
- Change font-size to 24px for better visibility
- Set color to bright red (#ff4444 or similar) for attention
- Remove opacity fade for full brightness

**Pulse Animation**:
- Create continuous, slow pulse using CSS keyframes
- Target intensity: subtle but noticeable
- Speed: slow, relaxed pulse (2-3 second cycle)

## Testing Requirements
1. **Auto-scroll timing**: Verify scroll keeps pace with all 8 revelation stages
2. **Button consistency**: Test buttons render identically on various mobile sizes
3. **Visual hierarchy**: Confirm red pulsing prompt draws attention appropriately
4. **Mobile optimization**: Test on iPhone SE (375px) and larger mobile (768px)

## Success Criteria
- ✅ Smooth auto-scroll follows revelation without feeling abrupt
- ✅ Both buttons identical size and properly positioned side-by-side
- ✅ Button text bold, readable, and appropriately sized
- ✅ "Tap Your Selection" clearly visible with effective pulse animation
- ✅ No layout breaking on mobile devices

## Files Modified
- `js/sequences.js` - Auto-scroll functionality
- `css/mobile.css` - Button styling and layout improvements
- `css/animations.css` - Pulse animation keyframes
- `index.html` - Button text simplification
- `docs/mission-selection-polish-plan.md` - This implementation plan

## Documentation Updates
- Update CLAUDE.md Current Development Phase with polish completion
- Document auto-scroll and button improvements in implementation notes
- Add polish phase to completed accomplishments