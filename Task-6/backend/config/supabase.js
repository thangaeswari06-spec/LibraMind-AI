/**
 * LibraMind AI - Task 6
 * Database connector.
 *
 * Production: point SUPABASE_URL / SUPABASE_SERVICE_KEY (in .env) at a real
 * Supabase/Postgres project provisioned with database/schema.sql, and this
 * module will use @supabase/supabase-js.
 *
 * Local/dev (default): if no Supabase credentials are set, this module
 * automatically falls back to a local SQLite file (better-sqlite3) with an
 * equivalent schema, so `npm install && npm start` works with zero setup.
 */
require("dotenv").config();
const path = require("path");

const useSupabase = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY);

let db;

if (useSupabase) {
  // Production path — requires `npm install @supabase/supabase-js`
  const { createClient } = require("@supabase/supabase-js");
  db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  db.mode = "supabase";
} else {
  // Local dev fallback — SQLite with an equivalent schema
  const Database = require("better-sqlite3");
  const sqlite = new Database(path.join(__dirname, "..", "dev.sqlite"));
  sqlite.pragma("journal_mode = WAL");

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      total_copies INTEGER DEFAULT 1,
      available_copies INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS borrowings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      book_id INTEGER NOT NULL,
      issue_date TEXT DEFAULT CURRENT_DATE,
      due_date TEXT NOT NULL,
      return_date TEXT,
      status TEXT DEFAULT 'borrowed'
    );

    CREATE TABLE IF NOT EXISTS fines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      borrowing_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      is_paid INTEGER DEFAULT 0
    );
  `);

  // Seed sample books once
  const count = sqlite.prepare("SELECT COUNT(*) AS c FROM books").get().c;
  if (count === 0) {
    const insert = sqlite.prepare(
      "INSERT INTO books (title, author, category, total_copies, available_copies) VALUES (?, ?, ?, ?, ?)"
    );
    insert.run("Python Programming", "Guido van Rossum", "Programming", 5, 5);
    insert.run("Data Structures", "Robert Sedgewick", "Programming", 3, 3);
    insert.run("Linear Algebra", "Gilbert Strang", "Mathematics", 4, 4);
    insert.run("Machine Learning Basics", "Andrew Ng", "Programming", 2, 2);
  }

  sqlite.mode = "sqlite";
  db = sqlite;
}

module.exports = db;
