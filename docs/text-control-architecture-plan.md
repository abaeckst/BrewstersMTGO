# Systematic Text Control Architecture Plan

## Current Problem Analysis

The application suffers from a **"patchwork" font sizing system** with:
- **Mixed sizing approaches**: CSS variables vs hardcoded px values
- **Inconsistent hierarchies**: Text ranges from 13px to 68px with no logical progression
- **Cascade conflicts**: Mobile CSS overrides desktop unpredictably
- **Poor granular control**: Can't adjust one screen without affecting others

## Proposed Solution: Hierarchical CSS Variable System

### Phase 1: Create Screen-Specific CSS Variable Foundation

Implement a 3-tier variable system:

```css
:root {
  /* Base Typography Scale (Desktop) */
  --text-xs: 16px;      /* Hints, notes, small labels */
  --text-sm: 20px;      /* Standard content, briefing text */
  --text-base: 24px;    /* Default body text */
  --text-lg: 32px;      /* Subheadings, important text */
  --text-xl: 40px;      /* Headers, major UI elements */
  --text-2xl: 48px;     /* Screen titles, key prompts */
  --text-3xl: 56px;     /* Hero text, primary actions */
  
  /* Screen-Specific Modifiers */
  --mission-text-multiplier: 1.0;
  --auth-text-multiplier: 1.0;
  --briefing-text-multiplier: 1.0;
  --boot-text-multiplier: 1.0;
}

@media (max-width: 768px) {
  :root {
    /* Mobile scaling with consistent hierarchy */
    --text-xs: 18px;
    --text-sm: 22px;
    --text-base: 28px;
    --text-lg: 36px;
    --text-xl: 44px;
    --text-2xl: 52px;
    --text-3xl: 60px;
  }
}
```

### Phase 2: Implement Screen-Specific Control Classes

Create semantic classes for each screen context:

```css
/* Mission Screen Text Control */
.mission-text-xs { font-size: calc(var(--text-xs) * var(--mission-text-multiplier)); }
.mission-text-sm { font-size: calc(var(--text-sm) * var(--mission-text-multiplier)); }
.mission-text-base { font-size: calc(var(--text-base) * var(--mission-text-multiplier)); }
.mission-text-lg { font-size: calc(var(--text-lg) * var(--mission-text-multiplier)); }
.mission-text-xl { font-size: calc(var(--text-xl) * var(--mission-text-multiplier)); }
.mission-text-2xl { font-size: calc(var(--text-2xl) * var(--mission-text-multiplier)); }

/* Auth Screen Text Control */
.auth-text-xs { font-size: calc(var(--text-xs) * var(--auth-text-multiplier)); }
.auth-text-sm { font-size: calc(var(--text-sm) * var(--auth-text-multiplier)); }
/* etc... */

/* Briefing Screen Text Control */
.briefing-text-xs { font-size: calc(var(--text-xs) * var(--briefing-text-multiplier)); }
/* etc... */
```

### Phase 3: Convert All Existing Elements to New System

Systematically replace hardcoded font sizes:

**Mission Screen Elements:**
- `.priority-line` → `.mission-text-lg`
- `.option-text` → `.mission-text-xl`
- `.mission-button .button-text` → `.mission-text-lg`
- `.personal-message` → `.mission-text-xl`

**Auth Screen Elements:**
- `.header-text` → `.auth-text-2xl`
- `.clearance-warning` → `.auth-text-sm`
- `.input-hint` → `.auth-text-xs`

**Briefing Screen Elements:**
- `.briefing-line` → `.briefing-text-sm`
- `.ascii-header` → `.briefing-text-base`
- `.countdown-label` → `.briefing-text-lg`

### Phase 4: Implement Easy Adjustment Interface

Add utility multipliers for quick scaling:

```css
/* Quick scaling utilities */
.text-scale-tiny { --local-multiplier: 0.8; }
.text-scale-small { --local-multiplier: 0.9; }
.text-scale-normal { --local-multiplier: 1.0; }
.text-scale-large { --local-multiplier: 1.1; }
.text-scale-huge { --local-multiplier: 1.2; }
```

### Phase 5: Granular Control Implementation

Future text size adjustments become simple:

```css
/* Want mission screen text 10% larger? */
:root { --mission-text-multiplier: 1.1; }

/* Want only mission buttons bigger? */
.mission-button .button-text { font-size: calc(var(--text-xl) * 1.2); }

/* Want briefing text smaller on mobile only? */
@media (max-width: 768px) {
  :root { --briefing-text-multiplier: 0.9; }
}
```

## Benefits of This Approach

1. **Granular Control**: Adjust any screen or element independently
2. **Consistent Hierarchy**: Logical progression from xs to 3xl
3. **Responsive by Design**: Mobile scales proportionally maintain hierarchy
4. **Easy Maintenance**: Change one variable to affect entire screen
5. **Precise Adjustments**: You can say "make mission text 10% larger" and I can implement it exactly
6. **Future-Proof**: Easy to add new screens or text elements
7. **Clear Communication**: "Make .priority-line use mission-text-lg instead of mission-text-base"

## Implementation Steps

1. **Create new CSS variable foundation** (2-3 hours)
2. **Convert mission screen elements** (systematic replacement)
3. **Convert remaining screens** (auth, briefing, etc.)
4. **Remove old hardcoded font sizes** and conflicting mobile overrides
5. **Test and validate** all screens maintain readability
6. **Document new system** for future use

## Result

Perfect granular control where you can request specific text size adjustments and I can implement them precisely without creating inconsistencies or affecting unintended elements.

## Screen and Text Element Map

### Complete Screen List (11 screens)

1. **#loading-screen** - Initial loading
2. **#intro-screen** - Cinematic opening
3. **#auth-screen** - Authentication
4. **#boot-screen** - System boot
5. **#mission-screen** - Mission selection (most complex)
6. **#mission-declined-screen** - Mission declined
7. **#payout-processing-screen** - Payout processing
8. **#clearance-verification-screen** - Clearance verification
9. **#downloading-briefing-screen** - Briefing download
10. **#briefing-screen** - Mission briefing
11. **#credits-screen** - Credits

### Mission Screen Text Elements (Most Complex)

- `.detection-header` - "INCOMING TRANSMISSION"
- `.detection-status` - "SCANNING..."
- `.priority-line` - "> TRANSMISSION DECRYPTED", "> PRIORITY: EYES ONLY"
- `.personal-message` - Personal operative message
- `.option-text` - Mission options
- `.button-text` - "ACCEPT MISSION", "HONORABLE DISCHARGE"
- `.prompt-text` - "CHOOSE TO ACCEPT OR DECLINE THIS MISSION"
- `.touch-hint` - "TAP YOUR SELECTION"
- `.prompt-cursor` - Animated cursor

This systematic approach will solve the current font sizing chaos and provide precise control for future adjustments.