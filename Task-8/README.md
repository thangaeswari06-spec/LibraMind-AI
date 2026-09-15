# Task 8 — Advanced Server-Side Functionality

**Objective:** Implement advanced server-side features for a robust application.

## What's inside
- `backend/middleware/logger.js` — logs method, URL, status code, and response time for every request.
- `backend/middleware/bodyParser.js` — centralizes body-parsing configuration (Express's built-in JSON/urlencoded parsers).
- `backend/cache/cacheService.js` — in-memory TTL cache with a get/set/del interface designed to be a drop-in swap for Redis later.
- `backend/jobs/notificationJob.js` — background job (interval-based) that scans borrowings due soon and logs a notification — the same pattern a real "borrow → background job → notification → user" pipeline would use with a task queue.
- `backend/services/adminAnalytics.js` — **Admin Analytics Dashboard** (spec section 19): aggregates student/book/transaction/finance/AI-usage stats into one payload.
- `backend/server.js` — wires it all together:
  - `GET /api/popular-books` — cached for 30s.
  - `GET /api/admin/analytics` — cached for 60s; returns student, book, transaction, finance, and AI-search analytics in one call.
- `frontend/src/voice-assistant.html` — **Voice Assistant** (spec section 17): a working demo using the browser's native Web Speech API (speech-to-text + text-to-speech), which calls Task-7's AI chatbot for the actual answer. Hold the mic button, speak a question, hear the response read back.

## How to run
```bash
cd backend
npm install
npm start          # http://localhost:5008
```
Watch the console: you'll see request logs and a notification-job tick every 60s.
Hit `/api/popular-books` twice quickly — the second response will say `"source": "cache"`.

## Verified working (tested during build)
- Cache correctly returns the stored value before its TTL, and `null` after expiry.
- The notification job correctly flags a book due within 2 days.
- `/api/admin/analytics` returns correctly-aggregated stats (department breakdown, most/least borrowed, pending vs paid fines, popular AI searches) and serves the second identical request from cache (`"source": "cache"`).

## How to try the Voice Assistant
```bash
# Terminal 1 — the AI brain (Task 7)
cd ../Task-7/backend && npm install && npm start   # http://localhost:5007

# Terminal 2 — this task's server (for popular-books / admin analytics)
cd backend && npm install && npm start              # http://localhost:5008
```
Then open `frontend/src/voice-assistant.html` in **Chrome or Edge** (Web Speech API
support varies by browser), allow microphone access, hold the button, and ask something
like *"Suggest beginner books for Machine Learning"* — it logs in to Task 7 automatically
with the demo student, sends your speech as text to the chatbot, and reads the answer
back out loud.

## Concepts demonstrated
- Custom middleware for request processing/logging
- Background job / interval-based task processing (stand-in for Redis/BullMQ)
- Server-side caching for optimized performance
- Admin analytics aggregation across multiple data domains
- Voice interaction via the browser's native Speech-to-Text / Text-to-Speech APIs
