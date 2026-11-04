import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiError, bookingApi, messageApi, providerProfileApi, serviceApi } from "../../services/api";
import "./ProviderHome.css";

const menu = [
  "Overview", "My Services", "Booking Requests", "Availability Calendar", "Messages",
  "Reviews & Ratings", "Subscription & Membership", "Notifications", "My Profile", "Help & Support",
];

const stats = [
  { icon: "📖", label: "Total Bookings", value: null },
  { icon: "⏳", label: "Pending Requests", value: null, css: "gold" },
  { icon: "🎉", label: "Upcoming Events", value: null },
  { icon: "💰", label: "Monthly Revenue", value: "Not available", small: true },
  { icon: "⭐", label: "Average Rating", value: "Not available" },
];

const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
const revenueStats = ["TOTAL REVENUE", "AVG. BOOKING", "SETTLEMENT RATE", "DISPUTE RATE"];

const firstReviews = [
  { id: 1, who: "Opus Symphony Society", stars: 5, text: "Exquisite floral work. The hall looked breathtaking from the first minute.", replied: false },
  { id: 2, who: "Summer Executive Retreat", stars: 4, text: "Professional team and on-time setup. Would book again.", replied: false },
];

const PAGE_SIZE = 4;
const providerProfileFields = [
  "businessName",
  "businessCategory",
  "businessDescription",
  "businessPhone",
  "businessEmail",
  "location",
  "businessAddress",
  "website",
  "logo",
];
const emptyProviderProfile = Object.fromEntries(providerProfileFields.map((field) => [field, ""]));

// ---------- HELPERS ----------
const lkr = (n) => "LKR " + n.toLocaleString("en-US");
const profileFormFrom = (profile) => Object.fromEntries(
  providerProfileFields.map((field) => [field, profile[field] || ""])
);

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
}

function RevenueChart() {
  const W = 520, H = 170, left = 10;
  const step = (W - left * 2) / (months.length - 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="ph-chart" role="img" aria-label="Monthly revenue not available">
      <text x={W / 2} y="78" textAnchor="middle" fontSize="13" fill="#777">Not available</text>
      {months.map((m, i) => (
        <text key={m} x={left + step * i} y={H - 6} textAnchor="middle" fontSize="11" fill="#777">{m}</text>
      ))}
    </svg>
  );
}

// ---------- MAIN COMPONENT ----------
export default function ProviderHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState("Overview");
  const [providerServices, setProviderServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceSaving, setServiceSaving] = useState(false);
  const [busyServiceId, setBusyServiceId] = useState("");
  const [editingService, setEditingService] = useState(null);
  const [serviceError, setServiceError] = useState("");
  const [serviceSuccess, setServiceSuccess] = useState("");
  const [serviceForm, setServiceForm] = useState({
    title: "",
    category: "",
    description: "",
    price: "",
    priceUnit: "Starting Price",
    image: "",
    status: "Draft",
  });
  const [requests, setRequests] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(true);
  const [bookingError, setBookingError] = useState("");
  const [bookingActionError, setBookingActionError] = useState("");
  const [bookingActionSuccess, setBookingActionSuccess] = useState("");
  const [busyBookingId, setBusyBookingId] = useState("");
  const [messageBookingId, setMessageBookingId] = useState("");
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [messageSending, setMessageSending] = useState(false);
  const [reviews, setReviews] = useState(firstReviews);
  const [filter, setFilter] = useState("All");
  const [tablePage, setTablePage] = useState(1);
  const [messageDraft, setMessageDraft] = useState("");
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [providerProfile, setProviderProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(emptyProviderProfile);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);

  const user = getStoredUser();
  const name = providerProfile?.businessName || user?.username || "Event Connect Provider";

  useEffect(() => {
    let active = true;
    serviceApi.getMyServices()
      .then(({ services: currentServices }) => {
        if (active) setProviderServices(currentServices);
      })
      .catch((error) => {
        if (active) setServicesError(error.message);
      })
      .finally(() => {
        if (active) setServicesLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    bookingApi.getProviderRequests()
      .then(({ bookings: currentBookings }) => {
        if (!Array.isArray(currentBookings)) {
          throw new Error("The booking requests response was invalid.");
        }
        if (active) setRequests(currentBookings);
      })
      .catch((error) => {
        if (active) setBookingError(error.message);
      })
      .finally(() => {
        if (active) setBookingLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const activeMessageBooking = requests.find((booking) => booking._id === messageBookingId) || requests[0] || null;

  useEffect(() => {
    if (page !== "Messages" || !activeMessageBooking?._id) {
      setMessages([]);
      setMessagesLoading(false);
      setMessagesError("");
      return undefined;
    }

    let active = true;
    setMessagesLoading(true);
    setMessagesError("");
    messageApi.getBookingMessages(activeMessageBooking._id)
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
  }, [page, activeMessageBooking?._id]);

  useEffect(() => {
    if (page !== "My Profile") return undefined;
    let active = true;
    setProfileLoading(true);
    setProfileError("");
    providerProfileApi.getMine()
      .then(({ profile }) => {
        if (!active) return;
        setProviderProfile(profile);
        setProfileForm(profileFormFrom(profile));
      })
      .catch((error) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 404) {
          setProviderProfile(null);
          setProfileForm({
            ...emptyProviderProfile,
            businessName: user?.username || "",
            businessCategory: location.state?.providerCategory || "",
          });
        } else {
          setProfileError(error.message);
        }
      })
      .finally(() => {
        if (active) setProfileLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, user?.username, location.state?.providerCategory]);

  async function saveProviderProfile(event) {
    event.preventDefault();
    if (!profileForm.businessName.trim() || !profileForm.businessCategory.trim()) {
      setProfileError("Business name and category are required.");
      return;
    }

    setProfileSaving(true);
    setProfileError("");
    const payload = profileFormFrom(profileForm);
    for (const field of providerProfileFields) payload[field] = payload[field].trim();

    try {
      const response = providerProfile
        ? await providerProfileApi.update(payload)
        : await providerProfileApi.create(payload);
      setProviderProfile(response.profile);
      setProfileForm(profileFormFrom(response.profile));
      setEditingProfile(false);
    } catch (error) {
      setProfileError(error.message);
    } finally {
      setProfileSaving(false);
    }
  }

  async function createService(event) {
    event.preventDefault();
    if (!serviceForm.title.trim() || !serviceForm.category.trim() || serviceForm.price === "") {
      setServiceError("Service title, category, and price are required.");
      setServiceSuccess("");
      return;
    }
    if (!Number.isFinite(Number(serviceForm.price)) || Number(serviceForm.price) < 0) {
      setServiceError("Please enter a valid non-negative price.");
      setServiceSuccess("");
      return;
    }

    setServiceSaving(true);
    setServiceError("");
    setServiceSuccess("");
    const payload = {
      ...serviceForm,
      title: serviceForm.title.trim(),
      category: serviceForm.category.trim(),
      description: serviceForm.description.trim(),
      price: Number(serviceForm.price),
      priceUnit: serviceForm.priceUnit.trim() || "Starting Price",
      image: serviceForm.image.trim(),
    };

    try {
      if (editingService) {
        await serviceApi.update(editingService._id, payload);
      } else {
        const { service } = await serviceApi.create(payload);
        setProviderServices((current) => [service, ...current]);
      }
      setServiceForm({
        title: "",
        category: "",
        description: "",
        price: "",
        priceUnit: "Starting Price",
        image: "",
        status: "Draft",
      });
      setShowServiceForm(false);
      setEditingService(null);
      setServiceSuccess(editingService ? "Service updated successfully." : "Service created successfully.");
      try {
        const { services: refreshedServices } = await serviceApi.getMyServices();
        setProviderServices(refreshedServices);
      } catch (refreshError) {
        const operation = editingService ? "updated" : "created";
        setServiceError(`Service was ${operation}, but the list could not be refreshed: ${refreshError.message}`);
      }
    } catch (error) {
      setServiceError(error.message);
    } finally {
      setServiceSaving(false);
    }
  }

  function startEditingService(service) {
    setEditingService(service);
    setServiceForm({
      title: service.title,
      category: service.category,
      description: service.description || "",
      price: String(service.price),
      priceUnit: service.priceUnit || "Starting Price",
      image: service.image || "",
      status: service.status || "Draft",
    });
    setServiceError("");
    setServiceSuccess("");
    setShowServiceForm(true);
  }

  function cancelServiceForm() {
    setShowServiceForm(false);
    setEditingService(null);
    setServiceForm({
      title: "",
      category: "",
      description: "",
      price: "",
      priceUnit: "Starting Price",
      image: "",
      status: "Draft",
    });
  }

  async function deleteService(service) {
    if (!window.confirm(`Delete "${service.title}"? This cannot be undone.`)) return;

    setServiceError("");
    setServiceSuccess("");
    setBusyServiceId(service._id);
    try {
      await serviceApi.remove(service._id);
      if (editingService?._id === service._id) cancelServiceForm();
      setServiceSuccess("Service deleted successfully.");
      try {
        const { services: refreshedServices } = await serviceApi.getMyServices();
        setProviderServices(refreshedServices);
      } catch (refreshError) {
        setServiceError(`Service was deleted, but the list could not be refreshed: ${refreshError.message}`);
      }
    } catch (error) {
      setServiceError(error.message);
    } finally {
      setBusyServiceId("");
    }
  }

  const pendingCount = requests.filter((booking) => booking.status === "Pending").length;
  const breakdown = [
    { name: "Accepted", value: requests.filter((booking) => booking.status === "Accepted").length, color: "#3b0a52" },
    { name: "Pending", value: pendingCount, color: "#eab308" },
    { name: "Rejected", value: requests.filter((booking) => booking.status === "Rejected").length, color: "#7b2fa0" },
  ];
  const upcomingCount = requests.filter((booking) => (
    booking.status === "Accepted" && new Date(booking.eventDate) >= new Date()
  )).length;

  async function answer(id, status) {
    setBookingActionError("");
    setBookingActionSuccess("");
    setBusyBookingId(id);
    try {
      const nextStatus = status === "accepted" ? "Accepted" : "Rejected";
      const { booking } = await bookingApi.updateStatus(id, nextStatus);
      setRequests((current) => current.map((item) => item._id === booking._id ? booking : item));
      setBookingActionSuccess(`Booking ${nextStatus.toLowerCase()} successfully.`);
    } catch (error) {
      setBookingActionError(error.message);
    } finally {
      setBusyBookingId("");
    }
  }
  function respond(id) {
    setReviews(reviews.map((r) => (r.id === id ? { ...r, replied: true } : r)));
  }

  // Table: filter, then split into pages
  const bookingEvents = requests.map((booking) => ({
    id: booking._id,
    name: booking.service?.title || "Service no longer available",
    type: booking.service?.category || "Service",
    client: booking.customer?.username || "Customer",
    date: new Date(booking.eventDate).toLocaleString(),
    place: booking.location,
    amount: booking.service?.price || 0,
    status: booking.status === "Accepted" ? "Confirmed" : booking.status,
  }));
  const bookingFeed = requests.slice(0, 4).map((booking) => ({
    text: `Booking request ${booking.status.toLowerCase()} from ${booking.customer?.username || "Customer"}`,
    time: new Date(booking.createdAt).toLocaleString(),
  }));
  const shown = bookingEvents.filter((event) => filter === "All" || event.status === filter);
  const pages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
  const rows = shown.slice((tablePage - 1) * PAGE_SIZE, tablePage * PAGE_SIZE);

  // Donut
  const total = breakdown.reduce((s, b) => s + b.value, 0);
  const R = 40, C = 2 * Math.PI * R;
  let offset = 0;

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  async function sendMessage(event) {
    event.preventDefault();
    const text = messageDraft.trim();
    if (!text || !activeMessageBooking?._id || messageSending) return;

    setMessageSending(true);
    setMessagesError("");
    try {
      await messageApi.sendBookingMessage(activeMessageBooking._id, text);
      const { messages: currentMessages } = await messageApi.getBookingMessages(activeMessageBooking._id);
      if (!Array.isArray(currentMessages)) {
        throw new Error("The messages response was invalid.");
      }
      setMessages(currentMessages);
      setMessageDraft("");
    } catch (error) {
      setMessagesError(error.message);
    } finally {
      setMessageSending(false);
    }
  }

  function renderPageContent() {
    const pageDescriptions = {
      "My Services": "Manage the services and packages visible to event clients.",
      "Booking Requests": "Review incoming requests and respond to clients.",
      "Availability Calendar": "Review upcoming events and manage your schedule.",
      Messages: "Keep client conversations and event details in one place.",
      "Reviews & Ratings": "Review client feedback and respond to your reviews.",
      "Subscription & Membership": "Review your provider membership and plan benefits.",
      Notifications: "Stay up to date with booking, payment, and review activity.",
      "My Profile": "Review the public profile and account details clients see.",
      "Help & Support": "Get assistance with your provider account and events.",
    };

    return (
      <>
        <div className="ph-page-heading">
          <div>
            <span className="ph-page-eyebrow">PROVIDER PORTAL</span>
            <h1>{page}</h1>
            <p>{pageDescriptions[page]}</p>
          </div>
          {page === "Notifications" && (
            <button className="ph-btn light" onClick={() => setNotificationsRead(true)}>
              Mark all as read
            </button>
          )}
        </div>

        {page === "My Services" && (
          <>
            <div className="ph-page-toolbar">
              <div><strong>{providerServices.length} listed services</strong><small>Services in your provider catalog</small></div>
              <button
                type="button"
                className="ph-btn dark"
                onClick={() => {
                  setServiceError("");
                  setServiceSuccess("");
                  if (showServiceForm) cancelServiceForm();
                  else {
                    setEditingService(null);
                    setShowServiceForm(true);
                  }
                }}
              >
                {showServiceForm ? "Cancel" : "Add New Service"}
              </button>
            </div>
            {showServiceForm && (
              <form className="ph-profile-form ph-card" onSubmit={createService}>
                <label>
                  <span>Service Title</span>
                  <input value={serviceForm.title} onChange={(event) => setServiceForm((current) => ({ ...current, title: event.target.value }))} required />
                </label>
                <label>
                  <span>Category</span>
                  <input value={serviceForm.category} onChange={(event) => setServiceForm((current) => ({ ...current, category: event.target.value }))} required />
                </label>
                <label>
                  <span>Description</span>
                  <input value={serviceForm.description} onChange={(event) => setServiceForm((current) => ({ ...current, description: event.target.value }))} />
                </label>
                <label>
                  <span>Price</span>
                  <input type="number" min="0" step="any" value={serviceForm.price} onChange={(event) => setServiceForm((current) => ({ ...current, price: event.target.value }))} required />
                </label>
                <label>
                  <span>Price Unit</span>
                  <input value={serviceForm.priceUnit} onChange={(event) => setServiceForm((current) => ({ ...current, priceUnit: event.target.value }))} placeholder="Per Event, Per Day, Starting Price" />
                </label>
                <label>
                  <span>Image URL</span>
                  <input type="url" value={serviceForm.image} onChange={(event) => setServiceForm((current) => ({ ...current, image: event.target.value }))} />
                </label>
                <label>
                  <span>Status</span>
                  <select value={serviceForm.status} onChange={(event) => setServiceForm((current) => ({ ...current, status: event.target.value }))}>
                    {["Active", "Draft", "Paused"].map((status) => <option key={status}>{status}</option>)}
                  </select>
                </label>
                <div className="ph-profile-form-actions">
                  <button className="ph-btn dark" type="submit" disabled={serviceSaving}>
                    {serviceSaving ? "Saving..." : editingService ? "Update Service" : "Save Service"}
                  </button>
                  <button className="ph-btn light" type="button" onClick={cancelServiceForm}>Cancel</button>
                </div>
              </form>
            )}
            {serviceError && <p className="ph-sub" role="alert">{serviceError}</p>}
            {serviceSuccess && <p className="ph-sub" role="status">{serviceSuccess}</p>}
            {servicesLoading && <p className="ph-sub" role="status">Loading your services...</p>}
            {servicesError && <p className="ph-sub" role="alert">{servicesError}</p>}
            {!servicesLoading && !servicesError && providerServices.length === 0 && (
              <p className="ph-sub">You have not added any services yet.</p>
            )}
            <div className="ph-page-grid">
              {providerServices.map((service) => (
                <article className="ph-card ph-service-card" key={service._id}>
                  <span className="ph-service-icon">✦</span>
                  <span className="ph-page-eyebrow">{service.category}</span>
                  <h3>{service.title}</h3>
                  <div className="ph-service-details"><span>{service.description || "No description provided."}</span><b>{lkr(service.price)} {service.priceUnit || ""}</b></div>
                  <span className={`ph-pill ${service.status === "Active" ? "ok" : "gold"}`}>{service.status}</span>
                  <div className="ph-profile-form-actions">
                    <button className="ph-btn dark small" type="button" disabled={busyServiceId === service._id} onClick={() => startEditingService(service)}>Edit</button>
                    <button className="ph-btn light small" type="button" disabled={busyServiceId === service._id} onClick={() => deleteService(service)}>
                      {busyServiceId === service._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {page === "Booking Requests" && (
          <section className="ph-card">
            <div className="ph-head">
              <div><h3>Incoming booking requests</h3><p className="ph-sub">{pendingCount} requests need a response.</p></div>
              <span className="ph-pill gold">{pendingCount} Pending</span>
            </div>
            {bookingLoading && <p className="ph-sub" role="status">Loading booking requests...</p>}
            {bookingError && <p className="ph-sub" role="alert">{bookingError}</p>}
            {bookingActionError && <p className="ph-sub" role="alert">{bookingActionError}</p>}
            {bookingActionSuccess && <p className="ph-sub" role="status">{bookingActionSuccess}</p>}
            {!bookingLoading && !bookingError && requests.length === 0 && <p className="ph-sub">No booking requests yet.</p>}
            {requests.slice(0, 3).map((request) => (
              <div className="ph-request" key={request._id}>
                <div className="ph-initials">{(request.customer?.username || "C").charAt(0).toUpperCase()}</div>
                <div className="ph-request-body">
                  <div className="ph-row"><strong>{request.customer?.username || "Customer"}</strong><b>{request.service?.price === undefined ? "Price unavailable" : lkr(request.service.price)}</b></div>
                  <small>{request.service?.title || "Service no longer available"} · {new Date(request.eventDate).toLocaleString()} · {request.location}</small>
                  {request.status === "Pending" ? (
                    <div className="ph-buttons">
                      <button className="ph-btn dark small" disabled={busyBookingId === request._id} onClick={() => answer(request._id, "accepted")}>Accept Booking</button>
                      <button className="ph-btn light small" disabled={busyBookingId === request._id} onClick={() => answer(request._id, "rejected")}>Reject</button>
                    </div>
                  ) : (
                    <span className={`ph-pill ${request.status === "Accepted" ? "ok" : "no"}`}>{request.status}</span>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {page === "Availability Calendar" && (
          <div className="ph-grid-2">
            <section className="ph-card">
              <div className="ph-head"><div><h3>November 2026</h3><p className="ph-sub">Your upcoming confirmed and pending events.</p></div><span className="ph-pill purple">Monthly schedule</span></div>
              <div className="ph-calendar-days">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}</div>
              <div className="ph-calendar-dates">
                {Array.from({ length: 30 }, (_, index) => {
                  const day = index + 1;
                  const booking = requests.find((item) => {
                    const date = new Date(item.eventDate);
                    return date.getFullYear() === 2026 && date.getMonth() === 10 && date.getDate() === day;
                  });
                  const dateClass = booking?.status === "Accepted" ? "booked" : booking?.status === "Pending" ? "pending" : "";
                  return <span className={dateClass} key={day}>{day}</span>;
                })}
              </div>
              <p className="ph-calendar-legend"><i /> Booked or reserved dates</p>
            </section>
            <section className="ph-card">
              <h3>Upcoming schedule</h3>
              <p className="ph-sub">Next events on your calendar.</p>
              <ul className="ph-page-list">
                {bookingEvents.slice(0, 4).map((event) => (
                  <li key={event.id}><b>{event.name}</b><small>{event.date} · {event.place}</small><span className={`ph-pill ${event.status === "Confirmed" ? "ok" : "gold"}`}>{event.status}</span></li>
                ))}
                {!bookingEvents.length && <li><b>No bookings yet</b><small>New booking requests will appear here.</small></li>}
              </ul>
            </section>
          </div>
        )}

        {page === "Messages" && (
          <section className="ph-card">
            <div className="ph-head">
              <div><h3>Client conversations</h3><p className="ph-sub">Messages linked to your booking requests.</p></div>
              <select
                className="ph-message-select"
                aria-label="Select booking conversation"
                value={activeMessageBooking?._id || ""}
                onChange={(event) => setMessageBookingId(event.target.value)}
                disabled={!requests.length || messageSending}
              >
                {requests.map((booking) => (
                  <option key={booking._id} value={booking._id}>
                    {(booking.customer?.username || "Customer") + " — " + (booking.service?.title || "Booked service")}
                  </option>
                ))}
              </select>
            </div>
            <div className="ph-message-list">
              {bookingLoading && <p role="status">Loading your booking conversations...</p>}
              {!bookingLoading && bookingError && <p role="alert">{bookingError}</p>}
              {!bookingLoading && !bookingError && !requests.length && <p>No bookings yet. Conversations will appear here when you receive booking requests.</p>}
              {requests.length > 0 && messagesLoading && <p role="status">Loading messages...</p>}
              {messagesError && <p role="alert">{messagesError}</p>}
              {!messagesLoading && !messagesError && activeMessageBooking && !messages.length && <p>No messages in this booking conversation yet.</p>}
              {messages.map((message) => (
                <article className={`ph-message ${message.sender?.role === "provider" ? "sent" : ""}`} key={message._id}>
                  <div className="ph-row"><strong>{message.sender?.username || "User"}</strong><small>{message.createdAt ? new Date(message.createdAt).toLocaleString() : ""}</small></div>
                  <p>{message.message}</p>
                </article>
              ))}
            </div>
            <form className="ph-message-form" onSubmit={sendMessage}>
              <input aria-label="Write a message" value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} placeholder={activeMessageBooking ? `Write a message to ${activeMessageBooking.customer?.username || "the customer"}...` : "Select a booking to message"} disabled={!activeMessageBooking || messagesLoading || messageSending} />
              <button className="ph-btn dark" type="submit" disabled={!activeMessageBooking || messageSending || !messageDraft.trim()}>{messageSending ? "Sending..." : "Send message"}</button>
            </form>
          </section>
        )}

        {page === "Reviews & Ratings" && (
          <section className="ph-card">
            <div className="ph-head"><div><h3>Client reviews</h3><p className="ph-sub">Your average rating is 4.8 out of 5.</p></div><span className="ph-pill gold">★ 4.8 Average</span></div>
            {reviews.map((review) => (
              <article className="ph-review" key={review.id}>
                <div className="ph-row"><strong>{review.who}</strong><span className="ph-stars">{"★".repeat(review.stars)}{"☆".repeat(5 - review.stars)}</span></div>
                <p>{review.text}</p>
                {review.replied ? <small className="ph-ok">Response sent</small> : <button className="ph-link-btn" onClick={() => respond(review.id)}>Respond to review</button>}
              </article>
            ))}
          </section>
        )}

        {page === "Subscription & Membership" && (
          <div className="ph-grid-2">
            <section className="ph-card ph-membership-card">
              <span className="ph-pill gold">CURRENT MEMBERSHIP</span>
              <h2>Event Connect Pro</h2>
              <p>Get discovered by more clients and manage your event business with premium provider tools.</p>
              <strong className="ph-membership-price">LKR 12,500 <small>/ month</small></strong>
              <span className="ph-pill ok">Membership active</span>
            </section>
            <section className="ph-card">
              <h3>Your Pro benefits</h3>
              <ul className="ph-page-list">
                {["Priority placement in provider search", "Unlimited service listings", "Booking and calendar management", "Verified Pro profile badge", "Monthly performance insights"].map((benefit) => <li key={benefit}><b>{benefit}</b><span className="ph-ok">Included</span></li>)}
              </ul>
            </section>
          </div>
        )}

        {page === "Notifications" && (
          <section className="ph-card">
            <div className="ph-head"><div><h3>Recent activity</h3><p className="ph-sub">Booking and account updates.</p></div></div>
            <ul className="ph-page-list">
              {feed.map((item) => <li className={notificationsRead ? "read" : ""} key={item.text}><b>{item.text}</b><small>{item.time}</small>{!notificationsRead && <span className="ph-pill purple">New</span>}</li>)}
            </ul>
          </section>
        )}

        {page === "My Profile" && (
          <div className="ph-grid-2">
            <section className="ph-card">
              <div className="ph-profile-summary"><span className="ph-avatar large">{name.charAt(0).toUpperCase()}</span><div><h3>{name}</h3><p className="ph-sub">Verified Event Connect provider</p></div></div>
              <ul className="ph-page-list">
                <li><b>Account name</b><span>{name}</span></li>
                <li><b>Account email</b><span>{user?.email || "Not provided"}</span></li>
                <li><b>Provider category</b><span>{providerProfile?.businessCategory || "Not set"}</span></li>
              </ul>
            </section>
            <section className="ph-card">
              <h3>Public profile</h3>
              <p className="ph-sub">Provider profile information saved to your account.</p>
              {profileLoading && <p className="ph-sub" role="status">Loading provider profile...</p>}
              {profileError && <p className="ph-sub" role="alert">{profileError}</p>}
              {!profileLoading && providerProfile && !editingProfile && (
                <>
                  <ul className="ph-page-list">
                    <li><b>Business name</b><span>{providerProfile.businessName}</span></li>
                    <li><b>Category</b><span>{providerProfile.businessCategory}</span></li>
                    <li><b>Location</b><span>{providerProfile.location || "Not provided"}</span></li>
                    <li><b>Business email</b><span>{providerProfile.businessEmail || "Not provided"}</span></li>
                    <li><b>Business phone</b><span>{providerProfile.businessPhone || "Not provided"}</span></li>
                  </ul>
                  <button className="ph-btn light" onClick={() => setEditingProfile(true)}>Edit Profile</button>
                </>
              )}
              {!profileLoading && !providerProfile && !editingProfile && (
                <button className="ph-btn dark" onClick={() => setEditingProfile(true)}>Create Provider Profile</button>
              )}
              {editingProfile && (
                <form className="ph-profile-form" onSubmit={saveProviderProfile}>
                  {[
                    ["businessName", "Business name"],
                    ["businessCategory", "Business category"],
                    ["businessDescription", "Business description"],
                    ["businessPhone", "Business phone"],
                    ["businessEmail", "Business email"],
                    ["location", "Location"],
                    ["businessAddress", "Business address"],
                    ["website", "Website"],
                    ["logo", "Logo URL"],
                  ].map(([field, label]) => (
                    <label key={field}>
                      <span>{label}</span>
                      <input
                        value={profileForm[field]}
                        onChange={(event) => setProfileForm((current) => ({
                          ...current,
                          [field]: event.target.value,
                        }))}
                        required={field === "businessName" || field === "businessCategory"}
                        type={field === "businessEmail" ? "email" : "text"}
                      />
                    </label>
                  ))}
                  <div className="ph-profile-form-actions">
                    <button className="ph-btn dark" type="submit" disabled={profileSaving}>
                      {profileSaving ? "Saving..." : providerProfile ? "Save Changes" : "Create Profile"}
                    </button>
                    <button className="ph-btn light" type="button" onClick={() => {
                      setEditingProfile(false);
                      setProfileError("");
                      setProfileForm(providerProfile
                        ? profileFormFrom(providerProfile)
                        : { ...emptyProviderProfile, businessName: user?.username || "" });
                    }}>Cancel</button>
                  </div>
                </form>
              )}
            </section>
          </div>
        )}

        {page === "Help & Support" && (
          <div className="ph-grid-2">
            <section className="ph-card">
              <h3>How can we help?</h3>
              <p className="ph-sub">Find help with common provider tasks.</p>
              <ul className="ph-page-list">
                {["Managing your service listings", "Responding to booking requests", "Updating calendar availability", "Understanding payments and settlements"].map((topic) => <li key={topic}><b>{topic}</b><span className="ph-link">View guide →</span></li>)}
              </ul>
            </section>
            <section className="ph-card ph-support-card">
              <span className="ph-service-icon">✦</span>
              <h3>Atelier Concierge</h3>
              <p>Need help with an event or your provider account? Our support team is ready to assist.</p>
              <button className="ph-btn gold" onClick={() => setPage("Messages")}>Contact support</button>
              <small>Available every day · 9:00 AM–6:00 PM</small>
            </section>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="ph">
      {/* ================= SIDEBAR ================= */}
      <aside className="ph-side">
        <div className="ph-brand">
          <span className="ph-logo">✦</span>
          <div><strong>Event Connect</strong><small>PROVIDER PORTAL</small></div>
        </div>

        <nav className="ph-menu">
          {menu.map((item) => (
            <button
              key={item}
              type="button"
              className={page === item ? "on" : ""}
              aria-current={page === item ? "page" : undefined}
              onClick={() => setPage(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="ph-help">
          <strong>Atelier Concierge</strong>
          <p>Need help growing your bookings?</p>
          <button className="ph-btn gold small" onClick={() => setPage("Help & Support")}>Contact Us</button>
        </div>
        <button className="ph-logout" onClick={logout}>↪ Logout</button>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="ph-main">
        <header className="ph-top">
          <input className="ph-search" placeholder="🔍 Search bookings, clients, services..." />
          <div className="ph-top-right">
            <button className="ph-icon" aria-label="Notifications" onClick={() => setPage("Notifications")}>🔔<i></i></button>
            <div className="ph-profile">
              <span className="ph-avatar">{name.charAt(0).toUpperCase()}</span>
              <div><strong>{name}</strong><small>Verified Provider</small></div>
            </div>
          </div>
        </header>

        <main className="ph-content">
          {location.state?.profileSetupMessage && (
            <p className="ph-sub" role="alert">{location.state.profileSetupMessage}</p>
          )}
          {page === "Overview" ? (
            <>
          {/* ----- Welcome ----- */}
          <section className="ph-welcome">
            <div>
              <h1>Welcome back, {name}!</h1>
              <p><span className="ph-pill white">✔ Verified Pro</span> &nbsp; You have <b>{pendingCount} pending requests</b> waiting for your reply.</p>
            </div>
            <div className="ph-welcome-buttons">
              <button className="ph-btn gold" onClick={() => navigate("/MyServices")}>+ Add New Service</button>
              <button className="ph-btn glass" onClick={() => setPage("Availability Calendar")}>Open Calendar</button>
              <button className="ph-btn glass" onClick={() => setPage("Booking Requests")}>Manage Bookings</button>
            </div>
          </section>

          {/* ----- Stats ----- */}
          <section className="ph-stats">
            {stats.map((s) => (
              <div className="ph-card ph-stat" key={s.label}>
                <span className="ph-icon-box">{s.icon}</span>
                <small>{s.label}</small>
                <strong className={s.small ? "smaller" : ""}>
                  {s.label === "Pending Requests" ? pendingCount : s.label === "Total Bookings" ? requests.length : s.label === "Upcoming Events" ? upcomingCount : s.value}
                </strong>
              </div>
            ))}
          </section>

          {/* ----- Analytics ----- */}
          <div className="ph-grid-2">
            <section className="ph-card">
              <div className="ph-head">
                <div><h3>Revenue Analytics</h3><p className="ph-sub">Payment and transaction data is not available.</p></div>
                <span className="ph-pill purple">Not available</span>
              </div>
              <div className="ph-rev-stats">
                {revenueStats.map((label) => (
                  <div key={label}><small>{label}</small><b>Not available</b></div>
                ))}
              </div>
              <RevenueChart />
            </section>

            <section className="ph-card">
              <h3>Booking Breakdown</h3>
              <p className="ph-sub">Status of all your bookings.</p>
              <svg viewBox="0 0 100 100" className="ph-donut" role="img" aria-label="Booking breakdown">
                <g transform="rotate(-90 50 50)">
                  {breakdown.map((b) => {
                    const len = (b.value / (total || 1)) * C;
                    const circle = <circle key={b.name} cx="50" cy="50" r={R} fill="none" stroke={b.color} strokeWidth="14"
                      strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} />;
                    offset += len;
                    return circle;
                  })}
                </g>
                <text x="50" y="50" textAnchor="middle" fontSize="14" fontWeight="700" fontFamily="Playfair Display, serif">{total}</text>
                <text x="50" y="60" textAnchor="middle" fontSize="5" fill="#777">TOTAL BOOKINGS</text>
              </svg>
              <ul className="ph-legend">
                {breakdown.map((b) => (
                  <li key={b.name}><i style={{ background: b.color }}></i>{b.name}<b>{b.value}</b></li>
                ))}
              </ul>
            </section>
          </div>

          {/* ----- Requests + Reviews + Feed ----- */}
          <div className="ph-grid-2">
            <section className="ph-card">
              <div className="ph-head">
                <div><h3>Recent Booking Requests</h3><p className="ph-sub">Respond quickly to win more bookings.</p></div>
                <span className="ph-pill gold">{pendingCount} Pending</span>
              </div>

              {bookingLoading && <p className="ph-sub" role="status">Loading booking requests...</p>}
              {bookingError && <p className="ph-sub" role="alert">{bookingError}</p>}
              {bookingActionError && <p className="ph-sub" role="alert">{bookingActionError}</p>}
              {bookingActionSuccess && <p className="ph-sub" role="status">{bookingActionSuccess}</p>}
              {!bookingLoading && !bookingError && requests.length === 0 && <p className="ph-sub">No booking requests yet.</p>}
              {requests.map((r) => (
                <div className="ph-request" key={r._id}>
                  <div className="ph-initials">{(r.customer?.username || "C").charAt(0).toUpperCase()}</div>
                  <div className="ph-request-body">
                    <div className="ph-row"><strong>{r.customer?.username || "Customer"}</strong><b>{r.service?.price === undefined ? "Price unavailable" : lkr(r.service.price)}</b></div>
                    <small>{r.service?.title || "Service no longer available"} • {new Date(r.eventDate).toLocaleString()} • {r.location}</small>
                    {r.status === "Pending" ? (
                      <div className="ph-buttons">
                        <button className="ph-btn dark small" disabled={busyBookingId === r._id} onClick={() => answer(r._id, "accepted")}>Accept Booking</button>
                        <button className="ph-btn light small" disabled={busyBookingId === r._id} onClick={() => answer(r._id, "rejected")}>Reject</button>
                      </div>
                    ) : (
                      <span className={`ph-pill ${r.status === "Accepted" ? "ok" : "no"}`}>{r.status}</span>
                    )}
                  </div>
                </div>
              ))}
              <button type="button" className="ph-link center" onClick={() => setPage("Booking Requests")}>View All {pendingCount} Pending Inquiries →</button>
            </section>

            <div className="ph-stack">
              <section className="ph-card">
                <h3>Recent Reviews</h3>
                {reviews.map((r) => (
                  <div className="ph-review" key={r.id}>
                    <div className="ph-row"><strong>{r.who}</strong><span className="ph-stars">{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</span></div>
                    <p>{r.text}</p>
                    {r.replied ? <small className="ph-ok">Response sent ✅</small> : <button className="ph-link-btn" onClick={() => respond(r.id)}>Respond to review</button>}
                  </div>
                ))}
              </section>

              <section className="ph-card">
                <h3>Live Activity Feed</h3>
                <ul className="ph-feed">
                  {bookingFeed.map((f) => (
                    <li key={f.text}><i></i><div><b>{f.text}</b><small>{f.time}</small></div></li>
                  ))}
                  {!bookingFeed.length && <li><i></i><div><b>No booking activity yet</b></div></li>}
                </ul>
              </section>
            </div>
          </div>

          {/* ----- Upcoming confirmed events table ----- */}
          <section className="ph-card">
            <div className="ph-head">
              <div><h3>Upcoming Confirmed Events</h3><p className="ph-sub">Your schedule at a glance.</p></div>
              <button className="ph-btn light small">Export Schedule</button>
            </div>

            <div className="ph-filters">
              {["All", "Confirmed", "Pending"].map((f) => (
                <button key={f} className={filter === f ? "on" : ""} onClick={() => { setFilter(f); setTablePage(1); }}>{f}</button>
              ))}
              <small>({shown.length} events)</small>
            </div>

            <div className="ph-table-wrap">
              <table>
                <thead>
                  <tr><th>BOOKING ID</th><th>EVENT NAME & TYPE</th><th>CLIENT</th><th>DATE & TIME</th><th>LOCATION & VENUE</th><th>PACKAGE</th><th>STATUS</th></tr>
                </thead>
                <tbody>
                  {rows.map((e) => (
                    <tr key={e.id}>
                      <td><b>{e.id}</b></td>
                      <td><b>{e.name}</b><small className="block">{e.type}</small></td>
                      <td>{e.client}</td>
                      <td>{e.date}</td>
                      <td>{e.place}</td>
                      <td>{lkr(e.amount)}</td>
                      <td><span className={`ph-pill ${e.status === "Confirmed" ? "ok" : "gold"}`}>{e.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ph-pager">
              <small>Showing {rows.length} of {shown.length} confirmed events</small>
              <div>
                <button onClick={() => setTablePage(Math.max(1, tablePage - 1))} disabled={tablePage === 1}>Previous</button>
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={tablePage === p ? "on" : ""} onClick={() => setTablePage(p)}>{p}</button>
                ))}
                <button onClick={() => setTablePage(Math.min(pages, tablePage + 1))} disabled={tablePage === pages}>Next</button>
              </div>
            </div>
          </section>
            </>
          ) : renderPageContent()}
        </main>
      </div>
    </div>
  );
}
