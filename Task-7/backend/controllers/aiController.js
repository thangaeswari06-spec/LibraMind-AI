const db = require("../config/db");
const { generateRecommendations } = require("../services/recommendation");
const { semanticSearch } = require("../services/semantic-search");
const { askBook } = require("../services/rag");
const { summarize } = require("../services/summarization");
const { generateQuiz, analyzeQuizPerformance } = require("../services/quiz-generator");
const { buildRoadmap, updateRoadmapAfterQuiz } = require("../services/learning-assistant");
const { predictDemand } = require("../services/demand-prediction");
const { chat } = require("../services/chatbot");

// ---- 9. Recommendations ----
exports.getRecommendations = (req, res) => {
  const studentId = req.user.id;
  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(studentId);
  const books = db.prepare("SELECT * FROM books").all();
  const quizResults = db.prepare("SELECT topic, score FROM quiz_results WHERE student_id = ?").all(studentId);
  const scoreMap = Object.fromEntries(quizResults.map((r) => [r.topic, r.score]));
  const { weakTopics } = analyzeQuizPerformance(scoreMap);

  const interests = (student?.interests || "").split(",").filter(Boolean);
  const recommendations = generateRecommendations({
    books,
    interests,
    learningLevel: student?.learning_level || "beginner",
    weakTopics
  });

  recommendations.forEach((b) =>
    db.prepare("INSERT INTO chat_history (student_id, sender, message) VALUES (?, 'bot', ?)")
      .run(studentId, `Recommended: ${b.title}`)
  );

  res.json({ success: true, weakTopics, recommendations });
};

// ---- 10. Semantic search ----
exports.search = (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ success: false, message: "q is required" });
  const books = db.prepare("SELECT * FROM books").all();
  const results = semanticSearch(q, books);

  if (req.user) {
    db.prepare("INSERT INTO search_history (student_id, query) VALUES (?, ?)").run(req.user.id, q);
  }
  res.json({ success: true, query: q, results });
};

// ---- 11. Summarization + RAG Book Q&A ----
exports.summarizeBook = (req, res) => {
  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(Number(req.params.bookId));
  if (!book) return res.status(404).json({ success: false, message: "Book not found" });
  const sentenceCount = Number(req.query.sentences) || 3;
  res.json({ success: true, book: book.title, ...summarize(book.content, sentenceCount) });
};

exports.askAboutBook = (req, res) => {
  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(Number(req.params.bookId));
  if (!book) return res.status(404).json({ success: false, message: "Book not found" });
  const { question } = req.body;
  if (!question) return res.status(400).json({ success: false, message: "question is required" });
  res.json({ success: true, book: book.title, question, ...askBook(question, book.content) });
};

// ---- 12. Quiz generator ----
exports.generateQuizForBook = (req, res) => {
  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(Number(req.params.bookId));
  if (!book) return res.status(404).json({ success: false, message: "Book not found" });
  const { difficulty = "medium", count = 3 } = req.query;
  const quiz = generateQuiz(book.content, book.title, difficulty, Number(count));
  res.json({ success: true, book: book.title, quiz });
};

exports.submitQuizResult = (req, res) => {
  const studentId = req.user.id;
  const { topic, score } = req.body;
  if (!topic || score === undefined) {
    return res.status(400).json({ success: false, message: "topic and score are required" });
  }
  db.prepare("INSERT INTO quiz_results (student_id, topic, score) VALUES (?, ?, ?)").run(studentId, topic, score);
  const isWeak = score < 60;
  res.json({ success: true, message: `Recorded ${topic}: ${score}%`, weakTopicDetected: isWeak });
};

// ---- 13. Personalized learning roadmap ----
exports.getRoadmap = (req, res) => {
  const studentId = req.user.id;
  const { goal = "Machine Learning" } = req.query;
  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(studentId);
  const quizResults = db.prepare("SELECT topic, score FROM quiz_results WHERE student_id = ?").all(studentId);
  const scoreMap = Object.fromEntries(quizResults.map((r) => [r.topic, r.score]));
  const { weakTopics } = analyzeQuizPerformance(scoreMap);

  const roadmap = buildRoadmap(
    { interests: (student?.interests || "").split(","), weakTopics },
    goal
  );
  res.json({ success: true, roadmap });
};

exports.adaptRoadmap = (req, res) => {
  const { roadmap, topic, score } = req.body;
  if (!roadmap || !topic || score === undefined) {
    return res.status(400).json({ success: false, message: "roadmap, topic and score are required" });
  }
  res.json({ success: true, roadmap: updateRoadmapAfterQuiz(roadmap, topic, score) });
};

// ---- 14. Reading analytics ----
exports.getReadingAnalytics = (req, res) => {
  const studentId = req.user.id;
  const totalBorrowed = db.prepare("SELECT COUNT(*) c FROM borrowings WHERE student_id = ?").get(studentId).c;
  const totalCompleted = db
    .prepare("SELECT COUNT(*) c FROM reading_progress WHERE student_id = ? AND status = 'completed'")
    .get(studentId).c;
  const inProgress = db
    .prepare("SELECT b.title, rp.pages_read, rp.total_pages FROM reading_progress rp JOIN books b ON b.id = rp.book_id WHERE rp.student_id = ?")
    .all(studentId);
  const quizResults = db.prepare("SELECT topic, score FROM quiz_results WHERE student_id = ?").all(studentId);

  res.json({
    success: true,
    analytics: { totalBorrowed, totalCompleted, inProgress, quizResults },
    insight:
      quizResults.length > 0
        ? `Your recent activity shows strength in ${quizResults.sort((a, b) => b.score - a.score)[0].topic}. Keep going!`
        : "Borrow and read a few books to start seeing personalized insights."
  });
};

// ---- 15. Demand prediction (admin) ----
exports.getDemandPrediction = (req, res) => {
  const bookId = Number(req.params.bookId);
  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(bookId);
  if (!book) return res.status(404).json({ success: false, message: "Book not found" });

  const rows = db
    .prepare("SELECT borrow_month, COUNT(*) c FROM borrowings WHERE book_id = ? GROUP BY borrow_month ORDER BY borrow_month")
    .all(bookId);
  const counts = rows.map((r) => r.c);
  if (counts.length === 0) {
    return res.json({ success: true, book: book.title, message: "Not enough borrowing history yet." });
  }

  const prediction = predictDemand(counts, book.available_copies);
  res.json({ success: true, book: book.title, ...prediction });
};

// ---- 16. Chatbot ----
exports.chatWithBot = (req, res) => {
  const studentId = req.user.id; // NEVER take this from the request body
  const { message, bookTitle } = req.body;
  if (!message) return res.status(400).json({ success: false, message: "message is required" });
  const result = chat(studentId, message, { bookTitle });
  res.json({ success: true, ...result });
};

// ---- 18. Notifications ----
exports.getNotifications = (req, res) => {
  const studentId = req.user.id;
  const notifications = db
    .prepare("SELECT * FROM notifications WHERE student_id = ? ORDER BY created_at DESC")
    .all(studentId);
  res.json({ success: true, notifications });
};
