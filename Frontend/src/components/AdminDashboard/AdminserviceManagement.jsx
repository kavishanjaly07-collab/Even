import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import AdminSidebar from "./AdminSidebar";
import "./Adminservicemanagement.css";

const TABS = ["Service Listings", "Categories"];
const EMPTY_FORM = {
  title: "",
  category: "",
  description: "",
  price: "",
  priceUnit: "",
  image: "",
  status: "Draft",
  provider: "",
};

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleDateString();
}

export default function AdminServiceManagement() {
  const { user } = useAuth();
  const [tab, setTab] = useState(TABS[0]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [providerError, setProviderError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setProviderError("");

    Promise.all([
      adminApi.getServices(),
      adminApi.getCategories(),
      adminApi.getServiceCategoryStats(),
      adminApi.getProviders().catch((providerRequestError) => ({ error: providerRequestError })),
    ])
      .then(([serviceResponse, categoryResponse, statsResponse, providerResponse]) => {
        if (!Array.isArray(serviceResponse?.services) ||
            !Array.isArray(categoryResponse?.categories) ||
            !statsResponse?.services) {
          throw new Error("The server returned an invalid service catalog response.");
        }
        if (!active) return;
        setServices(serviceResponse.services);
        setCategories(categoryResponse.categories);
        setStats(statsResponse);
        if (providerResponse.error) {
          setProviders([]);
          setProviderError(providerResponse.error.message);
        } else if (Array.isArray(providerResponse?.providers)) {
          setProviders(providerResponse.providers);
          setProviderError("");
        } else {
          setProviders([]);
          setProviderError("The server returned an invalid providers response.");
        }
        setSelectedId((current) =>
          serviceResponse.services.some((service) => String(service._id) === String(current))
            ? current
            : serviceResponse.services[0]?._id || null
        );
      })
      .catch((requestError) => {
        if (!active) return;
        setServices([]);
        setCategories([]);
        setStats(null);
        setSelectedId(null);
        setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase();
    return services.filter((service) => {
      const provider = service.provider;
      const profile = provider?.profile;
      const searchable = [
        service.title,
        service.category,
        service.description,
        provider?.username,
        provider?.email,
        profile?.businessName,
        profile?.location,
      ].filter(Boolean).join(" ").toLowerCase();
      return searchable.includes(query) &&
        (categoryFilter === "All Categories" || service.category === categoryFilter) &&
        (statusFilter === "All Statuses" || service.status === statusFilter);
    });
  }, [services, search, categoryFilter, statusFilter]);

  const selectedService = services.find(
    (service) => String(service._id) === String(selectedId)
  ) || null;

  function resetFilters() {
    setSearch("");
    setCategoryFilter("All Categories");
    setStatusFilter("All Statuses");
  }

  function openCreateForm() {
    setFormOpen(true);
    setEditingService(null);
    setForm({ ...EMPTY_FORM, provider: providers[0]?._id || "" });
    setActionError("");
    setActionMessage("");
  }

  function openEditForm(service) {
    setFormOpen(true);
    setEditingService(service);
    setForm({
      title: service.title || "",
      category: service.category || "",
      description: service.description || "",
      price: service.price === undefined ? "" : String(service.price),
      priceUnit: service.priceUnit || "",
      image: service.image || "",
      status: service.status || "Draft",
      provider: service.provider?._id || "",
    });
    setActionError("");
    setActionMessage("");
  }

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function saveService(event) {
    event.preventDefault();
    setSaving(true);
    setActionError("");
    setActionMessage("");

    const payload = {
      title: form.title,
      category: form.category,
      description: form.description,
      price: form.price,
      priceUnit: form.priceUnit,
      image: form.image,
      status: form.status,
    };

    try {
      const response = editingService
        ? await adminApi.updateService(editingService._id, payload)
        : await adminApi.createService({ ...payload, provider: form.provider });
      setEditingService(null);
      setFormOpen(false);
      setForm(EMPTY_FORM);
      setActionMessage(response.message || "Service saved.");
      setReloadKey((key) => key + 1);
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteService() {
    if (!selectedService || !window.confirm(`Delete "${selectedService.title}"?`)) return;
    setActionError("");
    setActionMessage("");
    try {
      const response = await adminApi.deleteService(selectedService._id);
      setActionMessage(response.message || "Service deleted.");
      setSelectedId(null);
      setReloadKey((key) => key + 1);
    } catch (requestError) {
      setActionError(requestError.message);
    }
  }

  function exportServices() {
    const rows = filteredServices.map((service) => [
      service._id,
      service.title,
      service.category,
      service.provider?.profile?.businessName || service.provider?.username || "Not available",
      service.price,
      service.priceUnit,
      service.status,
      service.bookingCount,
    ]);
    const csv = [
      ["Service ID", "Title", "Category", "Provider", "Price", "Price Unit", "Status", "Booking Count"],
      ...rows,
    ].map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "event-connect-services.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="ec">
      <AdminSidebar />
      <main className="ec-main">
        <header className="ec-top">
          <input
            className="ec-search"
            placeholder="Search listings, providers, categories…"
            aria-label="Search services and categories"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <span className="env">MongoDB catalog</span>
          <div className="ec-user">
            <span className="avatar">{user?.username?.charAt(0).toUpperCase() || "A"}</span>
            <div><strong>{user?.username || "Administrator"}</strong><small>Platform Administrator</small></div>
          </div>
        </header>

        <section className="ec-head">
          <div>
            <p className="crumb">MongoDB catalog</p>
            <h1>Service &amp; Category Management</h1>
            <p className="lede">Manage services and review category usage from current database records.</p>
          </div>
          <div className="actions">
            <button className="btn btn--ghost" type="button" onClick={exportServices} disabled={loading || Boolean(error)}>
              Export Services
            </button>
            <button className="btn btn--primary" type="button" onClick={openCreateForm} disabled={loading || providers.length === 0}>
              Create Listing
            </button>
          </div>
        </section>

        {actionMessage && <p className="catalog-message catalog-message--success" role="status">{actionMessage}</p>}
        {actionError && <p className="catalog-message catalog-message--error" role="alert">{actionError}</p>}

        <section className="stats">
          <article className="stat">
            <p>Total Service Listings</p>
            <strong>{loading || error ? "Not available" : stats?.services.total ?? services.length}</strong>
            <small>Records in MongoDB</small>
          </article>
          <article className="stat">
            <p>Active Services</p>
            <strong>{loading || error ? "Not available" : stats?.services.active ?? 0}</strong>
            <small>Using the stored service status</small>
          </article>
          <article className="stat">
            <p>Service Categories</p>
            <strong>{loading || error ? "Not available" : stats?.categories.total ?? categories.length}</strong>
            <small>Distinct values on service records</small>
          </article>
          <article className="stat">
            <p>Total Bookings</p>
            <strong>{loading || error ? "Not available" : stats?.bookings.total ?? 0}</strong>
            <small>Stored booking records</small>
          </article>
        </section>

        {providerError && (
          <p className="catalog-message catalog-message--error" role="status">
            Provider list unavailable; creating services is disabled. {providerError}
            <button className="btn btn--ghost" type="button" onClick={() => setReloadKey((key) => key + 1)}>Retry</button>
          </p>
        )}

        {error && (
          <p className="catalog-message catalog-message--error" role="alert">
            Unable to load data. Please try again. {error}
            <button className="btn btn--ghost" type="button" onClick={() => setReloadKey((key) => key + 1)}>Retry</button>
          </p>
        )}

        {formOpen && (
          <section className="catalog-editor panel" aria-labelledby="service-editor-title">
            <div className="catalog-editor-heading">
              <h2 id="service-editor-title">{editingService ? "Edit Service" : "Create Service"}</h2>
              <button className="btn btn--ghost" type="button" onClick={() => { setFormOpen(false); setEditingService(null); setForm(EMPTY_FORM); }}>
                Cancel
              </button>
            </div>
            <form className="catalog-form" onSubmit={saveService}>
              {!editingService && (
                <label>Provider
                  <select name="provider" value={form.provider} onChange={updateForm} required>
                    <option value="">Select a provider</option>
                    {providers.map((provider) => (
                      <option key={provider._id} value={provider._id}>
                        {provider.profile?.businessName || provider.username} ({provider.email})
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label>Service Name<input name="title" value={form.title} onChange={updateForm} required maxLength={120} /></label>
              <label>Category
                <input name="category" value={form.category} onChange={updateForm} list="existing-service-categories" required maxLength={80} />
                <datalist id="existing-service-categories">{categories.map((item) => <option key={item.name} value={item.name} />)}</datalist>
              </label>
              <label>Price<input name="price" type="number" min="0" step="0.01" value={form.price} onChange={updateForm} required /></label>
              <label>Price Unit<input name="priceUnit" value={form.priceUnit} onChange={updateForm} maxLength={60} /></label>
              <label>Status
                <select name="status" value={form.status} onChange={updateForm}>
                  <option>Active</option><option>Draft</option><option>Paused</option>
                </select>
              </label>
              <label className="catalog-form-wide">Description<textarea name="description" value={form.description} onChange={updateForm} maxLength={2000} /></label>
              <label className="catalog-form-wide">Image URL<input name="image" type="url" value={form.image} onChange={updateForm} /></label>
              <button className="btn btn--primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Save Service"}</button>
            </form>
          </section>
        )}

        <div className="ec-split">
          <section className="panel">
            <div className="tabs" role="tablist">
              {TABS.map((item) => (
                <button key={item} role="tab" aria-selected={tab === item} className={tab === item ? "tab is-on" : "tab"} onClick={() => setTab(item)}>
                  {item}
                </button>
              ))}
            </div>

            {tab === "Service Listings" ? (
              <>
                <div className="filters">
                  <select className="chip" aria-label="Filter by category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                    <option>All Categories</option>
                    {categories.map((item) => <option key={item.name}>{item.name}</option>)}
                  </select>
                  <select className="chip" aria-label="Filter by service status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                    <option>All Statuses</option><option>Active</option><option>Draft</option><option>Paused</option>
                  </select>
                  <button className="chip" type="button" onClick={resetFilters}>Reset filters</button>
                </div>
                <div className="catalog-table-wrap">
                  <table className="table">
                    <thead>
                      <tr><th scope="col">Service code &amp; title</th><th scope="col">Category</th><th scope="col">Provider</th><th scope="col">Status</th></tr>
                    </thead>
                    <tbody>
                      {loading && <tr><td colSpan="4">Loading services...</td></tr>}
                      {!loading && !error && filteredServices.map((service) => (
                        <tr key={service._id} className={String(selectedId) === String(service._id) ? "is-selected" : ""} onClick={() => setSelectedId(service._id)}>
                          <td><div className="cell-title"><span className="thumb" aria-hidden="true" /> <div><small>#{service._id}</small><strong>{service.title}</strong></div></div></td>
                          <td><span className="tag">{service.category}</span></td>
                          <td>{service.provider?.profile?.businessName || service.provider?.username || "Not available"}</td>
                          <td><span className="catalog-status">{service.status || "Not available"}</span></td>
                        </tr>
                      ))}
                      {!loading && !error && filteredServices.length === 0 && (
                        <tr><td colSpan="4">{services.length === 0 ? "No services found." : "No services match your search."}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="pager">
                  <span>Showing {loading || error ? 0 : filteredServices.length} of {loading || error ? 0 : services.length} services</span>
                  <button className="btn btn--ghost" type="button" onClick={exportServices} disabled={loading || Boolean(error)}>Export CSV</button>
                </div>
              </>
            ) : (
              <>
                <div className="filters">
                  <span className="chip">{categories.length} categories derived from service records</span>
                </div>
                {loading ? <p>Loading categories...</p> : error ? <p>Unable to load data. Please try again.</p> : categories.length === 0 ? (
                  <p>No categories found.</p>
                ) : (
                  <div className="grid">
                    {categories.filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase())).map((item) => (
                      <article key={item.name} className="cat">
                        <div className="cat-top"><span className="cat-ico" aria-hidden="true" /></div>
                        <h3>{item.name}</h3>
                        <p>Category value currently used by services.</p>
                        <div className="cat-meta"><span>Services</span><strong>{item.serviceCount}</strong></div>
                        <button className="btn btn--ghost" type="button" onClick={() => { setTab(TABS[0]); setCategoryFilter(item.name); }}>
                          View services
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>

          <aside className="panel dossier">
            {selectedService ? (
              <>
                <p className="crumb">Service record</p>
                <h2>{selectedService.title}</h2>
                {selectedService.image ? <img className="hero-img catalog-service-image" src={selectedService.image} alt={selectedService.title} /> : null}
                <p className="price">{selectedService.price} {selectedService.priceUnit || ""}</p>
                <dl>
                  <dt>Provider</dt><dd>{selectedService.provider?.profile?.businessName || selectedService.provider?.username || "Not available"}</dd>
                  <dt>Provider email</dt><dd>{selectedService.provider?.email || "Not available"}</dd>
                  <dt>Category</dt><dd>{selectedService.category || "Not available"}</dd>
                  <dt>Location</dt><dd>{selectedService.provider?.profile?.location || selectedService.provider?.profile?.businessAddress || "Not available"}</dd>
                  <dt>Status</dt><dd>{selectedService.status || "Not available"}</dd>
                  <dt>Bookings</dt><dd>{selectedService.bookingCount ?? "Not available"}</dd>
                  <dt>Created</dt><dd>{formatDate(selectedService.createdAt)}</dd>
                </dl>
                <p className="catalog-description">{selectedService.description || "Not available"}</p>
                <div className="duo">
                  <button className="btn btn--ghost" type="button" onClick={() => openEditForm(selectedService)}>Edit Service</button>
                  <button className="btn btn--amber" type="button" onClick={deleteService}>Delete Service</button>
                </div>
              </>
            ) : (
              <p>{loading ? "Loading services..." : error ? "Unable to load data. Please try again." : "No service selected."}</p>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
