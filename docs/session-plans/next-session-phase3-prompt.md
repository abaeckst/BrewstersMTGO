# Next Session Startup Prompt - CSS Refactoring Phase 3

## Copy this prompt to start the next session:

```
I need to continue the CSS Architecture Refactoring project. We just completed Phases 1-2 successfully:

✅ Phase 1: CSS Variable Consolidation - Created comprehensive 50+ variable system, eliminated all hardcoded values
✅ Phase 2: Specificity Conflict Resolution - Eliminated ALL 53 !important declarations using CSS cascade layers

Now I need to execute Phase 3: Modular File Structure.

Please:
1. Read the session progress: /docs/session-plans/css-refactoring-session-progress.md
2. Check the current TODO list
3. Review the current css/main.css file (2,089 lines - needs to be split into modules)
4. Create a detailed Phase 3 implementation plan to split the monolithic CSS into maintainable modules

Goals for Phase 3:
- Split main.css into organized file structure (base/, components/, screens/, utilities/)
- Maintain CSS cascade layers architecture from Phase 2
- Reduce main.css from 2,089 lines to <500 lines (import orchestrator)
- Preserve all functionality and visual behavior
- Test each module split to ensure no regressions

Key constraints:
- Must preserve existing CSS cascade layer architecture
- Must maintain mobile-first responsive design
- Must preserve all sequential revelation systems
- Must keep cinematic spy-thriller visual experience intact

Ready to start Phase 3 implementation once you confirm the plan.
```

## Important Session Context

### Current File State
- **css/main.css**: 2,089 lines, fully refactored with variables and cascade layers
- **css/main-legacy.css**: Original backup file
- **Architecture**: CSS cascade layers implemented (@layer base, components, screens, stages, utilities, accessibility)

### Key Accomplishments This Session
- Eliminated 53 !important declarations completely
- Implemented comprehensive CSS variable system (50+ variables)
- Created modern cascade layer architecture
- Zero functionality regression

### Next Session Priority
Split the monolithic CSS file while preserving the clean architecture we've built.

### Testing Protocol
Test on mobile after each file split - this is the primary platform for the spy terminal experience.