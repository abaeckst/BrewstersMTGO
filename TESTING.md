# Testing Strategy Documentation

## Overview

This document outlines the comprehensive testing strategy for Brewster's MTGO Mission Terminal, covering unit tests, integration tests, end-to-end tests, and visual regression tests.

## Testing Architecture

### 1. Unit Tests (Jest)
**Location**: `tests/unit/`
**Coverage Target**: 80%+ line coverage, 70%+ branch coverage

#### Core Modules Tested:
- **State Management** (`state.test.js`): State transitions, validation, event handling
- **Audio Engine** (`audio-engine.test.js`): Sound loading, playback, mobile unlock, fallback generation
- **Cinematic Engine** (`cinematic.test.js`): Animations, screen transitions, sequential revelation
- **Mission Screen** (`mission-screen.test.js`): Signal detection, user interactions, mission choice handling

#### Test Utilities:
- **TestHelpers** (`tests/utils/test-helpers.js`): DOM manipulation, event simulation, mock factories
- **Mock Classes**: MockStateManager, MockAudioEngine, MockCinematicEngine, MockSanitizer

### 2. End-to-End Tests (Cypress)
**Location**: `cypress/e2e/`
**Purpose**: Full user journey validation

#### Test Suites:
- **User Journey** (`user-journey.cy.js`): Complete mission acceptance/decline flows
- **Cinematic Experience** (`cinematic-experience.cy.js`): Animation timing, sequential revelation, audio sync

#### Custom Commands:
- `waitForBootSequence()`: Boot sequence completion
- `completeAuthentication()`: Auth form submission
- `selectMission()`: Mission choice selection
- `waitForSignalLock()`: Signal bar animation completion
- `checkAccessibility()`: WCAG compliance verification

### 3. Visual Regression Tests (Playwright)
**Location**: `tests/visual/`
**Purpose**: UI consistency across browsers and devices

#### Test Coverage:
- **Screen States**: Boot, Auth, Mission, Briefing, Countdown, Credits, Declined
- **Responsive Design**: Mobile, Tablet, Desktop viewports
- **Interactive States**: Hover effects, focus states, form filling
- **Theme Consistency**: Dark terminal theme, phosphor green colors
- **Cross-Browser**: Chrome, Firefox, Safari, Mobile browsers

### 4. Performance Testing
- **Load Time**: <3 seconds initial load
- **Animation Performance**: 60fps target, smooth transitions
- **Memory Usage**: No memory leaks in long-running sessions
- **Lighthouse CI**: Performance, accessibility, best practices scoring

### 5. Security Testing
- **Input Validation**: XSS prevention, injection attacks
- **Dependency Scanning**: Vulnerability detection
- **Content Security**: CSP compliance
- **Data Sanitization**: Agent name and form input validation

## Running Tests

### Quick Start
```bash
# Install dependencies
npm ci

# Run all tests
npm run test:all

# Run specific test types
npm run test              # Unit tests only
npm run test:coverage     # Unit tests with coverage
npm run test:e2e         # End-to-end tests
npm run test:visual      # Visual regression tests
npm run test:security    # Security scans
```

### Test Runner Script
```bash
# Run comprehensive test suite
node test-runner.js

# Run specific test type
node test-runner.js unit
node test-runner.js e2e
node test-runner.js visual
```

### Development Workflow
```bash
# Watch mode for unit tests during development
npm run test:watch

# Open Cypress for interactive E2E testing
npm run test:e2e:open

# Generate and update visual baselines
npx playwright test --update-snapshots
```

## Test Environment Setup

### Prerequisites
- Node.js 18+ 
- NPM dependencies installed
- Local HTTP server for E2E/Visual tests

### Mock Configuration
- **Audio Context**: Mocked for consistent testing
- **Browser APIs**: ResizeObserver, IntersectionObserver mocked
- **LocalStorage**: Mocked with cleanup between tests
- **Performance API**: Mocked for timing tests

### CI/CD Integration
**GitHub Actions** (`.github/workflows/test.yml`):
- Runs on Ubuntu, Windows, macOS
- Node.js 18.x and 20.x matrix
- Parallel test execution
- Artifact collection for failures
- Coverage reporting to Codecov

## Quality Gates

### Coverage Thresholds
- **Lines**: 80% minimum
- **Functions**: 70% minimum
- **Branches**: 70% minimum
- **Statements**: 80% minimum

### Performance Benchmarks
- **Page Load**: <3000ms
- **Boot Sequence**: <20s total
- **State Transitions**: <5s each
- **Animation Smoothness**: No frame drops

### Accessibility Standards
- **WCAG 2.1 AA Compliance**
- **Keyboard Navigation**: Full interface accessible
- **Screen Reader**: Proper ARIA labels
- **Reduced Motion**: Respects user preferences

## Test Data Management

### Test Agents
- **Default**: "Test Agent" for standard flows
- **Special Cases**: Long names, special characters for edge case testing
- **Persistent**: Names stored in localStorage for session testing

### State Management
- **Clean Slate**: Each test starts with cleared storage
- **State Isolation**: Tests don't interfere with each other
- **Deterministic**: Consistent state transitions

## Debugging and Troubleshooting

### Common Issues
1. **Timing Issues**: Use `cy.wait()` or `page.waitForTimeout()` for animation completion
2. **Audio Failures**: Ensure audio mocking is properly configured
3. **Visual Differences**: Check for dynamic content (timestamps, random elements)
4. **Mobile Testing**: Verify viewport settings and touch interactions

### Debug Commands
```bash
# Cypress debug mode
npm run test:e2e:open

# Jest debug mode
npm test -- --detectOpenHandles --forceExit

# Playwright debug mode
npx playwright test --debug

# Lighthouse CI debug
npx lhci autorun --config=.lighthouserc.json
```

### Logging and Artifacts
- **Cypress**: Screenshots/videos on failure
- **Playwright**: Screenshots, videos, traces
- **Jest**: Coverage reports, test results
- **Console Logs**: Captured in CI for debugging

## Mobile Testing Strategy

### Viewports Tested
- **iPhone SE**: 375x667 (Small mobile)
- **iPhone 12**: 390x844 (Modern mobile)
- **iPad**: 768x1024 (Tablet)
- **Desktop**: 1280x720 (Standard desktop)

### Mobile-Specific Tests
- **Touch Interactions**: Tap accuracy, gesture support
- **Responsive Layout**: Text scaling, button sizing
- **Performance**: Load times on mobile connections
- **Audio Unlock**: iOS/Android audio context activation

## Continuous Improvement

### Metrics Tracking
- **Test Execution Time**: Monitor for performance degradation
- **Flaky Test Rate**: Target <5% flaky tests
- **Coverage Trends**: Maintain or improve coverage over time
- **Visual Regression**: Track UI consistency across releases

### Test Maintenance
- **Regular Updates**: Keep testing dependencies current
- **Baseline Refresh**: Update visual baselines when UI changes
- **Mock Updates**: Sync mocks with actual API changes
- **Performance Baselines**: Adjust thresholds based on performance improvements

## Future Enhancements

### Planned Additions
- **API Testing**: Once backend APIs are added
- **Load Testing**: Stress testing for high concurrent users
- **Accessibility Automation**: Extended a11y testing
- **Cross-Device Testing**: Real device testing via cloud services
- **Mutation Testing**: Code quality validation

### Integration Opportunities
- **Error Monitoring**: Sentry/Bugsnag integration
- **Performance Monitoring**: Real User Monitoring (RUM)
- **Analytics Testing**: Event tracking validation
- **Deployment Testing**: Production smoke tests

## Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Cypress Documentation](https://docs.cypress.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)

### Best Practices
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Visual Testing Guide](https://storybook.js.org/docs/react/writing-tests/visual-testing)

---

*Last Updated: 2025-07-05*
*Testing Strategy Version: 1.0*