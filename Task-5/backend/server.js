/**
 * LibraMind AI - Task 5
 * REST API: React (frontend) <-> Express (this server) <-> in-memory data
 */
const express = require("express");
const cors = require("cors");
const bookRoutes = require("./routes/bookRoutes");

const app = express();
const PORT = 5005;

app.use(cors());
app.use(express.json());

app.use("/api/books", bookRoutes);

app.get("/", (req, res) => res.send("LibraMind AI - Task 5 REST API is running."));

app.listen(PORT, () => {
  console.log(`Task-5 REST API running at http://localhost:${PORT}`);
});
