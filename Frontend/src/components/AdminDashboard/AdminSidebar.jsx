import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import BrandLogo from "../BrandLogo";
import "./AdminSidebar.css";

const links = [
  { label: "Overview", path: "/AdminDashboard", icon: "▦", end: true },
  { label: "User Management", path: "/AdminDashboard/users", icon: "♙" },
  { label: "Provider Management", path: "/AdminDashboard/providers", icon: "♧", badge: "12 Pending", badgeType: "pending" },
  { label: "Service & Category Management", path: "/AdminDashboard/services", icon: "▤" },
  { label: "Booking Management", path: "/AdminDashboard/bookings", icon: "▣" },
  { label: "Payments & Commission", path: "/AdminDashboard/payments", icon: "＄" },
  { label: "Subscription Management", path: "/AdminDashboard/subscriptions", icon: "♢" },
  { label: "Platform Settings", path: "/AdminDashboard/settings", icon: "⚙" },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { clearSession } = useAuth();

  function signOut() {
    clearSession();
    navigate("/login", { replace: true });
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-logo">
        <BrandLogo className="admin-logo-icon" />
        <span className="admin-logo-copy">
          <strong>Event Connect</strong>
          <small>ADMIN SUITE</small>
        </span>
      </div>

      <p className="admin-sidebar-heading">NAVIGATION</p>

      <nav className="admin-sidebar-menu" aria-label="Admin dashboard navigation">
        {links.map(({ label, path, icon, end, badge, badgeType }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            title={label}
            className={({ isActive }) => `admin-sidebar-link${isActive ? " active" : ""}`}
          >
            <span className="admin-sidebar-icon" aria-hidden="true">{icon}</span>
            <span className="admin-sidebar-label">{label}</span>
            {badge && <small className={`admin-sidebar-badge ${badgeType}`}>{badge}</small>}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        className="admin-sidebar-link admin-sidebar-logout"
        onClick={signOut}
      >
        <span className="admin-sidebar-icon" aria-hidden="true">↪</span>
        <span className="admin-sidebar-label">Sign Out</span>
      </button>

      <div className="admin-sidebar-footer">
        <span className="admin-sidebar-online-dot" aria-hidden="true" />
        <span>v2.4.0 Engine Active</span>
      </div>
    </aside>
  );
}
