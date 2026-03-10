# Data Model: Fix Signin Crash & Chatbot Selection Stale Closure

**Feature**: 014-fix-signin-selection-bugs
**Date**: 2026-03-11

---

## Entities (Existing — No Changes)

### 1. `users` (PostgreSQL table)

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | SERIAL PRIMARY KEY | No | Auto-increment |
| `email` | VARCHAR | No | Unique, used for lookup |
| `password_hash` | VARCHAR | **Yes (de facto)** | bcrypt hash; NULL in corrupt/incomplete rows |

**Bug 1 interaction**: The signin endpoint queries `SELECT id, email, password_hash FROM users WHERE email = $1`. When `password_hash` is `NULL`, it must be handled gracefully — the fix adds a guard clause before calling `verify_password()`.

**No schema change**: We do not add a `NOT NULL` constraint (out of scope). The application layer handles the edge case.

### 2. `selectedContext` (React state — ChatbotWidget)

| Property | Type | Initial Value | Updated By |
|----------|------|---------------|------------|
| `selectedContext` | `string \| null` | `null` | `askAboutSelection` custom event; dismiss button sets to `null` |

**Bug 2 interaction**: `sendMessage` reads `selectedContext` via closure. With empty `useCallback` deps `[]`, the closure is stale (always reads `null`). Adding `selectedContext` to the dependency array ensures the recreated callback reads the current value.

---

## State Transitions

### Signin Flow (Bug 1)

```
User submits email + password
  → Query users table by email
  → User not found? → 401 "Invalid email or password"
  → User found, password_hash is NULL/empty? → 401 "Invalid email or password"  ← NEW GUARD
  → User found, verify_password fails? → 401 "Invalid email or password"
  → User found, verify_password passes? → 200 + JWT cookie
```

### Selected Text Flow (Bug 2)

```
User highlights text on page
  → Custom event 'askAboutSelection' fires
  → ChatbotWidget sets selectedContext = highlighted text
  → Banner renders showing selected text
  → User types message + presses Enter
  → handleSubmit() → sendMessage(input)
  → sendMessage reads selectedContext from closure  ← MUST be current, not stale
  → POST /api/chat with { question, selected_text: selectedContext }
```

---

## Validation Rules

- `password_hash`: No application-level validation change. The guard treats `None` and empty string (`""`) identically — both are "invalid hash, return 401."
- `selectedContext`: No validation change. It's either a non-empty string (selected text) or `null` (no selection). The API already accepts `selected_text` as nullable.
