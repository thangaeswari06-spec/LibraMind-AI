// Task 5: talks to the Express REST API
const BASE_URL = "http://localhost:5005/api/books";

export async function fetchBooks(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}${query ? "?" + query : ""}`);
  return res.json();
}

export async function createBook(book) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book)
  });
  return res.json();
}

export async function updateBook(id, updates) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates)
  });
  return res.json();
}

export async function deleteBook(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
  return res.json();
}
