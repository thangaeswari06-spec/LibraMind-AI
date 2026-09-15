const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const aiController = require("../controllers/aiController");

router.get("/roadmap", authMiddleware, aiController.getRoadmap);
router.post("/roadmap/adapt", authMiddleware, aiController.adaptRoadmap);
router.get("/analytics", authMiddleware, aiController.getReadingAnalytics);

module.exports = router;
