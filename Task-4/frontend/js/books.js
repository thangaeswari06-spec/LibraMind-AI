// Task 4: Dynamic book cards + filter, generated purely via DOM manipulation
const BOOKS = [
  { id: 1, title: "Python Programming", author: "Guido van Rossum", category: "Programming", borrowed: false },
  { id: 2, title: "Data Structures", author: "Robert Sedgewick", category: "Programming", borrowed: false },
  { id: 3, title: "Linear Algebra", author: "Gilbert Strang", category: "Mathematics", borrowed: false },
  { id: 4, title: "Physics for Engineers", author: "Halliday", category: "Science", borrowed: false },
  { id: 5, title: "Machine Learning Basics", author: "Andrew Ng", category: "Programming", borrowed: false }
];

function renderBooks(list) {
  const grid = document.getElementById("bookGrid");
  if (!grid) return;
  grid.innerHTML = "";

  if (list.length === 0) {
    grid.innerHTML = "<p>No books match your search.</p>";
    return;
  }

  list.forEach((book) => {
    const card = document.createElement("div");
    card.className = "card fade-in";
    card.innerHTML = `
      <div class="book-cover">${book.title.substring(0, 2).toUpperCase()}</div>
      <strong>${book.title}</strong>
      <p>${book.author} &middot; ${book.category}</p>
      <button class="borrow-btn ${book.borrowed ? "borrowed" : ""}" data-id="${book.id}">
        ${book.borrowed ? "Borrowed" : "Borrow"}
      </button>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll(".borrow-btn").forEach((btn) => {
    btn.addEventListener("click", () => toggleBorrow(Number(btn.dataset.id)));
  });
}

function toggleBorrow(id) {
  const book = BOOKS.find((b) => b.id === id);
  if (!book || book.borrowed) return;
  book.borrowed = true;
  applyFilter();
}

function applyFilter() {
  const query = (document.getElementById("bookSearch")?.value || "").toLowerCase();
  const category = document.getElementById("categoryFilter")?.value || "";
  const filtered = BOOKS.filter((b) => {
    const matchesQuery = (b.title + " " + b.author).toLowerCase().includes(query);
    const matchesCategory = category ? b.category === category : true;
    return matchesQuery && matchesCategory;
  });
  renderBooks(filtered);
}

document.addEventListener("DOMContentLoaded", () => {
  renderBooks(BOOKS);
  document.getElementById("bookSearch")?.addEventListener("input", applyFilter);
  document.getElementById("categoryFilter")?.addEventListener("change", applyFilter);
});
