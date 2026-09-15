const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

router.get("/:bookId/summary", aiController.summarizeBook);
router.post("/:bookId/ask", aiController.askAboutBook);

module.exports = router;
