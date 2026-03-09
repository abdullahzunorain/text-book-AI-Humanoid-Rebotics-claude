"""Tests that backend/docs/ directory exists and contains all expected markdown files.

This ensures the Railway container has the chapter files needed by the
translate and personalize endpoints.
"""

from pathlib import Path

import pytest

# backend/ is the parent of tests/
_BACKEND_DIR = Path(__file__).resolve().parent.parent
_PRIMARY_DOCS = _BACKEND_DIR / "docs"
_FALLBACK_DOCS = _BACKEND_DIR.parent / "website" / "docs"

EXPECTED_MODULES = [
    "intro",
    "module1-ros2",
    "module2-simulation",
    "module3-isaac",
    "module4-vla",
]

EXPECTED_FILES = [
    "intro/index.md",
    "module1-ros2/01-architecture.md",
    "module1-ros2/02-nodes-topics-services.md",
    "module1-ros2/03-python-packages.md",
    "module1-ros2/04-launch-files.md",
    "module1-ros2/05-urdf.md",
    "module2-simulation/chapter1-gazebo-basics.md",
    "module2-simulation/chapter2-gazebo-ros2-integration.md",
    "module2-simulation/chapter3-unity-robotics.md",
    "module2-simulation/chapter4-unity-ml-agents.md",
    "module3-isaac/chapter1-isaac-sim-intro.md",
    "module3-isaac/chapter2-isaac-gym.md",
    "module3-isaac/chapter3-isaac-ros2-bridge.md",
    "module3-isaac/chapter4-isaac-reinforcement-learning.md",
    "module4-vla/chapter1-vla-intro.md",
    "module4-vla/chapter2-multimodal-models.md",
    "module4-vla/chapter3-action-chunking.md",
    "module4-vla/chapter4-vla-robotics.md",
]


class TestDocsDirectoryExists:
    """Verify backend/docs/ exists and is structured correctly."""

    def test_primary_docs_dir_exists(self) -> None:
        assert _PRIMARY_DOCS.is_dir(), f"backend/docs/ not found at {_PRIMARY_DOCS}"

    def test_has_five_module_subdirectories(self) -> None:
        subdirs = sorted(d.name for d in _PRIMARY_DOCS.iterdir() if d.is_dir())
        assert subdirs == sorted(EXPECTED_MODULES)

    def test_contains_exactly_18_markdown_files(self) -> None:
        md_files = list(_PRIMARY_DOCS.rglob("*.md"))
        assert len(md_files) == 18, f"Expected 18 .md files, found {len(md_files)}"

    @pytest.mark.parametrize("relative_path", EXPECTED_FILES)
    def test_each_expected_file_exists(self, relative_path: str) -> None:
        full_path = _PRIMARY_DOCS / relative_path
        assert full_path.is_file(), f"Missing: {relative_path}"


class TestPathResolutionFallback:
    """Verify fallback path resolution logic works."""

    def test_at_least_one_docs_dir_exists(self) -> None:
        assert _PRIMARY_DOCS.is_dir() or _FALLBACK_DOCS.is_dir(), (
            "Neither backend/docs/ nor website/docs/ found"
        )

    def test_primary_preferred_over_fallback(self) -> None:
        if _PRIMARY_DOCS.is_dir():
            docs = _PRIMARY_DOCS
        else:
            docs = _FALLBACK_DOCS
        assert docs.is_dir()
        md_files = list(docs.rglob("*.md"))
        assert len(md_files) == 18
