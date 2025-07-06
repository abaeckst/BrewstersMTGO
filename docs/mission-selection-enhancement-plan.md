# Mission Selection Screen Enhancement Plan

## Overview
Transform current 3-stage mission screen into personalized terminal communication with dramatic progressive reveal, removing keyboard controls for mobile-friendly touch/click interface.

## Current State Analysis
- **Existing Flow**: Transmission Detection → Binary Choice Display → Keyboard Prompt
- **Current Issues**: 
  - Impersonal "MISSION PARAMETERS RECEIVED" header
  - Keyboard-only controls (A/M keys) inappropriate for mobile
  - Reward information shown for accept mission (should be classified)
  - Generic "SAFE_EXIT" status instead of "MISSION DECLINED"

## Target Experience
**Narrative Goal**: Personal communication from command to valued operative offering final mission choice

**New Flow**:
1. **Stage 1**: Transmission Detection (unchanged - working well)
2. **Stage 2**: Personal Terminal Communication
   - Character-by-character typing of personal message
   - Recognition of operative's service record
   - Introduction of "Operation: Goblin Surprise"
   - Explanation of choice between final mission or honorable discharge
3. **Stage 3**: Progressive Option Reveal
   - Type out Option Alpha explanation → Accept button materializes with glow
   - Type out Option Bravo explanation → Decline button materializes with glow
   - Touch-friendly interface with visual feedback

## Content Strategy

### Personal Terminal Message
```
> TRANSMISSION DECRYPTED
> PRIORITY: EYES ONLY

OPERATIVE [AGENT_NAME],

YOUR SERVICE RECORD: EXCEPTIONAL
YEARS IN FIELD: [CLASSIFIED]  
MISSIONS COMPLETED: [CLASSIFIED]

COMMAND HAS SELECTED YOU FOR ONE FINAL ASSIGNMENT.
OPERATION: GOBLIN SURPRISE

YOU HAVE EARNED THE RIGHT TO CHOOSE:

OPTION ALPHA: ACCEPT FINAL MISSION
[Accept button materializes]

OPTION BRAVO: HONORABLE DISCHARGE WITH RETIREMENT BONUS (600 MTGO TICKETS)
[Decline button materializes]

THE CHOICE IS YOURS, OPERATIVE.
```

### Updated Option Details
- **Accept Mission**: Remove reward text (classified information)
- **Decline Mission**: Change status from "SAFE_EXIT" to "MISSION DECLINED"
- **Retirement Bonus**: Frame 600 tickets as retirement compensation, not mission reward

## Technical Requirements

### Mobile-First Interaction
- Remove all keyboard dependencies (A/M keys)
- Large, touch-friendly buttons with clear visual feedback
- Pulse animations on button appearance
- Touch feedback with glow intensification
- "TOUCH TO SELECT" hint if needed

### Timing & Pacing
- Maintain 8-12 second total sequence
- Character-by-character typing for immersion
- 1200ms delays between major stages
- Progressive button reveal after each option explained

### Audio Integration
- Typing sound effects for terminal communication
- Button materialization audio cues
- Touch interaction feedback sounds
- Maintain existing transition audio

## Success Metrics
- Personal, cinematic feel reinforcing spy narrative
- Mobile-optimized touch interface
- Dramatic progressive button reveal
- Clean removal of keyboard dependencies
- Maintains target timing (8-12 seconds total)
- Enhanced user engagement through personalization