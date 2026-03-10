---
id: 043
title: Fix Duplicate Buttons Plan
stage: plan
date: 2026-03-11
surface: agent
model: Claude Opus 4.6
feature: fix-duplicate-buttons
branch: 016-fix-duplicate-buttons
user: zunorain
command: /speckit.plan
labels: ["plan", "bug-fix", "duplicate-buttons", "frontend", "react"]
links:
  spec: specs/016-fix-duplicate-buttons/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/016-fix-duplicate-buttons/plan.md
  - specs/016-fix-duplicate-buttons/research.md
  - specs/016-fix-duplicate-buttons/data-model.md
  - specs/016-fix-duplicate-buttons/quickstart.md
tests:
  - null
---

## Prompt

Follow instructions in speckit.plan.prompt.md. plan ......

## Response snapshot

Executed the `/speckit.plan` workflow for feature 016-fix-duplicate-buttons:

1. **Setup**: Ran `setup-plan.sh --json` — obtained FEATURE_SPEC, IMPL_PLAN, SPECS_DIR, BRANCH paths. Template copied to `plan.md`.

2. **Technical Context**: Filled with TypeScript/React 19/Docusaurus 3.9.2 stack. Frontend-only change (~15 lines across 3 components). No storage, no new dependencies.

3. **Constitution Check**: All 8 gates PASSED (pre-Phase 0 and post-Phase 1). No violations — minimal JSX removal, no new abstractions.

4. **Phase 0 — Research** (`research.md`):
   - Decision 1: Keep `PersonalizeButton` toggle, remove inline "Show Original" from `PersonalizedContent`
   - Decision 2: Keep `UrduTranslateButton` toggle, remove inline "Read in English" from `UrduContent`
   - Decision 3: Hide floating chatbot toggle when panel open, keep panel header ✕
   - Decision 4: Remove unused `onShowOriginal`/`onShowEnglish` props from content components

5. **Phase 1 — Design**:
   - `data-model.md`: No entity changes; documented props to remove
   - `quickstart.md`: Verification steps for all 3 bug fixes + edge cases
   - Contracts: Skipped (purely internal UI, no external interfaces)

6. **Agent context**: Updated via `update-agent-context.sh copilot`.

## Outcome

- ✅ Impact: Complete implementation plan for 3-component bug fix with clear research decisions
- 🧪 Tests: No tests run during plan phase (regression gate defined in quickstart.md)
- 📁 Files: 4 artifacts created (plan.md, research.md, data-model.md, quickstart.md)
- 🔁 Next prompts: `/speckit.tasks` to generate task breakdown, then `/speckit.implement`
- 🧠 Reflection: Straightforward plan — all research decisions were clear from component analysis done during specify phase

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Constitution check PASS (pre and post design)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
