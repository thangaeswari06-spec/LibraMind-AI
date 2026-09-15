const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const aiController = require("../controllers/aiController");

router.get("/", authMiddleware, aiController.getNotifications);

module.exports = router;
