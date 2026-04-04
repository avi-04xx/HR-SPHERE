import { useEffect, useState } from "react";
import api, { apiErr } from "../api/client.js";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    employeeId: "",
    periodLabel: "",
    rating: 3,
    reviewerName: "",
    summary: "",
    goals: "",
  });
  const [error, setError] = useState("");

  function load() {
    setError("");
    Promise.all([api.get("/reviews"), api.get("/employees")])
      .then(([r, e]) => {
        setReviews(Array.isArray(r.data) ? r.data : []);
        setEmployees(Array.isArray(e.data) ? e.data : []);
      })
      .catch((err) => setError(apiErr(err, "Load failed")));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/reviews", {
        ...form,
        rating: Number(form.rating),
      });
      setForm({
        employeeId: "",
        periodLabel: "",
        rating: 3,
        reviewerName: "",
        summary: "",
        goals: "",
      });
      load();
    } catch (err) {
      setError(apiErr(err, "Save failed"));
    }
  }

  return (
    <>
      <h1>Reviews</h1>
      <p className="sub">Rating 1–5</p>
      {error && <div className="err">{error}</div>}

      <div className="card">
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>New</h2>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <label>Employee</label>
            <select
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              required
            >
              <option value="">—</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>
          <div className="row">
            <label>Period</label>
            <input
              value={form.periodLabel}
              onChange={(e) => setForm({ ...form, periodLabel: e.target.value })}
              placeholder="Q1 2026"
              required
            />
          </div>
          <div className="row">
            <label>Reviewer</label>
            <input
              value={form.reviewerName}
              onChange={(e) => setForm({ ...form, reviewerName: e.target.value })}
            />
          </div>
          <div className="row">
            <label>Rating</label>
            <input
              type="number"
              min={1}
              max={5}
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
              required
            />
          </div>
          <div className="row">
            <label>Summary</label>
            <textarea
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
            />
          </div>
          <div className="row">
            <label>Goals</label>
            <textarea
              value={form.goals}
              onChange={(e) => setForm({ ...form, goals: e.target.value })}
            />
          </div>
          <button type="submit" className="btn">
            Save
          </button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>History</h2>
        {reviews.length === 0 ? (
          <p className="empty">None.</p>
        ) : (
          <div className="wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Period</th>
                  <th>Rating</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((rev) => (
                  <tr key={rev._id}>
                    <td>
                      {rev.employee
                        ? `${rev.employee.firstName} ${rev.employee.lastName}`
                        : "—"}
                    </td>
                    <td>{rev.periodLabel}</td>
                    <td>{rev.rating}/5</td>
                    <td>{rev.summary || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
