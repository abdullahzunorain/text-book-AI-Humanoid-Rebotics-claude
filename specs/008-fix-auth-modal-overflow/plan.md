# Implementation Plan: Fix Auth Modal Popup Overflow

**Branch**: `008-fix-auth-modal-overflow` | **Date**: 2026-03-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/008-fix-auth-modal-overflow/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command.

## Summary

The auth modal's upper portion is clipped off-screen on shorter viewports because the flex-centered overlay has no overflow handling and the modal has no height constraint. The fix adds `max-height`, `overflow-y: auto`, and safe `padding`/`margin` to the two CSS selectors — a 5-property, single-file change that resolves the overflow while preserving centering and entrance animation.

## Technical Context

**Language/Version**: CSS3 (within Docusaurus 3.9 / React 19 project)  
**Primary Dependencies**: Docusaurus CSS custom styles (`website/src/css/auth-modal.css`)  
**Storage**: N/A  
**Testing**: Visual QA (viewport resizing), CSS validation, `npm run build`, backend pytest  
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge — desktop + mobile)  
**Project Type**: Web application (Docusaurus static site)  
**Performance Goals**: No performance impact — CSS-only change  
**Constraints**: Zero backend changes, zero new npm packages, CSS-only fix  
**Scale/Scope**: Single CSS file, 5 property additions across 2 selectors

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. MVP-First | PASS | Bug fix — directly supports usability of existing feature |
| II. No Auth (MVP scope) | N/A | Auth already exists post-MVP; this fixes its CSS |
| III. Content Scope | PASS | No content changes |
| IV. Chatbot Omnipresence | PASS | No chatbot changes |
| V. Deployability | PASS | CSS-only change, instantly deployable |
| VI. No Over-Engineering | PASS | Minimal 5-property fix, no JS, no new abstractions |
| Technology Stack | PASS | Uses existing CSS within Docusaurus framework |
| No Hardcoded Secrets | PASS | No secrets involved |
| Mobile-Responsive | PASS | Fix specifically improves mobile viewport behavior |

**Gate Result**: PASS — all principles honored.

## Architecture Decision

### Approach: CSS max-height + overflow-y + margin auto

**Problem**: Flex-centered modal clips when content exceeds viewport height.

**Solution**: Standard overflow-safe modal pattern:

```
┌─ Viewport ──────────────────────────────────┐
│                                              │
│  ┌─ .auth-modal-overlay ─────────────────┐  │
│  │  padding: 1rem                        │  │
│  │  overflow-y: auto                     │  │
│  │                                       │  │
│  │  ┌─ .auth-modal ──────────────────┐   │  │
│  │  │  max-height: calc(100vh - 2rem)│   │  │
│  │  │  overflow-y: auto              │   │  │
│  │  │  margin: auto                  │   │  │
│  │  │                                │   │  │
│  │  │  ┌ Close button ┐             │   │  │
│  │  │  ├ Tabs (Sign In / Sign Up) ──┤   │  │
│  │  │  ├ Email field ────────────────┤   │  │
│  │  │  ├ Password field + toggle ────┤   │  │
│  │  │  ├ Submit button ──────────────┤   │  │
│  │  │  ├ OAuth divider ──────────────┤   │  │
│  │  │  ├ Google button ──────────────┤   │  │
│  │  │  └ GitHub button ──────────────┘   │  │
│  │  │  ↕ scrolls if content > max-height │  │
│  │  └────────────────────────────────┘   │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                                              │
└──────────────────────────────────────────────┘
```

**Why this approach**:
- Pure CSS — no JavaScript height calculations needed
- Preserves visual centering on tall viewports (via flex + margin auto)
- Degrades to scrollable on short viewports (via max-height + overflow-y)
- Does not interfere with `authModalEntrance` animation (opacity + transform)
- Well-established pattern used by Radix UI, Headless UI, Tailwind UI

**Alternatives rejected**:
| Alternative | Why Rejected |
|------------|-------------|
| `align-items: flex-start` on overlay | Loses visual centering on desktop |
| JS `ResizeObserver` + dynamic height | Over-engineering for a CSS problem |
| Remove OAuth buttons to reduce height | Sacrifices features instead of fixing layout |
| `position: absolute; top: 1rem` | Breaks flex centering, requires JS for centering |

## Project Structure

### Documentation (this feature)

```text
specs/008-fix-auth-modal-overflow/
├── plan.md              # This file
├── research.md          # Phase 0 output — root cause + CSS best practices
├── data-model.md        # Phase 1 output — CSS selectors affected
├── quickstart.md        # Phase 1 output — validation steps
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (single file change)

```text
website/
└── src/
    └── css/
        └── auth-modal.css    # THE ONLY FILE MODIFIED
```

**Structure Decision**: No new files or directories. Single-file CSS fix within existing project structure.

## Detailed Design

### Change 1: `.auth-modal-overlay` (lines 5-16 of auth-modal.css)

Add safe viewport padding and overflow fallback:

```css
.auth-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;          /* NEW — safe margin from viewport edges */
  overflow-y: auto;       /* NEW — fallback scroll on overlay */
}
```

**Rationale**: `padding: 1rem` ensures the modal never touches viewport edges. `overflow-y: auto` provides a fallback scroll mechanism on the overlay itself if the modal with margin somehow still exceeds available space.

### Change 2: `.auth-modal` (lines 19-31 of auth-modal.css)

Add height constraint, internal scroll, and centering aid:

```css
.auth-modal {
  background: var(--ifm-background-color);
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  max-height: calc(100vh - 2rem);  /* NEW — fits viewport with 1rem margin each side */
  overflow-y: auto;                 /* NEW — internal scroll when content overflows */
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--ifm-color-emphasis-200);
  margin: auto;                     /* NEW — maintains centering in scrollable overlay */
}
```

**Rationale**: `max-height: calc(100vh - 2rem)` constrains the modal to fit within the viewport minus the overlay's safe padding. `overflow-y: auto` activates scrollbar only when needed. `margin: auto` stabilizes centering when the overlay transitions to scrollable mode.

## Behavior by Viewport Height

| Viewport Height | Modal Behavior | Scroll? |
|----------------|---------------|---------|
| ≥ 700px | Fully visible, centered, no scroll | No |
| 500-700px | Fully visible, may show scrollbar | Possibly |
| < 500px | Height-constrained, scrolls internally | Yes |
| < 400px | Heavily constrained, scrolls to all fields | Yes |

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Entrance animation breaks | Very Low | Medium | `max-height`/`overflow-y` don't affect `transform`/`opacity` animations |
| Questionnaire overlay affected | None | Medium | Different CSS selectors; questionnaire already has own overflow handling |
| Scrollbar visual inconsistency | Low | Low | Browser-native scrollbar; consistent with questionnaire behavior |
| Content shift during animation | Very Low | Low | `margin: auto` stabilizes layout; scale animation is subtle (0.95→1) |

## Complexity Tracking

No constitution violations. No complexity justification needed.

## Post-Design Constitution Re-Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. MVP-First | PASS | Minimal fix, 5 CSS properties |
| V. Deployability | PASS | Single-file change, instantly deployable |
| VI. No Over-Engineering | PASS | No JS, no new abstractions, no new files |
| Mobile-Responsive | PASS | Fix specifically targets mobile viewport behavior |

**Gate Result**: PASS — all principles still honored after design phase.
