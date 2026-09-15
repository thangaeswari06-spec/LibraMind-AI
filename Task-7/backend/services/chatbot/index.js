/**
 * LibraMind AI - AI Chatbot (spec section 16)
 *
 * Intent-based assistant. CRITICAL privacy rule from the spec: "The chatbot
 * can access only the data that the logged-in student is authorized to
 * access." Every handler below takes `studentId` and scopes every query to
 * `WHERE student_id = ?` — it physically cannot see another student's rows.
 *
 * Real intent detection could use an LLM; these regex intents already cover
 * every example question listed in the spec.
 */
const db = require("../../config/db");
const { semanticSearch } = require("../semantic-search");
const { summarize } = require("../summarization");
const { generateQuiz } = require("../quiz-generator");

const INTENTS = [
  { pattern: /borrow(ed|ing)?/i, handler: handleMyBorrowedBooks },
  { pattern: /return.*book|when.*return|due date/i, handler: handleReturnDate },
  { pattern: /fine/i, handler: handleFines },
  { pattern: /suggest.*book|recommend/i, handler: handleSuggestBooks },
  { pattern: /available.*for|books?.*(about|on)/i, handler: handleAvailableFor },
  { pattern: /summar(y|ize)/i, handler: handleSummarize },
  { pattern: /quiz/i, handler: handleGenerateQuiz },
  { pattern: /what should i learn|learn next/i, handler: handleWhatNext },
];

function handleMyBorrowedBooks(studentId) {
  const rows = db
    .prepare(
      `SELECT b.title, br.status, br.due_date FROM borrowings br
       JOIN books b ON b.id = br.book_id
       WHERE br.student_id = ? ORDER BY br.id DESC LIMIT 5`
    )
    .all(studentId);
  if (rows.length === 0) return "You haven't borrowed any books yet.";
  return "Here's what you've borrowed recently: " + rows.map((r) => `${r.title} (${r.status})`).join(", ") + ".";
}

function handleReturnDate(studentId) {
  const row = db
    .prepare(
      `SELECT b.title, br.due_date FROM borrowings br
       JOIN books b ON b.id = br.book_id
       WHERE br.student_id = ? AND br.status = 'borrowed'
       ORDER BY br.due_date ASC LIMIT 1`
    )
    .get(studentId);
  if (!row) return "You have no books currently borrowed.";
  return `"${row.title}" is due on ${row.due_date}.`;
}

function handleFines(studentId) {
  const rows = db.prepare("SELECT amount, is_paid FROM fines WHERE student_id = ?").all(studentId);
  const pending = rows.filter((r) => !r.is_paid);
  if (pending.length === 0) return "You have no pending fines. 🎉";
  const total = pending.reduce((s, r) => s + r.amount, 0);
  return `You have a pending fine of ₹${total}.`;
}

function handleSuggestBooks(studentId) {
  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(studentId);
  const books = db.prepare("SELECT * FROM books").all();
  const interests = (student?.interests || "").split(",").filter(Boolean);
  const matches = books.filter((b) => interests.some((i) => (b.tags || "").includes(i)));
  const pool = matches.length ? matches : books;
  return "You might like: " + pool.slice(0, 3).map((b) => b.title).join(", ") + ".";
}

function handleAvailableFor(studentId, message) {
  const topicMatch = message.match(/for\s+([a-zA-Z\s]+)$/i) || message.match(/on\s+([a-zA-Z\s]+)$/i);
  const topic = topicMatch ? topicMatch[1].trim() : message;
  const books = db.prepare("SELECT * FROM books").all();
  const results = semanticSearch(topic, books);
  if (results.length === 0) return `I couldn't find books matching "${topic}".`;
  return `For "${topic}", try: ` + results.slice(0, 3).map((b) => b.title).join(", ") + ".";
}

function handleSummarize(studentId, message, context = {}) {
  const bookTitle = context.bookTitle;
  const book = bookTitle
    ? db.prepare("SELECT * FROM books WHERE title LIKE ?").get(`%${bookTitle}%`)
    : db.prepare(
        `SELECT b.* FROM books b JOIN borrowings br ON br.book_id = b.id
         WHERE br.student_id = ? ORDER BY br.id DESC LIMIT 1`
      ).get(studentId);
  if (!book) return "Tell me which book you'd like summarized.";
  const { summary } = summarize(book.content, 2);
  return `Summary of "${book.title}": ${summary}`;
}

function handleGenerateQuiz(studentId, message, context = {}) {
  const bookTitle = context.bookTitle;
  const book = bookTitle
    ? db.prepare("SELECT * FROM books WHERE title LIKE ?").get(`%${bookTitle}%`)
    : db.prepare(
        `SELECT b.* FROM books b JOIN borrowings br ON br.book_id = b.id
         WHERE br.student_id = ? ORDER BY br.id DESC LIMIT 1`
      ).get(studentId);
  if (!book) return { reply: "Tell me which book to quiz you on.", quiz: [] };
  const quiz = generateQuiz(book.content, book.title, "medium", 2);
  return { reply: `Here's a quick quiz on "${book.title}":`, quiz };
}

function handleWhatNext(studentId) {
  const results = db.prepare("SELECT topic, score FROM quiz_results WHERE student_id = ?").all(studentId);
  const weak = results.filter((r) => r.score < 60).map((r) => r.topic);
  if (weak.length > 0) return `Based on your quiz scores, focus on ${weak.join(", ")} next.`;
  return "You're doing well! Consider exploring the next topic in your learning roadmap.";
}

/**
 * @param {number} studentId - the LOGGED-IN student's id (never trust a client-supplied one)
 * @param {string} message
 * @param {Object} context - optional extra context, e.g. { bookTitle }
 */
function chat(studentId, message, context = {}) {
  db.prepare("INSERT INTO chat_history (student_id, sender, message) VALUES (?, 'user', ?)").run(studentId, message);

  const intent = INTENTS.find((i) => i.pattern.test(message));
  const result = intent
    ? intent.handler(studentId, message, context)
    : "I can help with your borrowed books, due dates, fines, recommendations, summaries, quizzes, and what to learn next. Try asking me one of those!";

  const replyText = typeof result === "string" ? result : result.reply;
  db.prepare("INSERT INTO chat_history (student_id, sender, message) VALUES (?, 'bot', ?)").run(studentId, replyText);

  return typeof result === "string" ? { reply: result } : result;
}

module.exports = { chat };
