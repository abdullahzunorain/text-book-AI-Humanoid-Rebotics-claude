# Tasks: Fix Auth Modal Popup Overflow

**Input**: Design documents from `/specs/008-fix-auth-modal-overflow/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: No automated tests requested. Validation is via CSS error check, production build, and visual QA per quickstart.md.

**Organization**: Tasks are grouped by user story. Both US1 and US2 are P1 and share the same CSS change, so they are combined into a single implementation phase with separate verification checkpoints.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Verify current state and confirm the bug before applying fixes

- [X] T001 Confirm auth modal clipping bug by inspecting current `.auth-modal-overlay` and `.auth-modal` rules in `website/src/css/auth-modal.css`
- [X] T002 Verify `.questionnaire-overlay` already has `max-height: 80vh; overflow-y: auto` in `website/src/css/auth-modal.css` (no changes needed)

---

## Phase 2: User Story 1 — Auth Modal Fully Visible on All Viewports (Priority: P1)

**Goal**: The auth modal appears fully within the viewport on all screen sizes — no content clipped at top or bottom.

**Independent Test**: Open site on 375×667 viewport, click Sign In, verify entire modal visible.

### Implementation for User Story 1

- [X] T003 [US1] Add `padding: 1rem` to `.auth-modal-overlay` in `website/src/css/auth-modal.css`
- [X] T004 [US1] Add `overflow-y: auto` to `.auth-modal-overlay` in `website/src/css/auth-modal.css`
- [X] T005 [US1] Add `max-height: calc(100vh - 2rem)` to `.auth-modal` in `website/src/css/auth-modal.css`
- [X] T006 [US1] Add `overflow-y: auto` to `.auth-modal` in `website/src/css/auth-modal.css`
- [X] T007 [US1] Add `margin: auto` to `.auth-modal` in `website/src/css/auth-modal.css`

**Checkpoint**: Auth modal now constrained to viewport height with scroll. Verify at 1920×1080 (centered, no scroll) and 375×667 (visible, scrollable).

---

## Phase 3: User Story 2 — Auth Modal Scrollable When Content Overflows (Priority: P1)

**Goal**: On very short viewports the modal scrolls internally so the submit button and OAuth section are reachable.

**Independent Test**: Resize browser to 320×480, open auth modal, scroll to submit button.

### Verification for User Story 2

- [X] T008 [US2] Verify internal scroll works at 320×480 viewport — all fields reachable including OAuth buttons in `website/src/css/auth-modal.css`
- [X] T009 [US2] Verify Sign Up tab (longer content) is fully scrollable at 320×480 viewport in `website/src/css/auth-modal.css`

**Checkpoint**: Both user stories satisfied. Modal visible + scrollable on all viewports.

---

## Phase 4: Polish & Cross-Cutting Validation

**Purpose**: Verify no regressions across the entire application

- [X] T010 [P] Run CSS validation (zero errors) on `website/src/css/auth-modal.css`
- [X] T011 [P] Verify entrance animation (`authModalEntrance` fade+scale) still plays correctly in `website/src/css/auth-modal.css`
- [X] T012 [P] Verify `.questionnaire-overlay` is unaffected — still has its own `max-height: 80vh; overflow-y: auto` in `website/src/css/auth-modal.css`
- [X] T013 Run production build validation via `npm run build` in `website/`
- [X] T014 [P] Run backend non-regression test suite via `python -m pytest tests/ -v` in `backend/`
- [X] T015 Verify zero backend file changes via `git diff --name-only HEAD` — no `backend/` files
- [X] T016 Run quickstart validation matrix and record outcomes in `specs/008-fix-auth-modal-overflow/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — confirm bug exists
- **US1 (Phase 2)**: Depends on Phase 1 — apply the CSS fix
- **US2 (Phase 3)**: Depends on Phase 2 — verify scroll behavior (no additional code changes needed)
- **Polish (Phase 4)**: Depends on Phase 2 — validate no regressions

### Within Phase 2

T003–T007 are all edits to the same file (`auth-modal.css`) across 2 selectors. They must be applied sequentially (same file), but logically they form two groups:
- T003 + T004: overlay changes
- T005 + T006 + T007: modal changes

### Parallel Opportunities

- T010, T011, T012, T014 can all run in parallel (different validation targets)
- T008 and T009 can run in parallel (different viewport sizes)

---

## Parallel Example: Phase 4 Validation

```bash
# All validation tasks can run in parallel:
Task T010: "CSS validation on auth-modal.css"
Task T011: "Verify entrance animation"
Task T012: "Verify questionnaire unaffected"
Task T014: "Backend test suite"
```

---

## Implementation Strategy

### MVP First (Single Change)

1. Complete Phase 1: Confirm bug (T001–T002)
2. Complete Phase 2: Apply 5 CSS properties (T003–T007)
3. **STOP and VALIDATE**: Test at 375×667 and 1920×1080
4. Complete Phase 3: Verify scroll at 320×480 (T008–T009)
5. Complete Phase 4: Full regression validation (T010–T016)
6. Deploy

### Incremental Delivery

This is a single-file, 5-property CSS fix. The entire implementation (T003–T007) can be done in one edit. Phases 3–4 are pure verification.

---

## Summary

| Metric | Value |
|--------|-------|
| Total tasks | 16 |
| Tasks per US1 | 5 (implementation) |
| Tasks per US2 | 2 (verification only — shares US1's code changes) |
| Setup tasks | 2 |
| Validation tasks | 7 |
| Parallel opportunities | 6 tasks across Phases 3–4 |
| Files modified | 1 (`website/src/css/auth-modal.css`) |
| Suggested MVP scope | Phase 1 + Phase 2 (T001–T007) |

## Notes

- All 5 CSS property changes (T003–T007) target a single file and can be applied in one edit
- US2 requires no additional code — it's automatically satisfied by the US1 fix
- Phase 4 validation tasks are important to confirm no regressions but don't involve code changes
- The fix has already been applied in the previous conversation turn; tasks T003–T007 document what was done
