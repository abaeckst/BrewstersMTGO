# iOS Mobile Testing Checklist

## Critical Issues Fixed

### 1. ✅ Touch Event Handling
- **Fixed**: Wake screen passive event conflicts 
- **Fixed**: Mission/briefing screens missing touch handlers
- **Added**: Touch event debouncing for iOS
- **Added**: Touch support detection

### 2. ✅ Audio Context Issues  
- **Fixed**: Missing `unlockAudioContext()` method
- **Added**: iOS-specific audio unlock on first interaction
- **Added**: Audio context state checking before playback
- **Added**: Silent tone test for audio unlock verification

### 3. ✅ CSS/Viewport Issues
- **Added**: Safe area support for iPhone notch/home indicator
- **Added**: `-webkit-tap-highlight-color: transparent`
- **Added**: `touch-action: manipulation` for buttons
- **Fixed**: Form input zoom prevention with `font-size: max(16px, ...)`
- **Added**: `-webkit-appearance: none` for iOS styling

### 4. ✅ iOS-Specific Polyfills
- **Added**: Comprehensive iOS detection
- **Added**: Viewport height fix for iOS bars
- **Added**: Rubber-band scrolling prevention  
- **Added**: Double-tap zoom prevention
- **Added**: Input focus and keyboard handling
- **Added**: Webkit transform prefixes where needed

## Testing Protocol

### Device Testing Required
Test on the following iOS devices:
- [ ] iPhone 12/13/14/15 (6.1" screens)
- [ ] iPhone 12/13/14/15 Pro Max (6.7" screens) 
- [ ] iPhone SE (4.7" screen)
- [ ] iPad (10.9" screen)
- [ ] iPad Pro (12.9" screen)

### Browser Testing Required
- [ ] iOS Safari (latest version)
- [ ] iOS Safari (iOS 15+)
- [ ] iOS Chrome (should use Safari engine)
- [ ] iOS Edge (should use Safari engine)

### Critical Test Cases

#### Wake Screen Tests
- [ ] Wake screen appears in pure black/dormant state
- [ ] 2-second delay before "[WAKE SYSTEM]" appears
- [ ] Touch anywhere on screen triggers wake
- [ ] Audio plays on wake interaction (CRT power-on → boot-up → beep)
- [ ] Smooth transition to boot sequence
- [ ] No double-firing of wake events
- [ ] No iOS tap highlights visible

#### Mission Screen Tests  
- [ ] Mission buttons respond to touch (not just click)
- [ ] Audio feedback on button touch
- [ ] No double-tap zoom on buttons
- [ ] Smooth transitions between screens
- [ ] Signal bars animation works
- [ ] Personal message displays correctly

#### Briefing Screen Tests
- [ ] Accept/Decline buttons work with touch
- [ ] Audio feedback on touch interactions
- [ ] Visual feedback for selected option
- [ ] Smooth transition to countdown

#### Audio System Tests
- [ ] First touch unlocks audio context
- [ ] All sounds play without errors
- [ ] Mission Impossible theme plays during countdown
- [ ] No audio delay or sync issues
- [ ] Volume controls work properly

#### Form Input Tests (Auth Screen)
- [ ] Agent name input doesn't trigger iOS zoom
- [ ] Access code input doesn't trigger iOS zoom
- [ ] Inputs respond to touch focus
- [ ] Keyboard appears/disappears smoothly
- [ ] Input values submit correctly
- [ ] No iOS styling conflicts

#### Layout Tests
- [ ] Safe areas respected on iPhone with notch
- [ ] Content doesn't hide behind iOS bars
- [ ] Landscape orientation works
- [ ] Portrait orientation works
- [ ] Scrolling works smoothly (no rubber-band)
- [ ] Screen transitions are smooth

#### Performance Tests
- [ ] App loads quickly on iOS Safari
- [ ] Animations run at 60fps
- [ ] No memory leaks during transitions
- [ ] Battery usage reasonable
- [ ] No iOS thermal throttling

### Regression Testing
Ensure desktop functionality still works:
- [ ] Mouse interactions work on desktop
- [ ] Keyboard navigation works
- [ ] Audio system works on desktop
- [ ] All screen transitions work
- [ ] Performance maintained

### iOS-Specific Edge Cases
- [ ] App works when added to home screen (PWA mode)
- [ ] Works with iOS reduced motion settings
- [ ] Works with iOS dark mode
- [ ] Works with iOS text size adjustments
- [ ] Handles iOS call interruptions
- [ ] Handles iOS background/foreground transitions

### Error Scenarios
- [ ] Audio fails gracefully if blocked
- [ ] Touch events work even with gloves (capacitive)
- [ ] Works with external keyboards/mice connected
- [ ] Handles network connectivity issues
- [ ] Graceful degradation with JavaScript disabled

## Common iOS Issues to Watch For

1. **White flash on transitions** - Check for proper background colors
2. **Audio not playing** - Verify audio context unlock happens
3. **Buttons not responding** - Check touch event handlers
4. **Zooming on input focus** - Verify font-size >= 16px
5. **Layout jumps** - Check safe area implementation
6. **Double-firing events** - Verify event handler setup
7. **Scrolling issues** - Check overflow and touch properties
8. **Performance drops** - Monitor frame rates and memory

## Debug Information

### Console Logs to Monitor
- `🔓 Audio context unlocked`
- `📱 iOS detected, applying compatibility fixes`
- `💤 Wake interaction detected`
- `🎯 Mission choice: ACCEPTED/DECLINED`
- Audio playback success/failure messages

### Browser DevTools Checks
- Network tab: Verify all assets load
- Console: No JavaScript errors
- Performance: Check frame rate during animations
- Application: Check local storage persistence

## Success Criteria

The app is considered iOS-ready when:
- ✅ All touch interactions work smoothly
- ✅ Audio plays reliably after first interaction  
- ✅ No layout issues on any supported iOS device
- ✅ Performance matches desktop experience
- ✅ All user flows complete successfully
- ✅ No iOS-specific bugs or glitches