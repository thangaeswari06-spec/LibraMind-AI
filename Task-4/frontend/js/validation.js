// Task 4: advanced validation - live password strength meter
function checkPasswordStrength(password) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function updateStrengthUI(password) {
  const score = checkPasswordStrength(password);
  const fill = document.getElementById("strengthFill");
  if (!fill) return;
  const percent = (score / 5) * 100;
  const colors = ["#d9534f", "#d9534f", "#f0ad4e", "#f0ad4e", "#5cb85c", "#5cb85c"];
  fill.style.width = percent + "%";
  fill.style.background = colors[score];
}

document.addEventListener("DOMContentLoaded", () => {
  const pwd = document.getElementById("password");
  if (pwd) {
    pwd.addEventListener("input", (e) => updateStrengthUI(e.target.value));
  }
});
