# Feature Specification: Fix Deployment Connectivity

**Feature Branch**: `011-fix-deployment-connectivity`  
**Created**: 2026-03-09  
**Status**: Complete  
**Input**: User description: "Fix Deployment Connectivity — diagnose /health 502, verify Railway env vars, trigger frontend redeploy with correct API_URL, end-to-end verification of full-stack flow"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Backend Health Check Responds Successfully (Priority: P1)

As a developer or monitoring system, I need the Railway-deployed backend's `/health` endpoint to return a successful response so that Railway's healthcheck passes and the service stays available.

**Why this priority**: If the healthcheck fails, Railway may mark the service unhealthy or restart it continuously, making the entire backend unreachable. This blocks all other fixes.

**Independent Test**: Hit `https://text-book-ai-humanoid-rebotics-claude-production.up.railway.app/health` with a GET request and confirm a 200 response with `{"status": "ok"}`.

**Acceptance Scenarios**:

1. **Given** the backend is deployed on Railway, **When** a GET request is sent to `/health`, **Then** the response status is 200 and the body contains `{"status": "ok"}`.
2. **Given** the Railway service has been idle (cold start scenario), **When** a GET request is sent to `/health` within the configured healthcheck timeout, **Then** the response status is 200 (not 502).
3. **Given** Railway's healthcheck runs automatically, **When** the service starts up, **Then** the healthcheck passes within the configured timeout window and the service is marked healthy.

---

### User Story 2 — Railway Environment Variables Are Complete (Priority: P1)

As a developer, I need all required environment variables set correctly in the Railway deployment so that the backend can connect to its database, vector store, and external APIs without runtime errors.

**Why this priority**: Missing env vars cause silent failures — auth won't work without `JWT_SECRET`, RAG won't work without Qdrant credentials, and CORS will block all frontend requests without `CORS_ORIGINS`. This is tied with P1 because it may be the root cause of the 502.

**Independent Test**: Verify each required env var is set in Railway dashboard and that backend endpoints depending on those services respond correctly.

**Acceptance Scenarios**:

1. **Given** the Railway deployment environment, **When** the list of environment variables is reviewed, **Then** all required variables are present: `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY`, `APP_ENV`, `CORS_ORIGINS`.
2. **Given** `CORS_ORIGINS` is set, **When** its value is inspected, **Then** it includes `https://abdullahzunorain.github.io`.
3. **Given** `APP_ENV` is set to `production`, **When** the backend starts, **Then** auth cookies are configured with `SameSite=None; Secure` for cross-origin compatibility.

---

### User Story 3 — Frontend Deployed with Correct API_URL (Priority: P1)

As a user visiting the GitHub Pages site, I need the frontend to send API requests to the Railway backend (not localhost) so that chatbot, auth, and all interactive features work in production.

**Why this priority**: Even if the backend is healthy, users cannot interact with it if the frontend still points to `localhost:8000`. The frontend must be redeployed with the updated `API_URL` GitHub Actions variable.

**Independent Test**: Visit `https://abdullahzunorain.github.io/text-book-AI-Humanoid-Rebotics-CLAUDE/`, open browser DevTools network tab, trigger a chat interaction, and confirm requests go to the Railway domain.

**Acceptance Scenarios**:

1. **Given** the GitHub Actions `API_URL` variable is set to the Railway backend URL, **When** the deploy workflow runs, **Then** the built frontend uses that URL for all API calls.
2. **Given** the frontend is deployed on GitHub Pages, **When** a user opens the site and interacts with the chatbot, **Then** network requests target `https://text-book-ai-humanoid-rebotics-claude-production.up.railway.app` (not `localhost`).
3. **Given** the deploy workflow completes, **When** the GitHub Pages site is accessed, **Then** the site loads without errors and JavaScript bundles contain the correct API URL.

---

### User Story 4 — End-to-End Cross-Origin Flow Works (Priority: P2)

As a user on the GitHub Pages frontend, I need to be able to use the chatbot, sign in, and have my session persist so that the full application experience works across the two deployment domains.

**Why this priority**: This is the integration verification that confirms all individual fixes (health, env vars, frontend redeploy) work together. It depends on stories 1-3 being resolved first.

**Independent Test**: Open the GitHub Pages site, sign in, send a chat message, verify the response appears, refresh the page, and confirm the session persists.

**Acceptance Scenarios**:

1. **Given** the frontend and backend are both deployed and configured, **When** a user sends a chat message, **Then** the backend responds and the answer appears in the UI.
2. **Given** CORS is configured to allow the GitHub Pages origin, **When** the frontend makes cross-origin requests to the backend, **Then** no CORS errors appear in the browser console.
3. **Given** `APP_ENV=production` and cookies are set with `SameSite=None; Secure`, **When** a user signs in on the frontend, **Then** the auth cookie is set and persists across page refreshes.

---

### Edge Cases

- What happens if Railway cold-starts the backend after a period of inactivity? The healthcheck timeout (120s) must be sufficient for the app to boot and respond.
- What happens if `CORS_ORIGINS` is set but does not include the trailing slash or includes a typo? The origin must exactly match `https://abdullahzunorain.github.io` (no trailing slash).
- What happens if the GitHub Actions `API_URL` variable is set but the workflow is not re-triggered? The frontend will still use the old bundled URL until redeployed.
- What happens if the Railway deployment has `serverless sleep` enabled and the first request after wake-up hits `db.py`'s lazy pool initialization? The `ensure_pool()` pattern should handle this, but the combined wake + DB connect time must fit within the healthcheck timeout.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The backend `/health` endpoint MUST return HTTP 200 with `{"status": "ok"}` on Railway, including after cold starts.
- **FR-002**: Railway deployment MUST have all required environment variables configured: `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY`, `APP_ENV`, `CORS_ORIGINS`.
- **FR-003**: `CORS_ORIGINS` MUST include `https://abdullahzunorain.github.io` to allow cross-origin requests from the frontend.
- **FR-004**: `APP_ENV` MUST be set to `production` so that cookie configuration uses `SameSite=None; Secure` for cross-origin auth.
- **FR-005**: The GitHub Actions deploy workflow MUST build the frontend with `REACT_APP_API_URL` set to the Railway backend URL.
- **FR-006**: The frontend MUST be redeployed (GitHub Actions workflow re-triggered) after the `API_URL` variable is updated.
- **FR-007**: Cross-origin requests from the frontend to the backend MUST succeed without CORS errors.
- **FR-008**: Auth cookies MUST be transmitted and persisted across the GitHub Pages ↔ Railway cross-origin boundary.

### Constraints

- No changes to existing backend code functionality — configuration and deployment fixes only.
- No changes to existing frontend page functionality — only rebuild/redeploy with correct environment.
- Changes must be minimal: environment variable configuration, deployment trigger, and (if needed) Railway healthcheck timeout adjustment.

### Assumptions

- The Railway backend application code is correct and works locally; the issues are purely deployment configuration.
- The GitHub Actions deploy workflow at `.github/workflows/deploy.yml` is functional and only needs the correct `API_URL` variable and a re-trigger.
- The `railway.json` healthcheck configuration (path `/health`, timeout 120s) is adequate once the backend boots successfully.
- Neon PostgreSQL, Qdrant Cloud, and Google Gemini API credentials are available and valid.
- The Railway Nixpacks build successfully installs all Python dependencies from `requirements.txt`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The backend `/health` endpoint returns HTTP 200 within 5 seconds on a warm request and within 120 seconds on a cold start.
- **SC-002**: All 7 required Railway environment variables are confirmed present and non-empty.
- **SC-003**: The deployed frontend makes API requests to the Railway backend URL (zero requests to localhost in production).
- **SC-004**: A user can complete a full chat interaction (send message → receive AI response) on the GitHub Pages site without errors.
- **SC-005**: Cross-origin auth cookies are set, transmitted, and persist across page refreshes on the GitHub Pages site.
- **SC-006**: The browser console shows zero CORS-related errors during normal frontend-backend interaction.
