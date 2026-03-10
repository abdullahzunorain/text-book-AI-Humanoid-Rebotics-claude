---
id: 021
title: Spec Chatbot Selection Q&A Fix
stage: spec
date: 2026-03-10
surface: agent
model: Claude Sonnet 4.6
feature: fix-chatbot-selection
branch: 013-fix-chatbot-selection
user: abdullahzunorain
command: speckit.specify
labels: ["chatbot","selection","roman-urdu","spec","bug-fix"]
links:
  spec: specs/013-fix-chatbot-selection/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/013-fix-chatbot-selection/spec.md
  - specs/013-fix-chatbot-selection/checklists/requirements.md
tests:
  - none run
---

## Prompt

pls read the above issues and try to resolve as mentioned in instructions:

The Chatbot must be able to answer user questions about the book's content, including answering questions based only on text selected by the user.

pls dont overwrite anything else, just focus on the above issue and try to achieve this feature properly... and dont change or remove anything else in the code nor in frontend nor in backend...

(Context from prior conversation: Two defects identified —
1. Selected text context is discarded after first message sent (setSelectedContext(null) called on send).
2. Asking chatbot "translate to Roman Urdu" without proper selection produces unsolicited full-chapter translation instead of scoped Roman Urdu transliteration.)

## Response snapshot

Created spec at specs/013-fix-chatbot-selection/spec.md on branch 013-fix-chatbot-selection.

Spec covers:
- 3 user stories (P1: selection-scoped Q&A, P2: Roman Urdu transliteration of selection, P1: no-regression for general flow)
- 10 functional requirements (FR-001 to FR-010)
- 5 measurable success criteria (SC-001 to SC-005)
- Edge cases, assumptions, explicit out-of-scope section
- Checklist at specs/013-fix-chatbot-selection/checklists/requirements.md — all items pass

All items in requirements checklist pass. No NEEDS CLARIFICATION markers remain.

## Outcome

- ✅ Impact: Spec created with clear, testable requirements for fixing selection-based chatbot Q&A
- 🧪 Tests: none run (spec phase)
- 📁 Files: spec.md + checklists/requirements.md created
- 🔁 Next prompts: `/speckit.plan` to produce architecture and implementation plan
- 🧠 Reflection: The two bugs are clearly scoped — context clearing (frontend-only fix) and Roman Urdu detection (backend prompt enhancement). Spec correctly separates them as P1 and P2.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): checklist all pass
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): run /speckit.plan on this spec
