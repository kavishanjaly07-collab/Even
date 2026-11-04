import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { adminApi } from "../../services/api";
import "./BookingManagement.css";
import AdminSidebar from "./AdminSidebar";

const PAGE_SIZE = 20;
const ALL_STATUSES = "All Statuses";
const NOT_AVAILABLE = "Not available";

const statusTone = {
  Pending: "warn",
  Accepted: "ok",
  Rejected: "danger",
};

function display(value) {
  return typeof value === "string" && value.trim() ? value : NOT_AVAILABLE;
}

function formatEventDate(value) {
  if (!value) return NOT_AVAILABLE;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? NOT_AVAILABLE
    : date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

function initials(name) {
  return display(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "?";
}

export default function BookingManagement() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [supportedStatuses, setSupportedStatuses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, pages: 0 });
  const [selectedId, setSelectedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      setLoading(true);
      setError("");

      adminApi.getBookings({
        page,
        limit: PAGE_SIZE,
        status: statusFilter === ALL_STATUSES ? "" : statusFilter,
        search,
      })
        .then((response) => {
          if (!Array.isArray(response?.bookings) || !response?.pagination || !response?.stats) {
            throw new Error("The server returned an invalid bookings response.");
          }
          if (response.bookings.some((booking) => !booking?._id)) {
            throw new Error("The server returned a booking without an ID.");
          }
          if (!active) return;
          if (page > Math.max(1, response.pagination.pages)) {
            setPage(Math.max(1, response.pagination.pages));
            return;
          }
          setBookings(response.bookings);
          setPagination(response.pagination);
          setStats(response.stats);
          setSupportedStatuses(Array.isArray(response.supportedStatuses) ? response.supportedStatuses : []);
          setSelectedId((current) =>
            response.bookings.some((booking) => String(booking._id) === String(current))
              ? current
              : response.bookings[0]?._id || null
          );
        })
        .catch((requestError) => {
          if (!active) return;
          setBookings([]);
          setPagination({ page, limit: PAGE_SIZE, total: 0, pages: 0 });
          setStats(null);
          setSelectedId(null);
          setError(requestError.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [page, statusFilter, search, reloadKey]);

  const current = useMemo(
    () => bookings.find((booking) => String(booking._id) === String(selectedId)) || null,
    [bookings, selectedId]
  );

  function updateSearch(value) {
    setSearch(value);
    setPage(1);
  }

  function updateStatusFilter(value) {
    setStatusFilter(value);
    setPage(1);
  }

  function exportBookings() {
    const rows = bookings.map((booking) => [
      booking._id,
      booking.customer?.username,
      booking.customer?.email,
      booking.provider?.username,
      booking.provider?.email,
      booking.service?.title,
      booking.service?.category,
      booking.eventDate,
      booking.location,
      booking.status,
    ]);
    const csv = [
      ["Booking ID", "Customer", "Customer Email", "Provider", "Provider Email", "Service", "Category", "Event Date", "Location", "Status"],
      ...rows,
    ].map((row) => row.map((value) => `"${String(value ?? NOT_AVAILABLE).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `event-connect-bookings-page-${page}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="bk">
      <AdminSidebar />
      <main className="bk-main">
        <header className="bk-top">
          <input
            className="bk-search"
            placeholder="Search bookings, providers, customers…"
            aria-label="Search bookings"
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
          />
          <span className="env">MongoDB booking records</span>
          <div className="bk-user">
            <span className="avatar">{initials(user?.username)}</span>
            <div><strong>{display(user?.username)}</strong><small>Platform Administrator</small></div>
          </div>
        </header>

        <section className="bk-head">
          <div>
            <p className="crumb">Booking records · Live database data</p>
            <h1>Booking Management</h1>
            <p className="lede">View booking requests and their stored customer, provider, service, event date, location, and status.</p>
          </div>
          <div className="actions">
            <button className="btn btn--ghost" type="button" onClick={exportBookings} disabled={loading || Boolean(error) || bookings.length === 0}>
              Export Current Page
            </button>
          </div>
        </section>

        <section className="stats">
          <article className="stat"><p>Total Bookings</p><strong>{loading || error ? NOT_AVAILABLE : stats?.total ?? 0}</strong><small>MongoDB booking records</small></article>
          <article className="stat"><p>Pending</p><strong>{loading || error ? NOT_AVAILABLE : stats?.pending ?? 0}</strong><small>Stored Pending status</small></article>
          <article className="stat"><p>Accepted</p><strong>{loading || error ? NOT_AVAILABLE : stats?.accepted ?? 0}</strong><small>Stored Accepted status</small></article>
          <article className="stat stat--danger"><p>Rejected</p><strong>{loading || error ? NOT_AVAILABLE : stats?.rejected ?? 0}</strong><small>Stored Rejected status</small></article>
        </section>

        <div className="filters">
          <input
            className="chip chip--input"
            value={search}
            onChange={(event) => updateSearch(event.target.value)}
            placeholder="Search bookings..."
            aria-label="Filter bookings"
          />
          <select className="chip" value={statusFilter} onChange={(event) => updateStatusFilter(event.target.value)} aria-label="Filter by booking status">
            <option>{ALL_STATUSES}</option>
            {supportedStatuses.map((status) => <option key={status}>{status}</option>)}
          </select>
          <button className="chip" type="button" onClick={() => { updateSearch(""); updateStatusFilter(ALL_STATUSES); }}>
            Reset filters
          </button>
        </div>

        {error && (
          <div className="booking-feedback booking-feedback--error" role="alert">
            <span>Unable to load bookings. Please try again. {error}</span>
            <button className="btn btn--ghost" type="button" onClick={() => setReloadKey((key) => key + 1)}>Retry</button>
          </div>
        )}

        <div className="bk-split">
          <section className="panel">
            <header className="panel-head">
              <h2>Booking Records <small>{loading || error ? NOT_AVAILABLE : `${pagination.total} bookings`}</small></h2>
            </header>
            <div className="scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Booking ID</th>
                    <th scope="col">Customer</th>
                    <th scope="col">Provider &amp; Service</th>
                    <th scope="col">Event Date</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan="5">Loading bookings...</td></tr>}
                  {!loading && !error && bookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className={String(selectedId) === String(booking._id) ? "is-selected" : ""}
                      onClick={() => setSelectedId(booking._id)}
                    >
                      <td><strong>#{booking._id}</strong></td>
                      <td>
                        <div className="who">
                          <span className="avatar avatar--sm">{initials(booking.customer?.username)}</span>
                          {display(booking.customer?.username)}
                        </div>
                      </td>
                      <td>
                        <strong>{display(booking.provider?.username)}</strong>
                        <small>{display(booking.service?.title)}</small>
                      </td>
                      <td>{formatEventDate(booking.eventDate)}</td>
                      <td><span className={`status status--${statusTone[booking.status] || "brand"}`}>{display(booking.status)}</span></td>
                    </tr>
                  ))}
                  {!loading && !error && bookings.length === 0 && (
                    <tr><td colSpan="5">No bookings found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="pager">
              <span>Viewing {start}–{end} of {loading || error ? 0 : pagination.total} bookings</span>
              <div>
                <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={loading || page <= 1}>‹ Previous</button>
                <span className="pager-page">{pagination.pages ? `${page} / ${pagination.pages}` : "0 / 0"}</span>
                <button type="button" onClick={() => setPage((value) => Math.min(pagination.pages, value + 1))} disabled={loading || page >= pagination.pages}>Next ›</button>
              </div>
            </div>
          </section>

          <aside className="panel dossier" aria-label="Booking details">
            {current ? (
              <>
                <div className="d-head">
                  <h2>#{current._id}</h2>
                  <span className={`status status--${statusTone[current.status] || "brand"}`}>{display(current.status)}</span>
                </div>
                <div className="booking-detail">
                  <div className="mini"><small>Customer</small><strong>{display(current.customer?.username)}</strong><span>{display(current.customer?.email)}</span><span>{display(current.customer?.phone)}</span></div>
                  <div className="mini"><small>Provider</small><strong>{display(current.provider?.username)}</strong><span>{display(current.provider?.email)}</span><span>{display(current.provider?.phone)}</span></div>
                </div>
                <dl>
                  <dt>Service</dt><dd>{display(current.service?.title)}</dd>
                  <dt>Category</dt><dd>{display(current.service?.category)}</dd>
                  <dt>Service price</dt><dd>{current.service?.price === undefined ? NOT_AVAILABLE : `${current.service.price} ${current.service.priceUnit || ""}`.trim()}</dd>
                  <dt>Event date &amp; time</dt><dd>{formatEventDate(current.eventDate)}</dd>
                  <dt>Location</dt><dd>{display(current.location)}</dd>
                  <dt>Booking amount</dt><dd>{NOT_AVAILABLE}</dd>
                  <dt>Payment status</dt><dd>{NOT_AVAILABLE}</dd>
                  <dt>Created</dt><dd>{formatEventDate(current.createdAt)}</dd>
                </dl>
                <div className="booking-requirements">
                  <strong>Additional requirements</strong>
                  <p>{display(current.additionalRequirements)}</p>
                </div>
                <p className="hint">Status changes and booking deletion are unavailable in the current admin API. Providers can accept or reject pending requests through the existing provider workflow.</p>
              </>
            ) : (
              <p>{loading ? "Loading bookings..." : error ? "Unable to load bookings. Please try again." : "Select a booking to view its details."}</p>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
