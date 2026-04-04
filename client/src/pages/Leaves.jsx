import { useEffect, useState } from "react";
import api, { apiErr } from "../api/client.js";

export default function Leaves() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    employeeId: "",
    type: "annual",
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [error, setError] = useState("");

  function load() {
    setError("");
    Promise.all([api.get("/leaves"), api.get("/employees")])
      .then(([l, e]) => {
        setLeaves(Array.isArray(l.data) ? l.data : []);
        setEmployees(Array.isArray(e.data) ? e.data : []);
      })
      .catch((err) => setError(apiErr(err, "Load failed")));
  }

  useEffect(() => {
    load();
  }, []);

  async function submitRequest(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/leaves", form);
      setForm({ ...form, startDate: "", endDate: "", reason: "" });
      load();
    } catch (err) {
      setError(apiErr(err, "Submit failed"));
    }
  }

  async function setStatus(id, status) {
    try {
      await api.patch(`/leaves/${id}/status`, { status });
      load();
    } catch {
      setError("Update failed");
    }
  }

  return (
    <>
      <h1>Leave</h1>
      <p className="sub">Requests and approvals</p>
      {error && <div className="err">{error}</div>}

      <div className="card">
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>New request</h2>
        <form onSubmit={submitRequest}>
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
            <label>Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="annual">Annual</option>
              <option value="sick">Sick</option>
              <option value="unpaid">Unpaid</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="row">
            <label>Start / end</label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
              />
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="row">
            <label>Reason</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </div>
          <button type="submit" className="btn">
            Submit
          </button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Queue</h2>
        {leaves.length === 0 ? (
          <p className="empty">None.</p>
        ) : (
          <div className="wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((row) => (
                  <tr key={row._id}>
                    <td>
                      {row.employee
                        ? `${row.employee.firstName} ${row.employee.lastName}`
                        : "—"}
                    </td>
                    <td>{row.type}</td>
                    <td>
                      {row.startDate?.slice(0, 10)} → {row.endDate?.slice(0, 10)}
                    </td>
                    <td>
                      <span className="badge">{row.status}</span>
                    </td>
                    <td>
                      {row.status === "pending" && (
                        <>
                          <button
                            type="button"
                            className="btn small"
                            onClick={() => setStatus(row._id, "approved")}
                          >
                            OK
                          </button>{" "}
                          <button
                            type="button"
                            className="btn outline small"
                            onClick={() => setStatus(row._id, "rejected")}
                          >
                            No
                          </button>
                        </>
                      )}
                    </td>
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
