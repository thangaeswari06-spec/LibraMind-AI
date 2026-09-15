/**
 * LibraMind AI - Task 7
 * Self-contained database for the AI module suite.
 *
 * Task 7 is independently runnable (per project README), so it ships its own
 * seeded SQLite database with a demo student, books (with full text content
 * for summarization/RAG/quiz-gen), borrowings, fines, reading progress and
 * notifications. In the merged final project, this file is replaced by
 * Task-6's `config/supabase.js` connector so all tasks share one real DB.
 */
const path = require("path");
const Database = require("better-sqlite3");

const db = new Database(path.join(__dirname, "..", "task7.sqlite"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    interests TEXT,          -- comma-separated
    learning_level TEXT DEFAULT 'beginner'
  );

  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT,
    tags TEXT,                -- comma-separated
    total_copies INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    description TEXT,
    content TEXT               -- full text used for summarization / RAG / quiz generation
  );

  CREATE TABLE IF NOT EXISTS borrowings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    borrow_month TEXT NOT NULL,   -- 'YYYY-MM', used by demand prediction
    due_date TEXT,
    return_date TEXT,
    status TEXT DEFAULT 'borrowed'
  );

  CREATE TABLE IF NOT EXISTS fines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    borrowing_id INTEGER,
    amount REAL NOT NULL,
    is_paid INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS quiz_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    topic TEXT NOT NULL,
    score REAL NOT NULL,
    taken_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reading_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    pages_read INTEGER DEFAULT 0,
    total_pages INTEGER DEFAULT 100,
    status TEXT DEFAULT 'in_progress'
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    sender TEXT NOT NULL,       -- 'user' | 'bot'
    message TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS search_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    query TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// ---- Seed data (idempotent) ----
const studentCount = db.prepare("SELECT COUNT(*) AS c FROM students").get().c;
if (studentCount === 0) {
  db.prepare(
    "INSERT INTO students (name, email, interests, learning_level) VALUES (?, ?, ?, ?)"
  ).run("Ananya Sharma", "ananya@libramind.com", "python,ml,data", "beginner");
}

const bookCount = db.prepare("SELECT COUNT(*) AS c FROM books").get().c;
if (bookCount === 0) {
  const insertBook = db.prepare(`
    INSERT INTO books (title, author, category, tags, total_copies, available_copies, description, content)
    VALUES (@title, @author, @category, @tags, @total_copies, @available_copies, @description, @content)
  `);

  insertBook.run({
    title: "Python Programming",
    author: "Guido van Rossum",
    category: "Programming",
    tags: "python,programming,beginner",
    total_copies: 5,
    available_copies: 3,
    description: "A beginner-friendly introduction to Python syntax, data types, and control flow.",
    content:
      "Python is a high-level, interpreted programming language known for its readability. " +
      "Variables in Python do not need explicit type declarations, because Python is dynamically typed. " +
      "Control flow in Python is managed using if, elif, and else statements, along with for and while loops. " +
      "Functions are defined using the def keyword and can accept default arguments and variable-length arguments. " +
      "Python's standard library includes powerful modules for file handling, networking, and data processing. " +
      "List comprehensions provide a concise way to create lists based on existing lists. " +
      "Exception handling in Python uses try, except, and finally blocks to gracefully manage errors."
  });

  insertBook.run({
    title: "Data Structures",
    author: "Robert Sedgewick",
    category: "Programming",
    tags: "dsa,programming,intermediate",
    total_copies: 3,
    available_copies: 1,
    description: "Covers arrays, linked lists, stacks, queues, trees, and graphs with practical examples.",
    content:
      "A data structure is a way of organizing data so it can be accessed and modified efficiently. " +
      "Arrays store elements in contiguous memory and allow constant-time indexed access. " +
      "Linked lists store elements as nodes, where each node points to the next, allowing efficient insertion and deletion. " +
      "A stack follows the Last-In-First-Out principle, while a queue follows First-In-First-Out. " +
      "Trees are hierarchical structures; a binary search tree keeps left children smaller and right children larger. " +
      "Graphs represent relationships between nodes using edges, and can be traversed using BFS or DFS."
  });

  insertBook.run({
    title: "Statistics for Data Science",
    author: "Andrew Ng",
    category: "Mathematics",
    tags: "statistics,math,data,beginner",
    total_copies: 4,
    available_copies: 4,
    description: "Introduces probability, distributions, hypothesis testing and correlation for data analysis.",
    content:
      "Statistics is the study of collecting, analyzing, and interpreting data. " +
      "The mean, median, and mode are measures of central tendency describing a typical value in a dataset. " +
      "Standard deviation measures how spread out the values in a dataset are from the mean. " +
      "A normal distribution is symmetric and bell-shaped, and many statistical tests assume normality. " +
      "Hypothesis testing uses a p-value to determine whether an observed effect is statistically significant. " +
      "Correlation measures the strength of a linear relationship between two variables, ranging from -1 to 1."
  });

  insertBook.run({
    title: "Machine Learning Basics",
    author: "Andrew Ng",
    category: "AI",
    tags: "ml,python,intermediate",
    total_copies: 2,
    available_copies: 0,
    description: "An introduction to supervised and unsupervised learning, model evaluation, and overfitting.",
    content:
      "Machine learning enables computers to learn patterns from data without explicit programming. " +
      "Supervised learning uses labeled data to train models such as linear regression and decision trees. " +
      "Unsupervised learning finds structure in unlabeled data, using techniques like clustering. " +
      "Overfitting occurs when a model learns noise in the training data and performs poorly on new data. " +
      "Cross-validation is used to evaluate how well a model generalizes to unseen data. " +
      "Neural networks are composed of layers of interconnected nodes inspired by the human brain."
  });

  insertBook.run({
    title: "Cybersecurity Fundamentals",
    author: "Bruce Schneier",
    category: "Security",
    tags: "cybersecurity,security,beginner",
    total_copies: 3,
    available_copies: 2,
    description: "A beginner's guide to network security, cryptography basics, and common attack vectors.",
    content:
      "Cybersecurity is the practice of protecting systems, networks, and data from digital attacks. " +
      "Encryption transforms readable data into ciphertext using an algorithm and a key. " +
      "A firewall monitors and controls incoming and outgoing network traffic based on security rules. " +
      "Phishing is a social engineering attack that tricks users into revealing sensitive information. " +
      "Two-factor authentication adds an extra layer of security beyond just a password. " +
      "Regular software updates patch known vulnerabilities that attackers could otherwise exploit."
  });

  // Borrowing history across several months for demand prediction (book_id 1 = Python Programming)
  // Deliberately increasing month-over-month so the demand-prediction demo
  // below mirrors the growth pattern described in the spec (section 15).
  const insertBorrow = db.prepare(
    "INSERT INTO borrowings (student_id, book_id, borrow_month, due_date, status) VALUES (?, ?, ?, ?, ?)"
  );
  const monthlyCounts = { "2026-03": 2, "2026-04": 3, "2026-05": 4, "2026-06": 5, "2026-07": 6, "2026-08": 7 };
  Object.entries(monthlyCounts).forEach(([month, count]) => {
    for (let i = 0; i < count; i++) {
      insertBorrow.run(1, 1, month, `${month}-28`, "returned");
    }
  });
  // One currently-active borrowing so due-date / "which books have I borrowed" demos have live data
  insertBorrow.run(1, 1, "2026-09", "2026-09-18", "borrowed");

  db.prepare("INSERT INTO fines (student_id, borrowing_id, amount, is_paid) VALUES (?, ?, ?, ?)").run(1, 1, 30, 0);

  db.prepare(
    "INSERT INTO reading_progress (student_id, book_id, pages_read, total_pages, status) VALUES (?, ?, ?, ?, ?)"
  ).run(1, 1, 45, 120, "in_progress");

  db.prepare("INSERT INTO quiz_results (student_id, topic, score) VALUES (?, ?, ?)").run(1, "Python", 90);
  db.prepare("INSERT INTO quiz_results (student_id, topic, score) VALUES (?, ?, ?)").run(1, "SQL", 80);
  db.prepare("INSERT INTO quiz_results (student_id, topic, score) VALUES (?, ?, ?)").run(1, "Statistics", 45);

  db.prepare(
    "INSERT INTO notifications (student_id, type, message) VALUES (?, ?, ?)"
  ).run(1, "due_date", "Book due tomorrow! Python Programming — Due Date: Aug 28");
}

module.exports = db;
