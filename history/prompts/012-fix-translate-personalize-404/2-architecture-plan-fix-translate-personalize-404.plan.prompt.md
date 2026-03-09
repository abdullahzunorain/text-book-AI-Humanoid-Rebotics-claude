---
id: 2
title: Architecture Plan Fix Translate Personalize 404
stage: plan
date: 2026-03-09
surface: agent
model: claude-opus-4.6
feature: 012-fix-translate-personalize-404
branch: 012-fix-translate-personalize-404
user: abdullahzunorain
command: speckit.plan
labels: ["translate", "personalize", "404", "railway", "docs", "architecture"]
links:
  spec: specs/012-fix-translate-personalize-404/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/012-fix-translate-personalize-404/plan.md
  - specs/012-fix-translate-personalize-404/research.md
  - specs/012-fix-translate-personalize-404/data-model.md
  - specs/012-fix-translate-personalize-404/contracts/api-contracts.md
  - specs/012-fix-translate-personalize-404/quickstart.md
  - .github/agents/copilot-instructions.md
tests:
  - N/A (plan phase)
---

## Prompt

Architecture plan — how to get the 18 docs files into the Railway container

## Response snapshot

Created architecture plan with root cause analysis: Railway deploys only backend/ subdirectory, but translate and personalize resolve docs via parent.parent.parent/"website"/"docs" which doesn't exist in the container. Selected Approach A: copy website/docs/ into backend/docs/ (18 files, 192KB) and update path resolution with fallback. Constitution check: ALL PASS. Generated research.md, data-model.md, contracts/api-contracts.md, quickstart.md, plan.md.

## Outcome

- ✅ Impact: Clear fix path identified — 2 files modified, 18 files copied, 1 test added
- 🧪 Tests: N/A (plan phase)
- 📁 Files: plan.md, research.md, data-model.md, contracts/api-contracts.md, quickstart.md
- 🔁 Next prompts: /speckit.tasks to generate task breakdown
- 🧠 Reflection: Approach A (copy docs) is simplest — no Railway config changes, no CI changes, works identical locally and in production

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Constitution check ALL PASS (pre and post design)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
