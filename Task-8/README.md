# Task 8 — Advanced Server-Side Functionality

**Objective:** Implement advanced server-side features for a robust application.

## What's inside
- `backend/middleware/logger.js` — logs method, URL, status code, and response time for every request.
- `backend/middleware/bodyParser.js` — centralizes body-parsing configuration (Express's built-in JSON/urlencoded parsers).
- `backend/cache/cacheService.js` — in-memory TTL cache with a get/set/del interface designed to be a drop-in swap for Redis later.
- `backend/jobs/notificationJob.js` — background job (interval-based) that scans borrowings due soon and logs a notification — the same pattern a real "borrow → background job → notification → user" pipeline would use with a task queue.
- `backend/server.js` — wires it all together, exposing a demo `GET /api/popular-books` endpoint that's cached for 30 seconds.

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

## Concepts demonstrated
- Custom middleware for request processing/logging
- Background job / interval-based task processing (stand-in for Redis/BullMQ)
- Server-side caching for optimized performance
