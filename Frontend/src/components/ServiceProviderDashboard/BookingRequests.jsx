
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { bookingApi } from "../../services/api";
import BrandLogo from "../BrandLogo";
import "./BookingRequests.css";

const menuItems = [
  ["⌂", "Overview"],
  ["♧", "My Services"],
  ["▣", "Booking Requests"],
  ["▤", "Availability Calendar"],
  ["▧", "Earnings & Payments"],
  ["✉", "Messages"],
  ["☆", "Reviews & Ratings"],
  ["♙", "Subscription & Membership"],
  ["♙", "My Profile"],
  ["↪", "Logout"],
];

const filters = [
  "All Bookings",
  "New Requests",
  "Pending / Awaiting",
  "Confirmed",
  "Rejected",
];

function BookingRequests() {
  const navigate = useNavigate();
  const { user, clearSession } = useAuth();
  const [activeMenu, setActiveMenu] = useState("Booking Requests");
  const [activeFilter, setActiveFilter] = useState("All Bookings");
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [dateFilter, setDateFilter] = useState("All Dates");
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");
    bookingApi.getProviderRequests()
      .then(({ bookings: currentBookings }) => {
        if (!Array.isArray(currentBookings)) {
          throw new Error("The booking requests response was invalid.");
        }
        if (!active) return;
        setBookings(currentBookings);
        setSelectedBooking(currentBookings[0] || null);
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

  const statusCount = (status) => loading || loadError
    ? "—"
    : bookings.filter((booking) => booking.status === status).length;
  const stats = [
    { label: "TOTAL REQUESTS", value: loading || loadError ? "—" : bookings.length, sub: "All provider requests", icon: "▤", type: "purple" },
    { label: "PENDING", value: statusCount("Pending"), sub: "Requires action", icon: "◷", type: "yellow" },
    { label: "ACCEPTED", value: statusCount("Accepted"), sub: "Accepted requests", icon: "◉", type: "green" },
    { label: "REJECTED", value: statusCount("Rejected"), sub: "Rejected requests", icon: "×", type: "red" },
    { label: "AWAITING RESPONSE", value: statusCount("Pending"), sub: "Pending requests", icon: "✓", type: "pink" },
  ];

  const filteredBookings = bookings.filter((booking) => {
    const customer = booking.customer?.username || "";
    const service = booking.service || {};
    const query = search.toLowerCase();
    const matchesSearch =
      customer.toLowerCase().includes(query) ||
      booking._id.toLowerCase().includes(query) ||
      (service.title || "").toLowerCase().includes(query);

    const matchesFilter =
      activeFilter === "All Bookings" ||
      (activeFilter === "New Requests" && booking.status === "Pending") ||
      (activeFilter === "Pending / Awaiting" && booking.status === "Pending") ||
      (activeFilter === "Confirmed" && booking.status === "Accepted") ||
      (activeFilter === "Rejected" && booking.status === "Rejected");
    const matchesCategory = categoryFilter === "All Categories" || service.category === categoryFilter;
    const eventDate = new Date(booking.eventDate);
    const monthKey = Number.isNaN(eventDate.getTime())
      ? ""
      : `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, "0")}`;
    const matchesDate = dateFilter === "All Dates" || monthKey === dateFilter;

    return matchesSearch && matchesFilter && matchesCategory && matchesDate;
  });
  const categories = [...new Set(bookings.map((booking) => booking.service?.category).filter(Boolean))].sort();
  const dateOptions = [...new Set(bookings.map((booking) => {
    const date = new Date(booking.eventDate);
    return Number.isNaN(date.getTime())
      ? ""
      : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }).filter(Boolean))].sort((left, right) => right.localeCompare(left));
  const calendarDays = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const calendarTitle = calendarMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const countForFilter = (filter) => {
    if (loading || loadError) return "—";
    if (filter === "All Bookings") return bookings.length;
    if (filter === "New Requests" || filter === "Pending / Awaiting") return statusCount("Pending");
    if (filter === "Confirmed") return statusCount("Accepted");
    return statusCount("Rejected");
  };

  function changeCalendarMonth(amount) {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  }

  async function updateBooking(status) {
    if (!selectedBooking || selectedBooking.status !== "Pending") return;
    setBusy(true);
    setMessage("");
    try {
      const { booking } = await bookingApi.updateStatus(selectedBooking._id, status);
      setBookings((current) => current.map((item) => item._id === booking._id ? booking : item));
      setSelectedBooking(booking);
      setMessage(`Booking ${status.toLowerCase()} successfully.`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  const selectedCustomer = selectedBooking?.customer?.username || "";
  const selectedService = selectedBooking?.service || {};
  const initials = selectedCustomer.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "C";
  const formatEventDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString();
  };

  return (
    <div className="bc-dashboard">

      {/* SIDEBAR */}
      <aside className="bc-sidebar">
        <div className="bc-logo">
          <BrandLogo className="bc-logo-icon" />
          <span>Event Connect</span>
        </div>

        <div className="bc-sidebar-caption">
          YOUR EVENT, PERFECTLY PLANNED
        </div>

        <nav className="bc-navigation">
          {menuItems.map(([icon, label]) => (
            <button
              key={label}
              className={`bc-nav-item ${
                activeMenu === label ? "active" : ""
              } ${label === "Logout" ? "logout" : ""}`}
              onClick={() => {
                if (label === "Logout") {
                  clearSession();
                  navigate("/login", { replace: true });
                  return;
                }
                setActiveMenu(label);
                if (label === "Overview") navigate("/ProviderHome");
                else if (label === "My Services") navigate("/MyServices");
                else if (label === "Availability Calendar") navigate("/AvailabilityCalendar");
                else if (label !== "Booking Requests") {
                  navigate("/ProviderHome", { state: { providerPage: label } });
                }
              }}
            >
              <span className="bc-nav-icon">{icon}</span>
              <span>{label}</span>

              {label === "Booking Requests" && (
                <span className="bc-nav-count">{statusCount("Pending")}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="bc-sidebar-help">
          <strong>ARTISAN CONCIERGE</strong>
          <p>Need support or assistance? We're here to help.</p>
          <button onClick={() => setMessage("Support contact information is not configured.")}>
            Support details
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="bc-main">

        {/* TOP BAR */}
        <header className="bc-topbar">
          <div className="bc-breadcrumb">
            <span>Home</span>
            <span>›</span>
            <strong>Booking Requests</strong>
          </div>

          <div className="bc-top-actions">
            <input
              className="bc-global-search"
              placeholder="Search bookings, services, clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button className="bc-top-icon" type="button" aria-label="Notifications" onClick={() => setMessage("Notifications are not configured.")}>🔔</button>
            <button className="bc-top-icon" type="button" aria-label="Messages" onClick={() => navigate("/ProviderHome", { state: { providerPage: "Messages" } })}>✉</button>

            <div className="bc-user">
              <div>
                <strong>{user?.username || "Service Provider"}</strong>
                <small>Service Provider</small>
              </div>
              <span className="bc-user-avatar">{user?.username?.charAt(0).toUpperCase() || "P"}</span>
            </div>
          </div>
        </header>

        {/* PAGE HEADING */}
        <section className="bc-heading">
          <div>
            <div className="bc-eyebrow">MANAGE YOUR BUSINESS</div>
            <h1>Booking Requests</h1>
            <p>
              Manage incoming bookings, review event details, and schedule
              verified requests with confidence.
            </p>
          </div>

          <div className="bc-heading-buttons">
            <button className="bc-outline-button" onClick={() => window.print()}>
              ♧ Export Booking Report
            </button>
            <button className="bc-primary-button" type="button" disabled title="Quotation support is not configured.">Custom quotations unavailable</button>
          </div>
        </section>

        {/* STATISTICS */}
        <section className="bc-stats">
          {stats.map((stat) => (
            <div className="bc-stat-card" key={stat.label}>
              <div className="bc-stat-top">
                <span>{stat.label}</span>
                <span className={`bc-stat-icon ${stat.type}`}>
                  {stat.icon}
                </span>
              </div>
              <h2>{stat.value}</h2>
              <div className="bc-stat-bottom">
                <span className={`bc-stat-dot ${stat.type}`}></span>
                {stat.sub}
              </div>
            </div>
          ))}
        </section>

        {/* FILTER TABS */}
        <section className="bc-filter-section">
          <div className="bc-filter-tabs">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`bc-filter-tab ${
                  activeFilter === filter ? "selected" : ""
                }`}
              >
                {filter}
                <span>{countForFilter(filter)}</span>
              </button>
            ))}
          </div>

          <div className="bc-filter-tools">
            <select aria-label="Category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option>All Categories</option>
            {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
            <select aria-label="Date range" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}>
            <option>All Dates</option>
            {dateOptions.map((date) => <option key={date} value={date}>{new Date(`${date}-01T00:00:00`).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</option>)}
            </select>
          </div>
        </section>

        {/* BOOKINGS AND DETAILS */}
        <section className="bc-content-grid">

          {/* BOOKINGS TABLE */}
          <div className="bc-booking-table">
            <div className="bc-table-header">
              <span>BOOKING ID</span>
              <span>HOST / CLIENT</span>
              <span>EVENT & SERVICE</span>
              <span>DATE & SCHEDULE</span>
            </div>

            {loading ? (
              <div className="bc-empty" role="status">Loading booking requests...</div>
            ) : loadError ? (
              <div className="bc-empty" role="alert">{loadError}</div>
            ) : filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <button
                  className={`bc-booking-row ${
                    selectedBooking?._id === booking._id ? "row-active" : ""
                  }`}
                  key={booking._id}
                  onClick={() => {
                    setSelectedBooking(booking);
                    setMessage("");
                  }}
                >
                  <div>
                    <strong>{booking._id.slice(-8)}</strong>
                    <small>♙ REQUEST</small>
                  </div>

                  <div className="bc-client-cell">
                    <span className="bc-avatar purple">
                      {(booking.customer?.username || "C").slice(0, 2).toUpperCase()}
                    </span>
                    <span>
                      <strong>{booking.customer?.username || "Customer"}</strong>
                      <small>Customer</small>
                    </span>
                  </div>

                  <div>
                    <strong>{booking.service?.title || "Service no longer available"}</strong>
                    <small>{booking.service?.category || "Service"}</small>
                  </div>

                  <div>
                    <strong>{formatEventDate(booking.eventDate)}</strong>
                    <small>{booking.location}</small>
                    <span className={`bc-status ${booking.status === "Accepted" ? "confirmed" : booking.status.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="bc-empty">
                No booking requests found.
              </div>
            )}

            <div className="bc-table-footer">
              Showing {loading || loadError ? "—" : filteredBookings.length} of {loading || loadError ? "—" : bookings.length} requests
              <span>All matching booking records</span>
            </div>
          </div>

          {/* BOOKING DETAILS */}
          <aside className="bc-details-panel">
            {selectedBooking ? (
              <>
            <div className="bc-detail-heading">
              <div>
                <small>REQUEST OVERVIEW</small>
                <h2>#{selectedBooking._id.slice(-8)}</h2>
              </div>
              <span className="bc-new-label">{selectedBooking.status}</span>
            </div>

            <div className="bc-response-box">
              <strong>◉ Booking request</strong>
              <p>{selectedBooking.status === "Pending" ? "This customer is awaiting your response." : `This request has been ${selectedBooking.status.toLowerCase()}.`}</p>
            </div>

            <div className="bc-conflict-box">
              <strong>Event location</strong>
              <p>{selectedBooking.location}</p>
            </div>

            <div className="bc-client-detail">
              <div className="bc-client-detail-top">
                <span className="bc-avatar pink">
                  {initials}
                </span>
                <div>
                  <strong>{selectedCustomer || "Customer"}</strong>
                  <small>Customer</small>
                </div>
              </div>

              <p>Service: {selectedService.title || "Service no longer available"}</p>
            </div>

            <div className="bc-detail-section">
              <h4>EVENT SPECIFICATIONS</h4>
              <div className="bc-detail-info">
                <small>SERVICE CATEGORY</small>
                <strong>{selectedService.category || "Not available"}</strong>
              </div>

              <div className="bc-detail-info vertical">
                <small>VENUE & LOCATION</small>
                <strong>{selectedBooking.location}</strong>
              </div>

              <div className="bc-detail-info vertical">
                <small>EVENT DATE</small>
                <strong>{formatEventDate(selectedBooking.eventDate)}</strong>
              </div>
            </div>

            <div className="bc-detail-section">
              <h4>REQUEST INSTRUCTIONS</h4>
              <p className="bc-instructions">
                {selectedBooking.additionalRequirements || "No additional requirements provided."}
              </p>
            </div>

            <div className="bc-price-box">
              <div>
                <span>Base Service Price</span>
                <strong>{selectedService.price === undefined ? "Not available" : `LKR ${Number(selectedService.price).toLocaleString()}`}</strong>
              </div>
              <div>
                <span>Price unit</span>
                <strong>{selectedService.priceUnit || "Not provided"}</strong>
              </div>
              <hr />
              <div className="bc-total">
                <strong>Booking status</strong>
                <strong>{selectedBooking.status}</strong>
              </div>
            </div>

            <div className="bc-action-buttons">
              <button
                className="bc-accept-button"
                onClick={() => updateBooking("Accepted")}
                disabled={selectedBooking.status !== "Pending" || busy}
              >
                ✓ Accept Booking Request
              </button>
              <div>
                <button
                  className="bc-decline-button"
                  onClick={() => updateBooking("Rejected")}
                  disabled={selectedBooking.status !== "Pending" || busy}
                >
                  ⊗ Decline
                </button>
              </div>
            </div>

            {message && (
              <div className="bc-feedback">{message}</div>
            )}
              </>
            ) : (
              <div className="bc-empty">{loading ? "Loading booking details..." : loadError || "Select a booking request to view its details."}</div>
            )}
          </aside>
        </section>

        {/* BOTTOM DASHBOARD */}
        <section className="bc-bottom-grid">

          {/* CALENDAR HEATMAP */}
          <div className="bc-heatmap-card">
            <div className="bc-bottom-heading">
              <div>
                <h3>Calendar Overview</h3>
                <div className="bc-calendar-controls">
                  <button type="button" onClick={() => changeCalendarMonth(-1)} aria-label="Previous month">‹</button>
                  <p>{calendarTitle} booking records</p>
                  <button type="button" onClick={() => changeCalendarMonth(1)} aria-label="Next month">›</button>
                </div>
              </div>
              <button type="button" onClick={() => navigate("/AvailabilityCalendar")}>View Calendar ↗</button>
            </div>

            <div className="bc-legend">
              <span><i className="booked"></i> Booked Event</span>
              <span><i className="pending"></i> Pending Request</span>
              <span>No booking record means availability is unknown</span>
            </div>

            <div className="bc-heatmap">
              {loading && <p role="status">Loading calendar records...</p>}
              {loadError && <p role="alert">{loadError}</p>}
              {Array.from({ length: calendarDays }, (_, i) => {
                const day = i + 1;
                const booking = bookings.find((item) => {
                  const date = new Date(item.eventDate);
                  return date.getFullYear() === calendarMonth.getFullYear() &&
                    date.getMonth() === calendarMonth.getMonth() &&
                    date.getDate() === day;
                });
                const type = booking?.status === "Accepted"
                  ? "booked"
                  : booking?.status === "Pending"
                    ? "pending"
                    : "available";

                return (
                  <button
                    key={day}
                    className={`bc-day ${type}`}
                    title={`${calendarTitle} ${day}${booking ? ` · ${booking.status}` : " · No booking record"}`}
                  >
                    <small>{day}</small>
                    <span>{type === "booked" ? "●" : type === "pending" ? "◷" : "○"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECURITY */}
          <div className="bc-security-card">
            <div className="bc-bottom-heading">
              <div>
                <h3>Security & Availability</h3>
                <p>Booking history</p>
              </div>
              <span>View All ↗</span>
            </div>

            <div className="bc-empty">The booking API does not provide audit history or conflict checks.</div>
          </div>
        </section>

        <footer className="bc-footer">
          © {new Date().getFullYear()} Event Connect.
        </footer>

      </main>
    </div>
  );
}

export default BookingRequests;
