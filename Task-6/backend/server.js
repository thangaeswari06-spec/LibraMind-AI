/**
 * LibraMind AI - Task 6
 * Database Integration and User Authentication
 * React -> Express -> Supabase/PostgreSQL (or local SQLite fallback)
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");

const app = express();
const PORT = process.env.PORT || 5006;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.get("/", (req, res) => res.send("LibraMind AI - Task 6 API (DB + Auth) is running."));

app.listen(PORT, () => {
  console.log(`Task-6 LibraMind server running at http://localhost:${PORT}`);
  console.log("Database mode:", require("./config/supabase").mode);
});
