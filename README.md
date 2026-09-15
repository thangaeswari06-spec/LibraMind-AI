# LibraMind AI
### An Intelligent Library Management and Personalized Learning Ecosystem
**Cognifyz Technologies — Full Stack Development Internship**

This repository merges the **Cognifyz Full Stack Development task list (8 tasks)**
with the **LibraMind AI project vision** — building one progressively deeper
project instead of 8 disconnected mini-apps, exactly as planned:

> Task 1 introduces the basics with no DB requirement; SQL/PostgreSQL is
> integrated properly starting at Task 6, once forms, validation, UI, dynamic
> JS, and REST APIs are already in place.

Each `Task-N/` folder is **self-contained and independently runnable** — earlier
tasks are never deleted as later ones are added, per the internship guidelines.

## Folder-by-folder

| Task | Focus | Key Tech |
|------|-------|----------|
| [Task-1](./Task-1) | HTML forms + basic Express server + EJS SSR | Express, EJS |
| [Task-2](./Task-2) | Client + server-side validation, temp storage | JS, Express |
| [Task-3](./Task-3) | Responsive UI: navbar, sidebar, dashboard, cards | HTML/CSS |
| [Task-4](./Task-4) | Dynamic DOM, filters, password strength, client routing | Vanilla JS |
| [Task-5](./Task-5) | REST API (CRUD) + React frontend | React, Express |
| [Task-6](./Task-6) | **SQL database + JWT auth + RBAC** — full spec schema (26 tables incl. quiz, learning, AI, notifications) | Postgres/Supabase (SQLite fallback), JWT, bcrypt |
| [Task-7](./Task-7) | **Full AI module suite**: recommendations, semantic search, RAG book Q&A, summarization, quiz generation, adaptive learning roadmap, reading analytics, demand prediction, privacy-scoped chatbot, notifications, external API | Node, TF-IDF/cosine similarity, linear regression |
| [Task-8](./Task-8) | Middleware, background jobs, caching, **admin analytics dashboard**, **voice assistant** | Node, in-memory cache, Web Speech API |

## Every spec feature, and where it lives
| Spec feature (section) | Implemented in |
|---|---|
| Student/Book/Fine/Reservation management (4–8) | Task-6 schema + routes |
| AI Recommendation Engine (9) | Task-7 `services/recommendation` |
| AI Semantic Search (10) | Task-7 `services/semantic-search` (TF-IDF + cosine similarity) |
| Summarization + RAG Book Q&A (11) | Task-7 `services/summarization`, `services/rag` |
| AI Quiz Generator + weak-topic detection (12) | Task-7 `services/quiz-generator` |
| Personalized/Adaptive Learning Roadmap (13) | Task-7 `services/learning-assistant` |
| Reading Analytics (14) | Task-7 `GET /api/ai/learning/analytics` |
| AI Demand Prediction (15) | Task-7 `services/demand-prediction` (linear regression) |
| AI Chatbot (16) | Task-7 `services/chatbot` — privacy-scoped to the logged-in student |
| Voice Assistant (17) | Task-8 `frontend/src/voice-assistant.html` (Web Speech API) |
| Smart Notifications (18) | Task-6 schema + Task-7/8 notification endpoints |
| Admin Analytics Dashboard (19) | Task-8 `services/adminAnalytics.js` |
| Security & Privacy / RLS (20) | Task-6 `schema.sql` RLS policies + JWT/RBAC middleware |

These are real, working, testable implementations (TF-IDF search, extractive
summarization, linear-regression forecasting, intent-based chatbot) rather than
hardcoded stubs — every one was run and its output checked while building this
project (see each task's README for the exact commands and results).

## Quick start (any task)
```bash
cd Task-N/backend    # if a backend/ exists for that task
npm install
npm start
```
```bash
cd Task-N/frontend   # if a frontend/ exists for that task
npm install          # skip for plain-HTML tasks (1-4) — just open the .html files
npm run dev
```

## What was actually tested while building this
- **Task 6**: registered a user, logged in, borrowed a book with a JWT, and
  confirmed borrowing without a token is correctly rejected (401).
- **Task 7**: AI recommendation engine correctly detects a weak quiz topic
  (Statistics) and ranks a matching book first.
- **Task 8**: cache correctly serves from memory before TTL expiry and
  recomputes after; the notification job correctly flags a book due soon.

## Screenshots
Add your own screenshots (browser + terminal) per task into `screenshots/Task-N/`
before zipping for submission — Cognifyz's task list requires visual proof of
each completed task.

## Roadmap: full LibraMind AI vision
`LibraMind_AI_Project_Specification.pdf` (in your originals) describes the
full-scale version of this platform — semantic search, RAG book Q&A, quiz
generation, adaptive learning roadmaps, demand prediction, voice assistant,
and Row-Level-Security-based multi-role data privacy. Tasks 1–8 here build the
foundation for that; after the internship, these can be merged into one
unified `LibraMind-AI-Final/` application, upgrading:
- Task 6's SQLite fallback → real Supabase Postgres + RLS (schema already provided)
- Task 7's rule-based recommender → a real LLM/embedding-based engine
- Task 8's in-memory cache/interval job → Redis + a proper task queue

## Internship submission notes
- At least 5 of 8 tasks must be completed (80%) — all 8 are included here.
- Keep each task's folder intact when zipping for submission (don't delete earlier tasks).
- Compile source code, screenshots, and this documentation into a single ZIP before submitting via the official form.
