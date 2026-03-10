# API Contract: POST /api/chat — Selection & Roman Urdu Behavior

**Date**: 2026-03-10  
**Endpoint**: `POST /api/chat` (existing — no changes to schema)

---

## Request Schema (unchanged)

```json
{
  "question": "string (1–2000 chars, required)",
  "selected_text": "string (max 2000 chars, optional, nullable)"
}
```

---

## Response Schema (unchanged)

```json
{
  "answer": "string",
  "sources": ["string"]
}
```

---

## Behavioral Contract Changes

### Case 1: Normal Q&A (no selected_text)
- **Condition**: `selected_text` is `null` or absent
- **Behavior**: UNCHANGED — full RAG pipeline (embed → Qdrant → tutor agent)
- **Sources**: populated from Qdrant retrieval

### Case 2: Selected Text Q&A (not Roman Urdu)
- **Condition**: `selected_text` is present AND question does NOT match Roman Urdu pattern
- **Behavior**: UNCHANGED — full RAG pipeline, but prompt includes selected text as primary context
- **Sources**: populated from Qdrant retrieval

### Case 3: Roman Urdu Transliteration (with selected_text)
- **Condition**: `selected_text` is present AND question matches Roman Urdu pattern
- **Behavior**: NEW — skip RAG pipeline, send transliteration prompt directly to tutor agent
- **Sources**: empty list `[]` (no RAG retrieval performed)
- **Answer format**: Latin-script Urdu transliteration of selected text only

### Case 4: Roman Urdu Request (without selected_text)
- **Condition**: `selected_text` is `null` AND question matches Roman Urdu pattern
- **Behavior**: NEW — return guidance message, no AI call
- **Answer**: Static message: "Please select some text from the textbook first, then ask me to translate it to Roman Urdu. You can highlight any passage and click the 'Ask AI' popup to set the context."
- **Sources**: empty list `[]`

---

## Roman Urdu Detection Pattern

```python
# Case-insensitive regex
r"roman\s*urdu|urdu\s*m(?:ein|en)\s*(?:likh|translate|bata)"
```

Matches: "roman urdu", "translate to roman urdu", "roman urdu mein", "urdu mein likho", "urdu men translate", etc.

---

## Error Responses (unchanged)

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Empty question | `{"detail": "Question cannot be empty"}` |
| 429 | Rate limit / AI quota | `{"detail": "AI service rate limit reached..."}` |
| 503 | AI service down | `{"detail": "Service temporarily unavailable..."}` |
