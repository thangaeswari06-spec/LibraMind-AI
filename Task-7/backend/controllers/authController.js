const jwt = require("jsonwebtoken");
const db = require("../config/db");
const JWT_SECRET = process.env.JWT_SECRET || "libramind_super_secret_change_me";

// Demo auth: Task 6 already implements full bcrypt + register/login.
// Task 7 focuses on the AI layer, so this issues a token for the seeded
// demo student by email only, purely so the AI endpoints below can be
// tested with real, privacy-scoped JWTs.
exports.demoLogin = (req, res) => {
  const { email } = req.body;
  const student = db.prepare("SELECT * FROM students WHERE email = ?").get(email || "ananya@libramind.com");
  if (!student) return res.status(404).json({ success: false, message: "Demo student not found" });

  const token = jwt.sign({ id: student.id, role: "student" }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ success: true, token, student });
};
