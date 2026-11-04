
import React, { useState } from "react";
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
  ["♧", "Notifications"],
  ["♙", "My Profile"],
  ["?", "Help & Support"],
  ["↪", "Logout"],
];

const initialEvents = [
  { day: 3, title: "Wedding", time: "10:00 AM", type: "booked" },
  { day: 4, title: "Photography", time: "09:00 AM", type: "booked" },
  { day: 5, title: "Corporate Event", time: "02:00 PM", type: "booked" },
  { day: 6, title: "Birthday", time: "06:00 PM", type: "booked" },
  { day: 7, title: "Wedding", time: "11:00 AM", type: "pending" },
  { day: 8, title: "Photo Session", time: "09:00 AM", type: "booked" },
  { day: 10, title: "Engagement", time: "04:00 PM", type: "booked" },
  { day: 11, title: "Corporate Shoot", time: "10:00 AM", type: "booked" },
  { day: 12, title: "Wedding Event", time: "08:00 AM", type: "booked" },
  { day: 13, title: "Private Event", time: "06:00 PM", type: "pending" },
  { day: 14, title: "Concert", time: "07:00 PM", type: "booked" },
  { day: 15, title: "Wedding", time: "10:00 AM", type: "booked" },
  { day: 16, title: "Photography", time: "09:00 AM", type: "booked" },
  { day: 18, title: "Birthday Party", time: "05:00 PM", type: "pending" },
  { day: 19, title: "Corporate", time: "11:00 AM", type: "booked" },
  { day: 20, title: "Engagement", time: "04:00 PM", type: "booked" },
  { day: 21, title: "Wedding", time: "10:00 AM", type: "booked" },
  { day: 22, title: "Event Shoot", time: "09:00 AM", type: "booked" },
  { day: 24, title: "Product Launch", time: "02:00 PM", type: "pending" },
  { day: 25, title: "Photography", time: "10:00 AM", type: "booked" },
  { day: 27, title: "Private Event", time: "06:00 PM", type: "booked" },
  { day: 28, title: "Wedding", time: "08:00 AM", type: "booked" },
  { day: 29, title: "Photo Session", time: "09:00 AM", type: "booked" },
];

const months = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

function AvailabilityCalendar() {
  const [activeMenu, setActiveMenu] = useState("Availability Calendar");
  const [month, setMonth] = useState(10);
  const [year, setYear] = useState(2026);
  const [selectedDay, setSelectedDay] = useState(15);
  const [events, setEvents] = useState(initialEvents);
  const [calendarFilter, setCalendarFilter] = useState("All Services");
  const [view, setView] = useState("Month");
  const [showAvailability, setShowAvailability] = useState(false);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [notification, setNotification] = useState("");

  const [availability, setAvailability] = useState({
    startDate: "2026-11-18",
    endDate: "2026-11-20",
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
    (event) => event.day === selectedDay
  );

  const addAvailability = (e) => {
    e.preventDefault();

    if (!availability.startDate || !availability.endDate) {
      setNotification("Please select availability dates.");
      return;
    }

    setNotification("Custom availability window added successfully.");
    setShowAvailability(false);
  };

  const addBlackout = (e) => {
    e.preventDefault();

    if (!blackout.startDate || !blackout.endDate) {
      setNotification("Please select blackout dates.");
      return;
    }

    const date = new Date(blackout.startDate);
    const blackoutMonth = date.getMonth();
    const blackoutYear = date.getFullYear();

    if (blackoutMonth === month && blackoutYear === year) {
      const start = date.getDate();
      const end = new Date(blackout.endDate).getMonth() === month
        ? new Date(blackout.endDate).getDate()
        : daysInMonth;

      const newEvents = [];

      for (let day = start; day <= end; day++) {
        newEvents.push({
          day,
          title: "Unavailable",
          time: "All day",
          type: "blocked",
        });
      }

      setEvents((previous) => [
        ...previous.filter(
          (event) => !newEvents.some((item) => item.day === event.day)
        ),
        ...newEvents,
      ]);
    }

    setNotification("Blackout dates added successfully.");
    setShowBlockForm(false);
  };

  const getDayEvents = (day) =>
    events.filter((event) => event.day === day);

  const visibleEvents = selectedEvents.filter((event) => {
    if (calendarFilter === "All Services") return true;
    if (calendarFilter === "Booked") return event.type === "booked";
    if (calendarFilter === "Pending") return event.type === "pending";
    return true;
  });

  return (
    <div className="ac-dashboard">

      {/* SIDEBAR */}
      <aside className="ac-sidebar">
        <div className="ac-logo">
          <span className="ac-logo-icon">✦</span>
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
              onClick={() => setActiveMenu(label)}
            >
              <span className="ac-nav-icon">{icon}</span>
              <span>{label}</span>

              {label === "Booking Requests" && (
                <span className="ac-nav-dot">8</span>
              )}

              {label === "Messages" && (
                <span className="ac-nav-dot">3</span>
              )}

              {label === "Subscription & Membership" && (
                <span className="ac-pro">PRO</span>
              )}
            </button>
          ))}
        </nav>

        <div className="ac-concierge">
          <strong>✦ Artisan Concierge</strong>
          <p>
            Need assistance managing your availability?
            We're here to help.
          </p>
          <button onClick={() => setNotification("Support contact selected.")}>
            ♡ Contact Us
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
            <button className="ac-header-icon">♧</button>
            <button className="ac-header-icon">♢</button>

            <div className="ac-profile">
              <span className="ac-profile-avatar">L</span>
              <div>
                <strong>Lumina Events</strong>
                <small>Creative Manager</small>
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
              <span className="ac-live-badge">LIVE SYNC</span>
            </div>
            <p>
              Manage your schedule, block dates, and prevent double bookings
              with real-time availability management.
            </p>
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

            <button className="ac-purple-button">
              ✓ Sync Calendar
            </button>

            <button
              className="ac-purple-button"
              onClick={() => setNotification("Working hours settings opened.")}
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
            <h2>18</h2>
            <div className="ac-stat-bottom">
              <span className="ac-stat-label green">↑ 12.5%</span>
              <span>vs previous month</span>
            </div>
          </div>

          <div className="ac-stat-card">
            <div className="ac-stat-top">
              <span>CONFIRMED EVENTS</span>
              <span className="ac-stat-icon purple">✦</span>
            </div>
            <h2>8</h2>
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
            <h2>4</h2>
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
            <h2>5</h2>
            <div className="ac-stat-bottom">
              <span className="ac-stat-label pink">Management</span>
              <span>Personal availability</span>
            </div>
          </div>
        </section>

        {/* DOUBLE BOOKING ALERT */}
        <div className="ac-alert">
          <div className="ac-alert-icon">✓</div>
          <div className="ac-alert-content">
            <strong>Double-Booking Prevention Engine Active</strong>
            <span className="ac-active-pill">● PROTECTED</span>
            <p>
              Your calendar is automatically checked against booking requests
              to avoid schedule conflicts.
            </p>
          </div>
          <button onClick={() => setNotification("Double booking settings opened.")}>
            Rule Settings
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
                setMonth(9);
                setYear(2026);
                setSelectedDay(30);
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
              <option>All Services</option>
              <option>Booked</option>
              <option>Pending</option>
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

            <select aria-label="Service category">
              <option>All Service Types</option>
              <option>Photography</option>
              <option>Videography</option>
              <option>Decoration</option>
            </select>
            <button className="ac-download">⇩</button>
          </div>
        </section>

        {/* CALENDAR LEGEND */}
        <div className="ac-legend">
          <span><i className="dot-available"></i> Available</span>
          <span><i className="dot-booked"></i> Confirmed Event</span>
          <span><i className="dot-pending"></i> Pending Request</span>
          <span><i className="dot-blocked"></i> Blocked / Unavailable</span>
          <span><i className="dot-custom"></i> Custom Availability</span>
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
                      if (calendarFilter === "All Services") return true;
                      if (calendarFilter === "Booked") return event.type === "booked";
                      return event.type === "pending";
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

                            {dayEvents.length === 0 && (
                              <span className="ac-available-label">
                                Available
                              </span>
                            )}
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
              <span>◉ {events.filter(e => e.type === "booked").length} Booked</span>
              <span>◷ {events.filter(e => e.type === "pending").length} Pending</span>
              <span>⊘ {events.filter(e => e.type === "blocked").length} Blocked</span>
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
                  {selectedEvents.length ? "Scheduled" : "Available"}
                </span>
              </div>

              <div className="ac-request-info">
                <div className="ac-request-heading">
                  <small>BOOKING REQUEST</small>
                  <span>NEW REQUEST</span>
                </div>

                <h2>#BEC-8420</h2>

                <div className="ac-request-client">
                  <span className="ac-client-avatar">SJ</span>
                  <div>
                    <strong>Sarah Johnson</strong>
                    <small>Wedding Photography</small>
                  </div>
                </div>

                <div className="ac-request-times">
                  <div>
                    <small>START TIME</small>
                    <strong>10:00 AM</strong>
                    <small>11/15/2026</small>
                  </div>
                  <div>
                    <small>END TIME</small>
                    <strong>08:00 PM</strong>
                    <small>11/15/2026</small>
                  </div>
                </div>

                <div className="ac-request-bottom">
                  <span>◉ Calendar conflict check</span>
                  <strong>✓ No Conflict</strong>
                </div>

                <div className="ac-request-actions">
                  <button onClick={() => setNotification("Booking details opened.")}>
                    View Details
                  </button>
                  <button onClick={() => setNotification("Message window opened.")}>
                    ✉ Message
                  </button>
                </div>
              </div>

              <div className="ac-toggle-row">
                <div>
                  <strong>Accept additional bookings?</strong>
                  <small>Allow clients to request this date</small>
                </div>
                <label className="ac-switch">
                  <input type="checkbox" defaultChecked />
                  <span></span>
                </label>
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
                <h3>This Week's Timeline</h3>
                <small>Nov 14 - Nov 20</small>
              </div>

              {[
                ["♙", "Corporate Photography", "09:00 - 11:00 AM", "Confirmed", "purple"],
                ["▣", "Wedding Ceremony", "10:00 - 05:00 PM", "Booked", "green"],
                ["◷", "Private Event", "06:00 - 10:00 PM", "Pending", "yellow"],
              ].map((item) => (
                <div className="ac-timeline-item" key={item[1]}>
                  <span className={`ac-timeline-icon ${item[4]}`}>
                    {item[0]}
                  </span>
                  <div>
                    <strong>{item[1]}</strong>
                    <small>{item[2]}</small>
                  </div>
                  <span className={`ac-timeline-status ${item[4]}`}>
                    {item[3]}
                  </span>
                </div>
              ))}
            </div>

            {/* WORKING HOURS */}
            <div className="ac-side-card ac-working-card">
              <div className="ac-side-heading">
                <h3>◎ Standard Working Hours</h3>
                <button onClick={() => setNotification("Working hours editor opened.")}>
                  Edit
                </button>
              </div>

              {[
                ["Mon - Fri", "09:00 - 18:00"],
                ["Saturday", "09:00 - 15:00"],
                ["Sunday", "Unavailable"],
              ].map(([day, time]) => (
                <div className="ac-working-row" key={day}>
                  <span>{day}</span>
                  <strong>{time}</strong>
                </div>
              ))}

              <p>Timezone: Asia/Colombo (GMT +5:30)</p>
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

            <div className="ac-form-note">
              ✓ This availability will be displayed to clients when requesting bookings.
            </div>

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
              ⚠ Blocked dates will not be available for new booking requests.
              Existing confirmed bookings are not automatically cancelled.
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
          © 2026 Event Connect. All rights reserved.
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
