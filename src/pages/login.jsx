
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { loginUser } from "../utils/Auth";
import "./Signup.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await loginUser(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed.");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">₹</div>
        <h1>Welcome Back!</h1>
        <p className="auth-subtitle">Login to manage your finances.</p>

        <form onSubmit={handleSubmit}>
          <label>Email Address</label>
          <input type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Your email" required />

          <label>Password</label>
          <input type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Your password" required />

          {error && <p className="auth-error">{error}</p>}
          <button className="auth-button" type="submit">Login</button>
        </form>

        <p className="auth-footer">
          New here? <Link to="/signup">Create account</Link>
        </p>
      </div>
    </div>
  );
}
