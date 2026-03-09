# Data Model: Fix Translate & Personalize 404 Errors

**Feature**: `012-fix-translate-personalize-404`  
**Date**: 2026-03-09

## Entities

### Chapter Markdown File

Static markdown content representing one textbook chapter. Read-only at runtime.

| Attribute | Type | Description |
|-----------|------|-------------|
| slug | string | Path-based identifier, e.g. `module1-ros2/01-architecture` |
| content | string (markdown) | Full chapter text including code blocks |
| parent_module | string | Top-level directory, e.g. `module1-ros2` |

**Current location**: `website/docs/<module>/<chapter>.md`  
**New additional location**: `backend/docs/<module>/<chapter>.md` (copy for Railway)

### Module Directory

Grouping container for related chapters.

| Module | Chapter Count | Chapter Files |
|--------|---------------|---------------|
| `intro` | 1 | `index.md` |
| `module1-ros2` | 5 | `01-architecture.md`, `02-nodes-topics-services.md`, `03-python-packages.md`, `04-launch-files.md`, `05-urdf.md` |
| `module2-simulation` | 4 | `chapter1-gazebo-basics.md`, `chapter2-gazebo-ros2-integration.md`, `chapter3-unity-robotics.md`, `chapter4-unity-ml-agents.md` |
| `module3-isaac` | 4 | `chapter1-isaac-sim-intro.md`, `chapter2-isaac-gym.md`, `chapter3-isaac-ros2-bridge.md`, `chapter4-isaac-reinforcement-learning.md` |
| `module4-vla` | 4 | `chapter1-vla-intro.md`, `chapter2-multimodal-models.md`, `chapter3-action-chunking.md`, `chapter4-vla-robotics.md` |

**Total**: 18 files, 192KB

## File Inventory — What Changes

### Files Modified

| File | Change |
|------|--------|
| `backend/routes/translate.py` | Update `_DOCS_DIR` path resolution (line 54) — add fallback logic |
| `backend/services/personalization_service.py` | Update `_DOCS_ROOT` path resolution (line 86) — add fallback logic |
| `backend/railway.json` | Update `watchPatterns` to include `backend/docs/**` |

### Files Added

| File | Purpose |
|------|---------|
| `backend/docs/` (directory tree) | Copy of `website/docs/` — 18 markdown files across 5 subdirectories |
| `backend/tests/test_docs_available.py` | New test to verify docs directory exists and contains expected files |

### Files NOT Changed

| File | Why |
|------|-----|
| `website/docs/**` | Authoritative source — remains untouched |
| `backend/index_content.py` | Only runs locally/CI for Qdrant indexing — not deployed to Railway |
| `backend/rag_service.py` | Uses Qdrant cloud, not local files |
| All existing test files | Mocked — don't depend on physical docs path |

## Path Resolution — Before vs After

### Before (broken on Railway)

```
translate.py:              Path(__file__).resolve().parent.parent.parent / "website" / "docs"
                           → /app/backend/../website/docs → /app/website/docs (DOESN'T EXIST)

personalization_service.py: pathlib.Path(__file__).resolve().parent.parent.parent / "website" / "docs"
                           → /app/backend/../website/docs → /app/website/docs (DOESN'T EXIST)
```

### After (works on Railway + local)

```
translate.py:              _BACKEND_DIR / "docs"  →  /app/backend/docs (EXISTS on Railway)
                           fallback: _BACKEND_DIR.parent / "website" / "docs" (EXISTS locally)

personalization_service.py: same pattern
```
