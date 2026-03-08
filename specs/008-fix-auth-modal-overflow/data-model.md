# Data Model: Fix Auth Modal Popup Overflow

**Feature**: 008-fix-auth-modal-overflow  
**Date**: 2026-03-08

## Entities

This is a CSS-only bug fix. No data entities are introduced or modified.

## CSS Selectors Affected

### `.auth-modal-overlay`

| Property | Before | After | Rationale |
|----------|--------|-------|-----------|
| `padding` | *(none)* | `1rem` | Safe margin from viewport edges |
| `overflow-y` | *(none)* | `auto` | Fallback scroll on the overlay itself |

### `.auth-modal`

| Property | Before | After | Rationale |
|----------|--------|-------|-----------|
| `max-height` | *(none)* | `calc(100vh - 2rem)` | Constrain modal to viewport with 1rem margin each side |
| `overflow-y` | *(none)* | `auto` | Internal scroll when content exceeds max-height |
| `margin` | *(none)* | `auto` | Maintain centering when overlay becomes scrollable |

## Unchanged Entities

- `.questionnaire-overlay` / `.questionnaire-form` — already has `max-height: 80vh; overflow-y: auto`
- `AuthModal.tsx` component — no logic changes
- Backend auth endpoints — zero changes
