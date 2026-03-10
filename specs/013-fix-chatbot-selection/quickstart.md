# Quickstart: Fix Chatbot Selection & Roman Urdu (013)

## Prerequisites
- Python 3.13+, Node 18+
- `.env` file in `backend/` with: `DATABASE_URL`, `QDRANT_URL`, `QDRANT_API_KEY`, `GEMINI_API_KEY`, `SECRET_KEY`

## Setup

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python migrate.py
uvicorn main:app --reload --port 8000

# Frontend (separate terminal)
cd website
npm install
npm start
```

## Files to Modify

| File | Change |
|------|--------|
| `website/src/components/ChatbotWidget.tsx` | Remove `setSelectedContext(null)` from `sendMessage()` |
| `backend/rag_service.py` | Add Roman Urdu regex detection + branching in `generate_answer()` |

## Testing the Fix

### Test 1: Selected text persists across messages
1. Open any doc page → highlight a paragraph → click "Ask AI" popup
2. See yellow context banner appear in chatbot
3. Ask a question → verify answer scopes to selection
4. Ask a second question → verify selection banner still visible AND answer still scopes

### Test 2: Roman Urdu transliteration
1. Select a paragraph → click "Ask AI"
2. Type "translate to roman urdu"
3. Verify response is Latin-script Urdu of ONLY the selected text (not full chapter)

### Test 3: Roman Urdu without selection
1. Without any text selected, type "roman urdu mein translate karo"
2. Verify helpful guidance message asking user to select text first

### Test 4: Dismiss selection
1. Select text → see banner → click × button
2. Verify banner disappears
3. Ask a question → verify normal RAG (no selected scope)

## Running Backend Tests

```bash
cd backend
python -m pytest tests/ -v
```

## Running E2E Tests (if available)

```bash
cd website
npx playwright test
```
