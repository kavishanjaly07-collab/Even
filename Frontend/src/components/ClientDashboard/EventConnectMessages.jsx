import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { bookingApi, messageApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./EventConnectMessages.css";
import ClientSidebar from "./ClientSidebar";

function Icon({ children, className = "" }) {
  return <span className={`ec-icon ${className}`} aria-hidden="true">{children}</span>;
}

export default function EventConnectMessages() {
  const navigate = useNavigate();
  const { user, clearSession } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState("");
  const [activeBookingId, setActiveBookingId] = useState("");
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [showNewInquiry, setShowNewInquiry] = useState(false);
  const [inquiryBookingId, setInquiryBookingId] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquiryError, setInquiryError] = useState("");
  const [inquirySending, setInquirySending] = useState(false);

  useEffect(() => {
    let active = true;
    bookingApi.getMyBookings()
      .then(({ bookings: currentBookings }) => {
        if (!Array.isArray(currentBookings)) {
          throw new Error("The bookings response was invalid.");
        }
        if (active) {
          setBookings(currentBookings);
          setActiveBookingId((current) => current || currentBookings[0]?._id || "");
          setInquiryBookingId((current) => current || currentBookings[0]?._id || "");
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

  const activeBooking = bookings.find((booking) => booking._id === activeBookingId) || bookings[0] || null;

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

  const filteredConversations = useMemo(() => bookings.filter((booking) => {
    const service = booking.service || {};
    const providerName = service.provider?.username || "Provider";
    const query = search.trim().toLowerCase();
    const matchesSearch = `${providerName} ${service.title || ""} ${service.category || ""} ${booking.location || ""}`.toLowerCase().includes(query);
    const matchesFilter = !vendorFilter || booking.status === "Accepted";
    return matchesSearch && matchesFilter;
  }), [bookings, search, vendorFilter]);

  async function sendMessage(event) {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || !activeBooking?._id || sending) return;

    setSending(true);
    setMessagesError("");
    try {
      await messageApi.sendBookingMessage(activeBooking._id, trimmed);
      const { messages: currentMessages } = await messageApi.getBookingMessages(activeBooking._id);
      if (!Array.isArray(currentMessages)) {
        throw new Error("The messages response was invalid.");
      }
      setMessages(currentMessages);
      setMessage("");
    } catch (error) {
      setMessagesError(error.message);
    } finally {
      setSending(false);
    }
  }

  async function sendInquiry(event) {
    event.preventDefault();
    const trimmed = inquiryMessage.trim();
    if (!inquiryBookingId || !trimmed || inquirySending) return;

    setInquirySending(true);
    setInquiryError("");
    try {
      await messageApi.sendBookingMessage(inquiryBookingId, trimmed);
      const { messages: currentMessages } = await messageApi.getBookingMessages(inquiryBookingId);
      if (!Array.isArray(currentMessages)) {
        throw new Error("The messages response was invalid.");
      }
      setActiveBookingId(inquiryBookingId);
      setMessages(currentMessages);
      setInquiryMessage("");
      setShowNewInquiry(false);
    } catch (error) {
      setInquiryError(error.message);
    } finally {
      setInquirySending(false);
    }
  }

  return (
    <div className="ec-page">
      <div className="ec-messages-app">
        <ClientSidebar
          onHelp={() => navigate("/MyBookings")}
          onLogout={() => {
            clearSession();
            navigate("/login");
          }}
        />

        <main className="ec-messages-main">
          <header className="ec-topbar">
            <label className="ec-global-search">
              <Icon>⌕</Icon>
              <input placeholder="Search services, verified vendors, cakes, catering..." />
              <kbd>⌘ K</kbd>
            </label>
            <div className="ec-top-actions">
              <button className="ec-top-icon" type="button" aria-label="Notifications">♧<i /></button>
              <button className="ec-top-icon ec-bag" type="button" aria-label="Bookings">▣<i /></button>
              <div className="ec-user">
                <div className="ec-user-avatar">{(user?.username || "C").slice(0, 1).toUpperCase()}</div>
                <div className="ec-user-copy"><strong>{user?.username || "Customer"}</strong><span>Customer</span></div>
              </div>
            </div>
          </header>

          <section className="ec-heading">
            <div>
              <div className="ec-eyebrow"><span>✦</span> SECURE ATELIER DISPATCH</div>
              <h1>Messages</h1>
            </div>
            <div className="ec-heading-actions">
              <label className="ec-filter-search">
                <Icon>⌕</Icon>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bookings or providers..." />
              </label>
              <button className="ec-primary-button" type="button" onClick={() => setShowNewInquiry(true)} disabled={!bookings.length}>
                <span>✉</span> New Inquiry
              </button>
            </div>
          </section>

          <section className="ec-messaging">
            <aside className="ec-conversations">
              <div className="ec-conversation-heading">
                <h2>Conversations</h2>
                <span className="ec-active-count">{bookings.length} Bookings</span>
              </div>
              <div className="ec-pills">
                <button className={!vendorFilter ? "is-selected" : ""} type="button" onClick={() => setVendorFilter("")}>All ({bookings.length})</button>
                <button className={vendorFilter ? "is-selected" : ""} type="button" onClick={() => setVendorFilter("active")}>Active Bookings ({bookings.filter((booking) => booking.status === "Accepted").length})</button>
              </div>
              <label className="ec-conversation-search">
                <Icon>⌕</Icon>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations..." />
              </label>
              <div className="ec-conversation-list">
                {bookingsLoading && <div className="ec-empty" role="status">Loading your bookings...</div>}
                {!bookingsLoading && bookingsError && <div className="ec-empty" role="alert">{bookingsError}</div>}
                {!bookingsLoading && !bookingsError && filteredConversations.map((booking, index) => {
                  const service = booking.service || {};
                  const providerName = service.provider?.username || "Provider";
                  const eventDate = booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : "Date not set";
                  const initial = providerName.slice(0, 1).toUpperCase();
                  return (
                  <button
                    type="button"
                    className={`ec-conversation ${activeBooking?._id === booking._id ? "is-active" : ""}`}
                    key={booking._id}
                    onClick={() => setActiveBookingId(booking._id)}
                    disabled={sending}
                  >
                    <span className={`ec-avatar ec-avatar-${(index % 4) + 1}`}>{initial}</span>
                    <span className="ec-conversation-copy">
                      <span className="ec-conversation-top"><strong>{providerName}</strong><time>{eventDate}</time></span>
                      <span className="ec-preview">{service.title || "Booked service"} · {booking.location}</span>
                      <span className="ec-tag">{booking.status || "Booking"}</span>
                    </span>
                  </button>
                ); })}
                {!bookingsLoading && !bookingsError && !filteredConversations.length && <div className="ec-empty">{bookings.length ? "No bookings match your search." : "You have no bookings to message about yet."}</div>}
              </div>
            </aside>

            <section className="ec-chat">
              <header className="ec-chat-header">
                <div className="ec-chat-person">
                  <span className="ec-avatar ec-avatar-1">{(activeBooking?.service?.provider?.username || "P").slice(0, 1).toUpperCase()}</span>
                  <div>
                    <h2>{activeBooking?.service?.provider?.username || "Select a booking"}</h2>
                    <div className="ec-chat-meta">
                      <span className="ec-status-dot" /> {activeBooking?.service?.category || "Booking conversation"}
                      {activeBooking?.service?.title && <span className="ec-lavender-tag">{activeBooking.service.title}</span>}
                    </div>
                    <div className="ec-chat-submeta">{activeBooking?.eventDate ? new Date(activeBooking.eventDate).toLocaleDateString() : "Choose an existing booking"} <span>•</span> {activeBooking?.location || ""}</div>
                  </div>
                </div>
                <div className="ec-chat-tools">
                  {activeBooking && <span className="ec-lavender-tag">{activeBooking.status}</span>}
                </div>
              </header>

              <div className="ec-chat-body">
                {messagesLoading && <div className="ec-empty" role="status">Loading messages...</div>}
                {!messagesLoading && messagesError && <div className="ec-empty" role="alert">{messagesError}</div>}
                {!messagesLoading && !messagesError && !messages.length && activeBooking && <div className="ec-empty">No messages yet. Send the first message about this booking.</div>}
                {messages.map((item) => (
                  <div className={`ec-message-row ${item.sender?.role === "customer" ? "from-me" : "from-vendor"}`} key={item._id}>
                    {item.sender?.role !== "customer" && <span className="ec-mini-avatar">{(item.sender?.username || "P").slice(0, 1).toUpperCase()}</span>}
                    <div className="ec-message-content">
                      <div className="ec-message-meta"><strong>{item.sender?.username || "User"}</strong><span>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</span></div>
                      <div className="ec-message-bubble">{item.message}</div>
                    </div>
                    {item.sender?.role === "customer" && <span className="ec-mini-avatar ec-mini-user">{(item.sender?.username || "C").slice(0, 1).toUpperCase()}</span>}
                  </div>
                ))}
              </div>

              <form className="ec-composer" onSubmit={sendMessage}>
                <div className="ec-composer-tools">
                  <button type="button" aria-label="Add emoji" onClick={() => setMessage((value) => `${value} 😊`)}>☻</button>
                </div>
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={activeBooking ? `Type your message to ${activeBooking.service?.provider?.username || "the provider"}...` : "Select a booking to message"}
                  aria-label="Message"
                  disabled={!activeBooking || messagesLoading || sending}
                />
                <button className="ec-send-button" type="submit" disabled={!activeBooking || sending || !message.trim()}>{sending ? "SENDING..." : "SEND"} <span>➤</span></button>
                <div className="ec-composer-footer"><span>Booking conversation</span><span>Messages are linked to your booking</span></div>
              </form>
            </section>
          </section>
        </main>

        {showNewInquiry && (
          <div className="ec-modal-backdrop" role="presentation" onClick={() => setShowNewInquiry(false)}>
            <form className="ec-inquiry-modal" onSubmit={sendInquiry} onClick={(event) => event.stopPropagation()}>
              <button className="ec-modal-close" type="button" onClick={() => setShowNewInquiry(false)} aria-label="Close">×</button>
              <div className="ec-eyebrow">SECURE ATELIER DISPATCH</div>
              <h2>Message about a booking</h2>
              <p>Choose one of your existing bookings to start the conversation.</p>
              <label>Booking
                <select value={inquiryBookingId} onChange={(event) => setInquiryBookingId(event.target.value)} required disabled={inquirySending}>
                  {bookings.map((booking) => <option key={booking._id} value={booking._id}>{booking.service?.title || "Booked service"} — {booking.service?.provider?.username || "Provider"}</option>)}
                </select>
              </label>
              <label>Message<textarea value={inquiryMessage} onChange={(event) => setInquiryMessage(event.target.value)} required placeholder="Write a message about this booking..." rows="4" /></label>
              {inquiryError && <div className="ec-empty" role="alert">{inquiryError}</div>}
              <button className="ec-primary-button" type="submit" disabled={inquirySending || !bookings.length}>{inquirySending ? "Sending..." : "Send Message"} <span>➤</span></button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
