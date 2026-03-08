# UI Contract: Premium UI Upgrade (v2)

## Scope
- Frontend-only contract for Docusaurus UI surfaces in `website/`.
- No backend/API schema changes are allowed.

## Contract 1: Styling and Theming
- Existing Docusaurus theming entry remains: `theme.customCss -> ./src/css/custom.css`.
- All new visual primitives must resolve through CSS variables from `:root` and `[data-theme='dark']`.
- Required behavior:
  - Dark mode parity for every modified component.
  - No hard dependency on new npm packages.
  - Motion reduction via `@media (prefers-reduced-motion: reduce)`.

## Contract 2: Homepage Experience
- File surface: `website/src/pages/index.tsx`, `website/src/pages/index.module.css`.
- Required rendering guarantees:
  - Hero mesh overlay and floating orb are CSS-only.
  - Hero heading uses `clamp(2.2rem, 5vw, 3.5rem)` and prominent weight.
  - Two CTAs exist (primary + ghost "View on GitHub ->").
  - Feature section renders exactly six cards.
  - Workflow section renders exactly three numbered steps with dashed connectors.
  - Stats section renders exactly three metrics: `12+ Chapters`, `6 Modules`, `AI-Powered`.

## Contract 3: Documentation Shell
- File surface: `website/src/css/custom.css`, `website/src/theme/DocItem/Layout/index.tsx` (hook preservation only).
- Required rendering guarantees:
  - Sidebar active item uses 3px accent border and tint.
  - Category expand/collapse transitions are smooth.
  - H1/H2/H3 include premium accent treatment.
  - Tables use alternating rows, rounded corners, and tinted header.
  - Content max-width is increased for readability without overflow.

## Contract 4: Chat Widget
- File surface: `website/src/components/ChatbotWidget.tsx`, `website/src/components/chatbot.css`.
- Required rendering guarantees:
  - Panel enters with slide-up + fade.
  - Typing indicator shows three animated dots.
  - AI bubble has indigo accent edge.
  - Input has larger padding and subtle inset treatment.
  - Footer badge text includes "Powered by Gemini".

## Contract 5: Auth Modal
- File surface: `website/src/components/AuthModal.tsx`, `website/src/css/auth-modal.css`.
- Required rendering guarantees:
  - Modal enters with fade + scale motion.
  - Password field has show/hide toggle affordance.
  - Primary submit is full-width gradient button.
  - Loading state displays spinner-like visual feedback.
  - OAuth placeholders for Google and GitHub are styled.

## Contract 6: RTL Urdu and Responsive Behavior
- File surface: `website/src/css/urdu-rtl.css` plus logical-property updates in component/global CSS.
- Required rendering guarantees:
  - Layout mirrors correctly in Urdu RTL context.
  - Sidebar anchors to right side in RTL mode.
  - Chat message alignment remains readable in RTL.
  - All key experiences remain functional and readable at 375px width.
  - Interactive targets remain at least 44x44px on mobile.

## Contract 7: Non-Regression Boundaries
- Forbidden changes:
  - Modifications under `backend/`
  - New npm dependencies
  - API route/schema changes
- Build/quality gates:
  - `website: npm run build` passes.
  - Existing backend test suite remains untouched and runnable.
