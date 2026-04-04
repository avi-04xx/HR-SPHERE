import { NavLink, Outlet } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiStar,
  FiLogOut,
  FiLayers,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";

const nav = [
  { to: "/", end: true, label: "Dashboard", icon: FiHome },
  { to: "/employees", label: "Employees", icon: FiUsers },
  { to: "/leaves", label: "Leave", icon: FiCalendar },
  { to: "/payroll", label: "Payroll", icon: FiDollarSign },
  { to: "/reviews", label: "Reviews", icon: FiStar },
];

export default function Layout() {
  const { organization, user, logout } = useAuth();

  return (
    <div className="shell">
      <header className="app-banner">
        <div className="app-banner-inner">
          <span className="app-banner-pill">
            <FiLayers className="app-banner-pill-icon" />
            HR Sphere
          </span>
          <span className="app-banner-msg">
            Your MERN workspace — people, payroll, and leave in one place.
          </span>
        </div>
      </header>

      <div className="shell-body">
        <aside className="side">
          <div className="brand">
            <span className="brand-icon">
              <FiLayers />
            </span>
            <span>
              HR<strong>Sphere</strong>
            </span>
          </div>
          <nav className="nav">
            {nav.map(({ to, end, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => "nav-link" + (isActive ? " is-active" : "")}
              >
                <Icon className="nav-icon" aria-hidden />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="side-foot">
            <div className="side-org">{organization?.name || "Organization"}</div>
            <div className="muted">{user?.email}</div>
            <button type="button" className="btn btn-logout outline" onClick={logout}>
              <FiLogOut className="nav-icon" aria-hidden />
              Log out
            </button>
          </div>
        </aside>

        <main className="content">
          <div className="content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
