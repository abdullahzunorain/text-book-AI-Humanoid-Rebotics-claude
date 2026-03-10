---
id: 022
title: Plan Chatbot Selection Fix Implementation
stage: plan
date: 2026-03-10
surface: agent
model: claude-opus-4-6
feature: fix-chatbot-selection
branch: 013-fix-chatbot-selection
user: zunorain
command: speckit.plan
labels: ["plan", "chatbot", "selection", "roman-urdu", "bug-fix"]
links:
  spec: specs/013-fix-chatbot-selection/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/013-fix-chatbot-selection/plan.md
  - specs/013-fix-chatbot-selection/research.md
  - specs/013-fix-chatbot-selection/data-model.md
  - specs/013-fix-chatbot-selection/quickstart.md
  - specs/013-fix-chatbot-selection/contracts/chat-api.md
  - specs/013-fix-chatbot-selection/contracts/frontend-state.md
tests:
  - none (planning phase — no code or tests modified)
---

## Prompt

Generate a detailed implementation plan for Spec 013

## Response snapshot

Executed full speckit.plan workflow for feature 013-fix-chatbot-selection:

**Phase 0 (Research)**: Created research.md with 6 research tasks resolving all technical unknowns:
1. Root cause confirmed: `setSelectedContext(null)` in sendMessage() — fix is removal of one line
2. UI indicator: existing banner at lines 226-241 of ChatbotWidget.tsx already sufficient
3. Roman Urdu detection: regex `r"roman\s*urdu|urdu\s*m(?:ein|en)\s*(?:likh|translate|bata)"` chosen over NLP
4. Transliteration prompt: direct tutor agent call with scoped instruction, skip RAG
5. Backend branching: single `if/elif/else` inside existing `generate_answer()` — no new function
6. No-selection handling: return static guidance message, no AI call

**Phase 1 (Design & Contracts)**: 
- data-model.md: No schema changes needed; documented existing ChatRequest/ChatResponse models and selectedContext state transitions
- contracts/chat-api.md: Documented 4 behavioral cases for POST /api/chat (normal, selection, Roman Urdu+selection, Roman Urdu without selection)
- contracts/frontend-state.md: Documented selectedContext lifecycle — must persist until user dismisses
- quickstart.md: Dev setup + 4 manual test scenarios
- plan.md: Filled with all sections — summary, technical context, constitution check (all 8 gates PASS), project structure, complexity tracking

**Constitution Check**: All 8 gates passed both pre-research and post-design. Feature directly fulfills Principle IV (Chatbot Omnipresence: "Selected-text queries MUST work seamlessly").

**Agent context**: Updated copilot agent context via update-agent-context.sh.

## Outcome

- ✅ Impact: Complete implementation plan with all Phase 0 + Phase 1 artifacts generated
- 🧪 Tests: No tests run (planning phase)
- 📁 Files: 6 files created (research.md, data-model.md, quickstart.md, chat-api.md, frontend-state.md) + 1 filled (plan.md) + agent context updated
- 🔁 Next prompts: Run `speckit.tasks` to generate task breakdown, then `speckit.implement`
- 🧠 Reflection: Minimal 2-file fix well-scoped; biggest risk is regex coverage for Roman Urdu variants

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Constitution check PASS (8/8 gates)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Run speckit.tasks to generate actionable task list
