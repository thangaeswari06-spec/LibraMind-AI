# Task 7 — Advanced API Usage, External API Integration & the Full AI Module Suite

**Objective:** Explore advanced API concepts, integrate external APIs, and implement
every AI feature from the LibraMind AI specification.

Task 7 is **self-contained and independently runnable**: it ships its own seeded SQLite
database (`task7.sqlite`, auto-created, one demo student "Ananya Sharma") so every AI
feature below can be tested immediately with `npm install && npm start` — no Task-6
setup required. In the merged final project, `config/db.js` is replaced by Task-6's
real Supabase/Postgres connector and all tasks share one database.

## AI modules implemented (spec section 27)

| # | Spec Feature | Endpoint | Technique used |
|---|---|---|---|
| 9 | Recommendation Engine | `GET /api/ai/recommendations` | Interest/weak-topic scoring over tagged catalog |
| 10 | Semantic Search | `GET /api/ai/search?q=...` | **TF-IDF + cosine similarity** — real natural-language ranking, not keyword LIKE |
| 11 | Summarization | `GET /api/ai/books/:id/summary` | Extractive summarizer (sentence scoring by word frequency) |
| 11 | RAG Book Q&A | `POST /api/ai/books/:id/ask` | Chunking + TF-IDF retrieval of the most relevant passage |
| 12 | Quiz Generator | `GET /api/ai/quiz/:id/generate` | Auto-generated fill-in-the-blank MCQs from real book content |
| 12 | Weak Topic Detection | `POST /api/ai/quiz/results` | Flags any topic scoring below 60% |
| 13 | Personalized Learning / Adaptive Roadmap | `GET /api/ai/learning/roadmap` | Topic dependency graph, reordered around weak topics |
| 14 | Reading Analytics | `GET /api/ai/learning/analytics` | Aggregates borrow/read/quiz history + a simple insight |
| 15 | Demand Prediction | `GET /api/ai/predict/:bookId` | Linear regression over monthly borrow counts |
| 16 | AI Chatbot | `POST /api/ai/chatbot` | Intent matching, **every query scoped to the logged-in student only** |
| 17 | Voice Assistant | `Task-8/frontend/src/voice-assistant.html` | Browser Web Speech API (STT + TTS) calling the chatbot above |
| 18 | Notifications | `GET /api/ai/notifications` | Per-student notification feed |
| — | External API | `GET /api/ai/external-search?q=...` | Calls the free Open Library API |
| — | OAuth concepts | `services/externalApi.js` (comments) | Documented authorization-code flow |
| — | Rate limiting | `middleware/rateLimiter.js` | 20 req/min on AI + external endpoints |
| — | Error handling | `middleware/errorHandler.js` | Centralized error responses |

Every "AI" module here uses a **real, explainable algorithm** (TF-IDF, extractive
summarization, linear regression, intent matching) rather than a hardcoded response —
verified end-to-end while building this (see below). Swapping in a real LLM/embedding
API later is a one-function change per module (see the comment at the top of each
`services/*/index.js`), the calling code doesn't need to change.

## Data privacy (spec section 20)
The chatbot, recommendations, roadmap, analytics, and notifications endpoints all read
`studentId` from the **verified JWT** (`req.user.id`), never from the request body —
so one student's token can never be used to pull another student's data.

## How to run
```bash
cd backend
npm install
npm start          # http://localhost:5007 (auto-seeds task7.sqlite on first run)
```

Get a demo token, then call any AI endpoint:
```bash
curl -X POST http://localhost:5007/api/auth/login \
  -H "Content-Type: application/json" -d '{"email":"ananya@libramind.com"}'
# -> copy the returned token into Authorization: Bearer <token>
```

## Verified working while building this (real output, not illustrative)
- **Semantic search** for *"I need beginner-level books to learn cybersecurity"* correctly
  ranks **Cybersecurity Fundamentals** first — the exact example from the spec — even
  though the query never says the book's title.
- **RAG Q&A** — asking *"What is the difference between a stack and a queue?"* against
  the Data Structures book correctly retrieves the exact sentence explaining LIFO vs FIFO.
- **Quiz generator** produced real fill-in-the-blank questions from the Python book's
  actual text (e.g. blanking "interpreted" in *"Python is a high-level, ___ programming
  language..."*).
- **Weak-topic detection** on `{Python:90, SQL:80, Statistics:45}` correctly flags
  **Statistics**, and the roadmap reorders to put it first.
- **Demand prediction** on a growing monthly-borrow trend reproduced the spec's own
  worked example almost exactly: predicted demand 5 vs. 3 current copies → suggests 2
  more copies.
- **Chatbot** correctly answered "which books have I borrowed", "when should I return
  my book", "do I have any pending fine", and "what books are available for
  cybersecurity" using only the logged-in student's own seeded data.

## Folder structure (matches spec section 24)
```
backend/
├── config/db.js                  # seeded SQLite (swap for Task-6's supabase.js in prod)
├── controllers/
│   ├── authController.js         # demo login
│   └── aiController.js           # wires every service to an endpoint
├── routes/                       # one file per feature area
├── middleware/
│   ├── authMiddleware.js
│   ├── rateLimiter.js
│   └── errorHandler.js
└── services/
    ├── recommendation/
    ├── semantic-search/
    ├── rag/
    ├── summarization/
    ├── quiz-generator/
    ├── learning-assistant/
    ├── chatbot/
    ├── demand-prediction/
    └── externalApi.js
```
