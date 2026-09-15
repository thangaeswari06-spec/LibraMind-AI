# Task 2 — Inline Styles, Basic Interaction, and Server-Side Validation

**Objective:** Expand inline styles and introduce server-side validation for form submissions.

## What's inside
- `frontend/register.html`, `login.html` with **client-side JS validation** (`validation.js`).
- `backend/` Express server with:
  - `validation.js` — server-side validation (name, email format, password length, confirm-match).
  - `tempData.js` — temporary in-memory storage of registered users.
  - `server.js` — `/register` and `/login` endpoints.

## How to run
```bash
cd backend
npm install
npm start
```
Open `frontend/register.html` / `login.html` directly in a browser (server runs on port 5002 and accepts CORS requests).

## Concepts demonstrated
- Extended HTML forms with more fields (confirm password)
- Client-side validation with inline error messages
- Server-side validation (defense in depth — never trust the client)
- Temporary server-side storage of validated data
