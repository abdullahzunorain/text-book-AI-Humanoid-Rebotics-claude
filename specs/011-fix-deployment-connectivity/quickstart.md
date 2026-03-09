# Quickstart: Deployment Verification Runbook

**Feature**: 011-fix-deployment-connectivity  
**Date**: 2026-03-09

## Prerequisites

- GitHub CLI (`gh`) authenticated with repo access
- `curl` available
- Access to Railway dashboard for the project
- Browser with DevTools for end-to-end verification

## Step 1: Verify Railway Environment Variables

Open Railway dashboard → Project → Variables tab. Confirm these are set:

| Variable | Expected Format |
|----------|----------------|
| `DATABASE_URL` | `postgresql://...?sslmode=require` |
| `JWT_SECRET` | Random string, 32+ characters |
| `GOOGLE_API_KEY` | `AIza...` |
| `QDRANT_URL` | `https://...qdrant.io` |
| `QDRANT_API_KEY` | Non-empty string |
| `APP_ENV` | `production` |
| `CORS_ORIGINS` | `https://abdullahzunorain.github.io` |

**Verify**: All 7 variables are present and non-empty.

## Step 2: Verify Backend Health

```bash
# Test health endpoint
curl -sS --max-time 30 https://text-book-ai-humanoid-rebotics-claude-production.up.railway.app/health

# Expected: {"status":"ok"}

# Test root endpoint
curl -sS --max-time 30 https://text-book-ai-humanoid-rebotics-claude-production.up.railway.app/

# Expected: {"service":"Physical AI Textbook RAG API","version":"2.0.0",...}
```

**If /health returns 502**: Wait 30 seconds (cold-start wake-up) and retry. If persistent, check Railway deployment logs for startup errors.

## Step 3: Verify GitHub Actions API_URL Variable

```bash
gh variable list
# Expected: API_URL = https://text-book-ai-humanoid-rebotics-claude-production.up.railway.app
```

## Step 4: Trigger Frontend Redeploy

```bash
gh workflow run deploy.yml
# OR: gh workflow run "Deploy Docusaurus to GitHub Pages"
```

Wait for the workflow to complete:
```bash
gh run list --workflow=deploy.yml --limit=1
```

## Step 5: Verify Frontend API URL

Open browser → `https://abdullahzunorain.github.io/text-book-AI-Humanoid-Rebotics-CLAUDE/`

1. Open DevTools → Network tab
2. Trigger a chat interaction (click chatbot, type a question)
3. Verify the request URL targets `text-book-ai-humanoid-rebotics-claude-production.up.railway.app`
4. NOT `localhost:8000`

## Step 6: End-to-End Verification

1. **Chat**: Open chatbot → ask "What is ROS 2?" → verify response appears
2. **Auth**: Sign up with email/password → verify success
3. **Session**: Refresh page → verify still signed in (cookie persists)
4. **CORS**: Check DevTools Console → verify zero CORS errors
5. **Translate**: Click translate on any section → verify Urdu translation appears

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `/health` 502 | Cold start, missing env vars | Check Railway logs, verify env vars |
| CORS error in console | `CORS_ORIGINS` missing or wrong | Set to exact origin (no trailing slash) |
| Cookies not persisting | `APP_ENV` not `production` | Set `APP_ENV=production` in Railway |
| Frontend still calls localhost | Workflow not re-triggered | Run `gh workflow run deploy.yml` |
| Auth 500 errors | Missing `JWT_SECRET` | Set in Railway variables |
| Chat 503 errors | Missing `GOOGLE_API_KEY` | Set in Railway variables |
| RAG returns empty | Missing Qdrant credentials | Set `QDRANT_URL` and `QDRANT_API_KEY` |
