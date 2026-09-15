// Task 2: Client-side validation for the registration form
function validateRegisterForm(e) {
  e.preventDefault();
  let valid = true;

  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const confirm = document.getElementById("confirmPassword");

  clearError(name); clearError(email); clearError(password); clearError(confirm);

  if (name.value.trim().length < 2) {
    showError(name, "Name must be at least 2 characters.");
    valid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value.trim())) {
    showError(email, "Enter a valid email address.");
    valid = false;
  }

  if (password.value.length < 6) {
    showError(password, "Password must be at least 6 characters.");
    valid = false;
  }

  if (confirm.value !== password.value) {
    showError(confirm, "Passwords do not match.");
    valid = false;
  }

  if (!valid) return false;

  submitRegistration({
    name: name.value.trim(),
    email: email.value.trim(),
    password: password.value
  });
  return false;
}

function showError(input, message) {
  input.classList.add("invalid");
  const errorEl = document.getElementById(input.id + "Error");
  if (errorEl) errorEl.textContent = message;
}

function clearError(input) {
  input.classList.remove("invalid");
  const errorEl = document.getElementById(input.id + "Error");
  if (errorEl) errorEl.textContent = "";
}

async function submitRegistration(data) {
  const msgBox = document.getElementById("serverMsg");
  try {
    const res = await fetch("http://localhost:5002/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    msgBox.textContent = result.message;
    msgBox.className = res.ok ? "success" : "error";
  } catch (err) {
    msgBox.textContent = "Could not reach server. Is it running on port 5002?";
    msgBox.className = "error";
  }
}

async function loginUser(e) {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const msgBox = document.getElementById("serverMsg");

  try {
    const res = await fetch("http://localhost:5002/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const result = await res.json();
    msgBox.textContent = result.message;
    msgBox.className = res.ok ? "success" : "error";
  } catch (err) {
    msgBox.textContent = "Could not reach server. Is it running on port 5002?";
    msgBox.className = "error";
  }
  return false;
}
