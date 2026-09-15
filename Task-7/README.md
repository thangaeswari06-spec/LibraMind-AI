# Task 7 — Advanced API Usage and External API Integration

**Objective:** Explore advanced API concepts and integrate external APIs.

## What's inside
- `backend/services/aiService.js` — rule-based recommendation engine + weak-topic detection (drop-in interface for a real LLM/embedding call later — see comments).
- `backend/services/externalApi.js` — calls the free **Open Library** API for book search, plus written notes on the OAuth authorization-code flow for APIs that require it.
- `backend/middleware/rateLimiter.js` — rate limits AI/external endpoints (20 requests/min).
- `backend/middleware/errorHandler.js` — centralized error handling middleware.
- `frontend/src/ai-demo.html` — a minimal page that calls `/api/ai/recommendations` and prints the JSON result.

## How to run
```bash
cd backend
npm install
npm start          # http://localhost:5007
```
Then open `frontend/src/ai-demo.html` in a browser and click the button, or:
```bash
curl -X POST http://localhost:5007/api/ai/recommendations \
  -H "Content-Type: application/json" \
  -d '{"interests":["python","ml"],"learningLevel":"beginner","quizResults":{"Python":90,"SQL":80,"Statistics":45}}'
```
(Tested during development — correctly flags "Statistics" as a weak topic and ranks it first in recommendations.)

## Concepts demonstrated
- AI-driven personalized recommendations + weak-topic detection
- Calling an external third-party API
- OAuth concepts (documented flow, for APIs that need it)
- Rate limiting and centralized error handling
