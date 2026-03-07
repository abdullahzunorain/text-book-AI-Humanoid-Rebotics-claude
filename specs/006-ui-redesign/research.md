# Research: Professional UI Redesign

**Feature**: `006-ui-redesign` | **Date**: 2026-03-07

## Decision 1: Primary Color Palette

**Decision**: Replace default Docusaurus green (`#2e8555`) with Deep Indigo (`#6366f1` / Tailwind `indigo-500`).

**Rationale**: Indigo is the modern standard for AI/developer tools (Claude, Linear, Notion, Supabase). Immediately differentiates the product from the stock Docusaurus template. Provides clear contrast and accessibility scores well at AA. Violet end of the spectrum reads as "intelligent/advanced" — appropriate for a Physical AI textbook.

**Alternatives Considered**:
- Blue (`#3b82f6`): Too generic; every website uses it
- Teal (`#14b8a6`): Close to Docusaurus default; insufficient differentiation
- Purple (`#a855f7`): Too flashy; lower contrast on light backgrounds
- Electric Blue (`#2563eb`): Valid but overused in developer tools

**Indigo color scale for Infima CSS variables**:
```
light mode primary: #6366f1 (indigo-500)
primary-dark:       #4f46e5 (indigo-600)
primary-darker:     #4338ca (indigo-700)
primary-darkest:    #3730a3 (indigo-800)
primary-light:      #818cf8 (indigo-400)
primary-lighter:    #a5b4fc (indigo-300)
primary-lightest:   #c7d2fe (indigo-200)

dark mode primary:  #818cf8 (indigo-400)
dark-dark:          #6366f1 (indigo-500)
dark-darker:        #4f46e5 (indigo-600)
dark-darkest:       #4338ca (indigo-700)
dark-light:         #a5b4fc (indigo-300)
dark-lighter:       #c7d2fe (indigo-200)
dark-lightest:      #e0e7ff (indigo-100)
```

---

## Decision 2: Typography — Inter Font

**Decision**: Load Inter font via Google Fonts CDN through Docusaurus's `stylesheets` config. Apply via CSS variable override on `--ifm-font-family-base`.

**Rationale**: Inter is the industry-standard UI/reading font for developer tools, SaaS apps, and technical documentation. Designed specifically for screen legibility at 16–20px sizes. Free, widely cached in browsers, zero build-time dependency.

**Alternatives Considered**:
- System font stack only: Inconsistent cross-platform rendering; no visual upgrade
- Geist: Newer and excellent, but less browser-cached; adds more new bandwidth
- Source Sans 3: Good readability but less modern feel
- DM Sans: Acceptable but less common; not cached

**Google Fonts URL**:
`https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap`

**Config approach**: Add to `docusaurus.config.ts` under `stylesheets: [...]` with `type: "text/css"`. No webpack changes needed.

---

## Decision 3: Hero Section — Pure CSS Gradient (No External Assets)

**Decision**: Use a deep multi-stop `linear-gradient` on the hero `<header>` with a subtle radial pattern overlay via CSS `radial-gradient` pseudo-element. Animated gradient text via `background-clip: text` + CSS `@keyframes` on `background-position`.

**Rationale**: Constitution principle VI ("No Over-Engineering") prohibits JavaScript animation libraries. Pure CSS gradient adds zero network requests, zero JS bundle impact, works in all modern browsers including Safari 14+. Gradient text animation is performant (GPU-composited via `background-clip`).

**Hero gradient value**:
`linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #312e81 100%)`

This covers: dark navy (very dark slate) → dark indigo → medium indigo. Hard to replicate with any other product.

**Alternatives Considered**:
- Hero with stock image: Adds loading latency, copyright risk, doesn't work with dark mode
- Three.js particles: Over-engineered per constitution
- CSS grid geometric shapes: More complex; less universally clean
- Flat gradient (2 stops): Fine but less depth than 3-stop

---

## Decision 4: Feature Cards — CSS Elevation with Hover Effect

**Decision**: Wrap each feature card in a `<div className="feature-card">` with: `border: 1px solid var(--ifm-color-emphasis-200)`, `border-radius: 12px`, `box-shadow: 0 2px 8px rgba(0,0,0,0.06)`, `transition: transform 0.2s, box-shadow 0.2s`, and on hover: `transform: translateY(-4px); box-shadow: 0 8px 24px rgba(99,102,241,0.15)`.

**Rationale**: Card elevation is the single highest-ROI visual upgrade for the Features section. Indigo-tinted shadow on hover reinforces the brand color. Pure CSS — no new dependencies.

**Alternatives Considered**:
- Framer Motion animations: Too heavy (Constitution VI)
- Gradient card borders: More complex; potential overflow/clipping issues
- Image illustrations per feature: Requires design resources not available

---

## Decision 5: Navbar — Backdrop Blur

**Decision**: Override Infima navbar styles in `custom.css` to set `background: rgba(var(--navbar-bg-rgb), 0.85)` with `backdrop-filter: blur(12px)` and a bottom `border-bottom: 1px solid var(--ifm-color-emphasis-200)`. Define CSS variable `--navbar-bg-rgb` for light `255,255,255` / dark `24,24,27` in respective theme blocks.

**Rationale**: Backdrop blur is the single most impactful navbar upgrade — immediately reads as "modern" (macOS, Vercel, Stripe all use it). Supported in all browsers ≥ 2022 (Chrome 76+, Firefox 103+, Safari 14+). Falls back gracefully to solid background on unsupported browsers.

**Alternatives Considered**:
- Navbar scroll animation (hide on scroll down): Requires JS listener — unnecessary complexity
- Solid colored navbar: No differentiation from Docusaurus default
- Sticky scrolled-state shadow only: Less impactful than blur

---

## Decision 6: Action Buttons (Personalize + Translate) — CSS Utility Class

**Decision**: Define a `.action-btn` utility class in `custom.css`. Add this class to the rendered `<button>` elements in `PersonalizeButton.tsx` and `UrduTranslateButton.tsx` (JSX-only change, zero logic modification). Style: `border: 1.5px solid var(--ifm-color-primary)`, `border-radius: 8px`, `padding: 0.45rem 1rem`, `font-size: 0.875rem`, `font-weight: 600`, with hover `background` tint and `transform: translateY(-1px)`.

**Rationale**: Minimal change to `.tsx` files (only adds a `className` property to the button). All visual logic stays in CSS. Keeps component business logic completely untouched.

**Alternatives Considered**:
- CSS Module per component: More files; harder to maintain consistent cross-component style
- Inline styles: Breaks dark mode; not maintainable
- Docusaurus `button--primary` class: Conflicts with Infima default styles in doc page context

---

## Decision 7: Auth Modal Polish — Remove Hardcoded Focus Color

**Decision**: In `auth-modal.css`, replace the hardcoded `rgba(46, 133, 85, 0.2)` (old green) in the `.auth-field input:focus` box-shadow with `rgba(99, 102, 241, 0.25)` matching the new indigo primary. Also increase `border-radius` on `.auth-modal` from `8px` to `12px` and `.auth-field input` from `4px` to `8px`.

**Rationale**: The hardcoded green focus ring is the most visible "stale state" artifact after the palette change. Border-radius upgrade from 4→8px and 8→12px is the modern feel standard. No logic changes.

---

## Summary: No [NEEDS CLARIFICATION] Items Remain

All 7 decisions are made with rationale and alternatives documented. The implementation touches 6 files:
1. `website/docusaurus.config.ts` — Inter font stylesheet
2. `website/src/css/custom.css` — palette, navbar, typography, action-btn, focus
3. `website/src/css/auth-modal.css` — fix focus ring, border-radius polish
4. `website/src/components/chatbot.css` — border-radius, panel shadow enhancement
5. `website/src/pages/index.tsx` — hero restructure, feature cards  
6. `website/src/pages/index.module.css` — hero gradient + animation CSS

Plus 2 TSX files with className-only changes (no logic):
7. `website/src/components/PersonalizeButton.tsx`
8. `website/src/components/UrduTranslateButton.tsx`
