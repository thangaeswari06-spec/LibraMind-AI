# Task 4 — Complex Form Validation and Dynamic DOM Manipulation

**Objective:** Extend form validation and implement dynamic updates to the DOM.

## What's inside
- `frontend/index.html` — single-page shell with 4 sections (Home / Dashboard / Books / Login).
- `js/books.js` — renders book cards dynamically via `document.createElement`, live search + category filter, borrow button that updates state and re-renders.
- `js/validation.js` — live password-strength meter driven by DOM events.
- `js/routing.js` — lightweight client-side hash routing (`#home`, `#dashboard`, `#books`, `#login`) with no page reloads.
- `dashboard.html`, `books.html`, `login.html` — kept as simple redirects into the SPA routes, matching the folder structure from the task list.

## How to run
Open `frontend/index.html` directly in a browser. No backend required for this task.

## Concepts demonstrated
- Complex validation rules (password strength)
- Dynamic DOM updates driven by user interaction (search/filter/borrow)
- Client-side routing for a smoother, reload-free user experience
