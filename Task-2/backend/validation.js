// Task 2: Server-side validation (never trust the client!)
function validateRegistration({ name, email, password }) {
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push("A valid email is required.");
  }

  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters.");
  }

  return { valid: errors.length === 0, errors };
}

function validateLogin({ email, password }) {
  const errors = [];
  if (!email) errors.push("Email is required.");
  if (!password) errors.push("Password is required.");
  return { valid: errors.length === 0, errors };
}

module.exports = { validateRegistration, validateLogin };
