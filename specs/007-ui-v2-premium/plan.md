# Implementation Plan: Premium UI Upgrade (v2)

**Branch**: `007-ui-v2-premium` | **Date**: 2026-03-08 | **Spec**: `/mnt/c/Users/MY PC/Desktop/Hack-I-Copilot/specs/007-ui-v2-premium/spec.md`
**Input**: Feature specification from `/specs/007-ui-v2-premium/spec.md`

## Summary

Deliver a frontend-only visual and interaction overhaul for the Docusaurus 3.9 + React 19 site to achieve premium SaaS-grade polish while preserving existing behavior and contracts. The implementation centers on a layered CSS architecture (tokens, base, layout, component, utilities), small TSX composition refinements for homepage sectioning and reusable UI primitives, and strict compatibility with dark mode, RTL Urdu layouts, mobile-first responsiveness, and `prefers-reduced-motion` accessibility.

## Technical Context

**Language/Version**: TypeScript (React 19 JSX), CSS (global + CSS modules), Docusaurus 3.9  
**Primary Dependencies**: `@docusaurus/core` classic preset, Infima theme tokens, React runtime, existing local components only (no new packages)  
**Storage**: N/A (no data model or persistence changes for this feature)  
**Testing**: `npm run build` (Docusaurus production build), manual visual QA matrix (desktop/mobile, light/dark, LTR/RTL, reduced-motion)  
**Target Platform**: Modern evergreen browsers (Chrome, Edge, Firefox, Safari), desktop + mobile web (>=375px)  
**Project Type**: Frontend web application skinning/theming upgrade inside existing monorepo  
**Performance Goals**: Preserve 60fps for key animations, avoid measurable regression in first paint/interactive, keep CSS payload growth bounded and deduplicated  
**Constraints**: CSS-only animations, zero backend changes, no npm installs, dark mode parity, RTL Urdu support, Docusaurus theming integration, touch target >=44px, reduced-motion support  
**Scale/Scope**: Homepage (`index.tsx` + module CSS), docs chrome (sidebar/headings/tables/content width), chat widget, auth modal, navbar/footer/interactions, global tokens/utilities

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Gate Review

1. **MVP-First / No Over-Engineering**: PASS  
  The plan uses incremental CSS/TSX edits on existing files and Docusaurus swizzled wrappers; no new services/frameworks.

2. **No Backend Expansion**: PASS  
  Explicitly frontend-only, no changes under `backend/` and no API contract expansion.

3. **Constitution Principle II mismatch (auth/personalization/translation)**: JUSTIFIED EXCEPTION  
  This repository already contains active auth/personalization/Urdu UI components and this feature only elevates presentation quality of existing frontend capabilities. No new backend feature scope is introduced.

4. **Deployability & Demability**: PASS  
  Acceptance includes deterministic visual checks plus `npm run build` verification.

### Post-Phase 1 Re-Check

1. CSS architecture remains additive and reversible: PASS  
2. TSX changes remain presentational/compositional only: PASS  
3. No backend files included in planned edits: PASS  
4. Reduced-motion, dark mode, RTL, mobile constraints explicitly codified in contracts and quickstart verification: PASS

## Architecture & Implementation Strategy

### UI Architecture

1. **Design Token Layer (Global CSS variables)**
  Centralize semantic tokens in `website/src/css/custom.css` for color, spacing, radius, shadow, motion durations/easings, and z-index.
  Maintain dual token sets in `:root` and `[data-theme='dark']`.
  Prefer semantic naming (`--ui-surface-elevated`, `--ui-border-accent`, `--ui-motion-fast`) over hard-coded section-level colors.

2. **Foundation Layer (Global primitives and utilities)**
  Add reusable utility classes for premium transitions, hover underlines, gradient borders, card glow, focus rings, and section shells.
  Enforce one motion profile (0.2s ease for button transitions) and one reduced-motion override block.

3. **Feature Layer (Section/component-specific CSS)**
  Keep homepage-specific visuals in `website/src/pages/index.module.css`.
  Keep chat/auth-specific visuals in component-scoped CSS files already in use.
  Keep documentation-shell refinements in `custom.css` so they apply to all docs pages.

4. **Composition Layer (TSX structure and reusable UI patterns)**
  Refactor homepage into semantic sections and reusable card/step/stat render patterns in `index.tsx` without introducing external state libraries.
  Preserve current swizzled entry points (`theme/DocItem/Layout`, `theme/Navbar/Content`, `theme/Root`) and style via class hooks.

### Component Design

1. **Homepage**
  Hero: mesh overlay (`::before`), floating orb (`@keyframes`), shimmer badge, dual CTA hierarchy.
  Features: six cards, responsive grid, gradient top border, hover elevation.
  How It Works: 3-step flow with numbered icon circles and dashed connectors (horizontal->vertical on mobile).
  Stats: highlighted metrics strip with gradient tint and strong typographic hierarchy.

2. **Documentation Surface**
  Sidebar active state, smooth category expand/collapse transitions, heading accents, wider readable content container, premium table styling.

3. **Chat Widget**
  Slide/fade panel entrance, existing loading dots aligned to typing indicator spec, AI bubble accent border, input depth, Gemini badge anchor.

4. **Auth Modal**
  Fade/scale entrance, password visibility toggle affordance, full-width gradient submit with spinner state, styled OAuth placeholders.

### CSS Organization

```text
website/src/css/
├── custom.css                 # global tokens, docs shell, navbar/footer, utilities, dark-mode parity
├── auth-modal.css             # auth modal + questionnaire premium styles/motion
└── urdu-rtl.css               # RTL-only overrides and Urdu typography

website/src/components/
├── chatbot.css                # chat panel/toggle/messages/input animations and responsive behavior
├── ChatbotWidget.tsx          # markup hooks for typing indicator, badge, entrance class toggles
├── AuthModal.tsx              # modal structure for password toggle and oauth placeholders
└── ...                        # existing feature components (no backend coupling)

website/src/pages/
├── index.tsx                  # semantic section composition and reusable render arrays
└── index.module.css           # homepage-only visual language and section animations
```

### Docusaurus Integration

1. Retain `theme.customCss` entry in `docusaurus.config.ts`; no build pipeline changes.
2. Use Docusaurus color mode selector (`[data-theme='dark']`) for all dark variants.
3. Use swizzled theme wrappers for navbar/docs injection points already present.
4. Keep i18n config untouched, but support RTL layout through CSS direction-aware rules and logical properties (`margin-inline`, `padding-inline`, `inset-inline-*`).

### Performance Strategy

1. Use GPU-friendly properties for animation (`transform`, `opacity`) and avoid layout-thrashing animations.
2. Scope expensive effects (blur/shadow) to key hero/card elements only.
3. Co-locate keyframes and reuse across components to reduce CSS duplication.
4. Guard all non-essential motion with `@media (prefers-reduced-motion: reduce)`.
5. Prefer CSS logical shorthands and shared utility selectors to avoid stylesheet bloat.

## Project Structure

### Documentation (this feature)

```text
specs/007-ui-v2-premium/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── ...

website/
├── docusaurus.config.ts
├── src/
│   ├── components/
│   │   ├── AuthButton.tsx
│   │   ├── AuthModal.tsx
│   │   ├── ChatbotWidget.tsx
│   │   ├── chatbot.css
│   │   └── ...
│   ├── css/
│   │   ├── custom.css
│   │   ├── auth-modal.css
│   │   └── urdu-rtl.css
│   ├── pages/
│   │   ├── index.tsx
│   │   └── index.module.css
│   └── theme/
│       ├── Root.tsx
│       ├── Navbar/Content/index.tsx
│       └── DocItem/Layout/index.tsx
└── docs/
   └── ...
```

**Structure Decision**: Use the existing `website/` Docusaurus frontend as the single implementation surface. Keep backend and content sources unchanged. Organize styling by scope: global system tokens/utilities in `src/css/custom.css`, component-local behavior in component CSS files, and homepage-only presentation in `index.module.css`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Constitution Principle II includes no-auth/no-translation scope | Existing repository already ships auth/personalization/Urdu capabilities; this feature only upgrades frontend UX quality without expanding backend capabilities | Removing those UIs for strict historical MVP parity would break current product behavior and contradict existing accepted scope in branch `007-ui-v2-premium` |
