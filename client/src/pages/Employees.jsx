import { useEffect, useState } from "react";
import api, { apiErr } from "../api/client.js";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  department: "",
  jobTitle: "",
  hireDate: "",
  baseSalary: "",
  status: "active",
};

export default function Employees() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  function load() {
    setError("");
    api
      .get("/employees")
      .then((res) => setList(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(apiErr(err, "Load failed")));
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(emp) {
    setEditingId(emp._id);
    setForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      department: emp.department || "",
      jobTitle: emp.jobTitle || "",
      hireDate: emp.hireDate ? emp.hireDate.slice(0, 10) : "",
      baseSalary: String(emp.baseSalary ?? ""),
      status: emp.status || "active",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      hireDate: form.hireDate || null,
      baseSalary: form.baseSalary === "" ? 0 : Number(form.baseSalary),
    };
    try {
      if (editingId) {
        await api.put(`/employees/${editingId}`, payload);
      } else {
        await api.post("/employees", payload);
      }
      cancelEdit();
      load();
    } catch (err) {
      setError(apiErr(err, "Save failed"));
    }
  }

  async function remove(id) {
    if (!confirm("Remove employee?")) return;
    try {
      await api.delete(`/employees/${id}`);
      load();
    } catch {
      setError("Delete failed");
    }
  }

  return (
    <>
      <h1>Employees</h1>
      <p className="sub">Tenant-scoped directory</p>
      {error && <div className="err">{error}</div>}

      <div className="card">
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>
          {editingId ? "Edit" : "Add"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "0.75rem",
            }}
          >
            <div className="row" style={{ marginBottom: 0 }}>
              <label>First name</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                required
              />
            </div>
            <div className="row" style={{ marginBottom: 0 }}>
              <label>Last name</label>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                required
              />
            </div>
            <div className="row" style={{ marginBottom: 0 }}>
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="row" style={{ marginBottom: 0 }}>
              <label>Department</label>
              <input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </div>
            <div className="row" style={{ marginBottom: 0 }}>
              <label>Job title</label>
              <input
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
              />
            </div>
            <div className="row" style={{ marginBottom: 0 }}>
              <label>Hire date</label>
              <input
                type="date"
                value={form.hireDate}
                onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
              />
            </div>
            <div className="row" style={{ marginBottom: 0 }}>
              <label>Base salary</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.baseSalary}
                onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
              />
            </div>
            <div className="row" style={{ marginBottom: 0 }}>
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="on_leave">On leave</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>
          <div className="actions">
            <button type="submit" className="btn">
              {editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button type="button" className="btn outline" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>List</h2>
        {list.length === 0 ? (
          <p className="empty">No employees.</p>
        ) : (
          <div className="wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Dept</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td>{emp.email}</td>
                    <td>{emp.department || "—"}</td>
                    <td>{emp.status}</td>
                    <td>
                      <button
                        type="button"
                        className="btn outline small"
                        onClick={() => startEdit(emp)}
                      >
                        Edit
                      </button>{" "}
                      <button
                        type="button"
                        className="btn danger small"
                        onClick={() => remove(emp._id)}
                      >
                        Del
                      </button>
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
