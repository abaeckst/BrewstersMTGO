# Investigation Session Template - Session #011 Standard

## Session Overview
**Date**: [Date]  
**Focus**: Systematic investigation and resolution of [specific problem]  
**Methodology**: Session #011 Standard - Patient investigation + comprehensive solutions  
**Philosophy**: Fix root causes, not symptoms

## Problem Statement

### Issue Description
**Problem**: [Describe the specific problem symptoms]  
**Status**: [Multiple failed attempts / Intermittent / Architectural]  
**Impact**: [User experience impact / Technical debt / etc.]

### Previous Attempts
- [ ] **Attempt 1**: [What was tried, why it failed]
- [ ] **Attempt 2**: [What was tried, why it failed]
- [ ] **Pattern**: [Common pattern in failures]

## Phase 1: Patient Investigation (MANDATORY - No Rushing to Solutions)

### Required Investigation Tasks
- [ ] **CSS Cascade Analysis**: Use browser dev tools to verify which styles are actually applied
- [ ] **Computed Style Verification**: Check `getComputedStyle()` output for affected elements
- [ ] **Architectural Mapping**: Document complete system interaction flows
- [ ] **File Structure Analysis**: Search through ALL relevant files using `grep` and `Glob` tools
- [ ] **Context Analysis**: Understand how current systems interact
- [ ] **Isolation Testing**: Create minimal test cases outside main application

### Investigation Methodology
1. **Deep Code Analysis**
   - Search through ALL relevant files for related patterns
   - Map file relationships and dependency chains
   - Identify missing components or architectural gaps
   - Check for version inconsistencies (V1 vs V2 code)

2. **Architecture Context Analysis**
   - Understand how current systems interact
   - Identify conflicts between architectural decisions
   - Check for timing dependencies and race conditions
   - Verify CSS cascade order and specificity conflicts

3. **Multi-Context Testing**
   - Test across different browsers and devices
   - Verify behavior in different viewport sizes
   - Test with different user interaction patterns
   - Check edge cases and error conditions

## Phase 2: Root Cause Identification

### Hypothesis Testing
- [ ] **Hypothesis 1**: [Theory about root cause]
  - **Test**: [How to verify]
  - **Result**: [Evidence for/against]
- [ ] **Hypothesis 2**: [Theory about root cause]
  - **Test**: [How to verify]
  - **Result**: [Evidence for/against]

### Root Cause Analysis
**Identified Root Cause**: [Document the actual underlying cause]  
**Supporting Evidence**: [List all evidence that confirms this diagnosis]  
**Related Issues**: [Any other problems that share this root cause]

## Phase 3: Comprehensive Solution Design

### Solution Architecture
**Approach**: [Root cause targeting / Multi-layer resolution / etc.]  
**Strategy**: [Preserve architecture / Minimal changes / etc.]

### Implementation Plan
- [ ] **Core Fix**: [Address the root cause directly]
- [ ] **Related Fixes**: [Fix all instances of the same pattern]
- [ ] **Defensive Measures**: [Prevent regression and similar issues]
- [ ] **Error Handling**: [Account for edge cases and failures]
- [ ] **Testing Strategy**: [How to verify the fix works]

### Files to Modify
- [ ] **File 1**: [path/to/file.ext] - [what changes]
- [ ] **File 2**: [path/to/file.ext] - [what changes]
- [ ] **File 3**: [path/to/file.ext] - [what changes]

## Phase 4: Implementation & Testing

### Implementation Checklist
- [ ] **Root Cause Fix**: Core problem addressed
- [ ] **All Instances**: Related issues also fixed
- [ ] **Architecture Preservation**: V2 patterns maintained
- [ ] **Error Handling**: Defensive coding included
- [ ] **Debug Instrumentation**: Logging for verification

### Testing Requirements
- [ ] **Incremental Testing**: Each fix tested individually
- [ ] **Regression Testing**: No existing functionality broken
- [ ] **Cross-Browser Testing**: Works across different browsers
- [ ] **Mobile Testing**: Responsive behavior verified
- [ ] **Edge Case Testing**: Error conditions handled
- [ ] **Performance Testing**: No negative performance impact

## Success Criteria

### Investigation Quality
- [ ] Root cause identified with supporting evidence
- [ ] All related instances of the problem addressed
- [ ] Solution preserves existing architectural patterns
- [ ] Implementation includes comprehensive error handling
- [ ] Changes documented with rationale and context

### Code Quality
- [ ] Clean, maintainable solution without hacky workarounds
- [ ] Zero regression in existing functionality
- [ ] Cross-browser and cross-device compatibility verified
- [ ] Performance impact assessed and optimized
- [ ] Security implications considered and addressed

### Documentation Quality
- [ ] Complete session plan and results documented
- [ ] Architecture decisions explained with context
- [ ] Prevention strategies documented for future reference
- [ ] Next session starter prompt provided
- [ ] Project status updated with specific accomplishments

## Session Results

### Problems Resolved
**Issue 1**: [Description]  
- **Root Cause**: [What was actually wrong]
- **Solution**: [How it was fixed]
- **Files Modified**: [List of changed files]

### Lessons Learned
- [Key insight 1]
- [Key insight 2]
- [Pattern to watch for in future]

### Prevention Strategies
- [How to prevent this type of issue in future]
- [Architectural improvements made]
- [Testing enhancements added]

## Next Session Starter Prompt

```
I want to plan our next session. Please:
1. Check the TODO list
2. Review the latest session plan results in /docs/session-plans/
3. Assess if we have any persistent issues requiring Session #011 methodology
4. Propose a focused session plan with clear objectives
5. Save the plan and update TODOs
Then I'll say 'go ahead' to start implementation.
```

---

**Note**: This template embodies the Session #011 Standard for systematic problem investigation and resolution. Use this methodology for any persistent issues that have failed multiple repair attempts.