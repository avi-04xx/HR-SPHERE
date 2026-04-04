import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api, { apiErr } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import AuthShell from "../components/AuthShell.jsx";

export default function Register() {
  const navigate = useNavigate();
  const { login, isAuthed, loading } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/register", {
        companyName,
        adminName,
        email,
        password,
      });
      login(data.token, data.user, data.organization);
      navigate("/", { replace: true });
    } catch (err) {
      setError(apiErr(err, "Registration failed"));
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
      kicker="Create workspace"
      footer={
        <p className="auth-card-sub" style={{ marginTop: "1.25rem", marginBottom: 0 }}>
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      }
    >
      <h1 className="auth-title">Start your company</h1>
      <p className="auth-card-sub">
        Registers a new organization (tenant). Your data stays separate from other companies.
      </p>
      {error && <div className="err">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="row">
          <label htmlFor="company">Company name</label>
          <input
            id="company"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
        </div>
        <div className="row">
          <label htmlFor="adminName">Your name</label>
          <input
            id="adminName"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            required
          />
        </div>
        <div className="row">
          <label htmlFor="email">Work email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="row">
          <label htmlFor="password">Password (min 6)</label>
          <input
            id="password"
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="actions">
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? "Creating…" : "Create workspace"}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
