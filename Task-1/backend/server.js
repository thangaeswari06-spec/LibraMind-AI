/**
 * LibraMind AI - Task 1
 * HTML Structure and Basic Server Interaction
 * - Express server
 * - Handles form submissions (register / login / search)
 * - Uses EJS for server-side rendering of results
 */
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5001;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Sample in-memory "library" data
const books = [
  { id: 1, title: "Python Programming", author: "Guido van Rossum", category: "Programming" },
  { id: 2, title: "Data Structures", author: "Robert Sedgewick", category: "Programming" },
  { id: 3, title: "Linear Algebra", author: "Gilbert Strang", category: "Mathematics" },
  { id: 4, title: "Physics for Engineers", author: "Halliday", category: "Science" },
  { id: 5, title: "Machine Learning Basics", author: "Andrew Ng", category: "Programming" }
];

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

// Handle book search form submission -> render result.ejs
app.post("/search", (req, res) => {
  const { query = "", category = "" } = req.body;
  const results = books.filter((b) => {
    const matchesQuery = query
      ? (b.title + " " + b.author).toLowerCase().includes(query.toLowerCase())
      : true;
    const matchesCategory = category ? b.category === category : true;
    return matchesQuery && matchesCategory;
  });

  res.render("result", { query, category, results });
});

// Handle registration form submission (no DB yet - just echoes back)
app.post("/register", (req, res) => {
  const { name, email } = req.body;
  res.send(`<h2>Registration received</h2><p>Welcome, ${name} (${email})! (Task 1: no DB persistence yet — see Task 6)</p><a href="/">Back home</a>`);
});

// Handle login form submission
app.post("/login", (req, res) => {
  const { email } = req.body;
  res.send(`<h2>Login attempt received</h2><p>Email: ${email}. (Task 1: no real auth yet — see Task 6)</p><a href="/">Back home</a>`);
});

app.listen(PORT, () => {
  console.log(`Task-1 LibraMind server running at http://localhost:${PORT}`);
});
