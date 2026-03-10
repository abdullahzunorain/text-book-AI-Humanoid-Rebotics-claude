# E2E Bug Report — Playwright Browser Testing

**Date**: 2026-03-10  
**Tester**: AI Agent (Playwright MCP, non-headless Chromium)  
**Environment**: localhost — Frontend (Docusaurus 3000), Backend (FastAPI 8000)  
**Test Account**: `testuser_e2e@example.com` / `TestPass123!`

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 High | 3 |
| 🟠 Medium | 5 |
| 🟡 Low | 3 |
| **Total** | **11** |

---

## 🔴 High Severity

### BUG-001: Root URL returns 404

- **URL**: `http://localhost:3000/`
- **Expected**: Redirect to `/text-book-AI-Humanoid-Rebotics-CLAUDE/` or show homepage
- **Actual**: Shows "Page Not Found" (Docusaurus 404 page)
- **Impact**: Users visiting the root URL see an error instead of the app
- **Root Cause**: `baseUrl` in `docusaurus.config.ts` is `/text-book-AI-Humanoid-Rebotics-CLAUDE/` with no redirect from `/`
- **Repro**: Navigate to `http://localhost:3000/`

### BUG-002: Personalized content renders raw Markdown frontmatter

- **Page**: Any docs page → click "Personalize This Chapter"
- **Expected**: Personalized content renders as clean HTML
- **Actual**: Raw Markdown frontmatter `--- title: "Introduction: What is Physical AI?" sidebar_position: 1 ---` appears as visible text in the personalized view
- **Impact**: Breaks reading experience; exposes internal metadata to users
- **Root Cause**: Backend personalization service returns content with frontmatter intact; frontend doesn't strip or parse it
- **Repro**: Sign in → Navigate to any chapter → Click "🎯 Personalize This Chapter" → Observe raw `---` frontmatter block at top of content

### BUG-003: Personalized content shows raw Markdown table syntax

- **Page**: Any docs page with tables → "Personalize This Chapter"
- **Expected**: Tables render as HTML tables
- **Actual**: Raw Markdown table syntax `| Sensor Type | What It Measures` shown as plain text
- **Impact**: Tables are unreadable in personalized view
- **Root Cause**: Personalized content is returned as raw Markdown but rendered without a Markdown parser
- **Repro**: Sign in → Navigate to intro page → Personalize → Scroll to table section

---

## 🟠 Medium Severity

### BUG-004: Console 401 error on `/api/auth/me` on every page load

- **Page**: Every page, whether signed in or not
- **Expected**: No console errors when not authenticated (silent fallback)
- **Actual**: `[ERROR] Failed to load resource: the server responded with a status of 401 (Unauthorized) @ http://localhost:8000/api/auth/me` on every page load
- **Impact**: Noisy console; potential performance hit; confusing for developers
- **Root Cause**: Frontend always calls `/api/auth/me` on mount without checking if a session might exist first
- **Repro**: Open DevTools → Navigate to any page → See 401 error in console

### BUG-005: Homepage claims "6 Modules" but only 4 exist

- **Page**: Homepage (`/text-book-AI-Humanoid-Rebotics-CLAUDE/`)
- **Expected**: Stats reflect actual content count
- **Actual**: Footer stats show "6 Modules" but sidebar has only 4 modules (module1-ros2, module2-simulation, module3-isaac, module4-vla)
- **Impact**: Misleads users about content scope
- **Root Cause**: Hardcoded stat values in homepage component not updated when module count changed
- **Repro**: Visit homepage → Look at stats section → Count "6 Modules" → Check sidebar (4 modules)

### BUG-006: Duplicate "Show Original" buttons in personalized view

- **Page**: Any docs page with personalized content active
- **Expected**: Single "Show Original" button
- **Actual**: Two separate "📖 Show Original" buttons appear (observed at refs e639 and e644)
- **Impact**: Confusing UX; unclear which button to click
- **Repro**: Sign in → Personalize a chapter → Observe two "Show Original" buttons

### BUG-007: Duplicate "Read in English" buttons during Urdu translation

- **Page**: Any docs page with Urdu translation active
- **Expected**: Single "Read in English" toggle button
- **Actual**: Two "Read in English" buttons appear (observed at refs e405 and e409)
- **Impact**: Confusing UX duplication
- **Repro**: Navigate to any chapter → Click "اردو میں پڑھیں" → Observe two "Read in English" buttons

### BUG-008: Duplicate "Close chatbot" buttons in chatbot widget

- **Page**: Any docs page with chatbot open
- **Expected**: Single close (✕) button
- **Actual**: Two "Close chatbot ✕" buttons appear (observed at refs e465 and e469)
- **Impact**: Confusing UX
- **Repro**: Open chatbot on any chapter → Observe two ✕ close buttons

---

## 🟡 Low Severity

### BUG-009: OAuth buttons (Google, GitHub) shown but disabled

- **Page**: Auth modal (Sign In / Sign Up)
- **Expected**: Either fully functional OAuth buttons or hidden if not implemented
- **Actual**: Google and GitHub OAuth buttons are rendered but with `[disabled]` attribute
- **Impact**: Users may think the feature is broken rather than not yet implemented
- **Repro**: Click "Sign In" → Observe disabled Google/GitHub buttons

### BUG-010: Personalized view has empty paragraphs

- **Page**: Personalized view on any docs page
- **Expected**: Clean content without blank elements
- **Actual**: Several empty `<p>` tags rendered (observed at refs e649, e654, e660)
- **Impact**: Minor visual clutter; excessive whitespace
- **Repro**: Personalize a chapter → Scroll through content → Observe blank paragraph gaps

### BUG-011: Dark mode toggle disabled on 404 page

- **Page**: 404 "Page Not Found" page
- **Expected**: Theme toggle works everywhere
- **Actual**: Theme toggle button has `[disabled]` attribute on 404 pages
- **Impact**: Minor — users can't switch themes while on 404 page
- **Repro**: Navigate to a non-existent URL → Try to toggle dark/light mode

---

## Features Tested (Working Correctly) ✅

| Feature | Status | Notes |
|---------|--------|-------|
| Homepage rendering | ✅ PASS | Loads correctly at baseUrl |
| Chapter navigation | ✅ PASS | Sidebar links work, content renders |
| Sign Up flow | ✅ PASS | Account created, onboarding shown |
| Sign In flow | ✅ PASS | Existing account login works |
| Cookie persistence | ✅ PASS | Auth persists across page navigations |
| Chatbot Q&A | ✅ PASS | RAG responses with sources |
| Text selection → "Ask about this" | ✅ PASS | Context-aware responses |
| Urdu translation | ✅ PASS | Full page translation, toggle back works |
| Personalization (content adaptation) | ✅ PASS | Content adapts to user profile |
| Empty chatbot input prevention | ✅ PASS | Send button disabled, Enter does nothing |

---

## Recommendations

1. **Immediate fixes** (BUG-001, 002, 003): Add `/` → `baseUrl` redirect; strip frontmatter and render Markdown in personalized view
2. **UX cleanup** (BUG-006, 007, 008): Investigate duplicate button rendering — likely a React key/rendering issue in feature toggle components
3. **Content audit** (BUG-005): Update homepage stats to "4 Modules" or add more modules
4. **Error handling** (BUG-004): Suppress 401 console error for unauthenticated users (catch and handle gracefully in frontend auth hook)
5. **OAuth** (BUG-009): Either implement OAuth or hide the buttons with a "Coming Soon" label
