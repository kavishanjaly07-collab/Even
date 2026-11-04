import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clientApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import ClientSidebar from "./ClientSidebar";
import "./CustomerHome.css";

const EMPTY_STATS = { total: 0, pending: 0, accepted: 0, rejected: 0 };

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function getInitial(name) {
  return name?.trim().charAt(0).toUpperCase() || "?";
}

export default function CustomerHome() {
  const navigate = useNavigate();
  const { user, clearSession } = useAuth();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setOverview(await clientApi.getDashboardOverview());
    } catch (requestError) {
      setError(requestError.message || "Unable to load your dashboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  function logout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  const customer = overview?.user || user;
  const name = customer?.username || "Your account";
  const bookingStats = overview?.bookingStats || EMPTY_STATS;
  const stats = [
    { label: "TOTAL BOOKINGS", value: bookingStats.total, icon: "📖", css: "ok" },
    { label: "PENDING", value: bookingStats.pending, icon: "◷", css: "gold" },
    { label: "ACCEPTED", value: bookingStats.accepted, icon: "✓", css: "purple" },
    { label: "REJECTED", value: bookingStats.rejected, icon: "↗", css: "ok" },
  ];
  const recentBookings = overview?.recentBookings || [];

  return (
    <div className="ch">
      <ClientSidebar onHelp={() => navigate("/Messages")} onLogout={logout} />

      <div className="ch-main">
        <header className="ch-top">
          <div className="ch-page-label">Client Dashboard</div>
          <div className="ch-top-right">
            <div className="ch-profile">
              <span className="ch-avatar">{getInitial(name)}</span>
              <div><strong>{name}</strong><small>{customer?.email || "Email not available"}</small></div>
            </div>
          </div>
        </header>

        <main className="ch-content">
          <section className="ch-welcome">
            <div>
              <span className="ch-pill white">YOUR BOOKINGS</span>
              <h1>Welcome back, {name}!</h1>
              <p>
                {loading
                  ? "Loading your booking information..."
                  : error
                    ? "Your booking information could not be loaded."
                    : `You have ${bookingStats.total} booking${bookingStats.total === 1 ? "" : "s"} on your account.`}
              </p>
            </div>
            <div className="ch-welcome-buttons">
              <Link to="/BrowseServices" className="ch-btn gold">Browse Services</Link>
              <Link to="/MyBookings" className="ch-text-link">View My Bookings →</Link>
            </div>
          </section>

          {error && (
            <div className="ch-data-message error" role="alert">
              <span>{error}</span>
              <button type="button" className="ch-btn outline small" onClick={loadOverview}>Retry</button>
            </div>
          )}

          <section className="ch-stats" aria-label="Booking statistics">
            {stats.map((stat) => (
              <div className="ch-card ch-stat" key={stat.label}>
                <div className="ch-stat-top"><small>{stat.label}</small><span className="ch-icon-box">{stat.icon}</span></div>
                <strong>{loading || !overview ? "—" : stat.value}</strong>
                <span className={`ch-pill ${stat.css}`}>From your bookings</span>
              </div>
            ))}
          </section>

          <section className="ch-card ch-booking-panel">
            <div className="ch-head">
              <h2><i className="ch-bar"></i>Recent Bookings</h2>
              <Link to="/MyBookings" className="ch-link">View All →</Link>
            </div>

            {loading ? (
              <p className="ch-empty" role="status">Loading your bookings...</p>
            ) : error ? (
              <p className="ch-empty">Booking records could not be loaded.</p>
            ) : recentBookings.length === 0 ? (
              <div className="ch-empty">
                <p>No bookings found.</p>
                <Link to="/BrowseServices" className="ch-link">Browse services to get started →</Link>
              </div>
            ) : (
              <div className="ch-booking-list">
                {recentBookings.map((booking) => (
                  <article className="ch-booking-row" key={booking._id}>
                    <span className={`ch-booking-status ${booking.status?.toLowerCase() || ""}`}>
                      {booking.status || "Status not available"}
                    </span>
                    <div className="ch-booking-details">
                      <strong>{booking.service?.title || "Service not available"}</strong>
                      <small>
                        {booking.service?.category || "Category not available"}
                        {booking.provider?.username ? ` · ${booking.provider.username}` : ""}
                      </small>
                    </div>
                    <div className="ch-booking-meta">
                      <strong>{formatDate(booking.eventDate)}</strong>
                      <small>{booking.location || "Location not available"}</small>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="ch-card ch-account-note">
            <h2>Account Information</h2>
            <p>
              {customer?.createdAt
                ? `Your account was created ${formatDate(customer.createdAt)}.`
                : "Account creation date is not available."}
            </p>
            <p>Payment and spending details are not available because no payment records are configured.</p>
            <Link to="/MyProfile" className="ch-link">View My Profile →</Link>
          </section>
        </main>
      </div>
    </div>
  );
}
