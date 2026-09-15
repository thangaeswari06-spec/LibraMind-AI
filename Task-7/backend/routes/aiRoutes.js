const express = require("express");
const router = express.Router();
const { generateRecommendations, detectWeakTopics } = require("../services/aiService");
const { searchOpenLibrary } = require("../services/externalApi");
const { aiRateLimiter } = require("../middleware/rateLimiter");

router.post("/recommendations", aiRateLimiter, (req, res, next) => {
  try {
    const { interests, learningLevel, quizResults } = req.body;
    const weakTopics = detectWeakTopics(quizResults);
    const recommendations = generateRecommendations({ interests, learningLevel, weakTopics });
    res.json({ success: true, weakTopics, recommendations });
  } catch (err) {
    next(err);
  }
});

router.get("/external-search", aiRateLimiter, async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: "q is required" });
    const results = await searchOpenLibrary(q);
    res.json({ success: true, source: "Open Library", results });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
