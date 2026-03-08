# Quickstart: Fix Auth Modal Popup Overflow

**Feature**: 008-fix-auth-modal-overflow  
**Date**: 2026-03-08

## Prerequisites

- Node.js 20+
- npm (comes with Node.js)
- Browser with DevTools (for viewport testing)

## Validation Steps

### 1. Verify the CSS Fix

Open `website/src/css/auth-modal.css` and confirm these properties exist:

```css
.auth-modal-overlay {
  /* ... existing properties ... */
  padding: 1rem;
  overflow-y: auto;
}

.auth-modal {
  /* ... existing properties ... */
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  margin: auto;
}
```

### 2. Build Validation

```bash
cd website
npm run build
```

Expected: `[SUCCESS] Generated static files in "build"` with zero errors.

### 3. Visual QA — Desktop (1920×1080)

```bash
cd website
npm run start
```

1. Open http://localhost:3000 in browser
2. Click "Sign In" in the navbar
3. **Expected**: Modal appears centered, all content visible without scrolling

### 4. Visual QA — Mobile (375×667)

1. Open DevTools → Toggle device toolbar
2. Select iPhone SE (375×667) or equivalent
3. Click "Sign In"
4. **Expected**: Modal appears within viewport, scrollable if content overflows
5. Scroll inside the modal → all fields reachable including OAuth buttons

### 5. Visual QA — Very Short Viewport (320×480)

1. Set custom viewport: 320×480
2. Click "Sign In"
3. **Expected**: Modal scrolls internally, submit button reachable

### 6. Backend Non-Regression

```bash
cd backend
source .venv/bin/activate
python -m pytest tests/ -v
```

Expected: 112 tests passed, zero failures.

### 7. No Backend Changes

```bash
git diff --name-only HEAD
```

Expected: Only `website/src/css/auth-modal.css` appears (plus spec files). No `backend/` files.

## Validation Matrix

| Check | Command / Action | Expected Result | Status |
|-------|-----------------|-----------------|--------|
| CSS syntax | `get_errors` on auth-modal.css | 0 errors | PASS |
| Production build | `npm run build` | SUCCESS | PASS |
| Desktop centering | Visual QA at 1920×1080 | Centered, no clip | PASS (code-verified) |
| Mobile scrollable | Visual QA at 375×667 | Scrollable, all visible | PASS (code-verified) |
| Short viewport | Visual QA at 320×480 | Scrollable, submit reachable | PASS (code-verified) |
| Backend tests | `pytest tests/ -v` | 112 passed | PASS |
| No backend diff | `git diff` | No backend/ files | PASS |
| Animation intact | Open modal on desktop | Fade+scale plays | PASS (code-verified) |
