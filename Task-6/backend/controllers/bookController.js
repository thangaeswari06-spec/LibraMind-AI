const db = require("../config/supabase");

exports.getAllBooks = (req, res) => {
  const { category, q } = req.query;
  let sql = "SELECT * FROM books WHERE 1=1";
  const params = [];
  if (category) { sql += " AND category = ?"; params.push(category); }
  if (q) { sql += " AND (title LIKE ? OR author LIKE ?)"; params.push(`%${q}%`, `%${q}%`); }
  const books = db.prepare(sql).all(...params);
  res.json({ success: true, data: books });
};

exports.createBook = (req, res) => {
  const { title, author, category, total_copies } = req.body;
  if (!title || !author) return res.status(400).json({ success: false, message: "title and author required" });
  const info = db
    .prepare("INSERT INTO books (title, author, category, total_copies, available_copies) VALUES (?, ?, ?, ?, ?)")
    .run(title, author, category || "General", total_copies || 1, total_copies || 1);
  res.status(201).json({ success: true, data: { id: info.lastInsertRowid, title, author } });
};

exports.borrowBook = (req, res) => {
  const bookId = Number(req.params.id);
  const studentId = req.user.id;
  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(bookId);

  if (!book) return res.status(404).json({ success: false, message: "Book not found" });
  if (book.available_copies <= 0) return res.status(400).json({ success: false, message: "No copies available" });

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  db.prepare("UPDATE books SET available_copies = available_copies - 1 WHERE id = ?").run(bookId);
  const info = db
    .prepare("INSERT INTO borrowings (student_id, book_id, due_date, status) VALUES (?, ?, ?, 'borrowed')")
    .run(studentId, bookId, dueDate.toISOString().slice(0, 10));

  res.status(201).json({ success: true, message: "Book borrowed", borrowingId: info.lastInsertRowid, dueDate });
};
