export default function BookCard({ book, onDelete }) {
  return (
    <div style={{
      border: "1px solid #e2e2e2", borderRadius: 10, padding: 16,
      boxShadow: "0 2px 8px rgba(0,0,0,.06)"
    }}>
      <h3 style={{ margin: "0 0 4px" }}>{book.title}</h3>
      <p style={{ margin: 0, color: "#555" }}>{book.author}</p>
      <p style={{ margin: "4px 0", fontSize: 13, color: "#888" }}>
        {book.category} &middot; {book.copies} copies
      </p>
      <button onClick={() => onDelete(book.id)} style={{
        marginTop: 8, padding: "6px 12px", border: "none", borderRadius: 6,
        background: "#d9534f", color: "#fff", cursor: "pointer"
      }}>
        Delete
      </button>
    </div>
  );
}
