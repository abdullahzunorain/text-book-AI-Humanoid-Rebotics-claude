# Research: 013-fix-chatbot-selection

**Date**: 2026-03-10  
**Feature**: Chatbot Selection-Based Q&A  
**Branch**: `013-fix-chatbot-selection`

---

## Research Task 1: Frontend Context Clearing Bug — Root Cause

**Unknown**: Why does selected text context disappear after the first message?

**Finding**: In `ChatbotWidget.tsx` line 113, inside `sendMessage()`:
```ts
setSelectedContext(null); // Clear after sending
```
This is called on every send. It clears `selectedContext` state immediately, so the second message has no context.

**Decision**: Remove `setSelectedContext(null)` from `sendMessage()`. Context is retained in React state until:
- A new `askAboutSelection` event replaces it
- The user clicks the "×" dismiss button on the context banner (FR-013)

**Rationale**: This is the minimal one-line fix. The `selectedContext` state already persists across panel toggles (it's not reset when `isOpen` changes), so FR-010 is satisfied by default once we stop clearing it.

**Alternatives considered**:
- Move context to a `useRef` — rejected (unnecessary; `useState` already persists)
- Store context in `localStorage` — rejected (spec says no cross-page persistence)

---

## Research Task 2: Current Selection Banner / UI Indicator

**Unknown**: Does the chatbot already have a visual indicator for active selection?

**Finding**: **Yes, partially.** `ChatbotWidget.tsx` lines 226–241 already render a context banner:
```tsx
{selectedContext && (
  <div className="chatbot-selected-context">
    <span className="chatbot-context-label">📝 Selected text:</span>
    <span className="chatbot-context-text">
      {selectedContext.length > 100
        ? selectedContext.substring(0, 100) + '...'
        : selectedContext}
    </span>
    <button ... onClick={() => setSelectedContext(null)}>✕</button>
  </div>
)}
```

And CSS styles exist in `chatbot.css` lines 334–372 for `.chatbot-selected-context`, `.chatbot-context-label`, `.chatbot-context-text`, `.chatbot-context-clear`.

**Decision**: Existing UI satisfies FR-012/FR-013 already. The truncation is 100 chars (spec says ~80); this is close enough and already working. The "×" dismiss button already exists. No UI changes needed — the banner was always there but disappeared instantly because `setSelectedContext(null)` cleared it on first send.

**Rationale**: Do not touch what already works. Once the clearing bug is fixed, the banner will naturally persist.

**Alternatives considered**:
- Redesign the banner — rejected (existing design matches the UI; no spec requirement for redesign)
- Move banner to header area — rejected (current position in input area is visible and functional)

---

## Research Task 3: Roman Urdu Detection — Keyword Matching Strategy

**Unknown**: How to reliably detect Roman Urdu transliteration requests (FR-005)?

**Finding**: The spec defines these phrasings: "roman urdu", "roman urdu mein", "translate to roman urdu", "roman urdu likho". Analysis of the question string with case-insensitive substring matching is sufficient.

**Decision**: Use a simple regex check in the backend `generate_answer()` function:
```python
import re
_ROMAN_URDU_RE = re.compile(
    r"roman\s*urdu|urdu\s*m(?:ein|en)\s*(?:likh|translate|bata)",
    re.IGNORECASE,
)
```
This matches:
- "roman urdu" (covers "translate to roman urdu", "roman urdu mein likho", etc.)
- "urdu mein likh..." / "urdu men translate" / "urdu mein bata" patterns

**Rationale**: Simple, no external dependencies, easy to extend. Covers the common phrasings. If `selected_text` is present AND this regex matches, skip RAG and transliterate directly.

**Alternatives considered**:
- Client-side detection (send a flag to backend) — rejected (makes client responsible for intent classification; less flexible)
- NLP classifier — rejected (over-engineered; spec says keyword matching is sufficient)
- Detect in `main.py` before calling `generate_answer()` — rejected (keep logic in `rag_service.py` which already has the prompt-building code)

---

## Research Task 4: Roman Urdu Transliteration Prompt Design

**Unknown**: What prompt produces reliable Latin-script Urdu from the tutor agent?

**Decision**: When Roman Urdu is detected with `selected_text`, bypass RAG and build a direct transliteration prompt:
```python
prompt = (
    "Transliterate the following English text into Roman Urdu (Latin script, NOT Nastaliq/Arabic script).\n\n"
    "RULES:\n"
    "1. Write Urdu in Latin characters (Roman Urdu), NOT in Urdu/Arabic script.\n"
    "2. Keep ALL technical terms in English (ROS 2, Python, URDF, Gazebo, etc.).\n"
    "3. Keep ALL code blocks exactly as they are — do NOT translate or modify code.\n"
    "4. Preserve markdown formatting (headers, bold, lists, links).\n"
    "5. Only transliterate the provided text, nothing else.\n\n"
    f"TEXT:\n\n{selected_text}"
)
```

**Rationale**: Clear, rule-based prompt. The tutor agent (Gemini 2.5 Flash) handles transliteration well when given explicit Latin-script instruction. Code block preservation is handled by explicit rule #3.

**Alternatives considered**:
- Create a separate `roman_urdu_agent` — rejected (over-engineered; tutor agent can handle this with prompt instructions)
- Use the existing `translation_agent` — rejected (it's configured for Nastaliq Urdu; reusing it would need prompt override which is messier than direct tutor agent call)

---

## Research Task 5: Backend Flow Branching — Where to Add the Roman Urdu Path

**Unknown**: Where in the backend to add the conditional Roman Urdu path?

**Finding**: The chat endpoint in `main.py` calls `rag_service.generate_answer(question, selected_text, user_id)`. All logic is in `generate_answer()`. This is the right place to add branching.

**Decision**: Add a conditional early return in `generate_answer()`:
1. Check if question matches `_ROMAN_URDU_RE` AND `selected_text` is not None
2. If yes: skip embed/retrieve, build transliteration prompt, call `run_agent(tutor_agent, input=prompt)`, save to history, return
3. If no: continue existing RAG pipeline unchanged

**Rationale**: Single function, minimal diff, no new endpoints, no routing changes. The existing `main.py` chat endpoint passes `selected_text` through already.

**Alternatives considered**:
- New endpoint `/api/chat/transliterate` — rejected (spec says use existing chatbot; no new endpoints)
- Add logic in `main.py` before calling `generate_answer()` — rejected (splits logic across files; `rag_service.py` is the right place for prompt building)

---

## Research Task 6: No-Selection Roman Urdu Request Handling

**Unknown**: What happens when user asks for Roman Urdu without selecting text? (FR-004 acceptance scenario 2)

**Decision**: When `_ROMAN_URDU_RE` matches but `selected_text` is None, return a helpful message telling the user to select text first. This is handled in `generate_answer()` before the RAG pipeline.

**Rationale**: Better UX than running RAG and getting a confusing response. Clear, actionable guidance.

---

## Summary of All Decisions

| # | Decision | Rationale | Alternatives Rejected |
|---|----------|-----------|----------------------|
| 1 | Remove `setSelectedContext(null)` from `sendMessage()` | One-line fix; state already persists across toggles | useRef, localStorage |
| 2 | Keep existing UI banner unchanged | Already implements FR-012/FR-013; just hidden by the bug | Redesign, relocate |
| 3 | Regex keyword match in `rag_service.py` | Simple, extensible, no dependencies | Client-side flag, NLP classifier |
| 4 | Direct transliteration prompt to `tutor_agent` | Clear rules, Gemini handles it well | Separate agent, reuse translation_agent |
| 5 | Branch inside `generate_answer()` | Minimal diff, single function, no new endpoints | New endpoint, logic in main.py |
| 6 | Helpful "select text first" message | Clear UX guidance | Run RAG anyway |
