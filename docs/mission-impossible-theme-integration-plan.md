# Mission Impossible Theme Integration Plan

## Current State Analysis
- **MP3 File**: "01. Theme from Mission Impossible.mp3" exists in project root
- **Audio System**: Robust AudioEngine with generated fallback sounds
- **Timer Location**: ASCII flip-clock timer in briefing screen (lines 315-471 in index.html)
- **Current Trigger**: Timer appears during `dramaticTimerReveal()` function in sequences.js:715-779
- **Existing Theme Implementation**: `playThemeWithSync()` method exists but uses generated sounds

## Implementation Plan

### Phase 1: Audio File Integration
1. **Move MP3 to proper location**
   - Move "01. Theme from Mission Impossible.mp3" → "assets/sounds/mission-impossible-theme.mp3"
   - Update AudioEngine soundMap to reference new file location
   - Add audio preload element to HTML

### Phase 2: Enhanced Audio Engine
2. **Update AudioEngine configuration**
   - Add new sound entry: `missionImpossibleTheme` with proper file path
   - Modify `playThemeWithSync()` to use actual MP3 file
   - Implement precise timing callback for "the drop" moment
   - Add volume controls and fade effects

### Phase 3: Timer Integration
3. **Enhance timer reveal sequence**
   - Modify `dramaticTimerReveal()` in sequences.js
   - Start theme playback when flip-clock becomes visible
   - Synchronize timer digit animations with musical beats
   - Add visual effects (screen flicker, glow) on musical "drop"

### Phase 4: Enhanced Cinematic Experience
4. **Audio-visual synchronization**
   - Screen flash effects synchronized with theme highlights
   - Flip-clock digits animate to musical rhythm
   - Enhanced phosphor glow effects during music
   - Timer message appears on musical climax

### Phase 5: Fallback & Testing
5. **Robust implementation**
   - Maintain generated sound fallback if MP3 fails to load
   - Mobile audio compatibility testing
   - Proper audio context unlocking for iOS/Android
   - Volume level optimization for cinematic effect

## Key Integration Points
- **Trigger**: Timer reveal in `dramaticTimerReveal()` (sequences.js:715)
- **Audio Method**: Enhanced `playThemeWithSync()` with real MP3
- **Visual Sync**: Screen effects on musical beats and "drop"
- **User Experience**: Seamless transition from briefing → theme → timer → countdown

## Technical Approach
- Use existing audio architecture for reliability
- Maintain mobile-first approach with touch compatibility
- Preserve 1980s spy aesthetic with enhanced audio
- Ensure theme plays only when timer becomes visible (preserves narrative flow)

This plan maintains the existing cinematic pacing while adding the authentic Mission Impossible theme at the perfect dramatic moment when the countdown timer is revealed.