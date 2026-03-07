# Tasks: Professional UI Redesign

**Feature**: `006-ui-redesign` | **Branch**: `006-ui-redesign` | **Date**: 2026-03-07
**Input**: Design documents from `specs/006-ui-redesign/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | quickstart.md ✅
**Tests**: No test tasks — spec.md does not request TDD. Acceptance validated by `npm run build` (SC-003) and `python -m pytest` (SC-002).

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: User story label — [US1], [US2], [US3], [US4]
- Exact file paths included in every task

---

## Phase 1: Setup

**Purpose**: Load Inter font via Docusaurus `stylesheets` config — required for all typography changes. Single file, no prerequisites.

- [X] T001 Add Inter font CDN stylesheet entry to `website/docusaurus.config.ts` (stylesheets array with href, type, crossorigin)

**Checkpoint**: `npm start` → Inter font loads in browser DevTools Network tab (`fonts.googleapis.com` request present)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Global CSS variable overrides that ALL user stories depend on. The indigo palette change propagates to every component that uses `var(--ifm-color-primary)`. Must be complete before any story CSS can be meaningfully tested.

**⚠️ CRITICAL**: Phase 3–6 visual work depends on this palette being in place.

- [X] T002 Replace Infima color variable block with full indigo palette (light + dark mode) in `website/src/css/custom.css`
- [X] T003 [P] Add navbar backdrop-blur rules (`.navbar` + dark-mode override, `--navbar-bg-rgb` variable) to `website/src/css/custom.css`
- [X] T004 [P] Add `.action-btn` utility class definition (base, hover, active, focus-visible, disabled states) to `website/src/css/custom.css`

**Checkpoint**: Reload any page — all primary-color elements (links, active sidebar items, buttons) show indigo. Navbar has glass blur effect. Foundation ready.

---

## Phase 3: User Story 1 — First Impression Landing Page (Priority: P1) 🎯 MVP

**Goal**: Homepage hero has gradient background with animated title and prominent CTA; feature cards have elevation, hover lift, and large icons. Visitor immediately perceives a professional AI/tech product.

**Independent Test**: Open `/` — hero must have visible gradient (not flat solid color), animated gradient headline text, pill CTA button, and feature cards with box-shadow + hover transform. Verify in both light and dark mode.

### Implementation for User Story 1

- [X] T005 [P] [US1] Add `.heroBanner` gradient background (3-stop dark indigo linear-gradient, min-height, flex centering) to `website/src/pages/index.module.css`
- [X] T006 [P] [US1] Add `.heroTitle` animated gradient text (`background-clip: text`, `@keyframes gradientShift`) to `website/src/pages/index.module.css`
- [X] T007 [P] [US1] Add `.heroSubtitle` (white/75% opacity, max-width, spacing) and `.heroCta` (pill gradient button) to `website/src/pages/index.module.css`
- [X] T008 [P] [US1] Add `.featureCard` elevation styles (border, border-radius 12px, box-shadow, hover lift with indigo shadow, transition) to `website/src/pages/index.module.css`
- [X] T009 [US1] Apply `styles.heroTitle`, `styles.heroSubtitle`, `styles.heroCta` classNames on heading/subtitle/CTA elements in `website/src/pages/index.tsx` (depends on T005–T007)
- [X] T010 [US1] Wrap each `<Feature>` item in `<div className={styles.featureCard}>` in `website/src/pages/index.tsx` (depends on T008)

**Checkpoint**: Homepage delivers a visually distinct, professional landing page independently. SC-001 satisfied.

---

## Phase 4: User Story 2 — Textbook Reading Experience (Priority: P1)

**Goal**: Documentation pages use Inter font, 16px base, 1.65 line-height, and comfortable prose width. Code blocks have language labels and styled containers. Dark mode typography clean.

**Independent Test**: Navigate to any doc chapter — prose must use Inter, comfortable line-height, clear h1/h2/h3 hierarchy. Code blocks must have a distinct background and language badge. Dark mode must not show invisible text.

### Implementation for User Story 2

- [X] T011 [P] [US2] Add typography variables (`--ifm-font-family-base: "Inter"`, `--ifm-font-size-base: 16px`, `--ifm-line-height-base: 1.65`) and `*:focus-visible` outline rule to `website/src/css/custom.css`
- [X] T012 [P] [US2] Add code block enhancement styles (`.theme-code-block`, language badge, border, refined box-shadow) to `website/src/css/custom.css`

**Checkpoint**: Open any doc chapter — body text uses Inter, comfortable spacing, code blocks look polished. Dark mode text all visible. SC-004 (partial) satisfied.

---

## Phase 5: User Story 3 — AI Chatbot Widget (Priority: P2)

**Goal**: Chatbot toggle button has gradient, panel has deeper shadow and rounded corners, header and user bubbles use gradient. Every visual element reinforces the indigo brand.

**Independent Test**: Click chatbot button — toggle must show indigo gradient (not flat color), panel opens with 16px border-radius and deep shadow, header shows gradient, user messages have gradient bubble, send button has gradient.

### Implementation for User Story 3

- [X] T013 [P] [US3] Update `.chatbot-panel` border-radius (12→16px) and deep box-shadow with indigo glow in `website/src/components/chatbot.css`
- [X] T014 [P] [US3] Add gradient overrides for `.chatbot-toggle`, `.chatbot-header`, `.chatbot-message-user .chatbot-message-content`, and `.chatbot-send` in `website/src/components/chatbot.css`

**Checkpoint**: Chatbot widget cohesively matches the indigo brand. All message bubble alignment and dark mode tested (SC-004 partial). US3 independently testable.

---

## Phase 6: User Story 4 — Auth Modal & Action Buttons (Priority: P2)

**Goal**: Auth modal has polished rounded inputs with indigo focus ring (no green artifacts), premium feel. Personalize and Translate buttons use the `.action-btn` utility class for consistent icon+label+hover style.

**Independent Test**: Click "Sign In" — modal inputs must focus with indigo ring (not green), modal corners are 12px rounded. On any doc page, Personalize and Translate buttons must have border, hover lift, and active fill state.

### Implementation for User Story 4

- [X] T015 [US4] Fix `.auth-modal` border-radius (8→12px), `.auth-field input` border-radius (4→8px), focus box-shadow to indigo `rgba(99,102,241,0.25)`, remove hardcoded green in `website/src/css/auth-modal.css`
- [X] T016 [P] [US4] Add `className="action-btn"` (or `"action-btn action-btn--active"` for active state) to the `<button>` element in `website/src/components/PersonalizeButton.tsx`
- [X] T017 [P] [US4] Add `className="action-btn"` to the `<button>` element in `website/src/components/UrduTranslateButton.tsx`

**Checkpoint**: Auth modal fully styled, no green artifacts. Personalize + Translate buttons match action-btn spec. US4 independently testable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validate all FRs, accessibility, RTL layout, and run the two acceptance gates.

- [X] T018 [P] Verify dark mode on homepage, doc pages, chatbot panel, and auth modal — no invisible text or broken contrast (`website/src/css/custom.css` dark palette fix if needed)
- [X] T019 [P] Verify RTL Urdu translation layout not broken by CSS changes — open a translated page and check right-to-left rendering (`website/src/css/custom.css`, `website/src/css/auth-modal.css`)
- [X] T020 Run `npm run build` in `website/` directory and confirm zero errors (SC-003)
- [X] T021 Run `python -m pytest tests/ -v` in `backend/` directory and confirm 112 tests pass (SC-002)
- [X] T022 Run quickstart.md visual verification checklist (all 5 sections: homepage, navbar, doc page, dark mode, auth modal/buttons)

**Checkpoint**: All 7 SCs met. Feature complete. Ready to merge.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)        → no deps, start immediately
Phase 2 (Foundational) → no deps, start immediately (parallel with Phase 1)
Phase 3 (US1)          → requires Phase 2 complete (indigo palette must be set)
Phase 4 (US2)          → requires Phase 2 complete (typography vars extend Phase 2 CSS)
Phase 5 (US3)          → requires Phase 2 complete (chatbot.css uses var(--ifm-color-primary))
Phase 6 (US4)          → requires Phase 4 complete (action-btn class defined in Phase 2; auth modal independent)
Phase 7 (Polish)       → requires all story phases complete
```

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 only — no dependency on US2, US3, US4
- **US2 (P1)**: Depends on Phase 2 only — no dependency on US1, US3, US4
- **US3 (P2)**: Depends on Phase 2 only — no dependency on US1, US2, US4
- **US4 (P2)**: Depends on Phase 2 (`.action-btn` class defined there) — no functional dependency on US1–US3

### Within Each Phase

- Phase 3 tasks T005–T008 [P]: Write all CSS module styles first (parallel)
- Phase 3 tasks T009–T010: Apply classNames in TSX after CSS exists (sequential, depends on T005–T008)
- Phase 5 tasks T013–T014 [P]: Both modify `chatbot.css` sequentially (mark as parallel in terms of agent scheduling, but same file — implement in one pass)
- Phase 6 tasks T016–T017 [P]: Different TSX files — truly parallel

---

## Parallel Execution Plan

### Phase 1 + 2 (Kickoff — parallel batch)

```bash
# Agent A: T001 — docusaurus.config.ts (Inter font)
# Agent B: T002, T003, T004 — custom.css (palette + navbar + action-btn)
```

### Phase 3 (US1 Landing Page — CSS first, then TSX)

```bash
# Step 1 (parallel): T005, T006, T007, T008 — all index.module.css additions
# Step 2 (sequential): T009, T010 — index.tsx className updates
```

### Phase 4 + 5 parallel (after Phase 2 complete)

```bash
# Agent A: T011, T012 — custom.css typography + code blocks (US2)
# Agent B: T013, T014 — chatbot.css panel + gradients (US3)
```

### Phase 6 (US4 — mostly parallel)

```bash
# Agent A: T015 — auth-modal.css
# Agent B: T016 — PersonalizeButton.tsx
# Agent C: T017 — UrduTranslateButton.tsx
```

---

## Implementation Strategy

### MVP Scope

**Minimum Viable Redesign** = Phase 1 + Phase 2 + Phase 3 (US1)

This alone delivers SC-001 (visually distinct homepage), SC-003 (build passes), and SC-004 (partial — homepage dark mode). Sufficient for a demo or stakeholder review.

### Incremental Delivery

| Increment | Phases | What you get |
|-----------|--------|-------------|
| MVP | 1 + 2 + 3 | Pro homepage, indigo palette site-wide, Inter font, navbar blur |
| Reading | + 4 | Typography polished, code blocks professional |
| AI Polish | + 5 | Chatbot widget fully branded |
| Full Feature | + 6 + 7 | Auth modal + action buttons + validation |

### Total Task Count: 22 tasks

| Phase | Tasks | Story |
|-------|-------|-------|
| Phase 1 Setup | 1 | — |
| Phase 2 Foundational | 3 | — |
| Phase 3 | 6 | US1 (P1) |
| Phase 4 | 2 | US2 (P1) |
| Phase 5 | 2 | US3 (P2) |
| Phase 6 | 3 | US4 (P2) |
| Phase 7 Polish | 5 | — |
| **Total** | **22** | |

### Parallel Opportunities: 12 tasks marked [P]

- T003, T004 (Phase 2 custom.css additions — same file, but different rule blocks)
- T005, T006, T007, T008 (Phase 3 index.module.css — all additive, no conflicts)
- T011, T012 (Phase 4 custom.css additions — same file, additive)
- T013, T014 (Phase 5 chatbot.css — same file, implement in one pass)
- T016, T017 (Phase 6 — different TSX files)
- T018, T019 (Phase 7 verification — independent checks)
