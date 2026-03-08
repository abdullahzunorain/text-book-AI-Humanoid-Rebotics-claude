# Data Model: Playwright E2E Testing & Mobile Auth Fix

**Feature**: 009-playwright-e2e-testing  
**Date**: 2026-03-08

## Overview

This feature has **no new data entities or storage changes**. All modifications are frontend component behavior (React) and test infrastructure (Playwright). This document captures the component interface contracts relevant to implementation.

## Component Interfaces

### AuthModal Props (Modified)

```typescript
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement>; // NEW: for focus-return
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | Yes | Controls modal visibility |
| `onClose` | `() => void` | Yes | Callback to close modal |
| `triggerRef` | `RefObject<HTMLButtonElement>` | No | Reference to the button that opened the modal; focus returns here on close |

**New internal state**: None. Focus trap and Escape handling are `useEffect` side effects, not state.

### AuthModal ARIA Attributes (New)

```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="auth-modal-title"
>
  <h2 id="auth-modal-title">{isSignIn ? 'Sign In' : 'Create Account'}</h2>
  ...
</div>
```

### AuthButton Ref (New)

```typescript
// AuthButton.tsx — new ref for focus-return
const signInButtonRef = useRef<HTMLButtonElement>(null);

// Passed to AuthModal
<AuthModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  triggerRef={signInButtonRef}
/>
```

### Error Classification (AuthModal)

```typescript
// Error type classification for handleSubmit
type AuthErrorType = 'credentials' | 'network' | 'server';

// Classification logic (conceptual, not a separate type in code):
// - fetch throws TypeError → network error
// - response.status >= 500 → server error  
// - response.status 400/401 → credentials error
```

## Playwright Test Structure

### Test File → User Story Mapping

| Test File | User Story | Spec Scenarios |
|-----------|-----------|----------------|
| `auth-button-mobile.spec.ts` | US1 (Mobile Sign In) | 1–5 |
| `auth-modal.spec.ts` | US2 (Modal Functionality) | 1–12 |
| `homepage.spec.ts` | US3 (Homepage Rendering) | 1–3 |
| `docs-navigation.spec.ts` | US4 (Docs Navigation) | 1–4 |
| `chatbot.spec.ts` | US5 (Chatbot Interaction) | 1–2 |

### Viewport Configurations

| Name | Width | Height | User Agent |
|------|-------|--------|------------|
| mobile | 375 | 812 | Default Chromium |
| tablet | 768 | 1024 | Default Chromium |
| desktop | 1280 | 720 | Default Chromium |

## State Transitions

### Auth Modal Lifecycle

```
[Closed] --click Sign In--> [Open]
[Open] --click ×--> [Closed] (focus → Sign In button)
[Open] --click overlay--> [Closed] (focus → Sign In button)
[Open] --press Escape--> [Closed] (focus → Sign In button)
[Open] --submit success--> [Closed] (auth state updated)
[Open] --submit fail (credentials)--> [Open] (error: "Invalid email or password")
[Open] --submit fail (network)--> [Open] (error: "Something went wrong...")
[Open] --submit fail (server)--> [Open] (error: "Something went wrong...")
```

### Focus Management

```
[Page] --click Sign In--> [Modal: first focusable element]
[Modal] --Tab on last element--> [Modal: first focusable element] (trap)
[Modal] --Shift+Tab on first element--> [Modal: last focusable element] (trap)
[Modal] --close--> [Page: Sign In button] (focus-return via triggerRef)
```
