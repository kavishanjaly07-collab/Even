
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { bookingApi } from "../../services/api";
import BrandLogo from "../BrandLogo";
import "./AvailabilityCalendar.css";

const menuItems = [
  ["⌂", "Overview"],
  ["♧", "My Services"],
  ["▣", "Booking Requests"],
  ["▦", "Availability Calendar"],
  ["▤", "Earnings & Payments"],
  ["✉", "Messages"],
  ["☆", "Reviews & Ratings"],
  ["♙", "Subscription & Membership"],
  ["♙", "My Profile"],
  ["↪", "Logout"],
];

const months = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

function AvailabilityCalendar() {
  const navigate = useNavigate();
  const { user, clearSession } = useAuth();
  const today = new Date();
  const [activeMenu, setActiveMenu] = useState("Availability Calendar");
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [calendarFilter, setCalendarFilter] = useState("All Statuses");
  const [view, setView] = useState("Month");
  const [showAvailability, setShowAvailability] = useState(false);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [notification, setNotification] = useState("");

  const [availability, setAvailability] = useState({
    startDate: "",
    endDate: "",
    startTime: "09:00",
    endTime: "17:00",
    repeat: "Does not repeat",
  });

  const [blackout, setBlackout] = useState({
    startDate: "",
    endDate: "",
    reason: "Personal / Private Event",
    notes: "",
  });

  useEffect(() => {
    let active = true;
    bookingApi.getProviderRequests()
      .then(({ bookings }) => {
        if (!Array.isArray(bookings)) {
          throw new Error("The booking records response was invalid.");
        }
        const calendarEvents = bookings.flatMap((booking) => {
          const date = new Date(booking.eventDate);
          if (Number.isNaN(date.getTime())) return [];
          return [{
            id: booking._id,
            day: date.getDate(),
            month: date.getMonth(),
            year: date.getFullYear(),
            date,
            title: booking.service?.title || "Service no longer available",
            time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            type: booking.status === "Accepted" ? "booked" : booking.status === "Pending" ? "pending" : "rejected",
            status: booking.status || "Not available",
            location: booking.location || "Not available",
            customer: booking.customer?.username || "Customer",
            category: booking.service?.category || "Not available",
          }];
        });
        if (active) setEvents(calendarEvents);
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

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const calendarCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const changeMonth = (direction) => {
    let nextMonth = month + direction;
    let nextYear = year;

    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear--;
    }

    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear++;
    }

    setMonth(nextMonth);
    setYear(nextYear);
    setSelectedDay(1);
  };

  const selectedEvents = events.filter(
    (event) => event.day === selectedDay && event.month === month && event.year === year
  );

  const addAvailability = (e) => {
    e.preventDefault();

    if (!availability.startDate || !availability.endDate) {
      setNotification("Please select availability dates.");
      return;
    }

    setNotification("Availability settings cannot be saved because the backend does not support them.");
  };

  const addBlackout = (e) => {
    e.preventDefault();

    if (!blackout.startDate || !blackout.endDate) {
      setNotification("Please select blackout dates.");
      return;
    }

    setNotification("Blackout dates cannot be saved because the backend does not support them.");
  };

  const getDayEvents = (day) =>
    events.filter((event) => event.day === day && event.month === month && event.year === year);

  const visibleEvents = selectedEvents.filter((event) => {
    if (calendarFilter === "All Statuses") return true;
    if (calendarFilter === "Accepted") return event.status === "Accepted";
    if (calendarFilter === "Pending") return event.status === "Pending";
    return event.status === "Rejected";
  });
  const timelineEvents = events.filter((event) =>
    event.year === year &&
    event.month === month &&
    Math.abs(event.day - selectedDay) <= 3
  );

  return (
    <div className="ac-dashboard">

      {/* SIDEBAR */}
      <aside className="ac-sidebar">
        <div className="ac-logo">
          <BrandLogo className="ac-logo-icon" />
          <span>Event Connect</span>
        </div>

        <div className="ac-tagline">
          YOUR EVENT, PERFECTLY PLANNED
        </div>

        <nav className="ac-nav">
          {menuItems.map(([icon, label]) => (
            <button
              key={label}
              className={`ac-nav-item ${
                activeMenu === label ? "active" : ""
              } ${label === "Logout" ? "ac-logout" : ""}`}
              onClick={() => {
                if (label === "Logout") {
                  clearSession();
                  navigate("/login", { replace: true });
                  return;
                }
                setActiveMenu(label);
                if (label === "Overview") navigate("/ProviderHome");
                else if (label === "My Services") navigate("/MyServices");
                else if (label === "Booking Requests") navigate("/BookingRequests");
                else if (label !== "Availability Calendar") {
                  navigate("/ProviderHome", {
                    state: { providerPage: label },
                  });
                }
              }}
            >
              <span className="ac-nav-icon">{icon}</span>
              <span>{label}</span>

              {label === "Booking Requests" && (
                <span className="ac-nav-dot">{events.filter((event) => event.status === "Pending").length}</span>
              )}

            </button>
          ))}
        </nav>

        <div className="ac-concierge">
          <strong>✦ Artisan Concierge</strong>
          <p>Provider support details are not configured in the backend.</p>
          <button onClick={() => setNotification("Support contact information is not configured.")}>
            Support details
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="ac-main">

        {/* HEADER */}
        <header className="ac-header">
          <div className="ac-header-left">
            <div className="ac-header-brand">Event Connect</div>
            <small>VENDOR MANAGEMENT PORTAL</small>
          </div>

          <div className="ac-header-right">
            <input
              type="text"
              placeholder="⌕  Search bookings, services, clients..."
              className="ac-search"
            />
            <button className="ac-header-icon" aria-label="Notifications">♧</button>
            <button className="ac-header-icon">♢</button>

            <div className="ac-profile">
              <span className="ac-profile-avatar">{user?.username?.charAt(0).toUpperCase() || "P"}</span>
              <div>
                <strong>{user?.username || "Service Provider"}</strong>
                <small>Service Provider</small>
              </div>
              <span>⌄</span>
            </div>
          </div>
        </header>

        {/* PAGE TITLE */}
        <section className="ac-page-heading">
          <div>
            <div className="ac-breadcrumb">
              Overview / Schedule & Operations / Availability Calendar
            </div>
            <div className="ac-title-row">
              <h1>Availability Calendar</h1>
              <span className="ac-live-badge">BOOKING RECORDS</span>
            </div>
            <p>View booking records associated with your provider account. Availability settings are not supported by the current backend.</p>
          </div>

          <div className="ac-heading-actions">
            <button
              className="ac-add-button"
              onClick={() => setShowAvailability(true)}
            >
              + Add Availability
            </button>

            <button
              className="ac-block-button"
              onClick={() => setShowBlockForm(true)}
            >
              ▣ Block Dates
            </button>

            <button className="ac-purple-button" onClick={() => setNotification("Calendar synchronization is not configured.")}>
              Sync Calendar
            </button>

            <button
              className="ac-purple-button"
              onClick={() => setNotification("Working hours are not configured in the backend.")}
            >
              ◷ Working Hours & Rules
            </button>
          </div>
        </section>

        {/* STATISTICS */}
        <section className="ac-stats">
          <div className="ac-stat-card">
            <div className="ac-stat-top">
              <span>BOOKED SLOTS</span>
              <span className="ac-stat-icon green">▣</span>
            </div>
            <h2>{loading || loadError ? "—" : events.length}</h2>
            <div className="ac-stat-bottom">
              <span className="ac-stat-label green">Stored</span>
              <span>Booking records</span>
            </div>
          </div>

          <div className="ac-stat-card">
            <div className="ac-stat-top">
              <span>CONFIRMED EVENTS</span>
              <span className="ac-stat-icon purple">✦</span>
            </div>
            <h2>{loading || loadError ? "—" : events.filter((event) => event.status === "Accepted").length}</h2>
            <div className="ac-stat-bottom">
              <span className="ac-stat-label purple">Booked</span>
              <span>Confirmed bookings</span>
            </div>
          </div>

          <div className="ac-stat-card">
            <div className="ac-stat-top">
              <span>PENDING REQUESTS</span>
              <span className="ac-stat-icon yellow">◷</span>
            </div>
            <h2>{loading || loadError ? "—" : events.filter((event) => event.status === "Pending").length}</h2>
            <div className="ac-stat-bottom">
              <span className="ac-stat-label yellow">Action Needed</span>
              <span>Awaiting response</span>
            </div>
          </div>

          <div className="ac-stat-card">
            <div className="ac-stat-top">
              <span>BLOCKED DATES</span>
              <span className="ac-stat-icon pink">⊘</span>
            </div>
            <h2>Not available</h2>
            <div className="ac-stat-bottom">
              <span className="ac-stat-label pink">Not configured</span>
                <span>No availability records</span>
            </div>
          </div>
        </section>

        {/* DOUBLE BOOKING ALERT */}
        <div className="ac-alert">
          <div className="ac-alert-icon">✓</div>
          <div className="ac-alert-content">
            <strong>Booking Records</strong>
            <p>
              This calendar displays stored provider booking requests. Availability blocking is not configured.
            </p>
          </div>
          <button onClick={() => setNotification("Availability rules are not configured in the backend.")}>
            Availability Rules
          </button>
          <span className="ac-alert-more">⚙</span>
        </div>

        {/* CALENDAR TOOLBAR */}
        <section className="ac-calendar-toolbar">
          <div className="ac-toolbar-row">
            <div className="ac-month-control">
              <button onClick={() => changeMonth(-1)}>‹</button>
              <strong>{months[month]} {year}</strong>
              <button onClick={() => changeMonth(1)}>›</button>
            </div>

            <button
              className="ac-today-button"
              onClick={() => {
                const currentDate = new Date();
                setMonth(currentDate.getMonth());
                setYear(currentDate.getFullYear());
                setSelectedDay(currentDate.getDate());
              }}
            >
              Today
            </button>

            <select
              value={view}
              onChange={(e) => setView(e.target.value)}
              aria-label="Calendar view"
            >
              <option>Month</option>
              <option>Week</option>
              <option>Day</option>
            </select>

            <select
              value={calendarFilter}
              onChange={(e) => setCalendarFilter(e.target.value)}
              aria-label="Calendar filter"
            >
              <option>All Statuses</option>
              <option>Accepted</option>
              <option>Pending</option>
              <option>Rejected</option>
            </select>
          </div>

          <div className="ac-toolbar-row second">
            <div className="ac-view-tabs">
              {["Month", "Week", "Agenda"].map((item) => (
                <button
                  key={item}
                  className={view === item ? "active" : ""}
                  onClick={() => setView(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <span className="ac-data-source">Records from your provider bookings</span>
          </div>
        </section>

        {/* CALENDAR LEGEND */}
        <div className="ac-legend">
          <span><i className="dot-booked"></i> Confirmed Event</span>
          <span><i className="dot-pending"></i> Pending Request</span>
          <span>No booking record means availability is unknown</span>
        </div>

        {/* CALENDAR + RIGHT PANEL */}
        <section className="ac-calendar-layout">

          {/* MONTH CALENDAR */}
          <div className="ac-calendar-card">
            {view === "Month" ? (
              <>
                <div className="ac-weekdays">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => <div key={day}>{day}</div>
                  )}
                </div>

                <div className="ac-calendar-grid">
                  {Array.from({ length: calendarCells }, (_, index) => {
                    const day = index - firstDay + 1;
                    const validDay = day > 0 && day <= daysInMonth;
                    const dayEvents = validDay ? getDayEvents(day) : [];
                    const filteredDayEvents = dayEvents.filter((event) => {
                      if (calendarFilter === "All Statuses") return true;
                      return event.status === calendarFilter;
                    });

                    return (
                      <button
                        key={index}
                        disabled={!validDay}
                        className={`ac-calendar-day ${
                          !validDay ? "outside" : ""
                        } ${selectedDay === day && validDay ? "selected" : ""}`}
                        onClick={() => validDay && setSelectedDay(day)}
                      >
                        {validDay && (
                          <>
                            <span className="ac-day-number">{day}</span>

                            {filteredDayEvents.slice(0, 2).map((event, i) => (
                              <span
                                key={i}
                                className={`ac-event-chip ${event.type}`}
                              >
                                <i></i>
                                {event.title}
                              </span>
                            ))}

                            {filteredDayEvents.length > 2 && (
                              <span className="ac-more-events">
                                +{filteredDayEvents.length - 2} more
                              </span>
                            )}

                            {dayEvents.length === 0 && <span className="ac-available-label">No bookings</span>}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="ac-alternative-view">
                <h3>{view} View</h3>
                <p>
                  Select a date in the month view to inspect its schedule.
                  Current selected date: {months[month]} {selectedDay}, {year}.
                </p>
                <button onClick={() => setView("Month")}>
                  Return to Month View
                </button>
              </div>
            )}

            <div className="ac-calendar-footer">
              <span>◉ {events.filter((event) => event.status === "Accepted").length} Accepted</span>
                  <span>◷ {events.filter((event) => event.status === "Pending").length} Pending</span>
                  <span>⊘ Not available: blocked dates</span>
            </div>
          </div>

          {/* SELECTED DATE PANEL */}
          <aside className="ac-right-column">

            <div className="ac-selected-card">
              <div className="ac-selected-heading">
                <div className="ac-selected-date-icon">▣</div>
                <div>
                  <h3>{new Date(year, month, selectedDay).toLocaleDateString("en-US", {
                    weekday: "long",
                  })}</h3>
                  <strong>{months[month]} {selectedDay}, {year}</strong>
                  <small>Selected Schedule</small>
                </div>
                <span className="ac-date-badge">
                  {loading ? "Loading" : loadError ? "Unavailable" : selectedEvents.length ? "Scheduled" : "No bookings"}
                </span>
              </div>

              <div className="ac-request-info">
                {loading && <p role="status">Loading provider bookings...</p>}
                {loadError && <p role="alert">{loadError}</p>}
                {!loading && !loadError && visibleEvents.map((event) => (
                  <article className="ac-event-details" key={event.id}>
                    <div className="ac-request-heading">
                      <small>BOOKING REQUEST</small>
                      <span>{event.status}</span>
                    </div>
                    <h2>#{event.id.slice(-8).toUpperCase()}</h2>
                    <div className="ac-request-client">
                      <span className="ac-client-avatar">{event.customer.slice(0, 1).toUpperCase()}</span>
                      <div><strong>{event.customer}</strong><small>{event.title} · {event.category}</small></div>
                    </div>
                    <div className="ac-request-times">
                      <div><small>EVENT TIME</small><strong>{event.time}</strong><small>{event.date.toLocaleDateString()}</small></div>
                      <div><small>LOCATION</small><strong>{event.location}</strong></div>
                    </div>
                    <button type="button" onClick={() => navigate("/BookingRequests")}>Manage booking</button>
                  </article>
                ))}
                {!loading && !loadError && visibleEvents.length === 0 && <p>No booking records for this date.</p>}
              </div>

              <button
                className="ac-add-blocked"
                onClick={() => setShowBlockForm(true)}
              >
                + Add Blackout Date
              </button>
            </div>

            {/* WEEK TIMELINE */}
            <div className="ac-side-card">
              <div className="ac-side-heading">
                <h3>Booking Timeline</h3>
                <small>{months[month]} {year}</small>
              </div>

              {timelineEvents.map((event) => (
                <div className="ac-timeline-item" key={event.id}>
                  <span className={`ac-timeline-icon ${event.type === "pending" ? "yellow" : event.type === "booked" ? "green" : "purple"}`}>▣</span>
                  <div>
                    <strong>{event.title}</strong>
                    <small>{event.date.toLocaleString()}</small>
                  </div>
                  <span className={`ac-timeline-status ${event.type === "pending" ? "yellow" : event.type === "booked" ? "green" : "purple"}`}>{event.status}</span>
                </div>
              ))}
              {loading && <p role="status">Loading bookings...</p>}
              {loadError && <p role="alert">{loadError}</p>}
              {!loading && !loadError && !timelineEvents.length && <p>No booking records found in this period.</p>}
            </div>

            {/* WORKING HOURS */}
            <div className="ac-side-card ac-working-card">
              <div className="ac-side-heading">
                <h3>Working Hours</h3>
              </div>

              <p>Not available: working hours and timezone are not stored in the provider profile.</p>
            </div>
          </aside>
        </section>

        {/* BOTTOM FORMS */}
        <section className="ac-bottom-forms">

          {/* ADD AVAILABILITY */}
          <form
            className="ac-form-card"
            onSubmit={addAvailability}
          >
            <div className="ac-form-heading">
              <span className="ac-form-icon green">◷</span>
              <div>
                <h3>Add Custom Availability Window</h3>
                <p>Open specific dates and times for additional bookings.</p>
              </div>
              <span className="ac-form-label green">OPEN WINDOW</span>
            </div>

            <div className="ac-form-grid">
              <label>
                START DATE
                <input
                  type="date"
                  value={availability.startDate}
                  onChange={(e) => setAvailability({
                    ...availability,
                    startDate: e.target.value,
                  })}
                />
              </label>

              <label>
                END DATE
                <input
                  type="date"
                  value={availability.endDate}
                  onChange={(e) => setAvailability({
                    ...availability,
                    endDate: e.target.value,
                  })}
                />
              </label>

              <label>
                START TIME
                <input
                  type="time"
                  value={availability.startTime}
                  onChange={(e) => setAvailability({
                    ...availability,
                    startTime: e.target.value,
                  })}
                />
              </label>

              <label>
                END TIME
                <input
                  type="time"
                  value={availability.endTime}
                  onChange={(e) => setAvailability({
                    ...availability,
                    endTime: e.target.value,
                  })}
                />
              </label>
            </div>

            <label className="ac-full-label">
              REPEAT SCHEDULE
              <select
                value={availability.repeat}
                onChange={(e) => setAvailability({
                  ...availability,
                  repeat: e.target.value,
                })}
              >
                <option>Does not repeat</option>
                <option>Every day</option>
                <option>Every week</option>
                <option>Every month</option>
              </select>
            </label>

            <div className="ac-form-note">Availability settings cannot be saved because the backend does not support them.</div>

            <div className="ac-form-actions">
              <button
                type="button"
                className="ac-cancel"
                onClick={() => setAvailability({
                  startDate: "",
                  endDate: "",
                  startTime: "09:00",
                  endTime: "17:00",
                  repeat: "Does not repeat",
                })}
              >
                Cancel
              </button>
              <button type="submit" className="ac-save">
                Save Availability
              </button>
            </div>
          </form>

          {/* BLOCK BLACKOUT DATES */}
          <form
            className="ac-form-card"
            onSubmit={addBlackout}
          >
            <div className="ac-form-heading">
              <span className="ac-form-icon red">▣</span>
              <div>
                <h3>Block Blackout Dates</h3>
                <p>Temporarily mark dates as unavailable for new bookings.</p>
              </div>
              <span className="ac-form-label red">BLOCK DATES</span>
            </div>

            <div className="ac-form-grid">
              <label>
                BLACKOUT START
                <input
                  type="date"
                  required
                  value={blackout.startDate}
                  onChange={(e) => setBlackout({
                    ...blackout,
                    startDate: e.target.value,
                  })}
                />
              </label>

              <label>
                BLACKOUT END
                <input
                  type="date"
                  required
                  value={blackout.endDate}
                  onChange={(e) => setBlackout({
                    ...blackout,
                    endDate: e.target.value,
                  })}
                />
              </label>
            </div>

            <label className="ac-full-label">
              REASON FOR BLOCKING
              <select
                value={blackout.reason}
                onChange={(e) => setBlackout({
                  ...blackout,
                  reason: e.target.value,
                })}
              >
                <option>Personal / Private Event</option>
                <option>Holiday</option>
                <option>Maintenance</option>
                <option>Other</option>
              </select>
            </label>

            <label className="ac-full-label">
              INTERNAL NOTES
              <textarea
                placeholder="Add a note about these blocked dates..."
                value={blackout.notes}
                onChange={(e) => setBlackout({
                  ...blackout,
                  notes: e.target.value,
                })}
              />
            </label>

            <div className="ac-warning-note">
              Blocked dates cannot be saved because the backend does not support them.
            </div>

            <div className="ac-form-actions">
              <button
                type="button"
                className="ac-cancel"
                onClick={() => setBlackout({
                  startDate: "",
                  endDate: "",
                  reason: "Personal / Private Event",
                  notes: "",
                })}
              >
                Cancel
              </button>
              <button type="submit" className="ac-block-submit">
                Confirm Blocked Dates
              </button>
            </div>
          </form>
        </section>

        {notification && (
          <div className="ac-toast">
            <span>✓</span>
            {notification}
            <button onClick={() => setNotification("")}>×</button>
          </div>
        )}

        <footer className="ac-footer">
          © {new Date().getFullYear()} Event Connect.
        </footer>

      </main>

      {/* AVAILABILITY MODAL */}
      {showAvailability && (
        <div className="ac-modal-overlay">
          <form
            className="ac-modal"
            onSubmit={addAvailability}
          >
            <button
              type="button"
              className="ac-modal-close"
              onClick={() => setShowAvailability(false)}
            >
              ×
            </button>
            <h2>Add Availability</h2>
            <p>Open a custom time window for new booking requests.</p>

            <label>
              Start Date
              <input
                type="date"
                required
                value={availability.startDate}
                onChange={(e) => setAvailability({
                  ...availability,
                  startDate: e.target.value,
                })}
              />
            </label>

            <label>
              End Date
              <input
                type="date"
                required
                value={availability.endDate}
                onChange={(e) => setAvailability({
                  ...availability,
                  endDate: e.target.value,
                })}
              />
            </label>

            <button type="submit" className="ac-save">
              Save Availability
            </button>
          </form>
        </div>
      )}

      {/* BLACKOUT MODAL */}
      {showBlockForm && (
        <div className="ac-modal-overlay">
          <form
            className="ac-modal"
            onSubmit={addBlackout}
          >
            <button
              type="button"
              className="ac-modal-close"
              onClick={() => setShowBlockForm(false)}
            >
              ×
            </button>
            <h2>Block Dates</h2>
            <p>Choose dates when you are not available.</p>

            <label>
              Start Date
              <input
                type="date"
                required
                value={blackout.startDate}
                onChange={(e) => setBlackout({
                  ...blackout,
                  startDate: e.target.value,
                })}
              />
            </label>

            <label>
              End Date
              <input
                type="date"
                required
                value={blackout.endDate}
                onChange={(e) => setBlackout({
                  ...blackout,
                  endDate: e.target.value,
                })}
              />
            </label>

            <button type="submit" className="ac-block-submit">
              Confirm Blocked Dates
            </button>
          </form>
        </div>
      )}

    </div>
  );
}

export default AvailabilityCalendar;
