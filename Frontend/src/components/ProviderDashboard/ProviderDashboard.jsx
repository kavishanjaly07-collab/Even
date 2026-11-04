import { useEffect, useState } from "react";
import { bookingApi, messageApi } from "../../services/api";
import "./ProviderDashboard.css";

// ---------- DATA (SAMPLE TEXT: replace with your real text / backend data) ----------
const studio = {
  name: "LovePetals Studio",
  type: "Floral Architecture",
  location: "Colombo, Sri Lanka",
  rating: "4.95",
};

const stats = [
  { label: "Monthly Bookings", value: "12", note: "+3 from last month" },
  { label: "Booking Volume", value: "RS 184,500", note: "Net payout RS 166,050", bar: 72 },
  { label: "Blocked Schedules", value: "4 dates", note: "Next: Nov 24" },
  { label: "Response Rate", value: "98%", note: "Avg. reply in 1h 30m" },
];

const firstInquiries = [
  {
    id: 1, client: "Eleanor & Marcus", initials: "EM",
    event: "Wedding Reception", date: "Sat, 14 Nov 2026", guests: 120,
    budget: 54300, tags: ["Chandelier Greenery", "Aisle Styling"], status: "pending",
  },
  {
    id: 2, client: "Meera Chandrika", initials: "MC",
    event: "Corporate Gala", date: "Fri, 27 Nov 2026", guests: 200,
    budget: 98000, tags: ["Stage Backdrop", "Table Centerpieces"], status: "pending",
  },
];

// Calendar days that already have a status. "YYYY-MM-DD": "booked" | "hourly" | "locked"
const firstDays = {
  "2026-11-07": "hourly",
  "2026-11-14": "booked",
  "2026-11-21": "hourly",
  "2026-11-24": "locked",
  "2026-11-25": "locked",
  "2026-11-28": "booked",
};

const packages = [
  { badge: "Signature", title: "Full Venue Floral Transformation", text: "Arches, aisles, tables and entrance, fully styled.", price: 94000, time: "Setup in 6 hours" },
  { badge: "Bespoke", title: "Intimate Ceremony Floral Composition", text: "Elegant florals for small, meaningful ceremonies.", price: 54000, time: "Setup in 3 hours" },
  { badge: "Luxury", title: "Grand Entrance Floral Styling", text: "A show-stopping floral entrance and photo wall.", price: 68000, time: "Setup in 4 hours" },
];

const portfolioTags = ["#FloralArt", "#Chandelier", "#WeddingDecor", "#LuxuryEvents"];

// ---------- HELPERS ----------
const rs = (n) => "RS " + n.toLocaleString("en-US");
const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// Turns (2026, 10, 7) into "2026-11-07"
const dayKey = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

// ---------- MAIN COMPONENT ----------
export default function ProviderDashboard() {
  const [accepting, setAccepting] = useState(true);
  const [auto, setAuto] = useState(false);
  const [inquiries, setInquiries] = useState(firstInquiries);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [messageSending, setMessageSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [days, setDays] = useState(firstDays);
  const [blockMode, setBlockMode] = useState(false);
  const [cal, setCal] = useState({ year: 2026, month: 10 }); // month 10 = November
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    let active = true;
    bookingApi.getProviderRequests()
      .then(({ bookings: currentBookings }) => {
        if (!Array.isArray(currentBookings)) {
          throw new Error("The booking requests response was invalid.");
        }
        if (active) {
          setBookings(currentBookings);
          setSelectedBookingId((current) => current || currentBookings[0]?._id || "");
        }
      })
      .catch((error) => {
        if (active) setBookingsError(error.message);
      })
      .finally(() => {
        if (active) setBookingsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const activeBooking = bookings.find((booking) => booking._id === selectedBookingId) || bookings[0] || null;

  useEffect(() => {
    if (!activeBooking?._id) {
      setMessages([]);
      setMessagesLoading(false);
      setMessagesError("");
      return undefined;
    }

    let active = true;
    setMessagesLoading(true);
    setMessagesError("");
    messageApi.getBookingMessages(activeBooking._id)
      .then(({ messages: currentMessages }) => {
        if (!Array.isArray(currentMessages)) {
          throw new Error("The messages response was invalid.");
        }
        if (active) setMessages(currentMessages);
      })
      .catch((error) => {
        if (active) setMessagesError(error.message);
      })
      .finally(() => {
        if (active) setMessagesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeBooking?._id]);

  const pendingCount = inquiries.filter((i) => i.status === "pending").length;

  // --- inquiries ---
  function answer(id, status) {
    setInquiries(inquiries.map((i) => (i.id === id ? { ...i, status } : i)));
  }

  // --- chat ---
  async function sendMessage(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !activeBooking?._id || messageSending) return;

    setMessageSending(true);
    setMessagesError("");
    try {
      await messageApi.sendBookingMessage(activeBooking._id, text);
      const { messages: currentMessages } = await messageApi.getBookingMessages(activeBooking._id);
      if (!Array.isArray(currentMessages)) {
        throw new Error("The messages response was invalid.");
      }
      setMessages(currentMessages);
      setDraft("");
    } catch (error) {
      setMessagesError(error.message);
    } finally {
      setMessageSending(false);
    }
  }

  // --- calendar ---
  const firstWeekday = new Date(cal.year, cal.month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(cal.year, cal.month + 1, 0).getDate();
  // empty boxes first, then the day numbers
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  function changeMonth(step) {
    const date = new Date(cal.year, cal.month + step, 1);
    setCal({ year: date.getFullYear(), month: date.getMonth() });
  }

  function clickDay(d) {
    if (!blockMode) return;
    const key = dayKey(cal.year, cal.month, d);
    if (days[key] === "booked") return; // booked days can't be blocked
    const copy = { ...days };
    if (copy[key] === "locked") delete copy[key];
    else copy[key] = "locked";
    setDays(copy);
  }

  // --- portfolio upload (shows a preview of the chosen pictures) ---
  function addPhotos(e) {
    const urls = Array.from(e.target.files).map((file) => URL.createObjectURL(file));
    setPhotos([...photos, ...urls]);
  }

  return (
    <div className="pd">
      {/* ===== STUDIO STATUS CARD ===== */}
      <section className="pd-card pd-studio">
        <div className="pd-avatar">{studio.name.charAt(0)}</div>
        <div className="pd-studio-info">
          <h2>{studio.name} <span className="pd-verified">✔ Verified Provider</span></h2>
          <p>{studio.type} • {studio.location} • ★ {studio.rating}</p>
        </div>

        <div className="pd-switches">
          <label className="pd-switch">
            <input type="checkbox" checked={accepting} onChange={() => setAccepting(!accepting)} />
            <span className="pd-slider"></span>
            {accepting ? "Accepting Bookings" : "Bookings Paused"}
          </label>
          <label className="pd-switch">
            <input type="checkbox" checked={auto} onChange={() => setAuto(!auto)} />
            <span className="pd-slider"></span>
            Auto Mode
          </label>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="pd-stats">
        {stats.map((s) => (
          <div className="pd-card pd-stat" key={s.label}>
            <small>{s.label}</small>
            <strong>{s.value}</strong>
            {s.bar && <div className="pd-bar"><div style={{ width: `${s.bar}%` }}></div></div>}
            <span>{s.note}</span>
          </div>
        ))}
      </section>

      <div className="pd-columns">
        {/* ============ LEFT ============ */}
        <div className="pd-stack">
          {/* Inquiries */}
          <section className="pd-card">
            <div className="pd-head">
              <h3>Active Inquiries & Proposals</h3>
              <span className="pd-pill gold">{pendingCount} Pending Actions</span>
            </div>

            {inquiries.map((q) => (
              <div className="pd-inquiry" key={q.id}>
                <div className="pd-initials">{q.initials}</div>
                <div className="pd-inquiry-body">
                  <strong>{q.client}</strong>
                  <small>{q.event} • {q.date} • {q.guests} guests</small>
                  <small>Budget: <b>{rs(q.budget)}</b></small>
                  <div className="pd-chips">
                    {q.tags.map((t) => <span key={t}>{t}</span>)}
                  </div>

                  {q.status === "pending" ? (
                    <div className="pd-buttons">
                      <button className="pd-btn dark" onClick={() => answer(q.id, "accepted")}>Accept Booking</button>
                      <button className="pd-btn light" onClick={() => answer(q.id, "declined")}>Decline</button>
                      <button className="pd-btn outline">Counter Offer</button>
                    </div>
                  ) : (
                    <span className={`pd-pill ${q.status === "accepted" ? "ok" : "no"}`}>
                      {q.status === "accepted" ? "Accepted ✅" : "Declined"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </section>

          {/* Calendar */}
          <section className="pd-card">
            <div className="pd-head">
              <div>
                <h3>Availability Calendar</h3>
                <p className="pd-sub">
                  {blockMode ? "Click a day to block or unblock it." : "Manage the dates clients can book."}
                </p>
              </div>
              <button className={`pd-btn ${blockMode ? "gold" : "light"}`} onClick={() => setBlockMode(!blockMode)}>
                {blockMode ? "Done" : "Block Dates"}
              </button>
            </div>

            <div className="pd-legend">
              <span><i className="booked"></i>Booked</span>
              <span><i className="hourly"></i>Hourly</span>
              <span><i className="locked"></i>Locked</span>
            </div>

            <div className="pd-cal-head">
              <button onClick={() => changeMonth(-1)} aria-label="Previous month">‹</button>
              <strong>{monthNames[cal.month]} {cal.year}</strong>
              <button onClick={() => changeMonth(1)} aria-label="Next month">›</button>
            </div>

            <div className="pd-cal">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
                <span className="pd-weekday" key={w}>{w}</span>
              ))}
              {cells.map((d, index) =>
                d === null ? (
                  <span key={`empty-${index}`}></span>
                ) : (
                  <button
                    key={d}
                    className={`pd-day ${days[dayKey(cal.year, cal.month, d)] || ""} ${blockMode ? "pickable" : ""}`}
                    onClick={() => clickDay(d)}
                  >
                    {d}
                  </button>
                )
              )}
            </div>
          </section>

          {/* Service tiers */}
          <section className="pd-card">
            <div className="pd-head">
              <div>
                <h3>Service Tiers & Pricing</h3>
                <p className="pd-sub">Manage the packages clients see on your profile.</p>
              </div>
              <button className="pd-btn gold">+ Add New Service</button>
            </div>

            <div className="pd-packages">
              {packages.map((p) => (
                <article className="pd-package" key={p.title}>
                  <div className="pd-package-img"><span>{p.badge}</span></div>
                  <h4>{p.title}</h4>
                  <p>{p.text}</p>
                  <div className="pd-package-foot">
                    <small>Starting Rate</small>
                    <strong>{rs(p.price)}</strong>
                    <small>{p.time}</small>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Portfolio */}
          <section className="pd-card">
            <div className="pd-head">
              <div>
                <h3>Your Showcase Portfolio</h3>
                <p className="pd-sub">A fresh, curated portfolio brings in more bookings.</p>
              </div>
              <label className="pd-btn gold">
                Upload More Media
                <input type="file" accept="image/*" multiple hidden onChange={addPhotos} />
              </label>
            </div>

            <div className="pd-photos">
              {photos.map((url) => <img key={url} src={url} alt="Portfolio" />)}
              <label className="pd-add-photo">
                + Add Image
                <input type="file" accept="image/*" multiple hidden onChange={addPhotos} />
              </label>
            </div>

            <div className="pd-chips">
              {portfolioTags.map((t) => <span key={t}>{t}</span>)}
            </div>
          </section>
        </div>

        {/* ============ RIGHT ============ */}
        <div className="pd-stack">
          <section className="pd-chat">
            <div className="pd-chat-head">
              <strong>Booking Messages</strong>
              <small>{activeBooking ? `${activeBooking.customer?.username || "Customer"} · ${activeBooking.service?.title || "Booked service"}` : "Select one of your bookings"}</small>
              <select
                className="pd-chat-booking-select"
                aria-label="Select booking conversation"
                value={activeBooking?._id || ""}
                onChange={(event) => setSelectedBookingId(event.target.value)}
                disabled={!bookings.length || messageSending}
              >
                {bookings.map((booking) => (
                  <option key={booking._id} value={booking._id}>
                    {(booking.customer?.username || "Customer") + " — " + (booking.service?.title || "Booked service")}
                  </option>
                ))}
              </select>
            </div>
            <div className="pd-chat-body">
              {bookingsLoading && <p role="status">Loading booking conversations...</p>}
              {!bookingsLoading && bookingsError && <p role="alert">{bookingsError}</p>}
              {!bookingsLoading && !bookingsError && !bookings.length && <p>No booking conversations yet.</p>}
              {bookings.length > 0 && messagesLoading && <p role="status">Loading messages...</p>}
              {messagesError && <p role="alert">{messagesError}</p>}
              {!messagesLoading && !messagesError && activeBooking && !messages.length && <p>No messages in this booking conversation yet.</p>}
              {messages.map((item) => (
                <p key={item._id} className={`pd-bubble ${item.sender?.role === "provider" ? "me" : "client"}`}>
                  <strong>{item.sender?.username || "User"}: </strong>{item.message}
                  <small>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</small>
                </p>
              ))}
            </div>
            <form className="pd-chat-input" onSubmit={sendMessage}>
              <input placeholder={activeBooking ? `Message ${activeBooking.customer?.username || "customer"}...` : "Select a booking"} value={draft} onChange={(e) => setDraft(e.target.value)} disabled={!activeBooking || messagesLoading || messageSending} />
              <button type="submit" disabled={!activeBooking || messageSending || !draft.trim()}>{messageSending ? "…" : "➤"}</button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
