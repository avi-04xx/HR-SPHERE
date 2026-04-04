import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api, { apiErr } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import AuthShell from "../components/AuthShell.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthed, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.token, data.user, data.organization);
      navigate("/", { replace: true });
    } catch (err) {
      setError(apiErr(err, "Login failed"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="auth-loading">
        <p>Loading…</p>
      </div>
    );
  }
  if (isAuthed) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthShell
      kicker="Sign in"
      footer={
        <p className="auth-card-sub" style={{ marginTop: "1.25rem", marginBottom: 0 }}>
          New company? <Link to="/register">Create workspace</Link>
        </p>
      }
    >
      <h1 className="auth-title">Welcome back</h1>
      <p className="auth-card-sub">Enter your work email to open your HR dashboard.</p>
      {error && <div className="err">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="row">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="row">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="actions">
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
