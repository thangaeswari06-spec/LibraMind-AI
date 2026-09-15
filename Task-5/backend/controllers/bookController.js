// Task 5: Book controller — in-memory CRUD (Task 6 swaps this for real Postgres/Supabase)
let books = [
  { id: 1, title: "Python Programming", author: "Guido van Rossum", category: "Programming", copies: 5 },
  { id: 2, title: "Data Structures", author: "Robert Sedgewick", category: "Programming", copies: 3 },
  { id: 3, title: "Linear Algebra", author: "Gilbert Strang", category: "Mathematics", copies: 4 },
  { id: 4, title: "Machine Learning Basics", author: "Andrew Ng", category: "Programming", copies: 2 }
];
let nextId = 5;

exports.getAllBooks = (req, res) => {
  const { category, q } = req.query;
  let result = books;
  if (category) result = result.filter((b) => b.category.toLowerCase() === category.toLowerCase());
  if (q) result = result.filter((b) => (b.title + b.author).toLowerCase().includes(q.toLowerCase()));
  res.json({ success: true, data: result });
};

exports.getBookById = (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) return res.status(404).json({ success: false, message: "Book not found" });
  res.json({ success: true, data: book });
};

exports.createBook = (req, res) => {
  const { title, author, category, copies } = req.body;
  if (!title || !author) {
    return res.status(400).json({ success: false, message: "title and author are required" });
  }
  const book = { id: nextId++, title, author, category: category || "General", copies: copies || 1 };
  books.push(book);
  res.status(201).json({ success: true, data: book });
};

exports.updateBook = (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) return res.status(404).json({ success: false, message: "Book not found" });
  Object.assign(book, req.body);
  res.json({ success: true, data: book });
};

exports.deleteBook = (req, res) => {
  const index = books.findIndex((b) => b.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, message: "Book not found" });
  const [removed] = books.splice(index, 1);
  res.json({ success: true, data: removed });
};
