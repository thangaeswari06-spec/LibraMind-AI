import { useState } from "react";
import { login } from "../services/auth";

export default function Login({ onLoggedIn }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form);
    if (result.token) {
      setMessage(`Welcome, ${result.user.name}!`);
      onLoggedIn?.(result.user);
    } else {
      setMessage(result.message || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: "60px auto", fontFamily: "Arial" }}>
      <h2>LibraMind AI — Login</h2>
      <input placeholder="Email" style={{ width: "100%", padding: 8, marginBottom: 8 }}
        value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password" style={{ width: "100%", padding: 8, marginBottom: 8 }}
        value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button type="submit" style={{ width: "100%", padding: 10 }}>Login</button>
      {message && <p>{message}</p>}
    </form>
  );
}
