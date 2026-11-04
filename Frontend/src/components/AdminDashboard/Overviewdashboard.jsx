import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../services/api";
import "./Overviewdashboard.css";
import AdminSidebar from "./AdminSidebar";

const QUICK = [
  { label: "Manage Users", path: "/AdminDashboard/users" },
  { label: "Manage Providers", path: "/AdminDashboard/providers" },
  { label: "Manage Services", path: "/AdminDashboard/services" },
  { label: "Manage Bookings", path: "/AdminDashboard/bookings" },
];
const LINE_COLORS = ["#6d2bd9", "#0f7a4d"];

const formatCount = (value) =>
  Number.isInteger(value) ? value.toLocaleString() : "Not available";

const formatDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleDateString();
};

const formatDateTime = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleString();
};

const tone = (status) => ({
  Confirmed: "brand",
  Accepted: "brand",
  Pending: "warn",
  Rejected: "danger",
}[status] || "brand");

function Line({ series, labels }) {
  if (!labels.length || !series.length) {
    return <p className="empty">Not available.</p>;
  }
  const w = 480, h = 150, max = Math.max(1, ...series.flatMap((item) => item.data)) * 1.1;
  const step = labels.length > 1 ? w / (labels.length - 1) : 0;
  return (
    <svg viewBox={`0 0 ${w} ${h + 18}`} className="chart" role="img" aria-label="Monthly records from MongoDB">
      {series.map((item, index) => {
        const points = item.data.map((value, pointIndex) =>
          `${pointIndex * step},${h - (value / max) * h}`
        ).join(" ");
        return (
          <polyline
            key={item.label}
            points={points}
            fill="none"
            stroke={LINE_COLORS[index % LINE_COLORS.length]}
            strokeWidth="2.5"
          />
        );
      })}
      {labels.map((m, i) => <text key={m} x={i * step} y={h + 14} fontSize="9" textAnchor="middle" fill="var(--muted)">{m}</text>)}
    </svg>
  );
}

function Donut({ pipeline, loading }) {
  if (loading) return <p className="empty">Loading bookings...</p>;
  const total = pipeline.reduce((sum, item) => sum + item.value, 0);
  if (!total) return <p className="empty">No bookings available.</p>;
  const r = 52, c = 2 * Math.PI * r;
  let off = 0;
  return (
    <svg viewBox="0 0 140 140" className="donut" role="img" aria-label="Booking pipeline status">
      <g transform="rotate(-90 70 70)">
        {pipeline.map((s) => {
          const len = (s.value / total) * c;
          const el = <circle key={s.label} cx="70" cy="70" r={r} fill="none" stroke={s.color} strokeWidth="18" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-off} />;
          off += len;
          return el;
        })}
      </g>
      <text x="70" y="68" textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--ink)">{total.toLocaleString()}</text>
      <text x="70" y="84" textAnchor="middle" fontSize="9" fill="var(--muted)">bookings</text>
    </svg>
  );
}

export default function OverviewDashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [tab, setTab] = useState("All Bookings");
  const [sel, setSel] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    adminApi.getOverview()
      .then((data) => {
        if (
          !data?.users ||
          !data?.bookings ||
          !Array.isArray(data.monthly) ||
          !Array.isArray(data.recentUsers) ||
          !Array.isArray(data.recentBookings)
        ) {
          throw new Error("The server returned an invalid admin overview response.");
        }

        if (active) {
          setOverview(data);
          setSel(data.recentBookings?.[0]?._id || null);
        }
      })
      .catch((requestError) => {
        if (active) {
          setOverview(null);
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const metrics = overview || {};
  const monthly = metrics.monthly || [];
  const recentUsers = metrics.recentUsers || [];
  const recentBookings = metrics.recentBookings || [];
  const bookings = metrics.bookings || {};
  const users = metrics.users || {};
  const rows = recentBookings.filter((booking) => {
    const status = booking.status === "Accepted" ? "Confirmed" : booking.status;
    return tab === "All Bookings" || status === tab;
  });
  const pipeline = [
    { label: "Pending", value: bookings.pending ?? 0, color: "#f2b705" },
    { label: "Confirmed", value: bookings.confirmed ?? 0, color: "#6d2bd9" },
    { label: "Rejected", value: bookings.rejected ?? 0, color: "#d6336c" },
  ];
  const kpis = [
    { label: "Total Users", value: users.total },
    { label: "Customers", value: users.customers },
    { label: "Service Providers", value: users.providers },
    { label: "Administrators", value: users.administrators },
    { label: "Total Bookings", value: bookings.total },
    { label: "Pending Bookings", value: bookings.pending, tone: "warn" },
    { label: "Confirmed Bookings", value: bookings.confirmed },
    { label: "Completed Bookings", value: bookings.completed },
    { label: "Cancelled Bookings", value: bookings.cancelled },
    { label: "Total Services", value: metrics.services?.total },
    { label: "New Users This Month", value: metrics.usersCreatedThisMonth },
  ];

  return (
    <div className="ov">
      <AdminSidebar />

      <main className="ov-main">
        <header className="ov-top">
          <input className="ov-search" placeholder="Search anything…" aria-label="Search" />
          <span className="env">Production · Sri Lanka (GMT+5:30)</span>
          <div className="ov-user"><span className="avatar">SA</span><div><strong>Super Admin</strong><small>Platform Administrator</small></div></div>
        </header>

        <section className="ov-head">
          <div>
            <h1>Welcome back, Admin</h1>
            <p className="lede">Review live marketplace data from the Event Connect database.</p>
          </div>
          <div className="actions">
            <span className="chip">
              {loading ? "Loading database data..." : `Data current as of ${formatDateTime(metrics.generatedAt)}`}
            </span>
            <button
              className="btn btn--ghost"
              onClick={() => setReloadKey((current) => current + 1)}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </section>

        {error && (
          <section className="panel" role="alert">
            <p>{error}</p>
            <button
              className="btn btn--primary"
              onClick={() => setReloadKey((current) => current + 1)}
              disabled={loading}
            >
              Retry
            </button>
          </section>
        )}

        <section className="quick" aria-label="Quick actions">
          {QUICK.map(({ label, path }) => (
            <button key={label} className="qa" onClick={() => navigate(path)}>
              <span className="qa-ico" aria-hidden="true" />{label}
            </button>
          ))}
        </section>

        <section className="kpis">
          {kpis.map((k) => (
            <article key={k.label} className={`kpi ${k.tone ? `kpi--${k.tone}` : ""}`}>
              <p>{k.label}</p>
              <strong>{loading ? "—" : formatCount(k.value)}</strong>
              <small>{k.value === null ? "Not tracked by available database records" : "Current database count"}</small>
            </article>
          ))}
        </section>

        <div className="ov-row ov-row--wide">
          <section className="panel">
            <h2>Monthly Booking Trajectory</h2>
            <Line
              labels={monthly.map((month) => month.label)}
              series={[{ label: "Bookings", data: monthly.map((month) => month.bookings) }]}
            />
          </section>
          <section className="panel">
            <h2>Revenue & Net Commission</h2>
            <p className="empty">Not available: no payment or transaction records exist.</p>
          </section>
        </div>

        <div className="ov-row">
          <section className="panel">
            <h2>Booking Pipeline Status</h2>
            <div className="donut-wrap">
              <Donut pipeline={pipeline} loading={loading} />
              <ul className="legend">
                {pipeline.map((s) => <li key={s.label}><i style={{ background: s.color }} />{s.label}<strong>{loading ? "—" : formatCount(s.value)}</strong></li>)}
              </ul>
            </div>
          </section>
          <section className="panel">
            <h2>User & Provider Registrations</h2>
            <Line
              labels={monthly.map((month) => month.label)}
              series={[
                { label: "Users", data: monthly.map((month) => month.users) },
                { label: "Providers", data: monthly.map((month) => month.providers) },
              ]}
            />
            <small>Users · Providers</small>
          </section>
        </div>

        <div className="ov-split">
          <section className="panel">
            <h2>Recent Bookings Management</h2>
            <div className="tabs" role="tablist">
              {["All Bookings", "Pending", "Confirmed", "Rejected"].map((t) => (
                <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "tab is-on" : "tab"} onClick={() => setTab(t)}>{t}</button>
              ))}
            </div>
            <div className="scroll">
              <table className="table">
                <thead><tr><th scope="col">Booking</th><th scope="col">Customer</th><th scope="col">Provider / Service</th><th scope="col">Event date</th><th scope="col">Amount</th><th scope="col">Status</th></tr></thead>
                <tbody>
                  {rows.map((b) => (
                    <tr key={b._id} className={sel === b._id ? "is-selected" : ""} onClick={() => setSel(b._id)}>
                      <td><strong>#{b._id.slice(-8).toUpperCase()}</strong></td>
                      <td>{b.customer?.username || "Not available"}</td>
                      <td>{b.provider?.username || "Not available"}<small>{b.service?.title || "Not available"}</small></td>
                      <td>{formatDate(b.eventDate)}</td>
                      <td>Not available</td>
                      <td><span className={`status status--${tone(b.status)}`}>{b.status === "Accepted" ? "Confirmed" : b.status}</span></td>
                    </tr>
                  ))}
                  {loading && <tr><td colSpan="6" className="empty">Loading bookings...</td></tr>}
                  {!loading && !error && !rows.length && <tr><td colSpan="6" className="empty">No bookings in this view.</td></tr>}
                  {!loading && error && <tr><td colSpan="6" className="empty">Bookings could not be loaded.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="pager"><span>Showing {loading ? "—" : rows.length} recent of {loading ? "—" : formatCount(bookings.total)} bookings</span><button className="btn btn--ghost btn--sm" onClick={() => navigate("/AdminDashboard/bookings")}>View All Bookings</button></div>
          </section>

          <aside className="ov-right">
            <section className="panel">
              <h2>Revenue & Payment Statistics</h2>
              <ul className="list">
                {["Revenue", "Payments", "Commission", "Escrow"].map((label) => (
                  <li key={label}><span>{label}</span><span>Not available</span></li>
                ))}
              </ul>
              <small>No payment or transaction records are defined in the database.</small>
            </section>
            <section className="panel">
              <h2>Recent User Registrations</h2>
              <ul className="list list--stack">
                {recentUsers.map((user) => (
                  <li key={user._id}>
                    <strong>{user.username || "Not available"}</strong>
                    <small>{user.role || "Not available"} · {formatDateTime(user.createdAt)}</small>
                  </li>
                ))}
                {!loading && !error && recentUsers.length === 0 && <li className="empty">No user registrations found.</li>}
                {loading && <li className="empty">Loading registrations...</li>}
                {error && <li className="empty">Registrations could not be loaded.</li>}
              </ul>
            </section>
            <section className="panel">
              <h2>Recent Platform Activities</h2>
              <p className="empty">Not available: no platform activity records exist.</p>
            </section>
          </aside>
        </div>

        <section className="panel">
          <h2>Provider Verification Queue</h2>
          <p className="empty">Not available: provider verification records are not stored in the database.</p>
        </section>
      </main>
    </div>
  );
}