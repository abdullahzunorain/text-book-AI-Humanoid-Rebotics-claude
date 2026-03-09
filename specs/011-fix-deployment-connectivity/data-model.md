# Data Model: Fix Deployment Connectivity

**Feature**: 011-fix-deployment-connectivity  
**Date**: 2026-03-09  
**Phase**: 1 — Design

## Overview

This feature introduces no new data entities or schema changes. The "data model" for this feature is the **environment configuration inventory** — the set of environment variables and deployment settings that must be correctly configured for the system to function.

## Environment Variable Inventory

### Railway Backend Environment

| Variable | Type | Required | Example Value | Consumed By |
|----------|------|----------|---------------|-------------|
| `DATABASE_URL` | connection string | Yes | `postgresql://user:pass@host/db?sslmode=require` | `db.py`, `migrate.py` |
| `JWT_SECRET` | string (32+ chars) | Yes | `<random-secret>` | `auth_utils.py` |
| `GOOGLE_API_KEY` | API key | Yes | `AIza...` | `services/agent_config.py` |
| `QDRANT_URL` | URL | Yes | `https://xxx.qdrant.io` | `rag_service.py` |
| `QDRANT_API_KEY` | API key | Yes | `<qdrant-key>` | `rag_service.py` |
| `APP_ENV` | enum | Yes | `production` | `cookie_config.py` |
| `CORS_ORIGINS` | CSV string | Yes | `https://abdullahzunorain.github.io` | `main.py` |
| `PORT` | integer | Auto | `8080` | Railway sets automatically |

### GitHub Actions Environment

| Variable | Scope | Required | Current Value | Consumed By |
|----------|-------|----------|---------------|-------------|
| `API_URL` | Repository variable | Yes | `https://text-book-ai-humanoid-rebotics-claude-production.up.railway.app` | `deploy.yml` → `REACT_APP_API_URL` |

### Build-Time Baked Values

| Config | File | Build-Time Env Var | Default | Notes |
|--------|------|--------------------|---------|-------|
| `apiUrl` | `docusaurus.config.ts:33` | `REACT_APP_API_URL` | `http://localhost:8000` | Baked at build time — requires redeploy to change |

## Railway Configuration (railway.json)

| Setting | Current Value | Notes |
|---------|---------------|-------|
| `builder` | `NIXPACKS` | Auto-detects Python from requirements.txt |
| `startCommand` | `python migrate.py && uvicorn main:app --host 0.0.0.0 --port $PORT` | migrate.py gracefully skips if no DATABASE_URL |
| `healthcheckPath` | `/health` | Simple 200 OK endpoint, no dependencies |
| `healthcheckTimeout` | `120` | 120 seconds — should cover cold start |
| `sleepApplication` | `true` | Serverless sleep after inactivity |
| `restartPolicyType` | `ON_FAILURE` | Auto-restart on crash |
| `restartPolicyMaxRetries` | `10` | Maximum restart attempts |

## Entity Relationships

```
GitHub Actions Variable (API_URL)
    │ build-time injection
    ▼
Docusaurus Config (customFields.apiUrl)
    │ baked into static JS bundle
    ▼
Frontend Components (AuthProvider, ChatbotWidget, etc.)
    │ HTTPS cross-origin requests
    ▼
Railway Backend (CORS_ORIGINS must allow frontend origin)
    │ reads from env vars
    ▼
External Services (Neon DB, Qdrant, Gemini)
```

## Validation Rules

- `CORS_ORIGINS` must NOT have trailing slashes (exact origin match)
- `CORS_ORIGINS` must use `https://` prefix for GitHub Pages domain
- `DATABASE_URL` must include `?sslmode=require` for Neon PostgreSQL
- `APP_ENV` must be exactly `production` (case-sensitive) for secure cookies
- `API_URL` GitHub variable must NOT have trailing slash
