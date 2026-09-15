const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

// In the full app this would be behind requireRole("admin","librarian")
// (see Task-6/backend/middleware/roleMiddleware.js) — omitted here to keep
// Task 7 focused purely on the AI layer.
router.get("/:bookId", aiController.getDemandPrediction);

module.exports = router;
