# Feature Specification: Fix Translate & Personalize 404 Errors on Railway

**Feature Branch**: `012-fix-translate-personalize-404`  
**Created**: 2026-03-09  
**Status**: Complete  
**Input**: User description: "Fix translate and personalize 404 errors on Railway — docs markdown files not bundled in backend container, causing chapter-dependent endpoints to fail. Ensure each FastAPI functionality works perfectly in production."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Translate Chapter Returns Content Instead of 404 (Priority: P1)

An authenticated user on the GitHub Pages frontend clicks "Translate to Urdu" on any chapter. The request goes to `POST /api/translate` on Railway. Currently this always returns 404 because the backend cannot find the `website/docs/` markdown files — they are not present in the Railway container (Railway root is `/backend`, and docs live in `/website/docs/`). After this fix, the endpoint reads the chapter content and returns the Urdu translation.

**Why this priority**: Translation is a core user-facing feature. Every translate attempt currently fails in production.

**Independent Test**: Authenticated user sends `POST /api/translate {"chapter_slug": "module1-ros2/01-architecture"}` to the Railway backend and receives a 200 response with `translated_content` and `original_code_blocks` fields.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the live site, **When** they request translation of an existing chapter slug, **Then** they receive HTTP 200 with the translated Urdu content and preserved code blocks.
2. **Given** an authenticated user, **When** they request translation of a non-existent chapter slug, **Then** they receive HTTP 404 with a meaningful error message (not a filesystem error).
3. **Given** a new chapter is added to `website/docs/`, **When** the backend is redeployed, **Then** the new chapter is available for translation without manual intervention.

---

### User Story 2 — Personalize Chapter Returns Content Instead of 404 (Priority: P1)

An authenticated user with a saved learning profile clicks "Personalize" on any chapter. The request goes to `POST /api/personalize` on Railway. Like translate, this always returns 404 because the docs markdown files are missing from the container. After this fix, the endpoint reads the chapter content, applies personalization based on the user's background, and returns tailored content.

**Why this priority**: Personalization is a core user-facing feature, same root cause as US1. Both must be fixed together.

**Independent Test**: Authenticated user sends `POST /api/personalize {"chapter_slug": "module1-ros2/01-architecture"}` to the Railway backend and receives a 200 response with `personalized_content`.

**Acceptance Scenarios**:

1. **Given** an authenticated user with a saved background profile, **When** they request personalization of an existing chapter, **Then** they receive HTTP 200 with content tailored to their profile.
2. **Given** an authenticated user without a background profile, **When** they request personalization, **Then** they receive HTTP 200 with content personalized using default (beginner) settings.
3. **Given** a non-existent chapter slug, **When** the user requests personalization, **Then** they receive HTTP 404 with a clear error message.

---

### User Story 3 — All Backend Endpoints Work End-to-End in Production (Priority: P2)

After fixing translate and personalize, every FastAPI endpoint works correctly when accessed from the GitHub Pages frontend. This is a verification story to confirm no regressions and complete functionality.

**Why this priority**: Ensures the overall system works — depends on US1 and US2 being resolved first.

**Independent Test**: Hit every backend endpoint from the frontend (health, chat, auth, translate, personalize, chat history, user background) — all return expected responses with zero 404/500 errors for valid requests.

**Acceptance Scenarios**:

1. **Given** the deployed backend on Railway, **When** each endpoint is called with valid inputs, **Then** all return successful responses (200/201 as appropriate).
2. **Given** the frontend on GitHub Pages, **When** a user performs a full flow (sign up → set background → chat → translate → personalize → view history → sign out → sign in), **Then** every step succeeds.

---

### Edge Cases

- What happens when a chapter slug contains path traversal characters (`../`)? The existing slug validation regex (`^[a-zA-Z0-9/_-]+$`) plus the `..` check blocks this — must remain intact.
- What happens when `website/docs/` has 0 markdown files? The endpoints return 404 per chapter (graceful degradation, no crash).
- What happens when a markdown file is very large (>100KB)? The AI translation/personalization service handles it; no special filesystem-level concern.
- What happens during Railway cold-start? The docs must be available immediately on boot — no lazy-loading from external sources.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The backend MUST have access to all `website/docs/**/*.md` files at runtime on Railway, using the same relative path resolution logic already in the codebase.
- **FR-002**: `POST /api/translate` MUST return HTTP 200 with translated content for any valid chapter slug that corresponds to an existing markdown file.
- **FR-003**: `POST /api/personalize` MUST return HTTP 200 with personalized content for any valid chapter slug that corresponds to an existing markdown file.
- **FR-004**: The solution MUST NOT require manual file uploads or external storage services — docs must be available automatically on every deploy.
- **FR-005**: The solution MUST NOT break the existing chat (RAG) endpoint, auth endpoints, or any other working functionality.
- **FR-006**: When new chapters are added to `website/docs/` and pushed to the repo, the next Railway deploy MUST include them automatically.
- **FR-007**: The existing 18 markdown files in `website/docs/` MUST all be accessible via both translate and personalize endpoints.
- **FR-008**: All existing 119+ backend tests MUST continue to pass after the fix.

### Key Entities

- **Chapter Markdown File**: A `.md` file in `website/docs/` representing one textbook chapter. Keyed by slug (e.g., `module1-ros2/01-architecture`). 18 files currently exist across 5 modules.
- **Docs Directory**: The `website/docs/` tree containing all chapter markdown files. Currently resolved via `Path(__file__).resolve().parent.parent.parent / "website" / "docs"` — this path doesn't exist inside the Railway container because only `/backend` is the build root.

## Assumptions

- Railway's Nixpacks builder respects the `watchPatterns` in `railway.json` to determine what triggers rebuilds. Changing the build root or adding files outside `/backend` may require updating this.
- The 18 markdown files total a small amount of data (estimated <2MB) — bundling them into the container has negligible size impact.
- The `index_content.py` script (used for Qdrant indexing) also resolves docs relative to `../website/docs` but runs locally/in CI, not on Railway — it is not affected by this fix.
- No other backend service reads from `website/docs/` at runtime besides translate and personalize.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `POST /api/translate` returns HTTP 200 with valid translated content for all 18 existing chapter slugs on Railway (currently returns 404 for all).
- **SC-002**: `POST /api/personalize` returns HTTP 200 with valid personalized content for all 18 existing chapter slugs on Railway (currently returns 404 for all).
- **SC-003**: All existing backend endpoints continue to return their expected status codes — zero regressions (health 200, chat 200, auth 201/200, history 200, background 200).
- **SC-004**: Full user flow on the live site succeeds: sign up → set background → chat → translate → personalize → view history → sign out → sign in.
- **SC-005**: 119+ existing backend tests pass after the fix.
- **SC-006**: New chapters added to `website/docs/` appear in translate/personalize on the next deploy without manual steps.
