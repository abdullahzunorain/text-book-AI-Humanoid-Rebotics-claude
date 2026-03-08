# Research: Premium UI Upgrade (v2)

## Decision 1: CSS Layering Strategy (tokens -> foundation -> feature)
- Decision: Use a layered CSS architecture built on existing files: global tokens/utilities in `website/src/css/custom.css`, section-specific styles in `website/src/pages/index.module.css`, and component-specific styles in `website/src/components/chatbot.css` + `website/src/css/auth-modal.css`.
- Rationale: Matches current Docusaurus structure, reduces churn, avoids introducing new build tooling or packages, and improves maintainability by scope.
- Alternatives considered:
  - Create many new CSS files per section: rejected due to bundle fragmentation and higher coordination overhead.
  - Keep all changes in `custom.css`: rejected because homepage and component concerns would become tightly coupled and harder to maintain.

## Decision 2: Animation System (CSS-only + reduced motion)
- Decision: Implement all animations via CSS keyframes/transitions using `transform` and `opacity` whenever possible, with a single `@media (prefers-reduced-motion: reduce)` policy that disables non-essential motion.
- Rationale: Satisfies strict no-package requirement, maximizes animation performance, and ensures accessibility compliance.
- Alternatives considered:
  - JavaScript intersection observer animation orchestration: rejected due to complexity and unnecessary runtime work for this scope.
  - Animation libraries (Framer Motion/GSAP): rejected because new packages are explicitly prohibited.

## Decision 3: Dark Mode Integration
- Decision: Extend semantic CSS variables in `:root` and `[data-theme='dark']` and drive dark mode styles exclusively via Docusaurus theme attributes.
- Rationale: Native Docusaurus-compatible approach, keeps parity between light/dark, and avoids state duplication.
- Alternatives considered:
  - Separate dark stylesheets: rejected due to maintenance overhead and drift risk.
  - Component-level inline dark toggles: rejected because it duplicates logic and reduces consistency.

## Decision 4: RTL Urdu Support
- Decision: Keep `urdu-rtl.css` as the RTL anchor and migrate new layout rules to CSS logical properties (`margin-inline`, `padding-inline`, `inset-inline-start/end`, `border-inline-start`) so components mirror naturally.
- Rationale: Logical properties scale better than left/right overrides and prevent RTL regression when new sections are introduced.
- Alternatives considered:
  - Manual `[dir='rtl']` left/right overrides everywhere: rejected due to fragility and high regression risk.
  - Full locale infrastructure refactor: rejected as out of scope for frontend-only styling upgrade.

## Decision 5: Homepage Composition
- Decision: Keep homepage as a single page entry (`index.tsx`) but split content into typed section arrays (features, steps, stats) and reusable render subcomponents in the same file.
- Rationale: Improves reusability and readability without broad file sprawl or import overhead.
- Alternatives considered:
  - One monolithic JSX block: rejected for maintainability.
  - Many new files/components: rejected to keep minimal diff and avoid unnecessary architecture expansion.

## Decision 6: Documentation Shell Styling
- Decision: Apply sidebar, heading, table, content width, and navbar scroll-state styles globally in `custom.css`, with class hooks from swizzled theme wrappers where necessary.
- Rationale: These concerns are cross-page and best handled at global theme layer.
- Alternatives considered:
  - Per-doc markdown class names: rejected because it requires content edits and is not scalable.

## Decision 7: Performance and Bundle Discipline
- Decision: Reuse keyframes/utilities across sections, avoid duplicate gradient/shadow declarations where possible, and prefer composable utility classes over one-off selectors.
- Rationale: Minimizes CSS bundle growth while supporting premium visuals.
- Alternatives considered:
  - Unique styles per element for visual variety: rejected due to CSS size bloat and inconsistent UX behavior.

## Decision 8: Zero Backend Change Enforcement
- Decision: Restrict all implementation changes to `website/` and feature docs under `specs/007-ui-v2-premium/`.
- Rationale: Aligns with feature constraints and eliminates backend regression risk.
- Alternatives considered:
  - Backend endpoint/UI contract adjustments for chat/auth polish: rejected because the requested feature is presentation-only.
