import { FiLayers } from "react-icons/fi";

export default function AuthShell({ kicker, children, footer }) {
  return (
    <div className="auth-split">
      <aside className="auth-banner" aria-hidden="true">
        <div className="auth-banner-glow" />
        <div className="auth-banner-grid" />
        <div className="auth-banner-content">
          <div className="auth-logo-mark">
            <FiLayers />
          </div>
          <h2 className="auth-banner-title">HR Sphere</h2>
          <p className="auth-banner-text">
            MERN full stack — multi-tenant HR: employees, payroll, leave, and reviews.
          </p>
          <ul className="auth-banner-bullets">
            <li>Secure per-organization data</li>
            <li>React + Express + MongoDB</li>
          </ul>
        </div>
      </aside>
      <div className="auth-panel">
        <div className="auth-card glass">
          {kicker && <p className="auth-card-kicker">{kicker}</p>}
          {children}
          {footer}
        </div>
      </div>
    </div>
  );
}
