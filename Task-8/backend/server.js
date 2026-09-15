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

app.get("/", (req, res) => res.send("LibraMind AI - Task 8 (Advanced Backend) is running."));

app.listen(PORT, () => {
  console.log(`Task-8 LibraMind server running at http://localhost:${PORT}`);
  startNotificationJob(60000);
});
