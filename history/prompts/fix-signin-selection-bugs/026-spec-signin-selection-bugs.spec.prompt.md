---
id: 026
title: Specify Fix Signin Crash & Stale Closure Bugs
stage: spec
date: 2025-07-15
surface: agent
model: claude-opus-4-20250514
feature: fix-signin-selection-bugs
branch: 014-fix-signin-selection-bugs
user: zunorain
command: /speckit.specify
labels: ["bugfix", "signin", "stale-closure", "selectedContext", "password-hash"]
links:
  spec: specs/014-fix-signin-selection-bugs/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/014-fix-signin-selection-bugs/spec.md
  - specs/014-fix-signin-selection-bugs/checklists/requirements.md
tests:
  - null
---

## Prompt

pls analyze the below logs and issues and chatbot conversation and resolve these issue and not to change other functionality or code in this current application... must be very focused and precise to the issues, bugs in it and errors

User provided:
1. Backend server logs showing 500 Internal Server Error on POST /api/auth/signin with traceback: AttributeError: 'NoneType' object has no attribute 'encode' at auth_utils.py:56 — caused by password_hash being NULL in the database.
2. Chatbot conversation screenshots showing selected text banner visible ("📝 Selected text: Why Physical AI Matters...") but when user types "translate into roman urdu", the response is "Please select some text from the textbook first" — indicating selected_text was null in the request despite the banner being visible.

## Response snapshot

Analyzed both bugs with root cause confirmation from source code:
- Bug 1: routes/auth.py line 140 calls verify_password() without guarding for NULL password_hash. bcrypt.checkpw() crashes on None.encode().
- Bug 2: ChatbotWidget.tsx line 158 has useCallback(..., []) with empty dependency array. selectedContext is captured as null in the stale closure and never updated.

Created branch 014-fix-signin-selection-bugs, wrote full spec with 2 P1 user stories, 5 functional requirements, 4 success criteria, edge cases, assumptions, and out-of-scope boundaries. Checklist passed 12/12.

## Outcome

- ✅ Impact: Spec created for two critical production bugs — signin crash and selected text not sent to backend
- 🧪 Tests: No tests run during spec phase
- 📁 Files: spec.md, checklists/requirements.md created
- 🔁 Next prompts: /speckit.plan or /speckit.implement (bugs are well-understood, may skip planning)
- 🧠 Reflection: Root causes fully confirmed from logs and source code before spec writing — no ambiguity remained

## Evaluation notes (flywheel)

- Failure modes observed: None — both bugs had clear stack traces and reproducible behavior
- Graders run and results (PASS/FAIL): Checklist 12/12 PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
