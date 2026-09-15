import { useState } from "react";
import Login from "./pages/Login.jsx";
import Books from "./pages/Books.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  return user ? <Books /> : <Login onLoggedIn={setUser} />;
}
