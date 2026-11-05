import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { bookingApi } from "../../services/api";
import "./EventConnectBookings.css";
import ClientSidebar from "./ClientSidebar";

const filters = [
  { id: "all", label: "All Bookings" },
  { id: "Accepted", label: "Accepted" },
  { id: "Pending", label: "Pending Approval" },
  { id: "Rejected", label: "Rejected" },
];

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function Icon({ children }) {
  return <span className="eb-icon" aria-hidden="true">{children}</span>;
}

function BookingCard({ booking }) {
  const service = booking.service || {};
  const statusType = booking.status === "Pending"
    ? "pending"
    : booking.status === "Accepted"
      ? "confirmed"
      : "rejected";

  return (
    <article className="eb-booking-card">
      <div className="eb-booking-top">
        <div className={`eb-vendor-avatar eb-avatar-${statusType}`}>✦</div>
        <div className="eb-booking-title">
          <div className="eb-booking-meta"><span>{booking._id.slice(-8)}</span><i>•</i>{service.category || "Service"}</div>
          <h3>{service.title || "Service no longer available"}</h3>
          <div className="eb-vendor-name"><span>✦</span>{service.provider?.username || "Provider"}</div>
        </div>
        <span className={`eb-status eb-status-${statusType}`}>
          <i />{booking.status}
        </span>
      </div>

      <div className="eb-details-grid">
        <div className="eb-detail">
          <span className="eb-detail-icon">▣</span>
          <div><small>EVENT DATE</small><strong>{formatDate(booking.eventDate)}</strong></div>
        </div>
        <div className="eb-detail">
          <span className="eb-detail-icon">⌖</span>
          <div><small>LOCATION</small><strong>{booking.location}</strong></div>
        </div>
        <div className="eb-detail">
          <span className="eb-detail-icon">▤</span>
          <div><small>PRICE</small><strong>{service.price === undefined ? "Not available" : `LKR ${Number(service.price).toLocaleString()} ${service.priceUnit || ""}`}</strong></div>
        </div>
      </div>

      <div className={`eb-booking-footer ${statusType === "pending" ? "eb-pending-footer" : ""}`}>
        <div className="eb-booking-note">
          {statusType === "pending" ? <span className="eb-note-warn">♜</span> : <span className="eb-note-check">✓</span>}
          {booking.additionalRequirements || "No additional requirements provided."}
        </div>
      </div>
    </article>
  );
}

export default function EventConnectBookings() {
  const navigate = useNavigate();
  const { user, clearSession } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [calendarFilter, setCalendarFilter] = useState("All Dates");
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");
    bookingApi.getMyBookings()
      .then(({ bookings: currentBookings }) => {
        if (!Array.isArray(currentBookings)) {
          throw new Error("The bookings response was invalid.");
        }
        if (active) setBookings(currentBookings);
      })
      .catch((error) => {
        if (active) setLoadError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredBookings = useMemo(() => bookings.filter((booking) => {
    const query = search.trim().toLowerCase();
    const service = booking.service || {};
    const provider = service.provider?.username || "";
    const matchesQuery = `${service.title || ""} ${provider} ${booking._id} ${service.category || ""}`.toLowerCase().includes(query);
    const matchesFilter = activeFilter === "all" || booking.status === activeFilter;
    const eventYear = new Date(booking.eventDate).getFullYear();
    const matchesYear = calendarFilter === "All Dates" || String(eventYear) === calendarFilter;
    return matchesQuery && matchesFilter && matchesYear;
  }), [bookings, activeFilter, search, calendarFilter]);
  const calendarYears = useMemo(
    () => [...new Set(bookings.map((booking) => new Date(booking.eventDate).getFullYear()).filter(Number.isFinite))]
      .sort((left, right) => right - left),
    [bookings]
  );
  const acceptedCount = bookings.filter((booking) => booking.status === "Accepted").length;
  const pendingCount = bookings.filter((booking) => booking.status === "Pending").length;

  function exportBookings() {
    const rows = filteredBookings.map((booking) => [
      booking._id,
      booking.service?.title,
      booking.service?.category,
      booking.service?.provider?.username,
      booking.eventDate,
      booking.location,
      booking.service?.price,
      booking.status,
    ]);
    const csv = [
      ["Booking ID", "Service", "Category", "Provider", "Event Date", "Location", "Price", "Status"],
      ...rows,
    ].map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "event-connect-bookings.csv";
    link.click();
    URL.revokeObjectURL(url);
    setShowExport(false);
  }

  return (
    <div className="eb-page">
      <div className="eb-app">
        <ClientSidebar
          onHelp={() => navigate("/Messages")}
          onLogout={() => {
            clearSession();
            navigate("/login", { replace: true });
          }}
        />

        <main className="eb-main">
          <header className="eb-topbar">
            <label className="eb-global-search"><Icon>⌕</Icon><input placeholder="Search services, verified vendors, cakes, catering..." /><kbd>⌘ K</kbd></label>
            <div className="eb-top-actions">
              <button type="button" className="eb-top-icon" aria-label="Notifications">♧<i /></button>
              <button type="button" className="eb-top-icon" aria-label="Bookings">▣<i /></button>
              <div className="eb-user"><span className="eb-user-avatar">{user?.username?.charAt(0).toUpperCase() || "C"}</span><span className="eb-user-copy"><strong>{user?.username || "Customer"}</strong><small>Customer</small></span></div>
            </div>
          </header>

          <section className="eb-page-heading">
            <div>
              <div className="eb-eyebrow">✦ CURATED RESERVATION LEDGER</div>
              <h1>My Bookings</h1>
              <p>Track, manage, and coordinate your upcoming and past event services reservations with private atelier concierge access.</p>
            </div>
            <div className="eb-summary-cards">
              <div className="eb-summary-card"><span className="eb-summary-icon green">▣</span><div><small>ACCEPTED</small><strong>{acceptedCount}</strong></div></div>
              <div className="eb-summary-card"><span className="eb-summary-icon gold">⌛</span><div><small>PENDING</small><strong>{pendingCount}</strong></div></div>
              <button className="eb-export-button" type="button" onClick={() => setShowExport((value) => !value)} disabled={loading || Boolean(loadError) || bookings.length === 0}>⇩ Export<br />Ledger</button>
              {showExport && <div className="eb-export-menu"><button type="button" onClick={exportBookings}>Export filtered records as CSV</button><p>PDF export is not available.</p></div>}
            </div>
          </section>

          <section className="eb-content">
            <div className="eb-booking-toolbar">
              <div className="eb-filter-tabs">
                {filters.map((filter) => {
                  const count = filter.id === "all"
                    ? bookings.length
                    : bookings.filter((booking) => booking.status === filter.id).length;
                  return <button type="button" key={filter.id} className={activeFilter === filter.id ? "is-selected" : ""} onClick={() => setActiveFilter(filter.id)}>{filter.label} ({count})</button>;
                })}
              </div>
              <label className="eb-booking-search"><Icon>⌕</Icon><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search provider or event..." /></label>
              <select className="eb-calendar-select" value={calendarFilter} onChange={(event) => setCalendarFilter(event.target.value)} aria-label="Calendar range">
                <option>All Dates</option>{calendarYears.map((year) => <option key={year} value={String(year)}>{year}</option>)}
              </select>
              <button className="eb-new-booking" type="button" onClick={() => navigate("/BrowseServices")}>+ New Booking</button>
            </div>

            <div className="eb-layout">
              <section className="eb-bookings-list">
                {loading && <div className="eb-no-results" role="status">Loading your bookings...</div>}
                {loadError && <div className="eb-no-results" role="alert">{loadError}</div>}
                {!loading && !loadError && filteredBookings.map((booking) => <BookingCard key={booking._id} booking={booking} />)}
                {!loading && !loadError && filteredBookings.length === 0 && <div className="eb-no-results">{bookings.length ? "No bookings match your search." : "You have not submitted any booking requests yet."}</div>}
              </section>

              <aside className="eb-right-column">
                <section className="eb-concierge-card">
                  <div className="eb-concierge-heading"><span className="eb-concierge-icon">▣</span><div><h2>Booking Support</h2><small>AVAILABLE ACTIONS</small></div></div>
                  <p>Contact a provider through the booking-linked messaging page.</p>
                  <Link className="eb-concierge-call" to="/Messages">View booking messages</Link>
                  <p>Payment, receipt, and notification records are not available in the current backend.</p>
                </section>

                <section className="eb-timeline-card">
                  <div className="eb-timeline-title"><h2>Recent Requests</h2><span>{bookings.length}<br />Total</span></div>
                  {bookings.slice(0, 3).map((booking) => (
                    <div className="eb-timeline-item" key={booking._id}>
                      <span className={`eb-timeline-dot ${booking.status === "Accepted" ? "green" : booking.status === "Pending" ? "gold" : "purple"}`} />
                      <small>{formatDate(booking.eventDate)}</small>
                      <strong>{booking.service?.title || "Service no longer available"}</strong>
                      <p>{booking.location} · {booking.status}</p>
                    </div>
                  ))}
                  {!bookings.length && !loading && <div className="eb-no-results">No booking timeline available yet.</div>}
                </section>
              </aside>
            </div>
          </section>
        </main>

      </div>
    </div>
  );
}
