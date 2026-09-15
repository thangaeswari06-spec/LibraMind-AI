/**
 * LibraMind AI - Task 7
 * Advanced AI Module Suite + External API Integration
 *
 * Implements every AI feature from the project specification:
 *  9.  Recommendation Engine     -> /api/ai/recommendations
 *  10. Semantic Search           -> /api/ai/search
 *  11. Summarization + RAG Q&A   -> /api/ai/books/:bookId/summary, /ask
 *  12. Quiz Generator            -> /api/ai/quiz/:bookId/generate, /results
 *  13. Personalized Learning     -> /api/ai/learning/roadmap
 *  14. Reading Analytics         -> /api/ai/learning/analytics
 *  15. Demand Prediction         -> /api/ai/predict/:bookId
 *  16. AI Chatbot                -> /api/ai/chatbot
 *  18. Notifications             -> /api/ai/notifications
 *  External API + OAuth notes    -> /api/ai/external-search
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const searchRoutes = require("./routes/searchRoutes");
const bookAiRoutes = require("./routes/bookAiRoutes");
const quizRoutes = require("./routes/quizRoutes");
const learningRoutes = require("./routes/learningRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const { aiRateLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");
const { searchOpenLibrary } = require("./services/externalApi");

const app = express();
const PORT = process.env.PORT || 5007;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/ai/recommendations", recommendationRoutes);
app.use("/api/ai/search", searchRoutes);
app.use("/api/ai/books", bookAiRoutes);
app.use("/api/ai/quiz", quizRoutes);
app.use("/api/ai/learning", learningRoutes);
app.use("/api/ai/chatbot", chatbotRoutes);
app.use("/api/ai/predict", predictionRoutes);
app.use("/api/ai/notifications", notificationRoutes);

// External API integration + OAuth concepts (spec section: Advanced API Usage)
app.get("/api/ai/external-search", aiRateLimiter, async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: "q is required" });
    const results = await searchOpenLibrary(q);
    res.json({ success: true, source: "Open Library", results });
  } catch (err) {
    next(err);
  }
});

app.get("/", (req, res) => {
  res.send("LibraMind AI - Task 7 (Full AI Module Suite) is running.");
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Task-7 LibraMind AI server running at http://localhost:${PORT}`);
  console.log("Demo login: POST /api/auth/login  { \"email\": \"ananya@libramind.com\" }");
});
