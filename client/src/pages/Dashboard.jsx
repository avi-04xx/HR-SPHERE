import { useEffect, useState } from "react";
import { FiPieChart } from "react-icons/fi";
import api, { apiErr } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { organization } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .get("/analytics/summary")
      .then((res) => {
        setStats(res.data && typeof res.data === "object" ? res.data : null);
      })
      .catch((err) => setError(apiErr(err, "Could not load stats")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-hero">
        <h1>
          <FiPieChart
            style={{
              verticalAlign: "middle",
              marginRight: "0.5rem",
              opacity: 0.9,
            }}
            aria-hidden
          />
          Dashboard
        </h1>
        <p className="sub">
          {organization?.name ? (
            <>
              <strong>{organization.name}</strong> — metrics for your organization only.
            </>
          ) : (
            "HR overview"
          )}
        </p>
      </div>
      {error && <div className="err">{error}</div>}
      {loading && !error && <p className="sub">Loading stats…</p>}
      {!loading && stats && (
        <div className="grid">
          <div className="stat">
            <span>Employees</span>
            <b>{stats.employees}</b>
          </div>
          <div className="stat">
            <span>Active</span>
            <b>{stats.activeEmployees}</b>
          </div>
          <div className="stat">
            <span>Pending leave</span>
            <b>{stats.pendingLeaveRequests}</b>
          </div>
          <div className="stat">
            <span>Payroll (month net)</span>
            <b>
              {stats.currentMonthPayrollNet != null
                ? `$${Number(stats.currentMonthPayrollNet).toLocaleString()}`
                : "—"}
            </b>
          </div>
          <div className="stat">
            <span>Avg review</span>
            <b>{stats.averageReviewRating ?? "—"}</b>
          </div>
        </div>
      )}
      <div className="card">
        <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem", fontWeight: 600 }}>Quick guide</h2>
        <ul className="muted" style={{ margin: 0, paddingLeft: "1.2rem" }}>
          <li>Add people under Employees, then use Leave, Payroll, and Reviews.</li>
        </ul>
      </div>
    </>
  );
}
