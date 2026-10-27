
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { registerUser } from "../utils/Auth";
import "./Signup.css";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await registerUser(name, email, password);
      alert("Account created! Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Signup failed.");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">₹</div>
        <h1>Create Account</h1>
        <p className="auth-subtitle">Manage your money smarter.</p>

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="Your name" required />

          <label>Email Address</label>
          <input type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Your email" required />

          <label>Password</label>
          <input type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Minimum 8 characters" minLength={8} required />

          {error && <p className="auth-error">{error}</p>}
          <button className="auth-button" type="submit">Sign Up</button>
        </form>

        <p className="auth-footer">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
