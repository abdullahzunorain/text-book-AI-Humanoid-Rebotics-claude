---
id: 041
title: "E2E Browser Testing Bug Report"
stage: misc
date: 2026-03-10
surface: agent
model: claude-opus-4-6
feature: playwright-e2e-testing
branch: main
user: zunorain
command: speckit.implement (manual E2E testing)
labels: ["e2e", "playwright", "bug-report", "browser-testing"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - specs/015-e2e-bug-report/bug-report.md
tests:
  - "Playwright MCP non-headless browser testing (manual)"
---

## Prompt

now pls use the playwright mcp server skills that u have and test this application in non-headless browser... and collect the issues, error in the app... and then write down all the issues, errors and bugs in it.

## Response snapshot

Conducted comprehensive E2E browser testing using Playwright MCP server in non-headless (headed) Chromium mode. Tested: root URL, homepage, chapter navigation, sign-up, sign-in, sign-out, cookie persistence, chatbot Q&A, text selection, Urdu translation, personalization, console errors, and edge cases (empty input). Found 11 bugs across 3 severity levels:

- 🔴 High (3): Root URL 404, personalized content leaks raw Markdown frontmatter, personalized tables render as plain text
- 🟠 Medium (5): Console 401 on every page load, homepage "6 Modules" (only 4 exist), duplicate "Show Original" buttons, duplicate "Read in English" buttons, duplicate "Close chatbot" buttons
- 🟡 Low (3): Disabled OAuth buttons visible, empty paragraphs in personalized view, dark mode toggle disabled on 404

Full bug report written to specs/015-e2e-bug-report/bug-report.md with severity, reproduction steps, root cause analysis, and fix recommendations.

## Outcome

- ✅ Impact: Identified 11 bugs (3 high, 5 medium, 3 low) through comprehensive browser testing
- 🧪 Tests: Playwright MCP browser testing — 10 features tested successfully, 11 bugs documented
- 📁 Files: specs/015-e2e-bug-report/bug-report.md
- 🔁 Next prompts: Fix each bug by priority (BUG-001 through BUG-011)
- 🧠 Reflection: Personalization feature has the most critical rendering bugs (frontmatter leak, raw Markdown). Duplicate button pattern appears in 3 separate features — likely a shared component issue.

## Evaluation notes (flywheel)

- Failure modes observed: Playwright MCP ref invalidation between snapshot/click (stale refs); terminal command echo interference
- Graders run and results (PASS/FAIL): Manual browser testing — N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Fix BUG-002/003 (personalization Markdown rendering) first as highest user impact
