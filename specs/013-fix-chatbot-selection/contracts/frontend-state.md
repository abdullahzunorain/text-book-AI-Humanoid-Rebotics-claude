# Frontend State Contract: Selected Text Context Lifecycle

**Date**: 2026-03-10  
**Component**: `ChatbotWidget.tsx`

---

## State Variable

```typescript
const [selectedContext, setSelectedContext] = useState<string | null>(null);
```

---

## State Transitions

| Trigger | Current State | Next State | Source |
|---------|--------------|------------|--------|
| `askAboutSelection` event | `null` | `string` | `SelectedTextHandler.tsx` dispatches on mouseup (>10 chars) |
| User clicks dismiss (×) | `string` | `null` | Banner dismiss button in ChatbotWidget |
| Chat panel closed & reopened | `string` | `string` | No change — state persists in React state |
| Toggle open/close panel | `string` | `string` | No change — panel visibility ≠ state reset |
| Send message | `string` | `string` | **FIX: context must NOT be cleared on send** |
| New `askAboutSelection` | `string` (old) | `string` (new) | Replaces previous selection |

---

## Rules

1. **Selected context persists until explicitly dismissed by user** (× button or new selection replaces it).
2. **`sendMessage()` must never call `setSelectedContext(null)`** — this is the root cause of the bug.
3. **Banner visibility** is driven by `selectedContext !== null`.
4. **Selected text is sent as `selected_text` in every chat request** while active — the user decides when to end the session.
5. **Truncation**: Banner displays first 100 chars with "..." suffix; full text sent to API.
