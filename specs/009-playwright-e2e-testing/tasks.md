# Tasks: Playwright E2E Testing & Mobile Auth Fix

**Input**: Design documents from `/specs/009-playwright-e2e-testing/`
**Prerequisites**: plan.md (loaded), spec.md (loaded), research.md (loaded), data-model.md (loaded), contracts/ (loaded)

**Tests**: E2E tests ARE the primary deliverable of this feature. Test tasks are included throughout.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Playwright Infrastructure)

**Purpose**: Install Playwright, configure test runner, establish E2E test infrastructure from scratch

- [x] T001 Install `@playwright/test` as devDependency and Chromium browser binary in `website/package.json`
- [x] T002 Create Playwright configuration file at `website/e2e/playwright.config.ts` with baseURL `http://localhost:3000/text-book-AI-Humanoid-Rebotics-CLAUDE/`, webServer (`npm run serve`), 3 viewport projects (mobile 375×812, tablet 768×1024, desktop 1280×720), testDir `./e2e`, and timeouts (30s test, 5s expect)
- [x] T003 [P] Add `test:e2e` script to `website/package.json` — `"test:e2e": "npx playwright test"`
- [x] T004 [P] Update `website/tsconfig.json` to include `e2e/` directory if not already covered

**Checkpoint**: `npx playwright test --list` runs without errors (no tests yet, but config is valid)

---

## Phase 2: Foundational (Component Modifications)

**Purpose**: Modify AuthModal.tsx and AuthButton.tsx with accessibility, error handling, and regression guard. These changes MUST be complete before E2E tests can validate the new behaviors.

**⚠️ CRITICAL**: All component modifications must land before user story E2E tests can pass

- [x] T005 Add ARIA attributes to auth modal container in `website/src/components/AuthModal.tsx` — add `role="dialog"`, `aria-modal="true"`, `aria-labelledby="auth-modal-title"`, and `id="auth-modal-title"` on the modal heading
- [x] T006 Implement Escape-to-close keyboard handler in `website/src/components/AuthModal.tsx` — add `useEffect` with `keydown` listener that calls `onClose()` when Escape is pressed while modal is open
- [x] T007 Implement focus trap in `website/src/components/AuthModal.tsx` — in the same `useEffect`, query all focusable elements (`button, input, [tabindex], a[href]`) inside modal, intercept Tab/Shift+Tab to cycle focus within those elements only
- [x] T008 Implement focus-return in `website/src/components/AuthModal.tsx` — accept `triggerRef?: React.RefObject<HTMLButtonElement>` prop, call `triggerRef.current?.focus()` in `onClose` handler and on Escape-close
- [x] T009 Add `signInButtonRef` in `website/src/components/AuthButton.tsx` — create `useRef<HTMLButtonElement>(null)`, attach to the Sign In `<button>` element via `ref={signInButtonRef}`, pass as `triggerRef` prop to `<AuthModal>`
- [x] T010 Add network/server error classification in `website/src/components/AuthModal.tsx` — modify `handleSubmit` catch block: if error is `TypeError` (fetch failure), show "Something went wrong. Please check your connection and try again."; if HTTP status >= 500, show "Something went wrong. Please try again later."; preserve existing 400/401 credential error messages
- [x] T011 [P] Add regression prevention code comment in `website/src/components/AuthButton.tsx` — above the Sign In button JSX, add: `{/* WARNING: Do NOT add 'navbar__item' class — Docusaurus hides it at <996px. See spec 009. */}`

**Checkpoint**: Production build (`npm run build`) succeeds. AuthModal opens with ARIA attributes, closes on Escape, traps focus, and returns focus to Sign In button. Network errors show user-friendly message.

---

## Phase 3: User Story 1 — Mobile Sign In Button Visibility (Priority: P1) 🎯 MVP

**Goal**: Verify the Sign In button is visible and functional at ALL viewport widths (320px–1280px+), including the signed-in state on mobile. This is the regression guard for the navbar__item bug fix.

**Independent Test**: Run `npx playwright test e2e/auth-button-mobile.spec.ts` — all viewport visibility assertions pass.

**Validates**: FR-001, FR-002, FR-015, SC-001, SC-008

### E2E Tests for User Story 1

- [x] T012 [US1] Create `website/e2e/auth-button-mobile.spec.ts` with test: Sign In button visible at 375px — navigate to homepage, assert button has `display` !== `none` and is visible (spec scenario 2)
- [x] T013 [P] [US1] Add test in `website/e2e/auth-button-mobile.spec.ts`: Sign In button visible at 768px — navigate to homepage, assert button visible (spec scenario 1)
- [x] T014 [P] [US1] Add test in `website/e2e/auth-button-mobile.spec.ts`: Sign In button visible at 320px — navigate to homepage, assert button visible and clickable (spec scenario 3)
- [x] T015 [P] [US1] Add test in `website/e2e/auth-button-mobile.spec.ts`: Sign In button visible at 1280px — navigate to homepage, assert button visible (spec scenario 4, desktop regression check)
- [x] T016 [US1] Add test in `website/e2e/auth-button-mobile.spec.ts`: Sign In button opens modal at 375px — click Sign In, assert auth modal appears with email/password fields (spec scenario 3 + FR-002)
- [x] T017 [US1] Add test in `website/e2e/auth-button-mobile.spec.ts`: Signed-in state visible at 375px — mock/set signed-in state, assert email text and Sign Out button are visible without layout overflow (spec scenario 5)

**Checkpoint**: `npx playwright test e2e/auth-button-mobile.spec.ts` — 6 tests pass. SC-001 and SC-008 verified.

---

## Phase 4: User Story 2 — Auth Modal Functionality & Accessibility (Priority: P1)

**Goal**: Verify auth modal renders correctly, all form controls work, keyboard a11y is functional (focus trap, Escape, focus-return), network errors show friendly messages, and dark mode renders correctly.

**Independent Test**: Run `npx playwright test e2e/auth-modal.spec.ts` — all modal interaction and a11y assertions pass.

**Validates**: FR-003 through FR-007, FR-013, FR-014, FR-016, FR-017, SC-002, SC-007

### E2E Tests for User Story 2

- [x] T018 [US2] Create `website/e2e/auth-modal.spec.ts` with test: Modal centering — click Sign In, assert modal is centered in viewport and does not overlap navbar (spec scenario 7, FR-013, SC-007)
- [x] T019 [P] [US2] Add test in `website/e2e/auth-modal.spec.ts`: Tab switching — click Sign Up tab, assert form shows "Create Account" heading and password requirement hint (spec scenario 1, FR-003)
- [x] T020 [P] [US2] Add test in `website/e2e/auth-modal.spec.ts`: Password toggle — type in password field, click show/hide toggle, assert field type changes between `password` and `text` (spec scenario 2, FR-004)
- [x] T021 [P] [US2] Add test in `website/e2e/auth-modal.spec.ts`: Close via × button — open modal, click close (×), assert modal is hidden (spec scenario 3, FR-005)
- [x] T022 [P] [US2] Add test in `website/e2e/auth-modal.spec.ts`: Close via overlay click — open modal, click overlay outside modal bounds, assert modal closes (spec scenario 4, FR-005)
- [x] T023 [US2] Add test in `website/e2e/auth-modal.spec.ts`: HTML5 validation — leave email/password empty, click submit, assert form is not submitted and required field is focused (spec scenario 5, FR-006)
- [x] T024 [US2] Add test in `website/e2e/auth-modal.spec.ts`: Escape to close — open modal, press Escape key, assert modal closes (spec scenario 8, FR-014)
- [x] T025 [US2] Add test in `website/e2e/auth-modal.spec.ts`: Focus trap — open modal, press Tab to cycle through all focusable elements, assert focus wraps to first element after last; press Shift+Tab on first, assert focus wraps to last (spec scenario 9, FR-014)
- [x] T026 [US2] Add test in `website/e2e/auth-modal.spec.ts`: Focus return — open modal via Sign In button, close modal, assert focus is on the Sign In button (spec scenario 10, FR-014)
- [x] T027 [US2] Add test in `website/e2e/auth-modal.spec.ts`: Dark mode contrast — toggle dark mode, open modal, assert modal container, input fields, and text elements are visible (not invisible/white-on-white) (spec scenario 12, FR-017)
- [x] T028 [US2] Add test in `website/e2e/auth-modal.spec.ts`: Invalid credentials error — submit wrong email/password, assert error message "Invalid email or password" appears (spec scenario 6, FR-007) — NOTE: requires backend running
- [x] T029 [US2] Add test in `website/e2e/auth-modal.spec.ts`: Network error message — intercept/block API requests via Playwright route, submit form, assert generic error "Something went wrong" appears (spec scenario 11, FR-016)

**Checkpoint**: `npx playwright test e2e/auth-modal.spec.ts` — 12 tests pass. SC-002, SC-007 verified. Modal a11y (FR-014), error handling (FR-016), dark mode (FR-017) all covered.

---

## Phase 5: User Story 3 — Homepage Content Rendering (Priority: P2)

**Goal**: Verify all homepage sections render correctly: Hero, Features (6 cards), Stats, and Footer.

**Independent Test**: Run `npx playwright test e2e/homepage.spec.ts` — all content assertions pass.

**Validates**: FR-008, SC-003

### E2E Tests for User Story 3

- [x] T030 [US3] Create `website/e2e/homepage.spec.ts` with test: Hero section — navigate to homepage, assert "Interactive AI Textbook" badge, main heading, description text, "Start Reading" link, and "View on GitHub" link are present (spec scenario 1, FR-008)
- [x] T031 [P] [US3] Add test in `website/e2e/homepage.spec.ts`: Feature cards — scroll to features section, assert 6 cards present with titles: "Structured Learning", "AI Study Companion", "Highlight & Ask", "Urdu Translation", "Personalized Learning", "Interactive Content" (spec scenario 2, FR-008)
- [x] T032 [P] [US3] Add test in `website/e2e/homepage.spec.ts`: Stats section — scroll to stats, assert "12+ Chapters", "6 Modules", "AI-Powered Study Companion" text present (spec scenario 3, FR-008)

**Checkpoint**: `npx playwright test e2e/homepage.spec.ts` — 3 tests pass. SC-003 verified.

---

## Phase 6: User Story 4 — Docs Navigation & Features (Priority: P2)

**Goal**: Verify docs pages render with sidebar, breadcrumbs, dark mode toggle, and next/previous navigation.

**Independent Test**: Run `npx playwright test e2e/docs-navigation.spec.ts` — all navigation assertions pass.

**Validates**: FR-009 through FR-011, SC-004

### E2E Tests for User Story 4

- [x] T033 [US4] Create `website/e2e/docs-navigation.spec.ts` with test: Intro page renders — navigate to `/docs/intro`, assert sidebar is present, breadcrumbs are visible, and table of contents renders (spec scenario 1, FR-009)
- [x] T034 [P] [US4] Add test in `website/e2e/docs-navigation.spec.ts`: Dark mode toggle — on docs page, click theme toggle button, assert `html[data-theme]` attribute changes between `light` and `dark` (spec scenario 2, FR-010) *(skipped on mobile/tablet <997px — toggle hidden in Docusaurus sidebar)*
- [x] T035 [P] [US4] Add test in `website/e2e/docs-navigation.spec.ts`: Next chapter navigation — navigate to a chapter page, click "Next" pagination link, assert URL changes to next chapter (spec scenario 3, FR-011)
- [x] T036 [US4] Add test in `website/e2e/docs-navigation.spec.ts`: Start Reading CTA — on homepage, click "Start Reading" link, assert navigation to `/docs/intro` (spec scenario 4)

**Checkpoint**: `npx playwright test e2e/docs-navigation.spec.ts` — 4 tests pass. SC-004 verified.

---

## Phase 7: User Story 5 — AI Chatbot Interaction (Priority: P3)

**Goal**: Verify the AI chatbot opens and closes correctly on docs pages.

**Independent Test**: Run `npx playwright test e2e/chatbot.spec.ts` — chatbot open/close assertions pass.

**Validates**: FR-012

### E2E Tests for User Story 5

- [x] T037 [US5] Create `website/e2e/chatbot.spec.ts` with test: Open chatbot — navigate to a docs page, click "Open chatbot" button, assert chatbot dialog opens with welcome message and input area (spec scenario 1, FR-012)
- [x] T038 [US5] Add test in `website/e2e/chatbot.spec.ts`: Close chatbot — open chatbot, click close button, assert chatbot dialog closes (spec scenario 2, FR-012)

**Checkpoint**: `npx playwright test e2e/chatbot.spec.ts` — 2 tests pass. FR-012 verified.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Full test suite validation, build verification, backend regression check

- [x] T039 Run full E2E test suite: `cd website && npx playwright test` — 79 passed, 2 skipped (dark mode toggle on mobile/tablet), 0 failed
- [x] T040 [P] Run production build verification: `cd website && npm run build` — build succeeds with zero errors (SC-005)
- [x] T041 [P] Run backend regression check: `cd backend && .venv/bin/python -m pytest tests/ -v` — all 112 tests pass (SC-006)
- [x] T042 Run `website/quickstart.md` validation — follow quickstart steps end-to-end, confirm setup, build, and test commands all work

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) → No dependencies — start immediately
Phase 2 (Foundational) → Depends on Phase 1 (Playwright installed)
Phase 3 (US1: Mobile Auth) → Depends on Phase 2 (component modifications done)
Phase 4 (US2: Modal a11y) → Depends on Phase 2 (component modifications done)
Phase 5 (US3: Homepage) → Depends on Phase 1 only (no component changes needed)
Phase 6 (US4: Docs Nav) → Depends on Phase 1 only (no component changes needed)
Phase 7 (US5: Chatbot) → Depends on Phase 1 only (no component changes needed)
Phase 8 (Polish) → Depends on ALL previous phases
```

### User Story Dependencies

- **US1 (Mobile Auth Button)**: Depends on Phase 2 — needs regression comment (T011) and existing navbar__item fix
- **US2 (Auth Modal)**: Depends on Phase 2 — needs ARIA (T005), Escape (T006), focus trap (T007), focus-return (T008/T009), network errors (T010)
- **US3 (Homepage)**: Independent of Phase 2 — tests existing content, no component changes
- **US4 (Docs Navigation)**: Independent of Phase 2 — tests existing navigation, no component changes
- **US5 (Chatbot)**: Independent of Phase 2 — tests existing chatbot, no component changes

### Within Each User Story

- First test creates the spec file with `test.describe` block
- Subsequent tests add `test()` blocks to the same file (marked [P] if independent)
- Tests that depend on modal being open follow tests that open the modal

### Parallel Opportunities

**After Phase 1 completes:**
- Phase 5 (US3), Phase 6 (US4), Phase 7 (US5) can ALL start immediately — they don't need component changes

**After Phase 2 completes:**
- Phase 3 (US1) and Phase 4 (US2) can start in parallel — different test files

**Within Phase 2:**
- T005 + T011 are parallel (different files: AuthModal vs AuthButton)
- T006, T007, T008 are sequential in AuthModal (same file, building on each other)
- T009 is parallel with T005-T008 (different file: AuthButton.tsx)
- T010 is parallel with T009, T011 (different concern in AuthModal)

**Within each User Story phase:**
- Tests marked [P] can be written in parallel (independent assertions in same file)

---

## Parallel Example: Phase 2 (Foundational)

```
# Sequential group A (AuthModal a11y — same file, building up):
T005 → T006 → T007 → T008

# Parallel group B (can run alongside group A):
T009 (AuthButton ref)
T010 (AuthModal error handling — different function)
T011 (AuthButton comment)
```

## Parallel Example: After Phase 1 + Phase 2

```
# These 3 user stories can execute simultaneously:
Thread 1: Phase 3 (US1) — T012..T017
Thread 2: Phase 5 (US3) — T030..T032
Thread 3: Phase 6 (US4) — T033..T036

# Phase 4 (US2) and Phase 7 (US5) can also run in parallel:
Thread 4: Phase 4 (US2) — T018..T029
Thread 5: Phase 7 (US5) — T037..T038
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational — component modifications (T005–T011)
3. Complete Phase 3: User Story 1 — mobile auth button tests (T012–T017)
4. **STOP and VALIDATE**: Run `npx playwright test e2e/auth-button-mobile.spec.ts`
5. SC-001 and SC-008 verified → Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Playwright infrastructure + component fixes ready
2. Add US1 (Mobile Auth) → Regression guard active → 6 tests pass
3. Add US2 (Modal a11y) → Full modal coverage → 12 tests pass
4. Add US3 (Homepage) → Homepage verified → 3 tests pass
5. Add US4 (Docs Nav) → Navigation verified → 4 tests pass
6. Add US5 (Chatbot) → Chatbot verified → 2 tests pass
7. Polish → Full suite (27 tests), build check, backend regression check

### Total Task Count

| Phase | Tasks | Parallel Opportunities |
|-------|-------|----------------------|
| Phase 1: Setup | 4 | T003, T004 parallel |
| Phase 2: Foundational | 7 | T009, T010, T011 parallel with T005-T008 |
| Phase 3: US1 (P1) | 6 | T013, T014, T015 parallel |
| Phase 4: US2 (P1) | 12 | T019, T020, T021, T022 parallel |
| Phase 5: US3 (P2) | 3 | T031, T032 parallel |
| Phase 6: US4 (P2) | 4 | T034, T035 parallel |
| Phase 7: US5 (P3) | 2 | — |
| Phase 8: Polish | 4 | T040, T041 parallel |
| **Total** | **42** | |

---

## Notes

- [P] tasks = different files or independent assertions, no dependencies on incomplete tasks
- [Story] label maps each task to its user story for traceability
- Each user story is independently completable and testable
- The navbar__item bug fix is ALREADY DONE — these tasks add the regression guard and tests
- Backend tests (112 passing) must remain green — run T041 after all changes
- Commit after each phase or logical task group
- Stop at any checkpoint to validate independently
