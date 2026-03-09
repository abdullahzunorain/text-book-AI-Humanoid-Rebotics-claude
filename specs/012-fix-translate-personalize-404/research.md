# Research: Fix Translate & Personalize 404 Errors on Railway

**Feature**: `012-fix-translate-personalize-404`  
**Date**: 2026-03-09

## Research Task 1: Why do translate and personalize return 404 on Railway?

**Decision**: The Railway service root directory is set to `/backend` (configured in Railway dashboard). The Nixpacks builder only copies the `backend/` subtree into the container. Both translate and personalize resolve docs paths by walking up from their own file location:

- `backend/routes/translate.py` line 54: `Path(__file__).resolve().parent.parent.parent / "website" / "docs"` → resolves to `<repo-root>/website/docs/`
- `backend/services/personalization_service.py` line 86: same pattern, `parent.parent.parent / "website" / "docs"`

Since the container only contains `/backend/*`, the `website/docs/` directory doesn't exist. Every chapter slug triggers `FileNotFoundError` or the `HTTPException(404)` fallback.

**Rationale**: The root cause is a deployment configuration gap — the code assumes `website/docs/` is reachable relative to `backend/`, which is true locally but false on Railway where only `/backend` is deployed.

**Alternatives considered**:
1. Fetch docs from GitHub API at runtime → rejected (adds latency, external dependency, rate limits)
2. Store docs in database → rejected (over-engineering, adds migration complexity)
3. Use an environment variable pointing to a mounted volume → rejected (Railway doesn't support persistent volumes in free tier)

## Research Task 2: What's the simplest way to make docs available in the Railway container?

**Decision**: Copy `website/docs/` into `backend/docs/` at the repo level (symlink or actual copy via a CI step). Then update the two path-resolution variables to resolve from a location that works both locally and in the container.

Three viable approaches evaluated:

### Approach A: Copy docs into `backend/docs/` (actual files)
- Copy `website/docs/` → `backend/docs/` as actual files in the repo
- Update `_DOCS_DIR` and `_DOCS_ROOT` to `Path(__file__).resolve().parent.parent / "docs"` (two parents up from routes/translate.py lands in backend/)
- **Pros**: Simple, works immediately, no build pipeline changes, no Railway config changes
- **Cons**: File duplication — 18 files (192KB) exist in two places; must keep in sync

### Approach B: Change Railway root directory to repo root
- In Railway dashboard, remove the service root directory so the entire repo is deployed
- Code path resolution stays as-is (works from repo root)
- Update `railway.json` `watchPatterns` and potentially the start command to cd into backend/
- **Pros**: No code changes, no duplication
- **Cons**: Deploys the entire repo (website/, specs/, .github/, etc. — unnecessary), may break Nixpacks auto-detection of Python since `pyproject.toml` is in a subdirectory, `startCommand` needs path adjustment

### Approach C: Use an environment variable for docs path + copy docs at deploy time
- Add `DOCS_PATH` env var, default to `website/docs/` relative to repo root
- In the Railway start command, copy docs before starting: `cp -r /app/website/docs /app/backend/docs && python migrate.py && uvicorn...`
- **Pros**: Configurable, no code duplication in repo
- **Cons**: Requires Railway root to be repo root (same issue as Approach B), or requires the docs to already be in the container

### Selected: Approach A (copy docs into backend/)
**Rationale**: 
- Smallest change — only modifies two path variables in Python and adds 18 small files (192KB total)
- Works identically in local development and Railway production
- No Railway dashboard changes, no railway.json changes, no CI pipeline changes
- The 18 files are static content that rarely changes; duplication is acceptable for <200KB
- A sync check can be added as a future improvement if needed

## Research Task 3: How should the path resolution be updated?

**Decision**: Both `_DOCS_DIR` (translate.py) and `_DOCS_ROOT` (personalization_service.py) should first check for a `docs/` directory alongside the backend (i.e., `backend/docs/`), falling back to the original `../../website/docs/` path for local development flexibility.

Concrete implementation:
```python
# In translate.py (backend/routes/translate.py):
# Current:  Path(__file__).resolve().parent.parent.parent / "website" / "docs"  
#           → <repo>/website/docs/ (doesn't exist on Railway)
# New:      Path(__file__).resolve().parent.parent / "docs"
#           → <backend>/docs/ (exists on Railway after copy)

# Fallback for local dev where website/docs/ is authoritative:
_BACKEND_DIR = Path(__file__).resolve().parent.parent
_DOCS_DIR = _BACKEND_DIR / "docs"
if not _DOCS_DIR.is_dir():
    _DOCS_DIR = _BACKEND_DIR.parent / "website" / "docs"
```

Same pattern in `personalization_service.py`.

**Rationale**: The fallback ensures local development works without requiring the copy, while Railway always uses `backend/docs/`.

**Alternatives considered**:
- Environment variable `DOCS_DIR` → rejected (adds configuration complexity for a path that should be discoverable)
- Symlink → rejected (Railway container doesn't preserve symlinks from the host)

## Research Task 4: Impact on existing tests

**Decision**: The 119+ existing tests mock file I/O or use test fixtures — they don't depend on the physical location of `website/docs/`. The path resolution change should not break any tests because:

1. **translate tests** (`test_translate_api.py`): Mock the `translate_to_urdu` service and file reads
2. **personalization tests** (`test_personalization_service.py`, `test_personalize_api.py`): Mock the service and DB calls
3. **No tests directly exercise the `_DOCS_DIR` / `_DOCS_ROOT` path resolution**

A new test should be added to verify the docs directory exists in the expected location.

**Rationale**: Low risk — path resolution is a module-level constant, and the actual file reads are deep in the request handlers which are already mocked in tests.
