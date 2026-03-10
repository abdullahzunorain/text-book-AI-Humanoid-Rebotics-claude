# Data Model: 013-fix-chatbot-selection

**Date**: 2026-03-10

---

## Entities

### No New Entities — No Schema Changes

This feature modifies only in-memory behavior (frontend state) and prompt logic (backend). Existing entities are used as-is.

---

## Existing Entities Referenced (read-only)

### ChatRequest (Pydantic model — `main.py`)
| Field | Type | Constraint | Notes |
|-------|------|-----------|-------|
| question | str | min_length=1, max_length=2000 | User's question |
| selected_text | str \| None | max_length=2000 | Highlighted passage (already exists) |

### ChatResponse (Pydantic model — `main.py`)
| Field | Type | Notes |
|-------|------|-------|
| answer | str | AI-generated answer |
| sources | list[str] | RAG source references |

### chat_messages (DB table — unchanged)
| Column | Type | Notes |
|--------|------|-------|
| user_id | int | FK → users |
| question | text | |
| answer | text | |
| selected_text | text \| null | Preserved for history |
| sources | jsonb | |
| created_at | timestamp | |

---

## State Model (Frontend — `ChatbotWidget`)

### Existing State (modified behavior)
| State Variable | Type | Current Behavior | New Behavior |
|---|---|---|---|
| `selectedContext` | `string \| null` | Cleared on every `sendMessage()` call | Persists until new selection or explicit "×" dismiss |

### No New State Variables

The existing `selectedContext` state already:
- Receives value from `askAboutSelection` event
- Persists across panel toggles (React state is not reset on `isOpen` change)
- Has a dismiss button ("×") in the existing banner UI

---

## Validation Rules

No new validation rules. Existing rules apply:
- `question`: 1–2000 characters (Pydantic)
- `selected_text`: max 2000 characters (Pydantic)
- Frontend: `SelectedTextHandler` truncates to 2000 chars before dispatch

---

## State Transitions

```
[No Selection] → user highlights text → [Selection Active]
[Selection Active] → user clicks "×" dismiss → [No Selection]
[Selection Active] → new askAboutSelection event → [New Selection Active]
[Selection Active] → user sends message → [Selection Active] (FIXED — was clearing)
[Selection Active] → page navigation → [No Selection] (React unmount)
```
