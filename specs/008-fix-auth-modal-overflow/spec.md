# Feature Specification: Fix Auth Modal Popup Overflow

**Feature Branch**: `008-fix-auth-modal-overflow`  
**Created**: 2026-03-08  
**Status**: Draft  
**Input**: User description: "the authentication pop-up is on top half of its surface is not visible, pls have a look at this issue and solve this properly.... make sure dont change any backend"

## Problem Statement

The authentication modal (Sign In / Sign Up popup) is clipped at the top of the viewport. When the modal opens, the upper portion of the dialog — including the tab bar and close button — is not visible to the user. This occurs because the modal content (tabs + form fields + password toggle + submit button + OAuth placeholder buttons) exceeds the viewport height, and the centering flexbox pushes the overflow equally above and below the viewport with no scroll mechanism.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Auth Modal Fully Visible on All Viewports (Priority: P1)

A user clicks "Sign In" in the navbar. The authentication modal appears centered on screen with all content visible — tabs, form fields, submit button, and OAuth section — regardless of viewport height.

**Why this priority**: This is the core bug — users cannot see or interact with the top portion of the auth modal, blocking sign-in entirely on shorter viewports.

**Independent Test**: Open the site on a 375×667 viewport (iPhone SE), click Sign In, and verify the entire modal is visible and scrollable.

**Acceptance Scenarios**:

1. **Given** a viewport of 667px height or less, **When** the user clicks "Sign In", **Then** the entire auth modal is visible within the viewport with no content clipped at top or bottom
2. **Given** a viewport of 1080px height, **When** the user clicks "Sign In", **Then** the modal appears centered with all content visible without scrolling
3. **Given** the modal content exceeds viewport height, **When** the modal is open, **Then** the user can scroll within the modal to access all fields

---

### User Story 2 - Auth Modal Scrollable When Content Overflows (Priority: P1)

On small screens where the modal content is taller than the available viewport space, the modal becomes internally scrollable so the user can reach the submit button and OAuth section.

**Why this priority**: Without scroll, users on small devices cannot reach the submit button to complete sign-in.

**Independent Test**: Resize browser to 320×480, open the auth modal, and scroll through all form fields to the submit button.

**Acceptance Scenarios**:

1. **Given** a very short viewport (480px), **When** the auth modal is open, **Then** the modal displays a scrollbar and all content is reachable by scrolling
2. **Given** the Sign Up tab is active (which has longer validation text), **When** on a short viewport, **Then** the user can scroll to the "Create Account" button

---

### Edge Cases

- What happens when the viewport is extremely short (< 400px)? Modal should still be usable with scroll.
- What happens when the user resizes the browser while the modal is open? Modal should adapt without re-clipping.
- What happens on landscape mobile orientation? Modal should remain within bounds.

## Root Cause Analysis

The `.auth-modal-overlay` uses `display: flex; align-items: center; justify-content: center` with `position: fixed; inset: 0`. The `.auth-modal` has no `max-height` constraint and no `overflow-y: auto`. When modal content (tabs + email + password + toggle + error area + submit + divider + 2 OAuth buttons) exceeds the viewport height, the flex centering distributes the overflow equally above and below the viewport. The top overflow is invisible and unreachable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The auth modal overlay MUST allow overflow content to be accessible (via scrolling or height constraint)
- **FR-002**: The auth modal MUST have a maximum height that fits within the viewport with safe margins
- **FR-003**: The auth modal MUST scroll internally when its content exceeds the available height
- **FR-004**: The auth modal MUST remain visually centered when it fits within the viewport
- **FR-005**: The fix MUST be CSS-only — no changes to backend code, no changes to component logic, no new npm packages
- **FR-006**: The fix MUST not break the existing entrance animation (fade + scale)
- **FR-007**: The questionnaire overlay (`.questionnaire-overlay`) MUST NOT be negatively affected by the fix

### Constraints

- Zero backend file changes
- Zero new npm packages
- CSS-only fix in `website/src/css/auth-modal.css`
- No changes to `AuthModal.tsx` component logic

## Scope

### In Scope

- Fix `.auth-modal-overlay` to handle overflow
- Fix `.auth-modal` to constrain height and scroll
- Verify questionnaire overlay is unaffected

### Out of Scope

- Redesigning the auth modal layout
- Changing OAuth button behavior
- Modifying backend auth endpoints

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Auth modal is 100% visible on a 375×667px viewport (iPhone SE) — no content clipped at top or bottom
- **SC-002**: All form fields, submit button, and OAuth buttons are reachable on a 320×480px viewport via scrolling
- **SC-003**: Auth modal remains centered on a 1920×1080px viewport with no visual regression
- **SC-004**: Production build (`npm run build`) passes with zero errors after the fix
- **SC-005**: Zero backend files modified (verified by `git diff`)

## Assumptions

- The fix targets the auth modal only; the questionnaire overlay already has `max-height: 80vh; overflow-y: auto` and is not affected
- Standard safe margin of 1rem (16px) on each side is sufficient viewport padding
- The modal's entrance animation (`authModalEntrance`) continues to work with the added `max-height` and `overflow-y` properties
