import { useEffect, useState } from "react";
import { fetchBooks, createBook, deleteBook } from "../services/api";
import BookCard from "../components/BookCard";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ title: "", author: "", category: "" });
  const [loading, setLoading] = useState(true);

  const loadBooks = async () => {
    setLoading(true);
    const result = await fetchBooks();
    setBooks(result.data || []);
    setLoading(false);
  };

  useEffect(() => { loadBooks(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title || !form.author) return;
    await createBook(form);
    setForm({ title: "", author: "", category: "" });
    loadBooks();
  };

  const handleDelete = async (id) => {
    await deleteBook(id);
    loadBooks();
  };

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "Arial, sans-serif" }}>
      <h1>📚 LibraMind AI — Book Catalog (Task 5: REST API)</h1>

      <form onSubmit={handleAdd} style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input placeholder="Title" value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Author" value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })} />
        <input placeholder="Category" value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <button type="submit">Add Book</button>
      </form>

      {loading ? <p>Loading...</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
          {books.map((b) => (
            <BookCard key={b.id} book={b} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
