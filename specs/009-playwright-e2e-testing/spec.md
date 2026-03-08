# Feature Specification: Playwright E2E Testing & Mobile Auth Fix

**Feature Branch**: `009-playwright-e2e-testing`  
**Created**: 2026-03-08  
**Status**: Draft  
**Input**: User description: "Use Playwright MCP server skills to test the entire application end-to-end. Check Sign In/Sign Up popup which seems incorrect. Test everything with headless browser."

## Clarifications

### Session 2026-03-08

- Q: Should the spec require verifying the signed-in state (email + Sign Out) is visible and usable on mobile viewports < 996px? → A: Yes — add acceptance scenario for signed-in mobile visibility
- Q: Should the spec require keyboard accessibility for the auth modal (focus trap, Escape-to-close, focus-return)? → A: Yes — require full a11y: focus trap, Escape-to-close, and focus-return to Sign In button
- Q: Should the spec require a regression prevention mechanism against re-adding navbar__item to AuthButton? → A: Both — code comment in AuthButton.tsx warning not to use navbar__item, plus an automated E2E regression test checking button visibility at <996px
- Q: Should the spec require a user-facing error message when the backend is unreachable during sign-in? → A: Yes — require a generic error message for network/server errors during sign-in
- Q: Should the spec require verifying auth modal appearance in dark mode? → A: Yes — add scenario verifying modal renders with readable contrast in dark mode

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Mobile Sign In Button Visibility (Priority: P1)

As a mobile or tablet user visiting the textbook site, I need the Sign In button to be visible and accessible in the navbar so I can authenticate and access personalized features regardless of my device viewport size.

**Why this priority**: Without a visible Sign In button, mobile/tablet users (viewports < 996px) are completely locked out of authentication. This is a critical accessibility and functionality bug that blocks all authenticated features for a significant portion of users.

**Independent Test**: Navigate to the homepage at viewport widths below 996px (e.g., 375px, 768px) and visually confirm the Sign In button appears in the navbar and opens the auth modal when clicked.

**Acceptance Scenarios**:

1. **Given** a viewport width of 768px (tablet), **When** the homepage loads, **Then** the Sign In button is visible in the navbar (not hidden by CSS)
2. **Given** a viewport width of 375px (mobile phone), **When** the homepage loads, **Then** the Sign In button is visible and clickable in the navbar
3. **Given** a viewport width of 320px (small mobile), **When** the user taps Sign In, **Then** the auth modal opens with all form fields accessible
4. **Given** a viewport width of 1280px (desktop), **When** the homepage loads, **Then** the Sign In button remains visible (no regression)
5. **Given** a user is signed in, **When** the page loads on a mobile viewport (320px–768px), **Then** the navbar displays the user's email and a Sign Out button, **And** both elements remain visible and usable without layout overflow

---

### User Story 2 — Auth Modal Functionality (Priority: P1)

As a user clicking Sign In, I need the authentication modal to render correctly with working form controls so I can sign in or create an account.

**Why this priority**: The auth modal is the gateway to all authenticated features. Every control must function correctly.

**Independent Test**: Open the auth modal and verify layout (centering, visibility), then exercise each interactive element: tab switching, form inputs, password toggle, close button, overlay dismiss, and form validation.

**Acceptance Scenarios**:

1. **Given** the auth modal is open, **When** the user clicks the Sign Up tab, **Then** the form switches to show "Create Account" with a minimum 8-character password hint
2. **Given** the Sign In form is displayed, **When** the user types a password and clicks the show/hide toggle, **Then** the password is revealed/hidden and the button icon updates (eye/monkey)
3. **Given** the modal is open, **When** the user clicks the close button (×), **Then** the modal closes
4. **Given** the modal is open, **When** the user clicks the overlay outside the modal, **Then** the modal closes
5. **Given** the Sign In form has empty fields, **When** the user clicks Submit, **Then** HTML5 validation prevents submission and focuses the first empty required field
6. **Given** the user enters wrong credentials, **When** they submit the Sign In form, **Then** an "Invalid email or password" error message is displayed
7. **Given** the user clicks the Sign In button
   **When** the authentication modal opens
   **Then** the modal appears centered in the viewport
   **And** the modal header and close button are fully visible
   **And** the modal does not overlap or hide behind the navbar
8. **Given** the auth modal is open, **When** the user presses the Escape key, **Then** the modal closes
9. **Given** the auth modal is open, **When** the user presses Tab repeatedly, **Then** focus cycles only within the modal elements (focus trap)
10. **Given** the auth modal was opened from the navbar Sign In button, **When** the modal closes, **Then** keyboard focus returns to the Sign In button
11. **Given** the user submits valid-looking credentials, **When** the backend is unreachable or returns a server error (500/network timeout), **Then** a generic error message (e.g., "Something went wrong, please try again") is displayed in the modal
12. **Given** the site is in dark mode, **When** the user opens the auth modal, **Then** the modal renders with readable text contrast, visible input borders, and no white-on-white or invisible elements

---

### User Story 3 — Homepage Content Rendering (Priority: P2)

As a visitor landing on the homepage, I need all sections to render correctly so I can understand the textbook offering and navigate to content.

**Why this priority**: The homepage is the first impression. All sections must render for users to discover and navigate the textbook.

**Independent Test**: Load the homepage and verify all expected sections: Hero, Features (6 cards), How It Works (3 steps), Stats, and Footer are present and contain correct content.

**Acceptance Scenarios**:

1. **Given** a user navigates to the homepage, **When** the page loads, **Then** the Hero section shows "Interactive AI Textbook" badge, main heading, description, and CTA links (Start Reading, View on GitHub)
2. **Given** the homepage is loaded, **When** the user scrolls, **Then** 6 feature cards are visible (Structured Learning, AI Study Companion, Highlight & Ask, Urdu Translation, Personalized Learning, Interactive Content)
3. **Given** the homepage is loaded, **When** the user views the stats section, **Then** it shows "12+ Chapters", "6 Modules", and "AI-Powered Study Companion"

---

### User Story 4 — Docs Page Navigation & Features (Priority: P2)

As a reader navigating the textbook, I need the docs pages to render with working sidebar navigation, dark mode, breadcrumbs, and next/previous navigation so I can study effectively.

**Why this priority**: Core textbook reading experience must work end-to-end for the product to deliver value.

**Independent Test**: Navigate to a docs page and verify sidebar, breadcrumbs, content rendering, code blocks with copy buttons, dark mode toggle, and prev/next navigation all function correctly.

**Acceptance Scenarios**:

1. **Given** a user navigates to /docs/intro, **When** the page loads, **Then** the Introduction chapter renders with sidebar, breadcrumbs, and table of contents
2. **Given** a user is on a docs page, **When** they click the dark mode toggle, **Then** the theme switches between light and dark modes
3. **Given** a user is on Chapter 1, **When** they click "Next", **Then** they navigate to Chapter 2
4. **Given** a user is on the homepage, **When** they click "Start Reading", **Then** they navigate to /docs/intro

---

### User Story 5 — AI Chatbot Interaction (Priority: P3)

As a reader, I need the AI chatbot to open and display correctly so I can ask questions about the textbook content.

**Why this priority**: The chatbot is a key differentiator but requires authentication for full functionality.

**Independent Test**: Open the chatbot on a docs page and verify it renders with welcome message, input field, send button, and "Powered by Gemini" footer.

**Acceptance Scenarios**:

1. **Given** a user is on a docs page, **When** they click "Open chatbot", **Then** a dialog opens with a welcome message and input area
2. **Given** the chatbot is open, **When** the user clicks close, **Then** the chatbot dialog closes

---

### Edge Cases

- What happens when the viewport is extremely narrow (320px)? — Auth modal constrains to viewport width with overflow-y scroll
- What happens when a user accesses authenticated endpoints while not signed in? — 401 response, expected console error (not a bug)
- What happens when sign-in credentials are wrong? — Clear error message "Invalid email or password" displayed in the modal
- How does the navbar behave during scroll? — Scroll-threshold class toggling adds visual distinction
- What happens when the navbar height changes (scroll threshold active)? — Auth modal remains fully visible and centered without overlap
- What happens when the backend is unreachable during sign-in? — Generic error message displayed; no silent failure or unhandled exception

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sign In button MUST be visible and clickable in the navbar at ALL viewport widths (320px–1920px+)
- **FR-002**: Auth modal MUST open when the Sign In button is clicked at any viewport size
- **FR-003**: Auth modal MUST support tab switching between Sign In and Sign Up
- **FR-004**: Password field MUST have a working show/hide toggle
- **FR-005**: Auth modal MUST close via close button (×) and overlay click
- **FR-006**: Sign In form MUST validate required fields before submission
- **FR-007**: Invalid credentials MUST display a user-friendly error message
- **FR-008**: Homepage MUST render all sections: Hero, Features (6 cards), How It Works (3 steps), Stats, Footer
- **FR-009**: Docs pages MUST render with sidebar navigation, breadcrumbs, code blocks, and table of contents
- **FR-010**: Dark mode toggle MUST switch between light and dark themes
- **FR-011**: Next/Previous navigation MUST allow sequential chapter traversal
- **FR-012**: AI chatbot MUST open and close on docs pages with correct UI elements
- **FR-013**: The authentication modal MUST appear centered both horizontally and vertically within the viewport and MUST NOT overlap or be clipped by the navbar at any viewport width (320px–1920px+).
- **FR-014**: The auth modal MUST trap keyboard focus (Tab cycles within modal only), close on Escape key press, and return focus to the triggering Sign In button on close.
- **FR-015**: AuthButton.tsx MUST include a code comment warning against adding the `navbar__item` class, and an automated E2E regression test MUST verify Sign In button visibility at viewports < 996px.
- **FR-016**: When sign-in submission encounters a network error or server error (500, timeout, CORS), the auth modal MUST display a generic user-friendly error message instead of failing silently.
- **FR-017**: The auth modal MUST render with readable text contrast and visible input fields in both light and dark modes.

### Key Entities

- **AuthButton**: Navbar component rendering Sign In/Sign Out based on authentication state
- **AuthModal**: Modal dialog with Sign In/Sign Up tabs, email/password fields, password toggle, OAuth placeholder buttons
- **Navbar**: Top navigation bar with logo, hamburger menu (mobile), search, dark mode toggle, and auth button

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Sign In button is visible (computed display != none) at viewports 320px, 375px, 768px, 1024px, and 1280px
- **SC-002**: Auth modal opens and all form controls are interactive within 1 second of clicking Sign In
- **SC-003**: 100% of homepage sections render without layout breaks at desktop and mobile viewports
- **SC-004**: All docs page navigation features (sidebar, breadcrumbs, next/prev, dark mode) function correctly
- **SC-005**: Production build completes without errors after all code changes
- **SC-006**: All 112 backend tests continue to pass (zero regressions)
- **SC-007**: Auth modal appears fully visible and centered without overlapping the navbar at viewport widths 320px, 375px, 768px, 1024px, and 1280px.
- **SC-008**: An automated E2E test exists that fails if the Sign In button is hidden at viewport widths < 996px.

## Scope

### In Scope

- E2E testing of homepage, docs pages, auth modal, chatbot, and navigation using Playwright MCP
- Fixing the mobile Sign In button visibility bug (navbar__item class removal)
- Verifying the fix across multiple viewport sizes
- Regression prevention: code comment in AuthButton.tsx and an automated E2E regression test for mobile Sign In visibility

### Out of Scope

- Backend API testing (covered by existing pytest suite)
- OAuth integration testing (Google/GitHub buttons are disabled placeholders)
- Content accuracy verification (chapter text, translations)

## Assumptions

- The Docusaurus `@media (max-width: 996px) { .navbar__item { display: none } }` rule is a framework default that should NOT be overridden for standard navbar items — only our custom AuthButton needed the fix
- The `navbar__item` class was originally added to AuthButton for styling consistency, but the `.button` classes alone provide sufficient styling
- Console 401 errors on `/api/auth/me` when not signed in are expected behavior, not bugs
- The `.navbar__auth-button` wrapper's `display: flex !important` rule in custom.css remains necessary for correct layout

## Bug Found & Fixed

### 1. BUG: Sign In Button Hidden on Mobile/Tablet (< 996px viewport)

**Root Cause**: The `AuthButton` component used `className="navbar__item button button--primary button--sm"`. Docusaurus applies `@media (max-width: 996px) { .navbar__item { display: none } }` to hide standard navbar items behind the hamburger menu on mobile. Since our AuthButton is injected outside the standard navbar items (via a custom `Navbar/Content/index.tsx` wrapper), it was incorrectly hidden.

**Fix**: Removed the `navbar__item` class from all elements in `AuthButton.tsx`:
- Loading state `<span>` — removed `navbar__item` class
- Signed-in wrapper `<div>` — removed `navbar__item` class
- Sign In `<button>` — changed from `"navbar__item button button--primary button--sm"` to `"button button--primary button--sm"`

**Files Modified**:
- `website/src/components/AuthButton.tsx` — removed `navbar__item` class from 3 elements
- `website/src/css/custom.css` — cleaned up unnecessary CSS override attempt

**Verification**: Tested with Playwright MCP at 375px, 768px, and 1280px — button visible and functional at all sizes.

### 2. BUG: Auth Modal Positioned Too Close to Navbar

Observed during E2E testing: The authentication modal rendered at the top of the viewport and overlapped the navbar instead of appearing centered.

Impact:
- Modal header partially hidden
- Close button difficult to access
- Poor user experience

Expected Behavior:
- Modal appears centered vertically and horizontally
- Modal does not overlap navbar
- The authentication modal should follow standard modal UX behavior (centered overlay with background dimming).