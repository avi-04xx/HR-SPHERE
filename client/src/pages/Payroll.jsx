import { useEffect, useState } from "react";
import api, { apiErr } from "../api/client.js";

const y = new Date().getFullYear();
const m = new Date().getMonth() + 1;

export default function Payroll() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filterYear, setFilterYear] = useState(y);
  const [filterMonth, setFilterMonth] = useState(m);
  const [form, setForm] = useState({
    employeeId: "",
    grossPay: "",
    deductions: "0",
    netPay: "",
    status: "draft",
    notes: "",
  });
  const [error, setError] = useState("");

  function load() {
    setError("");
    api
      .get("/payroll", { params: { year: filterYear, month: filterMonth } })
      .then((res) => setRecords(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(apiErr(err, "Load failed")));
    api
      .get("/employees")
      .then((res) => setEmployees(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }

  useEffect(() => {
    load();
  }, [filterYear, filterMonth]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/payroll", {
        employeeId: form.employeeId,
        periodYear: filterYear,
        periodMonth: filterMonth,
        grossPay: Number(form.grossPay),
        deductions: form.deductions,
        netPay: form.netPay === "" ? undefined : Number(form.netPay),
        status: form.status,
        notes: form.notes,
      });
      setForm({
        ...form,
        grossPay: "",
        deductions: "0",
        netPay: "",
        notes: "",
      });
      load();
    } catch (err) {
      setError(apiErr(err, "Save failed"));
    }
  }

  return (
    <>
      <h1>Payroll</h1>
      <p className="sub">Per employee, per month</p>
      {error && <div className="err">{error}</div>}

      <div className="card">
        <div className="row" style={{ marginBottom: "0.75rem" }}>
          <label>Period</label>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleString("en", { month: "short" })}
                </option>
              ))}
            </select>
            <input
              type="number"
              style={{ width: "88px" }}
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Add line</h2>
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "0.75rem",
            }}
          >
            <div className="row" style={{ marginBottom: 0 }}>
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
            <div className="row" style={{ marginBottom: 0 }}>
              <label>Gross</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.grossPay}
                onChange={(e) => setForm({ ...form, grossPay: e.target.value })}
                required
              />
            </div>
            <div className="row" style={{ marginBottom: 0 }}>
              <label>Deductions</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.deductions}
                onChange={(e) => setForm({ ...form, deductions: e.target.value })}
              />
            </div>
            <div className="row" style={{ marginBottom: 0 }}>
              <label>Net (opt.)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.netPay}
                onChange={(e) => setForm({ ...form, netPay: e.target.value })}
              />
            </div>
            <div className="row" style={{ marginBottom: 0 }}>
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="processed">Processed</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
          <div className="row">
            <label>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <button type="submit" className="btn">
            Save
          </button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>
          {filterMonth}/{filterYear}
        </h2>
        {records.length === 0 ? (
          <p className="empty">No rows.</p>
        ) : (
          <div className="wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Gross</th>
                  <th>Net</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id}>
                    <td>
                      {r.employee
                        ? `${r.employee.firstName} ${r.employee.lastName}`
                        : "—"}
                    </td>
                    <td>${Number(r.grossPay).toLocaleString()}</td>
                    <td>${Number(r.netPay).toLocaleString()}</td>
                    <td>{r.status}</td>
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
