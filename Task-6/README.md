# Task 6 — Database Integration and User Authentication (SQL Core Task)

**Objective:** Integrate a real SQL database and implement JWT-based user authentication with role-based access control.

## What's inside
- `database/schema.sql` — full **PostgreSQL/Supabase** schema (`users`, `students`, `librarians`, `categories`, `authors`, `books`, `book_copies`, `borrowings`, `returns`, `reservations`, `fines`, `reading_progress`) including a Row-Level-Security example.
- `backend/config/supabase.js` — the database connector. If `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` are set in `.env`, it uses real Supabase Postgres. **Otherwise it auto-falls-back to a local SQLite file** (`dev.sqlite`, zero setup) with an equivalent schema — so this task runs immediately for grading/testing, and is production-ready once you plug in Supabase.
- `backend/controllers/authController.js` — register/login with **bcrypt** password hashing and **JWT** issuing.
- `backend/middleware/authMiddleware.js` — verifies JWT on protected routes.
- `backend/middleware/roleMiddleware.js` — **role-based access control** (e.g. only `librarian`/`admin` can add books).
- `backend/routes/` — `auth.routes.js`-style routes for `/api/auth/*` and `/api/books/*`.
- `frontend/` — React app: Login page (calls `/api/auth/login`, stores JWT) → Book catalog (Task 5 UI reused).

## How to run
```bash
cd backend
npm install
npm start          # http://localhost:5006 (SQLite mode by default)
```
```bash
cd frontend
npm install
npm run dev         # http://localhost:5173
```

### Switching to real Supabase
1. Create a Supabase project, run `database/schema.sql` in its SQL editor.
2. Copy `backend/.env.example` to `backend/.env` and fill in `SUPABASE_URL` / `SUPABASE_SERVICE_KEY`.
3. `npm install @supabase/supabase-js` in `backend/`.

## Verified working (tested during build)
- `POST /api/auth/register` → creates a user, returns a JWT
- `POST /api/auth/login` → validates password with bcrypt, returns a JWT
- `POST /api/books/:id/borrow` → **requires** a valid JWT (401 without one), decrements available copies, creates a borrowing record
- `POST /api/books` → requires `librarian` or `admin` role (RBAC)

## Concepts demonstrated
- Real SQL schema design (matching the LibraMind AI specification)
- Password hashing (bcrypt) — never store plaintext passwords
- JWT authentication
- Role-Based Access Control (RBAC) middleware
- Protected/authorized API endpoints
