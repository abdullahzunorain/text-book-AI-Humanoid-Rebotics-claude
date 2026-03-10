# Quickstart: Verifying Fix for Duplicate Button Rendering

**Feature**: 016-fix-duplicate-buttons  
**Branch**: `016-fix-duplicate-buttons`

## Prerequisites

- Node.js 18+ installed
- Python 3.11+ with `uv` package manager
- Repository cloned and on the correct branch

## 1. Start the Frontend

```bash
cd website
npm install
npm start
```

Site runs at http://localhost:3000/text-book-AI-Humanoid-Rebotics-CLAUDE/

## 2. Verify TypeScript Compilation

```bash
cd website
npx tsc --noEmit
```

Expected: zero errors.

## 3. Run Backend Tests (Regression Gate)

```bash
cd backend
uv run pytest tests/ -q
```

Expected: 143+ tests pass, 0 failures.

## 4. Manual Verification Checklist

### Personalization (BUG-006)
1. Sign in with valid credentials
2. Navigate to any chapter (e.g., `/docs/intro/what-is-physical-ai`)
3. Click "🎯 Personalize This Chapter"
4. **Verify**: Exactly ONE "Show Original" button visible (the trigger button, not an inline one)
5. Click "📖 Show Original" → original content restored

### Urdu Translation (BUG-007)
1. Sign in with valid credentials
2. Navigate to any chapter
3. Click "اردو میں پڑھیں"
4. **Verify**: Exactly ONE "Read in English" button visible (the trigger button, not an inline one)
5. Click "Read in English" → English content restored

### Chatbot (BUG-008)
1. Navigate to any chapter
2. Click the 💬 floating button
3. **Verify**: Floating toggle disappears; exactly ONE ✕ close button visible (in panel header)
4. Click the panel header ✕ → panel closes, 💬 toggle reappears

### Edge Cases
- Rapidly toggle personalization on/off — no stale buttons
- Activate personalization then switch to Urdu — only Urdu "Read in English" visible
- Check on mobile viewport (≤768px) — single buttons remain accessible
