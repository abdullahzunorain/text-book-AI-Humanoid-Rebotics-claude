# Contract: railway.json Config-as-Code

**Feature**: `010-fix-railway-deploy` | **Date**: 2026-03-09

## Overview

The `railway.json` file is the single source of truth for Railway deployment configuration.
All settings previously configured only in the Railway dashboard must be defined here.

## Schema

File: `backend/railway.json`
Schema: `https://railway.com/railway.schema.json`

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "watchPatterns": ["backend/**"]
  },
  "deploy": {
    "startCommand": "python migrate.py && uvicorn main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 120,
    "sleepApplication": true,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Field Definitions

### build

| Field | Type | Value | Purpose |
|-------|------|-------|---------|
| `builder` | string | `"NIXPACKS"` | Auto-detect Python from runtime.txt |
| `watchPatterns` | string[] | `["backend/**"]` | Only trigger builds when backend files change |

### deploy

| Field | Type | Value | Purpose |
|-------|------|-------|---------|
| `startCommand` | string | `"python migrate.py && uvicorn main:app --host 0.0.0.0 --port $PORT"` | Run migrations then start server |
| `healthcheckPath` | string | `"/health"` | Railway polls this endpoint to confirm service is healthy |
| `healthcheckTimeout` | number | `120` | Seconds to wait for healthcheck after deploy (includes cold-start) |
| `sleepApplication` | boolean | `true` | Enable serverless sleep after inactivity |
| `restartPolicyType` | string | `"ON_FAILURE"` | Auto-restart on crash |
| `restartPolicyMaxRetries` | number | `10` | Max restart attempts before giving up |

## Behavioral Contract

1. **Build trigger**: A push to the tracked branch only triggers a build if files matching `backend/**` are changed.
2. **Start sequence**: `migrate.py` runs first (idempotent SQL), then `uvicorn` starts.
3. **Health check**: Railway sends `GET /health` and expects HTTP 200 within 120s. If no 200 within timeout, deploy is rolled back.
4. **Sleep**: After ~15 min inactivity, Railway pauses the container. Next request wakes it (cold start).
5. **Restart**: On app crash, Railway restarts up to 10 times before marking the deploy as failed.

## Breaking Changes

- `startCommand` changes from `uvicorn main:app ...` to `python migrate.py && uvicorn main:app ...` — this is additive (migrations are idempotent).
- Added `watchPatterns` — this is new behavior; previously ALL commits triggered builds.
