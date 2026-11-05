import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { serviceApi } from "../../services/api";
import BrandLogo from "../BrandLogo";
import "./Myservices.css";

const menu = [
  { name: "Overview" },
  { name: "My Services" },
  { name: "Booking Requests" },
  { name: "Availability Calendar" },
  { name: "Earnings & Payments" },
  { name: "Messages" },
  { name: "Reviews & Ratings" },
  { name: "Subscription & Membership" },
  { name: "My Profile" },
];

// ---------- HELPERS ----------
const lkr = (n) => n.toLocaleString("en-US");
const statusCss = {
  Active: "ok",
  Draft: "wait",
  Paused: "wait",
};
const statusLabel = {
  Active: "Published",
  Draft: "Pending Payment",
  Paused: "Pending Payment",
};
const emptyForm = {
  title: "",
  category: "Photography",
  description: "",
  price: "",
  priceUnit: "Starting Price",
  image: "",
};

// ---------- MAIN COMPONENT ----------
export default function MyServices() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState("My Services");
  const [services, setServices] = useState([]);
  const [providerStatus, setProviderStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyServiceId, setBusyServiceId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("Newest");
  const [view, setView] = useState("grid"); // "grid" or "list"
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    let active = true;
    Promise.all([serviceApi.getMyServices(), serviceApi.getProviderStatus()])
      .then(([{ services: currentServices }, currentStatus]) => {
        if (active) {
          setServices(currentServices);
          setProviderStatus(currentStatus);
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // All category names found in the list (for the dropdown)
  const categories = [...new Set(services.map((s) => s.category))];

  // Counts for the four stat cards (calculated from the list)
  const count = (st) => services.filter((s) => s.status === st).length;
  const livePercent = services.length ? ((count("Active") / services.length) * 100).toFixed(1) : "0.0";

  // 1) filter  2) sort
  const shown = services
    .filter((s) => category === "All" || s.category === category)
    .filter((s) =>
  status === "All" ||
  (status === "Pending Payment" &&
    ["Draft", "Paused"].includes(s.status)) ||
  (status === "Active" && s.status === "Active")
)
    .filter((s) => {
      const text = `${s.title} ${s.category} ${s.description || ""}`.toLowerCase();
      return text.includes(search.toLowerCase());
    })
    .sort((a, b) => {
      if (sort === "Price: Low to High") return a.price - b.price;
      if (sort === "Price: High to Low") return b.price - a.price;
      if (sort === "Top Rated") return 0;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  function setServiceStatus(service) {
  setError("");
  setSuccess("");

  navigate("/payment", {
    state: {
      source: "publish-service",
      serviceId: service._id,
      providerId: user?.id,
    },
  });
}

  function startEditing(service) {
    setEditingService(service);
    setForm({
      title: service.title,
      category: service.category,
      description: service.description || "",
      price: String(service.price),
      priceUnit: service.priceUnit || "Starting Price",
      image: service.image || "",
    });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingService(null);
    setForm(emptyForm);
  }

  function resetFilters() {
    setSearch(""); setCategory("All"); setStatus("All"); setSort("Newest");
  }

  async function saveService(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.category.trim() || form.price === "") {
      setError("Service title, category, and price are required.");
      setSuccess("");
      return;
    }
    if (!Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
      setError("Please enter a valid non-negative price.");
      setSuccess("");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    const payload = {
      title: form.title.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      priceUnit: form.priceUnit.trim() || "Starting Price",
      image: form.image.trim(),
      status: undefined,
    };

    try {
      if (editingService) {
        await serviceApi.update(editingService._id, payload);
        setSuccess("Service updated successfully.");
        cancelForm();
        try {
          const [{ services: refreshedServices }, currentStatus] = await Promise.all([
            serviceApi.getMyServices(),
            serviceApi.getProviderStatus(),
          ]);
          setServices(refreshedServices);
          setProviderStatus(currentStatus);
        } catch (refreshError) {
          setError(`Service was updated, but the list could not be refreshed: ${refreshError.message}`);
        }
      } else {
        const { service } = await serviceApi.create(payload);
        setServices((current) => [service, ...current]);
        cancelForm();
        setSuccess("Service created successfully.");
        try {
          const [{ services: refreshedServices }, currentStatus] = await Promise.all([
            serviceApi.getMyServices(),
            serviceApi.getProviderStatus(),
          ]);
          setServices(refreshedServices);
          setProviderStatus(currentStatus);
        } catch (refreshError) {
          setError(`Service was created, but the list could not be refreshed: ${refreshError.message}`);
        }
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteService(id) {
    if (!window.confirm("Delete this service? This cannot be undone.")) return;
    setError("");
    setSuccess("");
    setBusyServiceId(id);
    try {
      await serviceApi.remove(id);
      if (editingService?._id === id) cancelForm();
      setSuccess("Service deleted successfully.");
      try {
        const [{ services: refreshedServices }, currentStatus] = await Promise.all([
          serviceApi.getMyServices(),
          serviceApi.getProviderStatus(),
        ]);
        setServices(refreshedServices);
        setProviderStatus(currentStatus);
      } catch (refreshError) {
        setError(`Service was deleted, but the list could not be refreshed: ${refreshError.message}`);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyServiceId("");
    }
  }

  function exportCatalog() {
    const rows = [["Title", "Category", "Status", "Price (LKR)"]];
    services.forEach((s) => rows.push([s.title, s.category, s.status, s.price]));
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "my-services.csv";
    link.click();
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  const stats = [
    { icon: "📁", label: "TOTAL PORTFOLIO", value: services.length, pills: [`Across ${categories.length} Categories`, "Provider catalog"] },
    { icon: "✔", label: "ACTIVE & BOOKABLE", value: count("Active"), pills: ["Accepting Inquiries", `${livePercent}% Live`] },
    { icon: "✏️", label: "IN PREPARATION", value: count("Draft"), pills: ["Needs Pricing Review", `${count("Draft")} Pending Approval`] },
    { icon: "📦", label: "ARCHIVED / PAUSED", value: count("Paused"), pills: ["Temporarily Paused", "Off-Season"] },
  ];

  return (
    <div className="ms">
      {/* ================= SIDEBAR ================= */}
      <aside className="ms-side">
        <div className="ms-brand">
          <BrandLogo className="ms-logo" />
          <div><strong>Event Connect</strong><small>YOUR EVENT, PERFECTLY PLANNED</small></div>
        </div>

        <nav className="ms-menu">
          {menu.map((item) => (
            <button key={item.name} className={page === item.name ? "on" : ""} onClick={() => setPage(item.name)}>
              {item.name}
              {item.badge && <b className={`ms-badge ${item.badgeCss}`}>{item.badge}</b>}
            </button>
          ))}
          <button onClick={logout}>Logout</button>
        </nav>

        <div className="ms-help">
          <strong>Artisan Concierge</strong>
          <p>Need dedicated coordination assistance with VIP bookings?</p>
          <a href="#">Connect Now →</a>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="ms-main">
        <header className="ms-top">
          <input className="ms-search-top" placeholder="🔍 Search bookings, services, clients..." />
          <div className="ms-top-right">
            <button className="ms-icon" aria-label="Notifications">🔔<i></i></button>
            <button className="ms-icon" aria-label="Messages">💬<i></i></button>
            <div className="ms-profile">
              <span className="ms-avatar">{user?.username?.charAt(0).toUpperCase() || "P"}</span>
              <div><strong>{user?.username || "Provider"}</strong><small>Provider account</small></div>
            </div>
          </div>
        </header>

        <main className="ms-content">
          {/* ----- Title ----- */}
          <small className="ms-crumb">Home › <b>My Services</b></small>
          <div className="ms-title">
            <div>
              <h1>My Services <span className="ms-pill purple">CATALOGUE V2.4</span></h1>
              <p>Create, manage and showcase your event services to high-intent event hosts, luxury galas, and VIP clients across the island.</p>
            </div>
            <div className="ms-title-buttons">
              <button className="ms-btn white" onClick={exportCatalog}>⬇ Export Catalog</button>
              <button
                className="ms-btn dark"
                disabled={!showForm && (!editingService && (!providerStatus || providerStatus.serviceCount >= providerStatus.maxServiceCount))}
                onClick={() => {
                  if (showForm) cancelForm();
                  else {
                    setEditingService(null);
                    setForm(emptyForm);
                    setShowForm(true);
                  }
                }}
              >
                {showForm ? "Cancel" : "+ Add New Service"}
              </button>
            </div>
          </div>
          {providerStatus && (
            <p className="ms-service-quota" role="status">
              Services added: {providerStatus.serviceCount} / {providerStatus.freeServiceLimit}
              {" · "}Remaining free services: {providerStatus.remainingFreeServices}
              {providerStatus.serviceCount >= providerStatus.maxServiceCount && (
                <> · {providerStatus.maxServiceCount === providerStatus.freeServiceLimit
                  ? "You have reached your free service limit (5/5)."
                  : "You have reached the service limit configured for your subscription plan."}</>
              )}
            </p>
          )}

          {/* ----- Quick add form ----- */}
          {showForm && (
            <form className="ms-card ms-form" onSubmit={saveService}>
              <input placeholder="Service title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {["Photography", "Decorations", "Catering", "Cake Icing", "Makeup Artists", "Dance Groups", "Magicians", "Surprise Gifts"].map((c) => <option key={c}>{c}</option>)}
              </select>
              <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <input type="number" min="0" placeholder="Starting price (LKR)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              <input placeholder="Price unit" value={form.priceUnit} onChange={(e) => setForm({ ...form, priceUnit: e.target.value })} />
              <input type="url" placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
              <button className="ms-btn dark" type="submit" disabled={saving}>{saving ? "Saving..." : editingService ? "Update Service" : "Save as Draft"}</button>
              {editingService && <button className="ms-btn light" type="button" onClick={cancelForm}>Cancel</button>}
            </form>
          )}

          {error && <p className="ms-empty" role="alert">{error}</p>}
          {success && <p className="ms-empty" role="status">{success}</p>}

          {/* ----- Stats ----- */}
          <section className="ms-stats">
            {stats.map((s) => (
              <div className="ms-card ms-stat" key={s.label}>
                <div className="ms-stat-top"><small>{s.label}</small><span className="ms-icon-box">{s.icon}</span></div>
                <strong>{s.value}</strong>
                <div className="ms-pills">{s.pills.map((p) => <span key={p} className="ms-pill soft">{p}</span>)}</div>
              </div>
            ))}
          </section>

          {/* ----- Filters ----- */}
          <section className="ms-filters">
            <input placeholder="🔍 Search services by title, category, tag..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="All">All Categories ({categories.length})</option>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Published</option>
              <option value="Pending Payment">Pending Payment</option>
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {["Newest", "Top Rated", "Price: Low to High", "Price: High to Low"].map((option) => (
                <option key={option} value={option} disabled={option === "Top Rated"}>
                  Sort by: {option}{option === "Top Rated" ? " (not available)" : ""}
                </option>
              ))}
            </select>
            <div className="ms-view">
              <button className={view === "grid" ? "on" : ""} onClick={() => setView("grid")} aria-label="Grid view">▦</button>
              <button className={view === "list" ? "on" : ""} onClick={() => setView("list")} aria-label="List view">☰</button>
            </div>
          </section>

          <div className="ms-count-row">
            <small>Showing {shown.length} of {services.length} services • ⚡ Active for {count("Active")} items</small>
            <div><button>⇅ Bulk Reorder</button><button onClick={resetFilters}>↺ Reset Filters</button></div>
          </div>

          {/* ----- Service cards ----- */}
          {loading && <p className="ms-empty" role="status">Loading your services...</p>}
          {!loading && !error && shown.length === 0 && <p className="ms-empty">No services match your filters.</p>}
          <section className={`ms-cards ${view}`}>
            {shown.map((s) => (
              <article className="ms-card ms-service" key={s._id}>
                <div className="ms-service-img" style={s.image ? { backgroundImage: `url(${s.image})` } : {}}>
                  <div className="ms-chips">
                    <span className="ms-chip dark">{s.category.toUpperCase()}</span>
                    <span className={`ms-chip ${statusCss[s.status]}`}>
                       {statusLabel[s.status] || s.status}
                    </span>
                  </div>
                  <div className="ms-img-bottom">
                    <span className="ms-chip dark">{s.rating ? `★ ${s.rating}` : "Not yet rated"}</span>
                    {s.image && <span className="ms-chip glass">Service image</span>}
                  </div>
                </div>

                <div className="ms-service-body">
                  <h4>{s.title}</h4>
                  <p>{s.description || "No description provided."}</p>
                  <div className="ms-price">
                    <small>STARTING AT</small>
                    <div><b>LKR {lkr(s.price)}</b><small>{s.priceUnit || "Starting price"}</small></div>
                  </div>
                  <div className="ms-actions">
                    {s.status !== "Active" && (
                      <button
                        className="ms-btn gold small"
                        onClick={() => setServiceStatus(s)}
                      >
                        ⬆ Publish
                      </button>
                    )}
                        
                    {s.status === "Active" && (
                      <button className="ms-btn light small" disabled={busyServiceId === s._id} onClick={() => setServiceStatus(s._id, "Paused")}>Pause</button>
                    )}
                    <button className="ms-btn dark small" onClick={() => startEditing(s)}>✎ Edit</button>
                    <button className="ms-btn outline small" disabled={busyServiceId === s._id} onClick={() => deleteService(s._id)}>Delete</button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          {/* ----- Bottom: top services + catalog health ----- */}
          <div className="ms-bottom">
            <section className="ms-card">
              <div className="ms-head"><h3>🏆 Top-Performing Services</h3><small>LAST 30 DAYS</small></div>
              <div className="ms-table-wrap">
                <table>
                  <thead><tr><th>SERVICE NAME</th><th>CATEGORY</th><th>BOOKINGS</th><th>CONV. RATE</th><th>REVENUE (LKR)</th><th>TREND</th></tr></thead>
                  <tbody>
                    <tr><td colSpan="6">Booking and revenue analytics are not available from the current backend API.</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="ms-total"><small>Monthly revenue analytics</small><b>Not available</b></div>
            </section>

            <section className="ms-card">
              <div className="ms-head"><h3>Catalog Health</h3></div>
              <div className="ms-health">
                <p className="ms-empty">Views, conversion, response time, and ratings are not provided by the current backend API.</p>
              </div>
              <small className="ms-log-title">AUDIT & UPDATE LOG</small>
              <ul className="ms-log">
                <li><div><b>Audit history unavailable</b><small>The current backend API does not provide catalog analytics or audit events.</small></div></li>
              </ul>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
