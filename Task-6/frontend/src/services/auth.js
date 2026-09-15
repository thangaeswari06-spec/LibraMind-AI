const BASE_URL = "http://localhost:5006/api/auth";

export async function register(data) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function login(data) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const result = await res.json();
  if (result.token) localStorage.setItem("libramind_token", result.token);
  return result;
}

export function getToken() {
  return localStorage.getItem("libramind_token");
}

export function logout() {
  localStorage.removeItem("libramind_token");
}
