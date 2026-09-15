const rateLimit = require("express-rate-limit");

// Task 7: basic rate limiting to protect AI/external-API endpoints from abuse
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { success: false, message: "Too many requests. Please slow down." }
});

module.exports = { aiRateLimiter };
