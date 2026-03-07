# Quickstart: Professional UI Redesign — Local Dev & Verification

**Branch**: `006-ui-redesign` | **Date**: 2026-03-07

## Prerequisites

- Node.js 20+ installed
- Website dependencies installed (`cd website && npm install`)
- Backend *not* required (pure frontend feature)

## 1. Start Local Dev Server

```bash
cd website
npm run start
```

The site will be available at: `http://localhost:3000/text-book-AI-Humanoid-Rebotics-CLAUDE/`

Changes to CSS and TSX files **hot-reload automatically** — no server restart needed.

## 2. Visual Verification Checklist

After implementation, manually verify each item:

### Homepage (`/`)

- [ ] Hero background is a dark gradient (dark navy → indigo) — NOT the flat Docusaurus primary-color green/teal
- [ ] Hero headline text has a gradient color animation (indigo/violet shimmer)
- [ ] CTA button is a pill shape with gradient background
- [ ] Feature cards have visible borders, box-shadow, and a hover lift effect
- [ ] Page looks visually distinct from `https://docusaurus.io/` default demo

### Navbar

- [ ] Navbar has a frosted-glass (backdrop-blur) appearance — content visible through it when scrolling
- [ ] Navbar has a subtle bottom border, not a solid opaque block

### Doc Page (any chapter, e.g., `/docs/intro`)

- [ ] Body text renders in Inter font (check browser devtools → Computed → font-family)
- [ ] "🎯 Personalize This Chapter" button has a bordered, styled appearance with hover effect
- [ ] "اردو میں پڑھیں" button has a matching bordered style
- [ ] Chatbot toggle button has a gradient background (purple-indigo, not flat green)
- [ ] Chatbot panel has a rounded 16px border-radius and deeper shadow

### Dark Mode

Toggle to dark mode via the navbar switch:
- [ ] Homepage hero still readable (light gradient text on dark background)
- [ ] Feature cards have correct dark borders and background
- [ ] Chatbot panel background is dark — not washed out
- [ ] Auth modal (click Sign In) renders correctly in dark — no invisible text
- [ ] Action buttons (Personalize/Translate) have correct indigo color in dark

### Auth Modal (click Sign In in navbar)

- [ ] Modal has 12px border-radius (noticeably rounder than before)
- [ ] Input fields have 8px border-radius
- [ ] Input focus ring is indigo (not green)
- [ ] Submit button is full-width with indigo gradient

### Urdu RTL View

On any chapter: click "اردو میں پڑھیں" (requires backend running + logged in, OR check layout only)
- [ ] RTL direction preserved — text flows right-to-left
- [ ] No CSS collision from new `.action-btn` class on the translate button

## 3. Build Verification

```bash
cd website
npm run build
```

Expected output:
```
[SUCCESS] Generated static files in "build".
```

No `ERROR` lines should appear. Warnings about docusaurus-2 deprecations are acceptable.

## 4. Backend Regression Check

```bash
cd backend
source .venv/bin/activate
python -m pytest tests/ -v
```

Expected: **112 passed** — unchanged from pre-feature state. This confirms zero backend impact.

## 5. Production Build Preview

To preview the production build locally (same as GitHub Pages):

```bash
cd website
npm run build && npm run serve
```

Navigate to: `http://localhost:3000/text-book-AI-Humanoid-Rebotics-CLAUDE/`

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Inter font not loading | Check browser console for CORS errors; ensure `crossorigin: 'anonymous'` is set in stylesheets config |
| Gradient text invisible in Safari | Ensure `-webkit-background-clip: text` is present alongside `background-clip: text` in CSS |
| Dark mode colors broken | Check `[data-theme='dark']` blocks in custom.css — verify all new variables defined in both light and dark sections |
| Navbar not blurring | `backdrop-filter` requires the element have a non-opaque background. Verify `rgba(...)` not `rgb(...)` is set |
| Action button wrong color on dark | Ensure `.action-btn` colors reference `--ifm-color-primary` which inherits dark theme value |
