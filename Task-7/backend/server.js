/**
 * LibraMind AI - Task 7
 * Advanced API Usage and External API Integration
 */
const express = require("express");
const cors = require("cors");
const aiRoutes = require("./routes/aiRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = 5007;

app.use(cors());
app.use(express.json());

app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => res.send("LibraMind AI - Task 7 (AI + External API) is running."));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Task-7 LibraMind server running at http://localhost:${PORT}`);
});
