# Research: Fix Duplicate Button Rendering

**Feature**: 016-fix-duplicate-buttons  
**Date**: 2026-03-11  
**Status**: Complete — all unknowns resolved

## Research Tasks

### 1. Which "Show Original" button to keep (Personalization)

**Context**: Two buttons exist when personalized content is active:
- `PersonalizeButton.tsx` (line 96): renders `📖 Show Original` as the toggle button text
- `PersonalizedContent.tsx` (line 95): renders `Show Original` inside a banner div

**Decision**: Keep the `PersonalizeButton` toggle; remove the button from `PersonalizedContent`.

**Rationale**:
- The trigger button (`PersonalizeButton`) is always visible above the content area and already toggles its text between "🎯 Personalize This Chapter" and "📖 Show Original"
- The content component's button is redundant — it duplicates the exact same callback (`onShowOriginal`) that the trigger button already invokes
- Removing from the content component is the smaller change (remove one `<button>` element) vs. suppressing the trigger button's text change
- The banner div ("🎯 Personalized for your learning profile") remains as a visual indicator; only its embedded button is removed

**Alternatives considered**:
- Keep content button, suppress trigger button → more complex (would need conditional rendering in `PersonalizeButton` based on active state, breaking its simple toggle pattern)
- Merge both into a shared component → over-engineering for a 3-component fix

### 2. Which "Read in English" button to keep (Translation)

**Context**: Two buttons exist when Urdu content is active:
- `UrduTranslateButton.tsx` (line 101): renders `Read in English` as the toggle button text
- `UrduContent.tsx` (line 63): renders `Read in English` at the top of the RTL content block

**Decision**: Keep the `UrduTranslateButton` toggle; remove the button from `UrduContent`.

**Rationale**:
- Identical pattern to personalization — the trigger button already toggles its label
- The trigger button sits in the same button bar as the personalization button (consistent positioning)
- `UrduContent` also has a "↺ Refresh Translation" companion button on `UrduTranslateButton`, so the trigger area is the natural home for all translation controls
- Removing the content button preserves RTL layout without leaving an orphaned button position

**Alternatives considered**:
- Keep content button, hide trigger → inconsistent with personalization fix; trigger area would look empty
- Both approaches are functionally equivalent; trigger-button approach is consistent across features

### 3. Chatbot close button strategy

**Context**: Two close controls exist when chatbot panel is open:
- Floating toggle button (line 177): changes icon from `💬` to `✕`, has `aria-label="Close chatbot"`
- Panel header close button (line 191): dedicated `✕` with `aria-label="Close chatbot"`

**Decision**: Hide the floating toggle entirely when the panel is open; keep the panel header `✕`.

**Rationale**:
- Standard UI pattern: dialog/panel close buttons live in the panel header, not outside the panel
- The floating toggle's primary job is to **open** the chatbot — showing `✕` on a detached floating button is confusing
- When the panel is open, the floating toggle is visually behind/adjacent to the panel, creating visual clutter
- Hiding the toggle when `isOpen=true` means: panel header `✕` closes → toggle reappears as `💬`
- Implementation: wrap the toggle `<button>` in `{!isOpen && ...}` — one line change

**Alternatives considered**:
- Keep floating toggle visible showing `💬` when open → confusing (what does clicking 💬 do when chat is already open?)
- Remove panel header ✕, keep only floating toggle → non-standard; panels should have their own close affordance
- Keep both but differentiate visually → doesn't solve the "two close buttons" problem

### 4. Prop cleanup assessment

**Context**: Once the inline buttons are removed from `PersonalizedContent` and `UrduContent`, the `onShowOriginal` and `onShowEnglish` props are no longer used inside those components.

**Decision**: Remove the unused props from the component interfaces and their call sites in `LayoutWrapper`.

**Rationale**:
- Dead props trigger TypeScript warnings and confuse future developers
- This is a natural consequence of the button removal, not a separate refactor
- Changes are confined to: interface definition, component destructuring, and `LayoutWrapper` JSX props

**Alternatives considered**:
- Keep props for "future use" → violates YAGNI; the trigger buttons handle the callbacks
