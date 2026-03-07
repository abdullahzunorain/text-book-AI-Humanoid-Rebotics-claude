# Implementation Plan: Professional UI Redesign

**Branch**: `006-ui-redesign` | **Date**: 2026-03-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/006-ui-redesign/spec.md`

## Summary

Transform the Docusaurus-based textbook site from the default stock green template into a professional, modern AI/tech product aesthetic — purely through frontend CSS and minimal TSX className changes. Core approach: (1) swap global color palette to deep indigo, (2) load Inter font, (3) rebuild the homepage hero as a gradient section with polished feature cards, (4) add navbar backdrop-blur, (5) update chatbot + auth modal borders and colors. **Zero backend changes. Zero new npm dependencies. Zero component logic modifications.**

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, CSS3
**Primary Dependencies**: Docusaurus 3.9, Infima CSS framework (bundled), clsx — all already installed
**Storage**: N/A — frontend-only
**Testing**: `npm run build` (no errors is the pass criterion); visual regression via browser inspection
**Target Platform**: Browser (GitHub Pages static build); Chrome, Firefox, Safari, Edge 2022+
**Project Type**: Static site (Docusaurus)
**Performance Goals**: No page load regression — zero new npm packages, one `<link>` stylesheet for Inter font (≤ 12 KB, highly browser-cached)
**Constraints**: No backend file changes. No new npm packages. No JS animation libraries. All CSS via Infima variable overrides or class additions.
**Scale/Scope**: 8 files modified (6 CSS/TSX frontend, 1 config, 1 CSS module). ~450 lines changed total.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| I. MVP-First | ✅ PASS | Feature is a pure frontend reskin — no new services, no scope expansion |
| II. No Auth/Personalization/Translation (MVP scope) | ⚠️ N/A | Constitution was written for MVP phase. Auth/personalization/translation already ship. This feature only improves their visual presentation — no logic changes. |
| III. Content Scope | ✅ PASS | Zero content changes — all Markdown docs untouched |
| IV. Chatbot Omnipresence | ✅ PASS | Chatbot styling improved, no functional change |
| V. Deployability & Demability | ✅ PASS | `npm run build` will still pass; GitHub Pages deploys same pipeline |
| VI. No Over-Engineering | ✅ PASS | 8 files, no new dependencies, CSS-only animations, no JS animation libraries |
| Tech Stack | ✅ PASS | Docusaurus 3.x + React + TypeScript — exact same stack |
| No Hardcoded Secrets | ✅ PASS | No secrets involved in CSS/UI changes |

**Post-Phase-1 Re-check**: All gates pass. Single `<link>` stylesheet addition for Inter font is the only external dependency — it's a CDN stylesheet loaded by the browser, not an npm package, fully cacheable.

## Project Structure

### Documentation (this feature)

```text
specs/006-ui-redesign/
├── spec.md              # Feature requirements
├── plan.md              # This file
├── research.md          # Phase 0 output — 7 design decisions with rationale
├── quickstart.md        # Phase 1 output — how to run and verify the redesign
└── checklists/
    └── requirements.md  # Spec quality checklist (12/12 PASS)
```

Note: `data-model.md` and `contracts/` are **not created** — this feature has no data entities and no API contract changes.

### Source Code (files modified)

```text
website/
├── docusaurus.config.ts                            ← Add Inter font stylesheet entry
└── src/
    ├── css/
    │   ├── custom.css                              ← Primary: palette, navbar, typography, action-btn
    │   └── auth-modal.css                          ← Fix hardcoded focus color, border-radius polish
    ├── components/
    │   ├── chatbot.css                             ← Enhanced panel shadow, border-radius
    │   ├── PersonalizeButton.tsx                   ← Add className="action-btn" to <button> (logic untouched)
    │   └── UrduTranslateButton.tsx                 ← Add className="action-btn" to <button> (logic untouched)
    └── pages/
        ├── index.tsx                               ← Hero redesign, feature card layout
        └── index.module.css                        ← Hero gradient, animation, card CSS
```

## Phase 0: Research Complete

All unknowns resolved in `research.md`. Summary of 7 decisions:

| # | Decision | Chosen | Key Reason |
|---|----------|--------|-----------|
| 1 | Primary color | Indigo `#6366f1` | Modern AI/tech palette; max differentiation from default green |
| 2 | Typography | Inter (Google Fonts CDN) | Industry standard for dev tools; browser-cached; zero build impact |
| 3 | Hero background | 3-stop CSS `linear-gradient` | Zero assets, zero JS, GPU-composited, dark-mode-safe |
| 4 | Feature cards | CSS elevation + hover lift | Highest ROI visual change; pure CSS |
| 5 | Navbar | Backdrop-blur `blur(12px)` | Modern standard; CSS-only; graceful fallback |
| 6 | Action buttons | `.action-btn` utility class + `className` prop | Zero logic change; one class per button |
| 7 | Auth modal | Fix hardcoded focus color; border-radius 4→8px, 8→12px | Remove green artifact; round corners = modern |

## Phase 1: Design

### 1A. Global Infima CSS Variable Override (`custom.css`)

Replace the entire Infima variable block with the indigo palette. Also add:
- `--ifm-font-family-base: "Inter", ui-sans-serif, system-ui, -apple-system, sans-serif`
- `--ifm-font-size-base: 16px`
- `--ifm-line-height-base: 1.65`
- Navbar backdrop-blur rules (`.navbar` override)
- `.action-btn` utility class definition
- Focus-visible utility: `*:focus-visible` outline in indigo

**Complete indigo scale (light mode)**:
```css
:root {
  --ifm-color-primary:         #6366f1;  /* indigo-500 */
  --ifm-color-primary-dark:    #4f46e5;  /* indigo-600 */
  --ifm-color-primary-darker:  #4338ca;  /* indigo-700 */
  --ifm-color-primary-darkest: #3730a3;  /* indigo-800 */
  --ifm-color-primary-light:   #818cf8;  /* indigo-400 */
  --ifm-color-primary-lighter: #a5b4fc;  /* indigo-300 */
  --ifm-color-primary-lightest:#c7d2fe;  /* indigo-200 */
}
[data-theme='dark'] {
  --ifm-color-primary:         #818cf8;  /* indigo-400 */
  --ifm-color-primary-dark:    #6366f1;  /* indigo-500 */
  --ifm-color-primary-darker:  #4f46e5;  /* indigo-600 */
  --ifm-color-primary-darkest: #4338ca;  /* indigo-700 */
  --ifm-color-primary-light:   #a5b4fc;  /* indigo-300 */
  --ifm-color-primary-lighter: #c7d2fe;  /* indigo-200 */
  --ifm-color-primary-lightest:#e0e7ff;  /* indigo-100 */
}
```

### 1B. Homepage Hero (`index.tsx` + `index.module.css`)

**index.module.css** changes:
- `.heroBanner`: Replace the solid Docusaurus primary bg with gradient:
  `background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #312e81 100%)`
  Add `min-height: 480px`, `display: flex`, `align-items: center`
- `.heroTitle`: `background: linear-gradient(90deg, #c7d2fe, #818cf8, #a5b4fc)`, `background-clip: text`, `-webkit-background-clip: text`, `color: transparent`, `animation: gradientShift 4s ease infinite`
- `@keyframes gradientShift`: Animate `background-position` from 0% to 100%
- `.heroSubtitle`: `color: rgba(255,255,255,0.75)`, `font-size: 1.25rem`, `max-width: 600px`, `margin: 0 auto 2rem`
- `.heroCta`: Pill button with `background: linear-gradient(135deg, #6366f1, #8b5cf6)`, `border-radius: 50px`, `padding: 0.875rem 2rem`
- `.featureCard`: `border: 1px solid var(--ifm-color-emphasis-200)`, `border-radius: 12px`, `padding: 1.5rem`, `box-shadow: 0 2px 8px rgba(0,0,0,0.05)`, hover transform + indigo shadow

**index.tsx** changes:
- Apply `styles.heroTitle` and `styles.heroSubtitle` class names on the heading and subtitle
- Apply `styles.heroCta` on the CTA `<Link>` button
- Wrap each feature item in `<div className={styles.featureCard}>`
- Increase feature icon size from text to a styled `<span className={styles.featureIcon}>`

### 1C. Navbar Backdrop-Blur (`custom.css`)

```css
.navbar {
  --navbar-bg-rgb: 255, 255, 255;
  background: rgba(var(--navbar-bg-rgb), 0.85) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--ifm-color-emphasis-200);
  box-shadow: none;
}
[data-theme='dark'] .navbar {
  --navbar-bg-rgb: 24, 24, 30;
}
```

### 1D. Auth Modal Fixes (`auth-modal.css`)

- `.auth-modal`: `border-radius: 12px` (was 8px), add `border: 1px solid var(--ifm-color-emphasis-200)`
- `.auth-field input`: `border-radius: 8px` (was 4px), `padding: 0.625rem 0.875rem`
- `.auth-field input:focus` box-shadow: `rgba(99, 102, 241, 0.25)` (was hardcoded green)
- `.auth-tab.active` font-size: `0.95rem`

### 1E. Action Button Utility Class (`custom.css`)

```css
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1.5px solid var(--ifm-color-primary);
  border-radius: 8px;
  background: transparent;
  color: var(--ifm-color-primary);
  cursor: pointer;
  transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
}
.action-btn:hover {
  background: rgba(99, 102, 241, 0.08);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
}
.action-btn:active { transform: translateY(0); }
.action-btn:focus-visible {
  outline: 2px solid var(--ifm-color-primary);
  outline-offset: 2px;
}
.action-btn.action-btn--active {
  background: var(--ifm-color-primary);
  color: #fff;
}
.action-btn[disabled], .action-btn-loading {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}
```

`PersonalizeButton.tsx` and `UrduTranslateButton.tsx`: Add `className="action-btn"` (or `"action-btn action-btn--active"` when active state) to the rendered `<button>`.

### 1F. Chatbot CSS Enhancement (`chatbot.css`)

- `.chatbot-panel`: `border-radius: 16px` (was 12px), `box-shadow: 0 16px 48px rgba(0,0,0,0.25), 0 0 0 1px rgba(99,102,241,0.12)`
- `.chatbot-toggle`: Add `background: linear-gradient(135deg, #6366f1, #8b5cf6)` — overrides the `var(--ifm-color-primary)` for a richer look; also add `box-shadow: 0 4px 16px rgba(99,102,241,0.4)`
- `.chatbot-header`: `background: linear-gradient(135deg, #4f46e5, #7c3aed)` (was flat primary color)
- `.chatbot-message-user .chatbot-message-content`: `background: linear-gradient(135deg, #6366f1, #7c3aed)`
- `.chatbot-send`: `background: linear-gradient(135deg, #6366f1, #7c3aed)`, `border-radius: 10px`

### 1G. Inter Font (`docusaurus.config.ts`)

Add to config:
```typescript
stylesheets: [
  {
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    type: 'text/css',
    crossorigin: 'anonymous',
  },
],
```

## Agent Context Update

Run `.specify/scripts/bash/update-agent-context.sh copilot` after Phase 1 artifacts are written.

**Technology additions for copilot context**:
- Inter font via Google Fonts CDN (`stylesheets` Docusaurus config)
- Infima CSS variable overrides for indigo palette
- CSS `backdrop-filter` for navbar
- CSS `background-clip: text` gradient text animation

## Quickstart for Verification

See `quickstart.md` for local run + visual verification instructions.

## Risk Analysis

| Risk | Blast Radius | Mitigation |
|------|-------------|-----------|
| Inter font CDN fails in CI | Build warning only (not a build error) | `display=swap` ensures text renders with fallback |
| `backdrop-filter` unsupported on Firefox 102− | Navbar looks solid (acceptable fallback) | `@supports` guard not needed — graceful degradation is correct behavior |
| Gradient text broken on Safari < 14 | Homepage title shows transparent (no text) | Use `-webkit-background-clip: text` in addition to standard property |
| `action-btn--active` state unseen | Personalize/Translate active state not styled | TSX prop condition already in the components — className ternary will be added correctly |
| Dark mode broken colors | Text invisible on some pages | Full dark mode test after each CSS change; dark palette verified in research |


## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [e.g., library/cli/web-service/mobile-app/compiler/desktop-app or NEEDS CLARIFICATION]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
