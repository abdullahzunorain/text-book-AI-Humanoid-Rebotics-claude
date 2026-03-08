# Data Model: Premium UI Upgrade (v2)

This feature is frontend-only and introduces no database schema or backend entities. The "data model" below defines UI domain entities and state contracts used by the implementation.

## Entity: ThemeTokenSet
- Purpose: Semantic design tokens for light/dark mode consistency.
- Fields:
  - `mode`: `light | dark`
  - `color.primary`: string
  - `color.surface`: string
  - `color.border`: string
  - `color.glow`: string
  - `shadow.card`: string
  - `radius.sm|md|lg`: CSS length
  - `motion.fast|base|slow`: CSS duration
  - `easing.standard`: CSS timing function
- Validation Rules:
  - Must map to CSS custom properties in `custom.css`.
  - Dark token contrast must preserve readable text foreground/background pairings.

## Entity: HomeFeatureCard
- Purpose: Source model for the six-card feature grid.
- Fields:
  - `id`: stable string
  - `icon`: emoji or icon token string
  - `title`: string
  - `description`: string
  - `priority`: `core | supporting`
- Validation Rules:
  - Exactly six cards must render.
  - Grid behavior: desktop 3x2, mobile 1-column.

## Entity: WorkflowStep
- Purpose: Data source for "How It Works" flow.
- Fields:
  - `stepNumber`: integer (1..3)
  - `icon`: string
  - `title`: string
  - `summary`: string
- Validation Rules:
  - Exactly three steps.
  - Connector visuals must work in both horizontal and stacked layouts.

## Entity: StatMetric
- Purpose: Source model for credibility metrics strip.
- Fields:
  - `label`: string
  - `value`: string
- Validation Rules:
  - Must include: `12+ Chapters`, `6 Modules`, `AI-Powered`.
  - Values remain legible on light/dark backgrounds.

## Entity: MotionPreset
- Purpose: Shared animation behavior rules.
- Fields:
  - `name`: string
  - `duration`: CSS time
  - `timing`: CSS timing function
  - `properties`: list of animating CSS properties
  - `reducedMotionBehavior`: `disable | simplify`
- Validation Rules:
  - Button hover transitions must be `0.2s ease`.
  - Expensive properties (layout-triggering) should not be animated when avoidable.

## Entity: DirectionContext
- Purpose: LTR/RTL direction-aware behavior.
- Fields:
  - `direction`: `ltr | rtl`
  - `languageContext`: `default | urdu`
  - `sidebarAnchorSide`: `inline-start | inline-end`
- Validation Rules:
  - RTL mode must mirror alignments and border accents using logical properties.
  - Chat bubbles, hero overlays, and sidebar behavior must remain visually correct in RTL.

## Entity: InteractiveSurfaceState
- Purpose: Visual states for chat/auth interactive surfaces.
- Fields:
  - `component`: `chat | auth-modal | navbar | link | button`
  - `state`: `idle | hover | focus | active | loading | disabled | entering | exiting`
  - `classHooks`: list of CSS class names
- Validation Rules:
  - Loading and entering states must be visually distinct.
  - Focus-visible states must remain keyboard accessible.

## State Transitions
- `chat.closed -> chat.opening -> chat.open`
- `chat.open -> chat.loading` while AI response pending
- `chat.loading -> chat.open` on success/failure
- `auth.closed -> auth.opening -> auth.open`
- `auth.open -> auth.loading` on submit
- `auth.loading -> auth.open` (error) or `auth.loading -> auth.closed` (success)
- `direction.ltr <-> direction.rtl` when Urdu mode enabled/disabled
- `theme.light <-> theme.dark` through Docusaurus color mode toggle
