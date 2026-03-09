# Quickstart: Verify Translate & Personalize Fix

**Feature**: `012-fix-translate-personalize-404`  
**Date**: 2026-03-09

## Prerequisites

- Railway backend deployed with latest code from `012-fix-translate-personalize-404` branch
- Auth credentials (test user signed up)
- `curl` available

## Step 1: Verify backend is healthy

```bash
curl -sS https://text-book-ai-humanoid-rebotics-claude-production.up.railway.app/health
# Expected: {"status":"ok"}
```

## Step 2: Sign in and capture token

```bash
curl -sS -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}' \
  -c cookies.txt \
  https://text-book-ai-humanoid-rebotics-claude-production.up.railway.app/api/auth/signin
# Expected: 200 with user info; cookies.txt has JWT
```

## Step 3: Test translate endpoint

```bash
curl -sS -X POST \
  -H "Content-Type: application/json" \
  -H "Origin: https://abdullahzunorain.github.io" \
  -b cookies.txt \
  -d '{"chapter_slug":"module1-ros2/01-architecture"}' \
  https://text-book-ai-humanoid-rebotics-claude-production.up.railway.app/api/translate
# Expected: 200 with {"translated_content":"...", "original_code_blocks":[...]}
# Currently: 404 (pre-fix)
```

## Step 4: Test personalize endpoint

```bash
curl -sS -X POST \
  -H "Content-Type: application/json" \
  -H "Origin: https://abdullahzunorain.github.io" \
  -b cookies.txt \
  -d '{"chapter_slug":"module1-ros2/01-architecture"}' \
  https://text-book-ai-humanoid-rebotics-claude-production.up.railway.app/api/personalize
# Expected: 200 with {"personalized_content":"..."}
# Currently: 404 (pre-fix)
```

## Step 5: Verify no regressions

```bash
# Chat should still work
curl -sS -X POST \
  -H "Content-Type: application/json" \
  -d '{"question":"What is ROS 2?"}' \
  https://text-book-ai-humanoid-rebotics-claude-production.up.railway.app/api/chat
# Expected: 200 with {"answer":"...","sources":[...]}

# Chat history should work
curl -sS -b cookies.txt \
  https://text-book-ai-humanoid-rebotics-claude-production.up.railway.app/api/chat/history?limit=5
# Expected: 200 with history array
```

## Step 6: Run backend tests locally

```bash
cd backend && python -m pytest tests/ -v
# Expected: 119+ tests pass (plus any new tests added in this feature)
```

## Success Criteria Checklist

- [ ] `/api/translate` returns 200 for valid chapter slug
- [ ] `/api/personalize` returns 200 for valid chapter slug
- [ ] `/api/translate` returns 404 for non-existent slug (not 500)
- [ ] `/api/chat` still returns 200 (no regression)
- [ ] `/api/auth/*` endpoints still work (no regression)
- [ ] All backend tests pass
