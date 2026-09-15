# Task 1 — HTML Structure and Basic Server Interaction

**Objective:** Introduce server-side rendering and basic form submissions.

## What's inside
- `frontend/` — plain HTML pages (Home/search, Login, Register) with a shared stylesheet.
- `backend/` — Express server that:
  - Serves the static frontend.
  - Accepts the search form (`POST /search`) and renders results using **EJS** (server-side rendering).
  - Accepts `POST /register` and `POST /login` (no persistence yet — added in Task 6).

## How to run
```bash
cd backend
npm install
npm start
```
Then open `http://localhost:5001` in your browser (server serves the frontend directly),
or open `frontend/index.html` and submit the form — it posts to `http://localhost:5001`.

## Concepts demonstrated
- HTML forms for user input
- Express.js server setup
- Server-side endpoints handling form submissions
- Server-side rendering (EJS) for dynamic HTML generation
