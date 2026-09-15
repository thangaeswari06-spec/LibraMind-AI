const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { aiRateLimiter } = require("../middleware/rateLimiter");
const aiController = require("../controllers/aiController");

router.get("/", authMiddleware, aiRateLimiter, aiController.getRecommendations);

module.exports = router;
