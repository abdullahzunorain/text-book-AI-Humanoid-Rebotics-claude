# Quickstart: Implementing Premium UI Upgrade (v2)

## 1. Prerequisites
- Node.js version compatible with Docusaurus 3.9 project setup.
- Existing dependencies installed in `website/`.
- No backend environment changes required.

## 2. Working Directory
```bash
cd /mnt/c/Users/MY\ PC/Desktop/Hack-I-Copilot/website
```

## 3. Implementation Sequence
1. Update design tokens and global utilities in `src/css/custom.css`.
2. Refine homepage structure in `src/pages/index.tsx` and section visuals in `src/pages/index.module.css`.
3. Upgrade chat visuals and motion in `src/components/chatbot.css` and markup hooks in `src/components/ChatbotWidget.tsx`.
4. Upgrade auth modal visuals and interactions in `src/css/auth-modal.css` and `src/components/AuthModal.tsx`.
5. Add/adjust RTL logical-property rules in `src/css/urdu-rtl.css` and impacted selectors in global/component CSS.
6. Validate docs-shell polish (sidebar, headings, tables, content width) in `src/css/custom.css`.

## 4. Build Verification
```bash
cd /mnt/c/Users/MY\ PC/Desktop/Hack-I-Copilot/website
npm run build
```
Expected: Successful production build with zero errors.

## 5. Manual QA Matrix
- Homepage:
  - Hero overlay/orb/badge animation
  - Dual CTA hierarchy
  - Six-card feature grid desktop + mobile
  - Three-step workflow section and fade-in behavior
  - Stats strip visuals
- Documentation pages:
  - Sidebar active/toggle behavior
  - Heading accents
  - Table styling
  - Content width readability
- Chat/auth:
  - Chat panel entrance, typing dots, Gemini badge, input polish
  - Auth modal entrance, password toggle, gradient submit, loading state, OAuth placeholders
- Modes/layout:
  - Light mode + dark mode parity
  - LTR and Urdu RTL mirroring
  - 375px viewport pass and touch target checks
  - `prefers-reduced-motion` compliance

## 6. Performance Checks
- Confirm smooth scroll and hover/transition consistency.
- Confirm key animations remain smooth on mobile hardware.
- Verify no obvious style duplication or CSS bloat from one-off selectors.

## 7. Non-Regression Checks
- Ensure no files under `backend/` changed.
- Ensure no package installation changes (`package.json` unchanged for this feature).
