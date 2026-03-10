# Research: Fix Signin Crash & Chatbot Selection Stale Closure

**Feature**: 014-fix-signin-selection-bugs
**Date**: 2026-03-11
**Status**: Complete — no unknowns remain

---

## Research Task 1: NULL password_hash crash in signin endpoint

### Context

Backend logs show a 500 Internal Server Error on `POST /api/auth/signin`:

```
File "routes/auth.py", line 140, in signin
    if not verify_password(body.password, user["password_hash"]):
File "auth_utils.py", line 56, in verify_password
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
AttributeError: 'NoneType' object has no attribute 'encode'
```

### Root Cause

The `users` table allows `password_hash` to be `NULL`. When a user row exists with `password_hash = NULL`, the signin endpoint at `routes/auth.py:140` passes `None` to `verify_password()`, which calls `bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))` — `None.encode()` raises `AttributeError`.

### Decision: Guard clause before verify_password()

**Chosen approach**: Add a null/empty guard before calling `verify_password()`. If `password_hash` is `None` or empty string, return 401 immediately — same error message as wrong password (`"Invalid email or password"`).

**Rationale**:
- Smallest possible fix — one conditional, no schema changes
- Same error message prevents email enumeration (attacker can't distinguish "account exists but hash is null" from "wrong password")
- Consistent with existing pattern: the "user not found" case already returns 401 with the same message

**Alternatives considered**:
1. **Database NOT NULL constraint on password_hash**: Rejected — requires migration and doesn't fix existing corrupt rows. Out of scope per spec.
2. **Fix at verify_password() level**: Rejected — the utility function's type signature expects `str`, and silently handling `None` inside it would mask bugs elsewhere.
3. **Delete/flag corrupt user rows**: Rejected — data cleanup is out of scope and doesn't prevent future occurrences.

### Exact Fix Location

- **File**: `backend/routes/auth.py`, line 140
- **Before**: `if not verify_password(body.password, user["password_hash"]):`
- **After**: Add guard: `if not user["password_hash"] or not verify_password(body.password, user["password_hash"]):`
- **Effect**: Short-circuit evaluation — if `password_hash` is `None` or empty, skip `verify_password()` entirely and fall through to raise 401

### Test Plan

- New test: `test_signin_null_password_hash_returns_401` — mock `pool.fetchrow` to return a user with `password_hash=None`, assert 401 response.
- Regression: existing `test_signin_valid_returns_200` and `test_signin_wrong_password_returns_401` must still pass.

---

## Research Task 2: Stale closure in ChatbotWidget sendMessage

### Context

The chatbot selection banner correctly displays highlighted text, but when the user types a message and presses Enter, the `POST /api/chat` request body shows `selected_text: null`. Backend logs confirm no `selected_text` is received, despite the UI banner being visible.

### Root Cause

In `website/src/components/ChatbotWidget.tsx`:

```tsx
const sendMessage = useCallback(async (text: string, selectedText?: string) => {
  // ...
  const contextText = selectedText || selectedContext || null;  // line 109
  // ...
}, []);  // line 158 — EMPTY dependency array
```

`useCallback(..., [])` memoizes the function once on mount. The closure captures `selectedContext` at its initial value (`null`). Even though React re-renders the component when `selectedContext` state changes (making the banner appear), the memoized `sendMessage` function still reads the stale initial `null`.

When `handleSubmit` calls `sendMessage(input)` (no second argument), the function falls through to `selectedContext` which is forever `null` in the stale closure.

### Decision: Add selectedContext to dependency array

**Chosen approach**: Change `}, []);` to `}, [selectedContext]);` at line 158.

**Rationale**:
- This is the standard React pattern — `useCallback` must list all state/props it reads in the dependency array
- React will recreate `sendMessage` only when `selectedContext` changes, which is the exact behavior needed
- No performance concern — `selectedContext` changes infrequently (only on text selection/dismissal)

**Alternatives considered**:
1. **Use a ref instead of state**: Rejected — `selectedContext` is already state and is used for rendering the banner. Adding a parallel ref would duplicate state and violate "no over-engineering."
2. **Pass selectedContext explicitly via handleSubmit**: Rejected — would require changing the `handleSubmit` → `sendMessage` call chain and the popup handler. More invasive for the same result.
3. **Remove useCallback entirely**: Rejected — `sendMessage` is passed to event handlers and used in `useEffect` for the popup handler; removing memoization could cause unnecessary re-renders or stale handler references.

### Exact Fix Location

- **File**: `website/src/components/ChatbotWidget.tsx`, line 158
- **Before**: `}, []);`
- **After**: `}, [selectedContext]);`
- **Effect**: `sendMessage` is recreated whenever `selectedContext` changes, ensuring the closure always has the current value

### Test Plan

- Manual test: Highlight text on doc page → see selection banner → type "translate into roman urdu" → verify `selected_text` is populated in Network tab request payload → verify Roman Urdu response.
- Regression: General chat (no selection) should still work with `selected_text: null`.
- Regression: Popup "Ask about this" button should still work (already passes `selectedText` explicitly).

---

## Cross-Cutting Concerns

### Security

- **Bug 1 fix**: Prevents information leakage via stack traces in 500 responses. Consistent error messaging prevents email enumeration.
- **Bug 2 fix**: No security implications — purely a UI state management fix.

### Backward Compatibility

- **API contract**: No changes to request/response schemas. The signin endpoint still returns 401 for invalid credentials — just handles one more edge case. The chat endpoint already accepts `selected_text` as nullable.
- **Database**: No schema changes.
- **Frontend**: No UI changes — the banner already renders correctly. Only the callback's closure behavior changes.

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Guard clause accidentally rejects valid users | Very Low | High | Guard only triggers on NULL/empty hash; valid users always have a hash from signup |
| useCallback dependency causes excess re-renders | Very Low | Low | selectedContext changes rarely; React batches state updates |
| Other code paths rely on the stale closure behavior | None | — | No other call site depends on sendMessage reading stale state |
