# Tasks: Fix Duplicate Button Rendering

**Input**: Design documents from `/specs/016-fix-duplicate-buttons/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Not requested in spec. No test tasks generated.

**Organization**: Tasks grouped by user story. US1 and US2 are P1 (parallelizable across stories); US3 is P2.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: No project setup needed — this is a bug fix on an existing codebase. Branch `016-fix-duplicate-buttons` already exists.

- [x] T001 Verify TypeScript compilation passes before changes by running `npx tsc --noEmit` in `website/`

**Checkpoint**: Baseline confirmed clean — implementation can begin.

---

## Phase 2: Foundational

**Purpose**: No foundational tasks needed. All changes are isolated to individual component files with no shared infrastructure to build first.

**⚠️ NOTE**: Skipped — no blocking prerequisites for this bug fix.

---

## Phase 3: User Story 1 — Personalization shows exactly one "Show Original" button (Priority: P1) 🎯 MVP

**Goal**: Remove the duplicate "Show Original" button from `PersonalizedContent.tsx` so only the `PersonalizeButton` toggle remains.

**Independent Test**: Sign in → Navigate to any chapter → Click "Personalize This Chapter" → Verify exactly 1 "Show Original" button visible.

### Implementation for User Story 1

- [x] T002 [P] [US1] Remove the inline "Show Original" `<button>` element from the banner div in `website/src/components/PersonalizedContent.tsx` (line 97-101), keeping the "🎯 Personalized for your learning profile" `<span>` indicator
- [x] T003 [P] [US1] Remove `onShowOriginal` prop from `PersonalizedContentProps` interface and component destructuring in `website/src/components/PersonalizedContent.tsx` (lines 10, 48)
- [x] T004 [US1] Remove `onShowOriginal={handleShowOriginal}` prop from the `<PersonalizedContent>` JSX in `website/src/theme/DocItem/Layout/index.tsx` (line 97)

**Checkpoint**: Personalized view shows exactly one "Show Original" button (the trigger button in `PersonalizeButton.tsx`). Toggle round-trip works: personalize → show original → re-personalize.

---

## Phase 4: User Story 2 — Translation shows exactly one "Read in English" button (Priority: P1)

**Goal**: Remove the duplicate "Read in English" button from `UrduContent.tsx` so only the `UrduTranslateButton` toggle remains.

**Independent Test**: Sign in → Navigate to any chapter → Click "اردو میں پڑھیں" → Verify exactly 1 "Read in English" button visible.

### Implementation for User Story 2

- [x] T005 [P] [US2] Remove the inline "Read in English" `<button>` element from `website/src/components/UrduContent.tsx` (lines 63-68)
- [x] T006 [P] [US2] Remove `onShowEnglish` prop from `UrduContentProps` interface and component destructuring in `website/src/components/UrduContent.tsx` (lines 10, 20)
- [x] T007 [US2] Remove `onShowEnglish={handleShowEnglish}` prop from the `<UrduContent>` JSX in `website/src/theme/DocItem/Layout/index.tsx` (line 92)

**Checkpoint**: Urdu translated view shows exactly one "Read in English" button (the trigger button in `UrduTranslateButton.tsx`). Toggle round-trip works: translate → read in English → re-translate.

---

## Phase 5: User Story 3 — Chatbot shows exactly one close (✕) button (Priority: P2)

**Goal**: Hide the floating toggle button when the chatbot panel is open, so only the panel header ✕ remains.

**Independent Test**: Navigate to any chapter → Click the 💬 chatbot button → Verify exactly 1 ✕ close button visible.

### Implementation for User Story 3

- [x] T008 [US3] Wrap the floating toggle `<button>` in `{!isOpen && ...}` conditional rendering in `website/src/components/ChatbotWidget.tsx` (lines 174-181) so it is hidden when the chatbot panel is open

**Checkpoint**: Chatbot panel shows exactly one ✕ close button (the panel header button). When closed, 💬 toggle reappears.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify no regressions across all three fixes

- [x] T009 Run TypeScript compilation check `npx tsc --noEmit` in `website/` to verify zero type errors after all changes
- [x] T010 Run backend regression tests `uv run pytest tests/ -q` in `backend/` to verify 143+ tests still pass
- [ ] T011 Run quickstart.md manual verification checklist from `specs/016-fix-duplicate-buttons/quickstart.md` — all 3 features + edge cases

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — verify baseline
- **Foundational (Phase 2)**: Skipped
- **User Story 1 (Phase 3)**: Depends on Phase 1 baseline check
- **User Story 2 (Phase 4)**: Depends on Phase 1 baseline check — **independent of US1**
- **User Story 3 (Phase 5)**: Depends on Phase 1 baseline check — **independent of US1 and US2**
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent — modifies `PersonalizedContent.tsx` + `LayoutWrapper` (PersonalizedContent prop only)
- **User Story 2 (P1)**: Independent — modifies `UrduContent.tsx` + `LayoutWrapper` (UrduContent prop only)
- **User Story 3 (P2)**: Independent — modifies `ChatbotWidget.tsx` only

### Within Each User Story

- Button removal (T002/T005/T008) and prop cleanup (T003/T006) can run in parallel [P] on same file
- LayoutWrapper prop removal (T004/T007) depends on the component interface change completing first

### Parallel Opportunities

- **US1 and US2** can run fully in parallel (different files, no shared state)
- **US3** can also run in parallel with US1/US2 (different file entirely)
- Within US1: T002 and T003 are [P] (same file, different sections)
- Within US2: T005 and T006 are [P] (same file, different sections)
- **Maximum parallelism**: All three user stories simultaneously, then T009-T011 sequentially

---

## Parallel Example: All User Stories

```bash
# All three stories can launch in parallel (different component files):
T002 + T003: PersonalizedContent.tsx button + prop removal
T005 + T006: UrduContent.tsx button + prop removal
T008: ChatbotWidget.tsx toggle hiding

# Then LayoutWrapper prop cleanup (both touch same file, run sequentially):
T004: Remove onShowOriginal prop from PersonalizedContent JSX
T007: Remove onShowEnglish prop from UrduContent JSX

# Then verification:
T009: tsc --noEmit
T010: pytest regression
T011: Manual quickstart checklist
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Verify baseline (T001)
2. Complete Phase 3: User Story 1 — Fix personalization duplicate (T002-T004)
3. **STOP and VALIDATE**: `npx tsc --noEmit` passes, personalization shows 1 button
4. Deploy/demo if ready — personalization fix is independently valuable

### Incremental Delivery

1. Baseline verified → T001
2. Fix personalization duplicate → T002-T004 → Validate (MVP!)
3. Fix translation duplicate → T005-T007 → Validate
4. Fix chatbot duplicate → T008 → Validate
5. Full regression check → T009-T011

### Parallel Strategy (fastest path)

1. T001 baseline check
2. T002+T003 ∥ T005+T006 ∥ T008 (all three stories in parallel)
3. T004 then T007 (LayoutWrapper prop cleanup, sequential on same file)
4. T009 → T010 → T011 (verification, sequential)

---

## Notes

- Total tasks: **11**
- Tasks per user story: US1=3, US2=3, US3=1, Setup=1, Polish=3
- Parallel opportunities: 3 stories fully parallel; 2 tasks within US1 parallel; 2 tasks within US2 parallel
- Independent test criteria: Each story has a count-the-buttons visual test
- Suggested MVP scope: User Story 1 only (personalization fix)
- All tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
