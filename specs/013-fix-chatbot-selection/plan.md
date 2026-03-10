# Implementation Plan: Fix Chatbot Selection-Based Q&A & Roman Urdu

**Branch**: `013-fix-chatbot-selection` | **Date**: 2026-03-10 | **Spec**: `specs/013-fix-chatbot-selection/spec.md`
**Input**: Feature specification from `/specs/013-fix-chatbot-selection/spec.md`

## Summary

Fix two critical defects in the chatbot's selected-text feature: (1) selected text context is cleared after the first message due to `setSelectedContext(null)` in `sendMessage()`, breaking multi-turn follow-ups; (2) Roman Urdu transliteration requests produce full-chapter dumps instead of scoping to the selected passage. The fix involves a one-line frontend removal and a backend branching strategy in `generate_answer()` to detect Roman Urdu requests via regex, skip RAG retrieval, and send a direct transliteration prompt to the tutor agent.

## Technical Context

**Language/Version**: Python 3.13.2 (backend), TypeScript/React 19 (frontend)
**Primary Dependencies**: FastAPI 0.115.12, OpenAI Agents SDK, Docusaurus 3.9.2, asyncpg
**Storage**: Neon PostgreSQL (asyncpg, pool 2–10), Qdrant vector DB (3072-dim Gemini embeddings)
**Testing**: pytest (backend), Playwright (frontend E2E)
**Target Platform**: Railway (backend API), GitHub Pages (static frontend)
**Project Type**: Web application (Docusaurus static site + FastAPI API)
**Performance Goals**: Chat response <5s p95 per constitution
**Constraints**: Minimal diff — only 2 files modified; no schema changes; no new dependencies
**Scale/Scope**: Single chatbot component + single RAG service function

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. MVP-First | ✅ PASS | Bug fix for existing MVP feature; no new scope |
| II. No Auth, No Personalization, No Translation | ✅ PASS | Roman Urdu transliteration is chatbot-inlined, not a new /translate feature. Reuses existing tutor agent. |
| III. Content Scope | ✅ PASS | No content changes; fix applies to all existing pages |
| IV. Chatbot Omnipresence | ✅ PASS | **Directly fulfills**: "Selected-text queries MUST work seamlessly" — the current bug violates this principle |
| V. Deployability & Demability | ✅ PASS | 2-file change, fully demoable after deploy |
| VI. No Over-Engineering | ✅ PASS | One-line frontend fix + ~30 lines backend branching; no new services, no new abstractions |
| Tech Stack | ✅ PASS | FastAPI + React + Gemini — all existing stack, no additions |
| Deployment Gates | ✅ PASS | Rollback = revert single commit; no schema migration |

**Pre-research gate**: ALL PASS. No violations.
**Post-design re-check**: ALL PASS. Design adds zero new dependencies, zero new services, zero schema changes.

## Project Structure

### Documentation (this feature)

```text
specs/013-fix-chatbot-selection/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file
├── research.md          # Phase 0 research (6 decisions)
├── data-model.md        # Phase 1 data model (no schema changes)
├── quickstart.md        # Phase 1 dev setup & testing guide
├── contracts/
│   ├── chat-api.md      # POST /api/chat behavioral contract
│   └── frontend-state.md # Selected context state lifecycle
├── checklists/
│   └── requirements.md  # Requirements checklist (all pass)
└── tasks.md             # Phase 2 output (speckit.tasks — not yet created)
```

### Source Code (files modified by this feature)

```text
backend/
├── rag_service.py          # MODIFY: Add Roman Urdu regex detection + branch in generate_answer()
└── tests/
    └── test_chat_api.py    # MODIFY: Add tests for Roman Urdu branch + selection persistence

website/
└── src/
    └── components/
        └── ChatbotWidget.tsx  # MODIFY: Remove setSelectedContext(null) from sendMessage()
```

**Structure Decision**: Existing web application layout (backend/ + website/) — no new directories or files needed. Changes are scoped to 2 production files and 1 test file.

## Complexity Tracking

No constitution violations. No complexity justification needed.
