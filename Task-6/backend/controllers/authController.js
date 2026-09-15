const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/supabase");

const JWT_SECRET = process.env.JWT_SECRET || "libramind_super_secret_change_me";

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "name, email and password are required" });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return res.status(409).json({ success: false, message: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const info = db
    .prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)")
    .run(name, email, passwordHash, role || "student");

  const token = jwt.sign({ id: info.lastInsertRowid, role: role || "student" }, JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ success: true, token, user: { id: info.lastInsertRowid, name, email, role: role || "student" } });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ success: false, message: "Invalid credentials" });

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
};
