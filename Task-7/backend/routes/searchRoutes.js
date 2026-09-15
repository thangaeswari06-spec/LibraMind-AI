const express = require("express");
const router = express.Router();
const { aiRateLimiter } = require("../middleware/rateLimiter");
const aiController = require("../controllers/aiController");

// Public: browsing search doesn't require login, but if a token is present
// we log it to search_history for that student (see optionalAuth below).
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "libramind_super_secret_change_me";
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    try { req.user = jwt.verify(header.split(" ")[1], JWT_SECRET); } catch (e) { /* ignore */ }
  }
  next();
}

router.get("/", optionalAuth, aiRateLimiter, aiController.search);

module.exports = router;
