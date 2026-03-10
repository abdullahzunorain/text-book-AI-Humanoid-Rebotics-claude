# Feature Specification: Fix Duplicate Button Rendering

**Feature Branch**: `016-fix-duplicate-buttons`  
**Created**: 2026-03-11  
**Status**: Draft  
**Input**: User description: "Fix duplicate button rendering (BUG-006/007/008) across personalization Show Original, translation Read in English, and chatbot Close — likely a shared component bug"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reader uses Personalization without UI confusion (Priority: P1)

A signed-in reader opens a chapter and clicks "🎯 Personalize This Chapter." Personalized content replaces the original. The reader sees exactly one way to return to the original text — not two competing "Show Original" buttons.

**Why this priority**: Personalization is a premium feature for signed-in users; duplicate buttons directly undermine trust and cause confusion about which control to use.

**Independent Test**: Sign in → Navigate to any chapter → Click "Personalize This Chapter" → Count the number of "Show Original" buttons visible on the page.

**Acceptance Scenarios**:

1. **Given** a signed-in user has personalized a chapter, **When** the personalized content is displayed, **Then** exactly one "Show Original" control is visible on the entire page.
2. **Given** a signed-in user sees the single "Show Original" control, **When** they click it, **Then** the original chapter content is restored and the "Personalize This Chapter" button reappears.

---

### User Story 2 - Reader uses Urdu translation without UI confusion (Priority: P1)

A signed-in reader clicks "اردو میں پڑھیں" to translate a chapter. The Urdu content replaces the English content. The reader sees exactly one way to switch back to English — not two competing "Read in English" buttons.

**Why this priority**: Same severity and identical root pattern as the personalization bug; fixing one without the other would be inconsistent.

**Independent Test**: Sign in → Navigate to any chapter → Click "اردو میں پڑھیں" → Count the number of "Read in English" buttons visible on the page.

**Acceptance Scenarios**:

1. **Given** a signed-in user has translated a chapter to Urdu, **When** the Urdu content is displayed, **Then** exactly one "Read in English" control is visible on the entire page.
2. **Given** a signed-in user sees the single "Read in English" control, **When** they click it, **Then** the original English chapter content is restored and the "اردو میں پڑھیں" button reappears.

---

### User Story 3 - Reader uses Chatbot without duplicate close buttons (Priority: P2)

A reader opens the chatbot panel via the floating action button. The chatbot panel is visible with exactly one close (✕) control — not two competing close buttons.

**Why this priority**: Lower than P1 because the chatbot close buttons are functionally identical (both close the panel), making the impact less severe than the personalization/translation duplicates. Still confusing UX.

**Independent Test**: Navigate to any chapter → Click the 💬 chatbot button → Count the number of "✕" close buttons visible.

**Acceptance Scenarios**:

1. **Given** the chatbot panel is open, **When** the user looks at the chatbot UI, **Then** exactly one close (✕) control is visible.
2. **Given** the chatbot panel is open, **When** the user clicks the single ✕ control, **Then** the chatbot panel closes and the 💬 toggle button returns to its default state.

---

### Edge Cases

- What happens when the user rapidly toggles between personalization and translation? Only the relevant go-back button for the active view should be visible; no stale buttons from a prior state.
- What happens on narrow viewports (mobile width)? The single go-back button must remain accessible and not overflow off-screen.
- What if the user activates personalization and then activates Urdu translation before the personalization response arrives? The UI must show the most recently requested view with one correct go-back button.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When personalized content is active, the page MUST display exactly one control to restore original content. Either the `PersonalizeButton` toggle or the `PersonalizedContent` inline button, but not both.
- **FR-002**: When Urdu translation is active, the page MUST display exactly one control to return to English. Either the `UrduTranslateButton` toggle or the `UrduContent` inline button, but not both.
- **FR-003**: When the chatbot panel is open, the UI MUST display exactly one close (✕) control. Either the floating toggle button or the panel header close button, but not both.
- **FR-004**: Clicking any go-back / close control MUST fully restore the prior state (original content, English content, or chatbot closed respectively) with no orphaned UI elements.
- **FR-005**: The fix MUST NOT change the visual position or styling of the remaining (single) button in each feature, preserving the current user experience aside from removing the duplicate.
- **FR-006**: All existing unit and integration tests MUST continue to pass after the fix.

### Key Entities

- **LayoutWrapper** (DocItem/Layout/index.tsx): Orchestrates the toggle buttons and content components; owns the active-state and callbacks for personalization and translation.
- **PersonalizeButton / PersonalizedContent**: Trigger component + content display for personalization. Both currently render a "Show Original" control.
- **UrduTranslateButton / UrduContent**: Trigger component + content display for Urdu translation. Both currently render a "Read in English" control.
- **ChatbotWidget**: Single component with a floating toggle (changes to ✕ when open) and a separate panel-header ✕ button.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On any chapter page, when personalized content is active, a visual inspection (manual or automated) counts exactly 1 "Show Original" control on the page.
- **SC-002**: On any chapter page, when Urdu translation is active, a visual inspection counts exactly 1 "Read in English" control on the page.
- **SC-003**: On any chapter page, when the chatbot panel is open, a visual inspection counts exactly 1 close (✕) control.
- **SC-004**: All existing tests (143+ backend tests, TypeScript compilation) pass with zero regressions.
- **SC-005**: Toggle round-trip works: activate → see one go-back button → click it → original state restored → re-activate → same single go-back button appears.

## Assumptions

- The chosen fix strategy is to remove the duplicate button from the content component (PersonalizedContent, UrduContent) and retain the toggle behavior in the trigger button (PersonalizeButton, UrduTranslateButton). This is the least disruptive approach because the trigger buttons are always visible and already change text on toggle. For the chatbot, the approach is to remove the floating toggle ✕ when the panel is open (keeping the header ✕) or vice versa — whichever provides clearer UX.
- The `PersonalizedContent` and `UrduContent` components' "go-back" buttons can be safely removed because the trigger button already handles the toggle-back action and sits in a prominent position above the content area.
- No new components or abstractions are needed; the fix is removal of redundant JSX in existing components.

## Scope

### In Scope

- Removing duplicate buttons across all three features (BUG-006, BUG-007, BUG-008)
- Verifying no regressions in existing functionality

### Out of Scope

- Improving the personalized content Markdown rendering (BUG-002/003 — separate issue)
- Fixing other bugs from the E2E bug report (BUG-001, 004, 005, 009, 010, 011)
- Adding new features or redesigning the toggle interaction pattern
- Refactoring components into a shared abstraction (unnecessary for 3 simple removals)

## Dependencies

- No external dependencies
- Depends on the current component structure in `website/src/components/` and `website/src/theme/DocItem/Layout/index.tsx`
