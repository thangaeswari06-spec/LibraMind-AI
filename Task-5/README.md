# Task 5 — API Integration and Front-End Interaction

**Objective:** Introduce server-client communication through a RESTful API.

## What's inside
- `backend/` — Express REST API for `books`:
  - `GET /api/books` (supports `?q=` and `?category=` filters)
  - `POST /api/books`
  - `PUT /api/books/:id`
  - `DELETE /api/books/:id`
- `frontend/` — React (Vite) app that fetches, displays, adds, and deletes books via the API above.

## How to run
```bash
# Terminal 1
cd backend
npm install
npm start          # http://localhost:5005

# Terminal 2
cd frontend
npm install
npm run dev         # http://localhost:5173
```

## Concepts demonstrated
- RESTful CRUD endpoints
- React front-end consuming its own API via `fetch`
- Component-based UI (`BookCard`) fed by live API data
