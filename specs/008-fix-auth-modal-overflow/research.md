# Research: Fix Auth Modal Popup Overflow

**Feature**: 008-fix-auth-modal-overflow  
**Date**: 2026-03-08  
**Status**: Complete

## Research Tasks

### R1: Root Cause of Modal Clipping

**Task**: Determine why the auth modal's upper half is not visible  
**Finding**: The `.auth-modal-overlay` uses `display: flex; align-items: center; justify-content: center` with `position: fixed; inset: 0`. The `.auth-modal` child had no `max-height` and no `overflow-y`. When modal content height exceeds viewport height, flex centering distributes the overflow symmetrically — pushing content both above and below the viewport. The top overflow becomes unreachable.

- **Decision**: Apply `max-height` + `overflow-y: auto` to the modal, and safe `padding` + `overflow-y: auto` to the overlay
- **Rationale**: This is the standard CSS pattern for flex-centered modals with variable-height content. It preserves centering when content fits and degrades gracefully to scrollable when it doesn't.
- **Alternatives considered**:
  - `align-items: flex-start` on overlay — would fix clipping but loses visual centering on large viewports
  - JavaScript-based height calculation — unnecessary complexity when CSS can handle it
  - Reducing modal content to fit all viewports — would sacrifice features (OAuth buttons, password toggle)

### R2: CSS Best Practices for Overflow-Safe Modals

**Task**: Research best practices for flex-centered modals with variable content height  
**Finding**: The standard pattern is:
1. Overlay: `padding` (safe margin from viewport edges) + `overflow-y: auto` (allows overlay scroll as fallback)
2. Modal: `max-height: calc(100vh - <safe-margin>)` + `overflow-y: auto` + `margin: auto` (maintains centering when overlay becomes scrollable)

This is used by:
- Radix UI Dialog — uses `max-height` + `overflow` on dialog content
- Headless UI Dialog — uses `overflow-y: auto` on overlay panel  
- Tailwind UI modals — use `max-h-[calc(100vh-theme(spacing.16))]` pattern

- **Decision**: Follow this standard pattern with `1rem` safe margin
- **Rationale**: Well-established, widely tested, pure CSS, no JS overhead

### R3: Impact on Questionnaire Overlay

**Task**: Verify the questionnaire overlay (`.questionnaire-overlay`) is not affected  
**Finding**: The questionnaire already has `max-height: 80vh; overflow-y: auto` on `.questionnaire-form`. Its overlay (`.questionnaire-overlay`) uses the same flex centering but its own class name. The fix only modifies `.auth-modal-overlay` and `.auth-modal` selectors — questionnaire styles are completely separate.

- **Decision**: No changes needed for questionnaire
- **Rationale**: Separate CSS selectors, questionnaire already has its own overflow handling

### R4: Animation Compatibility

**Task**: Verify `max-height` and `overflow-y` don't break the entrance animation  
**Finding**: The `authModalEntrance` keyframe animates `opacity` (0→1) and `transform: scale` (0.95→1). Neither `max-height` nor `overflow-y` interfere with these properties. The `animation` property on `.auth-modal` is re-declared in the premium enhancements section and applies independently of layout constraints.

- **Decision**: No animation changes needed
- **Rationale**: `max-height`/`overflow-y` are layout properties that don't conflict with transform/opacity animations

## Summary

All research items resolved. No NEEDS CLARIFICATION items remain. The fix is a 3-property CSS addition — well-established pattern with zero risk to adjacent components.
