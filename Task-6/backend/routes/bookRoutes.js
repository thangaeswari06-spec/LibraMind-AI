const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

// Public: anyone can browse the catalog
router.get("/", bookController.getAllBooks);

// Protected: only librarians/admins can add books
router.post("/", authMiddleware, requireRole("librarian", "admin"), bookController.createBook);

// Protected: any authenticated student can borrow
router.post("/:id/borrow", authMiddleware, bookController.borrowBook);

module.exports = router;
