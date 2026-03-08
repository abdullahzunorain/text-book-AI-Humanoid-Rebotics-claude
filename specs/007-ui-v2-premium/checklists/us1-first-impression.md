# US1: First Impression Excellence - Acceptance Checklist

**User Story**: As a first-time visitor, I want to see a stunning, professional hero section that immediately establishes credibility and captures my attention.

**Independent Test**: Open homepage in desktop + 375px mobile and verify hero animation stack, typography clamp, and dual CTA hierarchy load within 3 seconds.

## Visual Requirements

### Hero Background & Overlays
- [ ] Mesh/dot-grid or radial-gradient overlay visible behind hero text (CSS ::before pseudo-element)
- [ ] Overlay is subtle and doesn't interfere with text readability
- [ ] Floating glow orb visible (large blurred radial gradient circle, purple/indigo, ~40% opacity)
- [ ] Glow orb animates smoothly with CSS @keyframes (slow drift/float effect)
- [ ] Glow orb animation respects prefers-reduced-motion

### Hero Typography
- [ ] Hero title uses clamp(2.2rem, 5vw, 3.5rem) for responsive sizing
- [ ] Hero title has font-weight: 800 (extra bold)
- [ ] Title gradient animation works smoothly
- [ ] Typography is readable on both light and dark backgrounds

### Shimmer Badge
- [ ] Animated badge/pill appears above the title (e.g., "✨ Interactive AI Textbook")
- [ ] Badge has shimmer/glow border animation (CSS @keyframes)
- [ ] Badge animation respects prefers-reduced-motion
- [ ] Badge is visible and readable on mobile (375px)

### Dual CTA Hierarchy
- [ ] Primary CTA "Start Reading →" is prominent with gradient background
- [ ] Secondary CTA "View on GitHub →" is visible as ghost/outline button
- [ ] Both CTAs are aligned horizontally on desktop
- [ ] CTAs stack vertically or maintain proper spacing on mobile
- [ ] Both CTAs have appropriate hover states
- [ ] CTA buttons are at least 44x44px for touch targets on mobile

## Functional Requirements

### Animation Performance
- [ ] All hero animations run at 60fps (no visible jank)
- [ ] Animations don't block page load or first paint
- [ ] Reduced motion users see graceful fallback (instant appearance, no animation)

### Responsiveness
- [ ] Hero section looks great at 375px width (iPhone SE)
- [ ] Hero section looks great at 768px width (tablet)
- [ ] Hero section looks great at 1920px width (desktop)
- [ ] All text remains readable at all breakpoints
- [ ] No horizontal scroll at any viewport size

### Dark Mode
- [ ] Hero mesh overlay works in dark mode
- [ ] Glow orb is visible but not too bright in dark mode
- [ ] Shimmer badge is visible in dark mode
- [ ] Both CTAs maintain visual hierarchy in dark mode
- [ ] Title gradient remains visible and attractive in dark mode

### RTL Support
- [ ] Hero layout mirrors correctly in RTL (Urdu)
- [ ] CTA buttons maintain correct order in RTL
- [ ] Shimmer badge positions correctly in RTL
- [ ] Text alignment is correct in RTL

## Load Performance
- [ ] Hero section visible within 3 seconds on 3G connection
- [ ] No layout shift during hero animation initialization
- [ ] CSS animations don't cause repaints of the entire page

## Browser Compatibility
- [ ] Chrome/Edge (last 2 versions)
- [ ] Firefox (last 2 versions)
- [ ] Safari (last 2 versions)
- [ ] Backdrop-filter/blur effects have fallback for older browsers

## Status: ⏸️ PENDING IMPLEMENTATION
