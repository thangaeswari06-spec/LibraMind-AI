const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const aiController = require("../controllers/aiController");

router.get("/:bookId/generate", aiController.generateQuizForBook);
router.post("/results", authMiddleware, aiController.submitQuizResult);

module.exports = router;
