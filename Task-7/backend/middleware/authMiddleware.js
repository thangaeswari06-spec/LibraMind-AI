const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "libramind_super_secret_change_me";

/**
 * Verifies the JWT and attaches req.user = { id, role }.
 * This is what makes chatbot/analytics/recommendation endpoints
 * privacy-safe: studentId always comes from the verified token,
 * NEVER from a client-supplied field in the request body/query.
 */
module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }
  try {
    req.user = jwt.verify(header.split(" ")[1], JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};
