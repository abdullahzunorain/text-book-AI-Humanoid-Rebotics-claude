# Feature Specification: Chatbot Selection-Based Q&A

**Feature Branch**: `013-fix-chatbot-selection`  
**Created**: 2026-03-10  
**Status**: Implemented  
**Input**: User description: "The Chatbot must be able to answer user questions about the book's content, including answering questions based only on text selected by the user."

---

## Overview

The AI Study Companion chatbot must correctly and reliably answer user questions that are scoped to a specific passage the user has highlighted in the textbook. The answer must be grounded in the selected text, not fabricated from unrelated context. Additionally, users must be able to request a Roman Urdu (Latin-script transliteration) rendering of any selected passage through the chatbot interface.

Currently the feature is partially implemented but has two critical defects:
1. The selected text context is discarded after the first message is sent, breaking multi-turn follow-up questions about the selection.
2. Asking the chatbot to "translate to Roman Urdu" on a selection produces an unsolicited full-chapter translation rather than a scoped, accurately transliterated response.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Selection-Scoped Q&A (Priority: P1)

A reader highlights a passage from a chapter (e.g., a paragraph explaining CLIP contrastive training), clicks the "Ask AI" popup, and types a question. The chatbot answers strictly about the selected passage, not the entire chapter or unrelated content.

**Why this priority**: This is the core stated requirement — chatbot answers must be grounded in what the user actually selected. Without it the feature has no value.

**Independent Test**: Select any paragraph from a chapter, open the chatbot via the selection popup, ask "What does this mean?". The response must reference only the content of the selected paragraph, not unrelated sections.

**Acceptance Scenarios**:

1. **Given** a user highlights 1–2000 characters on any doc page, **When** they click the "Ask AI" popup button and submit a question, **Then** the chatbot response is scoped to that selection and does not introduce information absent from the selected text.
2. **Given** a user submits a follow-up question after the first in the same session, **When** the selection was originally provided, **Then** the selection context is still attached to subsequent messages in that conversation thread.
3. **Given** a user selects text and explicitly asks a question clearly outside the selection scope, **When** the chatbot cannot answer from selection alone, **Then** it says so and offers to search the full textbook instead of hallucinating.

---

### User Story 2 — Roman Urdu Transliteration of Selection (Priority: P2)

A reader highlights a passage, asks the chatbot "translate to Roman Urdu" (or similar phrasing), and receives a Latin-script Urdu transliteration of exactly the selected passage — not the whole chapter, not Nastaliq script.

**Why this priority**: Identified as the specific failure in the reported bug. Many users are more comfortable reading Urdu in Latin script than Nastaliq. This is a chatbot-level capability distinct from the chapter-level `/api/translate` endpoint.

**Independent Test**: Select a 2–3 sentence passage, open chatbot via popup, type "Roman Urdu mein likho" or "translate to Roman Urdu". Response must be Roman Urdu transliteration of only the selected sentences.

**Acceptance Scenarios**:

1. **Given** a user has selected text and requests Roman Urdu translation via the chatbot, **When** the message is sent, **Then** the chatbot returns a Latin-script Urdu rendering of the selected passage only.
2. **Given** no text is selected and user asks for Roman Urdu translation, **When** the message is sent, **Then** the chatbot informs the user that they need to select text first and explains how to do so.
3. **Given** the selected text contains code blocks, **When** Roman Urdu translation is requested, **Then** code blocks are preserved as-is and only the prose is transliterated.

---

### User Story 3 — Chatbot Answers Without Selection Still Work (Priority: P1)

The general chatbot flow (no selection, just typing a question) must remain fully intact and unaffected by this fix.

**Why this priority**: Must not regress existing working functionality.

**Independent Test**: Open the chatbot floating button (no text selected), ask any robotics question. Answer must be RAG-grounded and correct as before.

**Acceptance Scenarios**:

1. **Given** no text is selected, **When** a user opens the chatbot and asks a question, **Then** the answer is RAG-retrieved from the full textbook with no errors.
2. **Given** a user was previously in a selection-scoped conversation, **When** they start a new question without a selection, **Then** the previous selection context does NOT bleed into the new question.

---

### Edge Cases

- What happens when selected text is exactly 10 characters (boundary for popup trigger)?
- What if the user selects text, the popup appears, but they then manually open the chatbot instead of using the popup? The selection must still be available.
- What if selected text exceeds 2000 characters? Must be truncated to 2000 chars before sending (already handled in SelectedTextHandler).
- What if the answer model returns an empty string? The chatbot must show a fallback message.
- What if the user submits an empty message with a selection context? Must show validation message "Please enter a question before sending."

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When a user submits a question via the selection popup, the `selected_text` field MUST be included in the `POST /api/chat` request body.
- **FR-002**: The `selected_text` context MUST persist across all follow-up messages within the same chatbot session that was opened via a selection popup.
- **FR-003**: When `selected_text` is present, the backend MUST build a prompt that explicitly grounds the answer in the selected passage first, before using RAG-retrieved context.
- **FR-004**: When the user's message is a Roman Urdu transliteration request and `selected_text` is present, the backend MUST return a Latin-script Urdu rendering of the selected text only.
- **FR-005**: Roman Urdu transliteration detection MUST recognize common phrasings: "roman urdu", "roman urdu mein", "translate to roman urdu", "roman urdu likho", and similar intent expressions.
- **FR-006**: Users MUST NOT need to re-select text for follow-up questions in the same selection-scoped session.
- **FR-007**: The general (non-selection) chatbot flow MUST remain unaffected — no regression.
- **FR-008**: If the chatbot cannot answer from the selected text alone and the question is on-topic, it MUST say so clearly rather than fabricating an answer.
- **FR-009**: Code blocks within selected text MUST be preserved unchanged in Roman Urdu responses.
- **FR-010**: The selection context MUST persist across panel toggles (close/reopen). It is only cleared when the user makes a new text selection (which replaces the old context) or performs an explicit "Clear context" action.
- **FR-011**: When a Roman Urdu transliteration request is detected with `selected_text` present, the backend MUST skip the RAG retrieval pipeline (no embedding, no Qdrant search) and transliterate the selected text directly via the tutor agent.
- **FR-012**: When a selection context is active in the chatbot, the UI MUST display a visible banner/chip at the top of the chat panel showing a truncated preview of the selected text (max ~80 characters with ellipsis).
- **FR-013**: The selection context banner MUST include a dismiss button ("×") that clears the selection context when clicked.

### Key Entities

- **Selected Text Context**: A string (max 2000 chars) captured from a user's text selection on the doc page. Attached to a chatbot session when opened via the selection popup.
- **Chatbot Session**: The lifecycle of the chatbot panel across multiple open/close toggles. Selection context persists across toggles and is only replaced by a new selection or an explicit clear action.
- **Roman Urdu Request**: A user intent signal (detected by keyword matching in the question) requesting Latin-script Urdu transliteration of the selected passage.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of questions submitted via the selection popup include the selected text in the API request.
- **SC-002**: Follow-up questions in a selection-scoped session retain context — measurable by verifying the `selected_text` field is present in the 2nd and 3rd message payloads.
- **SC-003**: Roman Urdu requests on a selected passage produce Latin-script output scoped to the selection — verifiable by manual inspection of 5 sample requests.
- **SC-004**: Existing chatbot (no-selection) functionality continues to work without error — verified by the existing Playwright chatbot e2e spec passing.
- **SC-005**: Zero hallucinated answers when the question is explicitly about the selected text and the text contains the answer — verifiable by 5 manual test cases.

---

## Assumptions

- The existing `SelectedTextHandler` popup and `askAboutSelection` event dispatch mechanism are correct and only need the context-persistence fix in `ChatbotWidget`.
- Roman Urdu transliteration is handled by the existing `tutor_agent` (Gemini) via prompt instruction — no new agent or endpoint is needed.
- "Roman Urdu" detection is done via simple keyword matching in the question string; no NLP classifier is required.
- The `POST /api/chat` endpoint's `selected_text` field is already defined and working — only the frontend context-clearing bug needs to be fixed.
- No database schema changes are required.

---

## Clarifications

### Session 2026-03-10

- Q: Should selection context clear on any panel close (toggle), or persist across toggles? → A: Persist across toggles; only clear on new selection or explicit action.
- Q: Should RAG retrieval run during Roman Urdu transliteration of selected text? → A: No — skip RAG entirely; transliterate the selection directly.
- Q: Should the chatbot show a visual indicator when selection context is active? → A: Yes — show a dismissible banner/chip with truncated preview and "×" to clear.

---

## Out of Scope

- Translating entire chapters to Roman Urdu (that is a separate feature using `/api/translate`).
- Nastaliq Urdu translation via the chatbot (the dedicated translate button handles this).
- Persisting selection context across page navigations or browser refreshes.
- Voice input or output.
- Any changes to the authentication, caching, or personalization systems.
