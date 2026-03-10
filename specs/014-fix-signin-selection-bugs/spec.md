# Feature Specification: Fix Signin Crash & Chatbot Selection Stale Closure

**Feature Branch**: `014-fix-signin-selection-bugs`  
**Created**: 2026-03-11  
**Status**: Draft  
**Input**: User description: "Fix signin 500 error when password_hash is NULL and fix stale closure in ChatbotWidget sendMessage that prevents selected text from being sent to backend"

---

## Overview

Two critical production bugs surfaced during manual testing:

1. **Signin 500 Internal Server Error**: When a user attempts to sign in, the backend crashes with `AttributeError: 'NoneType' object has no attribute 'encode'` because `user["password_hash"]` is `None`. This occurs when a user row exists in the database but has a NULL `password_hash` column (data corruption or incomplete record). The `verify_password()` function receives `None` and attempts to call `.encode()` on it.

2. **Selected text not sent to backend**: The chatbot's selection banner correctly displays the highlighted text, but when the user types a message and submits it, the `selected_text` field in the API request is always `null`. This is because `sendMessage` is wrapped in `useCallback(..., [])` with an empty dependency array, creating a stale closure that always reads the initial `selectedContext` value (`null`) instead of the current state.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Signin With Corrupted/Missing Password Hash (Priority: P1)

A user who has an account in the database (but whose `password_hash` is NULL due to data corruption or an incomplete migration) attempts to sign in. Instead of a 500 Internal Server Error, they receive a clear 401 "Invalid email or password" response.

**Why this priority**: A 500 error is a security concern (leaks stack traces) and a terrible user experience. Every failed signin attempt crashes the server process handler.

**Independent Test**: Attempt to sign in with an email that exists in the database but has a NULL `password_hash`. Expect a 401 response, not a 500.

**Acceptance Scenarios**:

1. **Given** a user exists with `password_hash = NULL`, **When** they submit valid credentials to `POST /api/auth/signin`, **Then** the server returns 401 with `{"detail": "Invalid email or password"}` — no 500, no stack trace.
2. **Given** a user exists with a valid `password_hash`, **When** they submit correct credentials, **Then** signin works as before (no regression).
3. **Given** a non-existent email, **When** they submit to `POST /api/auth/signin`, **Then** the server returns 401 as before (no regression).

---

### User Story 2 — Selected Text Sent to Backend on Manual Input (Priority: P1)

A user highlights text on a doc page, the selection banner appears in the chatbot, and when the user types a question (e.g., "translate into roman urdu") and presses Enter, the `selected_text` field in the API request must contain the highlighted text — not `null`.

**Why this priority**: This completely breaks the selected-text Q&A and Roman Urdu transliteration features implemented in feature 013. Users see the banner but the backend never receives the text.

**Independent Test**: Highlight a paragraph on any doc page, see the selection banner appear, type "translate into roman urdu" in the chatbot input, press Enter. The backend log should show `selected_text` is populated, and the response should be the Roman Urdu transliteration of the selected passage.

**Acceptance Scenarios**:

1. **Given** a user has highlighted text (banner shows in chatbot), **When** they type a message and press Enter (via the input form), **Then** the `POST /api/chat` request body contains `selected_text` with the highlighted text value.
2. **Given** a user has highlighted text, **When** they send multiple follow-up messages via typing, **Then** every request includes the same `selected_text` until dismissed.
3. **Given** no text is highlighted, **When** the user types a message and presses Enter, **Then** `selected_text` is `null` (no change from current behavior).
4. **Given** a user highlights text and then clicks the × dismiss button, **When** they send a message, **Then** `selected_text` is `null`.

---

### Edge Cases

- What if `password_hash` is an empty string instead of NULL? Should be treated as invalid (same as NULL).
- What if the user rapidly toggles the selection while messages are in-flight? The latest `selectedContext` state at time of send should be used.
- What if `selectedContext` changes between when the user starts typing and when they press Enter? The value at the moment of send (not when they started typing) should be used.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The signin endpoint MUST NOT crash when `password_hash` is `None` or empty — it MUST return 401.
- **FR-002**: The `sendMessage` callback MUST read the current value of `selectedContext` at the time of each invocation, not a stale closure value.
- **FR-003**: When `selectedContext` is set (banner visible), every chat request submitted via the input form MUST include the selected text in the `selected_text` field.
- **FR-004**: Existing signin flow for users with valid `password_hash` MUST remain unaffected.
- **FR-005**: Existing chatbot flows (selection via popup, general Q&A without selection) MUST remain unaffected.

### Key Entities

- **User record**: Row in `users` table with `id`, `email`, `password_hash` (nullable in practice).
- **selectedContext**: React state variable (`string | null`) in `ChatbotWidget` representing the currently highlighted text.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Signin with NULL `password_hash` returns 401 — verified by manual test and unit test.
- **SC-002**: Every chat message typed while selection banner is visible includes non-null `selected_text` in the request — verified by browser Network tab inspection.
- **SC-003**: Existing backend test suite (142 tests) passes with zero regressions.
- **SC-004**: Roman Urdu transliteration request with selected text returns scoped Latin-script Urdu — verified by manual test.

---

## Assumptions

- The `password_hash` being NULL is a pre-existing data issue; we do not need to fix the root cause of why it's NULL — just handle it gracefully.
- The `useCallback` dependency array fix is the correct React pattern; no architectural change needed.
- No database schema changes are required.
- No new dependencies are required.

---

## Out of Scope

- Investigating why `password_hash` becomes NULL in the first place (data migration audit).
- Adding database constraints to enforce NOT NULL on `password_hash`.
- Any changes to the signup flow, translation endpoints, personalization endpoints, or chat history.
- Any UI/CSS changes.
