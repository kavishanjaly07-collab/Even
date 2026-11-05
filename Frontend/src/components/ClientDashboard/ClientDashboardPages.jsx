import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ClientSidebar from "./ClientSidebar";
import "./ClientDashboardPages.css";

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
}

function PageShell({ title, description, children }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="client-extra-app">
      <ClientSidebar
        onHelp={() => navigate("/Messages")}
        onLogout={logout}
      />
      <main className="client-extra-main">
        <header className="client-extra-topbar">
          <label>
            <span aria-hidden="true">⌕</span>
            <input aria-label="Search dashboard" placeholder="Search services, bookings, vendors..." />
          </label>
          <div className="client-extra-user">
            <span className="client-extra-avatar">{user?.username?.charAt(0).toUpperCase() || "C"}</span>
            <span><strong>{user?.username || "Customer"}</strong><small>Customer</small></span>
          </div>
        </header>
        <section className="client-extra-content">
          <div className="client-extra-heading">
            <span>CLIENT DASHBOARD</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          {children}
        </section>
      </main>
    </div>
  );
}

export function PaymentsBudget() {
  return (
    <PageShell
      title="Payments & Budget"
      description="Payment and budget information is not available because transaction data is not connected."
    >
      <section className="client-extra-summary">
        <article><small>TOTAL EVENT BUDGET</small><strong>Not available</strong><span>Budget data is not available.</span></article>
        <article><small>ALLOCATED</small><strong>Not available</strong><span>Payment allocation data is not available.</span></article>
        <article><small>REMAINING</small><strong>Not available</strong><span>Remaining budget data is not available.</span></article>
      </section>
      <section className="client-extra-card">
        <div className="client-extra-card-heading"><div><h2>Budget breakdown</h2><p>Vendor payment details are not available without a payment or transaction API.</p></div><Link to="/MyBookings">View bookings</Link></div>
        <div className="client-extra-table">
          <div className="client-extra-table-row client-extra-table-head"><span>VENDOR / SERVICE</span><span>CATEGORY</span><span>AMOUNT</span><span>PAYMENT STATUS</span></div>
          <div className="client-extra-table-row"><span>No payment records are available.</span></div>
        </div>
      </section>
    </PageShell>
  );
}

export function MyReviews() {
  return (
    <PageShell
      title="My Reviews"
      description="Review records are not available through the current backend."
    >
      <section className="client-extra-card">
        <div className="client-extra-card-heading"><div><h2>Reviews you have shared</h2><p>Feedback from your completed bookings.</p></div></div>
        <div className="client-extra-reviews">
          <p>No review records are available to display.</p>
        </div>
      </section>
    </PageShell>
  );
}
