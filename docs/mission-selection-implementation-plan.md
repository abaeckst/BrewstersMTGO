# Mission Selection Implementation Plan

## Implementation Phases

### Phase 1: HTML Structure Redesign
**File**: `index.html` (lines 82-121)

**Changes Required**:
- Replace current binary choice layout with terminal communication area
- Add dedicated typing display area for progressive text reveal
- Create separate button containers with proper IDs
- Remove keyboard prompt section entirely
- Add proper stage classes for new revelation system

**New HTML Structure**:
```html
<div id="mission-screen" class="screen">
    <div class="terminal-container">
        <!-- Stage 1: Transmission Detection (unchanged) -->
        <div class="transmission-detection mission-stage-1-hidden" id="transmission-detection">
            <!-- existing content -->
        </div>
        
        <!-- Stage 2: Terminal Communication -->
        <div class="terminal-communication mission-stage-2-hidden" id="terminal-communication">
            <div class="communication-display" id="communication-display"></div>
        </div>
        
        <!-- Stage 3: Mission Buttons -->
        <div class="mission-buttons mission-stage-3-hidden" id="mission-buttons">
            <button class="mission-accept-btn mission-stage-3a-hidden" id="mission-accept-btn">
                ACCEPT MISSION
            </button>
            <button class="mission-decline-btn mission-stage-3b-hidden" id="mission-decline-btn">
                DECLINE MISSION
            </button>
        </div>
    </div>
</div>
```

### Phase 2: CSS Styling Updates
**File**: `css/main.css`

**Changes Required**:
- New stage classes for terminal communication and progressive button reveal
- Touch-friendly button styling with enhanced visual feedback
- Pulse animations for button materialization
- Mobile-optimized sizing and spacing
- Remove keyboard-related styling

**Key CSS Additions**:
```css
/* Terminal Communication Styling */
.terminal-communication {
    margin: 20px 0;
    font-family: 'Courier New', monospace;
}

.communication-display {
    color: #00ff00;
    font-size: 18px;
    line-height: 1.4;
    text-shadow: 0 0 10px #00ff00;
}

/* Enhanced Button Styling */
.mission-accept-btn, .mission-decline-btn {
    width: 280px;
    height: 60px;
    margin: 15px auto;
    font-size: 18px;
    border: 2px solid #00ff00;
    background: rgba(0, 255, 0, 0.1);
    color: #00ff00;
    cursor: pointer;
    transition: all 0.3s ease;
}

.mission-accept-btn:hover, .mission-decline-btn:hover {
    background: rgba(0, 255, 0, 0.2);
    box-shadow: 0 0 20px #00ff00;
    transform: scale(1.05);
}

/* Progressive Reveal Classes */
#mission-screen .mission-stage-3a-hidden,
#mission-screen .mission-stage-3b-hidden {
    opacity: 0 !important;
    transform: translateY(20px) !important;
    transition: all 1.0s ease-out !important;
}

#mission-screen .mission-stage-3a-reveal,
#mission-screen .mission-stage-3b-reveal {
    opacity: 1 !important;
    transform: translateY(0) !important;
}
```

### Phase 3: JavaScript Logic Overhaul
**File**: `js/sequences.js` - `initMissionScreen()` method (lines 257-316)

**Complete Rewrite Required**:
- Replace existing 3-stage system with new flow
- Implement character-by-character typing function
- Add progressive button reveal logic
- Integrate proper audio cues

**New Method Structure**:
```javascript
async initMissionScreen() {
    const startTime = Date.now();
    console.log('🎯 Starting enhanced mission screen');
    
    // Stage 1: Transmission Detection (keep existing)
    await this.runTransmissionDetection();
    
    // Stage 2: Terminal Communication
    await this.runTerminalCommunication();
    
    // Stage 3: Progressive Button Reveal  
    await this.runProgressiveButtonReveal();
    
    // Enable touch interactions
    this.enableMissionButtons();
}

async runTerminalCommunication() {
    // Show communication container
    // Type out personal message character by character
    // Include agent name from localStorage
}

async runProgressiveButtonReveal() {
    // Type "OPTION ALPHA..." → reveal accept button
    // Type "OPTION BRAVO..." → reveal decline button
    // Add pulse animations
}
```

### Phase 4: Event Handler Updates
**File**: `js/app.js`

**Changes Required**:
- Remove keyboard event listeners for A/M keys (lines 282-295)
- Add click/touch event listeners for new buttons
- Update `handleMissionChoice()` calls
- Add touch feedback audio

**New Event Handlers**:
```javascript
// Remove existing keyboard handlers for mission screen

// Add new button event listeners
function initializeMissionButtons() {
    const acceptBtn = document.getElementById('mission-accept-btn');
    const declineBtn = document.getElementById('mission-decline-btn');
    
    acceptBtn?.addEventListener('click', () => {
        AudioEngine.play('terminalBeep');
        handleMissionChoice(true);
    });
    
    declineBtn?.addEventListener('click', () => {
        AudioEngine.play('terminalBeep');  
        handleMissionChoice(false);
    });
}
```

### Phase 5: Content Updates
**File**: Multiple files

**Text Changes**:
- Update mission accept option: Remove "REWARD: 600 TICKS" text
- Update mission decline status: "SAFE_EXIT" → "MISSION DECLINED"
- Implement agent name personalization in terminal message

### Phase 6: Audio Integration
**File**: `js/audio-engine.js` (if new sounds needed)

**Audio Enhancements**:
- Character typing sound effects
- Button materialization audio
- Touch interaction feedback
- Enhanced transition sounds

## Implementation Order
1. **HTML Structure** - Foundation for new layout
2. **CSS Styling** - Visual framework and stage classes
3. **JavaScript Core** - New sequence logic and typing functions
4. **Event Handlers** - Touch/click functionality
5. **Content Updates** - Text and status changes
6. **Audio Polish** - Enhanced sound effects
7. **Testing & Refinement** - Mobile testing and timing adjustments

## Testing Checkpoints
- [ ] Stage revelation timing (8-12 seconds total)
- [ ] Character typing effect smoothness
- [ ] Button materialization timing
- [ ] Touch/click responsiveness on mobile
- [ ] Audio synchronization
- [ ] Agent name personalization
- [ ] Content accuracy (no reward text on accept, proper decline status)

## Risk Mitigation
- Backup current working mission screen before changes
- Test each phase independently
- Maintain existing CSS cascade patterns
- Preserve audio timing architecture
- Ensure mobile compatibility at each step