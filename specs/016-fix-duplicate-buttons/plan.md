# Implementation Plan: Fix Duplicate Button Rendering

**Branch**: `016-fix-duplicate-buttons` | **Date**: 2026-03-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/016-fix-duplicate-buttons/spec.md`

## Summary

Three UI features (personalization, Urdu translation, chatbot) each render duplicate go-back/close buttons — one in the trigger component and one in the content component. The fix removes the redundant button from each content component (`PersonalizedContent`, `UrduContent`) and hides the floating chatbot toggle when the panel is open, leaving exactly one control per feature.

## Technical Context

**Language/Version**: TypeScript (React 19, Docusaurus 3.9.2)
**Primary Dependencies**: React, Docusaurus, `@docusaurus/router`
**Storage**: N/A (frontend-only change)
**Testing**: TypeScript compilation (`tsc`), 143+ backend pytest tests (regression gate), manual visual verification
**Target Platform**: Web (all modern browsers, mobile-responsive)
**Project Type**: Web application (Docusaurus site + FastAPI backend)
**Performance Goals**: No performance impact — removing DOM elements only
**Constraints**: Must not alter existing button positions/styling; zero visual regression beyond duplicate removal
**Scale/Scope**: 3 component files modified, ~15 lines changed total

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. MVP-First | ✅ PASS | Bug fix directly supports demo quality |
| II. No Auth/Personalization/Translation | ✅ N/A | Not adding new features; fixing existing UI |
| III. Content Scope | ✅ N/A | No content changes |
| IV. Chatbot Omnipresence | ✅ PASS | Chatbot remains on every page; only duplicate close removed |
| V. Deployability & Demability | ✅ PASS | Fix improves demo quality by removing confusing duplicates |
| VI. No Over-Engineering | ✅ PASS | Minimal removal of JSX — no new abstractions, no refactoring |
| Tech Stack | ✅ PASS | React/TypeScript only; no new dependencies |
| Testing | ✅ PASS | TSC build + backend regression tests |

**Pre-Phase 0 gate: PASSED** — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/016-fix-duplicate-buttons/
├── plan.md              # This file
├── research.md          # Phase 0 — component analysis & decision rationale
├── data-model.md        # Phase 1 — N/A (no entity changes)
├── quickstart.md        # Phase 1 — verification instructions
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (files to modify)

```text
website/src/
├── components/
│   ├── PersonalizedContent.tsx   # MODIFY: remove inline "Show Original" button
│   ├── UrduContent.tsx           # MODIFY: remove inline "Read in English" button
│   └── ChatbotWidget.tsx         # MODIFY: hide floating toggle when panel is open
└── theme/
    └── DocItem/Layout/
        └── index.tsx             # VERIFY: no changes needed (passes callbacks correctly)
```

**Structure Decision**: This is a frontend-only bug fix. All changes are in `website/src/components/`. The orchestrating `LayoutWrapper` in `DocItem/Layout/index.tsx` does not need changes — it already passes the correct callbacks to the trigger buttons. The content components simply need their redundant buttons removed.

## Complexity Tracking

No constitution violations. Table intentionally left empty.
