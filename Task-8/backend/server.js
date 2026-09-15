/**
 * LibraMind AI - Task 8
 * Advanced Server-Side Functionality: middleware, background jobs, caching
 */
const express = require("express");
const cors = require("cors");
const logger = require("./middleware/logger");
const configureBodyParsing = require("./middleware/bodyParser");
const cache = require("./cache/cacheService");
const { startNotificationJob } = require("./jobs/notificationJob");
const { buildAdminAnalytics } = require("./services/adminAnalytics");

const app = express();
const PORT = 5008;

app.use(cors());
app.use(logger);
configureBodyParsing(app);

// Example: cached "popular books" endpoint
app.get("/api/popular-books", (req, res) => {
  const cached = cache.get("popular-books");
  if (cached) {
    return res.json({ success: true, source: "cache", data: cached });
  }

  // Simulate an expensive computation/DB aggregation
  const popular = [
    { title: "Python Programming", borrows: 42 },
    { title: "Machine Learning Basics", borrows: 35 },
    { title: "Data Structures", borrows: 28 }
  ];
  cache.set("popular-books", popular, 30000); // cache for 30s
  res.json({ success: true, source: "computed", data: popular });
});

// Admin Analytics Dashboard (spec section 19) — cached since aggregation can be expensive
app.get("/api/admin/analytics", (req, res) => {
  const cached = cache.get("admin-analytics");
  if (cached) return res.json({ success: true, source: "cache", data: cached });

  const analytics = buildAdminAnalytics({
    students: [
      { department: "CSE", active: true }, { department: "CSE", active: true },
      { department: "ECE", active: true }, { department: "ECE", active: false }
    ],
    books: [
      { title: "Python Programming", category: "Programming", totalCopies: 5, availableCopies: 3, borrowCount: 42 },
      { title: "Data Structures", category: "Programming", totalCopies: 3, availableCopies: 1, borrowCount: 28 },
      { title: "Statistics for Data Science", category: "Mathematics", totalCopies: 4, availableCopies: 4, borrowCount: 6 },
      { title: "Machine Learning Basics", category: "AI", totalCopies: 2, availableCopies: 0, borrowCount: 35 },
      { title: "Cybersecurity Fundamentals", category: "Security", totalCopies: 3, availableCopies: 2, borrowCount: 12 }
    ],
    borrowings: [
      { status: "borrowed" }, { status: "borrowed" }, { status: "returned" },
      { status: "returned" }, { status: "returned" }, { status: "overdue" }
    ],
    fines: [{ amount: 30, isPaid: false }, { amount: 10, isPaid: true }, { amount: 50, isPaid: false }],
    searches: ["python basics", "cybersecurity for beginners", "python basics", "machine learning", "cybersecurity for beginners"]
  });

  cache.set("admin-analytics", analytics, 60000);
  res.json({ success: true, source: "computed", data: analytics });
});

app.get("/", (req, res) => res.send("LibraMind AI - Task 8 (Advanced Backend) is running."));

app.listen(PORT, () => {
  console.log(`Task-8 LibraMind server running at http://localhost:${PORT}`);
  startNotificationJob(60000);
});
