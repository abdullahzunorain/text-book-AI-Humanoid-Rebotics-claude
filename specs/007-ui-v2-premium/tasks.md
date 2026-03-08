# Tasks: Premium UI Upgrade (v2)

**Feature**: `007-ui-v2-premium` | **Branch**: `007-ui-v2-premium` | **Date**: 2026-03-08
**Input**: Design documents from `specs/007-ui-v2-premium/`
**Prerequisites**: `plan.md` ✅ | `spec.md` ✅ | `research.md` ✅ | `data-model.md` ✅ | `contracts/ui-contract.md` ✅ | `quickstart.md` ✅
**Tests**: Test-first workflow is required for this feature via story acceptance checklists plus build/typecheck/backend non-regression validation.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: User story label from spec (`[US1]` ... `[US11]`)
- Every task includes an exact file path

---

## Phase 1: Setup (CSS Organization + Token Scaffolding)

**Purpose**: Establish token/layer structure and QA scaffolding used by all stories.

- [X] T001 Create premium UI QA matrix skeleton in `specs/007-ui-v2-premium/checklists/requirements.md`
- [X] T002 [P] Add semantic token groups (color, spacing, radius, shadow, z-index) to `website/src/css/custom.css`
- [X] T003 [P] Add motion token groups (`--ui-motion-fast`, `--ui-motion-base`, `--ui-motion-slow`, easing vars) to `website/src/css/custom.css`
- [X] T004 [P] Add homepage section style placeholders for hero/features/workflow/stats in `website/src/pages/index.module.css`
- [X] T005 [P] Add component style placeholders for chat surfaces in `website/src/components/chatbot.css`
- [X] T006 [P] Add component style placeholders for auth modal surfaces in `website/src/css/auth-modal.css`

**Checkpoint**: CSS architecture exists and all story work can attach to a stable token/layer foundation.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Global constraints and cross-cutting primitives required before user stories.

**⚠️ CRITICAL**: No user story implementation starts before this phase is complete.

- [X] T007 Add global reduced-motion policy and animation fallbacks in `website/src/css/custom.css`
- [X] T008 [P] Add global interaction utilities (focus ring, link underline animation, button transition baseline) in `website/src/css/custom.css`
- [X] T009 [P] Add global smooth-scroll and section reveal utility classes in `website/src/css/custom.css`
- [X] T010 [P] Add shared dark-mode token overrides (`[data-theme='dark']`) in `website/src/css/custom.css`
- [X] T011 [P] Add shared RTL logical-property foundation rules in `website/src/css/urdu-rtl.css`
- [X] T012 Add file-level style hook classes for navbar/auth wrapper in `website/src/theme/Navbar/Content/index.tsx`

**Checkpoint**: Foundation complete; all user stories can proceed without redefining global behavior.

---

## Phase 3: User Story 1 - First Impression Excellence (Priority: P1) 🎯 MVP

**Goal**: Deliver premium hero experience with mesh overlay, floating orb, shimmer badge, and CTA hierarchy.

**Independent Test**: Open homepage in desktop + 375px mobile and verify hero animation stack, typography clamp, and dual CTA hierarchy load within 3 seconds.

### Tests for User Story 1 (write first, fail first)

- [X] T013 [P] [US1] Add failing acceptance checklist for hero visuals and motion in `specs/007-ui-v2-premium/checklists/us1-first-impression.md`

### Implementation for User Story 1

- [X] T014 [US1] Refactor hero semantic structure and CTA markup in `website/src/pages/index.tsx`
- [X] T015 [US1] Implement hero mesh overlay, glow orb keyframes, and shimmer badge styles in `website/src/pages/index.module.css`
- [X] T016 [US1] Implement responsive hero typography (`clamp(2.2rem, 5vw, 3.5rem)`) and spacing scale in `website/src/pages/index.module.css`
- [X] T017 [US1] Implement primary CTA and ghost GitHub CTA visual hierarchy in `website/src/pages/index.module.css`
- [X] T018 [US1] Apply reduced-motion safe variants for hero animations in `website/src/pages/index.module.css`

**Checkpoint**: US1 independently satisfies FR-001 to FR-005 and FR-003 CTA contract.

---

## Phase 4: User Story 2 - Clear Value Communication (Priority: P1)

**Goal**: Render six-card feature showcase with premium card styling and responsive grid behavior.

**Independent Test**: Verify six cards render in 3x2 desktop grid and 1-column mobile stack with gradient top borders.

### Tests for User Story 2 (write first, fail first)

- [X] T019 [P] [US2] Add failing acceptance checklist for feature grid and six-card content in `specs/007-ui-v2-premium/checklists/us2-value-communication.md`

### Implementation for User Story 2

- [X] T020 [US2] Expand feature data model to exactly six cards including Urdu/Personalized/Highlight entries in `website/src/pages/index.tsx`
- [X] T021 [US2] Implement section heading accent and card container structure in `website/src/pages/index.module.css`
- [X] T022 [US2] Implement 2px indigo-violet gradient top border treatment for cards in `website/src/pages/index.module.css`
- [X] T023 [US2] Implement desktop 3x2 and mobile 1-column feature grid breakpoints in `website/src/pages/index.module.css`

**Checkpoint**: US2 independently satisfies FR-006 to FR-010.

---

## Phase 5: User Story 9 - Enhanced Dark Mode (Priority: P1)

**Goal**: Ensure premium dark-mode parity with glows, hero stars pattern, and code-block treatment.

**Independent Test**: Toggle dark mode and verify hero pattern, card glows, and code blocks update consistently across homepage/docs/chat/auth.

### Tests for User Story 9 (write first, fail first)

- [X] T024 [P] [US9] Add failing dark-mode acceptance checklist across homepage/docs/chat/auth in `specs/007-ui-v2-premium/checklists/us9-dark-mode.md`

### Implementation for User Story 9

- [X] T025 [US9] Implement dark-mode hero star/dot radial background and overlay adjustments in `website/src/pages/index.module.css`
- [X] T026 [US9] Implement dark-mode card glow tokens and shared shadow styles in `website/src/css/custom.css`
- [X] T027 [US9] Implement dark-mode code-block background and indigo border refinements in `website/src/css/custom.css`
- [X] T028 [US9] Apply dark-mode parity fixes for chat/auth component surfaces in `website/src/components/chatbot.css`

**Checkpoint**: US9 independently satisfies FR-040 to FR-043.

---

## Phase 6: User Story 10 - Mobile-First Responsive Design (Priority: P1)

**Goal**: Ensure full premium experience at >=375px with readable text, smooth animations, and touch-compliant controls.

**Independent Test**: Run 375px viewport QA for homepage/docs/chat/auth with touch targets >=44x44 and no unreadable text.

### Tests for User Story 10 (write first, fail first)

- [X] T029 [P] [US10] Add failing mobile-first acceptance checklist for 375px viewport in `specs/007-ui-v2-premium/checklists/us10-mobile-first.md`

### Implementation for User Story 10

- [X] T030 [US10] Add mobile typography/spacing breakpoints for homepage sections in `website/src/pages/index.module.css`
- [X] T031 [US10] Enforce mobile touch-target sizing rules for nav/buttons/controls in `website/src/css/custom.css`
- [X] T032 [US10] Optimize chat panel sizing and control spacing for 375px viewport in `website/src/components/chatbot.css`
- [X] T033 [US10] Optimize auth modal form spacing and button sizes for 375px viewport in `website/src/css/auth-modal.css`
- [X] T034 [US10] Add mobile table overflow/readability safeguards for docs content in `website/src/css/custom.css`

**Checkpoint**: US10 independently satisfies FR-044 to FR-047.

---

## Phase 7: User Story 11 - RTL Language Support (Priority: P1)

**Goal**: Preserve premium visuals and interactions in Urdu RTL with correct mirroring and alignment.

**Independent Test**: Switch to Urdu and verify mirrored hero/features/sidebar/chat alignment with no layout breaks.

### Tests for User Story 11 (write first, fail first)

- [X] T035 [P] [US11] Add failing RTL acceptance checklist for Urdu layout and interactions in `specs/007-ui-v2-premium/checklists/us11-rtl-support.md`

### Implementation for User Story 11

- [X] T036 [US11] Implement RTL mirroring rules with logical properties for global shells in `website/src/css/urdu-rtl.css`
- [X] T037 [US11] Implement RTL-safe hero/features/workflow alignment adjustments in `website/src/pages/index.module.css`
- [X] T038 [US11] Implement RTL sidebar anchoring and border-direction overrides in `website/src/css/custom.css`
- [X] T039 [US11] Implement RTL chat message alignment and spacing fixes in `website/src/components/chatbot.css`
- [X] T040 [US11] Add RTL-safe directional class hooks for chat/auth wrappers in `website/src/theme/Root.tsx`

**Checkpoint**: US11 independently satisfies FR-048 to FR-051.

---

## Phase 8: User Story 3 - Guided Learning Journey (Priority: P2)

**Goal**: Add polished three-step "How It Works" section with numbered circles, connectors, and reveal animation.

**Independent Test**: Verify 3-step flow with dashed connectors on desktop and stacked connector logic on mobile.

### Tests for User Story 3 (write first, fail first)

- [X] T041 [P] [US3] Add failing acceptance checklist for workflow section and reveal animation in `specs/007-ui-v2-premium/checklists/us3-guided-journey.md`

### Implementation for User Story 3

- [X] T042 [US3] Create typed workflow step data and section markup with exactly three steps in `website/src/pages/index.tsx`
- [X] T043 [US3] Implement numbered icon circles and dashed connector visuals in `website/src/pages/index.module.css`
- [X] T044 [US3] Implement scroll-triggered fade/reveal CSS animation behavior in `website/src/pages/index.module.css`
- [X] T045 [US3] Add mobile stacked workflow connector behavior in `website/src/pages/index.module.css`

**Checkpoint**: US3 independently satisfies FR-011 to FR-014.

---

## Phase 9: User Story 4 - Platform Credibility (Priority: P2)

**Goal**: Add premium metrics strip that communicates platform breadth and trust.

**Independent Test**: Verify three required metrics render with strong hierarchy and responsive stacking.

### Tests for User Story 4 (write first, fail first)

- [X] T046 [P] [US4] Add failing acceptance checklist for stats strip values and layout in `specs/007-ui-v2-premium/checklists/us4-platform-credibility.md`

### Implementation for User Story 4

- [X] T047 [US4] Create typed stats data with required values in `website/src/pages/index.tsx`
- [X] T048 [US4] Implement metrics strip layout and typographic hierarchy in `website/src/pages/index.module.css`
- [X] T049 [US4] Implement subtle gradient/tint background and responsive stack behavior in `website/src/pages/index.module.css`

**Checkpoint**: US4 independently satisfies FR-015 and FR-016.

---

## Phase 10: User Story 5 - Enhanced Reading Experience (Priority: P2)

**Goal**: Upgrade docs shell readability via sidebar states, heading accents, wider content, and premium tables.

**Independent Test**: Open any docs page and verify active sidebar marker, smooth category transitions, heading accents, table polish, and improved content width.

### Tests for User Story 5 (write first, fail first)

- [X] T050 [P] [US5] Add failing docs-shell acceptance checklist for sidebar/headings/tables/content width in `specs/007-ui-v2-premium/checklists/us5-reading-experience.md`

### Implementation for User Story 5

- [X] T051 [US5] Implement sidebar active-item 3px accent border + tint styles in `website/src/css/custom.css`
- [X] T052 [US5] Implement sidebar category max-height/opacity transition behavior in `website/src/css/custom.css`
- [X] T053 [US5] Implement h1/h2/h3 accent borders or gradient underlines in `website/src/css/custom.css`
- [X] T054 [US5] Implement docs content max-width readability rules in `website/src/css/custom.css`
- [X] T055 [US5] Implement premium table styling (alternating rows, rounded corners, indigo header) in `website/src/css/custom.css`

**Checkpoint**: US5 independently satisfies FR-020 to FR-025.

---

## Phase 11: User Story 6 - Interactive Chat Experience (Priority: P3)

**Goal**: Deliver polished chat UX with entrance animation, typing dots, AI accents, Gemini badge, and premium input depth.

**Independent Test**: Open chat, send a prompt, verify loading indicator and all visual states in light/dark + mobile.

### Tests for User Story 6 (write first, fail first)

- [X] T056 [P] [US6] Add failing chat UX acceptance checklist for open/loading/message/input states in `specs/007-ui-v2-premium/checklists/us6-chat-experience.md`

### Implementation for User Story 6

- [X] T057 [US6] Add panel state hooks for opening/open/closing classes and Gemini badge markup in `website/src/components/ChatbotWidget.tsx`
- [X] T058 [US6] Implement chat panel slide-up + fade motion and state styles in `website/src/components/chatbot.css`
- [X] T059 [US6] Implement three-dot typing indicator animation and AI bubble accent border in `website/src/components/chatbot.css`
- [X] T060 [US6] Implement premium chat input depth, padding, and focus styling in `website/src/components/chatbot.css`

**Checkpoint**: US6 independently satisfies FR-026 to FR-030.

---

## Phase 12: User Story 7 - Seamless Authentication (Priority: P3)

**Goal**: Deliver premium auth modal interactions without changing auth backend behavior.

**Independent Test**: Open auth modal, toggle password visibility, submit form, verify loading visual and OAuth placeholder styling.

### Tests for User Story 7 (write first, fail first)

- [X] T061 [P] [US7] Add failing auth modal acceptance checklist for animation/toggle/loading/oauth in `specs/007-ui-v2-premium/checklists/us7-auth-flow.md`

### Implementation for User Story 7

- [X] T062 [US7] Add password visibility toggle state and button markup in `website/src/components/AuthModal.tsx`
- [X] T063 [US7] Add structured OAuth placeholder button markup in `website/src/components/AuthModal.tsx`
- [X] T064 [US7] Implement modal fade+scale entrance/exit and field layout polish in `website/src/css/auth-modal.css`
- [X] T065 [US7] Implement full-width gradient submit styles and spinner-like loading treatment in `website/src/css/auth-modal.css`

**Checkpoint**: US7 independently satisfies FR-031 to FR-035.

---

## Phase 13: User Story 8 - Smooth Micro-interactions (Priority: P3)

**Goal**: Ensure cohesive interaction language across scroll, links, buttons, and navbar state transitions.

**Independent Test**: Scroll and hover through homepage/docs and verify consistent 0.2s ease transitions + navbar shadow threshold behavior.

### Tests for User Story 8 (write first, fail first)

- [X] T066 [P] [US8] Add failing micro-interaction acceptance checklist for scroll/navbar/link/button behavior in `specs/007-ui-v2-premium/checklists/us8-microinteractions.md`

### Implementation for User Story 8

- [X] T067 [US8] Add navbar scroll-threshold class toggling logic in `website/src/theme/Navbar/Content/index.tsx`
- [X] T068 [US8] Implement navbar scrolled-state visual style tokens and utility classes in `website/src/css/custom.css`
- [X] T069 [US8] Normalize 0.2s ease button transition behavior globally in `website/src/css/custom.css`
- [X] T070 [US8] Implement center-out link underline hover animation globally in `website/src/css/custom.css`
- [X] T071 [US8] Add reduced-motion-safe fallback behavior for micro-interactions in `website/src/css/custom.css`

**Checkpoint**: US8 independently satisfies FR-036 to FR-039 and reinforces FR-056.

---

## Phase 14: Polish & Cross-Cutting Validation

**Purpose**: Final integration, regression safety, and release readiness.

- [X] T072 [P] Validate all user-story checklists and update pass/fail evidence in `specs/007-ui-v2-premium/checklists/requirements.md`
- [X] T073 [P] Verify footer gradient/social/tagline requirements and finalize global footer styles in `website/src/css/custom.css`
- [X] T074 [P] Run static type validation for frontend via `website/package.json` (`npm run typecheck`)
- [X] T075 [P] Run production build validation via `website/package.json` (`npm run build`)
- [X] T076 [P] Run backend non-regression suite and capture result notes in `backend/tests/`
- [X] T077 [P] Run quickstart validation matrix and record outcomes in `specs/007-ui-v2-premium/quickstart.md`
- [X] T078 Final pass: ensure no backend file edits and no dependency changes by checking `backend/` and `website/package.json`

**Checkpoint**: All FR/SC targets validated; feature ready for merge.

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 (Setup): no dependencies, starts immediately.
- Phase 2 (Foundational): depends on Phase 1 completion; blocks all user story phases.
- Phases 3-7 (P1 stories): depend on Phase 2; execute in P1 order for MVP-first delivery.
- Phases 8-10 (P2 stories): depend on completion of P1 stories.
- Phases 11-13 (P3 stories): depend on completion of P2 stories.
- Phase 14 (Polish): depends on all implemented stories.

### User Story Completion Graph

`US1 -> US2 -> US9 -> US10 -> US11 -> US3 -> US4 -> US5 -> US6 -> US7 -> US8`

### User Story Dependencies

- `US1`: Depends only on foundational phase.
- `US2`: Depends on foundational phase and can reuse US1 homepage structure.
- `US9`: Depends on foundational dark tokens and should follow US1/US2 visual primitives.
- `US10`: Depends on US1/US2/US9 styling to tune responsive behavior.
- `US11`: Depends on global RTL foundations and should follow mobile/dark updates.
- `US3`: Depends on homepage section system from US1/US2.
- `US4`: Depends on homepage section system from US1/US2.
- `US5`: Depends on global token/utilities and can proceed independently from homepage content.
- `US6`: Depends on global tokens/motion and chat file hooks.
- `US7`: Depends on global tokens/motion and auth modal component hooks.
- `US8`: Depends on foundational utilities and final component states from US5/US6/US7.

### Within Each User Story

- Story checklist task MUST be authored and run first (expected to fail initially).
- Markup/data tasks before CSS refinements when both are required.
- Reduced-motion and mode/RTL parity included before marking story complete.

---

## Parallel Execution Examples Per User Story

- **US1**: Run `T013` in parallel with `T015` because checklist and CSS file are independent.
- **US2**: Run `T019` in parallel with `T021` because checklist and style skeleton are independent.
- **US3**: Run `T041` in parallel with `T043` because checklist and connector styles are independent.
- **US4**: Run `T046` in parallel with `T048` because checklist and stat visual styles are independent.
- **US5**: Run `T050` in parallel with `T053` because checklist and heading style rules are independent.
- **US6**: Run `T056` in parallel with `T058` because checklist and chat motion styles are independent.
- **US7**: Run `T061` in parallel with `T064` because checklist and modal animations are independent.
- **US8**: Run `T066` in parallel with `T068` because checklist and navbar styling are independent.
- **US9**: Run `T024` in parallel with `T026` because checklist and global dark tokens are independent.
- **US10**: Run `T029` in parallel with `T032` because checklist and chat mobile rules are independent.
- **US11**: Run `T035` in parallel with `T039` because checklist and chat RTL rules are independent.

---

## Implementation Strategy

### MVP First (Recommended)

1. Complete Phase 1 (Setup).
2. Complete Phase 2 (Foundational).
3. Complete P1 stories in order: US1 -> US2 -> US9 -> US10 -> US11.
4. Validate with `T074`, `T075`, and P1 checklist evidence before expanding scope.

### Incremental Delivery

1. Release Increment A: US1 + US2 (homepage premium surface).
2. Release Increment B: US9 + US10 + US11 (cross-mode/device/language hardening).
3. Release Increment C: US3 + US4 + US5 (content communication + docs shell).
4. Release Increment D: US6 + US7 + US8 (interactive polish).
5. Final release: Phase 14 validation and regression checks.

### Parallel Team Strategy

1. One engineer handles homepage (`index.tsx`, `index.module.css`) for US1/US2/US3/US4.
2. One engineer handles global shell (`custom.css`, `urdu-rtl.css`, navbar wrappers) for US5/US8/US9/US10/US11.
3. One engineer handles interactive components (`ChatbotWidget.tsx`, `chatbot.css`, `AuthModal.tsx`, `auth-modal.css`) for US6/US7.

---

## Summary Metrics

- **Total tasks**: 78
- **Setup + Foundational tasks**: 12
- **User story tasks**: 59
- **Polish tasks**: 7
- **Parallelizable tasks (`[P]`)**: 26
- **Suggested MVP scope**: Phases 1-7 (through US11)

---

## Notes

- Keep all code changes under `website/` and feature docs under `specs/007-ui-v2-premium/`.
- Do not modify backend implementation files in `backend/`.
- Do not add npm dependencies.
- Keep checklists as the test-first artifact for TDD-style execution in this frontend-only scope.
