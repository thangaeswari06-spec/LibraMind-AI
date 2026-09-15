/**
 * LibraMind AI - Task 2
 * Inline Styles, Basic Interaction, and Server-Side Validation
 */
const express = require("express");
const cors = require("cors");
const path = require("path");
const { validateRegistration, validateLogin } = require("./validation");
const { addUser, findUserByEmail } = require("./tempData");

const app = express();
const PORT = 5002;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  const { valid, errors } = validateRegistration({ name, email, password });

  if (!valid) {
    return res.status(400).json({ message: errors.join(" ") });
  }

  if (findUserByEmail(email)) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  // NOTE: plaintext storage only for this demo task; Task 6 adds bcrypt + a real DB.
  addUser({ name, email, password });
  res.status(201).json({ message: `Account created for ${name}. You can now log in.` });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const { valid, errors } = validateLogin({ email, password });

  if (!valid) {
    return res.status(400).json({ message: errors.join(" ") });
  }

  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  res.json({ message: `Welcome back, ${user.name}!` });
});

app.listen(PORT, () => {
  console.log(`Task-2 LibraMind server running at http://localhost:${PORT}`);
});
